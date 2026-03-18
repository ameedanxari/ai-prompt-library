# Stage 01 - Intake: Platform-Agnostic Requirements

## Purpose
Process user input, validate requirements, and establish core project foundation that applies across all platforms.

## Instructions
Use this template to process user input and establish the foundational requirements that apply across all target platforms. Focus on extracting core functionality, validating requirements, and organizing assets.

## Non-Negotiable Intake Outputs
Stage 01 must produce these artifacts before moving forward:
- `prompts/outputs/specifications/asset-mapping.md`
- `prompts/outputs/specifications/design-system-foundation.md`
- `prompts/outputs/specifications/design-system-component-catalog.md`
- `prompts/outputs/specifications/prompt-selection-manifest.md`
- `prompts/outputs/specifications/prompt-usage-log.md`
- `prompts/outputs/specifications/integration-contracts.md`

Required behavior:
1. Scan all available source assets in `working_copy/` and `prompts/working_copy/` (if present).
2. Build design-system foundation (tokens + component primitives) before screen-level tasks.
3. Select and document prompt "lego blocks" (templates/orchestrators) for this project.
4. Detect technology stack(s) from source assets/specs and add stack-module selections in `prompt-selection-manifest.md` under `.ai-prompts/prompts/modules/technology-stacks/...`.
5. Define real API/backend integration contracts, and mark mock usage as temporary-only.
6. Create a Stage 01 entry in `prompt-usage-log.md` with selected modules/templates and mapped outputs.
7. Include design-system modules (`token-architecture`, `component-system`, `screen-fidelity-audit`) in prompt selection unless explicitly out of scope.
8. For UI scope projects, use design-system templates for concrete output structure (foundation + component catalog).

Mandatory templates for this stage:
- `.ai-prompts/prompts/templates/integration-contracts-spec-template.md`
- `.ai-prompts/prompts/templates/prompt-composition-index-template.md`
- `.ai-prompts/prompts/templates/prompt-usage-log-template.md`
- `.ai-prompts/prompts/templates/design-system-foundation-template.md`
- `.ai-prompts/prompts/templates/design-system-component-catalog-template.md`

## Examples
```markdown
## Requirements Analysis for E-commerce Platform

### Core Requirements Identification
**Primary Features**: Product catalog, shopping cart, payment processing, user accounts
**User Workflows**: Browse products → Add to cart → Checkout → Payment → Order confirmation
**Business Logic**: Inventory management, pricing rules, tax calculations
**Data Management**: Product data, user profiles, order history, payment records

### Technology Stack Selection
**Frontend**: React + TypeScript + Next.js (web-first approach)
**Backend**: Node.js + Express + PostgreSQL
**Authentication**: Auth0 for secure user management
**Payment**: Stripe for payment processing
```

## Core Intake Framework

### User Input Processing
```markdown
## Input Template Processing

### Required Fields Validation
**Brief**: 2-3 sentence to verbose description of the product idea
- Validate minimum content requirements
- Extract key concepts and objectives
- Identify implicit requirements and assumptions

### Optional Fields Processing
**Platforms**: Target deployment platforms (web, mobile, desktop)
**Technologies**: Preferred languages, frameworks, and tools
**Deployment**: Cloud providers, architecture preferences
**Localization**: Target languages and cultural considerations
**Design**: Branding, themes, and accessibility requirements
**Budget**: Cost constraints and optimization preferences

### Default Value Application
When optional fields are omitted:
- Apply production-quality defaults
- Choose optimal technology stacks
- Implement comprehensive feature sets
- Prioritize cost-effective solutions
- Ensure accessibility and security compliance
```

