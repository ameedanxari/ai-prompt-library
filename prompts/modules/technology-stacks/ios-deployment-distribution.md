# iOS Deployment & Distribution Template

## Purpose

Provide comprehensive guidance for deploying and distributing iOS applications through the App Store, TestFlight, and enterprise distribution channels. This template covers code signing, provisioning profiles, build configurations, App Store submission, beta testing, and continuous deployment strategies for iOS applications.

## Context

iOS application deployment requires understanding Apple's distribution ecosystem and following specific processes for code signing, app review, and release management. This template helps developers implement:
- Code signing with certificates and provisioning profiles
- App Store Connect configuration and metadata management
- TestFlight beta testing and external testing workflows
- App Store submission and review process navigation
- Continuous deployment with automated build and release pipelines
- Version management and release strategies
- Enterprise and ad-hoc distribution methods

Use this template when preparing iOS applications for production release, setting up beta testing programs, or implementing automated deployment pipelines.

## Examples

### Example 1: Code Signing and Provisioning
```bash
# Fastlane Matchfile for code signing
git_url("https://github.com/company/certificates")
storage_mode("git")
type("appstore") # appstore, adhoc, development, enterprise

app_identifier(["com.company.app", "com.company.app.widget"])
username("developer@company.com")
team_id("TEAM123456")

# Fastlane configuration
# fastlane/Fastfile
default_platform(:ios)

platform :ios do
  desc "Sync code signing"
  lane :sync_signing do
    match(
      type: "appstore",
      readonly: true,
      app_identifier: ["com.company.app"]
    )
  end
  
  desc "Create new certificates"
  lane :create_certificates do
    match(
      type: "appstore",
      force_for_new_devices: true
    )
  end
end
```

```swift
// Build Configuration in Xcode
// Project Settings > Build Settings

// Code Signing Identity
CODE_SIGN_IDENTITY = "Apple Distribution"
CODE_SIGN_STYLE = Manual
DEVELOPMENT_TEAM = TEAM123456

// Provisioning Profile
PROVISIONING_PROFILE_SPECIFIER = "match AppStore com.company.app"

// Build Settings for Release
SWIFT_OPTIMIZATION_LEVEL = "-O"
SWIFT_COMPILATION_MODE = wholemodule
ENABLE_BITCODE = NO
DEBUG_INFORMATION_FORMAT = "dwarf-with-dsym"
```

### Example 2: App Store Connect Configuration
```ruby
# fastlane/Fastfile
platform :ios do
  desc "Upload to App Store Connect"
  lane :upload_to_app_store do
    # Build the app
    build_app(
      scheme: "MyApp",
      export_method: "app-store",
      export_options: {
        provisioningProfiles: {
          "com.company.app" => "match AppStore com.company.app"
        }
      }
    )
    
    # Upload to App Store Connect
    upload_to_app_store(
      skip_metadata: false,
      skip_screenshots: false,
      submit_for_review: false,
      automatic_release: false,
      force: true,
      precheck_include_in_app_purchases: false
    )
  end
  
  desc "Update metadata"
  lane :update_metadata do
    deliver(
      skip_binary_upload: true,
      skip_screenshots: false,
      force: true
    )
  end
end
```


```yaml
# fastlane/metadata/en-US/description.txt
MyApp is the ultimate solution for managing your daily tasks and staying organized.

Features:
• Intuitive task management
• Cloud synchronization
• Collaboration tools
• Smart notifications
• Dark mode support

# fastlane/metadata/en-US/keywords.txt
productivity,tasks,todo,organizer,planner

# fastlane/metadata/en-US/marketing_url.txt
https://www.company.com/myapp

# fastlane/metadata/en-US/privacy_url.txt
https://www.company.com/privacy

# fastlane/metadata/en-US/support_url.txt
https://support.company.com
```

