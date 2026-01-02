# Debug Menu Integration Module

## Purpose
Generate debug menu specifications for applications that allow switching between real backend, fake backend, and offline mode. This module provides UI specifications for web, iOS, and Android platforms, enabling QA and developers to easily test different API scenarios without code changes.

## Instructions

### When to Use This Module
- When implementing environment switching for development and QA testing
- When adding debug capabilities to mobile and web applications
- When enabling offline mode simulation for testing
- When providing scenario selection UI for fake backend testing
- When building developer tools for API response manipulation

### Implementation Steps
1. **Define Environment Options**: Configure available backend environments
2. **Create Debug Menu UI**: Generate platform-specific debug menu components
3. **Implement Environment Switching**: Add logic to switch API base URLs
4. **Add Scenario Selection**: Enable mock scenario selection via UI
5. **Configure Persistence**: Save selected environment across app restarts
6. **Add Offline Mode**: Implement offline simulation capabilities
7. **Secure Debug Access**: Ensure debug menu is only available in non-production builds

### Key Integration Principles
- **Development Only**: Debug menu must be disabled in production builds
- **Persistent Selection**: Environment choice should persist across sessions
- **Easy Access**: Debug menu should be easily accessible during testing
- **Clear Indicators**: Current environment should be clearly visible
- **Scenario Support**: Allow selection of specific mock scenarios

### Quality Assurance Guidelines
- Verify debug menu is hidden in production builds
- Test environment switching works correctly
- Ensure selected environment persists after app restart
- Validate offline mode properly simulates network unavailability
- Check scenario selection affects API responses correctly

## Examples

### 1. Environment Configuration
```markdown
# Debug Environment Configuration

## Available Environments
```json
{
  "environments": [
    {
      "id": "production",
      "name": "Production",
      "baseUrl": "https://api.example.com",
      "type": "real",
      "description": "Live production API",
      "available": false
    },
    {
      "id": "staging",
      "name": "Staging",
      "baseUrl": "https://staging-api.example.com",
      "type": "real",
      "description": "Staging environment for QA"
    },
    {
      "id": "fake-backend",
      "name": "Fake Backend",
      "baseUrl": "http://localhost:3001",
      "type": "fake",
      "description": "Local fake backend with mock data"
    },
    {
      "id": "offline",
      "name": "Offline Mode",
      "baseUrl": null,
      "type": "offline",
      "description": "Simulate offline/no network"
    }
  ],
  "defaultEnvironment": "staging",
  "persistSelection": true,
  "showInProduction": false
}
```

## Scenario Options
```json
{
  "scenarios": [
    { "id": "success", "name": "Success", "description": "Normal success responses" },
    { "id": "empty", "name": "Empty Data", "description": "Empty result sets" },
    { "id": "validation_error", "name": "Validation Error", "description": "400 validation errors" },
    { "id": "unauthorized", "name": "Unauthorized", "description": "401 auth errors" },
    { "id": "not_found", "name": "Not Found", "description": "404 errors" },
    { "id": "server_error", "name": "Server Error", "description": "500 errors" },
    { "id": "timeout", "name": "Timeout", "description": "Request timeouts" },
    { "id": "slow", "name": "Slow Response", "description": "3 second delays" }
  ],
  "defaultScenario": "success"
}
```
```


### 2. React Web Debug Menu Component
```markdown
# React Debug Menu Implementation

## Debug Menu Component (src/components/DebugMenu.tsx)
```tsx
import React, { useState, useEffect } from 'react';
import { useDebugConfig } from '../hooks/useDebugConfig';

interface Environment {
  id: string;
  name: string;
  baseUrl: string | null;
  type: 'real' | 'fake' | 'offline';
  description: string;
}

interface DebugMenuProps {
  isVisible?: boolean;
  onClose?: () => void;
}

