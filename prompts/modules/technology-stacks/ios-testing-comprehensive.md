# iOS Testing Comprehensive Template

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

Provide comprehensive testing strategies for iOS applications covering unit testing, UI testing, integration testing, snapshot testing, and continuous integration. This template ensures high-quality iOS applications through automated testing, test-driven development practices, and robust CI/CD pipelines using XCTest, XCUITest, and modern testing frameworks.

## Context

iOS applications require thorough testing to ensure reliability, performance, and user experience quality. This template helps developers implement:
- Unit testing with XCTest for business logic and ViewModels
- UI testing with XCUITest for user interface interactions
- Integration testing for API and data layer validation
- Snapshot testing for visual regression detection
- Performance testing for app responsiveness and resource usage
- Continuous integration with Xcode Cloud, GitHub Actions, or Fastlane
- Test-driven development (TDD) practices for iOS

Use this template when building production-ready iOS applications that require comprehensive test coverage, automated testing pipelines, and quality assurance processes.

## Examples

### Example 1: Unit Testing with XCTest
```swift
import XCTest
@testable import MyApp

// MARK: - ViewModel Unit Tests
final class ProductViewModelTests: XCTestCase {
    var sut: ProductViewModel!
    var mockRepository: MockProductRepository!
    var mockAnalytics: MockAnalyticsService!
    
    override func setUp() {
        super.setUp()
        mockRepository = MockProductRepository()
        mockAnalytics = MockAnalyticsService()
        sut = ProductViewModel(
            repository: mockRepository,
            analytics: mockAnalytics
        )
    }
    
    override func tearDown() {
        sut = nil
        mockRepository = nil
        mockAnalytics = nil
        super.tearDown()
    }
    
    // MARK: - Loading Tests
    func testLoadProducts_Success_UpdatesProducts() async throws {
        // Given
        let expectedProducts = [
            Product(id: "1", name: "Product 1", price: 9.99),
            Product(id: "2", name: "Product 2", price: 19.99)
        ]
        mockRepository.productsToReturn = expectedProducts
        
        // When
        await sut.loadProducts()
        
        // Then
        XCTAssertEqual(sut.products.count, 2)
        XCTAssertEqual(sut.products, expectedProducts)
        XCTAssertFalse(sut.isLoading)
        XCTAssertNil(sut.error)
    }
    
    func testLoadProducts_Failure_SetsError() async throws {
        // Given
        let expectedError = NetworkError.serverError
        mockRepository.errorToThrow = expectedError
        
        // When
        await sut.loadProducts()
        
        // Then
        XCTAssertTrue(sut.products.isEmpty)
        XCTAssertNotNil(sut.error)
        XCTAssertFalse(sut.isLoading)
    }
    
    func testLoadProducts_SetsLoadingState() async throws {
        // Given
        mockRepository.delay = 0.1
        
        // When
        let loadTask = Task {
            await sut.loadProducts()
        }
        
        // Then
        try await Task.sleep(nanoseconds: 50_000_000) // 0.05 seconds
        XCTAssertTrue(sut.isLoading)
        
        await loadTask.value
        XCTAssertFalse(sut.isLoading)
    }
    
    // MARK: - Search Tests
    func testSearchProducts_FiltersCorrectly() {
        // Given
        sut.products = [
            Product(id: "1", name: "iPhone", price: 999),
            Product(id: "2", name: "iPad", price: 799),
            Product(id: "3", name: "MacBook", price: 1299)
        ]
        
        // When
        sut.searchText = "iP"
        
        // Then
        XCTAssertEqual(sut.filteredProducts.count, 2)
        XCTAssertTrue(sut.filteredProducts.contains { $0.name == "iPhone" })
        XCTAssertTrue(sut.filteredProducts.contains { $0.name == "iPad" })
    }
    
    // MARK: - Analytics Tests
    func testAddToCart_TracksAnalytics() {
        // Given
        let product = Product(id: "1", name: "Test Product", price: 9.99)
        
        // When
        sut.addToCart(product)
        
        // Then
        XCTAssertEqual(mockAnalytics.trackedEvents.count, 1)
        XCTAssertEqual(mockAnalytics.trackedEvents.first?.name, "add_to_cart")
        XCTAssertEqual(mockAnalytics.trackedEvents.first?.parameters["product_id"] as? String, "1")
    }
}

// MARK: - Mock Repository
class MockProductRepository: ProductRepositoryProtocol {
    var productsToReturn: [Product] = []
    var errorToThrow: Error?
    var delay: TimeInterval = 0
    
    func fetchProducts() async throws -> [Product] {
        if delay > 0 {
            try await Task.sleep(nanoseconds: UInt64(delay * 1_000_000_000))
        }
        
        if let error = errorToThrow {
            throw error
        }
        
        return productsToReturn
    }
}

// MARK: - Mock Analytics
class MockAnalyticsService: AnalyticsServiceProtocol {
    struct TrackedEvent {
        let name: String
        let parameters: [String: Any]
    }
    
    var trackedEvents: [TrackedEvent] = []
    
    func track(event: String, parameters: [String: Any]) {
        trackedEvents.append(TrackedEvent(name: event, parameters: parameters))
    }
}
```