### Example 3: TestFlight Beta Distribution
```ruby
# fastlane/Fastfile
platform :ios do
  desc "Upload to TestFlight"
  lane :beta do
    # Increment build number
    increment_build_number(
      build_number: latest_testflight_build_number + 1
    )
    
    # Sync code signing
    match(type: "appstore", readonly: true)
    
    # Build the app
    build_app(
      scheme: "MyApp",
      export_method: "app-store"
    )
    
    # Upload to TestFlight
    upload_to_testflight(
      skip_waiting_for_build_processing: false,
      distribute_external: true,
      groups: ["Beta Testers", "Internal Team"],
      changelog: "Bug fixes and performance improvements",
      notify_external_testers: true
    )
    
    # Send notification
    slack(
      message: "New beta build uploaded to TestFlight!",
      channel: "#ios-releases",
      success: true
    )
  end
  
  desc "Add external testers"
  lane :add_testers do
    pilot(
      add_tester_to_group: "Beta Testers",
      email: "tester@example.com",
      first_name: "John",
      last_name: "Doe"
    )
  end
end
```

```swift
// Beta Testing Configuration
// Info.plist additions for beta builds

<key>CFBundleDisplayName</key>
<string>MyApp Beta</string>

<key>UIAppFonts</key>
<array>
    <string>Beta-Badge.ttf</string>
</array>

// AppDelegate.swift - Beta environment setup
#if DEBUG || BETA
import FLEX

class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        // Enable debug tools for beta
        setupBetaTools()
        
        // Configure analytics for beta
        Analytics.shared.configure(environment: .beta)
        
        return true
    }
    
    private func setupBetaTools() {
        // Add shake gesture for debug menu
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(showDebugMenu),
            name: UIDevice.deviceDidShakeNotification,
            object: nil
        )
    }
    
    @objc private func showDebugMenu() {
        FLEXManager.shared.showExplorer()
    }
}
#endif
```

### Example 4: Automated Build Pipeline
```yaml
# .github/workflows/ios-deploy.yml
name: iOS Deployment

on:
  push:
    branches: [ main ]
    tags: [ 'v*' ]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deployment environment'
        required: true
        type: choice
        options:
          - testflight
          - appstore

jobs:
  deploy:
    name: Build and Deploy
    runs-on: macos-13
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      with:
        fetch-depth: 0
    
    - name: Setup Ruby
      uses: ruby/setup-ruby@v1
      with:
        ruby-version: '3.2'
        bundler-cache: true
    
    - name: Install Fastlane
      run: |
        gem install fastlane
        bundle install
    
    - name: Setup Xcode
      run: sudo xcode-select -s /Applications/Xcode_15.0.app
    
    - name: Cache SPM
      uses: actions/cache@v3
      with:
        path: .build
        key: ${{ runner.os }}-spm-${{ hashFiles('**/Package.resolved') }}
    
    - name: Install Certificates
      env:
        MATCH_PASSWORD: ${{ secrets.MATCH_PASSWORD }}
        MATCH_GIT_BASIC_AUTHORIZATION: ${{ secrets.MATCH_GIT_TOKEN }}
      run: |
        fastlane match appstore --readonly
    
    - name: Build and Upload to TestFlight
      if: github.event.inputs.environment == 'testflight' || github.ref == 'refs/heads/main'
      env:
        APP_STORE_CONNECT_API_KEY_ID: ${{ secrets.ASC_KEY_ID }}
        APP_STORE_CONNECT_API_ISSUER_ID: ${{ secrets.ASC_ISSUER_ID }}
        APP_STORE_CONNECT_API_KEY: ${{ secrets.ASC_API_KEY }}
      run: |
        fastlane beta
    
    - name: Submit to App Store
      if: github.event.inputs.environment == 'appstore' || startsWith(github.ref, 'refs/tags/v')
      env:
        APP_STORE_CONNECT_API_KEY_ID: ${{ secrets.ASC_KEY_ID }}
        APP_STORE_CONNECT_API_ISSUER_ID: ${{ secrets.ASC_ISSUER_ID }}
        APP_STORE_CONNECT_API_KEY: ${{ secrets.ASC_API_KEY }}
      run: |
        fastlane release
    
    - name: Upload dSYMs to Crashlytics
      run: |
        fastlane upload_symbols
    
    - name: Create GitHub Release
      if: startsWith(github.ref, 'refs/tags/v')
      uses: actions/create-release@v1
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      with:
        tag_name: ${{ github.ref }}
        release_name: Release ${{ github.ref }}
        draft: false
        prerelease: false
```

