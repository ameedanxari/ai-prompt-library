//
//  LibraryScanResult.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation

struct LibraryScanResult: Codable {
    let items: [MediaItem]
    let totalCount: Int
    let scanDuration: TimeInterval
    let lastScannedAt: Date
    
    init(
        items: [MediaItem],
        totalCount: Int,
        scanDuration: TimeInterval,
        lastScannedAt: Date
    ) {
        self.items = items
        self.totalCount = totalCount
        self.scanDuration = scanDuration
        self.lastScannedAt = lastScannedAt
    }
}

struct ScanProgress: Codable {
    let current: Int
    let total: Int
    let phase: ScanPhase
    
    enum ScanPhase: String, Codable {
        case enumerating
        case analyzing
        case complete
    }
    
    var progress: Double {
        guard total > 0 else { return 0 }
        return Double(current) / Double(total)
    }
}
