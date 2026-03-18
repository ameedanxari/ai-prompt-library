# Stages

## Purpose
Stage-specific prompt collections that guide the sequential workflow from initial requirements gathering through project handoff.

## Instructions
1. Execute stages sequentially, starting with stage-01-intake
2. Complete each stage before moving to the next
3. Use dry-run mode to validate outputs before full generation
4. Review stage outputs and iterate as needed before proceeding
5. Log prompt composition for every stage in `prompts/outputs/specifications/prompt-usage-log.md`
6. Do not complete stages with mock-only integration paths unless replacement tasks are recorded

## Examples
```markdown
## Example: Running the Stage Pipeline

Tell your AI assistant:
"Process my project through Stage 01 - Intake using the templates in 
.ai-prompts/prompts/stages/stage-01-intake/"

After each stage completes, continue with:
"Continue to Stage 02 - Charter"
"Continue to Stage 03 - Architecture"
# ... and so on through Stage 10

## Example: Platform-Specific Processing

For mobile-focused projects:
"Process Stage 05 - Testing with focus on mobile platform using 
.ai-prompts/prompts/stages/stage-05-testing/mobile.md"

For web-focused projects:
"Process Stage 06 - Implementation for web platform using
.ai-prompts/prompts/stages/stage-06-implementation/web.md"
```

## Stage Pipeline

The stages are designed to be executed sequentially, with each stage building upon the outputs of previous stages.

### Stage 01: Intake
[stage-01-intake/README.md](./stage-01-intake/README.md)
- Initial requirements gathering
- User brief processing
- Asset identification

### Stage 02: Charter
[stage-02-charter/README.md](./stage-02-charter/README.md)
- Project charter creation
- Scope definition
- Stakeholder alignment

### Stage 03: Architecture
[stage-03-architecture/README.md](./stage-03-architecture/README.md)
- System architecture design
- Technology stack selection
- Component structure

### Stage 04: Features
[stage-04-features/README.md](./stage-04-features/README.md)
- Feature specifications
- User story creation
- Acceptance criteria

### Stage 05: Testing
[stage-05-testing/README.md](./stage-05-testing/README.md)
- Testing strategy definition
- Test case generation
- Quality metrics

### Stage 06: Implementation
[stage-06-implementation/README.md](./stage-06-implementation/README.md)
- Implementation planning
- Task breakdown
- Development guidelines

### Stage 07: Deployment
[stage-07-deployment/README.md](./stage-07-deployment/README.md)
- Deployment configuration
- Infrastructure setup
- CI/CD pipeline

### Stage 08: Documentation
[stage-08-documentation/README.md](./stage-08-documentation/README.md)
- Documentation generation
- API documentation
- User guides

### Stage 09: Quality
[stage-09-quality/README.md](./stage-09-quality/README.md)
- Quality assurance
- Code review guidelines
- Performance validation

### Stage 10: Handoff
[stage-10-handoff/README.md](./stage-10-handoff/README.md)
- Project handoff
- Knowledge transfer
- Maintenance guidelines

## Usage

Tell your AI assistant to process stages sequentially:

```
Process my project through Stage 01 - Intake, then continue through all stages.
```

For individual stage processing:
```
Process Stage 03 - Architecture using the templates in 
.ai-prompts/prompts/stages/stage-03-architecture/
```

For dry-run validation before full generation:
```
Do a dry-run of Stage 04 - Features to validate the approach before full generation.
```


## Templates

This module includes the following templates:
