//
//  AnimatedTransition.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import SwiftUI

struct AnimatedTransition: ViewModifier {
    let config: TransitionConfig
    @State private var isVisible: Bool = false
    
    func body(content: Content) -> some View {
        content
            .opacity(isVisible ? 1 : 0)
            .scaleEffect(isVisible ? 1 : 0.95)
            .onAppear {
                withAnimation(animation(for: config)) {
                    isVisible = true
                }
            }
    }
    
    private func animation(for config: TransitionConfig) -> Animation {
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

extension View {
    func animatedTransition(_ config: TransitionConfig) -> some View {
        self.modifier(AnimatedTransition(config: config))
    }
}
