//
//  ThemeConfiguration.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation

struct ThemeConfiguration: Codable {
    let mode: ThemeMode
    let customGlassIntensity: Double? // 0.0 to 1.0, nil for default
    let customColorPalette: ColorPalette? // nil for default palette
    
    init(mode: ThemeMode, customGlassIntensity: Double? = nil, customColorPalette: ColorPalette? = nil) {
        self.mode = mode
        self.customGlassIntensity = customGlassIntensity
        self.customColorPalette = customColorPalette
    }
    
    static let `default` = ThemeConfiguration(mode: .auto)
}

struct ColorPalette: Codable {
    let primary: String
    let secondary: String
    let background: String
    let surface: String
    let text: String
    let textSecondary: String
}
