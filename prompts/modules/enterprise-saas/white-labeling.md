# Enterprise White-Labeling Template

## Purpose

This template provides comprehensive patterns for implementing white-labeling and custom branding capabilities in enterprise SaaS applications. It covers theme customization, brand asset management, domain configuration, feature customization, and multi-tenant branding while maintaining system integrity and performance.

## Context

Enterprise customers often require the ability to customize the appearance, branding, and even functionality of SaaS applications to match their corporate identity and specific business needs. This template addresses the complexities of providing flexible customization options while maintaining code maintainability, security, and performance across multiple tenants.

## Core Components

### Brand Management System

## Examples

```typescript
interface BrandManager {
  createBrand(brandData: BrandCreationRequest): Promise<Brand>;
  updateBrand(brandId: string, updates: BrandUpdate): Promise<Brand>;
  deleteBrand(brandId: string): Promise<void>;
  getBrand(brandId: string): Promise<Brand>;
  applyBrand(tenantId: string, brandId: string): Promise<void>;
  generateBrandAssets(brandId: string): Promise<BrandAssets>;
  validateBrandCompliance(brandId: string): Promise<ComplianceResult>;
}

interface Brand {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  status: BrandStatus;
  theme: BrandTheme;
  assets: BrandAssets;
  typography: Typography;
  layout: LayoutConfiguration;
  customization: CustomizationSettings;
  domains: CustomDomain[];
  features: FeatureCustomization[];
  compliance: ComplianceSettings;
  metadata: BrandMetadata;
  createdAt: Date;
  updatedAt: Date;
  activatedAt?: Date;
}

enum BrandStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived'
}

interface BrandTheme {
  colors: ColorPalette;
  spacing: SpacingConfiguration;
  borders: BorderConfiguration;
  shadows: ShadowConfiguration;
  animations: AnimationConfiguration;
  customCSS?: string;
}

interface ColorPalette {
  primary: ColorVariants;
  secondary: ColorVariants;
  accent: ColorVariants;
  neutral: ColorVariants;
  semantic: SemanticColors;
  custom: Record<string, ColorVariants>;
}

interface ColorVariants {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string; // Base color
  600: string;
  700: string;
  800: string;
  900: string;
}

interface SemanticColors {
  success: ColorVariants;
  warning: ColorVariants;
  error: ColorVariants;
  info: ColorVariants;
}
```
interface BrandAssets {
  logos: LogoAssets;
  icons: IconAssets;
  images: ImageAssets;
  fonts: FontAssets;
  documents: DocumentAssets;
}

interface LogoAssets {
  primary: AssetVariants;
  secondary?: AssetVariants;
  mark: AssetVariants;
  wordmark: AssetVariants;
  favicon: AssetVariants;
}

interface AssetVariants {
  light: AssetFile[];
  dark: AssetFile[];
  monochrome: AssetFile[];
}

interface AssetFile {
  id: string;
  url: string;
  format: AssetFormat;
  size: AssetSize;
  dimensions: Dimensions;
  fileSize: number;
  checksum: string;
}

enum AssetFormat {
  SVG = 'svg',
  PNG = 'png',
  JPG = 'jpg',
  WEBP = 'webp',
  ICO = 'ico'
}

