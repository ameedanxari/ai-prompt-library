//
//  ReviewProgress.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation

struct ReviewProgress {
    let currentIndex: Int
    let totalItems: Int
    let reviewedCount: Int
    let keptCount: Int
    let deletedCount: Int
    
    init(
        currentIndex: Int = 0,
        totalItems: Int = 0,
        reviewedCount: Int = 0,
        keptCount: Int = 0,
        deletedCount: Int = 0
    ) {
        self.currentIndex = currentIndex
        self.totalItems = totalItems
        self.reviewedCount = reviewedCount
        self.keptCount = keptCount
        self.deletedCount = deletedCount
    }
    
    var progress: Double {
        guard totalItems > 0 else { return 0 }
        return Double(reviewedCount) / Double(totalItems)
    }
    
    var remainingCount: Int {
        return totalItems - reviewedCount
    }
}

struct ProgressIndicatorConfig {
    let showCount: Bool
    let showBar: Bool
    let showStats: Bool
    
    init(
        showCount: Bool = true,
        showBar: Bool = true,
        showStats: Bool = true
    ) {
        self.showCount = showCount
        self.showBar = showBar
        self.showStats = showStats
    }
}
