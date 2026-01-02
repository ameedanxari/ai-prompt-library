# Mapping Generator Module

## Purpose
Generate comprehensive documentation that maps original asset locations to new organized locations, providing clear traceability and reference information for users and AI agents.

## Instructions
Use this module to create detailed asset mapping documentation after assets have been organized. The mapping should provide clear traceability and help users understand how their assets were reorganized.

1. **Analyze Asset Organization**: Review how assets were moved and categorized
2. **Create Mapping Documentation**: Generate comprehensive mapping reports
3. **Document Relationships**: Map connections between related assets
4. **Provide Usage Guidance**: Include instructions for accessing and using assets
5. **Generate Multiple Formats**: Create different views for different use cases

## Examples

### Basic Asset Mapping Example
```markdown
## Asset Mapping Report

**Project**: E-commerce Platform
**Mapping Date**: 2024-01-15
**Total Assets Processed**: 23 files

### Mapping Summary

| Original Location | New Location | Category | Purpose |
|-------------------|--------------|----------|---------|
| `/designs/homepage.fig` | `working_copy/designs/mockups/homepage.fig` | Design | Homepage mockup |
| `/docs/requirements.pdf` | `working_copy/specifications/requirements/user-requirements.pdf` | Specification | User requirements |
| `/assets/logo.png` | `working_copy/assets/images/brand/logo.png` | Brand Asset | Company logo |
| `/data/users.json` | `working_copy/specifications/data-models/sample-users.json` | Data Sample | User data examples |

### Category Organization

#### Designs (8 files)
**Location**: `working_copy/designs/`
- **Mockups** (4 files): High-fidelity design files
  - `homepage.fig` - Main homepage design
  - `product-page.sketch` - Product detail page
  - `checkout-flow.xd` - Checkout process designs
  - `mobile-app.fig` - Mobile application screens

- **Wireframes** (3 files): Low-fidelity layout files
  - `site-wireframes.pdf` - Overall site structure
  - `mobile-wireframes.sketch` - Mobile layout wireframes
  - `user-flow.png` - User journey diagrams

- **Components** (1 file): Reusable design elements
  - `component-library.fig` - Design system components

#### Specifications (7 files)
**Location**: `working_copy/specifications/`
- **Requirements** (3 files): Project requirements and user stories
  - `user-requirements.pdf` - Detailed user requirements
  - `technical-requirements.md` - Technical specifications
  - `business-rules.docx` - Business logic documentation

- **APIs** (2 files): API documentation and specifications
  - `api-specification.yaml` - OpenAPI specification
  - `endpoint-examples.json` - API response examples

- **Data Models** (2 files): Database and data structure definitions
  - `database-schema.sql` - Database structure
  - `sample-users.json` - Sample user data

### Asset Relationships

#### Design Dependencies
- `homepage.fig` references `component-library.fig` for consistent styling
- `mobile-wireframes.sketch` informs `mobile-app.fig` final designs
- `user-flow.png` guides overall navigation in all design files

#### Specification Connections
- `user-requirements.pdf` defines features implemented in `api-specification.yaml`
- `database-schema.sql` supports data structures in `sample-users.json`
- `business-rules.docx` provides logic for API endpoint behaviors

### Usage Instructions

#### For Developers
- **Design References**: Use files in `working_copy/designs/mockups/` for implementation
- **API Implementation**: Follow `working_copy/specifications/apis/api-specification.yaml`
- **Data Structure**: Reference `working_copy/specifications/data-models/` for database design

#### For Designers
- **Component Library**: Update `working_copy/designs/components/component-library.fig`
- **Design System**: Maintain consistency across all mockup files
- **Asset Updates**: Replace files in original locations, maintain naming conventions

#### For Project Managers
- **Requirements Tracking**: Monitor `working_copy/specifications/requirements/` for scope changes
- **Progress Tracking**: Use asset organization to track deliverable completion
- **Quality Assurance**: Verify all assets are properly categorized and accessible
```

