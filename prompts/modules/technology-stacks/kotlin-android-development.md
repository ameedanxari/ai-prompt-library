# Kotlin Android Development Template

## Purpose

This template provides comprehensive patterns for building modern Android applications using Kotlin, including Jetpack Compose, Android Architecture Components, Coroutines, Room database, Retrofit networking, and Android-specific features. It covers enterprise-scale Android development with advanced architecture patterns, performance optimization, and platform-specific best practices.

## Context

Kotlin is Google's preferred language for Android development, offering null safety, conciseness, and full interoperability with Java. This template addresses contemporary Android development including Jetpack Compose declarative UI, Kotlin Coroutines for asynchronous programming, MVVM architecture with LiveData/StateFlow, Room for local persistence, and modern Android development practices with comprehensive testing strategies.

## Examples

### Example 1: Jetpack Compose App with MVVM Architecture
```kotlin
// build.gradle.kts (Module: app)
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("kotlin-kapt")
    id("dagger.hilt.android.plugin")
    id("kotlin-parcelize")
}

android {
    namespace = "com.example.myapp"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.example.myapp"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
    
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
    
    kotlinOptions {
        jvmTarget = "1.8"
    }
    
    buildFeatures {
        compose = true
    }
    
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }
    
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation("androidx.activity:activity-compose:1.8.2")
    implementation(platform("androidx.compose:compose-bom:2024.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    
    // Navigation
    implementation("androidx.navigation:navigation-compose:2.7.6")
    
    // ViewModel
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")
    
    // Hilt
    implementation("com.google.dagger:hilt-android:2.48")
    kapt("com.google.dagger:hilt-compiler:2.48")
    implementation("androidx.hilt:hilt-navigation-compose:1.1.0")
    
    // Room
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    kapt("androidx.room:room-compiler:2.6.1")
    
    // Retrofit
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    
    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
    
    // Image loading
    implementation("io.coil-kt:coil-compose:2.5.0")
    
    // Testing
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
    androidTestImplementation(platform("androidx.compose:compose-bom:2024.02.00"))
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}

// Data Models
@Parcelize
data class User(
    val id: String,
    val name: String,
    val email: String,
    val avatarUrl: String? = null,
    val createdAt: Long = System.currentTimeMillis()
) : Parcelable

data class ApiResponse<T>(
    val data: T,
    val message: String,
    val success: Boolean
)

// Network Layer
interface ApiService {
    @GET("users")
    suspend fun getUsers(): ApiResponse<List<User>>
    
    @POST("users")
    suspend fun createUser(@Body user: User): ApiResponse<User>
    
    @PUT("users/{id}")
    suspend fun updateUser(@Path("id") id: String, @Body user: User): ApiResponse<User>
    
    @DELETE("users/{id}")
    suspend fun deleteUser(@Path("id") id: String): ApiResponse<Unit>
}

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    
    @Provides
    @Singleton
    fun provideOkHttpClient(): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor(HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            })
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()
    }
    
    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit {
        return Retrofit.Builder()
            .baseUrl("https://api.example.com/v1/")
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
    
    @Provides
    @Singleton
    fun provideApiService(retrofit: Retrofit): ApiService {
        return retrofit.create(ApiService::class.java)
    }
}

// Repository Pattern
interface UserRepository {
    suspend fun getUsers(): Flow<Result<List<User>>>
    suspend fun createUser(user: User): Result<User>
    suspend fun updateUser(user: User): Result<User>
    suspend fun deleteUser(userId: String): Result<Unit>
    fun getUsersFromCache(): Flow<List<User>>
}

@Singleton
class UserRepositoryImpl @Inject constructor(
    private val apiService: ApiService,
    private val userDao: UserDao
) : UserRepository {
    
    override suspend fun getUsers(): Flow<Result<List<User>>> = flow {
        try {
            emit(Result.Loading)
            val response = apiService.getUsers()
            if (response.success) {
                // Cache users locally
                userDao.insertUsers(response.data.map { it.toEntity() })
                emit(Result.Success(response.data))
            } else {
                emit(Result.Error(Exception(response.message)))
            }
        } catch (e: Exception) {
            // Return cached data on network error
            val cachedUsers = userDao.getAllUsers().first().map { it.toUser() }
            if (cachedUsers.isNotEmpty()) {
                emit(Result.Success(cachedUsers))
            } else {
                emit(Result.Error(e))
            }
        }
    }
    
    override suspend fun createUser(user: User): Result<User> {
        return try {
            val response = apiService.createUser(user)
            if (response.success) {
                userDao.insertUser(response.data.toEntity())
                Result.Success(response.data)
            } else {
                Result.Error(Exception(response.message))
            }
        } catch (e: Exception) {
            Result.Error(e)
        }
    }
    
    override suspend fun updateUser(user: User): Result<User> {
        return try {
            val response = apiService.updateUser(user.id, user)
            if (response.success) {
                userDao.updateUser(response.data.toEntity())
                Result.Success(response.data)
            } else {
                Result.Error(Exception(response.message))
            }
        } catch (e: Exception) {
            Result.Error(e)
        }
    }
    
    override suspend fun deleteUser(userId: String): Result<Unit> {
        return try {
            val response = apiService.deleteUser(userId)
            if (response.success) {
                userDao.deleteUser(userId)
                Result.Success(Unit)
            } else {
                Result.Error(Exception(response.message))
            }
        } catch (e: Exception) {
            Result.Error(e)
        }
    }
    
    override fun getUsersFromCache(): Flow<List<User>> {
        return userDao.getAllUsers().map { entities ->
            entities.map { it.toUser() }
        }
    }
}

// Result sealed class
sealed class Result<out T> {
    object Loading : Result<Nothing>()
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val exception: Exception) : Result<Nothing>()
}

// ViewModel
@HiltViewModel
class UserListViewModel @Inject constructor(
    private val userRepository: UserRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(UserListUiState())
    val uiState: StateFlow<UserListUiState> = _uiState.asStateFlow()
    
    init {
        loadUsers()
        observeCachedUsers()
    }
    
    fun loadUsers() {
        viewModelScope.launch {
            userRepository.getUsers().collect { result ->
                when (result) {
                    is Result.Loading -> {
                        _uiState.update { it.copy(isLoading = true, error = null) }
                    }
                    is Result.Success -> {
                        _uiState.update { 
                            it.copy(
                                users = result.data,
                                isLoading = false,
                                error = null
                            )
                        }
                    }
                    is Result.Error -> {
                        _uiState.update { 
                            it.copy(
                                isLoading = false,
                                error = result.exception.message
                            )
                        }
                    }
                }
            }
        }
    }
    
    private fun observeCachedUsers() {
        viewModelScope.launch {
            userRepository.getUsersFromCache().collect { cachedUsers ->
                if (_uiState.value.users.isEmpty() && cachedUsers.isNotEmpty()) {
                    _uiState.update { it.copy(users = cachedUsers) }
                }
            }
        }
    }
    
    fun createUser(name: String, email: String) {
        viewModelScope.launch {
            val newUser = User(
                id = UUID.randomUUID().toString(),
                name = name,
                email = email
            )
            
            when (val result = userRepository.createUser(newUser)) {
                is Result.Success -> {
                    _uiState.update { 
                        it.copy(users = it.users + result.data)
                    }
                }
                is Result.Error -> {
                    _uiState.update { 
                        it.copy(error = result.exception.message)
                    }
                }
                else -> {}
            }
        }
    }
    
    fun deleteUser(user: User) {
        viewModelScope.launch {
            when (val result = userRepository.deleteUser(user.id)) {
                is Result.Success -> {
                    _uiState.update { 
                        it.copy(users = it.users.filter { u -> u.id != user.id })
                    }
                }
                is Result.Error -> {
                    _uiState.update { 
                        it.copy(error = result.exception.message)
                    }
                }
                else -> {}
            }
        }
    }
    
    fun clearError() {
        _uiState.update { it.copy(error = null) }
    }
}

data class UserListUiState(
    val users: List<User> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null
)

// Compose UI
@Composable
fun UserListScreen(
    viewModel: UserListViewModel = hiltViewModel(),
    onNavigateToAddUser: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    
    LaunchedEffect(Unit) {
        viewModel.loadUsers()
    }
    
    UserListContent(
        uiState = uiState,
        onRefresh = { viewModel.loadUsers() },
        onDeleteUser = { viewModel.deleteUser(it) },
        onAddUser = onNavigateToAddUser,
        onClearError = { viewModel.clearError() }
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UserListContent(
    uiState: UserListUiState,
    onRefresh: () -> Unit,
    onDeleteUser: (User) -> Unit,
    onAddUser: () -> Unit,
    onClearError: () -> Unit
) {
    val pullRefreshState = rememberPullRefreshState(
        refreshing = uiState.isLoading,
        onRefresh = onRefresh
    )
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Users") },
                actions = {
                    IconButton(onClick = onAddUser) {
                        Icon(Icons.Default.Add, contentDescription = "Add User")
                    }
                }
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .pullRefresh(pullRefreshState)
        ) {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(
                    items = uiState.users,
                    key = { it.id }
                ) { user ->
                    UserItem(
                        user = user,
                        onDelete = { onDeleteUser(user) },
                        modifier = Modifier.animateItemPlacement()
                    )
                }
            }
            
            PullRefreshIndicator(
                refreshing = uiState.isLoading,
                state = pullRefreshState,
                modifier = Modifier.align(Alignment.TopCenter)
            )
            
            if (uiState.users.isEmpty() && !uiState.isLoading) {
                EmptyState(
                    modifier = Modifier.align(Alignment.Center)
                )
            }
        }
    }
    
    // Error handling
    uiState.error?.let { error ->
        LaunchedEffect(error) {
            // Show snackbar or dialog
            onClearError()
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UserItem(
    user: User,
    onDelete: () -> Unit,
    modifier: Modifier = Modifier
) {
    var showDeleteDialog by remember { mutableStateOf(false) }
    
    Card(
        modifier = modifier.fillMaxWidth(),
        onClick = { /* Navigate to user details */ }
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            AsyncImage(
                model = user.avatarUrl,
                contentDescription = "User Avatar",
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape),
                placeholder = painterResource(R.drawable.ic_person_placeholder),
                error = painterResource(R.drawable.ic_person_placeholder)
            )
            
            Spacer(modifier = Modifier.width(16.dp))
            
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = user.name,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = user.email,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = "Created: ${formatDate(user.createdAt)}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            
            IconButton(onClick = { showDeleteDialog = true }) {
                Icon(
                    Icons.Default.Delete,
                    contentDescription = "Delete User",
                    tint = MaterialTheme.colorScheme.error
                )
            }
        }
    }
    
    if (showDeleteDialog) {
        AlertDialog(
            onDismissRequest = { showDeleteDialog = false },
            title = { Text("Delete User") },
            text = { Text("Are you sure you want to delete ${user.name}?") },
            confirmButton = {
                TextButton(
                    onClick = {
                        onDelete()
                        showDeleteDialog = false
                    }
                ) {
                    Text("Delete")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
fun EmptyState(
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            Icons.Default.Person,
            contentDescription = null,
            modifier = Modifier.size(64.dp),
            tint = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = "No users found",
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Text(
            text = "Add a user to get started",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

private fun formatDate(timestamp: Long): String {
    val formatter = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault())
    return formatter.format(Date(timestamp))
}
```

