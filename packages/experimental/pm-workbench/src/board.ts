/** Bound project folders and the markdown canvas stored inside each one. */

import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { basename, isAbsolute, join, resolve } from 'node:path'
import { PM_CARD_KINDS, type PmBoardSnapshot, type PmCard, type PmCardKind } from './types.ts'

/** Workspace index of bound project folders, under the Session cwd. */
export const PM_BOARD_ROOT = '.pm-workbench'

/** Canvas files live in this directory inside a bound project folder. */
export const PM_PROJECT_BOARD = '.pm-workbench'

const ID_RE = /^[a-z0-9][a-z0-9-]{0,63}$/
const BINDINGS = 'bindings.json'

interface BindingsFile {
  readonly current?: string
  readonly folders: Record<string, string>
}

/**
 * Admit a project or card id used as a path segment.
 * @param value - caller-supplied id.
 * @param label - field name in the thrown error.
 * @returns the same id when it is a single safe path segment.
 */
export function admitPmId(value: string, label: string): string {
  if (!ID_RE.test(value)) {
    throw new Error(`${label} must match ${ID_RE.source}`)
  }
  return value
}

/**
 * Admit a card kind.
 * @param value - caller-supplied kind.
 * @returns the kind when it is one of {@link PM_CARD_KINDS}.
 */
export function admitPmKind(value: string): PmCardKind {
  if ((PM_CARD_KINDS as readonly string[]).includes(value)) return value as PmCardKind
  throw new Error(`kind must be one of ${PM_CARD_KINDS.join(', ')}`)
}

/**
 * Turn a folder basename into a project id.
 * @param folder - absolute project folder.
 * @returns an admitted slug.
 */
export function slugFromFolder(folder: string): string {
  const slug = basename(folder).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64)
  return ID_RE.test(slug) ? slug : 'project'
}

function indexDir(cwd: string): string {
  return join(cwd, PM_BOARD_ROOT)
}

function boardDir(folder: string): string {
  return join(folder, PM_PROJECT_BOARD)
}

