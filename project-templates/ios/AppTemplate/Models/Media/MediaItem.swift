//
//  MediaItem.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation
import CoreLocation

struct MediaItem: Identifiable, Codable {
    let id: String
    let uri: String
    let type: MediaType
    let creationDate: Date
    let modificationDate: Date
    let fileSize: Int64
    let width: Int
    let height: Int
    let duration: TimeInterval? // For videos
    let location: Location?
    let assetIdentifier: String
    
    init(
        id: String,
        uri: String,
        type: MediaType,
        creationDate: Date,
        modificationDate: Date,
        fileSize: Int64,
        width: Int,
        height: Int,
        duration: TimeInterval? = nil,
        location: Location? = nil,
        assetIdentifier: String
    ) {
        self.id = id
        self.uri = uri
        self.type = type
        self.creationDate = creationDate
        self.modificationDate = modificationDate
        self.fileSize = fileSize
        self.width = width
        self.height = height
        self.duration = duration
        self.location = location
        self.assetIdentifier = assetIdentifier
    }
}

enum MediaType: String, Codable {
    case photo
    case video
}

struct Location: Codable {
    let latitude: Double
    let longitude: Double
    let altitude: Double?
}
