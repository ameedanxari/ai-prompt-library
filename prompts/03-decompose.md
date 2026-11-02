# Stage 3 — Architecture and modules

Goal: a technical design and a module breakdown that together cover every requirement, so each module can then be detailed on its own.

Read `plan/02-BRIEF.md` and `plan/01-SOURCES.md`. Go back to a source only to check a cited locator or a technical detail the brief summarizes.

Length budget: about 3,000–6,000 words across both files. Decide here what later stages need to stay consistent (stack, entities, ownership, access rules, state machines, shared conventions); leave field-level detail to stage 4.

## Steps

1. **Choose the architecture.** Use what the sources specify. Where they are silent, choose the conventional default for this kind of product and team, and add it to the assumption register in `02-BRIEF.md`. Cover:
   - stack per layer
   - system context: users, the system, external services
   - environments and the deployment path
   - repository layout
2. **Model the data.** List each entity with key fields, relationships and ownership: which role or tenant owns each row. Draw state machines for every entity with a lifecycle, including invalid transitions and who may perform each transition. Add only the fields the requirements need, plus the seams later phases depend on.
3. **Set the cross-cutting design**:
   - authentication and authorization (roles, tenancy, where access is enforced)
   - security and privacy controls
   - error handling
   - audit logging
   - observability
   - configuration and feature flags
   - testing strategy (which layer is tested how)
   - CI/CD and migrations
4. **Record the key decisions** as short ADRs: the decision, the alternatives considered, why, and the source or assumption it rests on.
5. **Split the work into modules.** A module is a cohesive business capability or platform piece that one developer could own: typically 16–80 hours of work, with clear data ownership and interfaces. Usually:
   - one foundation module (project setup, environments, CI/CD, auth plumbing, base schema, design system shell)
   - one module per core workflow or capability
   - modules for admin and operations, the public site, notifications, and analytics where the brief has them
   - a release and handover module

   Do not make a module per technical layer.
6. **Map every requirement to modules.** Each requirement has exactly one owning module, plus any contributing modules. If a requirement fits nowhere, the split is wrong; fix the split.
7. **Order the build.** Show the dependency order and check it against the milestones in the brief: every requirement due at a milestone must have its owning module, and that module's dependencies, scheduled by then.

## Output: `plan/03-ARCHITECTURE.md`

```markdown
# Architecture
## Stack
| Layer | Choice | Source or assumption |
## System context
## Environments and deployment
## Repository layout
## Data model
| ID | Entity | Key fields | Relationships | Owned by / access |
### State machines
## Cross-cutting design
### Authentication and authorization
### Security and privacy
### Errors, audit, observability
### Configuration and feature flags
### Testing strategy
### CI/CD and migrations
## Decisions
| ID | Decision | Alternatives | Why | Source or assumption |
## Seams for later phases
```

## Output: `plan/03-MODULES.md`

```markdown
# Modules
| ID | Module | Purpose | Owns entities | Interfaces it exposes | Depends on | First milestone |

## Requirement map
| Requirement | Owning module | Contributing modules |

## Build order
Ordered list or dependency diagram, with each milestone marked and what is usable at it.
```

## Self-check

- Every `R-###` in the brief appears in the requirement map with exactly one owner.
- Every module owns at least one requirement, or is foundation/enabler with a reason.
- The module dependency graph has no cycles.
- Every entity has an owning module and an access rule. Every state machine names who may make each transition.
- Each milestone's requirements are reachable by that milestone in the build order.
- Nothing excluded or deferred in the brief appears as module work. Its seams appear under "Seams for later phases".
