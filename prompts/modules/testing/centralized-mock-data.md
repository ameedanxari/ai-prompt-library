# Centralized Mock Data Module

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
Organize all mock data in a centralized directory structure organized by API endpoint and HTTP status codes. This module ensures a single source of truth for mock data across all platforms (web, iOS, Android, desktop), eliminating duplicate or conflicting mocks and maintaining consistent data contracts.

## Instructions

### When to Use This Module
- When setting up a new project that requires mock data for testing
- When consolidating existing platform-specific mocks into a centralized location
- When adding new API endpoints that require mock responses
- When updating mock data to reflect API contract changes
- Before implementing fake backend servers that serve mock data

### Implementation Steps
1. **Define Directory Structure**: Create the standardized mocks/ directory hierarchy
2. **Organize by Endpoint**: Structure mock files by API endpoint path and HTTP method
3. **Categorize by Status Code**: Separate responses by HTTP status codes (2xx, 4xx, 5xx)
4. **Apply Naming Conventions**: Use consistent, descriptive file naming
5. **Add Versioning**: Include version tracking for mock data changes
6. **Generate Index**: Create index file for mock data discovery
7. **Document Mappings**: Map mock files to API contract specifications

### Key Organization Principles
- **Single Source of Truth**: All platforms reference the same centralized mock files
- **Status Code Organization**: Separate happy path (2xx) from error responses (4xx, 5xx)
- **Endpoint Hierarchy**: Mirror API endpoint structure in directory organization
- **Version Control**: Track mock data changes with versioning
- **Contract Alignment**: Ensure mock data matches API contract specifications

### Quality Assurance Guidelines
- Verify mock data matches API contract schemas
- Ensure all required status codes are covered for each endpoint
- Check that naming conventions are consistently applied
- Validate JSON syntax and structure in all mock files
- Test that mock data is accessible from all platforms

## Examples

### 1. Basic REST API Mock Structure
```markdown
# Standard Mock Data Directory Structure
mocks/
├── api/
│   └── v1/
│       ├── users/
│       │   ├── GET/
│       │   │   ├── 200-success.json
│       │   │   ├── 200-success-empty.json
│       │   │   ├── 401-unauthorized.json
│       │   │   ├── 403-forbidden.json
│       │   │   └── 500-server-error.json
│       │   ├── POST/
│       │   │   ├── 201-created.json
│       │   │   ├── 400-validation-error.json
│       │   │   ├── 409-conflict.json
│       │   │   └── 500-server-error.json
│       │   └── {id}/
│       │       ├── GET/
│       │       │   ├── 200-success.json
│       │       │   ├── 404-not-found.json
│       │       │   └── 500-server-error.json
│       │       ├── PUT/
│       │       │   ├── 200-updated.json
│       │       │   ├── 400-validation-error.json
│       │       │   ├── 404-not-found.json
│       │       │   └── 409-conflict.json
│       │       └── DELETE/
│       │           ├── 204-deleted.json
│       │           ├── 404-not-found.json
│       │           └── 409-conflict.json
│       ├── auth/
│       │   ├── login/
│       │   │   └── POST/
│       │   │       ├── 200-success.json
│       │   │       ├── 400-invalid-credentials.json
│       │   │       ├── 401-unauthorized.json
│       │   │       └── 429-rate-limited.json
│       │   └── logout/
│       │       └── POST/
│       │           ├── 200-success.json
│       │           └── 401-unauthorized.json
│       └── products/
│           ├── GET/
│           │   ├── 200-success.json
│           │   ├── 200-success-paginated.json
│           │   └── 500-server-error.json
│           └── {id}/
│               └── GET/
│                   ├── 200-success.json
│                   └── 404-not-found.json
├── schemas/
│   ├── user.schema.json
│   ├── auth-response.schema.json
│   └── product.schema.json
├── index.json
└── README.md

# Example Mock File: mocks/api/v1/users/GET/200-success.json
{
  "data": [
    {
      "id": "user-001",
      "email": "john.doe@example.com",
      "name": "John Doe",
      "role": "admin",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-20T14:45:00Z"
    },
    {
      "id": "user-002",
      "email": "jane.smith@example.com",
      "name": "Jane Smith",
      "role": "user",
      "createdAt": "2024-01-16T09:00:00Z",
      "updatedAt": "2024-01-18T11:30:00Z"
    }
  ],
  "meta": {
    "total": 2,
    "page": 1,
    "perPage": 20,
    "totalPages": 1
  }
}

# Example Mock File: mocks/api/v1/users/POST/400-validation-error.json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters"
      }
    ]
  }
}
```

