//
//  DeletionConfirmation.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation

struct DeletionSummary: Codable {
    let itemCount: Int
    let totalSize: Int64
    let categories: [String: Int]
    let sensitiveItemCount: Int
    
    init(
        itemCount: Int,
        totalSize: Int64,
        categories: [String: Int],
        sensitiveItemCount: Int
    ) {
        self.itemCount = itemCount
        self.totalSize = totalSize
        self.categories = categories
        self.sensitiveItemCount = sensitiveItemCount
    }
}

struct ConfirmationDialogState: Codable {
    let summary: DeletionSummary
    let showDetails: Bool
    let selectedItem: MediaItem?
    
    init(summary: DeletionSummary, showDetails: Bool = false, selectedItem: MediaItem? = nil) {
        self.summary = summary
        self.showDetails = showDetails
        self.selectedItem = selectedItem
    }
}

struct UserConfirmation: Codable {
    let confirmed: Bool
    let reviewedItems: Bool
    let timestamp: Date
    
    init(confirmed: Bool, reviewedItems: Bool, timestamp: Date = Date()) {
        self.confirmed = confirmed
        self.reviewedItems = reviewedItems
        self.timestamp = timestamp
    }
}
