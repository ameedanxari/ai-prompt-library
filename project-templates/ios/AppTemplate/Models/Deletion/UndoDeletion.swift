//
//  UndoDeletion.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation

struct UndoWindow: Codable {
    let batchId: String
    let expiresAt: Date
    let items: [MediaItem]
    let canUndo: Bool
    
    init(batchId: String, expiresAt: Date, items: [MediaItem], canUndo: Bool = true) {
        self.batchId = batchId
        self.expiresAt = expiresAt
        self.items = items
        self.canUndo = canUndo
    }
}

enum UndoActionType: String, Codable {
    case restore
    case permanent
}

struct UndoAction: Codable {
    let type: UndoActionType
    let batchId: String
    let timestamp: Date
    
    init(type: UndoActionType, batchId: String, timestamp: Date = Date()) {
        self.type = type
        self.batchId = batchId
        self.timestamp = timestamp
    }
}

struct UndoResult: Codable {
    let restoredItems: [MediaItem]
    let failedRestorations: [String]
    
    init(restoredItems: [MediaItem], failedRestorations: [String]) {
        self.restoredItems = restoredItems
        self.failedRestorations = failedRestorations
    }
}
