//
//  SwipeAction.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation

enum SwipeActionType {
    case keep
    case delete
}

struct SwipeAction {
    let item: MediaItem
    let action: SwipeActionType
    let timestamp: Date
    
    init(item: MediaItem, action: SwipeActionType, timestamp: Date = Date()) {
        self.item = item
        self.action = action
        self.timestamp = timestamp
    }
}