### Detailed Mapping Example
```markdown
## Comprehensive Asset Mapping

### File-by-File Mapping

#### Original: `/user-provided-assets/designs/homepage-final-v3.fig`
**New Location**: `working_copy/designs/mockups/homepage.fig`
**Changes Made**:
- Renamed for consistency (removed version number and descriptive text)
- Moved to appropriate category subfolder
- Verified file integrity and accessibility

**Usage Context**:
- Referenced in homepage implementation tasks
- Used for responsive design specifications
- Informs component library development

**Related Assets**:
- `working_copy/designs/wireframes/site-wireframes.pdf` (original wireframe)
- `working_copy/designs/components/component-library.fig` (design system)
- `working_copy/specifications/requirements/user-requirements.pdf` (requirements source)

#### Original: `/documents/API_Documentation_Draft.yaml`
**New Location**: `working_copy/specifications/apis/api-specification.yaml`
**Changes Made**:
- Renamed for clarity and consistency
- Validated YAML syntax and OpenAPI compliance
- Organized into appropriate specification category

**Usage Context**:
- Primary reference for backend API development
- Used for frontend integration planning
- Informs testing strategy and validation

**Related Assets**:
- `working_copy/specifications/data-models/database-schema.sql` (data structure)
- `working_copy/specifications/requirements/technical-requirements.md` (technical specs)
- `working_copy/specifications/apis/endpoint-examples.json` (usage examples)
```

## Core Functionality

### Asset Mapping Documentation Prompt
```
You are a documentation specialist focused on asset mapping. Your task is to create clear, comprehensive documentation that shows users exactly how their assets were organized and where everything can be found.

**Documentation Generation Process:**
1. **Create user-friendly asset mapping documentation** that shows:
   - Where original files were moved
   - Why files were reorganized
   - How to find specific assets
   - What relationships exist between assets

2. **Generate multiple documentation formats**:
   - Summary overview for quick reference
   - Detailed mapping for comprehensive tracking
   - Category-specific guides for targeted access
   - Search-friendly index for easy lookup

3. **Include practical usage information**:
   - How assets are referenced in specifications
   - Which assets are used for which purposes
   - How to update or replace assets
   - What to do if assets are missing or need changes

**Primary Mapping Document Format:**

```markdown
# Asset Organization Map

## Overview
This document shows how your provided assets have been organized into the standardized working_copy structure. All your original files have been preserved and are now organized for optimal use in specification generation.

### Summary Statistics
- **Total assets processed**: [count]
- **Original locations**: [count of source directories/locations]
- **Categories created**: [list of categories]
- **Files renamed for consistency**: [count]
- **Relationships identified**: [count]

## Quick Reference Map

### Original → New Location Mapping
```
Your Original Files → Organized Location
├── [original-path-1] → working_copy/designs/wireframes/[new-name]
├── [original-path-2] → working_copy/specifications/requirements/[new-name]
├── [original-path-3] → working_copy/assets/branding/[new-name]
└── [continue for all major files]
```

## Detailed Asset Mapping

### Designs Category
**Purpose**: UI/UX designs, wireframes, mockups, and prototypes

#### Wireframes ([count] files)
- **`[original-name]`** → `working_copy/designs/wireframes/[new-name]`
  - **Original location**: `[full original path]`
  - **Purpose**: [description of what this wireframe shows]
  - **Related files**: [list related mockups, prototypes, etc.]
  - **Used in specifications**: [which specs reference this file]

#### Mockups ([count] files)
- **`[original-name]`** → `working_copy/designs/mockups/[new-name]`
  - **Original location**: `[full original path]`
  - **Purpose**: [description of what this mockup shows]
  - **Related files**: [list related wireframes, prototypes, etc.]
  - **Used in specifications**: [which specs reference this file]

#### Prototypes ([count] files)
[continue pattern for prototypes]

#### Components ([count] files)
[continue pattern for components]

### Specifications Category
**Purpose**: Requirements, API documentation, and technical specifications

#### Requirements ([count] files)
- **`[original-name]`** → `working_copy/specifications/requirements/[new-name]`
  - **Original location**: `[full original path]`
  - **Content type**: [user stories, acceptance criteria, business requirements]
  - **Related files**: [list dependent or related specifications]
  - **Implementation impact**: [how this affects generated specifications]

#### API Documentation ([count] files)
[continue pattern for API docs]

#### Technical Specifications ([count] files)
[continue pattern for technical specs]

#### Business Rules ([count] files)
[continue pattern for business rules]

### Data Samples Category
**Purpose**: Sample data, schemas, and configuration examples

