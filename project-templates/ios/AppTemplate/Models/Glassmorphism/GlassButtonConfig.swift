//
//  GlassButtonConfig.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation

enum GlassButtonStyle: String, CaseIterable, Codable {
    case primary
    case secondary
    case ghost
}

struct GlassButtonConfig: Codable {
    let style: GlassButtonStyle
    let glassIntensity: Double // 0.0 to 1.0
    let hapticFeedback: Bool
    
    init(
        style: GlassButtonStyle = .primary,
        glassIntensity: Double = 0.7,
        hapticFeedback: Bool = true
    ) {
        self.style = style
        self.glassIntensity = glassIntensity
        self.hapticFeedback = hapticFeedback
    }
    
    static let `default` = GlassButtonConfig()
}
