# HIPAA Compliance Template

## Purpose
This template provides comprehensive patterns for implementing HIPAA (Health Insurance Portability and Accountability Act) compliance in healthcare applications, covering privacy controls, audit requirements, and regulatory safeguards.

## Instructions

1. **Conduct Risk Assessment**: Perform comprehensive HIPAA risk analysis
2. **Implement Administrative Safeguards**: Set up security officer and workforce training
3. **Deploy Physical Safeguards**: Secure physical access to PHI systems and data
4. **Configure Technical Safeguards**: Implement access controls, encryption, and audit logs
5. **Setup Privacy Controls**: Deploy minimum necessary and patient rights management
6. **Implement Breach Response**: Configure breach detection and notification procedures
7. **Establish Audit Framework**: Set up continuous compliance monitoring and reporting

## Examples

### Example 1: PHI Access Control
```typescript
interface PHIAccessControl {
  userId: string;
  role: 'physician' | 'nurse' | 'admin' | 'billing' | 'patient';
  accessLevel: 'read' | 'write' | 'delete' | 'admin';
  patientAccess: {
    patientIds: string[];
    accessReason: string;
    accessDuration: number; // hours
    minimumNecessary: boolean;
  };
  auditTrail: AccessAuditEntry[];
}

const accessRequest = await requestPHIAccess({
  userId: "nurse-123",
  patientId: "patient-456",
  accessReason: "direct_patient_care",
  requestedData: ["demographics", "vitals", "medications"],
  minimumNecessary: true,
  accessDuration: 8 // hours
});
```

### Example 2: HIPAA Audit Logging
```typescript
interface HIPAAAuditLog {
  auditId: string;
  timestamp: Date;
  userId: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'export' | 'print';
  resourceType: 'patient_record' | 'phi_data' | 'system_config';
  resourceId: string;
  patientId?: string;
  accessMethod: 'direct' | 'api' | 'batch' | 'emergency';
  ipAddress: string;
  userAgent: string;
  outcome: 'success' | 'failure' | 'unauthorized';
}

const auditEntry = await logHIPAAActivity({
  userId: "doctor-789",
  action: "read",
  resourceType: "patient_record",
  patientId: "patient-456",
  accessReason: "treatment",
  minimumNecessary: true,
  outcome: "success"
});
```

### Example 3: Breach Detection and Response
```typescript
interface BreachDetection {
  incidentId: string;
  detectionTime: Date;
  breachType: 'unauthorized_access' | 'data_theft' | 'system_compromise' | 'disclosure';
  affectedPatients: string[];
  phiInvolved: PHIType[];
  riskLevel: 'low' | 'medium' | 'high';
  notificationRequired: boolean;
  responseActions: BreachResponseAction[];
}

const breachResponse = await handlePotentialBreach({
  incidentType: "unauthorized_access",
  affectedSystems: ["ehr-system", "patient-portal"],
  detectedBy: "security-monitoring",
  estimatedPatientCount: 150,
  phiTypes: ["demographics", "medical_history", "insurance"],
  autoNotify: false // manual review required
});
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| entityType | HIPAA entity type (covered entity, business associate) | string | Yes | N/A |
| encryptionRequired | Require encryption for PHI data | boolean | Yes | true |
| auditRetention | Audit log retention period (years) | number | Yes | 6 |
| accessTimeout | User session timeout (minutes) | number | Yes | 30 |
| breachThreshold | Patient count threshold for breach notification | number | Yes | 500 |
| riskAssessmentInterval | Risk assessment frequency (months) | number | Yes | 12 |
| workforceTraining | Require annual HIPAA training | boolean | Yes | true |
| businessAssociateAgreements | Require BAAs for third parties | boolean | Yes | true |

## Expected Output

This template will produce:
- **HIPAA Compliance Framework**: Comprehensive regulatory compliance system
- **Administrative Safeguards**: Security officer designation and workforce training
- **Physical Safeguards**: Facility access controls and workstation security
- **Technical Safeguards**: Access controls, encryption, and audit logging
- **Privacy Controls**: Minimum necessary and patient rights management
- **Breach Response System**: Automated breach detection and notification
- **Audit and Monitoring**: Continuous compliance monitoring and reporting
- **Risk Management**: Regular risk assessments and mitigation strategies

## Context
Use this template when building healthcare applications that handle Protected Health Information (PHI) and need to comply with HIPAA Privacy Rule, Security Rule, and Breach Notification Rule requirements.

## HIPAA Overview

### Key HIPAA Rules

1. **Privacy Rule**: Protects PHI and gives patients rights over their health information
2. **Security Rule**: Sets standards for protecting electronic PHI (ePHI)
3. **Breach Notification Rule**: Requires notification of PHI breaches
4. **Enforcement Rule**: Establishes penalties for HIPAA violations

### Covered Entities and Business Associates

```typescript
enum EntityType {
  COVERED_ENTITY = 'covered_entity',    // Healthcare providers, health plans, clearinghouses
  BUSINESS_ASSOCIATE = 'business_associate', // Third parties handling PHI
  SUBCONTRACTOR = 'subcontractor'       // Business associate's subcontractors
}

