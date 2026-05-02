//
//  GlassButton.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import SwiftUI

struct GlassButton: View {
    let config: GlassButtonConfig
    let action: () -> Void
    let title: String
    @Environment(\.colorScheme) private var colorScheme
    @State private var isPressed: Bool = false
    
    var body: some View {
        Button(action: {
            if config.hapticFeedback {
                let generator = UIImpactFeedbackGenerator(style: .medium)
                generator.impactOccurred()
            }
            action()
        }) {
            ZStack {
                // Glass effect background
                RoundedRectangle(cornerRadius: 12)
                    .fill(buttonBackgroundColor)
                    .opacity(config.glassIntensity)
                
                // Border
                RoundedRectangle(cornerRadius: 12)
                    .strokeBorder(
                        buttonBorderColor,
                        lineWidth: 1
                    )
                
                // Text
                Text(title)
                    .font(DesignTokens.typography("body")?.font() ?? .body)
                    .fontWeight(.semibold)
                    .foregroundColor(buttonTextColor)
            }
            .scaleEffect(isPressed ? 0.95 : 1.0)
            .animation(.easeInOut(duration: 0.1), value: isPressed)
        }
        .buttonStyle(PlainButtonStyle())
        .onLongPressGesture(minimumDuration: 0, pressing: { pressing in
            isPressed = pressing
        }, perform: {})
    }
    
    private var buttonBackgroundColor: Color {
        switch config.style {
        case .primary:
            return DesignTokens.color("primary", for: colorScheme) ?? Color.blue
        case .secondary:
            return DesignTokens.color("secondary", for: colorScheme) ?? Color.green
        case .ghost:
            return Color.clear
        }
    }
    
    private var buttonBorderColor: Color {
        switch config.style {
        case .primary, .secondary:
            return Color.clear
        case .ghost:
            return DesignTokens.color("text", for: colorScheme) ?? Color.black
        }
    }
    
    private var buttonTextColor: Color {
        switch config.style {
        case .primary:
            return DesignTokens.color("background", for: colorScheme) ?? Color.white
        case .secondary:
            return DesignTokens.color("background", for: colorScheme) ?? Color.white
        case .ghost:
            return DesignTokens.color("text", for: colorScheme) ?? Color.black
        }
    }
}

// Preview
#Preview {
    VStack(spacing: 16) {
        GlassButton(config: .default, title: "Primary") {
            print("Primary button tapped")
        }
        
        GlassButton(config: GlassButtonConfig(style: .secondary), title: "Secondary") {
            print("Secondary button tapped")
        }
        
        GlassButton(config: GlassButtonConfig(style: .ghost), title: "Ghost") {
            print("Ghost button tapped")
        }
    }
    .padding()
}
