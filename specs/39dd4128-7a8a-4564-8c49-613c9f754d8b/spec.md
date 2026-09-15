   # Spec: Contact Us Page with Form and Unified Contact Navigation

Status: draft
Job: 39dd4128-7a8a-4564-8c49-613c9f754d8b
Target repo: SimonR67/sidney
Supersedes (partially): current behavior of the "Start a conversation" button, "Talk to us" button, and "Contact" nav link (whatever destinations/actions they currently point to, e.g. mailto links, external links, or no-ops)

## 1. What should change and why

The site needs a dedicated "Contact Us" page containing a contact form, and the three existing entry points that imply "contact" functionality ("Start a conversation" button, "Talk to us" button, "Contact" nav link) should all be unified to point to this single new page instead of whatever they currently do.

Problem this solves: currently there are (at least) three different UI elements that suggest contacting the company, but they don't lead to a consistent, dedicated contact experience. This creates confusion and likely loses leads. Centralizing on one Contact Us page with a proper form gives visitors a single, clear way to reach out and gives the business a consistent enquiry format to work from.

Interpretation of ambiguous points:
- The request lists four form fields plus a LinkedIn link, but doesn't specify field types precisely. Interpretation: "Full Name" and "Email Address" are single-line text inputs; "Nature of Enquiry" is a short field (interpreted as a single-line text input or dropdown — see Open Questions); "Details about the type of work you need help with" is a multi-line textarea.
- The request doesn't specify what happens on form submission (e.g., email delivery, database storage, third-party form service). This spec treats the actual submission handling as in-scope only at the level of "form submits successfully and confirms to the user"; the specific backend/delivery mechanism is flagged as an open question.
- "Bottom of the contact form" for the LinkedIn link is interpreted literally: the link appears after the form fields/submit button, on the same page.

## 2. Scope

- A new, dedicated "Contact Us" page on the website, reachable via its own URL/route.
- A contact form on that page with exactly these fields:
  1. Full Name (required, single-line text)
  2. Email Address (required, single-line text, validated as an email format)
  3. Nature of Enquiry (required, single-line text or short selectable field)
  4. Details about the type of work you need help with (required, multi-line textarea)
- A submit action/button for the form.
- Below the form (bottom of the contact form section), a visible link to the LinkedIn company page: https://www.linkedin.com/company/softpapaya/ — opens in a new tab.
- Basic client-side validation for required fields and email format.
- Update the "Start a conversation" button (bottom of the website) so it navigates to the new Contact Us page.
- Update the "Talk to us" button (top right of the website) so it navigates to the new Contact Us page.
- Update the "Contact" link in the top navigation menu so it navigates to the new Contact Us page.
- All three elements must point to the exact same page/URL — no duplicate or near-duplicate contact pages.
- Basic responsive styling consistent with the rest of the site so the page and form are usable on mobile and desktop.

## 3. Out of scope

- Backend processing details beyond a basic working submission (e.g., CRM integration, ticketing system integration, autoresponder emails) unless already trivially supported by existing site infrastructure — the specific mechanism is an open question below, not something this spec commits to designing.
- Spam protection mechanisms (e.g., CAPTCHA, honeypot fields, rate limiting) — not requested, not included.
- Any redesign of the overall site navigation, header, or footer beyond retargeting the three specified elements.
- Changing the visual style, wording, or position of the "Start a conversation" button, "Talk to us" button, or "Contact" nav link — only their link destination/behavior changes.
- Adding contact methods other than the form and the single LinkedIn link (e.g., phone number, physical address, live chat, additional social media links).
- Localization/translation of the new page.
- Analytics/tracking setup for form submissions.
- Editing or removing any other existing pages, buttons, or links not named in this request.
- A confirmation/thank-you email being sent to the person who submitted the form (unless this is trivially part of the existing form infrastructure already in the repo).

## 4. Edge cases and error behavior

- **Invalid/missing input:** If a required field is empty or the Email Address field is not a valid email format on submit, the form should not submit and should show a clear inline error message next to the offending field(s); the user's already-entered data should be preserved.
- **Submission dependency unavailable:** If the form's submission mechanism (e.g., email service, API endpoint) is unreachable or fails, the user should see a clear error message indicating the submission failed and inviting them to try again or use the LinkedIn link as an alternative; no silent failures.
- **Successful submission:** On success, the user should see a clear confirmation (e.g., a success message or redirect to a thank-you state) so they know their enquiry was received.
- **Direct navigation to the Contact Us page:** The page must work correctly when visited directly via URL, not only when reached via one of the three linked elements.
- **Multiple/rapid clicks on submit:** Submitting the form multiple times in quick succession should not create obviously broken behavior (e.g., disable the submit button while a request is in flight), though sophisticated duplicate-submission prevention is not required.
- **LinkedIn link:** If clicked, it should open the LinkedIn company page in a new browser tab without disrupting the current state of the contact form.

## 5. Acceptance criteria

- [ ] A new Contact Us page exists at a single, stable URL on the site.
- [ ] The page displays a form with exactly four fields: Full Name, Email Address, Nature of Enquiry, and Details about the type of work you need help with (the last as a multi-line text area).
- [ ] All four fields are required and the Email Address field validates basic email format before submission.
- [ ] A link to https://www.linkedin.com/company/softpapaya/ appears below the form fields and opens in a new tab.
- [ ] Submitting a valid form results in a visible success confirmation to the user.
- [ ] Submitting an invalid/incomplete form shows clear inline validation errors and does not submit.
- [ ] The "Start a conversation" button at the bottom of the site links to the new Contact Us page.
- [ ] The "Talk to us" button in the top right of the site links to the new Contact Us page.
- [ ] The "Contact" link in the top navigation menu links to the new Contact Us page.
- [ ] All three of the above elements link to the exact same URL/page — verified to be identical.
- [ ] The Contact Us page renders correctly and is usable on both desktop and mobile viewport widths.
- [ ] No other existing pages, links, or buttons are altered as a side effect of this change.

## 6. Open questions

- What should happen to the submitted form data — should it be sent via email, stored in a database, or forwarded to a third-party form service (e.g., Formspree, Netlify Forms)? The current repo's existing capabilities/infrastructure for this aren't specified in the request.
- Should "Nature of Enquiry" be a free-text field or a dropdown/select with predefined categories (e.g., "New Project," "Support," "Partnership," "Other")?
- What exact URL/slug should the Contact Us page use (e.g., `/contact`, `/contact-us`)?
- Should there be a confirmation email sent to the person submitting the form, or just an internal notification?
- Do "Start a conversation" and "Talk to us" currently perform any other action (e.g., opening a chat widget, a mailto link) that stakeholders want preserved as a fallback, or should they be fully replaced with navigation to the Contact Us page?
- Is there an existing design/style guide or component library the new page and form should conform to, or should it be built to visually match the closest existing page as reference?