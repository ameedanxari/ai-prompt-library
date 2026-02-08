# iOS UI/UX Patterns Template

## Purpose

Provide comprehensive guidance for implementing iOS-native user interface and user experience patterns following Apple's Human Interface Guidelines (HIG). This template covers SwiftUI and UIKit design patterns, accessibility features, adaptive layouts, dark mode support, and platform-specific UI components to create polished, native-feeling iOS applications.

## Context

iOS applications require adherence to platform-specific design principles and user expectations. This template helps developers implement:
- Human Interface Guidelines compliance for App Store approval
- Accessibility features for inclusive design (VoiceOver, Dynamic Type, etc.)
- Adaptive layouts for different device sizes and orientations
- Dark mode and appearance customization
- Native iOS UI components and navigation patterns
- Animation and interaction patterns that feel natural on iOS
- Platform-specific gestures and touch interactions

Use this template when building iOS applications that need to provide a native, polished user experience that meets Apple's quality standards and user expectations.

## Examples

### Example 1: SwiftUI Human Interface Guidelines Compliance
```swift
import SwiftUI

// MARK: - HIG-Compliant List View
struct ProductListView: View {
    @StateObject private var viewModel = ProductViewModel()
    @Environment(\.dynamicTypeSize) var dynamicTypeSize
    @Environment(\.colorScheme) var colorScheme
    
    var body: some View {
        NavigationStack {
            List {
                ForEach(viewModel.products) { product in
                    NavigationLink(destination: ProductDetailView(product: product)) {
                        ProductRow(product: product)
                    }
                    .accessibilityLabel("\(product.name), \(product.price)")
                    .accessibilityHint("Double tap to view details")
                }
            }
            .navigationTitle("Products")
            .navigationBarTitleDisplayMode(.large)
            .searchable(text: $viewModel.searchText, prompt: "Search products")
            .refreshable {
                await viewModel.refresh()
            }
            .overlay {
                if viewModel.isLoading {
                    ProgressView()
                        .scaleEffect(1.5)
                        .accessibilityLabel("Loading products")
                }
            }
            .alert("Error", isPresented: $viewModel.showError) {
                Button("OK", role: .cancel) { }
                Button("Retry") {
                    Task { await viewModel.loadProducts() }
                }
            } message: {
                Text(viewModel.errorMessage)
            }
        }
    }
}

// MARK: - Accessible Product Row
struct ProductRow: View {
    let product: Product
    @ScaledMetric(relativeTo: .body) var imageSize: CGFloat = 60
    
    var body: some View {
        HStack(spacing: 12) {
            AsyncImage(url: product.imageURL) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Color.gray.opacity(0.2)
            }
            .frame(width: imageSize, height: imageSize)
            .clipShape(RoundedRectangle(cornerRadius: 8))
            .accessibilityHidden(true)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(product.name)
                    .font(.headline)
                    .lineLimit(2)
                
                Text(product.category)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                
                Text(product.price, format: .currency(code: "USD"))
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundStyle(.primary)
            }
            
            Spacer()
            
            if product.isNew {
                Text("NEW")
                    .font(.caption2)
                    .fontWeight(.bold)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(Color.accentColor)
                    .foregroundStyle(.white)
                    .clipShape(Capsule())
                    .accessibilityLabel("New product")
            }
        }
        .padding(.vertical, 4)
    }
}
```

