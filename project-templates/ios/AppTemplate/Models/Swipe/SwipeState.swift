//
//  SwipeState.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation
import CoreGraphics

struct SwipeState {
    let direction: SwipeDirection
    let translation: CGPoint
    let velocity: CGPoint
    let isDragging: Bool
    
    init(
        direction: SwipeDirection = .none,
        translation: CGPoint = .zero,
        velocity: CGPoint = .zero,
        isDragging: Bool = false
    ) {
        self.direction = direction
        self.translation = translation
        self.velocity = velocity
        self.isDragging = isDragging
    }
}
