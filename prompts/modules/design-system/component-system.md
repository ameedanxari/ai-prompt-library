# Design System: Component System

## Purpose
Define a reusable component library aligned to the product’s mockups and interaction patterns.

## Instructions
1. Identify core primitives: button, input, card, modal, list, nav, table, badge, toast, tabs.
2. Define each component’s variants, states, and behavior contracts.
3. Map each component to token usage and accessibility requirements.
4. Document platform differences while preserving semantic parity.
5. Produce implementation guidance that can be turned into tasks directly.

## Required Output Sections
Ensure `design-system-component-catalog.md` includes:
- Component inventory table
- Variant/state matrix
- Token usage map per component
- Interaction/accessibility notes
- Dependencies and composition rules

## Acceptance Criteria
- Every major screen can be composed using the cataloged components.
- No high-priority screen depends on undefined components.
- State behavior (loading/error/disabled/empty) is specified for core components.
