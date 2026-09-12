# Agent Note: Antigravity 会话日志迁移

Status: implemented

## Problem

Antigravity 使用旧消息字段写入的会话无法被当前持久化协调器加载。错误包括通用 message 事件、缺少当前 source 对象的 assistant 消息，以及续接后重复的 turn 编号。

## Decision

持久化协调器对已知的 Antigravity 记录执行受限导入迁移：将用户和 assistant 的通用消息转换为当前消息事件；从旧 model 元数据推导 assistant 的模型来源；将重复 turn 编号改为单调递增。无法明确转换的记录仍然拒绝加载。

## Alternatives considered

**删除受影响日志：**不采用，因为其中仍有可恢复的有效对话内容，删除会造成用户数据丢失。

**接受所有未知事件：**不采用，因为跳过必需事件可能重建出错误的会话。

## Consequences

当前读取器可以重建受影响的 Antigravity 会话，同时保留未知事件安全拒绝规则。真正损坏的已提交记录仍需恢复有效前缀，不会被静默丢弃。
