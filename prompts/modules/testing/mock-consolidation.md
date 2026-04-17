# Mock Consolidation Module

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
Migrate platform-specific mock data to a centralized location, ensuring all platforms (web, iOS, Android, desktop) reference the same shared mock files. This module identifies duplicate mocks, consolidates them into the centralized structure, validates platform references, and cleans up deprecated platform-specific mocks.

## Instructions

### When to Use This Module
- When consolidating existing platform-specific mocks into centralized location
- When auditing mock data for duplicates and inconsistencies across platforms
- When migrating a project to use centralized mock data management
- When cleaning up deprecated or orphaned mock files
- Before implementing fake backend to ensure consistent mock data

### Implementation Steps
1. **Scan Platform Mocks**: Identify all mock data files across all platforms
2. **Detect Duplicates**: Find duplicate or conflicting mock data between platforms
3. **Plan Migration**: Create migration plan for consolidating mocks
4. **Execute Migration**: Move mock data to centralized location
5. **Update References**: Update platform code to reference centralized mocks
6. **Validate References**: Ensure all platforms correctly reference shared mocks
7. **Cleanup**: Remove deprecated platform-specific mock files

### Key Consolidation Principles
- **Single Source of Truth**: All platforms must reference the same mock files
- **No Platform Duplicates**: Eliminate all platform-specific mock copies
- **Consistent Data**: Ensure mock data is identical across all platforms
- **Reference Validation**: Verify all platform references point to centralized mocks
- **Safe Migration**: Preserve original mocks until migration is validated

### Quality Assurance Guidelines
- Verify no mock data is lost during consolidation
- Ensure all platform tests pass after migration
- Check that no platform-specific mock files remain
- Validate that centralized mocks cover all platform requirements
- Test mock data accessibility from all platforms

## Examples

### 1. Platform Mock Discovery
```markdown
# Platform Mock Discovery Report

## Scanned Platforms
- Web: `web/src/mocks/`, `web/tests/fixtures/`
- iOS: `ios/Tests/Mocks/`, `ios/TestFixtures/`
- Android: `android/app/src/test/mocks/`, `android/app/src/androidTest/fixtures/`
- Desktop: `desktop/tests/mocks/`

## Discovered Mock Files

### Web Platform
| File | Location | API Endpoint | Status Codes |
|------|----------|--------------|--------------|
| users.json | web/src/mocks/ | /api/v1/users | 200 |
| users-error.json | web/src/mocks/ | /api/v1/users | 400, 500 |
| auth-success.json | web/tests/fixtures/ | /api/v1/auth/login | 200 |
| auth-failure.json | web/tests/fixtures/ | /api/v1/auth/login | 401 |

### iOS Platform
| File | Location | API Endpoint | Status Codes |
|------|----------|--------------|--------------|
| UserMocks.swift | ios/Tests/Mocks/ | /api/v1/users | 200, 404 |
| AuthMocks.swift | ios/Tests/Mocks/ | /api/v1/auth/login | 200, 401 |
| ProductMocks.json | ios/TestFixtures/ | /api/v1/products | 200 |

### Android Platform
| File | Location | API Endpoint | Status Codes |
|------|----------|--------------|--------------|
| users.json | android/app/src/test/mocks/ | /api/v1/users | 200 |
| auth_responses.json | android/app/src/test/mocks/ | /api/v1/auth/login | 200, 401, 500 |
| products.json | android/app/src/androidTest/fixtures/ | /api/v1/products | 200, 404 |

### Desktop Platform
| File | Location | API Endpoint | Status Codes |
|------|----------|--------------|--------------|
| api-mocks.json | desktop/tests/mocks/ | Multiple | Various |

## Summary
- Total platforms scanned: 4
- Total mock files found: 12
- Unique API endpoints: 4
- Potential duplicates: 8
```

