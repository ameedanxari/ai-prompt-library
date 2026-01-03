# GPS Tracking and Real-Time Location Services

## Purpose
Implement comprehensive GPS tracking and real-time location sharing capabilities for location-based applications including ride-sharing, delivery services, fleet management, and social location features.

## Context
This template provides patterns for accurate location tracking, real-time position updates, location history management, and privacy-compliant location sharing across mobile and web platforms.

## Implementation Approach

### Core Location Tracking System

```typescript
interface LocationTrackingService {
  // Real-time location tracking
  startTracking(userId: string, options: TrackingOptions): Promise<TrackingSession>;
  stopTracking(sessionId: string): Promise<void>;
  updateLocation(sessionId: string, location: LocationData): Promise<void>;
  getCurrentLocation(userId: string): Promise<LocationData>;
  
  // Location history and analytics
  getLocationHistory(userId: string, timeRange: TimeRange): Promise<LocationHistory>;
  getLocationAnalytics(userId: string): Promise<LocationAnalytics>;
  
  // Real-time location sharing
  shareLocation(userId: string, shareWith: string[], duration: number): Promise<SharingSession>;
  stopSharing(sessionId: string): Promise<void>;
  getSharedLocations(userId: string): Promise<SharedLocation[]>;
}

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp: Date;
  source: LocationSource;
}

interface TrackingOptions {
  accuracy: 'high' | 'medium' | 'low';
  updateInterval: number; // milliseconds
  distanceFilter: number; // meters
  backgroundTracking: boolean;
  batteryOptimization: boolean;
}
```

### Location Data Management

```typescript
interface LocationDataManager {
  // Location storage and retrieval
  storeLocation(userId: string, location: LocationData): Promise<void>;
  getRecentLocations(userId: string, limit: number): Promise<LocationData[]>;
  
  // Location processing and validation
  validateLocation(location: LocationData): ValidationResult;
  smoothLocationData(locations: LocationData[]): LocationData[];
  calculateDistance(from: LocationData, to: LocationData): number;
  calculateRoute(waypoints: LocationData[]): Promise<RouteData>;
  
  // Privacy and data management
  anonymizeLocation(location: LocationData): AnonymizedLocation;
  deleteLocationHistory(userId: string, beforeDate: Date): Promise<void>;
  exportLocationData(userId: string): Promise<LocationExport>;
}

interface RouteData {
  distance: number;
  duration: number;
  waypoints: LocationData[];
  polyline: string;
  instructions: RouteInstruction[];
}
```

### Real-Time Location Broadcasting

```typescript
interface LocationBroadcastService {
  // WebSocket-based real-time updates
  subscribeToLocation(userId: string, callback: LocationUpdateCallback): Subscription;
  broadcastLocation(userId: string, location: LocationData): Promise<void>;
  
  // Group location sharing
  createLocationGroup(groupId: string, members: string[]): Promise<LocationGroup>;
  joinLocationGroup(userId: string, groupId: string): Promise<void>;
  leaveLocationGroup(userId: string, groupId: string): Promise<void>;
  
  // Location-based notifications
  setupLocationAlerts(userId: string, alerts: LocationAlert[]): Promise<void>;
  triggerProximityAlert(location: LocationData): Promise<void>;
}

interface LocationAlert {
  id: string;
  type: 'arrival' | 'departure' | 'proximity';
  location: LocationData;
  radius: number;
  message: string;
  recipients: string[];
}
```

## Platform-Specific Implementation

### Mobile Implementation (React Native)

