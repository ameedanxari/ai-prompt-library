package com.example.app.model.swipe

data class SwipeState(
    val currentIndex: Int = 0,
    val offsetX: Float = 0f,
    val offsetY: Float = 0f,
    val isDragging: Boolean = false,
)
