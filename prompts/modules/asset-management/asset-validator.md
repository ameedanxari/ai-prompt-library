# Asset Validator Module

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
Validate asset completeness, quality, and compatibility to ensure all assets are suitable for integration into generated specifications and implementation plans. This module performs comprehensive validation checks across file formats, content quality, platform compatibility, and integration readiness to prevent issues during specification generation and development phases.

## Instructions

### When to Use This Module
- After asset scanning and organization to validate asset quality
- Before proceeding with specification generation to ensure asset readiness
- When integrating assets from multiple sources or team members
- During quality assurance phases to verify asset standards compliance
- When preparing assets for handoff to development teams

### Implementation Steps
1. **Run File Format Validation**: Check file accessibility, format validity, and technical specifications
2. **Perform Content Quality Assessment**: Evaluate completeness, consistency, and usability of asset content
3. **Execute Compatibility Validation**: Ensure assets work together and support all target platforms
4. **Generate Validation Report**: Document findings, issues, and actionable recommendations
5. **Address Critical Issues**: Resolve blocking problems before proceeding with specification generation

### Key Validation Categories
- **Technical Validation**: File format integrity, size limits, accessibility, and technical specifications
- **Content Validation**: Completeness, consistency, accuracy, and alignment with project requirements
- **Compatibility Validation**: Cross-platform support, integration compatibility, and version consistency
- **Quality Standards**: Resolution requirements, naming conventions, and organizational standards

### Validation Approach
- **Automated Checks**: Use tools to validate file formats, sizes, and technical specifications
- **Content Review**: Manual assessment of asset completeness and quality
- **Integration Testing**: Verify assets work together and support intended use cases
- **Standards Compliance**: Ensure assets meet established quality and naming standards

## Examples

## Examples

