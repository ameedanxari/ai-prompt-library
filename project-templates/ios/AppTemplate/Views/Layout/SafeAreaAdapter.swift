//
//  SafeAreaAdapter.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import SwiftUI

struct SafeAreaAdapter: ViewModifier {
    let metrics: LayoutMetrics
    
    func body(content: Content) -> some View {
        content
            .padding(.top, metrics.safeAreaInsets.top)
            .padding(.bottom, metrics.safeAreaInsets.bottom)
            .padding(.leading, metrics.safeAreaInsets.leading)
            .padding(.trailing, metrics.safeAreaInsets.trailing)
    }
}

extension View {
    func safeAreaAdapter(_ metrics: LayoutMetrics) -> some View {
        self.modifier(SafeAreaAdapter(metrics: metrics))
    }
}
