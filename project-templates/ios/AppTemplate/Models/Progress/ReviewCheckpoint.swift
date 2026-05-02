//
//  ReviewCheckpoint.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation

struct ReviewCheckpoint: Codable {
    let sessionId: String
    let lastReviewedIndex: Int
    let totalItems: Int
    let remainingItems: [MediaItem]
    let filterState: FilterState?
    
    init(
        sessionId: String,
        lastReviewedIndex: Int,
        totalItems: Int,
        remainingItems: [MediaItem],
        filterState: FilterState? = nil
    ) {
        self.sessionId = sessionId
        self.lastReviewedIndex = lastReviewedIndex
        self.totalItems = totalItems
        self.remainingItems = remainingItems
        self.filterState = filterState
    }
}

struct ResumeResult: Codable {
    let checkpoint: ReviewCheckpoint
    let canResume: Bool
    let itemsSinceLastSession: NewMediaResult?
    
    init(checkpoint: ReviewCheckpoint, canResume: Bool, itemsSinceLastSession: NewMediaResult? = nil) {
        self.checkpoint = checkpoint
        self.canResume = canResume
        self.itemsSinceLastSession = itemsSinceLastSession
    }
}

struct ResetOptions: Codable {
    let clearAllDecisions: Bool
    let clearSpaceFreedHistory: Bool
    let resetToCheckpoint: String?
    let preserveFilters: Bool
    
    init(
        clearAllDecisions: Bool = false,
        clearSpaceFreedHistory: Bool = false,
        resetToCheckpoint: String? = nil,
        preserveFilters: Bool = true
    ) {
        self.clearAllDecisions = clearAllDecisions
        self.clearSpaceFreedHistory = clearSpaceFreedHistory
        self.resetToCheckpoint = resetToCheckpoint
        self.preserveFilters = preserveFilters
    }
}

struct ResetResult: Codable {
    let decisionsCleared: Int
    let sessionsCleared: Int
    let spaceHistoryCleared: Bool
    
    init(decisionsCleared: Int, sessionsCleared: Int, spaceHistoryCleared: Bool) {
        self.decisionsCleared = decisionsCleared
        self.sessionsCleared = sessionsCleared
        self.spaceHistoryCleared = spaceHistoryCleared
    }
}