### 1. Complete E-commerce Platform Asset Validation
```markdown
## Asset Validation Report: E-commerce Platform Project

**Validation Date**: 2024-01-15
**Project**: Multi-platform E-commerce Application
**Total Assets**: 24 files across 6 categories

### File Format Validation Results

#### Design Assets (8 files)
- ✅ **homepage-desktop.fig**: Valid Figma file, 3.2MB, accessible, contains 5 artboards
- ✅ **mobile-app-screens.sketch**: Valid Sketch file, 5.1MB, accessible, 12 screens
- ✅ **component-library.xd**: Valid Adobe XD file, 2.8MB, accessible, 45 components
- ✅ **wireframes-collection.pdf**: Valid PDF, 1.5MB, readable, 15 pages
- ⚠️ **product-icons.ai**: Adobe Illustrator file, 12MB, large file size warning
- ✅ **style-guide.pdf**: Valid PDF, 2.1MB, readable, comprehensive
- ❌ **old-mockup.psd**: Corrupted Photoshop file, cannot open
- ✅ **brand-guidelines.pdf**: Valid PDF, 3.4MB, readable

#### Specification Assets (6 files)
- ✅ **requirements.md**: Valid Markdown, 25KB, well-formatted, complete
- ✅ **api-specification.yaml**: Valid OpenAPI 3.0, 12KB, syntax correct
- ✅ **user-stories.md**: Valid Markdown, 18KB, structured properly
- ✅ **technical-architecture.md**: Valid Markdown, 22KB, comprehensive
- ⚠️ **database-schema.sql**: Valid SQL, 8KB, missing foreign key constraints
- ✅ **deployment-guide.md**: Valid Markdown, 15KB, step-by-step instructions

#### Data Assets (4 files)
- ✅ **sample-products.json**: Valid JSON, 45KB, 100 product records
- ✅ **user-profiles.csv**: Valid CSV, 8KB, consistent columns, 50 records
- ✅ **category-taxonomy.json**: Valid JSON, 12KB, hierarchical structure
- ❌ **analytics-data.xlsx**: Excel file corrupted, cannot parse

#### Brand Assets (3 files)
- ✅ **company-logo.svg**: Valid SVG, 15KB, scalable vector format
- ✅ **logo-variations.zip**: Valid archive, 2.1MB, contains 8 logo variants
- ✅ **brand-colors.ase**: Valid Adobe Swatch file, 2KB, 12 color swatches

#### Media Assets (2 files)
- ✅ **hero-image.jpg**: Valid JPEG, 1.2MB, 1920x1080, high quality
- ⚠️ **product-photos.zip**: Valid archive, 25MB, large file size, needs optimization

#### Documentation Assets (1 file)
- ✅ **project-overview.docx**: Valid Word document, 156KB, readable

### Content Quality Assessment

#### Design Completeness Analysis
- ✅ **Desktop Designs**: Complete homepage, product pages, checkout flow
- ✅ **Mobile Designs**: All major screens designed, responsive considerations
- ✅ **Component Library**: Comprehensive UI components with variants
- ⚠️ **Error States**: Missing error state designs for forms
- ⚠️ **Loading States**: Limited loading state designs
- ✅ **Accessibility**: Color contrast meets WCAG AA standards

#### Specification Completeness Analysis
- ✅ **Functional Requirements**: Complete user stories and acceptance criteria
- ✅ **API Documentation**: Comprehensive endpoint documentation
- ✅ **Technical Architecture**: Clear system design and technology choices
- ⚠️ **Error Handling**: Missing error handling requirements
- ⚠️ **Performance Requirements**: Vague performance criteria
- ✅ **Security Requirements**: Comprehensive security specifications

#### Data Quality Analysis
- ✅ **Sample Data**: Realistic and comprehensive test data
- ✅ **Data Structure**: Consistent schema and relationships
- ⚠️ **Data Volume**: Limited sample size for performance testing
- ✅ **Data Integrity**: No duplicate or invalid records found

### Compatibility Validation

#### Platform Support Analysis
- ✅ **Web Platform**: All assets support responsive web design
- ✅ **Mobile Platform**: Native mobile designs and specifications
- ✅ **Cross-Platform**: Consistent design language across platforms
- ⚠️ **Tablet Support**: Limited tablet-specific designs

#### Integration Compatibility
- ✅ **Design-Development**: Designs align with technical specifications
- ✅ **API-Frontend**: API specification matches frontend requirements
- ✅ **Brand-Design**: Brand guidelines consistently applied in designs
- ⚠️ **Data-API**: Some data fields missing from API specification

### Critical Issues Requiring Resolution

1. **Corrupted Files** (Blocking)
   - old-mockup.psd: Cannot open, needs replacement or repair
   - analytics-data.xlsx: File corrupted, requires fresh export

2. **Missing Design Elements** (High Priority)
   - Error state designs for all forms and interactions
   - Loading state designs for data-heavy screens
   - Tablet-specific responsive designs

3. **Specification Gaps** (High Priority)
   - Detailed error handling requirements
   - Specific performance benchmarks and criteria
   - Missing API fields for data integration

4. **File Size Optimization** (Medium Priority)
   - product-icons.ai: 12MB file needs optimization
   - product-photos.zip: 25MB archive needs image compression

### Recommendations

#### Immediate Actions (Week 1)
1. Replace or repair corrupted files (old-mockup.psd, analytics-data.xlsx)
2. Create missing error state and loading state designs
3. Add detailed error handling requirements to specifications
4. Define specific performance benchmarks

#### Short-term Improvements (Week 2-3)
1. Optimize large media files for web delivery
2. Create tablet-specific responsive designs
3. Expand sample data volume for performance testing
4. Add missing API fields for complete data integration

#### Quality Assurance Measures
1. Implement file backup and version control
2. Establish asset naming conventions and organization standards
3. Create asset review checklist for future submissions
4. Set up automated file validation in asset pipeline

### Validation Summary
- **Overall Status**: 🟡 Conditional Pass (Critical issues must be resolved)
- **File Integrity**: 83% (20/24 files valid)
- **Content Completeness**: 78% (Good coverage with identified gaps)
- **Platform Compatibility**: 85% (Strong cross-platform support)
- **Ready for Specification Generation**: ❌ (After critical issues resolved)

**Next Steps**: Address critical issues before proceeding with specification generation. Estimated resolution time: 3-5 days.
```

