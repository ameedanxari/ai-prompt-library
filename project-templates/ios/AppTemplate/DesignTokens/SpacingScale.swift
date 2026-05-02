//
//  SpacingScale.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation
import CoreGraphics

struct SpacingScale: Codable {
    let xs: CGFloat
    let sm: CGFloat
    let md: CGFloat
    let lg: CGFloat
    let xl: CGFloat
    let xxl: CGFloat
    
    init(xs: CGFloat, sm: CGFloat, md: CGFloat, lg: CGFloat, xl: CGFloat, xxl: CGFloat) {
        self.xs = xs
        self.sm = sm
        self.md = md
        self.lg = lg
        self.xl = xl
        self.xxl = xxl
    }
    
    // Shared spacing scale (8pt base scale)
    static let shared = SpacingScale(
        xs: 4.0,   // 0.5x base
        sm: 8.0,   // 1x base
        md: 16.0,  // 2x base
        lg: 24.0,  // 3x base
        xl: 32.0,  // 4x base
        xxl: 48.0  // 6x base
    )
}
