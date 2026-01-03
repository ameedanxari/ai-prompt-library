# Geofencing and Location-Based Triggers

## Purpose
Implement comprehensive geofencing capabilities for location-based triggers, proximity detection, and automated actions in location-aware applications including delivery services, fleet management, security systems, and location-based marketing.

## Context
This template provides patterns for creating virtual boundaries, monitoring location changes, triggering automated actions based on geographic areas, and managing complex geofencing scenarios with high accuracy and performance.

## Implementation Approach

### Core Geofencing Service

```typescript
interface GeofencingService {
  // Geofence management
  createGeofence(geofence: GeofenceDefinition): Promise<string>;
  updateGeofence(geofenceId: string, updates: Partial<GeofenceDefinition>): Promise<void>;
  deleteGeofence(geofenceId: string): Promise<void>;
  getGeofence(geofenceId: string): Promise<GeofenceDefinition>;
  
  // Location monitoring
  startMonitoring(userId: string, geofenceIds: string[]): Promise<MonitoringSession>;
  stopMonitoring(sessionId: string): Promise<void>;
  checkLocation(location: LocationData, geofenceIds: string[]): Promise<GeofenceStatus[]>;
  
  // Event handling
  onGeofenceEnter(callback: GeofenceEventCallback): Subscription;
  onGeofenceExit(callback: GeofenceEventCallback): Subscription;
  onGeofenceDwell(callback: GeofenceEventCallback): Subscription;
  
  // Bulk operations
  createMultipleGeofences(geofences: GeofenceDefinition[]): Promise<string[]>;
  getGeofencesInArea(bounds: GeographicBounds): Promise<GeofenceDefinition[]>;
  getActiveGeofences(userId: string): Promise<GeofenceDefinition[]>;
}

interface GeofenceDefinition {
  id: string;
  name: string;
  description?: string;
  shape: GeofenceShape;
  triggers: GeofenceTrigger[];
  metadata: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface GeofenceShape {
  type: 'circle' | 'polygon' | 'rectangle';
  coordinates: LocationData[];
  radius?: number; // for circle type
  center?: LocationData; // for circle type
}

interface GeofenceTrigger {
  event: 'enter' | 'exit' | 'dwell';
  dwellTime?: number; // milliseconds for dwell events
  actions: GeofenceAction[];
  conditions?: GeofenceCondition[];
}
```

### Advanced Geofencing Features

```typescript
interface AdvancedGeofencingService {
  // Complex geofences
  createHierarchicalGeofence(parent: string, children: GeofenceDefinition[]): Promise<string>;
  createTimeBasedGeofence(geofence: GeofenceDefinition, schedule: TimeSchedule): Promise<string>;
  createConditionalGeofence(geofence: GeofenceDefinition, conditions: GeofenceCondition[]): Promise<string>;
  
  // Proximity detection
  createProximityAlert(targetLocation: LocationData, radius: number, userId: string): Promise<string>;
  detectNearbyUsers(location: LocationData, radius: number): Promise<NearbyUser[]>;
  calculateProximity(location1: LocationData, location2: LocationData): Promise<ProximityResult>;
  
  // Dynamic geofences
  createMovingGeofence(targetId: string, radius: number, followerId: string): Promise<string>;
  updateGeofenceLocation(geofenceId: string, newLocation: LocationData): Promise<void>;
  
  // Analytics and insights
  getGeofenceAnalytics(geofenceId: string, timeRange: TimeRange): Promise<GeofenceAnalytics>;
  getLocationHeatmap(geofenceIds: string[], timeRange: TimeRange): Promise<HeatmapData>;
  generateGeofenceReport(criteria: ReportCriteria): Promise<GeofenceReport>;
}

interface TimeSchedule {
  startTime: string; // HH:MM format
  endTime: string;
  daysOfWeek: number[]; // 0-6, Sunday = 0
  timezone: string;
  exceptions: Date[]; // dates when geofence is inactive
}

interface GeofenceCondition {
  type: 'time' | 'weather' | 'user_attribute' | 'device_state' | 'custom';
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  value: any;
  field: string;
}
```