### 2. Duplicate Detection Report
```markdown
# Duplicate Mock Detection Report

## Duplicate Analysis

### /api/v1/users - GET - 200
**Duplicates Found: 3**

| Platform | File | Data Hash | Differences |
|----------|------|-----------|-------------|
| Web | web/src/mocks/users.json | abc123 | Baseline |
| Android | android/app/src/test/mocks/users.json | abc123 | None (identical) |
| iOS | ios/Tests/Mocks/UserMocks.swift | def456 | Different user IDs, extra fields |

**Recommendation**: Use web version as baseline, update iOS mock to match

### /api/v1/auth/login - POST - 200
**Duplicates Found: 3**

| Platform | File | Data Hash | Differences |
|----------|------|-----------|-------------|
| Web | web/tests/fixtures/auth-success.json | ghi789 | Baseline |
| iOS | ios/Tests/Mocks/AuthMocks.swift | ghi789 | None (identical) |
| Android | android/app/src/test/mocks/auth_responses.json | jkl012 | Different token format |

**Recommendation**: Standardize token format, use web version as baseline

### /api/v1/auth/login - POST - 401
**Duplicates Found: 2**

| Platform | File | Data Hash | Differences |
|----------|------|-----------|-------------|
| Web | web/tests/fixtures/auth-failure.json | mno345 | Baseline |
| Android | android/app/src/test/mocks/auth_responses.json | pqr678 | Different error message |

**Recommendation**: Standardize error response format

## Conflict Summary
- Identical duplicates: 2
- Minor differences: 2
- Significant conflicts: 1
- Total duplicates to consolidate: 5

## Resolution Strategy
1. Use web platform mocks as baseline (most complete)
2. Merge additional status codes from other platforms
3. Standardize response formats across all mocks
4. Document any platform-specific variations that must be preserved
```

### 3. Migration Plan
```markdown
# Mock Data Migration Plan

## Migration Overview
- Source: Platform-specific mock directories
- Target: Centralized mocks/ directory
- Platforms: Web, iOS, Android, Desktop
- Total files to migrate: 12
- Estimated conflicts to resolve: 3

## Phase 1: Preparation
1. Create backup of all existing mock files
2. Set up centralized mocks/ directory structure
3. Document current platform mock references

## Phase 2: Migration Execution

### Step 1: Migrate User Mocks
```
Source Files:
- web/src/mocks/users.json → mocks/api/v1/users/GET/200-success.json
- web/src/mocks/users-error.json → mocks/api/v1/users/GET/400-validation-error.json
- web/src/mocks/users-error.json → mocks/api/v1/users/GET/500-server-error.json

Conflict Resolution:
- iOS UserMocks.swift: Extract JSON data, merge with web version
- Android users.json: Identical to web, no action needed
```

### Step 2: Migrate Auth Mocks
```
Source Files:
- web/tests/fixtures/auth-success.json → mocks/api/v1/auth/login/POST/200-success.json
- web/tests/fixtures/auth-failure.json → mocks/api/v1/auth/login/POST/401-unauthorized.json
- android/app/src/test/mocks/auth_responses.json → mocks/api/v1/auth/login/POST/500-server-error.json

Conflict Resolution:
- Standardize token format to JWT structure
- Use consistent error response format
```

### Step 3: Migrate Product Mocks
```
Source Files:
- ios/TestFixtures/ProductMocks.json → mocks/api/v1/products/GET/200-success.json
- android/app/src/androidTest/fixtures/products.json → mocks/api/v1/products/GET/404-not-found.json

Conflict Resolution:
- None (no duplicates)
```

## Phase 3: Reference Updates

### Web Platform Updates
```javascript
// Before
import users from '../mocks/users.json';

// After
import users from '../../mocks/api/v1/users/GET/200-success.json';
```

### iOS Platform Updates
```swift
// Before
let mockData = UserMocks.successResponse

// After
let mockData = try! Data(contentsOf: Bundle.main.url(forResource: "200-success", withExtension: "json", subdirectory: "mocks/api/v1/users/GET")!)
```

### Android Platform Updates
```kotlin
// Before
val mockData = loadMockFromAssets("mocks/users.json")

