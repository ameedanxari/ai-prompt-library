# Healthcare Security Template

## Purpose
This template provides comprehensive security patterns specifically designed for healthcare applications, covering encryption, access controls, threat detection, and security monitoring tailored to protect Protected Health Information (PHI) and ensure regulatory compliance.

## Instructions

1. **Implement Zero Trust Architecture**: Deploy identity verification and device trust assessment
2. **Configure Data Encryption**: Set up end-to-end encryption for PHI data
3. **Setup Access Controls**: Implement role-based and attribute-based access controls
4. **Deploy Threat Detection**: Configure real-time security monitoring and threat detection
5. **Implement Audit Logging**: Set up comprehensive security audit trails
6. **Configure Incident Response**: Deploy automated incident response workflows
7. **Setup Compliance Monitoring**: Ensure continuous regulatory compliance validation

## Examples

### Example 1: PHI Data Encryption
```typescript
interface PHIEncryption {
  encryptionMethod: 'AES-256' | 'RSA-2048' | 'ECC-P256';
  keyManagement: 'HSM' | 'KMS' | 'local';
  encryptionScope: 'field-level' | 'record-level' | 'database-level';
  keyRotationInterval: number; // days
}

const encryptedPHI = await encryptPHIData({
  patientData: {
    ssn: "123-45-6789",
    medicalRecordNumber: "MRN-12345",
    diagnosis: "Type 2 Diabetes"
  },
  encryptionConfig: {
    method: "AES-256",
    keyManagement: "HSM",
    scope: "field-level"
  }
});
```

### Example 2: Healthcare Access Control
```typescript
interface HealthcareAccessControl {
  userId: string;
  role: 'physician' | 'nurse' | 'admin' | 'patient' | 'researcher';
  permissions: Permission[];
  patientAccess: PatientAccessRule[];
  timeRestrictions: TimeRestriction[];
  locationRestrictions: LocationRestriction[];
}

const accessDecision = await evaluateAccess({
  userId: "doctor-123",
  requestedResource: "patient-456-medical-record",
  action: "read",
  context: {
    location: "hospital-network",
    time: new Date(),
    deviceTrust: "trusted"
  }
});
```

### Example 3: Security Incident Detection
```typescript
interface SecurityIncident {
  incidentId: string;
  type: 'unauthorized_access' | 'data_breach' | 'malware' | 'phishing';
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedResources: string[];
  detectionTime: Date;
  responseActions: ResponseAction[];
}

const incidentResponse = await detectSecurityIncident({
  eventType: "multiple_failed_logins",
  userId: "user-789",
  threshold: 5,
  timeWindow: 300, // 5 minutes
  autoResponse: true
});
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| encryptionStandard | Encryption standard for PHI data | string | Yes | "AES-256" |
| keyRotationInterval | Key rotation interval (days) | number | Yes | 90 |
| sessionTimeout | User session timeout (minutes) | number | No | 30 |
| mfaRequired | Require multi-factor authentication | boolean | Yes | true |
| auditRetention | Audit log retention period (years) | number | Yes | 6 |
| threatDetection | Enable real-time threat detection | boolean | Yes | true |
| incidentResponse | Enable automated incident response | boolean | No | true |
| complianceFrameworks | Required compliance frameworks | string[] | Yes | ["HIPAA"] |

## Expected Output

This template will produce:
- **Zero Trust Security Framework**: Identity and device verification system
- **Data Encryption System**: End-to-end PHI data protection
- **Access Control Engine**: Role-based and attribute-based access management
- **Threat Detection Platform**: Real-time security monitoring and alerting
- **Incident Response System**: Automated security incident handling
- **Audit and Compliance System**: Comprehensive security audit trails
- **Security Dashboard**: Real-time security posture monitoring
- **Compliance Reporting**: Automated regulatory compliance reports

## Context
Use this template when building healthcare applications that require advanced security measures beyond standard HIPAA compliance, including threat detection, incident response, and comprehensive security monitoring for healthcare environments.

## Healthcare Security Architecture

### Multi-Layered Security Model

```typescript
interface HealthcareSecurityArchitecture {
  // Network security layer
  networkSecurity: NetworkSecurityControls;
  
  // Application security layer
  applicationSecurity: ApplicationSecurityControls;
  
  // Data security layer
  dataSecurity: DataSecurityControls;
  
  // Identity and access management
  identityManagement: IdentityManagementControls;
  
  // Monitoring and incident response
  securityMonitoring: SecurityMonitoringControls;
}

