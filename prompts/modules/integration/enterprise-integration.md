# Enterprise Integration Template

## Purpose

Provides comprehensive patterns for implementing enterprise service bus (ESB), B2B integration, EDI processing, and legacy system integration. This template covers enterprise integration patterns, protocol adapters, and system connectivity for complex enterprise environments.

## Context

Enterprise integration connects diverse systems, applications, and partners across organizational boundaries. This template addresses ESB architecture, B2B connectivity, EDI standards compliance, and legacy system modernization while ensuring reliability, security, and compliance in enterprise environments.

## Core Components

### Enterprise Service Bus

## Examples

```typescript
interface EnterpriseServiceBus {
  // Message routing
  routeMessage(message: ESBMessage): Promise<RoutingResult>;
  registerRoute(route: RouteDefinition): Promise<void>;
  removeRoute(routeId: string): Promise<void>;
  
  // Service management
  registerService(service: ServiceEndpoint): Promise<void>;
  deregisterService(serviceId: string): Promise<void>;
  discoverService(serviceName: string): Promise<ServiceEndpoint[]>;
  
  // Transformation
  transformMessage(message: ESBMessage, transformation: TransformationSpec): Promise<ESBMessage>;
  registerTransformation(transformation: TransformationDefinition): Promise<void>;
}

interface ESBMessage {
  id: string;
  headers: Record<string, string>;
  body: any;
  contentType: string;
  correlationId: string;
  replyTo?: string;
  timestamp: Date;
  metadata: MessageMetadata;
}


interface RouteDefinition {
  id: string;
  name: string;
  source: EndpointSpec;
  destination: EndpointSpec;
  filters: MessageFilter[];
  transformations: TransformationSpec[];
  errorHandler: ErrorHandlerSpec;
  retryPolicy: RetryPolicy;
}

interface ServiceEndpoint {
  id: string;
  name: string;
  protocol: ServiceProtocol;
  address: string;
  operations: ServiceOperation[];
  security: SecurityConfig;
  metadata: Record<string, any>;
}

enum ServiceProtocol {
  REST = 'rest',
  SOAP = 'soap',
  GRPC = 'grpc',
  JMS = 'jms',
  AMQP = 'amqp',
  FILE = 'file',
  FTP = 'ftp',
  SFTP = 'sftp'
}
```

### B2B Gateway

```typescript
interface B2BGateway {
  // Partner management
  registerPartner(partner: TradingPartner): Promise<void>;
  updatePartner(partnerId: string, updates: Partial<TradingPartner>): Promise<void>;
  getPartner(partnerId: string): Promise<TradingPartner>;
  
  // Document exchange
  sendDocument(partnerId: string, document: B2BDocument): Promise<SendResult>;
  receiveDocuments(partnerId: string): Promise<B2BDocument[]>;
  acknowledgeDocument(documentId: string): Promise<void>;
  
  // Protocol handling
  handleAS2Message(message: AS2Message): Promise<AS2Response>;
  handleEDIFACTMessage(message: EDIFACTMessage): Promise<ProcessingResult>;
}

interface TradingPartner {
  id: string;
  name: string;
  identifier: PartnerIdentifier;
  protocols: PartnerProtocol[];
  certificates: PartnerCertificate[];
  agreements: TradingAgreement[];
  contacts: PartnerContact[];
  status: PartnerStatus;
}

interface PartnerIdentifier {
  type: IdentifierType;
  value: string;
  qualifier?: string;
}

enum IdentifierType {
  DUNS = 'duns',
  GLN = 'gln',
  VAT = 'vat',
  CUSTOM = 'custom'
}

interface B2BDocument {
  id: string;
  type: DocumentType;
  partnerId: string;
  content: any;
  format: DocumentFormat;
  status: DocumentStatus;
  sentAt?: Date;
  receivedAt?: Date;
  acknowledgedAt?: Date;
}

enum DocumentFormat {
  EDI_X12 = 'edi_x12',
  EDIFACT = 'edifact',
  XML = 'xml',
  JSON = 'json',
  CSV = 'csv',
  FIXED_WIDTH = 'fixed_width'
}
```

### EDI Processor

