// Helpers for the colour-scheme audit: scan the site's own source files for
// colour literals and read the tables out of docs/palette-notes.md.
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

/** The repo's own styling sources — everything that can carry a colour value. */
export const STYLING_SOURCES = ['styles.css', 'index.html']

export const PALETTE_NOTES = join('docs', 'palette-notes.md')

// CSS named greens plus the green-flavoured words this site used for its tokens.
const GREEN_WORDS = [
  'green', 'greenyellow', 'darkgreen', 'darkolivegreen', 'forestgreen', 'lawngreen',
  'lightgreen', 'limegreen', 'mediumseagreen', 'olivedrab', 'palegreen', 'seagreen',
  'springgreen', 'yellowgreen', 'chartreuse', 'lime', 'olive',
  'forest', 'leaf', 'moss', 'fern', 'emerald', 'jade', 'mint',
]

const GREEN_WORD = new RegExp(String.raw`\b(${GREEN_WORDS.join('|')})\b`, 'gi')
// `%23` catches hex colours hiding inside the URL-encoded favicon data URI.
const HEX = /(?:#|%23)([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g
const RGB = /rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/gi
const HSL = /hsla?\(\s*([\d.]+)/gi

export function hexToRgb(hex) {
  const digits = hex.replace(/^(#|%23)/, '')
  const full = digits.length === 3 ? [...digits].map((d) => d + d).join('') : digits
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  }
}

/** True when green is the dominant channel by a visible margin. */
export function isGreenish({ r, g, b }) {
  return g > r + 4 && g > b + 4
}

/**
 * Every green colour literal (hex, rgb/rgba, hsl/hsla) and every green-named
 * word in `text`, as `{ line, value, kind }`.
 */
export function greenOccurrences(text) {
  const found = []
  text.split('\n').forEach((source, index) => {
    const line = index + 1
    for (const m of source.matchAll(HEX)) {
      if (isGreenish(hexToRgb(m[1]))) found.push({ line, value: m[0], kind: 'hex' })
    }
    for (const m of source.matchAll(RGB)) {
      const [r, g, b] = m.slice(1, 4).map(Number)
      if (isGreenish({ r, g, b })) found.push({ line, value: m[0], kind: 'rgb' })
    }
    for (const m of source.matchAll(HSL)) {
      const hue = ((Number(m[1]) % 360) + 360) % 360
      if (hue >= 75 && hue <= 165) found.push({ line, value: m[0], kind: 'hsl' })
    }
    for (const m of source.matchAll(GREEN_WORD)) {
      found.push({ line, value: m[0], kind: 'name' })
    }
  })
  return found
}

/** Every hex colour literal in `text`, normalised to lower-case `#rrggbb`. */
export function hexLiterals(text) {
  return [...text.matchAll(HEX)].map((m) => {
    const { r, g, b } = hexToRgb(m[1])
    return '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')
  })
}

/**
 * Rows of the markdown table directly under `## <heading>`, keyed by the
 * lower-cased column names.
 */
export function tableUnder(markdown, heading) {
  const section = markdown.split(/^## /m).find((part) => part.trimStart().startsWith(heading))
  if (!section) return null
  // Only the first contiguous run of table lines — a section may hold more than one.
  const rows = []
  for (const line of section.split('\n').map((l) => l.trim())) {
    const isRow = line.startsWith('|') && line.endsWith('|')
    if (isRow) rows.push(line.slice(1, -1).split('|').map((cell) => cell.trim()))
    else if (rows.length) break
  }
  if (rows.length < 3) return null
  const [header, , ...body] = rows
  return body.map((cells) => Object.fromEntries(header.map((name, i) => [name.toLowerCase(), cells[i] ?? ''])))
}

export const readNotes = (repoRoot) => readFile(join(repoRoot, PALETTE_NOTES), 'utf8')

export const readSource = (repoRoot, file) => readFile(join(repoRoot, file), 'utf8')