### Example 2: Room Database with Coroutines
```kotlin
// Database Entities
@Entity(tableName = "users")
data class UserEntity(
    @PrimaryKey val id: String,
    val name: String,
    val email: String,
    val avatarUrl: String?,
    val createdAt: Long,
    val updatedAt: Long = System.currentTimeMillis()
)

// DAO
@Dao
interface UserDao {
    @Query("SELECT * FROM users ORDER BY createdAt DESC")
    fun getAllUsers(): Flow<List<UserEntity>>
    
    @Query("SELECT * FROM users WHERE id = :id")
    suspend fun getUserById(id: String): UserEntity?
    
    @Query("SELECT * FROM users WHERE name LIKE :query OR email LIKE :query")
    fun searchUsers(query: String): Flow<List<UserEntity>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUser(user: UserEntity)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUsers(users: List<UserEntity>)
    
    @Update
    suspend fun updateUser(user: UserEntity)
    
    @Query("DELETE FROM users WHERE id = :id")
    suspend fun deleteUser(id: String)
    
    @Query("DELETE FROM users")
    suspend fun deleteAllUsers()
}

// Database
@Database(
    entities = [UserEntity::class],
    version = 1,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
}

// Type Converters
class Converters {
    @TypeConverter
    fun fromTimestamp(value: Long?): Date? {
        return value?.let { Date(it) }
    }
    
    @TypeConverter
    fun dateToTimestamp(date: Date?): Long? {
        return date?.time
    }
}

// Database Module
@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {
    
    @Provides
    @Singleton
    fun provideAppDatabase(@ApplicationContext context: Context): AppDatabase {
        return Room.databaseBuilder(
            context,
            AppDatabase::class.java,
            "app_database"
        )
        .fallbackToDestructiveMigration()
        .build()
    }
    
    @Provides
    fun provideUserDao(database: AppDatabase): UserDao {
        return database.userDao()
    }
}

// Extension functions for mapping
fun User.toEntity(): UserEntity {
    return UserEntity(
        id = id,
        name = name,
        email = email,
        avatarUrl = avatarUrl,
        createdAt = createdAt
    )
}

fun UserEntity.toUser(): User {
    return User(
        id = id,
        name = name,
        email = email,
        avatarUrl = avatarUrl,
        createdAt = createdAt
    )
}
```