### 2. SaaS Application Asset Validation with Compliance Requirements
```markdown
## Asset Validation Report: Enterprise SaaS Platform

**Validation Date**: 2024-01-15
**Project**: Enterprise Customer Management SaaS
**Compliance Requirements**: SOC 2, GDPR, WCAG 2.1 AA
**Total Assets**: 18 files across 5 categories

### Compliance-Focused Validation

#### Security and Privacy Compliance
- ✅ **Data Flow Diagrams**: Complete data processing documentation
- ✅ **Privacy Policy**: GDPR-compliant privacy documentation
- ✅ **Security Architecture**: SOC 2 control implementation documented
- ⚠️ **Data Retention Policy**: Missing specific retention periods
- ✅ **Consent Management**: User consent flow designs included

#### Accessibility Compliance (WCAG 2.1 AA)
- ✅ **Color Contrast**: All designs meet 4.5:1 contrast ratio
- ✅ **Typography**: Minimum 16px font size maintained
- ✅ **Interactive Elements**: 44px minimum touch target size
- ⚠️ **Focus States**: Missing focus indicator designs
- ✅ **Alt Text Guidelines**: Comprehensive image description standards

#### Technical Compliance
- ✅ **API Security**: OAuth 2.0 and JWT implementation documented
- ✅ **Data Encryption**: Encryption at rest and in transit specified
- ✅ **Audit Logging**: Comprehensive logging requirements defined
- ⚠️ **Backup Procedures**: Missing automated backup specifications

### Asset Quality Metrics

#### Design Asset Quality Score: 88/100
- Component consistency: 95%
- Accessibility compliance: 82%
- Brand alignment: 90%
- Technical feasibility: 85%

#### Specification Asset Quality Score: 92/100
- Requirement completeness: 95%
- Technical accuracy: 90%
- Compliance coverage: 88%
- Implementation clarity: 95%

#### Data Asset Quality Score: 85/100
- Data accuracy: 90%
- Schema consistency: 85%
- Privacy compliance: 80%
- Volume adequacy: 85%

### Validation Recommendations

#### Critical Compliance Issues (Must Fix)
1. Add specific data retention periods for GDPR compliance
2. Design focus states for all interactive elements
3. Document automated backup and recovery procedures

#### Quality Improvements (Should Fix)
1. Expand sample data volume for load testing
2. Add error state designs for all user flows
3. Create comprehensive API error response documentation

#### Enhancement Opportunities (Could Fix)
1. Add dark mode design variants
2. Create advanced user role permission matrices
3. Develop comprehensive onboarding flow designs

### Compliance Certification Status
- **GDPR Readiness**: 🟡 85% (Missing data retention specifics)
- **SOC 2 Readiness**: 🟢 95% (Minor documentation gaps)
- **WCAG 2.1 AA Readiness**: 🟡 82% (Missing focus states)
- **Overall Compliance**: 🟡 87% (Address critical issues)
```