### 2. Authentication Flow Mocks
```markdown
# Authentication Mock Data Structure
mocks/
└── api/
    └── v1/
        └── auth/
            ├── login/
            │   └── POST/
            │       ├── 200-success.json
            │       ├── 200-success-mfa-required.json
            │       ├── 400-invalid-credentials.json
            │       ├── 401-account-locked.json
            │       ├── 429-rate-limited.json
            │       └── 500-server-error.json
            ├── register/
            │   └── POST/
            │       ├── 201-created.json
            │       ├── 400-validation-error.json
            │       ├── 409-email-exists.json
            │       └── 500-server-error.json
            ├── refresh/
            │   └── POST/
            │       ├── 200-success.json
            │       ├── 401-invalid-token.json
            │       └── 401-expired-token.json
            ├── forgot-password/
            │   └── POST/
            │       ├── 200-success.json
            │       ├── 400-invalid-email.json
            │       └── 404-user-not-found.json
            └── reset-password/
                └── POST/
                    ├── 200-success.json
                    ├── 400-invalid-token.json
                    ├── 400-password-requirements.json
                    └── 410-token-expired.json

# Example: mocks/api/v1/auth/login/POST/200-success.json
{
  "data": {
    "user": {
      "id": "user-001",
      "email": "john.doe@example.com",
      "name": "John Doe",
      "role": "admin"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 3600
    }
  }
}

# Example: mocks/api/v1/auth/login/POST/200-success-mfa-required.json
{
  "data": {
    "mfaRequired": true,
    "mfaToken": "mfa-temp-token-12345",
    "mfaMethods": ["totp", "sms"],
    "expiresIn": 300
  }
}

# Example: mocks/api/v1/auth/login/POST/429-rate-limited.json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many login attempts. Please try again later.",
    "retryAfter": 300
  }
}
```

### 3. E-Commerce API Mocks
```markdown
# E-Commerce Mock Data Structure
mocks/
└── api/
    └── v1/
        ├── products/
        │   ├── GET/
        │   │   ├── 200-success.json
        │   │   ├── 200-success-filtered.json
        │   │   ├── 200-success-empty.json
        │   │   └── 500-server-error.json
        │   ├── POST/
        │   │   ├── 201-created.json
        │   │   ├── 400-validation-error.json
        │   │   └── 403-forbidden.json
        │   └── {id}/
        │       ├── GET/
        │       │   ├── 200-success.json
        │       │   ├── 404-not-found.json
        │       │   └── 410-discontinued.json
        │       └── PUT/
        │           ├── 200-updated.json
        │           ├── 400-validation-error.json
        │           └── 404-not-found.json
        ├── cart/
        │   ├── GET/
        │   │   ├── 200-success.json
        │   │   ├── 200-success-empty.json
        │   │   └── 401-unauthorized.json
        │   ├── POST/
        │   │   ├── 200-item-added.json
        │   │   ├── 400-invalid-quantity.json
        │   │   ├── 404-product-not-found.json
        │   │   └── 409-out-of-stock.json
        │   └── {itemId}/
        │       └── DELETE/
        │           ├── 200-removed.json
        │           └── 404-not-found.json
        ├── orders/
        │   ├── GET/
        │   │   ├── 200-success.json
        │   │   ├── 200-success-empty.json
        │   │   └── 401-unauthorized.json
        │   ├── POST/
        │   │   ├── 201-created.json
        │   │   ├── 400-validation-error.json
        │   │   ├── 402-payment-failed.json
        │   │   └── 409-cart-empty.json
        │   └── {id}/
        │       └── GET/
        │           ├── 200-success.json
        │           ├── 404-not-found.json
        │           └── 403-forbidden.json
        └── checkout/
            └── POST/
                ├── 200-success.json
                ├── 400-invalid-address.json
                ├── 402-payment-declined.json
                └── 409-inventory-changed.json

# Example: mocks/api/v1/products/GET/200-success.json
{
  "data": [
    {
      "id": "prod-001",
      "name": "Wireless Headphones",
      "description": "Premium noise-canceling wireless headphones",
      "price": 299.99,
      "currency": "USD",
      "category": "electronics",
      "inventory": {
        "available": 150,
        "reserved": 12
      },
      "images": [
        "https://cdn.example.com/products/headphones-1.jpg",
        "https://cdn.example.com/products/headphones-2.jpg"
      ],
      "rating": {
        "average": 4.5,
        "count": 234
      }
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "perPage": 20,
    "totalPages": 1
  }
}

# Example: mocks/api/v1/checkout/POST/402-payment-declined.json
{
  "error": {
    "code": "PAYMENT_DECLINED",
    "message": "Your payment was declined by the card issuer",
    "details": {
      "declineCode": "insufficient_funds",
      "lastFourDigits": "4242"
    }
  }
}
```

