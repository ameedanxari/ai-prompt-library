# Shared Contract Specification Generator

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
Generate comprehensive API contracts, data models, and interface specifications that ensure consistency and interoperability across all platforms in a cross-platform application.

## Integration Points

This template integrates with the following v2 templates for comprehensive domain coverage:

### Domain-Specific Contract Support
- **Commerce** (`commerce/*.md`): Product, cart, order, and payment contracts
- **Social** (`social/*.md`): User profile, messaging, and content feed contracts
- **Healthcare** (`healthcare/*.md`): HIPAA-compliant patient data contracts
- **Fintech** (`fintech/*.md`): Transaction and account management contracts
- **Media Streaming** (`media-streaming/*.md`): Content delivery and playlist contracts
- **Enterprise SaaS** (`enterprise-saas/*.md`): Multi-tenant and billing contracts
- **IoT** (`iot/*.md`): Device connectivity and sensor data contracts
- **Blockchain** (`blockchain/*.md`): Wallet and smart contract interfaces

### Cross-Cutting Contract Support
- **Security** (`security/*.md`): Authentication and authorization contracts
- **Analytics** (`analytics/*.md`): Event tracking and metrics contracts
- **Notifications** (`notifications/*.md`): Multi-channel notification contracts
- **Search** (`search-discovery/*.md`): Search query and result contracts
- **Real-Time** (`real-time-communication/*.md`): WebSocket and streaming contracts

## Instructions
Use this template to create comprehensive shared contract specifications that ensure consistent data exchange and behavior across all platforms in your cross-platform application.

1. **Define API Contracts**: Specify all API endpoints with complete request/response schemas
2. **Create Data Models**: Define comprehensive data models with validation rules
3. **Establish Consistency Rules**: Set cross-platform naming conventions and data type mappings
4. **Plan Platform Integration**: Provide platform-specific implementation guidance
5. **Set Up Testing Strategy**: Create contract testing and validation procedures

## Examples

### Example API Contract
```markdown
## User Authentication API

### POST /api/v1/auth/login

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid-v4",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    },
    "tokens": {
      "access_token": "jwt-token",
      "refresh_token": "refresh-jwt-token",
      "expires_in": 3600
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req-uuid"
  }
}
```

**Platform-Specific Considerations:**
- **Web:** Store tokens in httpOnly cookies for security
- **iOS:** Use Keychain for secure token storage
- **Android:** Use EncryptedSharedPreferences for token storage
- **Desktop:** Use platform-specific secure storage APIs
```

### Example Data Model
```typescript
// User Data Model
interface User {
  // Core fields (required across all platforms)
  id: string;                    // UUID v4
  created_at: string;           // ISO 8601 datetime
  updated_at: string;           // ISO 8601 datetime
  
  // Business fields
  email: string;                // Valid email format
  name: string;                 // 1-100 characters
  role: 'admin' | 'user' | 'moderator';
  
  // Optional fields
  avatar_url?: string;          // Valid URL or null
  preferences?: UserPreferences;
  
  // Platform-specific fields (optional)
  platform_data?: {
    web?: {
      last_browser: string;
      session_count: number;
    };
    ios?: {
      device_token: string;
      app_version: string;
    };
    android?: {
      fcm_token: string;
      device_id: string;
    };
  };
}

// Validation Schema
const userValidationSchema = {
  email: {
    type: 'string',
    required: true,
    format: 'email',
    maxLength: 255
  },
  name: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z\s]+$/
  },
  role: {
    type: 'string',
    required: true,
    enum: ['admin', 'user', 'moderator']
  }
};
```

### Example Cross-Platform Integration
```markdown
# Platform Integration Example

## Web Implementation (TypeScript)
```typescript
// API Client
class UserAPI {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Platform': 'web'
      },
      body: JSON.stringify(credentials)
    });
    
    if (!response.ok) {
      throw new APIError(await response.json());
    }
    
    return response.json();
  }
}

// Data Model
class User implements UserContract {
  constructor(data: UserData) {
    this.id = data.id;
    this.email = data.email;
    this.name = data.name;
    // ... other fields
  }
  
  validate(): ValidationResult {
    return validateUser(this, userValidationSchema);
  }
}
```

