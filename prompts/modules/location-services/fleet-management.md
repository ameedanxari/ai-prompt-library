# Fleet Management and Vehicle Tracking

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
Implement comprehensive fleet management systems for vehicle tracking, driver coordination, route optimization, maintenance scheduling, and operational efficiency in delivery services, ride-sharing, logistics, and transportation companies.

## Context
Fleet management is critical for transportation and logistics businesses that need to track vehicles, coordinate drivers, and optimize operations. Modern fleet systems integrate real-time tracking, predictive maintenance, and route optimization to reduce costs and improve service quality. This template addresses the complexity of building scalable fleet management systems that handle thousands of vehicles while providing real-time visibility and operational insights.

## Instructions
1. Analyze fleet management requirements and operational objectives
2. Design comprehensive vehicle tracking and monitoring systems
3. Implement driver management with performance tracking and coordination
4. Build route optimization with real-time traffic and efficiency algorithms
5. Create maintenance scheduling with predictive maintenance capabilities
6. Add fuel management with consumption tracking and optimization
7. Implement compliance monitoring with regulatory requirements
8. Build fleet analytics with performance metrics and cost analysis
9. Create dispatch systems with automated job assignment
10. Add integration with telematics devices and third-party systems

## Examples

### Example 1: Real-time Fleet Tracking
```typescript
// Comprehensive fleet tracking with live updates
class FleetTrackingSystem {
  async trackFleet(fleetId: string): Promise<FleetStatus> {
    const vehicles = await this.getFleetVehicles(fleetId);
    const liveData = await Promise.all(
      vehicles.map(vehicle => this.getVehicleTelemetry(vehicle.id))
    );
    
    return {
      totalVehicles: vehicles.length,
      activeVehicles: liveData.filter(v => v.status === 'active').length,
      locations: liveData.map(v => ({ id: v.vehicleId, location: v.location })),
      alerts: await this.getFleetAlerts(fleetId)
    };
  }
}
```

### Example 2: Route Optimization Engine
```typescript
// AI-powered route optimization for fleet efficiency
class RouteOptimizer {
  async optimizeFleetRoutes(fleetId: string, jobs: DeliveryJob[]): Promise<OptimizedRoutes> {
    const vehicles = await this.getAvailableVehicles(fleetId);
    const trafficData = await this.getCurrentTrafficConditions();
    
    const optimization = await this.optimizationEngine.solve({
      vehicles,
      jobs,
      constraints: await this.getFleetConstraints(fleetId),
      objectives: ['minimize_distance', 'minimize_time', 'balance_load']
    });
    
    return optimization.routes;
  }
}
```

### Example 3: Predictive Maintenance System
```typescript
// Predictive maintenance with IoT data analysis
class PredictiveMaintenanceSystem {
  async analyzeVehicleHealth(vehicleId: string): Promise<MaintenanceRecommendation> {
    const telemetryData = await this.getVehicleTelemetry(vehicleId, '30d');
    const maintenanceHistory = await this.getMaintenanceHistory(vehicleId);
    
    const healthScore = await this.mlModel.predictHealth({
      telemetry: telemetryData,
      history: maintenanceHistory,
      vehicleSpecs: await this.getVehicleSpecs(vehicleId)
    });
    
    return {
      healthScore,
      recommendations: await this.generateMaintenanceRecommendations(healthScore),
      urgency: this.calculateUrgency(healthScore)
    };
  }
}
```

## Variables
| Variable | Type | Description | Default | Required |
|----------|------|-------------|---------|----------|
| vehicleTypes | array | Supported vehicle types | ['car', 'truck', 'van'] | Yes |
| trackingAccuracy | string | GPS tracking precision | 'high' | No |
| routeOptimization | boolean | Enable route optimization | true | No |
| predictiveMaintenance | boolean | Predictive maintenance features | false | No |
| driverManagement | boolean | Driver performance tracking | true | No |
| fuelManagement | boolean | Fuel consumption tracking | true | No |
| complianceMonitoring | boolean | Regulatory compliance tracking | true | Yes |
| telematicsIntegration | boolean | Telematics device integration | true | No |
| dispatchAutomation | boolean | Automated job dispatch | false | No |
| fleetAnalytics | boolean | Performance analytics dashboard | true | No |

## Expected Output
A comprehensive fleet management system featuring:
- Real-time vehicle tracking with GPS monitoring and live location updates
- Driver management with performance tracking, scheduling, and coordination
- Route optimization with AI-powered algorithms and traffic-aware planning
- Predictive maintenance with IoT data analysis and automated scheduling
- Fuel management with consumption tracking and cost optimization
- Compliance monitoring with regulatory requirements and automated reporting
- Fleet analytics with performance metrics, cost analysis, and efficiency insights
- Dispatch automation with intelligent job assignment and load balancing
- Telematics integration with vehicle sensors and diagnostic systems
- Mobile applications for drivers with navigation, job management, and communication

## Implementation Approach

### Core Fleet Management System

