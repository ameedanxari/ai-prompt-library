//
//  AdaptiveGlassEffect.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation
import SwiftUI
import CoreGraphics

struct AdaptiveGlassEffect {
    let lightBlur: CGFloat // Blur radius for light mode
    let darkBlur: CGFloat // Blur radius for dark mode
    let lightTransparency: CGFloat // Opacity for light mode (0.0 to 1.0)
    let darkTransparency: CGFloat // Opacity for dark mode (0.0 to 1.0)
    
    init(lightBlur: CGFloat, darkBlur: CGFloat, lightTransparency: CGFloat, darkTransparency: CGFloat) {
        self.lightBlur = lightBlur
        self.darkBlur = darkBlur
        self.lightTransparency = lightTransparency
        self.darkTransparency = darkTransparency
    }
    
    // Default adaptive glass effect for liquid glass aesthetic
    static let `default` = AdaptiveGlassEffect(
        lightBlur: 20.0,
        darkBlur: 30.0,
        lightTransparency: 0.7,
        darkTransparency: 0.85
    )
    
    // Get the appropriate blur radius for the current color scheme
    func blur(for colorScheme: ColorScheme) -> CGFloat {
        switch colorScheme {
        case .light: return lightBlur
        case .dark: return darkBlur
        @unknown default: return lightBlur
        }
    }
    
    // Get the appropriate transparency for the current color scheme
    func transparency(for colorScheme: ColorScheme) -> CGFloat {
        switch colorScheme {
        case .light: return lightTransparency
        case .dark: return darkTransparency
        @unknown default: return lightTransparency
        }
    }
}
