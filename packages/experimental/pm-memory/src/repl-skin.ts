/**
 * CLI-Anything REPL Skin — Unified terminal interface for DeepSeek Harness PM Workbench.
 * Conforms to the CLI-Anything HARNESS.md UX and styling standard.
 */

// ── ANSI color codes (zero external dependencies) ──────────────────────────

export const RESET = '\x1b[0m'
export const BOLD = '\x1b[1m'
export const DIM = '\x1b[2m'
export const ITALIC = '\x1b[3m'
export const UNDERLINE = '\x1b[4m'

// Brand & Accent Colors
export const CYAN = '\x1b[38;5;80m'
export const WHITE = '\x1b[97m'
export const GRAY = '\x1b[38;5;245m'
export const DARK_GRAY = '\x1b[38;5;240m'
export const LIGHT_GRAY = '\x1b[38;5;250m'

export const GREEN = '\x1b[38;5;78m'
export const YELLOW = '\x1b[38;5;220m'
export const RED = '\x1b[38;5;196m'
export const BLUE = '\x1b[38;5;75m'
export const MAGENTA = '\x1b[38;5;176m'

// Icons
export const ICON = `${CYAN}${BOLD}◆${RESET}`
export const ICON_SMALL = `${CYAN}▸${RESET}`

// Box drawing characters
const H_LINE = '─'
const V_LINE = '│'
const TL = '╭'
const TR = '╮'
const BL = '╰'
const BR = '╯'

export function stripAnsi(text: string): string {
  return text.replace(/\x1b\[[0-9;]*m/g, '')
}

export function visibleLen(text: string): int {
  return stripAnsi(text).length
}

export class ReplSkin {
  readonly softwareName: string
  readonly version: string

  constructor(softwareName = 'pm-workbench', version = '0.1.0-rc.5') {
    this.softwareName = softwareName
    this.version = version
  }

  /**
   * Prints branded startup banner box.
   */
  printBanner(memoryPath = 'data/pm-memory/'): void {
    const width = 68
    const title = `🚀 DeepSeek Harness — PM Multi-Agent Terminal (${this.softwareName})`
    const sub = `Version: ${this.version}  │  SSOT Memory: ${memoryPath}`
    const swarm = 'Swarm: 🎯 Clarify  🛡️ RedTeam  📊 Benchmark  🧠 Memory Agent'

    console.log(`\n${CYAN}${TL}${H_LINE.repeat(width)}${TR}${RESET}`)
    console.log(`${CYAN}${V_LINE}${RESET}  ${BOLD}${WHITE}${title.padEnd(width - 4)}${RESET}  ${CYAN}${V_LINE}${RESET}`)
    console.log(`${CYAN}${V_LINE}${RESET}  ${GRAY}${sub.padEnd(width - 4)}${RESET}  ${CYAN}${V_LINE}${RESET}`)
    console.log(`${CYAN}${V_LINE}${RESET}  ${GREEN}${swarm.padEnd(width - 4)}${RESET}  ${CYAN}${V_LINE}${RESET}`)
    console.log(`${CYAN}${BL}${H_LINE.repeat(width)}${BR}${RESET}\n`)
  }

  /**
   * Returns styled prompt string.
   */
  getPrompt(projectName = 'Lily'): string {
    return `${CYAN}${BOLD}dsh-pm(${projectName})${RESET}${WHITE}> ${RESET}`
  }

  success(msg: string): void {
    console.log(`  ${GREEN}✔${RESET} ${msg}`)
  }

  error(msg: string): void {
    console.log(`  ${RED}✗${RESET} ${msg}`)
  }

  warning(msg: string): void {
    console.log(`  ${YELLOW}⚠${RESET} ${msg}`)
  }

  info(msg: string): void {
    console.log(`  ${BLUE}●${RESET} ${msg}`)
  }

  status(key: string, value: string): void {
    console.log(`  ${DIM}${key}:${RESET} ${BOLD}${WHITE}${value}${RESET}`)
  }

  divider(title?: string): void {
    const w = 68
    if (!title) {
      console.log(`${DARK_GRAY}${H_LINE.repeat(w)}${RESET}`)
    } else {
      const pad = Math.max(2, Math.floor((w - stripAnsi(title).length - 4) / 2))
      console.log(`${DARK_GRAY}${H_LINE.repeat(pad)}[ ${YELLOW}${BOLD}${title}${RESET}${DARK_GRAY} ]${H_LINE.repeat(pad)}${RESET}`)
    }
  }

  printGoodbye(): void {
    console.log(`\n  ${CYAN}👋 退出 PM 交互终端。所有已确认决策已持久化至 SSOT。${RESET}\n`)
  }
}
