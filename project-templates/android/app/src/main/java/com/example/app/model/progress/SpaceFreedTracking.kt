package com.example.app.model.progress

data class SpaceFreedSession(
    val id: String,
    val completedAtMillis: Long,
    val bytesFreed: Long,
    val deletedItemCount: Int,
)

data class SpaceFreedTracking(
    val sessions: List<SpaceFreedSession> = emptyList(),
) {
    val totalBytesFreed: Long = sessions.sumOf { it.bytesFreed }
}
