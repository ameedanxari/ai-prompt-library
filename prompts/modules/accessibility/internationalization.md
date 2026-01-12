# Internationalization Template

## Purpose

This template provides comprehensive patterns for implementing multi-language support, localization, and internationalization (i18n) features. It covers translation management, locale detection, RTL support, number/date/currency formatting, pluralization rules, and content localization strategies.

## Context

Internationalization is essential for applications serving global audiences. This template addresses the challenges of managing translations at scale, supporting diverse locales and writing systems, handling complex formatting rules, and maintaining consistency across languages while respecting cultural differences.

## Core Components

### Internationalization Service

## Examples

```typescript
interface InternationalizationService {
  // Locale management
  setLocale(locale: string): void;
  getLocale(): string;
  getSupportedLocales(): string[];
  detectUserLocale(): string;
  
  // Translation
  translate(key: string, params?: TranslationParams): string;
  translatePlural(key: string, count: number, params?: TranslationParams): string;
  hasTranslation(key: string, locale?: string): boolean;
  
  // Formatting
  formatNumber(value: number, options?: NumberFormatOptions): string;
  formatCurrency(value: number, currency: string, options?: CurrencyFormatOptions): string;
  formatDate(date: Date, options?: DateFormatOptions): string;
  formatRelativeTime(date: Date, options?: RelativeTimeOptions): string;
  
  // Direction
  getTextDirection(): 'ltr' | 'rtl';
  isRTL(): boolean;
}

interface TranslationParams {
  [key: string]: string | number | Date;
}

interface NumberFormatOptions {
  style?: 'decimal' | 'percent' | 'unit';
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  useGrouping?: boolean;
  notation?: 'standard' | 'scientific' | 'engineering' | 'compact';
}

interface CurrencyFormatOptions extends NumberFormatOptions {
  display?: 'symbol' | 'narrowSymbol' | 'code' | 'name';
}

interface DateFormatOptions {
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
  calendar?: string;
  timeZone?: string;
}
```


### Translation Management Service

```typescript
interface TranslationManagementService {
  // Translation loading
  loadTranslations(locale: string): Promise<TranslationBundle>;
  loadNamespace(locale: string, namespace: string): Promise<TranslationBundle>;
  preloadLocales(locales: string[]): Promise<void>;
  
  // Translation updates
  addTranslation(locale: string, key: string, value: string): void;
  updateTranslation(locale: string, key: string, value: string): void;
  removeTranslation(locale: string, key: string): void;
  
  // Missing translations
  getMissingTranslations(locale: string): string[];
  onMissingTranslation(callback: MissingTranslationCallback): void;
  reportMissingTranslation(key: string, locale: string): void;
  
  // Export/Import
  exportTranslations(locale: string, format: ExportFormat): Promise<string>;
  importTranslations(locale: string, data: string, format: ExportFormat): Promise<void>;
}

interface TranslationBundle {
  locale: string;
  namespace?: string;
  translations: Record<string, string | TranslationEntry>;
  metadata?: TranslationMetadata;
}

interface TranslationEntry {
  value: string;
  context?: string;
  description?: string;
  pluralForms?: Record<string, string>;
}

interface TranslationMetadata {
  version: string;
  lastUpdated: Date;
  translator?: string;
  reviewStatus?: 'draft' | 'reviewed' | 'approved';
}

type MissingTranslationCallback = (key: string, locale: string) => void;
type ExportFormat = 'json' | 'xliff' | 'po' | 'csv';
```

### Locale Service

```typescript
interface LocaleService {
  // Locale information
  getLocaleInfo(locale: string): LocaleInfo;
  getLanguageName(locale: string, displayLocale?: string): string;
  getRegionName(locale: string, displayLocale?: string): string;
  
  // Locale validation
  isValidLocale(locale: string): boolean;
  normalizeLocale(locale: string): string;
  parseLocale(locale: string): ParsedLocale;
  
  // Locale matching
  findBestMatch(requestedLocales: string[], supportedLocales: string[]): string;
  getParentLocale(locale: string): string | null;
  
  // Calendar and numbering
  getCalendarSystem(locale: string): string;
  getNumberingSystem(locale: string): string;
  getFirstDayOfWeek(locale: string): number;
}

interface LocaleInfo {
  locale: string;
  language: string;
  region?: string;
  script?: string;
  direction: 'ltr' | 'rtl';
  calendar: string;
  numberingSystem: string;
  currencyCode?: string;
  timeZone?: string;
}

interface ParsedLocale {
  language: string;
  script?: string;
  region?: string;
  variants?: string[];
  extensions?: Record<string, string>;
}
```

