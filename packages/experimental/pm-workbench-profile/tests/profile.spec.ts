/** The experimental bundle must carry one parseable PM Workbench host layer. */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import * as yaml from 'js-yaml'
import { entryListSchema } from '@deepseek-ai/cordis-plugin-include'

describe('PM Workbench profile bundle', () => {
  it('declares a private parseable host layer', () => {
    const root = fileURLToPath(new URL('..', import.meta.url))
    const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as {
      private?: boolean
      publishConfig?: unknown
      dependencies?: Record<string, string>
      dsh?: { bundle?: { patch?: string } }
    }
    expect(manifest.private).toBe(true)
    expect(manifest.publishConfig).toBeUndefined()
    expect(manifest.dsh?.bundle?.patch).toBe('./cordis.patch.yml')
    expect(manifest.dependencies).toMatchObject({
      '@deepseek-ai/dsh-experimental-pm-workbench': 'workspace:^',
    })
    const parsed = yaml.load(
      readFileSync(resolve(root, manifest.dsh!.bundle!.patch!), 'utf8'),
      { schema: entryListSchema },
    )
    const inserted = (parsed as { insert?: { id?: string; name?: string }[] }[])
      .flatMap(patch => patch.insert ?? [])
    expect(inserted.find(entry => entry.id === 'pm-workbench')).toMatchObject({
      name: '@deepseek-ai/dsh-experimental-pm-workbench',
    })
  })
})
