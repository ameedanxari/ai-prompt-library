# Zero-Trust Deployment Architectures Template

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

This template provides comprehensive patterns for implementing zero-trust deployment architectures including identity-centric security, micro-segmentation, continuous verification, and AI-driven threat detection. It covers enterprise-scale zero-trust systems with intelligent security orchestration, adaptive access controls, and sophisticated threat response automation.

## Context

Zero-trust architecture represents a fundamental shift from perimeter-based security to identity-centric, continuous verification models. This template addresses advanced zero-trust deployment scenarios including micro-segmentation, identity federation, continuous authentication, and AI-driven security automation with comprehensive compliance and threat intelligence integration.


## When to use this module

- Designing or deploying zero-trust architectures (identity-centric, continuous verification) rather than perimeter-based security.
- Micro-segmentation, identity federation, continuous authentication, and AI-driven security automation with compliance and threat-intel integration.

## Essential checklist

- **Define the zero-trust strategy first**: identity-centric objectives — continuous verification, MFA required, least privilege, automated governance.
- **Stand up identity**: IdP federation, continuous authentication, and automated identity governance.
- **Segment the network**: micro-segmentation, service-mesh mTLS, default-deny network policies.
- **Deploy policy controls**: OPA/admission policies, pod security standards, WAF and audit logging.
- **Turn on continuous verification**: runtime monitoring, AI-driven threat detection, adaptive access.
- **Monitor and optimize**: telemetry, audit trails, and automated incident response.

## Expandable detail

This brief is the short core: what the module is, when to use it, and the essential checklist. The full substance lives in the expandable detail files below — load them via this brief when you need them.

- `.ai-prompts/prompts/modules/deployment/zero-trust-deployment-architectures.detail-1-examples-orchestration-framework.md` (~4.8k est / ~7.1k max tokens) — Full worked example: intelligent zero-trust orchestration framework (TypeScript) — read when you need the reference implementation.
- `.ai-prompts/prompts/modules/deployment/zero-trust-deployment-architectures.detail-2-examples-kubernetes-zero-trust.md` (~1.7k est / ~2.6k max tokens) — Full worked example: Kubernetes zero-trust — namespace isolation, network policies, service mesh, pod security — read for K8s deployments.
- `.ai-prompts/prompts/modules/deployment/zero-trust-deployment-architectures.detail-3-examples-infrastructure-as-code.md` (~2.3k est / ~3.5k max tokens) — Full worked example: zero-trust as Terraform — VPC, IAM, WAF, CloudTrail, GuardDuty — read for AWS/IaC deployments.
- `.ai-prompts/prompts/modules/deployment/zero-trust-deployment-architectures.detail-4-instructions.md` (~1.4k est / ~2.2k max tokens) — Step-by-step setup: install tooling, define strategy, identity architecture, controls, continuous verification, monitoring.
- `.ai-prompts/prompts/modules/deployment/zero-trust-deployment-architectures.detail-5-implementation-patterns.md` (~3.3k est / ~5.0k max tokens) — Copy-pasteable patterns: Istio service-mesh config, OPA Rego policies — read when authoring policies or mesh config.
- `.ai-prompts/prompts/modules/deployment/zero-trust-deployment-architectures.detail-6-reference-output-integration.md` (~2.7k est / ~4.1k max tokens) — Expected outputs, integration points, security considerations, performance features — read for acceptance criteria and cross-cutting concerns.

Token budgets use one uniform heuristic: estimated tokens ≈ file bytes ÷ 4; max budget = ⌈est × 1.5⌉. Detail budgets are per-file, listed above.
