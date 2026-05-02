//
//  ScanConfig.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation

struct ScanConfig: Codable {
    let enableDuplicates: Bool
    let enableScreenshots: Bool
    let enableLargeFiles: Bool
    let enableSensitiveContent: Bool
    let largeFileThreshold: Int64
    
    init(
        enableDuplicates: Bool = true,
        enableScreenshots: Bool = true,
        enableLargeFiles: Bool = true,
        enableSensitiveContent: Bool = true,
        largeFileThreshold: Int64 = 100 * 1024 * 1024 // 100MB
    ) {
        self.enableDuplicates = enableDuplicates
        self.enableScreenshots = enableScreenshots
        self.enableLargeFiles = enableLargeFiles
        self.enableSensitiveContent = enableSensitiveContent
        self.largeFileThreshold = largeFileThreshold
    }
    
    static let `default` = ScanConfig()
}

struct CompleteScanResult: Codable {
    let library: LibraryScanResult
    let duplicates: DuplicateAnalysisResult?
    let screenshots: ScreenCaptureGroup?
    let largeFiles: LargeFileAnalysis?
    let sensitiveContent: [SensitiveContentResult]?
    let totalScanTime: TimeInterval
    
    init(
        library: LibraryScanResult,
        duplicates: DuplicateAnalysisResult? = nil,
        screenshots: ScreenCaptureGroup? = nil,
        largeFiles: LargeFileAnalysis? = nil,
        sensitiveContent: [SensitiveContentResult]? = nil,
        totalScanTime: TimeInterval
    ) {
        self.library = library
        self.duplicates = duplicates
        self.screenshots = screenshots
        self.largeFiles = largeFiles
        self.sensitiveContent = sensitiveContent
        self.totalScanTime = totalScanTime
    }
}

struct ScanError: Error, Codable {
    let phase: String
    let item: MediaItem?
    let error: String
    let recoverable: Bool
}
