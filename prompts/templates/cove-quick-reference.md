# COVE Quick Reference Guide

## What is COVE?

**Chain-of-Verification (COVE)** is a four-step self-verification process that reduces AI hallucinations by 40%.

## The Four Steps

```
1. DRAFT → 2. VERIFY → 3. ANSWER → 4. FINALIZE
```

### Step 1: Draft Initial Response
Generate your output without self-censoring.

### Step 2: Plan Verification Questions
Ask yourself:
- What factual claims did I make?
- What assumptions did I include?
- What could be incorrect?
- What did I miss?

### Step 3: Answer Independently
Answer questions WITHOUT looking at your draft (prevents confirmation bias).

### Step 4: Generate Final Verified Response
Synthesize verified information with confidence indicators.

## Quick Templates

### For Specifications

```markdown
## Step 1: Draft Specification
[Generate initial spec]

## Step 2: Verification Questions
1. Are all requirements captured?
2. Are technical details accurate?
3. Are there security issues?
4. What edge cases are missing?

## Step 3: Independent Verification
[Answer each question without referencing draft]

## Step 4: Final Verified Specification
✅ Verified: [List]
⚠️ Modified: [List]
📝 Added: [List]
[Final spec with corrections]
```

### For Code

```markdown
## Step 1: Draft Code
```language
[Initial code]
```

## Step 2: Verification Questions
1. Does this solve the problem correctly?
2. Are there security vulnerabilities?
3. What edge cases are missing?
4. Are APIs used correctly?

## Step 3: Independent Verification
[Test each aspect without looking at code]

## Step 4: Final Verified Code
```language
[Corrected code]
```
✅ Verified: [Aspects]
🔧 Fixed: [Issues]
```

### For Architecture

```markdown
## Step 1: Draft Architecture
[Initial design]

## Step 2: Verification Questions
1. Will this scale?
2. Are technologies current?
3. What are the costs?
4. What are the risks?

## Step 3: Independent Verification
[Analyze each aspect independently]

## Step 4: Final Verified Architecture
[Verified design with ADRs]
✅ Validated: [Decisions]
⚠️ Risks: [With mitigation]
```

## When to Use COVE

### High Value ✅
- API specifications
- Code generation
- Architecture decisions
- Security implementations
- Compliance requirements
- Integration specifications

### Lower Value ⚠️
- Creative content
- Subjective design
- Simple patterns
- Brainstorming

## Token Budget Guide

| Budget | COVE Usage |
|--------|------------|
| **Low** | Critical stages only (03, 04, 06) |
| **Medium** | Planning stages (01-06) |
| **High** | All stages (01-10) |

## Verification Question Templates

### For Specifications
- Are all requirements captured?
- Are technical details accurate and current?
- Are there security vulnerabilities?
- What edge cases are missing?
- Are error scenarios covered?
- Is this feasible within constraints?

### For Code
- Does this solve the stated problem?
- Are there syntax or logic errors?
- Are APIs/methods used correctly?
- What edge cases could break this?
- Are there security issues?
- Is this performant?
- Is this maintainable?

### For Architecture
- Will this scale to requirements?
- Are technologies production-ready?
- What are realistic costs?
- What are the risks?
- Are there simpler alternatives?
- Does this match team capabilities?

### For Testing
- Does this cover all critical paths?
- Are test scenarios realistic?
- Are edge cases tested?
- Are performance targets achievable?

## Confidence Indicators

Always include:

```markdown
**Confidence Levels**:
- High confidence (verified): [List]
- Medium confidence (inferred): [List]
- Requires validation: [List]

**Assumptions**:
- [Assumption 1: Rationale]
- [Assumption 2: Rationale]
```

## Common Pitfalls

### ❌ Don't Do This
- Skip verification questions
- Answer questions while looking at draft
- Verify everything equally
- Ignore low-confidence items

### ✅ Do This
- Focus on high-risk areas
- Answer independently
- Prioritize critical verifications
- Document assumptions clearly

## Integration with Stages

| Stage | COVE Focus |
|-------|------------|
| 01 - Intake | Requirements completeness |
| 02 - Charter | Scope and success criteria |
| 03 - Architecture | Technology choices and design |
| 04 - Features | Feature specifications |
| 05 - Testing | Test coverage and scenarios |
| 06 - Implementation | Task completeness |
| 07 - Deployment | Deployment configurations |
| 08 - Documentation | Documentation accuracy |
| 09 - Quality | Quality criteria |
| 10 - Handoff | Handoff completeness |

## Metrics to Track

```json
{
  "verificationsPerformed": 0,
  "claimsVerified": 0,
  "claimsCorrected": 0,
  "confidenceImprovement": "0%",
  "issuesFound": {
    "security": 0,
    "logic": 0,
    "performance": 0,
    "completeness": 0
  }
}
```

## Example Workflow

### 1. Generate API Specification

**Without COVE** (5 minutes):
```
Generate spec → Review → Ship
Result: 15 issues in production
```

**With COVE** (8 minutes):
```
Draft spec → Verify → Answer → Finalize
Result: 2 minor issues, 95% accurate
```

**Net Savings**: 3 hours of debugging vs. 3 extra minutes upfront

### 2. Generate Code Function

**Without COVE**:
```
Write code → Test → Debug → Fix → Repeat
Result: 3 iterations, 30 minutes
```

**With COVE**:
```
Draft → Verify → Answer → Finalize → Test
Result: 1 iteration, 12 minutes
```

**Net Savings**: 18 minutes + higher quality

## Quick Commands

### Enable COVE for Current Task
```markdown
Apply COVE verification to this [specification/code/architecture]:
1. Review my draft
2. Generate verification questions
3. Answer independently
4. Provide verified output with confidence indicators
```

### Request COVE for Specific Aspect
```markdown
Apply COVE verification focusing on [security/performance/correctness]:
[Your draft]
```

### Get COVE Summary
```markdown
Provide COVE verification summary:
- Issues found
- Corrections made
- Confidence levels
- Remaining risks
```

## Resources

- **Full Framework**: [cove-verification-framework.md](./cove-verification-framework.md)
- **Stage Integration**: [cove-stage-integration.md](./cove-stage-integration.md)
- **Examples**: [cove-examples/](./cove-examples/)
- **Research Paper**: [arXiv:2309.11495](https://arxiv.org/abs/2309.11495)

## Remember

> COVE is about **systematic verification**, not perfection.
> The goal is to **significantly reduce errors** and **increase confidence**.

**Key Principle**: Answer verification questions independently to avoid confirmation bias.

---

**Quick Start**: Copy a template above and start verifying your outputs today!
