# Stage 07 - Deployment (Mobile Applications)

## Purpose
Configure mobile-specific deployment infrastructure, focusing on app store distribution, mobile CI/CD pipelines, code signing, and mobile-specific monitoring for iOS and Android applications.

## Instructions
Use this stage to set up comprehensive mobile deployment infrastructure that handles app store distribution, automated CI/CD pipelines, secure code signing, and robust monitoring systems.

1. **Configure App Store Distribution**: Set up iOS App Store and Google Play Console accounts and distribution workflows
2. **Implement Mobile CI/CD**: Create automated pipelines for building, testing, and deploying mobile applications
3. **Manage Code Signing**: Set up secure certificate and keystore management for both platforms
4. **Enable OTA Updates**: Configure over-the-air update systems for rapid deployment of non-native changes
5. **Set Up Mobile Monitoring**: Implement crash reporting, performance monitoring, and analytics

## Examples

### Example iOS Fastlane Configuration
```ruby
# ios/fastlane/Fastfile
default_platform(:ios)

platform :ios do
  desc "Build and upload to TestFlight"
  lane :beta do
    increment_build_number(xcodeproj: "App.xcodeproj")
    
    build_app(
      scheme: "App",
      workspace: "App.xcworkspace",
      configuration: "Release",
      export_method: "app-store"
    )
    
    upload_to_testflight(
      skip_waiting_for_build_processing: true,
      changelog: "Bug fixes and performance improvements"
    )
    
    slack(
      message: "iOS app successfully uploaded to TestFlight! 🚀",
      channel: "#mobile-releases"
    )
  end
end
```

### Example Android Deployment Configuration
```ruby
# android/fastlane/Fastfile
default_platform(:android)

platform :android do
  desc "Build and upload to Play Console Internal Track"
  lane :internal do
    gradle(task: "clean")
    gradle(
      task: "bundle",
      build_type: "Release",
      properties: {
        "android.injected.signing.store.file" => ENV["ANDROID_KEYSTORE_FILE"],
        "android.injected.signing.store.password" => ENV["ANDROID_KEYSTORE_PASSWORD"]
      }
    )
    
    upload_to_play_store(
      track: "internal",
      aab: "app/build/outputs/bundle/release/app-release.aab"
    )
  end
end
```

### Example Mobile CI/CD Pipeline
```yaml
# .github/workflows/mobile-deploy.yml
name: Mobile App Deployment

on:
  push:
    branches: [main]

jobs:
  build-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Build and Deploy iOS
        run: |
          cd ios
          bundle exec fastlane beta
```

## Overview
This stage configures mobile-specific deployment infrastructure, focusing on app store distribution, mobile CI/CD pipelines, code signing, and mobile-specific monitoring for iOS and Android applications.

## Scope
- App store deployment and distribution
- Mobile CI/CD pipeline configuration
- Code signing and certificate management
- Mobile app monitoring and crash reporting
- Over-the-air (OTA) update systems

## Mobile Deployment Architecture

### 1. App Store Distribution Strategy

#### iOS App Store Deployment
```markdown
## iOS Deployment Requirements

### Apple Developer Account Setup
- **Individual Account**: $99/year, for single developers
- **Organization Account**: $99/year, for companies and teams
- **Enterprise Account**: $299/year, for internal distribution only

### Code Signing Requirements
- **Development Certificate**: For development and testing
- **Distribution Certificate**: For App Store and Ad Hoc distribution
- **Provisioning Profiles**: Link certificates with app IDs and devices
- **App Store Connect**: Manage app metadata, builds, and releases

### App Store Connect Configuration
- **App Information**: Name, bundle ID, SKU, primary language
- **Pricing and Availability**: Pricing tier, availability territories
- **App Privacy**: Data collection and usage disclosure
- **App Review Information**: Contact details, demo account, notes
```

