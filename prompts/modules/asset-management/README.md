# Asset Management Modules

## Purpose
Reusable modules for processing, organizing, and referencing user-provided assets throughout the specification generation process.

## Instructions
Use these modules to systematically process user-provided assets from the working_copy directory. Start with asset-scanner.md to identify and categorize assets, then use appropriate processor modules based on asset types found. Always maintain provenance tracking and generate mapping documentation.

## Examples
```markdown
## Example Asset Processing Workflow

### Input Assets in working_copy/
- designs/app-mockups.figma
- specifications/requirements.pdf
- assets/logo.svg
- data-samples/user-data.json

### Processing Steps
1. **Scan Assets**: Use asset-scanner.md to identify 4 assets across 4 categories
2. **Process by Type**: 
   - design-processor.md for app-mockups.figma
   - spec-processor.md for requirements.pdf
   - brand-processor.md for logo.svg
   - data-processor.md for user-data.json
3. **Generate Mapping**: Create documentation showing original → organized locations
4. **Validate**: Ensure all assets are accessible and properly referenced

### Result
- Organized asset structure with clear provenance
- Integration points identified for specification generation
- Asset references ready for use in stage templates
```

## Available Modules

### Core Asset Processing
- [asset-scanner.md](./asset-scanner.md) - Scan and categorize files in working_copy
- [asset-organizer.md](./asset-organizer.md) - Reorganize assets into standardized structure
- [provenance-tracker.md](./provenance-tracker.md) - Maintain asset origin and modification tracking
- [mapping-generator.md](./mapping-generator.md) - Create documentation mapping original to new locations

### Asset Type Handlers
- [file-type-processor.md](./file-type-processor.md) - Process various file types

### Templates

This module includes the following templates:

## Integration Modules
- [asset-validator.md](./asset-validator.md) - Validate asset completeness and quality

### Related Modules
- [Testing Modules](../testing/README.md) - Mock data and testing integration
- [Feature Patterns](../feature-patterns/README.md) - Common feature templates

## Usage Pattern
```markdown
#[[module:asset-management/asset-scanner.md]]
#[[module:asset-management/design-processor.md|platform={{target_platform}}]]
```