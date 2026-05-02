//
//  GlassCardConfig.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation
import CoreGraphics

enum GlassBlurStyle: String, CaseIterable, Codable {
    case light
    case dark
    case adaptive
}

struct GlassCardConfig: Codable {
    let blurStyle: GlassBlurStyle
    let cornerRadius: CGFloat
    let borderWidth: CGFloat
    let shadowEnabled: Bool
    
    init(
        blurStyle: GlassBlurStyle = .adaptive,
        cornerRadius: CGFloat = 16.0,
        borderWidth: CGFloat = 1.0,
        shadowEnabled: Bool = true
    ) {
        self.blurStyle = blurStyle
        self.cornerRadius = cornerRadius
        self.borderWidth = borderWidth
        self.shadowEnabled = shadowEnabled
    }
    
    static let `default` = GlassCardConfig()
}