#### Schemas ([count] files)
- **`[original-name]`** → `working_copy/data-samples/schemas/[new-name]`
  - **Original location**: `[full original path]`
  - **Schema type**: [database, API response, configuration]
  - **Related data**: [list sample data files that use this schema]
  - **Usage context**: [how this schema influences system design]

#### Sample Data ([count] files)
[continue pattern for sample data]

#### Configurations ([count] files)
[continue pattern for configurations]

### Assets Category
**Purpose**: Brand assets, images, fonts, and media files

#### Branding ([count] files)
- **`[original-name]`** → `working_copy/assets/branding/[new-name]`
  - **Original location**: `[full original path]`
  - **Asset type**: [logo, style guide, color palette]
  - **Variations available**: [list related brand asset variations]
  - **Usage guidelines**: [how this asset should be used in designs]

#### Images ([count] files)
[continue pattern for images]

#### Fonts ([count] files)
[continue pattern for fonts]

#### Media ([count] files)
[continue pattern for media]

## Asset Relationships

### Design Progression Chains
These show how your design assets relate to each other in the design process:

#### [Feature Name] Design Chain
1. **Wireframe**: `working_copy/designs/wireframes/[wireframe-name]`
2. **Mockup**: `working_copy/designs/mockups/[mockup-name]`
3. **Prototype**: `working_copy/designs/prototypes/[prototype-name]`
4. **Components**: `working_copy/designs/components/[component-names]`

**Context**: [explanation of how these files work together]

### Specification Dependencies
These show how your specification files depend on each other:

#### [System Name] Specification Chain
1. **Requirements**: `working_copy/specifications/requirements/[requirements-name]`
2. **API Spec**: `working_copy/specifications/api/[api-spec-name]`
3. **Data Model**: `working_copy/data-samples/schemas/[schema-name]`
4. **Sample Data**: `working_copy/data-samples/sample-data/[data-name]`

**Context**: [explanation of how these specifications work together]

### Asset Families
These show related assets that work together:

#### [Brand Name] Asset Family
- **Primary Logo**: `working_copy/assets/branding/[logo-primary]`
- **Logo Variations**: `working_copy/assets/branding/[logo-variations]`
- **Style Guide**: `working_copy/specifications/brand/[style-guide]`
- **Color Palette**: `working_copy/assets/branding/[color-palette]`

**Context**: [explanation of how these assets work together for branding]

## Usage in Generated Specifications

### How Assets Are Referenced
Your organized assets will be automatically referenced in generated specifications:

#### Design References
- **UI Specifications** will reference your wireframes and mockups
- **Component Libraries** will be based on your design components
- **Style Guides** will incorporate your brand assets and design patterns

#### Data Model References
- **Database Designs** will be based on your schema files
- **API Specifications** will use your sample data for examples
- **Validation Rules** will be derived from your data patterns

#### Brand Integration
- **Design Systems** will incorporate your brand guidelines
- **Component Styling** will use your color palettes and fonts
- **Asset Libraries** will include your logos and brand elements

### Finding Specific Assets
Use this quick reference to find assets by purpose:

#### For UI/UX Design Work
- **Wireframes**: `working_copy/designs/wireframes/`
- **Visual Designs**: `working_copy/designs/mockups/`
- **Interactive Prototypes**: `working_copy/designs/prototypes/`
- **UI Components**: `working_copy/designs/components/`

#### For Technical Implementation
- **Requirements**: `working_copy/specifications/requirements/`
- **API Documentation**: `working_copy/specifications/api/`
- **Data Models**: `working_copy/data-samples/schemas/`
- **Configuration Examples**: `working_copy/data-samples/configurations/`

#### For Branding and Assets
- **Logos and Branding**: `working_copy/assets/branding/`
- **Images and Graphics**: `working_copy/assets/images/`
- **Typography**: `working_copy/assets/fonts/`
- **Media Files**: `working_copy/assets/media/`

## Updating and Managing Assets

### Adding New Assets
To add new assets to your organized structure:
1. Place new files in the appropriate category directory
2. Follow the established naming conventions
3. Update this mapping document if needed
4. Consider relationships with existing assets

### Replacing Assets
To replace existing assets:
1. Keep the same filename to maintain references
2. Update the file content as needed
3. Note any changes in specifications that reference the asset
4. Update related assets if necessary