### Example 5: Version Management
```ruby
# fastlane/Fastfile
platform :ios do
  desc "Bump version"
  lane :bump_version do |options|
    type = options[:type] || "patch" # major, minor, patch
    
    # Get current version
    current_version = get_version_number(
      xcodeproj: "MyApp.xcodeproj",
      target: "MyApp"
    )
    
    # Calculate new version
    version_array = current_version.split(".").map(&:to_i)
    case type
    when "major"
      version_array[0] += 1
      version_array[1] = 0
      version_array[2] = 0
    when "minor"
      version_array[1] += 1
      version_array[2] = 0
    when "patch"
      version_array[2] += 1
    end
    
    new_version = version_array.join(".")
    
    # Update version number
    increment_version_number(
      version_number: new_version,
      xcodeproj: "MyApp.xcodeproj"
    )
    
    # Reset build number
    increment_build_number(
      build_number: 1,
      xcodeproj: "MyApp.xcodeproj"
    )
    
    # Commit changes
    git_commit(
      path: ["MyApp.xcodeproj/project.pbxproj"],
      message: "Bump version to #{new_version}"
    )
    
    # Create tag
    add_git_tag(
      tag: "v#{new_version}",
      message: "Release version #{new_version}"
    )
    
    # Push changes
    push_to_git_remote(
      tags: true
    )
    
    UI.success("Version bumped to #{new_version}")
  end
  
  desc "Set build number from CI"
  lane :set_build_number_from_ci do
    build_number = ENV["GITHUB_RUN_NUMBER"] || ENV["CI_PIPELINE_IID"] || "1"
    
    increment_build_number(
      build_number: build_number,
      xcodeproj: "MyApp.xcodeproj"
    )
  end
end
```

```swift
// Version Display in App
struct AboutView: View {
    var body: some View {
        VStack(spacing: 16) {
            Text("MyApp")
                .font(.title)
            
            Text("Version \(appVersion)")
                .font(.subheadline)
                .foregroundStyle(.secondary)
            
            Text("Build \(buildNumber)")
                .font(.caption)
                .foregroundStyle(.secondary)
            
            #if DEBUG
            Text("DEBUG BUILD")
                .font(.caption)
                .foregroundStyle(.red)
            #elseif BETA
            Text("BETA BUILD")
                .font(.caption)
                .foregroundStyle(.orange)
            #endif
        }
    }
    
    private var appVersion: String {
        Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "Unknown"
    }
    
    private var buildNumber: String {
        Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "Unknown"
    }
}
```

### Example 6: App Store Review Preparation
```ruby
# fastlane/Fastfile
platform :ios do
  desc "Prepare for App Store submission"
  lane :prepare_submission do
    # Run all checks
    ensure_git_status_clean
    run_tests
    
    # Build for validation
    build_app(
      scheme: "MyApp",
      export_method: "app-store",
      skip_archive: false
    )
    
    # Validate build
    validate_app(
      skip_screenshots: true,
      skip_metadata: true
    )
    
    # Check for common issues
    precheck(
      include_in_app_purchases: true,
      negative_feedback: true,
      placeholder_text: true
    )
    
    UI.success("App is ready for submission!")
  end
  
  desc "Submit for review"
  lane :submit_for_review do
    upload_to_app_store(
      submit_for_review: true,
      automatic_release: false,
      submission_information: {
        add_id_info_uses_idfa: false,
        export_compliance_uses_encryption: false,
        export_compliance_is_exempt: true
      }
    )
    
    # Notify team
    slack(
      message: "App submitted for App Store review!",
      channel: "#ios-releases"
    )
  end
end
```

