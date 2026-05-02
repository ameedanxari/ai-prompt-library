//
//  CacheCleanup.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation

enum CacheType: String, Codable {
    case thumbnailCache
    case mlModelCache
    case temporaryFiles
    case scanCache
}

struct CacheInfo: Codable {
    let type: CacheType
    let size: Int64
    let path: String
    let itemCount: Int
    
    init(type: CacheType, size: Int64, path: String, itemCount: Int) {
        self.type = type
        self.size = size
        self.path = path
        self.itemCount = itemCount
    }
}

struct CacheCleanupResult: Codable {
    let clearedCaches: [CacheInfo]
    let totalBytesFreed: Int64
    let failedCaches: [String]
    
    init(clearedCaches: [CacheInfo], totalBytesFreed: Int64, failedCaches: [String]) {
        self.clearedCaches = clearedCaches
        self.totalBytesFreed = totalBytesFreed
        self.failedCaches = failedCaches
    }
}
