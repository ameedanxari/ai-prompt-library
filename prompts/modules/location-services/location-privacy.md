# Location Privacy and Data Management

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
Implement comprehensive location privacy controls and data management systems that comply with GDPR, CCPA, and other privacy regulations while providing users with granular control over their location data sharing, retention, and usage.

## Context
Location privacy is a critical concern in modern applications that collect and process user location data. With increasing regulatory requirements like GDPR and CCPA, applications must implement robust privacy controls, consent management, and data protection measures. This template addresses the complexity of building privacy-compliant location systems that balance functionality with user privacy rights and regulatory obligations.

## Instructions
1. Analyze location privacy requirements and regulatory compliance needs (GDPR, CCPA)
2. Design comprehensive consent management with granular location permissions
3. Implement location data anonymization and pseudonymization techniques
4. Build privacy preference management with user-friendly controls
5. Create location data retention policies with automated deletion
6. Add location data export and portability features for user rights
7. Implement privacy-preserving location analytics and insights
8. Build audit trails for location data access and usage
9. Create privacy impact assessments for location features
10. Add integration with privacy management platforms and compliance tools

## Examples

### Example 1: Location Consent Management
```typescript
// Comprehensive location consent system
class LocationConsentManager {
  async requestLocationConsent(userId: string, purpose: LocationPurpose): Promise<ConsentResult> {
    const consentRequest = {
      userId,
      purpose,
      dataTypes: this.getRequiredDataTypes(purpose),
      retentionPeriod: this.getRetentionPeriod(purpose),
      sharingScope: this.getSharingScope(purpose)
    };
    
    const consent = await this.presentConsentDialog(consentRequest);
    await this.recordConsentDecision(consent);
    
    return consent;
  }
}
```

### Example 2: Location Data Anonymization
```typescript
// Privacy-preserving location data processing
class LocationAnonymizer {
  async anonymizeLocationData(locationData: LocationData[]): Promise<AnonymizedLocationData[]> {
    return locationData.map(location => ({
      ...location,
      coordinates: this.addLocationNoise(location.coordinates),
      timestamp: this.roundTimestamp(location.timestamp),
      userId: this.pseudonymizeUserId(location.userId)
    }));
  }
}
```

### Example 3: Privacy Rights Management
```typescript
// User privacy rights and data control
class LocationPrivacyRightsManager {
  async handleDataSubjectRequest(request: DataSubjectRequest): Promise<RequestResult> {
    switch (request.type) {
      case 'access':
        return await this.exportUserLocationData(request.userId);
      case 'deletion':
        return await this.deleteUserLocationData(request.userId);
      case 'portability':
        return await this.exportPortableLocationData(request.userId);
      case 'rectification':
        return await this.correctLocationData(request.userId, request.corrections);
    }
  }
}
```

## Variables
| Variable | Type | Description | Default | Required |
|----------|------|-------------|---------|----------|
| privacyRegulation | string | Applicable privacy regulation | 'gdpr' | Yes |
| consentGranularity | string | Consent detail level | 'granular' | No |
| dataAnonymization | boolean | Anonymize location data | true | Yes |
| retentionPolicies | boolean | Automated data retention | true | Yes |
| dataPortability | boolean | User data export features | true | Yes |
| privacyDashboard | boolean | User privacy control panel | true | No |
| auditLogging | boolean | Privacy audit trails | true | Yes |
| privacyByDesign | boolean | Privacy-first architecture | true | Yes |
| consentManagement | boolean | Comprehensive consent system | true | Yes |
| dataMinimization | boolean | Collect only necessary data | true | Yes |

## Expected Output
A comprehensive location privacy system featuring:
- Granular consent management with purpose-specific location permissions
- Location data anonymization and pseudonymization for privacy protection
- Privacy preference dashboard with user-friendly controls and settings
- Automated data retention policies with configurable deletion schedules
- Data subject rights management with access, deletion, and portability features
- Privacy-preserving analytics with differential privacy and aggregation techniques
- Comprehensive audit trails for location data access and usage tracking
- Privacy impact assessments with automated compliance checking
- Regulatory compliance support for GDPR, CCPA, and other privacy laws
- Integration with privacy management platforms and consent management systems

## Implementation Approach

### Core Location Privacy Service

