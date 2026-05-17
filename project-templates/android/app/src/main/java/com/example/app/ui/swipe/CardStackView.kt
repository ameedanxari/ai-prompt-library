package com.example.app.ui.swipe

import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.unit.dp
import com.example.app.model.media.MediaItem
import com.example.app.model.swipe.SwipeAction
import com.example.app.model.swipe.SwipeActionType
import com.example.app.ui.glass.GlassCard
import kotlin.math.abs

@Composable
fun CardStackView(
    items: List<MediaItem>,
    onSwipe: (SwipeAction) -> Unit,
    modifier: Modifier = Modifier,
) {
    var currentIndex by remember { mutableIntStateOf(0) }
    var offsetX by remember { mutableFloatStateOf(0f) }
    var offsetY by remember { mutableFloatStateOf(0f) }
    val currentItem = items.getOrNull(currentIndex)

    Column(modifier = modifier) {
        ReviewProgressView(reviewed = currentIndex, total = items.size, modifier = Modifier.fillMaxWidth())
        Spacer(modifier = Modifier.height(16.dp))
        if (currentItem == null) {
            Text("No more items to review")
        } else {
            GlassCard(
                modifier = Modifier
                    .fillMaxWidth()
                    .graphicsLayer {
                        translationX = offsetX
                        translationY = offsetY * 0.4f
                        rotationZ = offsetX / 32f
                    }
                    .pointerInput(currentItem.id) {
                        detectDragGestures(
                            onDragEnd = {
                                if (abs(offsetX) > 240f) {
                                    val action = if (offsetX > 0) SwipeActionType.KEEP else SwipeActionType.DELETE
                                    onSwipe(SwipeAction(currentItem, action))
                                    currentIndex += 1
                                }
                                offsetX = 0f
                                offsetY = 0f
                            }
                        ) { change, dragAmount ->
                            change.consume()
                            offsetX += dragAmount.x
                            offsetY += dragAmount.y
                        }
                    }
            ) {
                MediaPreviewView(currentItem)
                Spacer(modifier = Modifier.height(12.dp))
                Text(currentItem.displayName ?: currentItem.id)
                Text("${currentItem.width} x ${currentItem.height}")
            }
        }
    }
}