### 3. Mobile App Asset Validation with Performance Focus
```markdown
## Asset Validation Report: Fitness Tracking Mobile App

**Validation Date**: 2024-01-15
**Project**: Cross-Platform Fitness Mobile Application
**Target Platforms**: iOS 15+, Android API 26+
**Performance Requirements**: <3s app launch, <200MB memory usage

### Performance-Focused Asset Validation

#### Design Asset Performance Impact
- ✅ **Image Optimization**: All images under 500KB, WebP format ready
- ✅ **Icon Assets**: Vector SVG icons, scalable for all densities
- ⚠️ **Animation Assets**: Some Lottie files exceed 100KB size limit
- ✅ **Font Assets**: Variable fonts used to reduce bundle size
- ✅ **Color Palette**: Optimized for both light and dark themes

#### Technical Asset Performance Validation
- ✅ **API Endpoints**: Response time requirements documented (<2s)
- ✅ **Database Schema**: Indexed for common query patterns
- ✅ **Caching Strategy**: Comprehensive offline-first approach
- ⚠️ **Bundle Size**: JavaScript bundle may exceed 2MB limit
- ✅ **Memory Management**: Proper image loading and disposal patterns

#### Mobile-Specific Validation Results

##### iOS Platform Compatibility
- ✅ **Design Guidelines**: Follows iOS Human Interface Guidelines
- ✅ **App Store Requirements**: All metadata and assets compliant
- ✅ **Device Support**: Optimized for iPhone 12+ and iPad Air+
- ✅ **iOS Features**: HealthKit integration properly documented
- ⚠️ **Privacy Manifest**: Missing required privacy manifest file

##### Android Platform Compatibility
- ✅ **Material Design**: Follows Material Design 3 principles
- ✅ **Play Store Requirements**: All requirements met
- ✅ **Device Support**: Tested on 5+ device configurations
- ✅ **Android Features**: Google Fit integration documented
- ✅ **Permissions**: Minimal permission set requested

### Asset Performance Metrics

#### Loading Performance Impact
- **Critical Path Assets**: 1.2MB (Target: <1.5MB) ✅
- **Above-fold Content**: 800KB (Target: <1MB) ✅
- **Total Asset Bundle**: 15MB (Target: <20MB) ✅
- **Lazy-loaded Assets**: 8MB (Acceptable) ✅

#### Memory Usage Projection
- **Base App Memory**: 45MB (Target: <50MB) ✅
- **Peak Memory Usage**: 180MB (Target: <200MB) ✅
- **Asset Cache Size**: 25MB (Target: <30MB) ✅
- **Background Memory**: 15MB (Target: <20MB) ✅

### Mobile UX Validation

#### Touch Interface Validation
- ✅ **Touch Targets**: All interactive elements ≥44pt
- ✅ **Gesture Support**: Swipe, pinch, and tap gestures documented
- ✅ **Haptic Feedback**: Appropriate haptic responses specified
- ⚠️ **One-handed Use**: Some screens difficult for one-handed operation

#### Accessibility Validation
- ✅ **VoiceOver Support**: All elements have accessibility labels
- ✅ **Dynamic Type**: Text scales properly with system settings
- ✅ **Reduce Motion**: Animation alternatives for motion sensitivity
- ✅ **High Contrast**: Designs work in high contrast mode

### Critical Performance Issues

1. **Animation File Sizes** (High Priority)
   - 3 Lottie files exceed 100KB limit
   - Recommendation: Optimize or replace with CSS animations

2. **Bundle Size Optimization** (Medium Priority)
   - JavaScript bundle approaching 2MB limit
   - Recommendation: Implement code splitting and lazy loading

3. **One-handed Usability** (Medium Priority)
   - Navigation elements too high on large screens
   - Recommendation: Add bottom navigation option

### Performance Optimization Recommendations

#### Immediate Optimizations (Week 1)
1. Compress Lottie animation files to <100KB each
2. Implement code splitting for non-critical features
3. Add iOS privacy manifest file

#### Short-term Optimizations (Week 2-3)
1. Optimize image assets for different screen densities
2. Implement progressive loading for workout data
3. Add one-handed mode toggle option

#### Long-term Performance Strategy
1. Implement advanced caching strategies
2. Add performance monitoring and alerting
3. Create automated asset optimization pipeline

### Mobile Platform Readiness
- **iOS App Store**: 🟡 90% (Missing privacy manifest)
- **Google Play Store**: 🟢 95% (Ready for submission)
- **Performance Targets**: 🟢 92% (Minor optimizations needed)
- **User Experience**: 🟡 88% (Address one-handed use)
- **Overall Mobile Readiness**: 🟡 91% (Address critical issues)
```

