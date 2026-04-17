# iOS Performance Optimization Template

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

Provide comprehensive strategies for optimizing iOS application performance including memory management, CPU usage, battery efficiency, network optimization, and rendering performance. This template covers profiling with Instruments, identifying bottlenecks, implementing performance best practices, and ensuring smooth 60 FPS user experiences.

## Context

iOS applications must deliver exceptional performance to meet user expectations and App Store quality standards. This template helps developers implement:
- Memory optimization and leak detection using Instruments
- CPU profiling and optimization for responsive UI
- Battery efficiency and power consumption reduction
- Network performance and data transfer optimization
- Rendering optimization for smooth 60 FPS animations
- Launch time optimization for instant app startup
- Storage optimization and efficient data persistence
- Background task optimization and resource management

Use this template when building high-performance iOS applications, diagnosing performance issues, or optimizing existing apps for better user experience and App Store ratings.

## Examples

### Example 1: Memory Management and Leak Detection
```swift
import UIKit

// MARK: - Proper Memory Management
class ProductViewController: UIViewController {
    private var viewModel: ProductViewModel?
    private var imageCache: NSCache<NSString, UIImage>?
    private var observations: [NSKeyValueObservation] = []
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupViewModel()
        setupImageCache()
    }
    
    private func setupViewModel() {
        viewModel = ProductViewModel()
        
        // Use weak self to avoid retain cycles
        viewModel?.onProductsUpdated = { [weak self] products in
            self?.updateUI(with: products)
        }
    }
    
    private func setupImageCache() {
        imageCache = NSCache<NSString, UIImage>()
        imageCache?.countLimit = 100
        imageCache?.totalCostLimit = 50 * 1024 * 1024 // 50 MB
    }
    
    deinit {
        // Clean up observations
        observations.forEach { $0.invalidate() }
        observations.removeAll()
        
        // Clear cache
        imageCache?.removeAllObjects()
        
        print("ProductViewController deallocated")
    }
}

// MARK: - Avoiding Retain Cycles in Closures
class DataManager {
    var onDataLoaded: ((Data) -> Void)?
    
    func loadData() {
        URLSession.shared.dataTask(with: URL(string: "https://api.example.com")!) { [weak self] data, response, error in
            guard let self = self, let data = data else { return }
            
            // Process data
            DispatchQueue.main.async { [weak self] in
                self?.onDataLoaded?(data)
            }
        }.resume()
    }
}

// MARK: - Memory-Efficient Image Loading
class ImageLoader {
    static let shared = ImageLoader()
    private let cache = NSCache<NSString, UIImage>()
    private let imageQueue = DispatchQueue(label: "com.app.imageQueue", qos: .userInitiated)
    
    func loadImage(from url: URL, completion: @escaping (UIImage?) -> Void) {
        let cacheKey = url.absoluteString as NSString
        
        // Check cache first
        if let cachedImage = cache.object(forKey: cacheKey) {
            completion(cachedImage)
            return
        }
        
        // Load and downsample image
        imageQueue.async { [weak self] in
            guard let data = try? Data(contentsOf: url),
                  let image = self?.downsample(imageData: data, to: CGSize(width: 300, height: 300)) else {
                DispatchQueue.main.async { completion(nil) }
                return
            }
            
            self?.cache.setObject(image, forKey: cacheKey)
            DispatchQueue.main.async { completion(image) }
        }
    }
    
    private func downsample(imageData: Data, to size: CGSize) -> UIImage? {
        let imageSourceOptions = [kCGImageSourceShouldCache: false] as CFDictionary
        guard let imageSource = CGImageSourceCreateWithData(imageData as CFData, imageSourceOptions) else {
            return nil
        }
        
        let maxDimensionInPixels = max(size.width, size.height) * UIScreen.main.scale
        let downsampleOptions = [
            kCGImageSourceCreateThumbnailFromImageAlways: true,
            kCGImageSourceShouldCacheImmediately: true,
            kCGImageSourceCreateThumbnailWithTransform: true,
            kCGImageSourceThumbnailMaxPixelSize: maxDimensionInPixels
        ] as CFDictionary
        
        guard let downsampledImage = CGImageSourceCreateThumbnailAtIndex(imageSource, 0, downsampleOptions) else {
            return nil
        }
        
        return UIImage(cgImage: downsampledImage)
    }
}
```