interface SecurityControls {
  preventive: PreventiveControl[];
  detective: DetectiveControl[];
  corrective: CorrectiveControl[];
  deterrent: DeterrentControl[];
}
```

### Zero Trust Architecture for Healthcare

```typescript
class HealthcareZeroTrustManager {
  async verifyAccess(accessRequest: AccessRequest): Promise<AccessDecision> {
    // 1. Identity verification
    const identityVerification = await this.verifyIdentity(accessRequest.userId);
    if (!identityVerification.verified) {
      return this.denyAccess('IDENTITY_VERIFICATION_FAILED', accessRequest);
    }
    
    // 2. Device trust assessment
    const deviceTrust = await this.assessDeviceTrust(accessRequest.deviceId);
    if (deviceTrust.riskLevel === RiskLevel.HIGH) {
      return this.denyAccess('UNTRUSTED_DEVICE', accessRequest);
    }
    
    // 3. Network context analysis
    const networkContext = await this.analyzeNetworkContext(accessRequest.sourceIP);
    if (networkContext.suspicious) {
      return this.denyAccess('SUSPICIOUS_NETWORK', accessRequest);
    }
    
    // 4. Behavioral analysis
    const behaviorAnalysis = await this.analyzeBehavior(accessRequest);
    if (behaviorAnalysis.anomalous) {
      return this.requireAdditionalAuthentication(accessRequest);
    }
    
    // 5. Resource-specific authorization
    const resourceAuth = await this.authorizeResourceAccess(
      accessRequest.userId,
      accessRequest.resourceId,
      accessRequest.operation
    );
    
    if (!resourceAuth.authorized) {
      return this.denyAccess('INSUFFICIENT_PERMISSIONS', accessRequest);
    }
    
    // 6. Dynamic policy evaluation
    const policyDecision = await this.evaluateDynamicPolicies(accessRequest);
    
    return {
      decision: policyDecision.allow ? 'ALLOW' : 'DENY',
      conditions: policyDecision.conditions,
      expiresAt: this.calculateSessionExpiry(accessRequest),
      monitoringLevel: this.determineMonitoringLevel(accessRequest)
    };
  }
  
  async continuousVerification(sessionId: string): Promise<void> {
    const session = await this.getActiveSession(sessionId);
    
    // Continuous device monitoring
    const deviceStatus = await this.monitorDevice(session.deviceId);
    if (deviceStatus.compromised) {
      await this.terminateSession(sessionId, 'DEVICE_COMPROMISED');
      return;
    }
    
    // Behavioral monitoring
    const behaviorUpdate = await this.updateBehaviorProfile(session.userId, session.recentActivity);
    if (behaviorUpdate.anomalyDetected) {
      await this.challengeUser(sessionId, 'BEHAVIORAL_ANOMALY');
    }
    
    // Network monitoring
    const networkUpdate = await this.monitorNetworkContext(session.sourceIP);
    if (networkUpdate.threatDetected) {
      await this.terminateSession(sessionId, 'NETWORK_THREAT');
    }
  }
}
```

## Advanced Encryption and Key Management

### Healthcare-Specific Encryption

```typescript
interface HealthcareEncryption {
  // Field-level encryption for PHI
  encryptPHIField(value: string, fieldType: PHIFieldType, patientId: string): Promise<EncryptedField>;
  decryptPHIField(encryptedField: EncryptedField, userContext: UserContext): Promise<string>;
  
  // Database encryption
  encryptDatabaseRecord(record: HealthcareRecord): Promise<EncryptedRecord>;
  decryptDatabaseRecord(encryptedRecord: EncryptedRecord, accessContext: AccessContext): Promise<HealthcareRecord>;
  
  // Communication encryption
  encryptMessage(message: HealthcareMessage, recipientPublicKey: string): Promise<EncryptedMessage>;
  decryptMessage(encryptedMessage: EncryptedMessage, recipientPrivateKey: string): Promise<HealthcareMessage>;
  
  // File encryption
  encryptMedicalFile(file: MedicalFile, encryptionPolicy: EncryptionPolicy): Promise<EncryptedFile>;
  decryptMedicalFile(encryptedFile: EncryptedFile, decryptionContext: DecryptionContext): Promise<MedicalFile>;
}

class HealthcareKeyManager {
  async generatePatientSpecificKey(patientId: string): Promise<PatientEncryptionKey> {
    // Generate unique encryption key for patient
    const masterKey = await this.getMasterKey();
    const patientSalt = await this.generatePatientSalt(patientId);
    
    const patientKey = await this.deriveKey(masterKey, patientSalt, {
      algorithm: 'PBKDF2',
      iterations: 100000,
      keyLength: 256
    });
    
    // Store key metadata (not the key itself)
    await this.storeKeyMetadata({
      patientId,
      keyId: this.generateKeyId(),
      algorithm: 'AES-256-GCM',
      createdAt: new Date(),
      rotationSchedule: this.calculateRotationSchedule()
    });
    
    return {
      keyId: this.generateKeyId(),
      key: patientKey,
      algorithm: 'AES-256-GCM',
      patientId
    };
  }
  