### 4. Design System Asset Validation
```markdown
## Asset Validation Report: Enterprise Design System

**Validation Date**: 2024-01-15
**Project**: Multi-brand Design System Library
**Scope**: Web, Mobile, and Desktop Applications
**Brand Coverage**: 3 brands, 12 product lines

### Design System Validation Framework

#### Component Library Validation
- ✅ **Atomic Design Structure**: Proper atoms, molecules, organisms hierarchy
- ✅ **Component Variants**: All states and variations documented
- ✅ **Design Tokens**: Comprehensive token system implemented
- ⚠️ **Component Documentation**: Missing usage guidelines for 15% of components
- ✅ **Accessibility Standards**: All components meet WCAG 2.1 AA

#### Cross-Brand Consistency Validation
- ✅ **Brand A Components**: 45 components, fully documented
- ✅ **Brand B Components**: 42 components, 95% coverage
- ⚠️ **Brand C Components**: 38 components, missing 7 key components
- ✅ **Shared Components**: 30 universal components across all brands
- ✅ **Token Inheritance**: Proper token hierarchy and inheritance

#### Platform Compatibility Matrix
```
Component Type    | Web | iOS | Android | Desktop
------------------|-----|-----|---------|--------
Buttons           | ✅  | ✅  | ✅      | ✅
Forms             | ✅  | ✅  | ✅      | ⚠️
Navigation        | ✅  | ✅  | ✅      | ✅
Data Display      | ✅  | ⚠️  | ⚠️      | ✅
Feedback          | ✅  | ✅  | ✅      | ✅
```

#### Design Token Validation
- ✅ **Color Tokens**: 48 semantic color tokens defined
- ✅ **Typography Tokens**: 12 text styles with responsive scaling
- ✅ **Spacing Tokens**: 8-point grid system implemented
- ✅ **Shadow Tokens**: 5 elevation levels defined
- ⚠️ **Motion Tokens**: Missing animation duration and easing tokens

### Quality Assurance Results

#### Design Consistency Score: 94/100
- Color usage consistency: 98%
- Typography consistency: 95%
- Spacing consistency: 92%
- Component usage: 90%

#### Documentation Quality Score: 87/100
- Component documentation: 85%
- Usage examples: 90%
- Code snippets: 85%
- Design rationale: 88%

#### Technical Implementation Score: 91/100
- Code quality: 95%
- Performance impact: 88%
- Accessibility compliance: 92%
- Browser compatibility: 90%

### Critical Design System Issues

1. **Missing Brand C Components** (High Priority)
   - 7 key components not adapted for Brand C
   - Blocks Brand C product development

2. **Incomplete Component Documentation** (Medium Priority)
   - 15% of components lack usage guidelines
   - Impacts developer adoption and consistency

3. **Missing Motion Tokens** (Medium Priority)
   - No standardized animation system
   - Inconsistent motion across products

4. **Desktop Form Components** (Low Priority)
   - Desktop-specific form patterns need refinement
   - Minor usability improvements needed

### Design System Recommendations

#### Immediate Actions (Week 1)
1. Create missing Brand C component variants
2. Complete documentation for undocumented components
3. Define motion token system and animation standards

#### System Improvements (Week 2-4)
1. Refine desktop form component patterns
2. Add advanced component composition examples
3. Create comprehensive migration guide for existing products

#### Long-term Strategy
1. Implement automated design token synchronization
2. Create design system governance process
3. Develop component usage analytics and monitoring

### Design System Maturity Assessment
- **Component Coverage**: 🟡 92% (Missing Brand C components)
- **Documentation Quality**: 🟡 87% (Good but needs completion)
- **Technical Implementation**: 🟢 91% (Strong technical foundation)
- **Adoption Readiness**: 🟡 89% (Ready after critical fixes)
- **Overall System Maturity**: 🟡 90% (Near production-ready)
```

### 5. API Documentation Asset Validation
```markdown
## Asset Validation Report: RESTful API Documentation

**Validation Date**: 2024-01-15
**Project**: Customer Management API v2.0
**Documentation Standard**: OpenAPI 3.0
**Target Audience**: External developers, internal teams

### API Documentation Validation

#### OpenAPI Specification Validation
- ✅ **Syntax Validation**: Valid OpenAPI 3.0 specification
- ✅ **Schema Definitions**: All data models properly defined
- ✅ **Endpoint Coverage**: 47 endpoints fully documented
- ⚠️ **Error Responses**: Missing error schemas for 12 endpoints
- ✅ **Authentication**: OAuth 2.0 flows properly documented
- ⚠️ **Rate Limiting**: Missing rate limit documentation

#### Documentation Completeness Analysis
- ✅ **Request Examples**: All endpoints have example requests
- ✅ **Response Examples**: Success responses documented
- ⚠️ **Error Examples**: Missing error response examples
- ✅ **Parameter Descriptions**: All parameters clearly described
- ✅ **Use Case Scenarios**: Common workflows documented
- ⚠️ **SDK Examples**: Missing code examples in popular languages

#### Technical Accuracy Validation
- ✅ **Endpoint URLs**: All URLs tested and verified
- ✅ **HTTP Methods**: Correct methods for all operations
- ✅ **Status Codes**: Appropriate status codes documented
- ✅ **Content Types**: Proper content-type headers specified
- ⚠️ **Versioning Strategy**: Unclear API versioning approach
- ✅ **Deprecation Notices**: Legacy endpoints properly marked

### API Quality Metrics

#### Documentation Quality Score: 85/100
- Completeness: 82%
- Accuracy: 95%
- Clarity: 88%
- Examples: 80%

#### Developer Experience Score: 78/100
- Ease of understanding: 85%
- Code examples: 70%
- Error handling: 75%
- Getting started guide: 85%

#### Technical Quality Score: 92/100
- Specification validity: 98%
- Schema accuracy: 95%
- Endpoint coverage: 90%
- Security documentation: 85%

### Critical Documentation Issues

1. **Missing Error Documentation** (High Priority)
   - 12 endpoints lack error response schemas
   - Developers cannot handle errors properly

2. **Incomplete SDK Examples** (High Priority)
   - Missing code examples in JavaScript, Python, PHP
   - Reduces developer adoption and integration speed

3. **Unclear Versioning Strategy** (Medium Priority)
   - API versioning approach not clearly documented
   - May cause confusion during API evolution

4. **Missing Rate Limit Documentation** (Medium Priority)
   - Rate limiting rules not documented
   - Developers may hit limits unexpectedly

### API Documentation Recommendations

#### Immediate Fixes (Week 1)
1. Add error response schemas for all endpoints
2. Create comprehensive error handling guide
3. Document API versioning strategy and migration paths

#### Developer Experience Improvements (Week 2-3)
1. Add SDK examples in JavaScript, Python, and PHP
2. Create interactive API explorer/playground
3. Add rate limiting documentation with examples

#### Long-term Documentation Strategy
1. Implement automated documentation testing
2. Create developer onboarding tutorial series
3. Add community feedback and contribution process

### API Documentation Readiness
- **Technical Accuracy**: 🟢 92% (High accuracy, minor gaps)
- **Developer Usability**: 🟡 78% (Good but needs examples)
- **Completeness**: 🟡 82% (Missing critical error docs)
- **Production Readiness**: 🟡 85% (Ready after critical fixes)
- **Overall Documentation Quality**: 🟡 84% (Good foundation, needs polish)
```