```javascript
// Location tracking with react-native-geolocation-service
import Geolocation from 'react-native-geolocation-service';
import BackgroundJob from '@react-native-async-storage/async-storage';

class MobileLocationTracker {
  async startTracking(options) {
    const permission = await this.requestLocationPermission();
    if (!permission) throw new Error('Location permission denied');
    
    return Geolocation.watchPosition(
      (position) => this.handleLocationUpdate(position),
      (error) => this.handleLocationError(error),
      {
        accuracy: {
          android: 'high',
          ios: 'best'
        },
        enableHighAccuracy: options.accuracy === 'high',
        distanceFilter: options.distanceFilter,
        interval: options.updateInterval,
        fastestInterval: options.updateInterval / 2,
        forceRequestLocation: true,
        showLocationDialog: true,
      }
    );
  }
  
  async requestLocationPermission() {
    // Platform-specific permission handling
    if (Platform.OS === 'ios') {
      return await Geolocation.requestAuthorization('whenInUse');
    } else {
      return await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
    }
  }
  
  handleLocationUpdate(position) {
    const locationData = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      heading: position.coords.heading,
      speed: position.coords.speed,
      timestamp: new Date(position.timestamp),
      source: 'gps'
    };
    
    this.broadcastLocation(locationData);
    this.storeLocation(locationData);
  }
}
```

### Web Implementation

```javascript
// Browser-based location tracking
class WebLocationTracker {
  constructor() {
    this.watchId = null;
    this.isTracking = false;
  }
  
  async startTracking(options) {
    if (!navigator.geolocation) {
      throw new Error('Geolocation not supported');
    }
    
    const geoOptions = {
      enableHighAccuracy: options.accuracy === 'high',
      timeout: 10000,
      maximumAge: options.updateInterval
    };
    
    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.handleLocationUpdate(position),
      (error) => this.handleLocationError(error),
      geoOptions
    );
    
    this.isTracking = true;
    return { sessionId: this.generateSessionId(), watchId: this.watchId };
  }
  
  stopTracking() {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.isTracking = false;
    }
  }
  
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(this.formatLocationData(position)),
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }
}
```

## Location Privacy and Security

### Privacy Controls

```typescript
interface LocationPrivacyManager {
  // Privacy settings
  setLocationSharingPreferences(userId: string, preferences: PrivacyPreferences): Promise<void>;
  getLocationSharingPreferences(userId: string): Promise<PrivacyPreferences>;
  
  // Data anonymization
  anonymizeLocationData(location: LocationData): AnonymizedLocation;
  createLocationHash(location: LocationData): string;
  
  // Consent management
  requestLocationConsent(userId: string, purpose: string): Promise<ConsentResult>;
  revokeLocationConsent(userId: string): Promise<void>;
  
  // Data retention
  scheduleLocationDataCleanup(userId: string, retentionPeriod: number): Promise<void>;
  deleteLocationData(userId: string, criteria: DeletionCriteria): Promise<void>;
}

interface PrivacyPreferences {
  shareRealTimeLocation: boolean;
  shareLocationHistory: boolean;
  allowLocationAnalytics: boolean;
  dataRetentionPeriod: number; // days
  allowedRecipients: string[];
  restrictedAreas: GeofenceArea[];
}
```

### Security Implementation

```typescript
interface LocationSecurityService {
  // Location data encryption
  encryptLocationData(location: LocationData): EncryptedLocation;
  decryptLocationData(encrypted: EncryptedLocation): LocationData;
  
  // Access control
  validateLocationAccess(userId: string, requesterId: string): Promise<boolean>;
  logLocationAccess(userId: string, requesterId: string, action: string): Promise<void>;
  
  // Fraud detection
  detectLocationFraud(userId: string, location: LocationData): Promise<FraudResult>;
  validateLocationConsistency(locations: LocationData[]): ValidationResult;
}
```

## Performance Optimization

### Battery and Resource Management

```typescript
interface LocationOptimizationService {
  // Adaptive tracking
  adjustTrackingFrequency(batteryLevel: number, movementSpeed: number): TrackingOptions;
  optimizeForBattery(currentOptions: TrackingOptions): TrackingOptions;
  
  // Intelligent location updates
  shouldUpdateLocation(newLocation: LocationData, lastLocation: LocationData): boolean;
  filterSignificantLocationChanges(locations: LocationData[]): LocationData[];
  
  // Caching and offline support
  cacheLocationData(locations: LocationData[]): Promise<void>;
  syncCachedLocations(): Promise<void>;
  getOfflineCapabilities(): OfflineCapabilities;
}
```