```typescript
interface EDIProcessor {
  // Parsing
  parseEDI(content: string, standard: EDIStandard): Promise<ParsedEDI>;
  validateEDI(parsedEDI: ParsedEDI): Promise<ValidationResult>;
  
  // Generation
  generateEDI(data: any, template: EDITemplate): Promise<string>;
  
  // Translation
  translateToInternal(parsedEDI: ParsedEDI, mapping: EDIMapping): Promise<any>;
  translateToEDI(internalData: any, mapping: EDIMapping): Promise<ParsedEDI>;
  
  // Acknowledgment
  generateAcknowledgment(parsedEDI: ParsedEDI, status: AckStatus): Promise<string>;
}

enum EDIStandard {
  X12 = 'x12',
  EDIFACT = 'edifact',
  TRADACOMS = 'tradacoms',
  VDA = 'vda'
}

interface ParsedEDI {
  standard: EDIStandard;
  version: string;
  interchangeHeader: InterchangeHeader;
  functionalGroups: FunctionalGroup[];
  interchangeTrailer: InterchangeTrailer;
}

interface FunctionalGroup {
  header: GroupHeader;
  transactionSets: TransactionSet[];
  trailer: GroupTrailer;
}

interface TransactionSet {
  type: string;
  controlNumber: string;
  segments: EDISegment[];
}

interface EDISegment {
  id: string;
  elements: EDIElement[];
}

interface EDIMapping {
  id: string;
  name: string;
  sourceFormat: DocumentFormat;
  targetFormat: DocumentFormat;
  mappingRules: MappingRule[];
}
```

### Legacy System Adapter

```typescript
interface LegacySystemAdapter {
  // Connection management
  connect(config: LegacyConnectionConfig): Promise<LegacyConnection>;
  disconnect(connectionId: string): Promise<void>;
  testConnection(connectionId: string): Promise<ConnectionTestResult>;
  
  // Data operations
  executeQuery(connectionId: string, query: LegacyQuery): Promise<QueryResult>;
  executeTransaction(connectionId: string, operations: LegacyOperation[]): Promise<TransactionResult>;
  
  // File operations
  readFile(connectionId: string, path: string): Promise<FileContent>;
  writeFile(connectionId: string, path: string, content: any): Promise<void>;
  listFiles(connectionId: string, path: string): Promise<FileInfo[]>;
}

interface LegacyConnectionConfig {
  type: LegacySystemType;
  host: string;
  port: number;
  credentials: LegacyCredentials;
  options: Record<string, any>;
}

enum LegacySystemType {
  MAINFRAME = 'mainframe',
  AS400 = 'as400',
  COBOL = 'cobol',
  ORACLE_FORMS = 'oracle_forms',
  SAP_RFC = 'sap_rfc',
  CICS = 'cics',
  IMS = 'ims'
}

interface LegacyQuery {
  type: QueryType;
  statement: string;
  parameters?: Record<string, any>;
  encoding?: string;
}

enum QueryType {
  SQL = 'sql',
  COBOL_COPYBOOK = 'cobol_copybook',
  CICS_TRANSACTION = 'cics_transaction',
  IMS_DL1 = 'ims_dl1'
}
```

## Implementation Patterns

### ESB Message Routing

```typescript
class EnterpriseServiceBusImpl implements EnterpriseServiceBus {
  private routes: Map<string, RouteDefinition> = new Map();
  private services: Map<string, ServiceEndpoint> = new Map();
  private transformationEngine: TransformationEngine;
  
  async routeMessage(message: ESBMessage): Promise<RoutingResult> {
    // Find matching routes
    const matchingRoutes = this.findMatchingRoutes(message);
    
    if (matchingRoutes.length === 0) {
      throw new NoRouteFoundError(`No route found for message ${message.id}`);
    }
    
    const results: RouteExecutionResult[] = [];
    
    for (const route of matchingRoutes) {
      try {
        // Apply filters
        if (!this.passesFilters(message, route.filters)) {
          continue;
        }
        
        // Apply transformations
        let transformedMessage = message;
        for (const transformation of route.transformations) {
          transformedMessage = await this.transformMessage(transformedMessage, transformation);
        }
        
        // Route to destination
        const result = await this.deliverToDestination(transformedMessage, route.destination);
        
        results.push({
          routeId: route.id,
          success: true,
          result
        });
        
      } catch (error) {
        // Handle error according to route's error handler
        const errorResult = await this.handleRouteError(route, message, error);
        results.push({
          routeId: route.id,
          success: false,
          error: error.message,
          errorHandled: errorResult.handled
        });
      }
    }
    
    return {
      messageId: message.id,
      routeResults: results,
      timestamp: new Date()
    };
  }
  
  private findMatchingRoutes(message: ESBMessage): RouteDefinition[] {
    return Array.from(this.routes.values()).filter(route => {
      return this.matchesSource(message, route.source);
    });
  }
  
  private matchesSource(message: ESBMessage, source: EndpointSpec): boolean {
    // Match by content type
    if (source.contentType && message.contentType !== source.contentType) {
      return false;
    }
    
    // Match by header patterns
    if (source.headerPatterns) {
      for (const [key, pattern] of Object.entries(source.headerPatterns)) {
        if (!new RegExp(pattern).test(message.headers[key] || '')) {
          return false;
        }
      }
    }
    
    return true;
  }
  
  async transformMessage(message: ESBMessage, transformation: TransformationSpec): Promise<ESBMessage> {
    switch (transformation.type) {
      case 'xslt':
        return this.transformationEngine.applyXSLT(message, transformation.template);
        
      case 'jsonata':
        return this.transformationEngine.applyJSONata(message, transformation.expression);
        
      case 'mapping':
        return this.transformationEngine.applyMapping(message, transformation.mappingRules);
        
      case 'script':
        return this.transformationEngine.executeScript(message, transformation.script);
        
      default:
        throw new UnsupportedTransformationError(`Unknown transformation type: ${transformation.type}`);
    }
  }
}
```

