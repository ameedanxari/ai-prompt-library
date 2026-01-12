# Healthcare Application Development Guide

## Purpose

This guide provides comprehensive patterns for building HIPAA-compliant healthcare applications using the AI Prompt Library v2 templates. It covers template selection, composition strategies, and implementation patterns with emphasis on regulatory compliance, patient privacy, and data security.

## Quick Start

### Essential Templates for Healthcare Apps

| Feature Area | Primary Templates | Supporting Templates |
|--------------|-------------------|---------------------|
| Patient Data | `healthcare/patient-data-management.md` | `healthcare/medical-records.md` |
| Compliance | `healthcare/hipaa-compliance.md` | `healthcare/healthcare-security.md` |
| Telemedicine | `healthcare/telemedicine.md` | `healthcare/appointment-scheduling.md` |
| Prescriptions | `healthcare/prescription-management.md` | `healthcare/wearable-integration.md` |
| Security | `security/data-encryption.md` | `enterprise-saas/audit-trails.md` |

## Template Composition Patterns

### Pattern 1: Patient Portal

For patient-facing healthcare applications:

```markdown
# Core Templates
1. healthcare/patient-data-management.md  # Patient records
2. healthcare/appointment-scheduling.md   # Scheduling
3. healthcare/medical-records.md          # Health records access
4. healthcare/prescription-management.md  # Rx management

# Compliance & Security
- healthcare/hipaa-compliance.md          # HIPAA controls
- healthcare/healthcare-security.md       # Security measures
- security/multi-factor-auth.md           # Strong authentication
- enterprise-saas/audit-trails.md         # Access logging

# Communication
- notifications/notification-channels.md  # Appointment reminders
- social/real-time-messaging.md           # Secure messaging
```

### Pattern 2: Telemedicine Platform

For virtual care applications:

```markdown
# Core Templates
1. healthcare/telemedicine.md             # Video consultations
2. healthcare/appointment-scheduling.md   # Visit scheduling
3. healthcare/patient-data-management.md  # Patient records
4. healthcare/prescription-management.md  # E-prescribing

# Real-Time Features
- real-time-communication/video-conferencing.md # Video calls
- real-time-communication/presence-systems.md   # Provider availability
- social/message-encryption.md            # Secure messaging

# Compliance
- healthcare/hipaa-compliance.md          # HIPAA compliance
- healthcare/healthcare-security.md       # Security controls
```

### Pattern 3: Clinical Practice Management

For healthcare provider applications:

```markdown
# Core Templates
1. healthcare/patient-data-management.md  # Patient management
2. healthcare/medical-records.md          # EHR integration
3. healthcare/appointment-scheduling.md   # Scheduling
4. healthcare/prescription-management.md  # Prescriptions

# Practice Operations
- enterprise-saas/workflow-automation.md  # Clinical workflows
- commerce/payment-processing.md          # Billing
- analytics/business-metrics.md           # Practice analytics

# Compliance
- healthcare/hipaa-compliance.md          # HIPAA compliance
- fintech/financial-reporting.md          # Billing compliance
```

## Implementation Examples

### Example 1: HIPAA-Compliant Patient Data Access

```typescript
// From healthcare/hipaa-compliance.md and patient-data-management.md patterns

interface PHIAccessRequest {
  requesterId: string;
  requesterRole: HealthcareRole;
  patientId: string;
  dataTypes: PHIDataType[];
  purpose: AccessPurpose;
  minimumNecessary: boolean;
}

interface PHIAccessResult {
  granted: boolean;
  data?: PatientData;
  accessId: string;
  restrictions: DataRestriction[];
  auditEntry: AuditEntry;
}

class HIPAACompliantDataService {
  async requestPatientData(request: PHIAccessRequest): Promise<PHIAccessResult> {
    // Verify requester identity and role
    const requester = await this.verifyRequester(request.requesterId);
    
    // Check treatment relationship
    const hasRelationship = await this.verifyTreatmentRelationship(
      request.requesterId,
      request.patientId
    );
    
    // Apply minimum necessary standard
    const allowedDataTypes = this.applyMinimumNecessary(
      request.dataTypes,
      request.requesterRole,
      request.purpose
    );
    
    // Check patient restrictions
    const restrictions = await this.getPatientRestrictions(request.patientId);
    const filteredDataTypes = this.applyRestrictions(allowedDataTypes, restrictions);
    
    // Create audit entry BEFORE accessing data
    const auditEntry = await this.createAuditEntry({
      requesterId: request.requesterId,
      patientId: request.patientId,
      dataTypes: filteredDataTypes,
      purpose: request.purpose,
      timestamp: new Date()
    });
    
    // Retrieve data
    const data = await this.retrievePatientData(
      request.patientId,
      filteredDataTypes
    );
    
    // Update audit with access result
    await this.updateAuditEntry(auditEntry.id, { status: 'completed' });
    
    return {
      granted: true,
      data,
      accessId: auditEntry.id,
      restrictions,
      auditEntry
    };
  }
  
  private applyMinimumNecessary(
    requestedTypes: PHIDataType[],
    role: HealthcareRole,
    purpose: AccessPurpose
  ): PHIDataType[] {
    // Define minimum necessary data for each role/purpose combination
    const minimumNecessaryMatrix: Record<HealthcareRole, Record<AccessPurpose, PHIDataType[]>> = {
      physician: {
        treatment: ['demographics', 'medical_history', 'medications', 'allergies', 'vitals', 'lab_results'],
        billing: ['demographics', 'insurance'],
        research: [] // Requires separate authorization
      },
      nurse: {
        treatment: ['demographics', 'medications', 'allergies', 'vitals'],
        billing: [],
        research: []
      },
      billing_staff: {
        treatment: [],
        billing: ['demographics', 'insurance', 'procedures'],
        research: []
      }
    };
    
    const allowed = minimumNecessaryMatrix[role]?.[purpose] || [];
    return requestedTypes.filter(type => allowed.includes(type));
  }
}
```

### Example 2: Secure Telemedicine Session

```typescript
// From healthcare/telemedicine.md patterns

interface TelemedicineSession {
  sessionId: string;
  patientId: string;
  providerId: string;
  scheduledTime: Date;
  status: SessionStatus;
  encryptionKey: string;
  recordingConsent: boolean;
}

class TelemedicineService {
  async initiateSession(
    appointmentId: string
  ): Promise<TelemedicineSessionResult> {
    const appointment = await this.appointmentService.get(appointmentId);
    
    // Verify both parties are authenticated
    const [patientAuth, providerAuth] = await Promise.all([
      this.verifyPatientIdentity(appointment.patientId),
      this.verifyProviderCredentials(appointment.providerId)
    ]);
    
    if (!patientAuth.verified || !providerAuth.verified) {
      throw new AuthenticationError('Identity verification failed');
    }
    
    // Generate end-to-end encryption keys
    const encryptionKeys = await this.generateSessionKeys();
    
    // Create secure session
    const session = await this.sessionRepository.create({
      appointmentId,
      patientId: appointment.patientId,
      providerId: appointment.providerId,
      encryptionKeyId: encryptionKeys.keyId,
      status: 'waiting',
      createdAt: new Date()
    });
    
    // Create audit entry
    await this.auditService.logSessionStart(session);
    
    // Generate secure room tokens
    const [patientToken, providerToken] = await Promise.all([
      this.generateRoomToken(session.id, 'patient', encryptionKeys),
      this.generateRoomToken(session.id, 'provider', encryptionKeys)
    ]);
    
    return {
      sessionId: session.id,
      patientToken,
      providerToken,
      roomUrl: this.generateRoomUrl(session.id)
    };
  }
  
  async endSession(sessionId: string, summary: SessionSummary): Promise<void> {
    const session = await this.sessionRepository.get(sessionId);
    
    // Create clinical note
    if (summary.clinicalNotes) {
      await this.createClinicalNote(session, summary.clinicalNotes);
    }
    
    // Process prescriptions if any
    if (summary.prescriptions?.length > 0) {
      await this.prescriptionService.createPrescriptions(
        session.patientId,
        session.providerId,
        summary.prescriptions
      );
    }
    
    // Schedule follow-up if needed
    if (summary.followUpRequired) {
      await this.appointmentService.suggestFollowUp(
        session.patientId,
        session.providerId,
        summary.followUpTimeframe
      );
    }
    
    // Update session status
    await this.sessionRepository.update(sessionId, {
      status: 'completed',
      endedAt: new Date(),
      duration: this.calculateDuration(session.createdAt)
    });
    
    // Audit session completion
    await this.auditService.logSessionEnd(session, summary);
    
    // Securely delete encryption keys
    await this.deleteSessionKeys(session.encryptionKeyId);
  }
}
```