### Example 2: Dark Mode and Adaptive Color Support
```swift
import SwiftUI

// MARK: - Adaptive Color System
extension Color {
    static let adaptiveBackground = Color("AdaptiveBackground")
    static let adaptiveText = Color("AdaptiveText")
    static let adaptiveCard = Color("AdaptiveCard")
    
    // Semantic colors that adapt to dark mode
    static let primaryAction = Color("PrimaryAction")
    static let secondaryAction = Color("SecondaryAction")
    static let destructiveAction = Color.red
    
    // Dynamic colors based on color scheme
    static func adaptive(light: Color, dark: Color) -> Color {
        Color(UIColor { traitCollection in
            traitCollection.userInterfaceStyle == .dark ? UIColor(dark) : UIColor(light)
        })
    }
}

// MARK: - Dark Mode Aware View
struct DashboardView: View {
    @Environment(\.colorScheme) var colorScheme
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem {
                    Label("Home", systemImage: "house.fill")
                }
                .tag(0)
            
            AnalyticsView()
                .tabItem {
                    Label("Analytics", systemImage: "chart.bar.fill")
                }
                .tag(1)
            
            SettingsView()
                .tabItem {
                    Label("Settings", systemImage: "gearshape.fill")
                }
                .tag(2)
        }
        .tint(.primaryAction)
        .preferredColorScheme(nil) // Respect system setting
    }
}

// MARK: - Card Component with Dark Mode
struct StatCard: View {
    let title: String
    let value: String
    let trend: Double
    @Environment(\.colorScheme) var colorScheme
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.subheadline)
                .foregroundStyle(.secondary)
            
            HStack(alignment: .firstTextBaseline) {
                Text(value)
                    .font(.title)
                    .fontWeight(.bold)
                
                Spacer()
                
                HStack(spacing: 4) {
                    Image(systemName: trend >= 0 ? "arrow.up.right" : "arrow.down.right")
                    Text(String(format: "%.1f%%", abs(trend)))
                }
                .font(.caption)
                .fontWeight(.semibold)
                .foregroundStyle(trend >= 0 ? .green : .red)
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.adaptiveCard)
                .shadow(
                    color: colorScheme == .dark ? .clear : .black.opacity(0.1),
                    radius: 8,
                    y: 2
                )
        )
    }
}

// MARK: - Asset Catalog Colors (Colors.xcassets)
/*
AdaptiveBackground:
  - Any Appearance: #FFFFFF
  - Dark Appearance: #000000

AdaptiveText:
  - Any Appearance: #000000
  - Dark Appearance: #FFFFFF

AdaptiveCard:
  - Any Appearance: #F5F5F5
  - Dark Appearance: #1C1C1E

PrimaryAction:
  - Any Appearance: #007AFF
  - Dark Appearance: #0A84FF
*/
```

### Example 3: Comprehensive Accessibility Implementation
```swift
import SwiftUI

// MARK: - Accessible Form View
struct ProfileEditView: View {
    @State private var name = ""
    @State private var email = ""
    @State private var bio = ""
    @State private var notifications = true
    @State private var showSaveConfirmation = false
    @AccessibilityFocusState private var isNameFocused: Bool
    
    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Name", text: $name)
                        .accessibilityLabel("Name")
                        .accessibilityHint("Enter your full name")
                        .accessibilityFocused($isNameFocused)
                        .textContentType(.name)
                        .autocapitalization(.words)
                    
                    TextField("Email", text: $email)
                        .accessibilityLabel("Email address")
                        .accessibilityHint("Enter your email address")
                        .textContentType(.emailAddress)
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)
                } header: {
                    Text("Personal Information")
                } footer: {
                    Text("Your email will be used for account recovery")
                        .accessibilityLabel("Note: Your email will be used for account recovery")
                }
                
                Section("About") {
                    TextEditor(text: $bio)
                        .frame(minHeight: 100)
                        .accessibilityLabel("Bio")
                        .accessibilityHint("Enter a brief description about yourself")
                }
                
                Section("Preferences") {
                    Toggle("Push Notifications", isOn: $notifications)
                        .accessibilityLabel("Push notifications")
                        .accessibilityHint(notifications ? "Enabled. Double tap to disable" : "Disabled. Double tap to enable")
                }
            }
            .navigationTitle("Edit Profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        saveProfile()
                    }
                    .accessibilityLabel("Save profile")
                    .accessibilityHint("Double tap to save your changes")
                }
                
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        // Dismiss
                    }
                    .accessibilityLabel("Cancel")
                    .accessibilityHint("Double tap to discard changes")
                }
            }
            .alert("Profile Saved", isPresented: $showSaveConfirmation) {
                Button("OK", role: .cancel) { }
            }
        }
        .onAppear {
            isNameFocused = true
        }
    }
    
    private func saveProfile() {
        // Save logic
        showSaveConfirmation = true
        
        // Announce to VoiceOver
        UIAccessibility.post(notification: .announcement, argument: "Profile saved successfully")
    }
}

// MARK: - Dynamic Type Support
struct ArticleView: View {
    let article: Article
    @Environment(\.dynamicTypeSize) var dynamicTypeSize
    @ScaledMetric(relativeTo: .body) var imageHeight: CGFloat = 200
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                AsyncImage(url: article.imageURL) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } placeholder: {
                    Rectangle()
                        .fill(Color.gray.opacity(0.2))
                }
                .frame(height: imageHeight)
                .clipped()
                .accessibilityHidden(true)
                
                VStack(alignment: .leading, spacing: 12) {
                    Text(article.title)
                        .font(.title)
                        .fontWeight(.bold)
                        .accessibilityAddTraits(.isHeader)
                    
                    HStack {
                        Text(article.author)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                        
                        Text("•")
                            .foregroundStyle(.secondary)
                            .accessibilityHidden(true)
                        
                        Text(article.date, style: .date)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    .accessibilityElement(children: .combine)
                    .accessibilityLabel("By \(article.author), \(article.date.formatted(date: .long, time: .omitted))")
                    
                    Divider()
                    
                    Text(article.content)
                        .font(.body)
                        .lineSpacing(4)
                        .accessibilityLabel("Article content")
                }
                .padding()
            }
        }
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - VoiceOver Custom Actions
struct MessageCell: View {
    let message: Message
    let onReply: () -> Void
    let onDelete: () -> Void
    let onMarkUnread: () -> Void
    
    var body: some View {
        HStack(spacing: 12) {
            Circle()
                .fill(message.isRead ? Color.gray : Color.blue)
                .frame(width: 8, height: 8)
                .accessibilityHidden(true)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(message.sender)
                    .font(.headline)
                
                Text(message.subject)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
                
                Text(message.preview)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
            }
            
            Spacer()
            
            Text(message.time, style: .relative)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding()
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(message.isRead ? "Read" : "Unread") message from \(message.sender), \(message.subject), \(message.time.formatted(.relative(presentation: .named)))")
        .accessibilityAction(named: "Reply") {
            onReply()
        }
        .accessibilityAction(named: "Delete") {
            onDelete()
        }
        .accessibilityAction(named: "Mark as Unread") {
            onMarkUnread()
        }
    }
}
```

