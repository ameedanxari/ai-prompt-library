# Cultural Adaptation Template

## Purpose

This template provides comprehensive patterns for implementing regional customization, cultural sensitivity, and locale-specific compliance. It covers regional content variations, cultural design considerations, legal compliance by region, local payment and address formats, and time zone handling.

## Context

Cultural adaptation goes beyond translation to ensure applications resonate with users from different cultural backgrounds. This template addresses the challenges of adapting content, design, and functionality to meet regional expectations, legal requirements, and cultural norms while maintaining a consistent brand experience.

## Core Components

### Cultural Adaptation Service

## Examples

```typescript
interface CulturalAdaptationService {
  // Regional content
  getRegionalContent(contentId: string, region: string): Promise<RegionalContent>;
  setRegionalVariant(contentId: string, region: string, content: RegionalContent): Promise<void>;
  
  // Cultural preferences
  getCulturalPreferences(region: string): CulturalPreferences;
  applyRegionalDefaults(region: string): void;
  
  // Compliance
  getRegionalCompliance(region: string): ComplianceRequirements;
  validateCompliance(content: Content, region: string): ComplianceResult;
  
  // Formatting
  getAddressFormat(region: string): AddressFormat;
  getPhoneFormat(region: string): PhoneFormat;
  getNameFormat(region: string): NameFormat;
}

interface RegionalContent {
  id: string;
  region: string;
  content: string;
  metadata: ContentMetadata;
  culturalNotes?: string[];
  restrictions?: ContentRestriction[];
}

interface CulturalPreferences {
  region: string;
  colorPreferences: ColorPreferences;
  imagePreferences: ImagePreferences;
  communicationStyle: CommunicationStyle;
  formalityLevel: FormalityLevel;
  dateTimePreferences: DateTimePreferences;
}

interface ComplianceRequirements {
  region: string;
  dataPrivacy: DataPrivacyRequirements;
  contentRestrictions: ContentRestriction[];
  legalDisclosures: LegalDisclosure[];
  ageRestrictions?: AgeRestriction;
  accessibilityRequirements: AccessibilityRequirement[];
}

enum FormalityLevel {
  VERY_FORMAL = 'very_formal',
  FORMAL = 'formal',
  NEUTRAL = 'neutral',
  INFORMAL = 'informal',
  CASUAL = 'casual'
}
```


### Address and Contact Format Service

```typescript
interface AddressFormatService {
  // Address formatting
  formatAddress(address: Address, region: string): string;
  parseAddress(addressString: string, region: string): Address;
  validateAddress(address: Address, region: string): AddressValidationResult;
  
  // Address components
  getAddressFields(region: string): AddressField[];
  getRequiredFields(region: string): string[];
  getPostalCodeFormat(region: string): PostalCodeFormat;
  
  // Phone formatting
  formatPhoneNumber(phone: string, region: string): string;
  parsePhoneNumber(phone: string, region: string): PhoneNumber;
  validatePhoneNumber(phone: string, region: string): boolean;
}

interface Address {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  district?: string;
  prefecture?: string;
  province?: string;
}

interface AddressField {
  name: string;
  label: string;
  required: boolean;
  order: number;
  validation?: RegExp;
  placeholder?: string;
}

interface PostalCodeFormat {
  pattern: RegExp;
  example: string;
  label: string;
}

interface PhoneNumber {
  countryCode: string;
  nationalNumber: string;
  extension?: string;
  type?: 'mobile' | 'landline' | 'toll_free';
}
```

### Time Zone and Calendar Service

```typescript
interface TimeZoneService {
  // Time zone management
  getUserTimeZone(): string;
  setUserTimeZone(timeZone: string): void;
  getTimeZonesForRegion(region: string): TimeZoneInfo[];
  
  // Time conversion
  convertToUserTime(date: Date, sourceTimeZone?: string): Date;
  convertFromUserTime(date: Date, targetTimeZone: string): Date;
  
  // Display
  formatInTimeZone(date: Date, timeZone: string, format: string): string;
  getTimeZoneOffset(timeZone: string, date?: Date): number;
  getTimeZoneAbbreviation(timeZone: string, date?: Date): string;
  
  // Calendar systems
  getCalendarSystem(region: string): CalendarSystem;
  convertCalendar(date: Date, fromCalendar: string, toCalendar: string): Date;
}

interface TimeZoneInfo {
  id: string;
  name: string;
  abbreviation: string;
  offset: number;
  dstOffset?: number;
  hasDST: boolean;
}

enum CalendarSystem {
  GREGORIAN = 'gregorian',
  ISLAMIC = 'islamic',
  HEBREW = 'hebrew',
  CHINESE = 'chinese',
  JAPANESE = 'japanese',
  BUDDHIST = 'buddhist',
  PERSIAN = 'persian'
}
```