```typescript
interface FleetManagementService {
  // Vehicle management
  registerVehicle(vehicle: VehicleRegistration): Promise<string>;
  updateVehicle(vehicleId: string, updates: VehicleUpdate): Promise<void>;
  deactivateVehicle(vehicleId: string, reason: string): Promise<void>;
  
  // Fleet operations
  getFleetStatus(fleetId: string): Promise<FleetStatus>;
  getVehicleLocation(vehicleId: string): Promise<VehicleLocation>;
  trackVehicleRoute(vehicleId: string, routeId: string): Promise<RouteTracking>;
  
  // Driver management
  assignDriver(vehicleId: string, driverId: string): Promise<DriverAssignment>;
  unassignDriver(vehicleId: string): Promise<void>;
  getDriverPerformance(driverId: string, timeRange: TimeRange): Promise<DriverPerformance>;
  
  // Route optimization
  optimizeRoutes(vehicles: Vehicle[], destinations: Destination[]): Promise<RouteOptimization>;
  updateRoute(vehicleId: string, newRoute: Route): Promise<void>;
  
  // Maintenance management
  scheduleMaintenanceCheck(vehicleId: string, maintenanceType: MaintenanceType): Promise<MaintenanceSchedule>;
  recordMaintenanceActivity(vehicleId: string, activity: MaintenanceActivity): Promise<void>;
  
  // Analytics and reporting
  generateFleetReport(fleetId: string, reportType: ReportType, timeRange: TimeRange): Promise<FleetReport>;
  getFleetAnalytics(fleetId: string): Promise<FleetAnalytics>;
}

interface Vehicle {
  id: string;
  fleetId: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  vehicleType: VehicleType;
  capacity: VehicleCapacity;
  currentLocation: LocationData;
  status: VehicleStatus;
  assignedDriverId?: string;
  lastMaintenanceDate: Date;
  nextMaintenanceDate: Date;
  mileage: number;
  fuelLevel: number;
  batteryLevel?: number; // for electric vehicles
  equipment: Equipment[];
  metadata: Record<string, any>;
}

enum VehicleType {
  CAR = 'car',
  VAN = 'van',
  TRUCK = 'truck',
  MOTORCYCLE = 'motorcycle',
  BICYCLE = 'bicycle',
  ELECTRIC_SCOOTER = 'electric_scooter',
  BUS = 'bus',
  DELIVERY_TRUCK = 'delivery_truck'
}

enum VehicleStatus {
  AVAILABLE = 'available',
  IN_USE = 'in_use',
  MAINTENANCE = 'maintenance',
  OUT_OF_SERVICE = 'out_of_service',
  CHARGING = 'charging',
  REFUELING = 'refueling',
  PARKED = 'parked'
}

interface VehicleCapacity {
  passengers?: number;
  cargoVolume?: number; // cubic meters
  cargoWeight?: number; // kilograms
  specialCapabilities?: string[];
}
```

### Real-Time Vehicle Tracking

```typescript
interface VehicleTrackingService {
  // Location tracking
  startTracking(vehicleId: string, trackingOptions: TrackingOptions): Promise<TrackingSession>;
  stopTracking(vehicleId: string): Promise<void>;
  updateVehicleLocation(vehicleId: string, location: VehicleLocationUpdate): Promise<void>;
  
  // Route monitoring
  monitorRouteProgress(vehicleId: string, routeId: string): Promise<RouteProgress>;
  detectRouteDeviation(vehicleId: string, allowedDeviation: number): Promise<DeviationAlert>;
  
  // Geofencing
  createVehicleGeofence(vehicleId: string, geofence: VehicleGeofence): Promise<string>;
  monitorGeofenceEvents(vehicleId: string): Promise<GeofenceEvent[]>;
  
  // Performance monitoring
  monitorVehiclePerformance(vehicleId: string): Promise<VehiclePerformanceData>;
  detectAnomalousVehicleBehavior(vehicleId: string): Promise<BehaviorAnomaly[]>;
  
  // Fleet visibility
  getFleetMap(fleetId: string): Promise<FleetMapData>;
  getVehicleHistory(vehicleId: string, timeRange: TimeRange): Promise<VehicleHistory>;
}

interface VehicleLocationUpdate {
  vehicleId: string;
  location: LocationData;
  heading: number;
  speed: number;
  timestamp: Date;
  odometer: number;
  fuelLevel?: number;
  engineStatus: EngineStatus;
  driverStatus: DriverStatus;
}

interface TrackingOptions {
  updateInterval: number; // seconds
  highAccuracyMode: boolean;
  trackWhenIdle: boolean;
  geofenceMonitoring: boolean;
  performanceMonitoring: boolean;
  routeOptimization: boolean;
}

interface RouteProgress {
  vehicleId: string;
  routeId: string;
  completedDistance: number;
  remainingDistance: number;
  estimatedArrival: Date;
  currentWaypoint: number;
  nextWaypoint: Waypoint;
  onSchedule: boolean;
  delayMinutes?: number;
}

enum EngineStatus {
  OFF = 'off',
  IDLE = 'idle',
  RUNNING = 'running',
  MAINTENANCE_MODE = 'maintenance_mode'
}

enum DriverStatus {
  ACTIVE = 'active',
  BREAK = 'break',
  OFFLINE = 'offline',
  EMERGENCY = 'emergency'
}
```

### Driver Management System

