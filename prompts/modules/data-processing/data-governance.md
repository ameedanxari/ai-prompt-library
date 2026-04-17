# Data Governance Template

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

This template provides comprehensive patterns for implementing data governance systems including data catalogs, metadata management, access controls, and compliance tracking. It covers data discovery, classification, policy enforcement, and governance workflows for building trustworthy and compliant data platforms.

## Context

Data governance is essential for organizations to manage their data assets effectively, ensure regulatory compliance, and maintain data quality and security. This template addresses the challenges of cataloging diverse data assets, managing metadata at scale, enforcing access policies, tracking compliance requirements, and enabling data discovery across the organization.

## Core Components

### Data Catalog Service

## Examples

```typescript
interface DataCatalogService {
  // Asset management
  registerAsset(asset: DataAsset): Promise<string>;
  updateAsset(assetId: string, updates: Partial<DataAsset>): Promise<void>;
  deleteAsset(assetId: string): Promise<void>;
  getAsset(assetId: string): Promise<DataAsset | null>;
  
  // Discovery
  searchAssets(query: SearchQuery): Promise<SearchResult>;
  browseByCategory(category: string): Promise<DataAsset[]>;
  getRelatedAssets(assetId: string): Promise<DataAsset[]>;
  
  // Metadata
  addMetadata(assetId: string, metadata: Metadata): Promise<void>;
  getMetadata(assetId: string): Promise<Metadata>;
  updateMetadata(assetId: string, metadata: Partial<Metadata>): Promise<void>;
}


interface DataAsset {
  id: string;
  name: string;
  type: AssetType;
  description: string;
  owner: string;
  steward?: string;
  domain: string;
  classification: DataClassification;
  schema?: DataSchema;
  location: AssetLocation;
  tags: string[];
  businessGlossaryTerms: string[];
  qualityScore?: number;
  lastUpdated: Date;
  createdAt: Date;
  metadata: Record<string, unknown>;
}

enum AssetType {
  TABLE = 'table',
  VIEW = 'view',
  FILE = 'file',
  STREAM = 'stream',
  API = 'api',
  REPORT = 'report',
  DASHBOARD = 'dashboard',
  MODEL = 'model',
  PIPELINE = 'pipeline'
}

enum DataClassification {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted',
  PII = 'pii',
  PHI = 'phi',
  PCI = 'pci'
}

interface AssetLocation {
  system: string;
  database?: string;
  schema?: string;
  path?: string;
  url?: string;
  connectionId?: string;
}

interface SearchQuery {
  text?: string;
  filters?: SearchFilter[];
  facets?: string[];
  sort?: SortOption;
  pagination?: PaginationOptions;
}

interface SearchResult {
  assets: DataAsset[];
  totalCount: number;
  facets: FacetResult[];
  suggestions?: string[];
}
```

### Metadata Management Service

