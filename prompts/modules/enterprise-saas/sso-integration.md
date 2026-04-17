# Enterprise SSO Integration Template

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

This template provides comprehensive patterns for integrating enterprise Single Sign-On (SSO) solutions including SAML 2.0, OpenID Connect (OIDC), OAuth 2.0, and enterprise identity providers like Active Directory, Azure AD, Okta, and Ping Identity. It covers authentication flows, user provisioning, attribute mapping, and security considerations for B2B SaaS applications.

## Context

Enterprise customers require seamless integration with their existing identity infrastructure. This template addresses the complexities of multiple SSO protocols, user lifecycle management, attribute synchronization, and security requirements while maintaining a consistent user experience across different identity providers.

## Core Components

### SSO Provider Management

## Examples

```typescript
interface SSOProviderManager {
  createProvider(tenantId: string, providerConfig: SSOProviderConfig): Promise<SSOProvider>;
  updateProvider(tenantId: string, providerId: string, updates: SSOProviderUpdate): Promise<SSOProvider>;
  deleteProvider(tenantId: string, providerId: string): Promise<void>;
  getProviders(tenantId: string): Promise<SSOProvider[]>;
  testConnection(tenantId: string, providerId: string): Promise<ConnectionTestResult>;
}

interface SSOProvider {
  id: string;
  tenantId: string;
  name: string;
  type: SSOProviderType;
  protocol: SSOProtocol;
  configuration: ProviderConfiguration;
  attributeMapping: AttributeMapping;
  userProvisioning: ProvisioningConfig;
  isActive: boolean;
  isDefault: boolean;
  metadata: ProviderMetadata;
  createdAt: Date;
  updatedAt: Date;
}

enum SSOProviderType {
  ACTIVE_DIRECTORY = 'active_directory',
  AZURE_AD = 'azure_ad',
  OKTA = 'okta',
  PING_IDENTITY = 'ping_identity',
  GOOGLE_WORKSPACE = 'google_workspace',
  ONELOGIN = 'onelogin',
  AUTH0 = 'auth0',
  CUSTOM_SAML = 'custom_saml',
  CUSTOM_OIDC = 'custom_oidc'
}

enum SSOProtocol {
  SAML2 = 'saml2',
  OIDC = 'oidc',
  OAUTH2 = 'oauth2',
  LDAP = 'ldap'
}

interface ProviderConfiguration {
  // SAML Configuration
  saml?: SAMLConfiguration;
  // OIDC Configuration
  oidc?: OIDCConfiguration;
  // OAuth2 Configuration
  oauth2?: OAuth2Configuration;
  // LDAP Configuration
  ldap?: LDAPConfiguration;
}
```

### SAML 2.0 Integration

