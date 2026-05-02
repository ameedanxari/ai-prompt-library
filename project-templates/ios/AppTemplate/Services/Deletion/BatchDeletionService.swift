//
//  BatchDeletionService.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation
import Photos

class BatchDeletionService {
    
    private var activeBatches: [String: DeletionBatch] = [:]
    private var progressCallbacks: [String: (DeletionProgress) -> Void] = [:]
    
    func startBatchDeletion(items: [MediaItem]) async throws -> DeletionBatch {
        let batchId = UUID().uuidString
        let batch = DeletionBatch(
            id: batchId,
            items: items,
            status: .pending,
            startedAt: Date(),
            completedAt: nil,
            bytesFreed: 0
        )
        
        activeBatches[batchId] = batch
        
        Task {
            await performDeletion(batch: batch)
        }
        
        return batch
    }
    
    private func performDeletion(batch: DeletionBatch) async {
        var updatedBatch = batch
        updatedBatch = DeletionBatch(
            id: batch.id,
            items: batch.items,
            status: .inProgress,
            startedAt: batch.startedAt,
            completedAt: nil,
            bytesFreed: 0
        )
        activeBatches[batch.id] = updatedBatch
        
        var bytesFreed: Int64 = 0
        var completed = 0
        
        for item in batch.items {
            do {
                try await deleteItem(item)
                bytesFreed += item.fileSize
                completed += 1
                
                let progress = DeletionProgress(
                    batchId: batch.id,
                    completed: completed,
                    total: batch.items.count,
                    currentItem: item,
                    error: nil
                )
                
                progressCallbacks[batch.id]?(progress)
            } catch {
                let error = DeletionError(itemId: item.id, message: error.localizedDescription, recoverable: false)
                let progress = DeletionProgress(
                    batchId: batch.id,
                    completed: completed,
                    total: batch.items.count,
                    currentItem: item,
                    error: error
                )
                progressCallbacks[batch.id]?(progress)
            }
        }
        
        updatedBatch = DeletionBatch(
            id: batch.id,
            items: batch.items,
            status: .completed,
            startedAt: batch.startedAt,
            completedAt: Date(),
            bytesFreed: bytesFreed
        )
        activeBatches[batch.id] = updatedBatch
    }
    
    private func deleteItem(_ item: MediaItem) async throws {
        // Use PHPhotoLibrary to delete the asset
        let fetchResult = PHAsset.fetchAssets(withLocalIdentifiers: [item.assetIdentifier], options: nil)
        
        guard fetchResult.count > 0 else {
            throw DeletionError(itemId: item.id, message: "Asset not found", recoverable: false)
        }
        
        try await PHPhotoLibrary.shared().performChanges {
            PHAssetChangeRequest.deleteAssets(fetchResult)
        }
    }
    
    func getDeletionProgress(batchId: String) async throws -> DeletionProgress {
        guard let batch = activeBatches[batchId] else {
            throw DeletionError(itemId: "", message: "Batch not found", recoverable: false)
        }
        
        let completed = batch.status == .completed ? batch.items.count : 0
        return DeletionProgress(
            batchId: batchId,
            completed: completed,
            total: batch.items.count,
            currentItem: nil,
            error: nil
        )
    }
    
    func setProgressCallback(batchId: String, callback: @escaping (DeletionProgress) -> Void) {
        progressCallbacks[batchId] = callback
    }
}
