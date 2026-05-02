//
//  TypographyScale.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation
import SwiftUI
import CoreGraphics

struct TypographyScale: Codable {
    let display: TypographyToken
    let headline: TypographyToken
    let body: TypographyToken
    let caption: TypographyToken
    
    init(display: TypographyToken, headline: TypographyToken, body: TypographyToken, caption: TypographyToken) {
        self.display = display
        self.headline = headline
        self.body = body
        self.caption = caption
    }
    
    // iOS-specific typography scale using SF Pro
    static let ios = TypographyScale(
        display: TypographyToken(
            name: "display",
            fontFamily: "SF Pro Display",
            fontWeight: "bold",
            fontSize: 32.0,
            lineHeight: 40.0,
            letterSpacing: 0.0
        ),
        headline: TypographyToken(
            name: "headline",
            fontFamily: "SF Pro Display",
            fontWeight: "semibold",
            fontSize: 24.0,
            lineHeight: 32.0,
            letterSpacing: 0.0
        ),
        body: TypographyToken(
            name: "body",
            fontFamily: "SF Pro Text",
            fontWeight: "regular",
            fontSize: 16.0,
            lineHeight: 24.0,
            letterSpacing: 0.0
        ),
        caption: TypographyToken(
            name: "caption",
            fontFamily: "SF Pro Text",
            fontWeight: "regular",
            fontSize: 14.0,
            lineHeight: 20.0,
            letterSpacing: 0.0
        )
    )
}
