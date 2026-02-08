# Swift iOS Development Template

## Purpose

This template provides comprehensive patterns for building modern iOS applications using Swift, including SwiftUI, UIKit integration, Combine framework, Core Data, networking, and iOS-specific features. It covers enterprise-scale iOS development with advanced architecture patterns, performance optimization, and platform-specific best practices.

## Context

Swift is Apple's modern programming language designed for iOS, macOS, watchOS, and tvOS development. This template addresses contemporary iOS development including SwiftUI declarative UI, Combine reactive programming, async/await concurrency, Core Data persistence, CloudKit integration, and iOS 16+ features with comprehensive testing and deployment strategies.

## Examples

### Example 1: SwiftUI App with MVVM Architecture
```swift
// ContentView.swift
import SwiftUI
import Combine

@main
struct MyApp: App {
    let persistenceController = PersistenceController.shared
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(\.managedObjectContext, persistenceController.container.viewContext)
        }
    }
}

// MARK: - Models
struct User: Codable, Identifiable {
    let id: UUID
    let name: String
    let email: String
    let avatarURL: URL?
    let createdAt: Date
    
    init(id: UUID = UUID(), name: String, email: String, avatarURL: URL? = nil) {
        self.id = id
        self.name = name
        self.email = email
        self.avatarURL = avatarURL
        self.createdAt = Date()
    }
}

struct APIResponse<T: Codable>: Codable {
    let data: T
    let message: String
    let success: Bool
}

// MARK: - Network Service
protocol NetworkServiceProtocol {
    func fetchUsers() async throws -> [User]
    func createUser(_ user: User) async throws -> User
    func updateUser(_ user: User) async throws -> User
    func deleteUser(id: UUID) async throws
}

class NetworkService: NetworkServiceProtocol, ObservableObject {
    private let baseURL = URL(string: "https://api.example.com/v1")!
    private let session = URLSession.shared
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder
    
    init() {
        decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        
        encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
    }
    
    func fetchUsers() async throws -> [User] {
        let url = baseURL.appendingPathComponent("users")
        let (data, response) = try await session.data(from: url)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw NetworkError.invalidResponse
        }
        
        let apiResponse = try decoder.decode(APIResponse<[User]>.self, from: data)
        return apiResponse.data
    }
    
    func createUser(_ user: User) async throws -> User {
        let url = baseURL.appendingPathComponent("users")
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try encoder.encode(user)
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 201 else {
            throw NetworkError.invalidResponse
        }
        
        let apiResponse = try decoder.decode(APIResponse<User>.self, from: data)
        return apiResponse.data
    }
    
    func updateUser(_ user: User) async throws -> User {
        let url = baseURL.appendingPathComponent("users/\(user.id)")
        var request = URLRequest(url: url)
        request.httpMethod = "PUT"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try encoder.encode(user)
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw NetworkError.invalidResponse
        }
        
        let apiResponse = try decoder.decode(APIResponse<User>.self, from: data)
        return apiResponse.data
    }
    
    func deleteUser(id: UUID) async throws {
        let url = baseURL.appendingPathComponent("users/\(id)")
        var request = URLRequest(url: url)
        request.httpMethod = "DELETE"
        
        let (_, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 204 else {
            throw NetworkError.invalidResponse
        }
    }
}

enum NetworkError: Error, LocalizedError {
    case invalidURL
    case invalidResponse
    case decodingError
    case networkUnavailable
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .invalidResponse:
            return "Invalid response from server"
        case .decodingError:
            return "Failed to decode response"
        case .networkUnavailable:
            return "Network unavailable"
        }
    }
}

// MARK: - View Model
@MainActor
class UserListViewModel: ObservableObject {
    @Published var users: [User] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var showingError = false
    
    private let networkService: NetworkServiceProtocol
    private var cancellables = Set<AnyCancellable>()
    
    init(networkService: NetworkServiceProtocol = NetworkService()) {
        self.networkService = networkService
    }
    
    func loadUsers() {
        Task {
            isLoading = true
            errorMessage = nil
            
            do {
                users = try await networkService.fetchUsers()
            } catch {
                errorMessage = error.localizedDescription
                showingError = true
            }
            
            isLoading = false
        }
    }
    
    func addUser(name: String, email: String) {
        let newUser = User(name: name, email: email)
        
        Task {
            do {
                let createdUser = try await networkService.createUser(newUser)
                users.append(createdUser)
            } catch {
                errorMessage = error.localizedDescription
                showingError = true
            }
        }
    }
    
    func deleteUser(_ user: User) {
        Task {
            do {
                try await networkService.deleteUser(id: user.id)
                users.removeAll { $0.id == user.id }
            } catch {
                errorMessage = error.localizedDescription
                showingError = true
            }
        }
    }
    
    func updateUser(_ user: User) {
        Task {
            do {
                let updatedUser = try await networkService.updateUser(user)
                if let index = users.firstIndex(where: { $0.id == user.id }) {
                    users[index] = updatedUser
                }
            } catch {
                errorMessage = error.localizedDescription
                showingError = true
            }
        }
    }
}

// MARK: - Views
struct ContentView: View {
    @StateObject private var viewModel = UserListViewModel()
    @State private var showingAddUser = false
    
    var body: some View {
        NavigationView {
            ZStack {
                if viewModel.isLoading {
                    ProgressView("Loading users...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    UserListView(users: viewModel.users) { user in
                        viewModel.deleteUser(user)
                    }
                }
            }
            .navigationTitle("Users")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Add User") {
                        showingAddUser = true
                    }
                }
            }
            .sheet(isPresented: $showingAddUser) {
                AddUserView { name, email in
                    viewModel.addUser(name: name, email: email)
                }
            }
            .alert("Error", isPresented: $viewModel.showingError) {
                Button("OK") { }
            } message: {
                Text(viewModel.errorMessage ?? "Unknown error occurred")
            }
            .onAppear {
                viewModel.loadUsers()
            }
        }
    }
}

struct UserListView: View {
    let users: [User]
    let onDelete: (User) -> Void
    
    var body: some View {
        List {
            ForEach(users) { user in
                UserRowView(user: user)
                    .swipeActions(edge: .trailing) {
                        Button("Delete", role: .destructive) {
                            onDelete(user)
                        }
                    }
            }
        }
        .listStyle(PlainListStyle())
    }
}

struct UserRowView: View {
    let user: User
    
    var body: some View {
        HStack {
            AsyncImage(url: user.avatarURL) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Circle()
                    .fill(Color.gray.opacity(0.3))
                    .overlay(
                        Image(systemName: "person.fill")
                            .foregroundColor(.gray)
                    )
            }
            .frame(width: 50, height: 50)
            .clipShape(Circle())
            
            VStack(alignment: .leading, spacing: 4) {
                Text(user.name)
                    .font(.headline)
                    .foregroundColor(.primary)
                
                Text(user.email)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                Text(user.createdAt, style: .date)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
        }
        .padding(.vertical, 4)
    }
}

struct AddUserView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var name = ""
    @State private var email = ""
    
    let onSave: (String, String) -> Void
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("User Information")) {
                    TextField("Name", text: $name)
                        .textContentType(.name)
                    
                    TextField("Email", text: $email)
                        .textContentType(.emailAddress)
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)
                }
            }
            .navigationTitle("Add User")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        onSave(name, email)
                        dismiss()
                    }
                    .disabled(name.isEmpty || email.isEmpty)
                }
            }
        }
    }
}
```