```typescript
interface LocationPrivacyService {
  // Consent management
  requestLocationConsent(userId: string, purpose: LocationPurpose, scope: LocationScope): Promise<ConsentResult>;
  updateLocationConsent(userId: string, consentId: string, granted: boolean): Promise<void>;
  getLocationConsents(userId: string): Promise<LocationConsent[]>;
  revokeAllLocationConsents(userId: string): Promise<void>;
  
  // Privacy preferences
  setLocationPrivacyPreferences(userId: string, preferences: LocationPrivacyPreferences): Promise<void>;
  getLocationPrivacyPreferences(userId: string): Promise<LocationPrivacyPreferences>;
  updatePrivacyPreference(userId: string, key: string, value: any): Promise<void>;
  
  // Data access and control
  getLocationDataSummary(userId: string): Promise<LocationDataSummary>;
  exportLocationData(userId: string, format: ExportFormat): Promise<LocationDataExport>;
  deleteLocationData(userId: string, criteria: DeletionCriteria): Promise<DeletionResult>;
  
  // Anonymization and pseudonymization
  anonymizeLocationData(data: LocationData[]): Promise<AnonymizedLocationData[]>;
  pseudonymizeLocationData(data: LocationData[], userId: string): Promise<PseudonymizedLocationData[]>;
  
  // Audit and transparency
  getLocationDataUsageLog(userId: string, timeRange: TimeRange): Promise<UsageLogEntry[]>;
  getDataSharingReport(userId: string): Promise<DataSharingReport>;
}

interface LocationConsent {
  id: string;
  userId: string;
  purpose: LocationPurpose;
  scope: LocationScope;
  granted: boolean;
  grantedAt: Date;
  expiresAt?: Date;
  withdrawnAt?: Date;
  legalBasis: LegalBasis;
  consentString: string;
}

enum LocationPurpose {
  NAVIGATION = 'navigation',
  DELIVERY_TRACKING = 'delivery_tracking',
  RIDE_SHARING = 'ride_sharing',
  MARKETING = 'marketing',
  ANALYTICS = 'analytics',
  SAFETY = 'safety',
  SOCIAL_FEATURES = 'social_features',
  PERSONALIZATION = 'personalization'
}

enum LocationScope {
  PRECISE = 'precise',
  APPROXIMATE = 'approximate',
  CITY_LEVEL = 'city_level',
  REGION_LEVEL = 'region_level',
  COUNTRY_LEVEL = 'country_level'
}

enum LegalBasis {
  CONSENT = 'consent',
  CONTRACT = 'contract',
  LEGAL_OBLIGATION = 'legal_obligation',
  VITAL_INTERESTS = 'vital_interests',
  PUBLIC_TASK = 'public_task',
  LEGITIMATE_INTERESTS = 'legitimate_interests'
}
```

### Privacy Preferences Management

```typescript
interface LocationPrivacyPreferences {
  // General preferences
  shareLocationData: boolean;
  allowLocationHistory: boolean;
  allowLocationAnalytics: boolean;
  allowLocationMarketing: boolean;
  
  // Granular sharing controls
  shareWithServices: ServiceSharingPreferences;
  shareWithUsers: UserSharingPreferences;
  shareWithThirdParties: ThirdPartySharingPreferences;
  
  // Data retention
  locationHistoryRetention: RetentionPeriod;
  automaticDeletion: boolean;
  deleteAfterInactivity: number; // days
  
  // Accuracy and precision
  defaultLocationAccuracy: LocationAccuracy;
  allowPreciseLocation: boolean;
  allowBackgroundTracking: boolean;
  
  // Notifications and transparency
  notifyOnLocationAccess: boolean;
  notifyOnDataSharing: boolean;
  showLocationIndicator: boolean;
  
  // Geographic restrictions
  restrictedAreas: GeographicRestriction[];
  allowLocationOutsideRegion: boolean;
}

interface ServiceSharingPreferences {
  navigation: boolean;
  delivery: boolean;
  rideshare: boolean;
  social: boolean;
  advertising: boolean;
  analytics: boolean;
}

interface UserSharingPreferences {
  shareWithFriends: boolean;
  shareWithFamily: boolean;
  shareWithContacts: boolean;
  allowLocationRequests: boolean;
  requireApprovalForSharing: boolean;
}

interface ThirdPartySharingPreferences {
  allowThirdPartySharing: boolean;
  approvedPartners: string[];
  restrictedPartners: string[];
  requireExplicitConsent: boolean;
}

interface GeographicRestriction {
  id: string;
  name: string;
  area: GeographicArea;
  restrictionType: 'no_tracking' | 'no_sharing' | 'no_storage';
  reason: string;
}
```

### Data Anonymization and Protection

```typescript
interface LocationDataProtectionService {
  // Data anonymization
  anonymizeLocation(location: LocationData, method: AnonymizationMethod): AnonymizedLocationData;
  anonymizeLocationHistory(history: LocationData[], method: AnonymizationMethod): AnonymizedLocationData[];
  
  // Data pseudonymization
  pseudonymizeLocation(location: LocationData, userId: string): PseudonymizedLocationData;
  reversePseudonymization(data: PseudonymizedLocationData, userId: string): LocationData;
  
  // Data minimization
  minimizeLocationData(data: LocationData, purpose: LocationPurpose): MinimizedLocationData;
  reduceLocationPrecision(location: LocationData, precision: LocationPrecision): LocationData;
  
  // Encryption and security
  encryptLocationData(data: LocationData, key: EncryptionKey): EncryptedLocationData;
  decryptLocationData(encrypted: EncryptedLocationData, key: EncryptionKey): LocationData;
  
  // Data masking
  maskLocationData(data: LocationData[], maskingRules: MaskingRule[]): MaskedLocationData[];
  applyDifferentialPrivacy(data: LocationData[], epsilon: number): LocationData[];
}

enum AnonymizationMethod {
  COORDINATE_ROUNDING = 'coordinate_rounding',
  GRID_SNAPPING = 'grid_snapping',
  NOISE_ADDITION = 'noise_addition',
  GENERALIZATION = 'generalization',
  SUPPRESSION = 'suppression',
  K_ANONYMITY = 'k_anonymity'
}

interface AnonymizedLocationData {
  approximateLocation: LocationData;
  precision: LocationPrecision;
  anonymizationMethod: AnonymizationMethod;
  timestamp: Date;
  metadata: Record<string, any>;
}

interface MaskingRule {
  field: string;
  method: 'hash' | 'encrypt' | 'remove' | 'generalize';
  parameters: Record<string, any>;
}
```