```typescript
interface DriverManagementService {
  // Driver registration
  registerDriver(driver: DriverRegistration): Promise<string>;
  updateDriverProfile(driverId: string, updates: DriverUpdate): Promise<void>;
  deactivateDriver(driverId: string, reason: string): Promise<void>;
  
  // License and certification management
  addDriverLicense(driverId: string, license: DriverLicense): Promise<void>;
  updateLicenseStatus(driverId: string, licenseId: string, status: LicenseStatus): Promise<void>;
  checkLicenseExpiry(driverId: string): Promise<LicenseExpiryCheck>;
  
  // Shift management
  startShift(driverId: string, vehicleId: string): Promise<ShiftSession>;
  endShift(sessionId: string): Promise<ShiftSummary>;
  recordBreak(sessionId: string, breakType: BreakType): Promise<void>;
  
  // Performance tracking
  trackDriverPerformance(driverId: string): Promise<DriverPerformanceMetrics>;
  recordDrivingEvent(driverId: string, event: DrivingEvent): Promise<void>;
  
  // Training and compliance
  scheduleDriverTraining(driverId: string, trainingType: TrainingType): Promise<TrainingSchedule>;
  recordTrainingCompletion(driverId: string, trainingId: string): Promise<void>;
  checkComplianceStatus(driverId: string): Promise<ComplianceStatus>;
}

interface Driver {
  id: string;
  fleetId: string;
  personalInfo: DriverPersonalInfo;
  licenses: DriverLicense[];
  certifications: DriverCertification[];
  vehicleAssignments: VehicleAssignment[];
  performanceMetrics: DriverPerformanceMetrics;
  trainingRecords: TrainingRecord[];
  status: DriverStatus;
  currentShift?: ShiftSession;
  preferences: DriverPreferences;
}

interface DriverPerformanceMetrics {
  driverId: string;
  totalMiles: number;
  totalHours: number;
  averageSpeed: number;
  fuelEfficiency: number;
  safetyScore: number;
  customerRating: number;
  onTimePercentage: number;
  incidentCount: number;
  trafficViolations: number;
  maintenanceIssuesReported: number;
}

interface DrivingEvent {
  type: DrivingEventType;
  severity: 'low' | 'medium' | 'high';
  location: LocationData;
  timestamp: Date;
  description: string;
  vehicleId: string;
  driverId: string;
}

enum DrivingEventType {
  HARSH_BRAKING = 'harsh_braking',
  RAPID_ACCELERATION = 'rapid_acceleration',
  SHARP_TURN = 'sharp_turn',
  SPEEDING = 'speeding',
  IDLE_TIME_EXCESSIVE = 'idle_time_excessive',
  SEATBELT_VIOLATION = 'seatbelt_violation',
  PHONE_USAGE = 'phone_usage',
  FATIGUE_DETECTED = 'fatigue_detected'
}
```

### Route Optimization Engine

```typescript
interface RouteOptimizationService {
  // Route planning
  planOptimalRoute(request: RouteOptimizationRequest): Promise<OptimizedRoute>;
  planMultiVehicleRoutes(request: MultiVehicleRouteRequest): Promise<MultiVehicleRouteResult>;
  
  // Dynamic optimization
  reoptimizeRoute(routeId: string, newConstraints: RouteConstraint[]): Promise<OptimizedRoute>;
  handleRouteDisruption(routeId: string, disruption: RouteDisruption): Promise<RouteAdjustment>;
  
  // Delivery optimization
  optimizeDeliverySequence(deliveries: Delivery[], constraints: DeliveryConstraint[]): Promise<DeliverySequence>;
  calculateTimeWindows(deliveries: Delivery[]): Promise<TimeWindow[]>;
  
  // Traffic and conditions
  incorporateTrafficData(route: Route): Promise<TrafficAwareRoute>;
  adjustForWeatherConditions(route: Route, weather: WeatherCondition): Promise<WeatherAdjustedRoute>;
  
  // Performance analysis
  analyzeRouteEfficiency(routeId: string): Promise<RouteEfficiencyAnalysis>;
  compareRouteAlternatives(alternatives: Route[]): Promise<RouteComparison>;
}

interface RouteOptimizationRequest {
  vehicleId: string;
  startLocation: LocationData;
  destinations: Destination[];
  constraints: RouteConstraint[];
  objectives: OptimizationObjective[];
  timeWindows?: TimeWindow[];
  vehicleCapacity?: VehicleCapacity;
  driverPreferences?: DriverPreferences;
}

interface OptimizedRoute {
  id: string;
  vehicleId: string;
  waypoints: Waypoint[];
  totalDistance: number;
  estimatedDuration: number;
  estimatedFuelCost: number;
  optimizationScore: number;
  alternatives: AlternativeRoute[];
  constraints: RouteConstraint[];
  trafficConsiderations: TrafficFactor[];
}

interface Destination {
  id: string;
  location: LocationData;
  timeWindow?: TimeWindow;
  serviceTime: number; // minutes
  priority: DestinationPriority;
  requirements: DestinationRequirement[];
  deliveryInstructions?: string;
}

enum OptimizationObjective {
  MINIMIZE_DISTANCE = 'minimize_distance',
  MINIMIZE_TIME = 'minimize_time',
  MINIMIZE_FUEL_COST = 'minimize_fuel_cost',
  MAXIMIZE_DELIVERIES = 'maximize_deliveries',
  BALANCE_WORKLOAD = 'balance_workload',
  MINIMIZE_EMISSIONS = 'minimize_emissions'
}

enum DestinationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}
```

