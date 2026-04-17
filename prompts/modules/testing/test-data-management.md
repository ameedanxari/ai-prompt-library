# Test Data Management Template

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

This template provides comprehensive patterns for managing test data including generation, seeding, masking, cleanup, and environment management. It covers strategies for creating realistic test data while maintaining data privacy and ensuring test isolation.


## Instructions

1. Review the requirements and context.
2. Apply the specified patterns and configurations.
3. Validate the implementation against expected outputs.

## Context

Effective test data management is critical for reliable automated testing. This template addresses the challenges of generating representative test data, maintaining data consistency across test environments, protecting sensitive information, and ensuring proper cleanup to prevent test pollution.

## Core Components

### Test Data Generator Interface

## Examples

```typescript
interface TestDataGenerator {
  generateUser(overrides?: Partial<User>): User;
  generateUsers(count: number, overrides?: Partial<User>): User[];
  generateOrder(user: User, overrides?: Partial<Order>): Order;
  generateProduct(overrides?: Partial<Product>): Product;
  generateTimeSeries(config: TimeSeriesConfig): DataPoint[];
  seed(seed: number): void;
}

interface DataGeneratorConfig {
  locale: string;
  seed?: number;
  dateRange: { start: Date; end: Date };
  uniqueConstraints: UniqueConstraint[];
}


class FakerDataGenerator implements TestDataGenerator {
  private faker: Faker;
  private usedEmails: Set<string> = new Set();
  private usedIds: Set<string> = new Set();

  constructor(config: DataGeneratorConfig) {
    this.faker = new Faker({ locale: config.locale });
    if (config.seed) {
      this.faker.seed(config.seed);
    }
  }

  generateUser(overrides?: Partial<User>): User {
    const email = this.generateUniqueEmail();
    
    return {
      id: this.generateUniqueId(),
      email,
      name: this.faker.person.fullName(),
      phone: this.faker.phone.number(),
      address: {
        street: this.faker.location.streetAddress(),
        city: this.faker.location.city(),
        state: this.faker.location.state(),
        zipCode: this.faker.location.zipCode(),
        country: this.faker.location.country()
      },
      createdAt: this.faker.date.past(),
      updatedAt: new Date(),
      ...overrides
    };
  }

  generateUsers(count: number, overrides?: Partial<User>): User[] {
    return Array.from({ length: count }, () => this.generateUser(overrides));
  }

  generateOrder(user: User, overrides?: Partial<Order>): Order {
    const items = Array.from(
      { length: this.faker.number.int({ min: 1, max: 5 }) },
      () => this.generateOrderItem()
    );
    
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.08;
    
    return {
      id: this.generateUniqueId(),
      userId: user.id,
      items,
      subtotal,
      tax,
      total: subtotal + tax,
      status: this.faker.helpers.arrayElement(['pending', 'processing', 'shipped', 'delivered']),
      createdAt: this.faker.date.recent(),
      ...overrides
    };
  }

  private generateUniqueEmail(): string {
    let email: string;
    do {
      email = this.faker.internet.email().toLowerCase();
    } while (this.usedEmails.has(email));
    
    this.usedEmails.add(email);
    return email;
  }

  private generateUniqueId(): string {
    let id: string;
    do {
      id = this.faker.string.uuid();
    } while (this.usedIds.has(id));
    
    this.usedIds.add(id);
    return id;
  }

  seed(seed: number): void {
    this.faker.seed(seed);
    this.usedEmails.clear();
    this.usedIds.clear();
  }
}
```

### Data Masking Service

```typescript
interface DataMaskingService {
  maskPII(data: Record<string, unknown>): Record<string, unknown>;
  maskEmail(email: string): string;
  maskPhone(phone: string): string;
  maskCreditCard(cardNumber: string): string;
  maskSSN(ssn: string): string;
  createMaskingRules(schema: DataSchema): MaskingRule[];
}

class PIIMaskingService implements DataMaskingService {
  private maskingRules: Map<string, MaskingRule> = new Map();

  constructor() {
    this.initializeDefaultRules();
  }

  private initializeDefaultRules(): void {
    this.maskingRules.set('email', {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      mask: (value: string) => this.maskEmail(value)
    });
    
    this.maskingRules.set('phone', {
      pattern: /^\+?[\d\s-()]+$/,
      mask: (value: string) => this.maskPhone(value)
    });
    
    this.maskingRules.set('ssn', {
      pattern: /^\d{3}-?\d{2}-?\d{4}$/,
      mask: (value: string) => this.maskSSN(value)
    });
    
    this.maskingRules.set('creditCard', {
      pattern: /^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/,
      mask: (value: string) => this.maskCreditCard(value)
    });
  }

  maskPII(data: Record<string, unknown>): Record<string, unknown> {
    const masked: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        masked[key] = this.applyMasking(key, value);
      } else if (typeof value === 'object' && value !== null) {
        masked[key] = this.maskPII(value as Record<string, unknown>);
      } else {
        masked[key] = value;
      }
    }
    
    return masked;
  }

  maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    const maskedLocal = local.charAt(0) + '***' + local.charAt(local.length - 1);
    return `${maskedLocal}@${domain}`;
  }

  maskPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    return '***-***-' + digits.slice(-4);
  }

  maskCreditCard(cardNumber: string): string {
    const digits = cardNumber.replace(/\D/g, '');
    return '**** **** **** ' + digits.slice(-4);
  }

  maskSSN(ssn: string): string {
    return '***-**-' + ssn.slice(-4);
  }
}
```


