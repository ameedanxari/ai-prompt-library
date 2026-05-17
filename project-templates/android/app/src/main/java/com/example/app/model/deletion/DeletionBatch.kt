package com.example.app.model.deletion

data class DeletionBatch(
    val id: String,
    val itemIds: List<String>,
    val requestedBytes: Long,
    val status: DeletionStatus = DeletionStatus.STAGED,
)

enum class DeletionStatus {
    STAGED,
    CONFIRMED,
    COMPLETED,
    FAILED,
}
