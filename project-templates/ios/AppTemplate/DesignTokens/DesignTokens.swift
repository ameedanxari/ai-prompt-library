//
//  DesignTokens.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation
import SwiftUI

struct DesignTokens {
    // Color tokens
    static let colors: [String: ColorToken] = [
        "primary": ColorToken(
            name: "primary",
            lightValue: "#6200EE",
            darkValue: "#BB86FC",
            semanticAliases: ["brand", "accent"]
        ),
        "secondary": ColorToken(
            name: "secondary",
            lightValue: "#03DAC6",
            darkValue: "#03DAC6",
            semanticAliases: ["success"]
        ),
        "background": ColorToken(
            name: "background",
            lightValue: "#FFFFFF",
            darkValue: "#121212",
            semanticAliases: ["surface"]
        ),
        "surface": ColorToken(
            name: "surface",
            lightValue: "#F5F5F5",
            darkValue: "#1E1E1E",
            semanticAliases: ["card"]
        ),
        "text": ColorToken(
            name: "text",
            lightValue: "#000000",
            darkValue: "#FFFFFF",
            semanticAliases: ["foreground"]
        ),
        "textSecondary": ColorToken(
            name: "textSecondary",
            lightValue: "#666666",
            darkValue: "#B0B0B0",
            semanticAliases: ["muted"]
        ),
        "error": ColorToken(
            name: "error",
            lightValue: "#B00020",
            darkValue: "#CF6679",
            semanticAliases: ["danger"]
        )
    ]
    
    // Glass effect tokens
    static let glass: [String: GlassEffectToken] = [
        "light": GlassEffectToken(
            name: "light",
            blurRadius: 20.0,
            transparency: 0.7,
            borderOpacity: 0.2,
            shadowIntensity: 0.1
        ),
        "dark": GlassEffectToken(
            name: "dark",
            blurRadius: 30.0,
            transparency: 0.85,
            borderOpacity: 0.3,
            shadowIntensity: 0.2
        ),
        "adaptive": GlassEffectToken(
            name: "adaptive",
            blurRadius: 25.0,
            transparency: 0.75,
            borderOpacity: 0.25,
            shadowIntensity: 0.15
        )
    ]
    
    // Typography tokens
    static let typography: [String: TypographyToken] = [
        "display": TypographyToken(
            name: "display",
            fontFamily: "SF Pro Display",
            fontWeight: "bold",
            fontSize: 32.0,
            lineHeight: 40.0,
            letterSpacing: 0.0
        ),
        "headline": TypographyToken(
            name: "headline",
            fontFamily: "SF Pro Display",
            fontWeight: "semibold",
            fontSize: 24.0,
            lineHeight: 32.0,
            letterSpacing: 0.0
        ),
        "body": TypographyToken(
            name: "body",
            fontFamily: "SF Pro Text",
            fontWeight: "regular",
            fontSize: 16.0,
            lineHeight: 24.0,
            letterSpacing: 0.0
        ),
        "caption": TypographyToken(
            name: "caption",
            fontFamily: "SF Pro Text",
            fontWeight: "regular",
            fontSize: 14.0,
            lineHeight: 20.0,
            letterSpacing: 0.0
        )
    ]
    
    // Spacing tokens
    static let spacing: [String: SpacingToken] = [
        "xs": SpacingToken(name: "xs", value: 4.0, scale: 4),
        "sm": SpacingToken(name: "sm", value: 8.0, scale: 8),
        "md": SpacingToken(name: "md", value: 16.0, scale: 16),
        "lg": SpacingToken(name: "lg", value: 24.0, scale: 24),
        "xl": SpacingToken(name: "xl", value: 32.0, scale: 32),
        "xxl": SpacingToken(name: "xxl", value: 48.0, scale: 48)
    ]
    
    // Motion tokens
    static let motion: [String: MotionToken] = [
        "fast": MotionToken(
            name: "fast",
            duration: 0.15,
            easing: "ease-out",
            delay: 0.0
        ),
        "normal": MotionToken(
            name: "normal",
            duration: 0.3,
            easing: "ease-in-out",
            delay: 0.0
        ),
        "slow": MotionToken(
            name: "slow",
            duration: 0.5,
            easing: "ease-in-out",
            delay: 0.0
        )
    ]
    
    // Helper methods
    static func color(_ name: String, for colorScheme: ColorScheme) -> Color? {
        guard let token = colors[name] else { return nil }
        return Color(hex: token.value(for: colorScheme))
    }
    
    static func glassEffect(_ name: String) -> GlassEffectToken? {
        return glass[name]
    }
    
    static func typography(_ name: String) -> TypographyToken? {
        return typography[name]
    }
    
    static func spacing(_ name: String) -> CGFloat? {
        return spacing[name]?.value
    }
    
    static func motion(_ name: String) -> MotionToken? {
        return motion[name]
    }
}

// Extension to convert hex string to Color
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
