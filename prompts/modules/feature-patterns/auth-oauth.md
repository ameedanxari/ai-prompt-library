# OAuth 2.0 / OpenID Connect Authentication Module

## Purpose
Implement secure OAuth 2.0 / OpenID Connect authentication with production-ready security, accessibility, and internationalization features. This module provides comprehensive authentication capabilities that work across web and mobile platforms while maintaining the highest security standards.

## Instructions

### How to Use This Module

1. **Choose OAuth Provider**: Select appropriate OAuth provider (Google, GitHub, Auth0, etc.)
2. **Configure Security Settings**: Set up PKCE, state validation, and secure token storage
3. **Implement Platform-Specific Code**: Use provided templates for web or mobile implementation
4. **Add Accessibility Features**: Implement screen reader support and keyboard navigation
5. **Configure Internationalization**: Set up multi-language support for auth flows
6. **Set Up Monitoring**: Implement logging and metrics collection
7. **Test Thoroughly**: Run unit tests, integration tests, and accessibility tests
8. **Document Implementation**: Create user guides and troubleshooting documentation

### Implementation Steps

1. **Provider Setup**: Register application with OAuth provider and obtain credentials
2. **Security Configuration**: Implement PKCE, CSRF protection, and secure token storage
3. **UI Implementation**: Create accessible, internationalized authentication interfaces
4. **Flow Implementation**: Implement authorization code flow with proper error handling
5. **Token Management**: Set up secure token storage and refresh mechanisms
6. **Testing**: Implement comprehensive test suite including property-based tests
7. **Monitoring**: Set up authentication metrics and security logging

### Security Checklist

- [ ] PKCE implemented for authorization code flow
- [ ] State parameter validation for CSRF protection
- [ ] Secure token storage (no localStorage for sensitive tokens)
- [ ] Refresh token rotation implemented
- [ ] Rate limiting on authentication endpoints
- [ ] Comprehensive audit logging
- [ ] Session timeout and cleanup

## Examples

### Example 1: Google OAuth Implementation (Web)

```typescript
// oauth-config.ts
export const googleOAuthConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID!,
  redirectUri: `${process.env.APP_URL}/auth/callback`,
  scope: 'openid profile email',
  responseType: 'code',
  includeGrantedScopes: true,
};

// oauth-service.ts
import { generateCodeVerifier, generateCodeChallenge } from './crypto-utils';

export class GoogleOAuthService {
  private codeVerifier: string;
  private state: string;

  constructor() {
    this.codeVerifier = generateCodeVerifier();
    this.state = crypto.randomUUID();
  }

  getAuthorizationUrl(): string {
    const codeChallenge = generateCodeChallenge(this.codeVerifier);
    
    const params = new URLSearchParams({
      client_id: googleOAuthConfig.clientId,
      redirect_uri: googleOAuthConfig.redirectUri,
      scope: googleOAuthConfig.scope,
      response_type: googleOAuthConfig.responseType,
      state: this.state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    // Store state and code verifier securely
    sessionStorage.setItem('oauth_state', this.state);
    sessionStorage.setItem('code_verifier', this.codeVerifier);

    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  async handleCallback(code: string, state: string): Promise<AuthTokens> {
    // Validate state parameter
    const storedState = sessionStorage.getItem('oauth_state');
    if (state !== storedState) {
      throw new Error('Invalid state parameter - possible CSRF attack');
    }

    const codeVerifier = sessionStorage.getItem('code_verifier');
    if (!codeVerifier) {
      throw new Error('Code verifier not found');
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: googleOAuthConfig.clientId,
        code,
        code_verifier: codeVerifier,
        grant_type: 'authorization_code',
        redirect_uri: googleOAuthConfig.redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Token exchange failed');
    }

    const tokens = await tokenResponse.json();
    
    // Clean up temporary storage
    sessionStorage.removeItem('oauth_state');
    sessionStorage.removeItem('code_verifier');

    return tokens;
  }
}
```

### Example 2: GitHub OAuth Implementation (React Native)

```typescript
// github-oauth-native.ts
import * as SecureStore from 'expo-secure-store';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export class GitHubOAuthNative {
  private discovery = AuthSession.useAutoDiscovery('https://github.com');

  async authenticate(): Promise<AuthTokens> {
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'myapp',
      path: 'auth',
    });

    const request = new AuthSession.AuthRequest({
      clientId: process.env.GITHUB_CLIENT_ID!,
      scopes: ['user:email', 'read:user'],
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      state: crypto.randomUUID(),
      codeChallenge: await AuthSession.AuthRequest.createPKCEChallengeAsync(),
    });

    const result = await request.promptAsync(this.discovery);

    if (result.type === 'success') {
      const tokens = await this.exchangeCodeForTokens(
        result.params.code,
        request.codeVerifier!
      );
      
      // Store tokens securely
      await SecureStore.setItemAsync('access_token', tokens.access_token);
      await SecureStore.setItemAsync('refresh_token', tokens.refresh_token);
      
      return tokens;
    }

    throw new Error('Authentication failed');
  }

  private async exchangeCodeForTokens(code: string, codeVerifier: string): Promise<AuthTokens> {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID!,
        client_secret: process.env.GITHUB_CLIENT_SECRET!,
        code,
        code_verifier: codeVerifier,
      }),
    });

    return await response.json();
  }
}
```

