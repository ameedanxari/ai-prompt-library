# Wearable Integration Template

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
This template provides comprehensive patterns for integrating wearable health devices and IoT medical sensors into healthcare applications, covering device connectivity, data collection, real-time monitoring, and clinical integration.

## Instructions

1. **Device Registration**: Set up device registration and authentication system
2. **Data Collection Setup**: Configure secure data collection from wearable devices
3. **Real-time Monitoring**: Implement continuous health monitoring capabilities
4. **Clinical Integration**: Connect wearable data to clinical workflows
5. **Privacy Configuration**: Ensure HIPAA-compliant data handling
6. **Analytics Setup**: Deploy health insights and trend analysis
7. **Alert System**: Configure health threshold alerts and notifications

## Examples

### Example 1: Fitness Tracker Integration
```typescript
interface FitnessTrackerData {
  deviceId: string;
  patientId: string;
  timestamp: Date;
  steps: number;
  heartRate: number;
  caloriesBurned: number;
  sleepDuration: number;
  activityLevel: 'low' | 'moderate' | 'high';
}

const fitnessData = await collectFitnessData({
  deviceId: "fitbit-12345",
  patientId: "patient-789",
  dataTypes: ["steps", "heartRate", "sleep"],
  syncInterval: 300 // 5 minutes
});
```

### Example 2: Medical Sensor Integration
```typescript
interface MedicalSensorData {
  deviceId: string;
  patientId: string;
  sensorType: 'glucose' | 'blood_pressure' | 'ecg' | 'pulse_ox';
  reading: number;
  unit: string;
  timestamp: Date;
  accuracy: number;
  batteryLevel: number;
}

const glucoseReading = await collectSensorData({
  deviceId: "glucose-sensor-456",
  patientId: "patient-789",
  sensorType: "glucose",
  alertThresholds: { low: 70, high: 180 }
});
```

### Example 3: Real-time Health Monitoring
```typescript
interface HealthMonitoringSession {
  sessionId: string;
  patientId: string;
  connectedDevices: string[];
  monitoringPlan: MonitoringPlan;
  alertRules: AlertRule[];
  startTime: Date;
  status: 'active' | 'paused' | 'completed';
}

const monitoringSession = await startHealthMonitoring({
  patientId: "patient-789",
  devices: ["fitbit-12345", "glucose-sensor-456"],
  duration: 24 * 60, // 24 hours
  alertOnAbnormal: true
});
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| deviceTypes | Supported wearable device types | string[] | Yes | N/A |
| syncInterval | Data synchronization interval (seconds) | number | No | 300 |
| encryptionEnabled | Enable data encryption in transit | boolean | Yes | true |
| alertThresholds | Health metric alert thresholds | object | No | standard |
| batteryAlertLevel | Battery level for low battery alerts | number | No | 20 |
| dataRetentionDays | Days to retain wearable data | number | No | 365 |
| realTimeEnabled | Enable real-time data streaming | boolean | No | true |
| clinicalIntegration | Enable clinical workflow integration | boolean | Yes | true |

## Expected Output

This template will produce:
- **Device Management System**: Registration, authentication, and lifecycle management
- **Data Collection Pipeline**: Secure, real-time data ingestion from wearables
- **Health Monitoring Dashboard**: Real-time patient health visualization
- **Clinical Integration APIs**: EHR and clinical system connectivity
- **Alert and Notification System**: Automated health threshold monitoring
- **Analytics Engine**: Health trends and insights generation
- **Mobile Applications**: Patient and provider mobile interfaces
- **Compliance Framework**: HIPAA-compliant data handling and audit trails

## Context
Use this template when building healthcare applications that need to integrate with wearable devices, fitness trackers, medical sensors, and IoT health monitoring equipment while ensuring data accuracy, privacy, and clinical relevance.

## Implementation Patterns

### Core Integration Components

```typescript
interface WearableIntegrationSystem {
  // Device management
  deviceManagement: WearableDeviceManagementService;
  
  // Data collection
  dataCollection: WearableDataCollectionService;
  
  // Real-time monitoring
  realTimeMonitoring: RealTimeMonitoringService;
  
  // Clinical integration
  clinicalIntegration: ClinicalIntegrationService;
  
  // Analytics and insights
  analyticsEngine: WearableAnalyticsEngine;
  
  // Privacy and security
  privacyManager: WearablePrivacyManager;
}

