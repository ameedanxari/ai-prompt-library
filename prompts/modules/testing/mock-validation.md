# Mock Validation Module

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
Validate mock data against API contracts and generate documentation mapping mock files to their corresponding API specifications. This module ensures mock data maintains contract compliance, generates validation schemas, and creates comprehensive documentation of mock-to-API relationships.

## Instructions

### When to Use This Module
- After creating or updating centralized mock data
- When validating mock data against OpenAPI/Swagger specifications
- When generating JSON schemas for mock data validation
- When creating documentation for mock-to-API mappings
- Before deploying fake backend to ensure data consistency
- During API contract changes to identify affected mocks

### Implementation Steps
1. **Load API Specification**: Parse OpenAPI/Swagger or other API contract files
2. **Generate Validation Schemas**: Create JSON schemas from API response definitions
3. **Validate Mock Data**: Check all mock files against generated schemas
4. **Identify Violations**: Report any mock data that doesn't match contracts
5. **Generate Documentation**: Create mapping documentation for mock-to-API relationships
6. **Create Compliance Report**: Summarize validation results and recommendations

### Key Validation Principles
- **Contract Compliance**: All mock data must match API contract specifications
- **Schema Validation**: Use JSON Schema for structural validation
- **Type Checking**: Ensure data types match API definitions
- **Required Fields**: Verify all required fields are present
- **Format Validation**: Check date formats, email formats, etc.

### Quality Assurance Guidelines
- Validate all mock files against their corresponding schemas
- Check for missing required fields in mock responses
- Verify data types match API specifications
- Ensure enum values are valid according to contracts
- Test edge cases and boundary conditions

## Examples

### 1. JSON Schema Generation from OpenAPI
```markdown
# Schema Generation Report

## Source API Specification
- File: `api/openapi.yaml`
- Version: 3.0.0
- API Version: v1

## Generated Schemas

### User Response Schema
**Source**: `#/components/schemas/User`
**Output**: `mocks/schemas/user.schema.json`

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "user.schema.json",
  "title": "User",
  "description": "User entity response schema",
  "type": "object",
  "required": ["id", "email", "name", "role", "createdAt"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^user-[a-z0-9]+$",
      "description": "Unique user identifier"
    },
    "email": {
      "type": "string",
      "format": "email",
      "description": "User email address"
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100,
      "description": "User display name"
    },
    "role": {
      "type": "string",
      "enum": ["admin", "user", "guest"],
      "description": "User role"
    },
    "createdAt": {
      "type": "string",
      "format": "date-time",
      "description": "Account creation timestamp"
    },
    "updatedAt": {
      "type": "string",
      "format": "date-time",
      "description": "Last update timestamp"
    },
    "avatar": {
      "type": "string",
      "format": "uri",
      "description": "Avatar image URL"
    }
  },
  "additionalProperties": false
}
```

### User List Response Schema
**Source**: `#/components/schemas/UserListResponse`
**Output**: `mocks/schemas/user-list-response.schema.json`

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "user-list-response.schema.json",
  "title": "UserListResponse",
  "description": "Paginated list of users",
  "type": "object",
  "required": ["data", "meta"],
  "properties": {
    "data": {
      "type": "array",
      "items": {
        "$ref": "user.schema.json"
      }
    },
    "meta": {
      "type": "object",
      "required": ["total", "page", "perPage", "totalPages"],
      "properties": {
        "total": {
          "type": "integer",
          "minimum": 0
        },
        "page": {
          "type": "integer",
          "minimum": 1
        },
        "perPage": {
          "type": "integer",
          "minimum": 1,
          "maximum": 100
        },
        "totalPages": {
          "type": "integer",
          "minimum": 0
        }
      }
    }
  }
}
```

### Error Response Schema
**Source**: `#/components/schemas/ErrorResponse`
**Output**: `mocks/schemas/error-response.schema.json`

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "error-response.schema.json",
  "title": "ErrorResponse",
  "description": "Standard API error response",
  "type": "object",
  "required": ["error"],
  "properties": {
    "error": {
      "type": "object",
      "required": ["code", "message"],
      "properties": {
        "code": {
          "type": "string",
          "description": "Error code identifier"
        },
        "message": {
          "type": "string",
          "description": "Human-readable error message"
        },
        "details": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "field": {
                "type": "string"
              },
              "message": {
                "type": "string"
              }
            }
          }
        }
      }
    }
  }
}
```

## Schemas Generated
- `user.schema.json` - User entity
- `user-list-response.schema.json` - Paginated user list
- `auth-response.schema.json` - Authentication response
- `error-response.schema.json` - Error response
- `product.schema.json` - Product entity
- `order.schema.json` - Order entity
```

