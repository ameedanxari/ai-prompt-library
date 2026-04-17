# Medical Records Template

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
This template provides comprehensive patterns for Electronic Health Record (EHR) integration and medical data interoperability, covering standards-based data exchange, clinical workflows, and healthcare system integration.

## Instructions

1. **Setup FHIR Standards**: Implement HL7 FHIR R4 for healthcare data exchange
2. **Configure EHR Integration**: Connect to existing Electronic Health Record systems
3. **Implement Data Mapping**: Set up clinical data transformation and mapping
4. **Setup Clinical Workflows**: Deploy clinical decision support and care pathways
5. **Configure Interoperability**: Ensure seamless data exchange between systems
6. **Implement Audit Trails**: Set up comprehensive medical record audit logging
7. **Deploy Data Validation**: Ensure clinical data integrity and validation

## Examples

### Example 1: FHIR Patient Resource
```typescript
interface FHIRPatient {
  resourceType: 'Patient';
  id: string;
  identifier: Array<{
    system: string;
    value: string;
    type: CodeableConcept;
  }>;
  name: Array<{
    family: string;
    given: string[];
    use: 'official' | 'usual' | 'temp';
  }>;
  gender: 'male' | 'female' | 'other' | 'unknown';
  birthDate: string;
  address: Address[];
}

const patient = await createFHIRPatient({
  identifier: [{
    system: "http://hospital.org/mrn",
    value: "MRN-12345",
    type: { text: "Medical Record Number" }
  }],
  name: [{
    family: "Smith",
    given: ["John", "David"],
    use: "official"
  }],
  gender: "male",
  birthDate: "1985-06-15"
});
```

### Example 2: Clinical Observation
```typescript
interface ClinicalObservation {
  resourceType: 'Observation';
  status: 'final';
  category: CodeableConcept[];
  code: CodeableConcept;
  subject: Reference;
  valueQuantity: {
    value: number;
    unit: string;
    system: string;
    code: string;
  };
  effectiveDateTime: string;
}

const vitalSigns = await recordObservation({
  patientId: "patient-123",
  observationType: "blood-pressure",
  values: {
    systolic: { value: 120, unit: "mmHg" },
    diastolic: { value: 80, unit: "mmHg" }
  },
  recordedBy: "nurse-456",
  timestamp: new Date().toISOString()
});
```

### Example 3: EHR System Integration
```typescript
interface EHRIntegration {
  systemType: 'Epic' | 'Cerner' | 'Allscripts' | 'athenahealth';
  apiEndpoint: string;
  authMethod: 'OAuth2' | 'SAML' | 'API_KEY';
  dataFormat: 'FHIR' | 'HL7v2' | 'CDA';
  syncInterval: number;
}

const ehrSync = await syncWithEHR({
  systemType: "Epic",
  patientId: "patient-123",
  dataTypes: ["allergies", "medications", "problems", "vitals"],
  syncDirection: "bidirectional",
  conflictResolution: "manual_review"
});
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| fhirVersion | FHIR specification version | string | Yes | "R4" |
| ehrSystems | Supported EHR system types | string[] | Yes | N/A |
| dataStandards | Supported healthcare data standards | string[] | Yes | ["FHIR", "HL7v2"] |
| syncInterval | EHR synchronization interval (minutes) | number | No | 60 |
| auditLevel | Medical record audit detail level | string | Yes | "comprehensive" |
| dataValidation | Enable clinical data validation | boolean | Yes | true |
| interoperabilityMode | Data exchange mode | string | Yes | "bidirectional" |
| clinicalTerminologies | Supported clinical terminologies | string[] | Yes | ["SNOMED", "ICD-10", "LOINC"] |

## Expected Output

This template will produce:
- **FHIR-Compliant API**: Standards-based healthcare data exchange
- **EHR Integration Layer**: Seamless connection to existing health record systems
- **Clinical Data Repository**: Centralized medical record storage and management
- **Interoperability Engine**: Healthcare system data exchange and transformation
- **Clinical Decision Support**: Evidence-based care recommendations
- **Audit and Compliance System**: Medical record access and modification tracking
- **Data Validation Framework**: Clinical data integrity and quality assurance
- **Reporting and Analytics**: Clinical insights and population health analytics

## Context
Use this template when building healthcare applications that need to integrate with existing EHR systems, exchange clinical data, or implement clinical decision support while maintaining data integrity and interoperability.

## Healthcare Data Standards

### Core Standards Implementation

```typescript
// HL7 FHIR R4 Implementation
interface FHIRResource {
  resourceType: string;
  id?: string;
  meta?: Meta;
  implicitRules?: string;
  language?: string;
}