### Example 4: Adaptive Layouts for Different Devices
```swift
import SwiftUI

// MARK: - Responsive Layout System
struct ResponsiveView: View {
    @Environment(\.horizontalSizeClass) var horizontalSizeClass
    @Environment(\.verticalSizeClass) var verticalSizeClass
    
    var body: some View {
        Group {
            if horizontalSizeClass == .compact {
                CompactLayout()
            } else {
                RegularLayout()
            }
        }
    }
}

// MARK: - Adaptive Grid Layout
struct ProductGridView: View {
    let products: [Product]
    @Environment(\.horizontalSizeClass) var horizontalSizeClass
    
    private var columns: [GridItem] {
        switch horizontalSizeClass {
        case .compact:
            return [GridItem(.adaptive(minimum: 150), spacing: 16)]
        case .regular:
            return [GridItem(.adaptive(minimum: 200), spacing: 20)]
        default:
            return [GridItem(.adaptive(minimum: 150), spacing: 16)]
        }
    }
    
    var body: some View {
        ScrollView {
            LazyVGrid(columns: columns, spacing: 16) {
                ForEach(products) { product in
                    ProductCard(product: product)
                }
            }
            .padding()
        }
    }
}

// MARK: - Split View for iPad
struct MasterDetailView: View {
    @State private var selectedItem: Item?
    @Environment(\.horizontalSizeClass) var horizontalSizeClass
    
    var body: some View {
        if horizontalSizeClass == .regular {
            // iPad: Side-by-side layout
            NavigationSplitView {
                ItemListView(selectedItem: $selectedItem)
            } detail: {
                if let item = selectedItem {
                    ItemDetailView(item: item)
                } else {
                    ContentUnavailableView(
                        "Select an Item",
                        systemImage: "list.bullet",
                        description: Text("Choose an item from the list")
                    )
                }
            }
        } else {
            // iPhone: Stack navigation
            NavigationStack {
                ItemListView(selectedItem: $selectedItem)
            }
        }
    }
}

// MARK: - Safe Area and Keyboard Handling
struct ChatInputView: View {
    @State private var message = ""
    @FocusState private var isInputFocused: Bool
    
    var body: some View {
        VStack(spacing: 0) {
            ScrollView {
                // Messages
            }
            
            HStack(spacing: 12) {
                TextField("Message", text: $message, axis: .vertical)
                    .textFieldStyle(.roundedBorder)
                    .lineLimit(1...5)
                    .focused($isInputFocused)
                
                Button(action: sendMessage) {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(.title2)
                        .foregroundStyle(message.isEmpty ? .gray : .blue)
                }
                .disabled(message.isEmpty)
            }
            .padding()
            .background(Color(uiColor: .systemBackground))
        }
        .ignoresSafeArea(.keyboard, edges: .bottom)
    }
    
    private func sendMessage() {
        // Send logic
        message = ""
    }
}
```


