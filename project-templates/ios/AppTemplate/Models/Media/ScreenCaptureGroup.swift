//
//  ScreenCaptureGroup.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation

struct ScreenCaptureDetectionResult: Codable {
    let isScreenCapture: Bool
    let confidence: Float
    let detectionMethod: DetectionMethod
    
    enum DetectionMethod: String, Codable {
        case metadata
        case mlClassification
        case both
    }
}

struct ScreenCaptureGroup: Identifiable, Codable {
    let id: String
    let screenCaptures: [MediaItem]
    let totalCount: Int
    let totalSize: Int64
    
    init(
        id: String,
        screenCaptures: [MediaItem],
        totalCount: Int,
        totalSize: Int64
    ) {
        self.id = id
        self.screenCaptures = screenCaptures
        self.totalCount = totalCount
        self.totalSize = totalSize
    }
}
