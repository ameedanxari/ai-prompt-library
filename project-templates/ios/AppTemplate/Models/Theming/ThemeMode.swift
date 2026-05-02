//
//  ThemeMode.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation

enum ThemeMode: String, CaseIterable, Codable {
    case light
    case dark
    case auto
    
    var displayName: String {
        switch self {
        case .light: return "Light"
        case .dark: return "Dark"
        case .auto: return "Auto (System)"
        }
    }
}
