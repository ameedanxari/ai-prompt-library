import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface PaymentTemplateStructure {
  hasPaymentProcessingTemplate: boolean;
  hasPaymentSecurityTemplate: boolean;
  hasPaymentMethodsTemplate: boolean;
  hasPaymentSubscriptionsTemplate: boolean;
  allTemplatesHaveRequiredSections: boolean;
  templatesHaveImplementationPatterns: boolean;
  templatesHaveConfigurationExamples: boolean;
  templatesHaveIntegrationPoints: boolean;
  templatesHaveSecurityConsiderations: boolean;
}

export interface ProductTemplateStructure {
  hasProductCatalogTemplate: boolean;
  hasInventoryManagementTemplate: boolean;
  hasProductSearchTemplate: boolean;
  hasProductReviewsTemplate: boolean;
  allTemplatesHaveRequiredSections: boolean;
  templatesHaveImplementationPatterns: boolean;
  templatesHaveConfigurationExamples: boolean;
  templatesHaveIntegrationPoints: boolean;
  templatesHaveDataModels: boolean;
}

export interface ShoppingWorkflowTemplateStructure {
  hasShoppingCartTemplate: boolean;
  hasCheckoutWorkflowTemplate: boolean;
  hasOrderManagementTemplate: boolean;
  hasMarketplaceFeaturesTemplate: boolean;
  templateCount: number;
}

export interface ShoppingWorkflowCoverage {
  // Cart Management Features
  hasCartManagement: boolean;
  hasWishlistFeatures: boolean;
  hasPersistentCart: boolean;
  hasCartSynchronization: boolean;
  hasQuantityUpdates: boolean;
  hasPriceAlerts: boolean;

  // Checkout Features
  hasCheckoutOptimization: boolean;
  hasGuestCheckout: boolean;
  hasExpressCheckout: boolean;
  hasAddressValidation: boolean;
  hasAccountCreationOffer: boolean;
  hasSavedAddresses: boolean;
  hasSavedPaymentMethods: boolean;
  hasMobileOptimization: boolean;
  hasApplePay: boolean;
  hasGooglePay: boolean;

  // Order Management Features
  hasOrderManagement: boolean;
  hasFulfillmentTracking: boolean;
  hasInventoryAllocation: boolean;
  hasNotificationSystem: boolean;
  hasCarrierIntegration: boolean;
  hasRecurringOrders: boolean;
  hasSubscriptionManagement: boolean;
  hasInternationalShipping: boolean;
  hasCurrencySupport: boolean;

  // Marketplace Features
  hasMultiVendorSupport: boolean;
  hasCommissionTracking: boolean;
  hasVendorOnboarding: boolean;
  hasPayoutProcessing: boolean;
  hasDisputeResolution: boolean;
}

export interface ShoppingWorkflowDataModels {
  // Cart Data Models
  hasCartItemModel: boolean;
  hasShoppingCartModel: boolean;
  hasWishlistModel: boolean;
  hasCartDiscountModel: boolean;

  // Checkout Data Models
  hasCheckoutSessionModel: boolean;
  hasCustomerInfoModel: boolean;
  hasAddressModel: boolean;
  hasShippingMethodModel: boolean;

  // Order Data Models
  hasOrderModel: boolean;
  hasOrderItemModel: boolean;
  hasFulfillmentInfoModel: boolean;
  hasTrackingInfoModel: boolean;

  // Marketplace Data Models
  hasVendorModel: boolean;
  hasCommissionModel: boolean;
  hasPayoutModel: boolean;
  hasDisputeModel: boolean;

  // Model Quality Indicators
  hasProperRelationships: boolean;
  hasBusinessConstraints: boolean;
  hasValidationRules: boolean;
}

export interface PaymentTemplateContent {
  hasPurposeSection: boolean;
  hasContextSection: boolean;
  hasImplementationPatterns: boolean;
  hasConfigurationParameters: boolean;
  hasIntegrationPoints: boolean;
  hasImplementationChecklist: boolean;
  hasSuccessMetrics: boolean;
  hasCommonPitfalls: boolean;
  hasRelatedTemplates: boolean;
  hasCodeExamples: boolean;
  hasSecurityConsiderations: boolean;
}

export class CommerceTemplateValidator {
  private commerceModulePath: string;

  constructor(commerceModulePath: string = 'prompts/modules/commerce') {
    this.commerceModulePath = commerceModulePath;
  }

  validatePaymentTemplateCompleteness(): PaymentTemplateStructure {
    const paymentTemplates = [
      'payment-processing.md',
      'payment-security.md', 
      'payment-methods.md',
      'payment-subscriptions.md'
    ];

    const templateExists = (filename: string) => 
      existsSync(join(this.commerceModulePath, filename));

    const hasPaymentProcessingTemplate = templateExists('payment-processing.md');
    const hasPaymentSecurityTemplate = templateExists('payment-security.md');
    const hasPaymentMethodsTemplate = templateExists('payment-methods.md');
    const hasPaymentSubscriptionsTemplate = templateExists('payment-subscriptions.md');

    // Validate content quality for existing templates
    let allTemplatesHaveRequiredSections = true;
    let templatesHaveImplementationPatterns = true;
    let templatesHaveConfigurationExamples = true;
    let templatesHaveIntegrationPoints = true;
    let templatesHaveSecurityConsiderations = true;

    for (const template of paymentTemplates) {
      const templatePath = join(this.commerceModulePath, template);
      if (existsSync(templatePath)) {
        const content = this.validateTemplateContent(templatePath);
        
        if (!content.hasPurposeSection || !content.hasContextSection || 
            !content.hasImplementationChecklist || !content.hasSuccessMetrics) {
          allTemplatesHaveRequiredSections = false;
        }
        
        if (!content.hasImplementationPatterns || !content.hasCodeExamples) {
          templatesHaveImplementationPatterns = false;
        }
        
        if (!content.hasConfigurationParameters) {
          templatesHaveConfigurationExamples = false;
        }
        
        if (!content.hasIntegrationPoints) {
          templatesHaveIntegrationPoints = false;
        }
        
        if (!content.hasSecurityConsiderations) {
          templatesHaveSecurityConsiderations = false;
        }
      }
    }

    return {
      hasPaymentProcessingTemplate,
      hasPaymentSecurityTemplate,
      hasPaymentMethodsTemplate,
      hasPaymentSubscriptionsTemplate,
      allTemplatesHaveRequiredSections,
      templatesHaveImplementationPatterns,
      templatesHaveConfigurationExamples,
      templatesHaveIntegrationPoints,
      templatesHaveSecurityConsiderations
    };
  }

  validateProductTemplateCompleteness(): ProductTemplateStructure {
    const productTemplates = [
      'product-catalog.md',
      'inventory-management.md',
      'product-search.md',
      'product-reviews.md'
    ];

    const templateExists = (filename: string) => 
      existsSync(join(this.commerceModulePath, filename));

    const hasProductCatalogTemplate = templateExists('product-catalog.md');
    const hasInventoryManagementTemplate = templateExists('inventory-management.md');
    const hasProductSearchTemplate = templateExists('product-search.md');
    const hasProductReviewsTemplate = templateExists('product-reviews.md');

    // Validate content quality for existing templates
    let allTemplatesHaveRequiredSections = true;
    let templatesHaveImplementationPatterns = true;
    let templatesHaveConfigurationExamples = true;
    let templatesHaveIntegrationPoints = true;
    let templatesHaveDataModels = true;

    for (const template of productTemplates) {
      const templatePath = join(this.commerceModulePath, template);
      if (existsSync(templatePath)) {
        const content = this.validateTemplateContent(templatePath);
        
        if (!content.hasPurposeSection || !content.hasContextSection || 
            !content.hasImplementationChecklist || !content.hasSuccessMetrics) {
          allTemplatesHaveRequiredSections = false;
        }
        
        if (!content.hasImplementationPatterns || !content.hasCodeExamples) {
          templatesHaveImplementationPatterns = false;
        }
        
        if (!content.hasConfigurationParameters) {
          templatesHaveConfigurationExamples = false;
        }
        
        if (!content.hasIntegrationPoints) {
          templatesHaveIntegrationPoints = false;
        }
        
        // Check for data models (interfaces, classes, enums)
        if (!this.hasDataModels(templatePath)) {
          templatesHaveDataModels = false;
        }
      }
    }

    return {
      hasProductCatalogTemplate,
      hasInventoryManagementTemplate,
      hasProductSearchTemplate,
      hasProductReviewsTemplate,
      allTemplatesHaveRequiredSections,
      templatesHaveImplementationPatterns,
      templatesHaveConfigurationExamples,
      templatesHaveIntegrationPoints,
      templatesHaveDataModels
    };
  }

