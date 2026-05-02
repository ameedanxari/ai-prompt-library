//
//  SizeFilter.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation

enum SizeUnit: String, Codable {
    case mb
    case gb
}

struct SizeFilterPreset: Codable {
    let label: String
    let minSize: Int64
    let maxSize: Int64?
    let unit: SizeUnit
    
    init(label: String, minSize: Int64, maxSize: Int64? = nil, unit: SizeUnit) {
        self.label = label
        self.minSize = minSize
        self.maxSize = maxSize
        self.unit = unit
    }
}

struct SizeRange: Codable {
    let minBytes: Int64
    let maxBytes: Int64
    
    init(minBytes: Int64, maxBytes: Int64) {
        self.minBytes = minBytes
        self.maxBytes = maxBytes
    }
}

struct SizeFilterResult: Codable {
    let items: [MediaItem]
    let count: Int
    let totalSize: Int64
    let spaceFreed: Int64
    
    init(items: [MediaItem], count: Int, totalSize: Int64, spaceFreed: Int64) {
        self.items = items
        self.count = count
        self.totalSize = totalSize
        self.spaceFreed = spaceFreed
    }
}