interface HIPAAEntity {
  entityId: string;
  entityType: EntityType;
  entityName: string;
  businessAssociateAgreement?: BusinessAssociateAgreement;
  complianceStatus: ComplianceStatus;
  lastAuditDate: Date;
  nextAuditDue: Date;
}
```

## Administrative Safeguards

### Security Officer and Workforce Training

```typescript
interface SecurityOfficer {
  userId: string;
  name: string;
  title: string;
  responsibilities: SecurityResponsibility[];
  certifications: Certification[];
  appointmentDate: Date;
  contactInformation: ContactInfo;
}

interface WorkforceTraining {
  employeeId: string;
  trainingModules: TrainingModule[];
  completionDate: Date;
  expirationDate: Date;
  certificationStatus: CertificationStatus;
  refreshTrainingDue: Date;
}

class HIPAATrainingManager {
  async assignTraining(employeeId: string, role: EmployeeRole): Promise<TrainingAssignment> {
    const requiredModules = this.getRequiredTrainingModules(role);
    
    return {
      employeeId,
      modules: requiredModules,
      assignedDate: new Date(),
      dueDate: this.calculateDueDate(requiredModules),
      status: TrainingStatus.ASSIGNED
    };
  }
  
  async trackTrainingCompletion(employeeId: string, moduleId: string): Promise<void> {
    await this.trainingRepository.recordCompletion(employeeId, moduleId, new Date());
    
    // Check if all required training is complete
    const completionStatus = await this.checkTrainingCompletion(employeeId);
    if (completionStatus.isComplete) {
      await this.grantSystemAccess(employeeId);
    }
  }
  
  async scheduleRefresherTraining(): Promise<void> {
    const employeesDue = await this.getEmployeesDueForRefresher();
    
    for (const employee of employeesDue) {
      await this.assignRefresherTraining(employee.id);
      await this.notificationService.sendTrainingReminder(employee);
    }
  }
}
```

### Access Management and Authorization

```typescript
interface AccessControl {
  // User access management
  grantAccess(userId: string, accessLevel: AccessLevel, justification: string): Promise<AccessGrant>;
  revokeAccess(userId: string, reason: string): Promise<void>;
  modifyAccess(userId: string, newAccessLevel: AccessLevel, reason: string): Promise<void>;
  
  // Role-based permissions
  assignRole(userId: string, role: HIPAARole): Promise<void>;
  removeRole(userId: string, role: HIPAARole): Promise<void>;
  
  // Periodic access review
  conductAccessReview(): Promise<AccessReviewReport>;
  reviewUserAccess(userId: string): Promise<UserAccessReport>;
}

enum HIPAARole {
  PHYSICIAN = 'physician',
  NURSE = 'nurse',
  MEDICAL_ASSISTANT = 'medical_assistant',
  BILLING_SPECIALIST = 'billing_specialist',
  IT_ADMINISTRATOR = 'it_administrator',
  PRIVACY_OFFICER = 'privacy_officer',
  SECURITY_OFFICER = 'security_officer'
}

