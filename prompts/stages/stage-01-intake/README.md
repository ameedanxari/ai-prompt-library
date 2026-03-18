# Stage 01 - Intake

## Purpose
Process user input, validate requirements, and organize reference assets into a standardized structure.

## Instructions
Execute this stage to process the user's project brief and any provided assets. Validate the brief for completeness, organize assets into the working_copy structure, and generate platform-specific intake files. This stage establishes the foundation for all subsequent stages.

## Examples
```markdown
## Example Stage 01 Execution

### Input
**User Brief**: "A task management app for remote teams with offline sync"
**Assets**: working_copy/designs/wireframes.pdf, working_copy/assets/logo.png
**Platforms**: Web + Mobile (React Native)

### Processing
1. **Brief Validation**: ✅ Sufficient detail for specification generation
2. **Asset Processing**: 
   - Wireframes → working_copy/designs/ui-wireframes/
   - Logo → working_copy/assets/branding/
3. **Platform Analysis**: Web (Next.js) + Mobile (React Native) recommended

### Outputs Generated
- `platform-agnostic.md`: Core requirements, asset inventory, technology decisions
- `web.md`: Web-specific considerations, SSR strategy, PWA features
- `mobile.md`: React Native setup, offline storage, push notifications
- Asset mapping documentation with provenance tracking

### Result
Foundation established for Stage 02 - Charter with validated requirements and organized assets.
```

## Inputs
- User input template (filled)
- Reference assets in `working_copy/`
- Token usage level preference

## Outputs
- `platform-agnostic.md` - Core project requirements and scope
- `web.md` - Web-specific intake considerations (if applicable)
- `mobile.md` - Mobile-specific intake considerations (if applicable)
- Asset mapping documentation
- Design-system foundation + component catalog
- Prompt selection manifest + prompt usage log
- Integration contracts
- Initial project configuration

For UI scope projects, generate design-system outputs using:
- `prompts/templates/design-system-foundation-template.md`
- `prompts/templates/design-system-component-catalog-template.md`

## Prerequisites
- User has filled out the input template
- Any reference assets are available

## Next Stage
Stage 02 - Charter (Project scope and goals definition)

## Templates

This module includes the following templates:
