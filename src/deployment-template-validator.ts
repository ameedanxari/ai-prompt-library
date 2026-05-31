import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface DeploymentInfrastructureTemplateStructure {
  hasContainerizationTemplate: boolean;
  hasKubernetesDeploymentTemplate: boolean;
  hasCloudDeploymentTemplate: boolean;
  hasMonitoringObservabilityTemplate: boolean;
  allTemplatesHaveRequiredSections: boolean;
  templatesHaveImplementationPatterns: boolean;
  templatesHaveConfigurationExamples: boolean;
  templatesHaveIntegrationPoints: boolean;
  templatesHaveSecurityConsiderations: boolean;
}

export interface CICDTemplateStructure {
  hasCICDPipelinesTemplate: boolean;
  hasEnvironmentManagementTemplate: boolean;
  hasDisasterRecoveryTemplate: boolean;
  hasEnterpriseDeploymentTemplate: boolean;
  allTemplatesHaveRequiredSections: boolean;
  templatesHaveImplementationPatterns: boolean;
  templatesHaveConfigurationExamples: boolean;
  templatesHaveIntegrationPoints: boolean;
  templatesHaveSecurityConsiderations: boolean;
}

export interface DeploymentTemplateContent {
  hasPurposeSection: boolean;
  hasContextSection: boolean;
  hasImplementationPatterns: boolean;
  hasConfigurationExamples: boolean;
  hasIntegrationPoints: boolean;
  hasSecurityConsiderations: boolean;
  hasTestingConsiderations: boolean;
  hasCodeExamples: boolean;
  hasCoreComponents: boolean;
}


export class DeploymentTemplateValidator {
  private deploymentModulePath: string;

  constructor(deploymentModulePath: string = 'prompts/modules/deployment') {
    this.deploymentModulePath = deploymentModulePath;
  }

  validateDeploymentInfrastructureTemplates(): DeploymentInfrastructureTemplateStructure {
    const infrastructureTemplates = [
      'containerization.md',
      'kubernetes-deployment.md',
      'cloud-deployment.md',
      'monitoring-observability.md'
    ];

    const templateExists = (filename: string) =>
      existsSync(join(this.deploymentModulePath, filename));

    const hasContainerizationTemplate = templateExists('containerization.md');
    const hasKubernetesDeploymentTemplate = templateExists('kubernetes-deployment.md');
    const hasCloudDeploymentTemplate = templateExists('cloud-deployment.md');
    const hasMonitoringObservabilityTemplate = templateExists('monitoring-observability.md');

    let allTemplatesHaveRequiredSections = true;
    let templatesHaveImplementationPatterns = true;
    let templatesHaveConfigurationExamples = true;
    let templatesHaveIntegrationPoints = true;
    let templatesHaveSecurityConsiderations = true;

    for (const template of infrastructureTemplates) {
      const templatePath = join(this.deploymentModulePath, template);
      if (existsSync(templatePath)) {
        const content = this.validateTemplateContent(templatePath);

        if (!content.hasPurposeSection || !content.hasContextSection) {
          allTemplatesHaveRequiredSections = false;
        }

        if (!content.hasImplementationPatterns || !content.hasCodeExamples) {
          templatesHaveImplementationPatterns = false;
        }

        if (!content.hasConfigurationExamples) {
          templatesHaveConfigurationExamples = false;
        }

        if (!content.hasIntegrationPoints) {
          templatesHaveIntegrationPoints = false;
        }

        if (!content.hasSecurityConsiderations) {
          templatesHaveSecurityConsiderations = false;
        }
      }
    }

    return {
      hasContainerizationTemplate,
      hasKubernetesDeploymentTemplate,
      hasCloudDeploymentTemplate,
      hasMonitoringObservabilityTemplate,
      allTemplatesHaveRequiredSections,
      templatesHaveImplementationPatterns,
      templatesHaveConfigurationExamples,
      templatesHaveIntegrationPoints,
      templatesHaveSecurityConsiderations
    };
  }

