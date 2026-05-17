package com.example.app.service.filters

import com.example.app.model.filters.FilterCriteria
import com.example.app.model.media.MediaItem

class FilterEngine {
    fun apply(items: List<MediaItem>, criteria: FilterCriteria, nowMillis: Long): List<MediaItem> {
        return items.filter { item ->
            item.type in criteria.mediaTypes &&
                (criteria.olderThanMillis == null || item.creationTimeMillis <= nowMillis - criteria.olderThanMillis) &&
                (criteria.largerThanBytes == null || item.fileSizeBytes >= criteria.largerThanBytes) &&
                (!criteria.screenshotsOnly || item.bucketName?.contains("screenshot", ignoreCase = true) == true)
        }
    }
}
