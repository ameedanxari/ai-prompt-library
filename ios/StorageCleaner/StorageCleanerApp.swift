//
//  StorageCleanerApp.swift
//  StorageCleaner
//
//  Created by Ameed Khalid on 28/04/2026.
//

import SwiftUI
import CoreData

@main
struct StorageCleanerApp: App {
    let persistenceController = PersistenceController.shared

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(\.managedObjectContext, persistenceController.container.viewContext)
        }
    }
}
