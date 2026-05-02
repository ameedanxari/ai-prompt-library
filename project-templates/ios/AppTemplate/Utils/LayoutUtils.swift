//
//  LayoutUtils.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import SwiftUI

func getLayoutMetrics(for platform: Platform) -> LayoutMetrics {
    switch platform {
    case .ios:
        return LayoutMetrics.current()
    case .android:
        // Return Android-specific metrics (for cross-platform reference)
        return LayoutMetrics(
            safeAreaInsets: EdgeInsets(top: 0, leading: 0, bottom: 0, trailing: 0),
            touchTargetSize: 48.0, // Android minimum
            minSpacing: 8.0,
            maxContentWidth: 600.0
        )
    }
}
