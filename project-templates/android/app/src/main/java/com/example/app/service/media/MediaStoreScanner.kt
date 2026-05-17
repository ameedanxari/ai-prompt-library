package com.example.app.service.media

import android.content.ContentUris
import android.content.Context
import android.net.Uri
import android.provider.MediaStore
import com.example.app.model.media.LibraryScanResult
import com.example.app.model.media.MediaItem
import com.example.app.model.media.MediaType
import com.example.app.model.media.ScanPhase
import com.example.app.model.media.ScanProgress

class MediaStoreScanner(private val context: Context) {
    fun scan(progress: (ScanProgress) -> Unit = {}): LibraryScanResult {
        val startedAt = System.currentTimeMillis()
        val photos = queryCollection(MediaType.PHOTO)
        val videos = queryCollection(MediaType.VIDEO)
        val items = photos + videos
        items.forEachIndexed { index, _ ->
            progress(ScanProgress(index + 1, items.size, ScanPhase.ENUMERATING))
        }
        return LibraryScanResult(
            items = items,
            totalCount = items.size,
            totalBytes = items.sumOf { it.fileSizeBytes },
            scannedAtMillis = System.currentTimeMillis(),
            scanDurationMillis = System.currentTimeMillis() - startedAt,
        )
    }

    private fun queryCollection(type: MediaType): List<MediaItem> {
        val collection = when (type) {
            MediaType.PHOTO -> MediaStore.Images.Media.EXTERNAL_CONTENT_URI
            MediaType.VIDEO -> MediaStore.Video.Media.EXTERNAL_CONTENT_URI
        }
        val projection = arrayOf(
            MediaStore.MediaColumns._ID,
            MediaStore.MediaColumns.DISPLAY_NAME,
            MediaStore.MediaColumns.DATE_ADDED,
            MediaStore.MediaColumns.DATE_MODIFIED,
            MediaStore.MediaColumns.SIZE,
            MediaStore.MediaColumns.WIDTH,
            MediaStore.MediaColumns.HEIGHT,
            MediaStore.MediaColumns.BUCKET_DISPLAY_NAME,
        )
        val result = mutableListOf<MediaItem>()
        context.contentResolver.query(collection, projection, null, null, "${MediaStore.MediaColumns.DATE_ADDED} DESC")
            ?.use { cursor ->
                val idCol = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns._ID)
                val nameCol = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns.DISPLAY_NAME)
                val addedCol = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns.DATE_ADDED)
                val modifiedCol = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns.DATE_MODIFIED)
                val sizeCol = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns.SIZE)
                val widthCol = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns.WIDTH)
                val heightCol = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns.HEIGHT)
                val bucketCol = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns.BUCKET_DISPLAY_NAME)
                while (cursor.moveToNext()) {
                    val id = cursor.getLong(idCol)
                    val uri: Uri = ContentUris.withAppendedId(collection, id)
                    result += MediaItem(
                        id = "$type:$id",
                        uri = uri.toString(),
                        type = type,
                        creationTimeMillis = cursor.getLong(addedCol) * 1000L,
                        modifiedTimeMillis = cursor.getLong(modifiedCol) * 1000L,
                        fileSizeBytes = cursor.getLong(sizeCol),
                        width = cursor.getInt(widthCol),
                        height = cursor.getInt(heightCol),
                        durationMillis = null,
                        displayName = cursor.getString(nameCol),
                        bucketName = cursor.getString(bucketCol),
                    )
                }
            }
        return result
    }
}
