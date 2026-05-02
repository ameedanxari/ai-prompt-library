//
//  StatusBarAdapter.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import SwiftUI

struct StatusBarAdapter: ViewModifier {
    let style: StatusBarStyle
    
    func body(content: Content) -> some View {
        content
            .statusBar(hidden: false)
            .onAppear {
                configureStatusBar()
            }
    }
    
    private func configureStatusBar() {
        let preferredStyle: UIStatusBarStyle
        switch style {
        case .default:
            preferredStyle = .default
        case .lightContent:
            preferredStyle = .lightContent
        case .darkContent:
            preferredStyle = .darkContent
        }
        
        UIApplication.shared.windows.first?.rootViewController?.setNeedsStatusBarAppearanceUpdate()
    }
}

extension View {
    func statusBarStyle(_ style: StatusBarStyle) -> some View {
        self.modifier(StatusBarAdapter(style: style))
    }
}
