// Tests for the Contact Us page, its form, and the three entry points that now
// all lead to it.
// Plan: specs/39dd4128-7a8a-4564-8c49-613c9f754d8b/plan.md
// One describe per numbered task in that plan.
import { after, before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { contrastRatio, openPage, parseColor, serveStatic } from './browser.mjs'
import {
  CONTACT_EMAIL,
  CONTACT_ENTRY_POINTS,
  CONTACT_FIELDS,
  CONTACT_HEADING,
  CONTACT_NOTES,
  CONTACT_PAGE,
  CONTACT_SCRIPTS,
  CONTACT_TITLE,
  HOMEPAGE,
  LINKEDIN_URL,
  MIN_CONTRAST,
  htmlFiles,
  linksIn,
  read,
  repoRoot,
  textOf,
} from './site.mjs'

/** Serves the repo and opens one headless-Chrome page on the contact page. */
const servedInBrowser = (file = CONTACT_PAGE) => {
  const handle = {}
  before(async () => {
    handle.server = await serveStatic(repoRoot)
    handle.origin = handle.server.origin
    handle.url = `${handle.server.origin}/${file}`
    handle.page = await openPage(handle.url)
  })
  after(async () => {
    await handle.page?.close()
    await handle.server?.close()
  })
  return handle
}

/** A fresh load of the page under test; the query keeps every navigation a cross-document one. */
let loads = 0
const freshLoad = async (site, width = 1280, height = 900) => {
  await site.page.setViewport(width, height)
  await site.page.goto(`${site.url}?load=${++loads}`)
}

/** The endpoint the tests point the form at, so nothing they do can leave the machine. */
const STUB_ENDPOINT = 'https://example.invalid/enquiries'

/**
 * Points the form at `STUB_ENDPOINT` and puts a recording `fetch` behind it.
 * Calls land in `window.__calls`; each one waits until `window.__settle` is
 * called, so a submission can be inspected mid-flight.
 */
const stubEndpoint = (page, { endpoint = STUB_ENDPOINT } = {}) =>
  page.evaluate(`
    document.querySelector('#contact-form').dataset.endpoint = ${JSON.stringify(endpoint)}
    window.__calls = []
    window.__settle = null
    window.fetch = (url, init) => {
      window.__calls.push({ url: String(url), method: init?.method, headers: init?.headers, body: init?.body })
      return new Promise((resolve, reject) => {
        window.__settle = ({ ok = true, status = 200, error = null }) =>
          error ? reject(new Error(error)) : resolve({ ok, status, json: async () => ({}) })
      })
    }
  `)

/** Fills the form with valid answers, as a visitor would. */
const VALID = {
  fullName: 'Ada Lovelace',
  email: 'ada@example.com',
  enquiry: 'New project',
  details: 'We have a scheduling service that falls over every month end.',
}

const fillValid = async (page, overrides = {}) => {
  for (const [name, value] of Object.entries({ ...VALID, ...overrides })) {
    if (value) await page.type(`#contact-form [name="${name}"]`, value)
  }
}

/** Clicks the submit button and lets the handler run. */
const submitForm = (page) =>
  page.evaluate(`
    document.querySelector('#contact-form .contact__submit').click()
    return new Promise((resolve) => setTimeout(resolve, 0))
  `)

/** Every field's value, error message and validity, keyed by field name. */
const FIELD_STATE = `
  return Object.fromEntries([...document.querySelectorAll('#contact-form .field')].map((field) => {
    const control = field.querySelector('input, textarea')
    const described = control.getAttribute('aria-describedby')
    const error = described ? document.getElementById(described) : null
    return [control.name, {
      value: control.value,
      invalid: control.getAttribute('aria-invalid'),
      error: error && !error.hidden ? error.textContent.replace(/\\s+/g, ' ').trim() : null,
      errorShown: Boolean(error) && !error.hidden && error.getClientRects().length > 0,
    }]
  }))
`

describe('Contact task 1: the page itself', () => {
  const site = servedInBrowser()

  it('is served at its own URL, titled and headed as the Contact Us page', async () => {
    await freshLoad(site)
    const served = await site.page.evaluate(`
      return {
        title: document.title,
        heading: document.querySelector('main h1').textContent.replace(/\\s+/g, ' ').trim(),
        status: document.querySelector('main') !== null,
      }
    `)

    assert.equal(served.title, CONTACT_TITLE)
    assert.equal(served.heading, CONTACT_HEADING)
    assert.ok(served.status, `${CONTACT_PAGE} rendered no <main>`)
  })

  it('introduces every one of the four fields by the label the spec names', async () => {
    const labels = await site.page.evaluate(`
      return [...document.querySelectorAll('#contact-form label')].map((el) => el.textContent.replace(/\\s+/g, ' ').trim())
    `)

    assert.deepEqual(labels, CONTACT_FIELDS.map((field) => field.label))
  })

  it('offers one submit button, inside the form', async () => {
    const buttons = await site.page.evaluate(`
      return [...document.querySelectorAll('#contact-form button, #contact-form input[type="submit"]')]
        .map((el) => ({ tag: el.tagName.toLowerCase(), type: el.type, label: el.textContent.trim() }))
    `)

    assert.equal(buttons.length, 1, `${CONTACT_PAGE} has ${buttons.length} buttons in the form`)
    assert.equal(buttons[0].type, 'submit')
    assert.ok(buttons[0].label.length > 0, 'the submit button carries no label')
  })

  it('links the LinkedIn company page below the form, in a tab of its own', async () => {
    const link = await site.page.evaluate(`
      const form = document.querySelector('#contact-form')
      const link = document.querySelector('a[href="${LINKEDIN_URL}"]')
      if (!link) return null
      return {
        href: link.getAttribute('href'),
        target: link.getAttribute('target'),
        rel: link.getAttribute('rel'),
        label: link.textContent.replace(/\\s+/g, ' ').trim(),
        belowTheForm: form.compareDocumentPosition(link) === Node.DOCUMENT_POSITION_FOLLOWING,
        visible: link.getClientRects().length > 0,
      }
    `)

    assert.ok(link, `${CONTACT_PAGE} carries no link to ${LINKEDIN_URL}`)
    assert.equal(link.href, LINKEDIN_URL)
    assert.equal(link.target, '_blank')
    assert.match(link.rel ?? '', /noopener/, 'the new-tab link does not disown its opener')
    assert.ok(link.label.length > 0, 'the LinkedIn link has no visible text')
    assert.ok(link.visible, 'the LinkedIn link is not rendered')
    assert.ok(link.belowTheForm, 'the LinkedIn link sits above the form rather than below it')
  })

  it('reaches the page directly, with no link clicked and nothing logged', async () => {
    const { page } = site

    assert.deepEqual(page.consoleMessages, [], 'the page logged console errors or warnings')
    assert.deepEqual(page.pageErrors, [], 'the page raised errors')
    assert.deepEqual(page.failedRequests, [], 'the page produced failed requests')
  })

  it('carries the site chrome, and none of the home page it is not', async () => {
    const html = await read(CONTACT_PAGE)

    assert.match(html, /^<!DOCTYPE html>\n<html lang="en">/, `${CONTACT_PAGE} lacks a doctype and language`)
    assert.match(html, /<link[^>]*rel="stylesheet"[^>]*href="styles\/main\.css"/, 'the page is unstyled')
    assert.ok(!html.includes('Softpapaya Services'), 'the page carries the home page title')
    assert.ok(!html.includes('WHAT WE DO.'), 'the page carries the hero statement')
    assert.ok(textOf(html).length > 0, `${CONTACT_PAGE} is empty`)
  })
})

describe('Contact task 2: the four fields take what is typed into them', () => {
  const site = servedInBrowser()

  it('builds each field from the control its content calls for, named and labelled', async () => {
    await freshLoad(site)
    const fields = await site.page.evaluate(`
      return [...document.querySelectorAll('#contact-form .field')].map((field) => {
        const label = field.querySelector('label')
        const control = field.querySelector('input, textarea, select')
        return {
          control: control.tagName.toLowerCase(),
          type: control.tagName.toLowerCase() === 'input' ? control.getAttribute('type') : null,
          name: control.getAttribute('name'),
          label: label.textContent.replace(/\\s+/g, ' ').trim(),
          labelFor: label.getAttribute('for'),
          id: control.id,
          required: control.hasAttribute('required'),
        }
      })
    `)

    assert.equal(fields.length, CONTACT_FIELDS.length, `the form has ${fields.length} fields`)
    for (const [i, expected] of CONTACT_FIELDS.entries()) {
      const field = fields[i]
      assert.equal(field.label, expected.label)
      assert.equal(field.control, expected.control, `"${expected.label}" is a <${field.control}>`)
      assert.equal(field.type, expected.type, `"${expected.label}" is typed ${field.type}`)
      assert.equal(field.name, expected.name)
      assert.equal(field.labelFor, field.id, `"${expected.label}"'s label points at ${field.labelFor}`)
      assert.ok(field.required, `"${expected.label}" is not required`)
    }
  })

  it('keeps every character typed into it, field by field', async () => {
    await freshLoad(site)
    const typed = {
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      enquiry: 'New project',
      details: 'A first line.\nA second line.\n\nAnd a fourth.',
    }

    for (const [name, value] of Object.entries(typed)) {
      await site.page.type(`#contact-form [name="${name}"]`, value)
    }
    const values = await site.page.evaluate(`
      return Object.fromEntries(new FormData(document.querySelector('#contact-form')))
    `)

    assert.deepEqual(values, typed)
  })

  it('takes more than one line in the details field, and one line only in the rest', async () => {
    await freshLoad(site)
    await site.page.type('#contact-details', 'One.\nTwo.\nThree.')
    await site.page.type('#contact-full-name', 'One.\nTwo.')
    const state = await site.page.evaluate(`
      return {
        detailsLines: document.querySelector('#contact-details').value.split('\\n').length,
        nameLines: document.querySelector('#contact-full-name').value.split('\\n').length,
      }
    `)

    assert.equal(state.detailsLines, 3, 'the details field collapsed its line breaks')
    assert.equal(state.nameLines, 1, 'a single-line field took a line break')
  })
})

describe('Contact task 3: nothing leaves with a field left empty', () => {
  const site = servedInBrowser()

  it('marks every empty field, and sends nothing', async () => {
    await freshLoad(site)
    await stubEndpoint(site.page)
    await submitForm(site.page)
    const fields = await site.page.evaluate(FIELD_STATE)
    const calls = await site.page.evaluate('return window.__calls')

    assert.deepEqual(calls, [], 'an incomplete form was submitted anyway')
    for (const { name, label } of CONTACT_FIELDS) {
      assert.ok(fields[name].error, `"${label}" was left empty without an error`)
      assert.ok(fields[name].errorShown, `"${label}"'s error is not rendered`)
      assert.equal(fields[name].invalid, 'true', `"${label}" is not marked invalid`)
    }
  })

  it('names only the fields actually left empty, and keeps what was typed into the rest', async () => {
    await freshLoad(site)
    await stubEndpoint(site.page)
    await fillValid(site.page, { email: '', details: '' })
    await submitForm(site.page)
    const fields = await site.page.evaluate(FIELD_STATE)

    assert.equal(fields.fullName.value, VALID.fullName, 'the name typed in was lost')
    assert.equal(fields.enquiry.value, VALID.enquiry, 'the enquiry typed in was lost')
    assert.equal(fields.fullName.error, null, 'a filled-in field was marked empty')
    assert.equal(fields.enquiry.error, null, 'a filled-in field was marked empty')
    assert.ok(fields.email.error, 'the empty email field was not marked')
    assert.ok(fields.details.error, 'the empty details field was not marked')
  })

  it('treats whitespace as empty, so a space is not an answer', async () => {
    await freshLoad(site)
    await stubEndpoint(site.page)
    await fillValid(site.page, { fullName: '   ' })
    await submitForm(site.page)
    const fields = await site.page.evaluate(FIELD_STATE)
    const calls = await site.page.evaluate('return window.__calls')

    assert.ok(fields.fullName.error, 'a field holding only spaces passed as filled in')
    assert.deepEqual(calls, [], 'a form holding only spaces was submitted')
  })

  it('clears a field\'s error once it is filled in, one field at a time', async () => {
    await freshLoad(site)
    await stubEndpoint(site.page)
    await submitForm(site.page)
    await site.page.type('#contact-full-name', VALID.fullName)
    const afterFirst = await site.page.evaluate(FIELD_STATE)
    await site.page.type('#contact-enquiry', VALID.enquiry)
    const afterSecond = await site.page.evaluate(FIELD_STATE)

    assert.equal(afterFirst.fullName.error, null, 'the name error survived the name being typed in')
    assert.equal(afterFirst.fullName.invalid, null, 'the name field is still marked invalid')
    assert.ok(afterFirst.enquiry.error, 'an untouched field lost its error too')
    assert.equal(afterSecond.enquiry.error, null, 'the enquiry error survived the enquiry being typed in')
    assert.ok(afterSecond.details.error, 'the remaining errors were cleared as well')
  })

  it('leaves the page where it is rather than navigating away', async () => {
    await freshLoad(site)
    await stubEndpoint(site.page)
    await submitForm(site.page)
    const state = await site.page.evaluate(`
      return { search: location.search, forms: document.querySelectorAll('#contact-form').length }
    `)

    assert.match(state.search, /^\?load=/, 'the form navigated on an invalid submit')
    assert.equal(state.forms, 1)
  })
})

describe('Contact task 4: the email address has to look like one', () => {
  const site = servedInBrowser()

  /** Addresses a visitor could plausibly type that are not addresses. */
  const MALFORMED = ['abc', 'ada@', '@example.com', 'ada example.com', 'ada@example', 'ada@@example.com']

  /** Shapes a real address takes, which must not be turned away. */
  const WELL_FORMED = ['ada@example.com', 'ada.lovelace+work@sub.example.co.uk', "o'hara@example.org"]

  for (const email of MALFORMED) {
    it(`turns "${email}" away with an error of its own, and sends nothing`, async () => {
      await freshLoad(site)
      await stubEndpoint(site.page)
      await fillValid(site.page, { email })
      await submitForm(site.page)
      const fields = await site.page.evaluate(FIELD_STATE)
      const calls = await site.page.evaluate('return window.__calls')

      assert.deepEqual(calls, [], `"${email}" was submitted`)
      assert.ok(fields.email.error, `"${email}" passed as an email address`)
      assert.match(fields.email.error, /email/i, 'the error does not say what is wrong with it')
      assert.equal(fields.email.value, email, 'the address typed in was lost')
      for (const name of ['fullName', 'enquiry', 'details']) {
        assert.equal(fields[name].error, null, `the ${name} field was flagged over a malformed email`)
      }
    })
  }

  it('says something different about a malformed address than about an empty one', async () => {
    await freshLoad(site)
    await stubEndpoint(site.page)
    await submitForm(site.page)
    const empty = (await site.page.evaluate(FIELD_STATE)).email.error
    await site.page.type('#contact-email', 'abc')
    await submitForm(site.page)
    const malformed = (await site.page.evaluate(FIELD_STATE)).email.error

    assert.ok(empty && malformed)
    assert.notEqual(malformed, empty, 'an empty address and a malformed one read the same')
  })

  for (const email of WELL_FORMED) {
    it(`lets "${email}" through the format check`, async () => {
      await freshLoad(site)
      await stubEndpoint(site.page)
      await fillValid(site.page, { email })
      await submitForm(site.page)
      const fields = await site.page.evaluate(FIELD_STATE)

      assert.equal(fields.email.error, null, `"${email}" was turned away`)
    })
  }
})

/** The status region's message, the state it is in, and the submit button beside it. */
const SUBMIT_STATE = `
  const status = document.querySelector('#contact-status')
  const button = document.querySelector('#contact-form .contact__submit')
  return {
    message: status.hidden ? null : status.textContent.replace(/\\s+/g, ' ').trim(),
    state: status.dataset.state ?? null,
    shown: !status.hidden && status.getClientRects().length > 0,
    disabled: button.disabled,
    label: button.textContent.replace(/\\s+/g, ' ').trim(),
  }
`

/** Settles the in-flight stub call and lets the handler catch up. */
const settle = (page, outcome = {}) =>
  page.evaluate(`
    window.__settle(${JSON.stringify(outcome)})
    return new Promise((resolve) => setTimeout(resolve, 0))
  `)

describe('Contact task 5: submitting, and what the visitor is told', () => {
  const site = servedInBrowser()

  it('says nothing at all before anything has been submitted', async () => {
    await freshLoad(site)
    await stubEndpoint(site.page)
    const state = await site.page.evaluate(SUBMIT_STATE)

    assert.equal(state.message, null, 'the page greets the visitor with a submission message')
    assert.equal(state.shown, false)
    assert.equal(state.disabled, false, 'the submit button starts out disabled')
  })

  it('disables the submit button for as long as the enquiry is in flight', async () => {
    await freshLoad(site)
    await stubEndpoint(site.page)
    await fillValid(site.page)
    await submitForm(site.page)
    const inFlight = await site.page.evaluate(SUBMIT_STATE)
    await settle(site.page, { ok: true })
    const afterwards = await site.page.evaluate(SUBMIT_STATE)

    assert.equal(inFlight.disabled, true, 'the submit button stayed live while the enquiry was in flight')
    assert.notEqual(inFlight.label, afterwards.label, 'the button gave no sign it was working')
    assert.equal(afterwards.disabled, false, 'the submit button never came back')
  })

  it('confirms the enquiry was received when the submission succeeds', async () => {
    await freshLoad(site)
    await stubEndpoint(site.page)
    await fillValid(site.page)
    await submitForm(site.page)
    await settle(site.page, { ok: true })
    const state = await site.page.evaluate(SUBMIT_STATE)

    assert.equal(state.state, 'success', `the page reports ${state.state} after a successful submission`)
    assert.ok(state.shown, 'the confirmation is not rendered')
    assert.match(state.message, /thank|received|got it/i, `the confirmation reads "${state.message}"`)
  })

  it('says the submission failed, and offers LinkedIn instead, when the call rejects', async () => {
    await freshLoad(site)
    await stubEndpoint(site.page)
    await fillValid(site.page)
    await submitForm(site.page)
    await settle(site.page, { error: 'the network is down' })
    const state = await site.page.evaluate(SUBMIT_STATE)

    assert.equal(state.state, 'error', `the page reports ${state.state} after a failed submission`)
    assert.ok(state.shown, 'the failure is not rendered')
    assert.match(state.message, /again/i, 'the failure does not invite a retry')
    assert.match(state.message, /LinkedIn/i, 'the failure does not offer the LinkedIn link instead')
    assert.equal(state.disabled, false, 'the submit button is left disabled, so the retry is impossible')
  })

  it('treats a response the server refused as a failure too', async () => {
    await freshLoad(site)
    await stubEndpoint(site.page)
    await fillValid(site.page)
    await submitForm(site.page)
    await settle(site.page, { ok: false, status: 500 })
    const state = await site.page.evaluate(SUBMIT_STATE)

    assert.equal(state.state, 'error', 'a 500 was taken as a success')
    assert.match(state.message, /LinkedIn/i)
  })

  it('keeps the visitor\'s answers through a failure, so the retry is one click', async () => {
    await freshLoad(site)
    await stubEndpoint(site.page)
    await fillValid(site.page)
    await submitForm(site.page)
    await settle(site.page, { error: 'the network is down' })
    const fields = await site.page.evaluate(FIELD_STATE)

    for (const [name, value] of Object.entries(VALID)) {
      assert.equal(fields[name].value, value, `the ${name} field was emptied by the failure`)
    }
  })

  it('clears the last failure when the form is submitted again', async () => {
    await freshLoad(site)
    await stubEndpoint(site.page)
    await fillValid(site.page)
    await submitForm(site.page)
    await settle(site.page, { error: 'the network is down' })
    await submitForm(site.page)
    const retrying = await site.page.evaluate(SUBMIT_STATE)
    await settle(site.page, { ok: true })
    const settled = await site.page.evaluate(SUBMIT_STATE)

    assert.equal(retrying.message, null, 'the failed attempt is still on screen during the retry')
    assert.equal(settled.state, 'success')
  })
})

/**
 * Replaces the step that leaves the page with one that records where it was
 * sent, so the shipped fallback can be exercised without a mail client.
 */
const watchHandoff = (page) =>
  page.evaluate(`
    window.__handoff = null
    return import('/scripts/contact-api.js').then((api) => {
      api.handoff.go = (url) => { window.__handoff = url }
    })
  `)

describe('Contact task 6: where a valid enquiry actually goes', () => {
  const site = servedInBrowser()

  it('makes exactly one call, to the endpoint the form names', async () => {
    await freshLoad(site)
    await stubEndpoint(site.page)
    await fillValid(site.page)
    await submitForm(site.page)
    const calls = await site.page.evaluate('return window.__calls')

    assert.equal(calls.length, 1, `a valid submission made ${calls.length} calls`)
    assert.equal(calls[0].url, STUB_ENDPOINT)
    assert.equal(calls[0].method, 'POST')
    assert.match(JSON.stringify(calls[0].headers), /application\/json/i, 'the enquiry is not sent as JSON')
  })

  it('maps all four answers onto the call, and sends nothing else', async () => {
    await freshLoad(site)
    await stubEndpoint(site.page)
    await fillValid(site.page)
    await submitForm(site.page)
    const [call] = await site.page.evaluate('return window.__calls')

    assert.deepEqual(JSON.parse(call.body), VALID)
  })

  it('trims the answers on the way out, so a stray space is not sent', async () => {
    await freshLoad(site)
    await stubEndpoint(site.page)
    await fillValid(site.page, { fullName: '  Ada Lovelace  ' })
    await submitForm(site.page)
    const [call] = await site.page.evaluate('return window.__calls')

    assert.equal(JSON.parse(call.body).fullName, VALID.fullName)
  })

  it('sends one enquiry however fast the button is clicked twice', async () => {
    await freshLoad(site)
    await stubEndpoint(site.page)
    await fillValid(site.page)
    await site.page.evaluate(`
      const button = document.querySelector('#contact-form .contact__submit')
      button.click()
      button.click()
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      return new Promise((resolve) => setTimeout(resolve, 0))
    `)
    const calls = await site.page.evaluate('return window.__calls')

    assert.equal(calls.length, 1, `three clicks in flight sent ${calls.length} enquiries`)
  })

  it('ships with no endpoint configured, and hands the enquiry to the site\'s own address instead', async () => {
    await freshLoad(site)
    await watchHandoff(site.page)
    await fillValid(site.page)
    await submitForm(site.page)
    const state = await site.page.evaluate(`
      return { handoff: window.__handoff, endpoint: document.querySelector('#contact-form').dataset.endpoint }
    `)

    assert.equal(state.endpoint, '', `the form ships pointing at "${state.endpoint}"`)
    assert.ok(state.handoff, 'a valid enquiry went nowhere at all')
    assert.match(state.handoff, new RegExp(`^mailto:${CONTACT_EMAIL}\\?`), `the enquiry went to ${state.handoff}`)
    for (const value of Object.values(VALID)) {
      assert.ok(
        decodeURIComponent(state.handoff).includes(value),
        `the enquiry handed over does not carry "${value}"`,
      )
    }
  })

  it('confirms the hand-off as a hand-off, not as an enquiry already filed', async () => {
    await freshLoad(site)
    await watchHandoff(site.page)
    await fillValid(site.page)
    await submitForm(site.page)
    const state = await site.page.evaluate(SUBMIT_STATE)

    assert.equal(state.state, 'success')
    assert.match(state.message, /email app/i, `the confirmation reads "${state.message}"`)
  })

  it('writes the chosen mechanism, and the gap it leaves, into the notes', async () => {
    const notes = await read(CONTACT_NOTES)

    assert.match(notes, /data-endpoint/, `${CONTACT_NOTES} does not say where the destination is configured`)
    assert.match(notes, new RegExp(CONTACT_SCRIPTS[0]), `${CONTACT_NOTES} does not name the submission layer`)
    assert.match(notes, /Flagged gaps/, `${CONTACT_NOTES} flags nothing`)
    assert.match(notes, new RegExp(CONTACT_EMAIL), `${CONTACT_NOTES} does not record the fallback address`)
  })
})

/** The home page, where all three entry points live. */
const homePage = () => servedInBrowser(HOMEPAGE)

/**
 * Clicks the element at `selector` and waits for the page it navigates to. The
 * execution context goes away mid-navigation, hence the retries.
 */
const clickThrough = async (page, selector, expectedPath) => {
  await page.evaluate(`
    document.querySelector(${JSON.stringify(selector)}).click()
    return null
  `)
  for (let i = 0; i < 100; i++) {
    try {
      const state = await page.evaluate('return { path: location.pathname, ready: document.readyState }')
      if (state.path === expectedPath && state.ready === 'complete') return
    } catch {
      // Mid-navigation; try again.
    }
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
  assert.fail(`clicking ${selector} never landed on ${expectedPath}`)
}

/** An entry point as the home page renders it: where it points, and how it looks. */
const entryPoint = (selector) => `
  const el = document.querySelector(${JSON.stringify(selector)})
  if (!el) return null
  const style = getComputedStyle(el)
  const box = el.getBoundingClientRect()
  return {
    href: el.getAttribute('href'),
    resolved: el.href,
    label: el.textContent.replace(/\\s+/g, ' ').trim(),
    classes: el.className,
    index: [...el.parentElement.parentElement.children].indexOf(el.parentElement),
    box: { top: Math.round(box.top), left: Math.round(box.left), width: Math.round(box.width) },
    paint: [style.color, style.backgroundColor, style.fontSize, style.fontWeight, style.letterSpacing].join(' '),
  }
`

describe('Contact task 7: the "Contact" nav link', () => {
  const site = homePage()

  it('points at the Contact Us page', async () => {
    await freshLoad(site)
    const link = await site.page.evaluate(entryPoint(CONTACT_ENTRY_POINTS[0].selector))

    assert.ok(link, 'the nav has no last entry')
    assert.equal(link.label, 'Contact', 'the last nav entry is no longer "Contact"')
    assert.equal(link.href, CONTACT_PAGE)
  })

  it('is worded, placed and painted exactly as it was', async () => {
    const nav = await site.page.evaluate(`
      return [...document.querySelectorAll('.masthead__links li a')].map((a) => {
        const style = getComputedStyle(a)
        return {
          label: a.textContent.trim(),
          paint: [style.color, style.backgroundColor, style.fontSize, style.fontWeight, style.textDecorationLine].join(' '),
        }
      })
    `)

    assert.deepEqual(
      nav.map((item) => item.label),
      ['About', 'Services', 'Values', 'Team', 'Case Studies', 'Careers', 'Blog', 'Contact'],
      'the nav has been reordered or reworded',
    )
    assert.equal(new Set(nav.map((item) => item.paint)).size, 1, 'the "Contact" tab no longer looks like its siblings')
  })

  it('leaves the invitation band it used to jump to exactly where it was', async () => {
    const band = await site.page.evaluate(`
      const band = document.querySelector('#contact')
      return {
        heading: band.querySelector('h2').textContent.trim(),
        last: band === [...document.querySelectorAll('main > section')].at(-1),
      }
    `)

    assert.equal(band.heading, 'HAVE A PROJECT TO DISCUSS?', 'the invitation band lost its heading')
    assert.ok(band.last, 'the invitation band is no longer the last band of the page')
  })
})

describe('Contact task 8: the "Talk to us" button', () => {
  const site = homePage()

  it('points at the Contact Us page', async () => {
    await freshLoad(site)
    const cta = await site.page.evaluate(entryPoint(CONTACT_ENTRY_POINTS[1].selector))

    assert.ok(cta, 'the header has no call to action')
    assert.equal(cta.label, CONTACT_ENTRY_POINTS[1].label, 'the header button has been reworded')
    assert.equal(cta.href, CONTACT_PAGE)
  })

  it('keeps the classes, the papaya and the top-right corner it already had', async () => {
    const cta = await site.page.evaluate(`
      const el = document.querySelector('.masthead__cta')
      const header = document.querySelector('.masthead__inner')
      const style = getComputedStyle(el)
      const box = el.getBoundingClientRect()
      const bounds = header.getBoundingClientRect()
      return {
        classes: el.className,
        background: style.backgroundColor,
        color: style.color,
        fontSize: style.fontSize,
        rightmost: Math.round(bounds.right - box.right),
        withinHeader: box.top >= bounds.top - 1 && box.bottom <= bounds.bottom + 1,
      }
    `)

    assert.equal(cta.classes, 'button button--accent masthead__cta', 'the header button was restyled')
    assert.equal(cta.background, 'rgb(229, 103, 23)', `the header button is now ${cta.background}`)
    assert.ok(cta.rightmost <= 21, `the header button sits ${cta.rightmost}px from the right edge`)
    assert.ok(cta.withinHeader, 'the header button left the header')
  })
})

describe('Contact task 9: the "Start a conversation" button', () => {
  const site = homePage()

  it('points at the Contact Us page', async () => {
    await freshLoad(site)
    const button = await site.page.evaluate(entryPoint(CONTACT_ENTRY_POINTS[2].selector))

    assert.ok(button, 'the invitation band has no button')
    assert.equal(button.label, CONTACT_ENTRY_POINTS[2].label, 'the invitation button has been reworded')
    assert.equal(button.href, CONTACT_PAGE)
  })

  it('keeps the classes, the paint and the place at the foot of the page it already had', async () => {
    const button = await site.page.evaluate(`
      const el = document.querySelector('.invitation .button--large')
      const band = document.querySelector('#contact')
      const style = getComputedStyle(el)
      return {
        classes: el.className,
        background: style.backgroundColor,
        fontSize: style.fontSize,
        insideTheBand: band.contains(el),
        last: el === [...band.querySelectorAll('.container > *')].at(-1),
      }
    `)

    assert.equal(button.classes, 'button button--accent button--large', 'the invitation button was restyled')
    assert.equal(button.background, 'rgb(10, 102, 255)', `the invitation button is now ${button.background}`)
    assert.equal(button.fontSize, '15px')
    assert.ok(button.insideTheBand, 'the invitation button left the invitation band')
    assert.ok(button.last, 'the invitation button is no longer the last thing in the band')
  })
})

describe('Contact task 10: the three entry points are one destination', () => {
  const site = homePage()

  it('resolves all three to the identical URL, and to the Contact Us page', async () => {
    await freshLoad(site)
    const found = await Promise.all(
      CONTACT_ENTRY_POINTS.map(async ({ selector }) => site.page.evaluate(entryPoint(selector))),
    )

    for (const [i, { what }] of CONTACT_ENTRY_POINTS.entries()) {
      assert.ok(found[i], `${what} is not on the page`)
      assert.equal(found[i].href, CONTACT_PAGE, `${what} points at ${found[i].href}`)
    }
    assert.equal(new Set(found.map((el) => el.resolved)).size, 1, 'the three entry points resolve to different URLs')
    assert.equal(found[0].resolved, `${site.origin}/${CONTACT_PAGE}`)
  })

  it('lands on the Contact Us page from each of them in turn', async () => {
    for (const { what, selector } of CONTACT_ENTRY_POINTS) {
      await freshLoad(site)
      await clickThrough(site.page, selector, `/${CONTACT_PAGE}`)
      const arrived = await site.page.evaluate(`
        return {
          path: location.pathname,
          title: document.title,
          fields: document.querySelectorAll('#contact-form .field__control').length,
        }
      `)

      assert.equal(arrived.path, `/${CONTACT_PAGE}`, `${what} led to ${arrived.path}`)
      assert.equal(arrived.title, CONTACT_TITLE)
      assert.equal(arrived.fields, CONTACT_FIELDS.length, `${what} led to a page with ${arrived.fields} fields`)
    }
  })

  it('leaves one Contact Us page behind it, and no near-duplicate', async () => {
    const pages = await htmlFiles()
    const forms = await Promise.all(pages.map(async (file) => [file, /<form\b/i.test(await read(file))]))

    assert.deepEqual(
      forms.filter(([, hasForm]) => hasForm).map(([file]) => file),
      [CONTACT_PAGE],
      'more than one page carries a contact form',
    )
  })

  it('points nothing else on the home page at the contact page, so nothing else moved', async () => {
    const html = await read(HOMEPAGE)
    const pointing = linksIn(html).filter(({ href }) => href === CONTACT_PAGE)

    assert.deepEqual(
      pointing.map(({ label }) => label),
      CONTACT_ENTRY_POINTS.map(({ label }) => label),
      'the set of links pointing at the Contact Us page is not the three the spec names',
    )
  })
})

/** The widths the page is checked at: the spec's mobile and desktop, and the breakpoints between. */
const WIDTHS = [375, 414, 768, 1024, 1280]

/** Every part of the form measured as the browser lays it out. */
const LAYOUT = `
  const box = (el) => {
    const r = el.getBoundingClientRect()
    return { top: Math.round(r.top), left: Math.round(r.left), right: Math.round(r.right),
             bottom: Math.round(r.bottom), width: Math.round(r.width), height: Math.round(r.height) }
  }
  const form = document.querySelector('#contact-form')
  return {
    viewport: window.innerWidth,
    overflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
    container: box(form.closest('.container')),
    form: box(form),
    submit: box(form.querySelector('.contact__submit')),
    linkedin: box(document.querySelector('.contact__linkedin a')),
    fields: [...form.querySelectorAll('.field')].map((field) => ({
      name: field.querySelector('.field__control').name,
      label: box(field.querySelector('label')),
      control: box(field.querySelector('.field__control')),
    })),
  }
`

/**
 * Every text-bearing element's colour against the background it sits on, bar
 * the header's call to action — white on papaya is 3.34:1, which the home page
 * flags and carries deliberately; this page only repeats that header.
 */
const TEXT_ON_BACKGROUND = `
  const opaque = (colour) => {
    const [, , , a = '1'] = colour.match(/[\\d.]+/g) ?? []
    return Number(a) > 0
  }
  return [...document.querySelectorAll('body, body *')]
    .filter((el) => !el.matches('.masthead__cta'))
    .filter((el) => el.getClientRects().length > 0)
    .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))
    .map((el) => {
      let node = el
      let background = 'rgba(0, 0, 0, 0)'
      while (node) {
        const candidate = getComputedStyle(node).backgroundColor
        if (opaque(candidate)) { background = candidate; break }
        node = node.parentElement
      }
      const style = getComputedStyle(el)
      return { text: el.textContent.replace(/\\s+/g, ' ').trim().slice(0, 60), color: style.color, background }
    })
`

describe('Contact task 11: the page holds up from a phone to a desktop', () => {
  const site = servedInBrowser()

  for (const width of WIDTHS) {
    it(`lays the form out inside the page at ${width}px`, async () => {
      await freshLoad(site, width)
      const layout = await site.page.evaluate(LAYOUT)

      assert.equal(layout.overflow, 0, `the page scrolls sideways by ${layout.overflow}px at ${width}px`)
      for (const field of layout.fields) {
        assert.ok(field.control.width > 0 && field.control.height > 0, `the ${field.name} field is not rendered`)
        assert.ok(
          field.control.left >= layout.container.left - 1 && field.control.right <= layout.container.right + 1,
          `the ${field.name} field runs outside the page at ${width}px`,
        )
        assert.ok(field.control.height >= 40, `the ${field.name} field is only ${field.control.height}px tall`)
        assert.ok(
          field.label.bottom <= field.control.top + 1,
          `the ${field.name} label overlaps its field at ${width}px`,
        )
      }
      assert.ok(layout.submit.height >= 40, `the submit button is ${layout.submit.height}px tall at ${width}px`)
      assert.ok(layout.submit.top >= layout.fields.at(-1).control.bottom, 'the submit button overlaps the last field')
      assert.ok(layout.linkedin.top >= layout.submit.bottom, 'the LinkedIn link overlaps the form')
      assert.ok(layout.linkedin.width > 0, `the LinkedIn link is not rendered at ${width}px`)
    })
  }

  it('stacks the fields one above another, in the order the spec lists them', async () => {
    await freshLoad(site, 375)
    const { fields } = await site.page.evaluate(LAYOUT)

    assert.deepEqual(fields.map((field) => field.name), CONTACT_FIELDS.map((field) => field.name))
    for (const [i, field] of fields.slice(1).entries()) {
      assert.ok(field.control.top >= fields[i].control.bottom, `the ${field.name} field sits beside the one above it`)
    }
  })

  it('holds the form to a readable measure on a desktop rather than the full 1200px', async () => {
    await freshLoad(site, 1280)
    const layout = await site.page.evaluate(LAYOUT)

    assert.ok(layout.form.width < layout.container.width, 'the form spans the whole container on a desktop')
    assert.ok(layout.form.width >= 420, `the form is only ${layout.form.width}px wide on a desktop`)
  })

  it('lets the form fill the width it has on a phone', async () => {
    await freshLoad(site, 375)
    const layout = await site.page.evaluate(LAYOUT)

    assert.ok(
      layout.form.width >= layout.container.width - 2 * 20,
      `the form is ${layout.form.width}px inside a ${layout.container.width}px page on a phone`,
    )
  })

  for (const width of [375, 1280]) {
    it(`keeps every line on the page legible at ${width}px, errors and all`, async () => {
      await freshLoad(site, width)
      await submitForm(site.page)
      const lines = await site.page.evaluate(TEXT_ON_BACKGROUND)

      assert.ok(lines.length > 0, 'no text found on the page')
      for (const line of lines) {
        const ratio = contrastRatio(parseColor(line.color), parseColor(line.background))
        assert.ok(ratio >= MIN_CONTRAST, `"${line.text}": ${line.color} on ${line.background} is ${ratio.toFixed(2)}:1`)
      }
    })
  }

  it('is typable at a phone width: every field takes text and the form still submits', async () => {
    await freshLoad(site, 375)
    await stubEndpoint(site.page)
    await fillValid(site.page)
    await submitForm(site.page)
    await settle(site.page, { ok: true })
    const state = await site.page.evaluate(SUBMIT_STATE)

    assert.equal(state.state, 'success', 'the form could not be completed at 375px')
  })
})