## iOS Implementation (Swift)
```swift
// API Client
class UserAPI {
    func login(credentials: LoginRequest) async throws -> LoginResponse {
        var request = URLRequest(url: URL(string: "/api/v1/auth/login")!)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("ios", forHTTPHeaderField: "X-Platform")
        request.httpBody = try JSONEncoder().encode(credentials)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw APIError.invalidResponse
        }
        
        return try JSONDecoder().decode(LoginResponse.self, from: data)
    }
}

// Data Model
struct User: Codable, UserContract {
    let id: String
    let email: String
    let name: String
    let role: UserRole
    let createdAt: Date
    let updatedAt: Date
    
    func validate() -> ValidationResult {
        // Validation logic
    }
}
```
```

## Context Variables
- `{{target_platforms}}` - List of target platforms (web, ios, android, desktop)
- `{{api_endpoints}}` - List of API endpoints to specify
- `{{data_models}}` - List of data models to define
- `{{project_name}}` - Name of the project for documentation
- `{{api_version}}` - API version for contract specifications
- `{{dry_run}}` - Boolean flag for validation-only mode

## Prompt Template

You are tasked with creating shared contract specifications for {{project_name}} version {{api_version}}. These contracts will ensure consistent data exchange and behavior across all platforms.

### Target Platforms
{{#each target_platforms}}
- {{this}}
{{/each}}

### API Endpoints
{{#each api_endpoints}}
- {{this}}
{{/each}}

### Data Models
{{#each data_models}}
- {{this}}
{{/each}}

## Instructions

### 1. API Contract Specification

For each API endpoint, create a comprehensive contract:

```markdown
## [Endpoint Name]

### Endpoint Details
- **Method:** [GET/POST/PUT/DELETE/PATCH]
- **Path:** `/api/v{{api_version}}/[endpoint-path]`
- **Authentication:** [Required/Optional/None]
- **Rate Limiting:** [Requests per minute/hour]

### Request Specification

**Headers**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}",
  "X-Platform": "[web|ios|android|desktop]",
  "X-App-Version": "{version}"
}
```

**Path Parameters**
- `{param_name}`: [Type] - [Description]

**Query Parameters**
- `param_name`: [Type] - [Description] - [Required/Optional]

**Request Body**
```json
{
  "field_name": "type - description"
}
```

### Response Specification

**Success Response (200/201)**
```json
{
  "status": "success",
  "data": {
    "field_name": "type - description"
  },
  "meta": {
    "timestamp": "ISO 8601 datetime",
    "request_id": "UUID"
  }
}
```

**Error Responses**
- **400 Bad Request:** Invalid request parameters
- **401 Unauthorized:** Authentication required or invalid
- **403 Forbidden:** Insufficient permissions
- **404 Not Found:** Resource not found
- **429 Too Many Requests:** Rate limit exceeded
- **500 Internal Server Error:** Server error

**Error Response Format**
```json
{
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field_errors": {
        "field_name": ["Error message"]
      }
    }
  },
  "meta": {
    "timestamp": "ISO 8601 datetime",
    "request_id": "UUID"
  }
}
```

### Platform-Specific Considerations
- **Web:** [Browser-specific considerations]
- **iOS:** [iOS-specific considerations]
- **Android:** [Android-specific considerations]
- **Desktop:** [Desktop-specific considerations]

### Validation Rules
- [List of validation rules for request data]
- [Business logic constraints]
- [Data integrity requirements]

### Caching Strategy
- **Cache Duration:** [Time period]
- **Cache Keys:** [Key generation strategy]
- **Invalidation Rules:** [When to invalidate cache]
```

### 2. Data Model Specification

For each data model, define a comprehensive schema:

```markdown
## [Model Name]

### Schema Definition

```typescript
interface [ModelName] {
  // Core fields (required across all platforms)
  id: string;                    // UUID v4
  created_at: string;           // ISO 8601 datetime
  updated_at: string;           // ISO 8601 datetime
  
  // Business fields
  field_name: FieldType;        // Description and constraints
  
  // Platform-specific fields (optional)
  platform_data?: {
    web?: WebSpecificData;
    ios?: IOSSpecificData;
    android?: AndroidSpecificData;
    desktop?: DesktopSpecificData;
  };
}
```

### Field Specifications

**Core Fields**
- `id`: Unique identifier, UUID v4 format, immutable
- `created_at`: Creation timestamp, ISO 8601 format, immutable
- `updated_at`: Last modification timestamp, ISO 8601 format, auto-updated

**Business Fields**
- `field_name`: [Type] - [Description]
  - **Validation:** [Validation rules]
  - **Constraints:** [Business constraints]
  - **Default:** [Default value if applicable]

### Relationships
- **Parent Models:** [List of parent relationships]
- **Child Models:** [List of child relationships]
- **Associated Models:** [List of associated relationships]

### Platform Adaptations
- **Web:** [Web-specific field handling]
- **iOS:** [iOS-specific field handling]
- **Android:** [Android-specific field handling]
- **Desktop:** [Desktop-specific field handling]

### Validation Rules
```typescript
const validationSchema = {
  field_name: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 255,
    pattern: /^[a-zA-Z0-9\s]+$/
  }
};
```

### Serialization/Deserialization
- **JSON Representation:** [How model appears in JSON]
- **Platform Mapping:** [How fields map to platform-specific types]
- **Transformation Rules:** [Any data transformation requirements]
```

### 3. Cross-Platform Consistency Rules

**Data Type Mapping**
- String: UTF-8 encoded text
- Number: IEEE 754 double precision
- Boolean: true/false values
- Date: ISO 8601 formatted strings
- Array: Ordered collections
- Object: Key-value maps

**Naming Conventions**
- Field names: snake_case for API, adapt to platform conventions in client code
- Endpoint paths: kebab-case with version prefix
- Error codes: UPPER_SNAKE_CASE
- Model names: PascalCase

**Versioning Strategy**
- API version in URL path: `/api/v1/`
- Backward compatibility requirements
- Deprecation timeline and migration path
- Version negotiation headers

### 4. Platform Integration Guidelines

**Web Platform**
- TypeScript interfaces for type safety
- Fetch API or Axios for HTTP requests
- Local storage for offline caching
- Service worker for background sync

**iOS Platform**
- Swift Codable protocols for serialization
- URLSession for network requests
- Core Data or Realm for local storage
- Background app refresh for sync

**Android Platform**
- Kotlin data classes with serialization
- Retrofit or OkHttp for network requests
- Room database for local storage
- WorkManager for background sync

**Desktop Platform**
- Platform-appropriate data structures
- HTTP client libraries
- Local database or file storage
- Background service for sync

### 5. Testing and Validation

**Contract Testing**
- API contract validation tests
- Schema validation tests
- Cross-platform compatibility tests
- Performance and load tests

**Mock Data Generation**
- Sample data for each model
- Edge case test data
- Invalid data for error testing
- Performance test datasets

**Validation Tools**
- JSON Schema validation
- API documentation generation
- Contract testing frameworks
- Platform-specific validation

