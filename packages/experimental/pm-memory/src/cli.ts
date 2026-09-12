#!/usr/bin/env node
/**
 * CLI-Anything Dual-Mode CLI for DeepSeek Harness PM Workbench.
 * - Interactive REPL Mode (default when invoked without subcommand)
 * - One-shot Subcommand Mode (supports --json for automation & agent consumption)
 */

import { Context } from '@deepseek-ai/cordis'
import { PmMemoryService } from './index.ts'
import { ReplSkin } from './repl-skin.ts'
import { InteractivePmLoop } from './interactive-loop.ts'

async function main() {
  const args = process.argv.slice(2)
  const ctx = new Context()
  const service = new PmMemoryService(ctx)
  const skin = new ReplSkin('pm-workbench', '0.1.0-rc.5')

  const isJson = args.includes('--json')
  const cleanArgs = args.filter(a => a !== '--json' && a !== '--')

  // 1. 无参数启动：进入 CLI-Anything 交互式 REPL
  if (cleanArgs.length === 0) {
    const loop = new InteractivePmLoop({ skin, service })
    await loop.startRepl()
    return
  }

  // 2. 命令行单次调用 (Subcommand Mode)
  const [command, ...rest] = cleanArgs
  const payload = rest.join(' ').trim()

  switch (command) {
    case 'intake': {
      if (!payload) {
        console.error('Error: intake requires a requirement argument. E.g. dsh-pm intake "需求内容"')
        process.exit(1)
      }
      const res = await service.runParallelIntake(payload)
      if (isJson) {
        console.log(JSON.stringify(res, null, 2))
      } else {
        skin.printBanner()
        skin.success(`原始需求: ${res.requirement}`)
        skin.status('Clarify 核心目标', res.clarify.coreGoal)
        skin.status('Benchmark 对标', res.benchmark.target)
        skin.warning(`RedTeam 关键质询: ${res.redTeam.criticalChallenges[0]}`)
        skin.success(`Memory Agent 沉淀: ${res.memoryUpdate.status}`)
      }
      break
    }

    case 'memory': {
      const content = await service.readContext()
      if (isJson) {
        console.log(JSON.stringify({ content }, null, 2))
      } else {
        console.log(content)
      }
      break
    }

    case 'clarify': {
      if (!payload) {
        console.error('Error: clarify requires a requirement argument.')
        process.exit(1)
      }
      const res = await service.runClarifyAgent(payload)
      if (isJson) {
        console.log(JSON.stringify(res, null, 2))
      } else {
        skin.status('Agent', res.agent)
        skin.status('目标', res.coreGoal)
        res.clarifications.forEach(c => console.log(`  - ${c}`))
      }
      break
    }

    case 'redteam': {
      if (!payload) {
        console.error('Error: redteam requires a requirement argument.')
        process.exit(1)
      }
      const res = await service.runRedTeamAgent(payload)
      if (isJson) {
        console.log(JSON.stringify(res, null, 2))
      } else {
        skin.status('Agent', res.agent)
        res.criticalChallenges.forEach(c => skin.warning(c))
        skin.status('兜底方案', res.fallbackPlan)
      }
      break
    }

    case 'benchmark': {
      if (!payload) {
        console.error('Error: benchmark requires a requirement argument.')
        process.exit(1)
      }
      const res = await service.runBenchmarkAgent(payload)
      if (isJson) {
        console.log(JSON.stringify(res, null, 2))
      } else {
        skin.status('Agent', res.agent)
        skin.status('对标标的', res.target)
        res.keyParityPoints.forEach(p => console.log(`  - ${p}`))
      }
      break
    }

    case 'help':
    case '--help':
    case '-h': {
      skin.printBanner()
      console.log('用法:')
      console.log('  dsh-pm                      启动交互式终端 (REPL)')
      console.log('  dsh-pm intake "<需求>"      一键并行推导与记忆归档 (--json 纯净数据)')
      console.log('  dsh-pm memory               查看当前底层 SSOT 记忆库 (--json 纯净数据)')
      console.log('  dsh-pm clarify "<需求>"     单派 Clarify 需求澄清 Agent')
      console.log('  dsh-pm redteam "<需求>"     单派 RedTeam 红蓝对抗 Agent')
      console.log('  dsh-pm benchmark "<需求>"   单派 Benchmark 对标 Agent\n')
      break
    }

    default: {
      console.error(`未知子命令: ${command}. 输入 dsh-pm --help 查看可用指令.`)
      process.exit(1)
    }
  }
}

main().catch((err) => {
  console.error('dsh-pm error:', err)
  process.exit(1)
})
