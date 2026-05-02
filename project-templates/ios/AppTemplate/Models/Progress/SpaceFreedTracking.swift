//
//  SpaceFreedTracking.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation

struct SpaceFreedSession: Codable {
    let sessionId: String
    let timestamp: Date
    let itemsDeleted: Int
    let bytesFreed: Int64
    let categoriesDeleted: [String: Int]
    
    init(
        sessionId: String,
        timestamp: Date,
        itemsDeleted: Int,
        bytesFreed: Int64,
        categoriesDeleted: [String: Int]
    ) {
        self.sessionId = sessionId
        self.timestamp = timestamp
        self.itemsDeleted = itemsDeleted
        self.bytesFreed = bytesFreed
        self.categoriesDeleted = categoriesDeleted
    }
}

struct SpaceFreedHistory: Codable {
    let sessions: [SpaceFreedSession]
    let totalFreed: Int64
    let totalSessions: Int
    
    init(sessions: [SpaceFreedSession], totalFreed: Int64, totalSessions: Int) {
        self.sessions = sessions
        self.totalFreed = totalFreed
        self.totalSessions = totalSessions
    }
}

struct CategoryBreakdown: Codable {
    let category: String
    let count: Int
    let bytes: Int64
    
    init(category: String, count: Int, bytes: Int64) {
        self.category = category
        self.count = count
        self.bytes = bytes
    }
}
