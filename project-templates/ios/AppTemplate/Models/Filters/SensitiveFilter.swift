//
//  SensitiveFilter.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation

enum SensitiveCategory: String, Codable {
    case document
    case idCard
    case receipt
    case privateInfo
}

struct SensitiveFilterResult: Codable {
    let sensitiveItems: [SensitiveContentResult]
    let totalSensitive: Int
    let categories: [String: Int]
    
    init(sensitiveItems: [SensitiveContentResult], totalSensitive: Int, categories: [String: Int]) {
        self.sensitiveItems = sensitiveItems
        self.totalSensitive = totalSensitive
        self.categories = categories
    }
}

struct ReviewQueue: Codable {
    let highPriority: [MediaItem]
    let mediumPriority: [MediaItem]
    let lowPriority: [MediaItem]
    
    init(highPriority: [MediaItem], mediumPriority: [MediaItem], lowPriority: [MediaItem]) {
        self.highPriority = highPriority
        self.mediumPriority = mediumPriority
        self.lowPriority = lowPriority
    }
}