### Example 2: UI Testing with XCUITest
```swift
import XCTest

// MARK: - UI Test Suite
final class ProductListUITests: XCTestCase {
    var app: XCUIApplication!
    
    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        app.launchArguments = ["UI-Testing"]
        app.launchEnvironment = ["MOCK_DATA": "true"]
        app.launch()
    }
    
    override func tearDownWithError() throws {
        app = nil
    }
    
    // MARK: - Navigation Tests
    func testNavigateToProductDetail() throws {
        // Given
        let productList = app.collectionViews["ProductList"]
        XCTAssertTrue(productList.waitForExistence(timeout: 5))
        
        // When
        let firstProduct = productList.cells.element(boundBy: 0)
        XCTAssertTrue(firstProduct.exists)
        firstProduct.tap()
        
        // Then
        let detailView = app.otherElements["ProductDetailView"]
        XCTAssertTrue(detailView.waitForExistence(timeout: 2))
        
        let productTitle = app.staticTexts["ProductTitle"]
        XCTAssertTrue(productTitle.exists)
        XCTAssertFalse(productTitle.label.isEmpty)
    }
    
    // MARK: - Search Tests
    func testSearchFunctionality() throws {
        // Given
        let searchField = app.searchFields["Search products"]
        XCTAssertTrue(searchField.waitForExistence(timeout: 5))
        
        // When
        searchField.tap()
        searchField.typeText("iPhone")
        
        // Then
        let productList = app.collectionViews["ProductList"]
        let cells = productList.cells
        
        // Wait for search results
        let predicate = NSPredicate(format: "count > 0")
        let expectation = XCTNSPredicateExpectation(predicate: predicate, object: cells)
        wait(for: [expectation], timeout: 3)
        
        // Verify filtered results
        XCTAssertGreaterThan(cells.count, 0)
        let firstCell = cells.element(boundBy: 0)
        XCTAssertTrue(firstCell.staticTexts.containing(NSPredicate(format: "label CONTAINS[c] 'iPhone'")).element.exists)
    }
    
    // MARK: - Add to Cart Tests
    func testAddToCart() throws {
        // Given
        let productList = app.collectionViews["ProductList"]
        let firstProduct = productList.cells.element(boundBy: 0)
        firstProduct.tap()
        
        let addToCartButton = app.buttons["AddToCartButton"]
        XCTAssertTrue(addToCartButton.waitForExistence(timeout: 2))
        
        // When
        addToCartButton.tap()
        
        // Then
        let successMessage = app.staticTexts["Added to cart"]
        XCTAssertTrue(successMessage.waitForExistence(timeout: 2))
        
        // Verify cart badge
        let cartBadge = app.buttons["CartButton"].badges.element
        XCTAssertTrue(cartBadge.exists)
        XCTAssertEqual(cartBadge.label, "1")
    }
    
    // MARK: - Pull to Refresh Tests
    func testPullToRefresh() throws {
        // Given
        let productList = app.collectionViews["ProductList"]
        XCTAssertTrue(productList.waitForExistence(timeout: 5))
        
        // When
        let firstCell = productList.cells.element(boundBy: 0)
        let start = firstCell.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5))
        let finish = firstCell.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 10))
        start.press(forDuration: 0, thenDragTo: finish)
        
        // Then
        let loadingIndicator = app.activityIndicators.element
        XCTAssertTrue(loadingIndicator.exists)
        
        // Wait for refresh to complete
        let predicate = NSPredicate(format: "exists == false")
        let expectation = XCTNSPredicateExpectation(predicate: predicate, object: loadingIndicator)
        wait(for: [expectation], timeout: 5)
    }
    
    // MARK: - Accessibility Tests
    func testVoiceOverAccessibility() throws {
        // Given
        let productList = app.collectionViews["ProductList"]
        let firstProduct = productList.cells.element(boundBy: 0)
        
        // Then
        XCTAssertTrue(firstProduct.isAccessibilityElement)
        XCTAssertFalse(firstProduct.accessibilityLabel?.isEmpty ?? true)
        XCTAssertFalse(firstProduct.accessibilityHint?.isEmpty ?? true)
    }
    
    // MARK: - Error Handling Tests
    func testErrorHandling() throws {
        // Given
        app.launchEnvironment = ["MOCK_DATA": "true", "SIMULATE_ERROR": "true"]
        app.launch()
        
        // Then
        let errorAlert = app.alerts.element
        XCTAssertTrue(errorAlert.waitForExistence(timeout: 5))
        
        let retryButton = errorAlert.buttons["Retry"]
        XCTAssertTrue(retryButton.exists)
        
        // When
        retryButton.tap()
        
        // Then
        let productList = app.collectionViews["ProductList"]
        XCTAssertTrue(productList.waitForExistence(timeout: 5))
    }
}

// MARK: - Performance UI Tests
final class ProductListPerformanceTests: XCTestCase {
    var app: XCUIApplication!
    
    override func setUp() {
        super.setUp()
        app = XCUIApplication()
        app.launchArguments = ["UI-Testing", "Performance-Testing"]
        app.launch()
    }
    
    func testScrollPerformance() throws {
        let productList = app.collectionViews["ProductList"]
        XCTAssertTrue(productList.waitForExistence(timeout: 5))
        
        measure(metrics: [XCTOSSignpostMetric.scrollDecelerationMetric]) {
            productList.swipeUp(velocity: .fast)
            productList.swipeUp(velocity: .fast)
            productList.swipeUp(velocity: .fast)
        }
    }
    
    func testLaunchPerformance() throws {
        measure(metrics: [XCTApplicationLaunchMetric()]) {
            app.launch()
        }
    }
}
```

