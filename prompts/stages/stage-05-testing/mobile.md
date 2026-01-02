# Stage 05 - Testing: Mobile Platform Strategy

## Purpose
Define mobile-specific testing strategies, tools, and approaches for native iOS/Android apps and cross-platform solutions (React Native, Flutter) that complement the platform-agnostic testing framework.

## Mobile Testing Framework

### Mobile-Specific Testing Categories
```markdown
## Mobile Testing Specializations

### 1. Unit Testing for Mobile
**React Native**: Jest + React Native Testing Library
**Flutter**: Flutter Test Framework
**Native iOS**: XCTest
**Native Android**: JUnit + Espresso

#### React Native Component Testing
```javascript
// Example React Native component test
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TaskItem } from './TaskItem';

describe('TaskItem Component', () => {
  const mockTask = {
    id: '1',
    description: 'Test task',
    completed: false,
  };
  
  it('should render task description', () => {
    const { getByText } = render(<TaskItem task={mockTask} />);
    expect(getByText('Test task')).toBeTruthy();
  });
  
  it('should toggle task completion on press', () => {
    const mockOnToggle = jest.fn();
    const { getByTestId } = render(
      <TaskItem task={mockTask} onToggle={mockOnToggle} />
    );
    
    fireEvent.press(getByTestId('task-checkbox'));
    expect(mockOnToggle).toHaveBeenCalledWith('1');
  });
  
  it('should handle long press for context menu', () => {
    const mockOnLongPress = jest.fn();
    const { getByTestId } = render(
      <TaskItem task={mockTask} onLongPress={mockOnLongPress} />
    );
    
    fireEvent(getByTestId('task-item'), 'longPress');
    expect(mockOnLongPress).toHaveBeenCalledWith(mockTask);
  });
});
```

#### Flutter Widget Testing
```dart
// Example Flutter widget test
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:task_app/widgets/task_item.dart';
import 'package:task_app/models/task.dart';

void main() {
  group('TaskItem Widget', () {
    testWidgets('should display task description', (WidgetTester tester) async {
      final task = Task(
        id: '1',
        description: 'Test task',
        completed: false,
      );
      
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: TaskItem(task: task),
          ),
        ),
      );
      
      expect(find.text('Test task'), findsOneWidget);
    });
    
    testWidgets('should toggle completion on tap', (WidgetTester tester) async {
      bool toggled = false;
      final task = Task(id: '1', description: 'Test task', completed: false);
      
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: TaskItem(
              task: task,
              onToggle: (id) => toggled = true,
            ),
          ),
        ),
      );
      
      await tester.tap(find.byType(Checkbox));
      expect(toggled, isTrue);
    });
  });
}
```

#### Native iOS Testing (XCTest)
```swift
// Example iOS unit test
import XCTest
@testable import TaskApp

class TaskManagerTests: XCTestCase {
    var taskManager: TaskManager!
    
    override func setUp() {
        super.setUp()
        taskManager = TaskManager()
    }
    
    func testAddTask() {
        let task = Task(description: "Test task")
        taskManager.addTask(task)
        
        XCTAssertEqual(taskManager.tasks.count, 1)
        XCTAssertEqual(taskManager.tasks.first?.description, "Test task")
    }
    
    func testToggleTaskCompletion() {
        let task = Task(description: "Test task")
        taskManager.addTask(task)
        
        taskManager.toggleTask(task.id)
        
        XCTAssertTrue(taskManager.tasks.first?.completed ?? false)
    }
}
```

### 2. Integration Testing for Mobile
**Scope**: API integration, local storage, push notifications, device features
**Tools**: Platform-specific testing frameworks + mock services + fake backend

#### Centralized Mock Data for Mobile Testing

Mobile tests should use centralized mock data for consistency with web and other platforms:

**Mock Data Import Pattern (React Native):**
```javascript
// Import centralized mock data
import userListSuccess from '@mocks/api/v1/users/GET/200-success.json';
import userCreateSuccess from '@mocks/api/v1/users/POST/201-created.json';
import validationError from '@mocks/api/v1/users/POST/400-validation-error.json';

// Use in MSW handlers for React Native
import { rest } from 'msw';
import { setupServer } from 'msw/native';

const handlers = [
  rest.get('/api/v1/users', (req, res, ctx) => {
    return res(ctx.json(userListSuccess));
  }),
  rest.post('/api/v1/users', (req, res, ctx) => {
    const scenario = req.headers.get('X-Mock-Scenario');
    if (scenario === 'validation_error') {
      return res(ctx.status(400), ctx.json(validationError));
    }
    return res(ctx.status(201), ctx.json(userCreateSuccess));
  })
];