### Location Monitoring Engine

```typescript
interface LocationMonitoringEngine {
  // Real-time monitoring
  startRealTimeMonitoring(userId: string, options: MonitoringOptions): Promise<MonitoringSession>;
  updateMonitoringOptions(sessionId: string, options: Partial<MonitoringOptions>): Promise<void>;
  
  // Batch processing
  processBatchLocations(locations: LocationUpdate[]): Promise<GeofenceEvent[]>;
  scheduleLocationCheck(userId: string, interval: number): Promise<string>;
  
  // Optimization
  optimizeGeofenceChecks(userId: string, geofences: GeofenceDefinition[]): Promise<OptimizedMonitoring>;
  reduceLocationNoise(locations: LocationData[]): LocationData[];
  
  // Historical analysis
  analyzeLocationHistory(userId: string, timeRange: TimeRange): Promise<LocationAnalysis>;
  detectLocationPatterns(userId: string): Promise<LocationPattern[]>;
}

interface MonitoringOptions {
  accuracy: 'high' | 'medium' | 'low';
  updateInterval: number; // milliseconds
  batteryOptimization: boolean;
  backgroundMonitoring: boolean;
  geofenceBuffer: number; // meters
  dwellTimeThreshold: number; // milliseconds
}

interface LocationUpdate {
  userId: string;
  location: LocationData;
  timestamp: Date;
  accuracy: number;
  source: 'gps' | 'network' | 'passive';
}
```

### Geofence Event Processing

```typescript
interface GeofenceEventProcessor {
  // Event processing
  processGeofenceEvent(event: GeofenceEvent): Promise<void>;
  queueEventForProcessing(event: GeofenceEvent): Promise<void>;
  processEventQueue(): Promise<ProcessingResult>;
  
  // Action execution
  executeGeofenceActions(actions: GeofenceAction[], context: EventContext): Promise<ActionResult[]>;
  scheduleDelayedAction(action: GeofenceAction, delay: number): Promise<string>;
  cancelScheduledAction(actionId: string): Promise<void>;
  
  // Event filtering and validation
  validateGeofenceEvent(event: GeofenceEvent): ValidationResult;
  filterDuplicateEvents(events: GeofenceEvent[]): GeofenceEvent[];
  applyEventThrottling(userId: string, geofenceId: string): Promise<boolean>;
}

interface GeofenceEvent {
  id: string;
  userId: string;
  geofenceId: string;
  eventType: 'enter' | 'exit' | 'dwell';
  location: LocationData;
  timestamp: Date;
  dwellDuration?: number;
  metadata: Record<string, any>;
}

interface GeofenceAction {
  type: 'notification' | 'webhook' | 'email' | 'sms' | 'api_call' | 'custom';
  parameters: Record<string, any>;
  delay?: number; // milliseconds
  conditions?: ActionCondition[];
}

interface EventContext {
  user: UserProfile;
  device: DeviceInfo;
  location: LocationData;
  geofence: GeofenceDefinition;
  previousEvents: GeofenceEvent[];
}
```

## Platform-Specific Implementation

### Mobile Implementation (React Native)