## Overview
- ✅ Format Compatibility: All formats supported by development tools
- ⚠️ Resolution Issues: Some images may need higher resolution for mobile
- ✅ Integration Readiness: Assets work together cohesively

**Validation Report**:
# Asset Validation Report

## Summary
- Total assets validated: 10
- Passed validation: 8
- Issues identified: 2
- Overall status: Ready with minor fixes needed

## Issues and Recommendations
1. **Missing Error Handling Requirements**
   - Impact: Medium
   - Recommendation: Add error handling section to requirements.md
   - Timeline: Before specification generation

2. **Image Resolution Concerns**
   - Impact: Low
   - Recommendation: Provide higher resolution versions for mobile
   - Timeline: Before implementation phase

## Validation Status
- **Ready for Specification Generation**: Yes (with noted fixes)
- **Ready for Implementation**: No (address issues first)
```

### Quick Validation Example
```markdown
## Quick Asset Check

**Usage**: #[[module:asset-management/asset-validator.md|mode=quick]]

**Process**:
1. Basic file accessibility check
2. Format validation only
3. Quick completeness assessment

**Output**: Pass/fail status with critical issues only
```

## Core Functionality

### Asset Validation Prompt
```
You are an asset quality assurance specialist. Your task is to validate that all organized assets meet quality standards and are suitable for use in specification generation and implementation.

**Validation Process:**
1. **File Format Validation**:
   - Verify file formats are supported and accessible
   - Check file integrity and readability
   - Validate file size and resolution appropriateness
   - Ensure files are not corrupted or incomplete

2. **Content Quality Assessment**:
   - Evaluate completeness of information in each asset
   - Check for missing or placeholder content
   - Assess clarity and usability of designs and specifications
   - Verify data samples are realistic and comprehensive

3. **Compatibility Validation**:
   - Ensure assets are compatible with target platforms
   - Check for format compatibility across different systems
   - Validate that assets support required use cases
   - Verify assets work well together as a cohesive set

4. **Completeness Analysis**:
   - Identify gaps in asset coverage
   - Check for missing assets that would be needed
   - Validate that asset relationships are complete
   - Ensure sufficient detail for implementation

**Validation Report Format:**