export const server = setupServer(...handlers);
```

**Mock Data Import Pattern (Flutter):**
```dart
// Load centralized mock data in Flutter tests
import 'dart:convert';
import 'package:flutter/services.dart';

Future<Map<String, dynamic>> loadMockData(String path) async {
  final jsonString = await rootBundle.loadString('mocks/$path');
  return json.decode(jsonString);
}

// Usage in tests
final userListMock = await loadMockData('api/v1/users/GET/200-success.json');
```

**Reference Module:** [centralized-mock-data.md](../../modules/testing/centralized-mock-data.md)

#### Fake Backend Integration for Mobile

For more realistic integration testing, use the fake backend approach:

**Fake Backend Setup for Mobile Tests:**
```javascript
// jest.setup.js for React Native
const { startFakeBackend, stopFakeBackend } = require('./fake-backend/spawn');

beforeAll(async () => {
  await startFakeBackend({ port: 3001 });
  // Configure API client to use fake backend
  process.env.API_BASE_URL = 'http://localhost:3001';
});

afterAll(async () => {
  await stopFakeBackend();
});
```

**Integration Test with Fake Backend:**
```javascript
describe('Mobile API Integration with Fake Backend', () => {
  it('should fetch users from fake backend', async () => {
    const apiClient = new ApiClient({ baseUrl: 'http://localhost:3001' });
    const users = await apiClient.getUsers();
    
    expect(users).toBeInstanceOf(Array);
    expect(users[0]).toHaveProperty('id');
    expect(users[0]).toHaveProperty('email');
  });
  
  it('should handle error scenarios via scenario header', async () => {
    const apiClient = new ApiClient({ 
      baseUrl: 'http://localhost:3001',
      headers: { 'X-Mock-Scenario': 'unauthorized' }
    });
    
    await expect(apiClient.getUsers()).rejects.toThrow('Unauthorized');
  });
});
```

**Debug Menu Testing for Mobile:**
```javascript
// Test debug menu environment switching
describe('Debug Menu Integration', () => {
  it('should switch to fake backend via debug menu', async () => {
    await device.launchApp();
    
    // Open debug menu
    await element(by.id('debug-toggle')).tap();
    
    // Select fake backend
    await element(by.id('environment-picker')).tap();
    await element(by.text('Fake Backend')).tap();
    
    // Verify environment changed
    await expect(element(by.id('environment-indicator'))).toHaveText('Fake Backend');
    
    // Test API call with fake backend
    await element(by.id('refresh-button')).tap();
    await expect(element(by.id('data-list'))).toBeVisible();
  });
});
```

**Reference Modules:**
- [fake-backend-generator.md](../../modules/testing/fake-backend-generator.md)
- [debug-menu-integration.md](../../modules/testing/debug-menu-integration.md)

#### API Integration Testing
```javascript
// Example React Native API integration test
import { ApiClient } from '../services/ApiClient';
import { mockServer } from '../test-utils/mockServer';

describe('Task API Integration', () => {
  beforeAll(() => mockServer.listen());
  afterEach(() => mockServer.resetHandlers());
  afterAll(() => mockServer.close());
  
  it('should fetch tasks from API', async () => {
    const apiClient = new ApiClient();
    const tasks = await apiClient.getTasks();
    
    expect(tasks).toHaveLength(2);
    expect(tasks[0]).toMatchObject({
      id: expect.any(String),
      description: expect.any(String),
      completed: expect.any(Boolean),
    });
  });
  
  it('should handle offline scenarios', async () => {
    // Simulate network failure
    mockServer.use(
      rest.get('/api/tasks', (req, res, ctx) => {
        return res.networkError('Network error');
      })
    );
    
    const apiClient = new ApiClient();
    
    // Should fall back to cached data
    const tasks = await apiClient.getTasks();
    expect(tasks).toEqual([]); // Empty array from cache
    
    // Should queue request for when online
    expect(apiClient.getQueuedRequests()).toHaveLength(1);
  });
});
```

#### Local Storage Testing
```javascript
// Example AsyncStorage testing
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TaskStorage } from '../services/TaskStorage';