interface WearableDeviceManagementService {
  // Device registration
  registerDevice(deviceData: WearableDeviceData): Promise<RegisteredDevice>;
  authenticateDevice(deviceId: string, credentials: DeviceCredentials): Promise<AuthenticationResult>;
  
  // Device lifecycle
  activateDevice(deviceId: string, patientId: string): Promise<ActivationResult>;
  deactivateDevice(deviceId: string): Promise<DeactivationResult>;
  updateDeviceFirmware(deviceId: string, firmwareVersion: string): Promise<UpdateResult>;
  
  // Device monitoring
  monitorDeviceHealth(deviceId: string): Promise<DeviceHealthStatus>;
  handleDeviceAlerts(deviceAlert: DeviceAlert): Promise<AlertHandlingResult>;
}
```
### Multi-Platform Device Integration

```typescript
class WearableDeviceManager {
  async registerWearableDevice(
    deviceData: WearableDeviceData,
    patientId: string
  ): Promise<DeviceRegistrationResult> {
    // Validate device compatibility
    const compatibilityCheck = await this.checkDeviceCompatibility(deviceData);
    if (!compatibilityCheck.compatible) {
      throw new IncompatibleDeviceError(compatibilityCheck.reason);
    }
    
    // Verify device authenticity
    const authenticityVerification = await this.verifyDeviceAuthenticity(deviceData);
    if (!authenticityVerification.authentic) {
      throw new DeviceAuthenticityError('Device authenticity could not be verified');
    }
    
    // Check patient authorization
    const patientAuthorization = await this.checkPatientAuthorization(
      patientId,
      deviceData.deviceType
    );
    
    if (!patientAuthorization.authorized) {
      throw new UnauthorizedDeviceError('Patient not authorized for this device type');
    }
    
    // Generate device credentials
    const deviceCredentials = await this.generateDeviceCredentials(deviceData);
    
    // Create device profile
    const deviceProfile = {
      deviceId: this.generateDeviceId(),
      patientId,
      deviceType: deviceData.deviceType,
      manufacturer: deviceData.manufacturer,
      model: deviceData.model,
      serialNumber: deviceData.serialNumber,
      firmwareVersion: deviceData.firmwareVersion,
      capabilities: deviceData.capabilities,
      dataTypes: deviceData.supportedDataTypes,
      registeredAt: new Date(),
      status: DeviceStatus.REGISTERED,
      credentials: deviceCredentials,
      privacySettings: await this.getDefaultPrivacySettings(deviceData.deviceType)
    };
    
    // Store device profile
    await this.deviceRepository.save(deviceProfile);
    
    // Set up data collection pipelines
    await this.setupDataCollectionPipelines(deviceProfile);
    
    // Configure device-specific monitoring
    await this.configureDeviceMonitoring(deviceProfile);
    
    // Log device registration
    await this.auditLogger.logDeviceRegistration(deviceProfile);
    
    return {
      deviceId: deviceProfile.deviceId,
      registrationStatus: 'SUCCESS',
      credentials: deviceCredentials,
      dataCollectionEndpoints: await this.getDataCollectionEndpoints(deviceProfile),
      monitoringConfiguration: await this.getMonitoringConfiguration(deviceProfile)
    };
  }
  
