package com.example.app.model.media

data class LargeFileAnalysis(
    val itemId: String,
    val fileSizeBytes: Long,
    val percentileRank: Float,
    val reason: String,
)