// After
val mockData = loadMockFromAssets("mocks/api/v1/users/GET/200-success.json")
```

## Phase 4: Validation
1. Run all platform tests to verify mock references
2. Validate mock data against API schemas
3. Check for any remaining platform-specific mocks

## Phase 5: Cleanup
1. Remove deprecated platform-specific mock files
2. Update documentation
3. Archive backup files
```

### 4. Platform Reference Validation
```markdown
# Platform Reference Validation Report

## Validation Results

### Web Platform
| Test File | Mock Reference | Status | Notes |
|-----------|----------------|--------|-------|
| users.test.ts | mocks/api/v1/users/GET/200-success.json | ✅ Valid | |
| auth.test.ts | mocks/api/v1/auth/login/POST/200-success.json | ✅ Valid | |
| auth.test.ts | mocks/api/v1/auth/login/POST/401-unauthorized.json | ✅ Valid | |
| products.test.ts | mocks/api/v1/products/GET/200-success.json | ✅ Valid | |

### iOS Platform
| Test File | Mock Reference | Status | Notes |
|-----------|----------------|--------|-------|
| UserTests.swift | mocks/api/v1/users/GET/200-success.json | ✅ Valid | |
| AuthTests.swift | mocks/api/v1/auth/login/POST/200-success.json | ✅ Valid | |
| AuthTests.swift | ios/Tests/Mocks/AuthMocks.swift | ❌ Invalid | Still using old reference |

### Android Platform
| Test File | Mock Reference | Status | Notes |
|-----------|----------------|--------|-------|
| UserRepositoryTest.kt | mocks/api/v1/users/GET/200-success.json | ✅ Valid | |
| AuthViewModelTest.kt | mocks/api/v1/auth/login/POST/200-success.json | ✅ Valid | |
| ProductListTest.kt | android/app/src/test/mocks/products.json | ❌ Invalid | Still using old reference |

### Desktop Platform
| Test File | Mock Reference | Status | Notes |
|-----------|----------------|--------|-------|
| api_tests.rs | mocks/api/v1/users/GET/200-success.json | ✅ Valid | |

## Validation Summary
- Total references checked: 11
- Valid references: 9
- Invalid references: 2
- Validation pass rate: 82%

## Required Fixes
1. **iOS AuthTests.swift**: Update to use centralized mock path
2. **Android ProductListTest.kt**: Update to use centralized mock path

## Fix Instructions

### iOS Fix
```swift
// File: ios/Tests/AuthTests.swift
// Line: 45

// Before
let mockData = AuthMocks.successResponse

// After
let mockData = loadCentralizedMock("api/v1/auth/login/POST/200-success.json")
```

### Android Fix
```kotlin
// File: android/app/src/test/ProductListTest.kt
// Line: 23

// Before
val mockData = loadMockFromAssets("mocks/products.json")

// After
val mockData = loadCentralizedMock("api/v1/products/GET/200-success.json")
```
```

### 5. Cleanup Report
```markdown
# Platform Mock Cleanup Report

## Files Marked for Deletion

### Web Platform
| File | Reason | Migrated To |
|------|--------|-------------|
| web/src/mocks/users.json | Migrated to centralized | mocks/api/v1/users/GET/200-success.json |
| web/src/mocks/users-error.json | Migrated to centralized | mocks/api/v1/users/GET/400-validation-error.json |
| web/tests/fixtures/auth-success.json | Migrated to centralized | mocks/api/v1/auth/login/POST/200-success.json |
| web/tests/fixtures/auth-failure.json | Migrated to centralized | mocks/api/v1/auth/login/POST/401-unauthorized.json |

### iOS Platform
| File | Reason | Migrated To |
|------|--------|-------------|
| ios/Tests/Mocks/UserMocks.swift | Migrated to centralized | mocks/api/v1/users/GET/200-success.json |
| ios/Tests/Mocks/AuthMocks.swift | Migrated to centralized | mocks/api/v1/auth/login/POST/*.json |
| ios/TestFixtures/ProductMocks.json | Migrated to centralized | mocks/api/v1/products/GET/200-success.json |

### Android Platform
| File | Reason | Migrated To |
|------|--------|-------------|
| android/app/src/test/mocks/users.json | Migrated to centralized | mocks/api/v1/users/GET/200-success.json |
| android/app/src/test/mocks/auth_responses.json | Migrated to centralized | mocks/api/v1/auth/login/POST/*.json |
| android/app/src/androidTest/fixtures/products.json | Migrated to centralized | mocks/api/v1/products/GET/*.json |

### Desktop Platform
| File | Reason | Migrated To |
|------|--------|-------------|
| desktop/tests/mocks/api-mocks.json | Migrated to centralized | mocks/api/v1/*/*.json |

## Cleanup Summary
- Total files to delete: 11
- Web platform: 4 files
- iOS platform: 3 files
- Android platform: 3 files
- Desktop platform: 1 file

## Pre-Cleanup Checklist
- [x] All platform tests pass with centralized mocks
- [x] All mock references updated to centralized paths
- [x] Backup of original files created
- [x] Migration documentation complete

## Cleanup Commands
```bash
# Web cleanup
rm -rf web/src/mocks/
rm -rf web/tests/fixtures/