class EnterpriseBrandManager implements BrandManager {
  async createBrand(brandData: BrandCreationRequest): Promise<Brand> {
    // Validate brand data
    await this.validateBrandData(brandData);
    
    // Generate default theme if not provided
    const theme = brandData.theme || await this.generateDefaultTheme(brandData.colors);
    
    // Process and optimize assets
    const processedAssets = await this.processAssets(brandData.assets);
    
    // Create brand
    const brand: Brand = {
      id: this.generateBrandId(),
      tenantId: brandData.tenantId,
      name: brandData.name,
      description: brandData.description,
      status: BrandStatus.DRAFT,
      theme,
      assets: processedAssets,
      typography: brandData.typography || this.getDefaultTypography(),
      layout: brandData.layout || this.getDefaultLayout(),
      customization: brandData.customization || {},
      domains: [],
      features: brandData.features || [],
      compliance: brandData.compliance || this.getDefaultCompliance(),
      metadata: brandData.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store brand
    await this.brandRepository.create(brand);
    
    // Generate CSS variables and assets
    await this.generateBrandAssets(brand.id);
    
    // Validate compliance
    const complianceResult = await this.validateBrandCompliance(brand.id);
    if (!complianceResult.compliant) {
      brand.status = BrandStatus.DRAFT;
      await this.brandRepository.update(brand);
      throw new BrandComplianceError('Brand does not meet compliance requirements', complianceResult.violations);
    }

    return brand;
  }

  async applyBrand(tenantId: string, brandId: string): Promise<void> {
    const brand = await this.brandRepository.findById(brandId);
    if (!brand || brand.tenantId !== tenantId) {
      throw new BrandNotFoundError(`Brand ${brandId} not found for tenant ${tenantId}`);
    }

    if (brand.status !== BrandStatus.ACTIVE) {
      throw new BrandNotActiveError(`Brand ${brandId} is not active`);
    }

    // Update tenant brand configuration
    await this.tenantService.updateBrandConfiguration(tenantId, {
      activeBrandId: brandId,
      themeVariables: await this.generateThemeVariables(brand),
      assetUrls: await this.generateAssetUrls(brand),
      customCSS: brand.theme.customCSS,
      appliedAt: new Date()
    });

    // Invalidate CDN cache for tenant assets
    await this.cdnService.invalidateCache(`/tenants/${tenantId}/assets/*`);
    
    // Update brand activation timestamp
    brand.activatedAt = new Date();
    await this.brandRepository.update(brand);

    // Notify brand application
    await this.eventBus.publish('brand.applied', {
      tenantId,
      brandId,
      appliedAt: new Date()
    });
  }

  private async processAssets(assets: RawBrandAssets): Promise<BrandAssets> {
    const processedAssets: BrandAssets = {
      logos: await this.processLogoAssets(assets.logos),
      icons: await this.processIconAssets(assets.icons),
      images: await this.processImageAssets(assets.images),
      fonts: await this.processFontAssets(assets.fonts),
      documents: await this.processDocumentAssets(assets.documents)
    };

    return processedAssets;
  }

  private async processLogoAssets(logos: RawLogoAssets): Promise<LogoAssets> {
    const processedLogos: LogoAssets = {
      primary: await this.processAssetVariants(logos.primary),
      mark: await this.processAssetVariants(logos.mark),
      wordmark: await this.processAssetVariants(logos.wordmark),
      favicon: await this.processFaviconAssets(logos.favicon)
    };

    if (logos.secondary) {
      processedLogos.secondary = await this.processAssetVariants(logos.secondary);
    }

    return processedLogos;
  }

  private async processAssetVariants(variants: RawAssetVariants): Promise<AssetVariants> {
    return {
      light: await this.processAssetFiles(variants.light),
      dark: await this.processAssetFiles(variants.dark),
      monochrome: await this.processAssetFiles(variants.monochrome)
    };
  }

  private async processAssetFiles(files: RawAssetFile[]): Promise<AssetFile[]> {
    const processedFiles: AssetFile[] = [];

    for (const file of files) {
      // Optimize image
      const optimizedFile = await this.imageOptimizer.optimize(file, {
        quality: 90,
        progressive: true,
        stripMetadata: true
      });

      // Generate multiple sizes
      const sizes = await this.generateAssetSizes(optimizedFile);

      for (const size of sizes) {
        // Upload to CDN
        const cdnUrl = await this.cdnService.upload(size.buffer, {
          path: `assets/brands/${this.generateAssetPath(file, size)}`,
          contentType: size.mimeType,
          cacheControl: 'public, max-age=31536000' // 1 year
        });

        processedFiles.push({
          id: this.generateAssetId(),
          url: cdnUrl,
          format: size.format,
          size: size.size,
          dimensions: size.dimensions,
          fileSize: size.buffer.length,
          checksum: await this.calculateChecksum(size.buffer)
        });
      }
    }

    return processedFiles;
  }
}
```

### Domain Configuration System

```typescript
interface DomainManager {
  addCustomDomain(tenantId: string, domain: CustomDomain): Promise<void>;
  verifyDomain(domainId: string): Promise<DomainVerificationResult>;
  configureDNS(domainId: string): Promise<DNSConfiguration>;
  enableSSL(domainId: string): Promise<SSLCertificate>;
  removeDomain(domainId: string): Promise<void>;
}

interface CustomDomain {
  id: string;
  tenantId: string;
  domain: string;
  subdomain?: string;
  status: DomainStatus;
  verification: DomainVerification;
  ssl: SSLConfiguration;
  routing: RoutingConfiguration;
  createdAt: Date;
  verifiedAt?: Date;
}

enum DomainStatus {
  PENDING = 'pending',
  VERIFYING = 'verifying',
  VERIFIED = 'verified',
  ACTIVE = 'active',
  FAILED = 'failed',
  SUSPENDED = 'suspended'
}

interface DomainVerification {
  method: VerificationMethod;
  token: string;
  txtRecord?: string;
  cnameRecord?: string;
  attempts: number;
  lastAttempt?: Date;
  expiresAt: Date;
}

enum VerificationMethod {
  DNS_TXT = 'dns_txt',
  DNS_CNAME = 'dns_cname',
  FILE_UPLOAD = 'file_upload',
  META_TAG = 'meta_tag'
}

class EnterpriseDomainManager implements DomainManager {
  async addCustomDomain(tenantId: string, domain: CustomDomain): Promise<void> {
    // Validate domain format and availability
    await this.validateDomain(domain.domain);
    
    // Check tenant permissions
    await this.validateTenantPermissions(tenantId, 'custom_domains');
    
    // Generate verification token
    const verification = await this.generateVerification(domain.domain);
    
    // Create domain record
    const customDomain: CustomDomain = {
      ...domain,
      id: this.generateDomainId(),
      tenantId,
      status: DomainStatus.PENDING,
      verification,
      ssl: {
        enabled: false,
        autoRenew: true,
        provider: 'letsencrypt'
      },
      routing: {
        redirects: [],
        rewrites: [],
        headers: []
      },
      createdAt: new Date()
    };

    await this.domainRepository.create(customDomain);
    
    // Start verification process
    await this.initiateVerification(customDomain.id);
  }