  validateTemplateContent(templatePath: string): PaymentTemplateContent {
    if (!existsSync(templatePath)) {
      return this.getEmptyTemplateContent();
    }

    const content = readFileSync(templatePath, 'utf-8');
    
    return {
      hasPurposeSection: this.hasSection(content, 'Purpose'),
      hasContextSection: this.hasSection(content, 'Context'),
      hasImplementationPatterns: this.hasSection(content, 'Implementation Patterns') || 
                                 this.hasSection(content, 'Core.*Patterns') ||
                                 this.hasSection(content, 'Security Patterns'),
      hasConfigurationParameters: this.hasSection(content, 'Configuration Parameters'),
      hasIntegrationPoints: this.hasSection(content, 'Integration Points'),
      hasImplementationChecklist: this.hasSection(content, 'Implementation Checklist'),
      hasSuccessMetrics: this.hasSection(content, 'Success Metrics'),
      hasCommonPitfalls: this.hasSection(content, 'Common.*Pitfalls'),
      hasRelatedTemplates: this.hasSection(content, 'Related Templates'),
      hasCodeExamples: this.hasCodeExamples(content),
      hasSecurityConsiderations: this.hasSecurityConsiderations(content)
    };
  }

  private hasSection(content: string, sectionName: string): boolean {
    // Use regex to match section headers with the given name
    const sectionRegex = new RegExp(`##\\s*${sectionName}`, 'i');
    return sectionRegex.test(content);
  }

  private hasCodeExamples(content: string): boolean {
    // Check for code blocks (```), interface definitions, or class definitions
    const codeBlockRegex = /```[\s\S]*?```/;
    const interfaceRegex = /interface\s+\w+/;
    const classRegex = /class\s+\w+/;
    const functionRegex = /function\s+\w+|async\s+function\s+\w+/;
    
    return codeBlockRegex.test(content) || 
           interfaceRegex.test(content) || 
           classRegex.test(content) ||
           functionRegex.test(content);
  }

  private hasSecurityConsiderations(content: string): boolean {
    // Check for security-related content
    const securityKeywords = [
      'security', 'encryption', 'authentication', 'authorization',
      'PCI', 'compliance', 'fraud', 'SSL', 'TLS', 'HTTPS',
      'token', 'secure', 'vulnerability', 'threat'
    ];
    
    const contentLower = content.toLowerCase();
    return securityKeywords.some(keyword => contentLower.includes(keyword));
  }

  private hasDataModels(templatePath: string): boolean {
    if (!existsSync(templatePath)) {
      return false;
    }

    const content = readFileSync(templatePath, 'utf-8');
    
    // Check for TypeScript interfaces, classes, enums, or types
    const dataModelPatterns = [
      /interface\s+\w+/g,
      /class\s+\w+/g,
      /enum\s+\w+/g,
      /type\s+\w+\s*=/g
    ];
    
    return dataModelPatterns.some(pattern => pattern.test(content));
  }

  private getEmptyTemplateContent(): PaymentTemplateContent {
    return {
      hasPurposeSection: false,
      hasContextSection: false,
      hasImplementationPatterns: false,
      hasConfigurationParameters: false,
      hasIntegrationPoints: false,
      hasImplementationChecklist: false,
      hasSuccessMetrics: false,
      hasCommonPitfalls: false,
      hasRelatedTemplates: false,
      hasCodeExamples: false,
      hasSecurityConsiderations: false
    };
  }

  // Validate requirements 1.1, 1.7, 1.8 specifically for product management
  validateProductRequirements(): {
    requirement_1_1: boolean; // Product catalog and management
    requirement_1_7: boolean; // Inventory management and tracking
    requirement_1_8: boolean; // Review systems and customer feedback
  } {
    const structure = this.validateProductTemplateCompleteness();
    
    // Requirement 1.1: Product catalog and management
    const requirement_1_1 = structure.hasProductCatalogTemplate && 
                            structure.hasProductSearchTemplate;
    
    // Requirement 1.7: Inventory management and tracking
    const requirement_1_7 = structure.hasInventoryManagementTemplate;
    
    // Requirement 1.8: Review systems and customer feedback
    const requirement_1_8 = structure.hasProductReviewsTemplate;
    
    return {
      requirement_1_1,
      requirement_1_7,
      requirement_1_8
    };
  }