### B2B Document Exchange

```typescript
class B2BGatewayImpl implements B2BGateway {
  private partnerStore: PartnerStore;
  private documentStore: DocumentStore;
  private ediProcessor: EDIProcessor;
  private as2Handler: AS2Handler;
  
  async sendDocument(partnerId: string, document: B2BDocument): Promise<SendResult> {
    const partner = await this.partnerStore.get(partnerId);
    
    if (!partner) {
      throw new PartnerNotFoundError(`Partner ${partnerId} not found`);
    }
    
    // Validate document against partner agreement
    await this.validateAgainstAgreement(document, partner);
    
    // Transform document to partner's preferred format
    const transformedDocument = await this.transformForPartner(document, partner);
    
    // Select appropriate protocol
    const protocol = this.selectProtocol(partner, document.type);
    
    // Send document
    let result: SendResult;
    
    switch (protocol.type) {
      case 'as2':
        result = await this.sendViaAS2(transformedDocument, partner, protocol);
        break;
        
      case 'sftp':
        result = await this.sendViaSFTP(transformedDocument, partner, protocol);
        break;
        
      case 'api':
        result = await this.sendViaAPI(transformedDocument, partner, protocol);
        break;
        
      default:
        throw new UnsupportedProtocolError(`Protocol ${protocol.type} not supported`);
    }
    
    // Update document status
    document.status = result.success ? DocumentStatus.SENT : DocumentStatus.FAILED;
    document.sentAt = new Date();
    await this.documentStore.save(document);
    
    return result;
  }
  
  private async sendViaAS2(document: B2BDocument, partner: TradingPartner, protocol: PartnerProtocol): Promise<SendResult> {
    // Build AS2 message
    const as2Message = await this.as2Handler.buildMessage({
      content: document.content,
      contentType: this.getContentType(document.format),
      senderId: this.getOwnAS2Id(),
      receiverId: partner.identifier.value,
      messageId: document.id
    });
    
    // Sign message
    const signedMessage = await this.as2Handler.signMessage(as2Message, this.getSigningCertificate());
    
    // Encrypt message
    const encryptedMessage = await this.as2Handler.encryptMessage(
      signedMessage,
      partner.certificates.find(c => c.type === 'encryption')
    );
    
    // Send via HTTP
    const response = await this.httpClient.post(protocol.endpoint, encryptedMessage, {
      headers: this.as2Handler.getAS2Headers(as2Message)
    });
    
    // Process MDN (Message Disposition Notification)
    const mdn = await this.as2Handler.processMDN(response);
    
    return {
      success: mdn.disposition === 'processed',
      messageId: document.id,
      acknowledgment: mdn
    };
  }
  
  async handleAS2Message(message: AS2Message): Promise<AS2Response> {
    try {
      // Verify sender
      const partner = await this.findPartnerByAS2Id(message.senderId);
      
      // Decrypt message
      const decryptedMessage = await this.as2Handler.decryptMessage(
        message,
        this.getDecryptionCertificate()
      );
      
      // Verify signature
      const signatureValid = await this.as2Handler.verifySignature(
        decryptedMessage,
        partner.certificates.find(c => c.type === 'signing')
      );
      
      if (!signatureValid) {
        throw new SignatureVerificationError('Invalid message signature');
      }
      
      // Process document
      const document = await this.processIncomingDocument(decryptedMessage.content, partner);
      
      // Generate positive MDN
      return this.as2Handler.generateMDN(message, 'processed');
      
    } catch (error) {
      // Generate negative MDN
      return this.as2Handler.generateMDN(message, 'failed', error.message);
    }
  }
}
```

