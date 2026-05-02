//
//  PlatformTypography.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation

struct PlatformTypography: Codable {
    let ios: TypographyScale
    let android: TypographyScale
    let shared: TypographyScale
    
    init(ios: TypographyScale, android: TypographyScale, shared: TypographyScale) {
        self.ios = ios
        self.android = android
        self.shared = shared
    }
    
    // Get the appropriate typography scale for the current platform
    static func current() -> TypographyScale {
        #if os(iOS)
        return TypographyScale.ios
        #else
        return TypographyScale.shared
        #endif
    }
}
