//
//  ThemeUtils.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import SwiftUI

class ThemeUtils {
    // Detect if system is in dark mode
    static func isSystemInDarkMode() -> Bool {
        return UITraitCollection.current.userInterfaceStyle == .dark
    }
    
    // Get the effective theme mode based on configuration and system preference
    static func effectiveTheme(from configuration: ThemeConfiguration) -> ThemeMode {
        switch configuration.mode {
        case .light, .dark:
            return configuration.mode
        case .auto:
            return isSystemInDarkMode() ? .dark : .light
        }
    }
    
    // Get the color scheme for a given theme configuration
    static func colorScheme(from configuration: ThemeConfiguration) -> ColorScheme {
        let effectiveMode = effectiveTheme(from: configuration)
        switch effectiveMode {
        case .light: return .light
        case .dark: return .dark
        case .auto: return isSystemInDarkMode() ? .dark : .light
        }
    }
}