export const DebugMenu: React.FC<DebugMenuProps> = ({ isVisible = false, onClose }) => {
  const {
    environments,
    scenarios,
    currentEnvironment,
    currentScenario,
    setEnvironment,
    setScenario,
    isDebugEnabled
  } = useDebugConfig();

  const [isOpen, setIsOpen] = useState(isVisible);

  // Don't render in production
  if (!isDebugEnabled) return null;

  return (
    <>
      {/* Debug Toggle Button */}
      <button
        className="debug-toggle"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999,
          padding: '10px 15px',
          backgroundColor: currentEnvironment.type === 'fake' ? '#ff9800' : 
                          currentEnvironment.type === 'offline' ? '#f44336' : '#4caf50',
          color: 'white',
          border: 'none',
          borderRadius: '20px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 'bold'
        }}
      >
        🔧 {currentEnvironment.name}
      </button>

      {/* Debug Panel */}
      {isOpen && (
        <div className="debug-panel" style={{
          position: 'fixed',
          bottom: '70px',
          right: '20px',
          width: '300px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          zIndex: 9998,
          padding: '20px'
        }}>
          <h3 style={{ margin: '0 0 15px 0' }}>Debug Settings</h3>
          
          {/* Environment Selection */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
              Environment
            </label>
            <select
              value={currentEnvironment.id}
              onChange={(e) => setEnvironment(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px' }}
            >
              {environments.map(env => (
                <option key={env.id} value={env.id}>
                  {env.name} {env.type === 'fake' ? '🔶' : env.type === 'offline' ? '📴' : '🟢'}
                </option>
              ))}
            </select>
            <small style={{ color: '#666' }}>{currentEnvironment.description}</small>
          </div>

          {/* Scenario Selection (only for fake backend) */}
          {currentEnvironment.type === 'fake' && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
                Mock Scenario
              </label>
              <select
                value={currentScenario}
                onChange={(e) => setScenario(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px' }}
              >
                {scenarios.map(scenario => (
                  <option key={scenario.id} value={scenario.id}>
                    {scenario.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Current Config Display */}
          <div style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '10px', 
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>
            <div>Base URL: {currentEnvironment.baseUrl || 'N/A'}</div>
            <div>Type: {currentEnvironment.type}</div>
            {currentEnvironment.type === 'fake' && (
              <div>Scenario: {currentScenario}</div>
            )}
          </div>

          <button
            onClick={() => setIsOpen(false)}
            style={{
              marginTop: '15px',
              width: '100%',
              padding: '8px',
              backgroundColor: '#e0e0e0',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      )}
    </>
  );
};
```

## Debug Config Hook (src/hooks/useDebugConfig.ts)
```tsx
import { useState, useEffect, useCallback } from 'react';
import debugConfig from '../config/debug-config.json';

const STORAGE_KEY = 'debug_environment';
const SCENARIO_KEY = 'debug_scenario';

export function useDebugConfig() {
  const [currentEnvId, setCurrentEnvId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) || debugConfig.defaultEnvironment;
    }
    return debugConfig.defaultEnvironment;
  });

  const [currentScenario, setCurrentScenarioState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(SCENARIO_KEY) || debugConfig.scenarios[0]?.id || 'success';
    }
    return 'success';
  });

  const isDebugEnabled = process.env.NODE_ENV !== 'production' || 
                         process.env.REACT_APP_ENABLE_DEBUG === 'true';

  const currentEnvironment = debugConfig.environments.find(e => e.id === currentEnvId) 
                            || debugConfig.environments[0];

  const setEnvironment = useCallback((envId: string) => {
    setCurrentEnvId(envId);
    if (debugConfig.persistSelection) {
      localStorage.setItem(STORAGE_KEY, envId);
    }
    // Reload to apply new environment
    window.location.reload();
  }, []);

  const setScenario = useCallback((scenarioId: string) => {
    setCurrentScenarioState(scenarioId);
    localStorage.setItem(SCENARIO_KEY, scenarioId);
  }, []);

  return {
    environments: debugConfig.environments,
    scenarios: debugConfig.scenarios,
    currentEnvironment,
    currentScenario,
    setEnvironment,
    setScenario,
    isDebugEnabled
  };
}
```

## API Client Integration (src/api/client.ts)
```tsx
import { getDebugConfig } from '../config/debug-config';

const debugConfig = getDebugConfig();

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { currentEnvironment, currentScenario } = debugConfig;

  // Handle offline mode
  if (currentEnvironment.type === 'offline') {
    throw new Error('Network unavailable (offline mode)');
  }

  const url = `${currentEnvironment.baseUrl}${endpoint}`;
  
  // Add scenario header for fake backend
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (currentEnvironment.type === 'fake') {
    headers['X-Mock-Scenario'] = currentScenario;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}
```
```


### 3. iOS Swift Debug Menu Implementation
```markdown
# iOS Debug Menu Implementation

## Debug Menu View (DebugMenuView.swift)
```swift
import SwiftUI

struct DebugMenuView: View {
    @StateObject private var debugConfig = DebugConfiguration.shared
    @State private var isExpanded = false
    
    var body: some View {
        #if DEBUG
        VStack {
            Spacer()
            HStack {
                Spacer()
                VStack(alignment: .trailing, spacing: 8) {
                    if isExpanded {
                        debugPanel
                    }
                    debugToggleButton
                }
                .padding()
            }
        }
        #else
        EmptyView()
        #endif
    }
    
    private var debugToggleButton: some View {
        Button(action: { withAnimation { isExpanded.toggle() } }) {
            HStack {
                Image(systemName: "wrench.fill")
                Text(debugConfig.currentEnvironment.name)
                    .font(.caption)
                    .fontWeight(.bold)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(environmentColor)
            .foregroundColor(.white)
            .cornerRadius(20)
        }
    }
    
    private var environmentColor: Color {
        switch debugConfig.currentEnvironment.type {
        case .fake: return .orange
        case .offline: return .red
        case .real: return .green
        }
    }
    
    private var debugPanel: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Debug Settings")
                .font(.headline)
            
            // Environment Picker
            VStack(alignment: .leading, spacing: 4) {
                Text("Environment")
                    .font(.caption)
                    .foregroundColor(.secondary)
                Picker("Environment", selection: $debugConfig.selectedEnvironmentId) {
                    ForEach(debugConfig.environments) { env in
                        Text(env.name).tag(env.id)
                    }
                }
                .pickerStyle(MenuPickerStyle())
            }
            
            // Scenario Picker (only for fake backend)
            if debugConfig.currentEnvironment.type == .fake {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Mock Scenario")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Picker("Scenario", selection: $debugConfig.selectedScenario) {
                        ForEach(debugConfig.scenarios) { scenario in
                            Text(scenario.name).tag(scenario.id)
                        }
                    }
                    .pickerStyle(MenuPickerStyle())
                }
            }
            
            // Current Config Display
            VStack(alignment: .leading, spacing: 2) {
                Text("Base URL: \(debugConfig.currentEnvironment.baseUrl ?? "N/A")")
                Text("Type: \(debugConfig.currentEnvironment.type.rawValue)")
                if debugConfig.currentEnvironment.type == .fake {
                    Text("Scenario: \(debugConfig.selectedScenario)")
                }
            }
            .font(.caption2)
            .foregroundColor(.secondary)
            .padding(8)
            .background(Color.gray.opacity(0.1))
            .cornerRadius(4)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 8)
        .frame(width: 250)
    }
}

// MARK: - Debug Configuration

class DebugConfiguration: ObservableObject {
    static let shared = DebugConfiguration()
    
    @Published var selectedEnvironmentId: String {
        didSet {
            UserDefaults.standard.set(selectedEnvironmentId, forKey: "debug_environment")
            NotificationCenter.default.post(name: .environmentChanged, object: nil)
        }
    }
    
    @Published var selectedScenario: String {
        didSet {
            UserDefaults.standard.set(selectedScenario, forKey: "debug_scenario")
        }
    }
    
    let environments: [Environment]
    let scenarios: [Scenario]
    
    var currentEnvironment: Environment {
        environments.first { $0.id == selectedEnvironmentId } ?? environments[0]
    }
    
    private init() {
        // Load from config file
        guard let url = Bundle.main.url(forResource: "debug-config", withExtension: "json"),
              let data = try? Data(contentsOf: url),
              let config = try? JSONDecoder().decode(DebugConfig.self, from: data) else {
            fatalError("Failed to load debug config")
        }
        
        self.environments = config.environments
        self.scenarios = config.scenarios
        
        // Restore saved selections
        self.selectedEnvironmentId = UserDefaults.standard.string(forKey: "debug_environment") 
                                     ?? config.defaultEnvironment
        self.selectedScenario = UserDefaults.standard.string(forKey: "debug_scenario") 
                               ?? "success"
    }
}

// MARK: - Models

struct Environment: Identifiable, Codable {
    let id: String
    let name: String
    let baseUrl: String?
    let type: EnvironmentType
    let description: String
}

enum EnvironmentType: String, Codable {
    case real, fake, offline
}

struct Scenario: Identifiable, Codable {
    let id: String
    let name: String
    let description: String
}

struct DebugConfig: Codable {
    let environments: [Environment]
    let scenarios: [Scenario]
    let defaultEnvironment: String
}

extension Notification.Name {
    static let environmentChanged = Notification.Name("environmentChanged")
}
```

## API Client Integration (APIClient.swift)
```swift
import Foundation

class APIClient {
    static let shared = APIClient()
    
    private var session: URLSession
    private let debugConfig = DebugConfiguration.shared
    
    private init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        self.session = URLSession(configuration: config)
        
        // Listen for environment changes
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(environmentDidChange),
            name: .environmentChanged,
            object: nil
        )
    }
    
    @objc private func environmentDidChange() {
        // Reset session or perform any necessary cleanup
        print("Environment changed to: \(debugConfig.currentEnvironment.name)")
    }
    
    func request<T: Decodable>(
        endpoint: String,
        method: String = "GET",
        body: Data? = nil
    ) async throws -> T {
        let environment = debugConfig.currentEnvironment
        
        // Handle offline mode
        guard environment.type != .offline else {
            throw APIError.offline
        }
        
        guard let baseUrl = environment.baseUrl,
              let url = URL(string: "\(baseUrl)\(endpoint)") else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.httpBody = body
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // Add scenario header for fake backend
        if environment.type == .fake {
            request.setValue(debugConfig.selectedScenario, forHTTPHeaderField: "X-Mock-Scenario")
        }
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        guard (200...299).contains(httpResponse.statusCode) else {
            throw APIError.httpError(statusCode: httpResponse.statusCode)
        }
        
        return try JSONDecoder().decode(T.self, from: data)
    }
}