### Example 3: Auth0 Implementation with Accessibility

```tsx
// auth0-login-component.tsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface LoginProps {
  onLogin: (provider: string) => void;
  loading: boolean;
}

export const AccessibleLoginComponent: React.FC<LoginProps> = ({ onLogin, loading }) => {
  const { t } = useTranslation();
  const [focusedProvider, setFocusedProvider] = useState<string | null>(null);

  const providers = [
    { id: 'google', name: 'Google', icon: '🔍' },
    { id: 'github', name: 'GitHub', icon: '🐙' },
    { id: 'microsoft', name: 'Microsoft', icon: '🪟' },
  ];

  return (
    <div 
      className="auth-container"
      role="main"
      aria-labelledby="login-heading"
    >
      <h1 id="login-heading" className="sr-only">
        {t('auth.login.heading')}
      </h1>
      
      <div className="auth-providers" role="group" aria-labelledby="providers-heading">
        <h2 id="providers-heading" className="providers-title">
          {t('auth.login.chooseProvider')}
        </h2>
        
        {providers.map((provider) => (
          <button
            key={provider.id}
            type="button"
            className={`provider-button ${focusedProvider === provider.id ? 'focused' : ''}`}
            onClick={() => onLogin(provider.id)}
            onFocus={() => setFocusedProvider(provider.id)}
            onBlur={() => setFocusedProvider(null)}
            disabled={loading}
            aria-describedby={`${provider.id}-description`}
            aria-label={t('auth.login.signInWith', { provider: provider.name })}
          >
            <span className="provider-icon" aria-hidden="true">
              {provider.icon}
            </span>
            <span className="provider-name">
              {t('auth.login.continueWith', { provider: provider.name })}
            </span>
            {loading && (
              <span className="loading-indicator" aria-label={t('auth.login.loading')}>
                ⏳
              </span>
            )}
          </button>
        ))}
        
        {providers.map((provider) => (
          <div
            key={`${provider.id}-description`}
            id={`${provider.id}-description`}
            className="sr-only"
          >
            {t('auth.login.providerDescription', { provider: provider.name })}
          </div>
        ))}
      </div>
      
      <div className="auth-footer">
        <p className="privacy-notice">
          {t('auth.login.privacyNotice')}
          <a href="/privacy" className="privacy-link">
            {t('auth.login.privacyPolicy')}
          </a>
        </p>
      </div>
    </div>
  );
};
```

### Example 4: Property-Based Test for Token Security

```typescript
// oauth-security.test.ts
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { OAuthService } from './oauth-service';

describe('OAuth Security Properties', () => {
  it('should never expose tokens in URLs or localStorage', () => {
    fc.assert(fc.property(
      fc.record({
        access_token: fc.string({ minLength: 10 }),
        refresh_token: fc.string({ minLength: 10 }),
        expires_in: fc.integer({ min: 300, max: 7200 }),
      }),
      (tokens) => {
        const oauthService = new OAuthService();
        oauthService.storeTokens(tokens);
        
        // Verify tokens are not in localStorage
        const localStorageKeys = Object.keys(localStorage);
        const hasTokenInLocalStorage = localStorageKeys.some(key => 
          localStorage.getItem(key)?.includes(tokens.access_token) ||
          localStorage.getItem(key)?.includes(tokens.refresh_token)
        );
        
        // Verify tokens are not in current URL
        const currentUrl = window.location.href;
        const hasTokenInUrl = currentUrl.includes(tokens.access_token) ||
                             currentUrl.includes(tokens.refresh_token);
        
        expect(hasTokenInLocalStorage).toBe(false);
        expect(hasTokenInUrl).toBe(false);
      }
    ));
  });

  it('should validate state parameter for CSRF protection', () => {
    fc.assert(fc.property(
      fc.string({ minLength: 10 }),
      fc.string({ minLength: 10 }),
      (originalState, maliciousState) => {
        fc.pre(originalState !== maliciousState);
        
        const oauthService = new OAuthService();
        oauthService.initiateAuth(originalState);
        
        // Attempt callback with different state should fail
        expect(() => {
          oauthService.handleCallback('auth_code', maliciousState);
        }).toThrow('Invalid state parameter');
      }
    ));
  });
});
```

## Overview
Implement secure OAuth 2.0 / OpenID Connect authentication with production-ready security, accessibility, and internationalization features.

