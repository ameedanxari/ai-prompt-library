# Content Creation Template

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
This template provides comprehensive guidance for implementing content creation systems in social applications, covering post creation, media upload, story features, rich content editing, and publishing workflows.

## Context
Content creation is the foundation of user-generated content platforms, enabling users to express themselves and share experiences. A well-designed creation system balances ease of use with powerful features, supporting everything from quick text posts to rich media content. This template addresses the complexity of building intuitive creation tools, efficient media processing pipelines, and flexible publishing workflows that empower creators while maintaining content quality.

## Instructions

1. **Setup Content Creation System**: Configure content creation infrastructure and storage
2. **Implement Rich Text Editor**: Build advanced text editing with formatting and media
3. **Add Media Upload**: Enable photo, video, and file upload with processing
4. **Configure Story Features**: Implement ephemeral content and story creation
5. **Enable Collaborative Creation**: Add co-authoring and collaborative content features
6. **Add Publishing Workflows**: Implement drafts, scheduling, and publishing controls
7. **Test Creation Flows**: Validate content creation, editing, and publishing workflows

## Examples

### Example 1: Content Creation System
```typescript
interface ContentCreationService {
  createPost(userId: string, content: PostContent): Promise<Post>;
  uploadMedia(userId: string, media: MediaFile): Promise<MediaUpload>;
  createStory(userId: string, story: StoryContent): Promise<Story>;
}

const contentService = new ContentCreationService();
const post = await contentService.createPost('user-123', {
  text: 'Check out this amazing sunset!',
  media: ['photo-456'],
  tags: ['sunset', 'photography'],
  visibility: 'public'
});
```

### Example 2: Rich Media Upload
```typescript
const mediaUpload = await contentService.uploadMedia('user-123', {
  file: imageFile,
  type: 'image',
  caption: 'Beautiful sunset at the beach',
  altText: 'Orange and pink sunset over ocean waves'
});
```