enum APIError: Error {
    case offline
    case invalidURL
    case invalidResponse
    case httpError(statusCode: Int)
}
```
```


### 4. Android Kotlin Debug Menu Implementation
```markdown
# Android Debug Menu Implementation

## Debug Menu Composable (DebugMenu.kt)
```kotlin
package com.example.app.debug

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.app.BuildConfig

@Composable
fun DebugMenu(
    modifier: Modifier = Modifier
) {
    // Only show in debug builds
    if (!BuildConfig.DEBUG) return
    
    val debugConfig = remember { DebugConfiguration.getInstance() }
    var isExpanded by remember { mutableStateOf(false) }
    var selectedEnvironment by remember { mutableStateOf(debugConfig.currentEnvironment) }
    var selectedScenario by remember { mutableStateOf(debugConfig.currentScenario) }
    
    Box(
        modifier = modifier.fillMaxSize(),
        contentAlignment = Alignment.BottomEnd
    ) {
        Column(
            horizontalAlignment = Alignment.End,
            modifier = Modifier.padding(16.dp)
        ) {
            // Debug Panel
            AnimatedVisibility(visible = isExpanded) {
                DebugPanel(
                    environments = debugConfig.environments,
                    scenarios = debugConfig.scenarios,
                    selectedEnvironment = selectedEnvironment,
                    selectedScenario = selectedScenario,
                    onEnvironmentSelected = { env ->
                        selectedEnvironment = env
                        debugConfig.setEnvironment(env.id)
                    },
                    onScenarioSelected = { scenario ->
                        selectedScenario = scenario
                        debugConfig.setScenario(scenario)
                    },
                    onClose = { isExpanded = false }
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            // Toggle Button
            DebugToggleButton(
                environment = selectedEnvironment,
                onClick = { isExpanded = !isExpanded }
            )
        }
    }
}

@Composable
private fun DebugToggleButton(
    environment: Environment,
    onClick: () -> Unit
) {
    val backgroundColor = when (environment.type) {
        EnvironmentType.FAKE -> Color(0xFFFF9800)
        EnvironmentType.OFFLINE -> Color(0xFFF44336)
        EnvironmentType.REAL -> Color(0xFF4CAF50)
    }
    
    Button(
        onClick = onClick,
        colors = ButtonDefaults.buttonColors(containerColor = backgroundColor),
        shape = RoundedCornerShape(20.dp)
    ) {
        Text("🔧 ${environment.name}", fontSize = 12.sp)
    }
}

@Composable
private fun DebugPanel(
    environments: List<Environment>,
    scenarios: List<Scenario>,
    selectedEnvironment: Environment,
    selectedScenario: String,
    onEnvironmentSelected: (Environment) -> Unit,
    onScenarioSelected: (String) -> Unit,
    onClose: () -> Unit
) {
    var environmentExpanded by remember { mutableStateOf(false) }
    var scenarioExpanded by remember { mutableStateOf(false) }
    
    Card(
        modifier = Modifier.width(280.dp),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "Debug Settings",
                style = MaterialTheme.typography.titleMedium
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // Environment Dropdown
            Text("Environment", style = MaterialTheme.typography.labelSmall)
            ExposedDropdownMenuBox(
                expanded = environmentExpanded,
                onExpandedChange = { environmentExpanded = it }
            ) {
                OutlinedTextField(
                    value = selectedEnvironment.name,
                    onValueChange = {},
                    readOnly = true,
                    modifier = Modifier
                        .fillMaxWidth()
                        .menuAnchor(),
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = environmentExpanded) }
                )
                ExposedDropdownMenu(
                    expanded = environmentExpanded,
                    onDismissRequest = { environmentExpanded = false }
                ) {
                    environments.forEach { env ->
                        DropdownMenuItem(
                            text = { Text(env.name) },
                            onClick = {
                                onEnvironmentSelected(env)
                                environmentExpanded = false
                            }
                        )
                    }
                }
            }
            
            // Scenario Dropdown (only for fake backend)
            if (selectedEnvironment.type == EnvironmentType.FAKE) {
                Spacer(modifier = Modifier.height(12.dp))
                Text("Mock Scenario", style = MaterialTheme.typography.labelSmall)
                ExposedDropdownMenuBox(
                    expanded = scenarioExpanded,
                    onExpandedChange = { scenarioExpanded = it }
                ) {
                    OutlinedTextField(
                        value = selectedScenario,
                        onValueChange = {},
                        readOnly = true,
                        modifier = Modifier
                            .fillMaxWidth()
                            .menuAnchor(),
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = scenarioExpanded) }
                    )
                    ExposedDropdownMenu(
                        expanded = scenarioExpanded,
                        onDismissRequest = { scenarioExpanded = false }
                    ) {
                        scenarios.forEach { scenario ->
                            DropdownMenuItem(
                                text = { Text(scenario.name) },
                                onClick = {
                                    onScenarioSelected(scenario.id)
                                    scenarioExpanded = false
                                }
                            )
                        }
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // Config Display
            Surface(
                color = MaterialTheme.colorScheme.surfaceVariant,
                shape = RoundedCornerShape(4.dp)
            ) {
                Column(modifier = Modifier.padding(8.dp)) {
                    Text("Base URL: ${selectedEnvironment.baseUrl ?: "N/A"}", fontSize = 10.sp)
                    Text("Type: ${selectedEnvironment.type}", fontSize = 10.sp)
                    if (selectedEnvironment.type == EnvironmentType.FAKE) {
                        Text("Scenario: $selectedScenario", fontSize = 10.sp)
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Button(
                onClick = onClose,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Close")
            }
        }
    }
}
```

## Debug Configuration (DebugConfiguration.kt)
```kotlin
package com.example.app.debug

import android.content.Context
import android.content.SharedPreferences
import com.google.gson.Gson
import com.google.gson.annotations.SerializedName

class DebugConfiguration private constructor(context: Context) {
    
    private val prefs: SharedPreferences = context.getSharedPreferences(
        "debug_config", Context.MODE_PRIVATE
    )
    private val gson = Gson()
    
    val environments: List<Environment>
    val scenarios: List<Scenario>
    private val defaultEnvironment: String
    
    var currentEnvironment: Environment
        private set
    
    var currentScenario: String
        private set
    
    init {
        // Load config from assets
        val configJson = context.assets.open("debug-config.json")
            .bufferedReader().use { it.readText() }
        val config = gson.fromJson(configJson, DebugConfig::class.java)
        
        environments = config.environments
        scenarios = config.scenarios
        defaultEnvironment = config.defaultEnvironment
        
        // Restore saved selections
        val savedEnvId = prefs.getString(KEY_ENVIRONMENT, defaultEnvironment) ?: defaultEnvironment
        currentEnvironment = environments.find { it.id == savedEnvId } ?: environments[0]
        currentScenario = prefs.getString(KEY_SCENARIO, "success") ?: "success"
    }
    
    fun setEnvironment(envId: String) {
        currentEnvironment = environments.find { it.id == envId } ?: return
        prefs.edit().putString(KEY_ENVIRONMENT, envId).apply()
    }
    
    fun setScenario(scenario: String) {
        currentScenario = scenario
        prefs.edit().putString(KEY_SCENARIO, scenario).apply()
    }
    
    companion object {
        private const val KEY_ENVIRONMENT = "debug_environment"
        private const val KEY_SCENARIO = "debug_scenario"
        
        @Volatile
        private var instance: DebugConfiguration? = null
        
        fun init(context: Context) {
            if (instance == null) {
                synchronized(this) {
                    if (instance == null) {
                        instance = DebugConfiguration(context.applicationContext)
                    }
                }
            }
        }
        
        fun getInstance(): DebugConfiguration {
            return instance ?: throw IllegalStateException(
                "DebugConfiguration not initialized. Call init() first."
            )
        }
    }
}

// Data classes
data class DebugConfig(
    val environments: List<Environment>,
    val scenarios: List<Scenario>,
    @SerializedName("defaultEnvironment") val defaultEnvironment: String
)

data class Environment(
    val id: String,
    val name: String,
    val baseUrl: String?,
    val type: EnvironmentType,
    val description: String
)

enum class EnvironmentType {
    @SerializedName("real") REAL,
    @SerializedName("fake") FAKE,
    @SerializedName("offline") OFFLINE
}

data class Scenario(
    val id: String,
    val name: String,
    val description: String
)
```

## API Client Integration (ApiClient.kt)
```kotlin
package com.example.app.network

import com.example.app.debug.DebugConfiguration
import com.example.app.debug.EnvironmentType
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.io.IOException

object ApiClient {
    
    private val debugConfig: DebugConfiguration by lazy { 
        DebugConfiguration.getInstance() 
    }
    
    private val mockScenarioInterceptor = Interceptor { chain ->
        val environment = debugConfig.currentEnvironment
        
        // Handle offline mode
        if (environment.type == EnvironmentType.OFFLINE) {
            throw IOException("Network unavailable (offline mode)")
        }
        
        val request = chain.request().newBuilder().apply {
            // Add scenario header for fake backend
            if (environment.type == EnvironmentType.FAKE) {
                addHeader("X-Mock-Scenario", debugConfig.currentScenario)
            }
        }.build()
        
        chain.proceed(request)
    }
    
    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(mockScenarioInterceptor)
        .build()
    
    fun <T> createService(serviceClass: Class<T>): T {
        val baseUrl = debugConfig.currentEnvironment.baseUrl
            ?: throw IllegalStateException("No base URL configured")
        
        return Retrofit.Builder()
            .baseUrl(baseUrl)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(serviceClass)
    }
}
```
```


### 5. Offline Mode Simulation
```markdown
# Offline Mode Simulation

## Offline Mode Implementation Patterns

### Web (React) Offline Simulation
```typescript
// src/utils/offlineSimulator.ts

class OfflineSimulator {
  private isOffline: boolean = false;
  private originalFetch: typeof fetch;
  
  constructor() {
    this.originalFetch = window.fetch.bind(window);
  }
  
  enable() {
    this.isOffline = true;
    
    // Override fetch to simulate network failure
    window.fetch = async (...args) => {
      if (this.isOffline) {
        throw new TypeError('Failed to fetch (offline mode)');
      }
      return this.originalFetch(...args);
    };
    
    // Dispatch offline event
    window.dispatchEvent(new Event('offline'));
    
    console.log('[OfflineSimulator] Offline mode enabled');
  }
  
  disable() {
    this.isOffline = false;
    window.fetch = this.originalFetch;
    
    // Dispatch online event
    window.dispatchEvent(new Event('online'));
    
    console.log('[OfflineSimulator] Offline mode disabled');
  }
  
  toggle() {
    if (this.isOffline) {
      this.disable();
    } else {
      this.enable();
    }
  }
  
  getStatus(): boolean {
    return this.isOffline;
  }
}

export const offlineSimulator = new OfflineSimulator();
```

### iOS Offline Simulation
```swift
// OfflineSimulator.swift

import Foundation

class OfflineSimulator {
    static let shared = OfflineSimulator()
    
    private(set) var isOffline: Bool = false
    
    private init() {}
    
    func enable() {
        isOffline = true
        NotificationCenter.default.post(name: .offlineModeEnabled, object: nil)
        print("[OfflineSimulator] Offline mode enabled")
    }
    
    func disable() {
        isOffline = false
        NotificationCenter.default.post(name: .offlineModeDisabled, object: nil)
        print("[OfflineSimulator] Offline mode disabled")
    }
    
    func toggle() {
        if isOffline {
            disable()
        } else {
            enable()
        }
    }
}

extension Notification.Name {
    static let offlineModeEnabled = Notification.Name("offlineModeEnabled")
    static let offlineModeDisabled = Notification.Name("offlineModeDisabled")
}

// Usage in URLSession extension
extension URLSession {
    func dataTaskWithOfflineSupport(
        with request: URLRequest,
        completionHandler: @escaping (Data?, URLResponse?, Error?) -> Void
    ) -> URLSessionDataTask {
        if OfflineSimulator.shared.isOffline {
            // Return immediately with network error
            DispatchQueue.main.async {
                let error = NSError(
                    domain: NSURLErrorDomain,
                    code: NSURLErrorNotConnectedToInternet,
                    userInfo: [NSLocalizedDescriptionKey: "Offline mode is enabled"]
                )
                completionHandler(nil, nil, error)
            }
            return self.dataTask(with: request) // Return dummy task
        }
        
        return self.dataTask(with: request, completionHandler: completionHandler)
    }
}
```

### Android Offline Simulation
```kotlin
// OfflineSimulator.kt

package com.example.app.debug

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import okhttp3.Interceptor
import okhttp3.Response
import java.io.IOException

object OfflineSimulator {
    
    private val _isOffline = MutableStateFlow(false)
    val isOffline: StateFlow<Boolean> = _isOffline
    
    fun enable() {
        _isOffline.value = true
        println("[OfflineSimulator] Offline mode enabled")
    }
    
    fun disable() {
        _isOffline.value = false
        println("[OfflineSimulator] Offline mode disabled")
    }
    
    fun toggle() {
        if (_isOffline.value) disable() else enable()
    }
    
    // OkHttp Interceptor for offline simulation
    val interceptor = Interceptor { chain ->
        if (_isOffline.value) {
            throw IOException("Network unavailable (offline mode)")
        }
        chain.proceed(chain.request())
    }
}

// Usage in OkHttpClient
val okHttpClient = OkHttpClient.Builder()
    .addInterceptor(OfflineSimulator.interceptor)
    .build()
```
```

## Core Functionality

### Debug Menu Generation Prompt
```
You are a debug menu generator for multi-platform applications. Your task is to create debug menu specifications that allow switching between different backend environments.

**Generation Process:**

1. **Define environment options**:
   - Production (disabled in debug menu)
   - Staging (real backend)
   - Fake Backend (local mock server)
   - Offline Mode (no network)

2. **Create platform-specific UI components**:
   - Web: React component with dropdown selectors
   - iOS: SwiftUI view with picker controls
   - Android: Jetpack Compose with dropdown menus

3. **Implement persistence**:
   - Save selected environment to local storage
   - Restore selection on app launch
   - Handle environment changes gracefully

4. **Add scenario selection** (for fake backend):
   - Success scenarios
   - Error scenarios
   - Network simulation scenarios

5. **Integrate with API client**:
   - Update base URL based on selection
   - Add scenario headers for fake backend
   - Handle offline mode gracefully

**Output Format:**
```markdown
# Debug Menu Specification

## Configuration
[Environment and scenario configuration JSON]

## Platform Implementations
### Web
[React component code]

### iOS
[SwiftUI code]

### Android
[Jetpack Compose code]

## API Integration
[API client modifications for each platform]
```
```

### Environment Switching Prompt
```
You are an environment switching specialist. Your task is to implement seamless switching between different backend environments in applications.

**Implementation Requirements:**

1. **Environment Configuration**:
   - Store environment definitions in config file
   - Support real, fake, and offline types
   - Include base URLs and descriptions

2. **Switching Logic**:
   - Update API base URL immediately
   - Clear any cached data if needed
   - Notify relevant components of change

3. **Persistence**:
   - Save selection to platform storage
   - Restore on app launch
   - Handle missing/invalid saved values

4. **UI Feedback**:
   - Show current environment clearly
   - Indicate environment type with colors/icons
   - Confirm environment changes

**Platform-Specific Considerations:**
- Web: Use localStorage, handle page reload
- iOS: Use UserDefaults, post notifications
- Android: Use SharedPreferences, use StateFlow
```

## Usage Instructions

**Basic Debug Menu Generation:**
```markdown
#[[module:testing/debug-menu-integration.md]]
```

**Platform-Specific:**
```markdown
#[[module:testing/debug-menu-integration.md|platform=web]]
#[[module:testing/debug-menu-integration.md|platform=ios]]
#[[module:testing/debug-menu-integration.md|platform=android]]
```

**Parameters:**
- `platform`: Target platform (web, ios, android, all) - default: all
- `include_offline`: Include offline mode simulation - default: true
- `include_scenarios`: Include scenario selection - default: true

## Integration Points
- Requires `fake-backend-generator.md` for fake backend configuration
- Works with `centralized-mock-data.md` for mock data organization
- Supports test runner integration for automated environment switching
- Integrates with app configuration management