### Requirements Analysis
```markdown
## Requirements Extraction and Validation

### Core Requirements Identification
#### Functional Requirements
- **Primary Features**: Core functionality from brief analysis
- **User Workflows**: Key user journeys and interactions
- **Business Logic**: Rules, calculations, and processes
- **Data Management**: Storage, retrieval, and manipulation needs
- **Integration Points**: External services and APIs

#### Non-Functional Requirements
- **Performance**: Response times, throughput, scalability
- **Security**: Authentication, authorization, data protection
- **Accessibility**: WCAG 2.1 AA compliance requirements
- **Internationalization**: Multi-language and cultural support
- **Offline Capability**: Network resilience and caching strategies

### Requirement Validation Framework
#### Completeness Checks
- **SMART Criteria**: Specific, Measurable, Achievable, Relevant, Time-bound
- **Testability**: All requirements must be verifiable
- **Consistency**: No conflicting requirements
- **Feasibility**: Technical and business viability
- **Traceability**: Clear linkage to business objectives

#### Quality Assurance Gates
- **Stakeholder Review**: Validate requirements with stakeholders
- **Technical Review**: Assess technical feasibility
- **Risk Assessment**: Identify potential risks and mitigation strategies
- **Priority Assignment**: Rank requirements by business value
- **Acceptance Criteria**: Define clear success criteria
```

### Asset Management Strategy
```markdown
## Asset Organization and Processing

### Working Copy Structure
```
working_copy/
├── designs/
│   ├── mockups/
│   ├── wireframes/
│   └── style-guides/
├── specifications/
│   ├── requirements/
│   ├── apis/
│   └── data-models/
├── assets/
│   ├── images/
│   ├── icons/
│   └── media/
└── references/
    ├── competitors/
    ├── inspiration/
    └── documentation/
```

### Asset Processing Pipeline
#### File Type Support
- **Design Files**: Figma, Sketch, Adobe XD, PNG, JPG, SVG
- **Specification Documents**: PDF, DOC, MD, TXT
- **Data Samples**: JSON, CSV, XML, SQL
- **Media Assets**: Images, videos, audio files
- **Reference Materials**: URLs, screenshots, notes

#### Provenance Tracking
- **Original Location**: Source path and filename
- **New Location**: Organized path in working_copy
- **Processing Date**: When asset was processed
- **File Metadata**: Size, type, modification date
- **Usage Context**: How asset relates to requirements

#### Exhaustive Source Scan Requirement
- Scan root-level `working_copy/` if present.
- Scan `prompts/working_copy/` if present.
- If both exist, merge findings into one asset map and de-duplicate by checksum/path.
- Do not proceed with placeholder design assumptions if source designs are available.

### Asset Mapping Documentation
```markdown
# Asset Mapping Report

## Processing Summary
- **Total Assets Processed**: [count]
- **Processing Date**: [timestamp]
- **Source Locations**: [list of original paths]

## Asset Categories
### Design Assets
| Original Path | New Path | Type | Size | Notes |
|---------------|----------|------|------|-------|
| [path] | [new_path] | [type] | [size] | [notes] |

### Specification Documents
| Original Path | New Path | Type | Content Summary |
|---------------|----------|------|-----------------|
| [path] | [new_path] | [type] | [summary] |

### Reference Materials
| Original Path | New Path | Type | Relevance |
|---------------|----------|------|-----------|
| [path] | [new_path] | [type] | [relevance] |

## Integration Points
- **Design System**: Assets that inform design system creation
- **Feature Specifications**: Documents that define feature requirements
- **Data Models**: Files that inform database and API design
- **User Experience**: Materials that guide UX/UI decisions
```
```

## Project Configuration Framework

