# Live Events Template

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

Provides comprehensive patterns for event broadcasting and audience interaction in live event applications. This template covers event management, audience engagement, interactive features, and scalable broadcasting infrastructure for virtual events, webinars, and live shows.

## Context

Live events require managing large audiences, interactive features, and real-time engagement while maintaining broadcast quality and reliability. This template addresses challenges including audience scalability, engagement features, content moderation, and monetization for various event types.

## Core Components

### Event Manager

## Examples

```typescript
interface EventManager {
  // Event lifecycle
  createEvent(config: EventConfig): Promise<LiveEvent>;
  startEvent(eventId: string): Promise<void>;
  endEvent(eventId: string): Promise<void>;
  
  // Audience management
  getAudienceCount(eventId: string): Promise<number>;
  getAudienceEngagement(eventId: string): Promise<EngagementMetrics>;
  
  // Interactive features
  enablePolls(eventId: string): Promise<void>;
  enableQA(eventId: string): Promise<void>;
  enableChat(eventId: string): Promise<void>;
}

interface LiveEvent {
  id: string;
  title: string;
  description: string;
  organizerId: string;
  status: EventStatus;
  audienceCount: number;
  startTime: Date;
  endTime?: Date;
  settings: EventSettings;
}
```

## Implementation Patterns

### Basic Event Setup

```typescript
class LiveEventService {
  async createLiveEvent(config: EventConfig): Promise<LiveEvent> {
    const event = await this.eventManager.createEvent(config);
    
    // Setup broadcasting infrastructure
    await this.setupBroadcasting(event.id, config);
    
    // Setup audience management
    await this.setupAudienceManagement(event.id);
    
    // Setup interactive features
    if (config.enableInteraction) {
      await this.setupInteractiveFeatures(event.id, config.interactionConfig);
    }
    
    return event;
  }
}
```

## Integration Points

### Broadcasting Integration
- CDN setup for global distribution
- Multi-bitrate streaming
- Real-time analytics

### Audience Engagement
- Live chat and reactions
- Polls and Q&A
- Social media integration

## Security Considerations

### Access Control
- Event authentication
- Audience verification
- Content protection

### Content Moderation
- Real-time chat moderation
- Automated content filtering
- Moderator tools

## Testing Considerations

### Load Testing
- High audience capacity
- Concurrent interactions
- Broadcasting stability
