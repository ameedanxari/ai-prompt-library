# Product Reviews and Rating System Template

## Purpose

This template provides comprehensive patterns for building robust product review and rating systems that collect authentic customer feedback, prevent fraud, and provide valuable insights for both customers and businesses. It covers review collection, moderation, verification, and analytics.

## Context

Product reviews are crucial for e-commerce success, influencing purchase decisions and providing valuable feedback. This template addresses the complexity of managing authentic reviews, preventing fake reviews, implementing moderation workflows, and extracting actionable insights from customer feedback while maintaining trust and transparency.

## Core Review System Patterns

### 1. Review Data Model

Define comprehensive review and rating structures:

```typescript
interface ProductReview {
  id: string;
  productId: string;
  variantId?: string;
  customerId: string;
  orderId?: string; // For verified purchase reviews
  
  // Review content
  rating: number; // 1-5 stars
  title?: string;
  content: string;
  pros?: string[];
  cons?: string[];
  
  // Verification
  isVerifiedPurchase: boolean;
  verificationStatus: VerificationStatus;
  verificationDate?: Date;
  
  // Moderation
  moderationStatus: ModerationStatus;
  moderatedBy?: string;
  moderatedAt?: Date;
  moderationNotes?: string;
  
  // Engagement
  helpfulVotes: number;
  unhelpfulVotes: number;
  totalVotes: number;
  helpfulnessScore: number;
  
  // Media
  images: ReviewImage[];
  videos: ReviewVideo[];
  
  // Metadata
  reviewSource: ReviewSource;
  deviceType?: string;
  ipAddress?: string;
  userAgent?: string;
  
  // Response
  merchantResponse?: MerchantResponse;
  
  // Status
  isPublished: boolean;
  isFeatured: boolean;
  isReported: boolean;
  reportCount: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  UNVERIFIED = 'unverified',
  SUSPICIOUS = 'suspicious',
  FAKE = 'fake'
}

enum ModerationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged',
  REQUIRES_REVIEW = 'requires_review'
}

enum ReviewSource {
  WEBSITE = 'website',
  MOBILE_APP = 'mobile_app',
  EMAIL_CAMPAIGN = 'email_campaign',
  SMS_CAMPAIGN = 'sms_campaign',
  THIRD_PARTY = 'third_party',
  IMPORT = 'import'
}

interface ReviewImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  caption?: string;
  isVerified: boolean;
  uploadedAt: Date;
}

interface MerchantResponse {
  id: string;
  content: string;
  respondedBy: string;
  respondedAt: Date;
  isPublic: boolean;
}

interface ReviewSummary {
  productId: string;
  totalReviews: number;
  averageRating: number;
  ratingDistribution: RatingDistribution;
  verifiedPurchasePercentage: number;
  recommendationPercentage: number;
  lastUpdated: Date;
}

interface RatingDistribution {
  fiveStars: number;
  fourStars: number;
  threeStars: number;
  twoStars: number;
  oneStar: number;
}
```

### 2. Review Collection System

Implement comprehensive review collection workflows:

```typescript
class ReviewCollectionManager {
  async requestReview(orderId: string, productId: string, customerId: string): Promise<ReviewRequest> {
    // Check if customer is eligible to review
    const eligibility = await this.checkReviewEligibility(customerId, productId, orderId);
    if (!eligibility.isEligible) {
      throw new Error(`Customer not eligible to review: ${eligibility.reason}`);
    }
    
    // Check if review already exists
    const existingReview = await this.reviewRepository.findByCustomerAndProduct(customerId, productId);
    if (existingReview) {
      throw new Error('Customer has already reviewed this product');
    }
    
    // Create review request
    const reviewRequest: ReviewRequest = {
      id: this.generateRequestId(),
      orderId,
      productId,
      customerId,
      status: ReviewRequestStatus.PENDING,
      requestedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      remindersSent: 0,
      maxReminders: 3
    };
    
    await this.reviewRequestRepository.save(reviewRequest);
    
    // Schedule initial review invitation
    await this.scheduleReviewInvitation(reviewRequest);
    
    return reviewRequest;
  }
  
  async submitReview(reviewData: CreateReviewRequest): Promise<ProductReview> {
    // Validate review data
    const validation = await this.validateReviewData(reviewData);
    if (!validation.isValid) {
      throw new Error(`Invalid review data: ${validation.errors.join(', ')}`);
    }
    
    // Check for duplicate reviews
    const existingReview = await this.reviewRepository.findByCustomerAndProduct(
      reviewData.customerId,
      reviewData.productId
    );
    if (existingReview) {
      throw new Error('Customer has already reviewed this product');
    }
    
    // Verify purchase if order ID provided
    let isVerifiedPurchase = false;
    if (reviewData.orderId) {
      isVerifiedPurchase = await this.verifyPurchase(
        reviewData.customerId,
        reviewData.productId,
        reviewData.orderId
      );
    }
    
    // Create review
    const review: ProductReview = {
      id: this.generateReviewId(),
      productId: reviewData.productId,
      variantId: reviewData.variantId,
      customerId: reviewData.customerId,
      orderId: reviewData.orderId,
      rating: reviewData.rating,
      title: reviewData.title,
      content: reviewData.content,
      pros: reviewData.pros || [],
      cons: reviewData.cons || [],
      isVerifiedPurchase,
      verificationStatus: isVerifiedPurchase ? VerificationStatus.VERIFIED : VerificationStatus.PENDING,
      moderationStatus: ModerationStatus.PENDING,
      helpfulVotes: 0,
      unhelpfulVotes: 0,
      totalVotes: 0,
      helpfulnessScore: 0,
      images: [],
      videos: [],
      reviewSource: reviewData.source || ReviewSource.WEBSITE,
      deviceType: reviewData.deviceType,
      ipAddress: reviewData.ipAddress,
      userAgent: reviewData.userAgent,
      isPublished: false,
      isFeatured: false,
      isReported: false,
      reportCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Process uploaded media
    if (reviewData.images && reviewData.images.length > 0) {
      review.images = await this.processReviewImages(reviewData.images);
    }
    
    if (reviewData.videos && reviewData.videos.length > 0) {
      review.videos = await this.processReviewVideos(reviewData.videos);
    }
    
    // Save review
    await this.reviewRepository.save(review);
    
    // Queue for moderation
    await this.queueForModeration(review);
    
    // Run fraud detection
    await this.runFraudDetection(review);
    
    // Send confirmation to customer
    await this.sendReviewConfirmation(review);
    
    // Update review request status if applicable
    if (reviewData.orderId) {
      await this.updateReviewRequestStatus(reviewData.orderId, reviewData.productId, ReviewRequestStatus.COMPLETED);
    }
    
    return review;
  }
  
  private async checkReviewEligibility(customerId: string, productId: string, orderId: string): Promise<EligibilityResult> {
    // Check if order exists and belongs to customer
    const order = await this.orderRepository.findById(orderId);
    if (!order || order.customerId !== customerId) {
      return { isEligible: false, reason: 'Order not found or does not belong to customer' };
    }
    
    // Check if order contains the product
    const orderItem = order.items.find(item => item.productId === productId);
    if (!orderItem) {
      return { isEligible: false, reason: 'Product not found in order' };
    }
    
    // Check if order is completed
    if (order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.DELIVERED) {
      return { isEligible: false, reason: 'Order not yet completed' };
    }
    
    // Check if enough time has passed since delivery
    const minDaysAfterDelivery = 1;
    const deliveryDate = order.deliveredAt || order.completedAt;
    const daysSinceDelivery = Math.floor((Date.now() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceDelivery < minDaysAfterDelivery) {
      return { isEligible: false, reason: 'Too soon after delivery to review' };
    }
    
    // Check if review window is still open
    const maxDaysAfterDelivery = 90;
    if (daysSinceDelivery > maxDaysAfterDelivery) {
      return { isEligible: false, reason: 'Review window has expired' };
    }
    
    return { isEligible: true };
  }
  
  private async validateReviewData(reviewData: CreateReviewRequest): Promise<ValidationResult> {
    const result: ValidationResult = { isValid: true, errors: [] };
    
    // Rating validation
    if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
      result.isValid = false;
      result.errors.push('Rating must be between 1 and 5');
    }
    
    // Content validation
    if (!reviewData.content || reviewData.content.trim().length < 10) {
      result.isValid = false;
      result.errors.push('Review content must be at least 10 characters');
    }
    
    if (reviewData.content && reviewData.content.length > 5000) {
      result.isValid = false;
      result.errors.push('Review content must be less than 5000 characters');
    }
    
    // Title validation
    if (reviewData.title && reviewData.title.length > 200) {
      result.isValid = false;
      result.errors.push('Review title must be less than 200 characters');
    }
    
    // Profanity check
    if (await this.containsProfanity(reviewData.content) || 
        (reviewData.title && await this.containsProfanity(reviewData.title))) {
      result.isValid = false;
      result.errors.push('Review contains inappropriate language');
    }
    
    // Spam check
    if (await this.isSpam(reviewData.content)) {
      result.isValid = false;
      result.errors.push('Review appears to be spam');
    }
    
    return result;
  }
}
```

