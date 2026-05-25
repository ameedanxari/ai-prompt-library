# Store Submission Orchestrator

Produces `prompts/outputs/current/store-submission.md` — the
consolidated store-readiness document for App Store / Play Store
submission. Covers store-listing metadata, privacy nutrition
labels / data safety forms, permission strings, asset checklist,
monetisation model, and reviewer notes.

This is distinct from `tasks-*.md` files in the
`App Store Release Prep` baseline epic. Those tasks IMPLEMENT
specific pieces (one task per screenshot, one per keystore, one
per fastlane config). This orchestrator produces the
human-readable *index* of what every reviewer / submitter / future
agent needs to see in one place — a single canonical reference
that the Beta and GA release gates point at.

## When to run

Runs **after** `delivery-order.md`, **after** `release-plan.md`,
and **before** the final Revise Gate. The entry point invokes
this orchestrator automatically when:

- The plan is greenfield, AND
- `MY_PROJECT.md` Platforms includes `ios` or `android` (i.e. the
  app will be distributed via App Store or Play Store).

Skip for web-only / backend / CLI / library projects, or for any
distribution channel that bypasses an app store (enterprise MDM,
direct APK install, internal-only distribution). In those cases,
`store-submission.md` is replaced by a single-line file noting
the actual distribution channel — sufficient to satisfy the
required-companions check.

Audit-and-remediate runs do NOT trigger this — existing apps
already have store listings; the audit's remediation feeds
back into the existing submission process.

## Inputs

- `prompts/outputs/current/product-vision.md` (one-liner,
  positioning, target users — feeds store-listing copy).
- `prompts/outputs/current/architecture.md` (Privacy & security
  posture section — feeds nutrition labels / data safety).
- `prompts/outputs/current/external-accounts.md` (Apple Developer,
  Google Play Console, third-party SDKs each get a row in the
  reviewer disclosure).
- All `features-*.md` (feature catalog — feeds the
  "What's New" / description copy).
- `prompts/outputs/current/ux-flows.md` if it exists (screen
  inventory — feeds screenshot plan).

## Output schema

Write to `prompts/outputs/current/store-submission.md`:

