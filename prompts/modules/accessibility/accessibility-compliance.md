# Accessibility Compliance Template

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

This template provides comprehensive patterns for implementing WCAG (Web Content Accessibility Guidelines) compliance, screen reader support, keyboard navigation, and inclusive design practices. It covers accessibility testing, ARIA implementation, focus management, and assistive technology compatibility.

## Context

Accessibility is essential for creating inclusive applications that can be used by people with diverse abilities. This template addresses the challenges of implementing WCAG 2.1 AA/AAA compliance, supporting assistive technologies, ensuring keyboard accessibility, and maintaining accessibility throughout the development lifecycle.

## Core Components

### Accessibility Service

## Examples

```typescript
interface AccessibilityService {
  // ARIA management
  setAriaAttribute(element: Element, attribute: string, value: string): void;
  removeAriaAttribute(element: Element, attribute: string): void;
  getAriaAttributes(element: Element): Record<string, string>;
  
  // Focus management
  setFocus(element: Element): void;
  trapFocus(container: Element): FocusTrap;
  restoreFocus(): void;
  getFocusableElements(container: Element): Element[];
  
  // Announcements
  announce(message: string, priority?: AnnouncePriority): void;
  announcePolite(message: string): void;
  announceAssertive(message: string): void;
  
  // Validation
  validateAccessibility(element: Element): AccessibilityReport;
  checkColorContrast(foreground: string, background: string): ContrastResult;
}

interface FocusTrap {
  activate(): void;
  deactivate(): void;
  pause(): void;
  unpause(): void;
}

enum AnnouncePriority {
  POLITE = 'polite',
  ASSERTIVE = 'assertive'
}

interface AccessibilityReport {
  valid: boolean;
  violations: AccessibilityViolation[];
  warnings: AccessibilityWarning[];
  passes: AccessibilityPass[];
}

interface AccessibilityViolation {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
  help: string;
  helpUrl: string;
  nodes: ViolationNode[];
  wcagCriteria: string[];
}

interface ContrastResult {
  ratio: number;
  aa: { normal: boolean; large: boolean };
  aaa: { normal: boolean; large: boolean };
}
```


### Keyboard Navigation Service

```typescript
interface KeyboardNavigationService {
  // Navigation patterns
  enableArrowNavigation(container: Element, options?: ArrowNavOptions): void;
  enableTabNavigation(container: Element): void;
  enableRovingTabIndex(container: Element): void;
  
  // Keyboard shortcuts
  registerShortcut(shortcut: KeyboardShortcut): void;
  unregisterShortcut(id: string): void;
  getRegisteredShortcuts(): KeyboardShortcut[];
  
  // Skip links
  createSkipLink(target: string, label: string): Element;
  registerLandmark(element: Element, role: LandmarkRole): void;
}

interface ArrowNavOptions {
  orientation: 'horizontal' | 'vertical' | 'both';
  wrap: boolean;
  homeEnd: boolean;
  typeahead: boolean;
}

interface KeyboardShortcut {
  id: string;
  keys: string[];
  description: string;
  action: () => void;
  scope?: string;
  preventDefault?: boolean;
}

enum LandmarkRole {
  BANNER = 'banner',
  NAVIGATION = 'navigation',
  MAIN = 'main',
  COMPLEMENTARY = 'complementary',
  CONTENTINFO = 'contentinfo',
  SEARCH = 'search',
  FORM = 'form',
  REGION = 'region'
}
```

### Screen Reader Service

```typescript
interface ScreenReaderService {
  // Live regions
  createLiveRegion(options: LiveRegionOptions): LiveRegion;
  updateLiveRegion(regionId: string, content: string): void;
  removeLiveRegion(regionId: string): void;
  
  // Descriptions
  setDescription(element: Element, description: string): void;
  setLabel(element: Element, label: string): void;
  setLabelledBy(element: Element, labelId: string): void;
  setDescribedBy(element: Element, descriptionId: string): void;
  
  // State announcements
  announceStateChange(element: Element, state: string): void;
  announceExpanded(element: Element, expanded: boolean): void;
  announceSelected(element: Element, selected: boolean): void;
  announceChecked(element: Element, checked: boolean | 'mixed'): void;
}

interface LiveRegionOptions {
  id: string;
  ariaLive: 'polite' | 'assertive' | 'off';
  ariaAtomic?: boolean;
  ariaRelevant?: ('additions' | 'removals' | 'text' | 'all')[];
  role?: 'status' | 'alert' | 'log' | 'timer';
}

interface LiveRegion {
  id: string;
  element: Element;
  announce(message: string): void;
  clear(): void;
  destroy(): void;
}
```

