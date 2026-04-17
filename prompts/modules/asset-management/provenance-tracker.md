# Provenance Tracker Module

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
Maintain comprehensive tracking of asset origins, modifications, and relationships throughout the reorganization and processing workflow.

## Core Functionality

### Provenance Tracking Prompt
```
You are a provenance tracking specialist. Your task is to create and maintain detailed records of all asset origins, movements, and modifications to ensure complete traceability.

**Tracking Process:**
1. **Record original asset information**:
   - Original file path and location
   - Original file name and extension
   - File creation and modification timestamps
   - File size and format details
   - Source context (user upload, existing project, external reference)

2. **Track all modifications**:
   - File movements and reorganization
   - Name changes and standardization
   - Format conversions or optimizations
   - Content modifications or processing
   - Relationship establishment or changes

3. **Maintain relationship mapping**:
   - Parent-child relationships (source → derived)
   - Sibling relationships (related files)
   - Version relationships (v1 → v2 → final)
   - Dependency relationships (spec → implementation)

4. **Document processing history**:
   - Processing steps applied to each file
   - Transformations and modifications made
   - Quality improvements or optimizations
   - Integration points with other assets

**Provenance Record Format:**

```markdown
# Asset Provenance Tracking

## Tracking Metadata
- **Tracking ID**: [unique identifier for this tracking session]
- **Timestamp**: [when tracking was initiated]
- **Processor**: [system/agent performing tracking]
- **Session Context**: [brief description of processing context]

## Original Asset Registry

### Asset: [asset-id-001]
- **Original Path**: `[full original file path]`
- **Original Name**: `[original filename with extension]`
- **File Type**: [detected file type and category]
- **Size**: [file size in appropriate units]
- **Created**: [original creation timestamp if available]
- **Modified**: [last modification timestamp]
- **Source Context**: [how this file was provided - upload, existing, reference]
- **Content Hash**: [file content hash for integrity verification]

### Asset: [asset-id-002]
[repeat for each asset]

## Processing History

### Asset: [asset-id-001]
**Processing Steps:**
1. **Discovery** ([timestamp])
   - Discovered in: `[original location]`
   - Categorized as: [category and subcategory]
   - Quality assessment: [initial quality evaluation]

2. **Organization** ([timestamp])
   - Moved to: `working_copy/[new path]`
   - Renamed to: `[new standardized name]`
   - Reason: [explanation for movement/renaming]

3. **Relationship Mapping** ([timestamp])
   - Related to: [list of related asset IDs]
   - Relationship type: [parent/child/sibling/version/dependency]
   - Context: [explanation of relationship]

4. **Processing** ([timestamp])
   - Processing applied: [list of processing steps]
   - Modifications made: [description of changes]
   - Output generated: [any derived files or outputs]

### Asset: [asset-id-002]
[repeat for each asset]

## Current Asset Locations

### Organized Structure
```
working_copy/
├── designs/
│   ├── wireframes/
│   │   ├── [new-name-1] (origin: [asset-id-xxx])
│   │   └── [new-name-2] (origin: [asset-id-xxx])
│   ├── mockups/
│   │   └── [new-name-3] (origin: [asset-id-xxx])
│   └── components/
├── specifications/
│   ├── requirements/
│   │   └── [new-name-4] (origin: [asset-id-xxx])
│   └── api/
├── data-samples/
└── assets/
```

## Relationship Map

### Design Progression Chains
- **Chain 1**: [asset-id-001] → [asset-id-002] → [asset-id-003]
  - Type: Wireframe → Mockup → Prototype
  - Context: User dashboard design evolution

### Specification Dependencies
- **Dependency 1**: [asset-id-004] depends on [asset-id-005]
  - Type: API spec depends on data model
  - Context: User management system specifications

### Asset Families
- **Family 1**: Logo variations
  - Members: [asset-id-006], [asset-id-007], [asset-id-008]
  - Relationship: Different formats/sizes of same logo

