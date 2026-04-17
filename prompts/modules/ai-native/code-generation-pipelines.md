# AI-Powered Code Generation Pipelines

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
End-to-end pipelines for generating production-ready code from specifications, including validation, testing, and deployment automation.

## Implementation Patterns

### Pattern 1: Specification-to-Code Pipeline
Generate code directly from specifications with validation.

**Implementation**:
1. Load specification (format, constraints, examples)
2. Generate prompt: "Implement [spec] with acceptance criteria [...]"
3. LLM generates code
4. Validate against spec (format check, constraint check, example verification)
5. If invalid, re-generate with validation feedback
6. Return validated code

### Pattern 2: Incremental Refinement Pipeline
Generate code, validate, and iteratively refine based on failures.

**Implementation**:
1. Generate initial code from spec
2. Run unit tests from spec examples
3. If tests pass, return code
4. If fail, capture failures
5. Re-generate with failure details: "Tests failed: [failures]. Fix the code."
6. Run tests again (up to N iterations)
7. Return best result or log failure

### Pattern 3: Multi-Stage Code Generation
Generate code through multiple stages: skeleton, implementation, optimization, documentation.

**Implementation**:
1. Stage 1 (Skeleton): Generate class/function stubs
2. Stage 2 (Implementation): Fill in method bodies
3. Stage 3 (Optimization): Optimize hot paths
4. Stage 4 (Documentation): Add comments and docstrings
5. Validate at each stage; bail if quality insufficient

## Core Pipeline

```typescript
class CodeGenerationPipeline {
  async generateFromSpec(spec: Specification): Promise<GeneratedProject> {
    // Stage 1: Generate code with COVE
    const code = await this.generateWithVerification(spec);
    
    // Stage 2: Generate tests
    const tests = await this.generateTests(code, spec);
    
    // Stage 3: Validate
    const validation = await this.validate(code, tests);
    if (!validation.passed) {
      return this.regenerateWithFeedback(spec, validation.issues);
    }
    
    // Stage 4: Generate documentation
    const docs = await this.generateDocs(code, spec);
    
    // Stage 5: Package for deployment
    return {
      code,
      tests,
      docs,
      config: await this.generateConfig(spec),
      ci: await this.generateCI(spec)
    };
  }
  
  private async generateWithVerification(spec: Specification): Promise<Code> {
    // Apply COVE for critical code
    const draft = await this.llm.generateCode(spec);
    const verified = await this.cove.verify(draft, spec);
    return verified.code;
  }
}
```

## Best Practices

1. **Use COVE** for all generated code
2. **Generate tests automatically** for validation
3. **Run in sandbox** before deployment
4. **Version all generated artifacts**
5. **Track generation metrics** for improvement

## Related Modules

- `ai-native/llm-integration.md`
- `testing/test-automation.md`
- `deployment/ci-cd-pipelines.md`

## Examples

### Example 1: Spec-to-Code Generation
Specification: "Create UserDTO class with validation"

Pipeline:
1. Input Spec: { name: string, email: string (unique), age: number (18-120) }
2. Generate: UserDTO class with Codable, annotations
3. Validate: Against spec - has name, email (unique), age (range check)
4. Test: `UserDTO(name: "John", email: "john@example.com", age: 30)` ✅
5. Test: `UserDTO(name: "John", email: "john@example.com", age: 10)` ❌ age out of range
6. Output: Validated code

