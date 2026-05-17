package com.example.app.service.media

import com.example.app.model.media.DuplicateGroup
import com.example.app.model.media.MediaItem

class DuplicateDetector {
    fun findLikelyDuplicates(items: List<MediaItem>): List<DuplicateGroup> {
        return items
            .groupBy { "${it.fileSizeBytes}:${it.width}:${it.height}:${it.durationMillis}" }
            .filterValues { it.size > 1 }
            .map { (key, group) ->
                DuplicateGroup(
                    id = "duplicate-$key",
                    representativeItemId = group.first().id,
                    itemIds = group.map { it.id },
                    confidence = 0.85f,
                    reclaimableBytes = group.drop(1).sumOf { it.fileSizeBytes },
                )
            }
    }
}