  async rotateEncryptionKeys(): Promise<KeyRotationResult> {
    const keysToRotate = await this.getKeysScheduledForRotation();
    const rotationResults = [];
    
    for (const keyMetadata of keysToRotate) {
      try {
        // Generate new key
        const newKey = await this.generatePatientSpecificKey(keyMetadata.patientId);
        
        // Re-encrypt data with new key
        const reencryptionResult = await this.reencryptPatientData(
          keyMetadata.patientId,
          keyMetadata.keyId,
          newKey.keyId
        );
        
        // Update key metadata
        await this.updateKeyMetadata(keyMetadata.keyId, {
          status: 'ROTATED',
          rotatedAt: new Date(),
          newKeyId: newKey.keyId
        });
        
        rotationResults.push({
          patientId: keyMetadata.patientId,
          oldKeyId: keyMetadata.keyId,
          newKeyId: newKey.keyId,
          recordsReencrypted: reencryptionResult.recordCount,
          status: 'SUCCESS'
        });
        
      } catch (error) {
        rotationResults.push({
          patientId: keyMetadata.patientId,
          keyId: keyMetadata.keyId,
          status: 'FAILED',
          error: error.message
        });
      }
    }
    
    return {
      rotationDate: new Date(),
      keysRotated: rotationResults.filter(r => r.status === 'SUCCESS').length,
      failures: rotationResults.filter(r => r.status === 'FAILED').length,
      results: rotationResults
    };
  }
}
```

### Hardware Security Module Integration

```typescript
interface HSMIntegration {
  // Key generation in HSM
  generateKeyInHSM(keySpec: KeySpecification): Promise<HSMKeyReference>;
  
  // Cryptographic operations
  encryptWithHSM(data: Buffer, keyReference: HSMKeyReference): Promise<Buffer>;
  decryptWithHSM(encryptedData: Buffer, keyReference: HSMKeyReference): Promise<Buffer>;
  
  // Digital signatures
  signWithHSM(data: Buffer, signingKeyReference: HSMKeyReference): Promise<DigitalSignature>;
  verifyWithHSM(data: Buffer, signature: DigitalSignature, verificationKeyReference: HSMKeyReference): Promise<boolean>;
}

class HealthcareHSMManager {
  async initializeHSMForHealthcare(): Promise<HSMInitializationResult> {
    // Initialize HSM partitions for different data types
    const partitions = await Promise.all([
      this.createHSMPartition('PHI_ENCRYPTION', { highAvailability: true }),
      this.createHSMPartition('AUDIT_SIGNING', { tamperEvident: true }),
      this.createHSMPartition('COMMUNICATION_KEYS', { keyEscrow: true }),
      this.createHSMPartition('BACKUP_KEYS', { offlineStorage: true })
    ]);
    
    // Generate master keys for each partition
    const masterKeys = await Promise.all(
      partitions.map(partition => 
        this.generateMasterKey(partition.id, {
          algorithm: 'AES-256',
          keyUsage: partition.keyUsage,
          exportable: false
        })
      )
    );
    
    // Set up key rotation policies
    await this.configureKeyRotationPolicies(partitions);
    
    // Initialize audit logging for HSM operations
    await this.initializeHSMAuditLogging();
    
    return {
      partitions,
      masterKeys: masterKeys.map(k => ({ keyId: k.keyId, partition: k.partition })),
      initializationDate: new Date(),
      status: 'INITIALIZED'
    };
  }
}
```

## Advanced Access Controls

### Attribute-Based Access Control (ABAC)

```typescript
interface ABACPolicy {
  policyId: string;
  name: string;
  description: string;
  
  // Subject attributes (who)
  subjectAttributes: AttributeCondition[];
  
  // Resource attributes (what)
  resourceAttributes: AttributeCondition[];
  
  // Action attributes (how)
  actionAttributes: AttributeCondition[];
  
  // Environment attributes (when/where)
  environmentAttributes: AttributeCondition[];
  
  // Policy decision
  effect: PolicyEffect; // PERMIT or DENY
  obligations: Obligation[];
  advice: Advice[];
}

class HealthcareABACEngine {
  async evaluateAccess(accessRequest: ABACAccessRequest): Promise<ABACDecision> {
    // Collect all relevant attributes
    const attributes = await this.collectAttributes(accessRequest);
    
    // Find applicable policies
    const applicablePolicies = await this.findApplicablePolicies(attributes);
    
    // Evaluate each policy
    const policyDecisions = await Promise.all(
      applicablePolicies.map(policy => this.evaluatePolicy(policy, attributes))
    );
    
    // Combine policy decisions
    const finalDecision = this.combinePolicyDecisions(policyDecisions);
    
    // Apply obligations and advice
    const obligations = this.collectObligations(policyDecisions);
    const advice = this.collectAdvice(policyDecisions);
    
    return {
      decision: finalDecision.effect,
      obligations,
      advice,
      applicablePolicies: applicablePolicies.map(p => p.policyId),
      evaluationTime: new Date()
    };
  }
  
