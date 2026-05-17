package com.example.app.service.media

import android.content.Context
import com.example.app.model.media.LibraryScanResult
import com.example.app.model.media.ScanConfig

class MediaScanOrchestrator(context: Context) {
    private val scanner = MediaStoreScanner(context)
    private val duplicateDetector = DuplicateDetector()
    private val screenCaptureDetector = ScreenCaptureDetector()
    private val sensitiveContentDetector = SensitiveContentDetector()

    fun scan(config: ScanConfig): MediaScanSummary {
        val result: LibraryScanResult = scanner.scan()
        return MediaScanSummary(
            libraryScanResult = result,
            duplicateGroupCount = duplicateDetector.findLikelyDuplicates(result.items).size,
            screenshotGroupCount = if (config.includeScreenshots) screenCaptureDetector.groupScreenshots(result.items).size else 0,
            sensitiveCandidateCount = sensitiveContentDetector.detectCandidates(result.items, config.sensitiveDetectionEnabled).size,
        )
    }
}

data class MediaScanSummary(
    val libraryScanResult: LibraryScanResult,
    val duplicateGroupCount: Int,
    val screenshotGroupCount: Int,
    val sensitiveCandidateCount: Int,
)
