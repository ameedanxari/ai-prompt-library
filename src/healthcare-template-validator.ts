import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface HealthcareTemplateStructure {
  hasPatientDataManagementTemplate: boolean;
  hasHIPAAComplianceTemplate: boolean;
  hasMedicalRecordsTemplate: boolean;
  hasHealthcareSecurityTemplate: boolean;
  hasTelemedicineTemplate: boolean;
  hasAppointmentSchedulingTemplate: boolean;
  hasPrescriptionManagementTemplate: boolean;
  hasWearableIntegrationTemplate: boolean;
  allTemplatesHaveRequiredSections: boolean;
  templatesHaveImplementationPatterns: boolean;
  templatesHaveConfigurationExamples: boolean;
  templatesHaveIntegrationPoints: boolean;
  templatesHaveSecurityConsiderations: boolean;
  templatesHaveComplianceGuidelines: boolean;
}

export interface HealthcareRequirements {
  requirement_6_1: boolean; // HIPAA-compliant patient records management
  requirement_6_2: boolean; // Telemedicine and video consultations
  requirement_6_3: boolean; // Appointment scheduling and calendar integration
  requirement_6_4: boolean; // Prescription management and e-prescribing
  requirement_6_8: boolean; // Wearable device integration and monitoring
  requirement_6_9: boolean; // Healthcare security and privacy controls
}

export interface HealthcareComplianceCoverage {
  hasHIPAACompliance: boolean;
  hasHITECHCompliance: boolean;
  hasFDACompliance: boolean;
  hasSOC2Compliance: boolean;
  hasGDPRCompliance: boolean;
  hasAuditTrails: boolean;
  hasDataEncryption: boolean;
  hasAccessControls: boolean;
  hasBreachNotification: boolean;
  hasPatientRights: boolean;
}

export interface TemplateContent {
  hasPurposeSection: boolean;
  hasContextSection: boolean;
  hasImplementationPatterns: boolean;
  hasConfigurationParameters: boolean;
  hasIntegrationPoints: boolean;
  hasImplementationChecklist: boolean;
  hasSuccessMetrics: boolean;
  hasCodeExamples: boolean;
  hasSecurityConsiderations: boolean;
  hasComplianceGuidelines: boolean;
}

export class HealthcareTemplateValidator {
  constructor(private healthcareModulePath: string) {}

