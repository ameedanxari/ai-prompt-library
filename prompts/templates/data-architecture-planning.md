# Data Architecture Planning Template

## Purpose
Define a concrete database and migration strategy early enough to drive feature and implementation planning.

## Required Output
Generate `prompts/outputs/specifications/data-architecture.md` with:
- Primary database choice and rationale
- Data ownership boundaries
- Core entity model summary
- Migration strategy and tooling
- Backup/retention + restore targets (RPO/RTO)
- Local/staging/prod environment differences

## Guardrails
- No unresolved `TBD` for primary database.
- No feature planning without data ownership mapping.
- If multiple data stores exist, document consistency strategy.
