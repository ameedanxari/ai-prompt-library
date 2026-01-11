# Booking Management and Appointment Scheduling

## Purpose
Implement comprehensive booking and appointment scheduling systems for service-based applications including healthcare, beauty services, home services, consultations, and any business requiring time-slot management with availability tracking and calendar integration.

## Context
Booking management is essential for service-based businesses that need to coordinate appointments between providers and customers. Modern booking systems must handle complex availability rules, multiple resources, recurring appointments, and real-time updates. This template addresses the complexity of building flexible scheduling systems that optimize resource utilization while providing excellent user experiences.

## Instructions
1. Analyze booking and scheduling requirements for service-based applications
2. Design comprehensive appointment scheduling with availability management
3. Implement real-time booking systems with calendar integration
4. Build multi-resource booking for complex scheduling scenarios
5. Create recurring appointment management with flexible patterns
6. Add booking optimization with intelligent slot suggestions
7. Implement notification systems with automated reminders
8. Build cancellation and rescheduling workflows with policies
9. Create booking analytics with utilization and performance metrics
10. Add integration with calendar systems and third-party scheduling tools

## Examples

### Example 1: Healthcare Appointment Scheduling
```typescript
// Medical appointment booking with provider availability
class HealthcareBookingSystem {
  async scheduleAppointment(request: AppointmentRequest): Promise<BookingResult> {
    const availability = await this.getProviderAvailability(
      request.providerId,
      request.preferredDate,
      request.appointmentType
    );
    
    const optimalSlot = await this.findOptimalSlot(availability, request);
    
    const booking = await this.createBooking({
      ...request,
      scheduledTime: optimalSlot.startTime,
      duration: optimalSlot.duration
    });
    
    await this.sendConfirmationNotifications(booking);
    return booking;
  }
}
```

### Example 2: Multi-Resource Booking System
```typescript
// Complex booking system with multiple resources
class MultiResourceBookingSystem {
  async bookMultipleResources(request: MultiResourceBookingRequest): Promise<BookingResult> {
    const resourceAvailability = await Promise.all(
      request.requiredResources.map(resource => 
        this.getResourceAvailability(resource.id, request.timeRange)
      )
    );
    
    const availableSlots = await this.findCommonAvailability(
      resourceAvailability,
      request.duration
    );
    
    if (availableSlots.length === 0) {
      return { success: false, reason: 'no_availability' };
    }
    
    return await this.reserveResources(availableSlots[0], request);
  }
}
```

### Example 3: Intelligent Booking Optimization
```typescript
// AI-powered booking optimization and suggestions
class BookingOptimizer {
  async optimizeSchedule(providerId: string, date: Date): Promise<ScheduleOptimization> {
    const currentBookings = await this.getBookingsForDate(providerId, date);
    const availability = await this.getProviderAvailability(providerId, date);
    
    const optimization = await this.mlOptimizer.optimize({
      bookings: currentBookings,
      availability,
      constraints: await this.getSchedulingConstraints(providerId),
      objectives: ['maximize_utilization', 'minimize_gaps']
    });
    
    return {
      suggestedChanges: optimization.recommendations,
      utilizationImprovement: optimization.utilizationGain,
      revenueImpact: optimization.revenueProjection
    };
  }
}
```

## Variables
| Variable | Type | Description | Default | Required |
|----------|------|-------------|---------|----------|
| bookingTypes | array | Supported booking types | ['appointment', 'reservation'] | Yes |
| availabilityGranularity | number | Time slot granularity in minutes | 15 | No |
| recurringBookings | boolean | Support recurring appointments | true | No |
| multiResourceBooking | boolean | Multiple resource booking | false | No |
| calendarIntegration | boolean | Calendar system integration | true | No |
| automatedReminders | boolean | Automated reminder notifications | true | No |
| cancellationPolicies | boolean | Flexible cancellation rules | true | No |
| bookingOptimization | boolean | AI-powered schedule optimization | false | No |
| waitlistManagement | boolean | Waitlist for full slots | true | No |
| groupBookings | boolean | Group appointment booking | false | No |

## Expected Output
A comprehensive booking and appointment scheduling system featuring:
- Real-time availability management with dynamic slot generation
- Multi-resource booking capabilities for complex scheduling scenarios
- Recurring appointment management with flexible pattern configuration
- Intelligent booking optimization with AI-powered schedule suggestions
- Automated notification system with customizable reminder workflows
- Calendar integration with popular calendar systems and sync capabilities
- Cancellation and rescheduling workflows with flexible policy management
- Waitlist management with automatic rebooking when slots become available
- Group booking capabilities for team appointments and events
- Comprehensive analytics with utilization metrics and performance insights

