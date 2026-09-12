/**
 * Interactive Multi-Agent Loop with Human-in-the-Loop Confirmation.
 * 1. User inputs requirement
 * 2. Swarm parallel execution (Clarify, RedTeam, Benchmark)
 * 3. Human confirmation on critical trade-offs & boundary deadlocks
 * 4. Dedicated Memory Agent commits confirmed decisions to SSOT
 */

import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { PmMemoryService, type MultiAgentIntakeResult } from './index.ts'
import { ReplSkin, BOLD, WHITE, GREEN, YELLOW, CYAN, RESET, GRAY } from './repl-skin.ts'

export interface InteractiveOptions {
  skin?: ReplSkin
  service: PmMemoryService
  rl?: readline.Interface
}

export class InteractivePmLoop {
  private readonly skin: ReplSkin
  private readonly service: PmMemoryService

  constructor(options: InteractiveOptions) {
    this.skin = options.skin || new ReplSkin()
    this.service = options.service
  }

  /**
   * Runs the full interactive workflow for one user requirement.
   */
  async processRequirement(rawRequirement: string, rl: readline.Interface): Promise<MultiAgentIntakeResult> {
    const skin = this.skin

    skin.info('正在并发调度 Clarify / RedTeam / Benchmark 3大专职 Agent 并行推导中...')

    // 1. 并行派发 3 个分析 Agent
    const [clarify, redTeam, benchmark] = await Promise.all([
      this.service.runClarifyAgent(rawRequirement),
      this.service.runRedTeamAgent(rawRequirement),
      this.service.runBenchmarkAgent(rawRequirement, 'WorkBuddy'),
    ])

    skin.success(`Clarify Subagent: 需求细化完成，提炼出 ${clarify.todayTop3.length} 个 Today Top 3 必达动作`)
    skin.success(`Benchmark Subagent: 已提取 ${benchmark.target} 竞品机制与消息气泡实际消耗 Badge 规范`)
    skin.warning(`RedTeam Subagent: 质询分析完成，排查出 ${redTeam.criticalChallenges.length} 个关键业务死角`)

    // 2. 提取需要 PM 亲自拍板的核心抉择 (Human-in-the-loop)
    skin.divider('⚠️ RedTeam 提出 2 个关键业务决策，需要 PM 拍板确认')

    console.log(`\n${BOLD}${WHITE}[抉择 1/2] 普通对话消息是否需要弹出前置“预计消耗”？${RESET}`)
    console.log(`  ${GREEN}(A)${RESET} 不加弹窗，仅在输出完成后于气泡右下角展示轻量「⚡ 实际消耗 X 算力」 ${GRAY}(推荐: 减少用户输入打断摩擦)${RESET}`)
    console.log(`  ${YELLOW}(B)${RESET} 强行阻断弹窗，每次发消息前都弹出预计消耗确认窗口`)

    let ans1 = 'A'
    try {
      ans1 = (await rl.question(`\n${CYAN}请输入你的选择 [A/B] (默认 A): ${RESET}`)).trim().toUpperCase() || 'A'
    } catch {
      ans1 = 'A'
    }
    const decision1 = ans1 === 'B'
      ? '普通对话增加前置阻断弹窗进行预计消耗强确认'
      : '普通对话不加前置弹窗阻断，生成完毕后在气泡右下角轻量展示实际消耗Badge'
    skin.success(`已记录你的决策: ${decision1}`)

    console.log(`\n${BOLD}${WHITE}[抉择 2/2] 任务执行若由于大模型发散，实际消耗超出预估 150% 时如何处置？${RESET}`)
    console.log(`  ${GREEN}(A)${RESET} 触发二次熔断提醒，经用户确认后才继续扣费执行 ${GRAY}(推荐: 规避客诉争议)${RESET}`)
    console.log(`  ${YELLOW}(B)${RESET} 静默继续扣减，在账单中标记超额异常并自动放行`)

    let ans2 = 'A'
    try {
      ans2 = (await rl.question(`\n${CYAN}请输入你的选择 [A/B] (默认 A): ${RESET}`)).trim().toUpperCase() || 'A'
    } catch {
      ans2 = 'A'
    }
    const decision2 = ans2 === 'B'
      ? '超出预估150%静默放行并在账单标黄'
      : '超出预估150%触发二次熔断弹窗，用户确认后继续'
    skin.success(`已记录你的决策: ${decision2}`)

    // 3. 将 PM 拍板结论提交给专职 Memory Agent 沉淀入库
    skin.divider('🧠 专职 Memory Agent 正在将 PM 决策与分工沉淀至 SSOT')

    const today = new Date().toISOString().split('T')[0]
    const memorySync = await this.service.runMemoryAgent({
      requirement: rawRequirement,
      decisions: [
        {
          decision: `算力计费双轨制: ${decision1}；超额机制: ${decision2}`,
          owner: 'PM (用户拍板确认)',
          reason: '经人机交互确认，平衡用户体验流畅度与计费透明度，杜绝超额争议',
        },
      ],
      stakeholderUpdates: [
        {
          name: '计费与网关团队',
          role: '网关研发',
          responsibility: '负责流式 SSE usage 字段返回契约',
          pendingActions: ['确认 stream 结尾直吐 usage (今日 17:00 前)'],
        },
        {
          name: '张万里 / 花卷',
          role: '前端 / UI 负责人',
          responsibility: '负责消息气泡末尾实际消耗 Badge 交互',
          pendingActions: ['交付消息气泡实际消耗 Badge 交互与 Hover Token 展开卡片 (周二前)'],
        },
      ],
      projectLog: {
        heading: `${today} 算力计费与消耗明细（对标WorkBuddy）产品机制与边界设计`,
        content: [
          '### 核心背景与对标',
          `- 原始诉求: ${rawRequirement}`,
          '- 决策人: PM (终端交互式拍板)',
          '',
          '### 最终确认机制 (SSOT)',
          `1. **对话消息实际消耗**: ${decision1}`,
          `2. **超额兜底策略**: ${decision2}`,
          '3. **明细类型划分**: 对话消耗 (Chat)、AIPro账号回收 (Account Reclaim)、自动化批处理任务 (Automation Task)、知识库索引 (Index)。',
          '4. **流式截断兜底**: 网络中断按客户端最后 ACK 的 Token 偏置量计费，严禁多扣。',
        ].join('\n'),
      },
    })

    skin.success(`《关键决策.md》: 已追加确认记录 (${memorySync.updatedDecisions.length} 条)`)
    skin.success(`《人员记忆.md》: 已同步网关团队与前端责任 (${memorySync.updatedPeople.join(', ')})`)
    skin.success(`《项目上下文.md》: 已归档完整机制与兜底表 (${memorySync.updatedProjectLog})`)

    return {
      requirement: rawRequirement,
      clarify,
      redTeam,
      benchmark,
      memoryUpdate: memorySync,
    }
  }

