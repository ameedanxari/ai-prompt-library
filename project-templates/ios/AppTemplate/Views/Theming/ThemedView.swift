//
//  ThemedView.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import SwiftUI

struct ThemedView<Content: View>: View {
    let theme: ThemeConfiguration
    let content: () -> Content
    
    @Environment(\.colorScheme) private var colorScheme
    
    var body: some View {
        let effectiveScheme = ThemeUtils.colorScheme(from: theme)
        let glassEffect = adaptiveGlassEffect(
            for: effectiveScheme,
            customIntensity: theme.customGlassIntensity
        )
        
        content()
            .environment(\.colorScheme, effectiveScheme)
            .preferredColorScheme(effectiveScheme)
            .background(backgroundColor(for: effectiveScheme))
    }
    
    private func backgroundColor(for scheme: ColorScheme) -> Color {
        switch scheme {
        case .light:
            return Color.white
        case .dark:
            return Color.black
        @unknown default:
            return Color.white
        }
    }
}