### Example 3: Advanced Compose UI with State Management
```kotlin
// Complex UI State Management
@Composable
fun SearchableUserList(
    viewModel: UserListViewModel = hiltViewModel()
) {
    var searchQuery by remember { mutableStateOf("") }
    var isSearchActive by remember { mutableStateOf(false) }
    val uiState by viewModel.uiState.collectAsState()
    
    val filteredUsers = remember(uiState.users, searchQuery) {
        if (searchQuery.isBlank()) {
            uiState.users
        } else {
            uiState.users.filter { user ->
                user.name.contains(searchQuery, ignoreCase = true) ||
                user.email.contains(searchQuery, ignoreCase = true)
            }
        }
    }
    
    Column {
        SearchBar(
            query = searchQuery,
            onQueryChange = { searchQuery = it },
            onSearch = { isSearchActive = false },
            active = isSearchActive,
            onActiveChange = { isSearchActive = it },
            placeholder = { Text("Search users...") },
            leadingIcon = {
                Icon(Icons.Default.Search, contentDescription = "Search")
            },
            trailingIcon = {
                if (searchQuery.isNotEmpty()) {
                    IconButton(onClick = { searchQuery = "" }) {
                        Icon(Icons.Default.Clear, contentDescription = "Clear")
                    }
                }
            }
        ) {
            // Search suggestions can go here
        }
        
        LazyColumn(
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(
                items = filteredUsers,
                key = { it.id }
            ) { user ->
                UserItem(
                    user = user,
                    onDelete = { viewModel.deleteUser(user) },
                    modifier = Modifier.animateItemPlacement()
                )
            }
        }
    }
}

// Custom Composables
@Composable
fun LoadingButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    isLoading: Boolean = false,
    content: @Composable RowScope.() -> Unit
) {
    Button(
        onClick = onClick,
        modifier = modifier,
        enabled = enabled && !isLoading
    ) {
        if (isLoading) {
            CircularProgressIndicator(
                modifier = Modifier.size(16.dp),
                strokeWidth = 2.dp
            )
            Spacer(modifier = Modifier.width(8.dp))
        }
        content()
    }
}

// Theme and Styling
@Composable
fun MyAppTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }
    
    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}

private val DarkColorScheme = darkColorScheme(
    primary = Purple80,
    secondary = PurpleGrey80,
    tertiary = Pink80
)

private val LightColorScheme = lightColorScheme(
    primary = Purple40,
    secondary = PurpleGrey40,
    tertiary = Pink40
)
```

