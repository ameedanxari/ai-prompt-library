package com.example.app.service.media

import com.example.app.model.media.MediaItem
import com.example.app.model.media.ScreenCaptureGroup

class ScreenCaptureDetector {
    fun groupScreenshots(items: List<MediaItem>): List<ScreenCaptureGroup> {
        val screenshots = items.filter {
            it.bucketName?.contains("screenshot", ignoreCase = true) == true ||
                it.displayName?.contains("screenshot", ignoreCase = true) == true
        }
        if (screenshots.isEmpty()) return emptyList()
        return listOf(
            ScreenCaptureGroup(
                id = "screenshots-all",
                itemIds = screenshots.map { it.id },
                totalBytes = screenshots.sumOf { it.fileSizeBytes },
                dateRangeLabel = "All screenshots",
            )
        )
    }
}