  // Validate requirements 1.3 and 1.9 specifically
  validatePaymentRequirements(): {
    requirement_1_3: boolean; // Payment processing with major providers
    requirement_1_9: boolean; // Loyalty programs and gamification features
  } {
    const structure = this.validatePaymentTemplateCompleteness();
    
    // Requirement 1.3: Payment processing templates with major providers
    const requirement_1_3 = structure.hasPaymentProcessingTemplate && 
                            structure.hasPaymentSecurityTemplate &&
                            structure.hasPaymentMethodsTemplate;
    
    // Requirement 1.9: Subscription and recurring billing (part of loyalty/retention)
    const requirement_1_9 = structure.hasPaymentSubscriptionsTemplate;
    
    return {
      requirement_1_3,
      requirement_1_9
    };
  }

  // Validate that templates cover all major payment providers
  validatePaymentProviderCoverage(): {
    hasStripeIntegration: boolean;
    hasPayPalIntegration: boolean;
    hasSquareIntegration: boolean;
    hasMultiplePaymentMethods: boolean;
    hasCurrencySupport: boolean;
  } {
    const paymentProcessingPath = join(this.commerceModulePath, 'payment-processing.md');
    const paymentMethodsPath = join(this.commerceModulePath, 'payment-methods.md');
    
    let hasStripeIntegration = false;
    let hasPayPalIntegration = false;
    let hasSquareIntegration = false;
    let hasMultiplePaymentMethods = false;
    let hasCurrencySupport = false;
    
    if (existsSync(paymentProcessingPath)) {
      const content = readFileSync(paymentProcessingPath, 'utf-8').toLowerCase();
      hasStripeIntegration = content.includes('stripe');
      hasPayPalIntegration = content.includes('paypal');
      hasSquareIntegration = content.includes('square');
    }
    
    if (existsSync(paymentMethodsPath)) {
      const content = readFileSync(paymentMethodsPath, 'utf-8').toLowerCase();
      
      // Check for credit card support (enum values or descriptive text)
      const hasCreditCardSupport = content.includes('credit_card') || 
                                   content.includes('credit card') ||
                                   content.includes('debit_card') ||
                                   content.includes('debit card');
      
      // Check for digital wallet support (enum values or descriptive text)
      const hasDigitalWalletSupport = content.includes('digital_wallet') || 
                                      content.includes('digital wallet') ||
                                      content.includes('apple_pay') ||
                                      content.includes('google_pay') ||
                                      content.includes('paypal') ||
                                      content.includes('samsung_pay');
      
      // Check for bank transfer/ACH support (enum values or descriptive text)
      const hasBankTransferSupport = content.includes('bank_transfer') || 
                                     content.includes('bank transfer') ||
                                     content.includes('ach') ||
                                     content.includes('plaid');
      
      hasMultiplePaymentMethods = hasCreditCardSupport && hasDigitalWalletSupport && hasBankTransferSupport;
      hasCurrencySupport = content.includes('currency') && content.includes('exchange');
    }
    
    return {
      hasStripeIntegration,
      hasPayPalIntegration,
      hasSquareIntegration,
      hasMultiplePaymentMethods,
      hasCurrencySupport
    };
  }

  // Shopping Workflow Template Validation Methods
  validateShoppingWorkflowTemplates(validationMethod?: string): ShoppingWorkflowTemplateStructure {
    const shoppingCartExists = this.templateExists('shopping-cart.md');
    const checkoutWorkflowExists = this.templateExists('checkout-workflow.md');
    const orderManagementExists = this.templateExists('order-management.md');
    const marketplaceFeaturesExists = this.templateExists('marketplace-features.md');

    return {
      hasShoppingCartTemplate: shoppingCartExists,
      hasCheckoutWorkflowTemplate: checkoutWorkflowExists,
      hasOrderManagementTemplate: orderManagementExists,
      hasMarketplaceFeaturesTemplate: marketplaceFeaturesExists,
      templateCount: [shoppingCartExists, checkoutWorkflowExists, orderManagementExists, marketplaceFeaturesExists].filter(Boolean).length
    };
  }

  getShoppingWorkflowTemplates(accessPattern?: string): Record<string, any> {
    const templates = {
      cart: {
        content: this.readTemplate('shopping-cart.md'),
        hasTypeScriptInterfaces: false,
        hasImplementationExamples: false,
        hasServiceClasses: false
      },
      checkout: {
        content: this.readTemplate('checkout-workflow.md'),
        hasTypeScriptInterfaces: false,
        hasImplementationExamples: false,
        hasServiceClasses: false
      },
      order: {
        content: this.readTemplate('order-management.md'),
        hasTypeScriptInterfaces: false,
        hasImplementationExamples: false,
        hasServiceClasses: false
      },
      marketplace: {
        content: this.readTemplate('marketplace-features.md'),
        hasTypeScriptInterfaces: false,
        hasImplementationExamples: false,
        hasServiceClasses: false
      }
    };

    // Analyze each template
    (Object.keys(templates) as Array<keyof typeof templates>).forEach(key => {
      const template = templates[key];
      template.hasTypeScriptInterfaces = this.hasTypeScriptInterfaces(template.content);
      template.hasImplementationExamples = this.hasImplementationExamples(template.content);
      template.hasServiceClasses = this.hasServiceClasses(template.content);
    });

    return templates;
  }