```javascript
import { GeofencingEventType, startGeofencingAsync, stopGeofencingAsync } from 'expo-location';
import BackgroundTask from '@react-native-async-storage/async-storage';

class MobileGeofencingService {
  constructor() {
    this.activeGeofences = new Map();
    this.monitoringSessions = new Map();
  }
  
  async createGeofence(geofence) {
    // Validate geofence definition
    this.validateGeofence(geofence);
    
    // Convert to platform-specific format
    const platformGeofence = this.convertToPlatformGeofence(geofence);
    
    // Store geofence definition
    await this.storeGeofence(geofence);
    
    // Start monitoring if there are active sessions
    await this.updateActiveMonitoring();
    
    return geofence.id;
  }
  
  async startMonitoring(userId, geofenceIds) {
    const geofences = await this.getGeofencesByIds(geofenceIds);
    
    // Request location permissions
    const permission = await this.requestLocationPermission();
    if (!permission) {
      throw new Error('Location permission required for geofencing');
    }
    
    // Configure geofencing
    const geofencingConfig = {
      regions: geofences.map(gf => ({
        identifier: gf.id,
        latitude: gf.shape.center.latitude,
        longitude: gf.shape.center.longitude,
        radius: gf.shape.radius,
        notifyOnEntry: gf.triggers.some(t => t.event === 'enter'),
        notifyOnExit: gf.triggers.some(t => t.event === 'exit')
      }))
    };
    
    // Start geofencing
    await startGeofencingAsync('geofence-task', geofencingConfig);
    
    const sessionId = this.generateSessionId();
    this.monitoringSessions.set(sessionId, {
      userId,
      geofenceIds,
      startTime: new Date(),
      isActive: true
    });
    
    return { sessionId };
  }
  
  async handleGeofenceEvent(event) {
    const { eventType, region } = event;
    const geofence = await this.getGeofence(region.identifier);
    
    if (!geofence) return;
    
    const geofenceEvent = {
      id: this.generateEventId(),
      userId: await this.getCurrentUserId(),
      geofenceId: geofence.id,
      eventType: this.convertEventType(eventType),
      location: {
        latitude: region.latitude,
        longitude: region.longitude,
        timestamp: new Date()
      },
      timestamp: new Date()
    };
    
    // Process event
    await this.processGeofenceEvent(geofenceEvent);
    
    // Execute actions
    const relevantTriggers = geofence.triggers.filter(t => t.event === geofenceEvent.eventType);
    for (const trigger of relevantTriggers) {
      await this.executeActions(trigger.actions, geofenceEvent);
    }
  }
  
  convertEventType(platformEventType) {
    switch (platformEventType) {
      case GeofencingEventType.Enter:
        return 'enter';
      case GeofencingEventType.Exit:
        return 'exit';
      default:
        return 'unknown';
    }
  }
}
```

### Web Implementation

```javascript
class WebGeofencingService {
  constructor() {
    this.geofences = new Map();
    this.monitoringInterval = null;
    this.lastKnownLocation = null;
  }
  
  async startMonitoring(userId, geofenceIds, options = {}) {
    if (!navigator.geolocation) {
      throw new Error('Geolocation not supported');
    }
    
    const geofences = await this.getGeofencesByIds(geofenceIds);
    this.activeGeofences = geofences;
    
    // Start location monitoring
    this.monitoringInterval = setInterval(async () => {
      try {
        const location = await this.getCurrentLocation();
        await this.checkGeofences(userId, location);
      } catch (error) {
        console.error('Geofence monitoring error:', error);
      }
    }, options.updateInterval || 10000);
    
    return { sessionId: this.generateSessionId() };
  }
  
  async checkGeofences(userId, location) {
    const currentTime = Date.now();
    
    for (const geofence of this.activeGeofences) {
      const wasInside = this.wasLocationInGeofence(this.lastKnownLocation, geofence);
      const isInside = this.isLocationInGeofence(location, geofence);
      
      if (!wasInside && isInside) {
        // Enter event
        await this.triggerGeofenceEvent(userId, geofence, 'enter', location);
      } else if (wasInside && !isInside) {
        // Exit event
        await this.triggerGeofenceEvent(userId, geofence, 'exit', location);
      } else if (isInside) {
        // Check for dwell events
        await this.checkDwellEvents(userId, geofence, location, currentTime);
      }
    }
    
    this.lastKnownLocation = location;
  }
  
  isLocationInGeofence(location, geofence) {
    switch (geofence.shape.type) {
      case 'circle':
        return this.isLocationInCircle(location, geofence.shape);
      case 'polygon':
        return this.isLocationInPolygon(location, geofence.shape);
      case 'rectangle':
        return this.isLocationInRectangle(location, geofence.shape);
      default:
        return false;
    }
  }
  
  isLocationInCircle(location, shape) {
    const distance = this.calculateDistance(location, shape.center);
    return distance <= shape.radius;
  }
  
  isLocationInPolygon(location, shape) {
    // Ray casting algorithm for point-in-polygon test
    const { latitude: lat, longitude: lng } = location;
    const vertices = shape.coordinates;
    let inside = false;
    
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const xi = vertices[i].longitude;
      const yi = vertices[i].latitude;
      const xj = vertices[j].longitude;
      const yj = vertices[j].latitude;
      
      if (((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    
    return inside;
  }
  
  calculateDistance(location1, location2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = location1.latitude * Math.PI / 180;
    const φ2 = location2.latitude * Math.PI / 180;
    const Δφ = (location2.latitude - location1.latitude) * Math.PI / 180;
    const Δλ = (location2.longitude - location1.longitude) * Math.PI / 180;
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c;
  }
}
```