### Test Environment Manager

```typescript
interface TestEnvironmentManager {
  createEnvironment(config: EnvironmentConfig): Promise<TestEnvironment>;
  seedEnvironment(env: TestEnvironment, fixtures: Fixture[]): Promise<void>;
  resetEnvironment(env: TestEnvironment): Promise<void>;
  destroyEnvironment(env: TestEnvironment): Promise<void>;
  cloneEnvironment(source: TestEnvironment): Promise<TestEnvironment>;
}

class DatabaseTestEnvironment implements TestEnvironmentManager {
  private environments: Map<string, TestEnvironment> = new Map();

  async createEnvironment(config: EnvironmentConfig): Promise<TestEnvironment> {
    const envId = `test_env_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    // Create isolated database
    const dbName = `test_${envId}`;
    await this.dbClient.query(`CREATE DATABASE ${dbName}`);
    
    // Run migrations
    const connection = await this.createConnection(dbName);
    await this.runMigrations(connection);
    
    const environment: TestEnvironment = {
      id: envId,
      database: dbName,
      connection,
      createdAt: new Date(),
      status: 'ready'
    };
    
    this.environments.set(envId, environment);
    return environment;
  }

  async seedEnvironment(env: TestEnvironment, fixtures: Fixture[]): Promise<void> {
    const sortedFixtures = this.topologicalSort(fixtures);
    
    for (const fixture of sortedFixtures) {
      await this.insertFixture(env.connection, fixture);
    }
  }

  async resetEnvironment(env: TestEnvironment): Promise<void> {
    // Truncate all tables in reverse dependency order
    const tables = await this.getTableNames(env.connection);
    const sortedTables = this.sortTablesByDependency(tables).reverse();
    
    await env.connection.query('SET CONSTRAINTS ALL DEFERRED');
    
    for (const table of sortedTables) {
      await env.connection.query(`TRUNCATE TABLE ${table} CASCADE`);
    }
    
    await env.connection.query('SET CONSTRAINTS ALL IMMEDIATE');
    
    // Reset sequences
    await this.resetSequences(env.connection);
  }

  async destroyEnvironment(env: TestEnvironment): Promise<void> {
    await env.connection.end();
    await this.dbClient.query(`DROP DATABASE IF EXISTS ${env.database}`);
    this.environments.delete(env.id);
  }

  private topologicalSort(fixtures: Fixture[]): Fixture[] {
    const sorted: Fixture[] = [];
    const visited = new Set<string>();
    
    const visit = (fixture: Fixture) => {
      if (visited.has(fixture.name)) return;
      visited.add(fixture.name);
      
      for (const dep of fixture.dependencies || []) {
        const depFixture = fixtures.find(f => f.name === dep);
        if (depFixture) visit(depFixture);
      }
      
      sorted.push(fixture);
    };
    
    fixtures.forEach(visit);
    return sorted;
  }
}
```

### Data Cleanup Service

```typescript
interface DataCleanupService {
  registerCleanupHandler(table: string, handler: CleanupHandler): void;
  cleanupTestData(testId: string): Promise<CleanupResult>;
  scheduleCleanup(testId: string, delay: number): void;
  getOrphanedData(): Promise<OrphanedDataReport>;
}

class TestDataCleanupService implements DataCleanupService {
  private cleanupHandlers: Map<string, CleanupHandler> = new Map();
  private testDataRegistry: Map<string, TestDataRecord[]> = new Map();

  registerCleanupHandler(table: string, handler: CleanupHandler): void {
    this.cleanupHandlers.set(table, handler);
  }

  trackTestData(testId: string, table: string, recordId: string): void {
    const records = this.testDataRegistry.get(testId) || [];
    records.push({ table, recordId, createdAt: new Date() });
    this.testDataRegistry.set(testId, records);
  }