### Version Series
- **Series 1**: Requirements evolution
  - Sequence: [asset-id-009] v1 → [asset-id-010] v2 → [asset-id-011] final
  - Context: Requirements document iterations

## Integrity Verification

### File Integrity Checks
- **Asset [asset-id-001]**: ✓ Hash verified, file intact
- **Asset [asset-id-002]**: ✓ Hash verified, file intact
- [continue for all assets]

### Relationship Integrity
- **All parent-child relationships**: ✓ Verified
- **All dependency chains**: ✓ Complete
- **All version sequences**: ✓ Ordered correctly

### Location Verification
- **All files in expected locations**: ✓ Confirmed
- **No orphaned files**: ✓ All files tracked
- **No missing references**: ✓ All references valid

## Change Log
- **[timestamp]**: Initial asset discovery and cataloging
- **[timestamp]**: Asset reorganization completed
- **[timestamp]**: Relationship mapping established
- **[timestamp]**: Provenance tracking finalized
```

**Verification Steps:**
- Confirm all original files are accounted for
- Verify file integrity through hash comparison
- Validate all relationships are properly documented
- Ensure complete traceability from original to final location
- Check that no assets were lost or corrupted during processing
```

### Relationship Types and Tracking
```
**Relationship Classification:**

**Parent-Child Relationships:**
- Source file → Processed/optimized version
- Original design → Exported formats
- Master specification → Platform-specific versions
- Raw data → Cleaned/processed datasets

**Sibling Relationships:**
- Related design files (same feature, different views)
- Complementary specifications (frontend + backend)
- Associated data files (schema + sample data)
- Brand asset variations (different formats of same asset)

**Version Relationships:**
- Sequential versions: v1 → v2 → v3 → final
- Iteration stages: draft → review → approved → final
- Time-based versions: dated iterations of same document
- Branch versions: alternative approaches to same requirement

**Dependency Relationships:**
- Specification dependencies: requirements → design → implementation
- Data dependencies: schema → sample data → validation rules
- Asset dependencies: style guide → component designs → final mockups
- Technical dependencies: API spec → client implementation → tests

**Tracking Metadata for Each Relationship:**
- Relationship ID and type
- Source and target asset IDs
- Relationship strength (strong/weak dependency)
- Context and rationale for relationship
- Impact assessment (what breaks if relationship changes)
```

## Usage Instructions

**Basic Provenance Tracking:**
```markdown
#[[module:asset-management/provenance-tracker.md]]
```

**Detailed Tracking with Verification:**
```markdown
#[[module:asset-management/provenance-tracker.md|verify=true|detailed=true]]
```

**Parameters:**
- `verify`: Perform integrity verification (true/false)
- `detailed`: Include detailed processing history (true/false)
- `relationships`: Track and map relationships (true/false)
- `hash_check`: Verify file integrity with hashes (true/false)

## Integration Points
- Receives input from `asset-scanner.md` for original asset information
- Tracks changes made by `asset-organizer.md` during reorganization
- Provides data for `mapping-generator.md` to create user-facing documentation
- Supports audit trails for quality assurance and debugging

## Instructions

### How to Use the Provenance Tracker

1. **Initialize Tracking Session**
   - Create a unique tracking ID for the current processing session
   - Set up the tracking metadata with timestamp and context information
   - Prepare the tracking record structure for all assets to be processed

2. **Record Original Asset Information**
   - For each asset discovered, create a detailed registry entry
   - Capture original file paths, names, sizes, and timestamps
   - Calculate and store content hashes for integrity verification
   - Document the source context (how the file was provided)

3. **Track All Modifications**
   - Log every change made to assets during processing
   - Record file movements, renames, and reorganization steps
   - Document any content modifications or format conversions
   - Maintain timestamps for all processing steps

4. **Map Relationships**
   - Identify and document relationships between assets
   - Create parent-child chains for derived files
   - Establish sibling relationships for related assets
   - Track version progressions and dependency chains