### Example 3: Story Creation
```typescript
const story = await contentService.createStory('user-123', {
  media: 'video-789',
  duration: 24 * 60 * 60 * 1000, // 24 hours
  viewers: 'friends',
  interactive: { polls: true, questions: true }
});
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| enableRichTextEditor | Enable rich text formatting | boolean | No | true |
| enableMediaUpload | Enable photo/video uploads | boolean | No | true |
| enableStories | Enable story creation features | boolean | No | false |
| maxMediaSize | Maximum media file size (MB) | number | No | 50 |
| enableDrafts | Enable draft saving functionality | boolean | No | true |
| enableScheduling | Enable scheduled post publishing | boolean | No | false |
| enableCollaboration | Enable collaborative content creation | boolean | No | false |
| enableHashtags | Enable hashtag functionality | boolean | No | true |
| enableMentions | Enable user mention functionality | boolean | No | true |

## Expected Output

This template will produce:
- **Rich Content Editor**: Advanced text editing with formatting and media integration
- **Media Upload System**: Photo, video, and file upload with processing and optimization
- **Story Creation Tools**: Ephemeral content creation with interactive features
- **Publishing Workflow**: Draft management, scheduling, and publication controls
- **Collaborative Features**: Co-authoring and shared content creation capabilities
- **Content Organization**: Tagging, categorization, and content management tools
- **Cross-Platform Support**: Consistent content creation across web and mobile
- **Analytics Integration**: Content performance tracking and creator insights

## Implementation Guidance

### Core Content Creation Components

**Text Content Creation**
- Implement rich text editors with formatting options
- Support markdown and HTML content creation
- Enable emoji, mention, and hashtag integration
- Provide spell check and grammar assistance
- Support multi-language content creation and translation

**Media Content Creation**
- Enable photo and video upload with compression
- Support image editing and filter applications
- Implement video trimming and basic editing tools
- Provide audio recording and voice note creation
- Support document and file attachment features

**Story and Ephemeral Content**
- Implement story creation with photos and videos
- Support story templates and creative tools
- Enable story highlights and permanent collections
- Provide story privacy controls and audience selection
- Support story analytics and engagement tracking

### Advanced Creation Features

**Live Content Creation**
- Enable live streaming and broadcast features
- Support live audio rooms and voice conversations
- Implement live event creation and management
- Provide live interaction tools (polls, Q&A, reactions)
- Support live content recording and replay

**Collaborative Content Creation**
- Enable collaborative posts and shared content
- Support co-authoring and multi-user editing
- Implement content approval and review workflows
- Provide version control and edit history
- Support collaborative media projects and albums

**AI-Assisted Content Creation**
- Implement AI-powered content suggestions and completion
- Support automated content generation and templates
- Enable smart cropping and image optimization
- Provide content enhancement and quality improvement
- Support AI-based content moderation and compliance

### Technical Implementation

**Content Data Model**
```
Content {
  id: unique content identifier
  authorId: content creator user ID
  contentType: type of content (text, image, video, story, live)
  title: content title or caption
  body: main content body or description
  mediaAttachments: array of media file references
  metadata: content metadata and properties
  tags: hashtags and topic tags
  mentions: user mentions in content
  location: geographic location data
  privacy: content privacy and visibility settings
  status: content status (draft, published, archived)
  createdAt: content creation timestamp
  publishedAt: content publication timestamp
  scheduledFor: scheduled publication time
  editHistory: content modification history
}
```

**Media Asset Schema**
```
MediaAsset {
  id: unique media identifier
  contentId: reference to parent content
  mediaType: type of media (image, video, audio, document)
  originalFilename: original file name
  fileSize: file size in bytes
  mimeType: media MIME type
  dimensions: media dimensions (width, height)
  duration: media duration for audio/video
  url: media access URL
  thumbnailUrl: thumbnail or preview URL
  processingStatus: media processing status
  metadata: media metadata and EXIF data
  uploadedAt: media upload timestamp
  processedAt: media processing completion time
}
```

### Content Creation Workflows

**Draft and Publishing System**
- Implement draft saving and auto-save functionality
- Support scheduled content publishing
- Enable content preview and review before publishing
- Provide publishing workflow with approval stages
- Support content versioning and revision management

**Content Templates and Formats**
- Provide pre-designed content templates
- Support custom content formats and layouts
- Enable content series and episodic publishing
- Implement content categories and classification
- Support branded content and promotional post formats

**Content Optimization**
- Implement SEO optimization for content discovery
- Support content performance prediction and suggestions
- Enable A/B testing for content variations
- Provide content timing and audience optimization
- Support content cross-posting and syndication

### User Experience Patterns

**Creation Interface Design**
- Provide intuitive and accessible content creation interfaces
- Support responsive design for mobile and desktop creation
- Implement drag-and-drop media upload and organization
- Enable real-time preview and editing capabilities
- Support keyboard shortcuts and power user features

**Media Handling and Processing**
- Optimize media upload with progress indicators
- Support batch media upload and processing
- Implement automatic media optimization and compression
- Provide media editing tools and filters
- Support media organization and library management

**Content Publishing Experience**
- Enable one-click publishing with smart defaults
- Support audience selection and privacy controls
- Implement content scheduling and timing optimization
- Provide publishing confirmation and success feedback
- Support post-publication editing and updates

### Integration Patterns

**Social Graph Integration**
- Enable content sharing with specific connections
- Support audience targeting based on relationships
- Implement social proof and engagement predictions
- Enable collaborative content with friends and followers
- Support content recommendations based on social signals

**Profile and Identity Integration**
- Connect content creation with user profiles and branding
- Support multiple identity and persona management
- Enable content attribution and creator recognition
- Implement content portfolio and showcase features
- Support professional and personal content separation

**Analytics Integration**
- Track content creation patterns and productivity
- Monitor content performance and engagement metrics
- Provide creator insights and audience analytics
- Enable content optimization recommendations
- Support creator monetization and revenue tracking

### Performance Optimization

**Media Processing Optimization**
- Implement efficient media upload and processing pipelines
- Support progressive media upload and streaming
- Enable client-side media compression and optimization
- Provide background processing for large media files
- Support CDN integration for media delivery

**Content Creation Performance**
- Optimize content editor performance and responsiveness
- Support offline content creation and sync
- Enable efficient draft saving and recovery
- Implement content creation caching and optimization
- Support low-bandwidth content creation modes

**Scalability Considerations**
- Design for high-volume content creation and storage
- Support distributed media processing and storage
- Enable horizontal scaling of creation infrastructure
- Implement efficient content indexing and search
- Support global content distribution and replication

### Security and Privacy

**Content Security**
- Implement secure media upload and storage
- Support content encryption and access controls
- Enable content watermarking and protection
- Provide content backup and disaster recovery
- Support content audit trails and compliance

**Privacy Controls**
- Enable granular content privacy and visibility settings
- Support content expiration and automatic deletion
- Implement content access controls and permissions
- Provide content anonymization and pseudonymization
- Support GDPR-compliant content handling

**Content Moderation**
- Implement automated content screening and filtering
- Support pre-publication content review
- Enable community reporting and moderation
- Provide content policy enforcement and appeals
- Support content age-gating and sensitivity controls

### Testing Strategy

**Content Creation Testing**
- Test content creation workflows across different content types
- Validate media upload and processing functionality
- Test content editing and formatting features
- Verify content publishing and scheduling systems
- Test content privacy and visibility controls

**Media Processing Testing**
- Test media upload performance and reliability
- Validate media compression and optimization
- Test media format compatibility and conversion
- Verify media security and access controls
- Test media processing scalability and throughput

**User Experience Testing**
- Test content creation interface usability
- Validate content creation accessibility features
- Test content creation performance across devices
- Verify content preview and editing accuracy
- Test content creation workflow efficiency

### Monitoring and Analytics

**Content Creation Metrics**
- Track content creation volume and frequency
- Monitor content type distribution and trends
- Measure content creation completion rates
- Track content quality and engagement correlation
- Monitor content creation system performance

**Creator Behavior Analytics**
- Analyze content creation patterns and preferences
- Track creator productivity and engagement
- Monitor content creation tool usage and adoption
- Measure creator satisfaction and retention
- Analyze content creation success factors

**System Performance Metrics**
- Monitor content creation system uptime and reliability
- Track media processing performance and throughput
- Measure content storage and delivery efficiency
- Monitor content creation error rates and issues
- Track system resource utilization and capacity

### Advanced Features

**AR/VR Content Creation**
- Support augmented reality content creation and filters
- Enable virtual reality content and experiences
- Implement 3D content creation and sharing
- Support immersive media formats and playback
- Enable spatial audio and 360-degree content

**AI-Powered Creation Tools**
- Implement intelligent content suggestions and auto-completion
- Support AI-generated content and media enhancement
- Enable automated content tagging and categorization
- Provide AI-based content optimization and improvement
- Support natural language content generation

**Blockchain and NFT Integration**
- Enable content tokenization and NFT creation
- Support blockchain-based content ownership and provenance
- Implement decentralized content storage and distribution
- Enable creator monetization through crypto and tokens
- Support content authenticity and verification

## Real-World Considerations

**Creator Economy Support**
- Enable creator monetization and revenue sharing
- Support creator analytics and audience insights
- Implement creator tools and professional features
- Provide creator education and best practices
- Enable creator collaboration and networking

**Accessibility and Inclusion**
- Ensure content creation tools are accessible to all users
- Support assistive technologies and alternative input methods
- Implement inclusive design principles in creation interfaces
- Enable content creation for users with disabilities
- Support diverse content formats and accessibility features

**Global Content Creation**
- Support multi-language content creation and localization
- Enable cultural adaptation of creation tools and features
- Implement region-specific content formats and styles
- Support diverse media types and cultural expressions
- Enable global content distribution and discovery

**Legal and Compliance**
- Implement copyright protection and fair use guidelines
- Support content licensing and rights management
- Enable DMCA compliance and takedown procedures
- Provide content age verification and parental controls
- Support regulatory compliance for different regions

This template provides a comprehensive foundation for implementing powerful, flexible, and user-friendly content creation systems that empower users to express themselves while maintaining quality, security, and compliance standards.
