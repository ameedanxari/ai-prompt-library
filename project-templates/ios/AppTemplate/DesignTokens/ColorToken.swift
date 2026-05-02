//
//  ColorToken.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation
import SwiftUI

struct ColorToken: Codable {
    let name: String
    let lightValue: String // Hex color string
    let darkValue: String // Hex color string
    let semanticAliases: [String] // e.g., ["primary", "brand"]
    
    init(name: String, lightValue: String, darkValue: String, semanticAliases: [String] = []) {
        self.name = name
        self.lightValue = lightValue
        self.darkValue = darkValue
        self.semanticAliases = semanticAliases
    }
    
    // Get the appropriate value for the current color scheme
    func value(for colorScheme: ColorScheme) -> String {
        switch colorScheme {
        case .light: return lightValue
        case .dark: return darkValue
        @unknown default: return lightValue
        }
    }
}
