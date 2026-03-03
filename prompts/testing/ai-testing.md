## Purpose

This document describes practical testing strategies for AI-driven features (LLM integrations, code generation pipelines, autonomous agents). The goal is to make tests reliable, reproducible, and actionable despite inherent non-determinism in model outputs.

## Implementation Patterns

### Pattern 1: Controlled Context & Deterministic Inputs
Use sanitized, minimal contexts and fixed seeds when the model/provider supports it. For external APIs, mock network calls and replace real tokens with test tokens to ensure predictable costs.

Key steps:
- Isolate the model call behind an interface so it can be swapped for a deterministic mock in tests.
- Provide minimal, canonical context examples to reduce output variance.
- When the provider supports sampling/temperature controls, fix them to deterministic settings in CI.

### Pattern 2: Golden-File + Tolerance Matching
Store expected structured outputs (JSON, AST, or canonical code) as golden files. Rather than exact string equality, validate structural equivalence with tolerance rules (ignore whitespace, compare AST, or parse and validate against schema).

Key steps:
- Parse LLM output into a structured form (JSON, AST) before comparing.
- Define allowed deltas (e.g., variable names may differ, but function signatures must match).
- If mismatches occur, capture diff and fail with helpful assertion output.

### Pattern 3: Property-Based and Behavioral Tests
For generated code or agent actions, write property-based tests that assert behavior rather than exact content. Examples: function idempotency, API contract conformance, and performance bounds.

Key steps:
- Define invariants (e.g., inputs produce outputs within allowed ranges).
- Use random but constrained inputs to exercise edge cases.
- Fail tests only when invariants break, not for stylistic differences.

### Pattern 4: Canary and Integration Runs
Run full integration tests with real model endpoints only in gated CI or nightly runs to catch drift early while limiting cost.

Key steps:
- Isolate integration runs from fast CI. Use tags like `integration` or `nightly`.
- Track token usage and abort long-running or expensive tests.

## Examples

1) Deterministic unit test (pseudo-code):

```python
# test_generator.py
def test_generate_user_dto_with_mocked_llm():
	llm = MockLLM(return_value=EXPECTED_JSON)
	generator = CodeGenerator(llm=llm)
	result = generator.generate(spec)
	assert json.loads(result) == json.loads(EXPECTED_JSON)
```

2) Golden file structural comparison (pseudo-code):

```bash
# generate output
node scripts/generate.js --spec specs/user-dto.json > out/tmp_user_dto.json
# compare structurally (ignoring whitespace and formatting)
python scripts/assert_structural_eq.py out/tmp_user_dto.json golden/user_dto.json
```

3) Property-based test example using hypotheses (Python):

```python
from hypothesis import given, strategies as st

@given(st.text(min_size=1, max_size=100))
def test_idempotent_serialization(input_text):
	parsed = parse_business_entity(input_text)
	serialized = serialize_entity(parsed)
	reparsed = parse_business_entity(serialized)
	assert reparsed == parsed
```

These patterns make tests actionable: when failures occur, test output should point to a clear remediation path (fix generator, adjust template, or update expected golden file).

