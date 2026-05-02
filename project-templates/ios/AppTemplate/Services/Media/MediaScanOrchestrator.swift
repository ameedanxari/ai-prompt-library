//
//  MediaScanOrchestrator.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation

class MediaScanOrchestrator {
    
    private let photoLibraryScanner = PhotoLibraryScanner()
    private let duplicateDetector = DuplicateDetector()
    private let screenCaptureDetector = ScreenCaptureDetector()
    private let largeFileDetector = LargeFileDetector()
    private let sensitiveContentDetector = SensitiveContentDetector()
    
    func runCompleteScan(
        config: ScanConfig,
        progress: @escaping (ScanProgress) -> Void
    ) async throws -> CompleteScanResult {
        let startTime = Date()
        
        // Step 1: Enumerate photo library
        let libraryResult = try await photoLibraryScanner.enumeratePhotoLibrary { scanProgress in
            progress(scanProgress)
        }
        
        let items = libraryResult.items
        
        // Step 2: Run analysis based on config
        var duplicates: DuplicateAnalysisResult?
        var screenshots: ScreenCaptureGroup?
        var largeFiles: LargeFileAnalysis?
        var sensitiveContent: [SensitiveContentResult]?
        
        if config.enableDuplicates {
            progress(ScanProgress(current: 0, total: items.count, phase: .analyzing))
            duplicates = try? await duplicateDetector.detectDuplicates(items: items)
        }
        
        if config.enableScreenshots {
            screenshots = try? await screenCaptureDetector.detectScreenCaptures(items: items)
        }
        
        if config.enableLargeFiles {
            largeFiles = try? await largeFileDetector.detectLargeFiles(
                items: items,
                threshold: config.largeFileThreshold
            )
        }
        
        if config.enableSensitiveContent {
            sensitiveContent = try? await sensitiveContentDetector.detectSensitiveContent(items: items)
        }
        
        let totalScanTime = Date().timeIntervalSince(startTime)
        
        progress(ScanProgress(current: items.count, total: items.count, phase: .complete))
        
        return CompleteScanResult(
            library: libraryResult,
            duplicates: duplicates,
            screenshots: screenshots,
            largeFiles: largeFiles,
            sensitiveContent: sensitiveContent,
            totalScanTime: totalScanTime
        )
    }
}