## Implementation Approach

### Core Booking Management System

```typescript
interface BookingManagementService {
  // Booking operations
  createBooking(booking: BookingRequest): Promise<BookingResult>;
  updateBooking(bookingId: string, updates: BookingUpdate): Promise<BookingResult>;
  cancelBooking(bookingId: string, reason: CancellationReason): Promise<CancellationResult>;
  
  // Availability management
  getAvailability(providerId: string, dateRange: DateRange): Promise<AvailabilitySlot[]>;
  setAvailability(providerId: string, availability: AvailabilitySchedule): Promise<void>;
  blockTimeSlot(providerId: string, timeSlot: TimeSlot, reason: string): Promise<void>;
  
  // Booking queries
  getBooking(bookingId: string): Promise<Booking>;
  getBookingsByProvider(providerId: string, dateRange: DateRange): Promise<Booking[]>;
  getBookingsByCustomer(customerId: string, dateRange: DateRange): Promise<Booking[]>;
  
  // Scheduling optimization
  suggestOptimalSlots(request: BookingRequest): Promise<SuggestedSlot[]>;
  optimizeSchedule(providerId: string, date: Date): Promise<ScheduleOptimization>;
  
  // Notifications and reminders
  scheduleReminders(bookingId: string, reminderSettings: ReminderSettings): Promise<void>;
  sendBookingConfirmation(bookingId: string): Promise<void>;
}

interface BookingRequest {
  customerId: string;
  providerId: string;
  serviceId: string;
  preferredDateTime: Date;
  duration: number; // minutes
  location?: LocationData;
  isRecurring?: boolean;
  recurringPattern?: RecurringPattern;
  requirements?: BookingRequirement[];
  preferences?: BookingPreferences;
  metadata: Record<string, any>;
}

interface Booking {
  id: string;
  customerId: string;
  providerId: string;
  serviceId: string;
  scheduledDateTime: Date;
  duration: number;
  status: BookingStatus;
  location?: LocationData;
  isRecurring: boolean;
  recurringGroupId?: string;
  requirements: BookingRequirement[];
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  RESCHEDULED = 'rescheduled'
}

interface AvailabilitySlot {
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
  providerId: string;
  serviceTypes: string[];
  capacity: number;
  bookedCount: number;
  restrictions?: SlotRestriction[];
}
```

### Advanced Scheduling Features

```typescript
interface AdvancedSchedulingService {
  // Multi-resource booking
  createMultiResourceBooking(request: MultiResourceBookingRequest): Promise<BookingResult>;
  findAvailableResourceCombination(requirements: ResourceRequirement[]): Promise<ResourceCombination[]>;
  
  // Recurring appointments
  createRecurringBooking(request: RecurringBookingRequest): Promise<RecurringBookingResult>;
  updateRecurringBooking(groupId: string, updates: RecurringUpdate): Promise<void>;
  cancelRecurringBooking(groupId: string, cancellationType: CancellationType): Promise<void>;
  
  // Waitlist management
  addToWaitlist(request: WaitlistRequest): Promise<WaitlistEntry>;
  processWaitlist(providerId: string, availableSlot: AvailabilitySlot): Promise<WaitlistProcessingResult>;
  
  // Buffer time management
  calculateBufferTime(serviceId: string, previousBooking?: Booking, nextBooking?: Booking): Promise<BufferTime>;
  optimizeBufferTimes(providerId: string, schedule: Booking[]): Promise<OptimizedSchedule>;
  
  // Overbooking management
  enableOverbooking(providerId: string, overbookingRules: OverbookingRules): Promise<void>;
  calculateOverbookingCapacity(providerId: string, timeSlot: TimeSlot): Promise<number>;
}

interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // every N frequency units
  daysOfWeek?: number[]; // 0-6, Sunday = 0
  dayOfMonth?: number;
  endDate?: Date;
  occurrences?: number;
  exceptions?: Date[]; // dates to skip
}

interface MultiResourceBookingRequest {
  customerId: string;
  serviceId: string;
  preferredDateTime: Date;
  duration: number;
  resourceRequirements: ResourceRequirement[];
  location?: LocationData;
  preferences?: BookingPreferences;
}

interface ResourceRequirement {
  resourceType: ResourceType;
  quantity: number;
  specifications?: ResourceSpecification[];
  isRequired: boolean;
}

enum ResourceType {
  PROVIDER = 'provider',
  ROOM = 'room',
  EQUIPMENT = 'equipment',
  VEHICLE = 'vehicle',
  FACILITY = 'facility'
}
```

