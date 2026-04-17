# React Native Technology Stack Module

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
This module provides comprehensive React Native setup patterns with Expo and bare React Native support, optimized for cross-platform mobile development with native performance and platform-specific adaptations. It includes authentication, navigation, offline data management, and platform-specific optimizations for both iOS and Android, while maintaining cost-effective development and deployment strategies.

## Instructions
Use this module to set up React Native projects with optimal cross-platform mobile development practices. Choose between Expo managed workflow for rapid development or bare React Native for advanced native module requirements. Implement the provided authentication patterns with secure storage, set up type-safe navigation with React Navigation, and integrate offline data management with SQLite. Apply platform-specific optimizations for iOS and Android, implement performance optimizations for bundle size and rendering, and configure testing with Jest and React Native Testing Library. Use EAS Build for cost-effective app store deployment.

## Examples

### Basic React Native Setup
```typescript
// App.tsx - Main application setup
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { store } from './store';
import { AppNavigator } from './navigation/AppNavigator';

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </Provider>
  );
}

// package.json dependencies
{
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.72.6",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/native-stack": "^6.9.0",
    "@reduxjs/toolkit": "^1.9.0",
    "react-redux": "^8.0.0",
    "@react-native-async-storage/async-storage": "^1.19.0"
  }
}
```

### Authentication Implementation
```typescript
// useAuthentication.ts - Secure authentication hook
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

const useAuthentication = () => {
  const [user, setUser] = useState<User | null>(null);
  
  const login = async (credentials: LoginCredentials) => {
    try {
      const tokens = await authenticateUser(credentials);
      await SecureStore.setItemAsync('access_token', tokens.access_token);
      
      const userProfile = await fetchUserProfile(tokens.access_token);
      setUser(userProfile);
    } catch (error) {
      throw new Error('Authentication failed');
    }
  };
  
  const authenticateWithBiometrics = async (): Promise<boolean> => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) return false;
    
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access your account',
      fallbackLabel: 'Use passcode'
    });
    
    return result.success;
  };
  
  return { user, login, authenticateWithBiometrics };
};
```

### Platform-Specific Optimizations
```typescript
// PlatformSpecific.tsx - iOS and Android adaptations
import { Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

const PlatformOptimizedComponent: React.FC = () => {
  const insets = useSafeAreaInsets();
  
  const handlePress = () => {
    // iOS haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Android toast notification
    if (Platform.OS === 'android') {
      ToastAndroid.show('Action completed', ToastAndroid.SHORT);
    }
  };
  
  return (
    <View style={{
      paddingTop: Platform.OS === 'ios' ? insets.top : StatusBar.currentHeight,
      backgroundColor: Platform.OS === 'ios' ? '#F2F2F7' : '#FFFFFF',
      elevation: Platform.OS === 'android' ? 4 : 0,
      shadowOpacity: Platform.OS === 'ios' ? 0.3 : 0
    }}>
      <TouchableOpacity onPress={handlePress}>
        <Text>Platform Optimized Button</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### Offline Data Management
```typescript
// OfflineDataManager.ts - SQLite offline storage
import * as SQLite from 'expo-sqlite';
import NetInfo from '@react-native-netinfo/netinfo';

class OfflineDataManager {
  private db: SQLite.WebSQLDatabase;
  
  constructor() {
    this.db = SQLite.openDatabase('app.db');
    this.initializeDatabase();
    this.setupNetworkListener();
  }
  
  async storeData<T>(key: string, data: T): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'INSERT OR REPLACE INTO offline_data (id, data, timestamp) VALUES (?, ?, ?)',
          [key, JSON.stringify(data), Date.now()],
          () => resolve(),
          (_, error) => reject(error)
        );
      });
    });
  }
  
  private setupNetworkListener() {
    NetInfo.addEventListener(state => {
      if (state.isConnected) {
        this.processSyncQueue();
      }
    });
  }
}
```

## Overview
Comprehensive React Native setup with Expo and bare React Native support, optimized for cross-platform mobile development with native performance and platform-specific adaptations.

## Technology Stack Configuration

### Core Technologies
- **React Native**: {{rn_version}} (default: 0.72.x)
- **TypeScript**: Latest stable version for type safety
- **Development Framework**: Expo (managed) or bare React Native based on native module needs
- **Navigation**: React Navigation v6 with native stack and tab navigators
- **State Management**: Redux Toolkit or Zustand with AsyncStorage persistence

### Development Environment Setup
```json
{
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.72.6",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/native-stack": "^6.9.0",
    "@react-navigation/bottom-tabs": "^6.5.0",
    "@reduxjs/toolkit": "^1.9.0",
    "react-redux": "^8.0.0",
    "@react-native-async-storage/async-storage": "^1.19.0",
    "react-native-safe-area-context": "^4.7.0",
    "react-native-screens": "^3.25.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-native": "^0.72.0",
    "@typescript-eslint/eslint-plugin": "^5.52.0",
    "metro-react-native-babel-preset": "^0.76.0",
    "typescript": "^4.9.0"
  }
}
```

### Expo Configuration (Recommended for most projects)
```json
// app.json
{
  "expo": {
    "name": "{{app_name}}",
    "slug": "{{app_slug}}",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "{{bundle_id}}",
      "buildNumber": "1"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "{{package_name}}",
      "versionCode": 1
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-secure-store",
      "expo-notifications",
      "expo-camera",
      "expo-location"
    ]
  }
}
```

## Feature Adaptations

### Authentication Integration
```typescript
// React Native OAuth with secure storage
import * as SecureStore from 'expo-secure-store';
import * as AuthSession from 'expo-auth-session';
import { useAuthRequest } from 'expo-auth-session';