```json
// App Store Review Information
// fastlane/metadata/review_information/review_information.json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+1 555-123-4567",
  "email_address": "review@company.com",
  "demo_user": "demo@example.com",
  "demo_password": "DemoPassword123!",
  "notes": "Please use the demo account to test all features. The app requires location permissions for the map feature."
}
```

### Example 7: Enterprise Distribution
```ruby
# fastlane/Fastfile
platform :ios do
  desc "Build for enterprise distribution"
  lane :enterprise do
    # Sync enterprise certificate
    match(
      type: "enterprise",
      readonly: true
    )
    
    # Build with enterprise profile
    build_app(
      scheme: "MyApp",
      export_method: "enterprise",
      export_options: {
        provisioningProfiles: {
          "com.company.app" => "match Enterprise com.company.app"
        },
        manifest: {
          appURL: "https://distribution.company.com/MyApp.ipa",
          displayImageURL: "https://distribution.company.com/icon-57.png",
          fullSizeImageURL: "https://distribution.company.com/icon-512.png"
        }
      }
    )
    
    # Upload to distribution server
    upload_to_s3(
      bucket: "company-ios-distribution",
      path: "builds/#{get_version_number}/",
      files: ["MyApp.ipa", "manifest.plist"]
    )
    
    # Generate installation page
    generate_install_page
  end
  
  private_lane :generate_install_page do
    version = get_version_number
    build = get_build_number
    
    html = <<-HTML
    <!DOCTYPE html>
    <html>
    <head>
        <title>Install MyApp</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body>
        <h1>MyApp Enterprise</h1>
        <p>Version: #{version} (#{build})</p>
        <a href="itms-services://?action=download-manifest&url=https://distribution.company.com/manifest.plist">
            Install MyApp
        </a>
    </body>
    </html>
    HTML
    
    File.write("install.html", html)
  end
end
```

### Example 8: Continuous Deployment Strategy
```ruby
# fastlane/Fastfile
platform :ios do
  desc "Deploy based on branch"
  lane :deploy do
    branch = git_branch
    
    case branch
    when "develop"
      deploy_to_firebase
    when "staging"
      deploy_to_testflight_internal
    when "main"
      deploy_to_testflight_external
    when /^release\/.*/
      deploy_to_app_store
    else
      UI.user_error!("Unknown branch: #{branch}")
    end
  end
  
  private_lane :deploy_to_firebase do
    build_app(
      scheme: "MyApp-Dev",
      export_method: "ad-hoc"
    )
    
    firebase_app_distribution(
      app: ENV["FIREBASE_APP_ID"],
      groups: "developers",
      release_notes: last_git_commit[:message]
    )
  end
  
  private_lane :deploy_to_testflight_internal do
    build_app(
      scheme: "MyApp-Staging",
      export_method: "app-store"
    )
    
    upload_to_testflight(
      distribute_external: false,
      groups: ["Internal Team"]
    )
  end
  
  private_lane :deploy_to_testflight_external do
    build_app(
      scheme: "MyApp",
      export_method: "app-store"
    )
    
    upload_to_testflight(
      distribute_external: true,
      groups: ["Beta Testers"],
      notify_external_testers: true
    )
  end
  
  private_lane :deploy_to_app_store do
    build_app(
      scheme: "MyApp",
      export_method: "app-store"
    )
    
    upload_to_app_store(
      submit_for_review: true,
      automatic_release: true
    )
  end
end
```

## Instructions

### 1. Code Signing Setup
- Use Fastlane Match for certificate and profile management
- Store certificates in private Git repository
- Use automatic code signing for development
- Use manual code signing for distribution builds
- Rotate certificates before expiration
- Document team members with certificate access

### 2. App Store Connect Configuration
- Create app record in App Store Connect
- Configure app information and metadata
- Add app icons and screenshots for all device sizes
- Set up in-app purchases and subscriptions
- Configure App Store optimization (ASO) keywords
- Set up pricing and availability

### 3. TestFlight Beta Testing
- Set up internal testing group for team members
- Create external testing groups for beta testers
- Write clear release notes for each build
- Monitor crash reports and feedback
- Iterate based on beta tester feedback
- Gradually expand beta testing group

