// Helpers for the black/gold/aqua theme job: find the site's pages, read the
// styling each one actually loads, and read the tables out of docs/theme-notes.md.
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const THEME_NOTES = join('docs', 'theme-notes.md')

/** The three colours of the theme, exactly as the stylesheet declares them. */
export const THEME = {
  black: '#000000',
  gold: '#ffd700',
  aqua: '#00ffff',
}

/** Every HTML page served from the repository root, alphabetically. */
export async function pageFiles(repoRoot) {
  return (await readdir(repoRoot)).filter((name) => name.endsWith('.html')).sort()
}

/**
 * The styling a page carries: the stylesheets it links, its inline `<style>`
 * blocks and its inline `style=""` attributes.
 */
export function stylingSources(html) {
  return {
    stylesheets: [...html.matchAll(/<link\b[^>]*>/gi)]
      .filter((m) => /rel="stylesheet"/i.test(m[0]))
      .map((m) => m[0].match(/href="([^"]*)"/)?.[1] ?? null),
    styleBlocks: [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]),
    styleAttributes: [...html.matchAll(/\sstyle="([^"]*)"/g)].map((m) => m[1]),
  }
}

export const readThemeNotes = (repoRoot) => readFile(join(repoRoot, THEME_NOTES), 'utf8')

export const readSource = (repoRoot, file) => readFile(join(repoRoot, file), 'utf8')
