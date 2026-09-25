# GitOps Advanced Workflows Template

<!-- INSTANTIATION RULES
When the drill-down engine (or any orchestrator) uses this template:
1. Every placeholder — including {{variables}}, <TBD>, [project name], and generic
   field/function/endpoint names — MUST be replaced with project-specific values
   before output is written to prompts/outputs/current/.
2. The template filename MUST NOT appear in task output. Dissolve the template
   into concrete content; do not reference its source.
3. No strings beginning with ".ai-prompts/prompts/" may appear in the output
   (validated by .ai-prompts/scripts/validate-instantiation.sh).
4. Outputs must contain real data shapes, real endpoints, real file paths, and
   real function signatures specific to the project.
-->


## Purpose

This template provides comprehensive patterns for implementing advanced GitOps workflows including intelligent deployment orchestration, multi-environment promotion pipelines, AI-driven rollback strategies, and sophisticated GitOps automation. It covers enterprise-scale GitOps systems with smart conflict resolution, predictive deployment optimization, and advanced security integration.

## Context

GitOps represents the evolution of deployment practices where Git serves as the single source of truth for declarative infrastructure and applications. This template addresses advanced GitOps scenarios including complex multi-environment workflows, intelligent deployment strategies, automated rollback mechanisms, and AI-driven optimization with comprehensive security and compliance integration.


## When to use this module

- Designing GitOps workflows: repo-driven deployments, environment promotion, policy-as-code.
- Intelligent deployment orchestration with security and compliance integration.

## Essential checklist

- **Configure the GitOps infrastructure** with intelligent orchestration.
- **Define the GitOps strategy**: repos, environments, promotion flow.
- **Implement intelligent deployment orchestration** and optimization.
- **Deploy applications** through GitOps pipelines.
- **Integrate security and compliance** validation into the flow.
- **Monitor and optimize** GitOps performance.

## Expandable detail

This brief is the short core: what the module is, when to use it, and the essential checklist. The full substance lives in the expandable detail files below — load them via this brief when you need them.

- `.ai-prompts/prompts/modules/deployment/gitops-advanced-workflows.detail-1-examples-orchestration.md` (~3.8k est / ~5.7k max tokens) — Worked example: intelligent GitOps orchestration framework — read for the reference implementation.
- `.ai-prompts/prompts/modules/deployment/gitops-advanced-workflows.detail-2-examples-promotion-pipeline.md` (~2.2k est / ~3.3k max tokens) — Worked example: advanced environment promotion pipeline.
- `.ai-prompts/prompts/modules/deployment/gitops-advanced-workflows.detail-3-examples-security-compliance.md` (~1.4k est / ~2.1k max tokens) — Worked example: GitOps security and compliance integration.
- `.ai-prompts/prompts/modules/deployment/gitops-advanced-workflows.detail-4-instructions.md` (~1.4k est / ~2.1k max tokens) — Step-by-step setup — read when executing the workflow.
- `.ai-prompts/prompts/modules/deployment/gitops-advanced-workflows.detail-5-implementation-patterns.md` (~1.1k est / ~1.6k max tokens) — Copy-pasteable GitOps patterns — read when authoring pipeline config.
- `.ai-prompts/prompts/modules/deployment/gitops-advanced-workflows.detail-6-reference-output.md` (~2.0k est / ~3.1k max tokens) — Expected output, integration points, security and performance considerations — read for acceptance criteria.

Token budgets use one uniform heuristic: estimated tokens ≈ file bytes ÷ 4; max budget = ⌈est × 1.5⌉. Detail budgets are per-file, listed above.
