//
//  SpacingToken.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation
import CoreGraphics

struct SpacingToken: Codable {
    let name: String
    let value: CGFloat
    let scale: Int // Base scale multiplier (e.g., 4, 8, 16)
    
    init(name: String, value: CGFloat, scale: Int) {
        self.name = name
        self.value = value
        self.scale = scale
    }
}
