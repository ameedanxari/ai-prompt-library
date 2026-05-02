//
//  MicroInteraction.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import SwiftUI

enum InteractionType {
    case scale
    case fade
    case slide
    case rotate
}

enum InteractionTrigger {
    case onPress
    case onAppear
    case onScroll
}

struct MicroInteraction {
    let type: InteractionType
    let trigger: InteractionTrigger
    let config: TransitionConfig
}

// View modifier for micro-interactions
struct MicroInteractionModifier: ViewModifier {
    let interaction: MicroInteraction
    @State private var isTriggered: Bool = false
    
    func body(content: Content) -> some View {
        content
            .modifier(effect(for: interaction.type))
            .onAppear {
                if interaction.trigger == .onAppear {
                    withAnimation(animation(for: interaction.config)) {
                        isTriggered = true
                    }
                }
            }
    }
    
    @ViewBuilder
    private func effect(for type: InteractionType) -> some View {
        switch type {
        case .scale:
            content.scaleEffect(isTriggered ? 1.0 : 0.95)
        case .fade:
            content.opacity(isTriggered ? 1.0 : 0.0)
        case .slide:
            content.offset(y: isTriggered ? 0 : 20)
        case .rotate:
            content.rotationEffect(.degrees(isTriggered ? 0 : -10))
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
    func microInteraction(_ interaction: MicroInteraction) -> some View {
        self.modifier(MicroInteractionModifier(interaction: interaction))
    }
}