interface Patient extends FHIRResource {
  resourceType: 'Patient';
  identifier: Identifier[];
  active?: boolean;
  name: HumanName[];
  telecom?: ContactPoint[];
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  address?: Address[];
  contact?: PatientContact[];
  communication?: PatientCommunication[];
}

interface Observation extends FHIRResource {
  resourceType: 'Observation';
  status: 'registered' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'cancelled';
  category?: CodeableConcept[];
  code: CodeableConcept;
  subject: Reference;
  encounter?: Reference;
  effectiveDateTime?: string;
  valueQuantity?: Quantity;
  valueCodeableConcept?: CodeableConcept;
  valueString?: string;
  component?: ObservationComponent[];
}
```

### Clinical Terminology Standards

```typescript
interface TerminologyService {
  // SNOMED CT integration
  validateSNOMEDCode(code: string): Promise<ValidationResult>;
  searchSNOMEDConcepts(query: string): Promise<ConceptSearchResult[]>;
  
  // ICD-10 integration
  validateICD10Code(code: string): Promise<ValidationResult>;
  searchICD10Codes(query: string): Promise<ICD10SearchResult[]>;
  
  // LOINC integration
  validateLOINCCode(code: string): Promise<ValidationResult>;
  searchLOINCCodes(query: string): Promise<LOINCSearchResult[]>;
  
  // RxNorm integration
  validateRxNormCode(code: string): Promise<ValidationResult>;
  searchMedications(query: string): Promise<MedicationSearchResult[]>;
}

class ClinicalTerminologyManager {
  async standardizeCode(code: string, codeSystem: CodeSystem): Promise<StandardizedCode> {
    switch (codeSystem) {
      case CodeSystem.SNOMED_CT:
        return await this.standardizeSNOMEDCode(code);
      case CodeSystem.ICD10:
        return await this.standardizeICD10Code(code);
      case CodeSystem.LOINC:
        return await this.standardizeLOINCCode(code);
      case CodeSystem.RXNORM:
        return await this.standardizeRxNormCode(code);
      default:
        throw new UnsupportedCodeSystemError(codeSystem);
    }
  }
  
  async mapBetweenCodeSystems(
    sourceCode: string, 
    sourceSystem: CodeSystem, 
    targetSystem: CodeSystem
  ): Promise<CodeMapping[]> {
    const mappingService = this.getMappingService(sourceSystem, targetSystem);
    return await mappingService.mapCode(sourceCode);
  }
}
```

## Implementation Patterns

### FHIR API Integration

```typescript
interface FHIRClient {
  // Resource operations
  create<T extends FHIRResource>(resource: T): Promise<T>;
  read<T extends FHIRResource>(resourceType: string, id: string): Promise<T>;
  update<T extends FHIRResource>(resource: T): Promise<T>;
  delete(resourceType: string, id: string): Promise<void>;
  
  // Search operations
  search<T extends FHIRResource>(
    resourceType: string, 
    searchParams: SearchParameters
  ): Promise<Bundle<T>>;
  
  // Batch operations
  batch(bundle: Bundle): Promise<Bundle>;
  transaction(bundle: Bundle): Promise<Bundle>;
}

class EHRIntegrationService {
  constructor(
    private fhirClient: FHIRClient,
    private terminologyService: TerminologyService,
    private auditLogger: AuditLogger
  ) {}
  
  async importPatientData(ehrPatientId: string, ehrSystem: EHRSystem): Promise<PatientImportResult> {
    try {
      // Retrieve patient data from source EHR
      const patientBundle = await this.retrievePatientBundle(ehrPatientId, ehrSystem);
      
      // Validate and standardize clinical codes
      const standardizedBundle = await this.standardizeClinicalCodes(patientBundle);
      
      // Map to internal data model
      const internalPatientData = await this.mapToInternalModel(standardizedBundle);
      
      // Perform data quality checks
      const qualityReport = await this.validateDataQuality(internalPatientData);
      if (qualityReport.hasErrors) {
        throw new DataQualityError(qualityReport.errors);
      }
      
      // Import data with conflict resolution
      const importResult = await this.importWithConflictResolution(internalPatientData);
      
      // Log import activity
      await this.auditLogger.logDataImport({
        sourceSystem: ehrSystem.name,
        patientId: ehrPatientId,
        recordsImported: importResult.recordsImported,
        conflicts: importResult.conflicts.length
      });
      
      return importResult;
      
    } catch (error) {
      await this.auditLogger.logImportError(ehrPatientId, ehrSystem.name, error);
      throw error;
    }
  }
  