### Example 5: Native iOS Navigation Patterns
```swift
import SwiftUI

// MARK: - Tab-Based Navigation
struct MainTabView: View {
    @State private var selectedTab = 0
    @StateObject private var coordinator = NavigationCoordinator()
    
    var body: some View {
        TabView(selection: $selectedTab) {
            NavigationStack(path: $coordinator.homePath) {
                HomeView()
                    .navigationDestination(for: Route.self) { route in
                        coordinator.view(for: route)
                    }
            }
            .tabItem {
                Label("Home", systemImage: "house.fill")
            }
            .tag(0)
            
            NavigationStack(path: $coordinator.explorePath) {
                ExploreView()
                    .navigationDestination(for: Route.self) { route in
                        coordinator.view(for: route)
                    }
            }
            .tabItem {
                Label("Explore", systemImage: "magnifyingglass")
            }
            .tag(1)
            
            NavigationStack(path: $coordinator.profilePath) {
                ProfileView()
                    .navigationDestination(for: Route.self) { route in
                        coordinator.view(for: route)
                    }
            }
            .tabItem {
                Label("Profile", systemImage: "person.fill")
            }
            .tag(2)
        }
        .environmentObject(coordinator)
    }
}

// MARK: - Navigation Coordinator
class NavigationCoordinator: ObservableObject {
    @Published var homePath = NavigationPath()
    @Published var explorePath = NavigationPath()
    @Published var profilePath = NavigationPath()
    
    @ViewBuilder
    func view(for route: Route) -> some View {
        switch route {
        case .productDetail(let id):
            ProductDetailView(productId: id)
        case .category(let category):
            CategoryView(category: category)
        case .cart:
            CartView()
        case .settings:
            SettingsView()
        }
    }
    
    func popToRoot(tab: Int) {
        switch tab {
        case 0: homePath = NavigationPath()
        case 1: explorePath = NavigationPath()
        case 2: profilePath = NavigationPath()
        default: break
        }
    }
}

enum Route: Hashable {
    case productDetail(id: String)
    case category(String)
    case cart
    case settings
}

// MARK: - Modal Presentation
struct ProductDetailView: View {
    let productId: String
    @State private var showShareSheet = false
    @State private var showAddToCart = false
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        ScrollView {
            // Product content
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button {
                    showShareSheet = true
                } label: {
                    Image(systemName: "square.and.arrow.up")
                }
            }
        }
        .sheet(isPresented: $showAddToCart) {
            AddToCartView(productId: productId)
                .presentationDetents([.medium, .large])
                .presentationDragIndicator(.visible)
        }
        .sheet(isPresented: $showShareSheet) {
            ShareSheet(items: [URL(string: "https://example.com/product/\(productId)")!])
        }
    }
}

// MARK: - UIKit Share Sheet Bridge
struct ShareSheet: UIViewControllerRepresentable {
    let items: [Any]
    
    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: items, applicationActivities: nil)
    }
    
    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}
```