## Instructions

### 1. Set Up Android Development Environment

```bash
# Install Android Studio
# Download from https://developer.android.com/studio

# Install Android SDK and tools through Android Studio
# SDK Manager -> Install latest Android SDK and build tools

# Set up emulator or connect physical device
# AVD Manager -> Create Virtual Device

# Enable developer options on physical device
# Settings -> About phone -> Tap build number 7 times
# Settings -> Developer options -> Enable USB debugging
```

### 2. Create New Android Project

```kotlin
// Create new project in Android Studio
// File -> New -> New Project -> Empty Compose Activity
// Choose Kotlin language and minimum SDK 24

// gradle/libs.versions.toml (Version Catalog)
[versions]
agp = "8.2.2"
kotlin = "1.9.22"
coreKtx = "1.12.0"
junit = "4.13.2"
junitVersion = "1.1.5"
espressoCore = "3.5.1"
lifecycleRuntimeKtx = "2.7.0"
activityCompose = "1.8.2"
composeBom = "2024.02.00"
hilt = "2.48"
room = "2.6.1"
retrofit = "2.9.0"
coroutines = "1.7.3"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-ui-tooling = { group = "androidx.compose.ui", name = "ui-tooling" }
androidx-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
androidx-ui-test-manifest = { group = "androidx.compose.ui", name = "ui-test-manifest" }
androidx-ui-test-junit4 = { group = "androidx.compose.ui", name = "ui-test-junit4" }
androidx-material3 = { group = "androidx.compose.material3", name = "material3" }

[plugins]
androidApplication = { id = "com.android.application", version.ref = "agp" }
jetbrainsKotlinAndroid = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
```

