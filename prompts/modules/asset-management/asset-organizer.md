# Asset Organizer Module

## Purpose
Reorganize user-provided assets into the standardized working_copy structure while maintaining file integrity and relationships. This module transforms chaotic asset collections into clean, navigable directory structures that support efficient specification generation and development workflows.

## Instructions

### When to Use This Module
- After asset scanning has identified all available files and their types
- When user-provided assets are scattered across multiple directories
- Before beginning specification generation to ensure clean asset access
- When establishing standardized project structure for development teams
- For organizing assets from multiple sources or team members

### Implementation Steps
1. **Review Asset Inventory**: Examine the complete list of discovered assets from the scanner
2. **Plan Directory Structure**: Create the standardized working_copy structure with appropriate categories
3. **Apply Naming Conventions**: Rename files using consistent, descriptive naming patterns
4. **Organize by Category**: Move files to appropriate directories based on type and purpose
5. **Preserve Relationships**: Maintain logical connections between related files
6. **Validate Organization**: Verify all files are accessible and properly categorized
7. **Document Changes**: Generate mapping documentation for all file movements

### Key Organization Principles
- **Standardized Structure**: Use consistent directory hierarchy across all projects
- **Descriptive Naming**: Apply clear, searchable file names with context
- **Logical Grouping**: Keep related files together (wireframes → mockups → prototypes)
- **Platform Separation**: Organize by platform when relevant (web, mobile, desktop)
- **Version Management**: Maintain version history and progression tracking

### Quality Assurance Guidelines
- Verify no files are lost during reorganization process
- Ensure all file relationships and dependencies are preserved
- Check that naming conventions are consistently applied
- Validate directory structure completeness and accessibility
- Test that reorganized files open correctly and maintain integrity

## Examples

### 1. Basic Web Application Organization
```markdown
# Input: Scattered design files
user_files/
├── Dashboard_Final.png
├── login screen.jpg
├── API_Documentation.pdf
├── user-data.json
└── logo_variations/
    ├── logo1.svg
    └── logo2.png

# Output: Organized structure
working_copy/
├── designs/
│   └── mockups/
│       ├── web-dashboard-mockup-final.png
│       └── web-login-mockup.jpg
├── specifications/
│   └── api/
│       └── api-documentation.pdf
├── data-samples/
│   └── sample-data/
│       └── user-sample-data.json
└── assets/
    └── branding/
        ├── company-logo-horizontal.svg
        └── company-logo-stacked.png

# Reorganization Report
## File Movements
- `Dashboard_Final.png` → `working_copy/designs/mockups/web-dashboard-mockup-final.png`
- `login screen.jpg` → `working_copy/designs/mockups/web-login-mockup.jpg`
- `API_Documentation.pdf` → `working_copy/specifications/api/api-documentation.pdf`
- `user-data.json` → `working_copy/data-samples/sample-data/user-sample-data.json`
- `logo_variations/logo1.svg` → `working_copy/assets/branding/company-logo-horizontal.svg`
- `logo_variations/logo2.png` → `working_copy/assets/branding/company-logo-stacked.png`

## Naming Improvements
- Removed spaces and special characters from file names
- Added platform context (web-) for clarity
- Used descriptive terms (horizontal, stacked) for logo variants
- Clarified file purpose (mockup, sample-data) in names
```

### 2. Multi-Platform Mobile Application
```markdown
# Input: Mixed mobile assets
project_assets/
├── iOS_wireframes/
│   ├── home.png
│   └── profile.png
├── android_mockups/
│   ├── home_final.png
│   └── settings.png
├── app_requirements.docx
└── icons/
    ├── app_icon.png
    └── tab_icons.zip

# Output: Platform-organized structure
working_copy/
├── designs/
│   ├── wireframes/
│   │   ├── ios-home-wireframe.png
│   │   └── ios-profile-wireframe.png
│   └── mockups/
│       ├── android-home-mockup-final.png
│       └── android-settings-mockup.png
├── specifications/
│   └── requirements/
│       └── mobile-app-requirements.docx
└── assets/
    ├── branding/
    │   └── app-icon-original.png
    └── images/
        └── tab-icons-collection.zip

# Platform Organization Strategy
- iOS wireframes grouped with ios- prefix for easy identification
- Android mockups grouped with android- prefix
- Cross-platform assets placed in shared locations
- Platform-specific naming enables quick filtering and access
- Maintained design progression from wireframes to final mockups
```

