# Stage 2 — Understand the product and write the requirements

Goal: one brief that says what is being built, for whom, in what phases, and every requirement it must meet, each traceable to a source, with every gap filled by a stated default.

Read `plan/01-SOURCES.md` first and apply its authority order and contradiction resolutions. Then read the sources themselves, highest authority first.

Length budget: about 5,000–10,000 words. The brief says what the product must do; how it is built belongs to stages 3 and 4.

## Steps

1. **Summarize the product**: the problem, the users, the value, and what success looks like in the sources' own metrics.
2. **Name the actors**: user roles, staff roles and external systems, each with what it may and may not do.
3. **Capture the delivery shape**: phases or releases, milestones with their dates, payment or acceptance triggers, acceptance windows, budget and hour envelopes (as forecasts), and what later phases must be able to build on.
4. **Draw the scope line**: what is in, what is out, and what is deferred. Cite each item.
5. **Write the requirements.** Go through the sources section by section, highest authority first. Every obligation becomes one or more requirements. Rules:
   - one testable behaviour or constraint per requirement, written as "The system/staff/team shall …"
   - describe observable behaviour and constraints, not implementation: no table, function or library names unless a source mandates them. A prior plan's design detail is input to stage 3, not a requirement (see the rules)
   - keep the qualifiers: quantities, thresholds, states and transitions, roles, regions, timing, error and recovery behaviour
   - type: `functional`, `non-functional`, `security-privacy`, `operational` (deployment, backup, monitoring, handover), `delivery` (milestones, acceptance, documentation) or `enabler`
   - priority: `must` or `should`. The phase or milestone where it is due comes from the sources, or is assumed and recorded.
   - owner decisions, contract terms and audit recommendations that constrain the build are requirements too
   - deferred items are not requirements. List them under scope out, with the seam this phase must leave.
6. **Fill the gaps.** For every behaviour a working product needs but the sources leave open, choose the most reasonable default for this kind of product. Record it as an assumption, and as an enabler requirement if work follows from it. Typical gaps: account lifecycle, validation rules, empty and error states, notification triggers, limits, data retention, environments.
7. **List owner questions** only for material contradictions you could not resolve with the authority order. Give each the default you are proceeding with.

## Output: `plan/02-BRIEF.md`

```markdown
# Product brief

## Product summary
## Actors and permissions
| Actor | Can | Cannot | Source |

## Delivery shape
| Phase / milestone | Due | What must be true | Acceptance / payment trigger | Source |
Budget and hour envelopes (forecast only): …
Later phases this build must support: …

## Scope
### In
### Out or deferred (with the seam to leave)

## Requirements
### <Area>
| ID | Requirement | Type | Priority | Phase / milestone | Source locator(s) |

## Assumption register
| ID | Gap | Default chosen | Why | Impact if wrong | Owner may override? |

## Owner questions
| ID | Contradiction | Proceeding with | Decide by |

## Success metrics
| Metric | Target | Source |

## Source coverage
| Source section | Requirement IDs, or "excluded: reason", or "context only" |
```

Group requirements by product area: accounts, the core entities, each workflow, admin and operations, public site, notifications, analytics, security and privacy, quality and delivery.

## Self-check

- **Coverage, both directions.** Every material section of every *owner decision*, *contract* and *plan of record* source appears in Source coverage. Every requirement cites at least one source or is an enabler with a reason.
- **Named mechanisms kept.** Every mechanism a contract, owner decision or plan of record names (for example a working unsubscribe, a restore drill, an audit trail) has a requirement or an explicit exclusion with its reason.
- **Contradictions applied.** Every resolution in `01-SOURCES.md` is reflected: nothing excluded by a resolution appears as a requirement.
- **Checkable.** Pick five requirements at random and ask: could a tester write a pass/fail test from this line alone? Rewrite any that fail.
- **No blocking.** Nothing says "TBD", "to be confirmed" or "pending" without a default next to it.