### Example 2: CPU Optimization and Main Thread Performance
```swift
import SwiftUI

// MARK: - Background Processing
class DataProcessor {
    private let processingQueue = DispatchQueue(label: "com.app.processing", qos: .userInitiated)
    
    func processLargeDataset(_ data: [Item], completion: @escaping ([ProcessedItem]) -> Void) {
        processingQueue.async {
            let processed = data.map { item in
                // Heavy processing off main thread
                self.processItem(item)
            }
            
            DispatchQueue.main.async {
                completion(processed)
            }
        }
    }
    
    private func processItem(_ item: Item) -> ProcessedItem {
        // Expensive computation
        return ProcessedItem(from: item)
    }
}

// MARK: - Efficient List Rendering
struct OptimizedListView: View {
    let items: [Item]
    
    var body: some View {
        // Use LazyVStack for efficient rendering
        ScrollView {
            LazyVStack(spacing: 12, pinnedViews: [.sectionHeaders]) {
                ForEach(items) { item in
                    ItemRow(item: item)
                        .id(item.id)
                }
            }
        }
        .scrollIndicators(.hidden)
    }
}

struct ItemRow: View {
    let item: Item
    
    var body: some View {
        HStack {
            // Lazy image loading
            AsyncImage(url: item.imageURL) { phase in
                switch phase {
                case .empty:
                    Color.gray.opacity(0.2)
                        .frame(width: 60, height: 60)
                case .success(let image):
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: 60, height: 60)
                        .clipped()
                case .failure:
                    Image(systemName: "photo")
                        .frame(width: 60, height: 60)
                @unknown default:
                    EmptyView()
                }
            }
            
            VStack(alignment: .leading) {
                Text(item.title)
                    .font(.headline)
                Text(item.subtitle)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
        }
        .padding()
    }
}

// MARK: - Debouncing for Search
class SearchViewModel: ObservableObject {
    @Published var searchText = ""
    @Published var results: [SearchResult] = []
    
    private var searchTask: Task<Void, Never>?
    
    init() {
        // Debounce search with 300ms delay
        $searchText
            .debounce(for: .milliseconds(300), scheduler: DispatchQueue.main)
            .sink { [weak self] query in
                self?.performSearch(query: query)
            }
            .store(in: &cancellables)
    }
    
    private func performSearch(query: String) {
        searchTask?.cancel()
        
        searchTask = Task {
            do {
                let results = try await searchAPI(query: query)
                if !Task.isCancelled {
                    await MainActor.run {
                        self.results = results
                    }
                }
            } catch {
                print("Search failed: \(error)")
            }
        }
    }
    
    private func searchAPI(query: String) async throws -> [SearchResult] {
        // API call
        return []
    }
    
    private var cancellables = Set<AnyCancellable>()
}
```


