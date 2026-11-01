# Stage 1 — Inventory the sources

Goal: know exactly what you have, which document wins when they disagree, and where they disagree, before anyone interprets requirements.

## Steps

1. **List every supplied file.** Read each one completely. For binary formats, extract the text first (for example `pdftotext -layout`, `textutil -convert txt` or `pandoc` for Word, a short script for spreadsheets). Images: note what they show. If a file cannot be read, say so in the table; do not guess its content.
2. **Find duplicates and editions.** A Markdown reading copy of a Word file, an HTML and a DOCX of the same report, version 1 and version 2 of an agreement. Confirm by content, not file name. Read duplicates once; for editions, note which is newer and what changed in material terms.
3. **Classify each source** by kind:
   - *owner decision*: an explicit, dated choice by the project owner or client
   - *contract*: a signed or agreed commercial document
   - *plan of record*: the proposal or specification the parties adopted
   - *analysis*: audits, research, strategy
   - *pitch or draft*: decks, unsigned drafts, superseded proposals
   - *current system*: descriptions of software that already exists
   - *prior plan*: earlier planning output. Treat as reference only, unless an owner decision adopts it.
4. **Set the authority order.** Default order, highest first: later explicit owner decision → contract → plan of record → analysis → current-system description → pitch or draft → prior plan. Within a kind, newer wins. Adjust only if a source itself states precedence (for example "the signed SOW governs"); cite that clause.
5. **Find contradictions.** Compare the sources on scope (included, excluded, deferred), phases and milestones, prices and payment terms, dates and windows, roles and actors, platforms and hosts, markets and regions, data and migration, and naming. Look hardest at what the contract includes versus what the plan excludes, and at labels that mean different things in different documents. For each contradiction record both sides with locators and the resolution under the authority order. When the resolution overrides a signed contract, mark it **needs written confirmation**.
6. **Note what is missing**: inputs the sources say the client will supply, decisions they say are still open, and referenced documents that were not supplied.

## Output: `plan/01-SOURCES.md`

```markdown
# Sources

## Source table
| ID | File | Kind | Date / edition | Authority rank | Read | What it covers (one line) |

## Duplicates and editions
| Sources | Relationship | Material differences |

## Authority order
Ordered list with a one-line basis for each position, citing any precedence clause.

## Contradictions
| ID | Topic | Source A says (locator) | Source B says (locator) | Resolution | Basis | Needs written confirmation? |

## Missing inputs and open decisions
| Item | Where the sources mention it | Who supplies it | What it affects |

## Reading notes
Anything a later stage must know that does not fit above: a label trap, a renamed concept, a current system that keeps running, a market or region nuance.
```

## Self-check

- Every supplied file appears in the source table exactly once, and is marked read or unreadable.
- Every *owner decision* and *contract* source has been compared against the plan of record, clause by clause, for scope, money and dates.
- Every contradiction has locators on both sides and a resolution.
- No requirement interpretation or design appears in this file. That belongs to later stages.