  async exportPatientData(patientId: string, targetEHR: EHRSystem): Promise<ExportResult> {
    // Retrieve patient data
    const patientData = await this.getPatientData(patientId);
    
    // Convert to FHIR format
    const fhirBundle = await this.convertToFHIR(patientData);
    
    // Validate FHIR compliance
    const validationResult = await this.validateFHIRBundle(fhirBundle);
    if (!validationResult.valid) {
      throw new FHIRValidationError(validationResult.errors);
    }
    
    // Map codes to target system's preferred terminology
    const mappedBundle = await this.mapTerminologyForTarget(fhirBundle, targetEHR);
    
    // Export to target system
    const exportResult = await this.exportToTargetSystem(mappedBundle, targetEHR);
    
    // Log export activity
    await this.auditLogger.logDataExport({
      targetSystem: targetEHR.name,
      patientId,
      recordsExported: exportResult.recordsExported
    });
    
    return exportResult;
  }
}
```

### Clinical Data Exchange

```typescript
interface ClinicalDataExchange {
  // Care continuity
  transferCareData(patientId: string, fromProvider: Provider, toProvider: Provider): Promise<TransferResult>;
  
  // Referral management
  createReferral(referralData: ReferralData): Promise<Referral>;
  processReferralResponse(referralId: string, response: ReferralResponse): Promise<void>;
  
  // Lab result sharing
  shareLabResults(labResults: LabResult[], targetProviders: Provider[]): Promise<SharingResult>;
  
  // Medication reconciliation
  reconcileMedications(patientId: string, medicationSources: MedicationSource[]): Promise<ReconciliationResult>;
}

class ClinicalWorkflowManager {
  async processClinicalDocument(document: ClinicalDocument): Promise<ProcessingResult> {
    // Parse document structure
    const parsedDocument = await this.parseDocument(document);
    
    // Extract clinical data
    const clinicalData = await this.extractClinicalData(parsedDocument);
    
    // Validate clinical codes
    const validationResults = await this.validateClinicalCodes(clinicalData);
    
    // Process clinical decision support rules
    const cdsAlerts = await this.processClinicalDecisionSupport(clinicalData);
    
    // Store processed data
    const storageResult = await this.storeClinicalData(clinicalData);
    
    return {
      documentId: document.id,
      extractedData: clinicalData,
      validationResults,
      cdsAlerts,
      storageResult
    };
  }
  
  async generateContinuityOfCareDocument(patientId: string): Promise<CCDDocument> {
    // Retrieve comprehensive patient data
    const patientData = await this.getComprehensivePatientData(patientId);
    
    // Generate CCD sections
    const ccdSections = {
      demographics: await this.generateDemographicsSection(patientData),
      problems: await this.generateProblemsSection(patientData.conditions),
      medications: await this.generateMedicationsSection(patientData.medications),
      allergies: await this.generateAllergiesSection(patientData.allergies),
      procedures: await this.generateProceduresSection(patientData.procedures),
      results: await this.generateResultsSection(patientData.labResults),
      vitalSigns: await this.generateVitalSignsSection(patientData.vitalSigns),
      immunizations: await this.generateImmunizationsSection(patientData.immunizations)
    };
    
    // Assemble CCD document
    const ccdDocument = await this.assembleCCDDocument(ccdSections);
    
    // Validate CCD compliance
    const validationResult = await this.validateCCDDocument(ccdDocument);
    if (!validationResult.valid) {
      throw new CCDValidationError(validationResult.errors);
    }
    
    return ccdDocument;
  }
}
```

## Clinical Decision Support

### Rule Engine Implementation

```typescript
interface ClinicalDecisionSupport {
  // Drug interaction checking
  checkDrugInteractions(medications: Medication[]): Promise<DrugInteractionAlert[]>;
  
  // Allergy checking
  checkAllergies(patientId: string, proposedMedication: Medication): Promise<AllergyAlert[]>;
  