```typescript
interface MetadataManagementService {
  // Schema management
  registerSchema(schema: DataSchema): Promise<string>;
  updateSchema(schemaId: string, schema: DataSchema): Promise<void>;
  getSchemaHistory(schemaId: string): Promise<SchemaVersion[]>;
  compareSchemas(schemaId1: string, schemaId2: string): Promise<SchemaComparison>;
  
  // Business metadata
  addBusinessTerm(term: BusinessTerm): Promise<string>;
  linkTermToAsset(termId: string, assetId: string, columnName?: string): Promise<void>;
  getBusinessGlossary(): Promise<BusinessTerm[]>;
  
  // Technical metadata
  syncTechnicalMetadata(sourceId: string): Promise<SyncResult>;
  getColumnStatistics(assetId: string, columnName: string): Promise<ColumnStatistics>;
  
  // Custom metadata
  defineCustomAttribute(attribute: CustomAttribute): Promise<string>;
  setCustomAttribute(assetId: string, attributeId: string, value: unknown): Promise<void>;
}

interface DataSchema {
  id: string;
  name: string;
  version: string;
  columns: ColumnDefinition[];
  primaryKey?: string[];
  foreignKeys?: ForeignKey[];
  indexes?: Index[];
  partitionBy?: string[];
  format?: string;
}

interface ColumnDefinition {
  name: string;
  dataType: string;
  nullable: boolean;
  description?: string;
  defaultValue?: unknown;
  constraints?: ColumnConstraint[];
  businessTerms?: string[];
  classification?: DataClassification;
  piiType?: PIIType;
  tags?: string[];
}

interface BusinessTerm {
  id: string;
  name: string;
  definition: string;
  domain: string;
  synonyms?: string[];
  relatedTerms?: string[];
  owner: string;
  status: 'draft' | 'approved' | 'deprecated';
  examples?: string[];
}

enum PIIType {
  NAME = 'name',
  EMAIL = 'email',
  PHONE = 'phone',
  ADDRESS = 'address',
  SSN = 'ssn',
  CREDIT_CARD = 'credit_card',
  DATE_OF_BIRTH = 'date_of_birth',
  IP_ADDRESS = 'ip_address',
  BIOMETRIC = 'biometric',
  HEALTH = 'health',
  FINANCIAL = 'financial'
}
```


### Access Control Service

```typescript
interface DataAccessControlService {
  // Policy management
  createPolicy(policy: AccessPolicy): Promise<string>;
  updatePolicy(policyId: string, policy: Partial<AccessPolicy>): Promise<void>;
  deletePolicy(policyId: string): Promise<void>;
  getPoliciesForAsset(assetId: string): Promise<AccessPolicy[]>;
  
  // Access requests
  requestAccess(request: AccessRequest): Promise<string>;
  approveRequest(requestId: string, approver: string): Promise<void>;
  denyRequest(requestId: string, approver: string, reason: string): Promise<void>;
  getAccessRequests(filters?: RequestFilters): Promise<AccessRequest[]>;
  
  // Access checks
  checkAccess(userId: string, assetId: string, action: AccessAction): Promise<AccessDecision>;
  getUserPermissions(userId: string): Promise<UserPermissions>;
  getAssetPermissions(assetId: string): Promise<AssetPermissions>;
}

interface AccessPolicy {
  id: string;
  name: string;
  description: string;
  type: PolicyType;
  scope: PolicyScope;
  rules: PolicyRule[];
  priority: number;
  enabled: boolean;
  effectiveFrom?: Date;
  effectiveUntil?: Date;
}

enum PolicyType {
  ALLOW = 'allow',
  DENY = 'deny',
  MASK = 'mask',
  ROW_FILTER = 'row_filter',
  COLUMN_FILTER = 'column_filter'
}

interface PolicyScope {
  assets?: string[];
  assetTypes?: AssetType[];
  classifications?: DataClassification[];
  domains?: string[];
  tags?: string[];
}

interface PolicyRule {
  subjects: PolicySubject[];
  actions: AccessAction[];
  conditions?: PolicyCondition[];
  effect: 'allow' | 'deny';
}

interface PolicySubject {
  type: 'user' | 'group' | 'role' | 'service';
  id: string;
}

enum AccessAction {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  ADMIN = 'admin',
  EXPORT = 'export',
  SHARE = 'share'
}

interface AccessRequest {
  id: string;
  requesterId: string;
  assetId: string;
  requestedActions: AccessAction[];
  justification: string;
  duration?: number;
  status: 'pending' | 'approved' | 'denied' | 'expired';
  approvers: string[];
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
}

interface AccessDecision {
  allowed: boolean;
  policy?: string;
  reason?: string;
  masking?: MaskingConfig;
  rowFilter?: string;
  columnFilter?: string[];
}
```

### Compliance Tracking Service