### Example 3: Battery Optimization
```swift
import UIKit
import CoreLocation

// MARK: - Location Services Optimization
class LocationManager: NSObject, CLLocationManagerDelegate {
    private let locationManager = CLLocationManager()
    private var isTracking = false
    
    override init() {
        super.init()
        setupLocationManager()
    }
    
    private func setupLocationManager() {
        locationManager.delegate = self
        
        // Use appropriate accuracy for use case
        locationManager.desiredAccuracy = kCLLocationAccuracyHundredMeters
        
        // Pause updates when possible
        locationManager.pausesLocationUpdatesAutomatically = true
        
        // Use significant location changes for background
        locationManager.allowsBackgroundLocationUpdates = false
    }
    
    func startTracking() {
        guard !isTracking else { return }
        
        // Use deferred updates to batch location updates
        locationManager.startUpdatingLocation()
        locationManager.allowDeferredLocationUpdates(
            untilTraveled: 500, // meters
            timeout: 300 // seconds
        )
        
        isTracking = true
    }
    
    func stopTracking() {
        locationManager.stopUpdatingLocation()
        isTracking = false
    }
    
    // Use significant location changes for background tracking
    func startSignificantLocationChanges() {
        locationManager.startMonitoringSignificantLocationChanges()
    }
}

// MARK: - Network Request Batching
class NetworkBatchManager {
    static let shared = NetworkBatchManager()
    
    private var pendingRequests: [NetworkRequest] = []
    private var batchTimer: Timer?
    private let batchInterval: TimeInterval = 5.0 // Batch every 5 seconds
    
    func addRequest(_ request: NetworkRequest) {
        pendingRequests.append(request)
        
        if batchTimer == nil {
            batchTimer = Timer.scheduledTimer(withTimeInterval: batchInterval, repeats: false) { [weak self] _ in
                self?.executeBatch()
            }
        }
    }
    
    private func executeBatch() {
        guard !pendingRequests.isEmpty else { return }
        
        // Execute all requests in single network call
        let batch = pendingRequests
        pendingRequests.removeAll()
        batchTimer = nil
        
        Task {
            await executeBatchRequest(batch)
        }
    }
    
    private func executeBatchRequest(_ requests: [NetworkRequest]) async {
        // Single network call for multiple requests
    }
}

// MARK: - Background Task Optimization
class BackgroundTaskManager {
    func performBackgroundSync() {
        let taskID = UIApplication.shared.beginBackgroundTask { [weak self] in
            self?.cleanupBackgroundTask()
        }
        
        Task {
            defer {
                UIApplication.shared.endBackgroundTask(taskID)
            }
            
            // Perform essential sync only
            await syncCriticalData()
        }
    }
    
    private func syncCriticalData() async {
        // Sync only essential data to minimize battery usage
    }
    
    private func cleanupBackgroundTask() {
        // Clean up if task expires
    }
}

// MARK: - Display Refresh Rate Optimization
class AnimationController {
    private var displayLink: CADisplayLink?
    
    func startAnimation() {
        displayLink = CADisplayLink(target: self, selector: #selector(update))
        
        // Use preferred frame rate for battery efficiency
        if #available(iOS 15.0, *) {
            displayLink?.preferredFrameRateRange = CAFrameRateRange(
                minimum: 30,
                maximum: 60,
                preferred: 60
            )
        }
        
        displayLink?.add(to: .main, forMode: .common)
    }
    
    func stopAnimation() {
        displayLink?.invalidate()
        displayLink = nil
    }
    
    @objc private func update() {
        // Animation logic
    }
}
```

### Example 4: Network Performance Optimization
```swift
import Foundation

// MARK: - Request Caching
class NetworkManager {
    private let session: URLSession
    
    init() {
        let configuration = URLSessionConfiguration.default
        
        // Configure cache
        let cache = URLCache(
            memoryCapacity: 50 * 1024 * 1024, // 50 MB
            diskCapacity: 100 * 1024 * 1024,  // 100 MB
            diskPath: "network_cache"
        )
        configuration.urlCache = cache
        configuration.requestCachePolicy = .returnCacheDataElseLoad
        
        // Configure timeouts
        configuration.timeoutIntervalForRequest = 30
        configuration.timeoutIntervalForResource = 300
        
        // Enable HTTP/2
        configuration.httpShouldUsePipelining = true
        configuration.httpMaximumConnectionsPerHost = 6
        
        session = URLSession(configuration: configuration)
    }
    
    func fetchData(from url: URL) async throws -> Data {
        var request = URLRequest(url: url)
        
        // Add cache control headers
        request.cachePolicy = .returnCacheDataElseLoad
        request.setValue("max-age=3600", forHTTPHeaderField: "Cache-Control")
        
        // Enable compression
        request.setValue("gzip, deflate", forHTTPHeaderField: "Accept-Encoding")
        
        let (data, response) = try await session.data(for: request)
        
        // Validate response
        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw NetworkError.invalidResponse
        }
        
        return data
    }
}

// MARK: - Image Prefetching
class ImagePrefetcher {
    private let imageLoader: ImageLoader
    private var prefetchTasks: [URL: Task<Void, Never>] = [:]
    
    init(imageLoader: ImageLoader) {
        self.imageLoader = imageLoader
    }
    
    func prefetchImages(urls: [URL]) {
        for url in urls {
            guard prefetchTasks[url] == nil else { continue }
            
            let task = Task {
                await imageLoader.loadImage(from: url)
            }
            
            prefetchTasks[url] = task
        }
    }
    
    func cancelPrefetching(for urls: [URL]) {
        for url in urls {
            prefetchTasks[url]?.cancel()
            prefetchTasks.removeValue(forKey: url)
        }
    }
}

// MARK: - Request Prioritization
class PrioritizedNetworkManager {
    private let highPriorityQueue = OperationQueue()
    private let lowPriorityQueue = OperationQueue()
    
    init() {
        highPriorityQueue.maxConcurrentOperationCount = 4
        highPriorityQueue.qualityOfService = .userInitiated
        
        lowPriorityQueue.maxConcurrentOperationCount = 2
        lowPriorityQueue.qualityOfService = .utility
    }
    
    func fetchHighPriority(url: URL) async throws -> Data {
        try await withCheckedThrowingContinuation { continuation in
            let operation = NetworkOperation(url: url) { result in
                continuation.resume(with: result)
            }
            highPriorityQueue.addOperation(operation)
        }
    }
    
    func fetchLowPriority(url: URL) async throws -> Data {
        try await withCheckedThrowingContinuation { continuation in
            let operation = NetworkOperation(url: url) { result in
                continuation.resume(with: result)
            }
            lowPriorityQueue.addOperation(operation)
        }
    }
}

class NetworkOperation: Operation {
    let url: URL
    let completion: (Result<Data, Error>) -> Void
    
    init(url: URL, completion: @escaping (Result<Data, Error>) -> Void) {
        self.url = url
        self.completion = completion
    }
    
    override func main() {
        guard !isCancelled else { return }
        
        // Perform network request
        let semaphore = DispatchSemaphore(value: 0)
        
        URLSession.shared.dataTask(with: url) { data, response, error in
            if let error = error {
                self.completion(.failure(error))
            } else if let data = data {
                self.completion(.success(data))
            }
            semaphore.signal()
        }.resume()
        
        semaphore.wait()
    }
}
```