```markdown
---
generated_at: <ISO 8601>
project_name: <from product-vision.md>
platforms: <ios | android | ios, android>
ios_bundle_id: <from MY_PROJECT.md, or "TBD" if not set>
android_package: <from MY_PROJECT.md, or "TBD" if not set>
---

# Store Submission — <Project Name>

## Per-platform listing metadata

### iOS App Store
- **App name:** <≤ 30 chars>
- **Subtitle:** <≤ 30 chars>
- **Promotional text:** <≤ 170 chars; can be updated without
  resubmission>
- **Description:** <≤ 4000 chars; first 3 lines are critical —
  they show in App Store before "more">
- **Keywords:** <≤ 100 chars total; comma-separated, no spaces
  inside individual keywords>
- **Support URL:** <required; document the email or page>
- **Marketing URL:** <optional>
- **Primary category:** <one of Apple's category list>
- **Secondary category:** <optional>
- **Age rating:** <12+ / 17+ / 4+ etc.; with the rationale (e.g.
  "12+ because user-generated photo content is reviewed
  on-device but could be sensitive")>

### Google Play
- **App name:** <≤ 30 chars>
- **Short description:** <≤ 80 chars>
- **Full description:** <≤ 4000 chars>
- **Category:** <one of Play's category list>
- **Content rating:** <Everyone / Teen / Mature; IARC
  questionnaire answers summarised>
- **Tags:** <up to 5>

## Privacy disclosures

### iOS Privacy Nutrition Labels
For each data category Apple asks about, declare ONE of:
"Not Collected", "Used to Track You" (rare), or "Linked to You" /
"Not Linked to You" with the purpose.

| Category | iOS declaration | Purpose | Linked? |
|---|---|---|---|
| Contact Info | Not Collected | — | — |
| Health & Fitness | Not Collected | — | — |
| Financial Info | Not Collected | — | — |
| Location | Not Collected | — | — |
| Sensitive Info | Not Collected | — | — |
| Contacts | Not Collected | — | — |
| User Content (Photos/Videos) | Used | App Functionality | Not Linked to You |
| Browsing History | Not Collected | — | — |
| Search History | Not Collected | — | — |
| Identifiers | Not Collected | — | — |
| Purchases | Not Collected | — | — |
| Usage Data | Not Collected | — | — |
| Diagnostics | Not Collected | — | — |
| Other Data | Not Collected | — | — |

Rule: every row is mandatory. Apple's portal will not accept a
submission with a blank row. Default to "Not Collected" only when
the architecture's Network surface = "none" and the privacy
posture confirms it.

### Google Play Data Safety
For each data type Play asks about, declare collection (yes/no),
sharing (yes/no), security practices, and deletion. Format
mirrors the iOS table above, with the Play-specific phrasing.

### Permission strings (Info.plist usage descriptions)
Every iOS permission the app requests needs a user-facing string.
Strings are written for the END USER, not for Apple's reviewer.

| Permission | Info.plist key | String (≤ 175 chars) |
|---|---|---|
| Photo library | NSPhotoLibraryUsageDescription | <copy> |
| Camera | NSCameraUsageDescription | <copy or "not requested"> |
| ... | ... | ... |

Permissions NOT requested (list them too — auditable):
- Location (no NSLocationUsageDescription) — reason: app never
  needs location.
- Camera (no NSCameraUsageDescription) — reason: …
- Network (no NSAppTransportSecurity exceptions) — reason: …

### Android permissions (AndroidManifest.xml)
Mirror the iOS table for Android. Include negative-space
declarations: "INTERNET permission is NOT declared because…".

## Asset checklist

### App icon
- **iOS sizes required:** 1024×1024 marketing, 180×180,
  120×120, 87×87, 80×80, 76×76, 60×60, 40×40 (full Apple matrix
  for all device classes). Generated from a single 1024 master.
- **Android sizes:** adaptive icon (108×108 foreground + 108×108
  background), legacy 48–192 dp ranges.

### Screenshots
Per platform × per locale × per required device class. Locale
list comes from `MY_PROJECT.md`. Device classes:
- **iOS:** iPhone 6.7", iPhone 6.5", iPhone 5.5", iPad Pro 12.9",
  iPad Pro 11" (the App Store currently requires the iPhone
  classes; iPad only when iPad is in scope).
- **Android:** phone, 7" tablet, 10" tablet.

For each (platform, locale, device class) combination, list the
6–10 screenshots that ship: dashboard → key flow → result. The
specific image paths are owned by individual `tasks-*.md` in the
`App Store Release Prep` baseline epic.

### App preview video (optional but recommended)
- **Length:** 15–30s
- **Audio:** music + on-screen text, OR voice-over
- **Localisation:** one per locale, or English-only if the brief
  permits
- **Content arc:** problem → product → resolution

## Monetisation model

- **Free tier:** <what's free; any limits>
- **Paid tier (if any):** <pricing per locale (Apple/Google
  handle currency conversion); subscription cadence
  (monthly/yearly/lifetime); IAP product IDs>
- **Paywall trigger:** <user action that surfaces the paywall;
  cite the feature in `features-*.md` that gates the trigger>
- **Trial / introductory pricing:** <yes/no + duration>

## Reviewer notes

For Apple App Store Review:
- **Demo account (if applicable):** <username + password OR
  "no account needed">
- **Notes about offline behaviour:** <one short paragraph>
- **Notes about sensitive content handling:** <one short
  paragraph>
- **Common-rejection pre-empts:** <e.g. "We do not request
  INTERNET permission on Android; on iOS we declare zero data
  collection in privacy nutrition labels. The app performs all
  ML inference on-device.">

For Google Play Review:
- **Demo account / test path:** <…>
- **Sensitive permission justifications:** <e.g. why
  READ_MEDIA_IMAGES + READ_MEDIA_VIDEO + MANAGE_MEDIA are
  necessary>
- **Target API level compliance:** <which API level the build
  targets; references Play's current floor>

## Compliance & legal

- **Privacy policy URL:** <required; cite hosting>
- **Terms of service URL:** <if applicable>
- **Export compliance:** <answer to "uses encryption" — cite
  reason; usually "Uses only HTTPS / platform crypto" or "No
  network" for offline apps>
- **Open-source licenses:** <where the attribution surface lives
  in the app — usually a Settings → About → Licenses screen>

## Submission process checklist

(Final stage before Beta and again before GA.)

- [ ] iOS metadata uploaded via App Store Connect.
- [ ] Android metadata uploaded via Play Console.
- [ ] All screenshot assets present at their canonical paths
  (`tasks-screenshots-*.md` complete).
- [ ] Privacy nutrition labels (iOS) finalised.
- [ ] Data safety form (Android) finalised.
- [ ] Build signed with the production signing certs / keystores
  (named in `external-accounts.md`).
- [ ] Reviewer notes attached.
- [ ] Crash reporting verified (test crash via debug menu, then
  remove the test).
- [ ] All required URLs (privacy policy, support, marketing) live.
```