interface AccessLevel {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  dataTypes: DataType[];
  purposes: AccessPurpose[];
  restrictions: AccessRestriction[];
}
```

### Information System Activity Review

```typescript
class HIPAAActivityReview {
  async generateActivityReport(timeRange: TimeRange): Promise<ActivityReport> {
    const activities = await this.auditRepository.getActivities(timeRange);
    
    return {
      totalAccesses: activities.length,
      uniqueUsers: this.countUniqueUsers(activities),
      dataTypesAccessed: this.analyzeDataTypes(activities),
      purposeBreakdown: this.analyzePurposes(activities),
      suspiciousActivities: await this.identifySuspiciousActivities(activities),
      complianceViolations: await this.identifyViolations(activities)
    };
  }
  
  async reviewSystemActivity(): Promise<ReviewResult> {
    // Daily automated review
    const dailyActivities = await this.getRecentActivities(24); // last 24 hours
    
    // Check for unusual patterns
    const anomalies = await this.detectAnomalies(dailyActivities);
    
    // Verify access was appropriate
    const accessValidation = await this.validateAccesses(dailyActivities);
    
    // Generate alerts for violations
    if (anomalies.length > 0 || accessValidation.violations.length > 0) {
      await this.generateSecurityAlert(anomalies, accessValidation.violations);
    }
    
    return {
      reviewDate: new Date(),
      activitiesReviewed: dailyActivities.length,
      anomaliesFound: anomalies.length,
      violationsFound: accessValidation.violations.length,
      actionsTaken: await this.takeCorrectiveActions(anomalies, accessValidation.violations)
    };
  }
}
```

## Physical Safeguards

### Facility Access Controls

```typescript
interface PhysicalSafeguards {
  // Facility access
  controlFacilityAccess(facilityId: string, accessControls: FacilityAccessControl[]): Promise<void>;
  
  // Workstation use restrictions
  implementWorkstationControls(workstationId: string, controls: WorkstationControl[]): Promise<void>;
  
  // Device and media controls
  manageDeviceAccess(deviceId: string, controls: DeviceControl[]): Promise<void>;
}

interface FacilityAccessControl {
  accessPointId: string;
  accessMethod: AccessMethod; // keycard, biometric, PIN
  authorizedPersonnel: string[];
  accessHours: AccessHours;
  escortRequirements: EscortRequirement[];
  monitoringEnabled: boolean;
}

interface WorkstationControl {
  workstationId: string;
  physicalSafeguards: PhysicalSafeguard[];
  accessRestrictions: AccessRestriction[];
  automaticLogoff: LogoffSettings;
  screenSaver: ScreenSaverSettings;
  physicalLocation: string;
}
```

### Device and Media Controls

```typescript
class DeviceMediaControls {
  async authorizeDevice(deviceId: string, userId: string, purpose: string): Promise<DeviceAuthorization> {
    // Verify user authorization
    const userAuth = await this.verifyUserAuthorization(userId);
    if (!userAuth.authorized) {
      throw new UnauthorizedDeviceAccessError();
    }
    
    // Check device security compliance
    const deviceCompliance = await this.checkDeviceCompliance(deviceId);
    if (!deviceCompliance.compliant) {
      throw new NonCompliantDeviceError(deviceCompliance.violations);
    }
    
    // Create device authorization
    const authorization = {
      deviceId,
      userId,
      purpose,
      authorizedAt: new Date(),
      expiresAt: this.calculateExpirationDate(),
      restrictions: await this.getDeviceRestrictions(deviceId, userId)
    };
    
    await this.deviceRepository.saveAuthorization(authorization);
    return authorization;
  }
  
