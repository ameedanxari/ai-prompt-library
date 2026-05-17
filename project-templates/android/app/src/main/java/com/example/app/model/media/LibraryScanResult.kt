package com.example.app.model.media

data class LibraryScanResult(
    val items: List<MediaItem>,
    val totalCount: Int,
    val totalBytes: Long,
    val scannedAtMillis: Long,
    val scanDurationMillis: Long,
)

data class ScanProgress(
    val current: Int,
    val total: Int,
    val phase: ScanPhase,
)

enum class ScanPhase {
    AUTHORIZATION,
    ENUMERATING,
    ANALYZING,
    COMPLETE,
}