### 3. Enterprise SaaS Application with Version Control
```markdown
# Input: Complex enterprise project assets
enterprise_project/
├── business_docs/
│   ├── Requirements_v1.pdf
│   ├── Requirements_v2.pdf
│   └── API_Spec_Draft.yaml
├── design_files/
│   ├── wireframes_old/
│   │   ├── dashboard_v1.png
│   │   └── settings_v1.png
│   ├── current_designs/
│   │   ├── dashboard_final.png
│   │   └── settings_final.png
│   └── component_library/
│       ├── buttons.sketch
│       └── forms.sketch
├── data/
│   ├── user_schema.sql
│   ├── test_data.csv
│   └── config_examples/
│       ├── dev.yaml
│       └── prod.yaml
└── brand_assets/
    ├── logos/
    │   ├── primary.svg
    │   └── secondary.png
    ├── fonts/
    │   └── custom-font.ttf
    └── style_guide.pdf

# Output: Enterprise-organized structure
working_copy/
├── designs/
│   ├── wireframes/
│   │   ├── web-dashboard-wireframe-v1.png
│   │   └── web-settings-wireframe-v1.png
│   ├── mockups/
│   │   ├── web-dashboard-mockup-final.png
│   │   └── web-settings-mockup-final.png
│   └── components/
│       ├── button-components.sketch
│       └── form-components.sketch
├── specifications/
│   ├── requirements/
│   │   ├── business-requirements-v1.pdf
│   │   └── business-requirements-v2.pdf
│   └── api/
│       └── api-specification-draft.yaml
├── data-samples/
│   ├── schemas/
│   │   └── user-schema-database.sql
│   ├── sample-data/
│   │   └── user-test-data.csv
│   └── configurations/
│       ├── app-config-development.yaml
│       └── app-config-production.yaml
└── assets/
    ├── branding/
    │   ├── company-logo-primary.svg
    │   ├── company-logo-secondary.png
    │   └── brand-style-guide.pdf
    └── fonts/
        └── brand-font-custom.ttf

# Version and Progression Management
- Requirements maintain clear version history (v1, v2)
- Design progression from wireframes to final mockups preserved
- Component library organized by functional groups
- Configuration files separated by environment
- Brand assets organized by usage context and hierarchy
```

### 4. Cross-Platform Design System Organization
```markdown
# Input: Design system assets across platforms
design_system/
├── web_components/
│   ├── buttons/
│   ├── forms/
│   └── navigation/
├── mobile_components/
│   ├── ios/
│   └── android/
├── shared_tokens/
│   ├── colors.json
│   ├── typography.json
│   └── spacing.json
├── documentation/
│   └── component_specs.md
└── brand_assets/
    ├── logos/
    └── guidelines/

# Output: Unified design system structure
working_copy/
├── designs/
│   ├── components/
│   │   ├── shared-components/
│   │   │   ├── button-component-specs.md
│   │   │   ├── form-component-specs.md
│   │   │   └── navigation-component-specs.md
│   │   ├── web-components/
│   │   │   ├── web-button-implementations.sketch
│   │   │   ├── web-form-implementations.sketch
│   │   │   └── web-navigation-implementations.sketch
│   │   └── mobile-components/
│   │       ├── ios-component-implementations.sketch
│   │       └── android-component-implementations.sketch
├── specifications/
│   └── technical/
│       └── design-system-specifications.md
├── data-samples/
│   └── configurations/
│       ├── design-tokens-colors.json
│       ├── design-tokens-typography.json
│       └── design-tokens-spacing.json
└── assets/
    └── branding/
        ├── design-system-logos/
        └── design-system-guidelines.pdf

# Design System Organization Benefits
- Shared components clearly separated from platform-specific implementations
- Design tokens organized as configuration data for easy access
- Component specifications linked to their implementations
- Cross-platform consistency maintained through unified structure
- Easy navigation between design specs and implementation files
```