### Asset Quality Guidelines
Your assets have been organized with these quality standards:
- **Consistent naming**: All files follow standardized naming patterns
- **Logical grouping**: Related files are kept together
- **Clear relationships**: Dependencies and relationships are documented
- **Accessible formats**: Files are in widely-supported formats when possible

## Troubleshooting

### Missing Assets
If you can't find an asset:
1. Check the detailed mapping above for the exact location
2. Look for renamed versions (original name → standardized name)
3. Check related asset categories (designs might be in multiple subcategories)
4. Verify the asset was included in the original materials

### Broken References
If specifications reference missing assets:
1. Check if the asset was renamed during organization
2. Look for the asset in related categories
3. Verify the asset path in the specification matches the organized structure
4. Update specification references if needed

### Quality Issues
If assets need improvement:
1. Replace assets in their organized locations
2. Maintain the same filenames to preserve references
3. Update related assets that depend on the changed asset
4. Test that specifications still work with updated assets

---

*This mapping document is automatically generated and maintained. It reflects the current organization of your assets and will be updated if assets are reorganized or modified.*
```

**Quality Assurance:**
- Verify all original files are accounted for in the mapping
- Ensure all new locations are accurately documented
- Check that relationships are clearly explained
- Confirm usage instructions are practical and actionable
- Validate that troubleshooting guidance is comprehensive
```

### Category-Specific Documentation Templates
```
**Design Assets Documentation Template:**

```markdown
# Design Assets Reference Guide

## Design Asset Categories

### Wireframes
**Purpose**: Low-fidelity structural layouts and user flow diagrams
**Location**: `working_copy/designs/wireframes/`
**Usage**: Referenced in UI specifications and user experience documentation

#### Available Wireframes
- `[wireframe-name-1]`: [description and context]
- `[wireframe-name-2]`: [description and context]

### Mockups
**Purpose**: High-fidelity visual designs and interface layouts
**Location**: `working_copy/designs/mockups/`
**Usage**: Referenced in visual design specifications and style guides

#### Available Mockups
- `[mockup-name-1]`: [description and context]
- `[mockup-name-2]`: [description and context]

### Design Relationships
- **Wireframe → Mockup**: [show progression from wireframe to mockup]
- **Mockup → Components**: [show how mockups break down into components]
- **Cross-Platform Variations**: [show how designs adapt across platforms]
```

**Specification Assets Documentation Template:**

```markdown
# Specification Assets Reference Guide

## Specification Categories

### Requirements Documentation
**Purpose**: Business requirements, user stories, and acceptance criteria
**Location**: `working_copy/specifications/requirements/`
**Usage**: Foundation for all generated specifications and implementation plans

#### Available Requirements
- `[requirements-name-1]`: [scope and content description]
- `[requirements-name-2]`: [scope and content description]

### API Documentation
**Purpose**: API specifications, endpoint definitions, and integration guides
**Location**: `working_copy/specifications/api/`
**Usage**: Referenced in backend specifications and integration documentation

#### Available API Specs
- `[api-spec-name-1]`: [API scope and endpoints covered]
- `[api-spec-name-2]`: [API scope and endpoints covered]

### Specification Dependencies
- **Requirements → API Specs**: [show how requirements drive API design]
- **API Specs → Data Models**: [show how APIs define data structures]
- **Cross-Reference Matrix**: [show which specs depend on which others]
```
```

## Usage Instructions

**Generate Complete Asset Mapping:**
```markdown
#[[module:asset-management/mapping-generator.md]]
```

**Generate Category-Specific Documentation:**
```markdown
#[[module:asset-management/mapping-generator.md|category=designs]]
#[[module:asset-management/mapping-generator.md|category=specifications]]
```

**Parameters:**
- `category`: Focus on specific category (designs, specifications, data, assets, all)
- `detailed`: Include detailed descriptions and usage information (true/false)
- `relationships`: Include relationship mapping and dependencies (true/false)
- `usage_guide`: Include practical usage instructions (true/false)

## Integration Points
- Requires input from `provenance-tracker.md` for complete asset history
- Uses data from `asset-organizer.md` for current organization structure
- Supports user navigation and AI agent asset referencing
- Feeds into specification generation for asset integration