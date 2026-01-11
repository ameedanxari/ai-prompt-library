import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface LocationServicesTemplateStructure {
  hasGpsTrackingTemplate: boolean;
  hasMapIntegrationTemplate: boolean;
  hasGeofencingTemplate: boolean;
  hasLocationPrivacyTemplate: boolean;
  hasServiceMatchingTemplate: boolean;
  hasBookingManagementTemplate: boolean;
  hasDynamicPricingTemplate: boolean;
  hasFleetManagementTemplate: boolean;
  allTemplatesHaveRequiredSections: boolean;
  templatesHaveImplementationPatterns: boolean;
  templatesHaveConfigurationExamples: boolean;
  templatesHaveIntegrationPoints: boolean;
  templatesHavePrivacyConsiderations: boolean;
}

export interface LocationServicesRequirements {
  requirement_3_1: boolean; // Real-time location tracking and sharing
  requirement_3_2: boolean; // Provider-customer matching algorithms
  requirement_3_4: boolean; // Appointment scheduling and availability
  requirement_3_6: boolean; // Vehicle tracking and driver coordination
}

export interface LocationServicesCoverage {
  hasGoogleMapsIntegration: boolean;
  hasMapboxIntegration: boolean;
  hasAppleMapsIntegration: boolean;
  hasMultipleMappingProviders: boolean;
  hasGeofencingCapabilities: boolean;
  hasPrivacyCompliance: boolean;
  hasRealTimeTracking: boolean;
  hasLocationSharing: boolean;
  hasServiceMatching: boolean;
  hasBookingSystem: boolean;
  hasDynamicPricing: boolean;
  hasFleetManagement: boolean;
}

export interface LocationServicesTemplateContent {
  hasPurposeSection: boolean;
  hasContextSection: boolean;
  hasImplementationPatterns: boolean;
  hasConfigurationParameters: boolean;
  hasIntegrationPoints: boolean;
  hasImplementationChecklist: boolean;
  hasSuccessMetrics: boolean;
  hasCodeExamples: boolean;
  hasPrivacyConsiderations: boolean;
  hasSecurityConsiderations: boolean;
  hasPlatformSpecificImplementation: boolean;
  hasPerformanceOptimization: boolean;
  hasTestingStrategy: boolean;
  hasErrorHandling: boolean;
}

export class LocationServicesTemplateValidator {
  constructor(private modulePath: string) {}

  validateLocationServicesTemplateCompleteness(): LocationServicesTemplateStructure {
    const gpsTrackingPath = join(this.modulePath, 'gps-tracking.md');
    const mapIntegrationPath = join(this.modulePath, 'map-integration.md');
    const geofencingPath = join(this.modulePath, 'geofencing.md');
    const locationPrivacyPath = join(this.modulePath, 'location-privacy.md');
    const serviceMatchingPath = join(this.modulePath, 'service-matching.md');
    const bookingManagementPath = join(this.modulePath, 'booking-management.md');
    const dynamicPricingPath = join(this.modulePath, 'dynamic-pricing.md');
    const fleetManagementPath = join(this.modulePath, 'fleet-management.md');

    const hasGpsTrackingTemplate = existsSync(gpsTrackingPath);
    const hasMapIntegrationTemplate = existsSync(mapIntegrationPath);
    const hasGeofencingTemplate = existsSync(geofencingPath);
    const hasLocationPrivacyTemplate = existsSync(locationPrivacyPath);
    const hasServiceMatchingTemplate = existsSync(serviceMatchingPath);
    const hasBookingManagementTemplate = existsSync(bookingManagementPath);
    const hasDynamicPricingTemplate = existsSync(dynamicPricingPath);
    const hasFleetManagementTemplate = existsSync(fleetManagementPath);

    // Validate that all templates have required sections
    const allTemplatesHaveRequiredSections = this.validateAllTemplatesHaveRequiredSections([
      gpsTrackingPath,
      mapIntegrationPath,
      geofencingPath,
      locationPrivacyPath,
      serviceMatchingPath,
      bookingManagementPath,
      dynamicPricingPath,
      fleetManagementPath
    ]);

    const templatesHaveImplementationPatterns = this.validateTemplatesHaveImplementationPatterns([
      gpsTrackingPath,
      mapIntegrationPath,
      geofencingPath,
      locationPrivacyPath,
      serviceMatchingPath,
      bookingManagementPath,
      dynamicPricingPath,
      fleetManagementPath
    ]);

    const templatesHaveConfigurationExamples = this.validateTemplatesHaveConfigurationExamples([
      gpsTrackingPath,
      mapIntegrationPath,
      geofencingPath,
      locationPrivacyPath,
      serviceMatchingPath,
      bookingManagementPath,
      dynamicPricingPath,
      fleetManagementPath
    ]);

    const templatesHaveIntegrationPoints = this.validateTemplatesHaveIntegrationPoints([
      gpsTrackingPath,
      mapIntegrationPath,
      geofencingPath,
      locationPrivacyPath,
      serviceMatchingPath,
      bookingManagementPath,
      dynamicPricingPath,
      fleetManagementPath
    ]);

    const templatesHavePrivacyConsiderations = this.validateTemplatesHavePrivacyConsiderations([
      gpsTrackingPath,
      mapIntegrationPath,
      geofencingPath,
      locationPrivacyPath,
      serviceMatchingPath,
      bookingManagementPath,
      dynamicPricingPath,
      fleetManagementPath
    ]);

    return {
      hasGpsTrackingTemplate,
      hasMapIntegrationTemplate,
      hasGeofencingTemplate,
      hasLocationPrivacyTemplate,
      hasServiceMatchingTemplate,
      hasBookingManagementTemplate,
      hasDynamicPricingTemplate,
      hasFleetManagementTemplate,
      allTemplatesHaveRequiredSections,
      templatesHaveImplementationPatterns,
      templatesHaveConfigurationExamples,
      templatesHaveIntegrationPoints,
      templatesHavePrivacyConsiderations
    };
  }

