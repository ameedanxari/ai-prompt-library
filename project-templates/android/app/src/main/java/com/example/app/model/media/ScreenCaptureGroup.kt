package com.example.app.model.media

data class ScreenCaptureGroup(
    val id: String,
    val itemIds: List<String>,
    val totalBytes: Long,
    val dateRangeLabel: String,
)