  async createHealthcareABACPolicies(): Promise<ABACPolicy[]> {
    return [
      // Emergency access policy
      {
        policyId: 'EMERGENCY_ACCESS',
        name: 'Emergency Access to Patient Data',
        description: 'Allow emergency access to patient data during medical emergencies',
        subjectAttributes: [
          { attribute: 'role', operator: 'IN', values: ['PHYSICIAN', 'NURSE', 'EMT'] },
          { attribute: 'department', operator: 'IN', values: ['EMERGENCY', 'ICU'] }
        ],
        resourceAttributes: [
          { attribute: 'dataType', operator: 'EQUALS', values: ['PATIENT_RECORD'] },
          { attribute: 'sensitivity', operator: 'IN', values: ['HIGH', 'MEDIUM', 'LOW'] }
        ],
        actionAttributes: [
          { attribute: 'operation', operator: 'IN', values: ['READ', 'update'] }
        ],
        environmentAttributes: [
          { attribute: 'emergencyStatus', operator: 'EQUALS', values: ['ACTIVE'] },
          { attribute: 'location', operator: 'IN', values: ['HOSPITAL', 'AMBULANCE'] }
        ],
        effect: PolicyEffect.PERMIT,
        obligations: [
          { type: 'LOG_ACCESS', parameters: { level: 'HIGH', notify: 'PRIVACY_OFFICER' } },
          { type: 'TIME_LIMIT', parameters: { duration: '24_HOURS' } }
        ],
        advice: [
          { type: 'REVIEW_REQUIRED', parameters: { within: '48_HOURS' } }
        ]
      },
      
      // Break-glass access policy
      {
        policyId: 'BREAK_GLASS_ACCESS',
        name: 'Break Glass Access for Critical Situations',
        description: 'Allow authorized users to override normal access controls in critical situations',
        subjectAttributes: [
          { attribute: 'breakGlassAuthorized', operator: 'EQUALS', values: ['true'] },
          { attribute: 'role', operator: 'IN', values: ['PHYSICIAN', 'NURSE_MANAGER'] }
        ],
        resourceAttributes: [
          { attribute: 'dataType', operator: 'EQUALS', values: ['PATIENT_RECORD'] }
        ],
        actionAttributes: [
          { attribute: 'operation', operator: 'IN', values: ['read', 'update'] }
        ],
        environmentAttributes: [
          { attribute: 'justificationProvided', operator: 'EQUALS', values: ['true'] }
        ],
        effect: PolicyEffect.PERMIT,
        obligations: [
          { type: 'IMMEDIATE_AUDIT', parameters: { notify: ['PRIVACY_OFFICER', 'SECURITY_OFFICER'] } },
          { type: 'JUSTIFICATION_REVIEW', parameters: { within: '24_HOURS' } },
          { type: 'SUPERVISOR_NOTIFICATION', parameters: { immediate: true } }
        ],
        advice: [
          { type: 'DOCUMENT_INCIDENT', parameters: { required: true } }
        ]
      }
    ];
  }
}
```

### Role-Based Access Control with Healthcare Specialization

```typescript
interface HealthcareRole {
  roleId: string;
  roleName: string;
  roleType: RoleType; // CLINICAL, ADMINISTRATIVE, TECHNICAL
  
  // Clinical specialization
  specialty?: MedicalSpecialty;
  licenseType?: LicenseType;
  
  // Permissions
  dataPermissions: DataPermission[];
  functionalPermissions: FunctionalPermission[];
  
  // Constraints
  timeConstraints?: TimeConstraint[];
  locationConstraints?: LocationConstraint[];
  patientConstraints?: PatientConstraint[];
}

class HealthcareRoleManager {
  async assignClinicalRole(
    userId: string, 
    roleAssignment: ClinicalRoleAssignment
  ): Promise<RoleAssignmentResult> {
    // Verify clinical credentials
    const credentialVerification = await this.verifyClinicalCredentials(
      userId, 
      roleAssignment.licenseNumber,
      roleAssignment.specialty
    );
    
    if (!credentialVerification.valid) {
      throw new InvalidCredentialsError('Clinical credentials could not be verified');
    }
    
    // Check license status
    const licenseStatus = await this.checkLicenseStatus(roleAssignment.licenseNumber);
    if (licenseStatus.status !== 'ACTIVE') {
      throw new InactiveLicenseError('Medical license is not active');
    }
    
    // Create role with appropriate permissions
    const role = await this.createClinicalRole(roleAssignment);
    
    // Assign role to user
    const assignment = await this.assignRole(userId, role.roleId, {
      assignedBy: roleAssignment.assignedBy,
      effectiveDate: roleAssignment.effectiveDate,
      expirationDate: roleAssignment.expirationDate,
      constraints: roleAssignment.constraints
    });
    
    // Log role assignment
    await this.auditLogger.logRoleAssignment({
      userId,
      roleId: role.roleId,
      assignedBy: roleAssignment.assignedBy,
      licenseVerified: true,
      credentialsVerified: true
    });
    
    return assignment;
  }
  
