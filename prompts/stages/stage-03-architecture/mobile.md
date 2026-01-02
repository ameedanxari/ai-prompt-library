# Stage 03 - Architecture: Mobile Platform Architecture

## Purpose
Define mobile-specific architecture patterns, technology stack, and implementation strategies that build upon the platform-agnostic foundation.

## Instructions
Use this stage to establish the mobile-specific architecture that implements the platform-agnostic design. Focus on mobile technologies, device considerations, performance optimization, and mobile-specific patterns.

## Examples
```markdown
## Example Mobile Architecture

### Project: Task Management Mobile App
**Architecture**: React Native with TypeScript
**Navigation**: React Navigation 6 with stack and tab navigators
**State Management**: Zustand for client state, React Query for server state
**Local Storage**: AsyncStorage with encryption for sensitive data
**Offline Support**: Redux Persist with background sync

### Mobile-Specific Components
- **Push Notifications**: Firebase Cloud Messaging
- **Biometric Auth**: React Native Biometrics
- **Camera Integration**: React Native Vision Camera
- **Background Tasks**: React Native Background Job
- **Deep Linking**: React Navigation deep linking
```

## Mobile Architecture Design

### Cross-Platform Mobile Architecture
```markdown
## React Native Architecture (Recommended)

### Project Structure
```
src/
├── components/           # Reusable UI components
│   ├── common/          # Platform-agnostic components
│   ├── ios/             # iOS-specific components
│   └── android/         # Android-specific components
├── screens/             # Screen components
├── navigation/          # Navigation configuration
├── services/           # API and business logic services
├── store/              # State management
├── utils/              # Utility functions
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── assets/             # Images, fonts, etc.
└── config/             # Configuration files