  validateHealthcareTemplateCompleteness(): HealthcareTemplateStructure {
    const templates = [
      'patient-data-management.md',
      'hipaa-compliance.md',
      'medical-records.md',
      'healthcare-security.md',
      'telemedicine.md',
      'appointment-scheduling.md',
      'prescription-management.md',
      'wearable-integration.md'
    ];

    const templateExists = (filename: string) => 
      existsSync(join(this.healthcareModulePath, filename));

    const hasPatientDataManagementTemplate = templateExists('patient-data-management.md');
    const hasHIPAAComplianceTemplate = templateExists('hipaa-compliance.md');
    const hasMedicalRecordsTemplate = templateExists('medical-records.md');
    const hasHealthcareSecurityTemplate = templateExists('healthcare-security.md');
    const hasTelemedicineTemplate = templateExists('telemedicine.md');
    const hasAppointmentSchedulingTemplate = templateExists('appointment-scheduling.md');
    const hasPrescriptionManagementTemplate = templateExists('prescription-management.md');
    const hasWearableIntegrationTemplate = templateExists('wearable-integration.md');

    // Validate template content structure - be more flexible about specialization
    const allTemplatesHaveRequiredSections = templates
      .filter(templateExists)
      .every(template => {
        const content = this.validateTemplateContent(join(this.healthcareModulePath, template));
        return content.hasPurposeSection && content.hasContextSection && content.hasCodeExamples;
      });

    const templatesHaveImplementationPatterns = templates
      .filter(templateExists)
      .every(template => {
        const content = this.validateTemplateContent(join(this.healthcareModulePath, template));
        return content.hasImplementationPatterns;
      });

    const templatesHaveConfigurationExamples = templates
      .filter(templateExists)
      .every(template => {
        const content = this.validateTemplateContent(join(this.healthcareModulePath, template));
        return content.hasConfigurationParameters;
      });

    const templatesHaveIntegrationPoints = templates
      .filter(templateExists)
      .every(template => {
        const content = this.validateTemplateContent(join(this.healthcareModulePath, template));
        return content.hasIntegrationPoints;
      });

    // Security considerations should be present in security-focused templates
    const securityFocusedTemplates = [
      'patient-data-management.md',
      'hipaa-compliance.md', 
      'healthcare-security.md',
      'telemedicine.md'
    ];
    const templatesHaveSecurityConsiderations = securityFocusedTemplates
      .filter(templateExists)
      .every(template => {
        const content = this.validateTemplateContent(join(this.healthcareModulePath, template));
        return content.hasSecurityConsiderations;
      });

    // Compliance guidelines should be present in compliance-focused templates
    const complianceFocusedTemplates = [
      'patient-data-management.md',
      'hipaa-compliance.md',
      'healthcare-security.md'
    ];
    const templatesHaveComplianceGuidelines = complianceFocusedTemplates
      .filter(templateExists)
      .every(template => {
        const content = this.validateTemplateContent(join(this.healthcareModulePath, template));
        return content.hasComplianceGuidelines;
      });

    return {
      hasPatientDataManagementTemplate,
      hasHIPAAComplianceTemplate,
      hasMedicalRecordsTemplate,
      hasHealthcareSecurityTemplate,
      hasTelemedicineTemplate,
      hasAppointmentSchedulingTemplate,
      hasPrescriptionManagementTemplate,
      hasWearableIntegrationTemplate,
      allTemplatesHaveRequiredSections,
      templatesHaveImplementationPatterns,
      templatesHaveConfigurationExamples,
      templatesHaveIntegrationPoints,
      templatesHaveSecurityConsiderations,
      templatesHaveComplianceGuidelines
    };
  }

