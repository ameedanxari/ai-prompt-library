# Prescription Management Template

## Purpose
This template provides comprehensive patterns for electronic prescription management systems, covering e-prescribing workflows, pharmacy integration, medication management, drug interaction checking, and regulatory compliance.

## Instructions

1. **Setup E-Prescribing Infrastructure**: Configure electronic prescription transmission system
2. **Integrate Drug Database**: Connect to medication databases and drug interaction systems
3. **Configure Pharmacy Network**: Set up pharmacy integration and communication protocols
4. **Implement Clinical Decision Support**: Deploy drug interaction and allergy checking
5. **Setup Compliance Framework**: Ensure DEA, FDA, and state regulatory compliance
6. **Configure Monitoring**: Implement prescription tracking and audit systems
7. **Deploy Security**: Ensure secure prescription transmission and storage

## Examples

### Example 1: Basic E-Prescription Creation
```typescript
interface Prescription {
  prescriptionId: string;
  patientId: string;
  providerId: string;
  medication: {
    name: string;
    strength: string;
    dosageForm: string;
    ndc: string; // National Drug Code
  };
  directions: string;
  quantity: number;
  refills: number;
  daysSupply: number;
  substitutionAllowed: boolean;
}

const prescription = await createPrescription({
  patientId: "patient-123",
  providerId: "doctor-456",
  medication: {
    name: "Lisinopril",
    strength: "10mg",
    dosageForm: "tablet",
    ndc: "12345-678-90"
  },
  directions: "Take one tablet by mouth daily",
  quantity: 30,
  refills: 5,
  daysSupply: 30
});
```

### Example 2: Drug Interaction Checking
```typescript
interface DrugInteractionCheck {
  patientId: string;
  currentMedications: Medication[];
  newMedication: Medication;
  allergies: Allergy[];
  medicalConditions: MedicalCondition[];
}

const interactionCheck = await checkDrugInteractions({
  patientId: "patient-123",
  currentMedications: [
    { name: "Warfarin", strength: "5mg" },
    { name: "Metformin", strength: "500mg" }
  ],
  newMedication: { name: "Aspirin", strength: "81mg" },
  allergies: [{ allergen: "Penicillin", severity: "severe" }]
});
```

### Example 3: Pharmacy Integration
```typescript
interface PharmacyTransmission {
  prescriptionId: string;
  pharmacyId: string;
  transmissionMethod: 'NCPDP' | 'HL7' | 'FHIR';
  urgency: 'routine' | 'urgent' | 'stat';
  patientPickupPreference: string;
}

const transmission = await transmitToPharmacy({
  prescriptionId: "rx-789",
  pharmacyId: "pharmacy-456",
  transmissionMethod: "NCPDP",
  urgency: "routine",
  patientPickupPreference: "ready_for_pickup_notification"
});
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| drugDatabase | Drug database provider (FirstDataBank, Wolters Kluwer) | string | Yes | N/A |
| transmissionProtocol | Prescription transmission protocol | string | Yes | "NCPDP" |
| interactionChecking | Enable drug interaction checking | boolean | Yes | true |
| allergyChecking | Enable allergy checking | boolean | Yes | true |
| controlledSubstances | Enable controlled substance prescribing | boolean | No | false |
| electronicSignature | Electronic signature method | string | Yes | "PKI" |
| auditRetention | Audit log retention period (days) | number | Yes | 2555 |
| pharmacyNetwork | Supported pharmacy networks | string[] | Yes | N/A |

## Expected Output

This template will produce:
- **E-Prescribing System**: Electronic prescription creation and transmission
- **Drug Interaction Engine**: Real-time drug interaction and allergy checking
- **Pharmacy Integration**: Seamless pharmacy network connectivity
- **Prescription Tracking**: Real-time prescription status monitoring
- **Clinical Decision Support**: Medication guidance and alerts
- **Compliance Framework**: DEA and regulatory compliance tools
- **Audit System**: Comprehensive prescription audit trails
- **Patient Portal**: Prescription history and refill management

## Context
Use this template when building prescription management systems that need to handle electronic prescribing, pharmacy integration, medication tracking, clinical decision support, and compliance with DEA, FDA, and state pharmacy regulations.

## E-Prescribing Architecture

### Core Prescription Management Components

```typescript
interface PrescriptionManagementSystem {
  // E-prescribing service
  ePrescribing: EPrescribingService;
  
  // Medication management
  medicationManagement: MedicationManagementService;
  
  // Pharmacy integration
  pharmacyIntegration: PharmacyIntegrationService;
  
  // Clinical decision support
  clinicalDecisionSupport: ClinicalDecisionSupportService;
  
