package com.example.app.model.media

data class ScanConfig(
    val includePhotos: Boolean = true,
    val includeVideos: Boolean = true,
    val minimumFileSizeBytes: Long = 0,
    val includeScreenshots: Boolean = true,
    val sensitiveDetectionEnabled: Boolean = false,
)
