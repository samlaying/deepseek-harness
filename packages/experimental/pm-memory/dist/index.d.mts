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
interface MultiAgentIntakeResult {
  requirement: string;
  clarify: {
    agent: string;
    coreGoal: string;
    clarifications: string[];
    todayTop3: Array<{
      priority: number;
      title: string;
      nextAction: string;
      owner: string;
      ddl: string;
    }>;
  };
  redTeam: {
    agent: string;
    criticalChallenges: string[];
    boundaryDeadlocks: string[];
    fallbackPlan: string;
  };
  benchmark: {
    agent: string;
    target: string;
    keyParityPoints: string[];
    mechanismDesign: string;
  };
  memoryUpdate: {
    agent: string;
    status: string;
    updatedPeople: string[];
    updatedDecisions: string[];
    updatedProjectLog: string;
  };
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
  /**
   * Agent 1: 需求澄清与动作拆解 Agent (Clarify Subagent)
   * 将模糊需求、用户原话转化为可执行的 Next Actions 与 Today Top 3
   */
  runClarifyAgent(_requirement: string): Promise<{
    agent: string;
    coreGoal: string;
    clarifications: string[];
    todayTop3: {
      priority: number;
      title: string;
      nextAction: string;
      owner: string;
      ddl: string;
    }[];
  }>;
  /**
   * Agent 2: 红蓝对抗与边界死角 Agent (RedTeam Subagent)
   * 严苛质询方案必要性，揭露极端死角并推导兜底机制
   */
  runRedTeamAgent(_requirement: string): Promise<{
    agent: string;
    criticalChallenges: string[];
    boundaryDeadlocks: string[];
    fallbackPlan: string;
  }>;
  /**
   * Agent 3: 对标调研与机制设计 Agent (Benchmark Subagent)
   * 深度对齐 WorkBuddy 的产品机制与界面状态机
   */
  runBenchmarkAgent(_requirement: string, target?: string): Promise<{
    agent: string;
    target: string;
    keyParityPoints: string[];
    mechanismDesign: string;
  }>;
  /**
   * Agent 4: 专职项目与人员记忆更新 Agent (Dedicated Memory Agent)
   * 负责维护 Single Source of Truth (SSOT)：
   * 提取会话共识、负责人 Action、关键决策，自动写入《人员记忆.md》、《项目上下文.md》、《关键决策.md》
   */
  runMemoryAgent(input: {
    requirement?: string;
    decisions?: Array<{
      decision: string;
      owner: string;
      reason: string;
    }>;
    stakeholderUpdates?: Array<{
      name: string;
      role: string;
      responsibility?: string;
      preference?: string;
      pendingActions?: string[];
    }>;
    projectLog?: {
      heading: string;
      content: string;
    };
  }): Promise<{
    agent: string;
    status: string;
    updatedPeople: string[];
    updatedDecisions: string[];
    updatedProjectLog: string;
  }>;
  /**
   * Orchestrator: 并行分发与多 Agent 协同调度 (Parallel Orchestrator)
   * 真正并发执行 Clarify / RedTeam / Benchmark 3大 Subagent，
   * 并在收敛后触发 Memory Agent 进行沉淀
   */
  runParallelIntake(requirement: string): Promise<MultiAgentIntakeResult>;
}
declare function apply(ctx: Context): void;
//#endregion
export { DecisionRecord, MultiAgentIntakeResult, PersonMemory, PmMemoryService, apply };
//# sourceMappingURL=index.d.mts.map