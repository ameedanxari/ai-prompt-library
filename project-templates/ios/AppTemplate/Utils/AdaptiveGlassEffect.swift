//
//  AdaptiveGlassEffect.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation
import SwiftUI

struct AdaptiveGlassEffect {
    let lightBlur: CGFloat
    let darkBlur: CGFloat
    let lightTransparency: CGFloat
    let darkTransparency: CGFloat
    
    init(
        lightBlur: CGFloat = 20.0,
        darkBlur: CGFloat = 30.0,
        lightTransparency: CGFloat = 0.7,
        darkTransparency: CGFloat = 0.85
    ) {
        self.lightBlur = lightBlur
        self.darkBlur = darkBlur
        self.lightTransparency = lightTransparency
        self.darkTransparency = darkTransparency
    }
    
    func blur(for colorScheme: ColorScheme) -> CGFloat {
        switch colorScheme {
        case .light: return lightBlur
        case .dark: return darkBlur
        @unknown default: return lightBlur
        }
    }
    
    func transparency(for colorScheme: ColorScheme) -> CGFloat {
        switch colorScheme {
        case .light: return lightTransparency
        case .dark: return darkTransparency
        @unknown default: return lightTransparency
        }
    }
}

func adaptiveGlassEffect(for colorScheme: ColorScheme) -> AdaptiveGlassEffect {
    return AdaptiveGlassEffect()
}