### EDI Processing

```typescript
class EDIProcessorImpl implements EDIProcessor {
  private parsers: Map<EDIStandard, EDIParser> = new Map();
  private validators: Map<EDIStandard, EDIValidator> = new Map();
  
  async parseEDI(content: string, standard: EDIStandard): Promise<ParsedEDI> {
    const parser = this.parsers.get(standard);
    
    if (!parser) {
      throw new UnsupportedEDIStandardError(`EDI standard ${standard} not supported`);
    }
    
    // Detect delimiters
    const delimiters = parser.detectDelimiters(content);
    
    // Parse interchange
    const interchange = parser.parseInterchange(content, delimiters);
    
    return {
      standard,
      version: interchange.version,
      interchangeHeader: interchange.header,
      functionalGroups: interchange.groups.map(group => ({
        header: group.header,
        transactionSets: group.transactions.map(tx => ({
          type: tx.type,
          controlNumber: tx.controlNumber,
          segments: tx.segments
        })),
        trailer: group.trailer
      })),
      interchangeTrailer: interchange.trailer
    };
  }
  
  async validateEDI(parsedEDI: ParsedEDI): Promise<ValidationResult> {
    const validator = this.validators.get(parsedEDI.standard);
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    // Validate interchange structure
    const structureErrors = validator.validateStructure(parsedEDI);
    errors.push(...structureErrors);
    
    // Validate control numbers
    const controlErrors = validator.validateControlNumbers(parsedEDI);
    errors.push(...controlErrors);
    
    // Validate each transaction set
    for (const group of parsedEDI.functionalGroups) {
      for (const transaction of group.transactionSets) {
        const txErrors = validator.validateTransaction(transaction);
        errors.push(...txErrors);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  async translateToInternal(parsedEDI: ParsedEDI, mapping: EDIMapping): Promise<any> {
    const result: any = {};
    
    for (const group of parsedEDI.functionalGroups) {
      for (const transaction of group.transactionSets) {
        const mappedData = await this.applyMapping(transaction, mapping);
        
        // Merge into result
        this.mergeData(result, mappedData);
      }
    }
    
    return result;
  }
  
  private async applyMapping(transaction: TransactionSet, mapping: EDIMapping): Promise<any> {
    const result: any = {};
    
    for (const rule of mapping.mappingRules) {
      const sourceValue = this.extractValue(transaction, rule.sourcePath);
      
      if (sourceValue !== undefined) {
        // Apply transformation if specified
        const transformedValue = rule.transformation
          ? await this.applyTransformation(sourceValue, rule.transformation)
          : sourceValue;
        
        // Set target value
        this.setNestedValue(result, rule.targetPath, transformedValue);
      }
    }
    
    return result;
  }
}
```

### Legacy System Integration

```typescript
class MainframeLegacyAdapter implements LegacySystemAdapter {
  private connections: Map<string, MainframeConnection> = new Map();
  
  async connect(config: LegacyConnectionConfig): Promise<LegacyConnection> {
    const connection = new MainframeConnection({
      host: config.host,
      port: config.port,
      user: config.credentials.username,
      password: config.credentials.password,
      codepage: config.options.codepage || 'IBM-1047'
    });
    
    await connection.connect();
    
    const connectionId = generateConnectionId();
    this.connections.set(connectionId, connection);
    
    return {
      id: connectionId,
      type: config.type,
      status: 'connected',
      connectedAt: new Date()
    };
  }
  
  async executeQuery(connectionId: string, query: LegacyQuery): Promise<QueryResult> {
    const connection = this.connections.get(connectionId);
    
    if (!connection) {
      throw new ConnectionNotFoundError(`Connection ${connectionId} not found`);
    }
    
    switch (query.type) {
      case QueryType.SQL:
        return this.executeSQLQuery(connection, query);
        
      case QueryType.COBOL_COPYBOOK:
        return this.executeCOBOLQuery(connection, query);
        
      case QueryType.CICS_TRANSACTION:
        return this.executeCICSTransaction(connection, query);
        
      default:
        throw new UnsupportedQueryTypeError(`Query type ${query.type} not supported`);
    }
  }
  
  private async executeCOBOLQuery(connection: MainframeConnection, query: LegacyQuery): Promise<QueryResult> {
    // Parse COBOL copybook
    const copybook = this.parseCopybook(query.statement);
    
    // Read data file
    const rawData = await connection.readFile(query.parameters.filePath);
    
    // Parse fixed-width records using copybook layout
    const records = this.parseFixedWidthRecords(rawData, copybook);
    
    // Convert EBCDIC to ASCII
    const convertedRecords = records.map(record => 
      this.convertEBCDICtoASCII(record, query.encoding || 'IBM-1047')
    );
    
    return {
      success: true,
      data: convertedRecords,
      rowCount: convertedRecords.length
    };
  }
  
  private async executeCICSTransaction(connection: MainframeConnection, query: LegacyQuery): Promise<QueryResult> {
    // Build CICS COMMAREA
    const commarea = this.buildCommarea(query.parameters);
    
    // Execute CICS transaction
    const response = await connection.executeCICS({
      transactionId: query.statement,
      commarea,
      timeout: query.parameters.timeout || 30000
    });
    
    // Parse response COMMAREA
    const parsedResponse = this.parseCommarea(response.commarea, query.parameters.responseLayout);
    
    return {
      success: response.returnCode === 0,
      data: parsedResponse,
      returnCode: response.returnCode
    };
  }
}
```