#### iOS Fastlane Configuration
```ruby
# ios/fastlane/Fastfile
default_platform(:ios)

platform :ios do
  before_all do
    setup_circle_ci
  end

  desc "Build and upload to TestFlight"
  lane :beta do
    # Increment build number
    increment_build_number(xcodeproj: "App.xcodeproj")
    
    # Build the app
    build_app(
      scheme: "App",
      workspace: "App.xcworkspace",
      configuration: "Release",
      export_method: "app-store",
      export_options: {
        provisioningProfiles: {
          "com.example.app" => "App Store Profile"
        }
      }
    )
    
    # Upload to TestFlight
    upload_to_testflight(
      skip_waiting_for_build_processing: true,
      changelog: "Bug fixes and performance improvements"
    )
    
    # Send notification
    slack(
      message: "iOS app successfully uploaded to TestFlight! 🚀",
      channel: "#mobile-releases"
    )
  end

  desc "Deploy to App Store"
  lane :release do
    # Increment version number
    increment_version_number(xcodeproj: "App.xcodeproj")
    increment_build_number(xcodeproj: "App.xcodeproj")
    
    # Build the app
    build_app(
      scheme: "App",
      workspace: "App.xcworkspace",
      configuration: "Release",
      export_method: "app-store"
    )
    
    # Upload to App Store
    upload_to_app_store(
      force: true,
      reject_if_possible: true,
      skip_metadata: false,
      skip_screenshots: false,
      submit_for_review: true,
      automatic_release: false
    )
    
    # Create GitHub release
    github_release = set_github_release(
      repository_name: "company/app",
      api_token: ENV["GITHUB_TOKEN"],
      name: "iOS v#{get_version_number(xcodeproj: 'App.xcodeproj')}",
      tag_name: "ios-v#{get_version_number(xcodeproj: 'App.xcodeproj')}-#{get_build_number(xcodeproj: 'App.xcodeproj')}",
      description: "iOS release with bug fixes and new features"
    )
    
    slack(
      message: "iOS app submitted to App Store for review! 📱",
      channel: "#mobile-releases"
    )
  end

  desc "Run tests"
  lane :test do
    run_tests(
      workspace: "App.xcworkspace",
      scheme: "App",
      device: "iPhone 14",
      code_coverage: true
    )
  end

  error do |lane, exception|
    slack(
      message: "iOS deployment failed: #{exception.message}",
      success: false,
      channel: "#mobile-releases"
    )
  end
end
```

#### Android Google Play Deployment
```markdown
## Android Deployment Requirements

### Google Play Console Setup
- **Developer Account**: $25 one-time registration fee
- **App Bundle**: Required format for new apps (replaces APK)
- **Play App Signing**: Google manages app signing keys
- **Release Tracks**: Internal, Alpha, Beta, Production

### Signing Configuration
- **Upload Key**: Used to sign app bundles for upload
- **App Signing Key**: Managed by Google Play (recommended)
- **Keystore Management**: Secure storage of signing keys
- **Play Console Configuration**: Upload key certificate
```

#### Android Fastlane Configuration
```ruby
# android/fastlane/Fastfile
default_platform(:android)

platform :android do
  desc "Build and upload to Play Console Internal Track"
  lane :internal do
    # Clean and build
    gradle(task: "clean")
    gradle(
      task: "bundle",
      build_type: "Release",
      properties: {
        "android.injected.signing.store.file" => ENV["ANDROID_KEYSTORE_FILE"],
        "android.injected.signing.store.password" => ENV["ANDROID_KEYSTORE_PASSWORD"],
        "android.injected.signing.key.alias" => ENV["ANDROID_KEY_ALIAS"],
        "android.injected.signing.key.password" => ENV["ANDROID_KEY_PASSWORD"]
      }
    )
    
    # Upload to Play Console
    upload_to_play_store(
      track: "internal",
      aab: "app/build/outputs/bundle/release/app-release.aab",
      skip_upload_metadata: true,
      skip_upload_images: true,
      skip_upload_screenshots: true
    )
    
    slack(
      message: "Android app uploaded to Play Console Internal Track! 🤖",
      channel: "#mobile-releases"
    )
  end

  desc "Promote to Beta"
  lane :beta do
    upload_to_play_store(
      track: "internal",
      track_promote_to: "beta",
      skip_upload_changelogs: false,
      skip_upload_metadata: true,
      skip_upload_images: true,
      skip_upload_screenshots: true
    )
    
    slack(
      message: "Android app promoted to Beta track! 🚀",
      channel: "#mobile-releases"
    )
  end

  desc "Deploy to Production"
  lane :production do
    upload_to_play_store(
      track: "beta",
      track_promote_to: "production",
      rollout: "0.1", # Start with 10% rollout
      skip_upload_changelogs: false,
      skip_upload_metadata: false,
      skip_upload_images: false,
      skip_upload_screenshots: false
    )
    
    slack(
      message: "Android app deployed to Production with 10% rollout! 📱",
      channel: "#mobile-releases"
    )
  end

  desc "Run tests"
  lane :test do
    gradle(task: "test")
    gradle(task: "connectedAndroidTest")
  end

  error do |lane, exception|
    slack(
      message: "Android deployment failed: #{exception.message}",
      success: false,
      channel: "#mobile-releases"
    )
  end
end
```