  async trackMediaMovement(mediaId: string, movement: MediaMovement): Promise<void> {
    // Log media movement
    await this.auditLogger.logMediaMovement({
      mediaId,
      fromLocation: movement.fromLocation,
      toLocation: movement.toLocation,
      movedBy: movement.userId,
      timestamp: new Date(),
      purpose: movement.purpose
    });
    
    // Update media location
    await this.mediaRepository.updateLocation(mediaId, movement.toLocation);
    
    // Check if movement requires additional approvals
    if (this.requiresApproval(movement)) {
      await this.requestMovementApproval(mediaId, movement);
    }
  }
}
```

## Technical Safeguards

### Access Control Implementation

```typescript
interface TechnicalSafeguards {
  // Unique user identification
  implementUniqueUserIdentification(): Promise<void>;
  
  // Automatic logoff
  configureAutomaticLogoff(settings: LogoffSettings): Promise<void>;
  
  // Encryption and decryption
  implementEncryption(encryptionSettings: EncryptionSettings): Promise<void>;
}

class AccessControlSystem {
  async authenticateUser(credentials: UserCredentials): Promise<AuthenticationResult> {
    // Multi-factor authentication
    const mfaResult = await this.mfaService.verify(credentials.userId, credentials.mfaToken);
    if (!mfaResult.verified) {
      await this.auditLogger.logFailedAuthentication(credentials.userId, 'MFA_FAILED');
      throw new AuthenticationFailedError('Multi-factor authentication failed');
    }
    
    // Password verification
    const passwordResult = await this.passwordService.verify(credentials.userId, credentials.password);
    if (!passwordResult.valid) {
      await this.auditLogger.logFailedAuthentication(credentials.userId, 'PASSWORD_FAILED');
      throw new AuthenticationFailedError('Invalid password');
    }
    
    // Account status check
    const accountStatus = await this.userService.getAccountStatus(credentials.userId);
    if (accountStatus.locked || accountStatus.suspended) {
      await this.auditLogger.logFailedAuthentication(credentials.userId, 'ACCOUNT_LOCKED');
      throw new AccountLockedError('Account is locked or suspended');
    }
    
    // Generate session token
    const sessionToken = await this.sessionService.createSession(credentials.userId);
    
    // Log successful authentication
    await this.auditLogger.logSuccessfulAuthentication(credentials.userId);
    
    return {
      authenticated: true,
      sessionToken,
      expiresAt: sessionToken.expiresAt,
      userRole: accountStatus.role
    };
  }
  
  async enforceAutomaticLogoff(): Promise<void> {
    const activeSessions = await this.sessionService.getActiveSessions();
    
    for (const session of activeSessions) {
      const inactivityPeriod = Date.now() - session.lastActivity;
      const maxInactivity = this.getMaxInactivityPeriod(session.userRole);
      
      if (inactivityPeriod > maxInactivity) {
        await this.sessionService.terminateSession(session.sessionId);
        await this.auditLogger.logAutomaticLogoff(session.userId, 'INACTIVITY_TIMEOUT');
      }
    }
  }
}
```

### Audit Controls and Integrity

```typescript
interface AuditControls {
  // Audit log generation
  generateAuditLog(event: AuditEvent): Promise<void>;
  
  // Audit log protection
  protectAuditLogs(): Promise<void>;
  
  // Audit log review
  reviewAuditLogs(criteria: ReviewCriteria): Promise<AuditReviewReport>;
  
  // Audit log retention
  manageAuditRetention(): Promise<void>;
}

class HIPAAAuditSystem {
  async logEvent(event: HIPAAEvent): Promise<void> {
    const auditEntry = {
      eventId: this.generateEventId(),
      timestamp: new Date(),
      userId: event.userId,
      patientId: event.patientId,
      eventType: event.type,
      eventDescription: event.description,
      sourceIP: event.sourceIP,
      userAgent: event.userAgent,
      outcome: event.outcome,
      additionalDetails: event.details
    };
    
    // Encrypt audit entry
    const encryptedEntry = await this.encryptAuditEntry(auditEntry);
    
    // Store in tamper-evident log
    await this.auditRepository.storeEntry(encryptedEntry);
    
    // Real-time monitoring for critical events
    if (this.isCriticalEvent(event)) {
      await this.alertingService.sendCriticalEventAlert(auditEntry);
    }
  }
  