### 4. Build Automation
- Set up CI/CD pipeline for automated builds
- Configure build triggers (push, tag, manual)
- Implement version bumping automation
- Upload dSYMs to crash reporting services
- Generate and archive build artifacts
- Send notifications on build completion

### 5. Version Management
- Follow semantic versioning (major.minor.patch)
- Increment build number for each build
- Tag releases in version control
- Maintain changelog for each version
- Document breaking changes
- Plan release schedule

### 6. App Store Submission
- Run precheck to catch common issues
- Validate build before submission
- Provide demo account for review
- Write clear review notes
- Respond promptly to review feedback
- Monitor review status

### 7. Release Strategy
- Plan phased rollout for major releases
- Use staged rollout percentage
- Monitor crash rates and user feedback
- Prepare hotfix process for critical issues
- Communicate releases to users
- Track release metrics

### 8. Distribution Channels
- App Store for public distribution
- TestFlight for beta testing
- Enterprise distribution for internal apps
- Ad-hoc distribution for limited testing
- Development distribution for team testing

## Implementation Patterns

### Pattern 1: Multi-Environment Configuration
```ruby
# fastlane/Fastfile
platform :ios do
  desc "Build for environment"
  lane :build_for_env do |options|
    env = options[:env] || "production"
    
    scheme = case env
    when "development" then "MyApp-Dev"
    when "staging" then "MyApp-Staging"
    when "production" then "MyApp"
    end
    
    build_app(
      scheme: scheme,
      export_method: "app-store"
    )
  end
end
```

### Pattern 2: Automated Screenshot Generation
```ruby
# fastlane/Snapfile
devices([
  "iPhone 15 Pro Max",
  "iPhone 15 Pro",
  "iPhone SE (3rd generation)",
  "iPad Pro (12.9-inch) (6th generation)"
])

languages([
  "en-US",
  "es-ES",
  "fr-FR"
])

scheme("MyAppUITests")
output_directory("./fastlane/screenshots")
clear_previous_screenshots(true)
```

### Pattern 3: Release Notes Automation
```ruby
# fastlane/Fastfile
lane :generate_release_notes do
  changelog = changelog_from_git_commits(
    between: [last_git_tag, "HEAD"],
    pretty: "- %s",
    merge_commit_filtering: "exclude_merges"
  )
  
  File.write("fastlane/metadata/en-US/release_notes.txt", changelog)
end
```

## Expected Output

When implementing iOS deployment and distribution, the system should generate:

1. **Code Signing Configuration** with certificates and provisioning profiles
2. **Fastlane Setup** for automated build and deployment
3. **CI/CD Pipeline** configuration for GitHub Actions or similar
4. **App Store Metadata** including descriptions, screenshots, and keywords
5. **TestFlight Configuration** for beta testing workflows
6. **Version Management** scripts for semantic versioning
7. **Release Documentation** with deployment procedures
8. **Distribution Channels** setup for various deployment targets

## Integration Points

iOS deployment integrates with development workflow through comprehensive automation and tooling. Code signing management uses Fastlane Match to synchronize certificates and provisioning profiles across team members and CI/CD systems. Build automation connects with Xcode build system through xcodebuild and Fastlane for consistent builds. App Store Connect integration uses App Store Connect API for metadata management, build uploads, and submission automation. Version control integration tracks releases through Git tags and generates changelogs from commit history. Crash reporting services receive dSYM files automatically after each build for symbolication. Analytics platforms track release adoption and performance metrics across versions.

```ruby
# Integrated deployment workflow
lane :release_workflow do
  # 1. Ensure clean state
  ensure_git_status_clean
  
  # 2. Run tests
  run_tests
  
  # 3. Bump version
  bump_version(type: "minor")
  
  # 4. Build and sign
  match(type: "appstore")
  build_app(scheme: "MyApp")
  
  # 5. Upload to App Store
  upload_to_app_store(submit_for_review: true)
  
  # 6. Upload symbols
  upload_symbols_to_crashlytics
  
  # 7. Notify team
  slack(message: "New release submitted!")
end
```

