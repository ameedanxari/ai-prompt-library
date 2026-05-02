//
//  PhotoLibraryScanner.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation
import Photos
import UIKit

class PhotoLibraryScanner {
    
    func enumeratePhotoLibrary(progress: @escaping (ScanProgress) -> Void) async throws -> LibraryScanResult {
        let startTime = Date()
        
        // Request photo library access
        let status = await PHPhotoLibrary.requestAuthorization(for: .readWrite)
        guard status == .authorized else {
            throw ScanError(phase: "authorization", item: nil, error: "Photo library access denied", recoverable: false)
        }
        
        let fetchOptions = PHFetchOptions()
        fetchOptions.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: false)]
        
        let allAssets = PHAsset.fetchAssets(with: fetchOptions)
        let totalCount = allAssets.count
        
        var items: [MediaItem] = []
        let imageManager = PHImageManager.default()
        
        for (index, asset) in allAssets.enumerated() {
            let progress = ScanProgress(current: index + 1, total: totalCount, phase: .enumerating)
            progress(progress)
            
            let mediaItem = try await convertAssetToMediaItem(asset: asset, imageManager: imageManager)
            items.append(mediaItem)
        }
        
        let scanDuration = Date().timeIntervalSince(startTime)
        
        return LibraryScanResult(
            items: items,
            totalCount: totalCount,
            scanDuration: scanDuration,
            lastScannedAt: Date()
        )
    }
    
    private func convertAssetToMediaItem(asset: PHAsset, imageManager: PHImageManager) async throws -> MediaItem {
        let mediaType: MediaType = asset.mediaType == .video ? .video : .photo
        
        let resources = PHAssetResource.assetResources(for: asset)
        let fileSize = resources.first?.value(forKey: "fileSize") as? Int64 ?? 0
        
        let creationDate = asset.creationDate ?? Date()
        let modificationDate = asset.modificationDate ?? Date()
        
        let width = asset.pixelWidth
        let height = asset.pixelHeight
        
        let duration: TimeInterval? = asset.duration > 0 ? asset.duration : nil
        
        let location: Location? = if let location = asset.location {
            Location(latitude: location.coordinate.latitude, longitude: location.coordinate.longitude, altitude: location.altitude)
        } else {
            nil
        }
        
        let assetIdentifier = asset.localIdentifier
        
        // Get the URI for the asset
        let uri = "ph://\(assetIdentifier)"
        
        return MediaItem(
            id: UUID().uuidString,
            uri: uri,
            type: mediaType,
            creationDate: creationDate,
            modificationDate: modificationDate,
            fileSize: fileSize,
            width: width,
            height: height,
            duration: duration,
            location: location,
            assetIdentifier: assetIdentifier
        )
    }
}