  async generateComplianceReport(reportPeriod: ReportPeriod): Promise<ComplianceReport> {
    const auditEntries = await this.auditRepository.getEntriesForPeriod(reportPeriod);
    
    return {
      reportPeriod,
      totalEvents: auditEntries.length,
      eventsByType: this.categorizeEvents(auditEntries),
      userActivity: this.analyzeUserActivity(auditEntries),
      patientDataAccess: this.analyzePatientAccess(auditEntries),
      securityEvents: this.identifySecurityEvents(auditEntries),
      complianceViolations: this.identifyViolations(auditEntries),
      recommendations: this.generateRecommendations(auditEntries)
    };
  }
}
```

### Data Integrity and Transmission Security

```typescript
class DataIntegrityManager {
  async verifyDataIntegrity(dataId: string): Promise<IntegrityResult> {
    const data = await this.dataRepository.getData(dataId);
    const storedHash = await this.hashRepository.getHash(dataId);
    
    const currentHash = await this.calculateHash(data);
    
    const isIntact = currentHash === storedHash.value;
    
    if (!isIntact) {
      await this.auditLogger.logIntegrityViolation(dataId, storedHash.value, currentHash);
      await this.alertingService.sendIntegrityAlert(dataId);
    }
    
    return {
      dataId,
      isIntact,
      verificationTime: new Date(),
      expectedHash: storedHash.value,
      actualHash: currentHash
    };
  }
  
  async secureTransmission(data: PHIData, destination: Endpoint): Promise<TransmissionResult> {
    // Encrypt data for transmission
    const encryptedData = await this.encryptionService.encrypt(data, destination.publicKey);
    
    // Create digital signature
    const signature = await this.signingService.sign(encryptedData);
    
    // Transmit with TLS
    const transmissionResult = await this.transmissionService.send({
      data: encryptedData,
      signature,
      destination,
      timestamp: new Date()
    });
    
    // Log transmission
    await this.auditLogger.logDataTransmission({
      dataId: data.id,
      destination: destination.id,
      transmissionId: transmissionResult.transmissionId,
      status: transmissionResult.status
    });
    
    return transmissionResult;
  }
}
```

## Privacy Controls

### Patient Rights Implementation

```typescript
interface PatientRights {
  // Right to access
  providePatientAccess(patientId: string, requestDetails: AccessRequest): Promise<PatientDataExport>;
  
  // Right to amend
  processAmendmentRequest(patientId: string, amendment: AmendmentRequest): Promise<AmendmentResult>;
  
  // Right to restrict
  processRestrictionRequest(patientId: string, restriction: RestrictionRequest): Promise<RestrictionResult>;
  
  // Right to accounting of disclosures
  generateDisclosureAccounting(patientId: string, timeRange: TimeRange): Promise<DisclosureReport>;
}

class PatientRightsManager {
  async handleAccessRequest(request: PatientAccessRequest): Promise<AccessResponse> {
    // Verify patient identity
    const identityVerification = await this.verifyPatientIdentity(request.patientId, request.identityProof);
    if (!identityVerification.verified) {
      throw new IdentityVerificationError('Patient identity could not be verified');
    }
    
    // Compile patient data
    const patientData = await this.compilePatientData(request.patientId);
    
    // Apply any restrictions
    const restrictedData = await this.applyPatientRestrictions(patientData, request.patientId);
    
    // Format for patient consumption
    const formattedData = await this.formatForPatient(restrictedData);
    
    // Log access request fulfillment
    await this.auditLogger.logPatientAccessRequest(request.patientId, request.requestId);
    
    return {
      requestId: request.requestId,
      patientId: request.patientId,
      data: formattedData,
      generatedAt: new Date(),
      expiresAt: this.calculateExpirationDate()
    };
  }
  