### Consent Management System

```typescript
interface LocationConsentManager {
  // Consent collection
  presentConsentDialog(userId: string, request: ConsentRequest): Promise<ConsentResponse>;
  recordConsentDecision(userId: string, decision: ConsentDecision): Promise<string>;
  
  // Consent validation
  validateConsent(userId: string, purpose: LocationPurpose): Promise<boolean>;
  isConsentRequired(userId: string, action: LocationAction): Promise<boolean>;
  
  // Consent lifecycle
  renewConsent(userId: string, consentId: string): Promise<ConsentResult>;
  withdrawConsent(userId: string, consentId: string): Promise<void>;
  expireConsent(consentId: string): Promise<void>;
  
  // Consent tracking
  getConsentHistory(userId: string): Promise<ConsentHistoryEntry[]>;
  generateConsentReport(criteria: ReportCriteria): Promise<ConsentReport>;
  
  // Legal compliance
  generateGDPRReport(userId: string): Promise<GDPRReport>;
  handleDataSubjectRequest(request: DataSubjectRequest): Promise<DataSubjectResponse>;
}

interface ConsentRequest {
  purpose: LocationPurpose;
  scope: LocationScope;
  duration: ConsentDuration;
  dataTypes: LocationDataType[];
  thirdParties: ThirdPartyRecipient[];
  legalBasis: LegalBasis;
  description: string;
  consequences: string;
}

interface ConsentResponse {
  granted: boolean;
  consentId: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  consentString: string;
}

interface ConsentDecision {
  consentId: string;
  granted: boolean;
  granularChoices: Record<string, boolean>;
  timestamp: Date;
  context: ConsentContext;
}
```

### Data Subject Rights Implementation

```typescript
interface DataSubjectRightsService {
  // Right to access
  generateDataPortabilityReport(userId: string): Promise<DataPortabilityReport>;
  exportUserLocationData(userId: string, format: ExportFormat): Promise<LocationDataExport>;
  
  // Right to rectification
  correctLocationData(userId: string, corrections: LocationDataCorrection[]): Promise<void>;
  updateLocationPreferences(userId: string, preferences: LocationPrivacyPreferences): Promise<void>;
  
  // Right to erasure (right to be forgotten)
  deleteAllLocationData(userId: string): Promise<DeletionResult>;
  deleteLocationDataByTimeRange(userId: string, timeRange: TimeRange): Promise<DeletionResult>;
  deleteLocationDataByPurpose(userId: string, purpose: LocationPurpose): Promise<DeletionResult>;
  
  // Right to restrict processing
  restrictLocationProcessing(userId: string, restrictions: ProcessingRestriction[]): Promise<void>;
  removeProcessingRestrictions(userId: string, restrictionIds: string[]): Promise<void>;
  
  // Right to object
  objectToLocationProcessing(userId: string, objection: ProcessingObjection): Promise<void>;
  handleProcessingObjection(objection: ProcessingObjection): Promise<ObjectionResponse>;
  
  // Right to data portability
  exportLocationDataForTransfer(userId: string, format: PortabilityFormat): Promise<PortableLocationData>;
  importLocationData(userId: string, data: PortableLocationData): Promise<ImportResult>;
}

interface DataPortabilityReport {
  userId: string;
  generatedAt: Date;
  locationData: LocationDataSummary;
  preferences: LocationPrivacyPreferences;
  consents: LocationConsent[];
  sharingHistory: DataSharingEntry[];
  format: ExportFormat;
}

interface ProcessingRestriction {
  id: string;
  purpose: LocationPurpose;
  restrictionType: 'temporary' | 'permanent';
  reason: string;
  startDate: Date;
  endDate?: Date;
}

interface ProcessingObjection {
  id: string;
  userId: string;
  purpose: LocationPurpose;
  reason: string;
  legalGrounds: string;
  submittedAt: Date;
}
```

### Privacy-Compliant Location Sharing

```typescript
interface PrivacyCompliantSharingService {
  // Controlled sharing
  shareLocationWithUser(fromUserId: string, toUserId: string, options: SharingOptions): Promise<SharingSession>;
  shareLocationWithService(userId: string, serviceId: string, options: SharingOptions): Promise<SharingSession>;
  
  // Temporary sharing
  createTemporaryLocationShare(userId: string, duration: number, recipients: string[]): Promise<TemporaryShare>;
  extendTemporaryShare(shareId: string, additionalDuration: number): Promise<void>;
  revokeTemporaryShare(shareId: string): Promise<void>;
  
  // Conditional sharing
  createConditionalShare(userId: string, conditions: SharingCondition[]): Promise<ConditionalShare>;
  evaluateSharingConditions(shareId: string, context: SharingContext): Promise<boolean>;
  
  // Sharing audit
  getLocationSharingHistory(userId: string): Promise<SharingHistoryEntry[]>;
  getActiveLocationShares(userId: string): Promise<ActiveShare[]>;
  generateSharingReport(userId: string, timeRange: TimeRange): Promise<SharingReport>;
}

interface SharingOptions {
  accuracy: LocationAccuracy;
  duration: number; // milliseconds
  updateFrequency: number; // milliseconds
  includeHistory: boolean;
  allowResharing: boolean;
  notifyOnAccess: boolean;
  geographicRestrictions: GeographicRestriction[];
}

interface SharingCondition {
  type: 'time' | 'location' | 'emergency' | 'custom';
  parameters: Record<string, any>;
  operator: 'and' | 'or';
}

interface TemporaryShare {
  id: string;
  userId: string;
  recipients: string[];
  createdAt: Date;
  expiresAt: Date;
  accessCount: number;
  isActive: boolean;
}
```