  // Clinical guidelines
  evaluateGuidelines(patientData: PatientData, clinicalContext: ClinicalContext): Promise<GuidelineRecommendation[]>;
  
  // Risk assessment
  assessClinicalRisk(patientData: PatientData, riskFactors: RiskFactor[]): Promise<RiskAssessment>;
}

class ClinicalDecisionSupportEngine {
  async evaluateClinicalRules(
    patientData: PatientData, 
    clinicalContext: ClinicalContext
  ): Promise<CDSResponse> {
    const alerts: CDSAlert[] = [];
    const recommendations: CDSRecommendation[] = [];
    
    // Drug interaction checking
    if (clinicalContext.medications && clinicalContext.medications.length > 0) {
      const drugInteractions = await this.checkDrugInteractions(
        patientData.currentMedications, 
        clinicalContext.medications
      );
      alerts.push(...drugInteractions.map(this.mapToAlert));
    }
    
    // Allergy checking
    if (clinicalContext.proposedMedications) {
      for (const medication of clinicalContext.proposedMedications) {
        const allergyAlerts = await this.checkMedicationAllergies(patientData.allergies, medication);
        alerts.push(...allergyAlerts);
      }
    }
    
    // Clinical guideline evaluation
    const guidelineRecommendations = await this.evaluateClinicalGuidelines(
      patientData, 
      clinicalContext
    );
    recommendations.push(...guidelineRecommendations);
    
    // Preventive care reminders
    const preventiveCareReminders = await this.checkPreventiveCare(patientData);
    recommendations.push(...preventiveCareReminders);
    
    return {
      alerts: alerts.sort((a, b) => b.severity - a.severity),
      recommendations: recommendations.sort((a, b) => b.priority - a.priority),
      evaluationTimestamp: new Date()
    };
  }
  
  async checkDrugInteractions(
    currentMedications: Medication[], 
    proposedMedications: Medication[]
  ): Promise<DrugInteractionAlert[]> {
    const interactions: DrugInteractionAlert[] = [];
    
    for (const proposed of proposedMedications) {
      for (const current of currentMedications) {
        const interaction = await this.drugInteractionService.checkInteraction(
          current.rxNormCode, 
          proposed.rxNormCode
        );
        
        if (interaction.hasInteraction) {
          interactions.push({
            severity: interaction.severity,
            drug1: current,
            drug2: proposed,
            interactionType: interaction.type,
            clinicalEffect: interaction.clinicalEffect,
            recommendation: interaction.recommendation,
            references: interaction.references
          });
        }
      }
    }
    
    return interactions;
  }
}
```

### Clinical Guidelines Integration

```typescript
interface ClinicalGuideline {
  guidelineId: string;
  title: string;
  organization: string;
  version: string;
  effectiveDate: Date;
  conditions: string[]; // ICD-10 codes
  rules: ClinicalRule[];
}

interface ClinicalRule {
  ruleId: string;
  condition: RuleCondition;
  action: RuleAction;
  evidence: EvidenceLevel;
  strength: RecommendationStrength;
}

class ClinicalGuidelineEngine {
  async evaluateGuidelines(
    patientData: PatientData, 
    clinicalContext: ClinicalContext
  ): Promise<GuidelineRecommendation[]> {
    const applicableGuidelines = await this.findApplicableGuidelines(
      patientData.conditions, 
      clinicalContext.specialty
    );
    
    const recommendations: GuidelineRecommendation[] = [];
    
    for (const guideline of applicableGuidelines) {
      const guidelineRecommendations = await this.evaluateGuidelineRules(
        guideline, 
        patientData, 
        clinicalContext
      );
      recommendations.push(...guidelineRecommendations);
    }
    
    // Remove duplicates and rank by evidence strength
    return this.rankAndDeduplicateRecommendations(recommendations);
  }
  