```typescript
interface ComplianceTrackingService {
  // Compliance frameworks
  registerFramework(framework: ComplianceFramework): Promise<string>;
  getFrameworks(): Promise<ComplianceFramework[]>;
  
  // Compliance assessment
  assessCompliance(assetId: string, frameworkId: string): Promise<ComplianceAssessment>;
  getComplianceStatus(scope?: ComplianceScope): Promise<ComplianceStatus>;
  
  // Audit trails
  logAuditEvent(event: AuditEvent): Promise<void>;
  getAuditTrail(filters: AuditFilters): Promise<AuditEvent[]>;
  generateAuditReport(config: AuditReportConfig): Promise<AuditReport>;
  
  // Data retention
  setRetentionPolicy(assetId: string, policy: RetentionPolicy): Promise<void>;
  getRetentionPolicies(): Promise<RetentionPolicy[]>;
  enforceRetention(): Promise<RetentionEnforcementResult>;
}

interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  version: string;
  controls: ComplianceControl[];
  applicableClassifications: DataClassification[];
}

interface ComplianceControl {
  id: string;
  name: string;
  description: string;
  category: string;
  requirements: string[];
  automatedChecks?: AutomatedCheck[];
  manualChecks?: ManualCheck[];
}

interface ComplianceAssessment {
  assetId: string;
  frameworkId: string;
  assessedAt: Date;
  overallStatus: 'compliant' | 'non_compliant' | 'partial' | 'not_applicable';
  controlResults: ControlResult[];
  findings: ComplianceFinding[];
  recommendations: string[];
}

interface AuditEvent {
  id: string;
  timestamp: Date;
  eventType: AuditEventType;
  actor: string;
  actorType: 'user' | 'service' | 'system';
  resource: string;
  resourceType: string;
  action: string;
  outcome: 'success' | 'failure';
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

enum AuditEventType {
  DATA_ACCESS = 'data_access',
  DATA_MODIFICATION = 'data_modification',
  POLICY_CHANGE = 'policy_change',
  ACCESS_REQUEST = 'access_request',
  SCHEMA_CHANGE = 'schema_change',
  EXPORT = 'export',
  ADMIN_ACTION = 'admin_action'
}

interface RetentionPolicy {
  id: string;
  name: string;
  assetPattern?: string;
  classification?: DataClassification;
  retentionPeriod: number;
  retentionUnit: 'days' | 'months' | 'years';
  archiveAfter?: number;
  deleteAfter?: number;
  legalHold?: boolean;
}
```


## Implementation Patterns

### Data Catalog Implementation

```typescript
class DataCatalogManager {
  private assetStore: AssetStore;
  private searchEngine: SearchEngine;
  private metadataService: MetadataManagementService;

  async registerAsset(asset: DataAsset): Promise<string> {
    // Validate asset
    this.validateAsset(asset);

    // Auto-classify if not provided
    if (!asset.classification) {
      asset.classification = await this.autoClassify(asset);
    }

    // Extract and enrich metadata
    const enrichedAsset = await this.enrichMetadata(asset);

    // Store asset
    const assetId = await this.assetStore.save(enrichedAsset);

    // Index for search
    await this.searchEngine.index(enrichedAsset);

    // Trigger governance workflows
    await this.triggerGovernanceWorkflows(enrichedAsset);

    return assetId;
  }

  async searchAssets(query: SearchQuery): Promise<SearchResult> {
    // Build search query
    const searchRequest = this.buildSearchRequest(query);

    // Execute search
    const results = await this.searchEngine.search(searchRequest);

    // Apply access control filtering
    const filteredResults = await this.filterByAccess(results, query.userId);

    // Enrich results with additional metadata
    const enrichedResults = await this.enrichSearchResults(filteredResults);

    return {
      assets: enrichedResults.assets,
      totalCount: enrichedResults.totalCount,
      facets: this.buildFacets(results),
      suggestions: await this.generateSuggestions(query)
    };
  }

  private async autoClassify(asset: DataAsset): Promise<DataClassification> {
    // Check for PII patterns in column names and data samples
    const piiDetected = await this.detectPII(asset);
    
    if (piiDetected.hasPHI) return DataClassification.PHI;
    if (piiDetected.hasPCI) return DataClassification.PCI;
    if (piiDetected.hasPII) return DataClassification.PII;
    
    // Check domain-based classification rules
    const domainClassification = this.getDomainClassification(asset.domain);
    if (domainClassification) return domainClassification;

    return DataClassification.INTERNAL;
  }

  private async enrichMetadata(asset: DataAsset): Promise<DataAsset> {
    // Sync technical metadata from source
    if (asset.location.connectionId) {
      const technicalMetadata = await this.metadataService.syncTechnicalMetadata(
        asset.location.connectionId
      );
      asset.schema = technicalMetadata.schema;
    }

    // Link to business glossary terms
    const suggestedTerms = await this.suggestBusinessTerms(asset);
    asset.businessGlossaryTerms = [
      ...asset.businessGlossaryTerms,
      ...suggestedTerms
    ];

    // Calculate quality score if available
    if (asset.schema) {
      asset.qualityScore = await this.calculateQualityScore(asset);
    }

    return asset;
  }
}
```

