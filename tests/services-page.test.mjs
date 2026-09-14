// Tests for the "Softpapaya Services" home page.
// Plan: specs/24ad0907-f4a5-4d87-9555-0239522ef9df/plan.md
// One describe per numbered task in that plan.
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  HOMEPAGE,
  HOME_PARAGRAPH,
  SERVICES_NOTES,
  SERVICES_STYLESHEET,
  SERVICES_TITLE,
  SITE_NAME,
  STYLESHEET,
  read,
  tagsIn,
  textOf,
  titleOf,
} from './site.mjs'

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

describe('Services task 2: the page skeleton and its title', () => {
  it('titles the page "Softpapaya Services"', async () => {
    assert.equal(titleOf(await read(HOMEPAGE)), SERVICES_TITLE)
  })

  it('declares a doctype, a language and the new stylesheet', async () => {
    const html = await read(HOMEPAGE)

    assert.match(html, /^<!DOCTYPE html>\n<html lang="en">/, `${HOMEPAGE} lacks a doctype and language`)
    assert.match(html, new RegExp(`<link[^>]*rel="stylesheet"[^>]*href="${SERVICES_STYLESHEET}"`))
  })

  it('is built from semantic HTML5 landmarks', async () => {
    const tags = tagsIn(await read(HOMEPAGE))

    for (const tag of ['header', 'nav', 'main', 'section', 'footer']) {
      assert.ok(tags.includes(tag), `${HOMEPAGE} has no <${tag}>`)
    }
    assert.equal(tags.filter((tag) => tag === 'main').length, 1, `${HOMEPAGE} should have exactly one <main>`)
    assert.equal(tags.filter((tag) => tag === 'h1').length, 1, `${HOMEPAGE} should have exactly one <h1>`)
  })

  it('keeps none of the superseded home page behind', async () => {
    const html = await read(HOMEPAGE)
    const text = textOf(html)

    assert.ok(!text.includes(SITE_NAME), `${HOMEPAGE} still shows the superseded site name`)
    assert.ok(!html.includes(HOME_PARAGRAPH), `${HOMEPAGE} still carries the old board advisory paragraph`)
    assert.doesNotMatch(text, /welcome to/i, `${HOMEPAGE} still carries the old welcome line`)
    for (const leftover of [STYLESHEET, 'site-title', 'site-nav__links', 'about.html', 'contact.html']) {
      assert.ok(!html.includes(leftover), `${HOMEPAGE} still references the old home page's ${leftover}`)
    }
  })

  it('closes every non-void element it opens', async () => {
    const html = await read(HOMEPAGE)
    const nonVoid = ['html', 'head', 'body', 'header', 'nav', 'main', 'section', 'footer', 'div', 'ul', 'li', 'a', 'p', 'h1', 'h2', 'h3', 'title', 'span']

    for (const tag of nonVoid) {
      const open = [...html.matchAll(new RegExp(`<${tag}\\b`, 'gi'))].length
      const close = [...html.matchAll(new RegExp(`</${tag}>`, 'gi'))].length
      assert.equal(open, close, `${HOMEPAGE} has ${open} <${tag}> against ${close} </${tag}>`)
    }
  })
})