### 5. API-First Project Organization
```markdown
# Input: API-focused project with multiple services
api_project/
├── service_specs/
│   ├── user_service.yaml
│   ├── payment_service.yaml
│   └── notification_service.yaml
├── data_models/
│   ├── user.json
│   ├── payment.json
│   └── notification.json
├── postman_collections/
│   └── api_tests.json
├── database_schemas/
│   ├── users.sql
│   ├── payments.sql
│   └── notifications.sql
└── documentation/
    ├── api_guide.md
    └── integration_examples.md

# Output: Service-oriented organization
working_copy/
├── specifications/
│   ├── api/
│   │   ├── user-service-api.yaml
│   │   ├── payment-service-api.yaml
│   │   └── notification-service-api.yaml
│   ├── technical/
│   │   ├── api-integration-guide.md
│   │   └── api-integration-examples.md
├── data-samples/
│   ├── schemas/
│   │   ├── user-service-schema.sql
│   │   ├── payment-service-schema.sql
│   │   └── notification-service-schema.sql
│   ├── sample-data/
│   │   ├── user-model-sample.json
│   │   ├── payment-model-sample.json
│   │   └── notification-model-sample.json
│   └── configurations/
│       └── api-test-collection.json

# Service Organization Strategy
- API specifications grouped by service domain
- Database schemas aligned with service boundaries
- Sample data models organized by service
- Test collections treated as configuration data
- Documentation organized by technical vs. integration focus
```

## Core Functionality

### File Reorganization Prompt
```
You are an asset organization specialist. Your task is to reorganize discovered assets into a clean, standardized working_copy structure.

**Organization Process:**
1. **Create standardized directory structure** in working_copy/:
   ```
   working_copy/
   ├── designs/
   │   ├── wireframes/
   │   ├── mockups/
   │   ├── prototypes/
   │   └── components/
   ├── specifications/
   │   ├── requirements/
   │   ├── api/
   │   ├── technical/
   │   └── business/
   ├── data-samples/
   │   ├── schemas/
   │   ├── sample-data/
   │   └── configurations/
   └── assets/
       ├── branding/
       ├── images/
       ├── fonts/
       └── media/
   ```

2. **Apply naming conventions** to ensure consistency:
   - Use kebab-case for file names: `user-dashboard-mockup.png`
   - Include descriptive context: `mobile-login-wireframe.png`
   - Add version indicators when applicable: `api-spec-v2.yaml`
   - Preserve original extensions and formats
   - Avoid special characters and spaces

3. **Organize files by category and subcategory**:
   - Group related files together (e.g., all dashboard designs)
   - Maintain logical hierarchies (wireframes → mockups → prototypes)
   - Separate by platform when relevant (web/, mobile/, desktop/)
   - Keep version series together

4. **Preserve file relationships** during reorganization:
   - Maintain design progression (wireframe → mockup → final)
   - Keep specification dependencies intact
   - Group asset families (logo variations, icon sets)
   - Preserve data model relationships

**Reorganization Rules:**

**Designs Category:**
- `wireframes/`: Low-fidelity layouts and structure diagrams
- `mockups/`: High-fidelity visual designs and interfaces
- `prototypes/`: Interactive or animated design files
- `components/`: Individual UI components and design elements

**Specifications Category:**
- `requirements/`: User stories, acceptance criteria, business requirements
- `api/`: API documentation, endpoint specifications, OpenAPI files
- `technical/`: Architecture docs, technical specifications, system designs
- `business/`: Business rules, process flows, compliance documentation

**Data Samples Category:**
- `schemas/`: Database schemas, data models, structure definitions
- `sample-data/`: Example datasets, test data, content samples
- `configurations/`: Environment configs, settings, configuration examples

**Assets Category:**
- `branding/`: Logos, brand guidelines, style guides, color palettes
- `images/`: Photos, illustrations, graphics, icons (non-brand)
- `fonts/`: Typography files, font families, custom fonts
- `media/`: Audio, video, animations, multimedia content

**Output Format:**
Generate a reorganization plan in this format:

```markdown
# Asset Reorganization Plan

