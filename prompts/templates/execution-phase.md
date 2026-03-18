# Execution Phase: Building the Product from Specifications

## Purpose
Transition from the **Specification Pipeline (Stages 01-10)** to the **Execution Phase** where generated task lists and specifications are transformed into actual working code, tests, and deployable artifacts.

**CRITICAL**: The 10-stage pipeline generates SPECIFICATIONS and PLANS - it does NOT write actual code. This template defines how to execute those plans and build the real product.

---

## Dry-Run Mode Support

### When Dry-Run is Enabled

If the project is in **dry-run mode** (check `NEXT_ACTION.md` or `PROJECT_STATE.md` for `Mode: Dry-run`):

**DO NOT generate actual code.** Instead, provide task previews.

### Dry-Run Execution Behavior

```markdown
## Dry-Run: Execution Phase Preview

**Mode**: Dry-run (no code generation)
**Purpose**: Show user what will be built without consuming tokens

### Task Preview: [Task Name]

**Files That Would Be Created:**
- `src/[path]/file.ts` - [Brief description]
- `tests/[path]/file.test.ts` - [Brief description]

**Implementation Approach:**
- [Key technical approach point 1]
- [Key technical approach point 2]
- [Key pattern or library to use]

**Estimated Scope:**
- Lines of code: ~[X] lines
- Token usage: ~[X] tokens
- Dependencies: [List any new packages]

**Acceptance Criteria (from specs):**
- [ ] [Criteria 1]
- [ ] [Criteria 2]

---

**To proceed with actual implementation:**
Say "Build" or "Execute [task name]"
```

### Token Savings with Dry-Run

| Phase | Full Run | Dry-Run | Savings |
|-------|----------|---------|---------|
| Per task | 1000-3000 tokens | 100-200 tokens | 90-95% |
| Per feature (5 tasks) | 5000-15000 tokens | 500-1000 tokens | 90% |
| Full project | 50K-100K tokens | 5K-10K tokens | 90% |

### Dry-Run vs Full Execution Decision Tree

```
User says "Continue" or "Execute the plan"
         ↓
Check PROJECT_STATE.md or NEXT_ACTION.md for mode
         ↓
    ┌────────────────────────────────────┐
    │ Mode: Dry-run?                     │
    ├────────────────────────────────────┤
    │ YES → Show task preview only       │
    │       Do NOT write code files      │
    │       Ask user to say "Build"      │
    │                                    │
    │ NO  → Execute tasks normally       │
    │       Write actual code files      │
    │       Create tests                 │
    │       Update EXECUTION_PROGRESS.md │
    └────────────────────────────────────┘
```

---

## The Spec-to-Execution Gap

### What the 10-Stage Pipeline Produces
- Requirements documents
- Architecture specifications  
- Feature specifications
- Testing strategy documents
- **Implementation task lists** (prompts for building, NOT actual code)
- Deployment configuration templates
- Documentation outlines
- Quality checklists
- Handoff guides

### What the Execution Phase Produces
- **Actual source code files**
- **Working tests**
- **Real configuration files**
- **Deployed infrastructure**
- **Functional application**

## Instructions

### Phase Transition Checkpoint

Before entering Execution Phase, verify:

```markdown
## Pre-Execution Validation Checklist

### Specifications Complete
- [ ] requirements.md exists and is comprehensive
- [ ] architecture.md defines tech stack and patterns
- [ ] features.md has detailed acceptance criteria
- [ ] Task lists exist in prompts/outputs/task-lists/

### Task Lists Ready for Execution
- [ ] task-list-index.md exists and lists all execution task files
- [ ] implementation-master-plan.md contains sequencing and dependencies
- [ ] At least one app task file + one backend/integration task file exist

### Development Environment
- [ ] Project directory structure created
- [ ] Package.json or equivalent initialized
- [ ] Git repository initialized
- [ ] Development dependencies installed

### If Any Checks Fail
- Return to appropriate stage and complete missing specifications
- Do NOT proceed to execution with incomplete specs
```

## Execution Workflow