### 2. Mobile CI/CD Pipeline Configuration

#### GitHub Actions for React Native
```yaml
# .github/workflows/mobile-deploy.yml
name: Mobile App Deployment

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'
  JAVA_VERSION: '11'
  XCODE_VERSION: '14.3'

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration

  build-ios:
    name: Build iOS
    needs: test
    runs-on: macos-latest
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.0'
          bundler-cache: true
          working-directory: ios
      
      - name: Install CocoaPods
        run: |
          cd ios
          pod install
      
      - name: Setup Xcode
        uses: maxim-lobanov/setup-xcode@v1
        with:
          xcode-version: ${{ env.XCODE_VERSION }}
      
      - name: Import Code Signing Certificates
        uses: apple-actions/import-codesign-certs@v2
        with:
          p12-file-base64: ${{ secrets.IOS_DIST_SIGNING_KEY }}
          p12-password: ${{ secrets.IOS_DIST_SIGNING_KEY_PASSWORD }}
      
      - name: Install Provisioning Profiles
        uses: apple-actions/download-provisioning-profiles@v1
        with:
          bundle-id: com.example.app
          issuer-id: ${{ secrets.APPSTORE_ISSUER_ID }}
          api-key-id: ${{ secrets.APPSTORE_KEY_ID }}
          api-private-key: ${{ secrets.APPSTORE_PRIVATE_KEY }}
      
      - name: Build and Deploy iOS
        run: |
          cd ios
          if [ "${{ github.ref }}" = "refs/heads/main" ]; then
            bundle exec fastlane release
          else
            bundle exec fastlane beta
          fi
        env:
          FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD: ${{ secrets.FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD }}
          FASTLANE_SESSION: ${{ secrets.FASTLANE_SESSION }}
          MATCH_PASSWORD: ${{ secrets.MATCH_PASSWORD }}

  build-android:
    name: Build Android
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          distribution: 'temurin'
          java-version: ${{ env.JAVA_VERSION }}
      
      - name: Setup Android SDK
        uses: android-actions/setup-android@v2
      
      - name: Install dependencies
        run: npm ci
      
      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.0'
          bundler-cache: true
          working-directory: android
      
      - name: Decode Keystore
        run: |
          echo "${{ secrets.ANDROID_KEYSTORE_BASE64 }}" | base64 -d > android/app/keystore.jks
      
      - name: Build and Deploy Android
        run: |
          cd android
          if [ "${{ github.ref }}" = "refs/heads/main" ]; then
            bundle exec fastlane production
          else
            bundle exec fastlane internal
          fi
        env:
          ANDROID_KEYSTORE_FILE: keystore.jks
          ANDROID_KEYSTORE_PASSWORD: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
          ANDROID_KEY_ALIAS: ${{ secrets.ANDROID_KEY_ALIAS }}
          ANDROID_KEY_PASSWORD: ${{ secrets.ANDROID_KEY_PASSWORD }}
          GOOGLE_PLAY_JSON_KEY_DATA: ${{ secrets.GOOGLE_PLAY_JSON_KEY_DATA }}
```

### 3. Code Signing and Certificate Management

#### iOS Certificate Management with Match
```ruby
# ios/fastlane/Matchfile
git_url("https://github.com/company/certificates")
storage_mode("git")
type("development")
app_identifier(["com.example.app"])
username("developer@company.com")
```

```ruby
# Certificate management lane
lane :certificates do
  match(
    type: "development",
    readonly: is_ci,
    app_identifier: "com.example.app"
  )
  
  match(
    type: "appstore",
    readonly: is_ci,
    app_identifier: "com.example.app"
  )
end
```