### Privacy Dashboard and Transparency

```typescript
interface LocationPrivacyDashboard {
  // Dashboard data
  getPrivacyDashboardData(userId: string): Promise<PrivacyDashboardData>;
  getLocationDataUsageStats(userId: string, timeRange: TimeRange): Promise<UsageStats>;
  
  // Transparency reports
  generateTransparencyReport(userId: string): Promise<TransparencyReport>;
  getDataProcessingActivities(userId: string): Promise<ProcessingActivity[]>;
  
  // Privacy insights
  getPrivacyInsights(userId: string): Promise<PrivacyInsight[]>;
  generatePrivacyRecommendations(userId: string): Promise<PrivacyRecommendation[]>;
  
  // Control center
  getQuickPrivacyControls(userId: string): Promise<QuickControl[]>;
  executePrivacyAction(userId: string, action: PrivacyAction): Promise<ActionResult>;
}

interface PrivacyDashboardData {
  locationDataSummary: LocationDataSummary;
  activeConsents: LocationConsent[];
  sharingStatus: SharingStatus;
  privacyScore: PrivacyScore;
  recentActivity: PrivacyActivity[];
  recommendations: PrivacyRecommendation[];
}

interface TransparencyReport {
  userId: string;
  reportPeriod: TimeRange;
  dataCollected: DataCollectionSummary;
  dataShared: DataSharingSummary;
  dataProcessing: ProcessingSummary;
  thirdPartyAccess: ThirdPartyAccessSummary;
  userRights: UserRightsExercised;
}

interface PrivacyInsight {
  type: 'data_usage' | 'sharing_pattern' | 'privacy_risk' | 'compliance_status';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  actionable: boolean;
  recommendations: string[];
}
```

## Platform-Specific Privacy Implementation

### iOS Privacy Implementation

```swift
import CoreLocation
import CryptoKit

class iOSLocationPrivacyManager: NSObject, CLLocationManagerDelegate {
    private let locationManager = CLLocationManager()
    private let privacyService: LocationPrivacyService
    private var consentManager: LocationConsentManager
    
    override init() {
        self.privacyService = LocationPrivacyService()
        self.consentManager = LocationConsentManager()
        super.init()
        
        locationManager.delegate = self
        setupPrivacyControls()
    }
    
    func requestLocationPermission(purpose: LocationPurpose) async throws -> ConsentResult {
        // Present consent dialog with clear purpose explanation
        let consentRequest = ConsentRequest(
            purpose: purpose,
            scope: .precise,
            duration: .indefinite,
            dataTypes: [.coordinates, .timestamp],
            thirdParties: [],
            legalBasis: .consent,
            description: getPrivacyDescription(for: purpose),
            consequences: getConsequencesDescription(for: purpose)
        )
        
        let consentResponse = await consentManager.presentConsentDialog(
            userId: getCurrentUserId(),
            request: consentRequest
        )
        
        if consentResponse.granted {
            // Request system permission
            let authStatus = await requestSystemLocationPermission()
            
            if authStatus == .authorizedWhenInUse || authStatus == .authorizedAlways {
                // Record consent
                await consentManager.recordConsentDecision(
                    userId: getCurrentUserId(),
                    decision: ConsentDecision(
                        consentId: consentResponse.consentId,
                        granted: true,
                        granularChoices: [:],
                        timestamp: Date(),
                        context: ConsentContext(purpose: purpose)
                    )
                )
                
                return ConsentResult.granted(consentResponse.consentId)
            }
        }
        
        return ConsentResult.denied
    }
    
    func anonymizeLocation(_ location: CLLocation, method: AnonymizationMethod) -> AnonymizedLocationData {
        switch method {
        case .coordinateRounding:
            return anonymizeByRounding(location)
        case .gridSnapping:
            return anonymizeByGridSnapping(location)
        case .noiseAddition:
            return anonymizeByNoiseAddition(location)
        default:
            return anonymizeByGeneralization(location)
        }
    }
    
    private func anonymizeByRounding(_ location: CLLocation) -> AnonymizedLocationData {
        let precision = 0.01 // ~1km precision
        let roundedLat = round(location.coordinate.latitude / precision) * precision
        let roundedLng = round(location.coordinate.longitude / precision) * precision
        
        return AnonymizedLocationData(
            approximateLocation: LocationData(
                latitude: roundedLat,
                longitude: roundedLng,
                timestamp: location.timestamp
            ),
            precision: .approximate,
            anonymizationMethod: .coordinateRounding
        )
    }
    
    private func anonymizeByNoiseAddition(_ location: CLLocation) -> AnonymizedLocationData {
        // Add random noise using differential privacy
        let epsilon = 0.1 // Privacy parameter
        let sensitivity = 0.001 // Geographic sensitivity
        
        let noiseLat = generateLaplaceNoise(epsilon: epsilon, sensitivity: sensitivity)
        let noiseLng = generateLaplaceNoise(epsilon: epsilon, sensitivity: sensitivity)
        
        return AnonymizedLocationData(
            approximateLocation: LocationData(
                latitude: location.coordinate.latitude + noiseLat,
                longitude: location.coordinate.longitude + noiseLng,
                timestamp: location.timestamp
            ),
            precision: .approximate,
            anonymizationMethod: .noiseAddition
        )
    }
    
    func encryptLocationData(_ data: LocationData) -> EncryptedLocationData {
        let key = getEncryptionKey()
        let jsonData = try! JSONEncoder().encode(data)
        
        let sealedBox = try! AES.GCM.seal(jsonData, using: key)
        
        return EncryptedLocationData(
            encryptedData: sealedBox.combined!,
            algorithm: "AES-GCM",
            keyId: getKeyId()
        )
    }
    
    // MARK: - CLLocationManagerDelegate
    
    func locationManager(_ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus) {
        Task {
            await handleAuthorizationChange(status)
        }
    }
    
    private func handleAuthorizationChange(_ status: CLAuthorizationStatus) async {
        switch status {
        case .denied, .restricted:
            await privacyService.recordPermissionDenial(
                userId: getCurrentUserId(),
                reason: "System permission denied"
            )
        case .authorizedWhenInUse, .authorizedAlways:
            await privacyService.recordPermissionGranted(
                userId: getCurrentUserId(),
                scope: status == .authorizedAlways ? .background : .foreground
            )
        default:
            break
        }
    }
}
```