### Regional Compliance Service

```typescript
interface RegionalComplianceService {
  // Privacy compliance
  getPrivacyRequirements(region: string): PrivacyRequirements;
  validateDataProcessing(data: UserData, region: string): ComplianceResult;
  getConsentRequirements(region: string): ConsentRequirement[];
  
  // Content compliance
  validateContent(content: Content, region: string): ContentComplianceResult;
  getContentRestrictions(region: string): ContentRestriction[];
  
  // Legal requirements
  getLegalDisclosures(region: string, context: string): LegalDisclosure[];
  getTermsOfService(region: string): TermsOfService;
  getCookiePolicy(region: string): CookiePolicy;
}

interface PrivacyRequirements {
  region: string;
  framework: 'GDPR' | 'CCPA' | 'LGPD' | 'PDPA' | 'POPIA' | 'other';
  dataRetentionPeriod: number;
  rightToErasure: boolean;
  dataPortability: boolean;
  consentRequired: boolean;
  dpoRequired: boolean;
  crossBorderTransferRules: CrossBorderRule[];
}

interface ConsentRequirement {
  type: ConsentType;
  required: boolean;
  defaultState: boolean;
  withdrawable: boolean;
  granularity: 'all_or_nothing' | 'granular';
}

enum ConsentType {
  ESSENTIAL = 'essential',
  FUNCTIONAL = 'functional',
  ANALYTICS = 'analytics',
  MARKETING = 'marketing',
  THIRD_PARTY = 'third_party'
}

interface ContentRestriction {
  type: string;
  description: string;
  severity: 'blocked' | 'warning' | 'age_restricted';
  regions: string[];
}
```

## Implementation Patterns

### Regional Content Manager

```typescript
class RegionalContentManager implements CulturalAdaptationService {
  private contentStore: Map<string, Map<string, RegionalContent>> = new Map();
  private defaultRegion: string;

  constructor(defaultRegion: string = 'US') {
    this.defaultRegion = defaultRegion;
  }

  async getRegionalContent(contentId: string, region: string): Promise<RegionalContent> {
    // Try exact region match
    let content = this.contentStore.get(contentId)?.get(region);
    
    if (!content) {
      // Try parent region (e.g., 'en-GB' -> 'GB' -> 'EU')
      const parentRegion = this.getParentRegion(region);
      if (parentRegion) {
        content = this.contentStore.get(contentId)?.get(parentRegion);
      }
    }
    
    if (!content) {
      // Fall back to default region
      content = this.contentStore.get(contentId)?.get(this.defaultRegion);
    }
    
    if (!content) {
      throw new Error(`Content not found: ${contentId} for region ${region}`);
    }
    
    return content;
  }

  getCulturalPreferences(region: string): CulturalPreferences {
    const preferences = this.getRegionPreferences(region);
    
    return {
      region,
      colorPreferences: this.getColorPreferences(region),
      imagePreferences: this.getImagePreferences(region),
      communicationStyle: preferences.communicationStyle,
      formalityLevel: preferences.formalityLevel,
      dateTimePreferences: this.getDateTimePreferences(region)
    };
  }

  private getColorPreferences(region: string): ColorPreferences {
    // Cultural color associations
    const colorMeanings: Record<string, Record<string, string>> = {
      'CN': { red: 'luck', white: 'mourning', yellow: 'royalty' },
      'JP': { white: 'purity', black: 'formality', red: 'vitality' },
      'IN': { red: 'purity', white: 'mourning', green: 'fertility' },
      'US': { white: 'purity', black: 'elegance', red: 'excitement' }
    };

    return {
      meanings: colorMeanings[region] || colorMeanings['US'],
      avoidColors: this.getColorsToAvoid(region),
      preferredPalette: this.getPreferredPalette(region)
    };
  }

  private getDateTimePreferences(region: string): DateTimePreferences {
    const preferences: Record<string, DateTimePreferences> = {
      'US': {
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        firstDayOfWeek: 0, // Sunday
        workWeekStart: 1, // Monday
        workWeekEnd: 5 // Friday
      },
      'GB': {
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        firstDayOfWeek: 1,
        workWeekStart: 1,
        workWeekEnd: 5
      },
      'SA': {
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '12h',
        firstDayOfWeek: 0, // Sunday
        workWeekStart: 0, // Sunday
        workWeekEnd: 4 // Thursday
      }
    };

    return preferences[region] || preferences['US'];
  }
}
```

