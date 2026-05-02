//
//  TypographyStyles.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import SwiftUI

struct TypographyStyles {
    static let display: Font = TypographyScale.ios.display.font()
    static let headline: Font = TypographyScale.ios.headline.font()
    static let body: Font = TypographyScale.ios.body.font()
    static let caption: Font = TypographyScale.ios.caption.font()
    
    // Helper method to get font by name
    static func font(_ name: String) -> Font? {
        let scale = TypographyScale.current()
        switch name {
        case "display": return scale.display.font()
        case "headline": return scale.headline.font()
        case "body": return scale.body.font()
        case "caption": return scale.caption.font()
        default: return nil
        }
    }
}
