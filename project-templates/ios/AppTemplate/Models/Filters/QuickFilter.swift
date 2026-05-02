//
//  QuickFilter.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation

enum QuickFilterType: String, Codable {
    case screenshots
    case burstPhotos
    case livePhotos
    case videos
    case duplicates
    case largeFiles
}

struct QuickFilterResult: Codable {
    let filterType: QuickFilterType
    let items: [MediaItem]
    let count: Int
    let spaceFreed: Int64
    
    init(filterType: QuickFilterType, items: [MediaItem], count: Int, spaceFreed: Int64) {
        self.filterType = filterType
        self.items = items
        self.count = count
        self.spaceFreed = spaceFreed
    }
}

struct QuickFilterConfig: Codable {
    let enabledFilters: [QuickFilterType]
    let autoApply: Bool
    
    init(enabledFilters: [QuickFilterType], autoApply: Bool = false) {
        self.enabledFilters = enabledFilters
        self.autoApply = autoApply
    }
}
