//
//  GlassEffectToken.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation
import CoreGraphics

struct GlassEffectToken: Codable {
    let name: String
    let blurRadius: CGFloat
    let transparency: CGFloat // 0.0 to 1.0
    let borderOpacity: CGFloat // 0.0 to 1.0
    let shadowIntensity: CGFloat // 0.0 to 1.0
    
    init(
        name: String,
        blurRadius: CGFloat,
        transparency: CGFloat,
        borderOpacity: CGFloat,
        shadowIntensity: CGFloat
    ) {
        self.name = name
        self.blurRadius = blurRadius
        self.transparency = transparency
        self.borderOpacity = borderOpacity
        self.shadowIntensity = shadowIntensity
    }
}
