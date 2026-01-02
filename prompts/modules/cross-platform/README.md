# Cross-Platform Modules

## Purpose
Modules for ensuring feature parity, consistent user experience, and optimal platform-specific implementations across web, mobile, and backend platforms.

## Instructions
Use these cross-platform modules to maintain consistency while optimizing for each platform's unique characteristics. These modules help balance unified user experience with platform-specific best practices.

1. **Establish Parity Matrix**: Define what features should be consistent across platforms
2. **Document Platform Differences**: Clearly specify where platforms should differ
3. **Create Shared Contracts**: Define common APIs and data models
4. **Implement Platform Optimizations**: Optimize for each platform's strengths
5. **Validate Cross-Platform Experience**: Test consistency and platform-specific functionality

## Examples

### Cross-Platform Feature Parity Example
```markdown
## Feature: User Authentication

### Parity Matrix
| Feature | Web | Mobile | Backend |
|---------|-----|--------|---------|
| Email/Password Login | ✅ | ✅ | ✅ |
| Social Login (Google) | ✅ | ✅ | ✅ |
| Biometric Authentication | ❌ | ✅ | N/A |
| Remember Me | ✅ | ✅ (Auto) | ✅ |
| Password Reset | ✅ | ✅ | ✅ |
| Multi-Factor Auth | ✅ | ✅ | ✅ |

### Platform-Specific Implementations
**Web Platform**:
- Browser-based password managers integration
- Keyboard navigation support
- Progressive enhancement for older browsers
- Session management with secure cookies

**Mobile Platform**:
- Biometric authentication (Touch ID, Face ID)
- Deep linking for password reset
- Push notifications for security alerts
- Secure keychain storage

**Backend Platform**:
- JWT token management
- Rate limiting for login attempts
- Audit logging for security events
- Multi-device session management

### Shared Contracts
```typescript
// Common authentication interface
interface AuthenticationResult {
  success: boolean;
  user?: User;
  token?: string;
  requiresMFA?: boolean;
  error?: string;
}

// Platform-agnostic user model
interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  preferences: UserPreferences;
}
```

### Platform Optimizations
**Web Optimizations**:
- Lazy loading for non-critical auth components
- Progressive Web App capabilities
- Offline authentication state management
- SEO-friendly authentication flows

**Mobile Optimizations**:
- Native authentication UI patterns
- Biometric integration with fallbacks
- Offline authentication caching
- Platform-specific security features
```

### Cross-Platform Design System Example
```markdown
## Design System: Cross-Platform Components

### Shared Design Tokens
```json
{
  "colors": {
    "primary": "#2563eb",
    "secondary": "#10b981",
    "error": "#ef4444",
    "warning": "#f59e0b"
  },
  "typography": {
    "fontFamily": {
      "web": "Inter, system-ui, sans-serif",
      "mobile": "System"
    },
    "sizes": {
      "xs": "12px",
      "sm": "14px",
      "base": "16px",
      "lg": "18px",
      "xl": "20px"
    }
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px"
  }
}
```

### Platform-Specific Adaptations
**Web Components**:
- CSS-in-JS with responsive breakpoints
- Hover states and focus indicators
- Keyboard navigation support
- Browser-specific optimizations

**Mobile Components**:
- Touch-friendly sizing (44px minimum)
- Platform-specific navigation patterns
- Native gesture support
- Accessibility features (VoiceOver, TalkBack)

### Component Consistency Rules
1. **Visual Consistency**: Same colors, typography, and spacing across platforms
2. **Functional Consistency**: Same core functionality with platform-appropriate interactions
3. **Accessibility Consistency**: Equivalent accessibility features on all platforms
4. **Performance Consistency**: Similar performance characteristics across platforms
```

## Available Modules

### Parity Management
- [parity-matrix.md](./parity-matrix.md) - Feature capability matrix across platforms
- [parity-validation-tests.md](./parity-validation-tests.md) - Cross-platform validation testing
- [parity-documentation.md](./parity-documentation.md) - Platform difference documentation
- [shared-contracts.md](./shared-contracts.md) - API contracts and data model specifications
- [parity-dry-run.md](./parity-dry-run.md) - Dry-run validation for parity testing
- [parity-verification-tasks.md](./parity-verification-tasks.md) - Verification task generation

### Related Modules
- [Testing Modules](../testing/README.md) - Mock data and fake backend integration
- [Feature Patterns](../feature-patterns/README.md) - Common feature templates

## Usage Pattern
```markdown
#[[module:cross-platform/parity-matrix.md|platforms={{target_platforms}}]]
#[[module:cross-platform/shared-contracts.md|api_version={{version}}]]
```

## Integration Strategy
Cross-platform modules ensure:
- Consistent functionality across all target platforms
- Platform-specific optimizations where beneficial
- Shared business logic and data models
- Unified user experience with platform-appropriate adaptations