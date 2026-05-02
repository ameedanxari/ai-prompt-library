//
//  SensitiveContentResult.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation

struct SensitiveContentClassification: Codable {
    let category: Category
    let confidence: Float
    let boundingBoxes: [BoundingBox]
    
    enum Category: String, Codable {
        case document
        case idCard
        case receipt
        case privateInfo
        case none
    }
}

struct BoundingBox: Codable {
    let x: Float
    let y: Float
    let width: Float
    let height: Float
    let label: String
}

struct SensitiveContentResult: Identifiable, Codable {
    let id: String
    let item: MediaItem
    let classification: SensitiveContentClassification
    let requiresReview: Bool
    
    init(
        id: String,
        item: MediaItem,
        classification: SensitiveContentClassification,
        requiresReview: Bool
    ) {
        self.id = id
        self.item = item
        self.classification = classification
        self.requiresReview = requiresReview
    }
}
