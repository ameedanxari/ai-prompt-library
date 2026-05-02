//
//  DeletionBatch.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation

enum DeletionStatus: String, Codable {
    case pending
    case inProgress
    case completed
    case failed
}

struct DeletionBatch: Codable {
    let id: String
    let items: [MediaItem]
    let status: DeletionStatus
    let startedAt: Date?
    let completedAt: Date?
    let bytesFreed: Int64
    
    init(
        id: String,
        items: [MediaItem],
        status: DeletionStatus = .pending,
        startedAt: Date? = nil,
        completedAt: Date? = nil,
        bytesFreed: Int64 = 0
    ) {
        self.id = id
        self.items = items
        self.status = status
        self.startedAt = startedAt
        self.completedAt = completedAt
        self.bytesFreed = bytesFreed
    }
}

struct DeletionProgress: Codable {
    let batchId: String
    let completed: Int
    let total: Int
    let currentItem: MediaItem?
    let error: DeletionError?
    
    init(
        batchId: String,
        completed: Int,
        total: Int,
        currentItem: MediaItem? = nil,
        error: DeletionError? = nil
    ) {
        self.batchId = batchId
        self.completed = completed
        self.total = total
        self.currentItem = currentItem
        self.error = error
    }
}

struct DeletionError: Codable {
    let itemId: String
    let message: String
    let recoverable: Bool
    
    init(itemId: String, message: String, recoverable: Bool) {
        self.itemId = itemId
        self.message = message
        self.recoverable = recoverable
    }
}
