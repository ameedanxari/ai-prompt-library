## Purpose

Guidelines for constructing robust prompts, templates, and input sanitization for LLMs.

## Implementation Patterns

### Pattern 1: Template + Validation
Use templates and validate inputs before sending to LLM.

### Pattern 2: Instruction Layering
Provide system, assistant, and user layers for clearer behavior.

## Examples

```markdown
Example: Use system prompt to constrain output format and include JSON schema for parsing
```


## Deep Dive
Prompt engineering is not just about writing text; it's about designing interactions that the model can reliably follow. Structure prompts with clear role instructions, examples, and explicit format constraints. When expecting structured output, include JSON schemas or code fences in the system prompt. Use temperature controls and sampling parameters judiciously; for deterministic tasks, set temperature to 0. Carefully guard against prompt injection by escaping user text and by limiting the model's ability to access hidden instructions.

## Examples

```markdown
System: You are a code generator. Output must be valid JSON matching the provided schema.
User: Generate a JSON object with fields "name" (string) and "age" (integer).
```