### Pluralization Service

```typescript
interface PluralizationService {
  // Plural rules
  getPluralForm(count: number, locale: string): PluralCategory;
  getPluralRules(locale: string): PluralRules;
  
  // Plural formatting
  formatPlural(count: number, forms: PluralForms, locale: string): string;
  selectPluralForm(count: number, forms: PluralForms, locale: string): string;
  
  // Ordinal
  getOrdinalForm(count: number, locale: string): PluralCategory;
  formatOrdinal(count: number, locale: string): string;
}

type PluralCategory = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

interface PluralForms {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
}

interface PluralRules {
  locale: string;
  categories: PluralCategory[];
  select: (count: number) => PluralCategory;
}
```

## Implementation Patterns

### i18n Provider Implementation

```typescript
class I18nProvider implements InternationalizationService {
  private locale: string;
  private translations: Map<string, TranslationBundle> = new Map();
  private fallbackLocale: string;
  private pluralizationService: PluralizationService;

  constructor(config: I18nConfig) {
    this.locale = config.defaultLocale;
    this.fallbackLocale = config.fallbackLocale || 'en';
    this.pluralizationService = new IntlPluralizationService();
  }

  setLocale(locale: string): void {
    if (!this.isValidLocale(locale)) {
      throw new Error(`Invalid locale: ${locale}`);
    }
    this.locale = locale;
    document.documentElement.lang = locale;
    document.documentElement.dir = this.getTextDirection();
  }

  translate(key: string, params?: TranslationParams): string {
    const translation = this.findTranslation(key, this.locale) ||
                       this.findTranslation(key, this.fallbackLocale) ||
                       key;

    return this.interpolate(translation, params);
  }

  translatePlural(key: string, count: number, params?: TranslationParams): string {
    const pluralKey = `${key}_plural`;
    const singularKey = `${key}_singular`;
    
    const pluralForm = this.pluralizationService.getPluralForm(count, this.locale);
    const translationKey = `${key}_${pluralForm}`;
    
    let translation = this.findTranslation(translationKey, this.locale);
    
    if (!translation) {
      // Fallback to simple singular/plural
      translation = count === 1 
        ? this.findTranslation(singularKey, this.locale)
        : this.findTranslation(pluralKey, this.locale);
    }

    return this.interpolate(translation || key, { ...params, count });
  }

  formatNumber(value: number, options?: NumberFormatOptions): string {
    return new Intl.NumberFormat(this.locale, options).format(value);
  }

  formatCurrency(value: number, currency: string, options?: CurrencyFormatOptions): string {
    return new Intl.NumberFormat(this.locale, {
      style: 'currency',
      currency,
      ...options
    }).format(value);
  }

  formatDate(date: Date, options?: DateFormatOptions): string {
    return new Intl.DateTimeFormat(this.locale, options).format(date);
  }

  formatRelativeTime(date: Date, options?: RelativeTimeOptions): string {
    const rtf = new Intl.RelativeTimeFormat(this.locale, {
      numeric: options?.numeric || 'auto',
      style: options?.style || 'long'
    });

    const diff = date.getTime() - Date.now();
    const absDiff = Math.abs(diff);

    if (absDiff < 60000) {
      return rtf.format(Math.round(diff / 1000), 'second');
    } else if (absDiff < 3600000) {
      return rtf.format(Math.round(diff / 60000), 'minute');
    } else if (absDiff < 86400000) {
      return rtf.format(Math.round(diff / 3600000), 'hour');
    } else {
      return rtf.format(Math.round(diff / 86400000), 'day');
    }
  }

  getTextDirection(): 'ltr' | 'rtl' {
    const rtlLocales = ['ar', 'he', 'fa', 'ur', 'yi', 'ps', 'sd'];
    const language = this.locale.split('-')[0];
    return rtlLocales.includes(language) ? 'rtl' : 'ltr';
  }

  private findTranslation(key: string, locale: string): string | null {
    const bundle = this.translations.get(locale);
    if (!bundle) return null;

    const keys = key.split('.');
    let value: any = bundle.translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return null;
      }
    }

    return typeof value === 'string' ? value : null;
  }

  private interpolate(template: string, params?: TranslationParams): string {
    if (!params) return template;

    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = params[key];
      if (value === undefined) return match;
      
      if (value instanceof Date) {
        return this.formatDate(value);
      }
      if (typeof value === 'number') {
        return this.formatNumber(value);
      }
      return String(value);
    });
  }
}
```

