# Haptic Feedback & Tactile Interactions

## Purpose

Create native, intentional haptic feedback for mobile interfaces without making the product feel noisy or gimmicky. Use haptics to confirm gestures, communicate state changes, and reinforce important moments while respecting accessibility, battery, and system settings.

## When To Use

Use this module when a feature includes:
- Swipe, drag, scrub, reorder, or card-stack gestures.
- Binary keep/delete, accept/reject, archive/restore, or approve/deny actions.
- Destructive-action confirmation.
- Progress milestones, completion states, or undoable actions.
- Premium-feeling native interactions where tactile feedback improves confidence.

Do not add haptics to every tap. The best haptic systems are sparse, predictable, and tied to user intent.

## Experience Rules

1. Match the haptic to the semantic weight of the action.
2. Fire haptics only after the user crosses a meaningful threshold, not on every drag update.
3. Respect system accessibility and haptic settings.
4. Provide visual feedback alongside haptics; never rely on haptics alone.
5. Avoid long or repeated vibration patterns for routine UI actions.
6. Make haptics deterministic in tests by wrapping platform APIs behind an injectable interface.

## Interaction Mapping

| Interaction | Haptic style | Trigger |
|---|---|---|
| Light selection or segmented-control change | light selection tick | User commits the selection |
| Swipe crosses keep/delete threshold | light impact | First threshold crossing per gesture |
| Swipe commits keep action | medium success-style impact | Card leaves stack to keep |
| Swipe commits delete action | medium warning-style impact | Card leaves stack to delete |
| Undo delete | light impact | Item is restored |
| Destructive final delete | heavy or notification warning | User confirms permanent deletion |
| Milestone complete | success notification | Review queue reaches 100% |
| Invalid action or blocked state | soft warning | User attempts an unavailable action |

## iOS Implementation

Prefer the lightweight UIKit generators for most app UI. Use Core Haptics only when a custom multi-step pattern is genuinely needed.

```swift
import UIKit

protocol HapticFeedbackProviding {
    func selectionChanged()
    func impact(_ style: UIImpactFeedbackGenerator.FeedbackStyle)
    func notification(_ type: UINotificationFeedbackGenerator.FeedbackType)
}

final class NativeHapticFeedbackProvider: HapticFeedbackProviding {
    private let selection = UISelectionFeedbackGenerator()
    private let notification = UINotificationFeedbackGenerator()

    func selectionChanged() {
        selection.selectionChanged()
    }

    func impact(_ style: UIImpactFeedbackGenerator.FeedbackStyle) {
        UIImpactFeedbackGenerator(style: style).impactOccurred()
    }

    func notification(_ type: UINotificationFeedbackGenerator.FeedbackType) {
        notification.notificationOccurred(type)
    }
}
```

### iOS Gesture Threshold Pattern

Track whether feedback has already fired for the current drag, then reset when the gesture ends.

```swift
@State private var didFireThresholdHaptic = false

private func updateSwipeHaptic(offsetX: CGFloat, threshold: CGFloat, haptics: HapticFeedbackProviding) {
    let crossedThreshold = abs(offsetX) >= threshold

    if crossedThreshold && !didFireThresholdHaptic {
        haptics.impact(.light)
        didFireThresholdHaptic = true
    }

    if !crossedThreshold {
        didFireThresholdHaptic = false
    }
}

private func finishSwipe(direction: SwipeDirection, haptics: HapticFeedbackProviding) {
    switch direction {
    case .keep:
        haptics.notification(.success)
    case .delete:
        haptics.notification(.warning)
    case .cancel:
        break
    }
    didFireThresholdHaptic = false
}
```

## Android Implementation

Use `LocalHapticFeedback` for Compose UI events. Use `Vibrator` and `VibrationEffect` only for custom patterns or non-Compose surfaces, and always check platform support.

```kotlin
import androidx.compose.runtime.Composable
import androidx.compose.ui.hapticfeedback.HapticFeedback
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback

interface HapticFeedbackProvider {
    fun selectionChanged()
    fun thresholdCrossed()
    fun actionCommitted(isDestructive: Boolean)
}

class ComposeHapticFeedbackProvider(
    private val hapticFeedback: HapticFeedback
) : HapticFeedbackProvider {
    override fun selectionChanged() {
        hapticFeedback.performHapticFeedback(HapticFeedbackType.TextHandleMove)
    }

    override fun thresholdCrossed() {
        hapticFeedback.performHapticFeedback(HapticFeedbackType.LongPress)
    }

    override fun actionCommitted(isDestructive: Boolean) {
        hapticFeedback.performHapticFeedback(HapticFeedbackType.LongPress)
    }
}

@Composable
fun rememberHapticFeedbackProvider(): HapticFeedbackProvider {
    return ComposeHapticFeedbackProvider(LocalHapticFeedback.current)
}
```

### Android Gesture Threshold Pattern

```kotlin
var didFireThresholdHaptic by remember { mutableStateOf(false) }
val thresholdPx = with(LocalDensity.current) { 96.dp.toPx() }
val haptics = rememberHapticFeedbackProvider()

fun updateSwipeHaptic(offsetX: Float) {
    val crossedThreshold = abs(offsetX) >= thresholdPx

    if (crossedThreshold && !didFireThresholdHaptic) {
        haptics.thresholdCrossed()
        didFireThresholdHaptic = true
    }

    if (!crossedThreshold) {
        didFireThresholdHaptic = false
    }
}

fun finishSwipe(isDelete: Boolean) {
    haptics.actionCommitted(isDestructive = isDelete)
    didFireThresholdHaptic = false
}
```

## Accessibility & User Controls

Provide a user-facing setting only if haptics are a meaningful part of the product experience. Otherwise, follow OS behavior and keep feedback sparse.

Recommended setting:

```typescript
interface InteractionPreferences {
  hapticsEnabled: boolean;
  reducedMotionEnabled: boolean;
  soundEffectsEnabled: boolean;
}
```

Rules:
- If the user disables in-app haptics, do not call the haptic provider.
- If reduced motion is enabled, haptics can remain enabled but animation timing should become calmer.
- Do not use haptics as the only indication of success, failure, selection, or destructive action.
- Avoid haptic feedback during screen-reader focus movement unless the user commits an action.

## Testing Strategy

Wrap haptics behind an interface and test the interaction layer rather than the OS API.

Unit tests should verify:
- Threshold feedback fires once when crossing the threshold.
- Threshold feedback resets if the user drags back below the threshold.
- Commit feedback fires for keep and delete actions.
- No feedback fires when `hapticsEnabled` is false.
- Destructive feedback is not triggered before explicit confirmation.

UI tests should verify:
- Swipe gestures still work when haptics are disabled.
- Haptic calls do not block frame rendering or gesture completion.
- Undo flows restore the item and fire the lighter restoration feedback.

## Performance Guidance

- Do not instantiate heavy custom haptic engines on every render.
- Prepare iOS feedback generators before gesture-heavy screens when possible.
- Do not fire feedback from high-frequency pointer or drag callbacks without threshold gating.
- Keep custom vibration patterns below 500 ms unless required for an accessibility-specific alert.
- Never perform network calls or analytics writes from the haptic feedback path.

## Common Mistakes

- Firing haptics repeatedly while the finger is still moving inside the same threshold band.
- Using heavy warning feedback for routine actions.
- Adding haptics to disabled controls.
- Making tests depend on physical device vibration.
- Ignoring platform differences and forcing identical tactile patterns across iOS and Android.