### Location Data Processing

```typescript
interface LocationProcessingService {
  // Location smoothing and filtering
  smoothGPSData(rawLocations: LocationData[]): LocationData[];
  filterLocationNoise(locations: LocationData[], threshold: number): LocationData[];
  
  // Route optimization
  optimizeRoute(waypoints: LocationData[]): Promise<OptimizedRoute>;
  calculateETA(from: LocationData, to: LocationData, mode: TransportMode): Promise<number>;
  
  // Location clustering
  clusterLocations(locations: LocationData[], radius: number): LocationCluster[];
  identifyFrequentLocations(userId: string): Promise<FrequentLocation[]>;
}
```

## Integration Examples

### Ride-Sharing Integration

```typescript
// Example: Ride-sharing location tracking
class RideShareLocationService {
  async trackRide(rideId: string, driverId: string, passengerId: string) {
    // Start tracking driver location
    const driverTracking = await this.locationService.startTracking(driverId, {
      accuracy: 'high',
      updateInterval: 5000,
      backgroundTracking: true,
      batteryOptimization: false
    });
    
    // Share driver location with passenger
    await this.locationService.shareLocation(driverId, [passengerId], 3600);
    
    // Set up arrival notifications
    await this.setupRideNotifications(rideId, driverId, passengerId);
    
    return { driverTracking, rideId };
  }
  
  async setupRideNotifications(rideId: string, driverId: string, passengerId: string) {
    const ride = await this.getRideDetails(rideId);
    
    // Driver approaching pickup
    await this.locationService.setupLocationAlerts(driverId, [{
      id: `pickup-${rideId}`,
      type: 'proximity',
      location: ride.pickupLocation,
      radius: 100,
      message: 'Driver approaching pickup location',
      recipients: [passengerId]
    }]);
    
    // Arrival at destination
    await this.locationService.setupLocationAlerts(driverId, [{
      id: `destination-${rideId}`,
      type: 'arrival',
      location: ride.destinationLocation,
      radius: 50,
      message: 'Arrived at destination',
      recipients: [passengerId, driverId]
    }]);
  }
}
```

### Delivery Tracking Integration

```typescript
// Example: Delivery tracking
class DeliveryLocationService {
  async trackDelivery(orderId: string, driverId: string, customerId: string) {
    // Start delivery tracking
    const tracking = await this.locationService.startTracking(driverId, {
      accuracy: 'high',
      updateInterval: 10000,
      backgroundTracking: true,
      batteryOptimization: true
    });
    
    // Create delivery route
    const order = await this.getOrderDetails(orderId);
    const route = await this.locationService.calculateRoute([
      order.pickupLocation,
      order.deliveryLocation
    ]);
    
    // Share tracking with customer
    await this.locationService.shareLocation(driverId, [customerId], 7200);
    
    return { tracking, route, orderId };
  }
  
  async updateDeliveryStatus(orderId: string, status: DeliveryStatus, location: LocationData) {
    await this.deliveryService.updateStatus(orderId, status);
    await this.locationService.updateLocation(orderId, location);
    
    // Notify customer of status change
    await this.notificationService.sendDeliveryUpdate(orderId, status, location);
  }
}
```

## Testing Strategy

### Unit Tests

```typescript
describe('GPS Tracking Service', () => {
  test('should start location tracking with correct options', async () => {
    const options = {
      accuracy: 'high',
      updateInterval: 5000,
      distanceFilter: 10,
      backgroundTracking: true,
      batteryOptimization: false
    };
    
    const session = await locationService.startTracking('user123', options);
    expect(session.sessionId).toBeDefined();
    expect(session.isActive).toBe(true);
  });
  
  test('should validate location data accuracy', () => {
    const location = {
      latitude: 37.7749,
      longitude: -122.4194,
      accuracy: 5,
      timestamp: new Date(),
      source: 'gps'
    };
    
    const result = locationService.validateLocation(location);
    expect(result.isValid).toBe(true);
  });
  
  test('should handle location permission denial', async () => {
    mockLocationPermission(false);
    
    await expect(locationService.startTracking('user123', {}))
      .rejects.toThrow('Location permission denied');
  });
});
```