### Android Privacy Implementation

```kotlin
import android.location.LocationManager
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKeys

class AndroidLocationPrivacyManager(private val context: Context) {
    private val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
    private val privacyService = LocationPrivacyService()
    private val consentManager = LocationConsentManager()
    
    suspend fun requestLocationPermission(purpose: LocationPurpose): ConsentResult {
        // Check if consent is already granted
        val existingConsent = consentManager.validateConsent(getCurrentUserId(), purpose)
        if (existingConsent) {
            return ConsentResult.AlreadyGranted
        }
        
        // Present privacy-compliant consent dialog
        val consentRequest = ConsentRequest(
            purpose = purpose,
            scope = LocationScope.PRECISE,
            duration = ConsentDuration.INDEFINITE,
            dataTypes = listOf(LocationDataType.COORDINATES, LocationDataType.TIMESTAMP),
            thirdParties = emptyList(),
            legalBasis = LegalBasis.CONSENT,
            description = getPrivacyDescription(purpose),
            consequences = getConsequencesDescription(purpose)
        )
        
        val consentDialog = LocationConsentDialog(context, consentRequest)
        val consentResponse = consentDialog.show()
        
        if (consentResponse.granted) {
            // Request system permissions
            val permissionResult = requestSystemLocationPermissions()
            
            if (permissionResult.isGranted) {
                // Record consent decision
                consentManager.recordConsentDecision(
                    userId = getCurrentUserId(),
                    decision = ConsentDecision(
                        consentId = consentResponse.consentId,
                        granted = true,
                        granularChoices = emptyMap(),
                        timestamp = Date(),
                        context = ConsentContext(purpose = purpose)
                    )
                )
                
                return ConsentResult.Granted(consentResponse.consentId)
            }
        }
        
        return ConsentResult.Denied
    }
    
    fun anonymizeLocation(location: Location, method: AnonymizationMethod): AnonymizedLocationData {
        return when (method) {
            AnonymizationMethod.COORDINATE_ROUNDING -> anonymizeByRounding(location)
            AnonymizationMethod.GRID_SNAPPING -> anonymizeByGridSnapping(location)
            AnonymizationMethod.NOISE_ADDITION -> anonymizeByNoiseAddition(location)
            else -> anonymizeByGeneralization(location)
        }
    }
    
    private fun anonymizeByRounding(location: Location): AnonymizedLocationData {
        val precision = 0.01 // ~1km precision
        val roundedLat = (location.latitude / precision).roundToInt() * precision
        val roundedLng = (location.longitude / precision).roundToInt() * precision
        
        return AnonymizedLocationData(
            approximateLocation = LocationData(
                latitude = roundedLat,
                longitude = roundedLng,
                timestamp = Date(location.time)
            ),
            precision = LocationPrecision.APPROXIMATE,
            anonymizationMethod = AnonymizationMethod.COORDINATE_ROUNDING
        )
    }
    
    fun encryptLocationData(data: LocationData): EncryptedLocationData {
        val masterKeyAlias = MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC)
        
        val sharedPreferences = EncryptedSharedPreferences.create(
            "location_data",
            masterKeyAlias,
            context,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
        
        val jsonData = Gson().toJson(data)
        val encryptedData = encrypt(jsonData, masterKeyAlias)
        
        return EncryptedLocationData(
            encryptedData = encryptedData,
            algorithm = "AES-GCM",
            keyId = getKeyId()
        )
    }
    
    suspend fun handleDataSubjectRequest(request: DataSubjectRequest): DataSubjectResponse {
        return when (request.type) {
            DataSubjectRequestType.ACCESS -> handleAccessRequest(request)
            DataSubjectRequestType.RECTIFICATION -> handleRectificationRequest(request)
            DataSubjectRequestType.ERASURE -> handleErasureRequest(request)
            DataSubjectRequestType.PORTABILITY -> handlePortabilityRequest(request)
            DataSubjectRequestType.RESTRICTION -> handleRestrictionRequest(request)
            DataSubjectRequestType.OBJECTION -> handleObjectionRequest(request)
        }
    }
    
    private suspend fun handleErasureRequest(request: DataSubjectRequest): DataSubjectResponse {
        val deletionResult = privacyService.deleteLocationData(
            userId = request.userId,
            criteria = DeletionCriteria.ALL
        )
        
        // Also delete from encrypted storage
        clearEncryptedLocationData(request.userId)
        
        // Revoke all consents
        consentManager.revokeAllLocationConsents(request.userId)
        
        return DataSubjectResponse(
            requestId = request.id,
            status = if (deletionResult.success) "completed" else "failed",
            message = "Location data deleted successfully",
            completedAt = Date()
        )
    }
}
```

