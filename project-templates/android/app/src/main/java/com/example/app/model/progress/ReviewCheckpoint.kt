package com.example.app.model.progress

data class ReviewCheckpoint(
    val sessionId: String,
    val lastReviewedIndex: Int,
    val totalItems: Int,
    val updatedAtMillis: Long,
)