5. **Verify Integrity**
   - Perform hash verification to ensure file integrity
   - Validate that all relationships are properly documented
   - Confirm all assets are accounted for in their final locations
   - Generate integrity reports for audit purposes

6. **Generate Documentation**
   - Create comprehensive provenance records
   - Generate user-facing mapping documentation
   - Provide audit trails for compliance and debugging
   - Export tracking data for external systems if needed

### Integration with Other Modules

- **With Asset Scanner**: Receive initial asset discovery data
- **With Asset Organizer**: Track reorganization and movement operations
- **With Mapping Generator**: Provide relationship data for documentation
- **With Quality Assurance**: Support audit and verification processes

## Examples

### Complete Provenance Tracking Example

Here's a comprehensive example of tracking assets for a mobile app redesign project:

#### 1. Initial Asset Discovery
```markdown
# Asset Provenance Tracking

## Tracking Metadata
- **Tracking ID**: APT-2024-001-MOBILE-REDESIGN
- **Timestamp**: 2024-01-15T10:30:00Z
- **Processor**: Asset Management System v2.1
- **Session Context**: Mobile app redesign project - initial asset organization

## Original Asset Registry

### Asset: AST-001
- **Original Path**: `/Users/designer/Desktop/app_mockups/login_screen_v3.fig`
- **Original Name**: `login_screen_v3.fig`
- **File Type**: Figma Design File (.fig)
- **Size**: 2.4 MB
- **Created**: 2024-01-10T14:22:00Z
- **Modified**: 2024-01-14T16:45:00Z
- **Source Context**: Designer upload via project portal
- **Content Hash**: sha256:a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456

### Asset: AST-002
- **Original Path**: `/Users/designer/Desktop/app_mockups/dashboard_wireframe.sketch`
- **Original Name**: `dashboard_wireframe.sketch`
- **File Type**: Sketch Design File (.sketch)
- **Size**: 1.8 MB
- **Created**: 2024-01-08T09:15:00Z
- **Modified**: 2024-01-12T11:30:00Z
- **Source Context**: Designer upload via project portal
- **Content Hash**: sha256:b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567

### Asset: AST-003
- **Original Path**: `/Users/pm/Documents/requirements/mobile_app_requirements_v2.docx`
- **Original Name**: `mobile_app_requirements_v2.docx`
- **File Type**: Microsoft Word Document (.docx)
- **Size**: 156 KB
- **Created**: 2024-01-05T13:00:00Z
- **Modified**: 2024-01-13T15:20:00Z
- **Source Context**: Project manager upload via email attachment
- **Content Hash**: sha256:c3d4e5f6789012345678901234567890abcdef1234567890abcdef12345678901

### Asset: AST-004
- **Original Path**: `/Users/designer/Desktop/brand_assets/logo_variations.zip`
- **Original Name**: `logo_variations.zip`
- **File Type**: ZIP Archive (.zip)
- **Size**: 5.2 MB
- **Created**: 2024-01-03T10:45:00Z
- **Modified**: 2024-01-03T10:45:00Z
- **Source Context**: Brand team shared folder
- **Content Hash**: sha256:d4e5f6789012345678901234567890abcdef1234567890abcdef123456789012
```

