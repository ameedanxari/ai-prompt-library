# Project State Files Template

## Purpose
Define the exact state files that must be created and maintained to enable seamless continuation across different chats, IDEs, and AI agents. These files are the "wiring" that allows any AI to pick up exactly where the last one left off with a simple "Continue" or "Resume" command.

## Instructions
When initializing a project with the AI Prompt Library, create these state files in the project root. Update them after every stage completion. Any AI agent reading these files should know exactly what to do next without any additional context.

## Examples
```markdown
## Example: NEXT_ACTION.md after Stage 02 completion

# NEXT ACTION

**Status**: Ready to continue
**Current Stage**: Stage 02 - Charter ✅ COMPLETE
**Next Stage**: Stage 03 - Architecture

## To Continue
Tell your AI: "Continue" or "Resume"

## What Happens Next
The AI will:
1. Read the project state from `prompts/outputs/`
2. Load Stage 03 templates from `.ai-prompts/prompts/stages/stage-03-architecture/`
3. Generate architecture specifications based on the charter
4. Output to `prompts/outputs/specifications/architecture.md`
5. Update this file with Stage 04 as the next action

## Context Files
- Charter: `prompts/outputs/specifications/charter.md`
- Requirements: `prompts/outputs/specifications/requirements.md`
- Project Brief: `MY_PROJECT.md`
```

---

## Required State Files

### 1. NEXT_ACTION.md (Primary Control File)

This is the **single file** any AI agent reads to know what to do. It must be self-contained and actionable.

```markdown
# NEXT ACTION

**Status**: [Ready to continue | Waiting for user input | Blocked | Complete]
**Current Stage**: [Stage name] [✅ COMPLETE | 🚧 IN PROGRESS | ⏳ PENDING]
**Next Stage**: [Next stage name]
**Last Updated**: [Timestamp]

## To Continue
Tell your AI: "Continue" or "Resume"

## What Happens Next
The AI will:
1. [Specific action 1]
2. [Specific action 2]
3. [Specific action 3]
4. Update this file with the next action

## If Starting Fresh
If this is a new chat/session, the AI should:
1. Read `.ai-prompts/prompts/AGENTS.md` for library instructions
2. Read `MY_PROJECT.md` for project brief
3. Read `prompts/outputs/PROJECT_STATE.md` for current state
4. Execute the next action above

## Context Files (Read These First)
- Project Brief: `MY_PROJECT.md`
- Current State: `prompts/outputs/PROJECT_STATE.md`
- Stage Templates: `.ai-prompts/prompts/stages/[stage-name]/`

## Blocking Issues
[None | List any issues that must be resolved before continuing]
```

### 2. PROJECT_STATE.md (Comprehensive State)

Located at `prompts/outputs/PROJECT_STATE.md`, this file contains the complete project state.

```markdown
# Project State

**Project**: [Project name from brief]
**Created**: [Timestamp]
**Last Updated**: [Timestamp]
**Library Version**: [AI Prompt Library version]

## Pipeline Progress

| Stage | Status | Completed | Output Files |
|-------|--------|-----------|--------------|
| 01 - Intake | ✅ Complete | [Date] | requirements.md |
| 02 - Charter | ✅ Complete | [Date] | charter.md |
| 03 - Architecture | 🚧 In Progress | - | - |
| 04 - Features | ⏳ Pending | - | - |
| 05 - Testing | ⏳ Pending | - | - |
| 06 - Implementation | ⏳ Pending | - | - |
| 07 - Deployment | ⏳ Pending | - | - |
| 08 - Documentation | ⏳ Pending | - | - |
| 09 - Quality | ⏳ Pending | - | - |
| 10 - Handoff | ⏳ Pending | - | - |

## Current Stage Details

**Stage**: [Current stage name]
**Status**: [In Progress | Blocked | Waiting]
**Started**: [Timestamp]
**Progress**: [Description of what's done within this stage]

### Completed in This Stage
- [Completed item 1]
- [Completed item 2]

### Remaining in This Stage
- [Remaining item 1]
- [Remaining item 2]

## Key Decisions

| Decision | Stage | Rationale |
|----------|-------|-----------|
| [Decision 1] | [Stage] | [Why] |
| [Decision 2] | [Stage] | [Why] |

## Technology Stack

- **Frontend**: [Technology]
- **Backend**: [Technology]
- **Database**: [Technology]
- **Deployment**: [Platform]
- **Authentication**: [Method]

## Output Files Generated

```
prompts/outputs/
├── specifications/
│   ├── requirements.md      [✅ Generated]
│   ├── charter.md           [✅ Generated]
│   ├── architecture.md      [⏳ Pending]
│   └── features.md          [⏳ Pending]
├── task-lists/
│   ├── frontend-tasks.md    [⏳ Pending]
│   ├── backend-tasks.md     [⏳ Pending]
│   └── deployment-tasks.md  [⏳ Pending]
└── documentation/
    ├── api-docs.md          [⏳ Pending]
    └── user-guides.md       [⏳ Pending]