```typescript
interface SAMLConfiguration {
  entityId: string;
  ssoUrl: string;
  sloUrl?: string;
  certificate: string;
  signatureAlgorithm: SignatureAlgorithm;
  digestAlgorithm: DigestAlgorithm;
  nameIdFormat: NameIdFormat;
  wantAssertionsSigned: boolean;
  wantResponseSigned: boolean;
  signRequests: boolean;
  encryptAssertions: boolean;
  attributeConsumingServiceIndex?: number;
}

interface SAMLAuthenticationService {
  initiateSSO(tenantId: string, providerId: string, relayState?: string): Promise<SAMLRequest>;
  handleSSOResponse(tenantId: string, samlResponse: string, relayState?: string): Promise<AuthenticationResult>;
  initiateSLO(tenantId: string, providerId: string, sessionIndex: string): Promise<SAMLLogoutRequest>;
  handleSLOResponse(tenantId: string, samlResponse: string): Promise<LogoutResult>;
  generateMetadata(tenantId: string, providerId: string): Promise<string>;
}

class SAMLServiceProvider implements SAMLAuthenticationService {
  async initiateSSO(tenantId: string, providerId: string, relayState?: string): Promise<SAMLRequest> {
    const provider = await this.ssoProviderManager.getProvider(tenantId, providerId);
    if (!provider.configuration.saml) {
      throw new InvalidProviderError('Provider is not configured for SAML');
    }
    
    const samlConfig = provider.configuration.saml;
    const requestId = this.generateRequestId();
    const timestamp = new Date().toISOString();
    
    const authnRequest = this.buildAuthnRequest({
      id: requestId,
      issueInstant: timestamp,
      destination: samlConfig.ssoUrl,
      issuer: this.getServiceProviderEntityId(tenantId),
      nameIdPolicy: {
        format: samlConfig.nameIdFormat,
        allowCreate: true
      },
      requestedAuthnContext: {
        authnContextClassRef: 'urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport',
        comparison: 'minimum'
      }
    });
    
    // Sign the request if required
    const signedRequest = samlConfig.signRequests 
      ? await this.signSAMLRequest(authnRequest, provider)
      : authnRequest;
    
    // Store request for validation
    await this.samlRequestStore.store(requestId, {
      tenantId,
      providerId,
      relayState,
      timestamp: new Date()
    });
    
    return {
      id: requestId,
      xml: signedRequest,
      redirectUrl: this.buildRedirectUrl(samlConfig.ssoUrl, signedRequest, relayState)
    };
  }

  async handleSSOResponse(tenantId: string, samlResponse: string, relayState?: string): Promise<AuthenticationResult> {
    try {
      // Decode and parse SAML response
      const decodedResponse = Buffer.from(samlResponse, 'base64').toString('utf-8');
      const parsedResponse = await this.parseSAMLResponse(decodedResponse);
      
      // Validate response
      await this.validateSAMLResponse(tenantId, parsedResponse);
      
      // Extract user attributes
      const userAttributes = this.extractUserAttributes(parsedResponse);
      
      // Map attributes to user profile
      const provider = await this.ssoProviderManager.getProvider(tenantId, parsedResponse.issuer);
      const mappedUser = await this.mapUserAttributes(provider.attributeMapping, userAttributes);
      
      // Provision or update user
      const user = await this.provisionUser(tenantId, mappedUser, provider.userProvisioning);
      
      // Create session
      const session = await this.sessionManager.createSession({
        tenantId,
        userId: user.id,
        providerId: provider.id,
        sessionIndex: parsedResponse.sessionIndex,
        attributes: userAttributes,
        expiresAt: this.calculateSessionExpiry(parsedResponse)
      });
      
      return {
        success: true,
        user,
        session,
        redirectUrl: this.buildPostLoginRedirectUrl(tenantId, relayState)
      };
      
    } catch (error) {
      await this.auditService.logFailedAuthentication(tenantId, {
        error: error.message,
        samlResponse: samlResponse.substring(0, 100) // Log partial response for debugging
      });
      
      throw new SAMLAuthenticationError(`SAML authentication failed: ${error.message}`);
    }
  }
}
```

### OpenID Connect Integration