### Example 6: iOS Gesture Patterns
```swift
import SwiftUI

// MARK: - Swipe Actions
struct InboxView: View {
    @State private var messages: [Message] = []
    
    var body: some View {
        List {
            ForEach(messages) { message in
                MessageRow(message: message)
                    .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                        Button(role: .destructive) {
                            deleteMessage(message)
                        } label: {
                            Label("Delete", systemImage: "trash")
                        }
                        
                        Button {
                            archiveMessage(message)
                        } label: {
                            Label("Archive", systemImage: "archivebox")
                        }
                        .tint(.blue)
                    }
                    .swipeActions(edge: .leading) {
                        Button {
                            markAsRead(message)
                        } label: {
                            Label("Read", systemImage: "envelope.open")
                        }
                        .tint(.green)
                    }
            }
        }
    }
    
    private func deleteMessage(_ message: Message) {
        withAnimation {
            messages.removeAll { $0.id == message.id }
        }
    }
    
    private func archiveMessage(_ message: Message) {
        // Archive logic
    }
    
    private func markAsRead(_ message: Message) {
        // Mark as read logic
    }
}

// MARK: - Drag and Drop
struct TaskBoardView: View {
    @State private var todoTasks: [Task] = []
    @State private var inProgressTasks: [Task] = []
    @State private var doneTasks: [Task] = []
    
    var body: some View {
        HStack(spacing: 16) {
            TaskColumn(title: "To Do", tasks: $todoTasks, color: .blue)
            TaskColumn(title: "In Progress", tasks: $inProgressTasks, color: .orange)
            TaskColumn(title: "Done", tasks: $doneTasks, color: .green)
        }
        .padding()
    }
}

struct TaskColumn: View {
    let title: String
    @Binding var tasks: [Task]
    let color: Color
    
    var body: some View {
        VStack(alignment: .leading) {
            Text(title)
                .font(.headline)
                .foregroundStyle(color)
            
            ScrollView {
                LazyVStack(spacing: 8) {
                    ForEach(tasks) { task in
                        TaskCard(task: task)
                            .draggable(task)
                    }
                }
            }
            .frame(maxWidth: .infinity)
            .background(Color.gray.opacity(0.1))
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
        .dropDestination(for: Task.self) { droppedTasks, location in
            tasks.append(contentsOf: droppedTasks)
            return true
        }
    }
}

// MARK: - Long Press and Context Menu
struct PhotoGridView: View {
    let photos: [Photo]
    @State private var selectedPhoto: Photo?
    
    var body: some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: 100))]) {
            ForEach(photos) { photo in
                AsyncImage(url: photo.url) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } placeholder: {
                    Color.gray.opacity(0.2)
                }
                .frame(width: 100, height: 100)
                .clipShape(RoundedRectangle(cornerRadius: 8))
                .contextMenu {
                    Button {
                        sharePhoto(photo)
                    } label: {
                        Label("Share", systemImage: "square.and.arrow.up")
                    }
                    
                    Button {
                        savePhoto(photo)
                    } label: {
                        Label("Save", systemImage: "square.and.arrow.down")
                    }
                    
                    Button(role: .destructive) {
                        deletePhoto(photo)
                    } label: {
                        Label("Delete", systemImage: "trash")
                    }
                }
                .onLongPressGesture(minimumDuration: 0.5) {
                    selectedPhoto = photo
                    UIImpactFeedbackGenerator(style: .medium).impactOccurred()
                }
            }
        }
    }
    
    private func sharePhoto(_ photo: Photo) {}
    private func savePhoto(_ photo: Photo) {}
    private func deletePhoto(_ photo: Photo) {}
}
```

### Example 7: iOS Animation Patterns
```swift
import SwiftUI

// MARK: - Smooth Transitions
struct AnimatedListView: View {
    @State private var items: [Item] = []
    @Namespace private var animation
    
    var body: some View {
        List {
            ForEach(items) { item in
                ItemRow(item: item)
                    .matchedGeometryEffect(id: item.id, in: animation)
                    .transition(.asymmetric(
                        insertion: .move(edge: .trailing).combined(with: .opacity),
                        removal: .move(edge: .leading).combined(with: .opacity)
                    ))
            }
            .onDelete { indexSet in
                withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                    items.remove(atOffsets: indexSet)
                }
            }
        }
        .animation(.spring(response: 0.3, dampingFraction: 0.7), value: items)
    }
}

// MARK: - Pull to Refresh Animation
struct CustomRefreshView: View {
    @State private var isRefreshing = false
    @State private var offset: CGFloat = 0
    
    var body: some View {
        ScrollView {
            GeometryReader { geometry in
                Color.clear.preference(
                    key: ScrollOffsetPreferenceKey.self,
                    value: geometry.frame(in: .named("scroll")).minY
                )
            }
            .frame(height: 0)
            
            if isRefreshing {
                ProgressView()
                    .frame(maxWidth: .infinity)
                    .padding()
            }
            
            // Content
            LazyVStack {
                ForEach(0..<20) { index in
                    Text("Item \(index)")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.gray.opacity(0.1))
                }
            }
        }
        .coordinateSpace(name: "scroll")
        .onPreferenceChange(ScrollOffsetPreferenceKey.self) { value in
            offset = value
            if value > 100 && !isRefreshing {
                refresh()
            }
        }
    }
    
    private func refresh() {
        isRefreshing = true
        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
        
        Task {
            try? await Task.sleep(nanoseconds: 2_000_000_000)
            isRefreshing = false
        }
    }
}

struct ScrollOffsetPreferenceKey: PreferenceKey {
    static var defaultValue: CGFloat = 0
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        value = nextValue()
    }
}

// MARK: - Interactive Animations
struct LikeButton: View {
    @State private var isLiked = false
    @State private var scale: CGFloat = 1.0
    
    var body: some View {
        Button {
            withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                isLiked.toggle()
                scale = 1.3
            }
            
            UIImpactFeedbackGenerator(style: .light).impactOccurred()
            
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
                withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                    scale = 1.0
                }
            }
        } label: {
            Image(systemName: isLiked ? "heart.fill" : "heart")
                .font(.title2)
                .foregroundStyle(isLiked ? .red : .gray)
                .scaleEffect(scale)
        }
    }
}
```