  analyzeShoppingWorkflowCoverage(): ShoppingWorkflowCoverage {
    const cartContent = this.readTemplate('shopping-cart.md');
    const checkoutContent = this.readTemplate('checkout-workflow.md');
    const orderContent = this.readTemplate('order-management.md');
    const marketplaceContent = this.readTemplate('marketplace-features.md');

    return {
      // Cart Management Features
      hasCartManagement: this.hasFeature(cartContent, 'CartService'),
      hasWishlistFeatures: this.hasFeature(cartContent, 'WishlistService'),
      hasPersistentCart: this.hasFeature(cartContent, 'persistent'),
      hasCartSynchronization: this.hasFeature(cartContent, 'CartSyncService'),
      hasQuantityUpdates: this.hasFeature(cartContent, 'updateItemQuantity'),
      hasPriceAlerts: this.hasFeature(cartContent, 'priceAlert'),

      // Checkout Features
      hasCheckoutOptimization: this.hasFeature(checkoutContent, 'CheckoutService'),
      hasGuestCheckout: this.hasFeature(checkoutContent, 'GuestCheckoutService'),
      hasExpressCheckout: this.hasFeature(checkoutContent, 'ExpressCheckoutService'),
      hasAddressValidation: this.hasFeature(checkoutContent, 'AddressValidationService'),
      hasAccountCreationOffer: this.hasFeature(checkoutContent, 'offerAccountCreation'),
      hasSavedAddresses: this.hasFeature(checkoutContent, 'savedAddresses'),
      hasSavedPaymentMethods: this.hasFeature(checkoutContent, 'savedPaymentMethods'),
      hasMobileOptimization: this.hasFeature(checkoutContent, 'mobile'),
      hasApplePay: this.hasFeature(checkoutContent, 'ApplePay'),
      hasGooglePay: this.hasFeature(checkoutContent, 'GooglePay'),

      // Order Management Features
      hasOrderManagement: this.hasFeature(orderContent, 'OrderService'),
      hasFulfillmentTracking: this.hasFeature(orderContent, 'FulfillmentService'),
      hasInventoryAllocation: this.hasFeature(orderContent, 'allocateInventory'),
      hasNotificationSystem: this.hasFeature(orderContent, 'NotificationService'),
      hasCarrierIntegration: this.hasFeature(orderContent, 'CarrierAPI'),
      hasRecurringOrders: this.hasFeature(orderContent, 'recurring') || this.hasFeature(orderContent, 'subscription') || this.hasFeature(orderContent, 'repeat'),
      hasSubscriptionManagement: this.hasFeature(orderContent, 'subscription') || this.hasFeature(orderContent, 'recurring') || this.hasFeature(orderContent, 'repeat'),
      hasInternationalShipping: this.hasFeature(checkoutContent, 'international') || this.hasFeature(orderContent, 'international'),
      hasCurrencySupport: this.hasFeature(checkoutContent, 'currency') || this.hasFeature(orderContent, 'currency'),

      // Marketplace Features
      hasMultiVendorSupport: this.hasFeature(marketplaceContent, 'Vendor'),
      hasCommissionTracking: this.hasFeature(marketplaceContent, 'Commission'),
      hasVendorOnboarding: this.hasFeature(marketplaceContent, 'VendorOnboardingService'),
      hasPayoutProcessing: this.hasFeature(marketplaceContent, 'PayoutProcessingService'),
      hasDisputeResolution: this.hasFeature(marketplaceContent, 'DisputeManagementService')
    };
  }