### 2. Mock Data Validation Report
```markdown
# Mock Data Validation Report

## Validation Summary
- Total mock files validated: 24
- Passed: 21
- Failed: 3
- Pass rate: 87.5%

## Validation Results

### ✅ Passed Validations

| Mock File | Schema | Status |
|-----------|--------|--------|
| api/v1/users/GET/200-success.json | user-list-response.schema.json | ✅ Valid |
| api/v1/users/POST/201-created.json | user.schema.json | ✅ Valid |
| api/v1/users/{id}/GET/200-success.json | user.schema.json | ✅ Valid |
| api/v1/auth/login/POST/200-success.json | auth-response.schema.json | ✅ Valid |
| api/v1/auth/login/POST/401-unauthorized.json | error-response.schema.json | ✅ Valid |
| api/v1/products/GET/200-success.json | product-list-response.schema.json | ✅ Valid |

### ❌ Failed Validations

#### 1. api/v1/users/POST/400-validation-error.json
**Schema**: error-response.schema.json
**Errors**:
```json
[
  {
    "path": "/error/details/0",
    "message": "Missing required property 'field'",
    "schemaPath": "#/properties/error/properties/details/items/required"
  }
]
```
**Current Data**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "message": "Invalid email format"
      }
    ]
  }
}
```
**Fix Required**: Add `field` property to each detail object

#### 2. api/v1/users/{id}/PUT/200-updated.json
**Schema**: user.schema.json
**Errors**:
```json
[
  {
    "path": "/role",
    "message": "Value 'superadmin' is not in enum ['admin', 'user', 'guest']",
    "schemaPath": "#/properties/role/enum"
  }
]
```
**Current Data**:
```json
{
  "id": "user-001",
  "email": "john@example.com",
  "name": "John Doe",
  "role": "superadmin",
  "createdAt": "2024-01-15T10:00:00Z"
}
```
**Fix Required**: Change role to valid enum value or update API contract

#### 3. api/v1/products/{id}/GET/200-success.json
**Schema**: product.schema.json
**Errors**:
```json
[
  {
    "path": "/price",
    "message": "Expected number but got string",
    "schemaPath": "#/properties/price/type"
  },
  {
    "path": "",
    "message": "Missing required property 'currency'",
    "schemaPath": "#/required"
  }
]
```
**Current Data**:
```json
{
  "id": "prod-001",
  "name": "Wireless Headphones",
  "price": "299.99",
  "description": "Premium headphones"
}
```
**Fix Required**: 
1. Change price from string to number
2. Add required currency field

## Recommendations
1. Fix all validation errors before deploying fake backend
2. Consider adding automated validation to CI/CD pipeline
3. Update mock data when API contracts change
4. Review enum values for consistency across mocks
```

### 3. Mock-to-API Documentation Mapping
```markdown
# Mock-to-API Documentation Mapping

## Overview
This document maps each mock data file to its corresponding API endpoint specification, providing traceability between mock data and API contracts.

## API Version: v1
## Last Updated: 2024-01-20

## Endpoint Mappings

### User Management API

#### GET /api/v1/users
**Description**: Retrieve list of users with pagination
**API Spec Reference**: `openapi.yaml#/paths/~1api~1v1~1users/get`

