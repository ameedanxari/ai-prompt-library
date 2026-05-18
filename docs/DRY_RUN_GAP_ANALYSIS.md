# Dry Run Gap Analysis & Recommendations

**Date:** May 17, 2026  
**Product Tested:** CloudClear - Storage Cleaner App (iOS + Android native)  
**Tester Role:** Library validation + real-world product trace

---

## Executive Summary

The **AI Prompt Library successfully orchestrated a complete product plan** (16 epics → 102 features → 107 tasks) for a complex mobile app. However, **5 critical gaps and 8 moderate/minor gaps** were identified that could undermine execution if not addressed. This document categorizes each gap, assesses impact, and recommends fixes.

**Overall verdict:** Library is **production-ready with mitigations** for identified gaps. Most gaps are in module guidance (not the orchestration engine itself) and are solvable with expanded documentation or conditional task routing.

---

## Critical Gaps (Block Execution)

### Gap 1: ML Model Bundling Decision Not Specified

**Symptom:**  
Tasks T1.3.2 (ML-based duplicate detection) and T4.1 (Sensitive content detection) reference "Core ML models" and "TensorFlow Lite models" but don't clarify:
- Are models bundled in APK/IPA (increases app size 50–150 MB)?
- Are models downloaded on first run (requires network, contradicts "no network" constraint)?
- Are pre-trained models used, or custom fine-tuned models?

**Impact:** HIGH
- Developer builds wrong thing (bundled when downloaded was intended, or vice versa)
- App either bloats to 200+ MB or violates "no network" constraint
- Release blocked due to App Store size limits or policy violations

**Root Cause:**  
`on-device-ml-ios.md` and `on-device-ml-android.md` modules mention model sources but don't force a decision tree in task generation.

**Recommended Fix:**

1. **Add decision tree to task generator** (in drill-down-engine.md, Step 3):
   ```
   When feature involves on-device ML:
     IF privacy constraint includes "no network for user data":
       THEN ask: "Model bundling preference?"
       OPTIONS:
         A) Bundled (in APK) — increases size, no download latency
         B) Downloaded on first run — smaller app, one-time network use, no ongoing network access
         C) Hybrid — bundled for fast inference, optional newer versions download
     ELSE allow downloaded models (no privacy constraint)
   ```

2. **Expand task acceptance criteria** to include model sourcing:
   ```
   T1.3.2: ML-based Duplicate Detection (iOS)
   
   Acceptance Criteria:
   - ✅ ... existing criteria ...
   - ✅ [IF BUNDLED] Model file (.mlmodel or .tflite) present in Xcode project; final IPA size ≤ 150 MB.
   - ✅ [IF DOWNLOADED] On first launch, model downloads via URLSession; cached in Documents/ directory; marked "no network required after download".
   - ✅ [PRIVACY] No telemetry of model download, inference results, or user media sent to external service.
   ```

3. **Document in module footnote**:
   ```
   ### Model Deployment (Critical Decision Point)
   
   **For privacy-first apps (no network for user data):**
   - Prefer bundled models to ensure offline capability and privacy.
   - If APK size is prohibitive, use model quantization (reduce precision, ~30% size savings).
   - If download is necessary, clearly document: "Model downloads once on first run; no user data is transmitted."
   
   **For apps with network access:**
   - Downloaded models are acceptable; smaller APK size, easier to update models post-launch.
   ```

**Effort to Fix:** 2–3 hours (modify drill-down-engine.md Step 3, expand modules, add decision tree examples)

---

### Gap 2: Android 14 Chosen-Photo Access Not Addressed

**Symptom:**  
Task T1.1.2 (Android MediaStore Scanner) and task T6.2 (Deletion workflow) reference MediaStore and scoped storage, but don't mention Android 14's **photo picker** and **chosen photos permission**.

On Android 14+, users can grant access only to specific photos, not the entire library. The app cannot enumerate the full library without user explicitly choosing each photo or album.

**Impact:** HIGH
- App cannot discover all photos without user permission grant flow
- Users experience friction (must select photos manually)
- Swipe-through-all-photos feature (core to product) doesn't work on Android 14 without explicit per-photo selection