### Policy Enforcement Engine

```typescript
class PolicyEnforcementEngine {
  private policyStore: PolicyStore;
  private auditService: AuditService;

  async checkAccess(
    userId: string,
    assetId: string,
    action: AccessAction
  ): Promise<AccessDecision> {
    // Get user context
    const userContext = await this.getUserContext(userId);

    // Get asset context
    const assetContext = await this.getAssetContext(assetId);

    // Get applicable policies
    const policies = await this.getApplicablePolicies(assetContext);

    // Evaluate policies in priority order
    let decision: AccessDecision = { allowed: false, reason: 'No matching policy' };

    for (const policy of policies.sort((a, b) => b.priority - a.priority)) {
      const result = await this.evaluatePolicy(policy, userContext, assetContext, action);
      
      if (result.matched) {
        decision = result.decision;
        
        // Deny takes precedence
        if (!decision.allowed) break;
      }
    }

    // Log audit event
    await this.auditService.logAuditEvent({
      eventType: AuditEventType.DATA_ACCESS,
      actor: userId,
      actorType: 'user',
      resource: assetId,
      resourceType: 'data_asset',
      action: action,
      outcome: decision.allowed ? 'success' : 'failure',
      details: { policy: decision.policy, reason: decision.reason }
    });

    return decision;
  }

  private async evaluatePolicy(
    policy: AccessPolicy,
    userContext: UserContext,
    assetContext: AssetContext,
    action: AccessAction
  ): Promise<PolicyEvaluationResult> {
    // Check if policy applies to this asset
    if (!this.policyAppliesToAsset(policy, assetContext)) {
      return { matched: false };
    }

    // Evaluate each rule
    for (const rule of policy.rules) {
      // Check if action matches
      if (!rule.actions.includes(action) && !rule.actions.includes(AccessAction.ADMIN)) {
        continue;
      }

      // Check if subject matches
      if (!this.subjectMatches(rule.subjects, userContext)) {
        continue;
      }

      // Evaluate conditions
      if (rule.conditions && !await this.evaluateConditions(rule.conditions, userContext, assetContext)) {
        continue;
      }

      // Rule matched
      return {
        matched: true,
        decision: {
          allowed: rule.effect === 'allow',
          policy: policy.id,
          reason: `Matched rule in policy ${policy.name}`,
          masking: policy.type === PolicyType.MASK ? this.getMaskingConfig(policy) : undefined,
          rowFilter: policy.type === PolicyType.ROW_FILTER ? this.getRowFilter(policy, userContext) : undefined,
          columnFilter: policy.type === PolicyType.COLUMN_FILTER ? this.getColumnFilter(policy) : undefined
        }
      };
    }

    return { matched: false };
  }
}
```


### Compliance Assessment Engine