## Directory Structure Created
```
working_copy/
├── designs/ ([count] files)
├── specifications/ ([count] files)
├── data-samples/ ([count] files)
└── assets/ ([count] files)
```

## File Movements

### Designs
- `[original-path]` → `working_copy/designs/wireframes/[new-name]`
- `[original-path]` → `working_copy/designs/mockups/[new-name]`
- [continue for all design files]

### Specifications
- `[original-path]` → `working_copy/specifications/requirements/[new-name]`
- `[original-path]` → `working_copy/specifications/api/[new-name]`
- [continue for all specification files]

### Data Samples
- `[original-path]` → `working_copy/data-samples/schemas/[new-name]`
- `[original-path]` → `working_copy/data-samples/sample-data/[new-name]`
- [continue for all data files]

### Assets
- `[original-path]` → `working_copy/assets/branding/[new-name]`
- `[original-path]` → `working_copy/assets/images/[new-name]`
- [continue for all asset files]

## Naming Changes
- `[original-name]` → `[new-standardized-name]` (reason: [explanation])
- [list all files that were renamed with rationale]

## Preserved Relationships
- **Design Progression**: [list related design files and their relationships]
- **Specification Dependencies**: [list dependent specification files]
- **Asset Families**: [list related asset groups]
- **Version Series**: [list version-related files]

## Quality Improvements
- **Duplicate Resolution**: [how duplicates were handled]
- **Naming Standardization**: [naming improvements made]
- **Structure Optimization**: [organizational improvements]
- **Missing Assets Identified**: [gaps that should be filled]
```

**Quality Assurance:**
- Verify no files are lost during reorganization
- Ensure all relationships are preserved
- Check that naming conventions are consistently applied
- Validate directory structure completeness
- Confirm file accessibility after reorganization
```

### Naming Convention Rules
```
**Standardized Naming Patterns:**

**Design Files:**
- Pattern: `[platform]-[feature]-[type]-[version].ext`
- Examples: 
  - `web-dashboard-wireframe-v1.png`
  - `mobile-login-mockup-final.png`
  - `desktop-settings-prototype.fig`

**Specification Files:**
- Pattern: `[domain]-[type]-[version].ext`
- Examples:
  - `user-management-api-v2.yaml`
  - `authentication-requirements.md`
  - `payment-business-rules.pdf`

**Data Files:**
- Pattern: `[entity]-[type]-[context].ext`
- Examples:
  - `user-schema-database.sql`
  - `product-sample-data.json`
  - `app-config-production.yaml`

**Asset Files:**
- Pattern: `[brand/type]-[variant]-[size/format].ext`
- Examples:
  - `company-logo-horizontal.svg`
  - `app-icon-512px.png`
  - `primary-font-regular.ttf`

**Version Indicators:**
- Use semantic versioning: v1, v2, v3
- Use descriptive stages: draft, review, final
- Use dates for iterations: 2024-01-15
- Avoid generic terms: new, old, latest, temp
```

## Instructions

### How to Use This Module