### Web Privacy Implementation

```javascript
class WebLocationPrivacyManager {
  constructor() {
    this.privacyService = new LocationPrivacyService();
    this.consentManager = new LocationConsentManager();
    this.encryptionKey = null;
  }
  
  async requestLocationPermission(purpose) {
    // Check existing consent
    const existingConsent = await this.consentManager.validateConsent(
      this.getCurrentUserId(),
      purpose
    );
    
    if (existingConsent) {
      return { granted: true, existing: true };
    }
    
    // Present GDPR-compliant consent banner
    const consentBanner = new LocationConsentBanner({
      purpose,
      description: this.getPrivacyDescription(purpose),
      consequences: this.getConsequencesDescription(purpose),
      legalBasis: 'consent',
      dataRetention: '30 days',
      thirdParties: [],
      userRights: [
        'Right to access your data',
        'Right to rectify your data',
        'Right to delete your data',
        'Right to data portability',
        'Right to object to processing'
      ]
    });
    
    const consentResult = await consentBanner.show();
    
    if (consentResult.granted) {
      // Request browser geolocation permission
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });
        
        // Record consent
        await this.consentManager.recordConsentDecision(
          this.getCurrentUserId(),
          {
            consentId: consentResult.consentId,
            granted: true,
            timestamp: new Date(),
            ipAddress: await this.getClientIP(),
            userAgent: navigator.userAgent,
            context: { purpose }
          }
        );
        
        return { granted: true, consentId: consentResult.consentId };
      } catch (error) {
        return { granted: false, error: error.message };
      }
    }
    
    return { granted: false };
  }
  
  anonymizeLocation(location, method = 'coordinate_rounding') {
    switch (method) {
      case 'coordinate_rounding':
        return this.anonymizeByRounding(location);
      case 'grid_snapping':
        return this.anonymizeByGridSnapping(location);
      case 'noise_addition':
        return this.anonymizeByNoiseAddition(location);
      default:
        return this.anonymizeByGeneralization(location);
    }
  }
  
  anonymizeByRounding(location) {
    const precision = 0.01; // ~1km precision
    const roundedLat = Math.round(location.latitude / precision) * precision;
    const roundedLng = Math.round(location.longitude / precision) * precision;
    
    return {
      approximateLocation: {
        latitude: roundedLat,
        longitude: roundedLng,
        timestamp: location.timestamp
      },
      precision: 'approximate',
      anonymizationMethod: 'coordinate_rounding'
    };
  }
  
  async encryptLocationData(data) {
    if (!this.encryptionKey) {
      this.encryptionKey = await this.generateEncryptionKey();
    }
    
    const jsonData = JSON.stringify(data);
    const encodedData = new TextEncoder().encode(jsonData);
    
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: crypto.getRandomValues(new Uint8Array(12)) },
      this.encryptionKey,
      encodedData
    );
    
    return {
      encryptedData: Array.from(new Uint8Array(encryptedData)),
      algorithm: 'AES-GCM',
      keyId: await this.getKeyId()
    };
  }
  
  async generatePrivacyDashboard(userId) {
    const [
      locationDataSummary,
      activeConsents,
      sharingStatus,
      recentActivity
    ] = await Promise.all([
      this.privacyService.getLocationDataSummary(userId),
      this.consentManager.getLocationConsents(userId),
      this.privacyService.getLocationSharingStatus(userId),
      this.privacyService.getRecentPrivacyActivity(userId)
    ]);
    
    return {
      locationDataSummary,
      activeConsents,
      sharingStatus,
      privacyScore: this.calculatePrivacyScore(userId),
      recentActivity,
      recommendations: await this.generatePrivacyRecommendations(userId)
    };
  }
  
  async handleDataDeletion(userId, criteria) {
    // Delete location data
    const deletionResult = await this.privacyService.deleteLocationData(userId, criteria);
    
    // Clear browser storage
    this.clearLocalLocationData(userId);
    
    // Revoke consents if full deletion
    if (criteria.type === 'all') {
      await this.consentManager.revokeAllLocationConsents(userId);
    }
    
    // Notify user
    this.showPrivacyNotification('Your location data has been deleted successfully');
    
    return deletionResult;
  }
  
  clearLocalLocationData(userId) {
    // Clear localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('location') && key.includes(userId)) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear sessionStorage
    const sessionKeys = Object.keys(sessionStorage);
    sessionKeys.forEach(key => {
      if (key.includes('location') && key.includes(userId)) {
        sessionStorage.removeItem(key);
      }
    });
    
    // Clear IndexedDB location data
    this.clearIndexedDBLocationData(userId);
  }
}
```

