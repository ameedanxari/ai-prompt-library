## Purpose

Security practices for AI-driven systems, focusing on minimizing data exposure, preventing prompt injection, and ensuring safe model usage in production.

## Implementation Patterns

### Pattern 1: Input Validation & Prompt Hardening
Treat model inputs as untrusted data. Sanitize user-provided text, strip or mask PII, and normalize encodings. Use prompt templates that constrain allowed output formats and never inject raw user text into system instructions.

Key steps:
- Normalize inputs and remove control characters.
- Validate types and lengths; reject inputs that exceed safe limits.
- Apply escaping to prevent markdown/code injection when rendering into prompts.

### Pattern 2: Model Access Control & Auditing
Enforce least-privilege API keys, segregate test and production keys, and log all model calls with sufficient context for audit and debugging.

Key steps:
- Use role-based keys and rotate them regularly.
- Log request metadata (actor, repo, prompt hash, truncated prompt) to an audit store.
- Mask PII in logs and provide redaction utilities.

### Pattern 3: Output Validation & Safety Filters
Validate model outputs against schemas and safety rules. Reject or flag outputs that violate policies or contain unsafe content.

Key steps:
- Define output schema (JSON, code AST) and validate parseability.
- Run safety checks: profanity, PII leakage, or disallowed instructions.
- If output fails, re-prompt with stricter constraints or escalate to human review.

## Examples

1) Prompt hardening example (pseudo):

```python
def safe_prompt(user_text):
		safe_text = sanitize(user_text)
		return f"System: Follow these rules...\nUser: {safe_text}"
```

2) Audit logging snippet (pseudo):

```python
audit.log({
	'actor': actor_id,
	'prompt_hash': sha256(prompt),
	'timestamp': now(),
	'repo': repo_name,
})
```