### 3. Implement Navigation with Compose

```kotlin
// Navigation setup
@Composable
fun MyAppNavigation() {
    val navController = rememberNavController()
    
    NavHost(
        navController = navController,
        startDestination = "user_list"
    ) {
        composable("user_list") {
            UserListScreen(
                onNavigateToAddUser = {
                    navController.navigate("add_user")
                },
                onNavigateToUserDetail = { userId ->
                    navController.navigate("user_detail/$userId")
                }
            )
        }
        
        composable("add_user") {
            AddUserScreen(
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }
        
        composable(
            "user_detail/{userId}",
            arguments = listOf(navArgument("userId") { type = NavType.StringType })
        ) { backStackEntry ->
            val userId = backStackEntry.arguments?.getString("userId") ?: ""
            UserDetailScreen(
                userId = userId,
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }
    }
}

// Deep linking
@Composable
fun MyAppNavigation() {
    val navController = rememberNavController()
    
    NavHost(
        navController = navController,
        startDestination = "user_list"
    ) {
        composable(
            "user_detail/{userId}",
            arguments = listOf(navArgument("userId") { type = NavType.StringType }),
            deepLinks = listOf(navDeepLink { uriPattern = "myapp://user/{userId}" })
        ) { backStackEntry ->
            val userId = backStackEntry.arguments?.getString("userId") ?: ""
            UserDetailScreen(userId = userId)
        }
    }
}
```

### 4. Implement Background Processing