#### Android Keystore Management
```bash
#!/bin/bash
# scripts/generate-android-keystore.sh

# Generate keystore for Android app signing
keytool -genkey -v \
  -keystore app-release-key.keystore \
  -alias app-release \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass "$KEYSTORE_PASSWORD" \
  -keypass "$KEY_PASSWORD" \
  -dname "CN=Company Name, OU=Mobile Team, O=Company, L=City, ST=State, C=US"

# Convert to base64 for CI/CD storage
base64 -i app-release-key.keystore -o keystore-base64.txt

echo "Keystore generated and encoded to base64"
echo "Add the contents of keystore-base64.txt to your CI/CD secrets"
```

### 4. Over-the-Air (OTA) Updates

#### Expo Updates Configuration
```javascript
// app.config.js
export default {
  expo: {
    name: "My App",
    slug: "my-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    updates: {
      url: "https://u.expo.dev/your-project-id",
      enabled: true,
      checkAutomatically: "ON_LOAD",
      fallbackToCacheTimeout: 5000
    },
    runtimeVersion: {
      policy: "sdkVersion"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.example.app"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF"
      },
      package: "com.example.app"
    },
    web: {
      favicon: "./assets/favicon.png"
    }
  }
};
```

#### CodePush Configuration (React Native)
```javascript
// App.js with CodePush
import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import CodePush from 'react-native-code-push';

const App = () => {
  useEffect(() => {
    CodePush.sync({
      updateDialog: {
        title: "Update Available",
        optionalUpdateMessage: "An update is available. Would you like to install it?",
        optionalIgnoreButtonLabel: "Later",
        optionalInstallButtonLabel: "Install"
      },
      installMode: CodePush.InstallMode.ON_NEXT_RESTART
    });
  }, []);

  return (
    // Your app components
  );
};

const codePushOptions = {
  checkFrequency: CodePush.CheckFrequency.ON_APP_RESUME,
  installMode: CodePush.InstallMode.ON_NEXT_RESTART
};

export default CodePush(codePushOptions)(App);
```

### 5. Mobile App Monitoring and Analytics

#### Crash Reporting Setup
```javascript
// src/monitoring/crashlytics.js
import crashlytics from '@react-native-firebase/crashlytics';

class CrashReporting {
  static initialize() {
    // Enable crash reporting in production
    if (!__DEV__) {
      crashlytics().setCrashlyticsCollectionEnabled(true);
    }
  }

  static setUserId(userId) {
    crashlytics().setUserId(userId);
  }

  static setUserAttributes(attributes) {
    Object.keys(attributes).forEach(key => {
      crashlytics().setAttribute(key, attributes[key]);
    });
  }

  static logError(error, context = {}) {
    if (__DEV__) {
      console.error('Error:', error, context);
    } else {
      // Log context
      Object.keys(context).forEach(key => {
        crashlytics().log(`${key}: ${context[key]}`);
      });
      
      // Record error
      crashlytics().recordError(error);
    }
  }

  static logEvent(eventName, parameters = {}) {
    crashlytics().log(`Event: ${eventName}`);
    Object.keys(parameters).forEach(key => {
      crashlytics().log(`${key}: ${parameters[key]}`);
    });
  }
}

export default CrashReporting;
```

#### Performance Monitoring
```javascript
// src/monitoring/performance.js
import perf from '@react-native-firebase/perf';

class PerformanceMonitoring {
  static async measureScreenLoad(screenName) {
    const trace = perf().newTrace(`screen_load_${screenName}`);
    await trace.start();
    
    return {
      stop: async () => {
        await trace.stop();
      },
      putAttribute: (key, value) => {
        trace.putAttribute(key, value);
      },
      putMetric: (key, value) => {
        trace.putMetric(key, value);
      }
    };
  }

  static async measureNetworkRequest(url, method = 'GET') {
    const httpMetric = perf().newHttpMetric(url, method);
    await httpMetric.start();
    
    return {
      setHttpResponseCode: (code) => {
        httpMetric.setHttpResponseCode(code);
      },
      setRequestPayloadSize: (size) => {
        httpMetric.setRequestPayloadSize(size);
      },
      setResponseContentType: (type) => {
        httpMetric.setResponseContentType(type);
      },
      setResponsePayloadSize: (size) => {
        httpMetric.setResponsePayloadSize(size);
      },
      stop: async () => {
        await httpMetric.stop();
      }
    };
  }

  static async measureCustomTrace(traceName) {
    const trace = perf().newTrace(traceName);
    await trace.start();
    
    return trace;
  }
}

export default PerformanceMonitoring;
```