{{#if dry_run}}
### Dry Run Mode

Generate sample contract specifications to validate:
- Contract completeness and clarity
- Cross-platform consistency approach
- Documentation format and structure
- Integration and testing strategy

Focus on structure and methodology rather than specific implementation details.
{{/if}}

## Expected Outputs

1. **API Contract Documentation** (`API_CONTRACTS.md`)
   - Complete endpoint specifications
   - Request/response schemas
   - Error handling documentation
   - Authentication and authorization details

2. **Data Model Specifications** (`DATA_MODELS.md`)
   - Comprehensive model definitions
   - Validation rules and constraints
   - Relationship mappings
   - Platform-specific adaptations

3. **Integration Guide** (`INTEGRATION_GUIDE.md`)
   - Platform-specific implementation guidance
   - Code examples and best practices
   - Testing and validation procedures
   - Troubleshooting and debugging tips

4. **Contract Testing Suite** (`CONTRACT_TESTS.md`)
   - Test specifications for all contracts
   - Mock data and test scenarios
   - Validation procedures
   - Continuous integration setup

## Centralized Mock Data Integration

This section establishes the connection between API contracts and centralized mock data, ensuring consistent test data across all platforms.

### Contract-to-Mock Data Mapping

Every API contract should have corresponding mock data files in the centralized mock data directory. This ensures:
- All platforms reference the same mock responses
- Mock data accurately reflects contract specifications
- Test scenarios cover all documented response types

**Directory Structure Alignment:**
```
API Contract Path          →  Mock Data Path
/api/v1/auth/login        →  mocks/api/v1/auth/login/POST/
/api/v1/users             →  mocks/api/v1/users/GET/
/api/v1/users/{id}        →  mocks/api/v1/users/{id}/GET/
```

**Required Mock Files per Contract:**
For each API endpoint defined in the contract, create mock files for:
- Success responses (200, 201, 204)
- Client error responses (400, 401, 403, 404, 409, 429)
- Server error responses (500, 502, 503)

### Mock Data Generation from Contracts

Use API contracts as the source of truth for generating mock data:

**Step 1: Extract Response Schemas**
```markdown
From Contract:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid-v4",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    }
  }
}
```

**Step 2: Generate Mock Data File**
Create `mocks/api/v1/auth/login/POST/200-success.json`:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "user-001",
      "email": "john.doe@example.com",
      "name": "John Doe",
      "role": "user"
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-refresh",
      "expires_in": 3600
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req-mock-001"
  }
}
```

**Step 3: Generate Error Response Mocks**
Create corresponding error mocks that match contract error specifications:
- `400-validation-error.json` - Invalid request body
- `401-unauthorized.json` - Missing or invalid credentials
- `429-rate-limited.json` - Too many requests

### Mock Data Organization Example

```markdown
# Contract: User Authentication API

## Endpoint: POST /api/v1/auth/login

### Contract Definition
- Request: email, password
- Success Response: user object, tokens
- Error Responses: 400, 401, 429, 500

### Corresponding Mock Data Structure
```
mocks/
└── api/
    └── v1/
        └── auth/
            └── login/
                └── POST/
                    ├── 200-success.json
                    ├── 200-success-mfa-required.json
                    ├── 400-invalid-credentials.json
                    ├── 401-account-locked.json
                    ├── 429-rate-limited.json
                    └── 500-server-error.json
```

### Mock Data Index Entry
```json
{
  "path": "/api/v1/auth/login",
  "methods": ["POST"],
  "mockFiles": {
    "POST": {
      "200": "api/v1/auth/login/POST/200-success.json",
      "400": "api/v1/auth/login/POST/400-invalid-credentials.json",
      "401": "api/v1/auth/login/POST/401-account-locked.json",
      "429": "api/v1/auth/login/POST/429-rate-limited.json",
      "500": "api/v1/auth/login/POST/500-server-error.json"
    }
  },
  "schema": "schemas/auth-response.schema.json"
}
```
```

### Platform Mock Data References

All platforms must reference the centralized mock data:

**Web Platform:**
```typescript
// Import mock data for testing
import loginSuccess from '@mocks/api/v1/auth/login/POST/200-success.json';
import loginError from '@mocks/api/v1/auth/login/POST/400-invalid-credentials.json';