## Core Implementation Requirements

### Authentication Flow
- Implement Authorization Code flow with PKCE for security
- Support refresh token rotation for enhanced security
- Include proper state parameter validation to prevent CSRF attacks
- Implement secure token storage (httpOnly cookies or secure storage)

### Security Features
- **CSRF Protection**: Validate state parameter in OAuth callback
- **Token Security**: Store access tokens securely, never in localStorage
- **Session Management**: Implement secure session handling with proper expiration
- **Rate Limiting**: Implement login attempt rate limiting to prevent brute force
- **Audit Logging**: Log all authentication events for security monitoring

### Accessibility Implementation
- **Screen Reader Support**: Proper ARIA labels for all auth forms
- **Keyboard Navigation**: Full keyboard accessibility for auth flows
- **Focus Management**: Proper focus handling during redirects and errors
- **High Contrast**: Support for high contrast mode in auth UI
- **Text Scaling**: Support up to 200% text scaling without horizontal scrolling

### Internationalization Support
- **Multi-language Auth**: Support for RTL and LTR languages in auth UI
- **Localized Errors**: Translate all error messages and validation text
- **Cultural Considerations**: Adapt auth flows for different cultural contexts
- **Timezone Handling**: Proper timezone handling for session expiration

### Offline & Network Resilience
- **Offline Detection**: Detect network status and show appropriate messaging
- **Token Refresh Retry**: Implement exponential backoff for token refresh failures
- **Graceful Degradation**: Provide limited functionality when auth services are unavailable
- **Connection Recovery**: Automatically retry authentication when connection is restored

### Platform-Specific Implementations

#### Web Implementation
```typescript
// OAuth configuration with security best practices
const oauthConfig = {
  clientId: process.env.OAUTH_CLIENT_ID,
  redirectUri: process.env.OAUTH_REDIRECT_URI,
  scope: 'openid profile email',
  responseType: 'code',
  codeChallenge: generatePKCEChallenge(),
  codeChallengeMethod: 'S256',
  state: generateSecureState()
};

// Secure token storage
const tokenStorage = {
  setTokens: (tokens) => {
    // Store in httpOnly cookies or secure storage
    document.cookie = `access_token=${tokens.access_token}; HttpOnly; Secure; SameSite=Strict`;
  },
  getAccessToken: () => {
    // Retrieve from secure storage
    return getSecureCookie('access_token');
  }
};
```

#### Mobile Implementation
```typescript
// React Native / Flutter secure storage
import { SecureStore } from 'expo-secure-store';

const mobileTokenStorage = {
  setTokens: async (tokens) => {
    await SecureStore.setItemAsync('access_token', tokens.access_token);
    await SecureStore.setItemAsync('refresh_token', tokens.refresh_token);
  },
  getAccessToken: async () => {
    return await SecureStore.getItemAsync('access_token');
  }
};
```

## Testing Requirements

### Unit Tests
- Test OAuth flow state management
- Test token validation and refresh logic
- Test error handling for various OAuth error responses
- Test PKCE challenge generation and validation

### Property-Based Tests
- **Token Security Property**: For any valid token, it should be stored securely and never exposed in URLs or localStorage
- **Session Validity Property**: For any authenticated session, it should properly expire and require re-authentication
- **CSRF Protection Property**: For any OAuth callback, it should validate the state parameter matches the original request

### Accessibility Tests
- Test screen reader compatibility with auth forms
- Test keyboard-only navigation through auth flows
- Test high contrast mode compatibility
- Test with 200% text scaling

### Integration Tests
- Test complete OAuth flow from login to authenticated state
- Test token refresh flow
- Test logout and session cleanup
- Test error scenarios (network failures, invalid tokens, etc.)

## Monitoring & Observability

### Metrics to Track
- Authentication success/failure rates
- Token refresh success rates
- Session duration analytics
- Login attempt patterns (for security monitoring)

### Logging Requirements
- Log all authentication events with user ID and timestamp
- Log security events (failed logins, suspicious activity)
- Log performance metrics (auth flow completion time)
- Ensure logs comply with privacy regulations (no sensitive data)

## Configuration Variables
- `{{auth_provider}}` - OAuth provider (google, github, auth0, etc.)
- `{{client_id}}` - OAuth client ID
- `{{redirect_uri}}` - OAuth redirect URI
- `{{scopes}}` - Required OAuth scopes
- `{{security_level}}` - Security level (basic, enhanced, enterprise)

## Dependencies
- OAuth 2.0 / OpenID Connect library for chosen platform
- Secure storage library (platform-specific)
- Cryptographic library for PKCE and state generation
- Accessibility testing tools
- Internationalization framework

## Documentation Requirements
- API documentation for authentication endpoints
- Security documentation for token handling
- User guide for authentication flows
- Troubleshooting guide for common auth issues