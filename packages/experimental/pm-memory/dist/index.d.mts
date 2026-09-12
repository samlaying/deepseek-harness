import { Context, Service } from "@deepseek-ai/cordis";

//#region src/index.d.ts
interface DecisionRecord {
  date: string;
  decision: string;
  owner: string;
  reason: string;
}
interface PersonMemory {
  name: string;
  role: string;
  responsibility: string;
  preference: string;
  pendingActions: string[];
}
declare module '@deepseek-ai/cordis' {
  interface Context {
    pmMemory: PmMemoryService;
  }
}
/**
 * Service providing Project, Decision, and People memory management
 * conforming to the PM Workbench Single Source of Truth architecture.
 */
declare class PmMemoryService extends Service {
  static readonly inject: never[];
  constructor(ctx: Context);
  /**
   * Resolve PM memory root directory.
   * Defaults to project .pm-memory, falls back to repository data/pm-memory.
   */
  resolveMemoryRoot(projectDir?: string): Promise<string>;
  /**
   * Reads the comprehensive PM context to be injected into agent reasoning.
   */
  readContext(projectDir?: string): Promise<string>;
  /**
   * Appends a newly formed decision to the Single Source of Truth.
   */
  recordDecision(record: DecisionRecord, projectDir?: string): Promise<void>;
  /**
   * Updates or appends stakeholder memory (people memory).
   */
  updatePersonMemory(person: PersonMemory, projectDir?: string): Promise<void>;
  /**
   * Appends progress, background changes or milestone context to project memory.
   */
  appendProjectLog(heading: string, content: string, projectDir?: string): Promise<void>;
}
declare function apply(ctx: Context): void;
//#endregion
export { DecisionRecord, PersonMemory, PmMemoryService, apply };
//# sourceMappingURL=index.d.mts.map