```typescript
interface OIDCConfiguration {
  clientId: string;
  clientSecret: string;
  discoveryUrl: string;
  scope: string[];
  responseType: string;
  responseMode?: string;
  prompt?: string;
  maxAge?: number;
  uiLocales?: string[];
  acrValues?: string[];
  customParameters?: Record<string, string>;
}

interface OIDCAuthenticationService {
  initiateAuthentication(tenantId: string, providerId: string, state?: string): Promise<OIDCAuthRequest>;
  handleCallback(tenantId: string, code: string, state: string): Promise<AuthenticationResult>;
  refreshToken(tenantId: string, refreshToken: string): Promise<TokenRefreshResult>;
  getUserInfo(tenantId: string, accessToken: string): Promise<UserInfo>;
  logout(tenantId: string, providerId: string, idToken: string): Promise<LogoutResult>;
}

class OIDCRelyingParty implements OIDCAuthenticationService {
  async initiateAuthentication(tenantId: string, providerId: string, state?: string): Promise<OIDCAuthRequest> {
    const provider = await this.ssoProviderManager.getProvider(tenantId, providerId);
    if (!provider.configuration.oidc) {
      throw new InvalidProviderError('Provider is not configured for OIDC');
    }
    
    const oidcConfig = provider.configuration.oidc;
    const discovery = await this.getProviderDiscovery(oidcConfig.discoveryUrl);
    
    const authParams = {
      client_id: oidcConfig.clientId,
      response_type: oidcConfig.responseType,
      scope: oidcConfig.scope.join(' '),
      redirect_uri: this.getRedirectUri(tenantId, providerId),
      state: state || this.generateState(),
      nonce: this.generateNonce(),
      ...oidcConfig.customParameters
    };
    
    // Store state for validation
    await this.oidcStateStore.store(authParams.state, {
      tenantId,
      providerId,
      nonce: authParams.nonce,
      timestamp: new Date()
    });
    
    const authUrl = this.buildAuthorizationUrl(discovery.authorization_endpoint, authParams);
    
    return {
      authUrl,
      state: authParams.state,
      nonce: authParams.nonce
    };
  }

  async handleCallback(tenantId: string, code: string, state: string): Promise<AuthenticationResult> {
    // Validate state
    const storedState = await this.oidcStateStore.get(state);
    if (!storedState || storedState.tenantId !== tenantId) {
      throw new InvalidStateError('Invalid or expired state parameter');
    }
    
    const provider = await this.ssoProviderManager.getProvider(tenantId, storedState.providerId);
    const oidcConfig = provider.configuration.oidc!;
    const discovery = await this.getProviderDiscovery(oidcConfig.discoveryUrl);
    
    // Exchange code for tokens
    const tokenResponse = await this.exchangeCodeForTokens({
      code,
      clientId: oidcConfig.clientId,
      clientSecret: oidcConfig.clientSecret,
      redirectUri: this.getRedirectUri(tenantId, storedState.providerId),
      tokenEndpoint: discovery.token_endpoint
    });
    
    // Validate ID token
    const idTokenPayload = await this.validateIdToken(
      tokenResponse.id_token,
      oidcConfig,
      discovery,
      storedState.nonce
    );
    
    // Get user info if needed
    const userInfo = tokenResponse.access_token 
      ? await this.getUserInfo(tenantId, tokenResponse.access_token)
      : null;
    
    // Combine claims from ID token and user info
    const userClaims = { ...idTokenPayload, ...userInfo };
    
    // Map claims to user profile
    const mappedUser = await this.mapUserAttributes(provider.attributeMapping, userClaims);
    
    // Provision or update user
    const user = await this.provisionUser(tenantId, mappedUser, provider.userProvisioning);
    
    // Create session
    const session = await this.sessionManager.createSession({
      tenantId,
      userId: user.id,
      providerId: provider.id,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      idToken: tokenResponse.id_token,
      expiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000)
    });
    
    return {
      success: true,
      user,
      session,
      tokens: tokenResponse
    };
  }
}
```

### User Provisioning and Lifecycle Management

```typescript
interface UserProvisioningService {
  provisionUser(tenantId: string, userProfile: MappedUserProfile, config: ProvisioningConfig): Promise<User>;
  updateUser(tenantId: string, userId: string, updates: UserProfileUpdate): Promise<User>;
  deactivateUser(tenantId: string, userId: string): Promise<void>;
  syncUserAttributes(tenantId: string, userId: string, attributes: UserAttributes): Promise<User>;
  handleUserLifecycleEvent(event: UserLifecycleEvent): Promise<void>;
}

interface ProvisioningConfig {
  autoProvision: boolean;
  updateOnLogin: boolean;
  deactivateOnRemoval: boolean;
  defaultRoles: string[];
  groupMapping: GroupMapping[];
  attributeMapping: AttributeMapping;
  provisioningRules: ProvisioningRule[];
}

interface AttributeMapping {
  email: AttributeMap;
  firstName: AttributeMap;
  lastName: AttributeMap;
  displayName: AttributeMap;
  department?: AttributeMap;
  title?: AttributeMap;
  manager?: AttributeMap;
  groups?: AttributeMap;
  customAttributes?: Record<string, AttributeMap>;
}

interface AttributeMap {
  source: string;
  transform?: AttributeTransform;
  required: boolean;
  defaultValue?: string;
}

class AutoProvisioningService implements UserProvisioningService {
  async provisionUser(tenantId: string, userProfile: MappedUserProfile, config: ProvisioningConfig): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userService.findUserByEmail(tenantId, userProfile.email);
    
    if (existingUser) {
      if (config.updateOnLogin) {
        return await this.updateExistingUser(existingUser, userProfile, config);
      }
      return existingUser;
    }
    
    if (!config.autoProvision) {
      throw new ProvisioningDisabledError('Auto-provisioning is disabled for this tenant');
    }
    
    // Apply provisioning rules
    const processedProfile = await this.applyProvisioningRules(userProfile, config.provisioningRules);
    
    // Create new user
    const newUser = await this.userService.createUser(tenantId, {
      email: processedProfile.email,
      firstName: processedProfile.firstName,
      lastName: processedProfile.lastName,
      displayName: processedProfile.displayName,
      department: processedProfile.department,
      title: processedProfile.title,
      manager: processedProfile.manager,
      isActive: true,
      source: 'sso',
      customAttributes: processedProfile.customAttributes
    });
    
    // Assign default roles
    if (config.defaultRoles.length > 0) {
      await this.assignDefaultRoles(tenantId, newUser.id, config.defaultRoles);
    }
    
    // Process group mappings
    if (processedProfile.groups && config.groupMapping.length > 0) {
      await this.processGroupMappings(tenantId, newUser.id, processedProfile.groups, config.groupMapping);
    }
    
    // Audit user creation
    await this.auditService.logUserProvisioning(tenantId, newUser.id, {
      source: 'sso_auto_provision',
      profile: processedProfile
    });
    
    return newUser;
  }

  private async processGroupMappings(tenantId: string, userId: string, userGroups: string[], groupMappings: GroupMapping[]): Promise<void> {
    for (const mapping of groupMappings) {
      const matchingGroups = userGroups.filter(group => 
        this.matchesGroupPattern(group, mapping.sourceGroup)
      );
      
      if (matchingGroups.length > 0) {
        // Assign mapped roles
        for (const roleId of mapping.targetRoles) {
          await this.roleManager.assignRole(tenantId, userId, roleId, {
            source: 'group_mapping',
            sourceGroup: matchingGroups[0]
          });
        }
      }
    }
  }
}
```