### Maintenance Management System

```typescript
interface MaintenanceManagementService {
  // Preventive maintenance
  createMaintenanceSchedule(vehicleId: string, schedule: MaintenanceSchedule): Promise<string>;
  updateMaintenanceSchedule(scheduleId: string, updates: ScheduleUpdate): Promise<void>;
  getUpcomingMaintenance(fleetId: string, timeRange: TimeRange): Promise<MaintenanceItem[]>;
  
  // Maintenance execution
  recordMaintenanceActivity(activity: MaintenanceActivity): Promise<string>;
  updateMaintenanceStatus(activityId: string, status: MaintenanceStatus): Promise<void>;
  completeMaintenanceActivity(activityId: string, completion: MaintenanceCompletion): Promise<void>;
  
  // Predictive maintenance
  predictMaintenanceNeeds(vehicleId: string): Promise<MaintenancePrediction[]>;
  analyzeVehicleHealth(vehicleId: string): Promise<VehicleHealthReport>;
  
  // Parts and inventory
  managePartsInventory(fleetId: string): Promise<PartsInventory>;
  orderMaintenanceParts(order: PartsOrder): Promise<string>;
  trackPartsUsage(fleetId: string, timeRange: TimeRange): Promise<PartsUsageReport>;
  
  // Maintenance analytics
  generateMaintenanceReport(fleetId: string, reportType: MaintenanceReportType): Promise<MaintenanceReport>;
  analyzeMaintenanceCosts(fleetId: string, timeRange: TimeRange): Promise<MaintenanceCostAnalysis>;
}

interface MaintenanceSchedule {
  vehicleId: string;
  maintenanceType: MaintenanceType;
  frequency: MaintenanceFrequency;
  basedOn: 'mileage' | 'time' | 'engine_hours';
  interval: number;
  lastPerformed?: Date;
  nextDue: Date;
  estimatedCost: number;
  priority: MaintenancePriority;
}

interface MaintenanceActivity {
  id: string;
  vehicleId: string;
  maintenanceType: MaintenanceType;
  scheduledDate: Date;
  actualDate?: Date;
  status: MaintenanceStatus;
  technician?: string;
  location: string;
  partsUsed: MaintenancePart[];
  laborHours: number;
  totalCost: number;
  notes: string;
  beforePhotos?: string[];
  afterPhotos?: string[];
}

enum MaintenanceType {
  OIL_CHANGE = 'oil_change',
  TIRE_ROTATION = 'tire_rotation',
  BRAKE_INSPECTION = 'brake_inspection',
  ENGINE_TUNE_UP = 'engine_tune_up',
  TRANSMISSION_SERVICE = 'transmission_service',
  BATTERY_CHECK = 'battery_check',
  SAFETY_INSPECTION = 'safety_inspection',
  EMISSIONS_TEST = 'emissions_test',
  GENERAL_INSPECTION = 'general_inspection',
  REPAIR = 'repair'
}

enum MaintenanceStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  OVERDUE = 'overdue'
}

interface MaintenancePrediction {
  vehicleId: string;
  component: VehicleComponent;
  predictedFailureDate: Date;
  confidence: number;
  recommendedAction: string;
  estimatedCost: number;
  riskLevel: 'low' | 'medium' | 'high';
}
```

### Fuel and Energy Management

```typescript
interface FuelManagementService {
  // Fuel tracking
  recordFuelTransaction(transaction: FuelTransaction): Promise<string>;
  getFuelConsumption(vehicleId: string, timeRange: TimeRange): Promise<FuelConsumptionData>;
  
  // Fuel optimization
  optimizeFuelEfficiency(fleetId: string): Promise<FuelOptimizationPlan>;
  identifyFuelWastage(vehicleId: string): Promise<FuelWastageAnalysis>;
  
  // Fuel station management
  findNearestFuelStations(location: LocationData, fuelType: FuelType): Promise<FuelStation[]>;
  getFuelPrices(area: GeographicArea): Promise<FuelPriceData>;
  
  // Electric vehicle support
  manageChargingSchedule(vehicleId: string): Promise<ChargingSchedule>;
  findChargingStations(location: LocationData, chargerType: ChargerType): Promise<ChargingStation[]>;
  
  // Analytics and reporting
  generateFuelReport(fleetId: string, timeRange: TimeRange): Promise<FuelReport>;
  analyzeFuelTrends(fleetId: string): Promise<FuelTrendAnalysis>;
}

interface FuelTransaction {
  vehicleId: string;
  driverId: string;
  fuelStationId: string;
  fuelType: FuelType;
  quantity: number;
  pricePerUnit: number;
  totalCost: number;
  odometer: number;
  timestamp: Date;
  location: LocationData;
  paymentMethod: string;
}

interface FuelConsumptionData {
  vehicleId: string;
  timeRange: TimeRange;
  totalFuelUsed: number;
  totalDistance: number;
  averageMPG: number;
  fuelCost: number;
  costPerMile: number;
  consumptionTrend: ConsumptionTrend;
}

enum FuelType {
  GASOLINE = 'gasoline',
  DIESEL = 'diesel',
  ELECTRIC = 'electric',
  HYBRID = 'hybrid',
  CNG = 'cng',
  LPG = 'lpg',
  HYDROGEN = 'hydrogen'
}

interface ChargingSchedule {
  vehicleId: string;
  chargingSessions: ChargingSession[];
  optimalChargingTimes: TimeSlot[];
  costOptimization: ChargingCostOptimization;
}
```

