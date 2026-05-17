package com.example.app.model.deletion

data class StorageAnalysis(
    val totalLibraryBytes: Long,
    val reclaimableBytes: Long,
    val duplicateBytes: Long,
    val largeVideoBytes: Long,
    val screenshotBytes: Long,
)