## Integration Points

### ERP System Integration

```typescript
interface ERPIntegration {
  // SAP integration
  callSAPRFC(functionName: string, params: Record<string, any>): Promise<RFCResult>;
  readSAPTable(tableName: string, fields: string[], filter?: string): Promise<TableData>;
  
  // Oracle integration
  callOracleAPI(apiName: string, params: Record<string, any>): Promise<APIResult>;
}

class SAPIntegration implements ERPIntegration {
  async callSAPRFC(functionName: string, params: Record<string, any>): Promise<RFCResult> {
    const client = await this.getConnection();
    
    try {
      const result = await client.call(functionName, params);
      return { success: true, data: result };
    } finally {
      await client.close();
    }
  }
}
```

## Security Considerations

### Enterprise Security

```typescript
const enterpriseSecurityConfig = {
  // Certificate management
  certificates: {
    signingCertificate: '/path/to/signing.p12',
    encryptionCertificate: '/path/to/encryption.p12',
    partnerCertificateStore: '/path/to/partner-certs'
  },
  
  // Message security
  messageSecurity: {
    signAllMessages: true,
    encryptAllMessages: true,
    algorithm: 'AES-256-CBC'
  },
  
  // Access control
  accessControl: {
    partnerAuthentication: true,
    ipWhitelisting: true
  },
  
  // Audit
  audit: {
    logAllTransactions: true,
    retentionPeriod: 2555 // 7 years for compliance
  }
};
```

## Compliance Requirements

### B2B Compliance

- **Non-Repudiation**: Maintain signed receipts for all B2B transactions
- **Audit Trail**: Complete audit trail for regulatory compliance
- **Data Retention**: Retain transaction data per industry requirements
- **Partner Agreements**: Enforce trading partner agreements

## Testing Considerations

### Integration Testing

```typescript
describe('EnterpriseServiceBus', () => {
  it('should route messages based on content', async () => {
    const esb = new EnterpriseServiceBusImpl();
    
    await esb.registerRoute({
      id: 'order-route',
      source: { contentType: 'application/json', headerPatterns: { 'X-Message-Type': 'order.*' } },
      destination: { endpoint: 'order-service' },
      filters: [],
      transformations: []
    });
    
    const message = createTestMessage({ headers: { 'X-Message-Type': 'order.created' } });
    const result = await esb.routeMessage(message);
    
    expect(result.routeResults).toHaveLength(1);
    expect(result.routeResults[0].routeId).toBe('order-route');
  });
});

describe('EDIProcessor', () => {
  it('should parse X12 EDI document', async () => {
    const processor = new EDIProcessorImpl();
    const ediContent = loadTestEDI('850_purchase_order.edi');
    
    const parsed = await processor.parseEDI(ediContent, EDIStandard.X12);
    
    expect(parsed.standard).toBe(EDIStandard.X12);
    expect(parsed.functionalGroups).toHaveLength(1);
    expect(parsed.functionalGroups[0].transactionSets[0].type).toBe('850');
  });
});
```

This template provides comprehensive patterns for implementing enterprise integration with ESB, B2B connectivity, EDI processing, and legacy system integration capabilities.