  async processAmendmentRequest(request: AmendmentRequest): Promise<AmendmentResult> {
    // Validate amendment request
    const validation = await this.validateAmendmentRequest(request);
    if (!validation.valid) {
      return {
        requestId: request.requestId,
        status: AmendmentStatus.DENIED,
        reason: validation.reason
      };
    }
    
    // Review by healthcare provider
    const providerReview = await this.requestProviderReview(request);
    
    if (providerReview.approved) {
      // Apply amendment
      await this.applyAmendment(request);
      
      // Notify relevant parties
      await this.notifyAmendment(request);
      
      return {
        requestId: request.requestId,
        status: AmendmentStatus.APPROVED,
        appliedAt: new Date()
      };
    } else {
      return {
        requestId: request.requestId,
        status: AmendmentStatus.DENIED,
        reason: providerReview.reason
      };
    }
  }
}
```

### Minimum Necessary Standard

```typescript
class MinimumNecessaryEnforcement {
  async determineNecessaryData(
    userId: string, 
    purpose: AccessPurpose, 
    patientId: string
  ): Promise<DataScope> {
    const userRole = await this.getUserRole(userId);
    const purposeRequirements = await this.getPurposeRequirements(purpose);
    
    // Determine minimum necessary data fields
    const necessaryFields = this.calculateMinimumNecessary(userRole, purposeRequirements);
    
    // Apply patient-specific restrictions
    const patientRestrictions = await this.getPatientRestrictions(patientId);
    const allowedFields = this.applyRestrictions(necessaryFields, patientRestrictions);
    
    return {
      patientId,
      allowedFields,
      purpose,
      justification: this.generateJustification(userRole, purpose),
      appliedRestrictions: patientRestrictions
    };
  }
  
  async auditMinimumNecessaryCompliance(): Promise<ComplianceAuditResult> {
    const recentAccesses = await this.auditRepository.getRecentAccesses(30); // last 30 days
    
    const violations = [];
    for (const access of recentAccesses) {
      const necessaryData = await this.determineNecessaryData(
        access.userId, 
        access.purpose, 
        access.patientId
      );
      
      const excessiveAccess = this.identifyExcessiveAccess(access.accessedFields, necessaryData.allowedFields);
      if (excessiveAccess.length > 0) {
        violations.push({
          accessId: access.id,
          userId: access.userId,
          excessiveFields: excessiveAccess,
          severity: this.calculateViolationSeverity(excessiveAccess)
        });
      }
    }
    
    return {
      auditPeriod: { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() },
      totalAccesses: recentAccesses.length,
      violations: violations.length,
      violationDetails: violations,
      complianceRate: ((recentAccesses.length - violations.length) / recentAccesses.length) * 100
    };
  }
}
```

## Breach Notification

### Breach Detection and Response

```typescript
interface BreachResponse {
  // Breach detection
  detectBreach(incident: SecurityIncident): Promise<BreachAssessment>;
  
  // Breach notification
  notifyBreach(breach: ConfirmedBreach): Promise<NotificationResult>;
  
  // Breach mitigation
  mitigateBreach(breach: ConfirmedBreach): Promise<MitigationResult>;
  
  // Breach reporting
  reportBreach(breach: ConfirmedBreach): Promise<ReportingResult>;
}

class BreachNotificationManager {
  async assessPotentialBreach(incident: SecurityIncident): Promise<BreachAssessment> {
    // Determine if incident constitutes a breach
    const breachCriteria = {
      involvesPHI: await this.checkPHIInvolvement(incident),
      unauthorizedAccess: await this.checkUnauthorizedAccess(incident),
      probabilityOfCompromise: await this.assessCompromiseProbability(incident)
    };
    
    const isBreach = this.evaluateBreachCriteria(breachCriteria);
    
    if (isBreach) {
      // Start breach response process
      const breach = await this.createBreachRecord(incident);
      
      // Immediate containment
      await this.containBreach(breach);
      
      // Risk assessment
      const riskAssessment = await this.assessBreachRisk(breach);
      
      return {
        isBreachConfirmed: true,
        breachId: breach.id,
        riskLevel: riskAssessment.riskLevel,
        affectedPatients: riskAssessment.affectedPatients,
        notificationRequired: riskAssessment.riskLevel !== RiskLevel.LOW,
        timelineRequirements: this.calculateNotificationTimeline(riskAssessment.riskLevel)
      };
    }
    
    return {
      isBreachConfirmed: false,
      reason: 'Incident does not meet breach criteria'
    };
  }
  
