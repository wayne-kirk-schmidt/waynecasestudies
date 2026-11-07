# ChangeIS case studies: first test

This test package contains CS01 (PULSE) only. Upload the contents of this folder
to the root of your new repository and publish it using your existing static
hosting process. No build step or dependency installation is required.

The original background images and styles.css are unchanged. No CNAME file is
included: keep your existing domain pointing at the existing production site
while testing this new repository.

## Loading

The site loads manifest.json, then concurrently fetches each listed file from
casestudies/. Tags, cards, filters, and full content all come from those files.
casestudies.json is not used or included.

manifest.json is an ordered array of IDs. For this first test:

```json
["CS01"]
```

When CS02 and CS03 are ready, add their IDs and their JSON files. Every case
must use the new fields: situation, task, action, result, reflection, yield.
The page labels are Situation, Tasks, Actions, Results, Reflection, Yield.
The old return field is not supported.

An ID must match its filename and the id inside its JSON file. IDs are unique
and use CS followed by at least two digits. A case needs a name, tagline,
location/industry/discipline tag arrays, and all six non-empty STARRY sections.

Failed case files produce a friendly unavailable card while the others load.
Unavailable cases are excluded from tag-filtered results because their tags
are unknown. A manifest failure shows a retry message. Diagnostics appear in
the browser console. JSON requests revalidate cached content on each load.

## Test this version

1. Open index.html through your published test URL; PULSE and its tags appear.
2. Select and clear tags; positive matches keep PULSE visible.
3. Click PULSE; confirm all six section labels, 99.17%, the Reflection text,
   and the estimated $2.2M capacity benefit. Return to the gallery.
4. Open CStemplate.html?id=CS01 directly.
5. Open explainer.html and check the new STARRY definitions.
6. To test a missing case, temporarily add "CS02" to the manifest without
   adding its file. You should see an unavailable CS02 card. Remove the ID
   after the test. A malformed file behaves the same way.

To preview locally, serve this folder over HTTP (for example,
python3 -m http.server 8000). Opening HTML through file:// will not support
fetching JSON. Section content uses trusted, author-maintained HTML strings,
as in the original files. Do not put scripts or untrusted HTML in case content.