### Example 3: E-Prescribing with Drug Interaction Checking

```typescript
// From healthcare/prescription-management.md patterns

interface Prescription {
  id: string;
  patientId: string;
  prescriberId: string;
  medication: Medication;
  dosage: Dosage;
  quantity: number;
  refills: number;
  instructions: string;
  pharmacy: Pharmacy;
  status: PrescriptionStatus;
}

class PrescriptionService {
  async createPrescription(
    request: PrescriptionRequest
  ): Promise<PrescriptionResult> {
    // Verify prescriber credentials and DEA number
    const prescriber = await this.verifyPrescriber(request.prescriberId);
    
    // Check if controlled substance
    const isControlled = await this.checkControlledSubstance(request.medication);
    if (isControlled && !prescriber.deaNumber) {
      throw new UnauthorizedPrescriptionError('DEA number required for controlled substances');
    }
    
    // Get patient's current medications
    const currentMedications = await this.getCurrentMedications(request.patientId);
    
    // Check drug interactions
    const interactions = await this.checkDrugInteractions(
      request.medication,
      currentMedications
    );
    
    if (interactions.severe.length > 0) {
      return {
        success: false,
        blocked: true,
        reason: 'severe_interaction',
        interactions: interactions.severe
      };
    }
    
    // Check allergies
    const allergies = await this.checkAllergies(
      request.patientId,
      request.medication
    );
    
    if (allergies.length > 0) {
      return {
        success: false,
        blocked: true,
        reason: 'allergy_alert',
        allergies
      };
    }
    
    // Create prescription
    const prescription = await this.prescriptionRepository.create({
      ...request,
      status: 'pending',
      createdAt: new Date(),
      interactions: interactions.moderate // Include warnings
    });
    
    // Send to pharmacy via NCPDP SCRIPT
    await this.sendToPharmacy(prescription);
    
    // Audit prescription creation
    await this.auditService.logPrescription(prescription);
    
    // Notify patient
    await this.notificationService.sendPrescriptionNotification(
      request.patientId,
      prescription
    );
    
    return {
      success: true,
      prescription,
      warnings: interactions.moderate
    };
  }
  
  private async checkDrugInteractions(
    newMedication: Medication,
    currentMedications: Medication[]
  ): Promise<DrugInteractionResult> {
    const interactions = {
      severe: [] as DrugInteraction[],
      moderate: [] as DrugInteraction[],
      minor: [] as DrugInteraction[]
    };
    
    for (const current of currentMedications) {
      const interaction = await this.drugInteractionService.check(
        newMedication.rxcui,
        current.rxcui
      );
      
      if (interaction) {
        interactions[interaction.severity].push({
          drug1: newMedication.name,
          drug2: current.name,
          description: interaction.description,
          severity: interaction.severity,
          recommendation: interaction.recommendation
        });
      }
    }
    
    return interactions;
  }
}
```

## HIPAA Compliance Implementation

### Administrative Safeguards

```typescript
// From healthcare/hipaa-compliance.md patterns

class HIPAAAdministrativeSafeguards {
  // Security Officer designation
  async designateSecurityOfficer(userId: string): Promise<void> {
    await this.roleService.assignRole(userId, 'HIPAA_SECURITY_OFFICER');
    await this.auditService.logSecurityOfficerDesignation(userId);
  }
  
  // Workforce training tracking
  async trackTrainingCompletion(
    employeeId: string,
    trainingModule: string
  ): Promise<TrainingRecord> {
    const record = await this.trainingRepository.create({
      employeeId,
      module: trainingModule,
      completedAt: new Date(),
      expiresAt: this.calculateExpirationDate(trainingModule)
    });
    
    // Check if all required training is complete
    const allComplete = await this.checkAllTrainingComplete(employeeId);
    if (allComplete) {
      await this.grantSystemAccess(employeeId);
    }
    
    return record;
  }
  
  // Access management
  async conductAccessReview(): Promise<AccessReviewReport> {
    const users = await this.userService.getAllActiveUsers();
    const findings: AccessReviewFinding[] = [];
    
    for (const user of users) {
      // Check if access is still appropriate
      const accessAppropriate = await this.verifyAccessAppropriate(user);
      
      if (!accessAppropriate.appropriate) {
        findings.push({
          userId: user.id,
          issue: accessAppropriate.reason,
          recommendation: accessAppropriate.recommendation
        });
      }
      
      // Check for terminated employees with active access
      if (user.employmentStatus === 'terminated' && user.systemAccess) {
        await this.revokeAccess(user.id, 'employment_terminated');
        findings.push({
          userId: user.id,
          issue: 'terminated_employee_with_access',
          action: 'access_revoked'
        });
      }
    }
    
    return {
      reviewDate: new Date(),
      usersReviewed: users.length,
      findings,
      nextReviewDate: this.calculateNextReviewDate()
    };
  }
}
```