  async enforceRoleConstraints(
    userId: string, 
    accessRequest: AccessRequest
  ): Promise<ConstraintEnforcementResult> {
    const userRoles = await this.getUserRoles(userId);
    const violations = [];
    
    for (const role of userRoles) {
      // Check time constraints
      if (role.timeConstraints) {
        const timeViolation = this.checkTimeConstraints(role.timeConstraints, accessRequest.timestamp);
        if (timeViolation) {
          violations.push(timeViolation);
        }
      }
      
      // Check location constraints
      if (role.locationConstraints) {
        const locationViolation = this.checkLocationConstraints(role.locationConstraints, accessRequest.location);
        if (locationViolation) {
          violations.push(locationViolation);
        }
      }
      
      // Check patient constraints (e.g., assigned patients only)
      if (role.patientConstraints) {
        const patientViolation = await this.checkPatientConstraints(
          role.patientConstraints, 
          accessRequest.patientId,
          userId
        );
        if (patientViolation) {
          violations.push(patientViolation);
        }
      }
    }
    
    return {
      constraintsEnforced: true,
      violations,
      accessAllowed: violations.length === 0
    };
  }
}
```

## Threat Detection and Response

### Healthcare-Specific Threat Detection

```typescript
interface HealthcareThreatDetection {
  // Insider threat detection
  detectInsiderThreats(userActivity: UserActivity[]): Promise<InsiderThreatAlert[]>;
  
  // Data exfiltration detection
  detectDataExfiltration(dataAccess: DataAccessEvent[]): Promise<ExfiltrationAlert[]>;
  
  // Ransomware detection
  detectRansomwareActivity(systemActivity: SystemActivity[]): Promise<RansomwareAlert[]>;
  
  // Medical device security monitoring
  monitorMedicalDevices(deviceActivity: DeviceActivity[]): Promise<DeviceSecurityAlert[]>;
}

class HealthcareSecurityMonitor {
  async analyzeUserBehavior(userId: string, timeWindow: TimeWindow): Promise<BehaviorAnalysis> {
    const userActivity = await this.getUserActivity(userId, timeWindow);
    
    // Establish baseline behavior
    const baseline = await this.getUserBaseline(userId);
    
    // Detect anomalies
    const anomalies = [];
    
    // Unusual access patterns
    const accessPatternAnomaly = this.detectAccessPatternAnomalies(userActivity, baseline);
    if (accessPatternAnomaly) {
      anomalies.push(accessPatternAnomaly);
    }
    
    // Unusual data volume access
    const dataVolumeAnomaly = this.detectDataVolumeAnomalies(userActivity, baseline);
    if (dataVolumeAnomaly) {
      anomalies.push(dataVolumeAnomaly);
    }
    
    // Unusual time/location access
    const timeLocationAnomaly = this.detectTimeLocationAnomalies(userActivity, baseline);
    if (timeLocationAnomaly) {
      anomalies.push(timeLocationAnomaly);
    }
    
    // Patient relationship anomalies
    const patientRelationshipAnomaly = await this.detectPatientRelationshipAnomalies(userActivity, userId);
    if (patientRelationshipAnomaly) {
      anomalies.push(patientRelationshipAnomaly);
    }
    
    return {
      userId,
      analysisTimeWindow: timeWindow,
      baseline,
      anomalies,
      riskScore: this.calculateRiskScore(anomalies),
      recommendedActions: this.generateRecommendedActions(anomalies)
    };
  }
  
  async detectDataExfiltrationAttempts(): Promise<ExfiltrationDetectionResult> {
    const suspiciousActivities = [];
    
    // Large data downloads
    const largeDownloads = await this.detectLargeDataDownloads();
    suspiciousActivities.push(...largeDownloads);
    
    // Unusual export activities
    const unusualExports = await this.detectUnusualExportActivities();
    suspiciousActivities.push(...unusualExports);
    
    // Off-hours data access
    const offHoursAccess = await this.detectOffHoursDataAccess();
    suspiciousActivities.push(...offHoursAccess);
    
    // Multiple patient record access
    const bulkPatientAccess = await this.detectBulkPatientRecordAccess();
    suspiciousActivities.push(...bulkPatientAccess);
    
    // USB/removable media usage
    const removableMediaUsage = await this.detectRemovableMediaUsage();
    suspiciousActivities.push(...removableMediaUsage);
    
    return {
      detectionTimestamp: new Date(),
      suspiciousActivities,
      highRiskActivities: suspiciousActivities.filter(a => a.riskLevel === 'HIGH'),
      recommendedActions: this.generateExfiltrationResponseActions(suspiciousActivities)
    };
  }
}
```

### Automated Incident Response

```typescript
interface IncidentResponse {
  // Incident detection
  detectIncident(securityEvent: SecurityEvent): Promise<IncidentDetectionResult>;
  