### Example 5: Launch Time Optimization
```swift
import UIKit

// MARK: - Optimized App Delegate
@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        // Defer non-critical initialization
        DispatchQueue.main.async {
            self.setupNonCriticalServices()
        }
        
        // Setup only critical services
        setupCriticalServices()
        
        return true
    }
    
    private func setupCriticalServices() {
        // Only essential services needed for first screen
        configureAppearance()
        setupRootViewController()
    }
    
    private func setupNonCriticalServices() {
        // Defer analytics, crash reporting, etc.
        setupAnalytics()
        setupCrashReporting()
        setupPushNotifications()
        preloadCriticalData()
    }
    
    private func configureAppearance() {
        // Minimal appearance configuration
        UINavigationBar.appearance().tintColor = .systemBlue
    }
    
    private func setupRootViewController() {
        window = UIWindow(frame: UIScreen.main.bounds)
        window?.rootViewController = MainTabBarController()
        window?.makeKeyAndVisible()
    }
    
    private func setupAnalytics() {
        // Initialize analytics SDK
    }
    
    private func setupCrashReporting() {
        // Initialize crash reporting
    }
    
    private func setupPushNotifications() {
        // Register for push notifications
    }
    
    private func preloadCriticalData() {
        Task {
            await DataManager.shared.preloadCache()
        }
    }
}

// MARK: - Lazy Initialization
class ServiceContainer {
    static let shared = ServiceContainer()
    
    // Lazy initialization of services
    lazy var networkManager: NetworkManager = {
        NetworkManager()
    }()
    
    lazy var databaseManager: DatabaseManager = {
        DatabaseManager()
    }()
    
    lazy var imageCache: ImageCache = {
        ImageCache()
    }()
    
    private init() {}
}

// MARK: - Preloading Critical Data
class DataManager {
    static let shared = DataManager()
    
    func preloadCache() async {
        async let userProfile = loadUserProfile()
        async let recentItems = loadRecentItems()
        async let settings = loadSettings()
        
        // Load in parallel
        _ = await (userProfile, recentItems, settings)
    }
    
    private func loadUserProfile() async -> UserProfile? {
        // Load user profile
        return nil
    }
    
    private func loadRecentItems() async -> [Item] {
        // Load recent items
        return []
    }
    
    private func loadSettings() async -> Settings {
        // Load settings
        return Settings()
    }
}
```