  async collectWearableData(
    deviceId: string,
    dataPayload: WearableDataPayload
  ): Promise<DataCollectionResult> {
    // Validate device authentication
    const deviceAuth = await this.validateDeviceAuthentication(deviceId, dataPayload.credentials);
    if (!deviceAuth.valid) {
      throw new InvalidDeviceAuthenticationError();
    }
    
    // Get device profile
    const deviceProfile = await this.getDeviceProfile(deviceId);
    
    // Validate data format and structure
    const dataValidation = await this.validateWearableData(dataPayload, deviceProfile);
    if (!dataValidation.valid) {
      throw new InvalidDataFormatError(dataValidation.errors);
    }
    
    // Apply data quality filters
    const qualityFilters = await this.applyDataQualityFilters(
      dataPayload.data,
      deviceProfile
    );
    
    // Normalize data to standard format
    const normalizedData = await this.normalizeWearableData(
      qualityFilters.filteredData,
      deviceProfile
    );
    
    // Apply clinical validation rules
    const clinicalValidation = await this.applyClinicalValidationRules(
      normalizedData,
      deviceProfile.patientId
    );
    
    // Store raw and processed data
    const storageResult = await this.storeWearableData({
      deviceId,
      patientId: deviceProfile.patientId,
      rawData: dataPayload.data,
      processedData: normalizedData,
      qualityMetrics: qualityFilters.qualityMetrics,
      clinicalValidation,
      timestamp: new Date(),
      dataSource: deviceProfile.manufacturer
    });
    
    // Trigger real-time analysis
    const analysisResult = await this.triggerRealTimeAnalysis(
      normalizedData,
      deviceProfile.patientId
    );
    
    // Check for clinical alerts
    if (analysisResult.hasAlerts) {
      await this.processClinicalAlerts(analysisResult.alerts, deviceProfile.patientId);
    }
    
    // Update patient health trends
    await this.updateHealthTrends(deviceProfile.patientId, normalizedData);
    
    return {
      collectionId: storageResult.collectionId,
      dataPointsProcessed: normalizedData.length,
      qualityScore: qualityFilters.qualityScore,
      clinicalRelevance: clinicalValidation.relevanceScore,
      alertsGenerated: analysisResult.alerts.length,
      processingTimestamp: new Date()
    };
  }
}
```

### Real-Time Health Monitoring

```typescript
interface RealTimeMonitoringService {
  // Continuous monitoring
  startContinuousMonitoring(patientId: string, monitoringPlan: MonitoringPlan): Promise<MonitoringSession>;
  stopContinuousMonitoring(sessionId: string): Promise<void>;
  
  // Alert management
  configureHealthAlerts(patientId: string, alertRules: HealthAlertRule[]): Promise<void>;
  processHealthAlert(alert: HealthAlert): Promise<AlertProcessingResult>;
  
  // Trend analysis
  analyzeHealthTrends(patientId: string, timeRange: TimeRange): Promise<TrendAnalysis>;
  predictHealthEvents(patientId: string, predictionModel: PredictionModel): Promise<HealthPrediction>;
}

class RealTimeHealthMonitor {
  async startContinuousPatientMonitoring(
    patientId: string,
    monitoringConfiguration: MonitoringConfiguration
  ): Promise<ContinuousMonitoringSession> {
    // Get patient's connected devices
    const connectedDevices = await this.getPatientConnectedDevices(patientId);
    
    // Validate monitoring requirements
    const requirementValidation = await this.validateMonitoringRequirements(
      monitoringConfiguration,
      connectedDevices
    );
    
    if (!requirementValidation.valid) {
      throw new MonitoringRequirementsError(requirementValidation.missingRequirements);
    }
    
    // Create monitoring session
    const monitoringSession = {
      sessionId: this.generateSessionId(),
      patientId,
      configuration: monitoringConfiguration,
      connectedDevices: connectedDevices.filter(d => d.status === 'ACTIVE'),
      startTime: new Date(),
      status: MonitoringStatus.ACTIVE,
      dataStreams: [],
      alertRules: monitoringConfiguration.alertRules,
      clinicalThresholds: monitoringConfiguration.clinicalThresholds
    };
    
    // Initialize data streams for each device
    for (const device of monitoringSession.connectedDevices) {
      const dataStream = await this.initializeDeviceDataStream(device, monitoringConfiguration);
      monitoringSession.dataStreams.push(dataStream);
    }
    
    // Set up real-time data processing
    const dataProcessor = await this.setupRealTimeDataProcessor(monitoringSession);
    
    // Configure alert monitoring
    const alertMonitor = await this.setupAlertMonitoring(monitoringSession);
    
    // Start health trend tracking
    const trendTracker = await this.startHealthTrendTracking(monitoringSession);
    
    // Store monitoring session
    await this.monitoringRepository.save(monitoringSession);
    
    // Log monitoring start
    await this.auditLogger.logMonitoringSessionStart(monitoringSession);
    
    return {
      sessionId: monitoringSession.sessionId,
      status: 'ACTIVE',
      monitoredDevices: monitoringSession.connectedDevices.length,
      dataStreams: monitoringSession.dataStreams.length,
      alertRules: monitoringSession.alertRules.length,
      estimatedBatteryLife: await this.estimateBatteryLife(monitoringSession.connectedDevices)
    };
  }
  