### Calendar Integration Service

```typescript
interface CalendarIntegrationService {
  // Calendar sync
  syncWithExternalCalendar(providerId: string, calendarConfig: CalendarConfig): Promise<SyncResult>;
  importCalendarEvents(providerId: string, calendarId: string): Promise<ImportResult>;
  exportBookingsToCalendar(providerId: string, calendarId: string, bookings: Booking[]): Promise<ExportResult>;
  
  // Real-time sync
  enableRealTimeSync(providerId: string, calendarId: string): Promise<SyncSubscription>;
  handleCalendarWebhook(webhook: CalendarWebhook): Promise<void>;
  
  // Conflict resolution
  detectSchedulingConflicts(providerId: string, newBooking: BookingRequest): Promise<ConflictDetection>;
  resolveSchedulingConflict(conflictId: string, resolution: ConflictResolution): Promise<void>;
  
  // Multi-calendar support
  addCalendarSource(providerId: string, calendar: CalendarSource): Promise<string>;
  removeCalendarSource(providerId: string, calendarId: string): Promise<void>;
  getCalendarSources(providerId: string): Promise<CalendarSource[]>;
}

interface CalendarConfig {
  provider: 'google' | 'outlook' | 'apple' | 'caldav';
  credentials: CalendarCredentials;
  syncDirection: 'import' | 'export' | 'bidirectional';
  conflictResolution: 'manual' | 'auto_block' | 'auto_reschedule';
}

interface ConflictDetection {
  hasConflicts: boolean;
  conflicts: SchedulingConflict[];
  suggestions: ConflictResolution[];
}

interface SchedulingConflict {
  id: string;
  type: 'overlap' | 'double_booking' | 'resource_conflict';
  existingBooking: Booking;
  newBooking: BookingRequest;
  conflictDetails: string;
}
```

### Availability Management

```typescript
interface AvailabilityManagementService {
  // Working hours
  setWorkingHours(providerId: string, workingHours: WorkingHours): Promise<void>;
  getWorkingHours(providerId: string): Promise<WorkingHours>;
  setHolidays(providerId: string, holidays: Holiday[]): Promise<void>;
  
  // Dynamic availability
  updateRealTimeAvailability(providerId: string, updates: AvailabilityUpdate[]): Promise<void>;
  getAvailabilityMatrix(providerIds: string[], dateRange: DateRange): Promise<AvailabilityMatrix>;
  
  // Capacity management
  setServiceCapacity(providerId: string, serviceId: string, capacity: ServiceCapacity): Promise<void>;
  getAvailableCapacity(providerId: string, timeSlot: TimeSlot): Promise<CapacityInfo>;
  
  // Availability rules
  createAvailabilityRule(providerId: string, rule: AvailabilityRule): Promise<string>;
  updateAvailabilityRule(ruleId: string, updates: Partial<AvailabilityRule>): Promise<void>;
  deleteAvailabilityRule(ruleId: string): Promise<void>;
  
  // Bulk operations
  bulkUpdateAvailability(updates: BulkAvailabilityUpdate[]): Promise<BulkUpdateResult>;
  generateAvailabilityReport(providerId: string, dateRange: DateRange): Promise<AvailabilityReport>;
}

interface WorkingHours {
  providerId: string;
  schedule: DaySchedule[];
  timezone: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
}

interface DaySchedule {
  dayOfWeek: number; // 0-6, Sunday = 0
  isWorkingDay: boolean;
  shifts: TimeSlot[];
  breaks: TimeSlot[];
  specialRules?: SpecialRule[];
}

interface AvailabilityRule {
  id: string;
  name: string;
  condition: RuleCondition;
  action: RuleAction;
  priority: number;
  isActive: boolean;
}

interface ServiceCapacity {
  serviceId: string;
  maxConcurrentBookings: number;
  bufferTime: BufferTime;
  overbookingAllowed: boolean;
  overbookingLimit?: number;
}
```

### Booking Optimization Engine

