//
//  SensitiveContentDetector.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation
import Vision

class SensitiveContentDetector {
    
    func detectSensitiveContent(items: [MediaItem]) async throws -> [SensitiveContentResult] {
        var results: [SensitiveContentResult] = []
        
        for item in items {
            let classification = await classifySensitiveContent(item: item)
            let requiresReview = classification.category != .none
            
            let result = SensitiveContentResult(
                id: UUID().uuidString,
                item: item,
                classification: classification,
                requiresReview: requiresReview
            )
            results.append(result)
        }
        
        return results
    }
    
    private func classifySensitiveContent(item: MediaItem) async -> SensitiveContentClassification {
        // In production, this would use Vision framework for object detection
        // For now, use heuristics based on metadata
        
        // Check for document-like characteristics
        if isDocumentLike(item: item) {
            return SensitiveContentClassification(
                category: .document,
                confidence: 0.6,
                boundingBoxes: []
            )
        }
        
        // Check for ID card patterns
        if isIDCardLike(item: item) {
            return SensitiveContentClassification(
                category: .idCard,
                confidence: 0.7,
                boundingBoxes: []
            )
        }
        
        // Check for receipt patterns
        if isReceiptLike(item: item) {
            return SensitiveContentClassification(
                category: .receipt,
                confidence: 0.6,
                boundingBoxes: []
            )
        }
        
        return SensitiveContentClassification(
            category: .none,
            confidence: 0.0,
            boundingBoxes: []
        )
    }
    
    private func isDocumentLike(item: MediaItem) -> Bool {
        // Check aspect ratio typical of documents (A4, letter, etc.)
        let aspectRatio = Double(item.width) / Double(item.height)
        let documentRatios = [0.707, 0.773, 1.414, 1.294] // Common document ratios
        
        for ratio in documentRatios {
            if abs(aspectRatio - ratio) < 0.1 {
                return true
            }
        }
        
        return false
    }
    
    private func isIDCardLike(item: MediaItem) -> Bool {
        // ID cards typically have specific aspect ratios
        let aspectRatio = Double(item.width) / Double(item.height)
        let idCardRatios = [1.586, 1.429] // Common ID card ratios
        
        for ratio in idCardRatios {
            if abs(aspectRatio - ratio) < 0.1 {
                return true
            }
        }
        
        return false
    }
    
    private func isReceiptLike(item: MediaItem) -> Bool {
        // Receipts are typically tall and narrow
        let aspectRatio = Double(item.width) / Double(item.height)
        return aspectRatio < 0.5
    }
}
