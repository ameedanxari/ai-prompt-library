//
//  FilterEngine.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation

class FilterEngine {
    
    func applyFilters(items: [MediaItem], criteria: [FilterCriteria]) -> FilterState {
        var filteredItems = items
        
        for criterion in criteria {
            filteredItems = applySingleFilter(items: filteredItems, criterion: criterion)
        }
        
        return FilterState(
            activeFilters: criteria,
            filteredItems: filteredItems,
            originalCount: items.count
        )
    }
    
    private func applySingleFilter(items: [MediaItem], criterion: FilterCriteria) -> [MediaItem] {
        switch criterion.type {
        case .age:
            return applyAgeFilter(items: items, criterion: criterion)
        case .size:
            return applySizeFilter(items: items, criterion: criterion)
        case .mediaType:
            return applyMediaTypeFilter(items: items, criterion: criterion)
        case .sensitive:
            // Sensitive filtering requires pre-computed sensitive content results
            return items
        }
    }
    
    private func applyAgeFilter(items: [MediaItem], criterion: FilterCriteria) -> [MediaItem] {
        guard let days = criterion.value.value as? Int else { return items }
        
        let cutoffDate = Calendar.current.date(byAdding: .day, value: -days, to: Date()) ?? Date()
        
        return items.filter { item in
            switch criterion.operator {
            case .greaterThan:
                return item.creationDate < cutoffDate
            case .lessThan:
                return item.creationDate > cutoffDate
            default:
                return true
            }
        }
    }
    
    private func applySizeFilter(items: [MediaItem], criterion: FilterCriteria) -> [MediaItem] {
        guard let size = criterion.value.value as? Int64 else { return items }
        
        return items.filter { item in
            switch criterion.operator {
            case .greaterThan:
                return item.fileSize > size
            case .lessThan:
                return item.fileSize < size
            default:
                return true
            }
        }
    }
    
    private func applyMediaTypeFilter(items: [MediaItem], criterion: FilterCriteria) -> [MediaItem] {
        guard let typeString = criterion.value.value as? String,
              let type = MediaType(rawValue: typeString) else { return items }
        
        return items.filter { $0.type == type }
    }
    
    func filterByAge(items: [MediaItem], preset: AgeFilterPreset) -> AgeFilterResult {
        let calendar = Calendar.current
        var cutoffDate: Date?
        
        switch preset.timeRange {
        case .days:
            cutoffDate = calendar.date(byAdding: .day, value: -preset.value, to: Date())
        case .months:
            cutoffDate = calendar.date(byAdding: .month, value: -preset.value, to: Date())
        case .years:
            cutoffDate = calendar.date(byAdding: .year, value: -preset.value, to: Date())
        }
        
        guard let cutoff = cutoffDate else {
            return AgeFilterResult(items: [], count: 0, spaceFreed: 0)
        }
        
        let filteredItems = items.filter { $0.creationDate < cutoff }
        let spaceFreed = filteredItems.reduce(0) { $0 + $1.fileSize }
        
        return AgeFilterResult(
            items: filteredItems,
            count: filteredItems.count,
            spaceFreed: spaceFreed
        )
    }
    
    func filterByCustomDateRange(items: [MediaItem], range: DateRange) -> AgeFilterResult {
        let filteredItems = items.filter { item in
            item.creationDate >= range.startDate && item.creationDate <= range.endDate
        }
        let spaceFreed = filteredItems.reduce(0) { $0 + $1.fileSize }
        
        return AgeFilterResult(
            items: filteredItems,
            count: filteredItems.count,
            spaceFreed: spaceFreed
        )
    }
    
    func filterBySize(items: [MediaItem], preset: SizeFilterPreset) -> SizeFilterResult {
        let filteredItems = items.filter { item in
            item.fileSize >= preset.minSize && (preset.maxSize == nil || item.fileSize <= preset.maxSize!)
        }
        
        let totalSize = filteredItems.reduce(0) { $0 + $1.fileSize }
        let spaceFreed = totalSize
        
        return SizeFilterResult(
            items: filteredItems,
            count: filteredItems.count,
            totalSize: totalSize,
            spaceFreed: spaceFreed
        )
    }
    
    func filterByCustomSizeRange(items: [MediaItem], range: SizeRange) -> SizeFilterResult {
        let filteredItems = items.filter { item in
            item.fileSize >= range.minBytes && item.fileSize <= range.maxBytes
        }
        
        let totalSize = filteredItems.reduce(0) { $0 + $1.fileSize }
        let spaceFreed = totalSize
        
        return SizeFilterResult(
            items: filteredItems,
            count: filteredItems.count,
            totalSize: totalSize,
            spaceFreed: spaceFreed
        )
    }
    
    func applyQuickFilter(items: [MediaItem], type: QuickFilterType) -> QuickFilterResult {
        let filteredItems: [MediaItem]
        
        switch type {
        case .videos:
            filteredItems = items.filter { $0.type == .video }
        case .largeFiles:
            filteredItems = items.filter { $0.fileSize > 100 * 1024 * 1024 } // > 100MB
        case .screenshots, .burstPhotos, .livePhotos, .duplicates:
            // These require pre-computed data from the scanner
            filteredItems = []
        }
        
        let spaceFreed = filteredItems.reduce(0) { $0 + $1.fileSize }
        
        return QuickFilterResult(
            filterType: type,
            items: filteredItems,
            count: filteredItems.count,
            spaceFreed: spaceFreed
        )
    }
    
    func filterSensitiveContent(items: [MediaItem], sensitiveResults: [SensitiveContentResult]) -> SensitiveFilterResult {
        let sensitiveItems = sensitiveResults.filter { $0.requiresReview }
        let categories = Dictionary(grouping: sensitiveItems) { $0.classification.category.rawValue }
            .mapValues { $0.count }
        
        return SensitiveFilterResult(
            sensitiveItems: sensitiveItems,
            totalSensitive: sensitiveItems.count,
            categories: categories
        )
    }
    
    func buildReviewQueue(results: SensitiveFilterResult) -> ReviewQueue {
        let highPriority = results.sensitiveItems.filter { $0.classification.category == .idCard }
            .map { $0.item }
        let mediumPriority = results.sensitiveItems.filter { $0.classification.category == .document || $0.classification.category == .receipt }
            .map { $0.item }
        let lowPriority = results.sensitiveItems.filter { $0.classification.category == .privateInfo }
            .map { $0.item }
        
        return ReviewQueue(
            highPriority: highPriority,
            mediumPriority: mediumPriority,
            lowPriority: lowPriority
        )
    }
}
