//
//  LargeFileDetector.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation

class LargeFileDetector {
    
    func detectLargeFiles(items: [MediaItem], threshold: Int64 = 100 * 1024 * 1024) async throws -> LargeFileAnalysis {
        var largeFiles: [LargeFileItem] = []
        var totalSize: Int64 = 0
        
        for item in items {
            if item.fileSize > threshold {
                let sizeCategory = categorizeSize(item.fileSize, threshold: threshold)
                
                let largeFileItem = LargeFileItem(
                    item: item,
                    size: item.fileSize,
                    sizeCategory: sizeCategory
                )
                largeFiles.append(largeFileItem)
                totalSize += item.fileSize
            }
        }
        
        return LargeFileAnalysis(
            largeFiles: largeFiles,
            totalSize: totalSize,
            count: largeFiles.count,
            threshold: threshold
        )
    }
    
    private func categorizeSize(_ size: Int64, threshold: Int64) -> LargeFileItem.SizeCategory {
        let veryLargeThreshold = threshold * 2 // 200MB
        let massiveThreshold = threshold * 5 // 500MB
        
        if size >= massiveThreshold {
            return .massive
        } else if size >= veryLargeThreshold {
            return .veryLarge
        } else {
            return .large
        }
    }
}