  // Incident classification
  classifyIncident(incident: SecurityIncident): Promise<IncidentClassification>;
  
  // Automated response
  executeAutomatedResponse(incident: SecurityIncident): Promise<ResponseResult>;
  
  // Incident escalation
  escalateIncident(incident: SecurityIncident, escalationReason: string): Promise<EscalationResult>;
}

class HealthcareIncidentResponseSystem {
  async handleSecurityIncident(incident: SecurityIncident): Promise<IncidentHandlingResult> {
    // 1. Immediate containment
    const containmentResult = await this.executeImmediateContainment(incident);
    
    // 2. Impact assessment
    const impactAssessment = await this.assessIncidentImpact(incident);
    
    // 3. Evidence preservation
    const evidencePreservation = await this.preserveEvidence(incident);
    
    // 4. Notification requirements
    const notificationRequirements = await this.determineNotificationRequirements(incident);
    
    // 5. Execute notifications
    const notificationResults = await this.executeNotifications(notificationRequirements);
    
    // 6. Recovery actions
    const recoveryActions = await this.planRecoveryActions(incident, impactAssessment);
    
    // 7. Lessons learned
    const lessonsLearned = await this.captureLessonsLearned(incident);
    
    return {
      incidentId: incident.id,
      containmentResult,
      impactAssessment,
      evidencePreservation,
      notificationResults,
      recoveryActions,
      lessonsLearned,
      handlingTimestamp: new Date()
    };
  }
  
  async executeImmediateContainment(incident: SecurityIncident): Promise<ContainmentResult> {
    const containmentActions = [];
    
    switch (incident.type) {
      case IncidentType.DATA_BREACH:
        // Isolate affected systems
        const systemIsolation = await this.isolateAffectedSystems(incident.affectedSystems);
        containmentActions.push(systemIsolation);
        
        // Revoke compromised credentials
        const credentialRevocation = await this.revokeCompromisedCredentials(incident.compromisedCredentials);
        containmentActions.push(credentialRevocation);
        
        // Block suspicious network traffic
        const networkBlocking = await this.blockSuspiciousTraffic(incident.networkIndicators);
        containmentActions.push(networkBlocking);
        break;
        
      case IncidentType.RANSOMWARE:
        // Immediate network isolation
        const networkIsolation = await this.isolateFromNetwork(incident.affectedSystems);
        containmentActions.push(networkIsolation);
        
        // Stop affected services
        const serviceShutdown = await this.stopAffectedServices(incident.affectedServices);
        containmentActions.push(serviceShutdown);
        
        // Activate backup systems
        const backupActivation = await this.activateBackupSystems(incident.affectedSystems);
        containmentActions.push(backupActivation);
        break;
        
      case IncidentType.INSIDER_THREAT:
        // Suspend user access
        const accessSuspension = await this.suspendUserAccess(incident.suspiciousUserId);
        containmentActions.push(accessSuspension);
        
        // Monitor user activity
        const activityMonitoring = await this.enhanceUserMonitoring(incident.suspiciousUserId);
        containmentActions.push(activityMonitoring);
        break;
    }
    
    return {
      containmentActions,
      containmentTimestamp: new Date(),
      effectivenessScore: this.assessContainmentEffectiveness(containmentActions)
    };
  }
}
```

## Medical Device Security

### IoMT (Internet of Medical Things) Security

```typescript
interface MedicalDeviceSecurity {
  // Device authentication
  authenticateDevice(deviceId: string, deviceCredentials: DeviceCredentials): Promise<DeviceAuthResult>;
  
  // Device monitoring
  monitorDeviceActivity(deviceId: string): Promise<DeviceActivityReport>;
  
  // Firmware validation
  validateFirmware(deviceId: string, firmwareVersion: string): Promise<FirmwareValidationResult>;
  
  // Device communication security
  secureDeviceCommunication(deviceId: string, communicationParams: CommunicationParams): Promise<SecureCommunicationResult>;
}

