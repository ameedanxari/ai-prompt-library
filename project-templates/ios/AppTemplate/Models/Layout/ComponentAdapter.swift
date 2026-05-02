//
//  ComponentAdapter.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation

struct ComponentAdapter: Codable {
    let iosComponent: String
    let androidComponent: String
    let sharedBehavior: String
    
    init(iosComponent: String, androidComponent: String, sharedBehavior: String) {
        self.iosComponent = iosComponent
        self.androidComponent = androidComponent
        self.sharedBehavior = sharedBehavior
    }
    
    // Common component adapters
    static let button = ComponentAdapter(
        iosComponent: "Button",
        androidComponent: "Button",
        sharedBehavior: "Trigger action on tap"
    )
    
    static let card = ComponentAdapter(
        iosComponent: "GlassCard",
        androidComponent: "GlassCard",
        sharedBehavior: "Display content with glass effect"
    )
    
    static let navigation = ComponentAdapter(
        iosComponent: "TabView",
        androidComponent: "NavigationBar",
        sharedBehavior: "Navigate between top-level destinations"
    )
}