  async executeBreachNotification(breach: ConfirmedBreach): Promise<NotificationResult> {
    const notifications = [];
    
    // Notify affected patients (within 60 days)
    if (breach.riskAssessment.notificationRequired) {
      const patientNotifications = await this.notifyAffectedPatients(breach);
      notifications.push(...patientNotifications);
    }
    
    // Notify HHS (within 60 days)
    const hhsNotification = await this.notifyHHS(breach);
    notifications.push(hhsNotification);
    
    // Notify media if > 500 patients affected (immediately)
    if (breach.affectedPatients.length > 500) {
      const mediaNotification = await this.notifyMedia(breach);
      notifications.push(mediaNotification);
    }
    
    // Log all notifications
    await this.auditLogger.logBreachNotifications(breach.id, notifications);
    
    return {
      breachId: breach.id,
      notificationsSent: notifications.length,
      notificationDetails: notifications,
      complianceStatus: this.assessNotificationCompliance(breach, notifications)
    };
  }
}
```

### Risk Assessment Framework

```typescript
class BreachRiskAssessment {
  async assessRisk(breach: SecurityBreach): Promise<RiskAssessment> {
    // Factor 1: Nature and extent of PHI involved
    const phiNatureScore = await this.assessPHINature(breach.involvedData);
    
    // Factor 2: Unauthorized person who used/disclosed PHI
    const unauthorizedPersonScore = await this.assessUnauthorizedPerson(breach.unauthorizedAccess);
    
    // Factor 3: Whether PHI was actually acquired or viewed
    const acquisitionScore = await this.assessPHIAcquisition(breach.accessDetails);
    
    // Factor 4: Extent to which risk has been mitigated
    const mitigationScore = await this.assessMitigation(breach.mitigationActions);
    
    const overallRisk = this.calculateOverallRisk([
      phiNatureScore,
      unauthorizedPersonScore,
      acquisitionScore,
      mitigationScore
    ]);
    
    return {
      overallRiskLevel: overallRisk,
      riskFactors: {
        phiNature: phiNatureScore,
        unauthorizedPerson: unauthorizedPersonScore,
        phiAcquisition: acquisitionScore,
        mitigation: mitigationScore
      },
      notificationRequired: overallRisk !== RiskLevel.LOW,
      recommendedActions: this.generateRecommendations(overallRisk)
    };
  }
}
```

## Business Associate Agreements

### BAA Management

```typescript
interface BusinessAssociateManagement {
  // BAA lifecycle
  createBAA(businessAssociate: BusinessAssociate): Promise<BusinessAssociateAgreement>;
  renewBAA(baaId: string): Promise<BusinessAssociateAgreement>;
  terminateBAA(baaId: string, reason: string): Promise<void>;
  
  // Compliance monitoring
  monitorBAACompliance(baaId: string): Promise<ComplianceStatus>;
  auditBusinessAssociate(businessAssociateId: string): Promise<AuditResult>;
}

interface BusinessAssociateAgreement {
  baaId: string;
  businessAssociateId: string;
  coveredEntityId: string;
  
  // Agreement terms
  effectiveDate: Date;
  expirationDate: Date;
  servicesDescription: string;
  phiUsagePermissions: PHIUsagePermission[];
  
  // Compliance requirements
  safeguardRequirements: SafeguardRequirement[];
  reportingRequirements: ReportingRequirement[];
  auditRights: AuditRight[];
  
  // Breach notification terms
  breachNotificationTimeline: number; // hours
  breachReportingRequirements: BreachReportingRequirement[];
  