### Technical Safeguards

```typescript
// From healthcare/healthcare-security.md patterns

class HIPAATechnicalSafeguards {
  // Unique user identification
  async createUniqueUserId(userInfo: UserInfo): Promise<string> {
    const uniqueId = await this.generateUniqueId();
    
    await this.userRepository.create({
      id: uniqueId,
      ...userInfo,
      createdAt: new Date()
    });
    
    await this.auditService.logUserCreation(uniqueId);
    
    return uniqueId;
  }
  
  // Automatic logoff
  async enforceAutomaticLogoff(): Promise<void> {
    const activeSessions = await this.sessionService.getActiveSessions();
    
    for (const session of activeSessions) {
      const inactivityMinutes = this.calculateInactivityMinutes(session.lastActivity);
      
      if (inactivityMinutes > this.maxInactivityMinutes) {
        await this.sessionService.terminate(session.id);
        await this.auditService.logAutomaticLogoff(session.userId, inactivityMinutes);
      }
    }
  }
  
  // Encryption
  async encryptPHI(data: PHIData): Promise<EncryptedPHI> {
    // Use AES-256 encryption
    const encryptedData = await this.encryptionService.encrypt(
      JSON.stringify(data),
      this.currentEncryptionKey
    );
    
    return {
      encryptedPayload: encryptedData,
      keyId: this.currentKeyId,
      algorithm: 'AES-256-GCM',
      encryptedAt: new Date()
    };
  }
  
  // Audit controls
  async logPHIAccess(accessEvent: PHIAccessEvent): Promise<void> {
    await this.auditRepository.create({
      timestamp: new Date(),
      userId: accessEvent.userId,
      patientId: accessEvent.patientId,
      action: accessEvent.action,
      dataTypes: accessEvent.dataTypes,
      ipAddress: accessEvent.ipAddress,
      userAgent: accessEvent.userAgent,
      outcome: accessEvent.outcome
    });
  }
}
```

### Breach Notification

```typescript
// From healthcare/hipaa-compliance.md patterns

class BreachNotificationService {
  async assessPotentialBreach(
    incident: SecurityIncident
  ): Promise<BreachAssessment> {
    // Determine if PHI was involved
    const phiInvolved = await this.checkPHIInvolvement(incident);
    
    if (!phiInvolved) {
      return { isBreach: false, reason: 'no_phi_involved' };
    }
    
    // Assess risk using four-factor analysis
    const riskAssessment = await this.performRiskAssessment(incident);
    
    // Determine if notification is required
    const notificationRequired = riskAssessment.overallRisk !== 'low';
    
    return {
      isBreach: notificationRequired,
      riskLevel: riskAssessment.overallRisk,
      affectedPatients: riskAssessment.affectedPatients,
      phiTypes: riskAssessment.phiTypes,
      notificationDeadline: this.calculateNotificationDeadline(),
      requiredNotifications: this.determineRequiredNotifications(riskAssessment)
    };
  }
  
  async executeBreachNotification(
    breach: ConfirmedBreach
  ): Promise<NotificationResult> {
    const notifications: NotificationRecord[] = [];
    
    // Notify affected individuals (within 60 days)
    for (const patientId of breach.affectedPatients) {
      const notification = await this.notifyPatient(patientId, breach);
      notifications.push(notification);
    }
    
    // Notify HHS
    const hhsNotification = await this.notifyHHS(breach);
    notifications.push(hhsNotification);
    
    // Notify media if > 500 patients
    if (breach.affectedPatients.length > 500) {
      const mediaNotification = await this.notifyMedia(breach);
      notifications.push(mediaNotification);
    }
    
    // Document all notifications
    await this.documentNotifications(breach.id, notifications);
    
    return {
      breachId: breach.id,
      notificationsSent: notifications.length,
      complianceStatus: this.assessComplianceStatus(breach, notifications)
    };
  }
}
```