const useAuthentication = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const discovery = AuthSession.useAutoDiscovery('{{auth_provider_url}}');
  
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: '{{client_id}}',
      scopes: ['openid', 'profile', 'email'],
      redirectUri: AuthSession.makeRedirectUri({
        scheme: '{{app_scheme}}'
      }),
    },
    discovery
  );
  
  useEffect(() => {
    if (response?.type === 'success') {
      handleAuthSuccess(response.params.code);
    }
  }, [response]);
  
  const handleAuthSuccess = async (code: string) => {
    try {
      const tokens = await exchangeCodeForTokens(code);
      await SecureStore.setItemAsync('access_token', tokens.access_token);
      await SecureStore.setItemAsync('refresh_token', tokens.refresh_token);
      
      const userProfile = await fetchUserProfile(tokens.access_token);
      setUser(userProfile);
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  };
  
  const logout = async () => {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    setUser(null);
  };
  
  return {
    user,
    isLoading,
    login: () => promptAsync(),
    logout
  };
};

// Biometric authentication
import * as LocalAuthentication from 'expo-local-authentication';

const useBiometricAuth = () => {
  const authenticateWithBiometrics = async (): Promise<boolean> => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) return false;
    
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!isEnrolled) return false;
    
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access your account',
      fallbackLabel: 'Use passcode',
      disableDeviceFallback: false
    });
    
    return result.success;
  };
  
  return { authenticateWithBiometrics };
};
```

### Navigation Setup
```typescript
// Type-safe navigation with React Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Profile: { userId: string };
};

type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        const iconName = getTabIcon(route.name, focused);
        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: 'gray',
      headerShown: false
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Search" component={SearchScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { user } = useAuthentication();
  
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

### Implementation Guidelines

### Offline Data Management
```typescript
// React Native offline storage with SQLite
import * as SQLite from 'expo-sqlite';
import NetInfo from '@react-native-netinfo/netinfo';

class OfflineDataManager {
  private db: SQLite.WebSQLDatabase;
  private syncQueue: OfflineOperation[] = [];
  
  constructor() {
    this.db = SQLite.openDatabase('app.db');
    this.initializeDatabase();
    this.setupNetworkListener();
  }
  
  private initializeDatabase() {
    this.db.transaction(tx => {
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS offline_data (
          id TEXT PRIMARY KEY,
          data TEXT NOT NULL,
          timestamp INTEGER NOT NULL,
          synced INTEGER DEFAULT 0
        )
      `);
      
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS sync_queue (
          id TEXT PRIMARY KEY,
          operation TEXT NOT NULL,
          data TEXT NOT NULL,
          timestamp INTEGER NOT NULL
        )
      `);
    });
  }
  
  async storeData<T>(key: string, data: T): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'INSERT OR REPLACE INTO offline_data (id, data, timestamp) VALUES (?, ?, ?)',
          [key, JSON.stringify(data), Date.now()],
          () => resolve(),
          (_, error) => reject(error)
        );
      });
    });
  }
  
  async getData<T>(key: string): Promise<T | null> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT data FROM offline_data WHERE id = ?',
          [key],
          (_, result) => {
            if (result.rows.length > 0) {
              resolve(JSON.parse(result.rows.item(0).data));
            } else {
              resolve(null);
            }
          },
          (_, error) => reject(error)
        );
      });
    });
  }
  
  private setupNetworkListener() {
    NetInfo.addEventListener(state => {
      if (state.isConnected) {
        this.processSyncQueue();
      }
    });
  }
}
```