### Address Formatter Implementation

```typescript
class InternationalAddressFormatter implements AddressFormatService {
  private formats: Map<string, AddressFormatConfig> = new Map();

  constructor() {
    this.initializeFormats();
  }

  formatAddress(address: Address, region: string): string {
    const format = this.formats.get(region) || this.formats.get('default')!;
    
    return format.template
      .replace('{name}', address.name || '')
      .replace('{line1}', address.addressLine1)
      .replace('{line2}', address.addressLine2 || '')
      .replace('{city}', address.city)
      .replace('{state}', address.state || '')
      .replace('{postal}', address.postalCode || '')
      .replace('{country}', address.country)
      .split('\n')
      .filter(line => line.trim())
      .join('\n');
  }

  getAddressFields(region: string): AddressField[] {
    const format = this.formats.get(region) || this.formats.get('default')!;
    return format.fields;
  }

  private initializeFormats(): void {
    // US format
    this.formats.set('US', {
      template: '{name}\n{line1}\n{line2}\n{city}, {state} {postal}\n{country}',
      fields: [
        { name: 'addressLine1', label: 'Street Address', required: true, order: 1 },
        { name: 'addressLine2', label: 'Apt, Suite, etc.', required: false, order: 2 },
        { name: 'city', label: 'City', required: true, order: 3 },
        { name: 'state', label: 'State', required: true, order: 4 },
        { name: 'postalCode', label: 'ZIP Code', required: true, order: 5, validation: /^\d{5}(-\d{4})?$/ }
      ]
    });

    // UK format
    this.formats.set('GB', {
      template: '{name}\n{line1}\n{line2}\n{city}\n{postal}\n{country}',
      fields: [
        { name: 'addressLine1', label: 'Address Line 1', required: true, order: 1 },
        { name: 'addressLine2', label: 'Address Line 2', required: false, order: 2 },
        { name: 'city', label: 'Town/City', required: true, order: 3 },
        { name: 'postalCode', label: 'Postcode', required: true, order: 4, validation: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i }
      ]
    });

    // Japan format
    this.formats.set('JP', {
      template: '〒{postal}\n{state}{city}{line1}\n{line2}\n{name}',
      fields: [
        { name: 'postalCode', label: '郵便番号', required: true, order: 1, validation: /^\d{3}-?\d{4}$/ },
        { name: 'state', label: '都道府県', required: true, order: 2 },
        { name: 'city', label: '市区町村', required: true, order: 3 },
        { name: 'addressLine1', label: '町名・番地', required: true, order: 4 },
        { name: 'addressLine2', label: '建物名・部屋番号', required: false, order: 5 }
      ]
    });
  }
}
```

### Compliance Validator

```typescript
class RegionalComplianceValidator implements RegionalComplianceService {
  private complianceRules: Map<string, ComplianceRuleSet> = new Map();

  getPrivacyRequirements(region: string): PrivacyRequirements {
    const rules: Record<string, PrivacyRequirements> = {
      'EU': {
        region: 'EU',
        framework: 'GDPR',
        dataRetentionPeriod: 365 * 3, // 3 years default
        rightToErasure: true,
        dataPortability: true,
        consentRequired: true,
        dpoRequired: true,
        crossBorderTransferRules: [
          { type: 'adequacy_decision', allowed: true },
          { type: 'standard_contractual_clauses', allowed: true },
          { type: 'binding_corporate_rules', allowed: true }
        ]
      },
      'US-CA': {
        region: 'US-CA',
        framework: 'CCPA',
        dataRetentionPeriod: 365 * 2,
        rightToErasure: true,
        dataPortability: true,
        consentRequired: false, // Opt-out model
        dpoRequired: false,
        crossBorderTransferRules: []
      },
      'BR': {
        region: 'BR',
        framework: 'LGPD',
        dataRetentionPeriod: 365 * 5,
        rightToErasure: true,
        dataPortability: true,
        consentRequired: true,
        dpoRequired: true,
        crossBorderTransferRules: [
          { type: 'adequacy_decision', allowed: true },
          { type: 'standard_contractual_clauses', allowed: true }
        ]
      }
    };

    return rules[region] || rules['US'];
  }

  validateContent(content: Content, region: string): ContentComplianceResult {
    const restrictions = this.getContentRestrictions(region);
    const violations: ContentViolation[] = [];

    for (const restriction of restrictions) {
      if (this.violatesRestriction(content, restriction)) {
        violations.push({
          restriction,
          severity: restriction.severity,
          message: `Content violates ${restriction.type} restriction for ${region}`
        });
      }
    }

    return {
      compliant: violations.length === 0,
      violations,
      recommendations: this.getRecommendations(violations)
    };
  }
}
```