### 3. Review Moderation System

Implement comprehensive review moderation:

```typescript
class ReviewModerationManager {
  async moderateReview(reviewId: string, moderatorId: string, decision: ModerationDecision): Promise<void> {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }
    
    // Update moderation status
    review.moderationStatus = decision.status;
    review.moderatedBy = moderatorId;
    review.moderatedAt = new Date();
    review.moderationNotes = decision.notes;
    review.updatedAt = new Date();
    
    // Handle approval
    if (decision.status === ModerationStatus.APPROVED) {
      review.isPublished = true;
      review.publishedAt = new Date();
      
      // Update product review summary
      await this.updateProductReviewSummary(review.productId);
      
      // Send approval notification to customer
      await this.sendReviewApprovalNotification(review);
      
      // Check if review should be featured
      if (await this.shouldFeatureReview(review)) {
        review.isFeatured = true;
      }
    }
    
    // Handle rejection
    if (decision.status === ModerationStatus.REJECTED) {
      review.isPublished = false;
      
      // Send rejection notification to customer
      await this.sendReviewRejectionNotification(review, decision.notes);
    }
    
    await this.reviewRepository.save(review);
    
    // Log moderation action
    await this.logModerationAction(reviewId, moderatorId, decision);
  }
  
  async getReviewsForModeration(filters: ModerationFilters): Promise<ReviewModerationQueue> {
    const reviews = await this.reviewRepository.findForModeration(filters);
    
    // Prioritize reviews by risk score and age
    const prioritizedReviews = reviews.sort((a, b) => {
      const aScore = this.calculateModerationPriority(a);
      const bScore = this.calculateModerationPriority(b);
      return bScore - aScore;
    });
    
    return {
      reviews: prioritizedReviews,
      totalCount: reviews.length,
      highPriorityCount: reviews.filter(r => this.calculateModerationPriority(r) > 80).length,
      averageWaitTime: this.calculateAverageWaitTime(reviews)
    };
  }
  
  private calculateModerationPriority(review: ProductReview): number {
    let priority = 0;
    
    // Age factor (older reviews get higher priority)
    const ageInHours = (Date.now() - review.createdAt.getTime()) / (1000 * 60 * 60);
    priority += Math.min(ageInHours * 2, 50);
    
    // Verification status
    if (review.isVerifiedPurchase) {
      priority += 20;
    }
    
    // Rating extremes (1 or 5 stars) get higher priority
    if (review.rating === 1 || review.rating === 5) {
      priority += 15;
    }
    
    // Reviews with media get higher priority
    if (review.images.length > 0 || review.videos.length > 0) {
      priority += 10;
    }
    
    // Fraud detection score
    if (review.verificationStatus === VerificationStatus.SUSPICIOUS) {
      priority += 30;
    }
    
    // Length of content (longer reviews may need more attention)
    if (review.content.length > 500) {
      priority += 5;
    }
    
    return Math.min(priority, 100);
  }
  
  async runAutomaticModeration(reviewId: string): Promise<AutoModerationResult> {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }
    
    const result: AutoModerationResult = {
      reviewId,
      action: AutoModerationAction.MANUAL_REVIEW,
      confidence: 0,
      reasons: []
    };
    
    // Content analysis
    const contentAnalysis = await this.analyzeReviewContent(review);
    
    // Spam detection
    if (contentAnalysis.spamScore > 0.8) {
      result.action = AutoModerationAction.REJECT;
      result.confidence = contentAnalysis.spamScore;
      result.reasons.push('High spam probability');
    }
    
    // Profanity detection
    if (contentAnalysis.profanityScore > 0.7) {
      result.action = AutoModerationAction.REJECT;
      result.confidence = Math.max(result.confidence, contentAnalysis.profanityScore);
      result.reasons.push('Contains inappropriate language');
    }
    
    // Sentiment analysis for extreme negativity without substance
    if (contentAnalysis.sentiment < -0.8 && review.content.length < 50) {
      result.action = AutoModerationAction.FLAG;
      result.confidence = Math.max(result.confidence, 0.6);
      result.reasons.push('Extremely negative with minimal content');
    }
    
    // Verified purchase with reasonable content
    if (review.isVerifiedPurchase && 
        contentAnalysis.spamScore < 0.3 && 
        contentAnalysis.profanityScore < 0.3 &&
        review.content.length > 20) {
      result.action = AutoModerationAction.APPROVE;
      result.confidence = 0.8;
      result.reasons.push('Verified purchase with appropriate content');
    }
    
    // Apply automatic action if confidence is high enough
    if (result.confidence > 0.85) {
      await this.applyAutomaticModerationAction(review, result);
    }
    
    return result;
  }
  
  private async analyzeReviewContent(review: ProductReview): Promise<ContentAnalysis> {
    // Use AI/ML services for content analysis
    const [spamAnalysis, profanityAnalysis, sentimentAnalysis] = await Promise.all([
      this.spamDetectionService.analyze(review.content),
      this.profanityDetectionService.analyze(review.content),
      this.sentimentAnalysisService.analyze(review.content)
    ]);
    
    return {
      spamScore: spamAnalysis.score,
      profanityScore: profanityAnalysis.score,
      sentiment: sentimentAnalysis.sentiment,
      topics: sentimentAnalysis.topics,
      language: sentimentAnalysis.language
    };
  }
}
```