### Example 2: Core Data Integration with CloudKit
```swift
// PersistenceController.swift
import CoreData
import CloudKit

class PersistenceController {
    static let shared = PersistenceController()
    
    lazy var container: NSPersistentCloudKitContainer = {
        let container = NSPersistentCloudKitContainer(name: "DataModel")
        
        // Configure for CloudKit
        guard let description = container.persistentStoreDescriptions.first else {
            fatalError("Failed to retrieve a persistent store description.")
        }
        
        description.setOption(true as NSNumber, forKey: NSPersistentHistoryTrackingKey)
        description.setOption(true as NSNumber, forKey: NSPersistentStoreRemoteChangeNotificationPostOptionKey)
        description.setOption("iCloud.com.yourcompany.yourapp" as NSString, forKey: NSPersistentCloudKitContainerOptionsKey)
        
        container.loadPersistentStores { _, error in
            if let error = error as NSError? {
                fatalError("Unresolved error \(error), \(error.userInfo)")
            }
        }
        
        container.viewContext.automaticallyMergesChangesFromParent = true
        
        return container
    }()
    
    func save() {
        let context = container.viewContext
        
        if context.hasChanges {
            do {
                try context.save()
            } catch {
                let nsError = error as NSError
                fatalError("Unresolved error \(nsError), \(nsError.userInfo)")
            }
        }
    }
}

// UserEntity+CoreDataClass.swift
import Foundation
import CoreData
import CloudKit

@objc(UserEntity)
public class UserEntity: NSManagedObject {
    
}

extension UserEntity {
    @nonobjc public class func fetchRequest() -> NSFetchRequest<UserEntity> {
        return NSFetchRequest<UserEntity>(entityName: "UserEntity")
    }
    
    @NSManaged public var id: UUID
    @NSManaged public var name: String
    @NSManaged public var email: String
    @NSManaged public var createdAt: Date
    @NSManaged public var updatedAt: Date
}

extension UserEntity: Identifiable {
    
}

// Core Data Service
class CoreDataService: ObservableObject {
    private let persistenceController = PersistenceController.shared
    
    var context: NSManagedObjectContext {
        persistenceController.container.viewContext
    }
    
    func fetchUsers() -> [UserEntity] {
        let request: NSFetchRequest<UserEntity> = UserEntity.fetchRequest()
        request.sortDescriptors = [NSSortDescriptor(keyPath: \UserEntity.createdAt, ascending: false)]
        
        do {
            return try context.fetch(request)
        } catch {
            print("Error fetching users: \(error)")
            return []
        }
    }
    
    func createUser(name: String, email: String) -> UserEntity {
        let user = UserEntity(context: context)
        user.id = UUID()
        user.name = name
        user.email = email
        user.createdAt = Date()
        user.updatedAt = Date()
        
        save()
        return user
    }
    
    func updateUser(_ user: UserEntity, name: String, email: String) {
        user.name = name
        user.email = email
        user.updatedAt = Date()
        
        save()
    }
    
    func deleteUser(_ user: UserEntity) {
        context.delete(user)
        save()
    }
    
    private func save() {
        persistenceController.save()
    }
}
```

