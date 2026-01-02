# Stage 06 - Implementation: Mobile Platform Implementation

## Purpose
Define mobile-specific implementation strategies, development workflows, and deployment processes that build upon the platform-agnostic implementation foundation.

## Instructions
Use this stage to establish mobile-specific implementation practices including native build processes, device testing, app store requirements, and mobile performance optimization.

## Examples
```markdown
## Example Mobile Implementation

### Project: Task Management Mobile App
**Framework**: React Native with TypeScript
**Testing**: Jest + React Native Testing Library + Detox
**Deployment**: EAS Build with automatic app store submission
**Performance**: Native module optimization, memory management, battery efficiency

### Implementation Workflow
1. Component development with React Native Storybook
2. Unit testing with React Native Testing Library
3. Integration testing with mock native modules
4. E2E testing with Detox on simulators/emulators
5. Performance testing with Flipper
6. App store deployment with EAS
```

## Mobile Implementation Strategy

### React Native Build Process
```typescript
// Metro configuration for React Native
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable Hermes for better performance
config.transformer.hermesCommand = 'hermes';

// Optimize bundle size
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config;

// EAS Build configuration
// eas.json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "ios": {
        "autoIncrement": true
      },
      "android": {
        "autoIncrement": true
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890"
      },
      "android": {
        "serviceAccountKeyPath": "./service-account-key.json",
        "track": "production"
      }
    }
  }
}
```

### Mobile-Specific Testing
```typescript
// React Native component testing
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TaskCard } from './TaskCard';

describe('TaskCard', () => {
  const mockTask = {
    id: '1',
    title: 'Test Task',
    status: 'todo',
    priority: 'medium',
  };

  it('renders task information correctly', () => {
    const { getByText } = render(<TaskCard task={mockTask} />);
    
    expect(getByText('Test Task')).toBeTruthy();
    expect(getByText('medium')).toBeTruthy();
  });

  it('handles swipe gestures', () => {
    const onSwipe = jest.fn();
    const { getByTestId } = render(
      <TaskCard task={mockTask} onSwipe={onSwipe} />
    );
    
    fireEvent(getByTestId('task-card'), 'swipeLeft');
    expect(onSwipe).toHaveBeenCalledWith('left');
  });
});

// Detox E2E testing
describe('Task Management Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should create and complete a task', async () => {
    // Navigate to task creation
    await element(by.id('new-task-button')).tap();
    
    // Fill task details
    await element(by.id('task-title-input')).typeText('E2E Test Task');
    await element(by.id('task-description-input')).typeText('Test Description');
    
    // Save task
    await element(by.id('save-task-button')).tap();
    
    // Verify task appears in list
    await expect(element(by.text('E2E Test Task'))).toBeVisible();
    
    // Complete task with swipe gesture
    await element(by.id('task-item-1')).swipe('right');
    await element(by.id('complete-action')).tap();
    
    // Verify task is marked complete
    await expect(element(by.id('completed-task-1'))).toBeVisible();
  });

  it('should handle offline scenarios', async () => {
    // Disable network
    await device.setNetworkConditions({ offline: true });
    
    // Create task offline
    await element(by.id('new-task-button')).tap();
    await element(by.id('task-title-input')).typeText('Offline Task');
    await element(by.id('save-task-button')).tap();
    
    // Verify offline indicator
    await expect(element(by.id('offline-indicator'))).toBeVisible();
    
    // Re-enable network
    await device.setNetworkConditions({ offline: false });
    
    // Verify sync occurs
    await waitFor(element(by.id('sync-complete')))
      .toBeVisible()
      .withTimeout(10000);
  });
});
```

### Mobile Performance Optimization
```typescript
// Memory management and performance
import { InteractionManager, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Optimize initial render
  useFocusEffect(
    useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        loadTasks();
      });

      return () => task.cancel();
    }, [])
  );

  // Optimize list rendering
  const renderTask = useCallback(({ item }: { item: Task }) => (
    <TaskCard task={item} />
  ), []);

  const keyExtractor = useCallback((item: Task) => item.id, []);

  const getItemLayout = useCallback(
    (data: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  return (
    <FlatList
      data={tasks}
      renderItem={renderTask}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
      updateCellsBatchingPeriod={50}
    />
  );
}

// Native module optimization
import { NativeModules, Platform } from 'react-native';

const { TaskNativeModule } = NativeModules;

class TaskService {
  async performHeavyCalculation(data: any[]): Promise<any> {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      // Use native module for heavy computation
      return await TaskNativeModule.performCalculation(data);
    } else {
      // Fallback to JavaScript implementation
      return this.jsCalculation(data);
    }
  }

  private jsCalculation(data: any[]): any {
    // JavaScript fallback implementation
    return data.reduce((acc, item) => acc + item.value, 0);
  }
}
```

### Mobile Deployment Strategy
```yaml
# GitHub Actions for mobile deployment
name: Mobile Deployment

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm run test

  build-ios:
    needs: test
    runs-on: macos-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Setup Expo
        uses: expo/expo-github-action@v7
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - name: Install dependencies
        run: npm ci
      - name: Build iOS app
        run: eas build --platform ios --non-interactive
      - name: Submit to App Store
        run: eas submit --platform ios --non-interactive

  build-android:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Setup Expo
        uses: expo/expo-github-action@v7
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - name: Install dependencies
        run: npm ci
      - name: Build Android app
        run: eas build --platform android --non-interactive
      - name: Submit to Google Play
        run: eas submit --platform android --non-interactive
```

### App Store Optimization
```typescript
// App store metadata and assets
// app.json
{
  "expo": {
    "name": "Task Management",
    "slug": "task-management",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.example.taskmanagement",
      "buildNumber": "1",
      "infoPlist": {
        "NSCameraUsageDescription": "This app uses camera to capture task attachments",
        "NSLocationWhenInUseUsageDescription": "This app uses location for location-based reminders"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.example.taskmanagement",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "ACCESS_FINE_LOCATION",
        "RECEIVE_BOOT_COMPLETED"
      ]
    }
  }
}

// App store screenshots automation
import { device, element, by, expect } from 'detox';

describe('App Store Screenshots', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should capture main screens for app store', async () => {
    // Dashboard screenshot
    await element(by.id('dashboard-tab')).tap();
    await device.takeScreenshot('01-dashboard');

    // Task list screenshot
    await element(by.id('tasks-tab')).tap();
    await device.takeScreenshot('02-task-list');

    // Task creation screenshot
    await element(by.id('new-task-button')).tap();
    await device.takeScreenshot('03-task-creation');

    // Project view screenshot
    await element(by.id('cancel-button')).tap();
    await element(by.id('projects-tab')).tap();
    await device.takeScreenshot('04-projects');
  });
});
```

## Next Steps
- **Stage 07 - Deployment**: Mobile-specific deployment and app store strategies
- **Performance Monitoring**: Mobile performance tracking and optimization
- **Device Testing**: Cross-device compatibility and testing strategies
- **App Store Submission**: App store requirements and submission process