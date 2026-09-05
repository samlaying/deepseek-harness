#!/usr/bin/env python3
"""Codex hook adapter for the project's decision-context workflow.

SessionStart and UserPromptSubmit inject recent decisions. Stop extracts the
latest turn from Codex's transcript and appends decision-shaped turns to
``docs/decisions.md``. Hook failures are deliberately non-blocking.
"""

import hashlib
import json
import os
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path

MAX_CONTEXT_CHARS = 1800
MAX_SUMMARY_CHARS = 800
STATE_FILE = ".codex/decision-hook-state.json"
DECISIONS_FILE = "docs/decisions.md"
SECTIONS = {
    "architecture": "## 🏛 架构决策",
    "stack": "## 🔧 技术选型",
    "requirement": "## 📋 需求变更",
}
KEYWORDS = {
    "architecture": ("架构", "重构", "分层", "解耦", "依赖", "接口设计", "状态管理", "路由", "鉴权"),
    "stack": ("选型", "框架", "数据库", "缓存", "部署", "检索", "向量", "embedding", "orm", "迁移", "采用", "改用", "替换为", "切换到"),
    "requirement": ("需求变更", "版本规划", "里程碑", "路线图", "优先级", "范围", "阶段", "迭代", "新增需求", "用户角色", "权限"),
}
STRONG_SIGNALS = ("决定采用", "最终决定", "方案确定", "敲定", "改为", "改用", "推翻", "放弃", "替换为", "切换到", "重新设计")
CHANGE_WORDS = ("变更", "调整", "修改", "推翻", "替换", "放弃", "改用", "改为", "换成", "回滚", "切换")


def load_input():
    try:
        return json.loads(sys.stdin.read() or "{}")
    except (json.JSONDecodeError, OSError):
        return {}


def project_dir(data):
    return Path(data.get("cwd") or os.environ.get("CODEX_PROJECT_DIR") or os.getcwd()).resolve()


def state_path(root):
    return root / STATE_FILE


def load_state(root):
    try:
        return json.loads(state_path(root).read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}


def save_state(root, state):
    try:
        path = state_path(root)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    except OSError:
        pass


def text_of(message):
    content = message.get("content") if isinstance(message, dict) else None
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        return "\n".join(block.get("text", "") for block in content if isinstance(block, dict) and block.get("type") == "text")
    return ""


def real_user(entry):
    message = entry.get("message", entry) if isinstance(entry, dict) else {}
    return message.get("role") == "user" and bool(text_of(message).strip()) and not text_of(message).lstrip().startswith("<")


def transcript_turn(path):
    if not path:
        return "", ""
    messages = []
    try:
        for line in Path(path).read_text(encoding="utf-8").splitlines():
            try:
                entry = json.loads(line)
            except json.JSONDecodeError:
                continue
            message = entry.get("message", entry) if isinstance(entry, dict) else {}
            role = message.get("role") or entry.get("type")
            text = text_of(message)
            if role and text:
                messages.append((role, text, entry))
    except OSError:
        return "", ""
    start = next((i for i in range(len(messages) - 1, -1, -1) if real_user(messages[i][2])), None)
    if start is None:
        return "", ""
    turn = messages[start:]
    return "\n".join(t for role, t, _ in turn if role == "user"), "\n".join(t for role, t, _ in turn if role == "assistant")


def recent_context(root):
    path = root / DECISIONS_FILE
    if not path.exists():
        return "[项目决策上下文] 暂无已归档决策。"
    blocks = re.findall(r"^### .+?(?=^### |^## |\Z)", path.read_text(encoding="utf-8"), re.MULTILINE | re.DOTALL)
    summary = "\n\n".join(blocks[:5])
    if not summary:
        return "[项目决策上下文] 暂无已归档决策。"
    summary = summary[:MAX_CONTEXT_CHARS].rstrip()
    if len(summary) == MAX_CONTEXT_CHARS:
        summary += "\n…（已截断，完整历史见 docs/decisions.md）"
    return "[项目决策上下文] 以下是最近的决策记录，请避免与既有决策冲突：\n\n" + summary


def classify(user, assistant):
    combined = f"{user}\n{assistant}".lower()
    matched = sorted({word for words in KEYWORDS.values() for word in words if word.lower() in combined})
    strong = any(signal.lower() in combined for signal in STRONG_SIGNALS)
    if not strong and len(matched) < 2:
        return None
    scores = {category: sum(word.lower() in combined for word in words) for category, words in KEYWORDS.items()}
    category = max(scores, key=scores.get)
    change = any(word.lower() in combined for word in CHANGE_WORDS)
    return category, change, matched


def ensure_sections(path):
    if path.exists():
        content = path.read_text(encoding="utf-8")
    else:
        content = "# 决策记录\n"
    missing = [header for header in SECTIONS.values() if header not in content]
    if missing:
        content = content.rstrip() + "\n\n" + "\n\n".join(header + "\n\n<!-- 当前暂无记录。 -->" for header in SECTIONS.values()) + "\n"
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
    return content


def archive(root, data):
    user, assistant = transcript_turn(data.get("transcript_path"))
    user = user or data.get("prompt", "")
    assistant = assistant or data.get("last_assistant_message", "")
    if not user:
        return
    state = load_state(root)
    fingerprint = hashlib.sha1(user.encode("utf-8")).hexdigest()
    if state.get("last_user_fingerprint") == fingerprint:
        return
    decision = classify(user, assistant)
    if decision is None:
        state["last_user_fingerprint"] = fingerprint
        save_state(root, state)
        return
    category, change, matched = decision
    path = root / DECISIONS_FILE
    content = ensure_sections(path)
    header = SECTIONS[category]
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    summary = (assistant.strip() or "（本轮未提取到决策摘要，可手动补充）")[:MAX_SUMMARY_CHARS]
    entry = "\n".join([
        f"### {'🔄 决策变更' if change else '📋 新决策'} — {timestamp}", "",
        "- **分类**：" + category, f"- **会话**：`{data.get('session_id', 'unknown')[:8]}`",
        "- **关键词**：" + ("、".join(matched) if matched else "强信号"), "- **决策摘要**：", "", summary, "", "---", "",
    ])
    marker = "<!-- 当前暂无记录。 -->"
    section_start = content.index(header) + len(header)
    insert_at = content.find(marker, section_start)
    if insert_at != -1 and insert_at < content.find("## ", section_start) if "## " in content[section_start:] else True:
        content = content[:insert_at] + "\n\n" + entry + content[insert_at + len(marker):]
    else:
        content = content[:section_start] + "\n\n" + entry + content[section_start:]
    path.write_text(content.rstrip() + "\n", encoding="utf-8")
    state["last_archived_at"] = datetime.now().isoformat(timespec="seconds")
    save_state(root, state)


def main():
    data = load_input()
    event = sys.argv[1] if len(sys.argv) > 1 else data.get("hook_event_name", "")
    root = project_dir(data)
    if event in ("SessionStart", "UserPromptSubmit"):
        print(json.dumps({"additional_context": recent_context(root)}, ensure_ascii=False))
    elif event == "Stop":
        archive(root, data)
        print("{}")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"[decision-hook] {error}", file=sys.stderr)
        print("{}")