  validateLocationServicesRequirements(): LocationServicesRequirements {
    const structure = this.validateLocationServicesTemplateCompleteness();
    
    // Requirement 3.1: Real-time location tracking and sharing
    const requirement_3_1 = structure.hasGpsTrackingTemplate && 
                            structure.hasMapIntegrationTemplate &&
                            structure.hasGeofencingTemplate &&
                            structure.hasLocationPrivacyTemplate;

    // Requirement 3.2: Provider-customer matching algorithms
    const requirement_3_2 = structure.hasServiceMatchingTemplate;

    // Requirement 3.4: Appointment scheduling and availability
    const requirement_3_4 = structure.hasBookingManagementTemplate;

    // Requirement 3.6: Vehicle tracking and driver coordination
    const requirement_3_6 = structure.hasFleetManagementTemplate;

    return {
      requirement_3_1,
      requirement_3_2,
      requirement_3_4,
      requirement_3_6
    };
  }

  validateLocationServicesCoverage(): LocationServicesCoverage {
    const mapIntegrationPath = join(this.modulePath, 'map-integration.md');
    const gpsTrackingPath = join(this.modulePath, 'gps-tracking.md');
    const geofencingPath = join(this.modulePath, 'geofencing.md');
    const locationPrivacyPath = join(this.modulePath, 'location-privacy.md');
    const serviceMatchingPath = join(this.modulePath, 'service-matching.md');
    const bookingManagementPath = join(this.modulePath, 'booking-management.md');
    const dynamicPricingPath = join(this.modulePath, 'dynamic-pricing.md');
    const fleetManagementPath = join(this.modulePath, 'fleet-management.md');

    let hasGoogleMapsIntegration = false;
    let hasMapboxIntegration = false;
    let hasAppleMapsIntegration = false;
    let hasGeofencingCapabilities = false;
    let hasPrivacyCompliance = false;
    let hasRealTimeTracking = false;
    let hasLocationSharing = false;
    let hasServiceMatching = false;
    let hasBookingSystem = false;
    let hasDynamicPricing = false;
    let hasFleetManagement = false;

    if (existsSync(mapIntegrationPath)) {
      const content = readFileSync(mapIntegrationPath, 'utf-8');
      hasGoogleMapsIntegration = content.includes('Google Maps') || content.includes('google.maps');
      hasMapboxIntegration = content.includes('Mapbox') || content.includes('mapboxgl');
      hasAppleMapsIntegration = content.includes('Apple Maps') || content.includes('MapKit');
    }

    if (existsSync(gpsTrackingPath)) {
      const content = readFileSync(gpsTrackingPath, 'utf-8');
      hasRealTimeTracking = content.includes('real-time') || content.includes('location tracking');
      hasLocationSharing = content.includes('location sharing') || content.includes('share location');
    }

    if (existsSync(geofencingPath)) {
      const content = readFileSync(geofencingPath, 'utf-8');
      hasGeofencingCapabilities = content.includes('geofence') || content.includes('proximity detection');
    }

    if (existsSync(locationPrivacyPath)) {
      const content = readFileSync(locationPrivacyPath, 'utf-8');
      hasPrivacyCompliance = content.includes('GDPR') || content.includes('privacy') || content.includes('consent');
    }

    if (existsSync(serviceMatchingPath)) {
      const content = readFileSync(serviceMatchingPath, 'utf-8');
      hasServiceMatching = content.includes('matching') || content.includes('provider-customer');
    }

    if (existsSync(bookingManagementPath)) {
      const content = readFileSync(bookingManagementPath, 'utf-8');
      hasBookingSystem = content.includes('booking') || content.includes('appointment') || content.includes('scheduling');
    }

    if (existsSync(dynamicPricingPath)) {
      const content = readFileSync(dynamicPricingPath, 'utf-8');
      hasDynamicPricing = content.includes('dynamic pricing') || content.includes('surge pricing');
    }

    if (existsSync(fleetManagementPath)) {
      const content = readFileSync(fleetManagementPath, 'utf-8');
      hasFleetManagement = content.includes('fleet') || content.includes('vehicle tracking');
    }

    const hasMultipleMappingProviders = hasGoogleMapsIntegration && hasMapboxIntegration;

    return {
      hasGoogleMapsIntegration,
      hasMapboxIntegration,
      hasAppleMapsIntegration,
      hasMultipleMappingProviders,
      hasGeofencingCapabilities,
      hasPrivacyCompliance,
      hasRealTimeTracking,
      hasLocationSharing,
      hasServiceMatching,
      hasBookingSystem,
      hasDynamicPricing,
      hasFleetManagement
    };
  }