### RTL Support Implementation

```typescript
class RTLSupportService {
  private isRTL: boolean = false;

  setDirection(direction: 'ltr' | 'rtl'): void {
    this.isRTL = direction === 'rtl';
    document.documentElement.dir = direction;
    this.applyRTLStyles();
  }

  private applyRTLStyles(): void {
    const root = document.documentElement;
    
    if (this.isRTL) {
      root.classList.add('rtl');
      root.classList.remove('ltr');
    } else {
      root.classList.add('ltr');
      root.classList.remove('rtl');
    }
  }

  // Flip directional values for RTL
  flipValue(value: string): string {
    const flips: Record<string, string> = {
      'left': 'right',
      'right': 'left',
      'start': 'end',
      'end': 'start',
      'flex-start': 'flex-end',
      'flex-end': 'flex-start'
    };
    return flips[value] || value;
  }

  // Generate RTL-aware CSS
  generateLogicalCSS(property: string, value: string): Record<string, string> {
    const logicalProperties: Record<string, string> = {
      'margin-left': 'margin-inline-start',
      'margin-right': 'margin-inline-end',
      'padding-left': 'padding-inline-start',
      'padding-right': 'padding-inline-end',
      'border-left': 'border-inline-start',
      'border-right': 'border-inline-end',
      'left': 'inset-inline-start',
      'right': 'inset-inline-end',
      'text-align: left': 'text-align: start',
      'text-align: right': 'text-align: end'
    };

    const logicalProp = logicalProperties[property];
    if (logicalProp) {
      return { [logicalProp]: value };
    }
    return { [property]: value };
  }
}
```

### Translation Loading Strategy

```typescript
class LazyTranslationLoader {
  private loadedNamespaces: Map<string, Set<string>> = new Map();
  private loadingPromises: Map<string, Promise<TranslationBundle>> = new Map();

  async loadNamespace(locale: string, namespace: string): Promise<TranslationBundle> {
    const key = `${locale}:${namespace}`;
    
    // Check if already loaded
    if (this.isLoaded(locale, namespace)) {
      return this.getFromCache(locale, namespace);
    }

    // Check if currently loading
    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key)!;
    }

    // Start loading
    const loadPromise = this.fetchTranslations(locale, namespace);
    this.loadingPromises.set(key, loadPromise);

    try {
      const bundle = await loadPromise;
      this.markAsLoaded(locale, namespace);
      return bundle;
    } finally {
      this.loadingPromises.delete(key);
    }
  }

  private async fetchTranslations(locale: string, namespace: string): Promise<TranslationBundle> {
    const url = `/locales/${locale}/${namespace}.json`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to load translations: ${url}`);
    }

    return response.json();
  }

  private isLoaded(locale: string, namespace: string): boolean {
    return this.loadedNamespaces.get(locale)?.has(namespace) || false;
  }

  private markAsLoaded(locale: string, namespace: string): void {
    if (!this.loadedNamespaces.has(locale)) {
      this.loadedNamespaces.set(locale, new Set());
    }
    this.loadedNamespaces.get(locale)!.add(namespace);
  }
}
```

## Integration Points

### React i18n Integration

```typescript
// React context and hooks for i18n
const I18nContext = createContext<InternationalizationService | null>(null);

export const I18nProvider: React.FC<I18nProviderProps> = ({ children, config }) => {
  const [i18n] = useState(() => new I18nProvider(config));
  const [locale, setLocale] = useState(config.defaultLocale);

  const changeLocale = useCallback(async (newLocale: string) => {
    await i18n.loadTranslations(newLocale);
    i18n.setLocale(newLocale);
    setLocale(newLocale);
  }, [i18n]);

  return (
    <I18nContext.Provider value={{ ...i18n, changeLocale }}>
      {children}
    </I18nContext.Provider>
  );
};

