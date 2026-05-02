//
//  DynamicTypeSupport.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import SwiftUI

extension View {
    func supportsDynamicType() -> some View {
        self.font(.body)
            .dynamicTypeSize(.large ... .accessibility5)
    }
}
