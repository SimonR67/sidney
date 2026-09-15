// The one place a contact enquiry leaves the page. Kept to this file, and to
// one destination named in one attribute, so swapping the backend never reaches
// into the form itself.
// Notes: specs/39dd4128-7a8a-4564-8c49-613c9f754d8b/notes.md

/** The address the site contacted before this form, and still falls back to. */
export const FALLBACK_ADDRESS = 'hello@softpapaya.com'

/**
 * The step that leaves the page, behind an object rather than called directly,
 * so a test can watch where an enquiry was sent without opening a mail client.
 */
export const handoff = {
  go: (url) => {
    globalThis.location.href = url
  },
}

/** The enquiry written out as an email to `FALLBACK_ADDRESS`. */
export function mailtoFor({ fullName, email, enquiry, details }) {
  const body = [
    `Full Name: ${fullName}`,
    `Email Address: ${email}`,
    `Nature of Enquiry: ${enquiry}`,
    '',
    'Details about the type of work you need help with:',
    details,
  ].join('\n')
  return `mailto:${FALLBACK_ADDRESS}?subject=${encodeURIComponent(`Website enquiry: ${enquiry}`)}&body=${encodeURIComponent(body)}`
}

/**
 * Sends one enquiry and resolves with how it went out, or throws when it could
 * not be sent at all.
 *
 * With an `endpoint`, the four fields go as JSON and anything but a 2xx counts
 * as a failure. Without one — which is how the site ships, there being no
 * backend to point at yet — the enquiry is handed to the visitor's mail client
 * addressed to `FALLBACK_ADDRESS`, and the caller says so rather than claiming
 * the enquiry was filed.
 */
export async function submitEnquiry(enquiry, { endpoint = '' } = {}) {
  if (!endpoint) {
    handoff.go(mailtoFor(enquiry))
    return { via: 'email-client' }
  }

  const response = await globalThis.fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(enquiry),
  })
  if (!response.ok) throw new Error(`The enquiry endpoint answered ${response.status}`)
  return { via: 'endpoint' }
}