## Platform-Specific Implementation

### Delivery Fleet Management

```typescript
class DeliveryFleetService {
  async optimizeDeliveryFleet(fleetId: string, deliveries: Delivery[]): Promise<DeliveryFleetOptimization> {
    // Get available vehicles
    const availableVehicles = await this.getAvailableVehicles(fleetId);
    
    // Analyze delivery requirements
    const deliveryAnalysis = await this.analyzeDeliveryRequirements(deliveries);
    
    // Match vehicles to delivery requirements
    const vehicleMatching = await this.matchVehiclesToDeliveries(
      availableVehicles,
      deliveries,
      deliveryAnalysis
    );
    
    // Optimize routes for each vehicle
    const routeOptimizations = await Promise.all(
      vehicleMatching.map(async match => ({
        vehicleId: match.vehicleId,
        route: await this.optimizeDeliveryRoute(match.vehicleId, match.deliveries),
        deliveries: match.deliveries
      }))
    );
    
    // Calculate fleet performance metrics
    const fleetMetrics = await this.calculateFleetPerformanceMetrics(routeOptimizations);
    
    return {
      fleetId,
      vehicleAssignments: routeOptimizations,
      totalDistance: fleetMetrics.totalDistance,
      totalTime: fleetMetrics.totalTime,
      estimatedCost: fleetMetrics.estimatedCost,
      deliveryWindows: fleetMetrics.deliveryWindows,
      optimizationScore: fleetMetrics.optimizationScore
    };
  }
  
  private async optimizeDeliveryRoute(vehicleId: string, deliveries: Delivery[]): Promise<OptimizedDeliveryRoute> {
    const vehicle = await this.getVehicle(vehicleId);
    
    // Sort deliveries by priority and time windows
    const prioritizedDeliveries = this.prioritizeDeliveries(deliveries);
    
    // Calculate optimal sequence considering traffic and time windows
    const optimalSequence = await this.calculateOptimalDeliverySequence(
      vehicle.currentLocation,
      prioritizedDeliveries,
      vehicle.capacity
    );
    
    // Generate turn-by-turn directions
    const routeDirections = await this.generateRouteDirections(optimalSequence);
    
    // Estimate delivery times
    const deliveryTimeEstimates = await this.estimateDeliveryTimes(optimalSequence);
    
    return {
      vehicleId,
      deliverySequence: optimalSequence,
      routeDirections,
      deliveryTimeEstimates,
      totalDistance: routeDirections.totalDistance,
      estimatedDuration: routeDirections.estimatedDuration,
      fuelCost: await this.estimateFuelCost(vehicle, routeDirections.totalDistance)
    };
  }
  
  private prioritizeDeliveries(deliveries: Delivery[]): Delivery[] {
    return deliveries.sort((a, b) => {
      // Priority order: urgent > high > normal > low
      const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by time window (earlier windows first)
      if (a.timeWindow && b.timeWindow) {
        return a.timeWindow.start.getTime() - b.timeWindow.start.getTime();
      }
      
      return 0;
    });
  }
}
```

### Ride-Share Fleet Management

```typescript
class RideShareFleetService {
  async manageRideShareFleet(fleetId: string): Promise<RideShareFleetStatus> {
    // Get current fleet status
    const fleetStatus = await this.getFleetStatus(fleetId);
    
    // Analyze demand patterns
    const demandAnalysis = await this.analyzeDemandPatterns(fleetId);
    
    // Optimize vehicle positioning
    const positioningStrategy = await this.optimizeVehiclePositioning(
      fleetStatus.vehicles,
      demandAnalysis
    );
    
    // Manage driver shifts
    const shiftManagement = await this.optimizeDriverShifts(fleetId, demandAnalysis);
    
    // Monitor vehicle utilization
    const utilizationMetrics = await this.calculateVehicleUtilization(fleetId);
    
    return {
      fleetId,
      totalVehicles: fleetStatus.totalVehicles,
      activeVehicles: fleetStatus.activeVehicles,
      availableVehicles: fleetStatus.availableVehicles,
      demandAnalysis,
      positioningStrategy,
      shiftManagement,
      utilizationMetrics,
      recommendations: await this.generateFleetRecommendations(fleetStatus, demandAnalysis)
    };
  }
  
  private async optimizeVehiclePositioning(
    vehicles: Vehicle[],
    demandAnalysis: DemandAnalysis
  ): Promise<VehiclePositioningStrategy> {
    const availableVehicles = vehicles.filter(v => v.status === VehicleStatus.AVAILABLE);
    
    // Identify high-demand areas
    const highDemandAreas = demandAnalysis.hotspots.filter(h => h.demandLevel > 0.7);
    
    // Calculate optimal positioning
    const positioningRecommendations = await Promise.all(
      availableVehicles.map(async vehicle => {
        const optimalArea = await this.findOptimalPositionForVehicle(
          vehicle,
          highDemandAreas,
          demandAnalysis.predictions
        );
        
        return {
          vehicleId: vehicle.id,
          currentLocation: vehicle.currentLocation,
          recommendedLocation: optimalArea.center,
          expectedBenefit: optimalArea.expectedRides,
          travelTime: await this.calculateTravelTime(vehicle.currentLocation, optimalArea.center)
        };
      })
    );
    
    return {
      recommendations: positioningRecommendations,
      totalExpectedBenefit: positioningRecommendations.reduce((sum, r) => sum + r.expectedBenefit, 0),
      implementationPriority: this.prioritizePositioningMoves(positioningRecommendations)
    };
  }
  
  private async optimizeDriverShifts(
    fleetId: string,
    demandAnalysis: DemandAnalysis
  ): Promise<ShiftOptimization> {
    const currentShifts = await this.getCurrentShifts(fleetId);
    const demandForecast = demandAnalysis.predictions;
    
    // Identify periods needing more drivers
    const understaffedPeriods = demandForecast.filter(p => p.demandLevel > p.supplyLevel * 1.2);
    
    // Identify periods with excess drivers
    const overstaffedPeriods = demandForecast.filter(p => p.supplyLevel > p.demandLevel * 1.2);
    
    // Generate shift recommendations
    const shiftRecommendations = await this.generateShiftRecommendations(
      understaffedPeriods,
      overstaffedPeriods,
      currentShifts
    );
    
    return {
      currentShiftCount: currentShifts.length,
      understaffedPeriods,
      overstaffedPeriods,
      shiftRecommendations,
      expectedImpact: await this.calculateShiftOptimizationImpact(shiftRecommendations)
    };
  }
}
```