  validateTemplateContent(templatePath: string): LocationServicesTemplateContent {
    if (!existsSync(templatePath)) {
      return this.getEmptyTemplateContent();
    }

    const content = readFileSync(templatePath, 'utf-8');

    return {
      hasPurposeSection: content.includes('## Purpose') || content.includes('# Purpose'),
      hasContextSection: content.includes('## Context') || content.includes('# Context'),
      hasImplementationPatterns: content.includes('Implementation Approach') || content.includes('interface ') || content.includes('class '),
      hasConfigurationParameters: content.includes('Configuration') || content.includes('config') || content.includes('options'),
      hasIntegrationPoints: content.includes('Integration') || content.includes('API') || content.includes('service'),
      hasImplementationChecklist: content.includes('checklist') || content.includes('steps') || content.includes('implementation'),
      hasSuccessMetrics: content.includes('metrics') || content.includes('performance') || content.includes('monitoring'),
      hasCodeExamples: content.includes('```') && (content.includes('typescript') || content.includes('javascript') || content.includes('swift') || content.includes('kotlin')),
      hasPrivacyConsiderations: content.includes('privacy') || content.includes('consent') || content.includes('GDPR'),
      hasSecurityConsiderations: content.includes('security') || content.includes('encryption') || content.includes('authentication'),
      hasPlatformSpecificImplementation: content.includes('iOS') || content.includes('Android') || content.includes('React Native') || content.includes('Web') || 
                                    content.includes('mobile') || content.includes('platform') || content.includes('cross-platform') ||
                                    (content.includes('Implementation') && content.includes('class ')) ||
                                    (content.includes('Service') && content.includes('interface ')),
      hasPerformanceOptimization: content.includes('optimization') || content.includes('performance') || content.includes('battery'),
      hasTestingStrategy: content.includes('Testing Strategy') || content.includes('Unit Tests') || content.includes('test('),
      hasErrorHandling: content.includes('Error Handling') || content.includes('try') || content.includes('catch') || content.includes('throw')
    };
  }

  private validateAllTemplatesHaveRequiredSections(templatePaths: string[]): boolean {
    return templatePaths.every(path => {
      if (!existsSync(path)) return false;
      const content = this.validateTemplateContent(path);
      return content.hasPurposeSection && 
             content.hasContextSection && 
             content.hasImplementationPatterns;
    });
  }

  private validateTemplatesHaveImplementationPatterns(templatePaths: string[]): boolean {
    return templatePaths.every(path => {
      if (!existsSync(path)) return false;
      const content = this.validateTemplateContent(path);
      return content.hasImplementationPatterns && content.hasCodeExamples;
    });
  }

  private validateTemplatesHaveConfigurationExamples(templatePaths: string[]): boolean {
    return templatePaths.every(path => {
      if (!existsSync(path)) return false;
      const content = this.validateTemplateContent(path);
      return content.hasConfigurationParameters;
    });
  }

  private validateTemplatesHaveIntegrationPoints(templatePaths: string[]): boolean {
    return templatePaths.every(path => {
      if (!existsSync(path)) return false;
      const content = this.validateTemplateContent(path);
      return content.hasIntegrationPoints;
    });
  }

  private validateTemplatesHavePrivacyConsiderations(templatePaths: string[]): boolean {
    return templatePaths.every(path => {
      if (!existsSync(path)) return false;
      const content = this.validateTemplateContent(path);
      return content.hasPrivacyConsiderations || path.includes('location-privacy');
    });
  }

  private getEmptyTemplateContent(): LocationServicesTemplateContent {
    return {
      hasPurposeSection: false,
      hasContextSection: false,
      hasImplementationPatterns: false,
      hasConfigurationParameters: false,
      hasIntegrationPoints: false,
      hasImplementationChecklist: false,
      hasSuccessMetrics: false,
      hasCodeExamples: false,
      hasPrivacyConsiderations: false,
      hasSecurityConsiderations: false,
      hasPlatformSpecificImplementation: false,
      hasPerformanceOptimization: false,
      hasTestingStrategy: false,
      hasErrorHandling: false
    };
  }
}