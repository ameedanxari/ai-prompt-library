# Voice and Video Calls Template

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
This template provides comprehensive guidance for implementing voice and video calling features in social applications, covering WebRTC integration, call management, quality optimization, and advanced calling features.

## Context
Voice and video calling has become essential for modern social applications, enabling real-time communication beyond text messaging. WebRTC technology enables peer-to-peer audio and video streaming directly in browsers and mobile apps. This template addresses the complexity of implementing reliable calling infrastructure, managing call quality across varying network conditions, and providing advanced features like screen sharing and group conferencing.

## Instructions

1. **Setup WebRTC Infrastructure**: Configure WebRTC servers and signaling infrastructure
2. **Implement Call Management**: Build call initiation, acceptance, and termination workflows
3. **Add Quality Optimization**: Implement adaptive bitrate and network-aware calling
4. **Configure Group Calling**: Set up multi-party video conferences and group calls
5. **Enable Advanced Features**: Add screen sharing, recording, and interactive features
6. **Add Call Analytics**: Track call quality, duration, and user engagement metrics
7. **Test Call Performance**: Validate call quality across different network conditions

## Examples

### Example 1: Voice/Video Call System
```typescript
interface CallService {
  initiateCall(callerId: string, recipientId: string, type: CallType): Promise<Call>;
  acceptCall(callId: string, userId: string): Promise<CallSession>;
  endCall(callId: string, userId: string): Promise<void>;
}

const callService = new CallService();
const call = await callService.initiateCall('user-123', 'user-456', 'video');
const session = await callService.acceptCall(call.id, 'user-456');
```

### Example 2: Group Video Conference
```typescript
const groupCall = await callService.createGroupCall({
  hostId: 'user-123',
  participants: ['user-456', 'user-789', 'user-012'],
  maxParticipants: 10,
  features: ['screen_share', 'recording', 'chat']
});
```