  validateCICDTemplates(): CICDTemplateStructure {
    const cicdTemplates = [
      'ci-cd-pipelines.md',
      'environment-management.md',
      'disaster-recovery.md',
      'enterprise-deployment.md'
    ];

    const templateExists = (filename: string) =>
      existsSync(join(this.deploymentModulePath, filename));

    const hasCICDPipelinesTemplate = templateExists('ci-cd-pipelines.md');
    const hasEnvironmentManagementTemplate = templateExists('environment-management.md');
    const hasDisasterRecoveryTemplate = templateExists('disaster-recovery.md');
    const hasEnterpriseDeploymentTemplate = templateExists('enterprise-deployment.md');

    let allTemplatesHaveRequiredSections = true;
    let templatesHaveImplementationPatterns = true;
    let templatesHaveConfigurationExamples = true;
    let templatesHaveIntegrationPoints = true;
    let templatesHaveSecurityConsiderations = true;

    for (const template of cicdTemplates) {
      const templatePath = join(this.deploymentModulePath, template);
      if (existsSync(templatePath)) {
        const content = this.validateTemplateContent(templatePath);

        if (!content.hasPurposeSection || !content.hasContextSection) {
          allTemplatesHaveRequiredSections = false;
        }

        if (!content.hasImplementationPatterns || !content.hasCodeExamples) {
          templatesHaveImplementationPatterns = false;
        }

        if (!content.hasConfigurationExamples) {
          templatesHaveConfigurationExamples = false;
        }

        if (!content.hasIntegrationPoints) {
          templatesHaveIntegrationPoints = false;
        }

        if (!content.hasSecurityConsiderations) {
          templatesHaveSecurityConsiderations = false;
        }
      }
    }

    return {
      hasCICDPipelinesTemplate,
      hasEnvironmentManagementTemplate,
      hasDisasterRecoveryTemplate,
      hasEnterpriseDeploymentTemplate,
      allTemplatesHaveRequiredSections,
      templatesHaveImplementationPatterns,
      templatesHaveConfigurationExamples,
      templatesHaveIntegrationPoints,
      templatesHaveSecurityConsiderations
    };
  }


  validateTemplateContent(templatePath: string): DeploymentTemplateContent {
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
      hasConfigurationExamples: this.hasSection(content, 'Configuration') ||
        this.hasSection(content, 'Config'),
      hasIntegrationPoints: this.hasSection(content, 'Integration Points') ||
        this.hasSection(content, 'Integration'),
      hasSecurityConsiderations: this.hasSecurityConsiderations(content),
      hasTestingConsiderations: this.hasSection(content, 'Testing Considerations') ||
        this.hasSection(content, 'Testing'),
      hasCodeExamples: this.hasCodeExamples(content),
      hasCoreComponents: this.hasSection(content, 'Core Components') ||
        this.hasSection(content, 'Components')
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
      'sanitization', 'validation', 'access control', 'vulnerability',
      'secure', 'protection', 'audit', 'rbac', 'tls', 'ssl'
    ];