  async evaluateGuidelineRules(
    guideline: ClinicalGuideline,
    patientData: PatientData,
    clinicalContext: ClinicalContext
  ): Promise<GuidelineRecommendation[]> {
    const recommendations: GuidelineRecommendation[] = [];
    
    for (const rule of guideline.rules) {
      const conditionMet = await this.evaluateRuleCondition(rule.condition, patientData);
      
      if (conditionMet) {
        const recommendation = {
          guidelineId: guideline.guidelineId,
          ruleId: rule.ruleId,
          title: rule.action.title,
          description: rule.action.description,
          strength: rule.strength,
          evidence: rule.evidence,
          applicableConditions: this.getApplicableConditions(rule.condition, patientData),
          suggestedActions: rule.action.suggestedActions
        };
        
        recommendations.push(recommendation);
      }
    }
    
    return recommendations;
  }
}
```

## Medical Imaging Integration

### DICOM Integration

```typescript
interface DICOMService {
  // Image storage and retrieval
  storeImage(dicomImage: DICOMImage): Promise<StorageResult>;
  retrieveImage(studyInstanceUID: string, seriesInstanceUID: string): Promise<DICOMImage>;
  
  // Image processing
  processImage(imageId: string, processingParams: ImageProcessingParams): Promise<ProcessedImage>;
  
  // Metadata extraction
  extractMetadata(dicomImage: DICOMImage): Promise<DICOMMetadata>;
  
  // Integration with PACS
  queryPACS(queryParams: PACSQueryParams): Promise<PACSQueryResult>;
  retrieveFromPACS(retrieveParams: PACSRetrieveParams): Promise<DICOMImage[]>;
}

class MedicalImagingManager {
  async integrateImagingStudy(
    studyData: ImagingStudyData, 
    patientId: string
  ): Promise<ImagingIntegrationResult> {
    // Validate DICOM compliance
    const validationResult = await this.validateDICOMCompliance(studyData);
    if (!validationResult.valid) {
      throw new DICOMValidationError(validationResult.errors);
    }
    
    // Extract and standardize metadata
    const metadata = await this.extractAndStandardizeMetadata(studyData);
    
    // Link to patient record
    const linkingResult = await this.linkToPatientRecord(metadata, patientId);
    
    // Store images in PACS
    const storageResult = await this.storeInPACS(studyData);
    
    // Create imaging report entry
    const reportEntry = await this.createImagingReportEntry(metadata, storageResult);
    
    // Trigger clinical decision support
    const cdsResults = await this.triggerImagingCDS(metadata, patientId);
    
    return {
      studyInstanceUID: metadata.studyInstanceUID,
      storageResult,
      linkingResult,
      reportEntry,
      cdsResults
    };
  }
  
  async generateImagingReport(
    studyInstanceUID: string, 
    radiologistId: string
  ): Promise<ImagingReport> {
    // Retrieve study data
    const studyData = await this.retrieveStudyData(studyInstanceUID);
    
    // Get AI-assisted findings (if available)
    const aiFindings = await this.getAIAssistedFindings(studyData);
    
    // Create report template
    const reportTemplate = await this.getReportTemplate(studyData.modality, studyData.bodyPart);
    
    // Generate structured report
    const structuredReport = {
      studyInstanceUID,
      radiologistId,
      reportDate: new Date(),
      clinicalHistory: studyData.clinicalHistory,
      technique: studyData.technique,
      findings: aiFindings.suggestedFindings,
      impression: '', // To be filled by radiologist
      recommendations: aiFindings.suggestedRecommendations,
      template: reportTemplate
    };
    
    return structuredReport;
  }
}
```

## Laboratory Integration

### Lab Result Processing

```typescript
interface LaboratoryIntegration {
  // Order management
  createLabOrder(orderData: LabOrderData): Promise<LabOrder>;
  trackOrderStatus(orderId: string): Promise<OrderStatus>;
  
  // Result processing
  processLabResult(resultData: LabResultData): Promise<ProcessingResult>;
  validateResult(result: LabResult): Promise<ValidationResult>;
  
  // Reference ranges
  getReferenceLimits(testCode: string, patientDemographics: PatientDemographics): Promise<ReferenceLimits>;
  flagAbnormalResults(results: LabResult[]): Promise<AbnormalResultFlag[]>;
}

class LaboratoryDataManager {
  async processIncomingLabResults(resultMessage: HL7Message): Promise<LabProcessingResult> {
    // Parse HL7 message
    const parsedMessage = await this.hl7Parser.parse(resultMessage);
    
    // Extract lab results
    const labResults = await this.extractLabResults(parsedMessage);
    
    // Validate results
    const validationResults = await this.validateLabResults(labResults);
    
    // Apply reference ranges
    const resultsWithRanges = await this.applyReferenceRanges(labResults);
    
    // Flag critical values
    const criticalFlags = await this.flagCriticalValues(resultsWithRanges);
    
    // Store results
    const storageResult = await this.storeLabResults(resultsWithRanges);
    
    // Trigger notifications for critical values
    if (criticalFlags.length > 0) {
      await this.notifyCriticalValues(criticalFlags);
    }
    
    // Update patient timeline
    await this.updatePatientTimeline(labResults);
    
    return {
      resultsProcessed: labResults.length,
      validationResults,
      criticalFlags,
      storageResult
    };
  }
  
