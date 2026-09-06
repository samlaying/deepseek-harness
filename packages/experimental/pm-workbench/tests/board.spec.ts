import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  admitPmId, admitPmKind, bindFolder, folderOf, listProjects, loadBoard, readCurrentProject,
  selectProject, slugFromFolder, upsertCard,
} from '../src/board.ts'

let cwd: string | undefined

afterEach(async () => {
  if (cwd !== undefined) await rm(cwd, { recursive: true, force: true })
  cwd = undefined
})

async function folder(name: string): Promise<string> {
  const dir = join(cwd!, name)
  await mkdir(dir, { recursive: true })
  return dir
}

describe('pm-workbench board files', () => {
  it('rejects unsafe ids, relative folders, and unknown kinds', async () => {
    cwd = await mkdtemp(join(tmpdir(), 'pm-board-'))
    expect(() => admitPmId('../x', 'projectId')).toThrow(/projectId/)
    expect(() => admitPmKind('slide')).toThrow(/kind/)
    await expect(bindFolder(cwd, 'relative/path')).rejects.toThrow(/absolute/)
    await expect(folderOf(cwd, 'ok')).rejects.toThrow(/not bound/)
    await expect(selectProject(cwd, 'missing')).rejects.toThrow(/not bound/)
  })

  it('slugs folder names and reuses a binding', async () => {
    expect(slugFromFolder('/tmp/Checkout PRD')).toBe('checkout-prd')
    expect(slugFromFolder('/tmp/---')).toBe('project')
    cwd = await mkdtemp(join(tmpdir(), 'pm-board-'))
    const shop = await folder('shop')
    expect(await bindFolder(cwd, shop)).toBe('shop')
    expect(await bindFolder(cwd, shop)).toBe('shop')
    const shop2 = await folder('Shop')
    expect(await bindFolder(cwd, shop2)).toBe('shop-2')
    expect(await folderOf(cwd, 'shop')).toBe(shop)
  })

  it('lists nothing before any project is bound', async () => {
    cwd = await mkdtemp(join(tmpdir(), 'pm-board-'))
    expect(await listProjects(cwd)).toEqual([])
    expect(await readCurrentProject(cwd)).toBeUndefined()
  })

  it('writes a shared project board into the bound folder', async () => {
    cwd = await mkdtemp(join(tmpdir(), 'pm-board-'))
    const checkout = await folder('checkout')
    const first = await upsertCard(cwd, {
      projectId: checkout,
      id: 'prd',
      kind: 'doc',
      title: 'PRD',
      markdown: '# Hello\n',
    })
    expect(first.projectId).toBe('checkout')
    expect(first.folder).toBe(checkout)
    expect(first.projects).toEqual(['checkout'])
    expect(first.cards[0]).toMatchObject({ id: 'prd', kind: 'doc', title: 'PRD', markdown: '# Hello\n' })
    const again = await loadBoard(cwd, 'checkout')
    expect(again).toEqual(first)
    expect(await readCurrentProject(cwd)).toBe('checkout')
    await upsertCard(cwd, {
      projectId: 'checkout',
      id: 'notes',
      kind: 'thought',
      title: 'Notes',
      markdown: 'aside',
    })
    const updated = await upsertCard(cwd, {
      projectId: 'checkout',
      id: 'prd',
      kind: 'doc',
      title: 'PRD v2',
      markdown: '# Updated\n',
    })
    expect(updated.cards).toHaveLength(2)
    expect(updated.cards[0]?.title).toBe('PRD v2')
    await selectProject(cwd, await folder('other'))
    expect(await listProjects(cwd)).toEqual(['checkout', 'other'])
  })

  it('skips layout entries with unsafe ids and missing markdown files', async () => {
    cwd = await mkdtemp(join(tmpdir(), 'pm-board-'))
    const alpha = await folder('alpha')
    await selectProject(cwd, alpha)
    await writeFile(join(alpha, '.pm-workbench', 'layout.json'), JSON.stringify({
      cards: [{ id: '../nope' }, { id: 'ok', kind: 'thought', title: 'Idea' }],
    }))
    const board = await loadBoard(cwd, 'alpha')
    expect(board.cards.map(card => card.id)).toEqual(['ok'])
    expect(board.cards[0]?.markdown).toBe('')
    await writeFile(join(alpha, '.pm-workbench', 'layout.json'), JSON.stringify({ cards: 'nope' }))
    expect((await loadBoard(cwd, 'alpha')).cards).toEqual([])
    await writeFile(join(alpha, '.pm-workbench', 'layout.json'), JSON.stringify({}))
    expect((await loadBoard(cwd, 'alpha')).cards).toEqual([])
    await writeFile(join(alpha, '.pm-workbench', 'layout.json'), 'null')
    expect((await loadBoard(cwd, 'alpha')).cards).toEqual([])
    await mkdir(join(alpha, '.pm-workbench', 'cards', 'blocked.md'))
    await writeFile(join(alpha, '.pm-workbench', 'layout.json'), JSON.stringify({
      cards: [{ id: 'blocked' }],
    }))
    await expect(loadBoard(cwd, 'alpha')).rejects.toThrow()
  })

  it('rejects an empty title and a corrupt layout file', async () => {
    cwd = await mkdtemp(join(tmpdir(), 'pm-board-'))
    const alpha = await folder('alpha')
    await expect(upsertCard(cwd, {
      projectId: alpha,
      id: 'x',
      kind: 'doc',
      title: '   ',
      markdown: 'body',
    })).rejects.toThrow(/title/)
    await selectProject(cwd, alpha)
    await writeFile(join(alpha, '.pm-workbench', 'layout.json'), '{')
    await expect(loadBoard(cwd, 'alpha')).rejects.toThrow()
    await writeFile(join(cwd, '.pm-workbench', 'bindings.json'), '{')
    await expect(readCurrentProject(cwd)).rejects.toThrow()
    await writeFile(join(cwd, '.pm-workbench', 'bindings.json'), '[]')
    expect(await listProjects(cwd)).toEqual([])
    await writeFile(join(cwd, '.pm-workbench', 'bindings.json'), 'true')
    expect(await listProjects(cwd)).toEqual([])
    await writeFile(join(cwd, '.pm-workbench', 'bindings.json'), JSON.stringify({ folders: [] }))
    expect(await listProjects(cwd)).toEqual([])
    await writeFile(join(cwd, '.pm-workbench', 'bindings.json'), JSON.stringify({ folders: null }))
    expect(await listProjects(cwd)).toEqual([])
    await writeFile(join(cwd, '.pm-workbench', 'bindings.json'), JSON.stringify({
      current: 'nope',
      folders: { bad: 'rel', ok: alpha, 'Not-id': alpha },
    }))
    expect(await listProjects(cwd)).toEqual(['ok'])
    expect(await readCurrentProject(cwd)).toBeUndefined()
    const taken: Record<string, string> = { shop: '/x/shop' }
    for (let n = 2; n < 1000; n += 1) taken[`shop-${n}`] = `/x/${n}`
    await mkdir(join(cwd, '.pm-workbench'), { recursive: true })
    await writeFile(join(cwd, '.pm-workbench', 'bindings.json'), JSON.stringify({ folders: taken }))
    await expect(bindFolder(cwd, await folder('shop'))).rejects.toThrow(/allocate/)
    await rm(join(cwd, '.pm-workbench'), { recursive: true, force: true })
    await writeFile(join(cwd, '.pm-workbench'), 'not-a-dir')
    await expect(listProjects(cwd)).rejects.toThrow()
    await expect(readCurrentProject(cwd)).rejects.toThrow()
  })

  it('keeps explicit geometry and default layout for incomplete cards', async () => {
    cwd = await mkdtemp(join(tmpdir(), 'pm-board-'))
    const layout = await folder('layout')
    const placed = await upsertCard(cwd, {
      projectId: layout,
      id: 'a',
      kind: 'thought',
      title: 'A',
      markdown: 'a',
      x: 12,
      y: 24,
      width: 300,
      height: 200,
    })
    expect(placed.cards[0]).toMatchObject({ x: 12, y: 24, width: 300, height: 200 })
    await writeFile(join(layout, '.pm-workbench', 'layout.json'), JSON.stringify({
      cards: [{ id: 'bare' }],
    }))
    await writeFile(join(layout, '.pm-workbench', 'cards', 'bare.md'), '## Sub\n\n### Deep\n')
    const loaded = await loadBoard(cwd, 'layout')
    expect(loaded.cards[0]).toMatchObject({ id: 'bare', kind: 'doc', title: 'bare' })
    expect(loaded.cards[0]?.width).toBe(440)
  })
})