```markdown
# Asset Validation Report

## Validation Summary
- **Total assets validated**: [count]
- **Assets passed validation**: [count]
- **Assets with warnings**: [count]
- **Assets requiring attention**: [count]
- **Critical issues found**: [count]

## Validation Results by Category

### Designs ([count] assets)

#### ✅ Passed Validation
- **`[asset-name]`**: High-quality wireframe, clear layout, appropriate resolution
- **`[asset-name]`**: Complete mockup, consistent styling, all states shown
- [list all assets that passed validation]

#### ⚠️ Warnings
- **`[asset-name]`**: Good quality but missing some interaction states
  - **Issue**: Missing hover/active states for buttons
  - **Impact**: May need additional design work during implementation
  - **Recommendation**: Add interaction state designs or use standard patterns

#### ❌ Requires Attention
- **`[asset-name]`**: Low resolution image, text not readable
  - **Issue**: Image resolution too low for implementation use
  - **Impact**: Cannot be used for high-fidelity implementation
  - **Recommendation**: Provide higher resolution version or vector format

### Specifications ([count] assets)

#### ✅ Passed Validation
- **`[asset-name]`**: Complete requirements document, clear acceptance criteria
- **`[asset-name]`**: Comprehensive API specification, all endpoints documented
- [list all assets that passed validation]

#### ⚠️ Warnings
- **`[asset-name]`**: Good API spec but missing error response examples
  - **Issue**: Error handling scenarios not fully documented
  - **Impact**: May need additional specification during implementation
  - **Recommendation**: Add error response examples and edge cases

#### ❌ Requires Attention
- **`[asset-name]`**: Incomplete requirements document
  - **Issue**: Missing acceptance criteria for several user stories
  - **Impact**: Cannot generate complete implementation specifications
  - **Recommendation**: Complete missing acceptance criteria or provide additional detail

### Data Samples ([count] assets)

#### ✅ Passed Validation
- **`[asset-name]`**: Complete database schema, all relationships defined
- **`[asset-name]`**: Realistic sample data, covers edge cases
- [list all assets that passed validation]

#### ⚠️ Warnings
- **`[asset-name]`**: Good sample data but limited variety
  - **Issue**: Sample data doesn't cover all possible scenarios
  - **Impact**: May miss edge cases during implementation
  - **Recommendation**: Add more diverse sample data or edge case examples

#### ❌ Requires Attention
- **`[asset-name]`**: Schema file has syntax errors
  - **Issue**: JSON schema contains invalid syntax
  - **Impact**: Cannot be used for data model generation
  - **Recommendation**: Fix syntax errors and validate schema format

### Assets ([count] assets)

#### ✅ Passed Validation
- **`[asset-name]`**: High-quality logo, multiple formats available
- **`[asset-name]`**: Complete font family, all weights included
- [list all assets that passed validation]

#### ⚠️ Warnings
- **`[asset-name]`**: Logo available but only in one format
  - **Issue**: Only PNG format available, no vector version
  - **Impact**: May have scaling issues on different platforms
  - **Recommendation**: Provide SVG or other vector format if possible

#### ❌ Requires Attention
- **`[asset-name]`**: Font file corrupted or incomplete
  - **Issue**: Font file cannot be loaded or is missing characters
  - **Impact**: Cannot be used for typography in implementation
  - **Recommendation**: Provide working font file or alternative

## Cross-Asset Validation

### Relationship Consistency
- **Design → Specification Alignment**: ✅ Designs match documented requirements
- **Data Model Consistency**: ⚠️ Some API specs don't match data schemas
- **Brand Asset Coherence**: ✅ All brand assets follow consistent style

### Coverage Analysis
- **Feature Coverage**: ✅ All major features have supporting assets
- **Platform Coverage**: ⚠️ Missing mobile-specific design assets
- **Use Case Coverage**: ✅ All documented use cases have supporting materials

### Quality Standards Compliance
- **File Format Standards**: ✅ All files in supported formats
- **Naming Convention Compliance**: ✅ All files follow naming standards
- **Resolution/Quality Standards**: ⚠️ Some images below recommended resolution

## Gap Analysis

### Missing Assets Identified
1. **Mobile Design Variations**
   - **Gap**: Web designs provided but no mobile-specific layouts
   - **Impact**: Will need to adapt web designs for mobile implementation
   - **Recommendation**: Create mobile-specific wireframes and mockups

2. **Error State Designs**
   - **Gap**: Happy path designs provided but no error state designs
   - **Impact**: Error handling UI will need to be designed during implementation
   - **Recommendation**: Add error state and empty state designs

3. **API Authentication Specification**
   - **Gap**: API endpoints documented but authentication flow not specified
   - **Impact**: Authentication implementation will need additional specification
   - **Recommendation**: Add authentication and authorization documentation

### Recommended Additions
1. **Style Guide Documentation**
   - Add comprehensive style guide covering typography, colors, spacing
   - Include component usage guidelines and design patterns

2. **Additional Sample Data**
   - Provide more diverse and comprehensive sample datasets
   - Include edge cases and error scenarios in sample data

3. **Integration Examples**
   - Add examples showing how different assets work together
   - Provide integration patterns and usage guidelines

## Quality Improvement Recommendations

### Immediate Actions Required
1. **Fix Critical Issues**: Address all assets marked as "Requires Attention"
2. **Resolve Format Issues**: Convert or replace assets with format problems
3. **Complete Missing Information**: Fill in gaps in specifications and requirements

### Quality Enhancement Suggestions
1. **Standardize Resolutions**: Ensure all images meet minimum resolution requirements
2. **Add Vector Formats**: Provide vector versions of logos and icons where possible
3. **Enhance Documentation**: Add more detailed descriptions and usage guidelines

### Long-term Improvements
1. **Establish Asset Guidelines**: Create standards for future asset submissions
2. **Implement Quality Gates**: Set up validation checkpoints for new assets
3. **Create Asset Templates**: Provide templates for consistent asset creation

## Validation Criteria Reference

### File Format Requirements
- **Images**: PNG, JPG, SVG preferred; minimum 300 DPI for print, 72 DPI for web
- **Documents**: PDF, Markdown, or common office formats
- **Data**: JSON, CSV, YAML, or SQL formats
- **Fonts**: TTF, OTF, or WOFF formats

### Content Quality Standards
- **Completeness**: All required information present and accessible
- **Clarity**: Content is clear, readable, and understandable
- **Consistency**: Consistent style, format, and quality across related assets
- **Accuracy**: Information is accurate and up-to-date

### Technical Requirements
- **Accessibility**: Files can be opened and processed by standard tools
- **Compatibility**: Formats compatible with target platforms and tools
- **Performance**: File sizes appropriate for intended use
- **Standards Compliance**: Files follow relevant industry standards

---

*This validation report should be reviewed and any critical issues should be addressed before proceeding with specification generation. Assets with warnings can be used but may require additional work during implementation.*
```