  // Compliance management
  complianceManagement: ComplianceManagementService;
  
  // Prescription monitoring
  prescriptionMonitoring: PrescriptionMonitoringService;
}

interface EPrescribingService {
  // Prescription creation
  createPrescription(prescriptionData: PrescriptionData): Promise<Prescription>;
  validatePrescription(prescription: Prescription): Promise<ValidationResult>;
  
  // Electronic transmission
  transmitPrescription(prescriptionId: string, pharmacyId: string): Promise<TransmissionResult>;
  cancelPrescription(prescriptionId: string, cancellationReason: string): Promise<CancellationResult>;
  
  // Prescription management
  modifyPrescription(prescriptionId: string, modifications: PrescriptionModification): Promise<ModificationResult>;
  renewPrescription(prescriptionId: string, renewalData: RenewalData): Promise<RenewalResult>;
  
  // Status tracking
  trackPrescriptionStatus(prescriptionId: string): Promise<PrescriptionStatus>;
  getPrescriptionHistory(patientId: string, dateRange?: DateRange): Promise<PrescriptionHistory>;
}
```

### Electronic Prescribing Workflow

```typescript
class ElectronicPrescribingManager {
  async createElectronicPrescription(
    prescriptionData: PrescriptionData
  ): Promise<ElectronicPrescription> {
    // Validate prescriber authorization
    const prescriberValidation = await this.validatePrescriberAuthorization(
      prescriptionData.prescriberId
    );
    
    if (!prescriberValidation.authorized) {
      throw new UnauthorizedPrescriberError(prescriberValidation.reason);
    }
    
    // Validate patient information
    const patientValidation = await this.validatePatientInformation(
      prescriptionData.patientId
    );
    
    if (!patientValidation.valid) {
      throw new InvalidPatientError(patientValidation.errors);
    }
    
    // Validate medication and dosage
    const medicationValidation = await this.validateMedicationData(
      prescriptionData.medication
    );
    
    if (!medicationValidation.valid) {
      throw new InvalidMedicationError(medicationValidation.errors);
    }
    
    // Check for drug interactions
    const interactionCheck = await this.checkDrugInteractions(
      prescriptionData.patientId,
      prescriptionData.medication
    );
    
    // Check for allergies
    const allergyCheck = await this.checkPatientAllergies(
      prescriptionData.patientId,
      prescriptionData.medication
    );
    
    // Apply clinical decision support rules
    const cdsAlerts = await this.applyClinicalDecisionSupport(
      prescriptionData
    );
    
    // Create prescription with all validations
    const prescription = {
      prescriptionId: this.generatePrescriptionId(),
      patientId: prescriptionData.patientId,
      prescriberId: prescriptionData.prescriberId,
      medication: {
        ndc: prescriptionData.medication.ndc,
        name: prescriptionData.medication.name,
        strength: prescriptionData.medication.strength,
        dosageForm: prescriptionData.medication.dosageForm,
        rxNormCode: prescriptionData.medication.rxNormCode
      },
      dosageInstructions: prescriptionData.dosageInstructions,
      quantity: prescriptionData.quantity,
      refills: prescriptionData.refills,
      daysSupply: prescriptionData.daysSupply,
      substitutionAllowed: prescriptionData.substitutionAllowed,
      createdAt: new Date(),
      status: PrescriptionStatus.CREATED,
      
      // Clinical safety information
      interactionAlerts: interactionCheck.interactions,
      allergyAlerts: allergyCheck.allergies,
      cdsAlerts: cdsAlerts,
      
      // Regulatory information
      dea: prescriberValidation.deaNumber,
      npi: prescriberValidation.npiNumber,
      
      // Digital signature
      digitalSignature: await this.generateDigitalSignature(prescriptionData)
    };
    
    // Store prescription
    await this.prescriptionRepository.save(prescription);
    
    // Log prescription creation
    await this.auditLogger.logPrescriptionCreation(prescription);
    
    return prescription;
  }
  
