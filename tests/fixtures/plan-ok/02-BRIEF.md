# Product brief

## Requirements

### Ledger

| ID | Requirement | Type | Priority | Phase / milestone | Source locator(s) |
|---|---|---|---|---|---|
| R-001 | The tool shall publish daily usage per site and meter. | functional | must | R1 | S-01 §2 |
| R-002 | The tool shall reject a conflicting duplicate reading and keep the last good ledger. | functional | must | R1 | S-01 §3 |
| R-003 | The tool should print counts to stderr. | functional | should | R1 | S-01 §4 |

## Assumption register

| ID | Gap | Default chosen | Why | Impact if wrong | Owner may override? |
|---|---|---|---|---|---|
| A-001 | Output file name | `ledger.json` | Conventional | Rename only | Yes |
