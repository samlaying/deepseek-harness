import { Context, Service } from '@deepseek-ai/cordis'
import * as path from 'node:path'
import * as fs from 'node:fs/promises'

export interface DecisionRecord {
  date: string
  decision: string
  owner: string
  reason: string
}

export interface PersonMemory {
  name: string
  role: string
  responsibility: string
  preference: string
  pendingActions: string[]
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    pmMemory: PmMemoryService
  }
}

/**
 * Service providing Project, Decision, and People memory management
 * conforming to the PM Workbench Single Source of Truth architecture.
 */
export class PmMemoryService extends Service {
  static readonly inject = []

  constructor(ctx: Context) {
    super(ctx, 'pmMemory', true)
  }

  /**
   * Resolve PM memory root directory.
   * Defaults to project .pm-memory, falls back to repository data/pm-memory.
   */
  async resolveMemoryRoot(projectDir?: string): Promise<string> {
    if (projectDir) {
      const local = path.resolve(projectDir, '.pm-memory')
      try {
        await fs.access(local)
        return local
      } catch {
        // fallback
      }
    }
    // Global repository fallback containing 100-bagent memory
    return path.resolve('/Users/sam/03-Code/01-GitHub/deepseek-harness/data/pm-memory')
  }

  /**
   * Reads the comprehensive PM context to be injected into agent reasoning.
   */
  async readContext(projectDir?: string): Promise<string> {
    const memDir = await this.resolveMemoryRoot(projectDir)
    const contextFile = path.join(memDir, '项目上下文.md')
    const peopleFile = path.join(memDir, '人员记忆.md')
    const decisionFile = path.join(memDir, '关键决策.md')
    const termsFile = path.join(memDir, '内部术语表.md')

    const sections: string[] = []

    try {
      const c = await fs.readFile(contextFile, 'utf-8')
      sections.push(`### [项目上下文 (SSOT)]\n${c.trim()}`)
    } catch {
      // not found
    }

    try {
      const p = await fs.readFile(peopleFile, 'utf-8')
      sections.push(`### [人员记忆与沟通分工]\n${p.trim()}`)
    } catch {
      // not found
    }

    try {
      const d = await fs.readFile(decisionFile, 'utf-8')
      sections.push(`### [关键决策日志]\n${d.trim()}`)
    } catch {
      // not found
    }

    try {
      const t = await fs.readFile(termsFile, 'utf-8')
      sections.push(`### [内部专有术语表]\n${t.trim()}`)
    } catch {
      // not found
    }

    return sections.join('\n\n')
  }

  /**
   * Appends a newly formed decision to the Single Source of Truth.
   */
  async recordDecision(record: DecisionRecord, projectDir?: string): Promise<void> {
    const memDir = await this.resolveMemoryRoot(projectDir)
    const decisionFile = path.join(memDir, '关键决策.md')
    const line = `- [${record.date}] **${record.decision}** | 决策人: ${record.owner} | 理由: ${record.reason}\n`
    await fs.appendFile(decisionFile, line, 'utf-8')
  }
}

export function apply(ctx: Context): void {
  ctx.plugin(PmMemoryService)

  // System Prompt Consumer: Injects PM Single Source of Truth (SSOT) into the model's reasoning
  ctx.inject(['systemPrompt', 'pmMemory'], (hostCtx) => {
    hostCtx.systemPrompt.section({
      name: 'pm-memory-ssot',
      order: 50, // Between persona (0) and tool guidance (100)
      text: async () => {
        try {
          const pmContext = await hostCtx.pmMemory.readContext()
          if (!pmContext) return ''
          return `\n## PM 项目记忆与业务上下文 (Single Source of Truth)\n${pmContext}\n`
        } catch {
          return ''
        }
      },
    })
  })

  // Tool Consumer: Registers PM memory management tools for the agent
  ctx.inject(['tools', 'pmMemory'], (hostCtx) => {
    // 1. pm_get_memory tool
    hostCtx.tools.register({
      name: 'pm_get_memory',
      description: 'Fetch the latest PM project memory, team stakeholders, decision log, or terminology.',
      parameters: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            description: 'Optional category to inspect: all | context | people | decisions | terms',
            enum: ['all', 'context', 'people', 'decisions', 'terms'],
          },
        },
      },
      output: {
        schema: {
          type: 'object',
          properties: {
            content: { type: 'string' },
          },
          required: ['content'],
        },
        render(_args, value) {
          const v = value as { content: string }
          return [{ type: 'text', text: v.content }]
        },
      },
      async execute(_args) {
        const full = await hostCtx.pmMemory.readContext()
        return { content: full || 'No PM memory loaded.' }
      },
    })

    // 2. pm_record_decision tool
    hostCtx.tools.register({
      name: 'pm_record_decision',
      description: 'Record an architectural or product decision into the PM Workbench Single Source of Truth.',
      parameters: {
        type: 'object',
        properties: {
          decision: { type: 'string', description: 'The finalized decision or rule.' },
          owner: { type: 'string', description: 'The decision owner / stakeholder.' },
          reason: { type: 'string', description: 'The rationale or trade-off analysis.' },
        },
        required: ['decision', 'owner', 'reason'],
      },
      output: {
        schema: {
          type: 'object',
          properties: {
            status: { type: 'string' },
          },
          required: ['status'],
        },
        render(_args, value) {
          const v = value as { status: string }
          return [{ type: 'text', text: `✅ 决策已沉淀入库: ${v.status}` }]
        },
      },
      async execute(args) {
        const a = args as { decision: string; owner: string; reason: string }
        const today = new Date().toISOString().split('T')[0]
        await hostCtx.pmMemory.recordDecision({
          date: today,
          decision: a.decision,
          owner: a.owner,
          reason: a.reason,
        })
        return { status: `[${today}] ${a.decision} (by ${a.owner})` }
      },
    })
  })
}