### Example 3: Integration Testing
```swift
import XCTest
@testable import MyApp

// MARK: - API Integration Tests
final class ProductAPIIntegrationTests: XCTestCase {
    var networkService: NetworkService!
    var repository: ProductRepository!
    
    override func setUp() {
        super.setUp()
        let configuration = URLSessionConfiguration.ephemeral
        configuration.protocolClasses = [MockURLProtocol.self]
        let session = URLSession(configuration: configuration)
        networkService = NetworkService(session: session)
        repository = ProductRepository(networkService: networkService)
    }
    
    override func tearDown() {
        MockURLProtocol.requestHandler = nil
        networkService = nil
        repository = nil
        super.tearDown()
    }
    
    func testFetchProducts_ValidResponse_ReturnsProducts() async throws {
        // Given
        let mockData = """
        {
            "products": [
                {"id": "1", "name": "Product 1", "price": 9.99},
                {"id": "2", "name": "Product 2", "price": 19.99}
            ]
        }
        """.data(using: .utf8)!
        
        MockURLProtocol.requestHandler = { request in
            let response = HTTPURLResponse(
                url: request.url!,
                statusCode: 200,
                httpVersion: nil,
                headerFields: ["Content-Type": "application/json"]
            )!
            return (response, mockData)
        }
        
        // When
        let products = try await repository.fetchProducts()
        
        // Then
        XCTAssertEqual(products.count, 2)
        XCTAssertEqual(products[0].name, "Product 1")
        XCTAssertEqual(products[1].price, 19.99)
    }
    
    func testFetchProducts_NetworkError_ThrowsError() async throws {
        // Given
        MockURLProtocol.requestHandler = { request in
            throw URLError(.notConnectedToInternet)
        }
        
        // When/Then
        do {
            _ = try await repository.fetchProducts()
            XCTFail("Expected error to be thrown")
        } catch {
            XCTAssertTrue(error is URLError)
        }
    }
    
    func testFetchProducts_InvalidJSON_ThrowsDecodingError() async throws {
        // Given
        let invalidData = "Invalid JSON".data(using: .utf8)!
        
        MockURLProtocol.requestHandler = { request in
            let response = HTTPURLResponse(
                url: request.url!,
                statusCode: 200,
                httpVersion: nil,
                headerFields: nil
            )!
            return (response, invalidData)
        }
        
        // When/Then
        do {
            _ = try await repository.fetchProducts()
            XCTFail("Expected decoding error")
        } catch {
            XCTAssertTrue(error is DecodingError)
        }
    }
}

// MARK: - Mock URL Protocol
class MockURLProtocol: URLProtocol {
    static var requestHandler: ((URLRequest) throws -> (HTTPURLResponse, Data))?
    
    override class func canInit(with request: URLRequest) -> Bool {
        return true
    }
    
    override class func canonicalRequest(for request: URLRequest) -> URLRequest {
        return request
    }
    
    override func startLoading() {
        guard let handler = MockURLProtocol.requestHandler else {
            fatalError("Request handler not set")
        }
        
        do {
            let (response, data) = try handler(request)
            client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
            client?.urlProtocol(self, didLoad: data)
            client?.urlProtocolDidFinishLoading(self)
        } catch {
            client?.urlProtocol(self, didFailWithError: error)
        }
    }
    
    override func stopLoading() {}
}

// MARK: - Core Data Integration Tests
final class CoreDataIntegrationTests: XCTestCase {
    var persistenceController: PersistenceController!
    var context: NSManagedObjectContext!
    
    override func setUp() {
        super.setUp()
        persistenceController = PersistenceController(inMemory: true)
        context = persistenceController.container.viewContext
    }
    
    override func tearDown() {
        context = nil
        persistenceController = nil
        super.tearDown()
    }
    
    func testSaveProduct_PersistsToDatabase() throws {
        // Given
        let product = ProductEntity(context: context)
        product.id = "1"
        product.name = "Test Product"
        product.price = 9.99
        
        // When
        try context.save()
        
        // Then
        let fetchRequest: NSFetchRequest<ProductEntity> = ProductEntity.fetchRequest()
        let results = try context.fetch(fetchRequest)
        
        XCTAssertEqual(results.count, 1)
        XCTAssertEqual(results.first?.name, "Test Product")
    }
    
    func testFetchProducts_ReturnsAllProducts() throws {
        // Given
        for i in 1...5 {
            let product = ProductEntity(context: context)
            product.id = "\(i)"
            product.name = "Product \(i)"
            product.price = Double(i) * 10
        }
        try context.save()
        
        // When
        let fetchRequest: NSFetchRequest<ProductEntity> = ProductEntity.fetchRequest()
        let results = try context.fetch(fetchRequest)
        
        // Then
        XCTAssertEqual(results.count, 5)
    }
}
```