**Root Cause:**  
`native-storage-cleanup.md` module focuses on scoped storage (Android 12–13) and doesn't deeply cover Android 14's chosen-media pattern.

**Recommended Fix:**

1. **Expand native-storage-cleanup.md** with Android 14 subsection:
   ```
   ## Android 14+ Chosen Photos (Photo Picker)
   
   **Change:** Android 14 introduces photo/video selection UI. Users can choose specific photos instead of granting blanket library access.
   
   **MediaStore API:**
   - Use `MediaStore.ACTION_PICK_IMAGES` (photo picker intent) to let user choose photos.
   - Alternatively, if you need to enumerate the full library without user permission, request `READ_MEDIA_IMAGES` + `READ_MEDIA_VIDEO` (standard permissions).
   - On Android 14, users can choose:
     a) Grant access to all photos (if they tap "Allow all").
     b) Grant access to selected photos (if they tap specific photos in picker).
   
   **Privacy Implication:** If user grants "selected photos", app must:
   - Respect the subset (don't attempt to access full library).
   - On subsequent scans, re-request permission if new photos added outside the selection.
   
   **Task Impact:**
   - T1.1.2 must handle both full-library enumeration AND selected-photo subset.
   - T6.2 (Deletion) must only delete from user-selected subset.
   - UI should clearly communicate: "You're reviewing X photos out of Y in your library" (if subset).
   ```

2. **Add separate task for Android 14 permission flow**:
   ```
   ## Task T1.1.3: Android 14+ Chosen Photo Permission Handoff
   
   **File to create:** android/app/src/main/kotlin/.../Android14PermissionFlow.kt
   
   **What to build:**
   Implement permission request flow that handles Android 14's photo picker + chosen photos.
   
   **Acceptance:**
   - On Android 14+, show photo picker if no permission granted.
   - If user selects photos, enumerate only those (respect permission scope).
   - If user taps "Allow all" (if picker offers it), enumerate full library.
   - On subsequent app launches, if permission is "selected photos", show UI indicator: "Showing N of M photos".
   - Unit test: mock MediaStore + chosen photos subset; verify enumeration respects scope.
   ```

3. **Update T1.1.2 acceptance criteria**:
   ```
   ✅ Android API ≤ 13: Enumerate full library with READ_MEDIA_IMAGES + READ_MEDIA_VIDEO permissions.
   ✅ Android 14+: Handle both full-library (user grants all photos) AND chosen-photo subset (user selects specific photos).
   ✅ If chosen-photo subset active, UI displays: "Reviewing [count] chosen photos".
   ```

**Effort to Fix:** 4–6 hours (expand module, add task, update test expectations)

---

### Gap 3: Deletion Undo Capability Mismatch (iOS vs Android)

**Symptom:**  
Task T6.2 (Deletion & Cleanup Execution) states: "Undo capability: if OS permits".

- **iOS:** PHAssetChangeRequest deletion is **permanent**. There is no OS-level undo. User cannot recover deleted photos from app trash (they go to Photos app trash, but app cannot access that).
- **Android:** MediaStore.createDeleteRequest (Android 11+) shows **OS-level confirmation dialog with undo option** (system can recover deleted files).

The task promises undo but only Android delivers it. This is a false promise for iOS users.

**Impact:** MODERATE–HIGH
- iOS users delete photos expecting to undo; deletion is permanent.
- Feature gap between platforms confuses users who switch devices.
- Acceptance criteria claim something the platform doesn't allow.

**Root Cause:**  
`native-storage-cleanup.md` module mentions "undo if OS permits" but doesn't explicitly say iOS doesn't support it.

**Recommended Fix:**

1. **Clarify in module**:
   ```
   ## Deletion & Undo Capability
   
   **iOS:**
   - Use `PHAssetChangeRequest.deleteAssets()` to delete photos.
   - Deletion is **permanent** — no OS-level undo.
   - Photos are moved to Photos app's "Recently Deleted" folder, which app cannot access programmatically.
   - **Design implication:** Require strong confirmation ("Delete these 50 photos permanently?"), no undo.
   - Consider adding "soft delete" feature (mark for deletion locally, but don't execute PHAssetChangeRequest immediately).
   
   **Android:**
   - Use `MediaStore.createDeleteRequest()` (Android 11+) or resolver (Android 10–).
   - Android 11+ shows **OS deletion confirmation** with undo option (file can be recovered from Trash).
   - **Design implication:** OS handles undo; app shows "Deleted" snackbar with undo button (post action → show Snackbar with action).
   ```

