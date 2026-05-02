//
//  PlatformLayout.swift
//  AppTemplate
//
//  Created by AI on 02/05/2026.
//

import Foundation

enum Platform: String, CaseIterable {
    case ios
    case android
}

enum NavigationStyle: String, CaseIterable {
    case tabBar
    case bottomNav
    case sidebar
}

enum StatusBarStyle: String, CaseIterable {
    case default
    case lightContent
    case darkContent
}

struct PlatformLayout: Codable {
    let platform: Platform
    let navigationStyle: NavigationStyle
    let statusBarStyle: StatusBarStyle
    
    init(
        platform: Platform = .ios,
        navigationStyle: NavigationStyle = .tabBar,
        statusBarStyle: StatusBarStyle = .default
    ) {
        self.platform = platform
        self.navigationStyle = navigationStyle
        self.statusBarStyle = statusBarStyle
    }
    
    static let iosDefault = PlatformLayout(
        platform: .ios,
        navigationStyle: .tabBar,
        statusBarStyle: .default
    )
}