#### 2. Processing History Tracking
```markdown
## Processing History

### Asset: AST-001 (login_screen_v3.fig)
**Processing Steps:**
1. **Discovery** (2024-01-15T10:31:15Z)
   - Discovered in: `/Users/designer/Desktop/app_mockups/`
   - Categorized as: UI Design / Screen Mockup
   - Quality assessment: High-fidelity design, production-ready

2. **Organization** (2024-01-15T10:32:30Z)
   - Moved to: `working_copy/designs/screens/login/`
   - Renamed to: `login-screen-final.fig`
   - Reason: Standardized naming convention, organized by feature area

3. **Relationship Mapping** (2024-01-15T10:33:45Z)
   - Related to: AST-003 (requirements document)
   - Relationship type: Implementation of requirement REQ-AUTH-001
   - Context: Login screen design implements authentication requirements

4. **Processing** (2024-01-15T10:35:00Z)
   - Processing applied: Exported PNG and SVG assets for development
   - Modifications made: Generated developer handoff documentation
   - Output generated: login-screen-assets/ folder with exported images

### Asset: AST-002 (dashboard_wireframe.sketch)
**Processing Steps:**
1. **Discovery** (2024-01-15T10:31:20Z)
   - Discovered in: `/Users/designer/Desktop/app_mockups/`
   - Categorized as: UI Design / Wireframe
   - Quality assessment: Low-fidelity wireframe, needs refinement

2. **Organization** (2024-01-15T10:32:45Z)
   - Moved to: `working_copy/designs/wireframes/dashboard/`
   - Renamed to: `dashboard-wireframe-v1.sketch`
   - Reason: Organized by design fidelity and feature area

3. **Relationship Mapping** (2024-01-15T10:34:00Z)
   - Related to: AST-003 (requirements document)
   - Relationship type: Early design exploration for REQ-DASH-001
   - Context: Initial wireframe for dashboard requirements

4. **Processing** (2024-01-15T10:36:15Z)
   - Processing applied: Converted to PDF for stakeholder review
   - Modifications made: Added annotation layer with design notes
   - Output generated: dashboard-wireframe-review.pdf

### Asset: AST-003 (mobile_app_requirements_v2.docx)
**Processing Steps:**
1. **Discovery** (2024-01-15T10:31:00Z)
   - Discovered in: `/Users/pm/Documents/requirements/`
   - Categorized as: Documentation / Requirements
   - Quality assessment: Comprehensive requirements, well-structured

2. **Organization** (2024-01-15T10:32:00Z)
   - Moved to: `working_copy/specifications/requirements/`
   - Renamed to: `mobile-app-requirements-final.docx`
   - Reason: Standardized naming, organized by document type

3. **Relationship Mapping** (2024-01-15T10:33:00Z)
   - Related to: AST-001, AST-002 (design files)
   - Relationship type: Parent document (source requirements)
   - Context: Defines requirements that designs must implement

4. **Processing** (2024-01-15T10:37:30Z)
   - Processing applied: Extracted requirements into structured format
   - Modifications made: Created requirement traceability matrix
   - Output generated: requirements-matrix.xlsx, requirements-summary.md

### Asset: AST-004 (logo_variations.zip)
**Processing Steps:**
1. **Discovery** (2024-01-15T10:31:30Z)
   - Discovered in: `/Users/designer/Desktop/brand_assets/`
   - Categorized as: Brand Assets / Logo Variations
   - Quality assessment: Complete logo package with multiple formats

2. **Organization** (2024-01-15T10:33:15Z)
   - Moved to: `working_copy/assets/brand/logos/`
   - Renamed to: `logo-package-complete.zip`
   - Reason: Organized by asset type and brand hierarchy

3. **Extraction and Cataloging** (2024-01-15T10:34:30Z)
   - Extracted contents: 12 logo variations in PNG, SVG, EPS formats
   - Individual files cataloged: AST-004-A through AST-004-L
   - Organized by: Format and size variations

4. **Relationship Mapping** (2024-01-15T10:35:45Z)
   - Related to: All design assets (AST-001, AST-002)
   - Relationship type: Brand consistency dependency
   - Context: Logo assets must be used consistently across all designs

5. **Processing** (2024-01-15T10:38:00Z)
   - Processing applied: Created brand asset usage guide
   - Modifications made: Generated developer-friendly asset structure
   - Output generated: brand-assets/ folder with organized logo files
```

