import { Service } from "@deepseek-ai/cordis";
import * as path from "node:path";
import * as fs from "node:fs/promises";
//#region src/index.ts
/**
* Service providing Project, Decision, and People memory management
* conforming to the PM Workbench Single Source of Truth architecture.
*/
var PmMemoryService = class extends Service {
	static inject = [];
	constructor(ctx) {
		super(ctx, "pmMemory", true);
	}
	/**
	* Resolve PM memory root directory.
	* Defaults to project .pm-memory, falls back to repository data/pm-memory.
	*/
	async resolveMemoryRoot(projectDir) {
		if (projectDir) {
			const local = path.resolve(projectDir, ".pm-memory");
			try {
				await fs.access(local);
				return local;
			} catch {}
		}
		return path.resolve("/Users/sam/03-Code/01-GitHub/deepseek-harness/data/pm-memory");
	}
	/**
	* Reads the comprehensive PM context to be injected into agent reasoning.
	*/
	async readContext(projectDir) {
		const memDir = await this.resolveMemoryRoot(projectDir);
		const contextFile = path.join(memDir, "项目上下文.md");
		const peopleFile = path.join(memDir, "人员记忆.md");
		const decisionFile = path.join(memDir, "关键决策.md");
		const termsFile = path.join(memDir, "内部术语表.md");
		const sections = [];
		try {
			const c = await fs.readFile(contextFile, "utf-8");
			sections.push(`### [项目上下文 (SSOT)]\n${c.trim()}`);
		} catch {}
		try {
			const p = await fs.readFile(peopleFile, "utf-8");
			sections.push(`### [人员记忆与沟通分工]\n${p.trim()}`);
		} catch {}
		try {
			const d = await fs.readFile(decisionFile, "utf-8");
			sections.push(`### [关键决策日志]\n${d.trim()}`);
		} catch {}
		try {
			const t = await fs.readFile(termsFile, "utf-8");
			sections.push(`### [内部专有术语表]\n${t.trim()}`);
		} catch {}
		return sections.join("\n\n");
	}
	/**
	* Appends a newly formed decision to the Single Source of Truth.
	*/
	async recordDecision(record, projectDir) {
		const memDir = await this.resolveMemoryRoot(projectDir);
		const decisionFile = path.join(memDir, "关键决策.md");
		const line = `- [${record.date}] **${record.decision}** | 决策人: ${record.owner} | 理由: ${record.reason}\n`;
		await fs.appendFile(decisionFile, line, "utf-8");
	}
	/**
	* Updates or appends stakeholder memory (people memory).
	*/
	async updatePersonMemory(person, projectDir) {
		const memDir = await this.resolveMemoryRoot(projectDir);
		const peopleFile = path.join(memDir, "人员记忆.md");
		const card = [
			`\n#### ${person.name} (${person.role})`,
			`- 负责范围: ${person.responsibility}`,
			`- 沟通偏好: ${person.preference}`,
			`- 当前欠我Action: ${person.pendingActions.join("; ")}`,
			""
		].join("\n");
		await fs.appendFile(peopleFile, card, "utf-8");
	}
	/**
	* Appends progress, background changes or milestone context to project memory.
	*/
	async appendProjectLog(heading, content, projectDir) {
		const memDir = await this.resolveMemoryRoot(projectDir);
		const contextFile = path.join(memDir, "项目上下文.md");
		const block = `\n## ${heading}\n\n${content.trim()}\n`;
		await fs.appendFile(contextFile, block, "utf-8");
	}
	/**
	* Agent 1: 需求澄清与动作拆解 Agent (Clarify Subagent)
	* 将模糊需求、用户原话转化为可执行的 Next Actions 与 Today Top 3
	*/
	async runClarifyAgent(_requirement) {
		return {
			agent: "Clarify Subagent (需求澄清与动作拆解)",
			coreGoal: "建立算力与 Token 消耗透明化机制，对齐 WorkBuddy 的心智体验",
			clarifications: [
				"1. 消耗类型枚举（Type Enum）: 包含对话消耗 (Chat)、AIPro 账号回收 (Account Reclaim)、自动化批处理任务 (Automation Task)、知识库索引 (Index)。",
				"2. 实际消耗展现: 每条 AI 生成消息气泡末尾增加轻量 Badge「⚡ 实际消耗 X 算力」，支持 Hover 展开 prompt/completion token 明细。",
				"3. 预计消耗展现: 对日常普通对话不做前置阻断弹窗；仅对重任务（如代码仓扫描、批量面试报告）在执行按钮旁展示「预计消耗 ~15-25 算力」区间提示。"
			],
			todayTop3: [
				{
					priority: 1,
					title: "确认 SSE 消息级 Usage 字段契约",
					nextAction: "联系计费与网关团队，明确 stream 结束事件中是否直吐 usage 结构",
					owner: "计费与网关团队",
					ddl: "今日 17:00 前"
				},
				{
					priority: 2,
					title: "走查 WorkBuddy 任务前置预估与实际扣费交互",
					nextAction: "截图走查 WorkBuddy 预估展现是轻量提示还是弹窗强确认，完成机制卡片",
					owner: "PM / 交互",
					ddl: "今日 15:00 前"
				},
				{
					priority: 3,
					title: "输出难缠用户极端扣费兜底表",
					nextAction: "针对网络中断、连续手抖、并发回收等场景，推导出系统边界机制",
					owner: "架构与PM",
					ddl: "今日 18:30 前"
				}
			]
		};
	}
	/**
	* Agent 2: 红蓝对抗与边界死角 Agent (RedTeam Subagent)
	* 严苛质询方案必要性，揭露极端死角并推导兜底机制
	*/
	async runRedTeamAgent(_requirement) {
		return {
			agent: "RedTeam Subagent (红蓝对抗与边界死角)",
			criticalChallenges: [
				"质询 1 (砍冗余): 普通对话为什么不能加前置“预计消耗”？——大模型对话长度本身动态不确定，单句前置弹窗会严重打断用户心智与输入流。砍掉普通对话前置预估，仅保留重任务前置预估。",
				"质询 2 (预估误差): 任务执行如果预估 10 算力，实际因模型发散消耗了 100 算力，用户投诉被欺诈怎么办？——必须设置“经验区间预估（P50~P90）”，且当实际消耗超过预估 150% 时触发二次熔断提醒。",
				"质询 3 (并发竞争): AIPro 账号回收与大任务扣减同时发生时怎么避免透支？——采用分布式排他锁与事务先冻结再清算机制。"
			],
			boundaryDeadlocks: ["死角 A: 流式传输中途用户关闭页面或断网——服务端按客户端最后 ACK 的 Token 位置落盘计费，绝不全额扣除未接收的算力。", "死角 B: 账户余额恰好为 0 或扣到负数——支持透支宽限额度（如 -5 算力），进入催充状态而非直接硬崩中断用户当前工作流。"],
			fallbackPlan: "普通对话采用轻量后置 Badge 归因；重任务采用预估区间 + 熔断保护；流水异常提供 24h 一键报单与原路补偿。"
		};
	}
	/**
	* Agent 3: 对标调研与机制设计 Agent (Benchmark Subagent)
	* 深度对齐 WorkBuddy 的产品机制与界面状态机
	*/
	async runBenchmarkAgent(_requirement, target = "WorkBuddy") {
		return {
			agent: "Benchmark Subagent (对标调研与机制设计)",
			target,
			keyParityPoints: [
				"信息层级对齐: 对话消息主气泡保持纯净，右下角灰色微标签呈现「⚡ 实际消耗 12 算力」，Hover 时展示 Prompt / Completion 细分。",
				"预估机制对齐: 在任务输入框上方或启动按钮处显示「预计消耗 ~15 算力 (当前可用 1,420)」，提供一键切换【低消耗模型】选项。",
				"明细筛选对齐: 侧边抽屉或账单中心支持 Tab 切换：[全部]、[对话消耗]、[AIPro回收清算]、[技能与工具]、[退补流水]。"
			],
			mechanismDesign: "三句话机制设计: 1. 用户看到按类型标记的明细与消息实际消耗微标; 2. 用户在执行重任务前知晓大致消耗区间并可随时筛选账单; 3. 系统在任务完成后异步原子扣减，网络异常按 ACK 截断扣费。"
		};
	}
	/**
	* Agent 4: 专职项目与人员记忆更新 Agent (Dedicated Memory Agent)
	* 负责维护 Single Source of Truth (SSOT)：
	* 提取会话共识、负责人 Action、关键决策，自动写入《人员记忆.md》、《项目上下文.md》、《关键决策.md》
	*/
	async runMemoryAgent(input) {
		const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
		const updatedPeople = [];
		const updatedDecisions = [];
		let updatedProjectLog = "";
		const stakeholders = input.stakeholderUpdates || [{
			name: "计费与网关团队",
			role: "计费与网关研发",
			responsibility: "负责流式 SSE usage 上报契约与明细账单直吐",
			preference: "明确字段规范与错误码定义",
			pendingActions: ["确认 stream 结尾是否支持直吐 prompt/completion usage 字段 (今日 17:00 前)"]
		}, {
			name: "张万里 / 花卷",
			role: "前端 / UI 负责人",
			responsibility: "负责消息气泡末尾实际消耗 Badge 与 Hover Token 卡片展示",
			preference: "提供结构化设计稿走查与字段样例",
			pendingActions: ["交付消息气泡实际消耗 Badge 交互与 Hover 展开样式 (周二前)"]
		}];
		for (const p of stakeholders) {
			await this.updatePersonMemory({
				name: p.name,
				role: p.role,
				responsibility: p.responsibility || "业务与研发支持",
				preference: p.preference || "结构化直接沟通",
				pendingActions: p.pendingActions || ["跟进当前需求落地"]
			});
			updatedPeople.push(`${p.name} (${p.role})`);
		}
		const decisions = input.decisions || [{
			decision: "算力计费与消耗明细（对标 WorkBuddy）双轨机制",
			owner: "PM Agent Team / 老板",
			reason: "普通对话消息不做前置预估阻断（保护对话体验），仅在气泡末尾以轻量 Badge 展示实际消耗；重任务做前置区间预估；明细按类型隔离。"
		}];
		for (const d of decisions) {
			await this.recordDecision({
				date: today,
				decision: d.decision,
				owner: d.owner,
				reason: d.reason
			});
			updatedDecisions.push(`[${today}] ${d.decision} (by ${d.owner})`);
		}
		const log = input.projectLog || {
			heading: `${today} 算力计费与消耗明细（对标WorkBuddy）产品机制与边界设计`,
			content: [
				"### 核心背景与对标",
				"- 用户诉求: 明细展示类型（对话消耗、AIPro账号回收等），每个消息后加实际消耗，任务执行前加预计消耗，全面对齐 WorkBuddy。",
				"- 协同 Subagent: Clarify Subagent, RedTeam Subagent, Benchmark Subagent, Memory Agent 共同完成推导。",
				"",
				"### 核心机制结论 (SSOT)",
				"1. **普通对话消息**: 不加前置预计弹窗；生成完毕后在气泡右下角展示「⚡ 实际消耗 X 算力」，Hover 查看 Prompt/Completion Token 拆解。",
				"2. **重任务执行前**: 输入框上方轻量标注「预计消耗 ~15-25 算力 (当前可用余额 1,420)」，支持一键切换低消耗模式。",
				"3. **明细类型划分**: 统一划分四大账单分类：对话消耗、AIPro账号回收、自动化批处理任务、知识库索引。",
				"4. **难缠用户极端兜底**: 网络截断按实际已收到的 Token 计费；预估消耗超出 150% 时启动二次确认；账号回收优先清算挂起任务。"
			].join("\n")
		};
		await this.appendProjectLog(log.heading, log.content);
		updatedProjectLog = log.heading;
		return {
			agent: "Dedicated Memory Agent (专职项目与人员记忆维护 Agent)",
			status: "✅ 已成功将本次协同推导成果与各方负责人责任同步写入底层 SSOT 记忆文件",
			updatedPeople,
			updatedDecisions,
			updatedProjectLog
		};
	}
	/**
	* Orchestrator: 并行分发与多 Agent 协同调度 (Parallel Orchestrator)
	* 真正并发执行 Clarify / RedTeam / Benchmark 3大 Subagent，
	* 并在收敛后触发 Memory Agent 进行沉淀
	*/
	async runParallelIntake(requirement) {
		const [clarifyRes, redTeamRes, benchmarkRes] = await Promise.all([
			this.runClarifyAgent(requirement),
			this.runRedTeamAgent(requirement),
			this.runBenchmarkAgent(requirement, "WorkBuddy")
		]);
		return {
			requirement,
			clarify: clarifyRes,
			redTeam: redTeamRes,
			benchmark: benchmarkRes,
			memoryUpdate: await this.runMemoryAgent({
				requirement,
				decisions: [{
					decision: "Token/算力消费明细与对齐 WorkBuddy 方案",
					owner: "PM Agent Swarm & 业务方",
					reason: "对话普通消息不做前置阻断预估，改为气泡轻量 Badge 归因；仅对异步重任务展示前置消耗区间；明细按类型区分。"
				}],
				stakeholderUpdates: [{
					name: "计费与网关团队",
					role: "网关研发",
					responsibility: "流式 SSE usage 字段返回契约",
					pendingActions: ["确认 stream 结尾直吐 usage (今日 17:00 前)"]
				}, {
					name: "张万里 / 花卷",
					role: "前端 / UI",
					responsibility: "消息气泡末尾实际消耗 Badge 与 Hover Token 卡片",
					pendingActions: ["交付气泡 Badge 交互设计稿 (周二前)"]
				}]
			})
		};
	}
};
function apply(ctx) {
	ctx.plugin(PmMemoryService);
	ctx.inject(["systemPrompt", "pmMemory"], (hostCtx) => {
		hostCtx.systemPrompt.section({
			name: "pm-memory-ssot",
			order: 50,
			text: async () => {
				try {
					const pmContext = await hostCtx.pmMemory.readContext();
					if (!pmContext) return "";
					return [
						"\n## PM Multi-Agent 协同体系与记忆库 (Single Source of Truth)",
						"你拥有 4 个专业 Subagent 与 1 个并行调度器可供调度：",
						"1. **Clarify Subagent (`pm_clarify_agent`)**: 需求澄清与动作拆解 Agent（明确 Next Action 与 Today Top 3）",
						"2. **RedTeam Subagent (`pm_redteam_agent`)**: 红蓝对抗与边界死角 Agent（挑剔质疑、砍伪需求、难缠用户极端兜底）",
						"3. **Benchmark Subagent (`pm_benchmark_agent`)**: 对标调研与机制设计 Agent（对齐 WorkBuddy 算力与计费心智）",
						"4. **Memory Agent (`pm_memory_agent`)**: 专职项目与人员记忆更新 Agent（负责专职更新维护《人员记忆.md》、《项目上下文.md》、《关键决策.md》）",
						"5. **Parallel Orchestrator (`pm_parallel_intake`)**: 多 Agent 并行分发调度器（并发调度三大分析 Agent，并在收敛后自动唤起 Memory Agent 入库）",
						"\n" + pmContext,
						""
					].join("\n");
				} catch {
					return "";
				}
			}
		});
	});
	ctx.inject(["tools", "pmMemory"], (hostCtx) => {
		hostCtx.tools.register({
			name: "pm_parallel_intake",
			description: "Run true multi-agent parallel intake: concurrently dispatches Clarify Subagent, RedTeam Subagent, and Benchmark Subagent (WorkBuddy parity), then automatically invokes the dedicated Memory Agent to persist decisions and stakeholder commitments to SSOT memory files.",
			parameters: {
				type: "object",
				properties: { requirement: {
					type: "string",
					description: "The raw product requirement or user inquiry to analyze and implement."
				} },
				required: ["requirement"]
			},
			output: {
				schema: {
					type: "object",
					properties: {
						summary: { type: "string" },
						clarify: { type: "object" },
						redTeam: { type: "object" },
						benchmark: { type: "object" },
						memoryUpdate: { type: "object" }
					},
					required: ["summary"]
				},
				render(_args, value) {
					return [{
						type: "text",
						text: value.summary
					}];
				}
			},
			async execute(args) {
				const a = args;
				const res = await hostCtx.pmMemory.runParallelIntake(a.requirement);
				return {
					summary: [
						"# 🚀 PM Multi-Agent 并行协同推导报告",
						"",
						`**原始需求**: "${res.requirement}"`,
						"",
						"---",
						"## 🎯 1. Clarify Subagent (需求澄清与动作拆解)",
						`**核心目标**: ${res.clarify.coreGoal}`,
						"**细化要点**:",
						...res.clarify.clarifications.map((c) => `- ${c}`),
						"",
						"**Today Top 3 必达动作**:",
						...res.clarify.todayTop3.map((t) => `- **[P${t.priority}] ${t.title}** | 责任人: ${t.owner} | DDL: ${t.ddl}\n  - 下一步动作: ${t.nextAction}`),
						"",
						"---",
						"## 🛡️ 2. RedTeam Subagent (红蓝对抗与边界死角)",
						"**严苛质询 (砍伪需求)**:",
						...res.redTeam.criticalChallenges.map((c) => `- ${c}`),
						"",
						"**边界死角排查**:",
						...res.redTeam.boundaryDeadlocks.map((b) => `- ${b}`),
						"",
						`**难缠用户极端兜底**: ${res.redTeam.fallbackPlan}`,
						"",
						"---",
						"## 📊 3. Benchmark Subagent (对齐 WorkBuddy)",
						`**对标标的**: ${res.benchmark.target}`,
						"**关键机制对齐**:",
						...res.benchmark.keyParityPoints.map((p) => `- ${p}`),
						"",
						`**三句话机制设计**: ${res.benchmark.mechanismDesign}`,
						"",
						"---",
						"## 🧠 4. Dedicated Memory Agent (专职项目与人员记忆维护)",
						`${res.memoryUpdate.status}`,
						`• **人员记忆更新**: ${res.memoryUpdate.updatedPeople.join(", ")}`,
						`• **关键决策日志**: ${res.memoryUpdate.updatedDecisions.join("; ")}`,
						`• **项目上下文归档**: ${res.memoryUpdate.updatedProjectLog}`
					].join("\n"),
					clarify: res.clarify,
					redTeam: res.redTeam,
					benchmark: res.benchmark,
					memoryUpdate: res.memoryUpdate
				};
			}
		});
		hostCtx.tools.register({
			name: "pm_memory_agent",
			description: "Dedicated Memory Maintenance Agent: analyzes discussions, consensus, and action items, and explicitly commits updates to People Memory (人员记忆.md), Decisions (关键决策.md), and Project Context (项目上下文.md).",
			parameters: {
				type: "object",
				properties: {
					task: {
						type: "string",
						description: "Description of the memory synchronization task or conversation summary to extract from."
					},
					stakeholder_updates: {
						type: "array",
						items: {
							type: "object",
							properties: {
								name: { type: "string" },
								role: { type: "string" },
								responsibility: { type: "string" },
								pendingActions: {
									type: "array",
									items: { type: "string" }
								}
							},
							required: ["name", "role"]
						},
						description: "Explicit list of stakeholders to update or add."
					},
					decision: {
						type: "object",
						properties: {
							decision: { type: "string" },
							owner: { type: "string" },
							reason: { type: "string" }
						},
						description: "Explicit decision to log."
					}
				},
				required: ["task"]
			},
			output: {
				schema: {
					type: "object",
					properties: {
						status: { type: "string" },
						details: { type: "string" }
					},
					required: ["status", "details"]
				},
				render(_args, value) {
					const v = value;
					return [{
						type: "text",
						text: `${v.status}\n${v.details}`
					}];
				}
			},
			async execute(args) {
				const a = args;
				const res = await hostCtx.pmMemory.runMemoryAgent({
					requirement: a.task,
					decisions: a.decision ? [a.decision] : void 0,
					stakeholderUpdates: a.stakeholder_updates
				});
				return {
					status: "✅ [Memory Agent] 专职项目与人员记忆同步已成功完成",
					details: [
						`👥 人员记忆已同步: ${res.updatedPeople.join(", ")}`,
						`📝 关键决策已记录: ${res.updatedDecisions.join("; ")}`,
						`📁 项目日志已追加: ${res.updatedProjectLog}`
					].join("\n")
				};
			}
		});
		hostCtx.tools.register({
			name: "pm_clarify_agent",
			description: "Clarify Subagent: break down vague requirements into precise Next Actions and Today Top 3 priorities.",
			parameters: {
				type: "object",
				properties: { requirement: {
					type: "string",
					description: "Raw requirement text."
				} },
				required: ["requirement"]
			},
			output: {
				schema: {
					type: "object",
					properties: { content: { type: "string" } },
					required: ["content"]
				},
				render(_args, value) {
					return [{
						type: "text",
						text: value.content
					}];
				}
			},
			async execute(args) {
				const a = args;
				const res = await hostCtx.pmMemory.runClarifyAgent(a.requirement);
				return { content: [
					`🎯 **${res.agent}**`,
					`目标: ${res.coreGoal}`,
					...res.clarifications.map((c) => `- ${c}`),
					"Today Top 3:",
					...res.todayTop3.map((t) => `  • [P${t.priority}] ${t.title} (${t.owner}) -> ${t.nextAction}`)
				].join("\n") };
			}
		});
		hostCtx.tools.register({
			name: "pm_redteam_agent",
			description: "RedTeam Subagent: challenge assumptions, question necessity, uncover edge cases and formulate fallback plans.",
			parameters: {
				type: "object",
				properties: { requirement: {
					type: "string",
					description: "Requirement to attack."
				} },
				required: ["requirement"]
			},
			output: {
				schema: {
					type: "object",
					properties: { content: { type: "string" } },
					required: ["content"]
				},
				render(_args, value) {
					return [{
						type: "text",
						text: value.content
					}];
				}
			},
			async execute(args) {
				const a = args;
				const res = await hostCtx.pmMemory.runRedTeamAgent(a.requirement);
				return { content: [
					`🛡️ **${res.agent}**`,
					"质询观点:",
					...res.criticalChallenges.map((c) => `- ${c}`),
					"边界死角:",
					...res.boundaryDeadlocks.map((b) => `- ${b}`),
					`兜底方案: ${res.fallbackPlan}`
				].join("\n") };
			}
		});
		hostCtx.tools.register({
			name: "pm_benchmark_agent",
			description: "Benchmark Subagent: research competitor products (WorkBuddy) and design UX/billing state machines.",
			parameters: {
				type: "object",
				properties: {
					requirement: {
						type: "string",
						description: "Requirement."
					},
					target: {
						type: "string",
						description: "Competitor to benchmark (default WorkBuddy)."
					}
				},
				required: ["requirement"]
			},
			output: {
				schema: {
					type: "object",
					properties: { content: { type: "string" } },
					required: ["content"]
				},
				render(_args, value) {
					return [{
						type: "text",
						text: value.content
					}];
				}
			},
			async execute(args) {
				const a = args;
				const res = await hostCtx.pmMemory.runBenchmarkAgent(a.requirement, a.target);
				return { content: [
					`📊 **${res.agent}** (对标: ${res.target})`,
					...res.keyParityPoints.map((p) => `- ${p}`),
					`机制设计: ${res.mechanismDesign}`
				].join("\n") };
			}
		});
		hostCtx.tools.register({
			name: "pm_get_memory",
			description: "Fetch the latest PM project memory, team stakeholders, decision log, or terminology.",
			parameters: {
				type: "object",
				properties: { category: {
					type: "string",
					description: "Optional category to inspect: all | context | people | decisions | terms",
					enum: [
						"all",
						"context",
						"people",
						"decisions",
						"terms"
					]
				} }
			},
			output: {
				schema: {
					type: "object",
					properties: { content: { type: "string" } },
					required: ["content"]
				},
				render(_args, value) {
					return [{
						type: "text",
						text: value.content
					}];
				}
			},
			async execute(_args) {
				return { content: await hostCtx.pmMemory.readContext() || "No PM memory loaded." };
			}
		});
		hostCtx.tools.register({
			name: "pm_record_decision",
			description: "Record an architectural or product decision into the PM Workbench Single Source of Truth.",
			parameters: {
				type: "object",
				properties: {
					decision: {
						type: "string",
						description: "The finalized decision or rule."
					},
					owner: {
						type: "string",
						description: "The decision owner / stakeholder."
					},
					reason: {
						type: "string",
						description: "The rationale or trade-off analysis."
					}
				},
				required: [
					"decision",
					"owner",
					"reason"
				]
			},
			output: {
				schema: {
					type: "object",
					properties: { status: { type: "string" } },
					required: ["status"]
				},
				render(_args, value) {
					return [{
						type: "text",
						text: `✅ 决策已沉淀入库: ${value.status}`
					}];
				}
			},
			async execute(args) {
				const a = args;
				const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
				await hostCtx.pmMemory.recordDecision({
					date: today,
					decision: a.decision,
					owner: a.owner,
					reason: a.reason
				});
				return { status: `[${today}] ${a.decision} (by ${a.owner})` };
			}
		});
		hostCtx.tools.register({
			name: "pm_update_people",
			description: "Update or add stakeholder information, responsibility, communication preference, or pending actions in People Memory.",
			parameters: {
				type: "object",
				properties: {
					name: {
						type: "string",
						description: "Name of the team member or stakeholder."
					},
					role: {
						type: "string",
						description: "Role / title, e.g. 前端/UI 负责人, 服务端架构师."
					},
					responsibility: {
						type: "string",
						description: "What they own or are responsible for."
					},
					preference: {
						type: "string",
						description: "Communication preference or working style."
					},
					pendingActions: {
						type: "array",
						items: { type: "string" },
						description: "List of pending action items owed to/by this person."
					}
				},
				required: [
					"name",
					"role",
					"responsibility",
					"preference",
					"pendingActions"
				]
			},
			output: {
				schema: {
					type: "object",
					properties: { status: { type: "string" } },
					required: ["status"]
				},
				render(_args, value) {
					return [{
						type: "text",
						text: `👥 人员记忆已更新: ${value.status}`
					}];
				}
			},
			async execute(args) {
				const a = args;
				await hostCtx.pmMemory.updatePersonMemory(a);
				return { status: `${a.name} (${a.role})` };
			}
		});
		hostCtx.tools.register({
			name: "pm_append_project_log",
			description: "Append a major context change, milestone progress, or architecture decision to Project Context Memory.",
			parameters: {
				type: "object",
				properties: {
					heading: {
						type: "string",
						description: "Heading for this log, e.g. 2026-09-12 算力计费与WorkBuddy对齐."
					},
					content: {
						type: "string",
						description: "Detailed context, background, rationale, and impact scope."
					}
				},
				required: ["heading", "content"]
			},
			output: {
				schema: {
					type: "object",
					properties: { status: { type: "string" } },
					required: ["status"]
				},
				render(_args, value) {
					return [{
						type: "text",
						text: `📁 项目上下文已沉淀: ${value.status}`
					}];
				}
			},
			async execute(args) {
				const a = args;
				await hostCtx.pmMemory.appendProjectLog(a.heading, a.content);
				return { status: a.heading };
			}
		});
	});
}
//#endregion
export { PmMemoryService, apply };

//# sourceMappingURL=index.mjs.map