## Implementation Patterns

### Multi-Protocol SSO Handler

```typescript
class UnifiedSSOHandler {
  async initiateAuthentication(tenantId: string, providerId: string, options?: AuthOptions): Promise<AuthInitiationResult> {
    const provider = await this.ssoProviderManager.getProvider(tenantId, providerId);
    
    switch (provider.protocol) {
      case SSOProtocol.SAML2:
        return await this.samlService.initiateSSO(tenantId, providerId, options?.relayState);
      
      case SSOProtocol.OIDC:
        return await this.oidcService.initiateAuthentication(tenantId, providerId, options?.state);
      
      case SSOProtocol.OAUTH2:
        return await this.oauth2Service.initiateAuthorization(tenantId, providerId, options?.state);
      
      default:
        throw new UnsupportedProtocolError(`Protocol ${provider.protocol} is not supported`);
    }
  }

  async handleCallback(tenantId: string, protocol: SSOProtocol, callbackData: CallbackData): Promise<AuthenticationResult> {
    switch (protocol) {
      case SSOProtocol.SAML2:
        return await this.samlService.handleSSOResponse(tenantId, callbackData.samlResponse, callbackData.relayState);
      
      case SSOProtocol.OIDC:
        return await this.oidcService.handleCallback(tenantId, callbackData.code, callbackData.state);
      
      case SSOProtocol.OAUTH2:
        return await this.oauth2Service.handleCallback(tenantId, callbackData.code, callbackData.state);
      
      default:
        throw new UnsupportedProtocolError(`Protocol ${protocol} is not supported`);
    }
  }
}
```

### SSO Configuration Wizard

```typescript
class SSOConfigurationWizard {
  async createProviderFromMetadata(tenantId: string, metadata: ProviderMetadata): Promise<SSOProvider> {
    let providerConfig: SSOProviderConfig;
    
    if (metadata.type === 'saml_metadata') {
      providerConfig = await this.parseSAMLMetadata(metadata.content);
    } else if (metadata.type === 'oidc_discovery') {
      providerConfig = await this.parseOIDCDiscovery(metadata.discoveryUrl);
    } else {
      throw new UnsupportedMetadataError(`Metadata type ${metadata.type} is not supported`);
    }
    
    // Apply tenant-specific configurations
    providerConfig = await this.applyTenantDefaults(tenantId, providerConfig);
    
    // Validate configuration
    const validationResult = await this.validateProviderConfig(providerConfig);
    if (!validationResult.isValid) {
      throw new InvalidConfigurationError(`Configuration validation failed: ${validationResult.errors.join(', ')}`);
    }
    
    // Create provider
    const provider = await this.ssoProviderManager.createProvider(tenantId, providerConfig);
    
    // Test connection
    const testResult = await this.ssoProviderManager.testConnection(tenantId, provider.id);
    if (!testResult.success) {
      await this.ssoProviderManager.deleteProvider(tenantId, provider.id);
      throw new ConnectionTestError(`Connection test failed: ${testResult.error}`);
    }
    
    return provider;
  }

  private async parseSAMLMetadata(metadataXml: string): Promise<SSOProviderConfig> {
    const parser = new SAMLMetadataParser();
    const metadata = await parser.parse(metadataXml);
    
    return {
      name: metadata.entityDescriptor.entityID,
      type: SSOProviderType.CUSTOM_SAML,
      protocol: SSOProtocol.SAML2,
      configuration: {
        saml: {
          entityId: metadata.entityDescriptor.entityID,
          ssoUrl: metadata.ssoDescriptor.singleSignOnService.location,
          sloUrl: metadata.ssoDescriptor.singleLogoutService?.location,
          certificate: metadata.ssoDescriptor.keyDescriptor.certificate,
          nameIdFormat: metadata.ssoDescriptor.nameIDFormat || NameIdFormat.EMAIL,
          signatureAlgorithm: SignatureAlgorithm.RSA_SHA256,
          digestAlgorithm: DigestAlgorithm.SHA256,
          wantAssertionsSigned: true,
          wantResponseSigned: true,
          signRequests: false,
          encryptAssertions: false
        }
      },
      attributeMapping: this.createDefaultAttributeMapping(),
      userProvisioning: this.createDefaultProvisioningConfig()
    };
  }
}
```