1. **Prepare for Organization**: Ensure asset scanner has completed file discovery
2. **Review File Inventory**: Check the list of discovered assets and their current locations
3. **Execute Organization Prompt**: Use the provided prompt template to reorganize assets
4. **Validate Structure**: Verify the working_copy directory structure is created correctly
5. **Check File Integrity**: Ensure all files are moved without corruption or loss
6. **Update Documentation**: Generate mapping documentation for the reorganization
7. **Test Accessibility**: Verify all reorganized files are accessible and properly named

### Organization Workflow

1. **Analysis Phase**: Review discovered assets and plan organization strategy
2. **Structure Creation**: Create the standardized working_copy directory structure
3. **File Movement**: Move files to appropriate locations with standardized naming
4. **Relationship Preservation**: Maintain file relationships and dependencies
5. **Quality Validation**: Verify organization completeness and accuracy
6. **Documentation**: Generate reorganization reports and mapping documentation

### Best Practices

- **Preserve Original Files**: Keep backups of original file structure before reorganization
- **Maintain Relationships**: Ensure related files stay logically grouped
- **Use Consistent Naming**: Apply naming conventions uniformly across all files
- **Document Changes**: Record all file movements and naming changes
- **Validate Results**: Check that all files are accessible after reorganization

## Examples

### Example 1: Basic Web Application Assets

```markdown
# Input: Scattered design files
user_files/
├── Dashboard_Final.png
├── login screen.jpg
├── API_Documentation.pdf
├── user-data.json
└── logo_variations/
    ├── logo1.svg
    └── logo2.png

# Output: Organized structure
working_copy/
├── designs/
│   ├── mockups/
│   │   ├── web-dashboard-mockup-final.png
│   │   └── web-login-mockup.jpg
├── specifications/
│   └── api/
│       └── api-documentation.pdf
├── data-samples/
│   └── sample-data/
│       └── user-sample-data.json
└── assets/
    └── branding/
        ├── company-logo-horizontal.svg
        └── company-logo-stacked.png

# Reorganization Report
## File Movements
- `Dashboard_Final.png` → `working_copy/designs/mockups/web-dashboard-mockup-final.png`
- `login screen.jpg` → `working_copy/designs/mockups/web-login-mockup.jpg`
- `API_Documentation.pdf` → `working_copy/specifications/api/api-documentation.pdf`
- `user-data.json` → `working_copy/data-samples/sample-data/user-sample-data.json`
- `logo_variations/logo1.svg` → `working_copy/assets/branding/company-logo-horizontal.svg`
- `logo_variations/logo2.png` → `working_copy/assets/branding/company-logo-stacked.png`

## Naming Changes
- `Dashboard_Final.png` → `web-dashboard-mockup-final.png` (standardized naming)
- `login screen.jpg` → `web-login-mockup.jpg` (removed spaces, added context)
- `user-data.json` → `user-sample-data.json` (clarified purpose)
- `logo1.svg` → `company-logo-horizontal.svg` (descriptive naming)
- `logo2.png` → `company-logo-stacked.png` (descriptive naming)
```

### Example 2: Mobile App with Multiple Platforms

```markdown
# Input: Mixed mobile assets
project_assets/
├── iOS_wireframes/
│   ├── home.png
│   └── profile.png
├── android_mockups/
│   ├── home_final.png
│   └── settings.png
├── app_requirements.docx
└── icons/
    ├── app_icon.png
    └── tab_icons.zip

# Output: Platform-organized structure
working_copy/
├── designs/
│   ├── wireframes/
│   │   ├── ios-home-wireframe.png
│   │   └── ios-profile-wireframe.png
│   └── mockups/
│       ├── android-home-mockup-final.png
│       └── android-settings-mockup.png
├── specifications/
│   └── requirements/
│       └── mobile-app-requirements.docx
└── assets/
    ├── branding/
    │   └── app-icon-original.png
    └── images/
        └── tab-icons-collection.zip

# Platform Separation Strategy
- iOS wireframes grouped in wireframes/ with ios- prefix
- Android mockups grouped in mockups/ with android- prefix
- Cross-platform assets in shared locations
- Platform-specific naming for easy identification
```