### Example 3: Call Quality Management
```typescript
const qualitySettings = await callService.optimizeCallQuality({
  callId: 'call-123',
  networkConditions: 'poor',
  deviceCapabilities: { camera: '720p', microphone: 'high_quality' }
});
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| enableVoiceCalls | Enable voice calling functionality | boolean | No | true |
| enableVideoCalls | Enable video calling functionality | boolean | No | true |
| enableGroupCalls | Enable group/conference calling | boolean | No | false |
| maxGroupParticipants | Maximum participants in group calls | number | No | 10 |
| enableScreenSharing | Enable screen sharing features | boolean | No | false |
| enableCallRecording | Enable call recording functionality | boolean | No | false |
| enableCallAnalytics | Track call quality and metrics | boolean | No | true |
| adaptiveQuality | Enable adaptive call quality | boolean | No | true |
| enableCallWaiting | Enable call waiting features | boolean | No | true |

## Expected Output

This template will produce:
- **WebRTC Call System**: Peer-to-peer voice and video calling infrastructure
- **Call Management**: Complete call lifecycle management and user interfaces
- **Group Conferencing**: Multi-party video conferences and group calling features
- **Quality Optimization**: Adaptive bitrate and network-aware call quality
- **Advanced Features**: Screen sharing, recording, and interactive call tools
- **Call Analytics**: Comprehensive call quality and usage analytics
- **Cross-Platform Support**: Consistent calling experience across web and mobile
- **Security Features**: Encrypted calls and privacy protection measures

## Implementation Guidance

### Core Calling Components

**WebRTC Integration**
- Implement WebRTC peer connection establishment
- Support ICE (Interactive Connectivity Establishment) for NAT traversal
- Enable STUN/TURN server integration for connectivity
- Provide signaling server for call negotiation
- Support WebRTC data channels for additional features

**Call Types and Modes**
- Implement one-on-one voice and video calls
- Support group voice and video conferences
- Enable screen sharing and presentation modes
- Provide audio-only and video-only call options
- Support call recording and playback features

**Media Stream Management**
- Handle audio and video stream capture
- Support multiple camera and microphone selection
- Enable stream quality adjustment and optimization
- Provide media stream encryption and security
- Support media stream recording and processing

### Advanced Calling Features

**Call Quality Optimization**
- Implement adaptive bitrate streaming
- Support network condition detection and adjustment
- Enable automatic quality scaling based on bandwidth
- Provide echo cancellation and noise suppression
- Support bandwidth optimization and compression

**Multi-Party Conferencing**
- Implement scalable group calling architecture
- Support selective forwarding unit (SFU) for efficiency
- Enable multicast and broadcast calling modes
- Provide conference room management and controls
- Support large-scale webinar and broadcast features

**Screen Sharing and Collaboration**
- Enable desktop and application screen sharing
- Support remote control and annotation features
- Implement collaborative whiteboard and drawing
- Provide file sharing during calls
- Support presentation mode and slide sharing

### Technical Implementation

**Call Session Data Model**
```
CallSession {
  id: unique call session identifier
  type: call type (voice, video, screen_share, conference)
  initiatorId: call initiator user ID
  participants: array of participant user IDs
  status: call status (ringing, active, ended, failed)
  startTime: call start timestamp
  endTime: call end timestamp
  duration: call duration in seconds
  quality: call quality metrics
  recordingId: reference to call recording
  metadata: additional call data
  settings: call-specific settings
}
```

**Media Configuration Schema**
```
MediaConfiguration {
  sessionId: reference to call session
  userId: participant user ID
  audioEnabled: audio stream status
  videoEnabled: video stream status
  screenShareEnabled: screen sharing status
  audioDeviceId: selected audio device
  videoDeviceId: selected video device
  audioQuality: audio quality settings
  videoQuality: video quality settings
  bandwidth: allocated bandwidth
  codecPreferences: preferred media codecs
}
```

### Call Management System

**Call Signaling**
- Implement SIP or custom signaling protocol
- Support call invitation and acceptance workflows
- Enable call rejection and busy status handling
- Provide call transfer and forwarding features
- Support call hold and resume functionality

**Connection Management**
- Handle peer connection lifecycle management
- Support connection health monitoring and recovery
- Enable automatic reconnection on network issues
- Provide connection quality metrics and reporting
- Support graceful connection degradation

**Media Negotiation**
- Implement SDP (Session Description Protocol) handling
- Support codec negotiation and selection
- Enable media capability exchange
- Provide bandwidth negotiation and allocation
- Support media format compatibility checking

### Security and Privacy

**Call Security**
- Implement end-to-end encryption for media streams
- Support DTLS (Datagram Transport Layer Security)
- Enable secure signaling and call setup
- Provide call authentication and authorization
- Support secure media relay and routing

**Privacy Controls**
- Enable call recording consent and notification
- Support call privacy settings and permissions
- Implement caller ID and contact verification
- Provide call blocking and filtering features
- Support anonymous and private calling modes

**Access Control**
- Implement call permission and authorization systems
- Support role-based calling privileges
- Enable call access control lists
- Provide call moderation and administration
- Support enterprise calling policies

### User Experience Patterns

**Call Interface Design**
- Provide intuitive call control interfaces
- Support responsive design for different screen sizes
- Implement accessible call controls and navigation
- Enable customizable call interface layouts
- Support picture-in-picture and floating windows

**Call Notifications**
- Send incoming call notifications and alerts
- Support call notification customization
- Enable missed call notifications and callbacks
- Implement call history and log features
- Support call reminder and scheduling notifications

**Call Quality Indicators**
- Display real-time call quality metrics
- Provide network status and connection indicators
- Enable call quality feedback and reporting
- Implement call troubleshooting and diagnostics
- Support call quality optimization suggestions

### Integration Patterns

**Messaging Integration**
- Enable call initiation from messaging conversations
- Support call-to-message transitions
- Implement call summary and notes in chat
- Provide call recording sharing in messages
- Support voice message and video message features

**Calendar Integration**
- Support scheduled call creation and management
- Enable calendar-based call reminders
- Implement meeting room and conference scheduling
- Provide calendar integration for call history
- Support recurring call scheduling

**Contact Integration**
- Enable calling from contact lists and profiles
- Support contact-based call permissions
- Implement favorite contacts for quick calling
- Provide call history integration with contacts
- Support contact verification for calling

### Performance Optimization

**Media Optimization**
- Implement efficient video encoding and decoding
- Support hardware acceleration for media processing
- Enable adaptive streaming based on device capabilities
- Provide media compression and optimization
- Support low-latency media transmission

**Network Optimization**
- Implement intelligent routing and path selection
- Support QoS (Quality of Service) optimization
- Enable bandwidth management and allocation
- Provide network congestion detection and handling
- Support edge server and CDN integration

**Resource Management**
- Optimize CPU and memory usage during calls
- Support battery optimization for mobile devices
- Enable resource allocation based on call priority
- Implement efficient media buffer management
- Support background call processing optimization

### Scalability Architecture

**Infrastructure Scaling**
- Design for horizontal scaling of calling infrastructure
- Support load balancing across media servers
- Enable geographic distribution of calling services
- Implement auto-scaling based on call volume
- Support multi-region call routing and failover

**Media Server Architecture**
- Implement scalable media server infrastructure
- Support SFU (Selective Forwarding Unit) architecture
- Enable MCU (Multipoint Control Unit) for large conferences
- Provide media server clustering and redundancy
- Support cloud-based media processing services

### Testing Strategy

**Call Functionality Testing**
- Test call establishment and termination workflows
- Validate audio and video quality across devices
- Test group calling and conference features
- Verify screen sharing and collaboration tools
- Test call recording and playback functionality

**Performance Testing**
- Test calling system under high concurrent load
- Validate media quality under various network conditions
- Test call latency and real-time performance
- Verify resource usage and optimization
- Test calling system scalability limits

**Compatibility Testing**
- Test calling features across different browsers
- Validate mobile and desktop application compatibility
- Test integration with various devices and hardware
- Verify codec compatibility and media format support
- Test calling features across different network types

### Monitoring and Analytics

**Call Quality Metrics**
- Monitor call success rates and connection quality
- Track audio and video quality metrics
- Measure call latency and jitter statistics
- Monitor bandwidth usage and optimization
- Track user satisfaction and call ratings

**System Performance Metrics**
- Monitor calling infrastructure performance
- Track media server utilization and capacity
- Measure call setup time and connection speed
- Monitor system reliability and uptime
- Track resource usage and cost optimization

**User Behavior Analytics**
- Analyze calling patterns and usage trends
- Track feature adoption and user engagement
- Monitor call duration and frequency statistics
- Measure user retention through calling features
- Analyze calling feature effectiveness

### Advanced Features

**AI-Powered Calling**
- Implement real-time transcription and translation
- Support noise cancellation and audio enhancement
- Enable automatic call summarization and notes
- Provide intelligent call routing and matching
- Support voice recognition and authentication

**Augmented Reality Integration**
- Enable AR filters and effects during video calls
- Support virtual backgrounds and environments
- Implement AR-based collaboration tools
- Provide immersive calling experiences
- Support AR-based presentation and sharing

**Integration with IoT and Smart Devices**
- Support calling through smart speakers and displays
- Enable integration with smart home devices
- Implement hands-free calling and voice control
- Support calling through wearable devices
- Enable calling integration with automotive systems

## Real-World Considerations

**Cross-Platform Compatibility**
- Ensure calling features work across all platforms
- Support native mobile app integration
- Enable web-based calling without plugins
- Implement consistent calling experience
- Support legacy system integration

**Global Calling Challenges**
- Handle different network conditions globally
- Support international calling regulations
- Implement region-specific calling features
- Handle time zone and cultural considerations
- Support local calling number integration

**Accessibility and Inclusion**
- Ensure calling interfaces are accessible
- Support hearing and vision impaired users
- Implement sign language interpretation features
- Enable text-to-speech and speech-to-text
- Support assistive technology integration

**Business and Enterprise Features**
- Implement business calling and conferencing
- Support enterprise security and compliance
- Enable call center and customer service features
- Provide calling analytics and reporting
- Support integration with business systems

This template provides a comprehensive foundation for implementing robust, high-quality voice and video calling systems that can handle the demands of modern social applications while maintaining excellent user experience, security, and scalability.