  async processRealTimeHealthData(
    dataStream: HealthDataStream
  ): Promise<RealTimeProcessingResult> {
    // Apply real-time data validation
    const validation = await this.validateRealTimeData(dataStream);
    if (!validation.valid) {
      await this.handleInvalidData(dataStream, validation.errors);
      return { processed: false, errors: validation.errors };
    }
    
    // Normalize data across different device types
    const normalizedData = await this.normalizeHealthData(dataStream.data);
    
    // Apply clinical interpretation algorithms
    const clinicalInterpretation = await this.applyClinicalInterpretation(
      normalizedData,
      dataStream.patientId
    );
    
    // Check for immediate health alerts
    const immediateAlerts = await this.checkImmediateHealthAlerts(
      clinicalInterpretation,
      dataStream.patientId
    );
    
    // Process immediate alerts
    if (immediateAlerts.length > 0) {
      await this.processImmediateAlerts(immediateAlerts);
    }
    
    // Update real-time health dashboard
    await this.updateRealTimeHealthDashboard(
      dataStream.patientId,
      clinicalInterpretation
    );
    
    // Store processed data
    await this.storeRealTimeHealthData({
      patientId: dataStream.patientId,
      deviceId: dataStream.deviceId,
      rawData: dataStream.data,
      normalizedData,
      clinicalInterpretation,
      immediateAlerts,
      processingTimestamp: new Date()
    });
    
    // Trigger predictive analytics
    const predictiveInsights = await this.generatePredictiveInsights(
      dataStream.patientId,
      clinicalInterpretation
    );
    
    return {
      processed: true,
      dataPointsProcessed: normalizedData.length,
      clinicalInterpretation,
      immediateAlerts: immediateAlerts.length,
      predictiveInsights,
      processingLatency: Date.now() - dataStream.timestamp.getTime()
    };
  }
}
```

### Clinical Integration and Decision Support

```typescript
interface ClinicalIntegrationService {
  // EHR integration
  syncWearableDataToEHR(patientId: string, dataRange: DateRange): Promise<EHRSyncResult>;
  generateClinicalSummary(patientId: string, summaryType: SummaryType): Promise<ClinicalSummary>;
  
  // Clinical decision support
  provideClinicalInsights(patientId: string, clinicalContext: ClinicalContext): Promise<ClinicalInsights>;
  generateHealthRecommendations(patientId: string, healthData: HealthData): Promise<HealthRecommendation[]>;
  
  // Provider notifications
  notifyProviders(notification: ProviderNotification): Promise<NotificationResult>;
  createClinicalAlerts(alertData: ClinicalAlertData): Promise<ClinicalAlert>;
}

class WearableClinicalIntegration {
  async generateClinicalInsightsFromWearableData(
    patientId: string,
    timeRange: TimeRange
  ): Promise<WearableClinicalInsights> {
    // Collect wearable data for the specified time range
    const wearableData = await this.getPatientWearableData(patientId, timeRange);
    
    // Get patient's clinical context
    const clinicalContext = await this.getPatientClinicalContext(patientId);
    
    // Apply clinical interpretation algorithms
    const clinicalInterpretations = [];
    
    // Cardiovascular insights
    if (wearableData.heartRate || wearableData.bloodPressure) {
      const cardiovascularInsights = await this.analyzeCardiovascularData(
        wearableData,
        clinicalContext
      );
      clinicalInterpretations.push(cardiovascularInsights);
    }
    
    // Activity and fitness insights
    if (wearableData.steps || wearableData.activity) {
      const activityInsights = await this.analyzeActivityData(
        wearableData,
        clinicalContext
      );
      clinicalInterpretations.push(activityInsights);
    }
    
    // Sleep quality insights
    if (wearableData.sleep) {
      const sleepInsights = await this.analyzeSleepData(
        wearableData,
        clinicalContext
      );
      clinicalInterpretations.push(sleepInsights);
    }
    
    // Metabolic insights
    if (wearableData.glucose || wearableData.weight) {
      const metabolicInsights = await this.analyzeMetabolicData(
        wearableData,
        clinicalContext
      );
      clinicalInterpretations.push(metabolicInsights);
    }
    
    // Generate integrated clinical assessment
    const integratedAssessment = await this.generateIntegratedAssessment(
      clinicalInterpretations,
      clinicalContext
    );
    
    // Create actionable recommendations
    const recommendations = await this.generateActionableRecommendations(
      integratedAssessment,
      clinicalContext
    );
    
    // Identify trends and patterns
    const trendAnalysis = await this.analyzeLongTermTrends(
      patientId,
      wearableData,
      timeRange
    );
    
    // Generate risk assessments
    const riskAssessments = await this.generateRiskAssessments(
      integratedAssessment,
      trendAnalysis,
      clinicalContext
    );
    
    return {
      patientId,
      analysisTimeRange: timeRange,
      dataQuality: this.assessDataQuality(wearableData),
      clinicalInterpretations,
      integratedAssessment,
      recommendations,
      trendAnalysis,
      riskAssessments,
      generatedAt: new Date(),
      clinicalRelevanceScore: this.calculateClinicalRelevanceScore(integratedAssessment)
    };
  }
  