```typescript
class ComplianceAssessmentEngine {
  private frameworkStore: FrameworkStore;
  private controlEvaluator: ControlEvaluator;

  async assessCompliance(
    assetId: string,
    frameworkId: string
  ): Promise<ComplianceAssessment> {
    const framework = await this.frameworkStore.get(frameworkId);
    const asset = await this.getAssetWithMetadata(assetId);

    const controlResults: ControlResult[] = [];
    const findings: ComplianceFinding[] = [];

    for (const control of framework.controls) {
      const result = await this.evaluateControl(control, asset);
      controlResults.push(result);

      if (result.status !== 'compliant') {
        findings.push(...result.findings);
      }
    }

    const overallStatus = this.calculateOverallStatus(controlResults);

    return {
      assetId,
      frameworkId,
      assessedAt: new Date(),
      overallStatus,
      controlResults,
      findings,
      recommendations: this.generateRecommendations(findings)
    };
  }

  private async evaluateControl(
    control: ComplianceControl,
    asset: DataAsset
  ): Promise<ControlResult> {
    const checkResults: CheckResult[] = [];

    // Run automated checks
    if (control.automatedChecks) {
      for (const check of control.automatedChecks) {
        const result = await this.runAutomatedCheck(check, asset);
        checkResults.push(result);
      }
    }

    // Get manual check status
    if (control.manualChecks) {
      for (const check of control.manualChecks) {
        const result = await this.getManualCheckStatus(check, asset.id);
        checkResults.push(result);
      }
    }

    const status = this.determineControlStatus(checkResults);
    const findings = checkResults
      .filter(r => r.status !== 'passed')
      .map(r => this.createFinding(control, r));

    return {
      controlId: control.id,
      controlName: control.name,
      status,
      checkResults,
      findings
    };
  }

  private async runAutomatedCheck(
    check: AutomatedCheck,
    asset: DataAsset
  ): Promise<CheckResult> {
    switch (check.type) {
      case 'encryption_at_rest':
        return this.checkEncryptionAtRest(asset);
      case 'encryption_in_transit':
        return this.checkEncryptionInTransit(asset);
      case 'access_logging':
        return this.checkAccessLogging(asset);
      case 'data_classification':
        return this.checkDataClassification(asset);
      case 'retention_policy':
        return this.checkRetentionPolicy(asset);
      case 'pii_detection':
        return this.checkPIIDetection(asset);
      default:
        return this.runCustomCheck(check, asset);
    }
  }
}
```

## Integration Points

### Apache Atlas Integration

```typescript
// Integration with Apache Atlas for enterprise metadata management
class AtlasGovernanceIntegration {
  private atlasClient: AtlasClient;

  async syncAssetToAtlas(asset: DataAsset): Promise<string> {
    const atlasEntity = this.convertToAtlasEntity(asset);
    const response = await this.atlasClient.createEntity(atlasEntity);
    return response.guid;
  }

  async importFromAtlas(atlasGuid: string): Promise<DataAsset> {
    const entity = await this.atlasClient.getEntity(atlasGuid);
    return this.convertFromAtlasEntity(entity);
  }

  async syncClassifications(): Promise<void> {
    const atlasClassifications = await this.atlasClient.getClassifications();
    for (const classification of atlasClassifications) {
      await this.catalogService.registerClassification(
        this.convertClassification(classification)
      );
    }
  }
}
```

### Collibra Integration

```typescript
// Integration with Collibra for business glossary and governance
class CollibraIntegration {
  async syncBusinessGlossary(): Promise<SyncResult> {
    const terms = await this.collibraClient.getBusinessTerms();
    const syncResults: TermSyncResult[] = [];

    for (const term of terms) {
      const result = await this.metadataService.addBusinessTerm({
        id: term.id,
        name: term.name,
        definition: term.definition,
        domain: term.domain,
        synonyms: term.synonyms,
        owner: term.owner,
        status: term.status
      });
      syncResults.push(result);
    }

    return { synced: syncResults.length, errors: [] };
  }

  async syncPolicies(): Promise<SyncResult> {
    const policies = await this.collibraClient.getDataPolicies();
    for (const policy of policies) {
      await this.accessControlService.createPolicy(
        this.convertPolicy(policy)
      );
    }
    return { synced: policies.length, errors: [] };
  }
}
```