async function readBindings(cwd: string): Promise<BindingsFile> {
  try {
    const raw = await readFile(join(indexDir(cwd), BINDINGS), 'utf8')
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return { folders: {} }
    const folders = (parsed as { folders?: unknown }).folders
    if (typeof folders !== 'object' || folders === null || Array.isArray(folders)) return { folders: {} }
    const admitted: Record<string, string> = {}
    for (const [id, folder] of Object.entries(folders as Record<string, unknown>)) {
      if (!ID_RE.test(id) || typeof folder !== 'string' || !isAbsolute(folder)) continue
      admitted[id] = folder
    }
    const current = (parsed as { current?: unknown }).current
    return {
      folders: admitted,
      ...typeof current === 'string' && ID_RE.test(current) && admitted[current] !== undefined
        ? { current }
        : {},
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { folders: {} }
    throw error
  }
}

async function writeBindings(cwd: string, bindings: BindingsFile): Promise<void> {
  await mkdir(indexDir(cwd), { recursive: true })
  await writeJsonAtomic(join(indexDir(cwd), BINDINGS), bindings)
}

/** Write a JSON document through a same-directory rename so readers never see a partial file. */
async function writeJsonAtomic(path: string, value: unknown): Promise<void> {
  const temporary = `${path}.${process.pid}.${Date.now()}.tmp`
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
  await rename(temporary, path)
}

function uniqueId(bindings: BindingsFile, folder: string): string {
  for (const [id, bound] of Object.entries(bindings.folders)) {
    if (bound === folder) return id
  }
  const base = slugFromFolder(folder)
  if (bindings.folders[base] === undefined) return base
  for (let n = 2; n < 1000; n += 1) {
    const id = `${base.slice(0, 61)}-${n}`
    if (ID_RE.test(id) && bindings.folders[id] === undefined) return id
  }
  throw new Error('could not allocate a project id for that folder')
}

/**
 * List bound project ids for a workspace cwd.
 * @param cwd - absolute Session working directory.
 * @returns project ids in lexicographic order.
 */
export async function listProjects(cwd: string): Promise<string[]> {
  return Object.keys((await readBindings(cwd)).folders).sort()
}

/**
 * Read the workspace's current project id, when one has been bound.
 * @param cwd - absolute Session working directory.
 * @returns the admitted current project id, or `undefined`.
 */
export async function readCurrentProject(cwd: string): Promise<string | undefined> {
  return (await readBindings(cwd)).current
}

/**
 * Absolute folder bound to a project id.
 * @param cwd - absolute Session working directory.
 * @param projectId - bound project id.
 * @returns the folder path.
 */
export async function folderOf(cwd: string, projectId: string): Promise<string> {
  const id = admitPmId(projectId, 'projectId')
  const folder = (await readBindings(cwd)).folders[id]
  if (folder === undefined) throw new Error(`project ${id} is not bound to a folder`)
  return folder
}

async function snapshotOf(cwd: string, projectId: string, cards: PmCard[]): Promise<PmBoardSnapshot> {
  const bindings = await readBindings(cwd)
  const folder = await folderOf(cwd, projectId)
  return {
    projectId: admitPmId(projectId, 'projectId'),
    folder,
    folders: { ...bindings.folders },
    projects: Object.keys(bindings.folders).sort(),
    cards,
  }
}

/**
 * Bind an absolute folder as a project and make it current.
 * @param cwd - absolute Session working directory.
 * @param folder - absolute directory chosen in the OS folder picker.
 * @returns the admitted project id.
 */
export async function bindFolder(cwd: string, folder: string): Promise<string> {
  if (!isAbsolute(folder)) throw new Error('project folder must be an absolute path')
  const resolved = resolve(folder)
  const bindings = await readBindings(cwd)
  const id = uniqueId(bindings, resolved)
  const next: BindingsFile = {
    current: id,
    folders: { ...bindings.folders, [id]: resolved },
  }
  await writeBindings(cwd, next)
  await mkdir(join(boardDir(resolved), 'cards'), { recursive: true })
  return id
}

/**
 * Select an already-bound project, or bind a new absolute folder.
 * @param cwd - absolute Session working directory.
 * @param target - bound project id or absolute folder path.
 * @returns the admitted project id.
 */
export async function selectProject(cwd: string, target: string): Promise<string> {
  if (isAbsolute(target)) return await bindFolder(cwd, target)
  const id = admitPmId(target, 'projectId')
  const bindings = await readBindings(cwd)
  const folder = bindings.folders[id]
  if (folder === undefined) throw new Error(`project ${id} is not bound to a folder; pick a directory first`)
  await writeBindings(cwd, { current: id, folders: bindings.folders })
  await mkdir(join(boardDir(folder), 'cards'), { recursive: true })
  return id
}

interface LayoutFile {
  readonly cards?: readonly Partial<PmCard>[]
}

async function readLayout(dir: string): Promise<LayoutFile> {
  try {
    const raw = await readFile(join(dir, 'layout.json'), 'utf8')
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null || !('cards' in parsed)) return {}
    const cards = (parsed as { cards: unknown }).cards
    if (!Array.isArray(cards)) return {}
    return { cards: cards as Partial<PmCard>[] }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return {}
    throw error
  }
}

function layoutCard(entry: Partial<PmCard>, index: number, markdown: string): PmCard | undefined {
  if (typeof entry.id !== 'string' || !ID_RE.test(entry.id)) return undefined
  const kind = typeof entry.kind === 'string' && (PM_CARD_KINDS as readonly string[]).includes(entry.kind)
    ? entry.kind as PmCardKind
    : 'doc'
  const title = typeof entry.title === 'string' && entry.title.trim() !== '' ? entry.title.trim() : entry.id
  return {
    id: entry.id,
    kind,
    title,
    markdown,
    x: typeof entry.x === 'number' && Number.isFinite(entry.x) ? entry.x : 48 + (index % 2) * 470,
    y: typeof entry.y === 'number' && Number.isFinite(entry.y) ? entry.y : 44 + Math.floor(index / 2) * 360,
    width: typeof entry.width === 'number' && Number.isFinite(entry.width) ? entry.width : 440,
    height: typeof entry.height === 'number' && Number.isFinite(entry.height) ? entry.height : 320,
  }
}

