//
//  AccessibilityUtils.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import UIKit

class AccessibilityUtils {
    static var prefersReducedMotion: Bool {
        UIAccessibility.isReduceMotionEnabled
    }
    
    static func adjustedDuration(for duration: TimeInterval) -> TimeInterval {
        prefersReducedMotion ? 0 : duration
    }
    
    static func adjustedAnimation(for config: TransitionConfig) -> Animation {
        if prefersReducedMotion {
            return Animation.linear(duration: 0)
        }
        switch config.easing {
        case .easeInOut:
            return Animation.easeInOut(duration: config.duration).delay(config.delay)
        case .spring:
            return Animation.spring(response: config.duration, dampingFraction: 0.8).delay(config.delay)
        case .custom:
            return Animation.easeInOut(duration: config.duration).delay(config.delay)
        }
    }
}