### Data Catalog Federation

```typescript
// Federation across multiple data catalogs
class CatalogFederationService {
  private catalogs: Map<string, DataCatalogConnector> = new Map();

  async federatedSearch(query: SearchQuery): Promise<FederatedSearchResult> {
    const results = await Promise.all(
      Array.from(this.catalogs.entries()).map(async ([catalogId, connector]) => {
        try {
          const result = await connector.search(query);
          return { catalogId, result, error: null };
        } catch (error) {
          return { catalogId, result: null, error };
        }
      })
    );

    return this.mergeResults(results);
  }

  async syncCatalog(catalogId: string): Promise<SyncResult> {
    const connector = this.catalogs.get(catalogId);
    if (!connector) throw new Error(`Catalog ${catalogId} not found`);

    const assets = await connector.listAssets();
    const syncResults: AssetSyncResult[] = [];

    for (const asset of assets) {
      const result = await this.catalogService.registerAsset({
        ...asset,
        metadata: { ...asset.metadata, sourceCatalog: catalogId }
      });
      syncResults.push(result);
    }

    return { synced: syncResults.length, errors: [] };
  }
}
```

## Security Considerations

### Access Control
- Implement fine-grained access control for catalog assets
- Use attribute-based access control (ABAC) for dynamic policies
- Audit all access to sensitive metadata
- Implement data masking for sensitive column information

### Data Protection
- Encrypt metadata at rest and in transit
- Implement secure credential storage for data source connections
- Apply data classification labels automatically
- Support data anonymization for compliance

### Compliance
- Maintain comprehensive audit trails
- Support regulatory reporting requirements
- Implement data retention and deletion policies
- Enable privacy impact assessments

## Testing Considerations

### Unit Testing

```typescript
describe('DataCatalogService', () => {
  it('should auto-classify assets with PII', async () => {
    const asset = {
      name: 'customers',
      schema: {
        columns: [
          { name: 'email', dataType: 'string' },
          { name: 'ssn', dataType: 'string' }
        ]
      }
    };
    
    const registered = await catalogService.registerAsset(asset);
    const retrieved = await catalogService.getAsset(registered);
    
    expect(retrieved.classification).toBe(DataClassification.PII);
  });

  it('should enforce access policies', async () => {
    const decision = await accessControlService.checkAccess(
      'user123',
      'asset456',
      AccessAction.READ
    );
    
    expect(decision.allowed).toBe(true);
    expect(decision.masking).toBeDefined();
  });
});
```

### Property-Based Testing

```typescript
describe('Governance Properties', () => {
  it('should always log audit events for access checks', () => {
    fc.assert(fc.property(
      fc.record({ userId: fc.string(), assetId: fc.string(), action: fc.constantFrom(...Object.values(AccessAction)) }),
      async (request) => {
        await accessControlService.checkAccess(request.userId, request.assetId, request.action);
        const auditTrail = await auditService.getAuditTrail({ resource: request.assetId });
        expect(auditTrail.length).toBeGreaterThan(0);
      }
    ));
  });

  it('should maintain policy consistency across updates', () => {
    fc.assert(fc.property(
      fc.record({ policyId: fc.string(), updates: fc.record({ enabled: fc.boolean() }) }),
      async (input) => {
        const original = await accessControlService.getPolicy(input.policyId);
        await accessControlService.updatePolicy(input.policyId, input.updates);
        const updated = await accessControlService.getPolicy(input.policyId);
        
        expect(updated.id).toBe(original.id);
        expect(updated.enabled).toBe(input.updates.enabled);
      }
    ));
  });
});
```