### 4. Mock Data Index File
```markdown
# Mock Data Index: mocks/index.json
{
  "version": "1.0.0",
  "lastUpdated": "2024-01-20T10:00:00Z",
  "apiVersion": "v1",
  "endpoints": [
    {
      "path": "/api/v1/users",
      "methods": ["GET", "POST"],
      "mockFiles": {
        "GET": {
          "200": "api/v1/users/GET/200-success.json",
          "401": "api/v1/users/GET/401-unauthorized.json",
          "500": "api/v1/users/GET/500-server-error.json"
        },
        "POST": {
          "201": "api/v1/users/POST/201-created.json",
          "400": "api/v1/users/POST/400-validation-error.json",
          "409": "api/v1/users/POST/409-conflict.json"
        }
      },
      "schema": "schemas/user.schema.json"
    },
    {
      "path": "/api/v1/users/{id}",
      "methods": ["GET", "PUT", "DELETE"],
      "mockFiles": {
        "GET": {
          "200": "api/v1/users/{id}/GET/200-success.json",
          "404": "api/v1/users/{id}/GET/404-not-found.json"
        },
        "PUT": {
          "200": "api/v1/users/{id}/PUT/200-updated.json",
          "400": "api/v1/users/{id}/PUT/400-validation-error.json",
          "404": "api/v1/users/{id}/PUT/404-not-found.json"
        },
        "DELETE": {
          "204": "api/v1/users/{id}/DELETE/204-deleted.json",
          "404": "api/v1/users/{id}/DELETE/404-not-found.json"
        }
      },
      "schema": "schemas/user.schema.json"
    },
    {
      "path": "/api/v1/auth/login",
      "methods": ["POST"],
      "mockFiles": {
        "POST": {
          "200": "api/v1/auth/login/POST/200-success.json",
          "400": "api/v1/auth/login/POST/400-invalid-credentials.json",
          "429": "api/v1/auth/login/POST/429-rate-limited.json"
        }
      },
      "schema": "schemas/auth-response.schema.json"
    }
  ],
  "schemas": [
    {
      "name": "User",
      "file": "schemas/user.schema.json"
    },
    {
      "name": "AuthResponse",
      "file": "schemas/auth-response.schema.json"
    },
    {
      "name": "Product",
      "file": "schemas/product.schema.json"
    }
  ]
}
```

### 5. Naming Conventions Reference
```markdown
# Mock Data Naming Conventions

## Directory Structure Pattern
mocks/
└── api/
    └── {version}/
        └── {endpoint}/
            └── {method}/
                └── {status-code}-{description}.json

## File Naming Rules

### Status Code Prefixes
- `200-` Success responses
- `201-` Created responses
- `204-` No content responses
- `400-` Client validation errors
- `401-` Authentication errors
- `403-` Authorization errors
- `404-` Not found errors
- `409-` Conflict errors
- `410-` Gone/expired errors
- `429-` Rate limiting errors
- `500-` Server errors
- `502-` Bad gateway errors
- `503-` Service unavailable errors

### Description Suffixes
- `-success` Standard success response
- `-success-empty` Empty result set
- `-success-paginated` Paginated results
- `-created` Resource created
- `-updated` Resource updated
- `-deleted` Resource deleted
- `-validation-error` Input validation failed
- `-unauthorized` Authentication required
- `-forbidden` Permission denied
- `-not-found` Resource not found
- `-conflict` Resource conflict
- `-rate-limited` Rate limit exceeded
- `-server-error` Internal server error

### Examples
- `200-success.json` - Standard success
- `200-success-empty.json` - Empty list
- `201-created.json` - Resource created
- `400-validation-error.json` - Validation failed
- `401-unauthorized.json` - Not authenticated
- `404-not-found.json` - Resource missing
- `409-conflict.json` - Duplicate resource
- `429-rate-limited.json` - Too many requests
- `500-server-error.json` - Server error

## Versioning
- Include version in index.json
- Use semantic versioning (1.0.0, 1.1.0, 2.0.0)
- Document breaking changes in CHANGELOG.md
- Maintain backward compatibility when possible
```

## Implementation Patterns

### Mock Data Organization Prompt
```
You are a mock data organization specialist. Your task is to create a centralized mock data structure that serves as the single source of truth for all platforms.

**Organization Process:**

1. **Create standardized directory structure** in mocks/:
   ```
   mocks/
   ├── api/
   │   └── {version}/
   │       └── {endpoint}/
   │           └── {method}/
   │               └── {status-code}-{description}.json
   ├── schemas/
   │   └── {entity}.schema.json
   ├── index.json
   └── README.md
   ```

2. **Organize by API endpoint** following REST conventions:
   - Mirror API path structure in directories
   - Use path parameters as directory names: `{id}`, `{userId}`
   - Group by HTTP method: GET/, POST/, PUT/, DELETE/, PATCH/

3. **Categorize by HTTP status code**:
   - 2xx: Success responses (200, 201, 204)
   - 4xx: Client errors (400, 401, 403, 404, 409, 429)
   - 5xx: Server errors (500, 502, 503)

4. **Apply naming conventions**:
   - Pattern: `{status-code}-{description}.json`
   - Use kebab-case for descriptions
   - Be descriptive: `400-validation-error.json` not `400.json`

5. **Generate index file** for mock discovery:
   - List all endpoints and their mock files
   - Include schema references
   - Add version and timestamp metadata

**Output Format:**
Generate a mock data organization plan:

```markdown
# Mock Data Organization Plan