## Security Considerations

iOS deployment security requires protecting sensitive credentials and ensuring secure distribution. API keys and certificates must be stored in secure secret management systems like GitHub Secrets or environment variables, never committed to version control. Code signing certificates use Fastlane Match with encrypted Git storage and strong passwords. App Store Connect API keys use role-based access control with minimal required permissions. Build artifacts are validated before distribution to prevent tampering. Enterprise distribution uses HTTPS for manifest and IPA hosting with proper SSL certificates.

```ruby
# Secure credential management
lane :secure_deploy do
  # Use environment variables for sensitive data
  api_key = app_store_connect_api_key(
    key_id: ENV["ASC_KEY_ID"],
    issuer_id: ENV["ASC_ISSUER_ID"],
    key_content: ENV["ASC_API_KEY"],
    is_key_content_base64: true
  )
  
  # Match with encrypted storage
  match(
    type: "appstore",
    git_url: ENV["MATCH_GIT_URL"],
    git_basic_authorization: ENV["MATCH_GIT_TOKEN"],
    storage_mode: "git"
  )
  
  # Build with secure settings
  build_app(
    scheme: "MyApp",
    export_method: "app-store",
    export_options: {
      signingStyle: "manual",
      stripSwiftSymbols: true
    }
  )
end
```

## Performance Features

iOS deployment performance optimization focuses on fast build times and efficient distribution. Build caching reuses unchanged modules and dependencies to reduce compilation time. Parallel builds utilize multiple CPU cores for faster compilation. Incremental builds only recompile changed files. Artifact caching stores built frameworks and libraries for reuse across builds. Distribution optimization uses CDN for fast IPA downloads and delta updates for smaller update sizes.

```ruby
# Performance-optimized build
lane :fast_build do
  # Enable build caching
  ENV["FASTLANE_SKIP_UPDATE_CHECK"] = "1"
  ENV["FASTLANE_HIDE_CHANGELOG"] = "1"
  
  # Use cached dependencies
  cocoapods(
    repo_update: false,
    use_bundle_exec: true
  )
  
  # Parallel build
  build_app(
    scheme: "MyApp",
    export_method: "app-store",
    xcargs: "-parallelizeTargets -jobs 8"
  )
end

# CI cache configuration
# .github/workflows/ios-deploy.yml
- name: Cache CocoaPods
  uses: actions/cache@v3
  with:
    path: Pods
    key: ${{ runner.os }}-pods-${{ hashFiles('**/Podfile.lock') }}

- name: Cache SPM
  uses: actions/cache@v3
  with:
    path: .build
    key: ${{ runner.os }}-spm-${{ hashFiles('**/Package.resolved') }}
```

### Example 9: Multi-Target Configuration
```ruby
# fastlane/Fastfile
platform :ios do
  desc "Build all app variants"
  lane :build_all_variants do
    # Production app
    build_variant(
      scheme: "MyApp",
      bundle_id: "com.company.app",
      display_name: "MyApp"
    )
    
    # Beta app
    build_variant(
      scheme: "MyApp-Beta",
      bundle_id: "com.company.app.beta",
      display_name: "MyApp Beta"
    )
    
    # Enterprise app
    build_variant(
      scheme: "MyApp-Enterprise",
      bundle_id: "com.company.app.enterprise",
      display_name: "MyApp Enterprise"
    )
  end
  
  private_lane :build_variant do |options|
    update_app_identifier(
      xcodeproj: "MyApp.xcodeproj",
      plist_path: "MyApp/Info.plist",
      app_identifier: options[:bundle_id]
    )
    
    update_info_plist(
      xcodeproj: "MyApp.xcodeproj",
      plist_path: "MyApp/Info.plist",
      display_name: options[:display_name]
    )
    
    build_app(
      scheme: options[:scheme],
      export_method: "app-store"
    )
  end
end
```