```kotlin
// WorkManager for background tasks
@HiltWorker
class SyncUsersWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted workerParams: WorkerParameters,
    private val userRepository: UserRepository
) : CoroutineWorker(context, workerParams) {
    
    override suspend fun doWork(): Result {
        return try {
            userRepository.syncUsers()
            Result.success()
        } catch (e: Exception) {
            if (runAttemptCount < 3) {
                Result.retry()
            } else {
                Result.failure()
            }
        }
    }
    
    @AssistedFactory
    interface Factory {
        fun create(context: Context, params: WorkerParameters): SyncUsersWorker
    }
}

// Schedule periodic work
class WorkManagerModule {
    fun schedulePeriodicSync(context: Context) {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .setRequiresBatteryNotLow(true)
            .build()
        
        val syncRequest = PeriodicWorkRequestBuilder<SyncUsersWorker>(
            15, TimeUnit.MINUTES
        )
        .setConstraints(constraints)
        .build()
        
        WorkManager.getInstance(context).enqueueUniquePeriodicWork(
            "sync_users",
            ExistingPeriodicWorkPolicy.KEEP,
            syncRequest
        )
    }
}
```

## Implementation Patterns

### Clean Architecture with MVVM

```kotlin
// Domain Layer - Use Cases
class GetUsersUseCase @Inject constructor(
    private val userRepository: UserRepository
) {
    suspend operator fun invoke(): Flow<Result<List<User>>> {
        return userRepository.getUsers()
    }
}

// Simple ViewModel example
class SimpleUserViewModel : ViewModel() {
    private val _users = MutableLiveData<List<User>>()
    val users: LiveData<List<User>> = _users
}

class CreateUserUseCase @Inject constructor(
    private val userRepository: UserRepository
) {
    suspend operator fun invoke(): Flow<Result<List<User>>> {
        return userRepository.getUsers()
    }
}

class CreateUserUseCase @Inject constructor(
    private val userRepository: UserRepository
) {
    suspend operator fun invoke(user: User): Result<User> {
        return userRepository.createUser(user)
    }
}

// Presentation Layer - ViewModel with Use Cases
@HiltViewModel
class UserListViewModel @Inject constructor(
    private val getUsersUseCase: GetUsersUseCase,
    private val createUserUseCase: CreateUserUseCase,
    private val deleteUserUseCase: DeleteUserUseCase
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(UserListUiState())
    val uiState: StateFlow<UserListUiState> = _uiState.asStateFlow()
    
    fun loadUsers() {
        viewModelScope.launch {
            getUsersUseCase().collect { result ->
                _uiState.update { currentState ->
                    when (result) {
                        is Result.Loading -> currentState.copy(isLoading = true)
                        is Result.Success -> currentState.copy(
                            users = result.data,
                            isLoading = false,
                            error = null
                        )
                        is Result.Error -> currentState.copy(
                            isLoading = false,
                            error = result.exception.message
                        )
                    }
                }
            }
        }
    }
}
```

### Dependency Injection with Hilt

```kotlin
// Application class
@HiltAndroidApp
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        // Initialize other libraries
    }
}

// Repository binding
@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {
    
    @Binds
    abstract fun bindUserRepository(
        userRepositoryImpl: UserRepositoryImpl
    ): UserRepository
}

// Qualifiers for different implementations
@Qualifier
@Retention(AnnotationRetention.BINARY)
annotation class LocalDataSource

@Qualifier
@Retention(AnnotationRetention.BINARY)
annotation class RemoteDataSource

@Module
@InstallIn(SingletonComponent::class)
object DataSourceModule {
    
    @Provides
    @LocalDataSource
    fun provideLocalUserDataSource(userDao: UserDao): UserDataSource {
        return LocalUserDataSource(userDao)
    }
    
    @Provides
    @RemoteDataSource
    fun provideRemoteUserDataSource(apiService: ApiService): UserDataSource {
        return RemoteUserDataSource(apiService)
    }
}
```

## Expected Output

### Android App Features
- Native Android user interface with Material Design 3
- Smooth animations and transitions with Jetpack Compose
- Responsive design for different screen sizes and orientations
- Integration with Android system features (notifications, camera, etc.)
- Offline capability with Room database
- Background synchronization with WorkManager

