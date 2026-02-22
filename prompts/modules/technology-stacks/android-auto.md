# Android Auto Development Template

## Purpose

This template provides comprehensive patterns and best practices for building Android Auto applications. It covers the Car App Library architecture, templates, driving safety guidelines, and integration with media, messaging, point-of-interest (POI), and navigation app categories.

## Context

Android Auto connects Android devices to vehicle infotainment systems. Rather than rendering full UI layouts natively, developers use the Car App Library (part of Android Jetpack) to build template-based apps that Google ensures are safe and distraction-free. Development involves specific categories: Media, Messaging, Navigation, POI (Point of Interest), and IOT/Weather.

## Examples

### Example 1: Basic POI Car App Service

```kotlin
import android.content.Intent
import androidx.car.app.CarAppService
import androidx.car.app.Screen
import androidx.car.app.Session
import androidx.car.app.validation.HostValidator

// 1. Declare the Service in AndroidManifest.xml
// <service
//     android:name=".MyCarAppService"
//     android:exported="true">
//     <intent-filter>
//         <action android:name="androidx.car.app.CarAppService" />
//         <category android:name="androidx.car.app.category.POI" />
//     </intent-filter>
// </service>

class MyCarAppService : CarAppService() {
    
    override fun createHostValidator(): HostValidator {
        return HostValidator.ALLOW_ALL_HOSTS_VALIDATOR 
        // Note: For production, use HostValidator.Builder(applicationContext)
        // .addAllowedHosts(androidx.car.app.R.array.hosts_allowlist_sample)
        // .build()
    }

    override fun onCreateSession(): Session {
        return MyCarSession()
    }
}

class MyCarSession : Session() {
    override fun onCreateScreen(intent: Intent): Screen {
        return MainScreen(carContext)
    }
}
```

### Example 2: ListTemplate with POI Items

```kotlin
import androidx.car.app.CarContext
import androidx.car.app.Screen
import androidx.car.app.model.Action
import androidx.car.app.model.CarIcon
import androidx.car.app.model.ItemList
import androidx.car.app.model.ListTemplate
import androidx.car.app.model.Row
import androidx.car.app.model.Template
import androidx.core.graphics.drawable.IconCompat

class MainScreen(carContext: CarContext) : Screen(carContext) {

    override fun onGetTemplate(): Template {
        val itemList = ItemList.Builder()
            .addItem(
                Row.Builder()
                    .setTitle("Nearby Coffee Shop")
                    .addText("0.5 miles away")
                    .setImage(CarIcon.APP_ICON)
                    .setOnClickListener {
                        // Handle click
                    }
                    .build()
            )
            .addItem(
                Row.Builder()
                    .setTitle("Gas Station")
                    .addText("2 miles away")
                    .build()
            )
            .build()

        return ListTemplate.Builder()
            .setTitle("Points of Interest")
            .setHeaderAction(Action.APP_ICON)
            .setSingleList(itemList)
            .build()
    }
}
```

### Example 3: Media Browser Service

```kotlin
import android.os.Bundle
import android.support.v4.media.MediaBrowserCompat
import androidx.media.MediaBrowserServiceCompat

// Media apps use MediaBrowserServiceCompat instead of CarAppService
class MediaPlaybackService : MediaBrowserServiceCompat() {

    override fun onGetRoot(
        clientPackageName: String,
        clientUid: Int,
        rootHints: Bundle?
    ): BrowserRoot? {
        // Verify client is allowed (e.g., Android Auto host)
        return BrowserRoot("root_id", null)
    }

    override fun onLoadChildren(
        parentId: String,
        result: Result<List<MediaBrowserCompat.MediaItem>>
    ) {
        val mediaItems = mutableListOf<MediaBrowserCompat.MediaItem>()
        // Build media items tree
        result.sendResult(mediaItems)
    }
}
```

## Anti-Patterns to Avoid

- **Custom UI Rendering**: Do not attempt to bypass templates (unless strictly building a navigation map surface) to render custom Android Views.
- **Complex Hierarchies**: Deep navigation stacks are actively restricted by the system to reduce driver distraction. Use flat navigation (e.g., TabTemplates).
- **Long Text Blocks**: The system will truncate text that is too long (usually restricted to around 2 lines for safety).
- **Ignoring Constraints**: Attempting to add more items to an `ItemList` than the `CarContext.getCarAppApiLevel()` supports will result in exceptions.
