package com.example.app.service.media

import com.example.app.model.media.MediaItem
import com.example.app.model.media.SensitiveCategory
import com.example.app.model.media.SensitiveContentResult

class SensitiveContentDetector {
    fun detectCandidates(items: List<MediaItem>, enabled: Boolean): List<SensitiveContentResult> {
        if (!enabled) return emptyList()
        return items
            .filter { it.displayName?.contains("document", ignoreCase = true) == true }
            .map {
                SensitiveContentResult(
                    itemId = it.id,
                    category = SensitiveCategory.POSSIBLE_DOCUMENT,
                    confidence = 0.7f,
                    explanation = "Filename suggests a document. Review manually.",
                    requiresManualReview = true,
                )
            }
    }
}