  async generateLabTrends(
    patientId: string, 
    testCodes: string[], 
    timeRange: TimeRange
  ): Promise<LabTrendAnalysis> {
    const historicalResults = await this.getHistoricalResults(patientId, testCodes, timeRange);
    
    const trends = testCodes.map(testCode => {
      const testResults = historicalResults.filter(r => r.testCode === testCode);
      
      return {
        testCode,
        testName: this.getTestName(testCode),
        values: testResults.map(r => ({
          value: r.value,
          date: r.resultDate,
          referenceRange: r.referenceRange
        })),
        trend: this.calculateTrend(testResults),
        abnormalFlags: testResults.filter(r => r.isAbnormal).length
      };
    });
    
    return {
      patientId,
      timeRange,
      trends,
      summary: this.generateTrendSummary(trends)
    };
  }
}
```

## Care Coordination

### Care Team Management

```typescript
interface CareTeamManagement {
  // Team composition
  createCareTeam(patientId: string, teamMembers: CareTeamMember[]): Promise<CareTeam>;
  updateCareTeam(careTeamId: string, updates: CareTeamUpdate): Promise<CareTeam>;
  
  // Communication
  sendTeamMessage(careTeamId: string, message: TeamMessage): Promise<void>;
  sharePatientUpdate(patientId: string, update: PatientUpdate): Promise<void>;
  
  // Care planning
  createCarePlan(patientId: string, planData: CarePlanData): Promise<CarePlan>;
  updateCarePlan(carePlanId: string, updates: CarePlanUpdate): Promise<CarePlan>;
}

class CareCoordinationService {
  async coordinatePatientCare(
    patientId: string, 
    careEvent: CareEvent
  ): Promise<CoordinationResult> {
    // Identify care team
    const careTeam = await this.getCareTeam(patientId);
    
    // Determine coordination requirements
    const coordinationNeeds = await this.assessCoordinationNeeds(careEvent, careTeam);
    
    // Execute coordination actions
    const coordinationActions = [];
    
    if (coordinationNeeds.requiresNotification) {
      const notifications = await this.notifyCareTeam(careTeam, careEvent);
      coordinationActions.push(...notifications);
    }
    
    if (coordinationNeeds.requiresDataSharing) {
      const sharingResults = await this.shareRelevantData(careTeam, careEvent);
      coordinationActions.push(...sharingResults);
    }
    
    if (coordinationNeeds.requiresCarePlanUpdate) {
      const carePlanUpdate = await this.updateCarePlan(patientId, careEvent);
      coordinationActions.push(carePlanUpdate);
    }
    
    // Log coordination activity
    await this.auditLogger.logCareCoordination({
      patientId,
      careEvent,
      coordinationActions,
      careTeamMembers: careTeam.members.map(m => m.providerId)
    });
    
    return {
      coordinationId: this.generateCoordinationId(),
      careEvent,
      actionsPerformed: coordinationActions,
      coordinationTimestamp: new Date()
    };
  }
}
```

## Data Quality and Validation

### Clinical Data Validation

```typescript
interface ClinicalDataValidator {
  // Data completeness
  validateCompleteness(clinicalData: ClinicalData): Promise<CompletenessReport>;
  
  // Data consistency
  validateConsistency(clinicalData: ClinicalData): Promise<ConsistencyReport>;
  
  // Clinical logic validation
  validateClinicalLogic(clinicalData: ClinicalData): Promise<LogicValidationReport>;
  
  // Terminology validation
  validateTerminology(clinicalData: ClinicalData): Promise<TerminologyValidationReport>;
}