### iOS Implementation (Swift)

```swift
import CoreLocation
import UserNotifications

class iOSGeofencingService: NSObject, CLLocationManagerDelegate {
    private let locationManager = CLLocationManager()
    private var activeGeofences: [String: GeofenceDefinition] = [:]
    private var monitoringSessions: [String: MonitoringSession] = [:]
    
    override init() {
        super.init()
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
    }
    
    func createGeofence(_ geofence: GeofenceDefinition) async throws -> String {
        // Validate geofence
        try validateGeofence(geofence)
        
        // Store geofence
        activeGeofences[geofence.id] = geofence
        
        // Create CLCircularRegion for Core Location
        let region = CLCircularRegion(
            center: CLLocationCoordinate2D(
                latitude: geofence.shape.center.latitude,
                longitude: geofence.shape.center.longitude
            ),
            radius: geofence.shape.radius,
            identifier: geofence.id
        )
        
        region.notifyOnEntry = geofence.triggers.contains { $0.event == .enter }
        region.notifyOnExit = geofence.triggers.contains { $0.event == .exit }
        
        // Start monitoring
        locationManager.startMonitoring(for: region)
        
        return geofence.id
    }
    
    func startMonitoring(userId: String, geofenceIds: [String]) async throws -> MonitoringSession {
        // Request location permissions
        let status = await requestLocationPermission()
        guard status == .authorizedAlways || status == .authorizedWhenInUse else {
            throw GeofencingError.permissionDenied
        }
        
        // Get geofences
        let geofences = geofenceIds.compactMap { activeGeofences[$0] }
        
        // Create monitoring session
        let sessionId = UUID().uuidString
        let session = MonitoringSession(
            id: sessionId,
            userId: userId,
            geofenceIds: geofenceIds,
            startTime: Date(),
            isActive: true
        )
        
        monitoringSessions[sessionId] = session
        
        // Start location updates
        locationManager.startUpdatingLocation()
        
        return session
    }
    
    // MARK: - CLLocationManagerDelegate
    
    func locationManager(_ manager: CLLocationManager, didEnterRegion region: CLRegion) {
        guard let geofence = activeGeofences[region.identifier] else { return }
        
        Task {
            await handleGeofenceEvent(
                geofenceId: geofence.id,
                eventType: .enter,
                location: manager.location
            )
        }
    }
    
    func locationManager(_ manager: CLLocationManager, didExitRegion region: CLRegion) {
        guard let geofence = activeGeofences[region.identifier] else { return }
        
        Task {
            await handleGeofenceEvent(
                geofenceId: geofence.id,
                eventType: .exit,
                location: manager.location
            )
        }
    }
    
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        
        Task {
            await checkDwellEvents(location: location)
        }
    }
    
    private func handleGeofenceEvent(geofenceId: String, eventType: GeofenceEventType, location: CLLocation?) async {
        guard let geofence = activeGeofences[geofenceId],
              let location = location else { return }
        
        let event = GeofenceEvent(
            id: UUID().uuidString,
            userId: getCurrentUserId(),
            geofenceId: geofenceId,
            eventType: eventType,
            location: LocationData(from: location),
            timestamp: Date()
        )
        
        // Process event
        await processGeofenceEvent(event)
        
        // Execute actions
        let relevantTriggers = geofence.triggers.filter { $0.event == eventType }
        for trigger in relevantTriggers {
            await executeActions(trigger.actions, context: event)
        }
    }
    
    private func executeActions(_ actions: [GeofenceAction], context: GeofenceEvent) async {
        for action in actions {
            switch action.type {
            case .notification:
                await sendLocalNotification(action: action, context: context)
            case .webhook:
                await sendWebhook(action: action, context: context)
            case .apiCall:
                await makeAPICall(action: action, context: context)
            default:
                break
            }
        }
    }
    
    private func sendLocalNotification(action: GeofenceAction, context: GeofenceEvent) async {
        let content = UNMutableNotificationContent()
        content.title = action.parameters["title"] as? String ?? "Geofence Alert"
        content.body = action.parameters["message"] as? String ?? "Location event triggered"
        content.sound = .default
        
        let request = UNNotificationRequest(
            identifier: UUID().uuidString,
            content: content,
            trigger: nil
        )
        
        try? await UNUserNotificationCenter.current().add(request)
    }
}
```