## Privacy Compliance Framework

### GDPR Compliance

```typescript
interface GDPRComplianceService {
  // Article 6 - Lawfulness of processing
  validateLegalBasis(purpose: LocationPurpose, context: ProcessingContext): Promise<LegalBasisValidation>;
  
  // Article 7 - Conditions for consent
  ensureValidConsent(consentRequest: ConsentRequest): Promise<ConsentValidation>;
  
  // Article 13 & 14 - Information to be provided
  generatePrivacyNotice(purpose: LocationPurpose): Promise<PrivacyNotice>;
  
  // Article 15 - Right of access
  generateAccessReport(userId: string): Promise<GDPRAccessReport>;
  
  // Article 16 - Right to rectification
  handleRectificationRequest(request: RectificationRequest): Promise<RectificationResult>;
  
  // Article 17 - Right to erasure
  handleErasureRequest(request: ErasureRequest): Promise<ErasureResult>;
  
  // Article 18 - Right to restriction
  handleRestrictionRequest(request: RestrictionRequest): Promise<RestrictionResult>;
  
  // Article 20 - Right to data portability
  generatePortabilityExport(userId: string): Promise<PortabilityExport>;
  
  // Article 21 - Right to object
  handleObjectionRequest(request: ObjectionRequest): Promise<ObjectionResult>;
}
```

### CCPA Compliance

```typescript
interface CCPAComplianceService {
  // Right to know
  generateCCPADisclosure(userId: string): Promise<CCPADisclosure>;
  
  // Right to delete
  handleCCPADeletionRequest(request: CCPADeletionRequest): Promise<DeletionResult>;
  
  // Right to opt-out
  handleOptOutRequest(userId: string): Promise<OptOutResult>;
  
  // Right to non-discrimination
  ensureNonDiscrimination(userId: string, action: string): Promise<boolean>;
  
  // Consumer request verification
  verifyConsumerRequest(request: CCPARequest): Promise<VerificationResult>;
}
```

## Testing Strategy

### Privacy Compliance Tests

```typescript
describe('Location Privacy Compliance', () => {
  test('should require explicit consent before collecting location data', async () => {
    const userId = 'test-user';
    const purpose = LocationPurpose.NAVIGATION;
    
    // Attempt to collect location without consent
    await expect(
      locationService.startTracking(userId, { purpose })
    ).rejects.toThrow('Consent required');
    
    // Grant consent
    await privacyService.requestLocationConsent(userId, purpose, LocationScope.PRECISE);
    
    // Should now work
    const tracking = await locationService.startTracking(userId, { purpose });
    expect(tracking.sessionId).toBeDefined();
  });
  
  test('should anonymize location data correctly', () => {
    const location = {
      latitude: 37.7749295,
      longitude: -122.4194155,
      timestamp: new Date()
    };
    
    const anonymized = privacyService.anonymizeLocation(location, AnonymizationMethod.COORDINATE_ROUNDING);
    
    expect(anonymized.approximateLocation.latitude).toBe(37.77);
    expect(anonymized.approximateLocation.longitude).toBe(-122.42);
    expect(anonymized.anonymizationMethod).toBe(AnonymizationMethod.COORDINATE_ROUNDING);
  });
  
  test('should handle data deletion request completely', async () => {
    const userId = 'test-user';
    
    // Create some location data
    await locationService.storeLocation(userId, mockLocationData);
    
    // Request deletion
    const result = await privacyService.deleteLocationData(userId, { type: 'all' });
    
    expect(result.success).toBe(true);
    expect(result.deletedRecords).toBeGreaterThan(0);
    
    // Verify data is deleted
    const remainingData = await locationService.getLocationHistory(userId);
    expect(remainingData).toHaveLength(0);
  });
});
```

### Consent Management Tests

```typescript
describe('Location Consent Management', () => {
  test('should record consent with all required information', async () => {
    const userId = 'test-user';
    const consentRequest = {
      purpose: LocationPurpose.DELIVERY_TRACKING,
      scope: LocationScope.PRECISE,
      duration: ConsentDuration.SESSION,
      legalBasis: LegalBasis.CONSENT
    };
    
    const result = await consentManager.requestLocationConsent(userId, consentRequest);
    
    expect(result.consentId).toBeDefined();
    expect(result.granted).toBe(true);
    expect(result.timestamp).toBeInstanceOf(Date);
    expect(result.consentString).toContain('location data');
  });
  
  test('should validate consent before processing location data', async () => {
    const userId = 'test-user';
    const purpose = LocationPurpose.MARKETING;
    
    // No consent granted
    const isValid = await consentManager.validateConsent(userId, purpose);
    expect(isValid).toBe(false);
    
    // Grant consent
    await consentManager.requestLocationConsent(userId, { purpose });
    
    // Should now be valid
    const isValidAfter = await consentManager.validateConsent(userId, purpose);
    expect(isValidAfter).toBe(true);
  });
});
```

