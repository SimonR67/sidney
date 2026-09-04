# images/ — three assets still missing

**The three page images are not in this directory and could not be downloaded.**
Nothing has been substituted for them: per the plan, a download failure is
flagged rather than worked around with a placeholder.

## What is missing

| File | Used by | Google Drive id |
|---|---|---|
| `File1767.jpg` | `index.html` (Home) | `1oyhTHrmOxstMLB2effg1rHVcPlnWwWBh` |
| `City_Eclipse.jpeg` | `about.html` (About) | `1uHmN3zpaBs5KNzmMiyaHf-8qK_vjiAFU` |
| `Orion18032022-for-lightroom.jpg` | `contact.html` (Contact) | `1F1ZgT2L17IGYOh5ujqQWksdvQZdwNJXQ` |

The three pages already reference these exact paths (`images/<file>`), so the
job completes the moment the files land here — no markup or CSS change needed.

## Why the download failed

Every public Drive download endpoint answers with an `accounts.google.com`
sign-in page instead of image bytes, i.e. the files are not shared publicly:

    https://drive.google.com/uc?export=download&id=<id>            → sign-in HTML
    https://drive.usercontent.google.com/download?id=<id>&confirm=t → sign-in HTML
    https://drive.google.com/thumbnail?id=<id>&sz=w2000             → sign-in HTML
    https://lh3.googleusercontent.com/d/<id>                        → sign-in HTML
    https://www.googleapis.com/drive/v3/files/<id>?alt=media        → HTTP 403

The build environment has no Google credentials either
(`GOOGLE_APPLICATION_CREDENTIALS` is empty and `gcloud auth list` reports no
credentialed accounts), so the authenticated path is not available.

## How to finish

Either:

1. Share the three Drive files with "Anyone with the link" and re-run the
   download, or
2. Download them by hand from the "images" folder in Drive and commit them to
   this directory under exactly the filenames above.

Then run `npm test` — the `Pages task 2: image assets` tests check that each file
is present and is real JPEG data (not a saved Drive error page), and the page
tests check that each image actually renders.

## Alt text

The `alt` text on the three `<img>` elements was written from the filenames and
the site's context, because the images themselves could not be viewed. Review it
once the files are in place.