### Logistics Fleet Management

```typescript
class LogisticsFleetService {
  async manageLogisticsFleet(fleetId: string, shipments: Shipment[]): Promise<LogisticsFleetPlan> {
    // Analyze shipment requirements
    const shipmentAnalysis = await this.analyzeShipmentRequirements(shipments);
    
    // Get available fleet capacity
    const fleetCapacity = await this.getFleetCapacity(fleetId);
    
    // Optimize vehicle assignments
    const vehicleAssignments = await this.optimizeVehicleAssignments(
      shipments,
      fleetCapacity,
      shipmentAnalysis
    );
    
    // Plan multi-stop routes
    const routePlans = await Promise.all(
      vehicleAssignments.map(assignment =>
        this.planMultiStopRoute(assignment.vehicleId, assignment.shipments)
      )
    );
    
    // Optimize loading sequences
    const loadingPlans = await Promise.all(
      vehicleAssignments.map(assignment =>
        this.optimizeLoadingSequence(assignment.vehicleId, assignment.shipments)
      )
    );
    
    return {
      fleetId,
      vehicleAssignments,
      routePlans,
      loadingPlans,
      totalShipments: shipments.length,
      estimatedDeliveryTime: this.calculateTotalDeliveryTime(routePlans),
      costEstimate: await this.calculateLogisticsCost(vehicleAssignments, routePlans)
    };
  }
  
  private async optimizeVehicleAssignments(
    shipments: Shipment[],
    fleetCapacity: FleetCapacity,
    analysis: ShipmentAnalysis
  ): Promise<VehicleAssignment[]> {
    // Group shipments by destination clusters
    const shipmentClusters = this.clusterShipmentsByDestination(shipments);
    
    // Match vehicle types to shipment requirements
    const assignments: VehicleAssignment[] = [];
    
    for (const cluster of shipmentClusters) {
      const suitableVehicles = fleetCapacity.vehicles.filter(vehicle =>
        this.isVehicleSuitableForShipments(vehicle, cluster.shipments)
      );
      
      if (suitableVehicles.length === 0) {
        throw new Error(`No suitable vehicles for shipment cluster ${cluster.id}`);
      }
      
      // Select optimal vehicle based on capacity utilization and cost
      const optimalVehicle = this.selectOptimalVehicle(suitableVehicles, cluster.shipments);
      
      assignments.push({
        vehicleId: optimalVehicle.id,
        shipments: cluster.shipments,
        capacityUtilization: this.calculateCapacityUtilization(optimalVehicle, cluster.shipments),
        estimatedCost: await this.estimateAssignmentCost(optimalVehicle, cluster.shipments)
      });
    }
    
    return assignments;
  }
  
  private optimizeLoadingSequence(vehicleId: string, shipments: Shipment[]): Promise<LoadingPlan> {
    // Sort shipments by delivery order (last in, first out principle)
    const deliveryOrder = this.getDeliveryOrder(shipments);
    const loadingSequence = deliveryOrder.reverse();
    
    // Consider weight distribution and fragility
    const optimizedSequence = this.optimizeForWeightDistribution(loadingSequence);
    
    // Generate loading instructions
    const loadingInstructions = this.generateLoadingInstructions(optimizedSequence);
    
    return Promise.resolve({
      vehicleId,
      loadingSequence: optimizedSequence,
      loadingInstructions,
      estimatedLoadingTime: this.calculateLoadingTime(optimizedSequence),
      weightDistribution: this.calculateWeightDistribution(optimizedSequence)
    });
  }
}
```

## Fleet Analytics and Reporting