```swift
// Build Configuration Management
#if PRODUCTION
let apiBaseURL = "https://api.production.com"
let analyticsKey = "prod-key"
let environment = "production"
#elseif BETA
let apiBaseURL = "https://api.beta.com"
let analyticsKey = "beta-key"
let environment = "beta"
#elseif ENTERPRISE
let apiBaseURL = "https://api.enterprise.com"
let analyticsKey = "enterprise-key"
let environment = "enterprise"
#else
let apiBaseURL = "https://api.dev.com"
let analyticsKey = "dev-key"
let environment = "development"
#endif

struct BuildConfiguration {
    static let current = BuildConfiguration()
    
    let apiBaseURL: String
    let analyticsKey: String
    let environment: String
    let isProduction: Bool
    
    private init() {
        self.apiBaseURL = apiBaseURL
        self.analyticsKey = analyticsKey
        self.environment = environment
        self.isProduction = environment == "production"
    }
}
```

### Example 10: Release Automation with Webhooks
```ruby
# fastlane/Fastfile
platform :ios do
  desc "Automated release workflow"
  lane :automated_release do
    # 1. Validate prerequisites
    ensure_git_status_clean
    ensure_git_branch(branch: "main")
    
    # 2. Run quality checks
    run_tests
    run_linter
    
    # 3. Bump version
    version = bump_version(type: "minor")
    
    # 4. Build and sign
    match(type: "appstore")
    build_app(scheme: "MyApp")
    
    # 5. Upload to App Store
    upload_to_app_store(
      submit_for_review: true,
      automatic_release: true,
      phased_release: true
    )
    
    # 6. Create GitHub release
    github_release(
      repository_name: "company/myapp",
      api_token: ENV["GITHUB_TOKEN"],
      name: "v#{version}",
      tag_name: "v#{version}",
      description: changelog_from_git_commits
    )
    
    # 7. Notify stakeholders
    notify_release(version: version)
  end
  
  private_lane :notify_release do |options|
    # Slack notification
    slack(
      message: "🎉 MyApp v#{options[:version]} released!",
      channel: "#releases",
      success: true,
      payload: {
        "Version" => options[:version],
        "Build" => get_build_number,
        "Environment" => "Production"
      }
    )
    
    # Email notification
    mailgun(
      to: "team@company.com",
      subject: "MyApp v#{options[:version]} Released",
      text: "New version available on the App Store"
    )
    
    # Webhook notification
    webhook(
      url: ENV["RELEASE_WEBHOOK_URL"],
      payload: {
        version: options[:version],
        platform: "ios",
        timestamp: Time.now.iso8601
      }
    )
  end
end
```

```yaml
# .github/workflows/release-automation.yml
name: Automated Release

on:
  workflow_dispatch:
    inputs:
      version_type:
        description: 'Version bump type'
        required: true
        type: choice
        options:
          - major
          - minor
          - patch

jobs:
  release:
    runs-on: macos-13
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.2'
          bundler-cache: true
      
      - name: Configure Git
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
      
      - name: Run Automated Release
        env:
          MATCH_PASSWORD: ${{ secrets.MATCH_PASSWORD }}
          MATCH_GIT_BASIC_AUTHORIZATION: ${{ secrets.MATCH_GIT_TOKEN }}
          APP_STORE_CONNECT_API_KEY_ID: ${{ secrets.ASC_KEY_ID }}
          APP_STORE_CONNECT_API_ISSUER_ID: ${{ secrets.ASC_ISSUER_ID }}
          APP_STORE_CONNECT_API_KEY: ${{ secrets.ASC_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SLACK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
        run: |
          bundle exec fastlane automated_release
```

## Related Templates
- [Swift iOS Development](./swift-ios-development.md) - Core iOS development patterns
- [iOS Testing Comprehensive](./ios-testing-comprehensive.md) - Testing strategies
- [iOS UI/UX Patterns](./ios-ui-ux-patterns.md) - UI implementation
- [iOS Performance Optimization](./ios-performance-optimization.md) - Performance tuning
- [Deployment](../deployment/README.md) - Cross-platform deployment strategies
