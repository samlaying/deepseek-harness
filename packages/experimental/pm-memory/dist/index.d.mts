import { Context, Service } from "@deepseek-ai/cordis";

//#region src/index.d.ts
interface ProjectContext {
  longTermFacts: string[];
  coreGoal: string;
  currentPhase: string;
  scope: {
    inScope: string[];
    outScope: string[];
  };
  blockers: string[];
  risks: string[];
}
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
   * Resolve PM workspace memory root directory.
   */
  resolveMemoryRoot(projectDir: string): string;
  /**
   * Ensure memory structure directory exists.
   */
  ensureMemoryDir(projectDir: string): Promise<string>;
  /**
   * Reads the comprehensive PM context to be injected into agent reasoning.
   */
  readContext(projectDir: string): Promise<string>;
  /**
   * Appends a newly formed decision to the Single Source of Truth.
   */
  recordDecision(projectDir: string, record: DecisionRecord): Promise<void>;
  /**
   * Records or updates a stakeholder memory item.
   */
  recordPerson(projectDir: string, person: PersonMemory): Promise<void>;
}
declare function apply(ctx: Context): void;
//#endregion
export { DecisionRecord, PersonMemory, PmMemoryService, ProjectContext, apply };
//# sourceMappingURL=index.d.mts.map