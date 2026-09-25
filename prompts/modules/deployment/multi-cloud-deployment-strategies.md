# Multi-Cloud Deployment Strategies Template

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

This template provides comprehensive patterns for implementing multi-cloud deployment strategies including intelligent cloud provider orchestration, cross-cloud application deployment, hybrid cloud coordination, and AI-driven multi-cloud optimization. It covers enterprise-scale multi-cloud systems with smart resource allocation, cost optimization, and resilience management.

## Context

Multi-cloud deployment enables organizations to leverage the best services from multiple cloud providers while avoiding vendor lock-in and improving resilience. This template addresses the complexity of deploying applications across multiple cloud platforms including provider abstraction, data synchronization, network coordination, and intelligent workload placement with AI-driven optimization.


## When to use this module

- Deploying across multiple cloud providers with intelligent orchestration.
- Workload placement, cross-cloud networking, and multi-cloud cost optimization.

## Essential checklist

- **Configure multi-cloud infrastructure** with intelligent orchestration.
- **Define the multi-cloud strategy**: provider mix, AI-driven optimization objectives.
- **Implement intelligent workload placement** across providers.
- **Deploy applications** across the selected clouds.
- **Configure cross-cloud networking** and connectivity.
- **Monitor and optimize** multi-cloud performance and cost.

## Expandable detail

This brief is the short core: what the module is, when to use it, and the essential checklist. The full substance lives in the expandable detail files below — load them via this brief when you need them.

- `.ai-prompts/prompts/modules/deployment/multi-cloud-deployment-strategies.detail-1-examples-orchestration.md` (~4.6k est / ~6.9k max tokens) — Worked example: intelligent multi-cloud orchestration framework — read for the reference implementation.
- `.ai-prompts/prompts/modules/deployment/multi-cloud-deployment-strategies.detail-2-examples-abstraction-layer.md` (~2.8k est / ~4.2k max tokens) — Worked example: cloud provider abstraction layer.
- `.ai-prompts/prompts/modules/deployment/multi-cloud-deployment-strategies.detail-3-examples-cost-optimization.md` (~1.4k est / ~2.1k max tokens) — Worked example: multi-cloud cost optimization.
- `.ai-prompts/prompts/modules/deployment/multi-cloud-deployment-strategies.detail-4-instructions.md` (~1.2k est / ~1.8k max tokens) — Step-by-step setup — read when executing the workflow.
- `.ai-prompts/prompts/modules/deployment/multi-cloud-deployment-strategies.detail-5-implementation-patterns.md` (~1.8k est / ~2.7k max tokens) — Copy-pasteable multi-cloud patterns — read when authoring deployment code.
- `.ai-prompts/prompts/modules/deployment/multi-cloud-deployment-strategies.detail-6-reference-output.md` (~2.5k est / ~3.7k max tokens) — Expected output, integration points, security and performance considerations — read for acceptance criteria.

Token budgets use one uniform heuristic: estimated tokens ≈ file bytes ÷ 4; max budget = ⌈est × 1.5⌉. Detail budgets are per-file, listed above.