### Color and Visual Accessibility Service

```typescript
interface VisualAccessibilityService {
  // Color contrast
  calculateContrastRatio(color1: string, color2: string): number;
  suggestAccessibleColor(background: string, minContrast: number): string;
  validateColorPalette(palette: ColorPalette): ColorValidationResult;
  
  // Visual preferences
  detectReducedMotion(): boolean;
  detectHighContrast(): boolean;
  detectColorScheme(): 'light' | 'dark';
  
  // Text sizing
  getPreferredFontSize(): number;
  supportsDynamicType(): boolean;
  
  // Focus indicators
  createFocusIndicator(options: FocusIndicatorOptions): void;
  validateFocusVisibility(element: Element): boolean;
}

interface ColorPalette {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  error: string;
  warning: string;
  success: string;
}

interface ColorValidationResult {
  valid: boolean;
  issues: ColorIssue[];
  suggestions: ColorSuggestion[];
}

interface FocusIndicatorOptions {
  color: string;
  width: number;
  offset: number;
  style: 'solid' | 'dashed' | 'dotted';
}
```

## Implementation Patterns

### Accessible Modal Dialog

```typescript
class AccessibleModal {
  private modal: HTMLElement;
  private focusTrap: FocusTrap;
  private previousFocus: Element | null = null;
  private accessibilityService: AccessibilityService;

  constructor(modal: HTMLElement, accessibilityService: AccessibilityService) {
    this.modal = modal;
    this.accessibilityService = accessibilityService;
    this.setupAccessibility();
  }

  private setupAccessibility(): void {
    // Set ARIA attributes
    this.modal.setAttribute('role', 'dialog');
    this.modal.setAttribute('aria-modal', 'true');
    
    // Find and set aria-labelledby
    const title = this.modal.querySelector('[data-modal-title]');
    if (title) {
      const titleId = title.id || `modal-title-${Date.now()}`;
      title.id = titleId;
      this.modal.setAttribute('aria-labelledby', titleId);
    }

    // Find and set aria-describedby
    const description = this.modal.querySelector('[data-modal-description]');
    if (description) {
      const descId = description.id || `modal-desc-${Date.now()}`;
      description.id = descId;
      this.modal.setAttribute('aria-describedby', descId);
    }

    // Setup focus trap
    this.focusTrap = this.accessibilityService.trapFocus(this.modal);

    // Handle escape key
    this.modal.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  open(): void {
    // Store current focus
    this.previousFocus = document.activeElement;

    // Show modal
    this.modal.hidden = false;
    this.modal.setAttribute('aria-hidden', 'false');

    // Activate focus trap
    this.focusTrap.activate();

    // Focus first focusable element or close button
    const firstFocusable = this.modal.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();

    // Announce to screen readers
    this.accessibilityService.announce('Dialog opened', AnnouncePriority.ASSERTIVE);
  }

  close(): void {
    // Deactivate focus trap
    this.focusTrap.deactivate();

    // Hide modal
    this.modal.hidden = true;
    this.modal.setAttribute('aria-hidden', 'true');

    // Restore focus
    if (this.previousFocus instanceof HTMLElement) {
      this.previousFocus.focus();
    }

    // Announce to screen readers
    this.accessibilityService.announce('Dialog closed', AnnouncePriority.POLITE);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close();
    }
  }
}
```

### Accessible Form Validation