**Validation Checklist:**
- All files are accessible and not corrupted
- File formats are appropriate for intended use
- Content is complete and sufficient for implementation
- Assets work together as a cohesive set
- No critical gaps that would block specification generation
- Quality meets minimum standards for professional implementation
```

### File Type Specific Validation Rules
```
**Design File Validation:**

**Wireframes:**
- Must be readable and show clear layout structure
- Should include navigation and user flow indicators
- Text should be legible (even if placeholder)
- Interactive elements should be clearly indicated

**Mockups:**
- Must be high enough resolution for implementation reference
- Should show realistic content, not just placeholder text
- Colors and typography should be clearly defined
- Interactive states (hover, active, disabled) preferred but not required

**Prototypes:**
- Must be accessible in common formats or tools
- Should demonstrate key user interactions
- Navigation flow should be clear and complete
- Performance should be smooth enough for review

**Specification File Validation:**

**Requirements Documents:**
- Must include clear user stories or use cases
- Should have measurable acceptance criteria
- Business rules should be clearly stated
- Scope and constraints should be defined

**API Documentation:**
- Must include endpoint definitions and methods
- Should have request/response examples
- Authentication and authorization should be documented
- Error responses should be specified

**Technical Specifications:**
- Must include architecture or system design information
- Should specify technology requirements and constraints
- Integration points should be clearly defined
- Performance and scalability requirements should be stated

**Data File Validation:**

**Schemas:**
- Must be valid syntax for the specified format (JSON Schema, SQL, etc.)
- Should include all required fields and relationships
- Data types and constraints should be clearly defined
- Validation rules should be specified where applicable

**Sample Data:**
- Must be realistic and representative of actual use cases
- Should include variety in data values and scenarios
- Edge cases and boundary conditions should be represented
- Data should be clean and properly formatted

**Asset File Validation:**

**Brand Assets:**
- Must be high enough quality for professional use
- Should be provided in multiple formats when possible
- Usage guidelines should be included or clearly implied
- Consistency across brand asset family should be maintained

**Media Files:**
- Must be in widely supported formats
- Should be optimized for intended use (web, print, mobile)
- Quality should be appropriate for professional implementation
- Metadata and usage rights should be clear
```

## Usage Instructions

**Complete Asset Validation:**
```markdown
#[[module:asset-management/asset-validator.md]]
```

**Category-Specific Validation:**
```markdown
#[[module:asset-management/asset-validator.md|category=designs]]
#[[module:asset-management/asset-validator.md|category=specifications]]
```

**Parameters:**
- `category`: Focus validation on specific category (designs, specifications, data, assets, all)
- `strict`: Apply strict quality standards (true/false)
- `detailed`: Include detailed quality analysis (true/false)
- `recommendations`: Include improvement recommendations (true/false)

## Integration Points
- Requires organized assets from `asset-organizer.md`
- Uses relationship data from `provenance-tracker.md`
- Provides quality assurance for `mapping-generator.md`
- Feeds validation results into specification generation quality gates
