# Gesture & Swipe Card UI

## Intent
Implement highly interactive, tactile user interfaces driven by gestures, specifically Tinder-style swipe cards, draggable sheets, or interactive carousels.

## Platform Approaches

### iOS (SwiftUI)
Use `DragGesture` combined with `.offset` and `.rotationEffect` to create fluid swipe cards.

```swift
struct SwipeCardView: View {
    let item: Item
    var onSwipedLeft: () -> Void
    var onSwipedRight: () -> Void
    
    @State private var offset = CGSize.zero
    @State private var color: Color = .clear
    
    var body: some View {
        ZStack {
            // Card content
            Image(item.imageName)
                .resizable()
                .scaledToFill()
                // ... styling ...
                
            // Overlay color based on swipe direction
            color.opacity(0.4)
        }
        .offset(x: offset.width, y: offset.height * 0.4)
        .rotationEffect(.degrees(Double(offset.width / 20)))
        .gesture(
            DragGesture()
                .onChanged { gesture in
                    offset = gesture.translation
                    withAnimation {
                        changeColor(width: offset.width)
                    }
                }
                .onEnded { gesture in
                    withAnimation(.spring()) {
                        handleSwipe(width: offset.width)
                    }
                }
        )
    }
    
    private func handleSwipe(width: CGFloat) {
        let threshold: CGFloat = 100
        if width > threshold {
            offset = CGSize(width: 500, height: 0)
            onSwipedRight()
        } else if width < -threshold {
            offset = CGSize(width: -500, height: 0)
            onSwipedLeft()
        } else {
            offset = .zero
            color = .clear
        }
    }
}
```

### Android (Jetpack Compose)
Use `pointerInput` with `detectDragGestures` or the newer `AnchoredDraggable` API.

```kotlin
@Composable
fun SwipeCardView(
    item: Item,
    onSwipedLeft: () -> Unit,
    onSwipedRight: () -> Unit
) {
    var offsetX by remember { mutableFloatStateOf(0f) }
    var offsetY by remember { mutableFloatStateOf(0f) }
    val scope = rememberCoroutineScope()
    
    val rotation = offsetX / 20f
    
    Card(
        modifier = Modifier
            .offset { IntOffset(offsetX.roundToInt(), offsetY.roundToInt()) }
            .graphicsLayer(
                rotationZ = rotation
            )
            .pointerInput(Unit) {
                detectDragGestures(
                    onDragEnd = {
                        val threshold = 300f
                        if (offsetX > threshold) {
                            // Animate off screen right
                            onSwipedRight()
                        } else if (offsetX < -threshold) {
                            // Animate off screen left
                            onSwipedLeft()
                        } else {
                            // Snap back
                            offsetX = 0f
                            offsetY = 0f
                        }
                    }
                ) { change, dragAmount ->
                    change.consume()
                    offsetX += dragAmount.x
                    offsetY += dragAmount.y * 0.4f // Less vertical movement
                }
            }
    ) {
        // Card content
    }
}
```

## Performance & Optimization
1. **View Recycling**: If rendering hundreds of cards (like a photo gallery cleaner), do not render them all at once. Render only the top 3-4 cards. When the top card is swiped, remove it and add the next one to the bottom of the stack.
2. **Image Loading**: Swipe cards are image-heavy. Pre-fetch images for the next 5-10 cards in the background to ensure no frame drops when swiping quickly. Use `SDWebImage` (iOS) or `Coil` (Android).
3. **Shadows**: Avoid heavy dynamic shadows during the drag animation as they cause layout passes. Use static shadow assets or simple drop shadows.

## Testing Strategy
1. **UI Tests**: XCUITest/Espresso can simulate swipe gestures. Assert that the card count decreases or the correct callback is fired.
2. **Manual QA**: Gesture tuning requires manual feel. The release threshold (distance/velocity required to commit the swipe) often needs tweaking.
