import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface IoTConnectivityTemplateStructure {
  hasDeviceConnectivityTemplate: boolean;
  hasDeviceManagementTemplate: boolean;
  hasIoTSecurityTemplate: boolean;
  hasEdgeComputingTemplate: boolean;
  allTemplatesHaveRequiredSections: boolean;
  templatesHaveImplementationPatterns: boolean;
  templatesHaveConfigurationExamples: boolean;
  templatesHaveIntegrationPoints: boolean;
  templatesHaveDataModels: boolean;
}

export interface IoTAutomationTemplateStructure {
  hasSensorDataProcessingTemplate: boolean;
  hasIoTAutomationTemplate: boolean;
  hasIndustrialIoTTemplate: boolean;
  hasIoTAnalyticsTemplate: boolean;
  allTemplatesHaveRequiredSections: boolean;
  templatesHaveImplementationPatterns: boolean;
  templatesHaveConfigurationExamples: boolean;
  templatesHaveIntegrationPoints: boolean;
  templatesHaveDataModels: boolean;
}

export interface IoTTemplateContent {
  hasPurposeSection: boolean;
  hasContextSection: boolean;
  hasImplementationPatterns: boolean;
  hasConfigurationParameters: boolean;
  hasIntegrationPoints: boolean;
  hasTestingConsiderations: boolean;
  hasSecurityConsiderations: boolean;
  hasComplianceGuidelines: boolean;
  hasCodeExamples: boolean;
  hasDataModels: boolean;
}

export class IoTTemplateValidator {
  private iotModulePath: string;

  constructor(iotModulePath: string = 'prompts/modules/iot') {
    this.iotModulePath = iotModulePath;
  }

  validateConnectivityTemplates(): IoTConnectivityTemplateStructure {
    const connectivityTemplates = [
      'device-connectivity.md',
      'device-management.md',
      'iot-security.md',
      'edge-computing.md'
    ];

    const templateExists = (filename: string) =>
      existsSync(join(this.iotModulePath, filename));

    const hasDeviceConnectivityTemplate = templateExists('device-connectivity.md');
    const hasDeviceManagementTemplate = templateExists('device-management.md');
    const hasIoTSecurityTemplate = templateExists('iot-security.md');
    const hasEdgeComputingTemplate = templateExists('edge-computing.md');

    // Validate content quality for existing templates
    let allTemplatesHaveRequiredSections = true;
    let templatesHaveImplementationPatterns = true;
    let templatesHaveConfigurationExamples = true;
    let templatesHaveIntegrationPoints = true;
    let templatesHaveDataModels = true;

    for (const template of connectivityTemplates) {
      const templatePath = join(this.iotModulePath, template);
      if (existsSync(templatePath)) {
        const content = this.validateTemplateContent(templatePath);

        if (!content.hasPurposeSection || !content.hasContextSection) {
          allTemplatesHaveRequiredSections = false;
        }

        if (!content.hasImplementationPatterns || !content.hasCodeExamples) {
          templatesHaveImplementationPatterns = false;
        }

        if (!content.hasConfigurationParameters) {
          templatesHaveConfigurationExamples = false;
        }

        if (!content.hasIntegrationPoints) {
          templatesHaveIntegrationPoints = false;
        }

        if (!content.hasDataModels) {
          templatesHaveDataModels = false;
        }
      }
    }

    return {
      hasDeviceConnectivityTemplate,
      hasDeviceManagementTemplate,
      hasIoTSecurityTemplate,
      hasEdgeComputingTemplate,
      allTemplatesHaveRequiredSections,
      templatesHaveImplementationPatterns,
      templatesHaveConfigurationExamples,
      templatesHaveIntegrationPoints,
      templatesHaveDataModels
    };
  }

  validateAutomationTemplates(): IoTAutomationTemplateStructure {
    const automationTemplates = [
      'sensor-data-processing.md',
      'iot-automation.md',
      'industrial-iot.md',
      'iot-analytics.md'
    ];

    const templateExists = (filename: string) =>
      existsSync(join(this.iotModulePath, filename));

    const hasSensorDataProcessingTemplate = templateExists('sensor-data-processing.md');
    const hasIoTAutomationTemplate = templateExists('iot-automation.md');
    const hasIndustrialIoTTemplate = templateExists('industrial-iot.md');
    const hasIoTAnalyticsTemplate = templateExists('iot-analytics.md');

    // Validate content quality for existing templates
    let allTemplatesHaveRequiredSections = true;
    let templatesHaveImplementationPatterns = true;
    let templatesHaveConfigurationExamples = true;
    let templatesHaveIntegrationPoints = true;
    let templatesHaveDataModels = true;

    for (const template of automationTemplates) {
      const templatePath = join(this.iotModulePath, template);
      if (existsSync(templatePath)) {
        const content = this.validateTemplateContent(templatePath);

        if (!content.hasPurposeSection || !content.hasContextSection) {
          allTemplatesHaveRequiredSections = false;
        }

        if (!content.hasImplementationPatterns || !content.hasCodeExamples) {
          templatesHaveImplementationPatterns = false;
        }

        if (!content.hasConfigurationParameters) {
          templatesHaveConfigurationExamples = false;
        }

        if (!content.hasIntegrationPoints) {
          templatesHaveIntegrationPoints = false;
        }

        if (!content.hasDataModels) {
          templatesHaveDataModels = false;
        }
      }
    }

    return {
      hasSensorDataProcessingTemplate,
      hasIoTAutomationTemplate,
      hasIndustrialIoTTemplate,
      hasIoTAnalyticsTemplate,
      allTemplatesHaveRequiredSections,
      templatesHaveImplementationPatterns,
      templatesHaveConfigurationExamples,
      templatesHaveIntegrationPoints,
      templatesHaveDataModels
    };
  }