describe('Task Storage', () => {
  beforeEach(() => {
    AsyncStorage.clear();
  });
  
  it('should save and retrieve tasks', async () => {
    const taskStorage = new TaskStorage();
    const tasks = [
      { id: '1', description: 'Task 1', completed: false },
      { id: '2', description: 'Task 2', completed: true },
    ];
    
    await taskStorage.saveTasks(tasks);
    const retrievedTasks = await taskStorage.getTasks();
    
    expect(retrievedTasks).toEqual(tasks);
  });
  
  it('should handle storage errors gracefully', async () => {
    // Mock AsyncStorage failure
    AsyncStorage.setItem.mockRejectedValue(new Error('Storage full'));
    
    const taskStorage = new TaskStorage();
    const result = await taskStorage.saveTasks([]);
    
    expect(result.success).toBe(false);
    expect(result.error).toBe('Storage full');
  });
});
```

### 3. End-to-End Mobile Testing
**Tools**: Detox (React Native), Flutter Driver (Flutter), XCUITest (iOS), Espresso (Android)
**Scope**: User workflows, device interactions, platform-specific features

#### Detox E2E Testing (React Native)
```javascript
// Example Detox E2E test
describe('Task Management Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });
  
  beforeEach(async () => {
    await device.reloadReactNative();
  });
  
  it('should complete full task lifecycle', async () => {
    // Add a new task
    await element(by.id('task-input')).typeText('E2E test task');
    await element(by.id('add-task-button')).tap();
    
    // Verify task appears in list
    await expect(element(by.text('E2E test task'))).toBeVisible();
    
    // Mark task as complete
    await element(by.id('task-checkbox-1')).tap();
    
    // Verify task is marked complete
    await expect(element(by.id('completed-task-1'))).toBeVisible();
    
    // Delete task with swipe gesture
    await element(by.id('task-item-1')).swipe('left');
    await element(by.id('delete-button-1')).tap();
    
    // Verify task is removed
    await expect(element(by.text('E2E test task'))).not.toBeVisible();
  });
  
  it('should handle device rotation', async () => {
    await element(by.id('task-input')).typeText('Rotation test');
    await element(by.id('add-task-button')).tap();
    
    // Rotate device
    await device.setOrientation('landscape');
    
    // Verify UI adapts correctly
    await expect(element(by.text('Rotation test'))).toBeVisible();
    await expect(element(by.id('task-list'))).toBeVisible();
    
    // Rotate back
    await device.setOrientation('portrait');
    await expect(element(by.text('Rotation test'))).toBeVisible();
  });
});
```

#### Flutter Integration Testing
```dart
// Example Flutter integration test
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:task_app/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  
  group('Task App Integration Tests', () {
    testWidgets('complete task workflow', (WidgetTester tester) async {
      app.main();
      await tester.pumpAndSettle();
      
      // Add a new task
      await tester.enterText(find.byKey(Key('task-input')), 'Integration test task');
      await tester.tap(find.byKey(Key('add-task-button')));
      await tester.pumpAndSettle();
      
      // Verify task appears
      expect(find.text('Integration test task'), findsOneWidget);
      
      // Toggle task completion
      await tester.tap(find.byKey(Key('task-checkbox-0')));
      await tester.pumpAndSettle();
      
      // Verify task is marked complete
      expect(find.byKey(Key('completed-task-0')), findsOneWidget);
      
      // Delete task
      await tester.longPress(find.byKey(Key('task-item-0')));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Delete'));
      await tester.pumpAndSettle();
      
      // Verify task is removed
      expect(find.text('Integration test task'), findsNothing);
    });
  });
}
```
```

### Mobile Performance Testing
```markdown
## Mobile Performance Testing Strategy

### 1. App Performance Metrics
**Key Metrics**: App launch time, frame rate, memory usage, battery consumption
**Tools**: Xcode Instruments, Android Profiler, Flipper, React Native Performance Monitor

#### Performance Testing Examples
```javascript
// Example React Native performance test
import { performance } from 'perf_hooks';
import { AppRegistry } from 'react-native';