  async verifyDomain(domainId: string): Promise<DomainVerificationResult> {
    const domain = await this.domainRepository.findById(domainId);
    if (!domain) {
      throw new DomainNotFoundError(`Domain ${domainId} not found`);
    }

    const verificationResult = await this.performVerification(domain);
    
    if (verificationResult.verified) {
      // Update domain status
      domain.status = DomainStatus.VERIFIED;
      domain.verifiedAt = new Date();
      await this.domainRepository.update(domain);
      
      // Configure DNS and SSL
      await this.configureDNS(domainId);
      await this.enableSSL(domainId);
      
      // Activate domain
      domain.status = DomainStatus.ACTIVE;
      await this.domainRepository.update(domain);
    } else {
      // Increment attempt counter
      domain.verification.attempts++;
      domain.verification.lastAttempt = new Date();
      
      if (domain.verification.attempts >= 5) {
        domain.status = DomainStatus.FAILED;
      }
      
      await this.domainRepository.update(domain);
    }

    return verificationResult;
  }

  private async performVerification(domain: CustomDomain): Promise<DomainVerificationResult> {
    switch (domain.verification.method) {
      case VerificationMethod.DNS_TXT:
        return await this.verifyDNSTXT(domain);
      case VerificationMethod.DNS_CNAME:
        return await this.verifyDNSCNAME(domain);
      case VerificationMethod.FILE_UPLOAD:
        return await this.verifyFileUpload(domain);
      case VerificationMethod.META_TAG:
        return await this.verifyMetaTag(domain);
      default:
        throw new UnsupportedVerificationMethodError(`Unsupported verification method: ${domain.verification.method}`);
    }
  }
}
```

### Feature Customization System

```typescript
interface FeatureCustomizationManager {
  createCustomization(customization: FeatureCustomization): Promise<FeatureCustomization>;
  updateCustomization(customizationId: string, updates: Partial<FeatureCustomization>): Promise<FeatureCustomization>;
  applyCustomization(tenantId: string, customizationId: string): Promise<void>;
  getCustomization(customizationId: string): Promise<FeatureCustomization>;
  listCustomizations(tenantId: string): Promise<FeatureCustomization[]>;
}

interface FeatureCustomization {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  category: CustomizationCategory;
  features: FeatureConfiguration[];
  ui: UICustomization;
  workflow: WorkflowCustomization;
  integrations: IntegrationCustomization[];
  permissions: CustomizationPermissions;
  status: CustomizationStatus;
  metadata: CustomizationMetadata;
  createdAt: Date;
  updatedAt: Date;
}

enum CustomizationCategory {
  UI_LAYOUT = 'ui_layout',
  FEATURE_TOGGLE = 'feature_toggle',
  WORKFLOW = 'workflow',
  INTEGRATION = 'integration',
  BRANDING = 'branding',
  SECURITY = 'security'
}

interface FeatureConfiguration {
  featureId: string;
  enabled: boolean;
  configuration: Record<string, any>;
  permissions: string[];
  dependencies: string[];
  conflicts: string[];
}

interface UICustomization {
  layout: LayoutCustomization;
  navigation: NavigationCustomization;
  components: ComponentCustomization[];
  styling: StylingCustomization;
}

interface LayoutCustomization {
  template: string;
  regions: LayoutRegion[];
  responsive: ResponsiveConfiguration;
  accessibility: AccessibilityConfiguration;
}

interface NavigationCustomization {
  structure: NavigationItem[];
  style: NavigationStyle;
  behavior: NavigationBehavior;
}

interface ComponentCustomization {
  componentId: string;
  variant: string;
  props: Record<string, any>;
  styling: ComponentStyling;
  behavior: ComponentBehavior;
}
```

## Implementation Patterns

### Multi-Tenant Brand Isolation

```typescript
class TenantBrandIsolationService {
  async isolateBrandAssets(tenantId: string): Promise<void> {
    // Create tenant-specific asset namespace
    const assetNamespace = `tenants/${tenantId}/assets`;
    
    // Configure CDN routing
    await this.cdnService.createTenantRoute(tenantId, {
      path: `/assets/*`,
      upstream: `${this.assetStorageUrl}/${assetNamespace}`,
      cachePolicy: 'brand-assets',
      headers: {
        'Cache-Control': 'public, max-age=31536000',
        'X-Tenant-ID': tenantId
      }
    });
    
    // Set up asset processing pipeline
    await this.assetPipeline.configureTenantPipeline(tenantId, {
      inputPath: `${assetNamespace}/raw`,
      outputPath: `${assetNamespace}/processed`,
      transformations: this.getBrandTransformations(),
      optimization: true,
      validation: true
    });
  }

