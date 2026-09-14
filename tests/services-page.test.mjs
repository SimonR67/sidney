// Tests for the "Softpapaya Services" home page.
// Plan: specs/24ad0907-f4a5-4d87-9555-0239522ef9df/plan.md
// One describe per numbered task in that plan.
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { HOMEPAGE, SERVICES_NOTES, read } from './site.mjs'

describe('Services task 1: the served home page, identified and written down', () => {
  /** The section of the notes under the given `## n. Heading`, up to the next heading. */
  const section = async (heading) => {
    const notes = await read(SERVICES_NOTES)
    return notes.split(new RegExp(`^## \\d+\\. ${heading}.*$`, 'm')).at(1)?.split(/^## /m).at(0) ?? null
  }

  it('names the one file served at the site root', async () => {
    const discovery = await section('Discovery')

    assert.ok(discovery, `${SERVICES_NOTES} has no "Discovery" section`)
    assert.match(discovery, new RegExp(`\`${HOMEPAGE}\``), `the discovery notes do not name ${HOMEPAGE}`)
  })

  it('rules out every other homepage candidate it looked at', async () => {
    const discovery = await section('Discovery')

    for (const candidate of ['about.html', 'contact.html', 'index.php', 'package.json']) {
      assert.match(
        discovery,
        new RegExp(candidate.replace('.', '\\.')),
        `the discovery notes never say what was decided about ${candidate}`,
      )
    }
    assert.match(discovery, /no build step|no templating|static/i, 'the notes do not rule out a generated homepage')
  })

  it('says which of the old assets are orphaned by the replacement and which are not', async () => {
    const orphans = await section('Orphaned assets')

    assert.ok(orphans, `${SERVICES_NOTES} has no "Orphaned assets" section`)
    assert.match(orphans, /style\.css/, 'the notes do not account for the old stylesheet')
    assert.match(orphans, /about\.html/, 'the notes do not account for about.html')
    assert.match(orphans, /contact\.html/, 'the notes do not account for contact.html')
  })
})