### Performance Characteristics
- 60 FPS smooth scrolling and animations
- Efficient memory usage with lifecycle-aware components
- Background processing with Kotlin Coroutines
- Optimized image loading and caching with Coil
- Battery-efficient networking and background tasks

### User Experience
- Material Design 3 components and theming
- Accessibility support with TalkBack
- Dark mode and light mode support
- Haptic feedback integration
- Intuitive navigation patterns

## Integration Points

Kotlin Android applications integrate with Google's Jetpack libraries, Firebase services, and third-party SDKs through Gradle dependency management. The language provides seamless interoperability with Java libraries, enabling access to the vast Android ecosystem. Integration with system features like camera, location, notifications, and biometric authentication is straightforward through Android APIs. Retrofit and OkHttp facilitate REST API integration, while Room provides type-safe database access with compile-time verification.

```kotlin
// Example integration patterns
import retrofit2.Retrofit
import androidx.room.Room
import com.google.firebase.messaging.FirebaseMessaging

// Retrofit API client
val retrofit = Retrofit.Builder()
    .baseUrl("https://api.example.com/")
    .addConverterFactory(GsonConverterFactory.create())
    .build()

// Room database
val db = Room.databaseBuilder(context, AppDatabase::class.java, "database").build()

// Firebase Cloud Messaging
FirebaseMessaging.getInstance().subscribeToTopic("updates")
```

### Android System Integration
```kotlin
// Permissions handling
@Composable
fun RequestPermissionExample() {
    val launcher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            // Permission granted
        } else {
            // Permission denied
        }
    }
    
    Button(
        onClick = {
            launcher.launch(Manifest.permission.CAMERA)
        }
    ) {
        Text("Request Camera Permission")
    }
}

// Camera integration
@Composable
fun CameraCapture() {
    val context = LocalContext.current
    val launcher = rememberLauncherForActivityResult(
        ActivityResultContracts.TakePicturePreview()
    ) { bitmap ->
        // Handle captured image
    }
    
    Button(
        onClick = {
            launcher.launch(null)
        }
    ) {
        Text("Take Photo")
    }
}

// Notifications
class NotificationHelper(private val context: Context) {
    
    fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "User Updates",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Notifications for user updates"
            }
            
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }
    
    fun showNotification(title: String, content: String) {
        val builder = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(title)
            .setContentText(content)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)
        
        with(NotificationManagerCompat.from(context)) {
            notify(NOTIFICATION_ID, builder.build())
        }
    }
    
    companion object {
        private const val CHANNEL_ID = "user_updates"
        private const val NOTIFICATION_ID = 1
    }
}
```

### Third-Party Integration
```kotlin
// Image loading with Coil
@Composable
fun AsyncImageExample(imageUrl: String) {
    AsyncImage(
        model = ImageRequest.Builder(LocalContext.current)
            .data(imageUrl)
            .crossfade(true)
            .build(),
        placeholder = painterResource(R.drawable.placeholder),
        error = painterResource(R.drawable.error),
        contentDescription = "User Avatar",
        contentScale = ContentScale.Crop,
        modifier = Modifier
            .size(64.dp)
            .clip(CircleShape)
    )
}
```

## Security Considerations

Android security encompasses encrypted storage with EncryptedSharedPreferences, biometric authentication, network security with certificate pinning, and ProGuard/R8 code obfuscation. Kotlin's null safety prevents null pointer exceptions, while sealed classes and when expressions ensure exhaustive handling of states. Security best practices include input validation, secure API communication with HTTPS, proper permission handling, and following Android's security guidelines for data protection and user privacy.