### Example 8: Configuration and Build Settings
```json
// .swiftlint.yml - Enforce UI/UX best practices
disabled_rules:
  - trailing_whitespace
opt_in_rules:
  - accessibility_label_for_image
  - accessibility_trait_for_button
  - explicit_acl
  - explicit_top_level_acl

accessibility_label_for_image:
  severity: error

accessibility_trait_for_button:
  severity: warning

line_length:
  warning: 120
  error: 200
```

```bash
#!/bin/bash
# scripts/validate-accessibility.sh
# Validate accessibility compliance before commit

echo "Checking for accessibility labels..."
if grep -r "Image(systemName:" --include="*.swift" . | grep -v "accessibilityLabel"; then
    echo "Error: Found images without accessibility labels"
    exit 1
fi

echo "Checking for VoiceOver support..."
if grep -r "@State\|@Published" --include="*.swift" . | grep -v "accessibility"; then
    echo "Warning: Consider adding accessibility support to interactive elements"
fi

echo "Accessibility validation passed!"
```

### Example 9: UIKit Integration for Advanced UI
```swift
import SwiftUI
import UIKit

// MARK: - UIViewRepresentable for Custom Controls
struct CustomSlider: UIViewRepresentable {
    @Binding var value: Double
    let range: ClosedRange<Double>
    let onEditingChanged: (Bool) -> Void
    
    func makeUIView(context: Context) -> UISlider {
        let slider = UISlider()
        slider.minimumValue = Float(range.lowerBound)
        slider.maximumValue = Float(range.upperBound)
        slider.value = Float(value)
        slider.addTarget(
            context.coordinator,
            action: #selector(Coordinator.valueChanged(_:)),
            for: .valueChanged
        )
        slider.addTarget(
            context.coordinator,
            action: #selector(Coordinator.editingChanged(_:)),
            for: [.touchDown, .touchUpInside, .touchUpOutside]
        )
        return slider
    }
    
    func updateUIView(_ uiView: UISlider, context: Context) {
        uiView.value = Float(value)
    }
    
    func makeCoordinator() -> Coordinator {
        Coordinator(value: $value, onEditingChanged: onEditingChanged)
    }
    
    class Coordinator: NSObject {
        @Binding var value: Double
        let onEditingChanged: (Bool) -> Void
        
        init(value: Binding<Double>, onEditingChanged: @escaping (Bool) -> Void) {
            self._value = value
            self.onEditingChanged = onEditingChanged
        }
        
        @objc func valueChanged(_ sender: UISlider) {
            value = Double(sender.value)
        }
        
        @objc func editingChanged(_ sender: UISlider) {
            onEditingChanged(sender.isTracking)
        }
    }
}

// MARK: - UIViewControllerRepresentable for Complex Views
struct ImagePicker: UIViewControllerRepresentable {
    @Binding var image: UIImage?
    @Environment(\.dismiss) var dismiss
    
    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.delegate = context.coordinator
        picker.sourceType = .photoLibrary
        return picker
    }
    
    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let parent: ImagePicker
        
        init(_ parent: ImagePicker) {
            self.parent = parent
        }
        
        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
            if let image = info[.originalImage] as? UIImage {
                parent.image = image
            }
            parent.dismiss()
        }
        
        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            parent.dismiss()
        }
    }
}
```

## Instructions

