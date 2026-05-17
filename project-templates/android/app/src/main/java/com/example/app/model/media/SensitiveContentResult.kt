package com.example.app.model.media

data class SensitiveContentResult(
    val itemId: String,
    val category: SensitiveCategory,
    val confidence: Float,
    val explanation: String,
    val requiresManualReview: Boolean = true,
)

enum class SensitiveCategory {
    POSSIBLE_DOCUMENT,
    POSSIBLE_ID_CARD,
    POSSIBLE_SCREENSHOT_WITH_TEXT,
    UNKNOWN,
}
