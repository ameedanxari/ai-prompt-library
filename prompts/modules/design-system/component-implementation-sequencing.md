# Design System Component Implementation Sequencing

<!-- INSTANTIATION RULES
When the drill-down engine (or any orchestrator) uses this template:
1. Every placeholder — including {{variables}}, <TBD>, [project name], and generic
   field/function/endpoint names — MUST be replaced with project-specific values
   before output is written to prompts/outputs/current/.
2. The template filename MUST NOT appear in task output. Dissolve the template
   into concrete content; do not reference its source.
3. No strings beginning with ".ai-prompts/prompts/" may appear in the output
   (validated by scripts/validate-instantiation.sh).
4. Outputs must contain real data shapes, real endpoints, real file paths, and
   real function signatures specific to the project.
-->


## Purpose
Enforce reusable design-system implementation before screen-level feature work in Step 3 (Tasks) planning and task generation.

## When to Use
- Step 3 (Tasks) task generation for any UI surface (`mobile`, `web`, `admin`).
- Any request that introduces new screens or major UI refactors.

## Hard Rules
1. Create a dedicated foundation task for each UI surface that implements:
   - token plumbing (color/type/spacing/radius/elevation/state tokens)
   - reusable component primitives
   - variant + state matrix (`default`, `loading`, `empty`, `error`, `disabled`, `success`)
2. Place this foundation task before screen-level tasks in dependency order.
3. All screen-level tasks must depend (directly or transitively) on the foundation task.
4. Screen tasks must reference `design-system-foundation.md`, `design-system-component-catalog.md`, and `screen-fidelity-matrix.md`.
5. Do not treat duplicated per-screen ad hoc styles as complete implementation.

## Required Output Impacts
- `prompts/outputs/task-lists/*-tasks.md` include explicit design-system foundation tasks per UI surface.
- `prompts/outputs/implementation-prompts/*.md` include concrete design-system references and component usage constraints.
- `prompts/outputs/specifications/prompt-usage-log.md` records this module when Step 3 (Tasks) generates UI task tracks.

