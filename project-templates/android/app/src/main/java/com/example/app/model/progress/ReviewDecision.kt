package com.example.app.model.progress

data class ReviewDecision(
    val itemId: String,
    val action: ReviewAction,
    val decidedAtMillis: Long,
    val sessionId: String,
)

enum class ReviewAction {
    KEEP,
    DELETE,
    SKIP,
}