  validateTemplateContent(templatePath: string): IoTTemplateContent {
    if (!existsSync(templatePath)) {
      return this.getEmptyTemplateContent();
    }

    const content = readFileSync(templatePath, 'utf-8');

    return {
      hasPurposeSection: this.hasSection(content, 'Purpose'),
      hasContextSection: this.hasSection(content, 'Context'),
      hasImplementationPatterns: this.hasSection(content, 'Implementation Patterns') ||
        this.hasSection(content, 'Implementation') ||
        this.hasSection(content, 'Core.*Patterns'),
      hasConfigurationParameters: this.hasSection(content, 'Configuration') ||
        this.hasSection(content, 'Variables') ||
        this.hasCodeExamples(content),
      hasIntegrationPoints: this.hasSection(content, 'Integration Points') ||
        this.hasSection(content, 'Integration'),
      hasTestingConsiderations: this.hasSection(content, 'Testing Considerations') ||
        this.hasSection(content, 'Testing'),
      hasSecurityConsiderations: this.hasSecurityConsiderations(content),
      hasComplianceGuidelines: this.hasSection(content, 'Compliance') ||
        this.hasComplianceContent(content),
      hasCodeExamples: this.hasCodeExamples(content),
      hasDataModels: this.hasDataModels(content)
    };
  }

  private hasSection(content: string, sectionName: string): boolean {
    const sectionRegex = new RegExp(`##\\s*${sectionName}`, 'i');
    return sectionRegex.test(content);
  }

  private hasCodeExamples(content: string): boolean {
    const codeBlockRegex = /```[\s\S]*?```/;
    const interfaceRegex = /interface\s+\w+/;
    const classRegex = /class\s+\w+/;
    const functionRegex = /function\s+\w+|async\s+function\s+\w+/;

    return codeBlockRegex.test(content) ||
      interfaceRegex.test(content) ||
      classRegex.test(content) ||
      functionRegex.test(content);
  }

  private hasSecurityConsiderations(content: string): boolean {
    const securityKeywords = [
      'security', 'encryption', 'authentication', 'authorization',
      'certificate', 'tls', 'ssl', 'secure', 'access control',
      'threat', 'vulnerability', 'protection', 'privacy'
    ];

    const contentLower = content.toLowerCase();
    return securityKeywords.some(keyword => contentLower.includes(keyword));
  }

  private hasComplianceContent(content: string): boolean {
    const complianceKeywords = [
      'compliance', 'regulatory', 'nist', 'iec', 'etsi',
      'industrial', 'safety', 'audit', 'certification'
    ];

    const contentLower = content.toLowerCase();
    return complianceKeywords.some(keyword => contentLower.includes(keyword));
  }

  private hasDataModels(content: string): boolean {
    const dataModelPatterns = [
      /interface\s+\w+/g,
      /class\s+\w+/g,
      /enum\s+\w+/g,
      /type\s+\w+\s*=/g
    ];

    return dataModelPatterns.some(pattern => pattern.test(content));
  }

  private getEmptyTemplateContent(): IoTTemplateContent {
    return {
      hasPurposeSection: false,
      hasContextSection: false,
      hasImplementationPatterns: false,
      hasConfigurationParameters: false,
      hasIntegrationPoints: false,
      hasTestingConsiderations: false,
      hasSecurityConsiderations: false,
      hasComplianceGuidelines: false,
      hasCodeExamples: false,
      hasDataModels: false
    };
  }

  // Validate requirements 14.1, 14.3, 14.7, 14.6 for connectivity templates
  validateConnectivityRequirements(): {
    requirement_14_1: boolean; // Device discovery, pairing, connection management, authentication
    requirement_14_3: boolean; // Device monitoring, firmware updates, configuration, remote control
    requirement_14_6: boolean; // Edge processing, local storage, offline operation, edge-to-cloud sync
    requirement_14_7: boolean; // Device certificates, secure communication, access controls, monitoring
  } {
    const structure = this.validateConnectivityTemplates();

    // Requirement 14.1: Device discovery, pairing workflows, connection management, device authentication
    const requirement_14_1 = structure.hasDeviceConnectivityTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 14.3: Device monitoring, firmware updates, configuration management, remote control
    const requirement_14_3 = structure.hasDeviceManagementTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 14.6: Edge processing, local storage, offline operation, edge-to-cloud sync
    const requirement_14_6 = structure.hasEdgeComputingTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 14.7: Device certificates, secure communication, access controls, security monitoring
    const requirement_14_7 = structure.hasIoTSecurityTemplate &&
      structure.templatesHaveImplementationPatterns;

    return {
      requirement_14_1,
      requirement_14_3,
      requirement_14_6,
      requirement_14_7
    };
  }