describe('App Performance', () => {
  it('should launch within acceptable time', async () => {
    const startTime = performance.now();
    
    // Simulate app launch
    await device.launchApp();
    await waitFor(element(by.id('main-screen'))).toBeVisible().withTimeout(5000);
    
    const launchTime = performance.now() - startTime;
    expect(launchTime).toBeLessThan(3000); // 3 seconds max
  });
  
  it('should maintain 60fps during scrolling', async () => {
    // Add many tasks to test scrolling performance
    for (let i = 0; i < 100; i++) {
      await element(by.id('task-input')).typeText(`Task ${i}`);
      await element(by.id('add-task-button')).tap();
    }
    
    // Monitor frame rate during scroll
    await device.startMonitoringFrameRate();
    await element(by.id('task-list')).scroll(1000, 'down');
    const frameRate = await device.stopMonitoringFrameRate();
    
    expect(frameRate.average).toBeGreaterThan(55); // Close to 60fps
  });
});
```

### 2. Memory and Resource Testing
**Focus**: Memory leaks, resource cleanup, background behavior
**Tools**: Platform-specific profiling tools

#### Memory Testing
```javascript
// Example memory usage monitoring
describe('Memory Management', () => {
  it('should not leak memory during navigation', async () => {
    const initialMemory = await device.getMemoryUsage();
    
    // Navigate through screens multiple times
    for (let i = 0; i < 10; i++) {
      await element(by.id('settings-tab')).tap();
      await element(by.id('tasks-tab')).tap();
    }
    
    // Force garbage collection
    await device.forceGarbageCollection();
    
    const finalMemory = await device.getMemoryUsage();
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should be minimal
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // 10MB max
  });
});
```

### 3. Network Performance Testing
**Focus**: API response times, offline behavior, data usage
**Tools**: Network monitoring, proxy tools

#### Network Testing
```javascript
// Example network performance test
describe('Network Performance', () => {
  it('should handle slow network gracefully', async () => {
    // Simulate slow network
    await device.setNetworkConditions({
      speed: '2G',
      latency: 500,
    });
    
    const startTime = Date.now();
    await element(by.id('refresh-button')).tap();
    
    // Should show loading indicator
    await expect(element(by.id('loading-indicator'))).toBeVisible();
    
    // Wait for data to load
    await waitFor(element(by.id('task-list'))).toBeVisible().withTimeout(10000);
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(8000); // 8 seconds max on 2G
    
    // Reset network conditions
    await device.setNetworkConditions({ speed: 'wifi' });
  });
});
```
```

### Mobile Device Testing
```markdown
## Device and Platform Testing

### 1. Device Compatibility Testing
**Scope**: Different screen sizes, OS versions, hardware capabilities
**Tools**: Device farms (AWS Device Farm, Firebase Test Lab), simulators/emulators

#### Multi-Device Testing Configuration
```javascript
// Example device matrix for testing
const deviceMatrix = [
  // iOS Devices
  { platform: 'ios', device: 'iPhone SE (2nd generation)', os: '14.0' },
  { platform: 'ios', device: 'iPhone 12', os: '15.0' },
  { platform: 'ios', device: 'iPhone 13 Pro Max', os: '16.0' },
  { platform: 'ios', device: 'iPad Air (4th generation)', os: '15.0' },
  
  // Android Devices
  { platform: 'android', device: 'Pixel 4', os: '11' },
  { platform: 'android', device: 'Samsung Galaxy S21', os: '12' },
  { platform: 'android', device: 'OnePlus 9', os: '11' },
  { platform: 'android', device: 'Samsung Galaxy Tab S7', os: '11' },
];

deviceMatrix.forEach(({ platform, device, os }) => {
  describe(`${device} (${platform} ${os})`, () => {
    beforeAll(async () => {
      await device.selectDevice(device);
    });
    
    it('should display correctly on device', async () => {
      await device.launchApp();
      await expect(element(by.id('main-screen'))).toBeVisible();
      
      // Take screenshot for visual regression testing
      await device.takeScreenshot(`${device}-${os}-main-screen`);
    });
  });
});
```

### 2. Platform-Specific Feature Testing
**iOS**: Face ID/Touch ID, Siri Shortcuts, Widgets, App Clips
**Android**: Fingerprint, Google Assistant, Widgets, Instant Apps

#### Platform Feature Testing
```javascript
// Example biometric authentication testing
describe('Biometric Authentication', () => {
  it('should authenticate with biometrics on supported devices', async () => {
    if (await device.supportsBiometrics()) {
      await element(by.id('biometric-login-button')).tap();
      
      // Simulate successful biometric authentication
      await device.simulateBiometricAuthentication(true);
      
      await expect(element(by.id('dashboard'))).toBeVisible();
    } else {
      // Skip test on devices without biometric support
      pending('Biometric authentication not supported on this device');
    }
  });
  
  it('should handle biometric authentication failure', async () => {
    if (await device.supportsBiometrics()) {
      await element(by.id('biometric-login-button')).tap();
      
      // Simulate failed biometric authentication
      await device.simulateBiometricAuthentication(false);
      
      await expect(element(by.text('Authentication failed'))).toBeVisible();
      await expect(element(by.id('login-screen'))).toBeVisible();
    }
  });
});
```

### 3. Accessibility Testing for Mobile
**Focus**: VoiceOver (iOS), TalkBack (Android), Switch Control, Voice Control
**Standards**: iOS/Android accessibility guidelines

#### Mobile Accessibility Testing
```javascript
// Example accessibility testing
describe('Mobile Accessibility', () => {
  it('should be navigable with screen reader', async () => {
    await device.enableAccessibility();
    
    // Navigate using accessibility focus
    await element(by.id('task-input')).focus();
    await expect(element(by.id('task-input'))).toBeFocused();
    
    // Verify accessibility labels
    const taskInput = await element(by.id('task-input'));
    const accessibilityLabel = await taskInput.getAccessibilityLabel();
    expect(accessibilityLabel).toBe('Enter task description');
    
    // Test accessibility actions
    await element(by.id('add-task-button')).performAccessibilityAction('activate');
    await expect(element(by.text('Task description is required'))).toBeVisible();
  });
  
  it('should support dynamic type scaling', async () => {
    // Test with different text sizes
    const textSizes = ['small', 'medium', 'large', 'extraLarge'];
    
    for (const size of textSizes) {
      await device.setTextSize(size);
      await device.reloadReactNative();
      
      // Verify text is still readable and UI doesn't break
      await expect(element(by.id('main-screen'))).toBeVisible();
      await device.takeScreenshot(`text-size-${size}`);
    }
  });
});
```
```