```typescript
interface BookingOptimizationEngine {
  // Schedule optimization
  optimizeProviderSchedule(providerId: string, date: Date): Promise<OptimizedSchedule>;
  suggestScheduleImprovements(providerId: string, dateRange: DateRange): Promise<ScheduleImprovement[]>;
  
  // Slot recommendation
  recommendOptimalSlots(request: BookingRequest, alternatives: number): Promise<SlotRecommendation[]>;
  findBestFitSlot(request: BookingRequest, constraints: SchedulingConstraint[]): Promise<TimeSlot>;
  
  // Utilization optimization
  maximizeProviderUtilization(providerId: string, targetUtilization: number): Promise<UtilizationStrategy>;
  minimizeGapTime(providerId: string, schedule: Booking[]): Promise<GapOptimization>;
  
  // Revenue optimization
  optimizeForRevenue(providerId: string, bookings: Booking[], pricingRules: PricingRule[]): Promise<RevenueOptimization>;
  suggestPricingAdjustments(providerId: string, demandData: DemandData): Promise<PricingAdjustment[]>;
  
  // Customer satisfaction optimization
  optimizeForCustomerPreferences(customerId: string, availableSlots: AvailabilitySlot[]): Promise<PreferenceOptimization>;
  balanceProviderAndCustomerPreferences(request: BookingRequest): Promise<BalancedRecommendation>;
}

interface OptimizedSchedule {
  providerId: string;
  date: Date;
  originalSchedule: Booking[];
  optimizedSchedule: Booking[];
  improvements: ScheduleImprovement[];
  utilizationIncrease: number;
  revenueIncrease: number;
}

interface SlotRecommendation {
  slot: TimeSlot;
  score: number;
  reasons: string[];
  alternativeOptions: TimeSlot[];
  customerBenefits: string[];
  providerBenefits: string[];
}
```

## Platform-Specific Implementation

### Healthcare Appointment Scheduling

```typescript
class HealthcareBookingService {
  async scheduleAppointment(appointmentRequest: HealthcareAppointmentRequest): Promise<AppointmentResult> {
    // Validate medical requirements
    await this.validateMedicalRequirements(appointmentRequest);
    
    // Check provider credentials for service type
    await this.validateProviderCredentials(appointmentRequest.providerId, appointmentRequest.appointmentType);
    
    // Find available slots considering preparation time
    const availableSlots = await this.getAvailableMedicalSlots(
      appointmentRequest.providerId,
      appointmentRequest.appointmentType,
      appointmentRequest.preferredDate
    );
    
    // Consider patient history and preferences
    const optimizedSlots = await this.optimizeForPatientHistory(
      appointmentRequest.patientId,
      availableSlots
    );
    
    const selectedSlot = optimizedSlots[0];
    if (!selectedSlot) {
      throw new Error('No available appointment slots');
    }
    
    // Create appointment with medical-specific fields
    const appointment = await this.createMedicalAppointment({
      ...appointmentRequest,
      scheduledDateTime: selectedSlot.startTime,
      duration: this.calculateAppointmentDuration(appointmentRequest.appointmentType),
      preparationTime: this.getPreparationTime(appointmentRequest.appointmentType),
      followUpRequired: this.requiresFollowUp(appointmentRequest.appointmentType)
    });
    
    // Schedule automated reminders
    await this.scheduleHealthcareReminders(appointment);
    
    // Update patient records
    await this.updatePatientSchedule(appointmentRequest.patientId, appointment);
    
    return appointment;
  }
  
  private async validateMedicalRequirements(request: HealthcareAppointmentRequest): Promise<void> {
    // Check insurance coverage
    if (request.insuranceInfo) {
      await this.validateInsuranceCoverage(request.insuranceInfo, request.appointmentType);
    }
    
    // Validate referral requirements
    if (this.requiresReferral(request.appointmentType)) {
      await this.validateReferral(request.patientId, request.appointmentType);
    }
    
    // Check for required pre-appointment procedures
    const preRequirements = await this.getPreAppointmentRequirements(request.appointmentType);
    if (preRequirements.length > 0) {
      await this.validatePreRequirements(request.patientId, preRequirements);
    }
  }
  
  private async optimizeForPatientHistory(
    patientId: string, 
    availableSlots: AvailabilitySlot[]
  ): Promise<AvailabilitySlot[]> {
    const patientHistory = await this.getPatientHistory(patientId);
    
    return availableSlots.map(slot => ({
      ...slot,
      score: this.scoreSlotForPatient(slot, patientHistory)
    })).sort((a, b) => b.score - a.score);
  }
  
  private scoreSlotForPatient(slot: AvailabilitySlot, history: PatientHistory): number {
    let score = 1.0;
    
    // Prefer similar times to previous appointments
    if (history.preferredTimeOfDay) {
      const slotHour = slot.startTime.getHours();
      const preferredHour = history.preferredTimeOfDay;
      const timeDiff = Math.abs(slotHour - preferredHour);
      score *= Math.max(0.5, 1 - (timeDiff / 12));
    }
    
    // Consider patient's punctuality history
    if (history.punctualityScore) {
      // Earlier slots for less punctual patients
      if (history.punctualityScore < 0.7) {
        const hourOfDay = slot.startTime.getHours();
        score *= hourOfDay < 12 ? 1.2 : 0.8;
      }
    }
    
    // Account for patient's no-show history
    if (history.noShowRate > 0.2) {
      // Prefer slots with less impact if no-show occurs
      score *= 0.9;
    }
    
    return score;
  }
}
```