### Example 6: Rendering Performance
```swift
import SwiftUI

// MARK: - View Optimization
struct OptimizedProductCard: View {
    let product: Product
    
    var body: some View {
        HStack(spacing: 12) {
            // Use equatable to prevent unnecessary redraws
            ProductImage(url: product.imageURL)
                .equatable()
            
            VStack(alignment: .leading, spacing: 4) {
                Text(product.name)
                    .font(.headline)
                    .lineLimit(2)
                
                Text(product.price, format: .currency(code: "USD"))
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

struct ProductImage: View, Equatable {
    let url: URL
    
    var body: some View {
        AsyncImage(url: url) { image in
            image
                .resizable()
                .aspectRatio(contentMode: .fill)
        } placeholder: {
            Color.gray.opacity(0.2)
        }
        .frame(width: 80, height: 80)
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }
    
    static func == (lhs: ProductImage, rhs: ProductImage) -> Bool {
        lhs.url == rhs.url
    }
}

// MARK: - Drawing Performance
class CustomGraphView: UIView {
    var dataPoints: [CGFloat] = []
    
    override func draw(_ rect: CGRect) {
        guard let context = UIGraphicsGetCurrentContext() else { return }
        
        // Use Core Graphics for efficient drawing
        context.setStrokeColor(UIColor.systemBlue.cgColor)
        context.setLineWidth(2.0)
        
        let path = createPath(in: rect)
        context.addPath(path)
        context.strokePath()
    }
    
    private func createPath(in rect: CGRect) -> CGPath {
        let path = CGMutablePath()
        
        guard !dataPoints.isEmpty else { return path }
        
        let xStep = rect.width / CGFloat(dataPoints.count - 1)
        let yScale = rect.height / (dataPoints.max() ?? 1)
        
        path.move(to: CGPoint(x: 0, y: rect.height - dataPoints[0] * yScale))
        
        for (index, point) in dataPoints.enumerated() {
            let x = CGFloat(index) * xStep
            let y = rect.height - point * yScale
            path.addLine(to: CGPoint(x: x, y: y))
        }
        
        return path
    }
    
    // Use layer caching for static content
    override class var layerClass: AnyClass {
        return CAShapeLayer.self
    }
}

// MARK: - Animation Performance
struct AnimatedButton: View {
    @State private var isPressed = false
    
    var body: some View {
        Button("Tap Me") {
            // Action
        }
        .scaleEffect(isPressed ? 0.95 : 1.0)
        .animation(.spring(response: 0.3, dampingFraction: 0.6), value: isPressed)
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in isPressed = true }
                .onEnded { _ in isPressed = false }
        )
    }
}
```