## Platform-Specific Optimizations

### iOS Specific Features
```typescript
// iOS-specific UI adaptations
import { Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const IOSSpecificComponent: React.FC = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={{
      paddingTop: Platform.OS === 'ios' ? insets.top : StatusBar.currentHeight,
      backgroundColor: Platform.OS === 'ios' ? '#F2F2F7' : '#FFFFFF'
    }}>
      {Platform.OS === 'ios' && (
        <StatusBar barStyle="dark-content" backgroundColor="transparent" />
      )}
      {/* Content */}
    </View>
  );
};

// iOS haptic feedback
import * as Haptics from 'expo-haptics';

const useIOSHaptics = () => {
  const lightImpact = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  const success = () => {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };
  
  return { lightImpact, success };
};
```

### Android Specific Features
```typescript
// Android-specific UI adaptations
import { BackHandler, ToastAndroid } from 'react-native';

const AndroidSpecificComponent: React.FC = () => {
  useEffect(() => {
    const backAction = () => {
      if (Platform.OS === 'android') {
        ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
        return true; // Prevent default behavior
      }
      return false;
    };
    
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);
  
  return (
    <View style={{
      elevation: Platform.OS === 'android' ? 4 : 0,
      shadowOpacity: Platform.OS === 'ios' ? 0.3 : 0
    }}>
      {/* Content */}
    </View>
  );
};

// Android permissions handling
import * as Permissions from 'expo-permissions';

const useAndroidPermissions = () => {
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      const { status } = await Permissions.askAsync(Permissions.CAMERA);
      return status === 'granted';
    }
    return true;
  };
  
  return { requestCameraPermission };
};
```

## Performance Optimization

### Bundle Size and Performance
```typescript
// Lazy loading and code splitting
import { lazy, Suspense } from 'react';

const LazyScreen = lazy(() => import('./screens/LazyScreen'));

const AppWithLazyLoading = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <LazyScreen />
  </Suspense>
);

// Image optimization
import { Image } from 'expo-image';

const OptimizedImage: React.FC<{ uri: string }> = ({ uri }) => (
  <Image
    source={{ uri }}
    style={{ width: 200, height: 200 }}
    contentFit="cover"
    transition={200}
    cachePolicy="memory-disk"
  />
);

// FlatList optimization
const OptimizedList: React.FC<{ data: Item[] }> = ({ data }) => (
  <FlatList
    data={data}
    renderItem={({ item }) => <ListItem item={item} />}
    keyExtractor={(item) => item.id}
    getItemLayout={(data, index) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    })}
    removeClippedSubviews={true}
    maxToRenderPerBatch={10}
    windowSize={10}
    initialNumToRender={10}
  />
);
```

## Cost Optimization Strategies

### App Store Optimization
```typescript
// Expo EAS Build configuration for cost optimization
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
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}

// Bundle size optimization
const optimizeBundle = {
  // Use Hermes engine for Android
  android: {
    enableHermes: true
  },
  // Enable new architecture
  newArchEnabled: true,
  // Optimize images
  assetBundlePatterns: [
    "assets/images/*.png",
    "assets/fonts/*.ttf"
  ]
};
```

## Testing Configuration

### Jest and React Native Testing Library
```typescript
// jest.config.js
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo|@react-navigation)/)'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}'
  ]
};

// Component testing
import { render, fireEvent, waitFor } from '@testing-library/react-native';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <NavigationContainer>
      <Provider store={store}>
        {ui}
      </Provider>
    </NavigationContainer>
  );
};

test('should handle user interaction', async () => {
  const { getByTestId } = renderWithProviders(<MyComponent />);
  
  fireEvent.press(getByTestId('submit-button'));
  
  await waitFor(() => {
    expect(getByTestId('success-message')).toBeTruthy();
  });
});
```

## Configuration Variables
- `{{rn_version}}` - React Native version (default: 0.72.x)
- `{{expo_managed}}` - Use Expo managed workflow (true/false)
- `{{app_name}}` - Application display name
- `{{bundle_id}}` - iOS bundle identifier
- `{{package_name}}` - Android package name
- `{{deployment_platform}}` - Deployment method (expo, eas, manual)

## Dependencies
- React Native 0.72+
- Expo SDK (if using managed workflow)
- React Navigation v6
- AsyncStorage for persistence
- Platform-specific native modules as needed

## Documentation Requirements
- Platform-specific implementation guides
- Navigation structure documentation
- Offline functionality documentation
- Performance optimization guidelines
- App store submission procedures
