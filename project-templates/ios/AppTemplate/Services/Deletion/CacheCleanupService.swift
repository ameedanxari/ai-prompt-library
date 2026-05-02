//
//  CacheCleanupService.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation

class CacheCleanupService {
    
    func getCacheInfo() async throws -> [CacheInfo] {
        var cacheInfos: [CacheInfo] = []
        
        // Simulate cache info retrieval
        let cacheTypes: [CacheType] = [.thumbnailCache, .mlModelCache, .temporaryFiles, .scanCache]
        
        for type in cacheTypes {
            let cacheInfo = CacheInfo(
                type: type,
                size: Int64.random(in: 10_000_000...100_000_000),
                path: "/var/mobile/Containers/Data/Application/\(type.rawValue)",
                itemCount: Int.random(in: 10...1000)
            )
            cacheInfos.append(cacheInfo)
        }
        
        return cacheInfos
    }
    
    func clearCache(types: [CacheType]) async throws -> CacheCleanupResult {
        var clearedCaches: [CacheInfo] = []
        var totalBytesFreed: Int64 = 0
        var failedCaches: [String] = []
        
        for type in types {
            do {
                let cacheInfo = try await clearSingleCache(type: type)
                clearedCaches.append(cacheInfo)
                totalBytesFreed += cacheInfo.size
            } catch {
                failedCaches.append(type.rawValue)
            }
        }
        
        return CacheCleanupResult(
            clearedCaches: clearedCaches,
            totalBytesFreed: totalBytesFreed,
            failedCaches: failedCaches
        )
    }
    
    func clearAllCaches() async throws -> CacheCleanupResult {
        let allTypes: [CacheType] = [.thumbnailCache, .mlModelCache, .temporaryFiles, .scanCache]
        return try await clearCache(types: allTypes)
    }
    
    private func clearSingleCache(type: CacheType) async throws -> CacheInfo {
        // Simulate cache clearing
        let size = Int64.random(in: 10_000_000...100_000_000)
        
        return CacheInfo(
            type: type,
            size: size,
            path: "/var/mobile/Containers/Data/Application/\(type.rawValue)",
            itemCount: Int.random(in: 10...1000)
        )
    }
}
