package com.example.app.model.media

data class DuplicateGroup(
    val id: String,
    val representativeItemId: String,
    val itemIds: List<String>,
    val confidence: Float,
    val reclaimableBytes: Long,
)