2. **Refactor task acceptance criteria**:
   ```
   ## Task T6.2: Deletion & Cleanup Execution
   
   **Platform-specific acceptance:**
   
   **iOS:**
   - ✅ Batch select photos marked for deletion.
   - ✅ Show confirmation dialog: "Permanently delete these N photos? This cannot be undone."
   - ✅ Call PHAssetChangeRequest.deleteAssets() for selected assets.
   - ✅ Post-deletion: Show toast "N photos deleted" (no undo action).
   - ✅ Graceful error: If deletion fails (OS permission change), show error message.
   - ✗ SKIP: Undo (not supported on iOS).
   
   **Android:**
   - ✅ Batch select photos marked for deletion.
   - ✅ Show confirmation dialog: "Delete these N photos?" (softer than iOS; OS provides undo).
   - ✅ Call MediaStore.createDeleteRequest() for selected URIs (Android 11+) or use resolver (Android 10–).
   - ✅ Post-deletion: Show Snackbar with undo action: "N photos deleted [UNDO]".
   - ✅ If user taps Undo within 5 seconds, request to restore (if OS supports).
   - ✅ Graceful error: If deletion fails, show error message.
   ```

3. **Add design doc**:
   ```
   ## Design Decision: Platform-Specific Deletion
   
   iOS deletion is permanent; Android provides OS-level undo. Rather than fake iOS undo (which would require local DB of deleted IDs + recovery logic), we embrace platform differences:
   
   - **iOS:** Strong confirmation, emphasize permanence, clear consequences.
   - **Android:** Lighter confirmation, showcase OS undo as safety net.
   
   User experience differs, but both are appropriate for their platforms.
   ```

**Effort to Fix:** 2–3 hours (clarify module, refactor task acceptance criteria, add design decision doc)

---

### Gap 4: Sensitive Content OCR / Document Detection Model Sourcing

