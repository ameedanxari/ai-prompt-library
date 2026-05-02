//
//  MotionTokens.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation
import QuartzCore

struct MotionTokens {
    // Durations (in seconds)
    static let durationFast: TimeInterval = 0.15
    static let durationNormal: TimeInterval = 0.3
    static let durationSlow: TimeInterval = 0.5
    static let durationVerySlow: TimeInterval = 0.8
    
    // Easing functions (as CATimingFunction)
    static let easingIn: CATimingFunction = CATimingFunction(name: .easeIn)
    static let easingOut: CATimingFunction = CATimingFunction(name: .easeOut)
    static let easingInOut: CATimingFunction = CATimingFunction(name: .easeInEaseOut)
    static let easingOutCubic: CATimingFunction = CATimingFunction(controlPoints: 0.33, 0.66, 0.66, 1.0)
    
    // Delays
    static let delayImmediate: TimeInterval = 0.0
    static let delayQuick: TimeInterval = 0.05
    static let delayStandard: TimeInterval = 0.1
}