```typescript
class AccessibleFormValidator {
  private form: HTMLFormElement;
  private errorSummary: HTMLElement;
  private screenReaderService: ScreenReaderService;

  constructor(form: HTMLFormElement, screenReaderService: ScreenReaderService) {
    this.form = form;
    this.screenReaderService = screenReaderService;
    this.createErrorSummary();
    this.setupValidation();
  }

  private createErrorSummary(): void {
    this.errorSummary = document.createElement('div');
    this.errorSummary.id = 'error-summary';
    this.errorSummary.setAttribute('role', 'alert');
    this.errorSummary.setAttribute('aria-live', 'assertive');
    this.errorSummary.hidden = true;
    this.form.insertBefore(this.errorSummary, this.form.firstChild);
  }

  private setupValidation(): void {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Real-time validation on blur
    const inputs = this.form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input as HTMLInputElement));
    });
  }

  private validateField(field: HTMLInputElement): ValidationResult {
    const result = this.runValidation(field);
    
    // Update field state
    field.setAttribute('aria-invalid', (!result.valid).toString());
    
    // Update error message
    const errorId = `${field.id}-error`;
    let errorElement = document.getElementById(errorId);
    
    if (!result.valid) {
      if (!errorElement) {
        errorElement = document.createElement('span');
        errorElement.id = errorId;
        errorElement.className = 'field-error';
        field.parentNode?.appendChild(errorElement);
      }
      errorElement.textContent = result.message;
      field.setAttribute('aria-describedby', errorId);
      
      // Announce error
      this.screenReaderService.announceStateChange(field, `Error: ${result.message}`);
    } else {
      errorElement?.remove();
      field.removeAttribute('aria-describedby');
    }

    return result;
  }

  private handleSubmit(event: Event): void {
    const errors: FieldError[] = [];
    const inputs = this.form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      const result = this.validateField(input as HTMLInputElement);
      if (!result.valid) {
        errors.push({ field: input as HTMLInputElement, message: result.message });
      }
    });

    if (errors.length > 0) {
      event.preventDefault();
      this.showErrorSummary(errors);
      errors[0].field.focus();
    }
  }

  private showErrorSummary(errors: FieldError[]): void {
    this.errorSummary.innerHTML = `
      <h2>There are ${errors.length} errors in this form</h2>
      <ul>
        ${errors.map(e => `
          <li>
            <a href="#${e.field.id}">${e.field.labels?.[0]?.textContent || e.field.name}: ${e.message}</a>
          </li>
        `).join('')}
      </ul>
    `;
    this.errorSummary.hidden = false;
  }
}
```

### Roving Tab Index Pattern

```typescript
class RovingTabIndex {
  private container: HTMLElement;
  private items: HTMLElement[];
  private currentIndex: number = 0;
  private orientation: 'horizontal' | 'vertical';

  constructor(container: HTMLElement, orientation: 'horizontal' | 'vertical' = 'horizontal') {
    this.container = container;
    this.orientation = orientation;
    this.items = Array.from(container.querySelectorAll('[role="tab"], [role="menuitem"], [role="option"]'));
    this.initialize();
  }

  private initialize(): void {
    // Set initial tabindex
    this.items.forEach((item, index) => {
      item.setAttribute('tabindex', index === 0 ? '0' : '-1');
    });

    // Add keyboard navigation
    this.container.addEventListener('keydown', this.handleKeyDown.bind(this));
    
    // Handle focus
    this.items.forEach((item, index) => {
      item.addEventListener('focus', () => this.setCurrentIndex(index));
    });
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const { key } = event;
    let newIndex = this.currentIndex;

    const prevKey = this.orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
    const nextKey = this.orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';

    switch (key) {
      case prevKey:
        newIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.items.length - 1;
        break;
      case nextKey:
        newIndex = this.currentIndex < this.items.length - 1 ? this.currentIndex + 1 : 0;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = this.items.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    this.focusItem(newIndex);
  }

  private focusItem(index: number): void {
    // Update tabindex
    this.items[this.currentIndex].setAttribute('tabindex', '-1');
    this.items[index].setAttribute('tabindex', '0');
    
    // Focus new item
    this.items[index].focus();
    this.currentIndex = index;
  }

  private setCurrentIndex(index: number): void {
    this.currentIndex = index;
  }
}
```

## Integration Points

### Axe-Core Integration

```typescript
class AxeAccessibilityTester {
  async runAudit(context?: Element | string): Promise<AccessibilityReport> {
    const results = await axe.run(context || document, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']
      }
    });

    return {
      valid: results.violations.length === 0,
      violations: results.violations.map(v => ({
        id: v.id,
        impact: v.impact as 'critical' | 'serious' | 'moderate' | 'minor',
        description: v.description,
        help: v.help,
        helpUrl: v.helpUrl,
        nodes: v.nodes.map(n => ({
          html: n.html,
          target: n.target,
          failureSummary: n.failureSummary
        })),
        wcagCriteria: v.tags.filter(t => t.startsWith('wcag'))
      })),
      warnings: results.incomplete.map(i => ({
        id: i.id,
        description: i.description,
        help: i.help
      })),
      passes: results.passes.map(p => ({
        id: p.id,
        description: p.description
      }))
    };
  }

  async validateComponent(component: Element): Promise<boolean> {
    const report = await this.runAudit(component);
    return report.valid;
  }
}
```