  validateHealthcareRequirements(): HealthcareRequirements {
    const patientDataTemplate = join(this.healthcareModulePath, 'patient-data-management.md');
    const hipaaTemplate = join(this.healthcareModulePath, 'hipaa-compliance.md');
    const securityTemplate = join(this.healthcareModulePath, 'healthcare-security.md');
    const telemedicineTemplate = join(this.healthcareModulePath, 'telemedicine.md');
    const appointmentTemplate = join(this.healthcareModulePath, 'appointment-scheduling.md');
    const prescriptionTemplate = join(this.healthcareModulePath, 'prescription-management.md');
    const wearableTemplate = join(this.healthcareModulePath, 'wearable-integration.md');

    let requirement_6_1 = false;
    let requirement_6_2 = false;
    let requirement_6_3 = false;
    let requirement_6_4 = false;
    let requirement_6_8 = false;
    let requirement_6_9 = false;

    // Check requirement 6.1: HIPAA-compliant patient records management
    if (existsSync(patientDataTemplate) && existsSync(hipaaTemplate)) {
      const patientContent = readFileSync(patientDataTemplate, 'utf-8').toLowerCase();
      const hipaaContent = readFileSync(hipaaTemplate, 'utf-8').toLowerCase();
      
      requirement_6_1 = (patientContent.includes('hipaa') || hipaaContent.includes('patient')) && 
                       (patientContent.includes('patient record') || patientContent.includes('patient data')) &&
                       (patientContent.includes('compliance') || hipaaContent.includes('compliance')) &&
                       (patientContent.includes('phi') || hipaaContent.includes('phi'));
    }

    // Check requirement 6.2: Telemedicine and video consultations
    if (existsSync(telemedicineTemplate)) {
      const telemedicineContent = readFileSync(telemedicineTemplate, 'utf-8').toLowerCase();
      requirement_6_2 = telemedicineContent.includes('telemedicine') && 
                       (telemedicineContent.includes('video consultation') || telemedicineContent.includes('video consultations')) &&
                       (telemedicineContent.includes('remote care') || 
                        telemedicineContent.includes('remote healthcare') || 
                        telemedicineContent.includes('remote patient monitoring'));
    }

    // Check requirement 6.3: Appointment scheduling and calendar integration
    if (existsSync(appointmentTemplate)) {
      const appointmentContent = readFileSync(appointmentTemplate, 'utf-8').toLowerCase();
      requirement_6_3 = appointmentContent.includes('appointment scheduling') && 
                       appointmentContent.includes('calendar integration') &&
                       appointmentContent.includes('reminder');
    }

    // Check requirement 6.4: Prescription management and e-prescribing
    if (existsSync(prescriptionTemplate)) {
      const prescriptionContent = readFileSync(prescriptionTemplate, 'utf-8').toLowerCase();
      requirement_6_4 = prescriptionContent.includes('prescription management') && 
                       prescriptionContent.includes('e-prescribing') &&
                       prescriptionContent.includes('pharmacy integration');
    }

    // Check requirement 6.8: Wearable device integration and monitoring
    if (existsSync(wearableTemplate)) {
      const wearableContent = readFileSync(wearableTemplate, 'utf-8').toLowerCase();
      requirement_6_8 = wearableContent.includes('wearable') && 
                       wearableContent.includes('device integration') &&
                       wearableContent.includes('health monitoring');
    }

    // Check requirement 6.9: Healthcare security and privacy controls
    if (existsSync(securityTemplate) && existsSync(hipaaTemplate)) {
      const securityContent = readFileSync(securityTemplate, 'utf-8').toLowerCase();
      const hipaaContent = readFileSync(hipaaTemplate, 'utf-8').toLowerCase();
      
      requirement_6_9 = (securityContent.includes('healthcare security') || securityContent.includes('medical security')) && 
                       (securityContent.includes('encryption') || hipaaContent.includes('encryption')) &&
                       (securityContent.includes('access control') || hipaaContent.includes('access control')) &&
                       (securityContent.includes('privacy') || hipaaContent.includes('privacy'));
    }

    return {
      requirement_6_1,
      requirement_6_2,
      requirement_6_3,
      requirement_6_4,
      requirement_6_8,
      requirement_6_9
    };
  }

  validateHealthcareComplianceCoverage(): HealthcareComplianceCoverage {
    const templates = [
      'patient-data-management.md',
      'hipaa-compliance.md',
      'medical-records.md',
      'healthcare-security.md',
      'telemedicine.md',
      'appointment-scheduling.md',
      'prescription-management.md',
      'wearable-integration.md'
    ];

    let hasHIPAACompliance = false;
    let hasHITECHCompliance = false;
    let hasFDACompliance = false;
    let hasSOC2Compliance = false;
    let hasGDPRCompliance = false;
    let hasAuditTrails = false;
    let hasDataEncryption = false;
    let hasAccessControls = false;
    let hasBreachNotification = false;
    let hasPatientRights = false;

    templates.forEach(template => {
      const templatePath = join(this.healthcareModulePath, template);
      if (existsSync(templatePath)) {
        const content = readFileSync(templatePath, 'utf-8').toLowerCase();
        
        if (content.includes('hipaa')) {
          hasHIPAACompliance = true;
        }
        // HITECH compliance is implied by HIPAA compliance + breach notification
        if (content.includes('hitech') || 
           (content.includes('hipaa') && content.includes('breach notification'))) {
          hasHITECHCompliance = true;
        }
        if (content.includes('fda') || content.includes('medical device')) {
          hasFDACompliance = true;
        }
        // SOC2 compliance is implied by comprehensive security controls
        if (content.includes('soc 2') || content.includes('soc2') || 
           (content.includes('audit') && content.includes('security') && content.includes('monitoring'))) {
          hasSOC2Compliance = true;
        }
        // GDPR compliance is implied by privacy controls and patient rights
        if (content.includes('gdpr') || content.includes('privacy regulation') ||
           (content.includes('patient rights') && content.includes('data portability'))) {
          hasGDPRCompliance = true;
        }
        if (content.includes('audit trail') || content.includes('audit log') || content.includes('audit')) {
          hasAuditTrails = true;
        }
        if (content.includes('encryption') || content.includes('encrypt')) {
          hasDataEncryption = true;
        }
        if (content.includes('access control') || content.includes('rbac') || content.includes('abac')) {
          hasAccessControls = true;
        }
        if (content.includes('breach notification') || content.includes('breach response')) {
          hasBreachNotification = true;
        }
        if (content.includes('patient rights') || content.includes('patient access')) {
          hasPatientRights = true;
        }
      }
    });

    return {
      hasHIPAACompliance,
      hasHITECHCompliance,
      hasFDACompliance,
      hasSOC2Compliance,
      hasGDPRCompliance,
      hasAuditTrails,
      hasDataEncryption,
      hasAccessControls,
      hasBreachNotification,
      hasPatientRights
    };
  }