### 4. Review Fraud Detection

Implement sophisticated fraud detection:

```typescript
class ReviewFraudDetector {
  async detectFraudulentReview(review: ProductReview): Promise<FraudDetectionResult> {
    const signals: FraudSignal[] = [];
    let riskScore = 0;
    
    // Velocity checks
    const velocitySignals = await this.checkVelocityPatterns(review);
    signals.push(...velocitySignals);
    riskScore += velocitySignals.reduce((sum, signal) => sum + signal.weight, 0);
    
    // IP address analysis
    const ipSignals = await this.analyzeIPAddress(review);
    signals.push(...ipSignals);
    riskScore += ipSignals.reduce((sum, signal) => sum + signal.weight, 0);
    
    // Content similarity analysis
    const contentSignals = await this.analyzeContentSimilarity(review);
    signals.push(...contentSignals);
    riskScore += contentSignals.reduce((sum, signal) => sum + signal.weight, 0);
    
    // Customer behavior analysis
    const behaviorSignals = await this.analyzeCustomerBehavior(review);
    signals.push(...behaviorSignals);
    riskScore += behaviorSignals.reduce((sum, signal) => sum + signal.weight, 0);
    
    // Purchase pattern analysis
    const purchaseSignals = await this.analyzePurchasePatterns(review);
    signals.push(...purchaseSignals);
    riskScore += purchaseSignals.reduce((sum, signal) => sum + signal.weight, 0);
    
    // Determine risk level
    let riskLevel: FraudRiskLevel;
    if (riskScore >= 80) {
      riskLevel = FraudRiskLevel.HIGH;
    } else if (riskScore >= 50) {
      riskLevel = FraudRiskLevel.MEDIUM;
    } else if (riskScore >= 20) {
      riskLevel = FraudRiskLevel.LOW;
    } else {
      riskLevel = FraudRiskLevel.MINIMAL;
    }
    
    const result: FraudDetectionResult = {
      reviewId: review.id,
      riskScore,
      riskLevel,
      signals,
      recommendedAction: this.getRecommendedAction(riskLevel),
      confidence: this.calculateConfidence(signals),
      analyzedAt: new Date()
    };
    
    // Update review verification status
    if (riskLevel === FraudRiskLevel.HIGH) {
      review.verificationStatus = VerificationStatus.SUSPICIOUS;
    } else if (riskLevel === FraudRiskLevel.MEDIUM) {
      review.verificationStatus = VerificationStatus.PENDING;
    }
    
    await this.reviewRepository.save(review);
    
    // Log fraud detection result
    await this.fraudDetectionLogRepository.save(result);
    
    return result;
  }
  
  private async checkVelocityPatterns(review: ProductReview): Promise<FraudSignal[]> {
    const signals: FraudSignal[] = [];
    
    // Check reviews from same customer in short time period
    const recentReviews = await this.reviewRepository.findRecentByCustomer(
      review.customerId,
      new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
    );
    
    if (recentReviews.length > 5) {
      signals.push({
        type: FraudSignalType.HIGH_VELOCITY,
        description: `Customer submitted ${recentReviews.length} reviews in 24 hours`,
        weight: 25,
        evidence: { reviewCount: recentReviews.length, timeframe: '24h' }
      });
    }
    
    // Check reviews from same IP in short time period
    if (review.ipAddress) {
      const ipReviews = await this.reviewRepository.findRecentByIP(
        review.ipAddress,
        new Date(Date.now() - 60 * 60 * 1000) // Last hour
      );
      
      if (ipReviews.length > 3) {
        signals.push({
          type: FraudSignalType.IP_VELOCITY,
          description: `${ipReviews.length} reviews from same IP in 1 hour`,
          weight: 30,
          evidence: { reviewCount: ipReviews.length, ipAddress: review.ipAddress }
        });
      }
    }
    
    return signals;
  }
  
  private async analyzeContentSimilarity(review: ProductReview): Promise<FraudSignal[]> {
    const signals: FraudSignal[] = [];
    
    // Find similar reviews for the same product
    const similarReviews = await this.findSimilarReviews(review);
    
    for (const similarReview of similarReviews) {
      const similarity = this.calculateTextSimilarity(review.content, similarReview.content);
      
      if (similarity > 0.8) {
        signals.push({
          type: FraudSignalType.CONTENT_SIMILARITY,
          description: `High content similarity (${Math.round(similarity * 100)}%) with another review`,
          weight: 35,
          evidence: { 
            similarReviewId: similarReview.id,
            similarity,
            similarContent: similarReview.content.substring(0, 100)
          }
        });
      }
    }
    
    // Check for template-like content
    const templateScore = await this.detectTemplateContent(review.content);
    if (templateScore > 0.7) {
      signals.push({
        type: FraudSignalType.TEMPLATE_CONTENT,
        description: `Content appears to follow a template pattern`,
        weight: 20,
        evidence: { templateScore }
      });
    }
    
    return signals;
  }
  
  private async analyzeCustomerBehavior(review: ProductReview): Promise<FraudSignal[]> {
    const signals: FraudSignal[] = [];
    
    // Get customer's review history
    const customerReviews = await this.reviewRepository.findByCustomer(review.customerId);
    
    // Check for unusual rating patterns
    if (customerReviews.length > 5) {
      const ratings = customerReviews.map(r => r.rating);
      const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
      
      // Check if customer only gives extreme ratings
      const extremeRatings = ratings.filter(r => r === 1 || r === 5).length;
      const extremeRatio = extremeRatings / ratings.length;
      
      if (extremeRatio > 0.8) {
        signals.push({
          type: FraudSignalType.EXTREME_RATING_PATTERN,
          description: `Customer gives extreme ratings ${Math.round(extremeRatio * 100)}% of the time`,
          weight: 15,
          evidence: { extremeRatio, totalReviews: ratings.length }
        });
      }
      
      // Check if customer always gives 5-star reviews
      const fiveStarRatio = ratings.filter(r => r === 5).length / ratings.length;
      if (fiveStarRatio > 0.9 && ratings.length > 10) {
        signals.push({
          type: FraudSignalType.ALWAYS_POSITIVE,
          description: `Customer gives 5-star reviews ${Math.round(fiveStarRatio * 100)}% of the time`,
          weight: 20,
          evidence: { fiveStarRatio, totalReviews: ratings.length }
        });
      }
    }
    
    // Check account age vs review activity
    const customer = await this.customerRepository.findById(review.customerId);
    if (customer) {
      const accountAgeInDays = Math.floor((Date.now() - customer.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      
      if (accountAgeInDays < 30 && customerReviews.length > 10) {
        signals.push({
          type: FraudSignalType.NEW_ACCOUNT_HIGH_ACTIVITY,
          description: `New account (${accountAgeInDays} days) with high review activity`,
          weight: 25,
          evidence: { accountAge: accountAgeInDays, reviewCount: customerReviews.length }
        });
      }
    }
    
    return signals;
  }
  
  private calculateTextSimilarity(text1: string, text2: string): number {
    // Implement text similarity algorithm (e.g., cosine similarity, Jaccard similarity)
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size; // Jaccard similarity
  }
}
```

