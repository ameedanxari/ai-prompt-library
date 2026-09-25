# Data Encryption Module

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
This module provides comprehensive data encryption capabilities for protecting sensitive information at rest and in transit. It implements industry-standard encryption algorithms, secure key management, and compliance with security regulations including GDPR, HIPAA, and SOC 2. The module ensures data confidentiality, integrity, and authenticity across web, mobile, and server environments while maintaining performance and usability.

## Instructions

### When to Use This Module
- Protecting sensitive user data (PII, financial information, health records)
- Implementing end-to-end encryption for communications
- Securing data storage in databases and file systems
- Meeting compliance requirements (GDPR, HIPAA, SOC 2, PCI DSS)
- Implementing secure authentication and session management

### Implementation Steps
1. **Choose Encryption Strategy**: Select appropriate algorithms and key management approach based on security requirements
2. **Implement Key Management**: Set up secure key generation, storage, rotation, and recovery processes
3. **Configure Data Encryption**: Implement encryption for data at rest and in transit
4. **Add Authentication**: Implement authenticated encryption to detect tampering
5. **Test Security**: Perform comprehensive security testing and compliance validation

### Key Security Decisions
- **Algorithm Selection**: AES-256-GCM for general use, ChaCha20-Poly1305 for high-performance scenarios
- **Key Derivation**: PBKDF2 (100,000+ iterations), Argon2id, or scrypt for password-based keys
- **Key Storage**: Platform-specific secure storage (Keychain, Keystore, HSM)
- **Transport Security**: TLS 1.3 for all network communications

### Security Approach
- **Defense in Depth**: Multiple layers of encryption and security controls
- **Zero-Knowledge Architecture**: Server cannot decrypt user data without user keys
- **Perfect Forward Secrecy**: Compromise of long-term keys doesn't affect past sessions
- **Authenticated Encryption**: Always use AEAD modes to detect tampering


## Expandable detail

This brief is the short core: what the module is, when to use it, and the essential checklist. The full substance lives in the expandable detail files below — load them via this brief when you need them.

- `.ai-prompts/prompts/modules/feature-patterns/security-encryption.detail-1-end-to-end-encryption.md` (~1.1k est / ~1.6k max tokens) — Complete end-to-end encryption system — read for the reference implementation.
- `.ai-prompts/prompts/modules/feature-patterns/security-encryption.detail-2-database-field-level.md` (~1.3k est / ~1.9k max tokens) — Database field-level encryption — read for encrypting data at rest per-field.
- `.ai-prompts/prompts/modules/feature-patterns/security-encryption.detail-3-mobile-secure-storage.md` (~1.4k est / ~2.2k max tokens) — Mobile secure storage implementation — read for iOS/Android key storage.
- `.ai-prompts/prompts/modules/feature-patterns/security-encryption.detail-4-compliance-encryption.md` (~1.9k est / ~2.9k max tokens) — Compliance-ready encryption (GDPR/HIPAA/SOC2) — read for regulated data.
- `.ai-prompts/prompts/modules/feature-patterns/security-encryption.detail-5-streaming-encryption.md` (~1.7k est / ~2.5k max tokens) — High-performance streaming encryption — read for media/large-payload encryption.
- `.ai-prompts/prompts/modules/feature-patterns/security-encryption.detail-6-requirements-reference.md` (~3.3k est / ~4.9k max tokens) — Overview, core implementation/testing requirements, monitoring, config, dependencies, docs — read for acceptance criteria.

Token budgets use one uniform heuristic: estimated tokens ≈ file bytes ÷ 4; max budget = ⌈est × 1.5⌉. Detail budgets are per-file, listed above.