## Integration Points

### Directory Service Integration

```typescript
interface DirectoryServiceIntegration {
  syncUsers(tenantId: string, providerId: string): Promise<SyncResult>;
  syncGroups(tenantId: string, providerId: string): Promise<SyncResult>;
  validateUserCredentials(tenantId: string, username: string, password: string): Promise<boolean>;
  getUserAttributes(tenantId: string, username: string): Promise<UserAttributes>;
}

class ActiveDirectoryIntegration implements DirectoryServiceIntegration {
  async syncUsers(tenantId: string, providerId: string): Promise<SyncResult> {
    const provider = await this.ssoProviderManager.getProvider(tenantId, providerId);
    const ldapConfig = provider.configuration.ldap!;
    
    const ldapClient = new LDAPClient(ldapConfig);
    await ldapClient.bind(ldapConfig.bindDN, ldapConfig.bindPassword);
    
    const searchResult = await ldapClient.search(ldapConfig.userBaseDN, {
      filter: ldapConfig.userFilter || '(objectClass=user)',
      attributes: this.getUserSyncAttributes(provider.attributeMapping),
      scope: 'sub'
    });
    
    const syncResults = {
      processed: 0,
      created: 0,
      updated: 0,
      errors: []
    };
    
    for (const entry of searchResult.entries) {
      try {
        const userProfile = await this.mapLDAPAttributes(entry.attributes, provider.attributeMapping);
        const user = await this.userProvisioningService.provisionUser(tenantId, userProfile, provider.userProvisioning);
        
        if (user.createdAt === user.updatedAt) {
          syncResults.created++;
        } else {
          syncResults.updated++;
        }
        syncResults.processed++;
        
      } catch (error) {
        syncResults.errors.push({
          dn: entry.dn,
          error: error.message
        });
      }
    }
    
    await ldapClient.unbind();
    return syncResults;
  }
}
```

### Session Management Integration

```typescript
interface SSOSessionManager {
  createSSOSession(sessionData: SSOSessionData): Promise<SSOSession>;
  validateSSOSession(sessionId: string): Promise<boolean>;
  refreshSSOSession(sessionId: string): Promise<SSOSession>;
  terminateSSOSession(sessionId: string): Promise<void>;
  handleGlobalLogout(providerId: string, sessionIndex: string): Promise<void>;
}

class FederatedSessionManager implements SSOSessionManager {
  async createSSOSession(sessionData: SSOSessionData): Promise<SSOSession> {
    const session = await this.sessionRepository.create({
      id: this.generateSessionId(),
      tenantId: sessionData.tenantId,
      userId: sessionData.userId,
      providerId: sessionData.providerId,
      sessionIndex: sessionData.sessionIndex,
      accessToken: sessionData.accessToken,
      refreshToken: sessionData.refreshToken,
      idToken: sessionData.idToken,
      attributes: sessionData.attributes,
      createdAt: new Date(),
      expiresAt: sessionData.expiresAt,
      lastAccessedAt: new Date()
    });
    
    // Set up session monitoring
    await this.setupSessionMonitoring(session);
    
    // Register for global logout if supported
    if (sessionData.sessionIndex) {
      await this.globalLogoutRegistry.register(sessionData.providerId, sessionData.sessionIndex, session.id);
    }
    
    return session;
  }

  async handleGlobalLogout(providerId: string, sessionIndex: string): Promise<void> {
    const sessionIds = await this.globalLogoutRegistry.getSessionIds(providerId, sessionIndex);
    
    await Promise.all(sessionIds.map(async (sessionId) => {
      try {
        await this.terminateSSOSession(sessionId);
      } catch (error) {
        // Log error but continue with other sessions
        await this.logger.error(`Failed to terminate session ${sessionId} during global logout`, error);
      }
    }));
    
    await this.globalLogoutRegistry.cleanup(providerId, sessionIndex);
  }
}
```

