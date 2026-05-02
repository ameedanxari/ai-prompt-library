//
//  ScreenCaptureDetector.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation
import Photos

class ScreenCaptureDetector {
    
    func detectScreenCaptures(items: [MediaItem]) async throws -> ScreenCaptureGroup {
        var screenCaptures: [MediaItem] = []
        
        for item in items {
            let result = await analyzeForScreenCapture(item: item)
            if result.isScreenCapture {
                screenCaptures.append(item)
            }
        }
        
        let totalSize = screenCaptures.reduce(0) { $0 + $1.fileSize }
        
        return ScreenCaptureGroup(
            id: UUID().uuidString,
            screenCaptures: screenCaptures,
            totalCount: screenCaptures.count,
            totalSize: totalSize
        )
    }
    
    private func analyzeForScreenCapture(item: MediaItem) async -> ScreenCaptureDetectionResult {
        // Check metadata first
        let metadataResult = checkMetadataForScreenCapture(item: item)
        if metadataResult.isScreenCapture {
            return metadataResult
        }
        
        // ML classification would go here in production
        // For now, use heuristics based on filename patterns
        let mlResult = checkFilenamePatterns(item: item)
        
        if mlResult.isScreenCapture {
            return ScreenCaptureDetectionResult(
                isScreenCapture: true,
                confidence: mlResult.confidence,
                detectionMethod: .mlClassification
            )
        }
        
        return ScreenCaptureDetectionResult(
            isScreenCapture: false,
            confidence: 0.0,
            detectionMethod: .metadata
        )
    }
    
    private func checkMetadataForScreenCapture(item: MediaItem) -> ScreenCaptureDetectionResult {
        // Check if the asset has screen capture metadata
        // This would check PHAssetResource properties in production
        let assetIdentifier = item.assetIdentifier.lowercased()
        
        // Common screen capture patterns in asset identifiers
        let screenCaptureKeywords = ["screenshot", "screen", "capture"]
        
        for keyword in screenCaptureKeywords {
            if assetIdentifier.contains(keyword) {
                return ScreenCaptureDetectionResult(
                    isScreenCapture: true,
                    confidence: 0.9,
                    detectionMethod: .metadata
                )
            }
        }
        
        return ScreenCaptureDetectionResult(
            isScreenCapture: false,
            confidence: 0.0,
            detectionMethod: .metadata
        )
    }
    
    private func checkFilenamePatterns(item: MediaItem) -> ScreenCaptureDetectionResult {
        // Check common screen capture filename patterns
        let uri = item.uri.lowercased()
        
        let patterns = [
            "screenshot",
            "screen_shot",
            "screen-recording",
            "capture"
        ]
        
        for pattern in patterns {
            if uri.contains(pattern) {
                return ScreenCaptureDetectionResult(
                    isScreenCapture: true,
                    confidence: 0.7,
                    detectionMethod: .mlClassification
                )
            }
        }
        
        return ScreenCaptureDetectionResult(
            isScreenCapture: false,
            confidence: 0.0,
            detectionMethod: .mlClassification
        )
    }
}
