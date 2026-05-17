package com.example.app.model.media

data class MediaItem(
    val id: String,
    val uri: String,
    val type: MediaType,
    val creationTimeMillis: Long,
    val modifiedTimeMillis: Long,
    val fileSizeBytes: Long,
    val width: Int,
    val height: Int,
    val durationMillis: Long?,
    val displayName: String?,
    val bucketName: String?,
)

enum class MediaType {
    PHOTO,
    VIDEO,
}