### Integration Tests

```typescript
describe('Location Tracking Integration', () => {
  test('should track and share location in real-time', async () => {
    const userId = 'user123';
    const shareWithId = 'user456';
    
    // Start tracking
    const tracking = await locationService.startTracking(userId, defaultOptions);
    
    // Share location
    const sharing = await locationService.shareLocation(userId, [shareWithId], 3600);
    
    // Simulate location update
    const location = createMockLocation();
    await locationService.updateLocation(tracking.sessionId, location);
    
    // Verify shared location is updated
    const sharedLocations = await locationService.getSharedLocations(shareWithId);
    expect(sharedLocations).toContainEqual(expect.objectContaining({
      userId,
      location: expect.objectContaining(location)
    }));
  });
});
```

## Error Handling

### Location Service Errors

```typescript
class LocationServiceError extends Error {
  constructor(message: string, public code: LocationErrorCode, public details?: any) {
    super(message);
    this.name = 'LocationServiceError';
  }
}

enum LocationErrorCode {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  POSITION_UNAVAILABLE = 'POSITION_UNAVAILABLE',
  TIMEOUT = 'TIMEOUT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_LOCATION = 'INVALID_LOCATION',
  TRACKING_FAILED = 'TRACKING_FAILED'
}

interface LocationErrorHandler {
  handleLocationError(error: LocationServiceError): Promise<void>;
  retryLocationRequest(request: LocationRequest): Promise<LocationData>;
  fallbackToLastKnownLocation(userId: string): Promise<LocationData>;
}
```

## Configuration

### Environment Variables

```bash
# Location service configuration
LOCATION_TRACKING_ENABLED=true
LOCATION_UPDATE_INTERVAL=5000
LOCATION_ACCURACY_THRESHOLD=10
LOCATION_HISTORY_RETENTION_DAYS=30

# Privacy and security
LOCATION_ENCRYPTION_KEY=your-encryption-key
LOCATION_DATA_ANONYMIZATION=true
LOCATION_CONSENT_REQUIRED=true

# Performance optimization
LOCATION_BATTERY_OPTIMIZATION=true
LOCATION_BACKGROUND_TRACKING=true
LOCATION_CACHE_SIZE=1000
```

### Service Configuration

```typescript
interface LocationServiceConfig {
  tracking: {
    defaultAccuracy: 'high' | 'medium' | 'low';
    defaultUpdateInterval: number;
    maxTrackingSessions: number;
    backgroundTrackingEnabled: boolean;
  };
  
  privacy: {
    encryptionEnabled: boolean;
    anonymizationEnabled: boolean;
    consentRequired: boolean;
    dataRetentionDays: number;
  };
  
  performance: {
    batteryOptimization: boolean;
    cacheSize: number;
    maxConcurrentRequests: number;
    requestTimeout: number;
  };
}
```

## Best Practices

1. **Battery Optimization**: Implement adaptive tracking frequency based on device battery level and movement patterns
2. **Privacy First**: Always request explicit consent and provide granular privacy controls
3. **Accuracy Management**: Balance location accuracy with battery consumption and update frequency
4. **Error Handling**: Implement robust error handling for permission denials, network issues, and GPS unavailability
5. **Data Security**: Encrypt location data in transit and at rest, implement access controls
6. **Performance**: Use location caching, implement efficient data structures, optimize for mobile networks
7. **User Experience**: Provide clear location sharing indicators, easy privacy controls, and transparent data usage
8. **Compliance**: Ensure GDPR, CCPA, and other privacy regulation compliance for location data handling

This template provides a comprehensive foundation for implementing GPS tracking and real-time location services in any location-based application while maintaining privacy, security, and performance standards.