  async transmitPrescriptionToPharmacy(
    prescriptionId: string,
    pharmacyId: string
  ): Promise<TransmissionResult> {
    // Get prescription details
    const prescription = await this.prescriptionRepository.findById(prescriptionId);
    if (!prescription) {
      throw new PrescriptionNotFoundError(prescriptionId);
    }
    
    // Validate prescription is ready for transmission
    const transmissionValidation = await this.validatePrescriptionForTransmission(
      prescription
    );
    
    if (!transmissionValidation.valid) {
      throw new TransmissionValidationError(transmissionValidation.errors);
    }
    
    // Get pharmacy information
    const pharmacy = await this.pharmacyRepository.findById(pharmacyId);
    if (!pharmacy) {
      throw new PharmacyNotFoundError(pharmacyId);
    }
    
    // Prepare NCPDP SCRIPT message
    const scriptMessage = await this.createNCPDPScriptMessage(prescription, pharmacy);
    
    // Encrypt prescription data
    const encryptedMessage = await this.encryptPrescriptionMessage(
      scriptMessage,
      pharmacy.encryptionKey
    );
    
    // Transmit to pharmacy
    const transmissionResult = await this.transmitToPharmacy(
      encryptedMessage,
      pharmacy
    );
    
    if (transmissionResult.success) {
      // Update prescription status
      await this.updatePrescriptionStatus(prescriptionId, {
        status: PrescriptionStatus.TRANSMITTED,
        transmittedAt: new Date(),
        pharmacyId: pharmacyId,
        transmissionId: transmissionResult.transmissionId
      });
      
      // Log successful transmission
      await this.auditLogger.logPrescriptionTransmission(
        prescription,
        pharmacy,
        transmissionResult
      );
      
    } else {
      // Log transmission failure
      await this.auditLogger.logPrescriptionTransmissionFailure(
        prescription,
        pharmacy,
        transmissionResult.error
      );
    }
    
    return transmissionResult;
  }
}
```

### Medication Management and Drug Database Integration

```typescript
interface MedicationManagementService {
  // Drug database integration
  searchMedications(searchCriteria: MedicationSearchCriteria): Promise<MedicationSearchResult[]>;
  getMedicationDetails(ndc: string): Promise<MedicationDetails>;
  validateMedication(medicationData: MedicationData): Promise<MedicationValidation>;
  
  // Formulary management
  checkFormularyCoverage(medication: Medication, insurancePlan: InsurancePlan): Promise<FormularyCoverage>;
  getFormularyAlternatives(medication: Medication, insurancePlan: InsurancePlan): Promise<FormularyAlternative[]>;
  
  // Drug interaction checking
  checkDrugInteractions(medications: Medication[]): Promise<DrugInteractionResult>;
  checkDrugAllergies(patientId: string, medication: Medication): Promise<AllergyCheckResult>;
  
  // Medication reconciliation
  reconcilePatientMedications(patientId: string, newMedications: Medication[]): Promise<ReconciliationResult>;
}

class MedicationDatabaseManager {
  async searchMedicationsInDatabase(
    searchCriteria: MedicationSearchCriteria
  ): Promise<MedicationSearchResult[]> {
    // Build search query based on criteria
    const searchQuery = this.buildMedicationSearchQuery(searchCriteria);
    
    // Search in multiple drug databases
    const searchPromises = [
      this.searchInRxNorm(searchQuery),
      this.searchInNDCDirectory(searchQuery),
      this.searchInFirstDataBank(searchQuery)
    ];
    
    const searchResults = await Promise.allSettled(searchPromises);
    
    // Consolidate and deduplicate results
    const consolidatedResults = this.consolidateSearchResults(searchResults);
    
    // Rank results by relevance
    const rankedResults = this.rankSearchResults(consolidatedResults, searchCriteria);
    
    // Apply filters
    const filteredResults = this.applySearchFilters(rankedResults, searchCriteria.filters);
    
    return filteredResults.slice(0, searchCriteria.maxResults || 50);
  }
  