### Example 4: Snapshot Testing
```swift
import XCTest
import SnapshotTesting
@testable import MyApp

// MARK: - Snapshot Tests
final class ProductViewSnapshotTests: XCTestCase {
    func testProductCard_LightMode() {
        // Given
        let product = Product(
            id: "1",
            name: "iPhone 15 Pro",
            price: 999.99,
            imageURL: URL(string: "https://example.com/iphone.jpg")!,
            category: "Smartphones",
            isNew: true
        )
        
        let view = ProductCard(product: product)
            .frame(width: 375, height: 200)
            .preferredColorScheme(.light)
        
        // Then
        assertSnapshot(matching: view, as: .image)
    }
    
    func testProductCard_DarkMode() {
        // Given
        let product = Product(
            id: "1",
            name: "iPhone 15 Pro",
            price: 999.99,
            imageURL: URL(string: "https://example.com/iphone.jpg")!,
            category: "Smartphones",
            isNew: true
        )
        
        let view = ProductCard(product: product)
            .frame(width: 375, height: 200)
            .preferredColorScheme(.dark)
        
        // Then
        assertSnapshot(matching: view, as: .image)
    }
    
    func testProductList_MultipleDevices() {
        // Given
        let products = (1...5).map { i in
            Product(
                id: "\(i)",
                name: "Product \(i)",
                price: Double(i) * 10,
                imageURL: URL(string: "https://example.com/product\(i).jpg")!,
                category: "Category",
                isNew: i == 1
            )
        }
        
        let view = ProductListView(products: products)
        
        // Then - Test on multiple devices
        assertSnapshot(matching: view, as: .image(on: .iPhoneSe))
        assertSnapshot(matching: view, as: .image(on: .iPhone13Pro))
        assertSnapshot(matching: view, as: .image(on: .iPhone13ProMax))
        assertSnapshot(matching: view, as: .image(on: .iPadPro11))
    }
    
    func testEmptyState() {
        // Given
        let view = EmptyStateView(
            title: "No Products",
            message: "Check back later for new items",
            systemImage: "cart"
        )
        .frame(width: 375, height: 600)
        
        // Then
        assertSnapshot(matching: view, as: .image)
    }
    
    func testLoadingState() {
        // Given
        let view = LoadingView()
            .frame(width: 375, height: 600)
        
        // Then
        assertSnapshot(matching: view, as: .image)
    }
}
```

### Example 5: Performance Testing
```swift
import XCTest
@testable import MyApp

// MARK: - Performance Tests
final class ProductPerformanceTests: XCTestCase {
    var viewModel: ProductViewModel!
    var mockRepository: MockProductRepository!
    
    override func setUp() {
        super.setUp()
        mockRepository = MockProductRepository()
        viewModel = ProductViewModel(repository: mockRepository)
    }
    
    func testLoadProducts_Performance() {
        // Given
        let products = (1...1000).map { i in
            Product(id: "\(i)", name: "Product \(i)", price: Double(i))
        }
        mockRepository.productsToReturn = products
        
        // When/Then
        measure {
            let expectation = expectation(description: "Load products")
            Task {
                await viewModel.loadProducts()
                expectation.fulfill()
            }
            wait(for: [expectation], timeout: 5)
        }
    }
    
    func testSearchProducts_Performance() {
        // Given
        let products = (1...10000).map { i in
            Product(id: "\(i)", name: "Product \(i)", price: Double(i))
        }
        viewModel.products = products
        
        // When/Then
        measure {
            viewModel.searchText = "Product 5"
            _ = viewModel.filteredProducts
        }
    }
    
    func testImageCaching_Performance() {
        // Given
        let imageCache = ImageCache.shared
        let testImage = UIImage(systemName: "photo")!
        let urls = (1...100).map { URL(string: "https://example.com/image\($0).jpg")! }
        
        // When/Then
        measure {
            for url in urls {
                imageCache.setImage(testImage, for: url)
            }
        }
    }
    
    func testCoreDataFetch_Performance() throws {
        // Given
        let context = PersistenceController.shared.container.viewContext
        for i in 1...1000 {
            let product = ProductEntity(context: context)
            product.id = "\(i)"
            product.name = "Product \(i)"
            product.price = Double(i)
        }
        try context.save()
        
        // When/Then
        measure {
            let fetchRequest: NSFetchRequest<ProductEntity> = ProductEntity.fetchRequest()
            fetchRequest.predicate = NSPredicate(format: "price > %f", 500.0)
            _ = try? context.fetch(fetchRequest)
        }
    }
}

// MARK: - Memory Leak Tests
final class MemoryLeakTests: XCTestCase {
    func testViewModel_DoesNotLeak() {
        // Given
        var viewModel: ProductViewModel? = ProductViewModel(
            repository: MockProductRepository()
        )
        
        // When
        weak var weakViewModel = viewModel
        viewModel = nil
        
        // Then
        XCTAssertNil(weakViewModel, "ViewModel should be deallocated")
    }
    
    func testView_DoesNotRetainViewModel() {
        // Given
        var viewModel: ProductViewModel? = ProductViewModel(
            repository: MockProductRepository()
        )
        weak var weakViewModel = viewModel
        
        // When
        _ = ProductListView(viewModel: viewModel!)
        viewModel = nil
        
        // Then
        XCTAssertNil(weakViewModel, "ViewModel should not be retained by view")
    }
}
```