### Beauty and Wellness Booking

```typescript
class BeautyWellnessBookingService {
  async bookBeautyService(serviceRequest: BeautyServiceRequest): Promise<BeautyBookingResult> {
    // Get service details and duration
    const serviceDetails = await this.getServiceDetails(serviceRequest.serviceId);
    
    // Find stylists/therapists with required skills
    const qualifiedProviders = await this.findQualifiedBeautyProviders(
      serviceRequest.serviceId,
      serviceRequest.location
    );
    
    // Consider customer preferences (gender, experience level, etc.)
    const preferredProviders = this.filterByCustomerPreferences(
      qualifiedProviders,
      serviceRequest.preferences
    );
    
    // Find available slots considering service preparation and cleanup
    const availableSlots = await this.getBeautyServiceSlots(
      preferredProviders,
      serviceDetails,
      serviceRequest.preferredDateTime
    );
    
    // Optimize for customer loyalty and provider utilization
    const optimizedSlots = await this.optimizeBeautyBooking(
      availableSlots,
      serviceRequest.customerId,
      serviceDetails
    );
    
    const selectedSlot = optimizedSlots[0];
    if (!selectedSlot) {
      // Try to find alternative services or times
      return await this.suggestBeautyAlternatives(serviceRequest);
    }
    
    // Create booking with beauty-specific requirements
    const booking = await this.createBeautyBooking({
      ...serviceRequest,
      providerId: selectedSlot.providerId,
      scheduledDateTime: selectedSlot.startTime,
      duration: serviceDetails.duration,
      preparationTime: serviceDetails.preparationTime,
      cleanupTime: serviceDetails.cleanupTime,
      equipmentRequired: serviceDetails.equipment,
      productsRequired: serviceDetails.products
    });
    
    // Schedule pre-service consultation if required
    if (serviceDetails.requiresConsultation) {
      await this.scheduleConsultation(booking, serviceDetails.consultationDuration);
    }
    
    // Send service preparation instructions
    await this.sendPreServiceInstructions(booking);
    
    return booking;
  }
  
  private async optimizeBeautyBooking(
    slots: AvailabilitySlot[],
    customerId: string,
    serviceDetails: ServiceDetails
  ): Promise<AvailabilitySlot[]> {
    const customerHistory = await this.getCustomerBeautyHistory(customerId);
    
    return slots.map(slot => ({
      ...slot,
      score: this.scoreBeautySlot(slot, customerHistory, serviceDetails)
    })).sort((a, b) => b.score - a.score);
  }
  
  private scoreBeautySlot(
    slot: AvailabilitySlot,
    history: CustomerBeautyHistory,
    service: ServiceDetails
  ): number {
    let score = 1.0;
    
    // Prefer providers customer has used before
    if (history.preferredProviders.includes(slot.providerId)) {
      score *= 1.5;
    }
    
    // Consider service complexity and provider experience
    const provider = this.getProvider(slot.providerId);
    const experienceMatch = this.calculateExperienceMatch(provider, service);
    score *= experienceMatch;
    
    // Time preferences for beauty services
    const timeScore = this.scoreTimeForBeautyService(slot.startTime, service.type);
    score *= timeScore;
    
    // Loyalty program benefits
    if (history.loyaltyTier && this.hasLoyaltyBenefits(slot, history.loyaltyTier)) {
      score *= 1.2;
    }
    
    return score;
  }
}
```

### Home Services Scheduling

