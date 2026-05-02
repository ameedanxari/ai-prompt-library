//
//  LargeFileAnalysis.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation

struct LargeFileItem: Identifiable, Codable {
    let item: MediaItem
    let size: Int64
    let sizeCategory: SizeCategory
    
    enum SizeCategory: String, Codable {
        case large
        case veryLarge
        case massive
    }
}

struct LargeFileAnalysis: Codable {
    let largeFiles: [LargeFileItem]
    let totalSize: Int64
    let count: Int
    let threshold: Int64
    
    init(
        largeFiles: [LargeFileItem],
        totalSize: Int64,
        count: Int,
        threshold: Int64
    ) {
        self.largeFiles = largeFiles
        self.totalSize = totalSize
        self.count = count
        self.threshold = threshold
    }
}