  async syncWearableDataWithEHR(
    patientId: string,
    syncConfiguration: EHRSyncConfiguration
  ): Promise<EHRSyncResult> {
    // Get patient's wearable data since last sync
    const lastSyncTime = await this.getLastEHRSyncTime(patientId);
    const wearableData = await this.getPatientWearableData(patientId, {
      startDate: lastSyncTime,
      endDate: new Date()
    });
    
    // Transform wearable data to EHR format
    const ehrFormattedData = await this.transformToEHRFormat(
      wearableData,
      syncConfiguration.ehrSystem
    );
    
    // Validate EHR data format
    const formatValidation = await this.validateEHRDataFormat(
      ehrFormattedData,
      syncConfiguration.ehrSystem
    );
    
    if (!formatValidation.valid) {
      throw new EHRFormatValidationError(formatValidation.errors);
    }
    
    // Create clinical summary
    const clinicalSummary = await this.createWearableDataClinicalSummary(
      wearableData,
      patientId
    );
    
    // Sync data to EHR
    const syncResults = [];
    
    for (const dataCategory of ehrFormattedData.categories) {
      try {
        const categorySync = await this.syncDataCategoryToEHR(
          dataCategory,
          clinicalSummary,
          syncConfiguration
        );
        
        syncResults.push({
          category: dataCategory.type,
          status: 'SUCCESS',
          recordsSync: categorySync.recordsSync,
          ehrRecordIds: categorySync.ehrRecordIds
        });
        
      } catch (error) {
        syncResults.push({
          category: dataCategory.type,
          status: 'FAILED',
          error: error.message,
          recordsAttempted: dataCategory.records.length
        });
      }
    }
    
    // Update last sync time
    await this.updateLastEHRSyncTime(patientId, new Date());
    
    // Log EHR sync
    await this.auditLogger.logEHRSync(patientId, syncResults);
    
    return {
      patientId,
      syncTimestamp: new Date(),
      totalCategories: ehrFormattedData.categories.length,
      successfulSyncs: syncResults.filter(r => r.status === 'SUCCESS').length,
      failedSyncs: syncResults.filter(r => r.status === 'FAILED').length,
      totalRecordsSync: syncResults.reduce((sum, r) => sum + (r.recordsSync || 0), 0),
      syncResults,
      clinicalSummary
    };
  }
}
```

### Privacy and Security Management

```typescript
interface WearablePrivacyManager {
  // Data privacy
  configureDataPrivacySettings(patientId: string, privacySettings: PrivacySettings): Promise<void>;
  anonymizeWearableData(data: WearableData, anonymizationLevel: AnonymizationLevel): Promise<AnonymizedData>;
  
  // Consent management
  manageDataSharingConsent(patientId: string, consentData: ConsentData): Promise<ConsentResult>;
  validateDataUsageConsent(patientId: string, usageType: DataUsageType): Promise<ConsentValidation>;
  
  // Data retention
  applyDataRetentionPolicies(patientId: string): Promise<RetentionResult>;
  securelyDeleteWearableData(deletionRequest: DataDeletionRequest): Promise<DeletionResult>;
}