class MedicalDeviceSecurityManager {
  async onboardMedicalDevice(device: MedicalDevice): Promise<DeviceOnboardingResult> {
    // 1. Device identity verification
    const identityVerification = await this.verifyDeviceIdentity(device);
    if (!identityVerification.verified) {
      throw new DeviceIdentityError('Device identity could not be verified');
    }
    
    // 2. Security assessment
    const securityAssessment = await this.assessDeviceSecurity(device);
    if (securityAssessment.riskLevel === RiskLevel.HIGH) {
      throw new HighRiskDeviceError('Device poses unacceptable security risk');
    }
    
    // 3. Certificate provisioning
    const deviceCertificate = await this.provisionDeviceCertificate(device);
    
    // 4. Network segmentation
    const networkSegment = await this.assignNetworkSegment(device, securityAssessment);
    
    // 5. Monitoring setup
    const monitoringSetup = await this.setupDeviceMonitoring(device);
    
    // 6. Policy enforcement
    const policyEnforcement = await this.enforceDevicePolicies(device);
    
    return {
      deviceId: device.id,
      onboardingStatus: 'SUCCESS',
      certificate: deviceCertificate,
      networkSegment,
      monitoringSetup,
      policyEnforcement,
      onboardingTimestamp: new Date()
    };
  }
  
  async monitorMedicalDeviceThreats(): Promise<DeviceThreatReport> {
    const connectedDevices = await this.getConnectedMedicalDevices();
    const threatIndicators = [];
    
    for (const device of connectedDevices) {
      // Check for unusual communication patterns
      const communicationAnalysis = await this.analyzeCommunicationPatterns(device.id);
      if (communicationAnalysis.anomalous) {
        threatIndicators.push({
          deviceId: device.id,
          threatType: 'COMMUNICATION_ANOMALY',
          severity: communicationAnalysis.severity,
          details: communicationAnalysis.details
        });
      }
      
      // Check for firmware tampering
      const firmwareIntegrity = await this.checkFirmwareIntegrity(device.id);
      if (!firmwareIntegrity.intact) {
        threatIndicators.push({
          deviceId: device.id,
          threatType: 'FIRMWARE_TAMPERING',
          severity: 'HIGH',
          details: firmwareIntegrity.violations
        });
      }
      
      // Check for unauthorized access attempts
      const accessAttempts = await this.analyzeDeviceAccessAttempts(device.id);
      if (accessAttempts.suspicious.length > 0) {
        threatIndicators.push({
          deviceId: device.id,
          threatType: 'UNAUTHORIZED_ACCESS',
          severity: 'MEDIUM',
          details: accessAttempts.suspicious
        });
      }
    }
    
    return {
      reportTimestamp: new Date(),
      devicesMonitored: connectedDevices.length,
      threatIndicators,
      highSeverityThreats: threatIndicators.filter(t => t.severity === 'HIGH').length,
      recommendedActions: this.generateDeviceThreatActions(threatIndicators)
    };
  }
}
```

## Security Monitoring and Analytics

### Healthcare Security Analytics

```typescript
interface SecurityAnalytics {
  // User behavior analytics
  analyzeUserBehavior(timeRange: TimeRange): Promise<UserBehaviorReport>;
  
  // Data access analytics
  analyzeDataAccess(timeRange: TimeRange): Promise<DataAccessReport>;
  
  // Security metrics
  generateSecurityMetrics(timeRange: TimeRange): Promise<SecurityMetricsReport>;
  
  // Threat intelligence
  incorporateThreatIntelligence(threatFeeds: ThreatFeed[]): Promise<ThreatIntelligenceReport>;
}

class HealthcareSecurityAnalytics {
  async generateComprehensiveSecurityReport(reportPeriod: ReportPeriod): Promise<SecurityReport> {
    const [
      userBehaviorAnalysis,
      dataAccessAnalysis,
      threatDetectionSummary,
      incidentSummary,
      complianceAssessment,
      vulnerabilityAssessment
    ] = await Promise.all([
      this.analyzeUserBehavior(reportPeriod),
      this.analyzeDataAccess(reportPeriod),
      this.summarizeThreatDetection(reportPeriod),
      this.summarizeIncidents(reportPeriod),
      this.assessCompliance(reportPeriod),
      this.assessVulnerabilities(reportPeriod)
    ]);
    
    const overallSecurityPosture = this.calculateSecurityPosture([
      userBehaviorAnalysis,
      dataAccessAnalysis,
      threatDetectionSummary,
      incidentSummary,
      complianceAssessment,
      vulnerabilityAssessment
    ]);
    
    return {
      reportPeriod,
      executiveSummary: this.generateExecutiveSummary(overallSecurityPosture),
      userBehaviorAnalysis,
      dataAccessAnalysis,
      threatDetectionSummary,
      incidentSummary,
      complianceAssessment,
      vulnerabilityAssessment,
      overallSecurityPosture,
      recommendations: this.generateSecurityRecommendations(overallSecurityPosture),
      generatedAt: new Date()
    };
  }
  