### Example 6: Test-Driven Development (TDD) Example
```swift
import XCTest
@testable import MyApp

// MARK: - TDD: Shopping Cart Tests (Write tests first)
final class ShoppingCartTests: XCTestCase {
    var cart: ShoppingCart!
    
    override func setUp() {
        super.setUp()
        cart = ShoppingCart()
    }
    
    // Test 1: Empty cart should have zero items
    func testEmptyCart_HasZeroItems() {
        XCTAssertEqual(cart.itemCount, 0)
        XCTAssertEqual(cart.total, 0)
    }
    
    // Test 2: Adding item increases count
    func testAddItem_IncreasesCount() {
        // Given
        let product = Product(id: "1", name: "Test", price: 9.99)
        
        // When
        cart.addItem(product, quantity: 1)
        
        // Then
        XCTAssertEqual(cart.itemCount, 1)
    }
    
    // Test 3: Adding same item increases quantity
    func testAddSameItem_IncreasesQuantity() {
        // Given
        let product = Product(id: "1", name: "Test", price: 9.99)
        
        // When
        cart.addItem(product, quantity: 1)
        cart.addItem(product, quantity: 2)
        
        // Then
        XCTAssertEqual(cart.itemCount, 1)
        XCTAssertEqual(cart.quantity(for: product), 3)
    }
    
    // Test 4: Removing item decreases count
    func testRemoveItem_DecreasesCount() {
        // Given
        let product = Product(id: "1", name: "Test", price: 9.99)
        cart.addItem(product, quantity: 1)
        
        // When
        cart.removeItem(product)
        
        // Then
        XCTAssertEqual(cart.itemCount, 0)
    }
    
    // Test 5: Total calculates correctly
    func testTotal_CalculatesCorrectly() {
        // Given
        let product1 = Product(id: "1", name: "Product 1", price: 10.00)
        let product2 = Product(id: "2", name: "Product 2", price: 20.00)
        
        // When
        cart.addItem(product1, quantity: 2)
        cart.addItem(product2, quantity: 1)
        
        // Then
        XCTAssertEqual(cart.total, 40.00)
    }
    
    // Test 6: Discount applies correctly
    func testApplyDiscount_ReducesTotal() {
        // Given
        let product = Product(id: "1", name: "Test", price: 100.00)
        cart.addItem(product, quantity: 1)
        
        // When
        cart.applyDiscount(percentage: 10)
        
        // Then
        XCTAssertEqual(cart.total, 90.00)
    }
    
    // Test 7: Clear cart removes all items
    func testClearCart_RemovesAllItems() {
        // Given
        let product = Product(id: "1", name: "Test", price: 9.99)
        cart.addItem(product, quantity: 5)
        
        // When
        cart.clear()
        
        // Then
        XCTAssertEqual(cart.itemCount, 0)
        XCTAssertEqual(cart.total, 0)
    }
}

// MARK: - Implementation (Write after tests)
class ShoppingCart {
    private var items: [String: CartItem] = [:]
    private var discountPercentage: Double = 0
    
    var itemCount: Int {
        items.count
    }
    
    var total: Double {
        let subtotal = items.values.reduce(0) { $0 + ($1.product.price * Double($1.quantity)) }
        return subtotal * (1 - discountPercentage / 100)
    }
    
    func addItem(_ product: Product, quantity: Int) {
        if let existing = items[product.id] {
            items[product.id] = CartItem(
                product: product,
                quantity: existing.quantity + quantity
            )
        } else {
            items[product.id] = CartItem(product: product, quantity: quantity)
        }
    }
    
    func removeItem(_ product: Product) {
        items.removeValue(forKey: product.id)
    }
    
    func quantity(for product: Product) -> Int {
        items[product.id]?.quantity ?? 0
    }
    
    func applyDiscount(percentage: Double) {
        discountPercentage = percentage
    }
    
    func clear() {
        items.removeAll()
        discountPercentage = 0
    }
}

struct CartItem {
    let product: Product
    let quantity: Int
}
```

