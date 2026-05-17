package com.example.app.service.deletion

import com.example.app.model.deletion.StorageAnalysis
import com.example.app.model.media.MediaItem

class StorageAnalysisService {
    fun summarize(items: List<MediaItem>, duplicateBytes: Long = 0): StorageAnalysis {
        val largeVideoBytes = items
            .filter { it.durationMillis != null && it.fileSizeBytes >= 100L * 1024L * 1024L }
            .sumOf { it.fileSizeBytes }
        val screenshotBytes = items
            .filter { it.bucketName?.contains("screenshot", ignoreCase = true) == true }
            .sumOf { it.fileSizeBytes }
        return StorageAnalysis(
            totalLibraryBytes = items.sumOf { it.fileSizeBytes },
            reclaimableBytes = duplicateBytes + largeVideoBytes + screenshotBytes,
            duplicateBytes = duplicateBytes,
            largeVideoBytes = largeVideoBytes,
            screenshotBytes = screenshotBytes,
        )
    }
}
