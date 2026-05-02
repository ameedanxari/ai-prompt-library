//
//  DuplicateDetector.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation
import CoreImage
import UIKit

class DuplicateDetector {
    
    func detectDuplicates(items: [MediaItem]) async throws -> DuplicateAnalysisResult {
        var groups: [DuplicateGroup] = []
        var processedItems = Set<String>()
        var totalDuplicates = 0
        var spaceRecoverable: Int64 = 0
        
        // Group items by size and dimensions for initial filtering
        let sizeGroups = Dictionary(grouping: items) { item in
            "\(item.fileSize)_\(item.width)_\(item.height)"
        }
        
        for (_, groupItems) in sizeGroups {
            if groupItems.count > 1 {
                // Calculate similarity hashes
                let hashes = try await calculateSimilarityHashes(for: groupItems)
                
                // Group by similar hashes
                let duplicateGroups = groupBySimilarity(items: groupItems, hashes: hashes)
                
                for duplicateGroup in duplicateGroups {
                    if duplicateGroup.items.count > 1 {
                        let groupId = UUID().uuidString
                        let similarityScore = calculateGroupSimilarity(group: duplicateGroup)
                        let confidence = determineConfidence(score: similarityScore)
                        
                        let group = DuplicateGroup(
                            id: groupId,
                            items: duplicateGroup.items,
                            similarityScore: similarityScore,
                            confidence: confidence
                        )
                        groups.append(group)
                        
                        totalDuplicates += duplicateGroup.items.count - 1
                        spaceRecoverable += duplicateGroup.items.dropFirst().reduce(0) { $0 + $1.fileSize }
                    }
                }
            }
        }
        
        return DuplicateAnalysisResult(
            groups: groups,
            totalDuplicates: totalDuplicates,
            spaceRecoverable: spaceRecoverable
        )
    }
    
    private func calculateSimilarityHashes(for items: [MediaItem]) async throws -> [String: SimilarityHash] {
        var hashes: [String: SimilarityHash] = [:]
        
        for item in items {
            let perceptualHash = try await calculatePerceptualHash(for: item)
            let metadataHash = calculateMetadataHash(for: item)
            let featureVector = calculateFeatureVector(for: item)
            
            hashes[item.id] = SimilarityHash(
                perceptualHash: perceptualHash,
                metadataHash: metadataHash,
                featureVector: featureVector
            )
        }
        
        return hashes
    }
    
    private func calculatePerceptualHash(for item: MediaItem) async throws -> String {
        // Simplified perceptual hash calculation
        // In production, this would use CoreML Vision framework
        return item.assetIdentifier.prefix(16).lowercased()
    }
    
    private func calculateMetadataHash(for item: MediaItem) -> String {
        let metadata = "\(item.fileSize)_\(item.width)_\(item.height)_\(item.creationDate.timeIntervalSince1970)"
        return metadata.md5()
    }
    
    private func calculateFeatureVector(for item: MediaItem) -> [Float] {
        // Simplified feature vector based on metadata
        return [
            Float(item.width) / 4096.0,
            Float(item.height) / 4096.0,
            Float(item.fileSize) / 1_000_000_000.0,
            Float(item.type == .video ? 1 : 0)
        ]
    }
    
    private func groupBySimilarity(items: [MediaItem], hashes: [String: SimilarityHash]) -> [DuplicateGroup] {
        var groups: [DuplicateGroup] = []
        var processed = Set<String>()
        
        for item in items {
            if processed.contains(item.id) { continue }
            
            let itemHash = hashes[item.id]
            var similarItems = [item]
            processed.insert(item.id)
            
            for otherItem in items {
                if otherItem.id == item.id || processed.contains(otherItem.id) { continue }
                
                let otherHash = hashes[otherItem.id]
                if let similarity = calculateHashSimilarity(itemHash, otherHash), similarity > 0.85 {
                    similarItems.append(otherItem)
                    processed.insert(otherItem.id)
                }
            }
            
            if similarItems.count > 1 {
                let groupId = UUID().uuidString
                let similarityScore = similarItems.count > 1 ? 0.9 : 0.0
                
                groups.append(DuplicateGroup(
                    id: groupId,
                    items: similarItems,
                    similarityScore: similarityScore,
                    confidence: .high
                ))
            }
        }
        
        return groups
    }
    
    private func calculateHashSimilarity(_ hash1: SimilarityHash?, _ hash2: SimilarityHash?) -> Float? {
        guard let h1 = hash1, let h2 = hash2 else { return nil }
        
        // Compare perceptual hashes
        if h1.perceptualHash == h2.perceptualHash {
            return 1.0
        }
        
        // Compare metadata hashes
        if h1.metadataHash == h2.metadataHash {
            return 0.95
        }
        
        // Compare feature vectors
        let vectorSimilarity = cosineSimilarity(h1.featureVector, h2.featureVector)
        return vectorSimilarity
    }
    
    private func cosineSimilarity(_ v1: [Float], _ v2: [Float]) -> Float {
        guard v1.count == v2.count else { return 0 }
        
        let dotProduct = zip(v1, v2).map(*).reduce(0, +)
        let magnitude1 = sqrt(v1.map { $0 * $0 }.reduce(0, +))
        let magnitude2 = sqrt(v2.map { $0 * $0 }.reduce(0, +))
        
        guard magnitude1 > 0 && magnitude2 > 0 else { return 0 }
        return dotProduct / (magnitude1 * magnitude2)
    }
    
    private func calculateGroupSimilarity(group: DuplicateGroup) -> Float {
        // Simplified: return high similarity for groups
        return 0.9
    }
    
    private func determineConfidence(score: Float) -> DuplicateGroup.Confidence {
        if score >= 0.9 { return .high }
        if score >= 0.7 { return .medium }
        return .low
    }
}

extension String {
    func md5() -> String {
        // Simplified MD5 hash
        return self.prefix(32).lowercased()
    }
}