```typescript
class HomeServicesBookingService {
  async scheduleHomeService(serviceRequest: HomeServiceRequest): Promise<HomeServiceBooking> {
    // Validate service area coverage
    await this.validateServiceArea(serviceRequest.serviceLocation, serviceRequest.serviceType);
    
    // Get required equipment and materials
    const serviceRequirements = await this.getHomeServiceRequirements(serviceRequest.serviceType);
    
    // Find providers with required skills and equipment
    const qualifiedProviders = await this.findQualifiedHomeServiceProviders(
      serviceRequest.serviceType,
      serviceRequest.serviceLocation,
      serviceRequirements
    );
    
    // Consider travel time and route optimization
    const providersWithTravelTime = await Promise.all(
      qualifiedProviders.map(async provider => ({
        ...provider,
        travelTime: await this.calculateTravelTime(provider.currentLocation, serviceRequest.serviceLocation),
        routeOptimization: await this.optimizeProviderRoute(provider.id, serviceRequest.serviceLocation)
      }))
    );
    
    // Find available slots considering travel and service time
    const availableSlots = await this.getHomeServiceSlots(
      providersWithTravelTime,
      serviceRequest.preferredDateTime,
      serviceRequirements.estimatedDuration
    );
    
    // Optimize for customer convenience and provider efficiency
    const optimizedSlots = await this.optimizeHomeServiceBooking(
      availableSlots,
      serviceRequest,
      serviceRequirements
    );
    
    const selectedSlot = optimizedSlots[0];
    if (!selectedSlot) {
      return await this.suggestHomeServiceAlternatives(serviceRequest);
    }
    
    // Create booking with home service specifics
    const booking = await this.createHomeServiceBooking({
      ...serviceRequest,
      providerId: selectedSlot.providerId,
      scheduledDateTime: selectedSlot.startTime,
      estimatedDuration: serviceRequirements.estimatedDuration,
      travelTime: selectedSlot.travelTime,
      equipmentRequired: serviceRequirements.equipment,
      materialsRequired: serviceRequirements.materials,
      accessInstructions: serviceRequest.accessInstructions,
      specialRequirements: serviceRequest.specialRequirements
    });
    
    // Schedule pre-service confirmation
    await this.schedulePreServiceConfirmation(booking);
    
    // Send provider location and arrival updates
    await this.enableLocationTracking(booking);
    
    return booking;
  }
  
  private async optimizeHomeServiceBooking(
    slots: AvailabilitySlot[],
    request: HomeServiceRequest,
    requirements: ServiceRequirements
  ): Promise<AvailabilitySlot[]> {
    return slots.map(slot => ({
      ...slot,
      score: this.scoreHomeServiceSlot(slot, request, requirements)
    })).sort((a, b) => b.score - a.score);
  }
  
  private scoreHomeServiceSlot(
    slot: AvailabilitySlot,
    request: HomeServiceRequest,
    requirements: ServiceRequirements
  ): number {
    let score = 1.0;
    
    // Minimize travel time
    const travelTimeScore = Math.max(0.1, 1 - (slot.travelTime / 60)); // Normalize to 1 hour max
    score *= travelTimeScore;
    
    // Prefer providers with relevant experience
    const provider = this.getProvider(slot.providerId);
    const experienceScore = this.calculateHomeServiceExperience(provider, request.serviceType);
    score *= experienceScore;
    
    // Consider customer time preferences
    const timePreferenceScore = this.scoreTimePreference(slot.startTime, request.timePreferences);
    score *= timePreferenceScore;
    
    // Route optimization benefits
    if (slot.routeOptimization && slot.routeOptimization.efficiency > 0.8) {
      score *= 1.3;
    }
    
    // Equipment availability
    const equipmentScore = this.scoreEquipmentAvailability(provider, requirements.equipment);
    score *= equipmentScore;
    
    return score;
  }
}
```

## Notification and Reminder System

### Automated Reminders

```typescript
interface BookingReminderService {
  // Reminder scheduling
  scheduleReminders(bookingId: string, reminderSettings: ReminderSettings): Promise<void>;
  updateReminderSettings(bookingId: string, settings: ReminderSettings): Promise<void>;
  cancelReminders(bookingId: string): Promise<void>;
  
  // Multi-channel notifications
  sendEmailReminder(booking: Booking, template: EmailTemplate): Promise<void>;
  sendSMSReminder(booking: Booking, message: string): Promise<void>;
  sendPushNotification(booking: Booking, notification: PushNotification): Promise<void>;
  
  // Smart reminders
  calculateOptimalReminderTime(booking: Booking, customerPreferences: CustomerPreferences): Promise<Date>;
  personalizeReminderContent(booking: Booking, customerHistory: CustomerHistory): Promise<ReminderContent>;
  
  // Reminder analytics
  trackReminderEffectiveness(reminderId: string, outcome: ReminderOutcome): Promise<void>;
  optimizeReminderTiming(customerId: string, historicalData: ReminderData[]): Promise<OptimalTiming>;
}

interface ReminderSettings {
  enabled: boolean;
  channels: NotificationChannel[];
  timings: ReminderTiming[];
  customMessage?: string;
  includeDirections: boolean;
  includePreparationInstructions: boolean;
  includeReschedulingLink: boolean;
  includeCancellationLink: boolean;
}

interface ReminderTiming {
  timeBeforeAppointment: number; // minutes
  channel: NotificationChannel;
  priority: 'low' | 'normal' | 'high';
}

enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  VOICE = 'voice',
  WHATSAPP = 'whatsapp'
}
```