## Directory Structure
```
mocks/
├── api/
│   └── v1/
│       ├── [endpoint-1]/
│       │   └── [method]/
│       │       └── [status-code]-[description].json
│       └── [endpoint-2]/
│           └── [method]/
│               └── [status-code]-[description].json
├── schemas/
│   └── [entity].schema.json
├── index.json
└── README.md
```

## Endpoints Covered
| Endpoint | Methods | Status Codes |
|----------|---------|--------------|
| /api/v1/users | GET, POST | 200, 201, 400, 401, 500 |
| /api/v1/users/{id} | GET, PUT, DELETE | 200, 204, 400, 404, 500 |

## Mock Files Created
- `api/v1/users/GET/200-success.json`
- `api/v1/users/GET/401-unauthorized.json`
- [continue for all mock files]

## Schemas Created
- `schemas/user.schema.json`
- `schemas/error.schema.json`
- [continue for all schemas]

## Index File
- Version: 1.0.0
- Endpoints: [count]
- Total mock files: [count]
```
```

### Mock Data Index Generation Prompt
```
You are a mock data index generator. Create a comprehensive index.json file that catalogs all mock data files for easy discovery and integration.

**Index Structure:**
```json
{
  "version": "1.0.0",
  "lastUpdated": "ISO-8601-timestamp",
  "apiVersion": "v1",
  "endpoints": [
    {
      "path": "/api/v1/endpoint",
      "methods": ["GET", "POST"],
      "mockFiles": {
        "GET": {
          "200": "relative/path/to/mock.json",
          "404": "relative/path/to/mock.json"
        }
      },
      "schema": "schemas/entity.schema.json"
    }
  ],
  "schemas": [
    {
      "name": "EntityName",
      "file": "schemas/entity.schema.json"
    }
  ]
}
```

**Index Requirements:**
1. List all endpoints with their available methods
2. Map each method to its available status code responses
3. Reference associated schema files
4. Include metadata (version, timestamp, API version)
5. Use relative paths from mocks/ directory

**Output:**
Generate the complete index.json content with all discovered mock files.
```

## Instructions

### How to Use This Module

1. **Analyze API Specification**: Review the API contract to identify all endpoints
2. **Plan Mock Coverage**: Determine which status codes need mock data for each endpoint
3. **Create Directory Structure**: Set up the mocks/ directory hierarchy
4. **Generate Mock Files**: Create JSON files for each endpoint/method/status combination
5. **Create Schemas**: Define JSON schemas for response validation
6. **Generate Index**: Create index.json for mock discovery
7. **Validate Structure**: Ensure all mock files are properly organized and accessible

### Mock Data Workflow

1. **Discovery Phase**: Identify all API endpoints from specification
2. **Planning Phase**: Determine mock coverage requirements
3. **Creation Phase**: Generate mock data files with realistic data
4. **Organization Phase**: Organize files into standardized structure
5. **Indexing Phase**: Generate index.json for discovery
6. **Validation Phase**: Verify mock data against schemas

### Best Practices

- **Realistic Data**: Use realistic, representative data in mocks
- **Complete Coverage**: Cover all documented status codes for each endpoint
- **Consistent Structure**: Follow the same response structure as the real API
- **Schema Compliance**: Ensure mock data validates against API schemas
- **Version Control**: Track mock data changes with versioning
- **Documentation**: Document any special scenarios or edge cases

## Usage Instructions

**Basic Mock Organization:**
```markdown
#[[module:testing/centralized-mock-data.md]]
```

**With API Version:**
```markdown
#[[module:testing/centralized-mock-data.md|api_version=v1]]
```

**Parameters:**
- `api_version`: API version for directory structure (default: v1)
- `include_schemas`: Generate JSON schemas (default: true)
- `generate_index`: Create index.json file (default: true)

## Integration Points
- Feeds into [mock-consolidation.md](./mock-consolidation.md) for platform migration
- Supports [mock-validation.md](./mock-validation.md) for contract compliance
- Used by [fake-backend-generator.md](./fake-backend-generator.md) for server routing
- Referenced by platform test configurations
