# User Profile Management Template

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
This template provides comprehensive guidance for implementing user profile systems in social applications, covering profile creation, customization, privacy controls, and profile management features.

## Context
User profiles are the foundation of any social application, serving as the primary identity and representation of users within the platform. A well-designed profile system enables users to express themselves, control their privacy, build trust through verification, and connect with others. This template addresses the complexity of building scalable, secure, and user-friendly profile systems that balance personalization with privacy protection.

## Instructions

1. **Setup Profile System**: Configure user profile database schema and storage
2. **Implement Profile Creation**: Build profile registration and onboarding workflows
3. **Add Customization Features**: Enable profile themes, layouts, and personalization
4. **Configure Privacy Controls**: Implement granular privacy settings and visibility controls
5. **Add Profile Verification**: Set up identity verification and trust systems
6. **Enable Profile Discovery**: Implement profile search and recommendation features
7. **Test Profile Workflows**: Validate creation, editing, privacy, and discovery functionality

## Examples

### Example 1: Profile Creation System
```typescript
interface UserProfileService {
  createProfile(data: ProfileData): Promise<UserProfile>;
  updateProfile(userId: string, updates: ProfileUpdates): Promise<UserProfile>;
  getProfile(userId: string, viewerId?: string): Promise<UserProfile>;
}

const profileService = new UserProfileService();
const profile = await profileService.createProfile({
  userId: 'user-123',
  displayName: 'John Doe',
  bio: 'Software developer and coffee enthusiast',
  privacy: { profileVisibility: 'public', contactInfo: 'friends' }
});
```

### Example 2: Privacy Controls
```typescript
const privacySettings = await profileService.updatePrivacySettings('user-123', {
  profileVisibility: 'friends',
  emailVisibility: 'private',
  phoneVisibility: 'private',
  locationVisibility: 'friends',
  allowSearchByEmail: false
});
```

