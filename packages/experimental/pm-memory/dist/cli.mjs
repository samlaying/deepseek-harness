#!/usr/bin/env node
import { PmMemoryService } from "./index.mjs";
import { Context } from "@deepseek-ai/cordis";
import * as readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
//#region src/repl-skin.ts
/**
* CLI-Anything REPL Skin — Unified terminal interface for DeepSeek Harness PM Workbench.
* Conforms to the CLI-Anything HARNESS.md UX and styling standard.
*/
const RESET = "\x1B[0m";
const BOLD = "\x1B[1m";
const DIM = "\x1B[2m";
const CYAN = "\x1B[38;5;80m";
const WHITE = "\x1B[97m";
const GRAY = "\x1B[38;5;245m";
const DARK_GRAY = "\x1B[38;5;240m";
const GREEN = "\x1B[38;5;78m";
const YELLOW = "\x1B[38;5;220m";
const RED = "\x1B[38;5;196m";
const BLUE = "\x1B[38;5;75m";
const H_LINE = "─";
const V_LINE = "│";
const TL = "╭";
const TR = "╮";
const BL = "╰";
const BR = "╯";
function stripAnsi(text) {
	return text.replace(/\x1b\[[0-9;]*m/g, "");
}
var ReplSkin = class {
	softwareName;
	version;
	constructor(softwareName = "pm-workbench", version = "0.1.0-rc.5") {
		this.softwareName = softwareName;
		this.version = version;
	}
	/**
	* Prints branded startup banner box.
	*/
	printBanner(memoryPath = "data/pm-memory/") {
		const width = 68;
		const title = `🚀 DeepSeek Harness — PM Multi-Agent Terminal (${this.softwareName})`;
		const sub = `Version: ${this.version}  │  SSOT Memory: ${memoryPath}`;
		const swarm = "Swarm: 🎯 Clarify  🛡️ RedTeam  📊 Benchmark  🧠 Memory Agent";
		console.log(`\n${CYAN}${TL}${H_LINE.repeat(width)}${TR}${RESET}`);
		console.log(`${CYAN}${V_LINE}${RESET}  ${BOLD}${WHITE}${title.padEnd(width - 4)}${RESET}  ${CYAN}${V_LINE}${RESET}`);
		console.log(`${CYAN}${V_LINE}${RESET}  ${GRAY}${sub.padEnd(width - 4)}${RESET}  ${CYAN}${V_LINE}${RESET}`);
		console.log(`${CYAN}${V_LINE}${RESET}  ${GREEN}${swarm.padEnd(width - 4)}${RESET}  ${CYAN}${V_LINE}${RESET}`);
		console.log(`${CYAN}${BL}${H_LINE.repeat(width)}${BR}${RESET}\n`);
	}
	/**
	* Returns styled prompt string.
	*/
	getPrompt(projectName = "Lily") {
		return `${CYAN}${BOLD}dsh-pm(${projectName})${RESET}${WHITE}> ${RESET}`;
	}
	success(msg) {
		console.log(`  ${GREEN}✔${RESET} ${msg}`);
	}
	error(msg) {
		console.log(`  ${RED}✗${RESET} ${msg}`);
	}
	warning(msg) {
		console.log(`  ${YELLOW}⚠${RESET} ${msg}`);
	}
	info(msg) {
		console.log(`  ${BLUE}●${RESET} ${msg}`);
	}
	status(key, value) {
		console.log(`  ${DIM}${key}:${RESET} ${BOLD}${WHITE}${value}${RESET}`);
	}
	divider(title) {
		const w = 68;
		if (!title) console.log(`${DARK_GRAY}${H_LINE.repeat(w)}${RESET}`);
		else {
			const pad = Math.max(2, Math.floor((w - stripAnsi(title).length - 4) / 2));
			console.log(`${DARK_GRAY}${H_LINE.repeat(pad)}[ ${YELLOW}${BOLD}${title}${RESET}${DARK_GRAY} ]${H_LINE.repeat(pad)}${RESET}`);
		}
	}
	printGoodbye() {
		console.log(`\n  ${CYAN}👋 退出 PM 交互终端。所有已确认决策已持久化至 SSOT。${RESET}\n`);
	}
};
//#endregion
//#region src/interactive-loop.ts
/**
* Interactive Multi-Agent Loop with Human-in-the-Loop Confirmation.
* 1. User inputs requirement
* 2. Swarm parallel execution (Clarify, RedTeam, Benchmark)
* 3. Human confirmation on critical trade-offs & boundary deadlocks
* 4. Dedicated Memory Agent commits confirmed decisions to SSOT
*/
var InteractivePmLoop = class {
	skin;
	service;
	constructor(options) {
		this.skin = options.skin || new ReplSkin();
		this.service = options.service;
	}
	/**
	* Runs the full interactive workflow for one user requirement.
	*/
	async processRequirement(rawRequirement, rl) {
		const skin = this.skin;
		skin.info("正在并发调度 Clarify / RedTeam / Benchmark 3大专职 Agent 并行推导中...");
		const [clarify, redTeam, benchmark] = await Promise.all([
			this.service.runClarifyAgent(rawRequirement),
			this.service.runRedTeamAgent(rawRequirement),
			this.service.runBenchmarkAgent(rawRequirement, "WorkBuddy")
		]);
		skin.success(`Clarify Subagent: 需求细化完成，提炼出 ${clarify.todayTop3.length} 个 Today Top 3 必达动作`);
		skin.success(`Benchmark Subagent: 已提取 ${benchmark.target} 竞品机制与消息气泡实际消耗 Badge 规范`);
		skin.warning(`RedTeam Subagent: 质询分析完成，排查出 ${redTeam.criticalChallenges.length} 个关键业务死角`);
		skin.divider("⚠️ RedTeam 提出 2 个关键业务决策，需要 PM 拍板确认");
		console.log(`\n${BOLD}${WHITE}[抉择 1/2] 普通对话消息是否需要弹出前置“预计消耗”？${RESET}`);
		console.log(`  ${GREEN}(A)${RESET} 不加弹窗，仅在输出完成后于气泡右下角展示轻量「⚡ 实际消耗 X 算力」 ${GRAY}(推荐: 减少用户输入打断摩擦)${RESET}`);
		console.log(`  ${YELLOW}(B)${RESET} 强行阻断弹窗，每次发消息前都弹出预计消耗确认窗口`);
		let ans1 = "A";
		try {
			ans1 = (await rl.question(`\n[38;5;80m请输入你的选择 [A/B] (默认 A): [0m`)).trim().toUpperCase() || "A";
		} catch {
			ans1 = "A";
		}
		const decision1 = ans1 === "B" ? "普通对话增加前置阻断弹窗进行预计消耗强确认" : "普通对话不加前置弹窗阻断，生成完毕后在气泡右下角轻量展示实际消耗Badge";
		skin.success(`已记录你的决策: ${decision1}`);
		console.log(`\n${BOLD}${WHITE}[抉择 2/2] 任务执行若由于大模型发散，实际消耗超出预估 150% 时如何处置？${RESET}`);
		console.log(`  ${GREEN}(A)${RESET} 触发二次熔断提醒，经用户确认后才继续扣费执行 ${GRAY}(推荐: 规避客诉争议)${RESET}`);
		console.log(`  ${YELLOW}(B)${RESET} 静默继续扣减，在账单中标记超额异常并自动放行`);
		let ans2 = "A";
		try {
			ans2 = (await rl.question(`\n[38;5;80m请输入你的选择 [A/B] (默认 A): [0m`)).trim().toUpperCase() || "A";
		} catch {
			ans2 = "A";
		}
		const decision2 = ans2 === "B" ? "超出预估150%静默放行并在账单标黄" : "超出预估150%触发二次熔断弹窗，用户确认后继续";
		skin.success(`已记录你的决策: ${decision2}`);
		skin.divider("🧠 专职 Memory Agent 正在将 PM 决策与分工沉淀至 SSOT");
		const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
		const memorySync = await this.service.runMemoryAgent({
			requirement: rawRequirement,
			decisions: [{
				decision: `算力计费双轨制: ${decision1}；超额机制: ${decision2}`,
				owner: "PM (用户拍板确认)",
				reason: "经人机交互确认，平衡用户体验流畅度与计费透明度，杜绝超额争议"
			}],
			stakeholderUpdates: [{
				name: "计费与网关团队",
				role: "网关研发",
				responsibility: "负责流式 SSE usage 字段返回契约",
				pendingActions: ["确认 stream 结尾直吐 usage (今日 17:00 前)"]
			}, {
				name: "张万里 / 花卷",
				role: "前端 / UI 负责人",
				responsibility: "负责消息气泡末尾实际消耗 Badge 交互",
				pendingActions: ["交付消息气泡实际消耗 Badge 交互与 Hover Token 展开卡片 (周二前)"]
			}],
			projectLog: {
				heading: `${today} 算力计费与消耗明细（对标WorkBuddy）产品机制与边界设计`,
				content: [
					"### 核心背景与对标",
					`- 原始诉求: ${rawRequirement}`,
					"- 决策人: PM (终端交互式拍板)",
					"",
					"### 最终确认机制 (SSOT)",
					`1. **对话消息实际消耗**: ${decision1}`,
					`2. **超额兜底策略**: ${decision2}`,
					"3. **明细类型划分**: 对话消耗 (Chat)、AIPro账号回收 (Account Reclaim)、自动化批处理任务 (Automation Task)、知识库索引 (Index)。",
					"4. **流式截断兜底**: 网络中断按客户端最后 ACK 的 Token 偏置量计费，严禁多扣。"
				].join("\n")
			}
		});
		skin.success(`《关键决策.md》: 已追加确认记录 (${memorySync.updatedDecisions.length} 条)`);
		skin.success(`《人员记忆.md》: 已同步网关团队与前端责任 (${memorySync.updatedPeople.join(", ")})`);
		skin.success(`《项目上下文.md》: 已归档完整机制与兜底表 (${memorySync.updatedProjectLog})`);
		return {
			requirement: rawRequirement,
			clarify,
			redTeam,
			benchmark,
			memoryUpdate: memorySync
		};
	}
	/**
	* Launches the persistent REPL loop until exit.
	*/
	async startRepl() {
		const rl = readline.createInterface({
			input: stdin,
			output: stdout
		});
		this.skin.printBanner();
		try {
			while (true) {
				const trimmed = (await rl.question(this.skin.getPrompt("Lily"))).trim();
				if (!trimmed) continue;
				if ([
					"exit",
					"quit",
					":q",
					"q"
				].includes(trimmed.toLowerCase())) {
					this.skin.printGoodbye();
					break;
				}
				if (["help", "?"].includes(trimmed.toLowerCase())) {
					console.log(`\n  ${CYAN}可用指令:${RESET}`);
					console.log("    直接输入任何需求/问题 -> 触发多 Agent 并发推导与人机确认");
					console.log("    memory / ssot        -> 查看当前底层记忆库 (SSOT)");
					console.log("    exit / quit          -> 退出交互终端\n");
					continue;
				}
				if (["memory", "ssot"].includes(trimmed.toLowerCase())) {
					const mem = await this.service.readContext();
					console.log(`\n${mem}\n`);
					continue;
				}
				await this.processRequirement(trimmed, rl);
				console.log(`\n${GREEN}🎉 本次推导与人机确认已闭环并持久化！${RESET}\n`);
			}
		} finally {
			rl.close();
		}
	}
};
//#endregion
//#region src/cli.ts
/**
* CLI-Anything Dual-Mode CLI for DeepSeek Harness PM Workbench.
* - Interactive REPL Mode (default when invoked without subcommand)
* - One-shot Subcommand Mode (supports --json for automation & agent consumption)
*/
async function main() {
	const args = process.argv.slice(2);
	const service = new PmMemoryService(new Context());
	const skin = new ReplSkin("pm-workbench", "0.1.0-rc.5");
	const isJson = args.includes("--json");
	const cleanArgs = args.filter((a) => a !== "--json" && a !== "--");
	if (cleanArgs.length === 0) {
		await new InteractivePmLoop({
			skin,
			service
		}).startRepl();
		return;
	}
	const [command, ...rest] = cleanArgs;
	const payload = rest.join(" ").trim();
	switch (command) {
		case "intake": {
			if (!payload) {
				console.error("Error: intake requires a requirement argument. E.g. dsh-pm intake \"需求内容\"");
				process.exit(1);
			}
			const res = await service.runParallelIntake(payload);
			if (isJson) console.log(JSON.stringify(res, null, 2));
			else {
				skin.printBanner();
				skin.success(`原始需求: ${res.requirement}`);
				skin.status("Clarify 核心目标", res.clarify.coreGoal);
				skin.status("Benchmark 对标", res.benchmark.target);
				skin.warning(`RedTeam 关键质询: ${res.redTeam.criticalChallenges[0]}`);
				skin.success(`Memory Agent 沉淀: ${res.memoryUpdate.status}`);
			}
			break;
		}
		case "memory": {
			const content = await service.readContext();
			if (isJson) console.log(JSON.stringify({ content }, null, 2));
			else console.log(content);
			break;
		}
		case "clarify": {
			if (!payload) {
				console.error("Error: clarify requires a requirement argument.");
				process.exit(1);
			}
			const res = await service.runClarifyAgent(payload);
			if (isJson) console.log(JSON.stringify(res, null, 2));
			else {
				skin.status("Agent", res.agent);
				skin.status("目标", res.coreGoal);
				res.clarifications.forEach((c) => console.log(`  - ${c}`));
			}
			break;
		}
		case "redteam": {
			if (!payload) {
				console.error("Error: redteam requires a requirement argument.");
				process.exit(1);
			}
			const res = await service.runRedTeamAgent(payload);
			if (isJson) console.log(JSON.stringify(res, null, 2));
			else {
				skin.status("Agent", res.agent);
				res.criticalChallenges.forEach((c) => skin.warning(c));
				skin.status("兜底方案", res.fallbackPlan);
			}
			break;
		}
		case "benchmark": {
			if (!payload) {
				console.error("Error: benchmark requires a requirement argument.");
				process.exit(1);
			}
			const res = await service.runBenchmarkAgent(payload);
			if (isJson) console.log(JSON.stringify(res, null, 2));
			else {
				skin.status("Agent", res.agent);
				skin.status("对标标的", res.target);
				res.keyParityPoints.forEach((p) => console.log(`  - ${p}`));
			}
			break;
		}
		case "help":
		case "--help":
		case "-h":
			skin.printBanner();
			console.log("用法:");
			console.log("  dsh-pm                      启动交互式终端 (REPL)");
			console.log("  dsh-pm intake \"<需求>\"      一键并行推导与记忆归档 (--json 纯净数据)");
			console.log("  dsh-pm memory               查看当前底层 SSOT 记忆库 (--json 纯净数据)");
			console.log("  dsh-pm clarify \"<需求>\"     单派 Clarify 需求澄清 Agent");
			console.log("  dsh-pm redteam \"<需求>\"     单派 RedTeam 红蓝对抗 Agent");
			console.log("  dsh-pm benchmark \"<需求>\"   单派 Benchmark 对标 Agent\n");
			break;
		default:
			console.error(`未知子命令: ${command}. 输入 dsh-pm --help 查看可用指令.`);
			process.exit(1);
	}
}
main().catch((err) => {
	console.error("dsh-pm error:", err);
	process.exit(1);
});
//#endregion
export {};

//# sourceMappingURL=cli.mjs.map