## Advanced Use Cases

### Delivery Zone Management

```typescript
class DeliveryZoneGeofencing {
  async createDeliveryZones(restaurant: RestaurantData): Promise<string[]> {
    const zones = [
      // Primary delivery zone (free delivery)
      {
        id: `${restaurant.id}-primary`,
        name: 'Primary Delivery Zone',
        shape: {
          type: 'circle',
          center: restaurant.location,
          radius: 3000 // 3km
        },
        triggers: [{
          event: 'enter',
          actions: [{
            type: 'api_call',
            parameters: {
              endpoint: '/delivery/zone-entered',
              method: 'POST',
              data: { zoneType: 'primary', restaurantId: restaurant.id }
            }
          }]
        }],
        metadata: { deliveryFee: 0, estimatedTime: 30 }
      },
      
      // Secondary delivery zone (paid delivery)
      {
        id: `${restaurant.id}-secondary`,
        name: 'Extended Delivery Zone',
        shape: {
          type: 'circle',
          center: restaurant.location,
          radius: 5000 // 5km
        },
        triggers: [{
          event: 'enter',
          actions: [{
            type: 'api_call',
            parameters: {
              endpoint: '/delivery/zone-entered',
              method: 'POST',
              data: { zoneType: 'secondary', restaurantId: restaurant.id }
            }
          }]
        }],
        metadata: { deliveryFee: 2.99, estimatedTime: 45 }
      }
    ];
    
    const geofenceIds = [];
    for (const zone of zones) {
      const id = await this.geofencingService.createGeofence(zone);
      geofenceIds.push(id);
    }
    
    return geofenceIds;
  }
  
  async trackDeliveryProgress(orderId: string, driverId: string): Promise<void> {
    const order = await this.getOrderDetails(orderId);
    
    // Create temporary geofences for delivery milestones
    const milestones = [
      {
        id: `${orderId}-pickup-approach`,
        name: 'Approaching Pickup',
        shape: {
          type: 'circle',
          center: order.restaurantLocation,
          radius: 200
        },
        triggers: [{
          event: 'enter',
          actions: [{
            type: 'notification',
            parameters: {
              userId: order.customerId,
              title: 'Driver Approaching',
              message: 'Your driver is approaching the restaurant'
            }
          }]
        }]
      },
      
      {
        id: `${orderId}-delivery-approach`,
        name: 'Approaching Delivery',
        shape: {
          type: 'circle',
          center: order.deliveryLocation,
          radius: 200
        },
        triggers: [{
          event: 'enter',
          actions: [{
            type: 'notification',
            parameters: {
              userId: order.customerId,
              title: 'Driver Arriving',
              message: 'Your driver is approaching your location'
            }
          }]
        }]
      }
    ];
    
    // Create milestone geofences
    for (const milestone of milestones) {
      await this.geofencingService.createGeofence(milestone);
    }
    
    // Start monitoring driver location
    await this.geofencingService.startMonitoring(driverId, milestones.map(m => m.id));
  }
}
```

