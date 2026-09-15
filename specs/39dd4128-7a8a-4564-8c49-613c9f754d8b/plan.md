# Plan: Contact Us Page with Form and Unified Contact Navigation

Status: draft
Job: 39dd4128-7a8a-4564-8c49-613c9f754d8b
Spec: https://github.com/SimonR67/sidney/blob/main/specs/39dd4128-7a8a-4564-8c49-613c9f754d8b/spec.md

## 1. Definition of done

- A single new Contact Us page exists at one stable route (e.g. `/contact`) and renders correctly on both mobile and desktop viewports.
- The page contains a form with exactly four required fields — Full Name, Email Address, Nature of Enquiry, Details about the type of work you need help with (multi-line) — plus a submit button.
- Client-side validation blocks submission and shows inline errors when a required field is empty or the email format is invalid, preserving entered data.
- A visible LinkedIn link (https://www.linkedin.com/company/softpapaya/) appears below the form and opens in a new tab.
- Submitting a valid form shows a visible success confirmation; the submit button is disabled while a submission is in flight; a failed submission shows a clear error inviting retry or use of the LinkedIn link.
- The "Start a conversation" button, "Talk to us" button, and "Contact" nav link all navigate to the exact same Contact Us page URL, with no visual/wording/position changes to those elements themselves.
- No other existing pages, links, buttons, or styles are altered.

## 2. File map

| File | Change |
|---|---|
| src/pages/contact.* (or equivalent route file per site's routing convention, e.g. `pages/contact.tsx` / `src/routes/contact.*`) | New Contact Us page: renders the contact form, LinkedIn link, and handles submit/success/error states. |
| src/components/ContactForm.* | New reusable form component: fields, client-side validation, submit handling, inline error messages, loading/disabled state on submit. |
| src/components/ContactForm.test.* | New unit tests for validation logic and submit states. |
| src/pages/contact.test.* (or equivalent) | New test verifying the page renders the form, the four fields, and the LinkedIn link. |
| src/components/Nav*.* (existing top navigation component) | Update "Contact" link `href`/route target to the new Contact Us page URL. |
| src/components/Header*.* or wherever "Talk to us" button lives | Update "Talk to us" button's click/link target to the new Contact Us page URL, no style/copy changes. |
| src/components/Footer*.* or wherever "Start a conversation" button lives | Update "Start a conversation" button's click/link target to the new Contact Us page URL, no style/copy changes. |
| src/lib/api/contact.* (or existing form-submission utility, new if none exists) | Minimal submission handler stub (e.g. POST to an endpoint or existing form service) satisfying "submits successfully and confirms to the user"; exact backend per open question, implemented as a thin, swappable layer. |
| src/routes/index.* or router config file (if routes are centrally registered) | Register the new `/contact` route. |
| CHANGELOG or docs (optional) | Note the new page and unified contact navigation. |

Note: exact file paths/framework conventions will be confirmed against the actual repo structure at implementation time; the above reflects the intended shape of the change (one page, one form component, three link updates, one submission utility).

## 3. User journey

1. A visitor lands on any page of the site and sees "Talk to us" (top right), "Start a conversation" (bottom of site), or "Contact" (top nav) — all now point to the same Contact Us URL.
2. Clicking any of the three takes the visitor to the Contact Us page (also reachable by typing the URL directly).
3. The visitor sees a form: Full Name, Email Address, Nature of Enquiry, and a "Details about the type of work you need help with" textarea, followed by a Submit button, followed by a LinkedIn company page link.
4. If they submit with missing/invalid fields, inline errors appear next to the offending fields and their entered data remains intact; nothing is sent.
5. If they fill in all fields correctly and submit, the submit button becomes disabled/shows a loading state, then either:
   - a success confirmation appears, telling them their enquiry was received, or
   - if submission fails, a clear error message appears inviting them to retry or use the LinkedIn link instead.
6. At any point, clicking the LinkedIn link opens https://www.linkedin.com/company/softpapaya/ in a new tab without disturbing the form's current state.

## 4. Tasks

- [ ] 1. Create the Contact Us page route/component with static content (four field labels, submit button placeholder, LinkedIn link) — files: src/pages/contact.*, routing config — test: navigating to `/contact` (or chosen route) renders a page containing all four field labels, a submit button, and a LinkedIn link with correct href and `target="_blank"`.
- [ ] 2. Build the ContactForm component with the four fields wired to local state — files: src/components/ContactForm.* — test: typing into each field updates its value; textarea accepts multi-line input.
- [ ] 3. Add client-side required-field validation with inline error messages on submit attempt — files: src/components/ContactForm.* — test: submitting with any field empty shows an inline error for each empty field and does not fire the submit handler; previously entered values remain in the inputs.
- [ ] 4. Add email format validation for the Email Address field — files: src/components/ContactForm.* — test: submitting with a malformed email (e.g. "abc") shows an email-specific inline error and blocks submission; a valid email passes this check.
- [ ] 5. Implement submit handler with in-flight disabled state and success/error UI — files: src/components/ContactForm.*, src/lib/api/contact.* — test: on valid submit, submit button becomes disabled during the call; on mocked success response, a success confirmation message is shown; on mocked failure, an error message with retry/LinkedIn guidance is shown instead.
- [ ] 6. Wire the ContactForm's actual submission mechanism (chosen backend per open question, e.g. POST to an endpoint or third-party form service) — files: src/lib/api/contact.* — test: submitting a valid form triggers exactly one network/service call with the four field values correctly mapped; a second rapid click while in flight does not trigger a second call.
- [ ] 7. Update "Contact" top nav link to point to the Contact Us page URL — files: nav component — test: rendering the nav and inspecting the "Contact" link's href/route target equals the Contact Us page URL; label/position/styling unchanged (snapshot or attribute check).
- [ ] 8. Update "Talk to us" button (top right) to navigate to the Contact Us page URL — files: header component — test: rendering the header and inspecting the button's click target/href equals the Contact Us page URL; label/position/styling unchanged.
- [ ] 9. Update "Start a conversation" button (bottom of site) to navigate to the Contact Us page URL — files: footer/relevant component — test: rendering the relevant component and inspecting the button's click target/href equals the Contact Us page URL; label/position/styling unchanged.
- [ ] 10. Add a cross-check test asserting all three entry points resolve to the identical URL — files: integration test file (e.g. src/tests/contactNavigation.test.*) — test: single test renders nav, header, and footer components and asserts the three resolved hrefs/routes are strictly equal to one another and to the Contact Us page route.
- [ ] 11. Add responsive styling for the Contact Us page/form — files: contact page/component stylesheet — test: visual/style test or snapshot at mobile (e.g. 375px) and desktop (e.g. 1280px) viewport widths showing form fields remain usable/stacked appropriately (manual or automated viewport test per repo's existing testing conventions).

## 5. Test plan

- Run all per-task unit/component tests above together to confirm no regressions between tasks (e.g. validation still works after wiring the real submission mechanism).
- End-to-end smoke test: from the homepage, click each of the three entry points ("Contact" nav, "Talk to us", "Start a conversation") in separate runs and confirm each lands on the same Contact Us URL.
- End-to-end happy path: visit the Contact Us page directly by URL, fill all four fields with valid data, submit, and confirm the success message appears and the submit button was disabled during the request.
- End-to-end error path: submit with fields empty, confirm inline errors appear per field and no request is sent; correct one field at a time and confirm errors clear appropriately; submit with a malformed email and confirm the email-specific error appears.
- End-to-end failure path: mock/force the submission backend to fail and confirm the failure message and LinkedIn fallback guidance are shown, with no silent failure.
- Cross-viewport check: verify the Contact Us page and form are usable (no overlapping/clipped elements, fields reachable and typable) at a mobile width and a desktop width.
- Regression check: spot-check a handful of other existing pages/links unrelated to this change (e.g. homepage, other nav items) to confirm nothing else was altered.

## 6. Out of scope (carried from spec)

- Backend processing beyond a basic working submission (no CRM/ticketing integration, no autoresponder emails) unless trivially supported by existing infrastructure.
- Spam protection (CAPTCHA, honeypot, rate limiting).
- Any redesign of overall site navigation, header, or footer beyond retargeting the three specified elements.
- Any change to the visual style, wording, or position of the "Start a conversation" button, "Talk to us" button, or "Contact" nav link — only their destination changes.
- Additional contact methods (phone, address, live chat, other social links) beyond the form and the single LinkedIn link.
- Localization/translation of the new page.
- Analytics/tracking setup for form submissions.
- Editing or removing any other existing pages, buttons, or links not named in this spec.
- Confirmation/thank-you email to the submitter, unless trivially available from existing infrastructure.