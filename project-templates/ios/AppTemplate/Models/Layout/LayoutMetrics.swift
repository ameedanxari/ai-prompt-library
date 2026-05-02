//
//  LayoutMetrics.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import SwiftUI
import CoreGraphics

struct LayoutMetrics: Codable {
    let safeAreaInsets: EdgeInsets
    let touchTargetSize: CGFloat
    let minSpacing: CGFloat
    let maxContentWidth: CGFloat
    
    init(
        safeAreaInsets: EdgeInsets = EdgeInsets(top: 0, leading: 0, bottom: 0, trailing: 0),
        touchTargetSize: CGFloat = 44.0,
        minSpacing: CGFloat = 8.0,
        maxContentWidth: CGFloat = 600.0
    ) {
        self.safeAreaInsets = safeAreaInsets
        self.touchTargetSize = touchTargetSize
        self.minSpacing = minSpacing
        self.maxContentWidth = maxContentWidth
    }
    
    // Get layout metrics for the current device
    static func current() -> LayoutMetrics {
        let insets = UIApplication.shared.windows.first?.safeAreaInsets ?? EdgeInsets()
        return LayoutMetrics(
            safeAreaInsets: EdgeInsets(
                top: insets.top,
                leading: insets.left,
                bottom: insets.bottom,
                trailing: insets.right
            ),
            touchTargetSize: 44.0, // iOS HIG minimum
            minSpacing: 8.0,
            maxContentWidth: 600.0
        )
    }
}
