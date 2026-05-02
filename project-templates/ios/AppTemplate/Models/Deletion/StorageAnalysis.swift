//
//  StorageAnalysis.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation

struct StorageSnapshot: Codable {
    let totalSpace: Int64
    let usedSpace: Int64
    let freeSpace: Int64
    let appStorage: Int64
    let mediaStorage: Int64
    let timestamp: Date
    
    init(
        totalSpace: Int64,
        usedSpace: Int64,
        freeSpace: Int64,
        appStorage: Int64,
        mediaStorage: Int64,
        timestamp: Date = Date()
    ) {
        self.totalSpace = totalSpace
        self.usedSpace = usedSpace
        self.freeSpace = freeSpace
        self.appStorage = appStorage
        self.mediaStorage = mediaStorage
        self.timestamp = timestamp
    }
}

struct StorageComparison: Codable {
    let before: StorageSnapshot
    let after: StorageSnapshot
    let spaceFreed: Int64
    let percentageFreed: Double
    
    init(before: StorageSnapshot, after: StorageSnapshot) {
        self.before = before
        self.after = after
        self.spaceFreed = before.usedSpace - after.usedSpace
        self.percentageFreed = before.usedSpace > 0 ? Double(spaceFreed) / Double(before.usedSpace) * 100 : 0
    }
}

struct CategoryStorage: Codable {
    let category: String
    let bytes: Int64
    let percentage: Double
    let itemCount: Int
    
    init(category: String, bytes: Int64, percentage: Double, itemCount: Int) {
        self.category = category
        self.bytes = bytes
        self.percentage = percentage
        self.itemCount = itemCount
    }
}