### 5. Review Analytics and Insights

Implement comprehensive review analytics:

```typescript
class ReviewAnalyticsEngine {
  async generateProductReviewInsights(productId: string, timeframe: string = '90d'): Promise<ProductReviewInsights> {
    const endDate = new Date();
    const startDate = this.calculateStartDate(endDate, timeframe);
    
    // Get all reviews for the product in the timeframe
    const reviews = await this.reviewRepository.findByProductAndDateRange(productId, startDate, endDate);
    
    // Basic metrics
    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
    const verifiedReviews = reviews.filter(r => r.isVerifiedPurchase).length;
    const verificationRate = verifiedReviews / totalReviews;
    
    // Rating distribution
    const ratingDistribution = this.calculateRatingDistribution(reviews);
    
    // Sentiment analysis
    const sentimentAnalysis = await this.analyzeSentimentTrends(reviews);
    
    // Topic analysis
    const topicAnalysis = await this.analyzeReviewTopics(reviews);
    
    // Helpfulness analysis
    const helpfulnessAnalysis = this.analyzeReviewHelpfulness(reviews);
    
    // Competitive analysis
    const competitiveAnalysis = await this.generateCompetitiveAnalysis(productId);
    
    // Review trends
    const reviewTrends = this.analyzeReviewTrends(reviews, timeframe);
    
    return {
      productId,
      timeframe,
      totalReviews,
      averageRating,
      verificationRate,
      ratingDistribution,
      sentimentAnalysis,
      topicAnalysis,
      helpfulnessAnalysis,
      competitiveAnalysis,
      reviewTrends,
      generatedAt: new Date()
    };
  }
  
  private async analyzeReviewTopics(reviews: ProductReview[]): Promise<TopicAnalysis> {
    // Extract topics from review content
    const allContent = reviews.map(r => r.content).join(' ');
    
    // Use NLP to extract topics and themes
    const topics = await this.nlpService.extractTopics(allContent, {
      maxTopics: 10,
      minFrequency: 3
    });
    
    // Analyze sentiment for each topic
    const topicSentiments = await Promise.all(
      topics.map(async topic => {
        const topicReviews = reviews.filter(r => 
          r.content.toLowerCase().includes(topic.keyword.toLowerCase())
        );
        
        const sentiments = await Promise.all(
          topicReviews.map(r => this.nlpService.analyzeSentiment(r.content))
        );
        
        const averageSentiment = sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length;
        
        return {
          topic: topic.keyword,
          frequency: topic.frequency,
          sentiment: averageSentiment,
          reviewCount: topicReviews.length,
          examples: topicReviews.slice(0, 3).map(r => ({
            reviewId: r.id,
            excerpt: r.content.substring(0, 100) + '...',
            rating: r.rating
          }))
        };
      })
    );
    
    return {
      topics: topicSentiments,
      positiveTopics: topicSentiments.filter(t => t.sentiment > 0.2),
      negativeTopics: topicSentiments.filter(t => t.sentiment < -0.2),
      neutralTopics: topicSentiments.filter(t => Math.abs(t.sentiment) <= 0.2)
    };
  }
  
  async generateReviewQualityReport(): Promise<ReviewQualityReport> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
    
    // Get all reviews in the timeframe
    const reviews = await this.reviewRepository.findByDateRange(startDate, endDate);
    
    // Quality metrics
    const totalReviews = reviews.length;
    const verifiedReviews = reviews.filter(r => r.isVerifiedPurchase).length;
    const reviewsWithImages = reviews.filter(r => r.images.length > 0).length;
    const reviewsWithVideos = reviews.filter(r => r.videos.length > 0).length;
    const helpfulReviews = reviews.filter(r => r.helpfulnessScore > 0.7).length;
    
    // Content quality analysis
    const averageContentLength = reviews.reduce((sum, r) => sum + r.content.length, 0) / totalReviews;
    const detailedReviews = reviews.filter(r => r.content.length > 100).length;
    
    // Moderation metrics
    const pendingModeration = reviews.filter(r => r.moderationStatus === ModerationStatus.PENDING).length;
    const rejectedReviews = reviews.filter(r => r.moderationStatus === ModerationStatus.REJECTED).length;
    const flaggedReviews = reviews.filter(r => r.moderationStatus === ModerationStatus.FLAGGED).length;
    
    // Fraud detection metrics
    const suspiciousReviews = reviews.filter(r => r.verificationStatus === VerificationStatus.SUSPICIOUS).length;
    const fakeReviews = reviews.filter(r => r.verificationStatus === VerificationStatus.FAKE).length;
    
    return {
      timeframe: { startDate, endDate },
      totalReviews,
      qualityMetrics: {
        verificationRate: verifiedReviews / totalReviews,
        mediaAttachmentRate: (reviewsWithImages + reviewsWithVideos) / totalReviews,
        helpfulnessRate: helpfulReviews / totalReviews,
        detailedReviewRate: detailedReviews / totalReviews,
        averageContentLength
      },
      moderationMetrics: {
        pendingModerationRate: pendingModeration / totalReviews,
        rejectionRate: rejectedReviews / totalReviews,
        flaggedRate: flaggedReviews / totalReviews
      },
      fraudMetrics: {
        suspiciousRate: suspiciousReviews / totalReviews,
        fakeReviewRate: fakeReviews / totalReviews
      },
      generatedAt: new Date()
    };
  }
}
```

