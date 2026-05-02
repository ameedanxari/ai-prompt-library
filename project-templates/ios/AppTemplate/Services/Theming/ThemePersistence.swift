//
//  ThemePersistence.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation

class ThemePersistence {
    private static let themeKey = "com.example.app.themeConfiguration"
    
    static func save(_ configuration: ThemeConfiguration) {
        if let encoded = try? JSONEncoder().encode(configuration) {
            UserDefaults.standard.set(encoded, forKey: themeKey)
        }
    }
    
    static func load() -> ThemeConfiguration {
        guard let data = UserDefaults.standard.data(forKey: themeKey),
              let decoded = try? JSONDecoder().decode(ThemeConfiguration.self, from: data) else {
            return ThemeConfiguration.default
        }
        return decoded
    }
    
    static func clear() {
        UserDefaults.standard.removeObject(forKey: themeKey)
    }
}