  async cleanupTestData(testId: string): Promise<CleanupResult> {
    const records = this.testDataRegistry.get(testId) || [];
    const results: CleanupItemResult[] = [];
    
    // Sort by reverse creation order to handle dependencies
    const sortedRecords = [...records].reverse();
    
    for (const record of sortedRecords) {
      try {
        const handler = this.cleanupHandlers.get(record.table);
        if (handler) {
          await handler(record.recordId);
        } else {
          await this.defaultCleanup(record.table, record.recordId);
        }
        
        results.push({
          table: record.table,
          recordId: record.recordId,
          success: true
        });
      } catch (error) {
        results.push({
          table: record.table,
          recordId: record.recordId,
          success: false,
          error: (error as Error).message
        });
      }
    }
    
    this.testDataRegistry.delete(testId);
    
    return {
      testId,
      totalRecords: records.length,
      cleaned: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      details: results
    };
  }

  private async defaultCleanup(table: string, recordId: string): Promise<void> {
    await this.dbClient.query(
      `DELETE FROM ${table} WHERE id = $1`,
      [recordId]
    );
  }
}
```


## Implementation Patterns

### Factory Pattern for Test Data

```typescript
class TestDataFactory<T> {
  private defaults: Partial<T>;
  private sequences: Map<string, number> = new Map();
  private traits: Map<string, Partial<T>> = new Map();

  constructor(defaults: Partial<T>) {
    this.defaults = defaults;
  }

  trait(name: string, overrides: Partial<T>): this {
    this.traits.set(name, overrides);
    return this;
  }

  sequence(field: keyof T, generator: (n: number) => T[keyof T]): this {
    const fieldName = field as string;
    const currentSeq = this.sequences.get(fieldName) || 0;
    this.sequences.set(fieldName, currentSeq);
    
    (this.defaults as Record<string, unknown>)[fieldName] = () => {
      const seq = this.sequences.get(fieldName)!;
      this.sequences.set(fieldName, seq + 1);
      return generator(seq);
    };
    
    return this;
  }

  build(overrides?: Partial<T>, ...traitNames: string[]): T {
    let result = { ...this.defaults };
    
    // Apply traits
    for (const traitName of traitNames) {
      const trait = this.traits.get(traitName);
      if (trait) {
        result = { ...result, ...trait };
      }
    }
    
    // Apply overrides
    if (overrides) {
      result = { ...result, ...overrides };
    }
    
    // Resolve sequences and functions
    for (const [key, value] of Object.entries(result)) {
      if (typeof value === 'function') {
        (result as Record<string, unknown>)[key] = value();
      }
    }
    
    return result as T;
  }

  buildList(count: number, overrides?: Partial<T>, ...traitNames: string[]): T[] {
    return Array.from({ length: count }, () => this.build(overrides, ...traitNames));
  }
}

// Usage
const userFactory = new TestDataFactory<User>({
  name: 'Test User',
  role: 'user',
  isActive: true
})
  .sequence('email', (n) => `user${n}@test.com`)
  .sequence('id', (n) => `user-${n}`)
  .trait('admin', { role: 'admin' })
  .trait('inactive', { isActive: false });

const regularUser = userFactory.build();
const adminUser = userFactory.build({}, 'admin');
const inactiveUsers = userFactory.buildList(5, {}, 'inactive');
```

### Fixture Loading Pattern

```typescript
class FixtureLoader {
  private fixturesPath: string;
  private loadedFixtures: Map<string, unknown[]> = new Map();

  constructor(fixturesPath: string) {
    this.fixturesPath = fixturesPath;
  }

  async loadFixture<T>(name: string): Promise<T[]> {
    if (this.loadedFixtures.has(name)) {
      return this.loadedFixtures.get(name) as T[];
    }

    const filePath = join(this.fixturesPath, `${name}.json`);
    const content = await readFile(filePath, 'utf-8');
    const data = JSON.parse(content) as T[];
    
    this.loadedFixtures.set(name, data);
    return data;
  }

  async loadAndSeed<T>(
    name: string,
    repository: Repository<T>
  ): Promise<T[]> {
    const fixtures = await this.loadFixture<T>(name);
    const seeded: T[] = [];
    
    for (const fixture of fixtures) {
      const entity = await repository.save(fixture);
      seeded.push(entity);
    }
    
    return seeded;
  }

  async loadRelatedFixtures(manifest: FixtureManifest): Promise<void> {
    const sortedFixtures = this.sortByDependencies(manifest.fixtures);
    
    for (const fixture of sortedFixtures) {
      await this.loadAndSeed(fixture.name, fixture.repository);
    }
  }

  clearCache(): void {
    this.loadedFixtures.clear();
  }
}
```

## Integration Points

### Database Integration

```typescript
interface DatabaseTestIntegration {
  setupTestSchema(connection: Connection): Promise<void>;
  createSnapshot(connection: Connection): Promise<DatabaseSnapshot>;
  restoreSnapshot(connection: Connection, snapshot: DatabaseSnapshot): Promise<void>;
  compareSnapshots(before: DatabaseSnapshot, after: DatabaseSnapshot): SnapshotDiff;
}