### Fleet Management Geofencing

```typescript
class FleetGeofencingService {
  async createServiceAreas(fleet: FleetData): Promise<void> {
    // Create service area geofences
    for (const area of fleet.serviceAreas) {
      await this.geofencingService.createGeofence({
        id: `fleet-${fleet.id}-area-${area.id}`,
        name: area.name,
        shape: area.boundary,
        triggers: [
          {
            event: 'enter',
            actions: [{
              type: 'api_call',
              parameters: {
                endpoint: '/fleet/vehicle-entered-area',
                method: 'POST',
                data: { fleetId: fleet.id, areaId: area.id }
              }
            }]
          },
          {
            event: 'exit',
            actions: [{
              type: 'api_call',
              parameters: {
                endpoint: '/fleet/vehicle-left-area',
                method: 'POST',
                data: { fleetId: fleet.id, areaId: area.id }
              }
            }]
          }
        ]
      });
    }
    
    // Create depot geofences
    for (const depot of fleet.depots) {
      await this.geofencingService.createGeofence({
        id: `fleet-${fleet.id}-depot-${depot.id}`,
        name: `${depot.name} Depot`,
        shape: {
          type: 'circle',
          center: depot.location,
          radius: 100
        },
        triggers: [
          {
            event: 'enter',
            actions: [{
              type: 'api_call',
              parameters: {
                endpoint: '/fleet/vehicle-at-depot',
                method: 'POST',
                data: { fleetId: fleet.id, depotId: depot.id, action: 'arrived' }
              }
            }]
          },
          {
            event: 'dwell',
            dwellTime: 300000, // 5 minutes
            actions: [{
              type: 'api_call',
              parameters: {
                endpoint: '/fleet/vehicle-idle-alert',
                method: 'POST',
                data: { fleetId: fleet.id, depotId: depot.id }
              }
            }]
          }
        ]
      });
    }
  }
  
  async monitorFleetVehicles(fleetId: string): Promise<void> {
    const fleet = await this.getFleetDetails(fleetId);
    const geofenceIds = await this.getFleetGeofenceIds(fleetId);
    
    // Start monitoring all vehicles
    for (const vehicle of fleet.vehicles) {
      await this.geofencingService.startMonitoring(vehicle.driverId, geofenceIds);
    }
  }
}
```

### Security and Access Control

```typescript
class SecurityGeofencingService {
  async createSecurityPerimeter(facility: FacilityData): Promise<void> {
    const securityZones = [
      // Outer perimeter
      {
        id: `${facility.id}-outer-perimeter`,
        name: 'Outer Security Perimeter',
        shape: facility.outerBoundary,
        triggers: [{
          event: 'enter',
          conditions: [{
            type: 'time',
            operator: 'not_between',
            value: { start: '06:00', end: '22:00' }
          }],
          actions: [{
            type: 'api_call',
            parameters: {
              endpoint: '/security/perimeter-breach',
              method: 'POST',
              data: { facilityId: facility.id, severity: 'medium' }
            }
          }]
        }]
      },
      
      // Restricted area
      {
        id: `${facility.id}-restricted`,
        name: 'Restricted Area',
        shape: facility.restrictedArea,
        triggers: [{
          event: 'enter',
          conditions: [{
            type: 'user_attribute',
            field: 'clearanceLevel',
            operator: 'less_than',
            value: 3
          }],
          actions: [{
            type: 'api_call',
            parameters: {
              endpoint: '/security/unauthorized-access',
              method: 'POST',
              data: { facilityId: facility.id, severity: 'high' }
            }
          }]
        }]
      }
    ];
    
    for (const zone of securityZones) {
      await this.geofencingService.createGeofence(zone);
    }
  }
  
  async monitorPersonnel(facilityId: string, personnelIds: string[]): Promise<void> {
    const geofenceIds = await this.getFacilityGeofenceIds(facilityId);
    
    for (const personnelId of personnelIds) {
      await this.geofencingService.startMonitoring(personnelId, geofenceIds);
    }
  }
}
```