| Status Code | Mock File | Description |
|-------------|-----------|-------------|
| 200 | `api/v1/users/GET/200-success.json` | Successful response with user list |
| 200 | `api/v1/users/GET/200-success-empty.json` | Empty user list |
| 401 | `api/v1/users/GET/401-unauthorized.json` | Authentication required |
| 403 | `api/v1/users/GET/403-forbidden.json` | Insufficient permissions |
| 500 | `api/v1/users/GET/500-server-error.json` | Internal server error |

**Request Parameters**:
- `page` (query): Page number (default: 1)
- `perPage` (query): Items per page (default: 20, max: 100)
- `sort` (query): Sort field (default: createdAt)
- `order` (query): Sort order (asc/desc)

**Response Schema**: `schemas/user-list-response.schema.json`

---

#### POST /api/v1/users
**Description**: Create a new user
**API Spec Reference**: `openapi.yaml#/paths/~1api~1v1~1users/post`

| Status Code | Mock File | Description |
|-------------|-----------|-------------|
| 201 | `api/v1/users/POST/201-created.json` | User created successfully |
| 400 | `api/v1/users/POST/400-validation-error.json` | Validation error |
| 401 | `api/v1/users/POST/401-unauthorized.json` | Authentication required |
| 409 | `api/v1/users/POST/409-conflict.json` | Email already exists |
| 500 | `api/v1/users/POST/500-server-error.json` | Internal server error |

**Request Body Schema**: `schemas/create-user-request.schema.json`
**Response Schema**: `schemas/user.schema.json`

---

#### GET /api/v1/users/{id}
**Description**: Retrieve a specific user by ID
**API Spec Reference**: `openapi.yaml#/paths/~1api~1v1~1users~1{id}/get`

| Status Code | Mock File | Description |
|-------------|-----------|-------------|
| 200 | `api/v1/users/{id}/GET/200-success.json` | User found |
| 401 | `api/v1/users/{id}/GET/401-unauthorized.json` | Authentication required |
| 404 | `api/v1/users/{id}/GET/404-not-found.json` | User not found |
| 500 | `api/v1/users/{id}/GET/500-server-error.json` | Internal server error |

**Path Parameters**:
- `id` (required): User ID (format: user-[a-z0-9]+)

**Response Schema**: `schemas/user.schema.json`

---

### Authentication API

#### POST /api/v1/auth/login
**Description**: Authenticate user and obtain tokens
**API Spec Reference**: `openapi.yaml#/paths/~1api~1v1~1auth~1login/post`

| Status Code | Mock File | Description |
|-------------|-----------|-------------|
| 200 | `api/v1/auth/login/POST/200-success.json` | Login successful |
| 200 | `api/v1/auth/login/POST/200-success-mfa-required.json` | MFA verification required |
| 400 | `api/v1/auth/login/POST/400-invalid-credentials.json` | Invalid email or password |
| 401 | `api/v1/auth/login/POST/401-account-locked.json` | Account locked |
| 429 | `api/v1/auth/login/POST/429-rate-limited.json` | Too many attempts |
| 500 | `api/v1/auth/login/POST/500-server-error.json` | Internal server error |

**Request Body Schema**: `schemas/login-request.schema.json`
**Response Schema**: `schemas/auth-response.schema.json`

---

## Coverage Summary

### Endpoints Coverage
| Endpoint | Methods | Mock Files | Coverage |
|----------|---------|------------|----------|
| /api/v1/users | GET, POST | 10 | 100% |
| /api/v1/users/{id} | GET, PUT, DELETE | 12 | 100% |
| /api/v1/auth/login | POST | 6 | 100% |
| /api/v1/auth/logout | POST | 2 | 100% |
| /api/v1/auth/refresh | POST | 3 | 100% |
| /api/v1/products | GET, POST | 8 | 100% |
| /api/v1/products/{id} | GET, PUT, DELETE | 9 | 100% |

