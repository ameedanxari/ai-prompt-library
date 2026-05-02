//
//  AgeFilter.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation

enum TimeRange: String, Codable {
    case days
    case months
    case years
}

struct AgeFilterPreset: Codable {
    let label: String
    let timeRange: TimeRange
    let value: Int
    
    init(label: String, timeRange: TimeRange, value: Int) {
        self.label = label
        self.timeRange = timeRange
        self.value = value
    }
}

struct DateRange: Codable {
    let startDate: Date
    let endDate: Date
    
    init(startDate: Date, endDate: Date) {
        self.startDate = startDate
        self.endDate = endDate
    }
}

struct AgeFilterResult: Codable {
    let items: [MediaItem]
    let count: Int
    let spaceFreed: Int64
    
    init(items: [MediaItem], count: Int, spaceFreed: Int64) {
        self.items = items
        self.count = count
        self.spaceFreed = spaceFreed
    }
}