### Confirmation and Follow-up

```typescript
interface BookingConfirmationService {
  // Confirmation management
  sendBookingConfirmation(bookingId: string): Promise<ConfirmationResult>;
  requestBookingConfirmation(bookingId: string, deadline: Date): Promise<void>;
  processConfirmationResponse(bookingId: string, response: ConfirmationResponse): Promise<void>;
  
  // Follow-up communications
  sendPreServiceInstructions(bookingId: string): Promise<void>;
  sendPostServiceFollowUp(bookingId: string): Promise<void>;
  requestServiceFeedback(bookingId: string): Promise<void>;
  
  // Automated communications
  enableAutomatedCommunications(bookingId: string, settings: AutomationSettings): Promise<void>;
  customizeMessageTemplates(providerId: string, templates: MessageTemplate[]): Promise<void>;
}
```

## Testing Strategy

### Unit Tests

```typescript
describe('Booking Management Service', () => {
  test('should create booking with valid request', async () => {
    const request = createMockBookingRequest();
    
    const result = await bookingService.createBooking(request);
    
    expect(result.bookingId).toBeDefined();
    expect(result.status).toBe(BookingStatus.CONFIRMED);
    expect(result.scheduledDateTime).toEqual(request.preferredDateTime);
  });
  
  test('should handle booking conflicts', async () => {
    const request1 = createMockBookingRequest();
    const request2 = { ...request1, customerId: 'different-customer' };
    
    await bookingService.createBooking(request1);
    
    await expect(bookingService.createBooking(request2))
      .rejects.toThrow('Time slot not available');
  });
  
  test('should calculate availability correctly', async () => {
    const providerId = 'test-provider';
    const dateRange = { start: new Date(), end: new Date(Date.now() + 86400000) };
    
    const availability = await bookingService.getAvailability(providerId, dateRange);
    
    expect(availability).toBeInstanceOf(Array);
    availability.forEach(slot => {
      expect(slot.startTime).toBeInstanceOf(Date);
      expect(slot.endTime).toBeInstanceOf(Date);
      expect(typeof slot.isAvailable).toBe('boolean');
    });
  });
});
```

### Integration Tests

```typescript
describe('Booking System Integration', () => {
  test('should handle end-to-end booking flow', async () => {
    const request = createMockBookingRequest();
    
    // Create booking
    const booking = await bookingService.createBooking(request);
    expect(booking.status).toBe(BookingStatus.CONFIRMED);
    
    // Verify availability is updated
    const availability = await bookingService.getAvailability(
      request.providerId,
      { start: request.preferredDateTime, end: new Date(request.preferredDateTime.getTime() + 3600000) }
    );
    
    const bookedSlot = availability.find(slot => 
      slot.startTime <= request.preferredDateTime && 
      slot.endTime > request.preferredDateTime
    );
    
    expect(bookedSlot?.isAvailable).toBe(false);
    
    // Cancel booking
    await bookingService.cancelBooking(booking.bookingId, { reason: 'test cancellation' });
    
    // Verify availability is restored
    const updatedAvailability = await bookingService.getAvailability(
      request.providerId,
      { start: request.preferredDateTime, end: new Date(request.preferredDateTime.getTime() + 3600000) }
    );
    
    const restoredSlot = updatedAvailability.find(slot => 
      slot.startTime <= request.preferredDateTime && 
      slot.endTime > request.preferredDateTime
    );
    
    expect(restoredSlot?.isAvailable).toBe(true);
  });
});
```

## Error Handling