### Status Code Coverage
| Status Code | Description | Mock Files |
|-------------|-------------|------------|
| 200 | Success | 15 |
| 201 | Created | 3 |
| 204 | No Content | 2 |
| 400 | Bad Request | 8 |
| 401 | Unauthorized | 7 |
| 403 | Forbidden | 3 |
| 404 | Not Found | 6 |
| 409 | Conflict | 4 |
| 429 | Rate Limited | 2 |
| 500 | Server Error | 10 |

### Schema Coverage
| Schema | Used By | Mock Files |
|--------|---------|------------|
| user.schema.json | User endpoints | 8 |
| user-list-response.schema.json | GET /users | 2 |
| auth-response.schema.json | Auth endpoints | 4 |
| error-response.schema.json | All error responses | 30 |
| product.schema.json | Product endpoints | 6 |
```

### 4. Contract Compliance Validation
```markdown
# Contract Compliance Validation Report

## API Contract: openapi.yaml
## Mock Data Version: 1.0.0
## Validation Date: 2024-01-20

## Compliance Summary
- Total endpoints: 12
- Fully compliant: 10
- Partially compliant: 2
- Non-compliant: 0
- Overall compliance: 91.7%

## Detailed Compliance Analysis

### Fully Compliant Endpoints ✅

#### GET /api/v1/users
- Response structure matches schema
- All required fields present
- Data types correct
- Pagination metadata complete

#### POST /api/v1/users
- Request validation errors properly formatted
- Created response includes all required fields
- Conflict response follows error schema

#### GET /api/v1/users/{id}
- Single user response matches schema
- Not found error properly formatted
- All optional fields handled correctly

### Partially Compliant Endpoints ⚠️

#### PUT /api/v1/users/{id}
**Compliance: 80%**
**Issues**:
1. Mock uses `superadmin` role not in API enum
2. Missing `updatedAt` field in some responses

**Remediation**:
```json
// Fix role enum
"role": "admin"  // Instead of "superadmin"

// Add updatedAt field
"updatedAt": "2024-01-20T14:30:00Z"
```

#### GET /api/v1/products/{id}
**Compliance: 70%**
**Issues**:
1. Price field is string instead of number
2. Missing required `currency` field
3. Missing `inventory` object

**Remediation**:
```json
{
  "id": "prod-001",
  "name": "Wireless Headphones",
  "price": 299.99,
  "currency": "USD",
  "inventory": {
    "available": 150,
    "reserved": 12
  }
}
```

## Compliance Checklist

### Required Field Compliance
| Field Type | Total | Present | Missing | Compliance |
|------------|-------|---------|---------|------------|
| User.id | 8 | 8 | 0 | 100% |
| User.email | 8 | 8 | 0 | 100% |
| User.name | 8 | 8 | 0 | 100% |
| User.role | 8 | 8 | 0 | 100% |
| User.createdAt | 8 | 8 | 0 | 100% |
| Product.price | 6 | 6 | 0 | 100% |
| Product.currency | 6 | 4 | 2 | 67% |

### Data Type Compliance
| Field | Expected Type | Violations | Compliance |
|-------|---------------|------------|------------|
| User.id | string | 0 | 100% |
| User.email | string (email) | 0 | 100% |
| Product.price | number | 2 | 67% |
| Timestamps | string (date-time) | 0 | 100% |

### Enum Value Compliance
| Enum | Valid Values | Violations | Compliance |
|------|--------------|------------|------------|
| User.role | admin, user, guest | 1 | 88% |
| Order.status | pending, processing, shipped, delivered | 0 | 100% |

## Recommendations

### Immediate Actions
1. Fix price data type in product mocks (string → number)
2. Add missing currency field to product mocks
3. Update role enum value from superadmin to admin