# iOS cleanup
rm -rf ios/Tests/Mocks/
rm -rf ios/TestFixtures/

# Android cleanup
rm -rf android/app/src/test/mocks/
rm -rf android/app/src/androidTest/fixtures/

# Desktop cleanup
rm -rf desktop/tests/mocks/
```

## Post-Cleanup Validation
1. Run all platform tests
2. Verify no broken imports
3. Check CI/CD pipelines pass
4. Update .gitignore if needed
```

## Implementation Patterns

### Platform Mock Scanner Prompt
```
You are a platform mock scanner. Your task is to identify all mock data files across all platforms in the project.

**Scanning Process:**

1. **Scan common mock locations** for each platform:
   
   **Web Platform:**
   - `web/src/mocks/`
   - `web/tests/fixtures/`
   - `web/tests/mocks/`
   - `web/__mocks__/`
   - `src/mocks/`
   - `tests/fixtures/`
   
   **iOS Platform:**
   - `ios/Tests/Mocks/`
   - `ios/TestFixtures/`
   - `ios/*Tests/Mocks/`
   - `ios/Fixtures/`
   
   **Android Platform:**
   - `android/app/src/test/mocks/`
   - `android/app/src/test/fixtures/`
   - `android/app/src/androidTest/fixtures/`
   - `android/app/src/test/resources/`
   
   **Desktop Platform:**
   - `desktop/tests/mocks/`
   - `desktop/tests/fixtures/`
   - `electron/tests/mocks/`

2. **Identify mock file types**:
   - JSON files (`.json`)
   - TypeScript/JavaScript mock files (`.ts`, `.js`)
   - Swift mock files (`.swift`)
   - Kotlin mock files (`.kt`)
   - YAML/YML files (`.yaml`, `.yml`)

3. **Extract mock metadata**:
   - API endpoint being mocked
   - HTTP method (GET, POST, PUT, DELETE)
   - Status codes covered
   - Data structure/schema

4. **Generate discovery report** with all findings

**Output Format:**
```markdown
# Platform Mock Discovery Report

## Platforms Scanned
- [Platform]: [directories scanned]

## Mock Files Found

### [Platform Name]
| File | Location | API Endpoint | Methods | Status Codes |
|------|----------|--------------|---------|--------------|
| [filename] | [path] | [endpoint] | [methods] | [codes] |

## Summary
- Total platforms: [count]
- Total mock files: [count]
- Unique endpoints: [count]
```
```

### Duplicate Detection Prompt
```
You are a mock data duplicate detector. Your task is to identify duplicate and conflicting mock data across platforms.

**Detection Process:**

1. **Group mocks by API endpoint and method**
2. **Compare mock data content** across platforms:
   - Calculate content hash for each mock
   - Identify identical duplicates
   - Detect structural differences
   - Flag data value conflicts

3. **Classify duplicates**:
   - **Identical**: Same content, different locations
   - **Minor Differences**: Same structure, different values
   - **Significant Conflicts**: Different structure or incompatible data

4. **Generate recommendations**:
   - Which version to use as baseline
   - How to resolve conflicts
   - What data to merge

**Output Format:**
```markdown
# Duplicate Detection Report

## [Endpoint] - [Method] - [Status Code]
**Duplicates Found: [count]**

| Platform | File | Data Hash | Differences |
|----------|------|-----------|-------------|
| [platform] | [file] | [hash] | [differences] |

**Recommendation**: [resolution strategy]

## Conflict Summary
- Identical duplicates: [count]
- Minor differences: [count]
- Significant conflicts: [count]
```
```

### Reference Validation Prompt
```
You are a mock reference validator. Your task is to ensure all platform test files reference the centralized mock data correctly.

**Validation Process:**

1. **Scan test files** for mock imports/references
2. **Check reference paths** point to centralized mocks/ directory
3. **Identify invalid references** still pointing to platform-specific locations
4. **Generate fix instructions** for invalid references

**Validation Rules:**
- All mock references must start with `mocks/` or relative path to centralized directory
- No references to platform-specific mock directories
- All referenced files must exist in centralized location

**Output Format:**
```markdown
# Platform Reference Validation Report

## [Platform Name]
| Test File | Mock Reference | Status | Notes |
|-----------|----------------|--------|-------|
| [file] | [reference] | ✅/❌ | [notes] |

## Required Fixes
[List of fixes with code examples]
```
```

### Cleanup Prompt
```
You are a mock cleanup specialist. Your task is to identify and remove deprecated platform-specific mock files after migration.

**Cleanup Process:**

1. **Identify deprecated files**: Platform-specific mocks that have been migrated
2. **Verify migration**: Ensure all data is preserved in centralized location
3. **Check references**: Confirm no code still references deprecated files
4. **Generate cleanup commands**: Safe deletion commands for each platform

**Safety Checks:**
- All platform tests must pass before cleanup
- All references must be updated to centralized paths
- Backup must be created before deletion

**Output Format:**
```markdown
# Platform Mock Cleanup Report

## Files Marked for Deletion
### [Platform]
| File | Reason | Migrated To |
|------|--------|-------------|
| [file] | [reason] | [new location] |

## Pre-Cleanup Checklist
- [ ] All tests pass
- [ ] All references updated
- [ ] Backup created

## Cleanup Commands
[Platform-specific deletion commands]
```
```

## Instructions

### How to Use This Module

1. **Scan Platforms**: Use scanner prompt to discover all platform mocks
2. **Detect Duplicates**: Identify duplicate and conflicting mock data
3. **Plan Migration**: Create migration plan based on findings
4. **Execute Migration**: Move mocks to centralized location
5. **Update References**: Update all platform code to use centralized mocks
6. **Validate References**: Ensure all references are correct
7. **Cleanup**: Remove deprecated platform-specific mocks

### Consolidation Workflow

1. **Discovery Phase**: Scan all platforms for mock files
2. **Analysis Phase**: Detect duplicates and conflicts
3. **Planning Phase**: Create migration and resolution plan
4. **Migration Phase**: Move mocks to centralized location
5. **Update Phase**: Update all platform references
6. **Validation Phase**: Verify all references work correctly
7. **Cleanup Phase**: Remove deprecated files

### Best Practices

- **Backup First**: Always create backups before migration
- **Incremental Migration**: Migrate one endpoint at a time
- **Test Continuously**: Run tests after each migration step
- **Document Changes**: Keep detailed migration logs
- **Validate Thoroughly**: Check all platforms after migration

## Usage Instructions

**Basic Consolidation:**
```markdown
#[[module:testing/mock-consolidation.md]]
```

**Platform-Specific:**
```markdown
#[[module:testing/mock-consolidation.md|platforms=web,ios,android]]
```

**Parameters:**
- `platforms`: Comma-separated list of platforms to consolidate
- `dry_run`: Preview changes without executing (default: false)
- `backup`: Create backup before migration (default: true)

## Integration Points
- Requires `centralized-mock-data.md` for target structure
- Feeds into `mock-validation.md` for contract compliance
- Supports `fake-backend-generator.md` for server configuration
