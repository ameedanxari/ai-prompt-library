# Stages

## Purpose
Stage-specific prompt collections that guide the sequential workflow from initial requirements gathering through project handoff.

## Instructions
1. Execute stages sequentially, starting with stage-01-intake
2. Complete each stage before moving to the next
3. Use dry-run mode to validate outputs before full generation
4. Review stage outputs and iterate as needed before proceeding

## Examples
```markdown
## Example: Running the Stage Pipeline
# Start with intake
./run-stage.sh stage-01-intake

# Validate with dry-run before proceeding
./run-stage.sh stage-02-charter --dry-run

# Continue through remaining stages
./run-stage.sh stage-02-charter
./run-stage.sh stage-03-architecture
# ... continue through stage-10-handoff

## Example: Platform-Specific Stage Execution
# For mobile projects, use platform-specific variants
./run-stage.sh stage-05-testing --platform=mobile
./run-stage.sh stage-06-implementation --platform=react-native
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
Stages are executed sequentially using the stage pipeline:
```bash
./run-stage.sh stage-01-intake
./run-stage.sh stage-02-charter
# ... continue through all stages
```

Each stage supports dry-run mode for validation:
```bash
./run-stage.sh stage-01-intake --dry-run
```