  async validateBrandCompliance(brand: Brand): Promise<ComplianceResult> {
    const violations: ComplianceViolation[] = [];
    
    // Check color contrast ratios
    const contrastViolations = await this.validateColorContrast(brand.theme.colors);
    violations.push(...contrastViolations);
    
    // Validate asset dimensions and formats
    const assetViolations = await this.validateAssetCompliance(brand.assets);
    violations.push(...assetViolations);
    
    // Check accessibility requirements
    const accessibilityViolations = await this.validateAccessibility(brand);
    violations.push(...accessibilityViolations);
    
    // Validate trademark compliance
    const trademarkViolations = await this.validateTrademarks(brand);
    violations.push(...trademarkViolations);

    return {
      compliant: violations.length === 0,
      violations,
      score: this.calculateComplianceScore(violations),
      recommendations: this.generateRecommendations(violations)
    };
  }
}
```

### Dynamic Theme Generation

```typescript
class DynamicThemeGenerator {
  async generateThemeVariables(brand: Brand): Promise<ThemeVariables> {
    const variables: ThemeVariables = {};
    
    // Generate CSS custom properties
    variables.colors = this.generateColorVariables(brand.theme.colors);
    variables.typography = this.generateTypographyVariables(brand.typography);
    variables.spacing = this.generateSpacingVariables(brand.theme.spacing);
    variables.borders = this.generateBorderVariables(brand.theme.borders);
    variables.shadows = this.generateShadowVariables(brand.theme.shadows);
    
    // Generate component-specific variables
    variables.components = await this.generateComponentVariables(brand);
    
    // Generate responsive breakpoints
    variables.breakpoints = this.generateBreakpointVariables(brand.layout);
    
    // Generate animation variables
    variables.animations = this.generateAnimationVariables(brand.theme.animations);

    return variables;
  }

  private generateColorVariables(colors: ColorPalette): Record<string, string> {
    const variables: Record<string, string> = {};
    
    // Primary colors
    Object.entries(colors.primary).forEach(([shade, color]) => {
      variables[`--color-primary-${shade}`] = color;
    });
    
    // Secondary colors
    Object.entries(colors.secondary).forEach(([shade, color]) => {
      variables[`--color-secondary-${shade}`] = color;
    });
    
    // Semantic colors
    Object.entries(colors.semantic).forEach(([type, colorVariants]) => {
      Object.entries(colorVariants).forEach(([shade, color]) => {
        variables[`--color-${type}-${shade}`] = color;
      });
    });
    
    // Custom colors
    Object.entries(colors.custom).forEach(([name, colorVariants]) => {
      Object.entries(colorVariants).forEach(([shade, color]) => {
        variables[`--color-${name}-${shade}`] = color;
      });
    });

    return variables;
  }

  async generateComponentVariables(brand: Brand): Promise<Record<string, Record<string, string>>> {
    const componentVariables: Record<string, Record<string, string>> = {};
    
    // Button variables
    componentVariables.button = {
      '--button-primary-bg': brand.theme.colors.primary[500],
      '--button-primary-text': this.getContrastColor(brand.theme.colors.primary[500]),
      '--button-primary-hover': brand.theme.colors.primary[600],
      '--button-border-radius': brand.theme.borders.radius.medium,
      '--button-padding-x': brand.theme.spacing.medium,
      '--button-padding-y': brand.theme.spacing.small
    };
    
    // Input variables
    componentVariables.input = {
      '--input-border-color': brand.theme.colors.neutral[300],
      '--input-focus-color': brand.theme.colors.primary[500],
      '--input-bg': brand.theme.colors.neutral[50],
      '--input-text': brand.theme.colors.neutral[900],
      '--input-border-radius': brand.theme.borders.radius.small
    };
    
    // Card variables
    componentVariables.card = {
      '--card-bg': brand.theme.colors.neutral[0],
      '--card-border': brand.theme.colors.neutral[200],
      '--card-shadow': brand.theme.shadows.medium,
      '--card-border-radius': brand.theme.borders.radius.large
    };

    return componentVariables;
  }
}
```

## Integration Points

### CDN and Asset Management Integration

```typescript
interface CDNIntegration {
  uploadAsset(asset: AssetFile, options: UploadOptions): Promise<string>;
  invalidateCache(pattern: string): Promise<void>;
  configureTenantRouting(tenantId: string, config: RoutingConfig): Promise<void>;
  generateSignedUrl(assetPath: string, expiresIn: number): Promise<string>;
}

interface AssetStorageIntegration {
  storeAsset(asset: ProcessedAsset): Promise<string>;
  retrieveAsset(assetId: string): Promise<ProcessedAsset>;
  deleteAsset(assetId: string): Promise<void>;
  listAssets(tenantId: string, filters: AssetFilters): Promise<ProcessedAsset[]>;
}

class WhiteLabelAssetManager {
  constructor(
    private cdnService: CDNIntegration,
    private storageService: AssetStorageIntegration,
    private imageProcessor: ImageProcessingService
  ) {}