## Security Best Practices

### Access Control Matrix

```typescript
// Role-based access control for healthcare
const healthcareAccessMatrix: AccessMatrix = {
  physician: {
    patient_demographics: ['read', 'write'],
    medical_history: ['read', 'write'],
    medications: ['read', 'write'],
    lab_results: ['read'],
    billing: ['read']
  },
  nurse: {
    patient_demographics: ['read'],
    medical_history: ['read'],
    medications: ['read', 'write'],
    lab_results: ['read'],
    billing: []
  },
  billing_staff: {
    patient_demographics: ['read'],
    medical_history: [],
    medications: [],
    lab_results: [],
    billing: ['read', 'write']
  },
  patient: {
    patient_demographics: ['read', 'write'], // Own data only
    medical_history: ['read'],
    medications: ['read'],
    lab_results: ['read'],
    billing: ['read']
  }
};
```

### Data Encryption Standards

```markdown
# Required Encryption Standards

## Data at Rest
- Algorithm: AES-256
- Key Management: HSM or cloud KMS
- Key Rotation: Every 90 days

## Data in Transit
- Protocol: TLS 1.3
- Certificate: Valid CA-signed certificate
- Perfect Forward Secrecy: Required

## Database Encryption
- Transparent Data Encryption (TDE)
- Column-level encryption for sensitive fields
- Encrypted backups
```

## Testing Strategy

### Unit Tests

```typescript
describe('HIPAACompliantDataService', () => {
  it('should apply minimum necessary standard', async () => {
    const result = await dataService.requestPatientData({
      requesterId: 'nurse-123',
      requesterRole: 'nurse',
      patientId: 'patient-456',
      dataTypes: ['demographics', 'medical_history', 'billing'],
      purpose: 'treatment'
    });
    
    // Nurses should not get billing data for treatment
    expect(result.data).not.toHaveProperty('billing');
    expect(result.data).toHaveProperty('demographics');
    expect(result.data).toHaveProperty('medications');
  });
  
  it('should create audit entry for all PHI access', async () => {
    await dataService.requestPatientData({
      requesterId: 'doctor-123',
      patientId: 'patient-456',
      dataTypes: ['medical_history'],
      purpose: 'treatment'
    });
    
    const auditEntries = await auditService.getEntries({
      patientId: 'patient-456'
    });
    
    expect(auditEntries.length).toBeGreaterThan(0);
    expect(auditEntries[0].requesterId).toBe('doctor-123');
  });
});
```

### Compliance Tests

```typescript
describe('HIPAA Compliance', () => {
  it('should enforce automatic logoff after inactivity', async () => {
    const session = await authService.login(credentials);
    
    // Simulate inactivity
    await advanceTime(31 * 60 * 1000); // 31 minutes
    
    await expect(
      dataService.requestPatientData({ sessionId: session.id, ... })
    ).rejects.toThrow('Session expired');
  });
  
  it('should encrypt all PHI at rest', async () => {
    const patient = await patientService.create(patientData);
    
    // Check database directly
    const rawRecord = await database.query(
      'SELECT * FROM patients WHERE id = ?',
      [patient.id]
    );
    
    // SSN should be encrypted
    expect(rawRecord.ssn).not.toBe(patientData.ssn);
    expect(rawRecord.ssn).toMatch(/^encrypted:/);
  });
});
```

## Common Pitfalls

1. **Insufficient audit logging**: Log ALL PHI access, not just modifications
2. **Overly broad access**: Always apply minimum necessary standard
3. **Missing BAAs**: Ensure all vendors handling PHI have signed BAAs
4. **Inadequate training**: Track and enforce annual HIPAA training
5. **Weak authentication**: Require MFA for all PHI access

## Related Templates

- `security/data-encryption.md` - Encryption patterns
- `enterprise-saas/audit-trails.md` - Audit logging
- `notifications/notification-compliance.md` - HIPAA-compliant notifications
- `integration/api-management.md` - HL7 FHIR integration
- `analytics/privacy-analytics.md` - De-identified analytics

## Next Steps

1. Conduct HIPAA risk assessment
2. Implement administrative safeguards (policies, training)
3. Deploy technical safeguards (encryption, access controls, audit logs)
4. Establish breach notification procedures
5. Execute Business Associate Agreements with vendors
6. Schedule regular compliance audits