// Use in tests
describe('Login API', () => {
  it('should handle successful login', () => {
    mockServer.use(
      rest.post('/api/v1/auth/login', (req, res, ctx) => {
        return res(ctx.json(loginSuccess));
      })
    );
    // Test implementation
  });
});
```

**iOS Platform:**
```swift
// Reference centralized mock data
let mockDataPath = Bundle.main.path(
  forResource: "200-success",
  ofType: "json",
  inDirectory: "mocks/api/v1/auth/login/POST"
)
```

**Android Platform:**
```kotlin
// Reference centralized mock data
val mockData = context.assets.open(
  "mocks/api/v1/auth/login/POST/200-success.json"
).bufferedReader().use { it.readText() }
```

### Contract Validation Against Mocks

Ensure mock data remains synchronized with contracts:

```javascript
// Validation script example
const Ajv = require('ajv');
const ajv = new Ajv();

function validateMockAgainstContract(mockFile, schemaFile) {
  const mock = require(mockFile);
  const schema = require(schemaFile);
  
  const validate = ajv.compile(schema);
  const valid = validate(mock);
  
  if (!valid) {
    console.error(`Mock ${mockFile} does not match contract schema`);
    console.error(validate.errors);
    return false;
  }
  return true;
}

// Run validation for all mock files
validateAllMocks();
```

### Integration with Centralized Mock Data Module

This contract specification integrates with the centralized mock data module:
- Reference: [centralized-mock-data.md](../testing/centralized-mock-data.md)
- Mock data organization follows the patterns defined in the centralized module
- All platforms use the same mock data source to ensure consistency

## Maintenance and Evolution

**Version Management**
- Semantic versioning for API contracts
- Backward compatibility requirements
- Deprecation and migration procedures
- Change log maintenance
- Mock data versioning aligned with contract versions

**Review Process**
- Regular contract review meetings
- Cross-platform team validation
- Performance impact assessment
- Security and compliance review
- Mock data coverage review

**Update Procedures**
- Contract change proposal process
- Impact assessment and approval
- Implementation coordination
- Rollout and monitoring
- Mock data synchronization with contract changes

## Integration Points

- Link to platform-specific implementation guides
- Connect to API documentation systems
- Integrate with testing and CI/CD pipelines
- Reference security and compliance requirements
- Connect to [centralized mock data module](../testing/centralized-mock-data.md)
- Integrate with [fake backend generator](../testing/fake-backend-generator.md)

## Success Criteria

- All platforms use identical API contracts
- Data models are consistent across platforms
- Integration is seamless and reliable
- Testing validates contract compliance
- Documentation is comprehensive and current
- Maintenance process is established and followed
- Mock data accurately reflects all contract specifications
- All platforms reference centralized mock data (no platform-specific duplicates)

## Domain-Specific Contract Templates

### Commerce Domain Contracts

```typescript
// Product Contract
interface ProductContract {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: MoneyContract;
  currency: string;
  inventory: InventoryContract;
  variants: ProductVariant[];
  images: MediaContract[];
  categories: string[];
  attributes: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface CartContract {
  id: string;
  user_id: string;
  items: CartItemContract[];
  subtotal: MoneyContract;
  tax: MoneyContract;
  total: MoneyContract;
  currency: string;
  expires_at: string;
  platform_data?: PlatformSpecificData;
}

interface OrderContract {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  items: OrderItemContract[];
  shipping_address: AddressContract;
  billing_address: AddressContract;
  payment: PaymentContract;
  totals: OrderTotalsContract;
  created_at: string;
  updated_at: string;
}
```

### Healthcare Domain Contracts (HIPAA Compliant)

```typescript
// Patient Contract with PHI handling
interface PatientContract {
  id: string;
  mrn: string; // Medical Record Number
  demographics: PatientDemographics;
  contact: ContactContract;
  emergency_contact: EmergencyContactContract;
  insurance: InsuranceContract[];
  consent: ConsentContract;
  created_at: string;
  updated_at: string;
  
