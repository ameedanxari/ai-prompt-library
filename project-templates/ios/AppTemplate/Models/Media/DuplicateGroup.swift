//
//  DuplicateGroup.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation

struct DuplicateGroup: Identifiable, Codable {
    let id: String
    let items: [MediaItem]
    let similarityScore: Float
    let confidence: Confidence
    
    enum Confidence: String, Codable {
        case high
        case medium
        case low
    }
    
    init(
        id: String,
        items: [MediaItem],
        similarityScore: Float,
        confidence: Confidence
    ) {
        self.id = id
        self.items = items
        self.similarityScore = similarityScore
        self.confidence = confidence
    }
}

struct DuplicateAnalysisResult: Codable {
    let groups: [DuplicateGroup]
    let totalDuplicates: Int
    let spaceRecoverable: Int64
    
    init(
        groups: [DuplicateGroup],
        totalDuplicates: Int,
        spaceRecoverable: Int64
    ) {
        self.groups = groups
        self.totalDuplicates = totalDuplicates
        self.spaceRecoverable = spaceRecoverable
    }
}

struct SimilarityHash: Codable {
    let perceptualHash: String
    let metadataHash: String
    let featureVector: [Float]
}