### Example 3: Complex Enterprise Project

```markdown
# Input: Large enterprise project assets
enterprise_project/
├── business_docs/
│   ├── Requirements_v1.pdf
│   ├── Requirements_v2.pdf
│   └── API_Spec_Draft.yaml
├── design_files/
│   ├── wireframes_old/
│   ├── current_designs/
│   └── component_library/
├── data/
│   ├── user_schema.sql
│   ├── test_data.csv
│   └── config_examples/
└── brand_assets/
    ├── logos/
    ├── fonts/
    └── style_guide.pdf

# Output: Enterprise-organized structure
working_copy/
├── designs/
│   ├── wireframes/
│   │   └── [organized wireframes with version tracking]
│   ├── mockups/
│   │   └── [current designs with clear naming]
│   └── components/
│       └── [component library organized by category]
├── specifications/
│   ├── requirements/
│   │   ├── business-requirements-v1.pdf
│   │   └── business-requirements-v2.pdf
│   └── api/
│       └── api-specification-draft.yaml
├── data-samples/
│   ├── schemas/
│   │   └── user-schema-database.sql
│   ├── sample-data/
│   │   └── user-test-data.csv
│   └── configurations/
│       └── [config examples organized by environment]
└── assets/
    ├── branding/
    │   ├── [organized logos by variant]
    │   └── brand-style-guide.pdf
    └── fonts/
        └── [organized font files by family]

# Version Management
- Requirements files maintain version history
- Design files show progression from wireframes to final
- Configuration examples separated by environment
- Brand assets organized by usage context
```

### Example 4: Multi-Platform SaaS Application

```markdown
# Input: SaaS application assets across platforms
saas_project/
├── web_designs/
├── mobile_designs/
├── desktop_designs/
├── api_docs/
├── database_schemas/
├── brand_guidelines/
└── user_research/

# Output: Cross-platform organized structure
working_copy/
├── designs/
│   ├── wireframes/
│   │   ├── web-dashboard-wireframe.png
│   │   ├── mobile-dashboard-wireframe.png
│   │   └── desktop-dashboard-wireframe.png
│   ├── mockups/
│   │   ├── web-dashboard-mockup-final.png
│   │   ├── mobile-dashboard-mockup-final.png
│   │   └── desktop-dashboard-mockup-final.png
│   └── components/
│       ├── shared-components/
│       ├── web-specific-components/
│       ├── mobile-specific-components/
│       └── desktop-specific-components/
├── specifications/
│   ├── requirements/
│   │   └── user-research-findings.pdf
│   └── api/
│       └── saas-api-specification.yaml
├── data-samples/
│   └── schemas/
│       └── saas-database-schema.sql
└── assets/
    └── branding/
        └── saas-brand-guidelines.pdf

# Cross-Platform Consistency
- Consistent naming across all platforms
- Shared components identified and grouped
- Platform-specific variations clearly marked
- API specifications unified for all platforms
```

## Usage Instructions

**Basic Organization:**
```markdown
#[[module:asset-management/asset-organizer.md]]
```

**Platform-Specific Organization:**
```markdown
#[[module:asset-management/asset-organizer.md|platform=web]]
#[[module:asset-management/asset-organizer.md|platform=mobile]]
```

**Parameters:**
- `platform`: Target platform for organization (web, mobile, desktop, all)
- `preserve_structure`: Keep some original directory structure (true/false)
- `naming_strict`: Apply strict naming conventions (true/false)
- `deduplicate`: Remove duplicate files during organization (true/false)

## Integration Points
- Requires input from `asset-scanner.md` for file inventory
- Feeds into `provenance-tracker.md` for tracking file movements
- Supports `mapping-generator.md` for creating movement documentation