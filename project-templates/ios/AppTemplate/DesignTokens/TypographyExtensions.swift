//
//  TypographyExtensions.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import SwiftUI

extension View {
    func typography(_ name: String) -> some View {
        self.font(TypographyStyles.font(name))
    }
    
    func display() -> some View {
        self.font(TypographyStyles.display)
    }
    
    func headline() -> some View {
        self.font(TypographyStyles.headline)
    }
    
    func body() -> some View {
        self.font(TypographyStyles.body)
    }
    
    func caption() -> some View {
        self.font(TypographyStyles.caption)
    }
}
