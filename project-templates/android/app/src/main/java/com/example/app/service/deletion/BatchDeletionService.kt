package com.example.app.service.deletion

import com.example.app.model.deletion.DeletionBatch

class BatchDeletionService {
    fun stageDeletion(itemIds: List<String>, requestedBytes: Long): DeletionBatch {
        return DeletionBatch(
            id = "batch-${System.currentTimeMillis()}",
            itemIds = itemIds,
            requestedBytes = requestedBytes,
        )
    }
}