### Example 7: Storage Optimization
```swift
import CoreData

// MARK: - Core Data Performance
class CoreDataManager {
    static let shared = CoreDataManager()
    
    lazy var persistentContainer: NSPersistentContainer = {
        let container = NSPersistentContainer(name: "MyApp")
        
        // Configure for performance
        let description = container.persistentStoreDescriptions.first
        description?.shouldMigrateStoreAutomatically = true
        description?.shouldInferMappingModelAutomatically = true
        
        // Enable persistent history tracking
        description?.setOption(true as NSNumber, forKey: NSPersistentHistoryTrackingKey)
        
        // Enable remote change notifications
        description?.setOption(true as NSNumber, forKey: NSPersistentStoreRemoteChangeNotificationPostOptionKey)
        
        container.loadPersistentStores { description, error in
            if let error = error {
                fatalError("Core Data failed to load: \(error)")
            }
        }
        
        // Configure view context
        container.viewContext.automaticallyMergesChangesFromParent = true
        container.viewContext.mergePolicy = NSMergeByPropertyObjectTrumpMergePolicy
        
        return container
    }()
    
    // Background context for heavy operations
    func performBackgroundTask(_ block: @escaping (NSManagedObjectContext) -> Void) {
        persistentContainer.performBackgroundTask { context in
            context.mergePolicy = NSMergeByPropertyObjectTrumpMergePolicy
            block(context)
            
            if context.hasChanges {
                try? context.save()
            }
        }
    }
    
    // Batch operations for efficiency
    func batchDelete(entityName: String, predicate: NSPredicate) throws {
        let fetchRequest = NSFetchRequest<NSFetchRequestResult>(entityName: entityName)
        fetchRequest.predicate = predicate
        
        let batchDelete = NSBatchDeleteRequest(fetchRequest: fetchRequest)
        batchDelete.resultType = .resultTypeObjectIDs
        
        let context = persistentContainer.viewContext
        let result = try context.execute(batchDelete) as? NSBatchDeleteResult
        
        if let objectIDs = result?.result as? [NSManagedObjectID] {
            NSManagedObjectContext.mergeChanges(
                fromRemoteContextSave: [NSDeletedObjectsKey: objectIDs],
                into: [context]
            )
        }
    }
}

// MARK: - File System Optimization
class FileManager {
    static let shared = FileManager()
    
    private let fileManager = Foundation.FileManager.default
    private let cacheDirectory: URL
    
    init() {
        cacheDirectory = fileManager.urls(for: .cachesDirectory, in: .userDomainMask)[0]
    }
    
    func saveData(_ data: Data, filename: String) throws {
        let fileURL = cacheDirectory.appendingPathComponent(filename)
        
        // Write atomically for data integrity
        try data.write(to: fileURL, options: .atomic)
    }
    
    func loadData(filename: String) throws -> Data {
        let fileURL = cacheDirectory.appendingPathComponent(filename)
        return try Data(contentsOf: fileURL)
    }
    
    func clearOldCache(olderThan days: Int) {
        let cutoffDate = Calendar.current.date(byAdding: .day, value: -days, to: Date())!
        
        guard let files = try? fileManager.contentsOfDirectory(at: cacheDirectory, includingPropertiesForKeys: [.contentModificationDateKey]) else {
            return
        }
        
        for file in files {
            guard let attributes = try? fileManager.attributesOfItem(atPath: file.path),
                  let modificationDate = attributes[.modificationDate] as? Date,
                  modificationDate < cutoffDate else {
                continue
            }
            
            try? fileManager.removeItem(at: file)
        }
    }
}
```

### Example 8: Performance Configuration
```json
// .performance-config.json
{
  "thresholds": {
    "launch_time_ms": 400,
    "memory_limit_mb": 150,
    "cpu_usage_percent": 80,
    "fps_minimum": 55,
    "network_timeout_seconds": 30
  },
  "monitoring": {
    "enabled": true,
    "report_interval_seconds": 60,
    "crash_reporting": true
  }
}
```

```bash
#!/bin/bash
# scripts/performance-check.sh
# Run performance validation before release

echo "Running performance tests..."

# Check app size
APP_SIZE=$(du -sm "build/MyApp.app" | cut -f1)
if [ $APP_SIZE -gt 100 ]; then
    echo "Warning: App size is ${APP_SIZE}MB (target: <100MB)"
fi

# Run Instruments tests
xcodebuild test \
  -scheme MyApp \
  -destination 'platform=iOS Simulator,name=iPhone 15 Pro' \
  -only-testing:MyAppTests/PerformanceTests

echo "Performance check complete!"
```

### Example 9: Instruments Profiling Integration
```swift
import os.signpost

// MARK: - Performance Monitoring
class PerformanceMonitor {
    static let shared = PerformanceMonitor()
    
    private let log = OSLog(subsystem: "com.app.performance", category: "monitoring")
    
    func measureOperation<T>(_ name: String, operation: () throws -> T) rethrows -> T {
        let signpostID = OSSignpostID(log: log)
        os_signpost(.begin, log: log, name: "Operation", signpostID: signpostID, "%{public}s", name)
        
        defer {
            os_signpost(.end, log: log, name: "Operation", signpostID: signpostID)
        }
        
        return try operation()
    }
    
    func measureAsyncOperation<T>(_ name: String, operation: () async throws -> T) async rethrows -> T {
        let signpostID = OSSignpostID(log: log)
        os_signpost(.begin, log: log, name: "AsyncOperation", signpostID: signpostID, "%{public}s", name)
        
        defer {
            os_signpost(.end, log: log, name: "AsyncOperation", signpostID: signpostID)
        }
        
        return try await operation()
    }
}

// Usage
let result = PerformanceMonitor.shared.measureOperation("Data Processing") {
    // Heavy operation
    return processData()
}

// Async usage
let asyncResult = await PerformanceMonitor.shared.measureAsyncOperation("API Call") {
    try await fetchDataFromAPI()
}
```