  analyzeShoppingWorkflowDataModels(): ShoppingWorkflowDataModels {
    const cartContent = this.readTemplate('shopping-cart.md');
    const checkoutContent = this.readTemplate('checkout-workflow.md');
    const orderContent = this.readTemplate('order-management.md');
    const marketplaceContent = this.readTemplate('marketplace-features.md');

    return {
      // Cart Data Models
      hasCartItemModel: this.hasTypeScriptInterface(cartContent, 'CartItem'),
      hasShoppingCartModel: this.hasTypeScriptInterface(cartContent, 'ShoppingCart'),
      hasWishlistModel: this.hasTypeScriptInterface(cartContent, 'Wishlist'),
      hasCartDiscountModel: this.hasTypeScriptInterface(cartContent, 'CartDiscount'),

      // Checkout Data Models
      hasCheckoutSessionModel: this.hasTypeScriptInterface(checkoutContent, 'CheckoutSession'),
      hasCustomerInfoModel: this.hasTypeScriptInterface(checkoutContent, 'CustomerInfo'),
      hasAddressModel: this.hasTypeScriptInterface(checkoutContent, 'Address'),
      hasShippingMethodModel: this.hasTypeScriptInterface(checkoutContent, 'ShippingMethod'),

      // Order Data Models
      hasOrderModel: this.hasTypeScriptInterface(orderContent, 'Order'),
      hasOrderItemModel: this.hasTypeScriptInterface(orderContent, 'OrderItem'),
      hasFulfillmentInfoModel: this.hasTypeScriptInterface(orderContent, 'FulfillmentInfo'),
      hasTrackingInfoModel: this.hasTypeScriptInterface(orderContent, 'TrackingInfo'),

      // Marketplace Data Models
      hasVendorModel: this.hasTypeScriptInterface(marketplaceContent, 'Vendor'),
      hasCommissionModel: this.hasTypeScriptInterface(marketplaceContent, 'Commission'),
      hasPayoutModel: this.hasTypeScriptInterface(marketplaceContent, 'VendorPayout'),
      hasDisputeModel: this.hasTypeScriptInterface(marketplaceContent, 'Dispute'),

      // Model Quality Indicators
      hasProperRelationships: this.hasProperModelRelationships([cartContent, checkoutContent, orderContent, marketplaceContent]),
      hasBusinessConstraints: this.hasBusinessConstraints([cartContent, checkoutContent, orderContent, marketplaceContent]),
      hasValidationRules: this.hasValidationRules([cartContent, checkoutContent, orderContent, marketplaceContent])
    };
  }

  // Helper methods for shopping workflow validation
  private templateExists(filename: string): boolean {
    return existsSync(join(this.commerceModulePath, filename));
  }

  private readTemplate(filename: string): string {
    const templatePath = join(this.commerceModulePath, filename);
    if (!existsSync(templatePath)) {
      return '';
    }
    return readFileSync(templatePath, 'utf-8');
  }

  private hasFeature(content: string, feature: string): boolean {
    return content.toLowerCase().includes(feature.toLowerCase());
  }

  private hasTypeScriptInterface(content: string, interfaceName: string): boolean {
    const interfaceRegex = new RegExp(`interface\\s+${interfaceName}`, 'i');
    const typeRegex = new RegExp(`${interfaceName}\\s*[?:]`, 'i');
    const usageRegex = new RegExp(`:\\s*${interfaceName}`, 'i');
    return interfaceRegex.test(content) || typeRegex.test(content) || usageRegex.test(content);
  }

  private hasTypeScriptInterfaces(content: string): boolean {
    const interfaceRegex = /interface\s+\w+/g;
    const matches = content.match(interfaceRegex);
    return matches !== null && matches.length >= 3;
  }

  private hasImplementationExamples(content: string): boolean {
    const classRegex = /class\s+\w+/g;
    const matches = content.match(classRegex);
    return matches !== null && matches.length >= 2;
  }

  private hasServiceClasses(content: string): boolean {
    const serviceRegex = /class\s+\w*Service/g;
    const matches = content.match(serviceRegex);
    return matches !== null && matches.length >= 1;
  }

  private hasProperModelRelationships(contents: string[]): boolean {
    const combinedContent = contents.join(' ');
    return combinedContent.includes('id:') && 
           combinedContent.includes('interface') && 
           combinedContent.includes('string');
  }

  private hasBusinessConstraints(contents: string[]): boolean {
    const combinedContent = contents.join(' ').toLowerCase();
    return combinedContent.includes('required') || 
           combinedContent.includes('validation') ||
           combinedContent.includes('constraint');
  }

  private hasValidationRules(contents: string[]): boolean {
    const combinedContent = contents.join(' ').toLowerCase();
    return combinedContent.includes('validate') || 
           combinedContent.includes('check') ||
           combinedContent.includes('verify');
  }
}