package com.example.app.service.media

import com.example.app.model.media.LargeFileAnalysis
import com.example.app.model.media.MediaItem

class LargeFileDetector {
    fun analyze(items: List<MediaItem>, minimumBytes: Long): List<LargeFileAnalysis> {
        val sorted = items.sortedBy { it.fileSizeBytes }
        return sorted
            .filter { it.fileSizeBytes >= minimumBytes }
            .map { item ->
                val rank = (sorted.indexOf(item) + 1).toFloat() / sorted.size.coerceAtLeast(1)
                LargeFileAnalysis(
                    itemId = item.id,
                    fileSizeBytes = item.fileSizeBytes,
                    percentileRank = rank,
                    reason = "Large file candidate",
                )
            }
    }
}