### Example 7: CI/CD Configuration
```yaml
# .github/workflows/ios-tests.yml
name: iOS Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    name: Run Tests
    runs-on: macos-13
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
    
    - name: Select Xcode
      run: sudo xcode-select -s /Applications/Xcode_15.0.app
    
    - name: Cache SPM
      uses: actions/cache@v3
      with:
        path: .build
        key: ${{ runner.os }}-spm-${{ hashFiles('**/Package.resolved') }}
        restore-keys: |
          ${{ runner.os }}-spm-
    
    - name: Install Dependencies
      run: |
        xcodebuild -resolvePackageDependencies
    
    - name: Run Unit Tests
      run: |
        xcodebuild test \
          -scheme MyApp \
          -destination 'platform=iOS Simulator,name=iPhone 15 Pro,OS=17.0' \
          -enableCodeCoverage YES \
          -resultBundlePath TestResults
    
    - name: Run UI Tests
      run: |
        xcodebuild test \
          -scheme MyAppUITests \
          -destination 'platform=iOS Simulator,name=iPhone 15 Pro,OS=17.0' \
          -resultBundlePath UITestResults
    
    - name: Generate Code Coverage
      run: |
        xcrun xccov view --report --json TestResults.xcresult > coverage.json
    
    - name: Upload Coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        files: ./coverage.json
        fail_ci_if_error: true
    
    - name: Upload Test Results
      if: always()
      uses: actions/upload-artifact@v3
      with:
        name: test-results
        path: |
          TestResults.xcresult
          UITestResults.xcresult

  snapshot-tests:
    name: Snapshot Tests
    runs-on: macos-13
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
    
    - name: Run Snapshot Tests
      run: |
        xcodebuild test \
          -scheme MyApp \
          -destination 'platform=iOS Simulator,name=iPhone 15 Pro,OS=17.0' \
          -only-testing:MyAppTests/SnapshotTests
    
    - name: Upload Snapshot Failures
      if: failure()
      uses: actions/upload-artifact@v3
      with:
        name: snapshot-failures
        path: |
          **/__Snapshots__/**/*.png
```

```ruby
# fastlane/Fastfile
default_platform(:ios)

platform :ios do
  desc "Run all tests"
  lane :test do
    run_tests(
      scheme: "MyApp",
      devices: ["iPhone 15 Pro", "iPhone SE (3rd generation)", "iPad Pro (12.9-inch)"],
      code_coverage: true,
      output_directory: "./test_output"
    )
  end
  
  desc "Run unit tests only"
  lane :unit_tests do
    run_tests(
      scheme: "MyApp",
      only_testing: ["MyAppTests"],
      code_coverage: true
    )
  end
  
  desc "Run UI tests only"
  lane :ui_tests do
    run_tests(
      scheme: "MyApp",
      only_testing: ["MyAppUITests"],
      devices: ["iPhone 15 Pro"]
    )
  end
  
  desc "Run snapshot tests"
  lane :snapshot_tests do
    run_tests(
      scheme: "MyApp",
      only_testing: ["MyAppTests/SnapshotTests"]
    )
  end
  
  desc "Generate code coverage report"
  lane :coverage do
    run_tests(
      scheme: "MyApp",
      code_coverage: true
    )
    
    slather(
      scheme: "MyApp",
      proj: "MyApp.xcodeproj",
      html: true,
      output_directory: "./coverage"
    )
  end
end
```

### Example 8: Test Utilities and Helpers
```swift
import XCTest
@testable import MyApp

// MARK: - Test Helpers
extension XCTestCase {
    /// Wait for async operation with timeout
    func waitForAsync(timeout: TimeInterval = 5, operation: @escaping () async throws -> Void) async throws {
        let expectation = expectation(description: "Async operation")
        
        Task {
            try await operation()
            expectation.fulfill()
        }
        
        await fulfillment(of: [expectation], timeout: timeout)
    }
    
    /// Assert throws specific error
    func assertThrows<T, E: Error & Equatable>(
        _ expression: @autoclosure () async throws -> T,
        expectedError: E,
        file: StaticString = #file,
        line: UInt = #line
    ) async {
        do {
            _ = try await expression()
            XCTFail("Expected error to be thrown", file: file, line: line)
        } catch let error as E {
            XCTAssertEqual(error, expectedError, file: file, line: line)
        } catch {
            XCTFail("Unexpected error type: \(error)", file: file, line: line)
        }
    }
}

// MARK: - Test Data Builders
struct ProductBuilder {
    private var id = UUID().uuidString
    private var name = "Test Product"
    private var price: Decimal = 9.99
    private var category = "Test Category"
    private var isNew = false
    
    func withId(_ id: String) -> ProductBuilder {
        var builder = self
        builder.id = id
        return builder
    }
    
    func withName(_ name: String) -> ProductBuilder {
        var builder = self
        builder.name = name
        return builder
    }
    
    func withPrice(_ price: Decimal) -> ProductBuilder {
        var builder = self
        builder.price = price
        return builder
    }
    
    func isNew(_ isNew: Bool) -> ProductBuilder {
        var builder = self
        builder.isNew = isNew
        return builder
    }
    
    func build() -> Product {
        Product(
            id: id,
            name: name,
            price: price,
            imageURL: URL(string: "https://example.com/image.jpg")!,
            category: category,
            isNew: isNew
        )
    }
}

// Usage in tests
func testExample() {
    let product = ProductBuilder()
        .withName("iPhone 15")
        .withPrice(999)
        .isNew(true)
        .build()
    
    // Test with product
}

// MARK: - Mock Factory
class MockFactory {
    static func createMockProducts(count: Int) -> [Product] {
        (1...count).map { i in
            ProductBuilder()
                .withId("\(i)")
                .withName("Product \(i)")
                .withPrice(Decimal(i * 10))
                .build()
        }
    }
    
    static func createMockUser() -> User {
        User(
            id: "test-user",
            name: "Test User",
            email: "test@example.com"
        )
    }
}
```