### Example 3: Combine Framework for Reactive Programming
```swift
// CombineNetworkService.swift
import Foundation
import Combine

class CombineNetworkService: ObservableObject {
    @Published var users: [User] = []
    @Published var isLoading = false
    @Published var error: NetworkError?
    
    private let baseURL = URL(string: "https://api.example.com/v1")!
    private let session = URLSession.shared
    private var cancellables = Set<AnyCancellable>()
    
    private let decoder: JSONDecoder = {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return decoder
    }()
    
    func fetchUsers() {
        isLoading = true
        error = nil
        
        let url = baseURL.appendingPathComponent("users")
        
        session.dataTaskPublisher(for: url)
            .map(\.data)
            .decode(type: APIResponse<[User]>.self, decoder: decoder)
            .map(\.data)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.error = NetworkError.decodingError
                    }
                },
                receiveValue: { [weak self] users in
                    self?.users = users
                }
            )
            .store(in: &cancellables)
    }
    
    func searchUsers(query: String) -> AnyPublisher<[User], Never> {
        Just(query)
            .debounce(for: .milliseconds(300), scheduler: RunLoop.main)
            .removeDuplicates()
            .map { query in
                self.users.filter { user in
                    query.isEmpty || 
                    user.name.localizedCaseInsensitiveContains(query) ||
                    user.email.localizedCaseInsensitiveContains(query)
                }
            }
            .eraseToAnyPublisher()
    }
    
    func createUser(_ user: User) -> AnyPublisher<User, NetworkError> {
        let url = baseURL.appendingPathComponent("users")
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        do {
            request.httpBody = try JSONEncoder().encode(user)
        } catch {
            return Fail(error: NetworkError.decodingError)
                .eraseToAnyPublisher()
        }
        
        return session.dataTaskPublisher(for: request)
            .map(\.data)
            .decode(type: APIResponse<User>.self, decoder: decoder)
            .map(\.data)
            .mapError { _ in NetworkError.invalidResponse }
            .eraseToAnyPublisher()
    }
}

// SearchableUserListView.swift
struct SearchableUserListView: View {
    @StateObject private var networkService = CombineNetworkService()
    @State private var searchText = ""
    @State private var filteredUsers: [User] = []
    
    var body: some View {
        NavigationView {
            List(filteredUsers) { user in
                UserRowView(user: user)
            }
            .searchable(text: $searchText, prompt: "Search users")
            .onReceive(networkService.searchUsers(query: searchText)) { users in
                filteredUsers = users
            }
            .navigationTitle("Users")
            .onAppear {
                networkService.fetchUsers()
            }
        }
    }
}
```

