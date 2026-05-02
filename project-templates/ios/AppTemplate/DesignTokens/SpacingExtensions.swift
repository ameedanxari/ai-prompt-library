//
//  SpacingExtensions.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import SwiftUI

extension View {
    func spacing(_ name: String) -> some View {
        let value = Spacing.value(name) ?? 0
        return self.padding(value)
    }
    
    func spacingX(_ name: String) -> some View {
        let value = Spacing.value(name) ?? 0
        return self.padding(.horizontal, value)
    }
    
    func spacingY(_ name: String) -> some View {
        let value = Spacing.value(name) ?? 0
        return self.padding(.vertical, value)
    }
}