  async checkComprehensiveDrugInteractions(
    patientMedications: Medication[],
    newMedication: Medication
  ): Promise<ComprehensiveDrugInteractionResult> {
    const allMedications = [...patientMedications, newMedication];
    const interactions = [];
    
    // Check drug-drug interactions
    for (let i = 0; i < allMedications.length; i++) {
      for (let j = i + 1; j < allMedications.length; j++) {
        const interaction = await this.checkDrugDrugInteraction(
          allMedications[i],
          allMedications[j]
        );
        
        if (interaction.hasInteraction) {
          interactions.push({
            type: 'DRUG_DRUG',
            medication1: allMedications[i],
            medication2: allMedications[j],
            severity: interaction.severity,
            mechanism: interaction.mechanism,
            clinicalEffect: interaction.clinicalEffect,
            management: interaction.management,
            references: interaction.references
          });
        }
      }
    }
    
    // Check drug-food interactions
    const foodInteractions = await this.checkDrugFoodInteractions(newMedication);
    interactions.push(...foodInteractions);
    
    // Check drug-disease interactions
    const patientConditions = await this.getPatientConditions(patientMedications[0]?.patientId);
    const diseaseInteractions = await this.checkDrugDiseaseInteractions(
      newMedication,
      patientConditions
    );
    interactions.push(...diseaseInteractions);
    
    // Prioritize interactions by severity
    const prioritizedInteractions = interactions.sort((a, b) => {
      const severityOrder = { 'CRITICAL': 3, 'MAJOR': 2, 'MODERATE': 1, 'MINOR': 0 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
    
    return {
      hasInteractions: interactions.length > 0,
      totalInteractions: interactions.length,
      criticalInteractions: interactions.filter(i => i.severity === 'CRITICAL').length,
      majorInteractions: interactions.filter(i => i.severity === 'MAJOR').length,
      interactions: prioritizedInteractions,
      recommendedActions: this.generateInteractionRecommendations(prioritizedInteractions)
    };
  }
  
  async performMedicationReconciliation(
    patientId: string,
    admissionMedications: Medication[]
  ): Promise<MedicationReconciliationResult> {
    // Get patient's current medication list
    const currentMedications = await this.getCurrentPatientMedications(patientId);
    
    // Get patient's medication history
    const medicationHistory = await this.getPatientMedicationHistory(patientId);
    
    // Compare medication lists
    const comparison = this.compareMedicationLists(
      currentMedications,
      admissionMedications
    );
    
    // Identify discrepancies
    const discrepancies = [];
    
    // Check for missing medications
    const missingMedications = currentMedications.filter(current => 
      !admissionMedications.some(admission => 
        this.isSameMedication(current, admission)
      )
    );
    
    discrepancies.push(...missingMedications.map(med => ({
      type: 'MISSING_MEDICATION',
      medication: med,
      severity: this.assessDiscrepancySeverity(med),
      recommendation: 'Verify if medication should be continued'
    })));
    
    // Check for new medications
    const newMedications = admissionMedications.filter(admission => 
      !currentMedications.some(current => 
        this.isSameMedication(current, admission)
      )
    );
    
    discrepancies.push(...newMedications.map(med => ({
      type: 'NEW_MEDICATION',
      medication: med,
      severity: 'REVIEW_REQUIRED',
      recommendation: 'Verify indication and appropriateness'
    })));
    
    // Check for dosage changes
    const dosageChanges = this.identifyDosageChanges(
      currentMedications,
      admissionMedications
    );
    
    discrepancies.push(...dosageChanges);
    
    // Generate reconciliation recommendations
    const recommendations = await this.generateReconciliationRecommendations(
      discrepancies,
      medicationHistory
    );
    
    return {
      patientId,
      reconciliationDate: new Date(),
      currentMedications,
      admissionMedications,
      discrepancies,
      recommendations,
      requiresPharmacistReview: discrepancies.some(d => d.severity === 'HIGH'),
      requiresPhysicianReview: discrepancies.some(d => d.type === 'CRITICAL_DISCREPANCY')
    };
  }
}
```

### Pharmacy Integration and Communication

```typescript
interface PharmacyIntegrationService {
  // Pharmacy network management
  registerPharmacy(pharmacyData: PharmacyData): Promise<RegisteredPharmacy>;
  updatePharmacyInformation(pharmacyId: string, updates: PharmacyUpdate): Promise<void>;
  
  // Prescription transmission
  transmitPrescription(prescription: Prescription, pharmacyId: string): Promise<TransmissionResult>;
  receivePrescriptionResponse(responseData: PharmacyResponse): Promise<void>;
  
  // Status updates
  handlePrescriptionStatusUpdate(statusUpdate: PrescriptionStatusUpdate): Promise<void>;
  requestPrescriptionStatus(prescriptionId: string): Promise<PrescriptionStatus>;
  
  // Pharmacy benefits
  checkPharmacyBenefits(patientId: string, pharmacyId: string): Promise<BenefitsInformation>;
  calculateCopayment(prescription: Prescription, insuranceInfo: InsuranceInfo): Promise<CopaymentCalculation>;
}

class PharmacyNetworkManager {
  async establishPharmacyConnection(
    pharmacyData: PharmacyData
  ): Promise<PharmacyConnection> {
    // Validate pharmacy credentials
    const credentialValidation = await this.validatePharmacyCredentials(pharmacyData);
    if (!credentialValidation.valid) {
      throw new InvalidPharmacyCredentialsError(credentialValidation.errors);
    }
    
    // Verify pharmacy license
    const licenseVerification = await this.verifyPharmacyLicense(
      pharmacyData.licenseNumber,
      pharmacyData.state
    );
    
    if (!licenseVerification.valid) {
      throw new InvalidPharmacyLicenseError(licenseVerification.reason);
    }
    
    // Set up secure communication channel
    const secureChannel = await this.establishSecureCommunicationChannel(pharmacyData);
    
    // Configure NCPDP SCRIPT messaging
    const scriptConfiguration = await this.configureNCPDPScript(pharmacyData);
    
    // Test connectivity
    const connectivityTest = await this.testPharmacyConnectivity(
      pharmacyData,
      secureChannel
    );
    
    if (!connectivityTest.successful) {
      throw new PharmacyConnectivityError(connectivityTest.error);
    }
    
    // Create pharmacy connection record
    const pharmacyConnection = {
      pharmacyId: this.generatePharmacyId(),
      pharmacyData,
      secureChannel,
      scriptConfiguration,
      connectionStatus: 'ACTIVE',
      establishedAt: new Date(),
      lastTestAt: new Date(),
      supportedServices: await this.detectSupportedServices(pharmacyData)
    };
    
    // Store connection information
    await this.pharmacyConnectionRepository.save(pharmacyConnection);
    
    // Log pharmacy registration
    await this.auditLogger.logPharmacyRegistration(pharmacyConnection);
    
    return pharmacyConnection;
  }
  
  async processPharmacyResponse(
    responseData: PharmacyResponse
  ): Promise<ResponseProcessingResult> {
    // Validate response format
    const formatValidation = await this.validateResponseFormat(responseData);
    if (!formatValidation.valid) {
      throw new InvalidResponseFormatError(formatValidation.errors);
    }
    
    // Decrypt response if encrypted
    const decryptedResponse = await this.decryptPharmacyResponse(responseData);
    
    // Parse NCPDP SCRIPT response
    const parsedResponse = await this.parseNCPDPResponse(decryptedResponse);
    
    // Process based on response type
    let processingResult;
    
    switch (parsedResponse.messageType) {
      case 'PRESCRIPTION_RECEIVED':
        processingResult = await this.processPrescriptionReceived(parsedResponse);
        break;
        
      case 'PRESCRIPTION_FILLED':
        processingResult = await this.processPrescriptionFilled(parsedResponse);
        break;
        
      case 'PRESCRIPTION_READY':
        processingResult = await this.processPrescriptionReady(parsedResponse);
        break;
        
      case 'PRESCRIPTION_PICKED_UP':
        processingResult = await this.processPrescriptionPickedUp(parsedResponse);
        break;
        
      case 'PRESCRIPTION_ERROR':
        processingResult = await this.processPrescriptionError(parsedResponse);
        break;
        
      case 'REFILL_REQUEST':
        processingResult = await this.processRefillRequest(parsedResponse);
        break;
        
      default:
        throw new UnsupportedResponseTypeError(parsedResponse.messageType);
    }
    
    // Update prescription status
    if (processingResult.prescriptionId) {
      await this.updatePrescriptionStatus(
        processingResult.prescriptionId,
        processingResult.statusUpdate
      );
    }
    
    // Send notifications if required
    if (processingResult.notificationRequired) {
      await this.sendPrescriptionNotifications(processingResult);
    }
    
    // Log response processing
    await this.auditLogger.logPharmacyResponseProcessing(
      responseData,
      processingResult
    );
    
    return processingResult;
  }
}
```

### Controlled Substance Management

```typescript
interface ControlledSubstanceManagement {
  // DEA compliance
  validateDEAAuthorization(prescriberId: string, controlledSubstance: ControlledSubstance): Promise<DEAValidation>;
  checkControlledSubstanceLimits(patientId: string, prescription: Prescription): Promise<LimitCheckResult>;
  
  // PDMP integration
  queryPDMP(patientId: string, prescriberId: string): Promise<PDMPReport>;
  submitPDMPReport(prescription: Prescription): Promise<PDMPSubmissionResult>;
  
  // Prescription monitoring
  monitorControlledSubstancePrescribing(prescriberId: string): Promise<PrescribingMonitoringReport>;
  flagSuspiciousActivity(activity: SuspiciousActivity): Promise<void>;
  
  // Audit and reporting
  generateControlledSubstanceReport(dateRange: DateRange): Promise<ControlledSubstanceReport>;
  auditControlledSubstancePrescriptions(auditCriteria: AuditCriteria): Promise<AuditReport>;
}

class ControlledSubstanceManager {
  async prescribeControlledSubstance(
    prescriptionData: ControlledSubstancePrescriptionData
  ): Promise<ControlledSubstancePrescription> {
    // Validate DEA authorization
    const deaValidation = await this.validateDEAAuthorization(
      prescriptionData.prescriberId,
      prescriptionData.controlledSubstance
    );
    
    if (!deaValidation.authorized) {
      throw new DEAAuthorizationError(deaValidation.reason);
    }
    
    // Check prescriber's controlled substance privileges
    const privilegeCheck = await this.checkControlledSubstancePrivileges(
      prescriptionData.prescriberId,
      prescriptionData.controlledSubstance.schedule
    );
    
    if (!privilegeCheck.authorized) {
      throw new InsufficientPrivilegesError(privilegeCheck.reason);
    }
    
    // Query PDMP for patient history
    const pdmpReport = await this.queryPDMP(
      prescriptionData.patientId,
      prescriptionData.prescriberId
    );
    
    // Analyze PDMP data for red flags
    const pdmpAnalysis = await this.analyzePDMPData(pdmpReport);
    
    if (pdmpAnalysis.hasRedFlags) {
      // Require additional review for red flags
      await this.flagForAdditionalReview(prescriptionData, pdmpAnalysis.redFlags);
      
      if (pdmpAnalysis.severity === 'HIGH') {
        throw new PDMPRedFlagError('High-risk prescribing pattern detected');
      }
    }
    
    // Check quantity and day supply limits
    const limitCheck = await this.checkControlledSubstanceLimits(
      prescriptionData.patientId,
      prescriptionData
    );
    
    if (!limitCheck.withinLimits) {
      throw new ControlledSubstanceLimitExceededError(limitCheck.violations);
    }
    
    // Apply additional controlled substance validations
    const csValidations = await this.applyControlledSubstanceValidations(
      prescriptionData
    );
    
    if (!csValidations.valid) {
      throw new ControlledSubstanceValidationError(csValidations.errors);
    }
    
    // Create controlled substance prescription
    const prescription = {
      ...await this.createBasePrescription(prescriptionData),
      controlledSubstanceInfo: {
        schedule: prescriptionData.controlledSubstance.schedule,
        deaNumber: deaValidation.deaNumber,
        pdmpReportId: pdmpReport.reportId,
        pdmpAnalysis: pdmpAnalysis,
        limitCheckResult: limitCheck,
        additionalSafeguards: csValidations.safeguards
      },
      requiresHardCopy: this.requiresHardCopy(prescriptionData.controlledSubstance),
      transmissionRestrictions: this.getTransmissionRestrictions(
        prescriptionData.controlledSubstance
      )
    };
    
    // Store prescription with enhanced audit trail
    await this.storeControlledSubstancePrescription(prescription);
    
    // Submit to PDMP
    await this.submitToPDMP(prescription);
    
    // Log controlled substance prescription
    await this.auditLogger.logControlledSubstancePrescription(prescription);
    
    return prescription;
  }
  
  async monitorControlledSubstancePrescribing(
    prescriberId: string,
    monitoringPeriod: MonitoringPeriod
  ): Promise<PrescribingMonitoringReport> {
    // Get prescriber's controlled substance prescriptions
    const prescriptions = await this.getPrescriberControlledSubstancePrescriptions(
      prescriberId,
      monitoringPeriod
    );
    
    // Analyze prescribing patterns
    const prescribingPatterns = await this.analyzePrescribingPatterns(prescriptions);
    
    // Check for outlier behavior
    const outlierAnalysis = await this.detectOutlierPrescribing(
      prescriberId,
      prescribingPatterns
    );
    
    // Calculate prescribing metrics
    const prescribingMetrics = {
      totalPrescriptions: prescriptions.length,
      uniquePatients: new Set(prescriptions.map(p => p.patientId)).size,
      averageDailyDose: this.calculateAverageDailyDose(prescriptions),
      averageDaysSupply: this.calculateAverageDaysSupply(prescriptions),
      refillRate: this.calculateRefillRate(prescriptions),
      
      // By schedule
      scheduleBreakdown: this.analyzeBySchedule(prescriptions),
      
      // By medication
      medicationBreakdown: this.analyzeByMedication(prescriptions),
      
      // Temporal patterns
      temporalPatterns: this.analyzeTemporalPatterns(prescriptions)
    };
    
    // Generate risk assessment
    const riskAssessment = await this.assessPrescriberRisk(
      prescriberId,
      prescribingMetrics,
      outlierAnalysis
    );
    
    // Generate recommendations
    const recommendations = await this.generatePrescribingRecommendations(
      prescribingMetrics,
      riskAssessment
    );
    
    return {
      prescriberId,
      monitoringPeriod,
      prescribingMetrics,
      prescribingPatterns,
      outlierAnalysis,
      riskAssessment,
      recommendations,
      generatedAt: new Date()
    };
  }
}
```

### Clinical Decision Support for Prescribing

```typescript
interface PrescribingClinicalDecisionSupport {
  // Drug interaction alerts
  checkDrugInteractions(medications: Medication[]): Promise<DrugInteractionAlert[]>;
  
  // Allergy alerts
  checkAllergyContraindications(patientId: string, medication: Medication): Promise<AllergyAlert[]>;
  
  // Dosing guidance
  provideDosing Guidance(patientId: string, medication: Medication): Promise<DosingGuidance>;
  
  // Clinical guidelines
  applyPrescribingGuidelines(prescriptionData: PrescriptionData): Promise<GuidelineRecommendation[]>;
  
  // Duplicate therapy alerts
  checkDuplicateTherapy(patientId: string, medication: Medication): Promise<DuplicateTherapyAlert[]>;
}

class PrescribingClinicalDecisionSupportEngine {
  async providePrescribingDecisionSupport(
    prescriptionData: PrescriptionData
  ): Promise<ClinicalDecisionSupportResult> {
    const alerts = [];
    const recommendations = [];
    
    // Get patient's current medications
    const currentMedications = await this.getCurrentPatientMedications(
      prescriptionData.patientId
    );
    
    // Check drug-drug interactions
    const drugInteractions = await this.checkDrugInteractions([
      ...currentMedications,
      prescriptionData.medication
    ]);
    
    alerts.push(...drugInteractions.map(interaction => ({
      type: 'DRUG_INTERACTION',
      severity: interaction.severity,
      message: interaction.message,
      interactingMedications: interaction.medications,
      clinicalConsequence: interaction.clinicalConsequence,
      management: interaction.management
    })));
    
    // Check for allergies
    const allergyAlerts = await this.checkPatientAllergies(
      prescriptionData.patientId,
      prescriptionData.medication
    );
    
    alerts.push(...allergyAlerts.map(allergy => ({
      type: 'ALLERGY_ALERT',
      severity: 'HIGH',
      message: `Patient has documented allergy to ${allergy.allergen}`,
      allergen: allergy.allergen,
      reactionType: allergy.reactionType,
      recommendation: 'Consider alternative medication'
    })));
    
    // Check for duplicate therapy
    const duplicateTherapy = await this.checkDuplicateTherapy(
      currentMedications,
      prescriptionData.medication
    );
    
    if (duplicateTherapy.hasDuplicates) {
      alerts.push({
        type: 'DUPLICATE_THERAPY',
        severity: 'MEDIUM',
        message: 'Patient is already on similar medication',
        duplicateMedications: duplicateTherapy.duplicates,
        recommendation: 'Review need for additional therapy'
      });
    }
    
    // Provide dosing guidance
    const dosingGuidance = await this.generateDosingGuidance(
      prescriptionData.patientId,
      prescriptionData.medication,
      prescriptionData.dosageInstructions
    );
    
    if (dosingGuidance.hasRecommendations) {
      recommendations.push(...dosingGuidance.recommendations);
    }
    
    // Apply clinical guidelines
    const guidelineRecommendations = await this.applyPrescribingGuidelines(
      prescriptionData
    );
    
    recommendations.push(...guidelineRecommendations);
    
    // Check renal/hepatic dosing adjustments
    const organFunctionCheck = await this.checkOrganFunctionDosing(
      prescriptionData.patientId,
      prescriptionData.medication
    );
    
    if (organFunctionCheck.adjustmentNeeded) {
      alerts.push({
        type: 'DOSING_ADJUSTMENT',
        severity: 'MEDIUM',
        message: organFunctionCheck.message,
        adjustmentType: organFunctionCheck.adjustmentType,
        recommendedDose: organFunctionCheck.recommendedDose
      });
    }
    
    // Age-related considerations
    const ageConsiderations = await this.checkAgeRelatedConsiderations(
      prescriptionData.patientId,
      prescriptionData.medication
    );
    
    if (ageConsiderations.hasConsiderations) {
      recommendations.push(...ageConsiderations.recommendations);
    }
    
    // Calculate overall risk score
    const riskScore = this.calculatePrescriptionRiskScore(alerts, recommendations);
    
    return {
      prescriptionId: prescriptionData.prescriptionId,
      alerts: alerts.sort((a, b) => this.getSeverityWeight(b.severity) - this.getSeverityWeight(a.severity)),
      recommendations,
      riskScore,
      requiresPharmacistReview: riskScore > 7 || alerts.some(a => a.severity === 'HIGH'),
      requiresPhysicianReview: alerts.some(a => a.type === 'ALLERGY_ALERT'),
      evaluatedAt: new Date()
    };
  }
}
```

## Testing and Quality Assurance

### Prescription Management Testing

```typescript
describe('Prescription Management System', () => {
  describe('E-Prescribing', () => {
    test('should create electronic prescription with validations', async () => {
      const prescriptionData = createTestPrescriptionData();
      
      const prescription = await ePrescribing.createElectronicPrescription(prescriptionData);
      
      expect(prescription.prescriptionId).toBeDefined();
      expect(prescription.digitalSignature).toBeDefined();
      expect(prescription.status).toBe(PrescriptionStatus.CREATED);
    });
    
    test('should transmit prescription to pharmacy', async () => {
      const prescriptionId = 'prescription-123';
      const pharmacyId = 'pharmacy-456';
      
      const transmissionResult = await ePrescribing.transmitPrescriptionToPharmacy(
        prescriptionId,
        pharmacyId
      );
      
      expect(transmissionResult.success).toBe(true);
      expect(transmissionResult.transmissionId).toBeDefined();
    });
  });
  
  describe('Drug Interaction Checking', () => {
    test('should detect drug interactions', async () => {
      const medications = [
        createMedication('warfarin'),
        createMedication('aspirin')
      ];
      
      const interactionResult = await medicationManagement.checkDrugInteractions(medications);
      
      expect(interactionResult.hasInteractions).toBe(true);
      expect(interactionResult.interactions.length).toBeGreaterThan(0);
      expect(interactionResult.interactions[0].severity).toBe('MAJOR');
    });
    
    test('should check patient allergies', async () => {
      const patientId = 'patient-123';
      const medication = createMedication('penicillin');
      
      const allergyCheck = await medicationManagement.checkDrugAllergies(
        patientId,
        medication
      );
      
      expect(allergyCheck.hasAllergies).toBe(true);
      expect(allergyCheck.allergies[0].allergen).toBe('penicillin');
    });
  });
  
  describe('Controlled Substances', () => {
    test('should validate DEA authorization for controlled substances', async () => {
      const prescriberId = 'prescriber-123';
      const controlledSubstance = createControlledSubstance('schedule-ii');
      
      const deaValidation = await controlledSubstanceManager.validateDEAAuthorization(
        prescriberId,
        controlledSubstance
      );
      
      expect(deaValidation.authorized).toBe(true);
      expect(deaValidation.deaNumber).toBeDefined();
    });
    
    test('should query PDMP for patient history', async () => {
      const patientId = 'patient-123';
      const prescriberId = 'prescriber-456';
      
      const pdmpReport = await controlledSubstanceManager.queryPDMP(
        patientId,
        prescriberId
      );
      
      expect(pdmpReport.reportId).toBeDefined();
      expect(pdmpReport.prescriptionHistory).toBeDefined();
    });
  });
  
  describe('Pharmacy Integration', () => {
    test('should establish pharmacy connection', async () => {
      const pharmacyData = createTestPharmacyData();
      
      const pharmacyConnection = await pharmacyNetworkManager.establishPharmacyConnection(
        pharmacyData
      );
      
      expect(pharmacyConnection.pharmacyId).toBeDefined();
      expect(pharmacyConnection.connectionStatus).toBe('ACTIVE');
    });
    
    test('should process pharmacy response', async () => {
      const responseData = createTestPharmacyResponse();
      
      const processingResult = await pharmacyNetworkManager.processPharmacyResponse(
        responseData
      );
      
      expect(processingResult.processed).toBe(true);
      expect(processingResult.prescriptionId).toBeDefined();
    });
  });
  
  describe('Clinical Decision Support', () => {
    test('should provide prescribing decision support', async () => {
      const prescriptionData = createTestPrescriptionData();
      
      const cdsResult = await prescribingCDS.providePrescribingDecisionSupport(
        prescriptionData
      );
      
      expect(cdsResult.alerts).toBeDefined();
      expect(cdsResult.recommendations).toBeDefined();
      expect(cdsResult.riskScore).toBeGreaterThanOrEqual(0);
    });
    
    test('should generate dosing guidance', async () => {
      const patientId = 'patient-123';
      const medication = createMedication('insulin');
      
      const dosingGuidance = await prescribingCDS.generateDosingGuidance(
        patientId,
        medication
      );
      
      expect(dosingGuidance.hasRecommendations).toBe(true);
      expect(dosingGuidance.recommendations.length).toBeGreaterThan(0);
    });
  });
});
```

This comprehensive prescription management template provides the foundation for building secure, compliant, and clinically intelligent e-prescribing systems that can handle the complex requirements of modern healthcare while ensuring patient safety and regulatory compliance.