  // Termination conditions
  terminationConditions: TerminationCondition[];
  dataReturnRequirements: DataReturnRequirement[];
}
```

## Compliance Monitoring and Reporting

### Automated Compliance Monitoring

```typescript
class HIPAAComplianceMonitor {
  async runDailyComplianceCheck(): Promise<ComplianceReport> {
    const checks = await Promise.all([
      this.checkAccessControls(),
      this.checkAuditLogs(),
      this.checkEncryption(),
      this.checkTrainingCompliance(),
      this.checkBusinessAssociateCompliance(),
      this.checkIncidentResponse()
    ]);
    
    const overallCompliance = this.calculateOverallCompliance(checks);
    
    if (overallCompliance.score < 0.95) { // 95% compliance threshold
      await this.alertingService.sendComplianceAlert(overallCompliance);
    }
    
    return {
      reportDate: new Date(),
      overallScore: overallCompliance.score,
      checkResults: checks,
      violations: overallCompliance.violations,
      recommendations: overallCompliance.recommendations
    };
  }
  
  async generateAnnualComplianceReport(): Promise<AnnualComplianceReport> {
    const reportPeriod = this.getAnnualReportPeriod();
    
    return {
      reportPeriod,
      executiveSummary: await this.generateExecutiveSummary(reportPeriod),
      riskAssessment: await this.generateRiskAssessment(reportPeriod),
      safeguardImplementation: await this.assessSafeguardImplementation(),
      trainingProgram: await this.assessTrainingProgram(reportPeriod),
      incidentSummary: await this.generateIncidentSummary(reportPeriod),
      businessAssociateManagement: await this.assessBAManagement(reportPeriod),
      improvementPlan: await this.generateImprovementPlan()
    };
  }
}
```

## Testing and Validation

### HIPAA Compliance Testing

```typescript
describe('HIPAA Compliance', () => {
  describe('Administrative Safeguards', () => {
    test('should require security officer assignment', async () => {
      const organization = await createTestOrganization();
      
      const complianceCheck = await hipaaCompliance.checkAdministrativeSafeguards(organization.id);
      
      expect(complianceCheck.securityOfficerAssigned).toBe(true);
      expect(complianceCheck.securityOfficer).toBeDefined();
    });
    
    test('should enforce workforce training requirements', async () => {
      const employee = await createTestEmployee();
      
      // Employee should not have system access without training
      await expect(
        accessControl.grantAccess(employee.id, AccessLevel.BASIC, 'Initial access')
      ).rejects.toThrow('Training requirements not met');
      
      // Complete required training
      await trainingManager.completeTraining(employee.id, 'HIPAA_BASICS');
      
      // Access should now be granted
      const accessGrant = await accessControl.grantAccess(employee.id, AccessLevel.BASIC, 'Post-training access');
      expect(accessGrant.granted).toBe(true);
    });
  });
  
  describe('Technical Safeguards', () => {
    test('should enforce unique user identification', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      
      expect(user1.userId).not.toBe(user2.userId);
      expect(user1.username).not.toBe(user2.username);
    });
    
    test('should implement automatic logoff', async () => {
      const session = await sessionService.createSession('test-user');
      
      // Simulate inactivity
      await advanceTime(INACTIVITY_TIMEOUT + 1000);
      
      // Session should be automatically terminated
      const sessionStatus = await sessionService.getSessionStatus(session.sessionId);
      expect(sessionStatus.active).toBe(false);
      expect(sessionStatus.terminationReason).toBe('INACTIVITY_TIMEOUT');
    });
  });
  
  describe('Audit Controls', () => {
    test('should log all PHI access events', async () => {
      const patientId = 'test-patient-123';
      const userId = 'test-user-456';
      
      await patientDataService.getPatientData(patientId, userId, AccessPurpose.TREATMENT);
      
      const auditLogs = await auditService.getAuditLogs({
        patientId,
        userId,
        eventType: AuditEventType.DATA_ACCESS
      });
      
      expect(auditLogs).toHaveLength(1);
      expect(auditLogs[0].patientId).toBe(patientId);
      expect(auditLogs[0].userId).toBe(userId);
      expect(auditLogs[0].purpose).toBe(AccessPurpose.TREATMENT);
    });
  });
});
```

This comprehensive HIPAA compliance template provides the foundation for building healthcare applications that meet all HIPAA requirements while maintaining security, privacy, and operational efficiency.