### Mobile Security Testing
```markdown
## Mobile Security Testing Framework

### 1. App Store Compliance Testing
**Focus**: App store guidelines, review requirements, metadata validation
**Tools**: App store validation tools, automated compliance checkers

#### App Store Testing Examples
```javascript
// Example app store compliance testing
describe('App Store Compliance', () => {
  it('should meet iOS App Store requirements', async () => {
    // Test app metadata
    const appInfo = await device.getAppInfo();
    expect(appInfo.displayName).toBeDefined();
    expect(appInfo.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(appInfo.bundleId).toMatch(/^[a-z0-9.-]+$/);
    
    // Test required app icons
    const iconSizes = ['29x29', '40x40', '60x60', '76x76', '83.5x83.5', '1024x1024'];
    for (const size of iconSizes) {
      const iconExists = await device.hasAppIcon(size);
      expect(iconExists).toBe(true);
    }
    
    // Test launch screen
    await device.launchApp();
    const launchScreenDisplayed = await device.hasLaunchScreen();
    expect(launchScreenDisplayed).toBe(true);
  });
  
  it('should meet Google Play Store requirements', async () => {
    const appInfo = await device.getAppInfo();
    
    // Test adaptive icon
    const hasAdaptiveIcon = await device.hasAdaptiveIcon();
    expect(hasAdaptiveIcon).toBe(true);
    
    // Test target SDK version
    expect(appInfo.targetSdkVersion).toBeGreaterThanOrEqual(30);
    
    // Test required permissions
    const permissions = await device.getAppPermissions();
    expect(permissions).not.toContain('android.permission.READ_PHONE_STATE');
    expect(permissions).not.toContain('android.permission.WRITE_EXTERNAL_STORAGE');
  });
  
  it('should handle app store review scenarios', async () => {
    // Test demo account functionality
    await element(by.id('demo-login-button')).tap();
    await expect(element(by.id('dashboard'))).toBeVisible();
    
    // Test all major features are accessible
    const mainFeatures = ['tasks', 'calendar', 'settings', 'profile'];
    for (const feature of mainFeatures) {
      await element(by.id(`${feature}-tab`)).tap();
      await expect(element(by.id(`${feature}-screen`))).toBeVisible();
    }
  });
});
```

### 2. App Security Testing
**Focus**: Data encryption, secure storage, certificate pinning, code obfuscation
**Tools**: OWASP Mobile Security Testing Guide, MobSF, Frida

#### Security Testing Examples
```javascript
// Example secure storage testing
describe('Data Security', () => {
  it('should encrypt sensitive data in storage', async () => {
    const sensitiveData = 'user-auth-token';
    
    // Store sensitive data
    await element(by.id('login-email')).typeText('test@example.com');
    await element(by.id('login-password')).typeText('password123');
    await element(by.id('login-button')).tap();
    
    // Verify data is encrypted in storage
    const storedData = await device.getStorageData('auth-token');
    expect(storedData).not.toBe(sensitiveData); // Should be encrypted
    expect(storedData.length).toBeGreaterThan(sensitiveData.length); // Encrypted data is longer
  });
  
  it('should validate SSL certificates', async () => {
    // Test with invalid certificate
    await device.setNetworkConditions({
      certificateValidation: false,
    });
    
    await element(by.id('sync-button')).tap();
    
    // Should show certificate error
    await expect(element(by.text('Certificate validation failed'))).toBeVisible();
  });
});
```

### 2. Runtime Security Testing
**Focus**: Runtime manipulation, debugging protection, root/jailbreak detection
**Tools**: Runtime analysis tools, device security scanners

#### Runtime Security Testing
```javascript
// Example runtime security test
describe('Runtime Security', () => {
  it('should detect rooted/jailbroken devices', async () => {
    if (await device.isRooted()) {
      await device.launchApp();
      
      // App should show security warning on rooted devices
      await expect(element(by.text('Security Warning'))).toBeVisible();
      await expect(element(by.text('This device appears to be rooted'))).toBeVisible();
    }
  });
  
  it('should prevent debugging in production builds', async () => {
    if (await device.isProductionBuild()) {
      // Attempt to attach debugger should fail
      const debuggerAttached = await device.attemptDebuggerAttachment();
      expect(debuggerAttached).toBe(false);
    }
  });
});
```
```

### Mobile Testing CI/CD Integration
```markdown
## CI/CD Pipeline for Mobile Testing

### GitHub Actions Configuration
```yaml
# .github/workflows/mobile-testing.yml
name: Mobile Testing Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run unit tests
        run: npm run test:unit
      - name: Upload coverage
        uses: codecov/codecov-action@v2

  ios-tests:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Xcode
        uses: maxim-lobanov/setup-xcode@v1
        with:
          xcode-version: latest-stable
      - name: Install dependencies
        run: |
          npm ci
          cd ios && pod install
      - name: Build iOS app
        run: npx react-native build-ios --mode=Release
      - name: Run iOS tests
        run: npm run test:ios

  android-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Java
        uses: actions/setup-java@v2
        with:
          java-version: '11'
          distribution: 'adopt'
      - name: Setup Android SDK
        uses: android-actions/setup-android@v2
      - name: Install dependencies
        run: npm ci
      - name: Build Android app
        run: npx react-native build-android --mode=release
      - name: Run Android tests
        run: npm run test:android

  e2e-tests:
    runs-on: macos-latest
    needs: [unit-tests, ios-tests, android-tests]
    steps:
      - uses: actions/checkout@v2
      - name: Setup environment
        run: |
          npm ci
          npm run build:e2e
      - name: Run Detox E2E tests
        run: npm run test:e2e:ios
      - name: Upload test artifacts
        uses: actions/upload-artifact@v2
        if: failure()
        with:
          name: e2e-artifacts
          path: artifacts/
```

### Device Farm Integration
```javascript
// Example AWS Device Farm integration
const AWS = require('aws-sdk');
const devicefarm = new AWS.DeviceFarm({ region: 'us-west-2' });

async function runDeviceFarmTests() {
  const params = {
    projectArn: 'arn:aws:devicefarm:us-west-2:123456789012:project:your-project-id',
    appArn: 'arn:aws:devicefarm:us-west-2:123456789012:upload:your-app-upload-id',
    devicePoolArn: 'arn:aws:devicefarm:us-west-2:123456789012:devicepool:your-device-pool-id',
    name: 'Automated Test Run',
    type: 'APPIUM_NODE',
    test: {
      type: 'APPIUM_NODE',
      testPackageArn: 'arn:aws:devicefarm:us-west-2:123456789012:upload:your-test-upload-id',
    },
  };
  
  const result = await devicefarm.scheduleRun(params).promise();
  console.log('Test run scheduled:', result.run.arn);
  
  return result.run.arn;
}
```
```

This comprehensive mobile testing strategy ensures thorough validation of mobile applications across different platforms, devices, and scenarios while maintaining high quality standards and security practices.

## Instructions

### How to Use This Mobile Testing Strategy

1. **Select Your Platform Stack**
   - Choose the appropriate testing framework based on your mobile platform (React Native, Flutter, Native iOS/Android)
   - Review the provided code examples for your chosen stack
   - Adapt the test patterns to your specific application architecture

2. **Implement Testing Layers**
   - Start with unit tests for individual components and functions
   - Add integration tests for API calls, storage, and device features
   - Implement E2E tests for critical user workflows
   - Include performance and security testing as needed

3. **Set Up Testing Infrastructure**
   - Configure your chosen testing framework (Jest, Detox, Flutter Test, XCTest, Espresso)
   - Set up device farms or simulators for multi-device testing
   - Integrate testing into your CI/CD pipeline using the provided GitHub Actions configuration

4. **Execute Testing Strategy**
   - Run unit tests during development for immediate feedback
   - Execute integration tests before releases
   - Perform E2E tests on staging environments
   - Conduct performance and security testing periodically

5. **Monitor and Maintain**
   - Review test results and coverage regularly
   - Update tests when adding new features or fixing bugs
   - Maintain device compatibility matrix as new devices are released
   - Keep testing frameworks and tools updated

## Examples

### Complete Testing Setup Example

Here's how to implement a comprehensive mobile testing strategy for a React Native task management app:

#### 1. Project Structure
```
__tests__/
├── unit/
│   ├── components/
│   │   ├── TaskItem.test.js
│   │   └── TaskList.test.js
│   ├── services/
│   │   ├── ApiClient.test.js
│   │   └── TaskStorage.test.js
│   └── utils/
│       └── dateHelpers.test.js
├── integration/
│   ├── api/
│   │   └── taskApi.test.js
│   ├── storage/
│   │   └── taskStorage.test.js
│   └── notifications/
│       └── pushNotifications.test.js
├── e2e/
│   ├── taskManagement.e2e.js
│   ├── userAuthentication.e2e.js
│   └── offlineSync.e2e.js
└── performance/
    ├── appLaunch.perf.js
    └── scrolling.perf.js
```

#### 2. Package.json Test Scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest __tests__/unit",
    "test:integration": "jest __tests__/integration",
    "test:e2e:ios": "detox test --configuration ios.sim.release",
    "test:e2e:android": "detox test --configuration android.emu.release",
    "test:performance": "jest __tests__/performance",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch"
  }
}
```

#### 3. Complete Component Test Example
```javascript
// __tests__/unit/components/TaskItem.test.js
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { TaskItem } from '../../../src/components/TaskItem';