## Mobile Deployment Procedures

### 1. Pre-Deployment Mobile Checklist
```markdown
## Mobile-Specific Pre-Deployment Checks

### iOS Specific
- [ ] App builds successfully with latest Xcode
- [ ] All required app icons and launch screens included
- [ ] Info.plist configured correctly
- [ ] Privacy usage descriptions added for all permissions
- [ ] App Store Connect metadata is complete
- [ ] TestFlight beta testing completed

### Android Specific
- [ ] App Bundle builds successfully
- [ ] All required app icons and adaptive icons included
- [ ] AndroidManifest.xml configured correctly
- [ ] Play Console metadata is complete
- [ ] Internal testing track validated
- [ ] Proguard/R8 configuration tested

### Cross-Platform
- [ ] App performance tested on minimum spec devices
- [ ] Battery usage optimized
- [ ] Network handling tested (offline, slow connections)
- [ ] Push notifications configured and tested
- [ ] Deep linking functionality verified
- [ ] Crash reporting and analytics integrated
```

### 2. Staged Rollout Strategy
```markdown
## Mobile Rollout Strategy

### iOS Phased Release
1. **TestFlight Beta**: Internal team and beta testers
2. **App Store Review**: Submit for Apple review
3. **Phased Release**: Enable phased release for gradual rollout
4. **Monitor**: Watch crash reports and user feedback
5. **Full Release**: Release to all users after validation

### Android Staged Rollout
1. **Internal Track**: Development team testing
2. **Alpha Track**: Closed testing with selected users
3. **Beta Track**: Open testing with larger user group
4. **Production**: Start with 5% rollout
5. **Gradual Increase**: 10% → 25% → 50% → 100%
6. **Monitor**: Watch Play Console vitals and user reviews
```

### 3. Rollback Procedures
```bash
#!/bin/bash
# scripts/mobile-rollback.sh

PLATFORM=$1
VERSION=$2

if [ -z "$PLATFORM" ] || [ -z "$VERSION" ]; then
    echo "Usage: $0 <ios|android> <version>"
    exit 1
fi

case $PLATFORM in
    ios)
        echo "Rolling back iOS to version $VERSION..."
        cd ios
        bundle exec fastlane rollback version:$VERSION
        ;;
    android)
        echo "Rolling back Android to version $VERSION..."
        cd android
        bundle exec fastlane rollback version:$VERSION
        ;;
    *)
        echo "Invalid platform. Use 'ios' or 'android'"
        exit 1
        ;;
esac

echo "Rollback completed for $PLATFORM to version $VERSION"
```

## Integration Points

### Previous Stage Dependencies
- **Stage 06 (Implementation)**: Complete mobile application build
- **Testing**: All mobile-specific tests passing
- **Assets**: App icons, splash screens, and store assets

### Next Stage Deliverables
- **App Store Listings**: Live applications on iOS App Store and Google Play
- **Distribution Certificates**: Properly configured code signing
- **CI/CD Pipeline**: Automated mobile deployment workflows
- **Monitoring Setup**: Crash reporting and performance monitoring
- **OTA Update System**: Over-the-air update capability (if applicable)

## Success Criteria
- Applications are successfully deployed to app stores
- Code signing and certificate management is automated
- CI/CD pipeline reliably builds and deploys mobile apps
- Crash reporting and performance monitoring are operational
- Rollback procedures are tested and documented

## Risk Mitigation
- **App Store Rejection**: Thorough pre-submission testing and compliance checks
- **Certificate Expiry**: Automated certificate renewal and monitoring
- **Build Failures**: Comprehensive CI/CD pipeline with proper error handling
- **Performance Issues**: Continuous performance monitoring and optimization
- **User Experience Problems**: Staged rollout with monitoring and quick rollback capability