class WearableDataPrivacyManager {
  async configurePatientDataPrivacy(
    patientId: string,
    privacyConfiguration: WearablePrivacyConfiguration
  ): Promise<PrivacyConfigurationResult> {
    // Validate privacy configuration
    const configValidation = await this.validatePrivacyConfiguration(privacyConfiguration);
    if (!configValidation.valid) {
      throw new InvalidPrivacyConfigurationError(configValidation.errors);
    }
    
    // Get patient's current privacy settings
    const currentSettings = await this.getCurrentPrivacySettings(patientId);
    
    // Apply privacy configuration changes
    const updatedSettings = {
      ...currentSettings,
      dataSharing: {
        allowClinicalResearch: privacyConfiguration.allowClinicalResearch,
        allowQualityImprovement: privacyConfiguration.allowQualityImprovement,
        allowPublicHealthReporting: privacyConfiguration.allowPublicHealthReporting,
        allowThirdPartyIntegration: privacyConfiguration.allowThirdPartyIntegration,
        restrictedDataTypes: privacyConfiguration.restrictedDataTypes
      },
      dataRetention: {
        retentionPeriod: privacyConfiguration.retentionPeriod,
        automaticDeletion: privacyConfiguration.automaticDeletion,
        archivalSettings: privacyConfiguration.archivalSettings
      },
      accessControls: {
        allowedProviders: privacyConfiguration.allowedProviders,
        restrictedProviders: privacyConfiguration.restrictedProviders,
        emergencyAccess: privacyConfiguration.emergencyAccess
      },
      anonymization: {
        anonymizationLevel: privacyConfiguration.anonymizationLevel,
        pseudonymization: privacyConfiguration.pseudonymization
      }
    };
    
    // Store updated privacy settings
    await this.storePrivacySettings(patientId, updatedSettings);
    
    // Apply settings to existing data
    const dataUpdateResult = await this.applyPrivacySettingsToExistingData(
      patientId,
      updatedSettings
    );
    
    // Update device privacy configurations
    const deviceUpdateResults = await this.updateDevicePrivacySettings(
      patientId,
      updatedSettings
    );
    
    // Log privacy configuration change
    await this.auditLogger.logPrivacyConfigurationChange(
      patientId,
      currentSettings,
      updatedSettings
    );
    
    return {
      patientId,
      configurationApplied: true,
      settingsUpdated: updatedSettings,
      dataRecordsUpdated: dataUpdateResult.recordsUpdated,
      devicesUpdated: deviceUpdateResults.devicesUpdated,
      effectiveDate: new Date()
    };
  }
  
