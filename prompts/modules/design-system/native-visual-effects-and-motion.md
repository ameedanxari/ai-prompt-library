# Design System: Native Visual Effects and Motion

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

Translate requests such as "liquid glass", translucent surfaces, native
materials, aesthetic animations, and artful minimalist UI into
platform-appropriate design-system tasks.

## Context

Use native visual effects as a design direction, not as a license to make
both platforms look identical. iOS and Android should share product
semantics, tokens, and motion principles while preserving native platform
expectations.

## Core Components

```typescript
interface NativeVisualEffectsSpec {
  surfaceTokens: string[];
  materialTreatment: "solid" | "blurred" | "translucent" | "tonal";
  depthRules: string[];
  motionTokens: string[];
  reducedMotionFallback: string;
  platformNotes: {
    ios: string;
    android: string;
  };
}
```

## Implementation Requirements

1. Define semantic surface tokens before screen implementation:
   base surface, elevated surface, translucent/glass surface, border,
   highlight, shadow, destructive, success, and dimmed overlay.
2. For iOS, prefer native material/translucency APIs available to the
   target OS and keep Dynamic Type, VoiceOver, contrast, and Reduce Motion
   behavior intact.
3. For Android, use Material-native equivalents: tonal surfaces, dynamic
   color when appropriate, blur only where performant and platform-safe,
   and Compose animation primitives with reduced-motion fallbacks.
4. Avoid low-contrast glassmorphism. Every translucent treatment must have
   a contrast-tested fallback surface.
5. Define motion tokens for short, medium, and emphasized transitions.
   Animated cleanup decisions must have predictable duration, reversible
   undo behavior, and reduced-motion alternatives.
6. Preserve existing product theme and component conventions when present.

## Integration Points

- Token architecture defines material, motion, shadow, and overlay tokens.
- Component implementation pattern maps states to tokenized surfaces.
- Screen fidelity audit validates blur/translucency, depth, reduced motion,
  dark mode, and native platform adaptation.
- UI reference source maps cite visual-effect references as inspiration
  only, with a non-copy boundary.

## Security and Accessibility Considerations

- Never make destructive actions less legible for aesthetic reasons.
- Do not animate sensitive thumbnails in a way that exposes content in
  app switchers, screenshots, or notification previews.
- Respect Reduce Motion, high contrast, Dynamic Type, TalkBack, VoiceOver,
  and minimum touch target requirements.
- Ensure glass/translucent surfaces remain readable over light, dark, and
  media-heavy backgrounds.

## Testing Considerations

- Screenshot-test light and dark themes for glass/translucent surfaces.
- Test reduced-motion paths for every animated review, delete, undo, and
  completion flow.
- Test contrast over representative media thumbnails and solid fallback
  backgrounds.
- Test platform-specific behavior separately on iOS and Android instead
  of asserting pixel parity between platforms.

## Acceptance Criteria

- Visual effects are tokenized and platform-native.
- Liquid-glass-style requests become concrete surface, depth, and motion
  rules.
- Reduced-motion and contrast fallbacks are explicit.
- iOS and Android preserve native conventions while sharing product
  semantics.