  /**
   * Launches the persistent REPL loop until exit.
   */
  async startRepl(): Promise<void> {
    const rl = readline.createInterface({ input, output })
    this.skin.printBanner()

    try {
      while (true) {
        const query = await rl.question(this.skin.getPrompt('Lily'))
        const trimmed = query.trim()

        if (!trimmed) continue
        if (['exit', 'quit', ':q', 'q'].includes(trimmed.toLowerCase())) {
          this.skin.printGoodbye()
          break
        }

        if (['help', '?'].includes(trimmed.toLowerCase())) {
          console.log(`\n  ${CYAN}可用指令:${RESET}`)
          console.log('    直接输入任何需求/问题 -> 触发多 Agent 并发推导与人机确认')
          console.log('    memory / ssot        -> 查看当前底层记忆库 (SSOT)')
          console.log('    exit / quit          -> 退出交互终端\n')
          continue
        }

        if (['memory', 'ssot'].includes(trimmed.toLowerCase())) {
          const mem = await this.service.readContext()
          console.log(`\n${mem}\n`)
          continue
        }

        await this.processRequirement(trimmed, rl)
        console.log(`\n${GREEN}🎉 本次推导与人机确认已闭环并持久化！${RESET}\n`)
      }
    } finally {
      rl.close()
    }
  }
}