## Integration Points

### Payment Localization Integration

```typescript
class PaymentLocalizationService {
  getPaymentMethods(region: string): PaymentMethod[] {
    const methods: Record<string, PaymentMethod[]> = {
      'US': [
        { id: 'card', name: 'Credit/Debit Card', popular: true },
        { id: 'paypal', name: 'PayPal', popular: true },
        { id: 'apple_pay', name: 'Apple Pay', popular: true }
      ],
      'DE': [
        { id: 'card', name: 'Kreditkarte', popular: true },
        { id: 'sofort', name: 'Sofort', popular: true },
        { id: 'giropay', name: 'Giropay', popular: true }
      ],
      'NL': [
        { id: 'ideal', name: 'iDEAL', popular: true },
        { id: 'card', name: 'Credit Card', popular: false }
      ],
      'CN': [
        { id: 'alipay', name: '支付宝', popular: true },
        { id: 'wechat_pay', name: '微信支付', popular: true }
      ],
      'JP': [
        { id: 'card', name: 'クレジットカード', popular: true },
        { id: 'konbini', name: 'コンビニ払い', popular: true }
      ]
    };

    return methods[region] || methods['US'];
  }

  formatPrice(amount: number, currency: string, region: string): string {
    return new Intl.NumberFormat(region, {
      style: 'currency',
      currency
    }).format(amount);
  }
}
```

## Security Considerations

### Regional Data Security

```typescript
class RegionalDataSecurityService {
  // Ensure data residency compliance
  async validateDataResidency(data: UserData, region: string): Promise<boolean> {
    const requirements = this.getDataResidencyRequirements(region);
    
    if (requirements.localStorageRequired) {
      const storageLocation = await this.getDataStorageLocation(data.userId);
      return requirements.allowedRegions.includes(storageLocation);
    }
    
    return true;
  }

  // Apply region-specific encryption
  async encryptForRegion(data: string, region: string): Promise<EncryptedData> {
    const requirements = this.getEncryptionRequirements(region);
    
    return this.encryptionService.encrypt(data, {
      algorithm: requirements.algorithm,
      keyLength: requirements.keyLength,
      keyManagement: requirements.keyManagement
    });
  }
}
```

## Testing Considerations

### Cultural Adaptation Tests

```typescript
describe('Cultural Adaptation Tests', () => {
  it('should format addresses correctly for each region', () => {
    const formatter = new InternationalAddressFormatter();
    
    const usAddress = {
      addressLine1: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA'
    };
    
    const formatted = formatter.formatAddress(usAddress, 'US');
    expect(formatted).toContain('New York, NY 10001');
  });

  it('should return correct payment methods for region', () => {
    const service = new PaymentLocalizationService();
    
    const nlMethods = service.getPaymentMethods('NL');
    expect(nlMethods.find(m => m.id === 'ideal')).toBeDefined();
    expect(nlMethods.find(m => m.id === 'ideal')?.popular).toBe(true);
  });

  it('should validate GDPR compliance for EU regions', () => {
    const validator = new RegionalComplianceValidator();
    
    const requirements = validator.getPrivacyRequirements('EU');
    expect(requirements.framework).toBe('GDPR');
    expect(requirements.rightToErasure).toBe(true);
    expect(requirements.consentRequired).toBe(true);
  });
});
```

## Configuration Examples

### Regional Configuration

```typescript
const regionalConfig: RegionalConfig = {
  defaultRegion: 'US',
  supportedRegions: ['US', 'GB', 'DE', 'FR', 'JP', 'CN', 'BR', 'IN'],
  regionSettings: {
    'US': {
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      measurementSystem: 'imperial',
      defaultLanguage: 'en-US'
    },
    'GB': {
      currency: 'GBP',
      dateFormat: 'DD/MM/YYYY',
      measurementSystem: 'metric',
      defaultLanguage: 'en-GB'
    },
    'JP': {
      currency: 'JPY',
      dateFormat: 'YYYY/MM/DD',
      measurementSystem: 'metric',
      defaultLanguage: 'ja',
      calendarSystem: 'japanese'
    }
  },
  compliance: {
    gdprRegions: ['DE', 'FR', 'GB'],
    ccpaRegions: ['US-CA'],
    lgpdRegions: ['BR']
  }
};
```