  // Validate requirements 14.2, 14.4, 14.10 for automation templates
  validateAutomationRequirements(): {
    requirement_14_2: boolean; // Sensor data ingestion, validation, real-time processing, storage
    requirement_14_4: boolean; // Rule engines, trigger systems, scene management, scheduling
    requirement_14_10: boolean; // Industrial protocols, safety systems, predictive maintenance, compliance
  } {
    const structure = this.validateAutomationTemplates();

    // Requirement 14.2: Sensor data ingestion, data validation, real-time processing, data storage
    const requirement_14_2 = structure.hasSensorDataProcessingTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 14.4: Rule engines, trigger systems, scene management, scheduling
    const requirement_14_4 = structure.hasIoTAutomationTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 14.10: Industrial protocols, safety systems, predictive maintenance, compliance
    const requirement_14_10 = structure.hasIndustrialIoTTemplate &&
      structure.hasIoTAnalyticsTemplate &&
      structure.templatesHaveImplementationPatterns;

    return {
      requirement_14_2,
      requirement_14_4,
      requirement_14_10
    };
  }

  // Validate IoT feature coverage
  validateIoTFeatureCoverage(): {
    hasDeviceConnectivity: boolean;
    hasDeviceManagement: boolean;
    hasIoTSecurity: boolean;
    hasEdgeComputing: boolean;
    hasSensorDataProcessing: boolean;
    hasIoTAutomation: boolean;
    hasIndustrialIoT: boolean;
    hasIoTAnalytics: boolean;
  } {
    const connectivityPath = join(this.iotModulePath, 'device-connectivity.md');
    const managementPath = join(this.iotModulePath, 'device-management.md');
    const securityPath = join(this.iotModulePath, 'iot-security.md');
    const edgePath = join(this.iotModulePath, 'edge-computing.md');
    const sensorPath = join(this.iotModulePath, 'sensor-data-processing.md');
    const automationPath = join(this.iotModulePath, 'iot-automation.md');
    const industrialPath = join(this.iotModulePath, 'industrial-iot.md');
    const analyticsPath = join(this.iotModulePath, 'iot-analytics.md');

    let hasDeviceConnectivity = false;
    let hasDeviceManagement = false;
    let hasIoTSecurity = false;
    let hasEdgeComputing = false;
    let hasSensorDataProcessing = false;
    let hasIoTAutomation = false;
    let hasIndustrialIoT = false;
    let hasIoTAnalytics = false;

    if (existsSync(connectivityPath)) {
      const content = readFileSync(connectivityPath, 'utf-8').toLowerCase();
      hasDeviceConnectivity = content.includes('discovery') &&
        (content.includes('pairing') || content.includes('connection'));
    }

    if (existsSync(managementPath)) {
      const content = readFileSync(managementPath, 'utf-8').toLowerCase();
      hasDeviceManagement = content.includes('monitoring') &&
        (content.includes('firmware') || content.includes('update'));
    }

    if (existsSync(securityPath)) {
      const content = readFileSync(securityPath, 'utf-8').toLowerCase();
      hasIoTSecurity = content.includes('certificate') &&
        (content.includes('secure') || content.includes('authentication'));
    }

    if (existsSync(edgePath)) {
      const content = readFileSync(edgePath, 'utf-8').toLowerCase();
      hasEdgeComputing = content.includes('edge') &&
        (content.includes('processing') || content.includes('sync'));
    }

    if (existsSync(sensorPath)) {
      const content = readFileSync(sensorPath, 'utf-8').toLowerCase();
      hasSensorDataProcessing = content.includes('sensor') &&
        (content.includes('data') || content.includes('processing'));
    }

    if (existsSync(automationPath)) {
      const content = readFileSync(automationPath, 'utf-8').toLowerCase();
      hasIoTAutomation = content.includes('automation') &&
        (content.includes('rule') || content.includes('trigger'));
    }

    if (existsSync(industrialPath)) {
      const content = readFileSync(industrialPath, 'utf-8').toLowerCase();
      hasIndustrialIoT = content.includes('industrial') &&
        (content.includes('protocol') || content.includes('safety'));
    }

    if (existsSync(analyticsPath)) {
      const content = readFileSync(analyticsPath, 'utf-8').toLowerCase();
      hasIoTAnalytics = content.includes('analytics') &&
        (content.includes('performance') || content.includes('predictive'));
    }

    return {
      hasDeviceConnectivity,
      hasDeviceManagement,
      hasIoTSecurity,
      hasEdgeComputing,
      hasSensorDataProcessing,
      hasIoTAutomation,
      hasIndustrialIoT,
      hasIoTAnalytics
    };
  }
}
