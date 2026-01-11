# Location Services Templates

## Purpose
Generate comprehensive location-based and on-demand service applications with GPS tracking, mapping integration, geofencing, service matching, booking systems, and fleet management capabilities.

## Instructions
1. Analyze location-based service requirements and user journey needs
2. Select appropriate location services templates based on service type (ride-sharing, delivery, field services)
3. Implement GPS tracking and real-time location processing systems
4. Build mapping integration with multiple providers and custom solutions
5. Add geofencing capabilities with location-based triggers and notifications
6. Create service matching algorithms for provider-customer pairing
7. Implement booking management with availability tracking and scheduling
8. Build dynamic pricing systems with surge pricing and fare calculation
9. Add fleet management with vehicle tracking and driver coordination
10. Create location privacy controls and data management systems

## Examples

### Example 1: On-Demand Service Platform
```typescript
// Complete on-demand service platform
class OnDemandServicePlatform {
  async initializePlatform(config: LocationServiceConfig): Promise<Platform> {
    return {
      gpsTracking: new GPSTrackingService(config.tracking),
      serviceMatching: new MatchingService(config.matching),
      bookingManagement: new BookingService(config.booking),
      dynamicPricing: new PricingService(config.pricing),
      fleetManagement: new FleetService(config.fleet),
      mapIntegration: new MappingService(config.maps)
    };
  }
}
```

### Example 2: Ride-Sharing Application
```typescript
// Ride-sharing platform with real-time matching
class RideSharingPlatform {
  async createRideServices(config: RideConfig): Promise<RideServices> {
    return {
      riderMatching: new RiderMatchingService(config.matching),
      routeOptimization: new RouteService(config.routing),
      fareCalculation: new FareService(config.pricing),
      driverTracking: new DriverTrackingService(config.tracking),
      tripManagement: new TripService(config.trips)
    };
  }
}
```

### Example 3: Field Service Management
```typescript
// Field service management with location optimization
class FieldServiceManager {
  async setupFieldServices(config: FieldServiceConfig): Promise<FieldServices> {
    return {
      technicianDispatch: new DispatchService(config.dispatch),
      routeOptimization: new OptimizationService(config.optimization),
      jobScheduling: new SchedulingService(config.scheduling),
      locationTracking: new TrackingService(config.tracking),
      customerNotifications: new NotificationService(config.notifications)
    };
  }
}
```

## Variables
| Variable | Type | Description | Default | Required |
|----------|------|-------------|---------|----------|
| serviceType | string | Type of location service | 'on_demand' | Yes |
| mapProvider | string | Mapping service provider | 'google_maps' | Yes |
| trackingAccuracy | string | GPS tracking precision | 'high' | No |
| geofencingEnabled | boolean | Enable geofencing features | true | No |
| dynamicPricing | boolean | Enable surge pricing | false | No |
| fleetManagement | boolean | Fleet tracking and management | false | No |
| serviceMatching | boolean | Provider-customer matching | true | Yes |
| bookingSystem | boolean | Appointment scheduling | true | No |
| locationPrivacy | boolean | Privacy controls for location | true | Yes |
| realTimeTracking | boolean | Real-time location updates | true | No |

## Expected Output
A comprehensive location-based service solution featuring:
- Real-time GPS tracking with high-accuracy location processing and sharing
- Mapping integration with multiple providers and custom mapping solutions
- Geofencing capabilities with location-based triggers and proximity detection
- Service matching algorithms for optimal provider-customer pairing
- Booking management with availability tracking and appointment scheduling
- Dynamic pricing systems with surge pricing and intelligent fare calculation
- Fleet management with vehicle tracking and driver coordination tools
- Location privacy controls with granular data management and consent
- Route optimization with traffic-aware navigation and ETA predictions
- Multi-platform support with mobile and web location services

This module contains comprehensive templates for building location-based and on-demand service applications. These templates cover GPS tracking, mapping integration, geofencing, service matching, booking systems, and fleet management.

## Templates

### Location Tracking and Mapping
- **gps-tracking.md** - Real-time location tracking and sharing
- **map-integration.md** - Google Maps, Mapbox, and custom mapping solutions
- **geofencing.md** - Location-based triggers and proximity detection
- **location-privacy.md** - Privacy controls and location data management

### Service Matching and Booking
- **service-matching.md** - Provider-customer matching algorithms
- **booking-management.md** - Appointment scheduling and availability
- **dynamic-pricing.md** - Surge pricing and fare calculation
- **fleet-management.md** - Vehicle tracking and driver coordination

## Usage

These templates are designed to be composable and can be combined with other domain templates (commerce, social, etc.) to create comprehensive on-demand service applications like ride-sharing, food delivery, home services, and more.

## Key Features

- Real-time location processing
- Privacy-compliant location handling
- Scalable matching algorithms
- Dynamic pricing models
- Fleet optimization
- Multi-platform mapping support