package com.example.app.service.progress

import android.content.Context
import com.example.app.model.progress.ReviewAction
import com.example.app.model.progress.ReviewCheckpoint
import com.example.app.model.progress.ReviewDecision

class ReviewStatePersistence(context: Context) {
    private val preferences = context.getSharedPreferences("review_state", Context.MODE_PRIVATE)

    fun saveDecision(decision: ReviewDecision) {
        preferences.edit()
            .putString("decision:${decision.itemId}", decision.action.name)
            .putLong("decisionAt:${decision.itemId}", decision.decidedAtMillis)
            .apply()
    }

    fun loadDecision(itemId: String): ReviewAction? {
        return preferences.getString("decision:$itemId", null)?.let { ReviewAction.valueOf(it) }
    }

    fun saveCheckpoint(checkpoint: ReviewCheckpoint) {
        preferences.edit()
            .putString("checkpoint.sessionId", checkpoint.sessionId)
            .putInt("checkpoint.lastReviewedIndex", checkpoint.lastReviewedIndex)
            .putInt("checkpoint.totalItems", checkpoint.totalItems)
            .putLong("checkpoint.updatedAtMillis", checkpoint.updatedAtMillis)
            .apply()
    }

    fun loadCheckpoint(): ReviewCheckpoint? {
        val sessionId = preferences.getString("checkpoint.sessionId", null) ?: return null
        return ReviewCheckpoint(
            sessionId = sessionId,
            lastReviewedIndex = preferences.getInt("checkpoint.lastReviewedIndex", 0),
            totalItems = preferences.getInt("checkpoint.totalItems", 0),
            updatedAtMillis = preferences.getLong("checkpoint.updatedAtMillis", 0),
        )
    }
}