## Generation rules

1. **Privacy disclosures match `architecture.md`.** If the
   architecture's "Network surface" is "none", every iOS nutrition
   row defaults to "Not Collected" and the Android data-safety
   form mirrors that. If network exists, surface every data flow
   and label accordingly. A mismatch between architecture posture
   and store disclosure is a reviewer-rejection risk and a C16
   failure.

2. **Permission strings are user-facing.** They are not
   architectural justifications. Re-write each in the user's voice
   ("So you can scan your photo library on this device — nothing
   leaves your phone").

3. **Asset matrix names CANONICAL paths.** Concrete file paths for
   the screenshot images come from `tasks-screenshots-*.md`. The
   submission doc lists the matrix dimensions and points at those
   tasks — not the other way round.

4. **Negative declarations matter.** "INTERNET permission is NOT
   declared" or "Camera is NOT requested" are first-class entries.
   Reviewer notes cite these explicitly to pre-empt rejection.

5. **Monetisation copy is project-specific.** If `MY_PROJECT.md`
   declares "free" or "subscription", commit to that. If the
   brief is silent, ask — do not invent a freemium model just to
   fill the section.

6. **Reviewer notes pre-empt the obvious questions.** App reviewers
   reject for predictable reasons: privacy disclosure mismatches,
   permission strings that don't match the feature, ML inference
   disclosure ambiguity, age rating mismatch with content. A good
   reviewer note addresses each before review starts.

7. **Length: 300–800 lines for a typical mobile app.** Below 300
   means a section is missing; above 800 means duplicating content
   from architecture.md / features-*.md.

## Anti-patterns (auto-rejected by C16)

- **Privacy disclosure contradicts architecture.md.** Most common
  cause of rejection. Caught by checking the network-surface line
  against the nutrition-label rows.
- **Permission requested but no Info.plist string / manifest entry
  documented.** Apple/Play will reject; the validator catches it
  here too.
- **Asset matrix without explicit locale × device counts.** "Lots
  of screenshots" is not a matrix.
- **No reviewer notes.** Apple/Play rejections cluster around
  3–5 categories; not pre-empting them is leaving review-cycle
  time on the table.
- **Compliance section empty.** Every store needs privacy-policy
  URL + export-compliance answer. Skipping either blocks
  submission.

## Output checkpoint

After writing `store-submission.md`, **STOP and present** to the
user:

1. Platform list and per-platform listing-headline (name +
   subtitle / short description).
2. Privacy posture one-liner ("zero data collection across both
   platforms" or "data collected: X, Y, Z").
3. Permission count (e.g. "iOS requests 1 permission
   [Photo Library]; Android requests 2 [READ_MEDIA_IMAGES,
   READ_MEDIA_VIDEO]").
4. Asset-matrix size (e.g. "iOS: 3 device classes × 1 locale = 18
   screenshots; Android: 3 device classes × 1 locale = 18
   screenshots").
5. The line: `"Store submission plan is ready at
   prompts/outputs/current/store-submission.md. Say **Continue**
   to run the Revise Gate, or give feedback to adjust first."`

This is the last greenfield-planning artifact before the Revise
Gate. After this, the executor takes over.

## See also

- `release-plan.md` — Beta and GA stage gates reference this
  file's checklist.
- `architecture.md` — privacy & security posture upstream.
- `features-app-store-release-prep.md` (and its tasks) — the
  implementation work that fulfils each asset listed here.
- `external-accounts.md` — Apple Developer / Play Console
  credentials.
- `revise-outputs.md` C16 — validates this file's schema.