## Instructions

### 1. Set Up iOS Development Environment

```bash
# Install Xcode from Mac App Store
# Install Xcode Command Line Tools
xcode-select --install

# Install CocoaPods (if using)
sudo gem install cocoapods

# Install Swift Package Manager dependencies are handled by Xcode

# Set up iOS Simulator
# Open Xcode -> Window -> Devices and Simulators
```

### 2. Create New iOS Project

```swift
// Create new project in Xcode
// File -> New -> Project -> iOS -> App
// Choose SwiftUI interface and Swift language

// Package.swift (for Swift Package Manager dependencies)
// swift-tools-version: 5.7
import PackageDescription

let package = Package(
    name: "MyiOSApp",
    platforms: [
        .iOS(.v15)
    ],
    products: [
        .library(name: "MyiOSApp", targets: ["MyiOSApp"]),
    ],
    dependencies: [
        .package(url: "https://github.com/Alamofire/Alamofire.git", from: "5.6.0"),
        .package(url: "https://github.com/onevcat/Kingfisher.git", from: "7.0.0"),
        .package(url: "https://github.com/realm/realm-swift.git", from: "10.0.0")
    ],
    targets: [
        .target(
            name: "MyiOSApp",
            dependencies: [
                "Alamofire",
                "Kingfisher",
                .product(name: "RealmSwift", package: "realm-swift")
            ]
        ),
        .testTarget(
            name: "MyiOSAppTests",
            dependencies: ["MyiOSApp"]
        ),
    ]
)
```

### 3. Implement SwiftUI Best Practices

```swift
// ViewModifiers for reusable styling
struct CardStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(12)
            .shadow(color: .black.opacity(0.1), radius: 5, x: 0, y: 2)
    }
}

extension View {
    func cardStyle() -> some View {
        modifier(CardStyle())
    }
}

// Custom Views with @ViewBuilder
struct ConditionalView<Content: View>: View {
    let condition: Bool
    @ViewBuilder let content: () -> Content
    
    var body: some View {
        if condition {
            content()
        }
    }
}

// Environment Values
private struct UserPreferencesKey: EnvironmentKey {
    static let defaultValue = UserPreferences()
}

extension EnvironmentValues {
    var userPreferences: UserPreferences {
        get { self[UserPreferencesKey.self] }
        set { self[UserPreferencesKey.self] = newValue }
    }
}
```

### 4. Implement Networking with URLSession

```swift
// NetworkManager.swift
import Foundation
import Network

class NetworkManager: ObservableObject {
    @Published var isConnected = true
    private let monitor = NWPathMonitor()
    private let queue = DispatchQueue(label: "NetworkMonitor")
    
    init() {
        startMonitoring()
    }
    
    private func startMonitoring() {
        monitor.pathUpdateHandler = { [weak self] path in
            DispatchQueue.main.async {
                self?.isConnected = path.status == .satisfied
            }
        }
        monitor.start(queue: queue)
    }
    
    deinit {
        monitor.cancel()
    }
}

// API Client with async/await
actor APIClient {
    private let session = URLSession.shared
    private let baseURL = URL(string: "https://api.example.com/v1")!
    
    func request<T: Codable>(_ endpoint: String, method: HTTPMethod = .GET, body: Data? = nil) async throws -> T {
        let url = baseURL.appendingPathComponent(endpoint)
        var request = URLRequest(url: url)
        request.httpMethod = method.rawValue
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = body
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              200...299 ~= httpResponse.statusCode else {
            throw APIError.invalidResponse
        }
        
        return try JSONDecoder().decode(T.self, from: data)
    }
}

enum HTTPMethod: String {
    case GET, POST, PUT, DELETE, PATCH
}

enum APIError: Error {
    case invalidURL
    case invalidResponse
    case decodingError
}
```