## Performance Optimization

### Efficient Geofence Checking

```typescript
interface GeofenceOptimizationService {
  // Spatial indexing
  createSpatialIndex(geofences: GeofenceDefinition[]): SpatialIndex;
  queryNearbyGeofences(location: LocationData, radius: number): Promise<GeofenceDefinition[]>;
  
  // Batch processing
  batchCheckLocations(locations: LocationUpdate[]): Promise<GeofenceEvent[]>;
  optimizeGeofenceOrder(geofences: GeofenceDefinition[], location: LocationData): GeofenceDefinition[];
  
  // Caching
  cacheGeofenceResults(userId: string, results: GeofenceStatus[]): Promise<void>;
  getCachedResults(userId: string, location: LocationData): Promise<GeofenceStatus[] | null>;
  
  // Adaptive monitoring
  adjustMonitoringFrequency(userId: string, movementPattern: MovementPattern): MonitoringOptions;
  predictNextGeofenceInteraction(userId: string, currentLocation: LocationData): Promise<GeofencePrediction>;
}

interface SpatialIndex {
  insert(geofence: GeofenceDefinition): void;
  remove(geofenceId: string): void;
  query(bounds: GeographicBounds): GeofenceDefinition[];
  nearest(location: LocationData, count: number): GeofenceDefinition[];
}

interface MovementPattern {
  averageSpeed: number;
  direction: number;
  consistency: number;
  stationaryTime: number;
}
```

### Battery Optimization

```typescript
interface BatteryOptimizedGeofencing {
  // Adaptive accuracy
  adjustLocationAccuracy(batteryLevel: number, geofenceCount: number): LocationAccuracy;
  optimizeUpdateInterval(movementSpeed: number, nearbyGeofences: number): number;
  
  // Smart monitoring
  enableSmartMonitoring(userId: string, options: SmartMonitoringOptions): Promise<void>;
  pauseMonitoringWhenStationary(userId: string, threshold: number): Promise<void>;
  
  // Background optimization
  optimizeBackgroundProcessing(geofences: GeofenceDefinition[]): BackgroundOptimization;
  schedulePeriodicChecks(interval: number): Promise<string>;
}

interface SmartMonitoringOptions {
  batteryThreshold: number;
  accuracyReduction: boolean;
  intervalAdjustment: boolean;
  backgroundOptimization: boolean;
}
```

## Testing Strategy

### Unit Tests

```typescript
describe('Geofencing Service', () => {
  test('should create circular geofence correctly', async () => {
    const geofence = {
      id: 'test-geofence',
      name: 'Test Geofence',
      shape: {
        type: 'circle',
        center: { latitude: 37.7749, longitude: -122.4194 },
        radius: 1000
      },
      triggers: [{
        event: 'enter',
        actions: [{ type: 'notification', parameters: { message: 'Entered geofence' } }]
      }]
    };
    
    const id = await geofencingService.createGeofence(geofence);
    expect(id).toBe('test-geofence');
    
    const created = await geofencingService.getGeofence(id);
    expect(created.shape.radius).toBe(1000);
  });
  
  test('should detect location inside circular geofence', () => {
    const location = { latitude: 37.7749, longitude: -122.4194 };
    const geofence = {
      shape: {
        type: 'circle',
        center: { latitude: 37.7749, longitude: -122.4194 },
        radius: 1000
      }
    };
    
    const isInside = geofencingService.isLocationInGeofence(location, geofence);
    expect(isInside).toBe(true);
  });
  
  test('should detect location outside circular geofence', () => {
    const location = { latitude: 37.7849, longitude: -122.4094 };
    const geofence = {
      shape: {
        type: 'circle',
        center: { latitude: 37.7749, longitude: -122.4194 },
        radius: 100
      }
    };
    
    const isInside = geofencingService.isLocationInGeofence(location, geofence);
    expect(isInside).toBe(false);
  });
});
```

