# Infrastructure as Code Evolution Template

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

This template provides comprehensive patterns for implementing next-generation Infrastructure as Code (IaC) including intelligent infrastructure orchestration, AI-driven resource optimization, self-healing infrastructure, and advanced IaC automation. It covers enterprise-scale IaC evolution with smart resource management, predictive scaling, and sophisticated infrastructure governance.

## Context

Infrastructure as Code has evolved beyond simple declarative configurations to intelligent, self-managing infrastructure systems. This template addresses advanced IaC scenarios including AI-driven resource optimization, predictive infrastructure scaling, automated compliance enforcement, and self-healing infrastructure with comprehensive security and cost optimization integration.


## When to use this module

- Evolving infrastructure-as-code practice: intelligent orchestration, AI-driven optimization, self-healing infrastructure.
- Terraform/Pulumi-based deployments with compliance automation and drift remediation.

## Essential checklist

- **Configure the intelligent IaC environment** (tooling, state, planning).
- **Define the infrastructure strategy** with AI-driven optimization objectives.
- **Implement AI-driven resource optimization** (sizing, planning, cost).
- **Deploy self-healing infrastructure** (drift detection, automated remediation).
- **Automate compliance** validation and enforcement.
- **Monitor and optimize** infrastructure performance continuously.

## Expandable detail

This brief is the short core: what the module is, when to use it, and the essential checklist. The full substance lives in the expandable detail files below — load them via this brief when you need them.

- `.ai-prompts/prompts/modules/deployment/infrastructure-as-code-evolution.detail-1-examples-orchestration.md` (~3.7k est / ~5.6k max tokens) — Worked example: intelligent infrastructure orchestration framework — read for the reference implementation.
- `.ai-prompts/prompts/modules/deployment/infrastructure-as-code-evolution.detail-2-examples-terraform.md` (~2.2k est / ~3.3k max tokens) — Worked example: advanced Terraform with AI optimization.
- `.ai-prompts/prompts/modules/deployment/infrastructure-as-code-evolution.detail-3-examples-pulumi.md` (~1.9k est / ~2.9k max tokens) — Worked example: self-healing infrastructure with Pulumi.
- `.ai-prompts/prompts/modules/deployment/infrastructure-as-code-evolution.detail-4-instructions.md` (~1.3k est / ~2.0k max tokens) — Step-by-step setup — read when executing the workflow.
- `.ai-prompts/prompts/modules/deployment/infrastructure-as-code-evolution.detail-5-implementation-patterns.md` (~3.5k est / ~5.2k max tokens) — Copy-pasteable IaC patterns — read when authoring infrastructure code.
- `.ai-prompts/prompts/modules/deployment/infrastructure-as-code-evolution.detail-6-reference-output.md` (~2.5k est / ~3.8k max tokens) — Expected output, integration points, security and performance considerations — read for acceptance criteria.

Token budgets use one uniform heuristic: estimated tokens ≈ file bytes ÷ 4; max budget = ⌈est × 1.5⌉. Detail budgets are per-file, listed above.