  // Platform-specific PHI handling
  platform_data?: {
    web?: { encryption_key_id: string };
    ios?: { keychain_identifier: string };
    android?: { encrypted_prefs_key: string };
  };
}

interface AppointmentContract {
  id: string;
  patient_id: string;
  provider_id: string;
  type: AppointmentType;
  status: AppointmentStatus;
  scheduled_at: string;
  duration_minutes: number;
  location: LocationContract | VirtualLocationContract;
  notes: EncryptedNoteContract;
  reminders: ReminderContract[];
}

// HIPAA Audit Trail Contract
interface AuditTrailContract {
  id: string;
  event_type: AuditEventType;
  user_id: string;
  patient_id: string;
  resource_type: string;
  resource_id: string;
  action: string;
  timestamp: string;
  ip_address: string;
  user_agent: string;
  details: Record<string, any>;
}
```

### Fintech Domain Contracts

```typescript
// Account Contract with compliance fields
interface AccountContract {
  id: string;
  account_number: string;
  user_id: string;
  type: AccountType;
  status: AccountStatus;
  balance: MoneyContract;
  available_balance: MoneyContract;
  currency: string;
  kyc_status: KYCStatus;
  aml_status: AMLStatus;
  created_at: string;
  updated_at: string;
}

interface TransactionContract {
  id: string;
  reference_id: string;
  account_id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: MoneyContract;
  fee: MoneyContract;
  currency: string;
  counterparty: CounterpartyContract;
  metadata: TransactionMetadata;
  created_at: string;
  settled_at: string | null;
  
  // Compliance fields
  risk_score: number;
  fraud_check_status: FraudCheckStatus;
  compliance_flags: string[];
}
```

### Social Domain Contracts

```typescript
// User Profile Contract
interface UserProfileContract {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar: MediaContract;
  cover_image: MediaContract | null;
  verified: boolean;
  privacy_settings: PrivacySettingsContract;
  social_stats: SocialStatsContract;
  created_at: string;
  updated_at: string;
}

interface MessageContract {
  id: string;
  conversation_id: string;
  sender_id: string;
  type: MessageType;
  content: MessageContentContract;
  attachments: AttachmentContract[];
  reactions: ReactionContract[];
  read_by: ReadReceiptContract[];
  created_at: string;
  edited_at: string | null;
  deleted_at: string | null;
  
  // End-to-end encryption support
  encryption?: {
    algorithm: string;
    key_id: string;
    iv: string;
  };
}

interface ContentFeedContract {
  id: string;
  author_id: string;
  type: ContentType;
  content: ContentBodyContract;
  media: MediaContract[];
  engagement: EngagementStatsContract;
  visibility: VisibilityLevel;
  tags: string[];
  mentions: MentionContract[];
  created_at: string;
  updated_at: string;
}
```

### IoT Domain Contracts

```typescript
// Device Contract
interface DeviceContract {
  id: string;
  device_id: string;
  name: string;
  type: DeviceType;
  manufacturer: string;
  model: string;
  firmware_version: string;
  status: DeviceStatus;
  connectivity: ConnectivityContract;
  capabilities: DeviceCapability[];
  last_seen_at: string;
  registered_at: string;
}

interface SensorDataContract {
  device_id: string;
  sensor_type: SensorType;
  value: number;
  unit: string;
  timestamp: string;
  quality: DataQuality;
  metadata: SensorMetadata;
}

interface DeviceCommandContract {
  id: string;
  device_id: string;
  command_type: CommandType;
  parameters: Record<string, any>;
  status: CommandStatus;
  issued_at: string;
  executed_at: string | null;
  result: CommandResult | null;
}
```

### Blockchain Domain Contracts

```typescript
// Wallet Contract
interface WalletContract {
  id: string;
  address: string;
  chain: BlockchainNetwork;
  type: WalletType;
  name: string;
  balance: TokenBalanceContract[];
  nfts: NFTContract[];
  created_at: string;
}

interface TransactionContract {
  hash: string;
  chain: BlockchainNetwork;
  from: string;
  to: string;
  value: string;
  gas_price: string;
  gas_used: string;
  status: TransactionStatus;
  block_number: number;
  timestamp: string;
  contract_interaction?: ContractInteractionContract;
}

interface SmartContractContract {
  address: string;
  chain: BlockchainNetwork;
  name: string;
  abi: ContractABI;
  verified: boolean;
  deployment_tx: string;
  created_at: string;
}
```

## Platform-Specific Adaptations for New Domains

### Healthcare Platform Adaptations

```typescript
// Platform-specific PHI handling
interface HealthcarePlatformAdaptations {
  web: {
    // Use Web Crypto API for encryption
    encryptPHI: (data: any) => Promise<EncryptedData>;
    decryptPHI: (encrypted: EncryptedData) => Promise<any>;
    // Session timeout for HIPAA compliance
    sessionTimeout: 900; // 15 minutes
  };
  