## Implementation Checklist

### Review Collection
- [ ] Build review request and invitation system
- [ ] Implement review submission forms and validation
- [ ] Set up verified purchase verification
- [ ] Create review media upload and processing
- [ ] Build review reminder and follow-up campaigns

### Moderation System
- [ ] Implement review moderation queue and workflows
- [ ] Build automatic content analysis and filtering
- [ ] Create manual moderation tools and interfaces
- [ ] Set up moderation rules and guidelines
- [ ] Build moderation analytics and reporting

### Fraud Detection
- [ ] Implement velocity and pattern detection
- [ ] Build content similarity analysis
- [ ] Create IP address and device fingerprinting
- [ ] Set up customer behavior analysis
- [ ] Build fraud detection reporting and alerts

### Review Display
- [ ] Create review listing and filtering interfaces
- [ ] Build review summary and rating displays
- [ ] Implement review helpfulness voting
- [ ] Set up review sorting and pagination
- [ ] Create review search and filtering

### Analytics and Insights
- [ ] Build review analytics dashboards
- [ ] Implement sentiment and topic analysis
- [ ] Create competitive review analysis
- [ ] Set up review quality reporting
- [ ] Build review trend analysis

## Configuration Parameters

```yaml
review_system:
  collection:
    min_content_length: 10
    max_content_length: 5000
    max_images_per_review: 5
    max_videos_per_review: 2
    review_window_days: 90
    
  moderation:
    auto_approve_verified: true
    auto_approve_threshold: 0.85
    require_moderation_threshold: 0.5
    max_pending_days: 3
    
  fraud_detection:
    enable_velocity_checks: true
    enable_content_similarity: true
    enable_ip_analysis: true
    risk_threshold_high: 80
    risk_threshold_medium: 50
    
  display:
    default_sort: "helpfulness"
    reviews_per_page: 20
    enable_review_voting: true
    show_verification_badges: true
```

