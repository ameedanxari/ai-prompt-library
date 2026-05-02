//
//  MotionToken.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation

struct MotionToken: Codable {
    let name: String
    let duration: TimeInterval
    let easing: String
    let delay: TimeInterval
    
    init(name: String, duration: TimeInterval, easing: String, delay: TimeInterval) {
        self.name = name
        self.duration = duration
        self.easing = easing
        self.delay = delay
    }
}