### Performance Analytics

```typescript
interface FleetAnalyticsService {
  // Performance metrics
  getFleetPerformanceMetrics(fleetId: string, timeRange: TimeRange): Promise<FleetPerformanceMetrics>;
  getVehiclePerformanceComparison(vehicleIds: string[]): Promise<VehiclePerformanceComparison>;
  
  // Utilization analysis
  analyzeFleetUtilization(fleetId: string, timeRange: TimeRange): Promise<UtilizationAnalysis>;
  identifyUnderutilizedVehicles(fleetId: string): Promise<UnderutilizedVehicle[]>;
  
  // Cost analysis
  analyzeFleetCosts(fleetId: string, timeRange: TimeRange): Promise<FleetCostAnalysis>;
  compareCostEfficiency(fleetIds: string[]): Promise<CostEfficiencyComparison>;
  
  // Predictive analytics
  predictFleetMaintenance(fleetId: string): Promise<MaintenancePrediction[]>;
  forecastFleetDemand(fleetId: string, forecastPeriod: TimeRange): Promise<DemandForecast>;
  
  // Environmental impact
  calculateEmissions(fleetId: string, timeRange: TimeRange): Promise<EmissionsReport>;
  analyzeFuelEfficiency(fleetId: string): Promise<FuelEfficiencyAnalysis>;
}

interface FleetPerformanceMetrics {
  fleetId: string;
  timeRange: TimeRange;
  totalVehicles: number;
  activeVehicles: number;
  totalMilesDriven: number;
  averageUtilization: number;
  onTimePerformance: number;
  fuelEfficiency: number;
  maintenanceCosts: number;
  customerSatisfaction: number;
  safetyScore: number;
  costPerMile: number;
}
```

### Reporting System

```typescript
interface FleetReportingService {
  // Standard reports
  generateDailyFleetReport(fleetId: string, date: Date): Promise<DailyFleetReport>;
  generateWeeklyFleetReport(fleetId: string, week: WeekRange): Promise<WeeklyFleetReport>;
  generateMonthlyFleetReport(fleetId: string, month: MonthRange): Promise<MonthlyFleetReport>;
  
  // Custom reports
  createCustomReport(reportDefinition: CustomReportDefinition): Promise<CustomReport>;
  scheduleRecurringReport(reportSchedule: ReportSchedule): Promise<string>;
  
  // Compliance reports
  generateComplianceReport(fleetId: string, complianceType: ComplianceType): Promise<ComplianceReport>;
  generateSafetyReport(fleetId: string, timeRange: TimeRange): Promise<SafetyReport>;
  
  // Executive dashboards
  generateExecutiveDashboard(fleetId: string): Promise<ExecutiveDashboard>;
  generateKPIDashboard(fleetId: string, kpis: KPI[]): Promise<KPIDashboard>;
}
```

## Testing Strategy

### Unit Tests

```typescript
describe('Fleet Management Service', () => {
  test('should register vehicle successfully', async () => {
    const vehicleRegistration = createMockVehicleRegistration();
    
    const vehicleId = await fleetService.registerVehicle(vehicleRegistration);
    
    expect(vehicleId).toBeDefined();
    expect(typeof vehicleId).toBe('string');
  });
  
  test('should track vehicle location updates', async () => {
    const vehicleId = 'test-vehicle-123';
    const locationUpdate = createMockLocationUpdate();
    
    await fleetService.updateVehicleLocation(vehicleId, locationUpdate);
    
    const currentLocation = await fleetService.getVehicleLocation(vehicleId);
    expect(currentLocation.latitude).toBe(locationUpdate.location.latitude);
    expect(currentLocation.longitude).toBe(locationUpdate.location.longitude);
  });
  
  test('should optimize routes correctly', async () => {
    const vehicles = createMockVehicles(3);
    const destinations = createMockDestinations(10);
    
    const optimization = await fleetService.optimizeRoutes(vehicles, destinations);
    
    expect(optimization.routes).toHaveLength(3);
    expect(optimization.totalDistance).toBeGreaterThan(0);
    expect(optimization.optimizationScore).toBeGreaterThan(0);
  });
});
```

### Integration Tests

```typescript
describe('Fleet Management Integration', () => {
  test('should handle complete fleet operation workflow', async () => {
    const fleetId = 'test-fleet';
    
    // Register vehicles
    const vehicles = await Promise.all([
      fleetService.registerVehicle(createMockVehicleRegistration()),
      fleetService.registerVehicle(createMockVehicleRegistration()),
      fleetService.registerVehicle(createMockVehicleRegistration())
    ]);
    
    // Assign drivers
    const drivers = await Promise.all(
      vehicles.map(vehicleId => 
        fleetService.assignDriver(vehicleId, createMockDriverId())
      )
    );
    
    // Start tracking
    await Promise.all(
      vehicles.map(vehicleId =>
        fleetService.startTracking(vehicleId, defaultTrackingOptions)
      )
    );
    
    // Optimize routes
    const destinations = createMockDestinations(15);
    const optimization = await fleetService.optimizeRoutes(
      await Promise.all(vehicles.map(id => fleetService.getVehicle(id))),
      destinations
    );
    
    expect(optimization.routes).toHaveLength(3);
    expect(optimization.totalDistance).toBeGreaterThan(0);
    
    // Generate report
    const report = await fleetService.generateFleetReport(
      fleetId,
      ReportType.DAILY,
      { start: new Date(), end: new Date() }
    );
    
    expect(report.vehicleCount).toBe(3);
    expect(report.metrics).toBeDefined();
  });
});
```

