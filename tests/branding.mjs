// Helpers for the site-name rename: scan the repo's own text sources for the
// old site name and read the tables out of docs/branding-notes.md.
//
// This file is the scanner, so it necessarily spells the old name out; it and
// the audit document it reads are the two files the sweep skips.
import { execFile } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { promisify } from 'node:util'

/** The site's name, exactly as every user-facing surface should spell it. */
export const SITE_NAME = 'Sid Meyer - Brave New Worlds'

/** The name it replaces. */
export const OLD_SITE_NAME = 'BetaMax'

export const BRANDING_NOTES = join('docs', 'branding-notes.md')

/** Case-insensitive, so `betamax` in a slug counts as much as `BetaMax` in prose. */
export const OLD_NAME = /betamax/gi

/**
 * Where the old name may still stand, and the exact text that carries it.
 * Everything else in the repo has to be renamed — see docs/branding-notes.md.
 */
export const FLAGGED = [
  { file: 'tests/browser.mjs', snippet: 'betamax-chrome-' },
  { file: 'tests/page.test.mjs', snippet: 'betamax-before-' },
]

/** Historical planning records: what each job was asked to do, left as written. */
export const SKIPPED_DIRS = ['specs/']

/** The scanner and the audit it writes: both quote the old name by design. */
export const SKIPPED_FILES = ['tests/branding.mjs', BRANDING_NOTES]

const BINARY = /\.(png|jpe?g|gif|webp|ico|woff2?|ttf|eot|pdf|zip)$/i

const run = async (repoRoot, ...args) => {
  const { stdout } = await promisify(execFile)('git', args, { cwd: repoRoot, maxBuffer: 1 << 22 })
  return stdout
}

/** Every text file git tracks that the sweep is expected to be clean of. */
export async function scannableFiles(repoRoot) {
  const tracked = (await run(repoRoot, 'ls-files')).split('\n').filter(Boolean)
  return tracked.filter(
    (file) =>
      !BINARY.test(file) &&
      !SKIPPED_FILES.includes(file) &&
      !SKIPPED_DIRS.some((dir) => file.startsWith(dir)),
  )
}

/** Every occurrence of the old name in `text`, as `{ line, value, text }`. */
export function oldNameOccurrences(text) {
  const found = []
  text.split('\n').forEach((source, index) => {
    for (const m of source.matchAll(OLD_NAME)) {
      found.push({ line: index + 1, value: m[0], text: source.trim() })
    }
  })
  return found
}

/** True when the line an occurrence sits on is one of the flagged exceptions. */
export const isFlagged = (file, occurrence) =>
  FLAGGED.some((entry) => entry.file === file && occurrence.text.includes(entry.snippet))

/** Scans the working tree; returns every surviving occurrence, flagged or not. */
export async function scanRepo(repoRoot) {
  const found = []
  for (const file of await scannableFiles(repoRoot)) {
    const text = await readFile(join(repoRoot, file), 'utf8')
    for (const occurrence of oldNameOccurrences(text)) found.push({ file, ...occurrence })
  }
  return found
}

export const readBrandingNotes = (repoRoot) => readFile(join(repoRoot, BRANDING_NOTES), 'utf8')

/** Reads `file` as it stood at `commit`, or null when it did not exist yet. */
export async function fileAtCommit(repoRoot, commit, file) {
  try {
    return await run(repoRoot, 'show', `${commit}:${file}`)
  } catch {
    return null
  }
}

/** The files git tracked at `commit`, filtered exactly as `scannableFiles` filters. */
export async function scannableFilesAtCommit(repoRoot, commit) {
  const tracked = (await run(repoRoot, 'ls-tree', '-r', '--name-only', commit)).split('\n').filter(Boolean)
  return tracked.filter(
    (file) =>
      !BINARY.test(file) &&
      !SKIPPED_FILES.includes(file) &&
      !SKIPPED_DIRS.some((dir) => file.startsWith(dir)),
  )
}