  ios: {
    // Use Keychain for PHI storage
    storePHI: (key: string, data: any) => Promise<void>;
    retrievePHI: (key: string) => Promise<any>;
    // Face ID/Touch ID for PHI access
    biometricAuth: () => Promise<boolean>;
  };
  
  android: {
    // Use EncryptedSharedPreferences
    storePHI: (key: string, data: any) => Promise<void>;
    retrievePHI: (key: string) => Promise<any>;
    // Biometric authentication
    biometricAuth: () => Promise<boolean>;
  };
}
```

### Fintech Platform Adaptations

```typescript
// Platform-specific security for financial data
interface FintechPlatformAdaptations {
  web: {
    // Secure session management
    sessionConfig: {
      httpOnly: true;
      secure: true;
      sameSite: 'strict';
      maxAge: 1800; // 30 minutes
    };
    // Certificate pinning for API calls
    certificatePinning: boolean;
  };
  
  ios: {
    // Jailbreak detection
    jailbreakDetection: boolean;
    // Secure enclave for key storage
    useSecureEnclave: boolean;
    // App Transport Security
    atsEnabled: boolean;
  };
  
  android: {
    // Root detection
    rootDetection: boolean;
    // Hardware-backed keystore
    useHardwareKeystore: boolean;
    // Network security config
    networkSecurityConfig: boolean;
  };
}
```

### Real-Time Communication Platform Adaptations

```typescript
// Platform-specific WebSocket handling
interface RealTimePlatformAdaptations {
  web: {
    // WebSocket with fallback to long-polling
    transport: 'websocket' | 'long-polling';
    // Service Worker for background sync
    backgroundSync: boolean;
  };
  
  ios: {
    // URLSessionWebSocketTask
    useNativeWebSocket: boolean;
    // Background app refresh
    backgroundRefresh: boolean;
    // Push notification for offline messages
    pushNotifications: boolean;
  };
  
  android: {
    // OkHttp WebSocket
    useOkHttpWebSocket: boolean;
    // Firebase Cloud Messaging
    fcmEnabled: boolean;
    // WorkManager for background sync
    workManagerSync: boolean;
  };
}
```

## Template Composition Rules

### Compatible Domain Combinations
- Commerce + Analytics: Track purchase funnels
- Healthcare + Security: HIPAA-compliant authentication
- Fintech + Blockchain: Crypto payment integration
- Social + Real-Time: Live messaging and feeds
- IoT + Analytics: Device telemetry dashboards

### Contract Inheritance Patterns
```typescript
// Base contract that all domain contracts extend
interface BaseContract {
  id: string;
  created_at: string;
  updated_at: string;
  version: number;
}

// Domain contracts extend base
interface DomainContract extends BaseContract {
  tenant_id?: string; // For multi-tenant support
  platform_data?: PlatformSpecificData;
}
```

### Conflict Resolution for Multi-Domain Apps
- When combining Healthcare + Commerce: Healthcare compliance takes precedence
- When combining Fintech + Social: Financial data isolation is enforced
- When combining IoT + Healthcare: Medical device regulations apply
