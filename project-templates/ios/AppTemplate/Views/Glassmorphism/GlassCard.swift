//
//  GlassCard.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import SwiftUI

struct GlassCard<Content: View>: View {
    let config: GlassCardConfig
    let content: () -> Content
    @Environment(\.colorScheme) private var colorScheme
    
    var body: some View {
        let glassEffect = adaptiveGlassEffect(for: colorScheme)
        
        ZStack {
            // Glass effect background
            RoundedRectangle(cornerRadius: config.cornerRadius)
                .fill(.ultraThinMaterial)
                .blur(radius: glassEffect.blur(for: colorScheme))
                .opacity(glassEffect.transparency(for: colorScheme))
            
            // Border
            RoundedRectangle(cornerRadius: config.cornerRadius)
                .strokeBorder(
                    Color.white.opacity(config.borderWidth > 0 ? 0.2 : 0),
                    lineWidth: config.borderWidth
                )
            
            // Shadow
            if config.shadowEnabled {
                RoundedRectangle(cornerRadius: config.cornerRadius)
                    .shadow(
                        color: Color.black.opacity(0.1),
                        radius: 8,
                        x: 0,
                        y: 2
                    )
            }
            
            // Content
            content()
                .padding(DesignTokens.spacing("md") ?? 16)
        }
        .clipShape(RoundedRectangle(cornerRadius: config.cornerRadius))
    }
}

// Preview
#Preview {
    VStack(spacing: 16) {
        GlassCard(config: .default) {
            Text("Glass Card Content")
                .font(DesignTokens.typography("body")?.font() ?? .body)
        }
        
        GlassCard(config: GlassCardConfig(blurStyle: .light)) {
            Text("Light Glass Card")
                .font(DesignTokens.typography("body")?.font() ?? .body)
        }
        
        GlassCard(config: GlassCardConfig(blurStyle: .dark)) {
            Text("Dark Glass Card")
                .font(DesignTokens.typography("body")?.font() ?? .body)
        }
    }
    .padding()
}