describe('TaskItem Component', () => {
  const mockTask = {
    id: '1',
    title: 'Complete project documentation',
    description: 'Write comprehensive docs for the mobile app',
    completed: false,
    priority: 'high',
    dueDate: '2024-01-15',
    tags: ['work', 'documentation']
  };

  const defaultProps = {
    task: mockTask,
    onToggle: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onLongPress: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render task information correctly', () => {
      const { getByText, getByTestId } = render(<TaskItem {...defaultProps} />);
      
      expect(getByText('Complete project documentation')).toBeTruthy();
      expect(getByText('Write comprehensive docs for the mobile app')).toBeTruthy();
      expect(getByText('high')).toBeTruthy();
      expect(getByTestId('task-checkbox')).toBeTruthy();
    });

    it('should show completed state correctly', () => {
      const completedTask = { ...mockTask, completed: true };
      const { getByTestId } = render(
        <TaskItem {...defaultProps} task={completedTask} />
      );
      
      const checkbox = getByTestId('task-checkbox');
      expect(checkbox.props.accessibilityState.checked).toBe(true);
    });

    it('should display priority badge with correct color', () => {
      const { getByTestId } = render(<TaskItem {...defaultProps} />);
      
      const priorityBadge = getByTestId('priority-badge');
      expect(priorityBadge.props.style).toMatchObject({
        backgroundColor: '#ff4444' // High priority color
      });
    });
  });

  describe('Interactions', () => {
    it('should call onToggle when checkbox is pressed', () => {
      const { getByTestId } = render(<TaskItem {...defaultProps} />);
      
      fireEvent.press(getByTestId('task-checkbox'));
      
      expect(defaultProps.onToggle).toHaveBeenCalledWith('1');
    });

    it('should call onLongPress when item is long pressed', () => {
      const { getByTestId } = render(<TaskItem {...defaultProps} />);
      
      fireEvent(getByTestId('task-item'), 'longPress');
      
      expect(defaultProps.onLongPress).toHaveBeenCalledWith(mockTask);
    });

    it('should call onEdit when edit button is pressed', () => {
      const { getByTestId } = render(<TaskItem {...defaultProps} />);
      
      fireEvent.press(getByTestId('edit-button'));
      
      expect(defaultProps.onEdit).toHaveBeenCalledWith(mockTask);
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      const { getByTestId } = render(<TaskItem {...defaultProps} />);
      
      const checkbox = getByTestId('task-checkbox');
      expect(checkbox.props.accessibilityLabel).toBe('Mark task as complete');
      
      const taskItem = getByTestId('task-item');
      expect(taskItem.props.accessibilityLabel).toBe('Task: Complete project documentation');
    });

    it('should support accessibility actions', () => {
      const { getByTestId } = render(<TaskItem {...defaultProps} />);
      
      const taskItem = getByTestId('task-item');
      expect(taskItem.props.accessibilityActions).toEqual([
        { name: 'activate', label: 'Toggle completion' },
        { name: 'longpress', label: 'Show options' }
      ]);
    });
  });
});
```

#### 4. Complete E2E Test Example
```javascript
// __tests__/e2e/taskManagement.e2e.js
describe('Task Management Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    // Clear any existing data
    await element(by.id('clear-all-tasks')).tap();
  });

  describe('Task Creation', () => {
    it('should create a new task with all details', async () => {
      // Navigate to add task screen
      await element(by.id('add-task-fab')).tap();
      
      // Fill in task details
      await element(by.id('task-title-input')).typeText('E2E Test Task');
      await element(by.id('task-description-input')).typeText('This is a test task created by E2E tests');
      
      // Set priority
      await element(by.id('priority-selector')).tap();
      await element(by.text('High')).tap();
      
      // Set due date
      await element(by.id('due-date-picker')).tap();
      await element(by.text('Tomorrow')).tap();
      
      // Add tags
      await element(by.id('tag-input')).typeText('testing');
      await element(by.id('add-tag-button')).tap();
      
      // Save task
      await element(by.id('save-task-button')).tap();
      
      // Verify task appears in list
      await expect(element(by.text('E2E Test Task'))).toBeVisible();
      await expect(element(by.text('High'))).toBeVisible();
      await expect(element(by.text('testing'))).toBeVisible();
    });

    it('should validate required fields', async () => {
      await element(by.id('add-task-fab')).tap();
      await element(by.id('save-task-button')).tap();
      
      await expect(element(by.text('Title is required'))).toBeVisible();
    });
  });

  describe('Task Management', () => {
    beforeEach(async () => {
      // Create a test task
      await element(by.id('add-task-fab')).tap();
      await element(by.id('task-title-input')).typeText('Test Task');
      await element(by.id('save-task-button')).tap();
    });

    it('should complete and uncomplete tasks', async () => {
      // Mark task as complete
      await element(by.id('task-checkbox-0')).tap();
      
      // Verify task is marked complete
      await expect(element(by.id('completed-task-0'))).toBeVisible();
      
      // Unmark task
      await element(by.id('task-checkbox-0')).tap();
      
      // Verify task is unmarked
      await expect(element(by.id('incomplete-task-0'))).toBeVisible();
    });

    it('should edit existing tasks', async () => {
      // Long press to show options
      await element(by.id('task-item-0')).longPress();
      await element(by.text('Edit')).tap();
      
      // Modify task
      await element(by.id('task-title-input')).clearText();
      await element(by.id('task-title-input')).typeText('Updated Test Task');
      await element(by.id('save-task-button')).tap();
      
      // Verify changes
      await expect(element(by.text('Updated Test Task'))).toBeVisible();
    });

    it('should delete tasks', async () => {
      // Swipe to delete
      await element(by.id('task-item-0')).swipe('left');
      await element(by.id('delete-button-0')).tap();
      
      // Confirm deletion
      await element(by.text('Delete')).tap();
      
      // Verify task is removed
      await expect(element(by.text('Test Task'))).not.toBeVisible();
    });
  });

  describe('Offline Functionality', () => {
    it('should work offline and sync when online', async () => {
      // Go offline
      await device.setNetworkConditions({ offline: true });
      
      // Create task offline
      await element(by.id('add-task-fab')).tap();
      await element(by.id('task-title-input')).typeText('Offline Task');
      await element(by.id('save-task-button')).tap();
      
      // Verify task is saved locally
      await expect(element(by.text('Offline Task'))).toBeVisible();
      await expect(element(by.id('offline-indicator'))).toBeVisible();
      
      // Go back online
      await device.setNetworkConditions({ offline: false });
      
      // Wait for sync
      await waitFor(element(by.id('sync-complete-indicator')))
        .toBeVisible()
        .withTimeout(10000);
      
      // Verify task is synced
      await expect(element(by.id('offline-indicator'))).not.toBeVisible();
    });
  });
});
```

#### 5. CI/CD Integration Example
```yaml
# .github/workflows/mobile-ci.yml
name: Mobile CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: macos-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run unit tests
      run: npm run test:unit -- --coverage
    
    - name: Run integration tests
      run: npm run test:integration
    
    - name: Setup iOS environment
      run: |
        sudo xcode-select -s /Applications/Xcode.app
        cd ios && pod install
    
    - name: Build iOS app for testing
      run: npx react-native build-ios --mode=Release
    
    - name: Run iOS E2E tests
      run: npm run test:e2e:ios
    
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: test-results
        path: |
          coverage/
          artifacts/
          test-results.xml
    
    - name: Upload to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
```

This comprehensive example shows how to implement a complete mobile testing strategy with unit tests, integration tests, E2E tests, and CI/CD integration. The tests cover functionality, accessibility, performance, and offline scenarios while maintaining high code quality and coverage.