### React Accessibility Integration

```typescript
// Accessible React component patterns
const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  onClick,
  disabled,
  loading,
  ariaLabel,
  ariaDescribedBy,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-busy={loading}
      aria-disabled={disabled}
      {...props}
    >
      {loading ? (
        <>
          <span className="sr-only">Loading</span>
          <Spinner aria-hidden="true" />
        </>
      ) : (
        children
      )}
    </button>
  );
};

// Custom hook for focus management
function useFocusManagement(containerRef: RefObject<HTMLElement>) {
  const [focusedIndex, setFocusedIndex] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        // Custom tab handling if needed
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [containerRef]);

  return { focusedIndex, setFocusedIndex };
}
```

## Security Considerations

### Accessible Security Features

```typescript
class AccessibleSecurityService {
  private screenReaderService: ScreenReaderService;

  // Accessible CAPTCHA alternatives
  async provideCaptchaAlternative(userId: string): Promise<CaptchaAlternative> {
    return {
      type: 'audio',
      audioUrl: await this.generateAudioCaptcha(),
      textAlternative: 'Audio CAPTCHA available',
      skipOption: await this.checkTrustedUser(userId)
    };
  }

  // Secure and accessible password requirements
  announcePasswordStrength(strength: PasswordStrength): void {
    const messages: Record<PasswordStrength, string> = {
      weak: 'Password strength: weak. Add more characters and special symbols.',
      fair: 'Password strength: fair. Consider adding numbers or symbols.',
      good: 'Password strength: good.',
      strong: 'Password strength: strong.'
    };

    this.screenReaderService.announcePolite(messages[strength]);
  }

  // Accessible session timeout warning
  announceSessionTimeout(remainingSeconds: number): void {
    if (remainingSeconds === 120) {
      this.screenReaderService.announceAssertive(
        'Your session will expire in 2 minutes. Press any key to extend.'
      );
    } else if (remainingSeconds === 30) {
      this.screenReaderService.announceAssertive(
        'Your session will expire in 30 seconds.'
      );
    }
  }
}
```

## Testing Considerations

### Accessibility Testing

```typescript
describe('Accessibility Tests', () => {
  it('should have no WCAG 2.1 AA violations', async () => {
    const tester = new AxeAccessibilityTester();
    const report = await tester.runAudit();
    
    expect(report.violations).toHaveLength(0);
  });

  it('should support keyboard navigation', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <button>Button 1</button>
      <button>Button 2</button>
      <button>Button 3</button>
    `;
    document.body.appendChild(container);

    const buttons = container.querySelectorAll('button');
    buttons[0].focus();

    // Simulate Tab key
    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
    document.dispatchEvent(tabEvent);

    expect(document.activeElement).toBe(buttons[1]);
  });

  it('should announce changes to screen readers', () => {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    document.body.appendChild(announcer);

    announcer.textContent = 'Form submitted successfully';

    expect(announcer.textContent).toBe('Form submitted successfully');
    expect(announcer.getAttribute('aria-live')).toBe('polite');
  });

  it('should have sufficient color contrast', () => {
    const service = new VisualAccessibilityService();
    const ratio = service.calculateContrastRatio('#000000', '#FFFFFF');
    
    expect(ratio).toBeGreaterThanOrEqual(4.5); // WCAG AA for normal text
  });
});
```

## Configuration Examples

### WCAG Compliance Configuration

```typescript
const wcagConfig: WCAGComplianceConfig = {
  level: 'AA', // 'A', 'AA', or 'AAA'
  version: '2.1',
  rules: {
    colorContrast: {
      normalText: 4.5,
      largeText: 3.0,
      uiComponents: 3.0
    },
    focusIndicator: {
      minWidth: 2,
      minContrast: 3.0
    },
    timing: {
      sessionTimeout: 1200, // 20 minutes
      warningBefore: 120 // 2 minutes warning
    },
    motion: {
      respectReducedMotion: true,
      maxAnimationDuration: 5000
    }
  },
  testing: {
    automated: ['axe-core', 'pa11y'],
    manual: ['keyboard', 'screen-reader', 'zoom']
  }
};
```