### Process Improvements
1. Add schema validation to mock creation workflow
2. Implement automated validation in CI/CD
3. Create pre-commit hooks for mock validation
4. Schedule regular compliance audits
```

## Implementation Patterns

### Schema Generation Prompt
```
You are a JSON Schema generator. Your task is to create validation schemas from API specifications (OpenAPI/Swagger).

**Generation Process:**

1. **Parse API specification** to extract response schemas
2. **Convert to JSON Schema** format (draft-07)
3. **Add validation constraints**:
   - Required fields
   - Data types
   - Format validators (email, date-time, uri)
   - Enum values
   - Min/max constraints
   - Pattern matching

4. **Generate schema files** for each entity

**Schema Requirements:**
- Use JSON Schema draft-07
- Include $id and title
- Add descriptions for all properties
- Set additionalProperties: false for strict validation
- Include format validators where applicable

**Output Format:**
Generate JSON Schema files with proper structure and validation rules.
```

### Mock Validation Prompt
```
You are a mock data validator. Your task is to validate all mock files against their corresponding JSON schemas.

**Validation Process:**

1. **Load schemas** from mocks/schemas/ directory
2. **Match mock files** to appropriate schemas based on endpoint
3. **Validate each mock** against its schema
4. **Report violations** with specific error details

**Validation Checks:**
- Required field presence
- Data type correctness
- Enum value validity
- Format compliance (email, date-time, uri)
- Pattern matching
- Min/max constraints

**Output Format:**
```markdown
# Mock Data Validation Report

## Summary
- Total files: [count]
- Passed: [count]
- Failed: [count]

## Passed Validations
[List of valid mock files]

## Failed Validations
### [Mock File]
**Schema**: [schema file]
**Errors**:
- [error details]
**Fix Required**: [remediation steps]
```
```

### Documentation Mapping Prompt
```
You are a documentation specialist. Your task is to create comprehensive mapping documentation between mock files and API specifications.

**Documentation Process:**

1. **Map each endpoint** to its mock files
2. **Document status code coverage** for each endpoint
3. **Reference API specification** sections
4. **Include schema references**
5. **Calculate coverage metrics**

**Documentation Requirements:**
- Clear endpoint-to-mock mapping
- Status code coverage table
- Schema references
- Request/response documentation
- Coverage summary

**Output Format:**
Generate comprehensive markdown documentation with tables and references.
```

## Instructions

### How to Use This Module

1. **Load API Specification**: Provide OpenAPI/Swagger file path
2. **Generate Schemas**: Create JSON schemas from API definitions
3. **Validate Mocks**: Run validation against all mock files
4. **Review Results**: Analyze validation report for issues
5. **Fix Violations**: Update mock data to match contracts
6. **Generate Documentation**: Create mock-to-API mapping docs

### Validation Workflow

1. **Schema Generation Phase**: Convert API specs to JSON schemas
2. **Validation Phase**: Validate all mock files against schemas
3. **Remediation Phase**: Fix any validation errors
4. **Documentation Phase**: Generate mapping documentation
5. **Compliance Phase**: Create compliance report

### Best Practices

- **Keep Schemas Updated**: Regenerate schemas when API changes
- **Automate Validation**: Add validation to CI/CD pipeline
- **Document Mappings**: Maintain clear mock-to-API documentation
- **Track Compliance**: Monitor compliance metrics over time
- **Version Control**: Track schema and mock changes together

## Usage Instructions

**Basic Validation:**
```markdown
#[[module:testing/mock-validation.md]]
```

**With API Specification:**
```markdown
#[[module:testing/mock-validation.md|api_spec=api/openapi.yaml]]
```

**Parameters:**
- `api_spec`: Path to OpenAPI/Swagger specification
- `schema_output`: Directory for generated schemas (default: mocks/schemas/)
- `strict_mode`: Fail on any validation error (default: true)

## Integration Points
- Requires `centralized-mock-data.md` for mock organization
- Supports `mock-consolidation.md` for migration validation
- Used by `fake-backend-generator.md` for response validation
- Integrates with CI/CD for automated validation