## Integration Points

- **Product Catalog**: Product information and review summaries
- **Order Management**: Purchase verification and review requests
- **Customer Management**: Customer review history and preferences
- **Notification System**: Review invitations and status updates
- **Analytics**: Review performance and insights
- **Content Moderation**: Automated content analysis and filtering

## Success Metrics

- Review collection rate: >25% of eligible customers
- Review verification rate: >60% verified purchases
- Review helpfulness score: >4.0 average
- Moderation efficiency: <24 hours average processing time
- Fraud detection accuracy: >90% precision
- Customer satisfaction with reviews: >4.5/5

## Common Pitfalls to Avoid

1. **Inadequate fraud detection**: Implement comprehensive fraud prevention
2. **Poor moderation workflows**: Create efficient moderation processes
3. **Ignoring review quality**: Focus on helpful, detailed reviews
4. **Missing verification**: Prioritize verified purchase reviews
5. **Poor review display**: Make reviews easy to read and navigate
6. **Inadequate analytics**: Use review data for product insights
7. **Missing incentives**: Encourage quality review submissions

## Related Templates

- `product-catalog.md` - Product information and review integration
- `order-management.md` - Purchase verification and review triggers
- `customer-management.md` - Customer review history and preferences
- `notification-system.md` - Review invitations and communications
- `analytics-dashboard.md` - Review analytics and reporting