package com.example.app.model.filters

import com.example.app.model.media.MediaType

data class FilterCriteria(
    val mediaTypes: Set<MediaType> = setOf(MediaType.PHOTO, MediaType.VIDEO),
    val olderThanMillis: Long? = null,
    val largerThanBytes: Long? = null,
    val screenshotsOnly: Boolean = false,
    val sensitiveCandidatesOnly: Boolean = false,
)

data class QuickFilter(
    val id: String,
    val title: String,
    val criteria: FilterCriteria,
)