### Step 1: Initialize Project Structure

```markdown
## Initialize: Create Project Foundation

**Objective**: Set up the actual code repository based on architecture specs

**Read First**:
- Architecture: prompts/outputs/architecture/architecture.md (or prompts/outputs/specifications/architecture.md if legacy)
- Tech Stack: [From architecture decisions]

**Actions**:
1. Create project directory structure matching architecture
2. Initialize package manager (npm init, cargo init, etc.)
3. Install core dependencies from architecture specs
4. Create base configuration files
5. Set up linting and formatting tools
6. Initialize git with .gitignore from specs

**Validation**:
- [ ] Project builds/compiles without errors
- [ ] Linting passes
- [ ] Git repository is clean
- [ ] Dependencies installed successfully

**Output**: Working project skeleton ready for feature development
```

### Step 2: Execute Task Lists Systematically

```markdown
## Execute Tasks: Build Features from Task Lists

**Critical Rule**: Execute ONE task at a time. Each task must be validated before proceeding.

### Task Execution Protocol

For each task in the task lists:

1. **Read the Task**
   - Load next pending task from prompts/outputs/task-lists/task-list-index.md
   - Identify the specific task to execute
   - Read all referenced specifications

2. **Understand Context**
   - Review linked requirements
   - Check architecture patterns to follow
   - Identify dependencies on other tasks

3. **Write Actual Code** (with COVE if enabled)
   - **Draft**: Create initial source code implementation
   - **Verify** (if COVE enabled):
     - Does this code solve the stated problem?
     - Are there security vulnerabilities?
     - What edge cases are missing?
     - Are APIs used correctly?
   - **Answer**: Verify each aspect independently
   - **Finalize**: Apply corrections and create final code
   - Follow coding standards from specs
   - Add comments and documentation

4. **Write Tests**
   - Create unit tests for the implementation
   - Follow testing strategy from Stage 05
   - Ensure tests pass before proceeding

5. **Validate Completion**
   - Run all tests
   - Verify acceptance criteria from specs
   - Check integration with existing code
   - **Document COVE Results** (if applied):
     - Issues found and fixed
     - Confidence level in implementation
   - Update task as complete

6. **Update State**
   - Mark task complete in EXECUTION_PROGRESS.md
   - Document any decisions made
   - Record COVE metrics if applied
   - Proceed to next task
```

### COVE in Code Generation

When generating code during execution phase, apply COVE for:

**High-Risk Code:**
- Security-critical functions (auth, authorization, encryption)
- Payment processing logic
- Data validation and sanitization
- API integrations with external services
- Performance-critical algorithms

**COVE Code Generation Process:**

```markdown
## Step 1: Draft Code
[Write initial implementation]

## Step 2: Verification Questions
1. **Correctness**: Does this solve the problem correctly?
2. **Security**: Are there XSS, injection, or other vulnerabilities?
3. **Edge Cases**: What inputs could break this?
4. **APIs**: Are methods/functions used correctly?
5. **Performance**: Are there obvious inefficiencies?
6. **Maintainability**: Is this code clear and maintainable?

## Step 3: Independent Verification
[Answer each question without looking at code]

## Step 4: Final Verified Code
✅ Verified aspects
🔧 Issues fixed
📝 Improvements made
Confidence: [High/Medium/Low]
```

**See**: `templates/cove-examples/code-generation-example.md` for complete example

### Step 3: Progressive Integration

```markdown
## Integration: Connect Components

After implementing individual components:

1. **API Integration**
   - Connect frontend to backend endpoints
   - Verify data flows correctly
   - Test error handling
   - **Apply COVE** to integration logic

2. **Database Integration**
   - Implement data models
   - Set up migrations
   - Test CRUD operations
   - **Verify** query correctness and security

3. **Authentication/Authorization**
   - Implement security features
   - Test access controls
   - Verify token handling
   - **COVE Critical**: Security verification mandatory

4. **End-to-End Testing**
   - Run integration tests
   - Test complete user flows
   - Validate against acceptance criteria
```