## Error Handling

```typescript
class FleetManagementError extends Error {
  constructor(message: string, public code: FleetErrorCode, public details?: any) {
    super(message);
    this.name = 'FleetManagementError';
  }
}

enum FleetErrorCode {
  VEHICLE_NOT_FOUND = 'VEHICLE_NOT_FOUND',
  DRIVER_NOT_AVAILABLE = 'DRIVER_NOT_AVAILABLE',
  ROUTE_OPTIMIZATION_FAILED = 'ROUTE_OPTIMIZATION_FAILED',
  TRACKING_ERROR = 'TRACKING_ERROR',
  MAINTENANCE_SCHEDULING_ERROR = 'MAINTENANCE_SCHEDULING_ERROR',
  INVALID_VEHICLE_STATUS = 'INVALID_VEHICLE_STATUS'
}

interface FleetErrorHandler {
  handleFleetError(error: FleetManagementError): Promise<void>;
  retryFleetOperation(operation: FleetOperation): Promise<any>;
  escalateFleetIssue(issue: FleetIssue): Promise<void>;
}
```

## Configuration

```typescript
interface FleetManagementConfig {
  tracking: {
    updateInterval: number;
    highAccuracyMode: boolean;
    geofenceMonitoring: boolean;
    offlineDataRetention: number;
  };
  
  optimization: {
    routeOptimizationEnabled: boolean;
    realTimeReoptimization: boolean;
    trafficDataIntegration: boolean;
    weatherConsideration: boolean;
  };
  
  maintenance: {
    predictiveMaintenanceEnabled: boolean;
    maintenanceReminderDays: number;
    autoSchedulingEnabled: boolean;
    partsInventoryTracking: boolean;
  };
  
  analytics: {
    performanceMetricsEnabled: boolean;
    reportGenerationSchedule: string;
    dataRetentionDays: number;
    realTimeDashboard: boolean;
  };
}
```

## Privacy and Data Protection

### Fleet Data Privacy

```typescript
interface FleetPrivacyService {
  // Driver privacy protection
  requestDriverDataConsent(driverId: string, dataTypes: DriverDataType[]): Promise<ConsentResult>;
  anonymizeDriverData(data: DriverData): AnonymizedDriverData;
  
  // Vehicle tracking privacy
  anonymizeVehicleLocation(location: LocationData, precision: number): LocationData;
  validateTrackingConsent(driverId: string, vehicleId: string): Promise<boolean>;
  
  // Data retention and deletion
  scheduleFleetDataDeletion(entityId: string, retentionPeriod: number): Promise<void>;
  deleteDriverHistory(driverId: string): Promise<DeletionResult>;
  
  // Privacy compliance
  generateFleetDataReport(entityId: string): Promise<FleetDataReport>;
  handleDataPortabilityRequest(driverId: string): Promise<FleetDataExport>;
}

interface FleetPrivacyPreferences {
  allowLocationTracking: boolean;
  allowPerformanceMonitoring: boolean;
  shareDataForOptimization: boolean;
  allowBehaviorAnalysis: boolean;
  dataRetentionPeriod: number; // days
}
```

### Driver Privacy Rights

```typescript
interface DriverPrivacyRights {
  // Privacy controls
  setDriverPrivacyPreferences(driverId: string, preferences: FleetPrivacyPreferences): Promise<void>;
  getDriverPrivacyPreferences(driverId: string): Promise<FleetPrivacyPreferences>;
  
  // Data access rights
  getDriverDataSummary(driverId: string): Promise<DriverDataSummary>;
  exportDriverData(driverId: string, format: ExportFormat): Promise<DriverDataExport>;
  
  // Consent management
  updateDriverConsent(driverId: string, consentType: string, granted: boolean): Promise<void>;
  getDriverConsentStatus(driverId: string): Promise<ConsentStatus[]>;
}
```

## Best Practices

1. **Real-Time Monitoring**: Implement continuous vehicle and driver monitoring for safety and efficiency
2. **Predictive Maintenance**: Use data analytics to predict maintenance needs and prevent breakdowns
3. **Route Optimization**: Continuously optimize routes based on traffic, weather, and demand patterns
4. **Driver Safety**: Monitor driving behavior and provide feedback to improve safety scores
5. **Cost Management**: Track and analyze all fleet-related costs for better financial control
6. **Compliance**: Ensure all vehicles and drivers meet regulatory requirements
7. **Environmental Impact**: Monitor and optimize for fuel efficiency and emissions reduction
8. **Scalability**: Design systems that can handle fleet growth and changing business needs
9. **Privacy Protection**: Implement comprehensive privacy controls for driver and vehicle data
10. **Data Security**: Encrypt sensitive fleet information and ensure secure data handling

This template provides a comprehensive foundation for implementing sophisticated fleet management systems that can handle complex operational requirements while maintaining efficiency, safety, cost-effectiveness, and privacy compliance across various transportation and logistics applications.