  async detectSecurityTrends(historicalData: SecurityData[]): Promise<SecurityTrendAnalysis> {
    const trends = {
      userBehaviorTrends: this.analyzeUserBehaviorTrends(historicalData),
      threatTrends: this.analyzeThreatTrends(historicalData),
      incidentTrends: this.analyzeIncidentTrends(historicalData),
      complianceTrends: this.analyzeComplianceTrends(historicalData)
    };
    
    const predictions = await this.generateSecurityPredictions(trends);
    
    return {
      trends,
      predictions,
      riskFactors: this.identifyEmergingRiskFactors(trends),
      recommendations: this.generateTrendBasedRecommendations(trends, predictions)
    };
  }
}
```

## Testing and Validation

### Security Testing Framework

```typescript
describe('Healthcare Security', () => {
  describe('Encryption and Key Management', () => {
    test('should encrypt PHI fields with patient-specific keys', async () => {
      const patientId = 'patient-123';
      const sensitiveData = 'John Doe SSN: 123-45-6789';
      
      const encryptedField = await healthcareEncryption.encryptPHIField(
        sensitiveData,
        PHIFieldType.SSN,
        patientId
      );
      
      expect(encryptedField.encrypted).toBe(true);
      expect(encryptedField.algorithm).toBe('AES-256-GCM');
      expect(encryptedField.patientId).toBe(patientId);
      
      // Verify data is actually encrypted
      expect(encryptedField.value).not.toContain('123-45-6789');
    });
    
    test('should rotate encryption keys according to schedule', async () => {
      const rotationResult = await keyManager.rotateEncryptionKeys();
      
      expect(rotationResult.keysRotated).toBeGreaterThan(0);
      expect(rotationResult.failures).toBe(0);
      
      // Verify old keys are marked as rotated
      const rotatedKeys = rotationResult.results.filter(r => r.status === 'SUCCESS');
      for (const result of rotatedKeys) {
        const keyMetadata = await keyManager.getKeyMetadata(result.oldKeyId);
        expect(keyMetadata.status).toBe('ROTATED');
      }
    });
  });
  
  describe('Access Control', () => {
    test('should enforce ABAC policies correctly', async () => {
      const emergencyAccessRequest = {
        userId: 'doctor-123',
        resourceId: 'patient-456',
        action: 'read',
        context: {
          role: 'PHYSICIAN',
          department: 'EMERGENCY',
          emergencyStatus: 'ACTIVE',
          location: 'HOSPITAL'
        }
      };
      
      const decision = await abacEngine.evaluateAccess(emergencyAccessRequest);
      
      expect(decision.decision).toBe('PERMIT');
      expect(decision.obligations).toContainEqual(
        expect.objectContaining({ type: 'LOG_ACCESS' })
      );
    });
    
    test('should detect and prevent unauthorized access', async () => {
      const unauthorizedRequest = {
        userId: 'intern-789',
        resourceId: 'patient-456',
        action: 'delete',
        context: {
          role: 'INTERN',
          department: 'GENERAL',
          location: 'HOSPITAL'
        }
      };
      
      const decision = await abacEngine.evaluateAccess(unauthorizedRequest);
      
      expect(decision.decision).toBe('DENY');
    });
  });
  
  describe('Threat Detection', () => {
    test('should detect insider threat patterns', async () => {
      const suspiciousActivity = createSuspiciousUserActivity();
      
      const threats = await threatDetection.detectInsiderThreats([suspiciousActivity]);
      
      expect(threats).toHaveLength(1);
      expect(threats[0].threatType).toBe('INSIDER_THREAT');
      expect(threats[0].riskLevel).toBe('HIGH');
    });
    
    test('should detect data exfiltration attempts', async () => {
      const exfiltrationActivity = createDataExfiltrationActivity();
      
      const alerts = await threatDetection.detectDataExfiltration([exfiltrationActivity]);
      
      expect(alerts).toHaveLength(1);
      expect(alerts[0].alertType).toBe('DATA_EXFILTRATION');
    });
  });
  
  describe('Medical Device Security', () => {
    test('should securely onboard medical devices', async () => {
      const medicalDevice = createTestMedicalDevice();
      
      const onboardingResult = await deviceSecurity.onboardMedicalDevice(medicalDevice);
      
      expect(onboardingResult.onboardingStatus).toBe('SUCCESS');
      expect(onboardingResult.certificate).toBeDefined();
      expect(onboardingResult.networkSegment).toBeDefined();
    });
    
    test('should detect device security threats', async () => {
      const threatReport = await deviceSecurity.monitorMedicalDeviceThreats();
      
      expect(threatReport.devicesMonitored).toBeGreaterThan(0);
      expect(threatReport.threatIndicators).toBeDefined();
    });
  });
});
```

This comprehensive healthcare security template provides the foundation for building secure healthcare applications that protect PHI while maintaining operational efficiency and regulatory compliance. The template emphasizes defense-in-depth strategies, continuous monitoring, and automated threat response capabilities specifically tailored for healthcare environments.