### Data Protection
```kotlin
// Encrypted SharedPreferences
class SecurePreferences @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val sharedPreferences by lazy {
        EncryptedSharedPreferences.create(
            "secure_prefs",
            MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC),
            context,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }
    
    fun saveSecureData(key: String, value: String) {
        sharedPreferences.edit().putString(key, value).apply()
    }
    
    fun getSecureData(key: String): String? {
        return sharedPreferences.getString(key, null)
    }
}

// Biometric authentication
class BiometricAuthManager(private val context: Context) {
    
    fun authenticate(
        onSuccess: () -> Unit,
        onError: (String) -> Unit
    ) {
        val biometricPrompt = BiometricPrompt(
            context as FragmentActivity,
            ContextCompat.getMainExecutor(context),
            object : BiometricPrompt.AuthenticationCallback() {
                override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                    super.onAuthenticationSucceeded(result)
                    onSuccess()
                }
                
                override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                    super.onAuthenticationError(errorCode, errString)
                    onError(errString.toString())
                }
            }
        )
        
        val promptInfo = BiometricPrompt.PromptInfo.Builder()
            .setTitle("Biometric Authentication")
            .setSubtitle("Use your fingerprint to authenticate")
            .setNegativeButtonText("Cancel")
            .build()
        
        biometricPrompt.authenticate(promptInfo)
    }
}
```

## Performance Features

Kotlin Android apps achieve high performance through efficient coroutines for asynchronous operations, Jetpack Compose's optimized rendering engine, and lifecycle-aware components that prevent memory leaks. Performance optimization includes lazy loading with Paging 3, image caching with Coil, database query optimization with Room, and background processing with WorkManager. The language's inline functions and reified generics eliminate runtime overhead, while R8 code shrinking reduces APK size.

### Memory Management
```kotlin
// Efficient list handling with Paging 3
@HiltViewModel
class PagingUserListViewModel @Inject constructor(
    private val userRepository: UserRepository
) : ViewModel() {
    
    val users: Flow<PagingData<User>> = Pager(
        config = PagingConfig(
            pageSize = 20,
            enablePlaceholders = false
        ),
        pagingSourceFactory = { UserPagingSource(userRepository) }
    ).flow.cachedIn(viewModelScope)
}

@Composable
fun PagingUserList(
    viewModel: PagingUserListViewModel = hiltViewModel()
) {
    val users = viewModel.users.collectAsLazyPagingItems()
    
    LazyColumn {
        items(users) { user ->
            user?.let {
                UserItem(user = it)
            }
        }
    }
}

// Image caching configuration
@Module
@InstallIn(SingletonComponent::class)
object ImageLoadingModule {
    
    @Provides
    @Singleton
    fun provideImageLoader(@ApplicationContext context: Context): ImageLoader {
        return ImageLoader.Builder(context)
            .memoryCache {
                MemoryCache.Builder(context)
                    .maxSizePercent(0.25)
                    .build()
            }
            .diskCache {
                DiskCache.Builder()
                    .directory(context.cacheDir.resolve("image_cache"))
                    .maxSizePercent(0.02)
                    .build()
            }
            .build()
    }
}
```

### Background Processing Optimization
```kotlin
// Efficient background sync
class SyncManager @Inject constructor(
    private val userRepository: UserRepository,
    private val workManager: WorkManager
) {
    
    fun scheduleSyncIfNeeded() {
        val lastSyncTime = getLastSyncTime()
        val currentTime = System.currentTimeMillis()
        
        if (currentTime - lastSyncTime > SYNC_INTERVAL) {
            scheduleImmediateSync()
        }
    }
    
    private fun scheduleImmediateSync() {
        val syncRequest = OneTimeWorkRequestBuilder<SyncUsersWorker>()
            .setConstraints(
                Constraints.Builder()
                    .setRequiredNetworkType(NetworkType.CONNECTED)
                    .build()
            )
            .build()
        
        workManager.enqueueUniqueWork(
            "immediate_sync",
            ExistingWorkPolicy.REPLACE,
            syncRequest
        )
    }
    
    companion object {
        private const val SYNC_INTERVAL = 30 * 60 * 1000L // 30 minutes
    }
}
```