### Configuration Generation
```markdown
## Project Configuration Structure

### Core Configuration
```json
{
  "project": {
    "name": "[derived from brief]",
    "description": "[extracted from brief]",
    "version": "1.0.0",
    "type": "[web|mobile|desktop|hybrid]"
  },
  "platforms": {
    "web": {
      "enabled": true,
      "architecture": "headless",
      "frameworks": ["react", "next.js"],
      "deployment": "vercel"
    },
    "mobile": {
      "enabled": false,
      "approach": "react-native",
      "platforms": ["ios", "android"],
      "deployment": "app-stores"
    }
  },
  "features": {
    "authentication": true,
    "authorization": true,
    "internationalization": true,
    "accessibility": true,
    "offline": true,
    "analytics": true,
    "monitoring": true
  },
  "quality": {
    "testing": {
      "unit": true,
      "integration": true,
      "e2e": true,
      "property": true
    },
    "coverage": {
      "minimum": 85,
      "target": 90
    },
    "performance": {
      "web": {
        "fcp": "< 1.5s",
        "lcp": "< 2.5s",
        "cls": "< 0.1"
      }
    }
  }
}
```

### Technology Stack Selection
#### Decision Framework
- **Platform Requirements**: Native vs cross-platform needs
- **Team Expertise**: Available skills and experience
- **Performance Requirements**: Speed and resource constraints
- **Maintenance Considerations**: Long-term support and updates
- **Cost Optimization**: Development and operational costs
- **Ecosystem Maturity**: Library and tool availability

#### Default Technology Stacks
**Web Applications**
- **Frontend**: React + TypeScript + Next.js
- **Styling**: Tailwind CSS + Headless UI
- **State Management**: Zustand or Redux Toolkit
- **Testing**: Jest + React Testing Library + Playwright
- **Deployment**: Vercel or Netlify

**Mobile Applications**
- **Cross-Platform**: React Native + TypeScript
- **Navigation**: React Navigation
- **State Management**: Zustand or Redux Toolkit
- **Testing**: Jest + React Native Testing Library + Detox
- **Deployment**: Expo Application Services

**Backend Services**
- **API**: Node.js + Express + TypeScript or Python + FastAPI
- **Database**: PostgreSQL + Prisma or MongoDB + Mongoose
- **Authentication**: Auth0 or Firebase Auth
- **Deployment**: Railway, Heroku, or AWS Lambda
```

## Quality Assurance Framework

### Intake Validation Checklist
```markdown
## Validation Checklist

### Input Validation
- [ ] Brief contains sufficient detail for project scope
- [ ] Technical requirements are feasible and well-defined
- [ ] Platform choices are consistent with project goals
- [ ] Budget constraints are realistic for scope
- [ ] Timeline expectations are achievable

### Asset Validation
- [ ] All provided assets are accessible and usable
- [ ] Asset formats are supported and processable
- [ ] Asset organization follows working_copy structure
- [ ] Provenance tracking is complete and accurate
- [ ] Asset integration points are identified

### Configuration Validation
- [ ] Technology stack choices are compatible
- [ ] Platform configurations are consistent
- [ ] Feature selections align with requirements
- [ ] Quality standards are appropriate for project type
- [ ] Deployment options match platform choices

### Documentation Validation
- [ ] Requirements are complete and testable
- [ ] Asset mapping is comprehensive
- [ ] Configuration is well-documented
- [ ] Next steps are clearly defined
- [ ] Stakeholder sign-off is obtained
```

### Risk Assessment
```markdown
## Risk Identification and Mitigation

### Common Intake Risks
#### Requirement Risks
- **Incomplete Brief**: Insufficient detail for accurate scoping
- **Conflicting Requirements**: Contradictory or incompatible needs
- **Scope Creep**: Expanding requirements during intake
- **Unrealistic Expectations**: Timeline or budget constraints

#### Technical Risks
- **Technology Misalignment**: Poor technology choices for requirements
- **Platform Incompatibility**: Conflicting platform requirements
- **Asset Quality Issues**: Poor quality or unusable assets
- **Integration Complexity**: Complex external system requirements

### Mitigation Strategies
#### Requirement Mitigation
- **Structured Interviews**: Follow-up questions for clarification
- **Prototype Development**: Quick prototypes to validate understanding
- **Stakeholder Workshops**: Collaborative requirement refinement
- **Iterative Refinement**: Multiple review cycles for accuracy

#### Technical Mitigation
- **Technology Assessment**: Thorough evaluation of technology choices
- **Proof of Concept**: Technical validation of key decisions
- **Expert Consultation**: Technical expert review and validation
- **Risk-Based Planning**: Contingency plans for high-risk areas
```

This platform-agnostic intake strategy establishes a solid foundation for project initiation while ensuring consistency and quality across all subsequent stages.

## Next Steps
- **Stage 02 - Charter**: Project scope and goals definition
- **Asset Integration**: Incorporate processed assets into charter
- **Stakeholder Alignment**: Validate intake results with stakeholders
- **Technical Validation**: Confirm technology choices with development team