### Integration Tests

```typescript
describe('Geofencing Integration', () => {
  test('should trigger enter event when location enters geofence', async () => {
    const geofence = await createTestGeofence();
    const userId = 'test-user';
    
    // Start monitoring
    await geofencingService.startMonitoring(userId, [geofence.id]);
    
    // Simulate location update inside geofence
    const insideLocation = {
      latitude: geofence.shape.center.latitude,
      longitude: geofence.shape.center.longitude
    };
    
    const events = await geofencingService.checkLocation(insideLocation, [geofence.id]);
    
    expect(events).toHaveLength(1);
    expect(events[0].eventType).toBe('enter');
  });
  
  test('should handle multiple geofences efficiently', async () => {
    const geofences = await createMultipleTestGeofences(100);
    const userId = 'test-user';
    
    const startTime = Date.now();
    await geofencingService.startMonitoring(userId, geofences.map(g => g.id));
    const endTime = Date.now();
    
    expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
  });
});
```

## Error Handling

```typescript
class GeofencingError extends Error {
  constructor(message: string, public code: GeofencingErrorCode, public details?: any) {
    super(message);
    this.name = 'GeofencingError';
  }
}

enum GeofencingErrorCode {
  INVALID_GEOFENCE = 'INVALID_GEOFENCE',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  LOCATION_UNAVAILABLE = 'LOCATION_UNAVAILABLE',
  MONITORING_FAILED = 'MONITORING_FAILED',
  TOO_MANY_GEOFENCES = 'TOO_MANY_GEOFENCES',
  INVALID_COORDINATES = 'INVALID_COORDINATES'
}

interface GeofenceErrorHandler {
  handleGeofencingError(error: GeofencingError): Promise<void>;
  retryGeofenceOperation(operation: GeofenceOperation): Promise<any>;
  fallbackToPolling(userId: string, geofenceIds: string[]): Promise<void>;
}
```

## Configuration

```typescript
interface GeofencingConfig {
  monitoring: {
    defaultUpdateInterval: number;
    maxGeofencesPerUser: number;
    dwellTimeThreshold: number;
    accuracyThreshold: number;
  };
  
  optimization: {
    spatialIndexing: boolean;
    batchProcessing: boolean;
    cacheResults: boolean;
    batteryOptimization: boolean;
  };
  
  notifications: {
    enablePushNotifications: boolean;
    enableWebhooks: boolean;
    retryAttempts: number;
    timeoutMs: number;
  };
}
```

## Best Practices

1. **Accuracy vs Battery**: Balance location accuracy with battery consumption based on use case requirements
2. **Geofence Size**: Use appropriate geofence sizes - too small may cause false triggers, too large may be imprecise
3. **Event Throttling**: Implement event throttling to prevent spam from rapid enter/exit events
4. **Permission Handling**: Always request and handle location permissions gracefully
5. **Offline Support**: Implement offline geofence checking for areas with poor connectivity
6. **Performance**: Use spatial indexing and caching for applications with many geofences
7. **Privacy**: Respect user privacy preferences and provide clear location usage explanations
8. **Testing**: Test geofencing thoroughly in real-world conditions with various device types

This template provides a comprehensive foundation for implementing geofencing and location-based triggers in any location-aware application while maintaining accuracy, performance, and user privacy.