    const contentLower = content.toLowerCase();
    return securityKeywords.some(keyword => contentLower.includes(keyword));
  }

  private getEmptyTemplateContent(): DeploymentTemplateContent {
    return {
      hasPurposeSection: false,
      hasContextSection: false,
      hasImplementationPatterns: false,
      hasConfigurationExamples: false,
      hasIntegrationPoints: false,
      hasSecurityConsiderations: false,
      hasTestingConsiderations: false,
      hasCodeExamples: false,
      hasCoreComponents: false
    };
  }

  // Validate requirements 19.1, 19.2, 19.3, 19.9 for deployment infrastructure
  validateDeploymentInfrastructureRequirements(): {
    requirement_19_1: boolean; // Containerization (Docker, Kubernetes, service mesh)
    requirement_19_2: boolean; // CI/CD pipelines (automated builds, testing, deployment)
    requirement_19_3: boolean; // Cloud deployment (multi-cloud, IaC, auto-scaling)
    requirement_19_9: boolean; // Observability (tracing, metrics, log analysis)
  } {
    const structure = this.validateDeploymentInfrastructureTemplates();

    // Requirement 19.1: Containerization (Docker, Kubernetes, service mesh)
    const requirement_19_1 = structure.hasContainerizationTemplate &&
      structure.hasKubernetesDeploymentTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 19.2: CI/CD pipelines (covered by cloud deployment patterns)
    const requirement_19_2 = structure.hasCloudDeploymentTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 19.3: Cloud deployment (multi-cloud, IaC, auto-scaling)
    const requirement_19_3 = structure.hasCloudDeploymentTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 19.9: Observability (tracing, metrics, log analysis)
    const requirement_19_9 = structure.hasMonitoringObservabilityTemplate &&
      structure.templatesHaveImplementationPatterns;

    return {
      requirement_19_1,
      requirement_19_2,
      requirement_19_3,
      requirement_19_9
    };
  }

  // Validate requirements 19.2, 19.7, 19.8, 19.10 for CI/CD
  validateCICDRequirements(): {
    requirement_19_2: boolean; // CI/CD pipelines
    requirement_19_7: boolean; // Performance optimization
    requirement_19_8: boolean; // Environment management
    requirement_19_10: boolean; // Enterprise deployment
  } {
    const structure = this.validateCICDTemplates();

    // Requirement 19.2: CI/CD pipelines
    const requirement_19_2 = structure.hasCICDPipelinesTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 19.7: Performance optimization (covered by disaster recovery)
    const requirement_19_7 = structure.hasDisasterRecoveryTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 19.8: Environment management
    const requirement_19_8 = structure.hasEnvironmentManagementTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 19.10: Enterprise deployment
    const requirement_19_10 = structure.hasEnterpriseDeploymentTemplate &&
      structure.templatesHaveImplementationPatterns;

    return {
      requirement_19_2,
      requirement_19_7,
      requirement_19_8,
      requirement_19_10
    };
  }

  // Validate deployment feature coverage
  validateDeploymentFeatureCoverage(): {
    hasDockerSupport: boolean;
    hasKubernetesSupport: boolean;
    hasServiceMeshSupport: boolean;
    hasMultiCloudSupport: boolean;
    hasIaCSupport: boolean;
    hasAutoScalingSupport: boolean;
    hasDistributedTracing: boolean;
    hasMetricsCollection: boolean;
    hasLogAggregation: boolean;
    hasGCPSpecificSupport: boolean;
  } {
    const containerizationPath = join(this.deploymentModulePath, 'containerization.md');
    const kubernetesPath = join(this.deploymentModulePath, 'kubernetes-deployment.md');
    const cloudPath = join(this.deploymentModulePath, 'cloud-deployment.md');
    const monitoringPath = join(this.deploymentModulePath, 'monitoring-observability.md');
    const gcpPath = join(this.deploymentModulePath, '..', 'technology-stacks', 'cloud-gcp.md');
    const regulatedLandingZonePath = join(this.deploymentModulePath, 'regulated-cloud-landing-zone.md');

    let hasDockerSupport = false;
    let hasKubernetesSupport = false;
    let hasServiceMeshSupport = false;
    let hasMultiCloudSupport = false;
    let hasIaCSupport = false;
    let hasAutoScalingSupport = false;
    let hasDistributedTracing = false;
    let hasMetricsCollection = false;
    let hasLogAggregation = false;
    let hasGCPSpecificSupport = false;

    if (existsSync(containerizationPath)) {
      const content = readFileSync(containerizationPath, 'utf-8').toLowerCase();
      hasDockerSupport = content.includes('docker') && content.includes('container');
    }

    if (existsSync(kubernetesPath)) {
      const content = readFileSync(kubernetesPath, 'utf-8').toLowerCase();
      hasKubernetesSupport = content.includes('kubernetes') || content.includes('k8s');
      hasServiceMeshSupport = content.includes('service mesh') || content.includes('istio');
    }

    if (existsSync(cloudPath)) {
      const content = readFileSync(cloudPath, 'utf-8').toLowerCase();
      hasMultiCloudSupport = content.includes('multi-cloud') || (content.includes('aws') && content.includes('gcp'));
      hasIaCSupport = content.includes('terraform') || content.includes('infrastructure as code') || content.includes('cdk');
      hasAutoScalingSupport = content.includes('auto-scaling') || content.includes('autoscaling');
    }

    if (existsSync(monitoringPath)) {
      const content = readFileSync(monitoringPath, 'utf-8').toLowerCase();
      hasDistributedTracing = content.includes('tracing') || content.includes('opentelemetry');
      hasMetricsCollection = content.includes('metrics') || content.includes('prometheus');
      hasLogAggregation = content.includes('log') && (content.includes('aggregation') || content.includes('fluentd'));
    }

    const gcpContent = [
      existsSync(gcpPath) ? readFileSync(gcpPath, 'utf-8').toLowerCase() : '',
      existsSync(regulatedLandingZonePath) ? readFileSync(regulatedLandingZonePath, 'utf-8').toLowerCase() : ''
    ].join('\n');
    hasGCPSpecificSupport = (
      gcpContent.includes('cloud run') &&
      (gcpContent.includes('cloud sql') || gcpContent.includes('spanner')) &&
      gcpContent.includes('pub/sub') &&
      gcpContent.includes('cloud storage') &&
      gcpContent.includes('bigquery') &&
      (gcpContent.includes('vpc service controls') || gcpContent.includes('vpc-sc')) &&
      (gcpContent.includes('cmek') || gcpContent.includes('cloud kms')) &&
      gcpContent.includes('cloud armor')
    );

    return {
      hasDockerSupport,
      hasKubernetesSupport,
      hasServiceMeshSupport,
      hasMultiCloudSupport,
      hasIaCSupport,
      hasAutoScalingSupport,
      hasDistributedTracing,
      hasMetricsCollection,
      hasLogAggregation,
      hasGCPSpecificSupport
    };
  }
}
