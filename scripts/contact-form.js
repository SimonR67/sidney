// The contact form's behaviour: validation, inline errors, and the submission
// the page hands to scripts/contact-api.js.
// Plan: specs/39dd4128-7a8a-4564-8c49-613c9f754d8b/plan.md
import { submitEnquiry } from './contact-api.js'

/**
 * What the status line under the button says once a submission has settled. The
 * confirmation depends on how the enquiry went out: an endpoint has taken it,
 * whereas a mail client has only been handed it and still needs sending.
 */
const CONFIRMATION = {
  endpoint: 'Thank you — your enquiry has been received. We will come back to you shortly.',
  'email-client':
    'Thank you — we have opened your email app with your enquiry. Send it and we will come back to you shortly.',
}

const FAILED =
  'We could not send your enquiry just now. Please try again, or reach us on LinkedIn using the link below.'

/** What the submit button says while it is waiting on a submission. */
const SENDING = 'SENDING…'

/**
 * What each field says when it is left empty. Keyed by the name the field
 * submits under, so the message sits beside the field it belongs to rather than
 * being assembled out of the label.
 */
const REQUIRED = {
  fullName: 'Please tell us your full name.',
  email: 'Please give us an email address we can reply to.',
  enquiry: 'Please tell us what your enquiry is about.',
  details: 'Please tell us a little about the work you need help with.',
}

/**
 * A local part, an `@`, and a dotted domain with a real suffix — the shape a
 * reply can be sent to. Deliberately no stricter than that: the point is to
 * catch the address that was mistyped, not to adjudicate RFC 5322.
 */
const EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/

const MALFORMED_EMAIL = 'That does not look like an email address — please check it.'

/** The fields the form asks for, in the order it writes them. */
const controlsOf = (form) => [...form.querySelectorAll('.field__control')]

/** The paragraph a field's error is written into — the one it already points at. */
const errorFor = (control) => control.ownerDocument.getElementById(control.getAttribute('aria-describedby'))

const showError = (control, message) => {
  const error = errorFor(control)
  if (!error) return
  error.textContent = message
  error.hidden = false
  control.setAttribute('aria-invalid', 'true')
}

const clearError = (control) => {
  const error = errorFor(control)
  if (!error) return
  error.textContent = ''
  error.hidden = true
  control.removeAttribute('aria-invalid')
}

/**
 * What is wrong with a field's answer, or `null` when nothing is. Whitespace
 * alone does not count as an answer, and the email field is held to a shape on
 * top of that.
 */
export function problemWith(control) {
  const answer = control.value.trim()
  if (!answer) return REQUIRED[control.name] ?? 'This field is required.'
  if (control.name === 'email' && !EMAIL.test(answer)) return MALFORMED_EMAIL
  return null
}

/**
 * Checks every field, writes the errors it finds beside them, and returns true
 * only when the form has nothing wrong with it.
 */
function validate(form) {
  let firstBad = null
  for (const control of controlsOf(form)) {
    const problem = problemWith(control)
    if (problem) {
      showError(control, problem)
      firstBad = firstBad ?? control
    } else {
      clearError(control)
    }
  }
  if (firstBad) firstBad.focus()
  return firstBad === null
}

/** The status line under the submit button, and the three things it can say. */
const statusOf = (form) => form.querySelector('.contact__status')

const say = (form, state, message) => {
  const status = statusOf(form)
  status.textContent = message
  status.dataset.state = state
  status.hidden = false
}

const sayNothing = (form) => {
  const status = statusOf(form)
  status.textContent = ''
  delete status.dataset.state
  status.hidden = true
}

/** The four answers, trimmed, keyed by the name each field submits under. */
const answersIn = (form) =>
  Object.fromEntries(controlsOf(form).map((control) => [control.name, control.value.trim()]))

/** Wires one contact form up. Exported so the page is not the only way in. */
export function wireContactForm(form, { submit = submitEnquiry } = {}) {
  const button = form.querySelector('.contact__submit')
  const resting = button.textContent
  // One submission at a time: a second click while the first is in flight is
  // dropped rather than queued, so a double click sends one enquiry.
  let inFlight = false

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    if (inFlight) return
    sayNothing(form)
    if (!validate(form)) return

    inFlight = true
    button.disabled = true
    button.textContent = SENDING
    try {
      const { via } = await submit(answersIn(form), { endpoint: form.dataset.endpoint ?? '' })
      say(form, 'success', CONFIRMATION[via] ?? CONFIRMATION.endpoint)
    } catch {
      say(form, 'error', FAILED)
    } finally {
      inFlight = false
      button.disabled = false
      button.textContent = resting
    }
  })

  // An error clears as soon as the answer it complains about is given, so a
  // visitor fixing one field at a time sees the list shorten as they go.
  for (const control of controlsOf(form)) {
    control.addEventListener('input', () => {
      if (!problemWith(control)) clearError(control)
    })
  }

  return form
}

const form = document.querySelector('#contact-form')
if (form) wireContactForm(form)