## Instructions

### 1. Memory Management
- Use weak/unowned references to avoid retain cycles
- Implement proper deinit methods for cleanup
- Use NSCache for automatic memory management
- Downsample images before displaying
- Monitor memory usage with Instruments
- Fix memory leaks immediately

### 2. CPU Optimization
- Move heavy operations off main thread
- Use background queues for processing
- Implement lazy loading for views
- Debounce rapid user inputs
- Profile with Time Profiler instrument
- Optimize hot code paths

### 3. Battery Efficiency
- Use appropriate location accuracy
- Batch network requests
- Minimize background activity
- Use efficient APIs (significant location changes)
- Monitor with Energy Log instrument
- Optimize display refresh rates

### 4. Network Performance
- Implement request caching
- Use HTTP/2 and compression
- Prefetch predictable content
- Prioritize critical requests
- Monitor with Network instrument
- Handle offline scenarios gracefully

### 5. Launch Time
- Defer non-critical initialization
- Use lazy initialization
- Preload only essential data
- Minimize framework loading
- Profile with App Launch instrument
- Target under 400ms launch time

### 6. Rendering Performance
- Use lazy stacks for lists
- Implement view equality checks
- Optimize drawing operations
- Use layer caching
- Profile with Core Animation instrument
- Maintain 60 FPS

### 7. Storage Optimization
- Use batch operations in Core Data
- Implement background contexts
- Clear old cache regularly
- Use atomic writes
- Monitor with Disk Writes instrument
- Optimize database queries

### 8. Profiling and Monitoring
- Use Instruments regularly
- Add signposts for custom profiling
- Monitor performance metrics
- Set performance baselines
- Track regressions in CI/CD
- Use MetricKit for production monitoring

## Implementation Patterns

### Pattern 1: Lazy Property Initialization
```swift
class ViewModel {
    lazy var expensiveProperty: ExpensiveObject = {
        return ExpensiveObject()
    }()
}
```

### Pattern 2: Background Processing
```swift
func processData() async {
    await withTaskGroup(of: ProcessedItem.self) { group in
        for item in items {
            group.addTask {
                await self.process(item)
            }
        }
    }
}
```

### Pattern 3: Memory-Efficient Caching
```swift
let cache = NSCache<NSString, AnyObject>()
cache.countLimit = 100
cache.totalCostLimit = 50 * 1024 * 1024
```

## Expected Output

When implementing iOS performance optimization, the system should generate:

1. **Memory-Optimized Code** with proper lifecycle management
2. **CPU-Efficient Algorithms** with background processing
3. **Battery-Conscious Features** with minimal power consumption
4. **Network-Optimized Requests** with caching and compression
5. **Fast Launch Implementation** with deferred initialization
6. **Smooth Rendering** with 60 FPS performance
7. **Storage-Efficient Persistence** with optimized queries
8. **Profiling Integration** with Instruments signposts

## Integration Points

iOS performance optimization integrates with development workflow through comprehensive monitoring and profiling tools. Memory management connects with Instruments Allocations and Leaks tools for detecting issues. CPU profiling uses Time Profiler to identify bottlenecks and optimize hot paths. Battery monitoring integrates with Energy Log instrument to track power consumption. Network performance uses Network instrument to analyze request patterns and identify optimization opportunities. Launch time profiling uses App Launch instrument to measure and optimize startup performance. Rendering performance connects with Core Animation instrument to maintain 60 FPS. Storage optimization uses Core Data instrument to profile database operations.

```swift
// Integrated performance monitoring
class PerformanceIntegration {
    func monitorOperation() async {
        let signpostID = OSSignpostID(log: performanceLog)
        os_signpost(.begin, log: performanceLog, name: "DataLoad", signpostID: signpostID)
        
        let startTime = CFAbsoluteTimeGetCurrent()
        
        await loadData()
        
        let timeElapsed = CFAbsoluteTimeGetCurrent() - startTime
        os_signpost(.end, log: performanceLog, name: "DataLoad", signpostID: signpostID)
        
        // Report to analytics
        Analytics.track("performance.data_load", properties: [
            "duration": timeElapsed
        ])
    }
}
```

