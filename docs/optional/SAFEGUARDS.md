# AI Prompt Library - Safeguard System

## 🛡️ **Overview**

The AI Prompt Library includes a multi-layered safeguard system that prevents hallucination, ensures architecture compliance, and maintains state across AI agent sessions. These safeguards are "mechanical" — they rely on shell scripts and validators rather than just prose instructions.

---

## **1. Planning Safeguards**

### **Brief-Keyword Coverage Gate**
**Purpose**: Prevents the AI from silently dropping user requirements during expansion.
**Location**: `drill-down-engine.md` Step 1.
**Output**: `brief-keywords.md`.
**Enforcement**: The engine refuses to advance to Step 2 if any distinctive keyword from the brief is not explicitly mapped to an epic or marked as out-of-scope.

### **Complexity-Based Scaling**
**Purpose**: Prevents "quota-based" hallucination (e.g., inventing 10 features for a simple epic just to hit a hardcoded count).
**Location**: `drill-down-engine.md` Step 2.
**Mechanism**: Scaling logic based on complexity tiers (S: 1-2, M: 3-5, L: 4-6 features).

### **Module-Loading Mandate**
**Purpose**: Ensures generated tasks contain high-quality, pattern-driven guidance rather than generic AI guesses.
**Location**: `module-selection-index.md` consulted by all engines.
**Enforcement**: Orchestrators require loading exactly ONE module per expansion context.

---

## **2. Validation Safeguards (The Gates)**

### **Instantiation Validator**
**Purpose**: Prevents common AI failures (placeholders, template references, multi-file collapse).
**Location**: `.ai-prompts/scripts/validate-instantiation.sh`.
**Triggers**: Manually by orchestrators or automatically by the Revise script.

### **Revise Gate (MANDATORY)**
**Purpose**: Canonical check set (C1-C9) that validates a complete plan before execution.
**Location**: `.ai-prompts/scripts/revise.sh`.
**Output**: `revise-report.md`.
**Enforcement**: The executor refuses to start if `revise-report.md` shows `executor_gate: fail`.

### **Progress Checklist Guard**
**Purpose**: Ensures all features are expanded before the planning phase is declared complete.
**Location**: `.ai-prompts/scripts/step3-progress.sh`.
**Mechanism**: Groups disk state by epic and provides a checklist of missing task files.

---

## **3. Execution Safeguards**

### **Preflight Gate**
**Purpose**: Verifies plan integrity before the first line of code is written.
**Location**: `executor.md`.
**Checks**: Existence of `external-accounts.md`, `revise-report.md` (must be `pass`), and completeness of `tasks-*.md`.

### **YAML Handoff Envelope**
**Purpose**: Ensures cross-session continuity without context drift.
**Location**: `execution-log.md`.
**Mechanism**: Stores `last_completed_task`, `next_task`, and `test_suite_state` in a machine-parseable header.

### **Hard Stop Conditions**
**Purpose**: Prevents agents from "looping" or making things worse when stuck.
**Triggers**: 3+ consecutive blocked tasks, test regressions since last green, or missing external credentials.

---

## **4. Integration Safeguards**

### **AI Agent Entry Point**
**Purpose**: Prevents the agent from starting in the wrong mode or ignoring existing project context.
**Location**: `.ai-prompts/prompts/orchestrators/ai-agent-entry-point.md`.

### **Steering Guards**
**Location**: `.ai-prompts/prompts/steering/`.
**Protections**: 
- `architecture-guard.md`: Prevents breaking existing functionality.
- `library-context.md`: Forbids A/B preference menus and provides the canonical execute-signal list.

---

## **🔧 Utility Scripts**

| Command | Purpose |
|---|---|
| `bash .ai-prompts/scripts/reset-integration.sh` | Purges stale state and refreshes steering. |
| `bash .ai-prompts/scripts/finalize.sh` | One-command wrapper for auto-fixers + revise gate. |
| `bash .ai-prompts/scripts/validate-instantiation.sh` | Direct access to the schema validator. |

---

## **🚀 Status Indicators**

Look for these in `prompts/outputs/current/`:

- ✅ `revise-report.md` → `executor_gate: pass` (Ready to build)
- ❌ `revise-report.md` → `executor_gate: fail` (Regeneration required)
- ⏸ `execution-log.md` → `next_task: <path>` (In progress)
- 🔴 `execution-log.md` → `regressions_since_green: [path]` (Stop and fix)