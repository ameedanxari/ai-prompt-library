# Apple CarPlay Development Template

<!-- INSTANTIATION RULES
When the drill-down engine (or any orchestrator) uses this template:
1. Every placeholder — including {{variables}}, <TBD>, [project name], and generic
   field/function/endpoint names — MUST be replaced with project-specific values
   before output is written to prompts/outputs/current/.
2. The template filename MUST NOT appear in task output. Dissolve the template
   into concrete content; do not reference its source.
3. No strings beginning with ".ai-prompts/prompts/" may appear in the output
   (validated by scripts/validate-instantiation.sh).
4. Outputs must contain real data shapes, real endpoints, real file paths, and
   real function signatures specific to the project.
-->


## Purpose

This template provides patterns and context for building Apple CarPlay applications. It covers integrating with the CarPlay framework, provisioning, app types (Audio, Communication, EV Charging, Navigation, Parking, Quick Food Ordering), and utilizing `CPTemplateApplicationSceneDelegate`.

## Context

Apple CarPlay projects device interfaces onto vehicle head units. Unlike standard iOS apps, CarPlay apps do not use UIKit components like `UIViewController` or SwiftUI directly. Instead, they use a template-based architecture provided by the `CarPlay` framework. Development requires specific Apple Developer entitlements depending on the app category.

## Examples

### Example 1: Basic CarPlay Scene Delegate Configuration

```swift
import Foundation
import CarPlay
import UIKit

// Ensure your Info.plist contains the UIApplicationSceneManifest configured for CarPlay:
// <key>UISceneConfigurations</key>
// <dict>
//     <key>CPTemplateApplicationSceneSessionRoleApplication</key>
//     <array>
//         <dict>
//             <key>UISceneClassName</key>
//             <string>CPTemplateApplicationScene</string>
//             <key>UISceneDelegateClassName</key>
//             <string>$(PRODUCT_MODULE_NAME).CarPlaySceneDelegate</string>
//         </dict>
//     </array>
// </dict>

class CarPlaySceneDelegate: UIResponder, CPTemplateApplicationSceneDelegate {
    
    var interfaceController: CPInterfaceController?
    
    func templateApplicationScene(_ templateApplicationScene: CPTemplateApplicationScene, 
                                  didConnect interfaceController: CPInterfaceController) {
        
        self.interfaceController = interfaceController
        
        // Build the initial template
        let rootTemplate = buildRootTemplate()
        
        // Set the root template
        interfaceController.setRootTemplate(rootTemplate, animated: true) { success, error in
            if let error = error {
                print("Error setting root template: \(error.localizedDescription)")
            }
        }
    }
    
    func templateApplicationScene(_ templateApplicationScene: CPTemplateApplicationScene, 
                                  didDisconnectInterfaceController interfaceController: CPInterfaceController) {
        self.interfaceController = nil
    }
    
    private func buildRootTemplate() -> CPTemplate {
        let item = CPListItem(text: "Nearby Coffee", detailText: "0.5 miles away")
        item.handler = { item, completion in
            // Handle selection
            print("Selected: \(item.text ?? "")")
            completion()
        }
        
        let section = CPListSection(items: [item])
        let listTemplate = CPListTemplate(title: "Points of Interest", sections: [section])
        
        return listTemplate
    }
}
```

### Example 2: Tab Bar Template

```swift
import CarPlay

func buildTabBarTemplate() -> CPTabBarTemplate {
    
    // Tab 1: List
    let coffeeItem = CPListItem(text: "Coffee Shops", detailText: nil)
    let coffeeSection = CPListSection(items: [coffeeItem])
    let listTemplate = CPListTemplate(title: "Places", sections: [coffeeSection])
    listTemplate.tabImage = UIImage(systemName: "cup.and.saucer.fill")
    
    // Tab 2: Grid
    let gridButton = CPGridButton(titleVariants: ["Navigate"], image: UIImage(systemName: "location.fill")!) { button in
        // Handle button
    }
    let gridTemplate = CPGridTemplate(title: "Actions", gridButtons: [gridButton])
    gridTemplate.tabImage = UIImage(systemName: "square.grid.2x2.fill")
    
    let tabBarTemplate = CPTabBarTemplate(templates: [listTemplate, gridTemplate])
    
    return tabBarTemplate
}
```

### Example 3: Map Navigation Delegate Setup

```swift
import CarPlay

class CarPlaySceneDelegate: UIResponder, CPTemplateApplicationSceneDelegate, CPMapTemplateDelegate {
    
    var interfaceController: CPInterfaceController?
    
    func templateApplicationScene(_ templateApplicationScene: CPTemplateApplicationScene, 
                                  didConnect interfaceController: CPInterfaceController) {
        
        self.interfaceController = interfaceController
        let mapTemplate = CPMapTemplate()
        mapTemplate.mapDelegate = self
        
        // Note: Actual map rendering is done via a base UIWindow assigned to mapTemplate.mapWindow
        
        let panningInterface = CPPanningInterface()
        mapTemplate.showPanningInterface(animated: true)
        
        interfaceController.setRootTemplate(mapTemplate, animated: true, completion: nil)
    }
    
    func mapTemplate(_ mapTemplate: CPMapTemplate, panBeganWith direction: CPPanDirection) {
        // Handle map panning
    }
}
```

## Anti-Patterns to Avoid

- **Missing Entitlements**: Trying to run or submit a CarPlay app without the correct profile and `com.apple.developer.carplay-*` entitlements will result in immediate failure or rejection.
- **Complex Input**: Requiring users to type text or interact with complex forms. Always default to simple taps and voice input (SiriKit).
- **Using Unsupported Controls**: Attempting to overlay UIKit alerts or standard view controllers on `CPTemplateApplicationScene`. Only CarPlay templates (`CPTemplate` subclasses) are supported.
- **Blocking the Main Thread**: Long-running operations during template creation will stutter the vehicle head unit UI and get the app killed by the watchdog.