## Security Considerations

### Certificate and Key Management

```typescript
interface CertificateManager {
  storeCertificate(tenantId: string, providerId: string, certificate: Certificate): Promise<void>;
  getCertificate(tenantId: string, providerId: string): Promise<Certificate>;
  validateCertificate(certificate: Certificate): Promise<CertificateValidationResult>;
  rotateCertificate(tenantId: string, providerId: string, newCertificate: Certificate): Promise<void>;
  scheduleRenewal(tenantId: string, providerId: string, renewalDate: Date): Promise<void>;
}

class SecureCertificateManager implements CertificateManager {
  async storeCertificate(tenantId: string, providerId: string, certificate: Certificate): Promise<void> {
    // Validate certificate
    const validation = await this.validateCertificate(certificate);
    if (!validation.isValid) {
      throw new InvalidCertificateError(`Certificate validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Encrypt certificate before storage
    const encryptedCert = await this.encryptionService.encrypt(certificate.pem, {
      keyId: `tenant:${tenantId}:sso:${providerId}`,
      algorithm: 'AES-256-GCM'
    });
    
    await this.certificateRepository.store(tenantId, providerId, {
      encryptedPem: encryptedCert,
      fingerprint: certificate.fingerprint,
      issuer: certificate.issuer,
      subject: certificate.subject,
      validFrom: certificate.validFrom,
      validTo: certificate.validTo,
      storedAt: new Date()
    });
    
    // Schedule renewal notification
    const renewalDate = new Date(certificate.validTo.getTime() - (30 * 24 * 60 * 60 * 1000)); // 30 days before expiry
    await this.scheduleRenewal(tenantId, providerId, renewalDate);
  }
}
```

### Security Validation and Monitoring

```typescript
interface SSOSecurityMonitor {
  validateAuthenticationRequest(request: AuthenticationRequest): Promise<SecurityValidationResult>;
  detectAnomalousActivity(tenantId: string, userId: string): Promise<SecurityAlert[]>;
  monitorFailedAttempts(tenantId: string): Promise<void>;
  generateSecurityReport(tenantId: string, period: DateRange): Promise<SecurityReport>;
}

class SSOSecurityValidator {
  async validateSAMLResponse(response: SAMLResponse, provider: SSOProvider): Promise<ValidationResult> {
    const validations = [];
    
    // Validate signature
    if (provider.configuration.saml!.wantResponseSigned) {
      const signatureValid = await this.validateSignature(response, provider);
      validations.push({
        check: 'signature',
        passed: signatureValid,
        message: signatureValid ? 'Signature valid' : 'Invalid signature'
      });
    }
    
    // Validate timestamps
    const timestampValid = this.validateTimestamps(response);
    validations.push({
      check: 'timestamps',
      passed: timestampValid,
      message: timestampValid ? 'Timestamps valid' : 'Invalid or expired timestamps'
    });
    
    // Validate audience
    const audienceValid = this.validateAudience(response, provider);
    validations.push({
      check: 'audience',
      passed: audienceValid,
      message: audienceValid ? 'Audience valid' : 'Invalid audience'
    });
    
    // Validate recipient
    const recipientValid = this.validateRecipient(response, provider);
    validations.push({
      check: 'recipient',
      passed: recipientValid,
      message: recipientValid ? 'Recipient valid' : 'Invalid recipient'
    });
    
    const allPassed = validations.every(v => v.passed);
    
    return {
      isValid: allPassed,
      validations,
      errors: validations.filter(v => !v.passed).map(v => v.message)
    };
  }
}
```

## Compliance Requirements

### Audit and Compliance Tracking

```typescript
interface SSOComplianceManager {
  trackAuthenticationEvent(event: AuthenticationEvent): Promise<void>;
  generateComplianceReport(tenantId: string, framework: ComplianceFramework): Promise<ComplianceReport>;
  validateDataResidency(tenantId: string): Promise<DataResidencyReport>;
  handleDataSubjectRequest(request: DataSubjectRequest): Promise<DataSubjectResponse>;
}