  async deployBrandAssets(tenantId: string, brandId: string): Promise<void> {
    const brand = await this.brandRepository.findById(brandId);
    
    // Process and optimize all brand assets
    const processedAssets = await this.processAllAssets(brand.assets);
    
    // Upload to CDN with tenant-specific paths
    const cdnUrls = await this.uploadToCDN(tenantId, processedAssets);
    
    // Update brand with CDN URLs
    brand.assets = this.updateAssetUrls(brand.assets, cdnUrls);
    await this.brandRepository.update(brand);
    
    // Configure CDN routing for tenant
    await this.configureTenantCDN(tenantId, brand);
    
    // Generate and cache theme CSS
    await this.generateAndCacheThemeCSS(tenantId, brand);
  }

  private async configureTenantCDN(tenantId: string, brand: Brand): Promise<void> {
    await this.cdnService.configureTenantRouting(tenantId, {
      assetPath: `/tenants/${tenantId}/assets`,
      cacheTTL: 31536000, // 1 year
      compression: true,
      headers: {
        'X-Tenant-ID': tenantId,
        'X-Brand-ID': brand.id,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  }
}
```

### Theme Engine Integration

```typescript
interface ThemeEngineIntegration {
  compileTheme(brand: Brand): Promise<CompiledTheme>;
  generateCSS(theme: CompiledTheme): Promise<string>;
  validateTheme(theme: CompiledTheme): Promise<ValidationResult>;
  optimizeTheme(theme: CompiledTheme): Promise<CompiledTheme>;
}

class EnterpriseThemeEngine implements ThemeEngineIntegration {
  async compileTheme(brand: Brand): Promise<CompiledTheme> {
    // Generate base theme variables
    const variables = await this.themeGenerator.generateThemeVariables(brand);
    
    // Compile SCSS/CSS with brand variables
    const compiledCSS = await this.sassCompiler.compile({
      data: this.generateSassVariables(variables),
      includePaths: ['./themes/base', './themes/components'],
      outputStyle: 'compressed',
      sourceMap: false
    });
    
    // Generate component-specific styles
    const componentStyles = await this.generateComponentStyles(brand);
    
    // Combine and optimize
    const optimizedCSS = await this.cssOptimizer.optimize(
      compiledCSS.css + componentStyles
    );

    return {
      id: this.generateThemeId(brand),
      brandId: brand.id,
      css: optimizedCSS,
      variables,
      components: this.extractComponentStyles(optimizedCSS),
      metadata: {
        size: optimizedCSS.length,
        checksum: await this.calculateChecksum(optimizedCSS),
        compiledAt: new Date()
      }
    };
  }

  async generateCSS(theme: CompiledTheme): Promise<string> {
    let css = '';
    
    // Add CSS custom properties
    css += ':root {\n';
    Object.entries(theme.variables.colors).forEach(([name, value]) => {
      css += `  ${name}: ${value};\n`;
    });
    css += '}\n\n';
    
    // Add component styles
    css += theme.css;
    
    // Add responsive styles
    css += this.generateResponsiveCSS(theme.variables.breakpoints);
    
    // Add print styles
    css += this.generatePrintCSS(theme.variables);

    return css;
  }
}
```

## Security Considerations

### Brand Asset Security

```typescript
class BrandSecurityManager {
  async validateAssetSecurity(asset: AssetFile): Promise<SecurityValidationResult> {
    const violations: SecurityViolation[] = [];
    
    // Validate file type and content
    const fileValidation = await this.validateFileType(asset);
    if (!fileValidation.valid) {
      violations.push({
        type: 'INVALID_FILE_TYPE',
        severity: 'HIGH',
        message: 'File type not allowed or content mismatch'
      });
    }
    
    // Scan for malicious content
    const malwareResult = await this.scanForMalware(asset);
    if (malwareResult.detected) {
      violations.push({
        type: 'MALWARE_DETECTED',
        severity: 'CRITICAL',
        message: 'Malicious content detected in asset'
      });
    }
    
    // Check file size limits
    if (asset.fileSize > this.getMaxFileSize(asset.format)) {
      violations.push({
        type: 'FILE_SIZE_EXCEEDED',
        severity: 'MEDIUM',
        message: 'File size exceeds allowed limit'
      });
    }
    
    // Validate image metadata
    if (this.isImageFile(asset)) {
      const metadataValidation = await this.validateImageMetadata(asset);
      violations.push(...metadataValidation.violations);
    }

    return {
      valid: violations.length === 0,
      violations,
      recommendations: this.generateSecurityRecommendations(violations)
    };
  }

  async sanitizeAsset(asset: AssetFile): Promise<AssetFile> {
    // Remove EXIF data from images
    if (this.isImageFile(asset)) {
      asset = await this.stripImageMetadata(asset);
    }
    
    // Optimize and re-encode
    asset = await this.reencodeAsset(asset);
    
    // Generate new checksum
    asset.checksum = await this.calculateChecksum(asset.buffer);
    
    return asset;
  }

  private async validateFileType(asset: AssetFile): Promise<FileValidationResult> {
    // Check file extension
    const allowedExtensions = this.getAllowedExtensions();
    const extension = this.getFileExtension(asset.url);
    
    if (!allowedExtensions.includes(extension)) {
      return { valid: false, reason: 'Extension not allowed' };
    }
    
    // Validate MIME type
    const detectedMimeType = await this.detectMimeType(asset.buffer);
    const expectedMimeType = this.getMimeTypeForExtension(extension);
    
    if (detectedMimeType !== expectedMimeType) {
      return { valid: false, reason: 'MIME type mismatch' };
    }
    
    // Validate file signature
    const signatureValid = await this.validateFileSignature(asset.buffer, extension);
    if (!signatureValid) {
      return { valid: false, reason: 'Invalid file signature' };
    }

    return { valid: true };
  }
}
```

### Access Control and Permissions

```typescript
class BrandAccessControlManager {
  async validateBrandAccess(userId: string, brandId: string, action: BrandAction): Promise<boolean> {
    // Get user permissions
    const userPermissions = await this.permissionService.getUserPermissions(userId);
    
    // Get brand details
    const brand = await this.brandRepository.findById(brandId);
    if (!brand) {
      return false;
    }
    
    // Check tenant membership
    const isTenantMember = await this.tenantService.isMember(userId, brand.tenantId);
    if (!isTenantMember) {
      return false;
    }
    
    // Check specific brand permissions
    const requiredPermission = this.getRequiredPermission(action);
    const hasPermission = userPermissions.includes(requiredPermission);
    
    // Check brand-specific restrictions
    const brandRestrictions = await this.getBrandRestrictions(brandId);
    const restrictionsPassed = await this.validateRestrictions(userId, brandRestrictions);
    
    // Log access attempt
    await this.auditLogger.logBrandAccess({
      userId,
      brandId,
      action,
      granted: hasPermission && restrictionsPassed,
      timestamp: new Date()
    });

    return hasPermission && restrictionsPassed;
  }

  private getRequiredPermission(action: BrandAction): string {
    const permissionMap: Record<BrandAction, string> = {
      [BrandAction.VIEW]: 'brand:read',
      [BrandAction.EDIT]: 'brand:write',
      [BrandAction.DELETE]: 'brand:delete',
      [BrandAction.APPLY]: 'brand:apply',
      [BrandAction.PUBLISH]: 'brand:publish',
      [BrandAction.MANAGE_ASSETS]: 'brand:assets:manage',
      [BrandAction.CONFIGURE_DOMAIN]: 'brand:domain:configure'
    };
    
    return permissionMap[action];
  }
}
```

## Compliance Requirements

### Brand Governance and Approval Workflows

```typescript
interface BrandGovernanceManager {
  submitForApproval(brandId: string, submitterId: string): Promise<ApprovalWorkflow>;
  reviewBrand(workflowId: string, reviewerId: string, decision: ApprovalDecision): Promise<void>;
  getApprovalStatus(brandId: string): Promise<ApprovalStatus>;
  configureBrandPolicy(tenantId: string, policy: BrandPolicy): Promise<void>;
}

interface BrandPolicy {
  tenantId: string;
  approvalRequired: boolean;
  approvers: ApproverConfiguration[];
  restrictions: BrandRestriction[];
  compliance: ComplianceRequirement[];
  auditSettings: AuditConfiguration;
}

interface ApprovalWorkflow {
  id: string;
  brandId: string;
  submitterId: string;
  status: WorkflowStatus;
  steps: ApprovalStep[];
  currentStep: number;
  submittedAt: Date;
  completedAt?: Date;
}

enum WorkflowStatus {
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

class EnterpriseBrandGovernance implements BrandGovernanceManager {
  async submitForApproval(brandId: string, submitterId: string): Promise<ApprovalWorkflow> {
    const brand = await this.brandRepository.findById(brandId);
    const policy = await this.getBrandPolicy(brand.tenantId);
    
    if (!policy.approvalRequired) {
      // Auto-approve if no approval required
      await this.autoApproveBrand(brandId);
      return this.createAutoApprovedWorkflow(brandId, submitterId);
    }
    
    // Create approval workflow
    const workflow: ApprovalWorkflow = {
      id: this.generateWorkflowId(),
      brandId,
      submitterId,
      status: WorkflowStatus.PENDING,
      steps: this.createApprovalSteps(policy.approvers),
      currentStep: 0,
      submittedAt: new Date()
    };
    
    await this.workflowRepository.create(workflow);
    
    // Notify first approver
    await this.notifyApprover(workflow.steps[0].approverId, workflow);
    
    return workflow;
  }

  async reviewBrand(workflowId: string, reviewerId: string, decision: ApprovalDecision): Promise<void> {
    const workflow = await this.workflowRepository.findById(workflowId);
    const currentStep = workflow.steps[workflow.currentStep];
    
    // Validate reviewer
    if (currentStep.approverId !== reviewerId) {
      throw new UnauthorizedReviewerError('User not authorized to review this step');
    }
    
    // Record decision
    currentStep.decision = decision.approved ? 'approved' : 'rejected';
    currentStep.comments = decision.comments;
    currentStep.reviewedAt = new Date();
    currentStep.reviewerId = reviewerId;
    
    if (decision.approved) {
      // Move to next step or complete
      if (workflow.currentStep < workflow.steps.length - 1) {
        workflow.currentStep++;
        await this.notifyApprover(workflow.steps[workflow.currentStep].approverId, workflow);
      } else {
        // All steps approved
        workflow.status = WorkflowStatus.APPROVED;
        workflow.completedAt = new Date();
        await this.approveBrand(workflow.brandId);
      }
    } else {
      // Rejected
      workflow.status = WorkflowStatus.REJECTED;
      workflow.completedAt = new Date();
      await this.rejectBrand(workflow.brandId, decision.comments);
    }
    
    await this.workflowRepository.update(workflow);
    
    // Notify submitter of status change
    await this.notifySubmitter(workflow);
  }
}
```

### Regulatory Compliance and Audit Trails

```typescript
class BrandComplianceManager {
  async validateRegulatoryCompliance(brand: Brand): Promise<ComplianceReport> {
    const violations: ComplianceViolation[] = [];
    
    // GDPR compliance checks
    const gdprViolations = await this.validateGDPRCompliance(brand);
    violations.push(...gdprViolations);
    
    // Accessibility compliance (WCAG)
    const accessibilityViolations = await this.validateAccessibilityCompliance(brand);
    violations.push(...accessibilityViolations);
    
    // Industry-specific compliance
    const industryViolations = await this.validateIndustryCompliance(brand);
    violations.push(...industryViolations);
    
    // Trademark and copyright compliance
    const ipViolations = await this.validateIntellectualPropertyCompliance(brand);
    violations.push(...ipViolations);

    return {
      brandId: brand.id,
      compliant: violations.length === 0,
      violations,
      recommendations: this.generateComplianceRecommendations(violations),
      auditTrail: await this.generateAuditTrail(brand.id),
      generatedAt: new Date()
    };
  }

  private async validateGDPRCompliance(brand: Brand): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];
    
    // Check for data processing transparency
    if (!brand.metadata.dataProcessingDisclosure) {
      violations.push({
        regulation: 'GDPR',
        article: 'Article 13',
        severity: 'HIGH',
        description: 'Missing data processing disclosure',
        remediation: 'Add data processing transparency information'
      });
    }
    
    // Check for consent mechanisms
    if (!brand.compliance.consentManagement) {
      violations.push({
        regulation: 'GDPR',
        article: 'Article 7',
        severity: 'HIGH',
        description: 'Missing consent management configuration',
        remediation: 'Configure consent collection and management'
      });
    }
    
    // Check for data retention policies
    if (!brand.compliance.dataRetention) {
      violations.push({
        regulation: 'GDPR',
        article: 'Article 5',
        severity: 'MEDIUM',
        description: 'Missing data retention policy',
        remediation: 'Define data retention and deletion policies'
      });
    }

    return violations;
  }

  async generateAuditTrail(brandId: string): Promise<AuditTrail[]> {
    return await this.auditRepository.findByBrandId(brandId, {
      orderBy: 'timestamp',
      order: 'DESC',
      limit: 100
    });
  }
}
```

## Testing Considerations

### Brand Template Testing Framework

```typescript
describe('Enterprise White-Labeling System', () => {
  let brandManager: EnterpriseBrandManager;
  let domainManager: EnterpriseDomainManager;
  let themeEngine: EnterpriseThemeEngine;
  
  beforeEach(async () => {
    brandManager = new EnterpriseBrandManager();
    domainManager = new EnterpriseDomainManager();
    themeEngine = new EnterpriseThemeEngine();
  });

  describe('Brand Management', () => {
    it('should create a complete brand with all required components', async () => {
      const brandData = createTestBrandData();
      const brand = await brandManager.createBrand(brandData);
      
      expect(brand).toBeDefined();
      expect(brand.theme).toBeDefined();
      expect(brand.assets).toBeDefined();
      expect(brand.status).toBe(BrandStatus.DRAFT);
    });

    it('should validate brand compliance before activation', async () => {
      const brand = await createTestBrand();
      const complianceResult = await brandManager.validateBrandCompliance(brand.id);
      
      expect(complianceResult.compliant).toBe(true);
      expect(complianceResult.violations).toHaveLength(0);
    });

    it('should apply brand to tenant successfully', async () => {
      const brand = await createActiveBrand();
      await brandManager.applyBrand(brand.tenantId, brand.id);
      
      const tenantConfig = await getTenantBrandConfiguration(brand.tenantId);
      expect(tenantConfig.activeBrandId).toBe(brand.id);
    });
  });

  describe('Domain Management', () => {
    it('should add and verify custom domain', async () => {
      const domain = createTestDomain();
      await domainManager.addCustomDomain('tenant-1', domain);
      
      // Mock DNS verification
      mockDNSVerification(domain.domain, domain.verification.token);
      
      const result = await domainManager.verifyDomain(domain.id);
      expect(result.verified).toBe(true);
    });

    it('should configure SSL for verified domain', async () => {
      const domain = await createVerifiedDomain();
      const ssl = await domainManager.enableSSL(domain.id);
      
      expect(ssl.enabled).toBe(true);
      expect(ssl.certificate).toBeDefined();
    });
  });

  describe('Theme Generation', () => {
    it('should generate valid CSS from brand theme', async () => {
      const brand = await createTestBrand();
      const theme = await themeEngine.compileTheme(brand);
      const css = await themeEngine.generateCSS(theme);
      
      expect(css).toContain(':root');
      expect(css).toContain('--color-primary-500');
      expect(validateCSS(css)).toBe(true);
    });

    it('should generate responsive theme variables', async () => {
      const brand = await createTestBrand();
      const variables = await themeEngine.generateThemeVariables(brand);
      
      expect(variables.breakpoints).toBeDefined();
      expect(variables.breakpoints['--breakpoint-mobile']).toBeDefined();
      expect(variables.breakpoints['--breakpoint-desktop']).toBeDefined();
    });
  });

  describe('Security and Compliance', () => {
    it('should validate asset security', async () => {
      const asset = createTestAsset();
      const securityResult = await validateAssetSecurity(asset);
      
      expect(securityResult.valid).toBe(true);
      expect(securityResult.violations).toHaveLength(0);
    });

    it('should enforce brand access controls', async () => {
      const brand = await createTestBrand();
      const hasAccess = await validateBrandAccess('user-1', brand.id, BrandAction.EDIT);
      
      expect(hasAccess).toBe(false); // User should not have edit access
    });

    it('should generate compliance report', async () => {
      const brand = await createTestBrand();
      const report = await generateComplianceReport(brand);
      
      expect(report.compliant).toBe(true);
      expect(report.auditTrail).toBeDefined();
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle concurrent brand applications', async () => {
      const brand = await createActiveBrand();
      const promises = Array.from({ length: 10 }, (_, i) => 
        brandManager.applyBrand(`tenant-${i}`, brand.id)
      );
      
      await expect(Promise.all(promises)).resolves.not.toThrow();
    });

    it('should optimize theme CSS for production', async () => {
      const brand = await createTestBrand();
      const theme = await themeEngine.compileTheme(brand);
      
      expect(theme.css.length).toBeLessThan(50000); // Should be minified
      expect(theme.css).not.toContain('\n'); // Should be compressed
    });
  });
});

// Test utilities
function createTestBrandData(): BrandCreationRequest {
  return {
    tenantId: 'test-tenant',
    name: 'Test Brand',
    description: 'Test brand for unit testing',
    theme: {
      colors: {
        primary: {
          500: '#3B82F6'
        }
      }
    },
    assets: {
      logos: {
        primary: {
          light: [createTestAssetFile()]
        }
      }
    }
  };
}

function createTestAssetFile(): RawAssetFile {
  return {
    buffer: Buffer.from('test-image-data'),
    mimeType: 'image/png',
    originalName: 'logo.png'
  };
}
```

### Integration Testing

```typescript
describe('White-Labeling Integration Tests', () => {
  it('should complete end-to-end brand deployment', async () => {
    // Create brand
    const brand = await brandManager.createBrand(createTestBrandData());
    
    // Add custom domain
    const domain = await domainManager.addCustomDomain(brand.tenantId, createTestDomain());
    
    // Verify domain
    mockDNSVerification(domain.domain, domain.verification.token);
    await domainManager.verifyDomain(domain.id);
    
    // Apply brand
    await brandManager.applyBrand(brand.tenantId, brand.id);
    
    // Verify deployment
    const response = await fetch(`https://${domain.domain}`);
    expect(response.status).toBe(200);
    
    const html = await response.text();
    expect(html).toContain('--color-primary-500: #3B82F6');
  });

  it('should handle brand updates and cache invalidation', async () => {
    const brand = await createActiveBrand();
    
    // Update brand theme
    await brandManager.updateBrand(brand.id, {
      theme: {
        colors: {
          primary: { 500: '#EF4444' }
        }
      }
    });
    
    // Verify cache invalidation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response = await fetch(`https://tenant.example.com`);
    const html = await response.text();
    expect(html).toContain('--color-primary-500: #EF4444');
  });
});
```
```