## Implementation Patterns

### MVVM Architecture Pattern

```swift
// Model
struct Product: Codable, Identifiable {
    let id: UUID
    let name: String
    let price: Double
    let description: String
    let imageURL: URL?
}

// ViewModel
@MainActor
class ProductListViewModel: ObservableObject {
    @Published var products: [Product] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let apiClient = APIClient()
    
    func loadProducts() async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            products = try await apiClient.request("products")
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

// View
struct ProductListView: View {
    @StateObject private var viewModel = ProductListViewModel()
    
    var body: some View {
        NavigationView {
            List(viewModel.products) { product in
                ProductRowView(product: product)
            }
            .navigationTitle("Products")
            .task {
                await viewModel.loadProducts()
            }
        }
    }
}
```

### Dependency Injection

```swift
// Protocol
protocol UserServiceProtocol {
    func fetchUsers() async throws -> [User]
    func createUser(_ user: User) async throws -> User
}

// Implementation
class UserService: UserServiceProtocol {
    private let apiClient: APIClient
    
    init(apiClient: APIClient = APIClient()) {
        self.apiClient = apiClient
    }
    
    func fetchUsers() async throws -> [User] {
        return try await apiClient.request("users")
    }
    
    func createUser(_ user: User) async throws -> User {
        let data = try JSONEncoder().encode(user)
        return try await apiClient.request("users", method: .POST, body: data)
    }
}

// Dependency Container
class DependencyContainer: ObservableObject {
    lazy var userService: UserServiceProtocol = UserService()
    lazy var networkManager = NetworkManager()
}

// Usage in App
@main
struct MyApp: App {
    @StateObject private var dependencies = DependencyContainer()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(dependencies)
        }
    }
}
```

## Expected Output

### iOS App Features
- Native iOS user interface with SwiftUI
- Smooth animations and transitions
- Responsive design for different screen sizes
- Integration with iOS system features (notifications, camera, etc.)
- Offline capability with Core Data
- CloudKit synchronization across devices

### Performance Characteristics
- 60 FPS smooth scrolling and animations
- Efficient memory usage with ARC
- Background processing with async/await
- Optimized image loading and caching
- Battery-efficient networking

### User Experience
- Native iOS design patterns and conventions
- Accessibility support with VoiceOver
- Dark mode and light mode support
- Haptic feedback integration
- Seamless navigation patterns

## Integration Points

Swift integrates seamlessly with Apple's ecosystem, including Core Data for persistence, CloudKit for cloud synchronization, and various system frameworks for accessing device capabilities. The language's interoperability with Objective-C enables integration with legacy code and third-party libraries. Swift Package Manager simplifies dependency management, while URLSession and Combine provide robust networking capabilities. Integration with push notifications, location services, biometric authentication, and other iOS features is straightforward through native APIs.

```swift
// Example integration patterns
import Foundation
import CoreData
import Combine

// URLSession networking
let url = URL(string: "https://api.example.com/data")!
let task = URLSession.shared.dataTask(with: url) { data, response, error in
    // Handle response
}

// Core Data integration
let context = persistentContainer.viewContext
let fetchRequest: NSFetchRequest<User> = User.fetchRequest()
```

### Core iOS Frameworks
```swift
// Core Location
import CoreLocation

class LocationManager: NSObject, ObservableObject, CLLocationManagerDelegate {
    @Published var location: CLLocation?
    @Published var authorizationStatus: CLAuthorizationStatus = .notDetermined
    
    private let manager = CLLocationManager()
    
    override init() {
        super.init()
        manager.delegate = self
    }
    
    func requestLocation() {
        manager.requestWhenInUseAuthorization()
        manager.requestLocation()
    }
}

// Push Notifications
import UserNotifications

class NotificationManager: ObservableObject {
    func requestPermission() async {
        do {
            try await UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound])
        } catch {
            print("Failed to request notification permission: \(error)")
        }
    }
    
    func scheduleNotification(title: String, body: String, date: Date) {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default
        
        let trigger = UNCalendarNotificationTrigger(dateMatching: Calendar.current.dateComponents([.year, .month, .day, .hour, .minute], from: date), repeats: false)
        
        let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: trigger)
        
        UNUserNotificationCenter.current().add(request)
    }
}
```

