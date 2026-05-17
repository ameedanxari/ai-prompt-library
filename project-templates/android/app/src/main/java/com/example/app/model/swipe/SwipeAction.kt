package com.example.app.model.swipe

import com.example.app.model.media.MediaItem

data class SwipeAction(
    val item: MediaItem,
    val type: SwipeActionType,
)

enum class SwipeActionType {
    KEEP,
    DELETE,
    SKIP,
}