## Execution State Files

### EXECUTION_PROGRESS.md (Create in project root)

```markdown
# Execution Progress

**Phase**: Execution (Building from Specifications)
**Started**: [Timestamp]
**Last Updated**: [Timestamp]

## Overall Progress

| Category | Total Tasks | Completed | In Progress | Remaining |
|----------|-------------|-----------|-------------|-----------|
| Frontend | X | X | X | X |
| Backend | X | X | X | X |
| Deployment | X | X | X | X |
| Testing | X | X | X | X |

## Current Focus

**Active Task**: [Task ID and Title]
**Task File**: prompts/outputs/task-lists/[file].md#task-X
**Status**: [In Progress / Blocked / Complete]

### Completed Steps
- [x] Step 1: Description
- [x] Step 2: Description
- [ ] Step 3: Description (current)

### Files Created/Modified
- src/components/Example.tsx - Created
- src/services/api.ts - Modified

## Completed Tasks Log

### [Date] - Task 1.1: Initialize Project
- Duration: 30 minutes
- Files: package.json, tsconfig.json, .gitignore
- Notes: Used Next.js with TypeScript

### [Date] - Task 1.2: Set Up Authentication
- Duration: 2 hours
- Files: src/auth/*, src/middleware/auth.ts
- Notes: Implemented JWT with refresh tokens

## Blocking Issues

[None | List issues preventing progress]

## For Continuing Agents

1. Read this file to understand current state
2. Check "Current Focus" for active task
3. Continue from last uncompleted step
4. Update this file after each significant action
5. Mark tasks complete when all acceptance criteria met
```

### Update NEXT_ACTION.md After Stage 10

```markdown
# NEXT ACTION

**Status**: Ready to Build
**Current Phase**: Specification Pipeline ✅ COMPLETE
**Next Phase**: Execution Phase - Build the Product
**Last Updated**: [Timestamp]

## Important: Specification vs Execution

The 10-stage pipeline is COMPLETE. All specifications, task lists, and plans have been generated.

**NOW IT'S TIME TO BUILD.**

The specifications tell you WHAT to build. Now you need to actually BUILD it.

## To Continue

Tell your AI: "Execute the development plan" or "Build the project from specifications"

## What Happens Next

The AI will:
1. Read prompts/outputs/task-lists/ for implementation tasks
2. Create EXECUTION_PROGRESS.md to track building
3. Initialize the project structure based on architecture.md
4. Execute tasks one by one, writing actual code
5. Validate each implementation against acceptance criteria
6. Continue until the product is complete

## This is NOT Another Planning Stage

Do NOT:
- Generate more specifications
- Create more planning documents
- Outline what could be built

DO:
- Write actual source code files
- Create real tests
- Build working functionality
- Deploy real infrastructure

## Context Files for Execution

### Specifications (What to Build)
- Requirements: prompts/outputs/specifications/requirements.md
- Architecture: prompts/outputs/architecture/architecture.md
- Features: prompts/outputs/specifications/features.md

### Task Lists (How to Build)
- Task Index: prompts/outputs/task-lists/task-list-index.md
- Master Plan: prompts/outputs/task-lists/implementation-master-plan.md
- Platform Tracks: prompts/outputs/task-lists/*-tasks.md

### Templates
- Execution Guide: .ai-prompts/prompts/templates/execution-phase.md
```

## Examples

### Example 1: Starting Execution Phase

```markdown
# User says: "Execute the development plan"

AI Agent Response:

## Entering Execution Phase

I'll now transition from specifications to building actual code.

### Current State
- 10 specification stages: ✅ Complete
- Task lists generated: ✅ Ready
- Project initialized: ❌ Not yet

### First Action: Initialize Project

Creating project structure based on architecture.md:

```bash
mkdir -p src/{components,services,utils,hooks}
npm init -y
npm install react next typescript @types/react
npm install -D eslint prettier jest
```

Creating initial files:
- src/app/layout.tsx
- src/app/page.tsx
- tailwind.config.js
- tsconfig.json

### Next Task
After initialization, I'll execute the first pending item from task-list-index.md:
"Create base component library with design system tokens"
```

