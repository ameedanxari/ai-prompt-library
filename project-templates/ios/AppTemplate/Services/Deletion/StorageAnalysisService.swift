//
//  StorageAnalysisService.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation

class StorageAnalysisService {
    
    func getStorageSnapshot() async throws -> StorageSnapshot {
        let fileManager = FileManager.default
        
        guard let totalSpace = try? fileManager.totalDiskSpace,
              let freeSpace = try? fileManager.freeDiskSpace else {
            throw NSError(domain: "StorageAnalysis", code: 0, userInfo: [NSLocalizedDescriptionKey: "Unable to get storage info"])
        }
        
        let usedSpace = totalSpace - freeSpace
        
        // Simulate app and media storage breakdown
        let appStorage = usedSpace / 10
        let mediaStorage = usedSpace / 2
        
        return StorageSnapshot(
            totalSpace: totalSpace,
            usedSpace: usedSpace,
            freeSpace: freeSpace,
            appStorage: appStorage,
            mediaStorage: mediaStorage
        )
    }
    
    func compareStorage(before: StorageSnapshot, after: StorageSnapshot) -> StorageComparison {
        return StorageComparison(before: before, after: after)
    }
    
    func getCategoryBreakdown() async throws -> [CategoryStorage] {
        // Simulate category breakdown
        return [
            CategoryStorage(category: "Photos", bytes: 5_000_000_000, percentage: 50.0, itemCount: 1000),
            CategoryStorage(category: "Videos", bytes: 3_000_000_000, percentage: 30.0, itemCount: 100),
            CategoryStorage(category: "Screenshots", bytes: 1_000_000_000, percentage: 10.0, itemCount: 500),
            CategoryStorage(category: "Other", bytes: 1_000_000_000, percentage: 10.0, itemCount: 200)
        ]
    }
}

extension FileManager {
    func totalDiskSpace() -> Int64? {
        guard let attributes = try? attributesOfFileSystem(forPath: NSHomeDirectory()) else { return nil }
        return attributes[.systemSize] as? Int64
    }
    
    func freeDiskSpace() -> Int64? {
        guard let attributes = try? attributesOfFileSystem(forPath: NSHomeDirectory()) else { return nil }
        return attributes[.systemFreeSize] as? Int64
    }
}