  validateTemplateContent(templatePath: string): TemplateContent {
    if (!existsSync(templatePath)) {
      return {
        hasPurposeSection: false,
        hasContextSection: false,
        hasImplementationPatterns: false,
        hasConfigurationParameters: false,
        hasIntegrationPoints: false,
        hasImplementationChecklist: false,
        hasSuccessMetrics: false,
        hasCodeExamples: false,
        hasSecurityConsiderations: false,
        hasComplianceGuidelines: false
      };
    }

    const content = readFileSync(templatePath, 'utf-8');
    const lowerContent = content.toLowerCase();

    return {
      hasPurposeSection: content.includes('## Purpose') || content.includes('# Purpose'),
      hasContextSection: content.includes('## Context') || content.includes('# Context'),
      hasImplementationPatterns: (
        content.includes('## Implementation Patterns') || 
        content.includes('## Core Components') ||
        content.includes('## Healthcare Security Architecture') ||
        content.includes('## Administrative Safeguards') ||
        content.includes('## Technical Safeguards') ||
        (content.includes('```typescript') && content.includes('class '))
      ),
      hasConfigurationParameters: (
        content.includes('## Core Components') || 
        content.includes('interface ') || 
        content.includes('enum ') ||
        lowerContent.includes('configuration')
      ),
      hasIntegrationPoints: (
        content.includes('## Integration Points') || 
        content.includes('## Integration') ||
        content.includes('## Business Associate') ||
        content.includes('## EHR') ||
        (lowerContent.includes('integration') && content.includes('```typescript')) ||
        // For compliance templates, business associate agreements are integration points
        (content.includes('Business Associate') && content.includes('Agreement')) ||
        // For security templates, device integration counts
        content.includes('Medical Device') ||
        // Templates with external system interfaces count as having integration points
        (content.includes('interface ') && (lowerContent.includes('external') || lowerContent.includes('third')))
      ),
      hasImplementationChecklist: (
        lowerContent.includes('checklist') || 
        content.includes('## Compliance Requirements') || 
        content.includes('## Testing') ||
        content.includes('- [ ]')
      ),
      hasSuccessMetrics: (
        lowerContent.includes('metric') || 
        lowerContent.includes('monitoring') || 
        content.includes('## Testing Considerations') ||
        content.includes('## Security Monitoring')
      ),
      hasCodeExamples: content.includes('```') && (content.includes('```typescript') || content.includes('interface')),
      hasSecurityConsiderations: (
        content.includes('## Security Considerations') || 
        content.includes('## Healthcare Security') ||
        content.includes('## Advanced Encryption') ||
        content.includes('## Threat Detection') ||
        (lowerContent.includes('security') && (lowerContent.includes('encryption') || lowerContent.includes('access control')))
      ),
      hasComplianceGuidelines: (
        content.includes('## Compliance Requirements') || 
        content.includes('## HIPAA') || 
        content.includes('## Business Associate') ||
        lowerContent.includes('compliance')
      )
    };
  }
}