### 1. Human Interface Guidelines Compliance
- Follow Apple's HIG for all UI components and interactions
- Use system-provided UI elements when possible (SF Symbols, standard controls)
- Implement proper spacing, sizing, and alignment according to HIG
- Ensure touch targets are at least 44x44 points
- Use standard navigation patterns (tab bars, navigation bars, modals)
- Implement proper feedback for user actions (haptics, animations, sounds)

### 2. Accessibility Implementation
- Add accessibility labels and hints to all interactive elements
- Support VoiceOver with proper element ordering and grouping
- Implement Dynamic Type for all text content
- Use @ScaledMetric for size-dependent layouts
- Provide alternative text for images and icons
- Support accessibility actions for complex interactions
- Test with Accessibility Inspector and VoiceOver

### 3. Dark Mode Support
- Use semantic colors that adapt to appearance
- Define colors in Asset Catalog with light/dark variants
- Test all UI in both light and dark modes
- Avoid hardcoded colors; use Color.adaptive or system colors
- Ensure sufficient contrast in both modes
- Use @Environment(\.colorScheme) for dynamic adjustments

### 4. Adaptive Layouts
- Use size classes to adapt layouts for different devices
- Implement responsive grids with LazyVGrid/LazyHGrid
- Support both portrait and landscape orientations
- Use NavigationSplitView for iPad layouts
- Handle safe areas properly (notch, home indicator, keyboard)
- Test on multiple device sizes (iPhone SE, Pro Max, iPad)

### 5. Navigation Patterns
- Implement proper navigation hierarchies with NavigationStack
- Use TabView for primary navigation (3-5 tabs maximum)
- Present modals with .sheet or .fullScreenCover appropriately
- Support deep linking with NavigationPath
- Implement proper back navigation and dismissal
- Use NavigationCoordinator for complex navigation flows

### 6. Gesture Support
- Implement swipe actions for list items
- Support drag and drop where appropriate
- Add context menus for secondary actions
- Use long press for preview interactions
- Implement pull-to-refresh for data lists
- Provide haptic feedback for gesture interactions

### 7. Animation and Transitions
- Use spring animations for natural motion
- Implement smooth transitions between views
- Add loading states with ProgressView
- Use matchedGeometryEffect for hero animations
- Animate list changes with proper transitions
- Keep animations under 300ms for responsiveness

### 8. UIKit Integration
- Use UIViewRepresentable for custom UIKit views
- Bridge UIKit controls when SwiftUI equivalents are insufficient
- Implement UIViewControllerRepresentable for complex flows
- Maintain proper lifecycle management in coordinators
- Handle updates efficiently to avoid performance issues

## Implementation Patterns

### Pattern 1: Accessible Component Library
```swift
// Create reusable accessible components
struct AccessibleButton: View {
    let title: String
    let systemImage: String
    let action: () -> Void
    let role: ButtonRole?
    
    var body: some View {
        Button(role: role, action: action) {
            Label(title, systemImage: systemImage)
        }
        .accessibilityLabel(title)
        .accessibilityHint("Double tap to \(title.lowercased())")
    }
}

// Usage
AccessibleButton(
    title: "Delete",
    systemImage: "trash",
    action: { deleteItem() },
    role: .destructive
)
```

### Pattern 2: Adaptive Color System
```swift
// Define semantic colors in extension
extension Color {
    static let brand = Color("BrandColor")
    static let surface = Color("SurfaceColor")
    static let onSurface = Color("OnSurfaceColor")
}

// Use in views
Text("Hello")
    .foregroundStyle(.onSurface)
    .background(.surface)
```

### Pattern 3: Responsive Layout Helper
```swift
struct ResponsiveLayout<Content: View>: View {
    @Environment(\.horizontalSizeClass) var sizeClass
    let compact: Content
    let regular: Content
    
    var body: some View {
        if sizeClass == .compact {
            compact
        } else {
            regular
        }
    }
}
```

## Expected Output

When implementing iOS UI/UX patterns, the system should generate:

1. **SwiftUI Views** with proper HIG compliance and accessibility
2. **Adaptive Layouts** that work across all iOS devices
3. **Dark Mode Support** with semantic colors and proper contrast
4. **Accessible Components** with VoiceOver support and Dynamic Type
5. **Navigation Flows** using modern NavigationStack patterns
6. **Gesture Handlers** for swipe, drag, long press, and context menus
7. **Smooth Animations** with spring physics and proper timing
8. **UIKit Bridges** when advanced functionality is needed