### Example 3: Profile Customization
```typescript
const customization = await profileService.updateCustomization('user-123', {
  theme: 'dark',
  profileLayout: 'grid',
  showBadges: true,
  customFields: [
    { name: 'Favorite Quote', value: 'Code is poetry', visibility: 'public' }
  ]
});
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| enableProfilePhotos | Enable profile photo uploads | boolean | No | true |
| enableCustomFields | Allow custom profile fields | boolean | No | true |
| enableThemes | Enable profile theme customization | boolean | No | false |
| enableVerification | Enable profile verification system | boolean | No | false |
| maxBioLength | Maximum biography character limit | number | No | 500 |
| enableLocationSharing | Enable location sharing features | boolean | No | false |
| enableStatusMessages | Enable custom status messages | boolean | No | true |
| privacyDefaultLevel | Default privacy level for new profiles | string | No | "friends" |
| enableProfileAnalytics | Enable profile view analytics | boolean | No | false |

## Expected Output

This template will produce:
- **Profile Management System**: Complete user profile creation and management
- **Privacy Control Framework**: Granular privacy settings and visibility controls
- **Customization Engine**: Profile themes, layouts, and personalization options
- **Verification System**: Identity verification and trust indicators
- **Profile Discovery**: Search, recommendations, and profile browsing features
- **Analytics Dashboard**: Profile performance and engagement metrics
- **Security Features**: Profile protection and abuse prevention mechanisms
- **Cross-Platform Sync**: Consistent profile experience across devices

## Implementation Guidance

### Core Profile Components

**Basic Profile Information**
- Implement required fields (username, display name, email)
- Support optional fields (bio, location, website, birth date)
- Provide profile photo and cover image upload
- Include account creation timestamp and verification status
- Support custom profile fields for extensibility

**Profile Customization**
- Enable theme and appearance customization
- Support profile layout preferences
- Implement custom status messages and mood indicators
- Provide profile badge and achievement display
- Allow custom profile URLs/vanity names

**Privacy and Visibility Controls**
- Implement granular privacy settings for each profile field
- Support profile visibility levels (public, friends only, private)
- Provide blocking and restricted access controls
- Enable content filtering and keyword blocking
- Support temporary profile deactivation

### Advanced Profile Features

**Profile Verification System**
- Implement identity verification workflows
- Support document upload and verification
- Provide verification badges and trust indicators
- Enable professional/business account verification
- Support third-party verification integration

**Profile Analytics and Insights**
- Track profile view statistics
- Provide engagement metrics and reach data
- Support profile performance analytics
- Enable audience demographics insights
- Implement profile optimization suggestions

**Multi-Profile Management**
- Support multiple profiles per account (personal, business)
- Enable profile switching and management
- Implement profile linking and cross-promotion
- Support profile delegation and team management
- Provide profile backup and export features

### Technical Implementation

**Data Model Structure**
```
Profile {
  id: unique identifier
  userId: reference to user account
  type: profile type (personal, business, creator)
  displayName: public display name
  username: unique username/handle
  bio: profile description
  profileImage: profile photo URL
  coverImage: cover photo URL
  location: geographic location
  website: external website URL
  birthDate: date of birth
  joinDate: account creation date
  verificationStatus: verification level
  privacySettings: privacy configuration object
  customFields: extensible profile data
  isActive: profile status
  lastUpdated: last modification timestamp
}
```

**Privacy Settings Schema**
```
PrivacySettings {
  profileVisibility: public|friends|private
  emailVisibility: public|friends|private
  locationVisibility: public|friends|private
  birthDateVisibility: public|friends|private
  lastSeenVisibility: public|friends|private
  searchability: boolean
  messagePermissions: everyone|friends|none
  tagPermissions: everyone|friends|none
  mentionPermissions: everyone|friends|none
}
```

### Security Considerations

**Data Protection**
- Encrypt sensitive profile information
- Implement secure image upload and storage
- Validate and sanitize all profile inputs
- Support GDPR-compliant data export and deletion
- Implement audit logging for profile changes

**Access Control**
- Enforce privacy settings at API level
- Implement rate limiting for profile updates
- Support two-factor authentication for sensitive changes
- Validate profile ownership before modifications
- Implement suspicious activity detection

### User Experience Patterns

**Profile Creation Flow**
1. Collect essential information (username, email, password)
2. Guide through profile setup with progressive disclosure
3. Suggest profile completion with gamification elements
4. Provide privacy setting education and defaults
5. Enable social graph import and friend finding

**Profile Management Interface**
- Provide intuitive profile editing interface
- Support real-time preview of profile changes
- Enable bulk privacy setting management
- Implement profile completion progress indicators
- Support profile template and theme selection

**Profile Discovery and Viewing**
- Optimize profile loading performance
- Support responsive profile layouts
- Implement profile sharing and embedding
- Provide profile interaction analytics
- Enable profile comparison and similarity features

### Integration Patterns

**Social Graph Integration**
- Connect with friend/follow systems
- Support mutual connection indicators
- Enable profile-based recommendations
- Implement social proof elements
- Support profile-based content filtering

**Content System Integration**
- Link profiles to user-generated content
- Support profile-based content attribution
- Enable profile-specific content feeds
- Implement profile mention and tagging
- Support profile-based content permissions

**Notification Integration**
- Send profile update notifications
- Support profile interaction alerts
- Enable privacy change notifications
- Implement profile milestone celebrations
- Support profile-based notification preferences

### Performance Optimization

**Caching Strategy**
- Cache frequently accessed profile data
- Implement profile image CDN integration
- Support profile data preloading
- Enable profile search result caching
- Implement profile analytics data aggregation

**Scalability Considerations**
- Design for horizontal profile data scaling
- Support profile data sharding strategies
- Implement efficient profile search indexing
- Enable profile data archival and cleanup
- Support profile migration and backup systems

### Compliance and Legal

**Privacy Regulations**
- Implement GDPR-compliant profile data handling
- Support CCPA privacy rights and data portability
- Enable profile data anonymization and pseudonymization
- Implement consent management for profile data usage
- Support regional privacy law compliance

**Content Moderation**
- Implement automated profile content screening
- Support manual profile review workflows
- Enable community reporting for inappropriate profiles
- Implement profile suspension and ban systems
- Support profile content appeal processes

### Testing Strategy

**Profile Functionality Testing**
- Test profile creation and update workflows
- Validate privacy setting enforcement
- Test profile image upload and processing
- Verify profile search and discovery features
- Test profile data export and deletion

**Security Testing**
- Test profile access control enforcement
- Validate input sanitization and validation
- Test profile data encryption and protection
- Verify authentication and authorization
- Test profile-based attack vectors

**Performance Testing**
- Test profile loading performance under load
- Validate profile search response times
- Test profile image delivery performance
- Verify profile data caching effectiveness
- Test profile system scalability limits

### Monitoring and Analytics

**Profile System Metrics**
- Track profile creation and completion rates
- Monitor profile update frequency and patterns
- Measure profile view and interaction rates
- Track privacy setting usage patterns
- Monitor profile verification completion rates

**User Engagement Metrics**
- Measure profile customization adoption
- Track profile discovery and search usage
- Monitor profile-based social interactions
- Measure profile content engagement rates
- Track profile system user satisfaction

## Real-World Considerations

**User Onboarding**
- Balance profile setup complexity with user retention
- Provide clear privacy setting explanations
- Support gradual profile completion over time
- Enable social import while respecting privacy
- Implement profile setup abandonment recovery

**Profile Authenticity**
- Combat fake profile creation and spam
- Implement profile verification systems
- Support community-based authenticity validation
- Enable profile quality scoring and ranking
- Implement duplicate profile detection

**Cultural and Regional Adaptation**
- Support international name formats and characters
- Adapt privacy defaults to regional expectations
- Support cultural profile customization options
- Implement region-specific verification requirements
- Support multilingual profile content

**Accessibility**
- Ensure profile interfaces are screen reader compatible
- Support keyboard navigation for profile management
- Provide alternative text for profile images
- Implement high contrast profile viewing options
- Support voice-controlled profile interactions

This template provides a comprehensive foundation for implementing robust, secure, and user-friendly profile systems that can scale with social application growth while maintaining privacy and security standards.