### Example 2: Continuing Mid-Execution

```markdown
# User says: "Continue"

AI Agent Response:

## Continuing Execution

Reading EXECUTION_PROGRESS.md...

### Current Status
- Active Task: Task 2.3 - Implement User Authentication
- Last Completed Step: Created auth service skeleton
- Next Step: Implement login endpoint

### Continuing Implementation

File: src/services/auth.service.ts
```typescript
export async function login(email: string, password: string) {
  const user = await db.user.findUnique({ where: { email } });
  if (!user) throw new AuthError('User not found');
  
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new AuthError('Invalid password');
  
  const token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: '1h' });
  return { user, token };
}
```

### Tests
File: src/services/__tests__/auth.service.test.ts
```typescript
describe('login', () => {
  it('should return token for valid credentials', async () => {
    // test implementation
  });
});
```

### Validation
- [ ] Tests pass
- [ ] Acceptance criteria met
- [ ] Integration verified

Updating EXECUTION_PROGRESS.md with current progress...
```

## Common Pitfalls to Avoid

### Pitfall 1: Endless Specification Loop
**Problem**: AI keeps generating more plans instead of writing code
**Solution**: Explicitly tell AI "Write the actual code file" or "Create src/file.ts with this implementation"

### Pitfall 2: Completing Stages Without Artifacts
**Problem**: AI marks stages complete but produces no files
**Solution**: Each task must produce specific file artifacts. Validate files exist before marking complete.

### Pitfall 3: Skipping Validation
**Problem**: AI writes code but skips testing
**Solution**: Every implementation must include tests. No task is complete without passing tests.

### Pitfall 4: Lost Context Between Sessions  
**Problem**: New session doesn't know what was built
**Solution**: Always update EXECUTION_PROGRESS.md with exact file paths and current state.

## Task Execution Checklist

For EVERY task from the task lists:

```markdown
## Task: [Task ID and Title]

### Pre-Execution
- [ ] Read task description and acceptance criteria
- [ ] Identify files to create/modify
- [ ] Review relevant specifications

### Implementation
- [ ] Write source code (actual .ts, .tsx, .py, etc. files)
- [ ] Add proper error handling
- [ ] Include logging where appropriate
- [ ] Follow coding standards from specs

### Testing  
- [ ] Write unit tests
- [ ] Run tests and verify passing
- [ ] Check code coverage meets requirements

### Validation
- [ ] Acceptance criteria from specs met
- [ ] Code compiles/runs without errors
- [ ] Integration with existing code verified

### Documentation
- [ ] Update EXECUTION_PROGRESS.md
- [ ] Mark task complete
- [ ] Note any deviations or decisions

### Commit (if using version control)
- [ ] Stage changes
- [ ] Commit with descriptive message
- [ ] Push to repository
```

## Success Metrics for Execution Phase

### Implementation Complete When:
- [ ] All tasks listed in task-list-index.md executed
- [ ] API integration tasks completed for each in-scope app surface
- [ ] Deployment prerequisites and rollout tasks completed
- [ ] All tests pass (minimum 80% coverage)
- [ ] Application runs locally without errors
- [ ] Core user flows work end-to-end
- [ ] Deployment configuration validated

### Quality Gates
- No critical bugs
- Security requirements implemented
- Accessibility requirements met
- Performance benchmarks satisfied
- Documentation complete

## Integration with Pipeline

### After Stage 10 Completion
1. Update NEXT_ACTION.md to point to Execution Phase
2. Create EXECUTION_PROGRESS.md
3. Begin executing tasks from task lists
4. Continue until product is complete

### Resuming Execution
1. Read EXECUTION_PROGRESS.md for current state
2. Find "Current Focus" section
3. Continue from last uncompleted step
4. Update progress after each action

### Execution Complete
1. All task lists exhausted
2. Product is functional
3. Tests pass
4. Update NEXT_ACTION.md to "Maintenance Phase" or "Complete"