## Instructions

### 1. Unit Testing Setup
- Create test targets for each module (App, AppTests, AppUITests)
- Use XCTest framework for all unit tests
- Follow Arrange-Act-Assert (AAA) pattern
- Mock dependencies using protocols and test doubles
- Test ViewModels, business logic, and data transformations
- Aim for 80%+ code coverage on business logic

### 2. UI Testing Implementation
- Use XCUITest for automated UI testing
- Test critical user flows (login, checkout, navigation)
- Use accessibility identifiers for element selection
- Test on multiple device sizes and orientations
- Implement page object pattern for maintainability
- Test error states and edge cases

### 3. Integration Testing
- Test API integration with mock URLProtocol
- Test Core Data persistence and migrations
- Test third-party SDK integrations
- Use in-memory databases for fast tests
- Test data synchronization flows

### 4. Snapshot Testing
- Use SnapshotTesting library for visual regression
- Test views in both light and dark modes
- Test on multiple device sizes
- Update snapshots when UI intentionally changes
- Review snapshot diffs in pull requests

### 5. Performance Testing
- Use XCTest measure blocks for performance tests
- Test critical operations (data loading, search, rendering)
- Set performance baselines and track regressions
- Test memory usage and leak detection
- Profile with Instruments for detailed analysis

### 6. Test-Driven Development
- Write tests before implementation (Red-Green-Refactor)
- Start with failing tests that define requirements
- Implement minimal code to pass tests
- Refactor while keeping tests green
- Use TDD for complex business logic

### 7. Continuous Integration
- Set up automated testing in CI/CD pipeline
- Run tests on every pull request
- Generate and track code coverage reports
- Run UI tests on multiple simulators
- Fail builds on test failures or coverage drops

### 8. Test Organization
- Group tests by feature or module
- Use descriptive test names (test_condition_expectedResult)
- Keep tests independent and isolated
- Use setUp/tearDown for test preparation
- Create reusable test utilities and helpers

## Implementation Patterns

### Pattern 1: Mock Repository Pattern
```swift
protocol ProductRepositoryProtocol {
    func fetchProducts() async throws -> [Product]
    func fetchProduct(id: String) async throws -> Product
}

class MockProductRepository: ProductRepositoryProtocol {
    var productsToReturn: [Product] = []
    var errorToThrow: Error?
    
    func fetchProducts() async throws -> [Product] {
        if let error = errorToThrow {
            throw error
        }
        return productsToReturn
    }
    
    func fetchProduct(id: String) async throws -> Product {
        if let error = errorToThrow {
            throw error
        }
        return productsToReturn.first { $0.id == id }!
    }
}
```

### Pattern 2: Test Data Builder Pattern
```swift
class TestDataBuilder {
    static func product() -> ProductBuilder {
        ProductBuilder()
    }
    
    static func user() -> UserBuilder {
        UserBuilder()
    }
}

// Usage
let product = TestDataBuilder.product()
    .withName("iPhone")
    .withPrice(999)
    .build()
```

### Pattern 3: Async Testing Helper
```swift
extension XCTestCase {
    func awaitAsync<T>(
        timeout: TimeInterval = 5,
        _ operation: @escaping () async throws -> T
    ) async throws -> T {
        try await withCheckedThrowingContinuation { continuation in
            Task {
                do {
                    let result = try await operation()
                    continuation.resume(returning: result)
                } catch {
                    continuation.resume(throwing: error)
                }
            }
        }
    }
}
```

## Expected Output

When implementing iOS testing strategies, the system should generate:

1. **Unit Test Suites** with comprehensive coverage of business logic
2. **UI Test Suites** for critical user flows and interactions
3. **Integration Tests** for API and data layer validation
4. **Snapshot Tests** for visual regression detection
5. **Performance Tests** with baselines and metrics
6. **CI/CD Configuration** for automated testing pipelines
7. **Test Utilities** and helpers for common testing patterns
8. **Mock Objects** and test doubles for dependencies

## Integration Points

iOS testing integrates with development workflow through comprehensive automation and tooling. Unit tests validate ViewModels and business logic using XCTest framework with async/await support for modern Swift concurrency. UI tests verify user interactions through XCUITest with accessibility identifiers for reliable element selection. Integration tests validate API contracts using MockURLProtocol for network stubbing and in-memory Core Data for database testing. Snapshot tests detect visual regressions using SnapshotTesting library with support for multiple device configurations and appearance modes. CI/CD pipelines execute tests automatically through GitHub Actions, Xcode Cloud, or Fastlane with code coverage reporting and artifact uploads.

```swift
// Test integration example
class IntegratedTestSuite: XCTestCase {
    var app: XCUIApplication!
    var mockServer: MockAPIServer!
    
    override func setUp() {
        super.setUp()
        mockServer = MockAPIServer()
        mockServer.start()
        
        app = XCUIApplication()
        app.launchEnvironment = [
            "API_BASE_URL": mockServer.baseURL,
            "UI_TESTING": "true"
        ]
        app.launch()
    }
    
    func testEndToEndFlow() throws {
        // Mock API responses
        mockServer.stub("/products", with: mockProductsJSON)
        
        // UI interactions
        app.buttons["RefreshButton"].tap()
        
        // Verify results
        XCTAssertTrue(app.cells.count > 0)
    }
}
```

## Security Considerations

iOS testing must address security concerns while maintaining test effectiveness. Sensitive data handling requires test environments to use mock credentials and avoid real API keys in test code. Keychain testing uses ephemeral keychains that are cleared after tests complete. Network security testing validates certificate pinning and SSL/TLS configurations using mock certificates. Authentication testing implements mock authentication providers to avoid exposing real user credentials. Test data sanitization ensures no production data is used in automated tests.

```swift
// Secure testing practices
class SecureTestCase: XCTestCase {
    var testKeychain: KeychainWrapper!
    
    override func setUp() {
        super.setUp()
        // Use test-specific keychain
        testKeychain = KeychainWrapper(serviceName: "com.app.tests")
    }
    
    override func tearDown() {
        // Clear test keychain
        testKeychain.removeAllKeys()
        super.tearDown()
    }
    
    func testSecureStorage() {
        // Test with mock sensitive data
        let mockToken = "test-token-\(UUID().uuidString)"
        testKeychain.set(mockToken, forKey: "authToken")
        
        XCTAssertEqual(testKeychain.string(forKey: "authToken"), mockToken)
    }
}

// Mock authentication for tests
class MockAuthProvider: AuthProviderProtocol {
    var shouldSucceed = true
    
    func authenticate(username: String, password: String) async throws -> AuthToken {
        guard shouldSucceed else {
            throw AuthError.invalidCredentials
        }
        return AuthToken(value: "mock-token", expiresAt: Date().addingTimeInterval(3600))
    }
}
```

## Performance Features

iOS testing performance optimization ensures fast test execution and reliable results. Parallel test execution runs independent test suites simultaneously using xcodebuild's parallel testing capabilities. Test data caching reuses expensive setup operations across test methods. In-memory databases provide fast Core Data testing without disk I/O overhead. Mock network responses eliminate network latency from integration tests. Test suite organization groups fast unit tests separately from slower UI tests for efficient CI/CD pipelines.

```swift
// Performance-optimized testing
class PerformanceOptimizedTests: XCTestCase {
    static var sharedTestData: [Product]!
    
    override class func setUp() {
        super.setUp()
        // Expensive setup once for all tests
        sharedTestData = MockFactory.createMockProducts(count: 1000)
    }
    
    func testFastOperation() {
        // Reuse shared test data
        let filtered = Self.sharedTestData.filter { $0.price > 100 }
        XCTAssertGreaterThan(filtered.count, 0)
    }
    
    func testWithPerformanceMetrics() {
        measure(metrics: [XCTClockMetric(), XCTMemoryMetric()]) {
            // Operation to measure
            let sorted = Self.sharedTestData.sorted { $0.price < $1.price }
            XCTAssertEqual(sorted.count, 1000)
        }
    }
}

// Parallel test execution in CI
// xcodebuild test -parallel-testing-enabled YES -maximum-parallel-testing-workers 4
```

## Related Templates
- [Swift iOS Development](./swift-ios-development.md) - Core iOS development patterns
- [iOS UI/UX Patterns](./ios-ui-ux-patterns.md) - UI implementation and design
- [iOS Performance Optimization](./ios-performance-optimization.md) - Performance tuning
- [iOS Deployment Distribution](./ios-deployment-distribution.md) - App Store deployment
- [Testing](../testing/README.md) - Cross-platform testing strategies