/**
 * Load one project's board from its bound folder.
 * @param cwd - absolute Session working directory.
 * @param projectId - bound project id.
 * @returns the whole snapshot including the workspace project roster.
 */
export async function loadBoard(cwd: string, projectId: string): Promise<PmBoardSnapshot> {
  const id = admitPmId(projectId, 'projectId')
  const folder = await folderOf(cwd, id)
  const dir = boardDir(folder)
  await mkdir(join(dir, 'cards'), { recursive: true })
  const layout = await readLayout(dir)
  const cards: PmCard[] = []
  const listed = layout.cards ?? []
  for (const [index, entry] of listed.entries()) {
    let markdown = ''
    if (typeof entry.id === 'string' && ID_RE.test(entry.id)) {
      try {
        markdown = await readFile(join(dir, 'cards', `${entry.id}.md`), 'utf8')
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
      }
    }
    const card = layoutCard(entry, index, markdown)
    if (card !== undefined) cards.push(card)
  }
  return await snapshotOf(cwd, id, cards)
}

/**
 * Resolve card geometry: caller value, then the previous card, then the layout default.
 * @param input - explicit geometry from this write.
 * @param previous - stored geometry of the same card id, if any.
 * @param fallback - default used for a new card.
 * @returns the admitted number.
 */
function geometry(input: number | undefined, previous: number | undefined, fallback: number): number {
  if (input !== undefined) return input
  if (previous !== undefined) return previous
  return fallback
}

/**
 * Write or replace one card on a project board and persist layout plus markdown.
 * @param cwd - absolute Session working directory.
 * @param input - card fields; omitted geometry keeps the previous card's values.
 * @returns the updated whole board snapshot.
 */
export async function upsertCard(cwd: string, input: {
  readonly projectId: string
  readonly id: string
  readonly kind: string
  readonly title: string
  readonly markdown: string
  readonly x?: number
  readonly y?: number
  readonly width?: number
  readonly height?: number
}): Promise<PmBoardSnapshot> {
  const projectId = isAbsolute(input.projectId)
    ? await bindFolder(cwd, input.projectId)
    : await selectProject(cwd, input.projectId)
  const id = admitPmId(input.id, 'id')
  const kind = admitPmKind(input.kind)
  const title = input.title.trim()
  if (title === '') throw new Error('title must be a non-empty string')
  const folder = await folderOf(cwd, projectId)
  const dir = boardDir(folder)
  const previous = await loadBoard(cwd, projectId)
  const existing = previous.cards.find(card => card.id === id)
  const index = existing === undefined ? previous.cards.length : previous.cards.findIndex(card => card.id === id)
  const card: PmCard = {
    id,
    kind,
    title,
    markdown: input.markdown,
    x: geometry(input.x, existing?.x, 48 + (index % 2) * 470),
    y: geometry(input.y, existing?.y, 44 + Math.floor(index / 2) * 360),
    width: geometry(input.width, existing?.width, 440),
    height: geometry(input.height, existing?.height, 320),
  }
  const cards = existing === undefined
    ? [...previous.cards, card]
    : previous.cards.map(item => item.id === id ? card : item)
  await writeFile(join(dir, 'cards', `${id}.md`), input.markdown, 'utf8')
  await writeJsonAtomic(join(dir, 'layout.json'), {
    cards: cards.map(({ markdown: _markdown, ...layout }) => layout),
  })
  return await snapshotOf(cwd, projectId, cards)
}