#### 3. Current Asset Locations and Relationships
```markdown
## Current Asset Locations

### Organized Structure
```
working_copy/
├── designs/
│   ├── screens/
│   │   └── login/
│   │       ├── login-screen-final.fig (origin: AST-001)
│   │       └── login-screen-assets/
│   │           ├── login-bg.png
│   │           ├── login-form.svg
│   │           └── login-button.png
│   └── wireframes/
│       └── dashboard/
│           ├── dashboard-wireframe-v1.sketch (origin: AST-002)
│           └── dashboard-wireframe-review.pdf
├── specifications/
│   └── requirements/
│       ├── mobile-app-requirements-final.docx (origin: AST-003)
│       ├── requirements-matrix.xlsx
│       └── requirements-summary.md
└── assets/
    └── brand/
        └── logos/
            ├── logo-package-complete.zip (origin: AST-004)
            └── brand-assets/
                ├── logo-primary.svg
                ├── logo-secondary.png
                ├── logo-icon.svg
                └── brand-usage-guide.md
```

## Relationship Map

### Design Implementation Chain
- **Chain 1**: AST-003 → AST-002 → AST-001
  - Type: Requirements → Wireframe → High-fidelity Design
  - Context: Login feature development progression
  - Traceability: REQ-AUTH-001 → wireframe exploration → final design

### Brand Consistency Dependencies
- **Dependency 1**: AST-004 influences AST-001, AST-002
  - Type: Brand assets provide design constraints
  - Context: All designs must use approved logo variations
  - Impact: Logo changes affect all design deliverables

### Document Hierarchy
- **Hierarchy 1**: Requirements as parent document
  - Parent: AST-003 (requirements)
  - Children: AST-001, AST-002 (design implementations)
  - Relationship: Design artifacts implement specific requirements

### Asset Families
- **Family 1**: Login Feature Assets
  - Members: AST-001 (design), extracted assets (PNGs, SVGs)
  - Relationship: Source design and derived implementation assets
  - Context: Complete asset package for login feature development

## Integrity Verification

### File Integrity Checks
- **Asset AST-001**: ✓ Hash verified (sha256:a1b2c3....), file intact
- **Asset AST-002**: ✓ Hash verified (sha256:b2c3d4....), file intact  
- **Asset AST-003**: ✓ Hash verified (sha256:c3d4e5....), file intact
- **Asset AST-004**: ✓ Hash verified (sha256:d4e5f6....), file intact

### Relationship Integrity
- **Requirements → Design relationships**: ✓ All designs trace to requirements
- **Brand consistency dependencies**: ✓ All designs reference approved brand assets
- **Asset family completeness**: ✓ All derived assets accounted for

### Location Verification
- **All files in expected locations**: ✓ Confirmed in working_copy structure
- **No orphaned files**: ✓ All original files tracked and organized
- **No missing references**: ✓ All cross-references valid and accessible

## Change Log
- **2024-01-15T10:30:00Z**: Initial asset discovery and cataloging completed
- **2024-01-15T10:35:00Z**: Asset reorganization into working_copy structure completed
- **2024-01-15T10:38:00Z**: Relationship mapping and dependency analysis completed
- **2024-01-15T10:40:00Z**: Integrity verification and provenance tracking finalized
- **2024-01-15T10:42:00Z**: Documentation generation and audit trail creation completed
```

### Usage in Different Scenarios

#### Scenario 1: Simple File Organization
```markdown
# Quick Asset Tracking
#[[module:asset-management/provenance-tracker.md|verify=false|detailed=false]]

For basic file organization without detailed relationship mapping.
```

#### Scenario 2: Compliance Audit
```markdown
# Comprehensive Audit Trail
#[[module:asset-management/provenance-tracker.md|verify=true|detailed=true|relationships=true|hash_check=true]]

For projects requiring complete audit trails and compliance documentation.
```

#### Scenario 3: Design Handoff
```markdown
# Design Asset Tracking
#[[module:asset-management/provenance-tracker.md|relationships=true|detailed=true]]

For tracking design asset relationships and implementation dependencies.
```

This comprehensive provenance tracking ensures complete traceability of all assets from their original state through final organization, supporting audit requirements, quality assurance, and project documentation needs.