# Platform-specific entry points
index.js                # Metro bundler entry
ios/                    # iOS-specific code and configuration
android/                # Android-specific code and configuration
```

### Navigation Architecture
```typescript
// React Navigation 6 setup
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator for main app sections
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Tasks') {
            iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
          } else if (route.name === 'Projects') {
            iconName = focused ? 'folder' : 'folder-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="Projects" component={ProjectsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Root Navigator with authentication flow
function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### State Management Architecture
```typescript
// Zustand store for client state
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppStore {
  user: User | null;
  theme: 'light' | 'dark';
  isOffline: boolean;
  setUser: (user: User | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setOfflineStatus: (isOffline: boolean) => void;
}

const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      user: null,
      theme: 'light',
      isOffline: false,
      setUser: (user) => set({ user }),
      setTheme: (theme) => set({ theme }),
      setOfflineStatus: (isOffline) => set({ isOffline }),
    }),
    {
      name: 'app-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        user: state.user, 
        theme: state.theme 
      }), // Only persist user and theme
    }
  )
);

// React Query for server state management
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401/403 errors
      if (error.status === 401 || error.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createTask,
    onSuccess: (newTask) => {
      // Optimistically update the tasks list
      queryClient.setQueryData(['tasks'], (oldTasks: Task[]) => [
        ...oldTasks,
        newTask,
      ]);
    },
    onError: () => {
      // Invalidate and refetch on error
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
```
```

### Native Mobile Architecture
```markdown
## iOS Native Architecture (Swift/SwiftUI)

### Project Structure
```
TaskApp/
├── App/                 # App lifecycle and configuration
├── Views/              # SwiftUI views
│   ├── Tasks/          # Task-related views
│   ├── Projects/       # Project-related views
│   └── Common/         # Reusable views
├── ViewModels/         # MVVM view models
├── Models/             # Data models
├── Services/           # API and business logic services
├── Utilities/          # Helper functions and extensions
├── Resources/          # Assets, localizations
└── Supporting Files/   # Info.plist, etc.
```

### SwiftUI Architecture Pattern
```swift
// MVVM Architecture with SwiftUI
import SwiftUI
import Combine

// Model
struct Task: Identifiable, Codable {
    let id: UUID
    var title: String
    var description: String
    var isCompleted: Bool
    var dueDate: Date?
}

// ViewModel
class TaskListViewModel: ObservableObject {
    @Published var tasks: [Task] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let taskService: TaskService
    private var cancellables = Set<AnyCancellable>()
    
    init(taskService: TaskService = TaskService()) {
        self.taskService = taskService
        loadTasks()
    }
    
    func loadTasks() {
        isLoading = true
        taskService.fetchTasks()
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] tasks in
                    self?.tasks = tasks
                }
            )
            .store(in: &cancellables)
    }
    
    func addTask(_ task: Task) {
        taskService.createTask(task)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { completion in
                    // Handle completion
                },
                receiveValue: { [weak self] newTask in
                    self?.tasks.append(newTask)
                }
            )
            .store(in: &cancellables)
    }
}

// View
struct TaskListView: View {
    @StateObject private var viewModel = TaskListViewModel()
    @State private var showingAddTask = false
    
    var body: some View {
        NavigationView {
            List {
                ForEach(viewModel.tasks) { task in
                    TaskRowView(task: task)
                }
                .onDelete(perform: deleteTask)
            }
            .navigationTitle("Tasks")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Add") {
                        showingAddTask = true
                    }
                }
            }
            .sheet(isPresented: $showingAddTask) {
                AddTaskView()
            }
            .refreshable {
                viewModel.loadTasks()
            }
        }
    }
    
    private func deleteTask(at offsets: IndexSet) {
        // Handle task deletion
    }
}
```

## Android Native Architecture (Kotlin/Jetpack Compose)

### Project Structure
```
app/src/main/java/com/example/taskapp/
├── ui/                 # UI components and screens
│   ├── tasks/          # Task-related UI
│   ├── projects/       # Project-related UI
│   └── common/         # Reusable UI components
├── viewmodel/          # ViewModels for MVVM
├── data/               # Data layer
│   ├── repository/     # Repository pattern
│   ├── local/          # Local database (Room)
│   └── remote/         # API services (Retrofit)
├── domain/             # Business logic and use cases
├── di/                 # Dependency injection (Hilt)
└── util/               # Utility classes
```

### Jetpack Compose Architecture
```kotlin
// ViewModel with Compose
class TaskListViewModel @Inject constructor(
    private val taskRepository: TaskRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(TaskListUiState())
    val uiState: StateFlow<TaskListUiState> = _uiState.asStateFlow()
    
    init {
        loadTasks()
    }
    
    fun loadTasks() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            try {
                val tasks = taskRepository.getTasks()
                _uiState.value = _uiState.value.copy(
                    tasks = tasks,
                    isLoading = false
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = e.message
                )
            }
        }
    }
    
    fun addTask(task: Task) {
        viewModelScope.launch {
            try {
                val newTask = taskRepository.createTask(task)
                val currentTasks = _uiState.value.tasks
                _uiState.value = _uiState.value.copy(
                    tasks = currentTasks + newTask
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    errorMessage = e.message
                )
            }
        }
    }
}

// Compose UI
@Composable
fun TaskListScreen(
    viewModel: TaskListViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var showAddTask by remember { mutableStateOf(false) }
    
    Column {
        TopAppBar(
            title = { Text("Tasks") },
            actions = {
                IconButton(onClick = { showAddTask = true }) {
                    Icon(Icons.Default.Add, contentDescription = "Add Task")
                }
            }
        )
        
        when {
            uiState.isLoading -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            }
            uiState.errorMessage != null -> {
                ErrorMessage(
                    message = uiState.errorMessage!!,
                    onRetry = { viewModel.loadTasks() }
                )
            }
            else -> {
                LazyColumn {
                    items(uiState.tasks) { task ->
                        TaskItem(
                            task = task,
                            onTaskClick = { /* Navigate to task detail */ },
                            onTaskComplete = { viewModel.toggleTaskComplete(task.id) }
                        )
                    }
                }
            }
        }
    }
    
    if (showAddTask) {
        AddTaskDialog(
            onDismiss = { showAddTask = false },
            onTaskAdd = { task ->
                viewModel.addTask(task)
                showAddTask = false
            }
        )
    }
}
```
```

### Mobile Performance Architecture
```markdown
## Performance Optimization Strategy

### Memory Management
#### React Native Memory Optimization
```typescript
// Image optimization
import FastImage from 'react-native-fast-image';

function TaskImage({ imageUrl, priority = 'normal' }) {
  return (
    <FastImage
      style={{ width: 100, height: 100 }}
      source={{
        uri: imageUrl,
        priority: FastImage.priority[priority],
        cache: FastImage.cacheControl.immutable,
      }}
      resizeMode={FastImage.resizeMode.cover}
    />
  );
}

// List optimization with FlatList
import { FlatList, memo } from 'react-native';

const TaskItem = memo(({ task, onPress }) => (
  <TouchableOpacity onPress={() => onPress(task.id)}>
    <Text>{task.title}</Text>
  </TouchableOpacity>
));

function TaskList({ tasks }) {
  const renderItem = useCallback(({ item }) => (
    <TaskItem task={item} onPress={handleTaskPress} />
  ), [handleTaskPress]);

  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <FlatList
      data={tasks}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
      getItemLayout={(data, index) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
      })}
    />
  );
}
```

#### Native Performance Optimization
```swift
// iOS: Efficient table view with cell reuse
class TaskTableViewCell: UITableViewCell {
    static let identifier = "TaskTableViewCell"
    
    override func prepareForReuse() {
        super.prepareForReuse()
        // Reset cell state
        titleLabel.text = nil
        imageView?.image = nil
    }
}

class TaskListViewController: UIViewController {
    @IBOutlet weak var tableView: UITableView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Register cell for reuse
        tableView.register(TaskTableViewCell.self, 
                          forCellReuseIdentifier: TaskTableViewCell.identifier)
        
        // Enable prefetching for better performance
        tableView.prefetchDataSource = self
    }
}

extension TaskListViewController: UITableViewDataSourcePrefetching {
    func tableView(_ tableView: UITableView, prefetchRowsAt indexPaths: [IndexPath]) {
        // Prefetch data for upcoming cells
        let tasks = indexPaths.compactMap { tasks[safe: $0.row] }
        imageLoader.prefetchImages(for: tasks)
    }
}
```

### Battery Optimization
```typescript
// React Native battery optimization
import BackgroundTimer from 'react-native-background-timer';
import NetInfo from '@react-native-netinfo/netinfo';

class BackgroundSyncService {
  private syncInterval: number | null = null;
  
  startBackgroundSync() {
    // Only sync when connected to WiFi to save battery
    NetInfo.addEventListener(state => {
      if (state.isConnected && state.type === 'wifi') {
        this.enableSync();
      } else {
        this.disableSync();
      }
    });
  }
  
  private enableSync() {
    if (this.syncInterval) return;
    
    // Sync every 5 minutes when on WiFi
    this.syncInterval = BackgroundTimer.setInterval(() => {
      this.syncData();
    }, 5 * 60 * 1000);
  }
  
  private disableSync() {
    if (this.syncInterval) {
      BackgroundTimer.clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
  
  private async syncData() {
    try {
      // Batch multiple operations to reduce network calls
      const [tasks, projects, notifications] = await Promise.all([
        this.syncTasks(),
        this.syncProjects(),
        this.syncNotifications(),
      ]);
      
      // Update local storage
      await this.updateLocalData({ tasks, projects, notifications });
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }
}
```
```

### Mobile Security Architecture
```markdown
## Mobile-Specific Security Implementation

### Secure Storage
#### React Native Secure Storage
```typescript
import EncryptedStorage from 'react-native-encrypted-storage';
import Keychain from 'react-native-keychain';

class SecureStorageService {
  // Store sensitive data with encryption
  async storeSecureData(key: string, value: string) {
    try {
      await EncryptedStorage.setItem(key, value);
    } catch (error) {
      console.error('Failed to store secure data:', error);
    }
  }
  
  async getSecureData(key: string): Promise<string | null> {
    try {
      return await EncryptedStorage.getItem(key);
    } catch (error) {
      console.error('Failed to retrieve secure data:', error);
      return null;
    }
  }
  
  // Store credentials in keychain (iOS) or keystore (Android)
  async storeCredentials(username: string, password: string) {
    try {
      await Keychain.setCredentials('TaskApp', username, password);
    } catch (error) {
      console.error('Failed to store credentials:', error);
    }
  }
  
  async getCredentials() {
    try {
      const credentials = await Keychain.getCredentials('TaskApp');
      return credentials;
    } catch (error) {
      console.error('Failed to retrieve credentials:', error);
      return null;
    }
  }
}
```

#### Biometric Authentication
```typescript
import TouchID from 'react-native-touch-id';

class BiometricAuthService {
  async isBiometricAvailable(): Promise<boolean> {
    try {
      const biometryType = await TouchID.isSupported();
      return biometryType !== false;
    } catch (error) {
      return false;
    }
  }
  
  async authenticateWithBiometric(): Promise<boolean> {
    try {
      await TouchID.authenticate('Authenticate to access your tasks', {
        title: 'Authentication Required',
        subtitle: 'Use your biometric to unlock the app',
        description: 'Place your finger on the sensor or look at the camera',
        fallbackLabel: 'Use Passcode',
        cancelLabel: 'Cancel',
      });
      return true;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }
}

// Usage in login flow
function LoginScreen() {
  const [showBiometric, setShowBiometric] = useState(false);
  
  useEffect(() => {
    checkBiometricAvailability();
  }, []);
  
  const checkBiometricAvailability = async () => {
    const isAvailable = await biometricAuth.isBiometricAvailable();
    setShowBiometric(isAvailable);
  };
  
  const handleBiometricLogin = async () => {
    const success = await biometricAuth.authenticateWithBiometric();
    if (success) {
      // Proceed with login
      navigation.navigate('Main');
    }
  };
  
  return (
    <View>
      {showBiometric && (
        <TouchableOpacity onPress={handleBiometricLogin}>
          <Text>Login with Biometric</Text>
        </TouchableOpacity>
      )}
      {/* Regular login form */}
    </View>
  );
}
```

### Certificate Pinning
```typescript
// React Native certificate pinning
import { NetworkingModule } from 'react-native';

class SecureNetworkService {
  constructor() {
    // Configure certificate pinning
    this.configureCertificatePinning();
  }
  
  private configureCertificatePinning() {
    // Pin specific certificates or public keys
    const pinnedCertificates = {
      'api.example.com': [
        'sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
        'sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=',
      ],
    };
    
    NetworkingModule.addCertificatePinner(pinnedCertificates);
  }
  
  async makeSecureRequest(url: string, options: RequestInit) {
    try {
      const response = await fetch(url, {
        ...options,
        // Additional security headers
        headers: {
          ...options.headers,
          'X-Requested-With': 'TaskApp',
          'User-Agent': 'TaskApp/1.0.0',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      if (error.message.includes('certificate')) {
        // Handle certificate pinning failure
        console.error('Certificate pinning failed:', error);
        throw new Error('Security validation failed');
      }
      throw error;
    }
  }
}
```
```

This mobile-specific architecture builds upon the platform-agnostic foundation to create robust, performant, and secure mobile applications that follow platform-specific best practices and conventions.

## Next Steps
- **Stage 04 - Features**: Mobile-specific feature implementation planning
- **Device Testing Strategy**: Establish device testing matrix and procedures
- **Performance Baseline**: Mobile performance benchmarks and monitoring
- **App Store Preparation**: App store requirements and submission planning