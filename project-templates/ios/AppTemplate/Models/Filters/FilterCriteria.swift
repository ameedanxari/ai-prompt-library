//
//  FilterCriteria.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation

enum FilterType: String, Codable {
    case age
    case size
    case mediaType
    case sensitive
}

enum FilterOperator: String, Codable {
    case equals
    case greaterThan
    case lessThan
    case inRange
}

struct FilterCriteria: Codable {
    let type: FilterType
    let operator: FilterOperator
    let value: AnyCodable
    
    init(type: FilterType, operator: FilterOperator, value: AnyCodable) {
        self.type = type
        self.operator = operator
        self.value = value
    }
}

// Helper to encode Any as Codable
struct AnyCodable: Codable {
    let value: Any
    
    init(_ value: Any) {
        self.value = value
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let intValue = try? container.decode(Int.self) {
            value = intValue
        } else if let doubleValue = try? container.decode(Double.self) {
            value = doubleValue
        } else if let stringValue = try? container.decode(String.self) {
            value = stringValue
        } else if let boolValue = try? container.decode(Bool.self) {
            value = boolValue
        } else {
            throw DecodingError.dataCorruptedError(in: container, debugDescription: "AnyCodable value cannot be decoded")
        }
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        if let intValue = value as? Int {
            try container.encode(intValue)
        } else if let doubleValue = value as? Double {
            try container.encode(doubleValue)
        } else if let stringValue = value as? String {
            try container.encode(stringValue)
        } else if let boolValue = value as? Bool {
            try container.encode(boolValue)
        }
    }
}

struct FilterState: Codable {
    let activeFilters: [FilterCriteria]
    let filteredItems: [MediaItem]
    let totalCount: Int
    let originalCount: Int
    
    init(activeFilters: [FilterCriteria], filteredItems: [MediaItem], originalCount: Int) {
        self.activeFilters = activeFilters
        self.filteredItems = filteredItems
        self.totalCount = filteredItems.count
        self.originalCount = originalCount
    }
}

enum FilterCombinationMode: String, Codable {
    case and
    case or
}

struct FilterCombination: Codable {
    let mode: FilterCombinationMode
    let filters: [FilterCriteria]
    
    init(mode: FilterCombinationMode, filters: [FilterCriteria]) {
        self.mode = mode
        self.filters = filters
    }
}
