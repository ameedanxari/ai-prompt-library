//
//  PlatformAdaptiveView.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import SwiftUI

struct PlatformAdaptiveView<Content: View>: View {
    let iosLayout: AnyView
    let androidLayout: AnyView
    
    @Environment(\.horizontalSizeClass) private var horizontalSizeClass
    
    var body: some View {
        #if os(iOS)
        iosLayout
        #else
        androidLayout
        #endif
    }
    
    init(iosLayout: some View, androidLayout: some View) {
        self.iosLayout = AnyView(iosLayout)
        self.androidLayout = AnyView(androidLayout)
    }
}

// Convenience initializer for content closures
extension PlatformAdaptiveView {
    init(
        @ViewBuilder iosLayout: () -> some View,
        @ViewBuilder androidLayout: () -> some View
    ) {
        self.iosLayout = AnyView(iosLayout())
        self.androidLayout = AnyView(androidLayout())
    }
}