class PostgresTestIntegration implements DatabaseTestIntegration {
  async createSnapshot(connection: Connection): Promise<DatabaseSnapshot> {
    const tables = await this.getTableNames(connection);
    const snapshot: DatabaseSnapshot = {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      tables: {}
    };

    for (const table of tables) {
      const rows = await connection.query(`SELECT * FROM ${table}`);
      const count = await connection.query(
        `SELECT COUNT(*) as count FROM ${table}`
      );
      
      snapshot.tables[table] = {
        rowCount: parseInt(count.rows[0].count),
        checksum: this.calculateChecksum(rows.rows)
      };
    }

    return snapshot;
  }

  compareSnapshots(before: DatabaseSnapshot, after: DatabaseSnapshot): SnapshotDiff {
    const diff: SnapshotDiff = {
      added: [],
      removed: [],
      modified: []
    };

    const allTables = new Set([
      ...Object.keys(before.tables),
      ...Object.keys(after.tables)
    ]);

    for (const table of allTables) {
      const beforeTable = before.tables[table];
      const afterTable = after.tables[table];

      if (!beforeTable && afterTable) {
        diff.added.push({ table, rows: afterTable.rowCount });
      } else if (beforeTable && !afterTable) {
        diff.removed.push({ table, rows: beforeTable.rowCount });
      } else if (beforeTable && afterTable) {
        if (beforeTable.checksum !== afterTable.checksum) {
          diff.modified.push({
            table,
            beforeRows: beforeTable.rowCount,
            afterRows: afterTable.rowCount
          });
        }
      }
    }

    return diff;
  }
}
```

## Security Considerations

### Sensitive Data Handling

```typescript
class SecureTestDataHandler {
  private sensitiveFields = ['password', 'ssn', 'creditCard', 'apiKey', 'token'];

  validateNoProductionData(data: unknown[]): ValidationResult {
    const violations: DataViolation[] = [];
    
    for (const record of data) {
      const productionIndicators = this.detectProductionData(record);
      if (productionIndicators.length > 0) {
        violations.push({
          record,
          indicators: productionIndicators
        });
      }
    }
    
    return {
      valid: violations.length === 0,
      violations
    };
  }

  private detectProductionData(record: unknown): string[] {
    const indicators: string[] = [];
    const recordStr = JSON.stringify(record).toLowerCase();
    
    // Check for real email domains
    const realDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    for (const domain of realDomains) {
      if (recordStr.includes(domain)) {
        indicators.push(`Contains real email domain: ${domain}`);
      }
    }
    
    // Check for real phone patterns
    if (/\d{3}[-.]?\d{3}[-.]?\d{4}/.test(recordStr)) {
      const phoneMatch = recordStr.match(/\d{10,}/);
      if (phoneMatch && !phoneMatch[0].startsWith('555')) {
        indicators.push('Contains potentially real phone number');
      }
    }
    
    return indicators;
  }

  sanitizeForLogging(data: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (this.sensitiveFields.some(f => key.toLowerCase().includes(f))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeForLogging(value as Record<string, unknown>);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
}
```

## Testing Considerations

### Property-Based Tests

```typescript
describe('Test Data Management Properties', () => {
  it('should generate unique identifiers across all generated records', () => {
    fc.assert(fc.property(
      fc.integer({ min: 10, max: 100 }),
      (count) => {
        const generator = new FakerDataGenerator({ locale: 'en' });
        const users = generator.generateUsers(count);
        
        const ids = users.map(u => u.id);
        const uniqueIds = new Set(ids);
        
        return uniqueIds.size === count;
      }
    ));
  });

  it('should properly mask all PII fields', () => {
    fc.assert(fc.property(
      fc.record({
        email: fc.emailAddress(),
        phone: fc.stringOf(fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9'), { minLength: 10, maxLength: 10 }),
        name: fc.string({ minLength: 1 })
      }),
      (userData) => {
        const masker = new PIIMaskingService();
        const masked = masker.maskPII(userData);
        
        // Email should be masked but retain structure
        expect(masked.email).toContain('@');
        expect(masked.email).toContain('***');
        
        // Phone should show only last 4 digits
        expect(masked.phone).toMatch(/\*{3}-\*{3}-\d{4}/);
        
        return true;
      }
    ));
  });
});
```

## Configuration Examples

### Test Data Configuration

```yaml
# test-data-config.yaml
generator:
  locale: en_US
  seed: 12345
  
masking:
  enabled: true
  fields:
    - email
    - phone
    - ssn
    - creditCard
    
environments:
  test:
    database: test_db
    cleanup: after_each
  integration:
    database: integration_db
    cleanup: after_suite
    
fixtures:
  path: ./fixtures
  format: json
  autoload:
    - users
    - products
    - orders
```
