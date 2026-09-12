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
					return `\n## PM 项目记忆与业务上下文 (Single Source of Truth)\n${pmContext}\n`;
				} catch {
					return "";
				}
			}
		});
	});
	ctx.inject(["tools", "pmMemory"], (hostCtx) => {
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