export function useTranslation(namespace?: string) {
  const i18n = useContext(I18nContext);
  if (!i18n) throw new Error('useTranslation must be used within I18nProvider');

  const t = useCallback((key: string, params?: TranslationParams) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    return i18n.translate(fullKey, params);
  }, [i18n, namespace]);

  return { t, i18n };
}

// Usage
const MyComponent: React.FC = () => {
  const { t } = useTranslation('common');
  
  return (
    <div>
      <h1>{t('welcome', { name: 'User' })}</h1>
      <p>{t('items_count', { count: 5 })}</p>
    </div>
  );
};
```

### Translation Management Platform Integration

```typescript
class TranslationPlatformIntegration {
  private apiKey: string;
  private projectId: string;
  private baseUrl: string;

  async syncTranslations(locale: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/projects/${this.projectId}/translations/${locale}`,
      {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      }
    );

    const translations = await response.json();
    await this.translationService.importTranslations(locale, translations, 'json');
  }

  async pushMissingKeys(keys: string[]): Promise<void> {
    await fetch(
      `${this.baseUrl}/projects/${this.projectId}/keys`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ keys })
      }
    );
  }

  async requestTranslation(locale: string, keys: string[]): Promise<void> {
    await fetch(
      `${this.baseUrl}/projects/${this.projectId}/translation-requests`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ locale, keys })
      }
    );
  }
}
```

## Security Considerations

### Secure Translation Handling

```typescript
class SecureTranslationService {
  private sanitizer: HTMLSanitizer;

  // Sanitize translations to prevent XSS
  sanitizeTranslation(translation: string): string {
    return this.sanitizer.sanitize(translation);
  }

  // Validate interpolation parameters
  validateParams(params: TranslationParams): TranslationParams {
    const sanitized: TranslationParams = {};
    
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string') {
        sanitized[key] = this.escapeHtml(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  private escapeHtml(str: string): string {
    const escapeMap: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return str.replace(/[&<>"']/g, char => escapeMap[char]);
  }
}
```

## Testing Considerations

### i18n Testing

```typescript
describe('Internationalization Tests', () => {
  let i18n: InternationalizationService;

  beforeEach(() => {
    i18n = new I18nProvider({
      defaultLocale: 'en',
      fallbackLocale: 'en'
    });
  });

  it('should translate keys correctly', () => {
    i18n.addTranslation('en', 'greeting', 'Hello, {{name}}!');
    
    const result = i18n.translate('greeting', { name: 'World' });
    expect(result).toBe('Hello, World!');
  });

  it('should handle pluralization', () => {
    i18n.addTranslation('en', 'items_one', '{{count}} item');
    i18n.addTranslation('en', 'items_other', '{{count}} items');
    
    expect(i18n.translatePlural('items', 1)).toBe('1 item');
    expect(i18n.translatePlural('items', 5)).toBe('5 items');
  });

  it('should format numbers according to locale', () => {
    i18n.setLocale('de-DE');
    expect(i18n.formatNumber(1234.56)).toBe('1.234,56');
    
    i18n.setLocale('en-US');
    expect(i18n.formatNumber(1234.56)).toBe('1,234.56');
  });

  it('should detect RTL languages', () => {
    i18n.setLocale('ar');
    expect(i18n.isRTL()).toBe(true);
    
    i18n.setLocale('en');
    expect(i18n.isRTL()).toBe(false);
  });
});
```

## Configuration Examples

### i18n Configuration

```typescript
const i18nConfig: I18nConfig = {
  defaultLocale: 'en-US',
  fallbackLocale: 'en',
  supportedLocales: ['en-US', 'en-GB', 'es', 'fr', 'de', 'ja', 'zh-CN', 'ar'],
  namespaces: ['common', 'errors', 'forms', 'navigation'],
  defaultNamespace: 'common',
  detection: {
    order: ['querystring', 'cookie', 'localStorage', 'navigator'],
    caches: ['cookie', 'localStorage'],
    cookieName: 'i18n_locale'
  },
  interpolation: {
    escapeValue: true,
    prefix: '{{',
    suffix: '}}'
  },
  pluralization: {
    defaultRule: 'en'
  },
  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
    addPath: '/locales/add/{{lng}}/{{ns}}'
  }
};
```