class MedicalRecordValidator {
  async validateMedicalRecord(record: MedicalRecord): Promise<ValidationReport> {
    const validationResults = await Promise.all([
      this.validateDemographics(record.demographics),
      this.validateMedicalHistory(record.medicalHistory),
      this.validateMedications(record.medications),
      this.validateAllergies(record.allergies),
      this.validateVitalSigns(record.vitalSigns),
      this.validateLabResults(record.labResults),
      this.validateProcedures(record.procedures)
    ]);
    
    const overallValidation = this.aggregateValidationResults(validationResults);
    
    return {
      recordId: record.id,
      validationTimestamp: new Date(),
      overallScore: overallValidation.score,
      validationResults,
      errors: overallValidation.errors,
      warnings: overallValidation.warnings,
      recommendations: overallValidation.recommendations
    };
  }
  
  async validateClinicalConsistency(record: MedicalRecord): Promise<ConsistencyReport> {
    const inconsistencies = [];
    
    // Check medication-allergy conflicts
    const medicationAllergyConflicts = await this.checkMedicationAllergyConflicts(
      record.medications, 
      record.allergies
    );
    inconsistencies.push(...medicationAllergyConflicts);
    
    // Check diagnosis-medication alignment
    const diagnosisMedicationAlignment = await this.checkDiagnosisMedicationAlignment(
      record.conditions, 
      record.medications
    );
    inconsistencies.push(...diagnosisMedicationAlignment);
    
    // Check vital signs consistency
    const vitalSignsConsistency = await this.checkVitalSignsConsistency(record.vitalSigns);
    inconsistencies.push(...vitalSignsConsistency);
    
    // Check lab results consistency
    const labResultsConsistency = await this.checkLabResultsConsistency(record.labResults);
    inconsistencies.push(...labResultsConsistency);
    
    return {
      recordId: record.id,
      inconsistencies,
      consistencyScore: this.calculateConsistencyScore(inconsistencies),
      recommendations: this.generateConsistencyRecommendations(inconsistencies)
    };
  }
}
```

## Testing and Quality Assurance

### EHR Integration Testing

```typescript
describe('EHR Integration', () => {
  describe('FHIR Compliance', () => {
    test('should create valid FHIR Patient resource', async () => {
      const patientData = createTestPatientData();
      const fhirPatient = await fhirMapper.mapToFHIRPatient(patientData);
      
      const validationResult = await fhirValidator.validate(fhirPatient);
      expect(validationResult.valid).toBe(true);
      expect(fhirPatient.resourceType).toBe('Patient');
    });
    
    test('should handle FHIR search operations', async () => {
      const searchParams = {
        family: 'Smith',
        given: 'John',
        birthdate: '1980-01-01'
      };
      
      const searchResult = await fhirClient.search('Patient', searchParams);
      
      expect(searchResult.resourceType).toBe('Bundle');
      expect(searchResult.entry).toBeDefined();
    });
  });
  
  describe('Clinical Decision Support', () => {
    test('should detect drug interactions', async () => {
      const medications = [
        createMedication('warfarin'),
        createMedication('aspirin')
      ];
      
      const interactions = await cdsEngine.checkDrugInteractions(medications);
      
      expect(interactions).toHaveLength(1);
      expect(interactions[0].severity).toBe('HIGH');
      expect(interactions[0].interactionType).toBe('BLEEDING_RISK');
    });
    
    test('should provide clinical guideline recommendations', async () => {
      const patientData = createDiabeticPatientData();
      const clinicalContext = createClinicalContext('DIABETES_MANAGEMENT');
      
      const recommendations = await cdsEngine.evaluateGuidelines(patientData, clinicalContext);
      
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0].guidelineId).toContain('DIABETES');
    });
  });
  
  describe('Data Quality', () => {
    test('should validate clinical data completeness', async () => {
      const incompleteRecord = createIncompletePatientRecord();
      
      const validationResult = await dataValidator.validateCompleteness(incompleteRecord);
      
      expect(validationResult.isComplete).toBe(false);
      expect(validationResult.missingFields).toContain('allergies');
    });
    
    test('should detect clinical inconsistencies', async () => {
      const inconsistentRecord = createInconsistentPatientRecord();
      
      const consistencyReport = await dataValidator.validateConsistency(inconsistentRecord);
      
      expect(consistencyReport.inconsistencies.length).toBeGreaterThan(0);
      expect(consistencyReport.consistencyScore).toBeLessThan(0.8);
    });
  });
});
```

This comprehensive medical records template provides the foundation for building interoperable healthcare systems that can effectively exchange clinical data while maintaining quality, consistency, and compliance with healthcare standards.
