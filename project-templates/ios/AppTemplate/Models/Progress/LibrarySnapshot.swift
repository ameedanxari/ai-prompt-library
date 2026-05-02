//
//  LibrarySnapshot.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation

struct LibrarySnapshot: Codable {
    let items: [MediaItem]
    let hash: String
    let timestamp: Date
    let totalCount: Int
    
    init(items: [MediaItem], hash: String, timestamp: Date = Date(), totalCount: Int) {
        self.items = items
        self.hash = hash
        self.timestamp = timestamp
        self.totalCount = totalCount
    }
}

struct MediaDiff: Codable {
    let newItems: [MediaItem]
    let removedItems: [MediaItem]
    let modifiedItems: [MediaItem]
    
    init(newItems: [MediaItem], removedItems: [MediaItem], modifiedItems: [MediaItem]) {
        self.newItems = newItems
        self.removedItems = removedItems
        self.modifiedItems = modifiedItems
    }
}

struct NewMediaResult: Codable {
    let newItems: [MediaItem]
    let count: Int
    let totalSize: Int64
    
    init(newItems: [MediaItem], count: Int, totalSize: Int64) {
        self.newItems = newItems
        self.count = count
        self.totalSize = totalSize
    }
}