```typescript
class BookingServiceError extends Error {
  constructor(message: string, public code: BookingErrorCode, public details?: any) {
    super(message);
    this.name = 'BookingServiceError';
  }
}

enum BookingErrorCode {
  SLOT_NOT_AVAILABLE = 'SLOT_NOT_AVAILABLE',
  PROVIDER_NOT_FOUND = 'PROVIDER_NOT_FOUND',
  INVALID_TIME_SLOT = 'INVALID_TIME_SLOT',
  BOOKING_CONFLICT = 'BOOKING_CONFLICT',
  INSUFFICIENT_CAPACITY = 'INSUFFICIENT_CAPACITY',
  BOOKING_NOT_FOUND = 'BOOKING_NOT_FOUND',
  CANCELLATION_NOT_ALLOWED = 'CANCELLATION_NOT_ALLOWED'
}

interface BookingErrorHandler {
  handleBookingError(error: BookingServiceError): Promise<void>;
  suggestAlternativeSlots(request: BookingRequest): Promise<AvailabilitySlot[]>;
  escalateBookingIssue(bookingId: string, issue: BookingIssue): Promise<void>;
}
```

## Configuration

```typescript
interface BookingServiceConfig {
  scheduling: {
    defaultBookingDuration: number;
    maxAdvanceBookingDays: number;
    minAdvanceBookingHours: number;
    allowOverbooking: boolean;
    bufferTimeMinutes: number;
  };
  
  notifications: {
    enableReminders: boolean;
    defaultReminderTimes: number[];
    enableConfirmations: boolean;
    confirmationDeadlineHours: number;
  };
  
  optimization: {
    enableScheduleOptimization: boolean;
    utilizationTarget: number;
    gapMinimizationEnabled: boolean;
    revenueOptimizationEnabled: boolean;
  };
}
```

## Privacy and Data Protection

### Booking Data Privacy

```typescript
interface BookingPrivacyService {
  // Privacy consent for booking data
  requestBookingDataConsent(userId: string, dataTypes: BookingDataType[]): Promise<ConsentResult>;
  updateBookingPrivacyPreferences(userId: string, preferences: BookingPrivacyPreferences): Promise<void>;
  
  // Data anonymization
  anonymizeBookingData(booking: BookingData): AnonymizedBookingData;
  pseudonymizeCustomerData(customerId: string): Promise<string>;
  
  // Data retention and deletion
  scheduleBookingDataDeletion(bookingId: string, retentionPeriod: number): Promise<void>;
  deleteCustomerBookingHistory(customerId: string): Promise<DeletionResult>;
  
  // Privacy compliance
  generateBookingDataReport(customerId: string): Promise<BookingDataReport>;
  handleDataPortabilityRequest(customerId: string): Promise<BookingDataExport>;
}

interface BookingPrivacyPreferences {
  shareLocationForBooking: boolean;
  allowBookingReminders: boolean;
  shareBookingHistoryForRecommendations: boolean;
  allowMarketingCommunications: boolean;
  dataRetentionPeriod: number; // days
}
```

### Location Privacy in Booking

```typescript
interface BookingLocationPrivacy {
  // Location-based privacy controls
  anonymizeBookingLocation(location: LocationData, precision: number): LocationData;
  validateLocationConsent(customerId: string, serviceType: string): Promise<boolean>;
  
  // Secure location handling
  encryptBookingLocationData(booking: BookingData): Promise<EncryptedBookingData>;
  decryptBookingLocationData(encrypted: EncryptedBookingData): Promise<BookingData>;
  
  // Privacy-compliant location sharing
  shareLocationWithProvider(bookingId: string, providerId: string, scope: LocationScope): Promise<void>;
  revokeLocationAccess(bookingId: string, providerId: string): Promise<void>;
}
```

## Best Practices

1. **Real-Time Availability**: Keep availability data synchronized across all channels
2. **Conflict Prevention**: Implement robust conflict detection and resolution
3. **User Experience**: Provide clear booking confirmations and easy rescheduling options
4. **Optimization**: Balance provider utilization with customer convenience
5. **Flexibility**: Support various booking patterns and business models
6. **Integration**: Seamlessly integrate with external calendar systems
7. **Automation**: Automate routine communications and reminders
8. **Analytics**: Track booking patterns to optimize scheduling algorithms
9. **Privacy Protection**: Implement comprehensive privacy controls for booking and location data
10. **Data Security**: Encrypt sensitive booking information and ensure secure data handling

This template provides a comprehensive foundation for implementing sophisticated booking and appointment scheduling systems that can handle complex business requirements while maintaining excellent user experience, operational efficiency, and privacy compliance.