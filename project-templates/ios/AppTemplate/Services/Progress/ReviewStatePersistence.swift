//
//  ReviewStatePersistence.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation

class ReviewStatePersistence {
    private static let reviewStateKey = "com.example.app.reviewState"
    private static let decisionsKey = "com.example.app.reviewDecisions"
    private static let spaceHistoryKey = "com.example.app.spaceHistory"
    private static let checkpointKey = "com.example.app.checkpoint"
    
    static func saveReviewDecision(_ decision: ReviewDecision) async throws {
        var state = try loadReviewState()
        var decisions = state.allDecisions
        
        // Update or add decision
        if let index = decisions.firstIndex(where: { $0.itemId == decision.itemId }) {
            decisions[index] = decision
        } else {
            decisions.append(decision)
        }
        
        state = ReviewState(
            currentSession: state.currentSession,
            allDecisions: decisions,
            lastScanHash: state.lastScanHash
        )
        
        try saveReviewState(state)
    }
    
    static func loadReviewState() async throws -> ReviewState {
        guard let data = UserDefaults.standard.data(forKey: reviewStateKey),
              let decoded = try? JSONDecoder().decode(ReviewState.self, from: data) else {
            return ReviewState()
        }
        return decoded
    }
    
    private static func saveReviewState(_ state: ReviewState) throws {
        let encoded = try JSONEncoder().encode(state)
        UserDefaults.standard.set(encoded, forKey: reviewStateKey)
    }
    
    static func recordSpaceFreed(session: SpaceFreedSession) async throws {
        var history = try getSpaceFreedHistory()
        var sessions = history.sessions
        sessions.append(session)
        
        let totalFreed = sessions.reduce(0) { $0 + $1.bytesFreed }
        
        let newHistory = SpaceFreedHistory(
            sessions: sessions,
            totalFreed: totalFreed,
            totalSessions: sessions.count
        )
        
        let encoded = try JSONEncoder().encode(newHistory)
        UserDefaults.standard.set(encoded, forKey: spaceHistoryKey)
    }
    
    static func getSpaceFreedHistory() async throws -> SpaceFreedHistory {
        guard let data = UserDefaults.standard.data(forKey: spaceHistoryKey),
              let decoded = try? JSONDecoder().decode(SpaceFreedHistory.self, from: data) else {
            return SpaceFreedHistory(sessions: [], totalFreed: 0, totalSessions: 0)
        }
        return decoded
    }
    
    static func getSpaceFreedSummary() async throws -> (totalFreed: Int64, lastSession: SpaceFreedSession?) {
        let history = try getSpaceFreedHistory()
        let lastSession = history.sessions.last
        return (history.totalFreed, lastSession)
    }
    
    static func createCheckpoint(session: ReviewSession, currentIndex: Int) -> ReviewCheckpoint {
        return ReviewCheckpoint(
            sessionId: session.id,
            lastReviewedIndex: currentIndex,
            totalItems: session.totalItems,
            remainingItems: []
        )
    }
    
    static func saveCheckpoint(_ checkpoint: ReviewCheckpoint) async throws {
        let encoded = try JSONEncoder().encode(checkpoint)
        UserDefaults.standard.set(encoded, forKey: checkpointKey)
    }
    
    static func loadCheckpoint() async throws -> ReviewCheckpoint? {
        guard let data = UserDefaults.standard.data(forKey: checkpointKey),
              let decoded = try? JSONDecoder().decode(ReviewCheckpoint.self, from: data) else {
            return nil
        }
        return decoded
    }
    
    static func resetProgress(options: ResetOptions) async throws -> ResetResult {
        var decisionsCleared = 0
        var sessionsCleared = 0
        var spaceHistoryCleared = false
        
        if options.clearAllDecisions {
            let state = try loadReviewState()
            decisionsCleared = state.allDecisions.count
            UserDefaults.standard.removeObject(forKey: reviewStateKey)
        }
        
        if options.clearSpaceFreedHistory {
            UserDefaults.standard.removeObject(forKey: spaceHistoryKey)
            spaceHistoryCleared = true
        }
        
        if options.resetToCheckpoint != nil {
            UserDefaults.standard.removeObject(forKey: checkpointKey)
            sessionsCleared = 1
        }
        
        return ResetResult(
            decisionsCleared: decisionsCleared,
            sessionsCleared: sessionsCleared,
            spaceHistoryCleared: spaceHistoryCleared
        )
    }
}