**Symptom:**  
Task T4.1 (Sensitive Content Detection) and Task T4.1.2 (On-device ML classifier for sensitive docs) assume "use Core ML + Vision (iOS) or ML Kit + TFLite (Android)" but don't address:
- Which pre-trained models detect documents, IDs, receipts?
- If custom fine-tuning is needed, where does training data come from?
- Are there off-the-shelf models (e.g., Google's pre-trained object detectors) or must custom models be trained?

**Impact:** MODERATE
- Developer can't proceed without external model sourcing (delays task by days/weeks).
- If no suitable pre-trained model exists, custom training is out of scope (requires ML expert + dataset).
- Task acceptance criteria can't be met without explicit model source.

**Root Cause:**  
`on-device-ml-ios.md` and `on-device-ml-android.md` describe *how* to run models but not *which* models to use or how to source them.

**Recommended Fix:**

1. **Add model sourcing section to on-device-ml modules**:
   ```
   ## Pre-trained Models for Sensitive Content Detection
   
   **Option A: Google ML Kit (Recommended for MVP)**
   - ML Kit Text Recognition API (on-device OCR) detects text in images.
   - Limitations: Detects text, not document *type*. You must classify returned text to infer sensitivity (e.g., "ID" keywords, numbers matching passport format).
   - Implementation: Run OCR → analyze text keywords → classify sensitivity.
   - Pros: Free, pre-trained, no custom training.
   - Cons: May miss visual document indicators (e.g., blue ID card background).
   
   **Option B: Custom Fine-tuned Model (Advanced)**
   - Train a custom classifier on labeled dataset: [document type, sensitivity score].
   - Requires: 500–1000 labeled images of documents/IDs/receipts in various lighting.
   - Tools: Create ML (iOS), Firebase ML Kit custom models (Android), TensorFlow (cross-platform).
   - Pros: Accurate, tailored to your document types.
   - Cons: Requires ML expertise, data privacy (must anonymize training data), ongoing maintenance.
   
   **Option C: Hybrid (Recommended for Production)**
   - Use ML Kit OCR as baseline (free, no custom data).
   - Add rule-based heuristics: keyword detection + pattern matching (e.g., regex for passport numbers).
   - Fallback to visual heuristics: detect blue/red card colors, specific aspect ratios.
   - Pros: Balanced accuracy without custom training.
   - Cons: Requires careful heuristic tuning.
   ```

2. **Refactor task T4.1.2 with model selection**:
   ```
   ## Task T4.1.2: Sensitive Content Classifier (On-Device ML)
   
   **What to build:**
   Implement a multi-method sensitive content classifier using:
     1. ML Kit OCR (text detection)
     2. Keyword matching (sensitive keywords)
     3. Visual heuristics (color, aspect ratio)
   
   **Model sourcing:**
   - OCR: Google ML Kit Text Recognition (free, pre-trained, no custom data)
   - Visual heuristics: Hard-coded rules (no external model)
   - If custom fine-tuning needed in future, document data collection process separately.
   
   **Acceptance:**
   - ✅ Classify sample docs: passport (sensitivity=HIGH), receipt (MEDIUM), photo (LOW).
   - ✅ OCR confidence > 0.7 → extract text.
   - ✅ Keyword matching: ["passport", "id", "license", "credit card", "tax id", ...] → flag sensitive.
   - ✅ Visual heuristics: 3:2 aspect ratio + blue/red color → flag as ID-like.
   - ✅ Classification accuracy on 100 test images: ≥85%.
   ```

3. **Add design decision**:
   ```
   ## Design Decision: Sensitive Content Detection Strategy
   
   **MVP (Week 5–6):**
   - Use free, pre-trained ML Kit OCR + keyword matching.
   - No custom training data needed.
   - Accuracy ~80% (false positives on other blue objects).
   
   **Post-launch (Future):**
   - If accuracy insufficient, collect anonymized user feedback (flagged vs. not flagged).
   - Fine-tune custom model on anonymized dataset.
   - Deploy via app update.
   ```

**Effort to Fix:** 3–4 hours (expand ML modules, add model sourcing guide, refactor task)

---

### Gap 5: Memory Cleanup "One-Tap" Expectation Mismatch

**Symptom:**  
Epic 7 (Memory Cleanup Guidance) is positioned as a feature, but it's actually **guidance + links to OS Settings**. App cannot programmatically clear RAM, system cache, or other apps' caches due to OS restrictions.

Users reading "Memory Cleanup" in app might expect "one-tap cleanup" (like CCleaner on Android), but the app only provides:
- "Available memory: 2.4 GB"
- Links: "Go to Settings → Storage → Free up space"

This creates **expectation mismatch**: feature name implies action, but execution is passive guidance.

**Impact:** MODERATE
- User opens Memory Cleanup feature expecting action, finds only links.
- Negative reviews: "Doesn't actually clean anything, just shows links."
- Unclear whether this is a feature or non-feature.

**Root Cause:**  
Library includes Epic 7 as a "feature" epic, but its scope is too narrow (info + links, no programmatic cleanup). Should be clarified as "guidance" or scoped differently.

**Recommended Fix:**

1. **Reposition Epic 7 in planning**:
   ```
   Option A: Include as feature with modified acceptance criteria (realistic).
   Epic 7: Memory Cleanup Guidance
   - Goal: Provide **guidance** on device memory, cache, and storage cleanup that cannot be automated.
   - Acceptance:
     - ✅ Show available RAM, storage, cache size via OS APIs.
     - ✅ Provide actionable links: iOS Settings → General → Storage; Android Settings → Storage.
     - ✅ UI clearly states: "These items cannot be automatically cleared. Visit Settings to manage."
     - ✅ No claim of "memory freed" or "automatic cleanup".
   - Complexity: S (<1 week)
   
   Option B: Move to "optional baseline" (may defer to post-launch).
   - If user doesn't prioritize memory guidance, defer this epic; launch app without it.
   - Include in roadmap for post-launch v1.1.
   
   Option C: Expand scope (ambitious).
   - **iOS:** Implement app-specific cache clearing for CloudClear app (not system-wide).
   - **Android:** Request `MANAGE_EXTERNAL_STORAGE` permission; programmatically clear app cache directory + temp files.
   - Tradeoff: App size increases, Play Store scrutiny (MANAGE_EXTERNAL_STORAGE is restricted).
   - Benefit: Users see "Memory freed: X MB" after action.
   ```

2. **Update epic acceptance criteria to set realistic expectations**:
   ```
   ## Epic 7: Memory & Cache Guidance (Revised)
   
   - **Goal:** Educate users on device memory and cache cleanup; provide OS-native links where direct app access is not permitted.
   - **What app CAN do:**
     - ✅ Display available device memory (via Runtime.getRuntime(), ProcessInfo on iOS).
     - ✅ Display app-specific cache usage (getCacheDir().size()).
     - ✅ Provide links to OS Settings for system-wide cache/memory management.
     - ✅ On deletion completion, show "Space freed: X MB" (from deleted photos/videos).
   - **What app CANNOT do:**
     - ✗ Clear RAM (iOS/Android permission restriction).
     - ✗ Clear other apps' caches (permission restriction).
     - ✗ Clear system swap/temp files (permission restriction).
   - **Design implication:** Frame as "Memory Insights & Settings Access", not "Memory Cleaner".
   ```

3. **Update task names for clarity**:
   ```
   Instead of: "Memory Cleanup Execution"
   Rename to: "Memory Status & Settings Guidance"
   
   This better reflects the actual capability: show stats + guide to Settings.
   ```

**Effort to Fix:** 2–3 hours (clarify epic scope, update acceptance criteria, rename tasks, add design decision)

---

## Moderate Gaps (May Cause Friction)

### Gap 6: Duplicate Detection False Positives & User Education

**Symptom:**  
Task T1.3.2 (ML-based duplicate detection) assumes cosine similarity > 0.9 threshold is sufficient, but doesn't address:
- False positives: Photos of same scene with different exposures, edited versions, same subject at different times.
- User confusion: "Why are these two different photos marked as duplicates?"

**Impact:** MODERATE
- Users distrust the app's recommendations and manually review every suggestion.
- Negative reviews: "Marked my favorite photos as duplicates and deleted them by mistake."
- Feature becomes less useful than standalone duplicate detection (users often prefer manual review).

**Recommended Fix:**

1. **Add duplicate review UI task**:
   ```
   ## Task T1.3.3: Duplicate Review UI with Confidence Display
   
   **File to create:**
   - ios/CloudClear/Features/Review/DuplicatePreviewView.swift
   - android/app/src/main/kotlin/.../DuplicatePreviewComposable.kt
   
   **What to build:**
   Implement a side-by-side duplicate preview showing:
   - Thumbnail 1 + Thumbnail 2
   - Similarity score (0.0–1.0) displayed visually (e.g., progress bar)
   - User can override: "These are duplicates" / "Keep both" / "Ask me later"
   
   **Acceptance:**
   - ✅ Display similar image pairs with confidence 0.85+.
   - ✅ Side-by-side preview: clear thumbnail, creation date, file size.
   - ✅ Confidence bar: 0.9+ = very confident, 0.85–0.89 = moderately confident.
   - ✅ User override buttons with obvious affordance.
   - ✅ Persist user overrides to improve future detection (optional ML feedback loop).
   ```

2. **Update duplicate detection task acceptance criteria**:
   ```
   ✅ Duplicate detection on 100 test images: ≥85% precision (minimize false positives).
   ✅ Duplicate groups displayed with confidence score (0.0–1.0).
   ✅ User can preview and override duplicate suggestions.
   ```

**Effort to Fix:** 1–2 hours (add task, update acceptance criteria)

---

### Gap 7: No Cross-Device or Cloud Backup

**Symptom:**  
Brief mentions "privacy paramount" and "no network for user data". Library interprets this strictly as "device-local only; no cloud sync".

But users might expect: "If I switch phones, my cleanup history should follow me." App doesn't support this.

**Impact:** MINOR–MODERATE
- Not a blocker, but scope clarification needed.
- If user provides feedback "I switched phones and lost my cleanup history", it's a design gap.

**Recommended Fix:**

1. **Document as explicit non-goal**:
   ```
   ## Non-Goal: Cloud Backup / Cross-Device Sync
   
   The app processes all data locally. There is no cloud backup.
   
   **If user reinstalls app or switches phones:**
   - Review history is lost (not backed up).
   - Photos/videos are unchanged (stored on device, not app).
   - User restarts cleanup from scratch on new device.
   
   **Alternative (post-launch feature):**
   If users request cloud backup, future versions could offer optional encrypted iCloud (iOS) / Google Drive (Android) backup of review history and session metadata. This would be opt-in, clearly disclosed, and separate from core no-network processing.
   ```

2. **Confirm with user during planning**: Add checkpoint question in Step 1 (Seed):
   ```
   ⏸ CHECKPOINT: Cross-Device Continuity
   
   The app stores all data locally (device only). If user switches phones or reinstalls:
   - Cleanup history is lost (not backed up).
   - Is this acceptable? Or should we add optional encrypted cloud backup (post-launch)?
   
   User responds: "Accept device-local only" → proceed as planned.
   OR: "Add optional cloud backup" → add new baseline epic.
   ```

**Effort to Fix:** 1–2 hours (document, add checkpoint question)

---

### Gap 8: Monetization Not Specified

**Symptom:**  
Brief is silent on monetization. Library assumes "free user-focused app" (documented in non-goals), but doesn't confirm with user.

**Impact:** MINOR–MODERATE (depends on user's business model)
- If user wants in-app purchases or premium tier, scope changes significantly.
- Library generated a free app when user might have intended paid/premium.

**Recommended Fix:**

1. **Add monetization confirmation checkpoint**:
   ```
   ⏸ CHECKPOINT: Monetization Strategy
   
   Library is planning a free, no-ads app with no in-app purchases or premium tiers.
   Is this correct? Or do you want:
   - Paid app ($4.99 one-time purchase)?
   - Free with optional premium tier (advanced filters, cloud backup)?
   - Free with ads?
   - Free with donation option?
   
   User responds → confirm or adjust scope.
   ```

**Effort to Fix:** <1 hour (add checkpoint in entry point)

---

## Minor Gaps (Polish)

### Gap 9: Localization Scope (3 locales only)

**Symptom:**  
Library defaults to en_US only for MVP, with infrastructure for future expansion. But doesn't explicitly plan which locales to support post-launch.

**Impact:** MINOR
- Post-launch, it's unclear which language community to prioritize (German? Spanish? Japanese?).
- No data to guide localization roadmap.

**Recommended Fix:**

1. **Document in B3 (Localization) task**:
   ```
   ## Localization Roadmap (Post-Launch)
   
   **MVP (Week 1–14):**
   - en_US only
   - Infrastructure in place for future languages (string extraction, RTL support)
   
   **Post-Launch (Roadmap):**
   - Candidate languages (based on App Store region popularity):
     - German (de_DE) — popular in EU
     - Spanish (es_ES) — large user base
     - Japanese (ja_JP) — strong Asian market
     - French (fr_FR) — EU, Canada
     - Arabic (ar_SA) — RTL testing candidate
   - Prioritize based on: user requests, download metrics, App Store reviews in foreign language.
   ```

**Effort to Fix:** <1 hour (document in localization task)

---

### Gap 10: Accessibility Testing Not Automated

**Symptom:**  
Task B5 (Accessibility) includes manual checks ("VoiceOver labels present", "touch targets 48pt"), but doesn't automate these in CI/CD pipeline.

**Impact:** MINOR
- Manual testing is error-prone; easy to regress.
- No automated catches for accessibility regressions in future updates.

**Recommended Fix:**

1. **Add automated accessibility testing task**:
   ```
   ## Task B5.3: Automated Accessibility Testing (CI/CD)
   
   **File to create:**
   - ios/CloudClearTests/Accessibility/AccessibilityTests.swift
   - android/app/src/androidTest/kotlin/.../AccessibilityTests.kt
   
   **What to build:**
   Automated tests for:
   - All interactive elements have a11y labels (VoiceOver/TalkBack).
   - Touch targets ≥48pt (iOS) / 48dp (Android).
   - Text contrast ≥4.5:1 (checked via screenshot pixel analysis or a11y library).
   - reduceMotionEnabled flag respected (animations skipped).
   
   **Acceptance:**
   - ✅ Automated tests run on every commit.
   - ✅ CI/CD fails if any a11y check fails.
   - ✅ Tests cover all screens and interactive elements.
   ```

**Effort to Fix:** 2–3 hours (add automation task, update CI/CD workflows)

---

## Summary Table

| Gap | Category | Severity | Impact | Fix Effort |
|---|---|---|---|---|
| 1. ML Model Bundling Decision | Critical | HIGH | Blocker; wrong decision wastes weeks | 2–3 hrs |
| 2. Android 14 Chosen Photos | Critical | HIGH | Feature doesn't work on Android 14+ | 4–6 hrs |
| 3. Deletion Undo Mismatch | Critical | HIGH | False promise to iOS users | 2–3 hrs |
| 4. Sensitive Content OCR Sourcing | Critical | MODERATE | Task unactionable without external model | 3–4 hrs |
| 5. Memory Cleanup Expectations | Critical | MODERATE | UX/marketing mismatch; negative reviews | 2–3 hrs |
| 6. Duplicate Detection False Positives | Moderate | MODERATE | Feature less useful without user feedback | 1–2 hrs |
| 7. No Cloud Backup | Moderate | MINOR–MOD | Scope clarification; potential future request | 1–2 hrs |
| 8. Monetization Not Specified | Moderate | MINOR–MOD | Scope creep if user wants premium tier | <1 hr |
| 9. Localization Roadmap | Minor | MINOR | Post-launch clarity | <1 hr |
| 10. Accessibility Not Automated | Minor | MINOR | Regression risk in future updates | 2–3 hrs |

**Total effort to address all gaps: 22–32 hours**

---

## Recommendations for Library Enhancement

### Priority 1: Fix Critical Gaps (Before Production Release)

1. ✅ **Expand native-storage-cleanup.md** — Add Android 14 chosen photos, iOS deletion undo details.
2. ✅ **Add model sourcing decision tree** — drill-down-engine.md Step 3 should prompt for model bundling + sourcing strategy.
3. ✅ **Clarify sensitive content OCR** — Add pre-trained model options (ML Kit OCR, custom fine-tuning).
4. ✅ **Reposition Epic 7** — Clarify Memory Cleanup as "guidance" not "action", or expand scope.

### Priority 2: Enhance Modules (Before Next Real Project)

1. ✅ **Create model-sourcing guide** — Separate doc for on-device ML model selection, bundling vs. download trade-offs.
2. ✅ **Expand on-device-ml modules** — Add real-world examples (document detection, face recognition) with actual model sources.
3. ✅ **Create "platform differences" guide** — Clearly document iOS vs. Android capability gaps (deletion undo, memory access, cache clearing).

### Priority 3: Improve Planning Checkpoints

1. ✅ **Add monetization checkpoint** — Confirm business model during intake.
2. ✅ **Add cross-device sync checkpoint** — Confirm data persistence scope.
3. ✅ **Add model sourcing checkpoint** — For tasks involving ML, ask: pre-trained vs. custom vs. bundled.

### Priority 4: Enhance Execution Validation

1. ✅ **Automated accessibility testing** — Add task to CI/CD for regression prevention.
2. ✅ **Add "duplicate review" task** — User education + override capability for ML suggestions.

---

## Conclusion

The **AI Prompt Library is production-ready** for the Storage Cleaner app and similar complex mobile projects. The 5 critical gaps identified are **solvable with targeted module enhancements** and **do not reflect flaws in the orchestration engine itself**.

**Recommended approach:**
1. Address Gaps 1–5 (critical) **before** full execution launch.
2. Address Gaps 6–8 (moderate) during execution, integrated into task generation.
3. Address Gaps 9–10 (minor) as polish post-launch.

With these mitigations, the library will generate **robust, production-grade product plans** that developers can execute without ambiguity.

---

*End of gap analysis*