### Third-Party Integration
```swift
// Kingfisher for image loading
import Kingfisher

struct CachedAsyncImage: View {
    let url: URL?
    
    var body: some View {
        KFImage(url)
            .placeholder {
                ProgressView()
            }
            .resizable()
            .aspectRatio(contentMode: .fit)
    }
}
```

## Security Considerations

iOS provides robust security features including Keychain for secure credential storage, biometric authentication with Face ID and Touch ID, and App Transport Security for encrypted network communications. Swift's strong type system and optional handling help prevent common security vulnerabilities. Best practices include proper data encryption, secure coding to prevent injection attacks, certificate pinning for network security, and following Apple's security guidelines for app development and distribution.

### Data Protection
```swift
// Keychain Services
import Security

class KeychainService {
    static func save(key: String, data: Data) -> OSStatus {
        let query = [
            kSecClass as String: kSecClassGenericPassword as String,
            kSecAttrAccount as String: key,
            kSecValueData as String: data
        ] as [String: Any]
        
        SecItemDelete(query as CFDictionary)
        return SecItemAdd(query as CFDictionary, nil)
    }
    
    static func load(key: String) -> Data? {
        let query = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: kCFBooleanTrue!,
            kSecMatchLimit as String: kSecMatchLimitOne
        ] as [String: Any]
        
        var dataTypeRef: AnyObject?
        let status: OSStatus = SecItemCopyMatching(query as CFDictionary, &dataTypeRef)
        
        if status == noErr {
            return dataTypeRef as! Data?
        } else {
            return nil
        }
    }
}

// Biometric Authentication
import LocalAuthentication

class BiometricAuthManager: ObservableObject {
    @Published var isAuthenticated = false
    
    func authenticate() async {
        let context = LAContext()
        var error: NSError?
        
        if context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) {
            do {
                let result = try await context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: "Authenticate to access your data")
                await MainActor.run {
                    isAuthenticated = result
                }
            } catch {
                print("Authentication failed: \(error)")
            }
        }
    }
}
```

## Performance Features

Swift delivers excellent performance through compile-time optimizations, automatic reference counting for efficient memory management, and value types that minimize heap allocations. The language supports concurrent programming with async/await and actors, enabling responsive user interfaces and efficient background processing. Performance optimization techniques include lazy loading, image caching, efficient collection operations, and leveraging SwiftUI's declarative rendering for smooth 60 FPS animations.

### Memory Management
```swift
// Weak references to avoid retain cycles
class ImageCache {
    private var cache = NSCache<NSString, UIImage>()
    
    func setImage(_ image: UIImage, forKey key: String) {
        cache.setObject(image, forKey: key as NSString)
    }
    
    func image(forKey key: String) -> UIImage? {
        return cache.object(forKey: key as NSString)
    }
}

// Lazy loading
struct LazyView<Content: View>: View {
    let build: () -> Content
    
    init(_ build: @autoclosure @escaping () -> Content) {
        self.build = build
    }
    
    var body: Content {
        build()
    }
}
```

### Background Processing
```swift
// Background tasks
import BackgroundTasks

class BackgroundTaskManager {
    func scheduleBackgroundRefresh() {
        let request = BGAppRefreshTaskRequest(identifier: "com.yourapp.refresh")
        request.earliestBeginDate = Date(timeIntervalSinceNow: 15 * 60) // 15 minutes
        
        try? BGTaskScheduler.shared.submit(request)
    }
    
    func handleBackgroundRefresh(task: BGAppRefreshTask) {
        task.expirationHandler = {
            task.setTaskCompleted(success: false)
        }
        
        // Perform background work
        Task {
            // Do background processing
            task.setTaskCompleted(success: true)
        }
    }
}
```