class SSOAuditLogger {
  async logAuthenticationAttempt(attempt: AuthenticationAttempt): Promise<void> {
    const auditRecord = {
      eventType: 'authentication_attempt',
      tenantId: attempt.tenantId,
      userId: attempt.userId,
      providerId: attempt.providerId,
      protocol: attempt.protocol,
      success: attempt.success,
      failureReason: attempt.failureReason,
      ipAddress: attempt.ipAddress,
      userAgent: attempt.userAgent,
      timestamp: new Date(),
      sessionId: attempt.sessionId,
      metadata: {
        nameId: attempt.nameId,
        attributes: this.sanitizeAttributes(attempt.attributes)
      }
    };
    
    await this.auditRepository.store(auditRecord);
    
    // Send to external SIEM if configured
    if (this.siemConfig.enabled) {
      await this.siemClient.sendEvent(auditRecord);
    }
  }

  private sanitizeAttributes(attributes: Record<string, any>): Record<string, any> {
    const sanitized = { ...attributes };
    
    // Remove sensitive attributes
    const sensitiveFields = ['ssn', 'password', 'secret', 'token'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }
}
```

## Testing Considerations

### SSO Integration Testing

```typescript
// SAML integration testing
describe('SAML SSO Integration', () => {
  it('should successfully authenticate user with valid SAML response', async () => {
    const tenant = await createTestTenant();
    const provider = await createSAMLProvider(tenant.id, {
      entityId: 'test-idp',
      ssoUrl: 'https://test-idp.example.com/sso',
      certificate: TEST_CERTIFICATE
    });
    
    const samlResponse = createValidSAMLResponse({
      issuer: 'test-idp',
      nameId: 'test@example.com',
      attributes: {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      }
    });
    
    const result = await samlService.handleSSOResponse(
      tenant.id,
      Buffer.from(samlResponse).toString('base64')
    );
    
    expect(result.success).toBe(true);
    expect(result.user.email).toBe('test@example.com');
    expect(result.session).toBeDefined();
  });
  
  it('should reject SAML response with invalid signature', async () => {
    const tenant = await createTestTenant();
    const provider = await createSAMLProvider(tenant.id, {
      wantResponseSigned: true
    });
    
    const invalidSamlResponse = createSAMLResponseWithInvalidSignature();
    
    await expect(
      samlService.handleSSOResponse(tenant.id, invalidSamlResponse)
    ).rejects.toThrow('Invalid signature');
  });
});

// OIDC integration testing
describe('OIDC SSO Integration', () => {
  it('should handle authorization code flow correctly', async () => {
    const tenant = await createTestTenant();
    const provider = await createOIDCProvider(tenant.id, {
      clientId: 'test-client',
      discoveryUrl: 'https://test-provider.example.com/.well-known/openid_configuration'
    });
    
    // Mock discovery document
    mockDiscoveryDocument({
      authorization_endpoint: 'https://test-provider.example.com/auth',
      token_endpoint: 'https://test-provider.example.com/token',
      userinfo_endpoint: 'https://test-provider.example.com/userinfo'
    });
    
    // Test authorization initiation
    const authRequest = await oidcService.initiateAuthentication(tenant.id, provider.id);
    expect(authRequest.authUrl).toContain('https://test-provider.example.com/auth');
    
    // Mock token exchange
    mockTokenResponse({
      access_token: 'test-access-token',
      id_token: createValidIdToken(),
      refresh_token: 'test-refresh-token'
    });
    
    // Test callback handling
    const result = await oidcService.handleCallback(tenant.id, 'test-code', authRequest.state);
    expect(result.success).toBe(true);
    expect(result.tokens).toBeDefined();
  });
});
```

### Performance and Load Testing

- **Authentication flow performance**: Test SSO authentication under various load conditions
- **Certificate validation performance**: Test certificate validation and caching efficiency
- **Session management performance**: Test session creation, validation, and cleanup
- **Metadata parsing performance**: Test SAML metadata and OIDC discovery parsing
- **Concurrent authentication testing**: Test multiple simultaneous authentication requests

This template provides a comprehensive foundation for implementing enterprise SSO integration with support for multiple protocols, robust security, and compliance requirements.
