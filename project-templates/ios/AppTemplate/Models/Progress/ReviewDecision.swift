//
//  ReviewDecision.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation

enum DecisionType: String, Codable {
    case keep
    case delete
    case pending
}

struct ReviewDecision: Codable {
    let itemId: String
    let decision: DecisionType
    let timestamp: Date
    let reviewSessionId: String
    
    init(itemId: String, decision: DecisionType, timestamp: Date = Date(), reviewSessionId: String) {
        self.itemId = itemId
        self.decision = decision
        self.timestamp = timestamp
        self.reviewSessionId = reviewSessionId
    }
}

struct ReviewSession: Codable {
    let id: String
    let startedAt: Date
    let completedAt: Date?
    let totalItems: Int
    let reviewedCount: Int
    
    init(
        id: String,
        startedAt: Date,
        completedAt: Date? = nil,
        totalItems: Int,
        reviewedCount: Int
    ) {
        self.id = id
        self.startedAt = startedAt
        self.completedAt = completedAt
        self.totalItems = totalItems
        self.reviewedCount = reviewedCount
    }
}

struct ReviewState: Codable {
    let currentSession: ReviewSession?
    let allDecisions: [ReviewDecision]
    let lastScanHash: String
    
    init(
        currentSession: ReviewSession? = nil,
        allDecisions: [ReviewDecision] = [],
        lastScanHash: String = ""
    ) {
        self.currentSession = currentSession
        self.allDecisions = allDecisions
        self.lastScanHash = lastScanHash
    }
}
