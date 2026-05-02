//
//  Spacing.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import SwiftUI
import CoreGraphics

struct Spacing {
    static let xs: CGFloat = SpacingScale.shared.xs
    static let sm: CGFloat = SpacingScale.shared.sm
    static let md: CGFloat = SpacingScale.shared.md
    static let lg: CGFloat = SpacingScale.shared.lg
    static let xl: CGFloat = SpacingScale.shared.xl
    static let xxl: CGFloat = SpacingScale.shared.xxl
    
    // Helper method to get spacing by name
    static func value(_ name: String) -> CGFloat? {
        let scale = SpacingScale.shared
        switch name {
        case "xs": return scale.xs
        case "sm": return scale.sm
        case "md": return scale.md
        case "lg": return scale.lg
        case "xl": return scale.xl
        case "xxl": return scale.xxl
        default: return nil
        }
    }
}
