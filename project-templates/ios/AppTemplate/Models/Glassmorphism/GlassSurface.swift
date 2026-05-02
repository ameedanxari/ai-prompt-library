//
//  GlassSurface.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import UIKit

struct GlassSurface {
    let backgroundEffect: UIVisualEffect
    let borderLayer: CALayer
    let shadowLayer: CALayer
    
    init(backgroundEffect: UIVisualEffect, borderLayer: CALayer, shadowLayer: CALayer) {
        self.backgroundEffect = backgroundEffect
        self.borderLayer = borderLayer
        self.shadowLayer = shadowLayer
    }
    
    // Create a default glass surface
    static func createDefault() -> GlassSurface {
        let blurEffect = UIBlurEffect(style: .systemMaterial)
        let borderLayer = CALayer()
        let shadowLayer = CALayer()
        
        borderLayer.borderWidth = 1.0
        borderLayer.borderColor = UIColor.white.withAlphaComponent(0.2).cgColor
        
        shadowLayer.shadowColor = UIColor.black.withAlphaComponent(0.1).cgColor
        shadowLayer.shadowOffset = CGSize(width: 0, height: 2)
        shadowLayer.shadowRadius = 8
        shadowLayer.shadowOpacity = 1.0
        
        return GlassSurface(
            backgroundEffect: blurEffect,
            borderLayer: borderLayer,
            shadowLayer: shadowLayer
        )
    }
}
