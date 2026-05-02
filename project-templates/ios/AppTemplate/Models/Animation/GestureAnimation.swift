//
//  GestureAnimation.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import UIKit
import CoreGraphics

struct GestureAnimation {
    let swipeThreshold: CGFloat // Minimum swipe distance to trigger action
    let springDamping: CGFloat // Spring damping ratio (0.0-1.0)
    let response: TimeInterval // Spring response time
    let hapticTrigger: Bool // Whether to trigger haptic feedback
    
    init(
        swipeThreshold: CGFloat = 100.0,
        springDamping: CGFloat = 0.8,
        response: TimeInterval = 0.3,
        hapticTrigger: Bool = true
    ) {
        self.swipeThreshold = swipeThreshold
        self.springDamping = springDamping
        self.response = response
        self.hapticTrigger = hapticTrigger
    }
    
    // Spring animation parameters
    var springAnimation: UISpringTimingParameters {
        UISpringTimingParameters(
            dampingRatio: springDamping,
            initialVelocity: 0
        )
    }
    
    // Haptic feedback trigger
    func triggerHaptic() {
        guard hapticTrigger else { return }
        let generator = UIImpactFeedbackGenerator(style: .medium)
        generator.impactOccurred()
    }
}