## Configuration

```typescript
interface LocationPrivacyConfig {
  compliance: {
    gdprEnabled: boolean;
    ccpaEnabled: boolean;
    defaultLegalBasis: LegalBasis;
    consentExpirationDays: number;
    dataRetentionDays: number;
  };
  
  anonymization: {
    defaultMethod: AnonymizationMethod;
    coordinatePrecision: number;
    noiseLevel: number;
    kAnonymityK: number;
  };
  
  encryption: {
    algorithm: string;
    keyRotationDays: number;
    encryptInTransit: boolean;
    encryptAtRest: boolean;
  };
  
  notifications: {
    notifyOnDataAccess: boolean;
    notifyOnDataSharing: boolean;
    notifyOnConsentExpiry: boolean;
    privacyReminderDays: number;
  };
}
```

## Performance Optimization

### Efficient Privacy Processing

```typescript
interface PrivacyPerformanceService {
  // Batch processing for privacy operations
  batchProcessConsentUpdates(updates: ConsentUpdate[]): Promise<BatchResult>;
  batchAnonymizeLocationData(data: LocationData[]): Promise<AnonymizedLocationData[]>;
  
  // Caching for privacy preferences
  cachePrivacyPreferences(userId: string, preferences: LocationPrivacyPreferences): Promise<void>;
  getCachedPrivacyPreferences(userId: string): Promise<LocationPrivacyPreferences | null>;
  
  // Optimized data deletion
  optimizeDataDeletion(criteria: DeletionCriteria): Promise<OptimizedDeletionPlan>;
  scheduleBackgroundDeletion(plan: OptimizedDeletionPlan): Promise<void>;
  
  // Performance monitoring
  getPrivacyOperationMetrics(): Promise<PrivacyPerformanceMetrics>;
  optimizePrivacyQueries(queryPattern: QueryPattern): Promise<OptimizationResult>;
}

interface PrivacyPerformanceMetrics {
  consentProcessingTime: number;
  anonymizationThroughput: number;
  dataDeletionRate: number;
  cacheHitRatio: number;
  queryOptimizationGains: number;
}
```

### Memory and Storage Optimization

```typescript
interface PrivacyStorageOptimization {
  // Efficient data structures
  compressLocationData(data: LocationData[]): CompressedLocationData;
  decompressLocationData(compressed: CompressedLocationData): LocationData[];
  
  // Storage optimization
  optimizePrivacyDataStorage(userId: string): Promise<StorageOptimization>;
  archiveOldConsentRecords(retentionPolicy: RetentionPolicy): Promise<void>;
  
  // Memory management
  managePrivacyDataMemory(): Promise<MemoryOptimization>;
  clearUnusedPrivacyCache(): Promise<void>;
}

// Optimized privacy data processing
class OptimizedPrivacyProcessor {
  private consentCache = new Map<string, LocationPrivacyPreferences>();
  private batchProcessor = new BatchProcessor<ConsentUpdate>();
  
  async processLocationDataWithPrivacy(
    data: LocationData[],
    userId: string
  ): Promise<ProcessedLocationData[]> {
    // Get cached privacy preferences
    let preferences = this.consentCache.get(userId);
    if (!preferences) {
      preferences = await this.getLocationPrivacyPreferences(userId);
      this.consentCache.set(userId, preferences);
    }
    
    // Batch process data based on privacy settings
    const batches = this.createOptimalBatches(data, preferences);
    const results = await Promise.all(
      batches.map(batch => this.processBatch(batch, preferences))
    );
    
    return results.flat();
  }
  
  private createOptimalBatches(
    data: LocationData[],
    preferences: LocationPrivacyPreferences
  ): LocationData[][] {
    const batchSize = this.calculateOptimalBatchSize(preferences);
    const batches: LocationData[][] = [];
    
    for (let i = 0; i < data.length; i += batchSize) {
      batches.push(data.slice(i, i + batchSize));
    }
    
    return batches;
  }
}
```

## Best Practices

1. **Privacy by Design**: Build privacy controls into the system from the ground up
2. **Minimal Data Collection**: Only collect location data necessary for the specific purpose
3. **Transparent Communication**: Clearly explain what data is collected, why, and how it's used
4. **Granular Controls**: Provide users with fine-grained control over their location data
5. **Regular Audits**: Conduct regular privacy audits and compliance checks
6. **Data Minimization**: Automatically delete location data when no longer needed
7. **Secure Storage**: Use encryption and secure storage for all location data
8. **User Education**: Educate users about location privacy and their rights
9. **Performance Optimization**: Optimize privacy operations to minimize impact on user experience
10. **Scalable Processing**: Design privacy systems to handle large-scale data processing efficiently

This template provides a comprehensive foundation for implementing privacy-compliant location data management while respecting user rights and meeting regulatory requirements across different jurisdictions.
