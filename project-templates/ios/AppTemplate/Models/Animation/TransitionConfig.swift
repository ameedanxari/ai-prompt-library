//
//  TransitionConfig.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation

enum EasingType: String {
    case easeInOut
    case spring
    case custom
}

struct TransitionConfig {
    let duration: TimeInterval
    let easing: EasingType
    let delay: TimeInterval
    
    init(duration: TimeInterval, easing: EasingType = .easeInOut, delay: TimeInterval = 0) {
        self.duration = duration
        self.easing = easing
        self.delay = delay
    }
    
    // Convenience initializers from motion tokens
    static func fast(delay: TimeInterval = 0) -> TransitionConfig {
        TransitionConfig(duration: MotionTokens.durationFast, delay: delay)
    }
    
    static func normal(delay: TimeInterval = 0) -> TransitionConfig {
        TransitionConfig(duration: MotionTokens.durationNormal, delay: delay)
    }
    
    static func slow(delay: TimeInterval = 0) -> TransitionConfig {
        TransitionConfig(duration: MotionTokens.durationSlow, delay: delay)
    }
}