  async handleDataDeletionRequest(
    deletionRequest: WearableDataDeletionRequest
  ): Promise<DataDeletionResult> {
    // Validate deletion request
    const requestValidation = await this.validateDeletionRequest(deletionRequest);
    if (!requestValidation.valid) {
      throw new InvalidDeletionRequestError(requestValidation.errors);
    }
    
    // Check legal requirements for data retention
    const legalCheck = await this.checkLegalRetentionRequirements(
      deletionRequest.patientId,
      deletionRequest.dataTypes
    );
    
    if (legalCheck.hasRetentionRequirements) {
      return {
        deletionCompleted: false,
        reason: 'LEGAL_RETENTION_REQUIRED',
        retentionRequirements: legalCheck.requirements,
        earliestDeletionDate: legalCheck.earliestDeletionDate
      };
    }
    
    // Identify data to be deleted
    const dataToDelete = await this.identifyDataForDeletion(deletionRequest);
    
    // Create backup for audit purposes (if required)
    let auditBackup = null;
    if (deletionRequest.createAuditBackup) {
      auditBackup = await this.createAuditBackup(dataToDelete);
    }
    
    // Perform secure deletion
    const deletionResults = [];
    
    for (const dataCategory of dataToDelete.categories) {
      try {
        const categoryDeletion = await this.securelyDeleteDataCategory(
          dataCategory,
          deletionRequest.deletionMethod
        );
        
        deletionResults.push({
          category: dataCategory.type,
          status: 'DELETED',
          recordsDeleted: categoryDeletion.recordsDeleted,
          deletionTimestamp: categoryDeletion.timestamp
        });
        
      } catch (error) {
        deletionResults.push({
          category: dataCategory.type,
          status: 'FAILED',
          error: error.message,
          recordsAttempted: dataCategory.records.length
        });
      }
    }
    
    // Update patient privacy settings
    await this.updatePrivacySettingsAfterDeletion(
      deletionRequest.patientId,
      deletionResults
    );
    
    // Log data deletion
    await this.auditLogger.logDataDeletion(deletionRequest, deletionResults);
    
    return {
      deletionCompleted: true,
      patientId: deletionRequest.patientId,
      deletionTimestamp: new Date(),
      categoriesProcessed: dataToDelete.categories.length,
      totalRecordsDeleted: deletionResults.reduce((sum, r) => sum + (r.recordsDeleted || 0), 0),
      auditBackupCreated: auditBackup !== null,
      deletionResults
    };
  }
}
```

## Testing and Quality Assurance

### Wearable Integration Testing

```typescript
describe('Wearable Integration System', () => {
  describe('Device Management', () => {
    test('should register wearable device successfully', async () => {
      const deviceData = createTestWearableDevice();
      const patientId = 'patient-123';
      
      const registrationResult = await deviceManager.registerWearableDevice(
        deviceData,
        patientId
      );
      
      expect(registrationResult.registrationStatus).toBe('SUCCESS');
      expect(registrationResult.deviceId).toBeDefined();
      expect(registrationResult.credentials).toBeDefined();
    });
    
    test('should collect and process wearable data', async () => {
      const deviceId = 'device-123';
      const dataPayload = createTestWearableDataPayload();
      
      const collectionResult = await deviceManager.collectWearableData(
        deviceId,
        dataPayload
      );
      
      expect(collectionResult.collectionId).toBeDefined();
      expect(collectionResult.dataPointsProcessed).toBeGreaterThan(0);
      expect(collectionResult.qualityScore).toBeGreaterThan(0);
    });
  });
  
  describe('Real-Time Monitoring', () => {
    test('should start continuous patient monitoring', async () => {
      const patientId = 'patient-123';
      const monitoringConfig = createTestMonitoringConfiguration();
      
      const monitoringSession = await realTimeMonitor.startContinuousPatientMonitoring(
        patientId,
        monitoringConfig
      );
      
      expect(monitoringSession.sessionId).toBeDefined();
      expect(monitoringSession.status).toBe('ACTIVE');
      expect(monitoringSession.monitoredDevices).toBeGreaterThan(0);
    });
    
    test('should process real-time health data', async () => {
      const healthDataStream = createTestHealthDataStream();
      
      const processingResult = await realTimeMonitor.processRealTimeHealthData(
        healthDataStream
      );
      
      expect(processingResult.processed).toBe(true);
      expect(processingResult.clinicalInterpretation).toBeDefined();
      expect(processingResult.processingLatency).toBeLessThan(1000);
    });
  });
  
  describe('Clinical Integration', () => {
    test('should generate clinical insights from wearable data', async () => {
      const patientId = 'patient-123';
      const timeRange = createTestTimeRange();
      
      const clinicalInsights = await clinicalIntegration.generateClinicalInsightsFromWearableData(
        patientId,
        timeRange
      );
      
      expect(clinicalInsights.clinicalInterpretations).toBeDefined();
      expect(clinicalInsights.recommendations).toBeDefined();
      expect(clinicalInsights.clinicalRelevanceScore).toBeGreaterThan(0);
    });
    
    test('should sync wearable data with EHR', async () => {
      const patientId = 'patient-123';
      const syncConfig = createTestEHRSyncConfiguration();
      
      const syncResult = await clinicalIntegration.syncWearableDataWithEHR(
        patientId,
        syncConfig
      );
      
      expect(syncResult.successfulSyncs).toBeGreaterThan(0);
      expect(syncResult.totalRecordsSync).toBeGreaterThan(0);
      expect(syncResult.clinicalSummary).toBeDefined();
    });
  });
  
  describe('Privacy Management', () => {
    test('should configure patient data privacy settings', async () => {
      const patientId = 'patient-123';
      const privacyConfig = createTestPrivacyConfiguration();
      
      const configResult = await privacyManager.configurePatientDataPrivacy(
        patientId,
        privacyConfig
      );
      
      expect(configResult.configurationApplied).toBe(true);
      expect(configResult.settingsUpdated).toBeDefined();
    });
    
    test('should handle data deletion request', async () => {
      const deletionRequest = createTestDataDeletionRequest();
      
      const deletionResult = await privacyManager.handleDataDeletionRequest(
        deletionRequest
      );
      
      expect(deletionResult.deletionCompleted).toBe(true);
      expect(deletionResult.totalRecordsDeleted).toBeGreaterThan(0);
    });
  });
});
```

This comprehensive wearable integration template provides the foundation for building secure, privacy-compliant, and clinically relevant wearable device integration systems that can effectively collect, process, and integrate health data from various wearable devices while maintaining patient privacy and providing actionable clinical insights.
