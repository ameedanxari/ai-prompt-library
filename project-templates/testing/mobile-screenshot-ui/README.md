# Mobile Screenshot UI Testing Templates

These assets scaffold native screenshot UI test coverage for iOS and Android apps.
They are designed to be copied into a concrete project and then renamed with the
real app target, package name, bundle IDs, scenarios, selectors, and locales.

## Assets

- `run-mobile-screenshot-tests.sh`: platform runner with simulator/emulator cleanup, locking, debug artifacts, and summary reporting.
- `check-mobile-localization.sh`: key parity check for iOS `.strings` and Android `strings.xml` resources.
- `ios/LocalizedScreenshotUITestCase.swift.template`: reusable XCUITest base class for locale fan-out and PNG output.
- `ios/StoreScreenshotUITests.swift.template`: sample iOS store screenshot UI test class.
- `android/StoreScreenshotTest.kt.template`: sample Android Compose instrumentation screenshot class.

## Expected Integration

1. Move the shell scripts into the consuming project's `scripts/` directory.
2. Move the iOS templates into the consuming app's UI test target and remove the `.template` suffix.
3. Move the Android template into `app/src/androidTest/java/<package>/screenshots/` and remove the `.template` suffix.
4. Replace all `ExampleApp`, `com.example.app`, selectors, scenarios, and fixture values with real project-specific values.
5. Add CI jobs that upload the artifact directory even when the screenshot command fails.

Keep screenshot fixtures deterministic. Do not use production accounts, live services, or unreproducible timestamps for release screenshots.
