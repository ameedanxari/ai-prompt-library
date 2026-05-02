//
//  GlassEffectUtils.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import SwiftUI

func adaptiveGlassEffect(for scheme: ColorScheme, customIntensity: Double? = nil) -> AdaptiveGlassEffect {
    let baseEffect = AdaptiveGlassEffect.default
    
    // Apply custom intensity if provided
    if let customIntensity = customIntensity {
        let adjustedLightTransparency = baseEffect.lightTransparency * customIntensity
        let adjustedDarkTransparency = baseEffect.darkTransparency * customIntensity
        return AdaptiveGlassEffect(
            lightBlur: baseEffect.lightBlur,
            darkBlur: baseEffect.darkBlur,
            lightTransparency: adjustedLightTransparency,
            darkTransparency: adjustedDarkTransparency
        )
    }
    
    return baseEffect
}