## Integration Points

The iOS UI/UX patterns integrate with other iOS development aspects through comprehensive coordination. For navigation management, use NavigationCoordinator with NavigationPath to handle deep linking and programmatic navigation across tab-based architectures. State management integrates through @StateObject, @ObservedObject, and @EnvironmentObject for reactive UI updates. Data persistence connects via Core Data or SwiftData with @FetchRequest for automatic UI updates when data changes. Networking layers integrate through async/await patterns with proper loading states and error handling UI. Testing frameworks validate UI behavior through XCUITest for accessibility and interaction testing.

```swift
// Navigation integration example
class AppCoordinator: ObservableObject {
    @Published var tabSelection = 0
    @Published var homePath = NavigationPath()
    
    func navigateToProduct(_ id: String) {
        tabSelection = 0
        homePath.append(Route.productDetail(id: id))
    }
}

// State management integration
class ProductViewModel: ObservableObject {
    @Published var products: [Product] = []
    @Published var isLoading = false
    
    func loadProducts() async {
        isLoading = true
        defer { isLoading = false }
        // Load data
    }
}
```

## Security Considerations

iOS UI/UX implementations must address security through multiple layers. Sensitive data display requires redaction when app enters background using .privacySensitive() modifier. Biometric authentication integrates through LocalAuthentication framework for secure actions. Secure text entry uses .textContentType(.password) and .autocorrection(.disabled) for password fields. Screenshot prevention applies .onAppear { UIScreen.main.isCaptured } monitoring for sensitive screens. Pasteboard security limits data exposure through UIPasteboard with expiration times.

```swift
// Sensitive data protection
struct AccountBalanceView: View {
    let balance: Decimal
    @Environment(\.scenePhase) var scenePhase
    @State private var isHidden = false
    
    var body: some View {
        Text(balance, format: .currency(code: "USD"))
            .privacySensitive()
            .redacted(reason: isHidden ? .placeholder : [])
            .onChange(of: scenePhase) { oldPhase, newPhase in
                isHidden = newPhase == .background
            }
    }
}

// Biometric authentication
import LocalAuthentication

func authenticateUser() async throws -> Bool {
    let context = LAContext()
    var error: NSError?
    
    guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
        throw AuthError.biometricsNotAvailable
    }
    
    return try await context.evaluatePolicy(
        .deviceOwnerAuthenticationWithBiometrics,
        localizedReason: "Authenticate to access your account"
    )
}
```

## Performance Features

iOS UI/UX performance optimization focuses on smooth 60 FPS rendering and efficient resource usage. Lazy loading implements LazyVStack and LazyHStack for large lists to render only visible items. Image optimization uses AsyncImage with proper caching and downsampling for memory efficiency. Animation performance leverages GPU-accelerated transforms and avoids layout changes during animations. View hierarchy optimization minimizes nesting depth and uses @ViewBuilder efficiently. Memory management implements proper cleanup in onDisappear and avoids retain cycles in closures.

```swift
// Lazy loading with pagination
struct OptimizedListView: View {
    @StateObject private var viewModel = ListViewModel()
    
    var body: some View {
        ScrollView {
            LazyVStack(spacing: 12) {
                ForEach(viewModel.items) { item in
                    ItemRow(item: item)
                        .onAppear {
                            if item == viewModel.items.last {
                                Task { await viewModel.loadMore() }
                            }
                        }
                }
            }
        }
    }
}

// Image caching and optimization
struct OptimizedImageView: View {
    let url: URL
    
    var body: some View {
        AsyncImage(url: url) { phase in
            switch phase {
            case .empty:
                ProgressView()
            case .success(let image):
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            case .failure:
                Image(systemName: "photo")
                    .foregroundStyle(.gray)
            @unknown default:
                EmptyView()
            }
        }
        .frame(width: 100, height: 100)
        .clipped()
    }
}
```

## Related Templates
- [Swift iOS Development](./swift-ios-development.md) - Core iOS development patterns
- [iOS Testing Comprehensive](./ios-testing-comprehensive.md) - Testing strategies
- [iOS Performance Optimization](./ios-performance-optimization.md) - Performance tuning
- [Accessibility](../accessibility/README.md) - Cross-platform accessibility patterns
