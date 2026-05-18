# Technology Stack: Mobile OS Capability Matrix

<!-- INSTANTIATION RULES
When the drill-down engine (or any orchestrator) uses this template:
1. Every placeholder, including {{variables}}, <TBD>, [project name], and generic
   field/function/endpoint names, MUST be replaced with project-specific values
   before output is written to prompts/outputs/current/.
2. The template filename MUST NOT appear in task output. Dissolve the template
   into concrete content; do not reference its source.
3. No strings beginning with ".ai-prompts/prompts/" may appear in the output
   (validated by scripts/validate-instantiation.sh).
4. Outputs must contain real data shapes, real endpoints, real file paths, and
   real function signatures specific to the project.
-->

## Purpose

Prevent mobile tasks from promising features the operating system, app-store
policy, or permission model does not allow.

## Context

Use this module for native iOS/Android apps that interact with photos,
videos, storage, memory, sensors, device files, background processing,
system settings, or other OS-controlled capabilities.

## Core Components

```typescript
interface MobileCapabilityRow {
  feature: string;
  iosSupport: "supported" | "limited" | "unsupported";
  androidSupport: "supported" | "limited" | "unsupported";
  requiredPermissions: string[];
  osApi: string[];
  fallbackBehavior: string;
  userFacingCopyConstraint: string;
  storePolicyRisk: string;
}
```

## Required Artifact

For storage, media, memory cleanup, or OS-controlled mobile features, tasks
must include or reference an OS capability matrix with these columns:

| Feature | iOS Support | Android Support | Required Permissions | OS API | Fallback Behavior | User-Facing Copy Constraint | Store Policy Risk |
|---|---|---|---|---|---|---|---|

## Implementation Requirements

1. Declare every OS-controlled feature before implementation.
2. Mark unsupported capabilities as non-goals or guidance-only flows.
3. Include platform-specific permissions and APIs.
4. Provide fallback behavior when a platform restricts the capability.
5. Define user-facing copy constraints so the product does not overpromise.
6. Include store-policy risks for sensitive permissions.

## Storage Cleaner Rules

- iOS supports user-authorized Photos library inspection and deletion, but
  does not support clearing other apps' caches or system RAM.
- Android supports shared media inspection through scoped storage APIs, but
  consumer cleanup apps should not request broad file-management privileges
  unless the policy case is explicit and justified.
- Both platforms require honest UX around permission-denied, limited-access,
  and partial-cleanup states.
- "Memory cleanup" should be scoped to app-owned cache cleanup, storage
  insights, and OS settings guidance unless a platform API clearly supports
  the requested action.

## Integration Points

- Native storage cleanup tasks use this matrix before file/API decisions.
- App-store release tasks use the matrix for privacy labels and permission
  explanations.
- Validator checks can reject cleanup tasks that mention storage/memory
  cleanup without matrix language.

## Security Considerations

- Do not request broader permissions than the declared capability needs.
- Do not hide unsupported behavior behind misleading copy.
- Do not collect or transmit user media metadata to work around local OS
  restrictions.

## Testing Considerations

- Test supported, limited, denied, and unsupported capability states.
- Test copy shown for unsupported features.
- Static-check iOS entitlements and Android manifest permissions against
  the capability matrix.
- Add app-store review notes for sensitive permissions.

## Acceptance Criteria

- Every OS-controlled mobile feature has platform support, permissions,
  API, fallback, copy, and policy-risk decisions.
- Unsupported cleanup claims are removed or converted to guidance.
- Tests verify permission and unsupported-capability states.