```

## For New AI Agents

If you're a new AI agent joining this project:

1. **Read the library instructions**: `.ai-prompts/prompts/AGENTS.md`
2. **Read the project brief**: `MY_PROJECT.md`
3. **Read the current stage template**: `.ai-prompts/prompts/stages/[current-stage]/`
4. **Check NEXT_ACTION.md** for what to do next
5. **Continue from where the last agent left off**

You have full context. Just execute the next action.
```

### 3. DECISION_LOG.md (Decision History)

Located at `prompts/outputs/DECISION_LOG.md`:

```markdown
# Decision Log

All architectural and technical decisions made during project specification.

## Decisions

### [Date] - [Decision Title]
**Stage**: [Stage where decision was made]
**Decision**: [What was decided]
**Rationale**: [Why this decision was made]
**Alternatives Considered**: [Other options that were evaluated]
**Impact**: [How this affects the project]

---

### [Date] - [Decision Title]
...
```

---

## State Update Protocol

### After Each Stage Completion

1. **Update NEXT_ACTION.md**:
   - Change current stage to ✅ COMPLETE
   - Set next stage
   - Update "What Happens Next" section
   - Clear any blocking issues

2. **Update PROJECT_STATE.md**:
   - Mark stage as complete in pipeline table
   - Add completion date
   - List output files generated
   - Update "Current Stage Details" to next stage

3. **Update DECISION_LOG.md**:
   - Add any decisions made during the stage

### Example State Transition

**Before Stage 03 completion:**
```markdown
# NEXT_ACTION.md
**Current Stage**: Stage 03 - Architecture 🚧 IN PROGRESS
**Next Stage**: Stage 04 - Features
```

**After Stage 03 completion:**
```markdown
# NEXT_ACTION.md
**Current Stage**: Stage 03 - Architecture ✅ COMPLETE
**Next Stage**: Stage 04 - Features

## What Happens Next
The AI will:
1. Load Stage 04 templates from `.ai-prompts/prompts/stages/stage-04-features/`
2. Read architecture decisions from `prompts/outputs/specifications/architecture.md`
3. Generate detailed feature specifications
4. Output to `prompts/outputs/specifications/features.md`
5. Update this file with Stage 05 as the next action
```

---

## Initialization Template

When a project is first set up, create these initial state files:

### Initial NEXT_ACTION.md
```markdown
# NEXT ACTION

**Status**: Ready to continue
**Current Stage**: Stage 01 - Intake ⏳ PENDING
**Next Stage**: Stage 01 - Intake (Start)
**Last Updated**: [Timestamp]

## To Continue
Tell your AI: "Continue" or "Resume"

## What Happens Next
The AI will:
1. Read your project brief from `MY_PROJECT.md`
2. Load Stage 01 templates from `.ai-prompts/prompts/stages/stage-01-intake/`
3. Process your brief to extract requirements
4. Generate `prompts/outputs/specifications/requirements.md`
5. Update this file with Stage 02 as the next action

## If Starting Fresh
If this is a new chat/session, the AI should:
1. Read `.ai-prompts/prompts/AGENTS.md` for library instructions
2. Read `MY_PROJECT.md` for project brief
3. Execute Stage 01 - Intake

## Context Files
- Project Brief: `MY_PROJECT.md`
- Library Instructions: `.ai-prompts/prompts/AGENTS.md`
- Stage Templates: `.ai-prompts/prompts/stages/stage-01-intake/`

## Blocking Issues
None
```

### Initial PROJECT_STATE.md
```markdown
# Project State

**Project**: [From MY_PROJECT.md brief]
**Created**: [Timestamp]
**Last Updated**: [Timestamp]
**Library Version**: 2.0

## Pipeline Progress

| Stage | Status | Completed | Output Files |
|-------|--------|-----------|--------------|
| 01 - Intake | ⏳ Pending | - | - |
| 02 - Charter | ⏳ Pending | - | - |
| 03 - Architecture | ⏳ Pending | - | - |
| 04 - Features | ⏳ Pending | - | - |
| 05 - Testing | ⏳ Pending | - | - |
| 06 - Implementation | ⏳ Pending | - | - |
| 07 - Deployment | ⏳ Pending | - | - |
| 08 - Documentation | ⏳ Pending | - | - |
| 09 - Quality | ⏳ Pending | - | - |
| 10 - Handoff | ⏳ Pending | - | - |

## Current Stage Details

**Stage**: Stage 01 - Intake
**Status**: Pending
**Started**: -
**Progress**: Not started

## Key Decisions

No decisions made yet.

## Technology Stack

To be determined during Stage 03 - Architecture.

## Output Files Generated

```
prompts/outputs/
└── (empty - will be populated as stages complete)
```

## For New AI Agents

1. Read `.ai-prompts/prompts/AGENTS.md`
2. Read `MY_PROJECT.md`
3. Check `NEXT_ACTION.md` for what to do
4. Execute the next action
```

---

## Resume Protocol

When an AI agent receives "Continue" or "Resume":

1. **Read NEXT_ACTION.md** - This tells you exactly what to do
2. **If context is needed**, read the files listed in "Context Files"
3. **Execute the next action** as described in "What Happens Next"
4. **Update state files** after completion
5. **Set up the next action** for the following stage

This protocol ensures any AI agent can continue the project with minimal user interaction.
