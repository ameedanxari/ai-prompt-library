//
//  TypographyToken.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation
import SwiftUI
import CoreGraphics

struct TypographyToken: Codable {
    let name: String
    let fontFamily: String
    let fontWeight: String
    let fontSize: CGFloat
    let lineHeight: CGFloat
    let letterSpacing: CGFloat
    
    init(
        name: String,
        fontFamily: String,
        fontWeight: String,
        fontSize: CGFloat,
        lineHeight: CGFloat,
        letterSpacing: CGFloat
    ) {
        self.name = name
        self.fontFamily = fontFamily
        self.fontWeight = fontWeight
        self.fontSize = fontSize
        self.lineHeight = lineHeight
        self.letterSpacing = letterSpacing
    }
    
    // Convert to SwiftUI Font
    func font() -> Font {
        return Font.system(
            size: fontSize,
            weight: weightMapping[fontWeight] ?? .regular,
            design: .default
        )
    }
    
    private let weightMapping: [String: Font.Weight] = [
        "regular": .regular,
        "medium": .medium,
        "semibold": .semibold,
        "bold": .bold,
        "light": .light
    ]
}
