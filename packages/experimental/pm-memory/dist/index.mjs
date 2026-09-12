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
};
function apply(ctx) {
	ctx.plugin(PmMemoryService);
}
//#endregion
export { PmMemoryService, apply };

//# sourceMappingURL=index.mjs.map