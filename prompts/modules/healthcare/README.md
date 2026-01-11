# Healthcare Module

## Purpose
Generate comprehensive healthcare applications with HIPAA compliance, patient data management, medical records integration, and healthcare security patterns for clinical and administrative systems.

## Instructions
1. Analyze healthcare application requirements and regulatory compliance needs
2. Select appropriate healthcare templates based on use case (clinical, administrative, patient-facing)
3. Implement HIPAA-compliant patient data management and privacy controls
4. Build medical records integration with EHR systems and interoperability standards
5. Add healthcare security measures with encryption and access controls
6. Create telemedicine and remote patient monitoring capabilities
7. Implement prescription management and clinical workflow systems
8. Build appointment scheduling and healthcare administration tools
9. Add healthcare analytics with privacy-preserving data analysis
10. Create comprehensive audit trails and compliance reporting

## Examples

### Example 1: HIPAA-Compliant Healthcare Platform
```typescript
// Complete healthcare platform with compliance
class HealthcarePlatform {
  async initializeHealthcarePlatform(config: HealthcareConfig): Promise<Platform> {
    return {
      patientDataManagement: new PatientService(config.patients),
      medicalRecords: new EHRService(config.ehr),
      hipaaCompliance: new ComplianceService(config.compliance),
      telemedicine: new TelemedicineService(config.telehealth),
      prescriptionManagement: new PrescriptionService(config.prescriptions),
      appointmentScheduling: new SchedulingService(config.scheduling)
    };
  }
}
```

### Example 2: Telemedicine Solution
```typescript
// Secure telemedicine platform with video consultations
class TelemedicinePlatform {
  async createTelemedicineServices(config: TelemedicineConfig): Promise<TelemedicineServices> {
    return {
      videoConsultations: new VideoService(config.video),
      patientPortal: new PatientPortalService(config.portal),
      clinicalWorkflows: new WorkflowService(config.workflows),
      prescriptionManagement: new EPrescribingService(config.prescriptions),
      medicalRecords: new RecordsService(config.records)
    };
  }
}
```

### Example 3: Clinical Data Management
```typescript
// Comprehensive clinical data management system
class ClinicalDataManager {
  async setupClinicalSystems(config: ClinicalConfig): Promise<ClinicalSystems> {
    return {
      patientRecords: new PatientRecordsService(config.records),
      clinicalDecisionSupport: new CDSService(config.cds),
      labIntegration: new LabService(config.lab),
      imagingIntegration: new ImagingService(config.imaging),
      pharmacyIntegration: new PharmacyService(config.pharmacy)
    };
  }
}
```

## Variables
| Variable | Type | Description | Default | Required |
|----------|------|-------------|---------|----------|
| complianceLevel | string | Healthcare compliance level | 'hipaa' | Yes |
| patientDataSecurity | string | Patient data security level | 'high' | Yes |
| ehrIntegration | boolean | EHR system integration | true | No |
| telemedicineSupport | boolean | Telemedicine capabilities | false | No |
| prescriptionManagement | boolean | E-prescribing features | false | No |
| appointmentScheduling | boolean | Scheduling system | true | No |
| mobileHealthSupport | boolean | Mobile health applications | false | No |
| clinicalDecisionSupport | boolean | Clinical decision tools | false | No |
| auditLogging | boolean | Comprehensive audit trails | true | Yes |
| dataInteroperability | boolean | Healthcare data standards | true | No |

## Expected Output
A comprehensive healthcare solution featuring:
- HIPAA-compliant patient data management with privacy controls and audit trails
- Medical records integration with EHR systems and interoperability standards
- Telemedicine platform with secure video consultations and remote monitoring
- Prescription management with e-prescribing and pharmacy integration
- Appointment scheduling with provider availability and patient self-service
- Healthcare security with end-to-end encryption and role-based access
- Clinical workflows with decision support and care coordination
- Patient portal with secure messaging and health record access
- Healthcare analytics with privacy-preserving data analysis
- Regulatory compliance with automated reporting and breach notification

This module contains comprehensive healthcare application templates covering patient data management, HIPAA compliance, medical records integration, and healthcare security patterns.

## Templates

- **patient-data-management.md** - HIPAA-compliant patient records management
- **hipaa-compliance.md** - Privacy controls and audit requirements
- **medical-records.md** - EHR integration and data interoperability
- **healthcare-security.md** - Encryption and access controls

## Compliance Focus

All templates in this module are designed with healthcare compliance in mind, particularly:
- HIPAA (Health Insurance Portability and Accountability Act)
- HITECH (Health Information Technology for Economic and Clinical Health)
- FDA regulations for medical software
- State and international healthcare privacy laws

## Security Considerations

Healthcare applications require the highest levels of security and privacy protection. These templates emphasize:
- End-to-end encryption
- Role-based access controls
- Audit logging
- Data minimization
- Consent management
- Breach notification procedures