## Security Considerations

Performance optimization must not compromise security. Memory management requires secure cleanup of sensitive data using explicit zeroing before deallocation. Caching strategies must respect data sensitivity and avoid caching sensitive information in insecure locations. Network optimization should maintain SSL/TLS security and certificate pinning despite performance improvements. Background processing must validate data integrity and maintain encryption for sensitive operations. Storage optimization should use encrypted databases for sensitive data and secure file system APIs.

```swift
// Secure performance optimization
class SecureCache {
    private let cache = NSCache<NSString, SecureData>()
    
    func store(_ data: Data, forKey key: String) {
        let secureData = SecureData(data: data)
        cache.setObject(secureData, forKey: key as NSString)
    }
    
    func retrieve(forKey key: String) -> Data? {
        return cache.object(forKey: key as NSString)?.data
    }
    
    deinit {
        // Secure cleanup
        cache.removeAllObjects()
    }
}

class SecureData {
    private(set) var data: Data
    
    init(data: Data) {
        self.data = data
    }
    
    deinit {
        // Zero out memory before deallocation
        data.withUnsafeMutableBytes { bytes in
            memset(bytes.baseAddress, 0, bytes.count)
        }
    }
}
```

## Performance Features

iOS performance optimization delivers measurable improvements across key metrics. Memory usage reduction achieves 30-50% lower peak memory through efficient caching and image downsampling. CPU utilization decreases by 40-60% through background processing and algorithm optimization. Battery life improves by 20-30% through location optimization and request batching. Network data transfer reduces by 50-70% through caching and compression. Launch time decreases to under 400ms through deferred initialization. Frame rate maintains consistent 60 FPS through rendering optimization. Storage operations improve by 3-5x through batch operations and query optimization.

```swift
// Performance metrics tracking
class PerformanceMetrics {
    static func trackMemoryUsage() -> UInt64 {
        var info = mach_task_basic_info()
        var count = mach_msg_type_number_t(MemoryLayout<mach_task_basic_info>.size)/4
        
        let kerr: kern_return_t = withUnsafeMutablePointer(to: &info) {
            $0.withMemoryRebound(to: integer_t.self, capacity: 1) {
                task_info(mach_task_self_, task_flavor_t(MACH_TASK_BASIC_INFO), $0, &count)
            }
        }
        
        return kerr == KERN_SUCCESS ? info.resident_size : 0
    }
    
    static func trackCPUUsage() -> Double {
        var totalUsageOfCPU: Double = 0.0
        var threadsList: thread_act_array_t?
        var threadsCount = mach_msg_type_number_t(0)
        
        let threadsResult = task_threads(mach_task_self_, &threadsList, &threadsCount)
        
        if threadsResult == KERN_SUCCESS, let threadsList = threadsList {
            for index in 0..<threadsCount {
                var threadInfo = thread_basic_info()
                var threadInfoCount = mach_msg_type_number_t(THREAD_INFO_MAX)
                
                let infoResult = withUnsafeMutablePointer(to: &threadInfo) {
                    $0.withMemoryRebound(to: integer_t.self, capacity: 1) {
                        thread_info(threadsList[Int(index)], thread_flavor_t(THREAD_BASIC_INFO), $0, &threadInfoCount)
                    }
                }
                
                if infoResult == KERN_SUCCESS {
                    let threadBasicInfo = threadInfo as thread_basic_info
                    if threadBasicInfo.flags & TH_FLAGS_IDLE == 0 {
                        totalUsageOfCPU += (Double(threadBasicInfo.cpu_usage) / Double(TH_USAGE_SCALE)) * 100.0
                    }
                }
            }
        }
        
        return totalUsageOfCPU
    }
}
```

## Related Templates
- [Swift iOS Development](./swift-ios-development.md) - Core iOS development patterns
- [iOS Testing Comprehensive](./ios-testing-comprehensive.md) - Testing strategies
- [iOS UI/UX Patterns](./ios-ui-ux-patterns.md) - UI implementation
- [iOS Deployment Distribution](./ios-deployment-distribution.md) - App Store deployment
- [Performance](../performance/README.md) - Cross-platform performance optimization
