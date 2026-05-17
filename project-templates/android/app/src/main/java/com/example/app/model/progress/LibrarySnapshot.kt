package com.example.app.model.progress

data class LibrarySnapshot(
    val id: String,
    val scannedAtMillis: Long,
    val visibleItemIds: Set<String>,
    val authorizationScope: String,
) {
    fun diff(previous: LibrarySnapshot?): SnapshotDiff {
        if (previous == null) {
            return SnapshotDiff(added = visibleItemIds, removed = emptySet(), unchanged = emptySet())
        }
        return SnapshotDiff(
            added = visibleItemIds - previous.visibleItemIds,
            removed = previous.visibleItemIds - visibleItemIds,
            unchanged = visibleItemIds.intersect(previous.visibleItemIds),
        )
    }
}

data class SnapshotDiff(
    val added: Set<String>,
    val removed: Set<String>,
    val unchanged: Set<String>,
)
