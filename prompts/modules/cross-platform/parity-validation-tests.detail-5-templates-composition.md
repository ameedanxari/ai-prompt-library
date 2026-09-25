## Integration Points

This parity validation test module integrates with other testing modules:

- **Centralized Mock Data**: [centralized-mock-data.md](../testing/centralized-mock-data.md) - Provides consistent mock data for all platforms
- **Fake Backend Generator**: [fake-backend-generator.md](../testing/fake-backend-generator.md) - Generates the fake backend server for integration testing
- **Debug Menu Integration**: [debug-menu-integration.md](../testing/debug-menu-integration.md) - Enables environment switching for QA testing
- **Shared Contracts**: [shared-contracts.md](./shared-contracts.md) - Defines API contracts that mock data must conform to

## Module References

When implementing parity validation tests, use these related modules:

```markdown
# For centralized mock data organization
#[[module:testing/centralized-mock-data.md]]

# For fake backend server generation
#[[module:testing/fake-backend-generator.md]]

# For debug menu UI implementation
#[[module:testing/debug-menu-integration.md]]
```

## Domain-Specific Parity Test Templates

### Commerce Domain Parity Tests

```javascript
// tests/parity/domains/commerce/product-parity.test.js
describe('Commerce Product Parity Tests', () => {
  const platforms = ['web', 'ios', 'android'];
  
  describe('Product Catalog', () => {
    test('should display products consistently across platforms', async () => {
      const testFunction = async (platform) => {
        const response = await apiClient.get('/api/v1/products', {
          headers: { 'X-Platform': platform }
        });
        
        return {
          status: response.status,
          productCount: response.data.data.length,
          productSchema: validateSchema(response.data.data[0], productSchema)
        };
      };
      
      const results = await ParityTestUtils.performCrossPlatformTest(testFunction);
      ParityTestUtils.validateCrossPlatformConsistency(results, ['status', 'productCount']);
    });
    
    test('should handle product variants consistently', async () => {
      const productId = 'test-product-with-variants';
      
      const testFunction = async (platform) => {
        const response = await apiClient.get(`/api/v1/products/${productId}/variants`, {
          headers: { 'X-Platform': platform }
        });
        
        return {
          variantCount: response.data.data.length,
          variantAttributes: response.data.data.map(v => v.attributes)
        };
      };
      
      const results = await ParityTestUtils.performCrossPlatformTest(testFunction);
      ParityTestUtils.validateCrossPlatformConsistency(results, ['variantCount']);
    });
  });
  
  describe('Shopping Cart', () => {
    test('should calculate cart totals consistently', async () => {
      const cartItems = [
        { product_id: 'prod-1', quantity: 2 },
        { product_id: 'prod-2', quantity: 1 }
      ];
      
      const testFunction = async (platform) => {
        // Add items to cart
        for (const item of cartItems) {
          await apiClient.post('/api/v1/cart/items', item, {
            headers: { 'X-Platform': platform, 'Authorization': `Bearer ${token}` }
          });
        }
        
        // Get cart totals
        const response = await apiClient.get('/api/v1/cart', {
          headers: { 'X-Platform': platform, 'Authorization': `Bearer ${token}` }
        });
        
        return {
          subtotal: response.data.data.subtotal,
          tax: response.data.data.tax,
          total: response.data.data.total,
          itemCount: response.data.data.items.length
        };
      };
      
      const results = await ParityTestUtils.performCrossPlatformTest(testFunction);
      ParityTestUtils.validateCrossPlatformConsistency(results, ['subtotal', 'tax', 'total', 'itemCount']);
    });
  });
  
  describe('Checkout Flow', () => {
    test('should process payments consistently', async () => {
      const paymentData = {
        method: 'card',
        card_token: 'tok_test_visa'
      };
      
      const testFunction = async (platform) => {
        const response = await apiClient.post('/api/v1/checkout/payment', paymentData, {
          headers: { 'X-Platform': platform, 'Authorization': `Bearer ${token}` }
        });
        
        return {
          status: response.status,
          paymentStatus: response.data.data.status,
          orderId: response.data.data.order_id
        };
      };
      
      const results = await ParityTestUtils.performCrossPlatformTest(testFunction);
      ParityTestUtils.validateCrossPlatformConsistency(results, ['status', 'paymentStatus']);
    });
  });
});
```

### Healthcare Domain Parity Tests

```javascript
// tests/parity/domains/healthcare/patient-data-parity.test.js
describe('Healthcare Patient Data Parity Tests', () => {
  const platforms = ['web', 'ios', 'android'];
  
  describe('Patient Records', () => {
    test('should handle PHI consistently with encryption', async () => {
      const testFunction = async (platform) => {
        const response = await apiClient.get('/api/v1/patients/123', {
          headers: { 
            'X-Platform': platform, 
            'Authorization': `Bearer ${hipaaToken}` 
          }
        });
        
        return {
          status: response.status,
          hasEncryptedFields: !!response.data.data.encrypted_fields,
          auditLogged: response.headers['x-audit-logged'] === 'true'
        };
      };
      
      const results = await ParityTestUtils.performCrossPlatformTest(testFunction);
      
      // All platforms must handle PHI with encryption
      Object.values(results).forEach(result => {
        expect(result.hasEncryptedFields).toBe(true);
        expect(result.auditLogged).toBe(true);
      });
    });
    
    test('should enforce session timeout consistently', async () => {
      const testFunction = async (platform) => {
        // Get session info
        const response = await apiClient.get('/api/v1/session', {
          headers: { 'X-Platform': platform, 'Authorization': `Bearer ${hipaaToken}` }
        });
        
        return {
          maxSessionDuration: response.data.data.max_duration,
          inactivityTimeout: response.data.data.inactivity_timeout
        };
      };
      
      const results = await ParityTestUtils.performCrossPlatformTest(testFunction);
      
      // HIPAA requires consistent session management
      ParityTestUtils.validateCrossPlatformConsistency(results, [
        'maxSessionDuration', 
        'inactivityTimeout'
      ]);
    });
  });
  
  describe('Telemedicine', () => {
    test('should handle video consultations consistently', async () => {
      const testFunction = async (platform) => {
        const response = await apiClient.post('/api/v1/consultations', {
          patient_id: 'patient-123',
          provider_id: 'provider-456',
          type: 'video'
        }, {
          headers: { 'X-Platform': platform, 'Authorization': `Bearer ${hipaaToken}` }
        });
        
        return {
          status: response.status,
          hasVideoUrl: !!response.data.data.video_url,
          encryptionEnabled: response.data.data.encryption_enabled
        };
      };
      
      const results = await ParityTestUtils.performCrossPlatformTest(testFunction);
      
      Object.values(results).forEach(result => {
        expect(result.encryptionEnabled).toBe(true);
      });
    });
  });
});
```

### Fintech Domain Parity Tests

```javascript
// tests/parity/domains/fintech/transaction-parity.test.js
describe('Fintech Transaction Parity Tests', () => {
  const platforms = ['web', 'ios', 'android'];
  
  describe('Account Management', () => {
    test('should display account balances consistently', async () => {
      const testFunction = async (platform) => {
        const response = await apiClient.get('/api/v1/accounts', {
          headers: { 'X-Platform': platform, 'Authorization': `Bearer ${fintechToken}` }
        });
        
        return {
          accountCount: response.data.data.length,
          totalBalance: response.data.data.reduce((sum, acc) => sum + acc.balance, 0),
          currencies: [...new Set(response.data.data.map(acc => acc.currency))]
        };
      };
      
      const results = await ParityTestUtils.performCrossPlatformTest(testFunction);
      ParityTestUtils.validateCrossPlatformConsistency(results, ['accountCount', 'totalBalance']);
    });
  });
  
  describe('Transaction Processing', () => {
    test('should process transfers consistently', async () => {
      const transferData = {
        from_account: 'acc-123',
        to_account: 'acc-456',
        amount: 100.00,
        currency: 'USD'
      };
      
      const testFunction = async (platform) => {
        const response = await apiClient.post('/api/v1/transfers', transferData, {
          headers: { 'X-Platform': platform, 'Authorization': `Bearer ${fintechToken}` }
        });
        
        return {
          status: response.status,
          transactionStatus: response.data.data.status,
          hasReferenceId: !!response.data.data.reference_id,
          fraudCheckPassed: response.data.data.fraud_check_status === 'passed'
        };
      };
      
      const results = await ParityTestUtils.performCrossPlatformTest(testFunction);
      ParityTestUtils.validateCrossPlatformConsistency(results, ['status', 'transactionStatus']);
    });
    
    test('should enforce transaction limits consistently', async () => {
      const largeTransfer = {
        from_account: 'acc-123',
        to_account: 'acc-456',
        amount: 1000000.00, // Exceeds limit
        currency: 'USD'
      };
      
      const testFunction = async (platform) => {
        const response = await apiClient.post('/api/v1/transfers', largeTransfer, {
          headers: { 'X-Platform': platform, 'Authorization': `Bearer ${fintechToken}` },
          validateStatus: () => true
        });
        
        return {
          status: response.status,
          errorCode: response.data.error?.code,
          limitExceeded: response.data.error?.code === 'LIMIT_EXCEEDED'
        };
      };
      
      const results = await ParityTestUtils.performCrossPlatformTest(testFunction);
      
      // All platforms must enforce limits consistently
      Object.values(results).forEach(result => {
        expect(result.limitExceeded).toBe(true);
      });
    });
  });
});
```

### Real-Time Communication Parity Tests

```javascript
// tests/parity/domains/realtime/websocket-parity.test.js
describe('Real-Time Communication Parity Tests', () => {
  const platforms = ['web', 'ios', 'android'];
  
  describe('WebSocket Connection', () => {
    test('should establish connections consistently', async () => {
      const testFunction = async (platform) => {
        const ws = await createWebSocketConnection(platform);
        
        return {
          connected: ws.readyState === WebSocket.OPEN,
          protocol: ws.protocol,
          latency: await measureLatency(ws)
        };
      };
      
      const results = await ParityTestUtils.performCrossPlatformTest(testFunction);
      
      Object.values(results).forEach(result => {
        expect(result.connected).toBe(true);
      });
    });
    
    test('should deliver messages consistently', async () => {
      const testMessage = { type: 'chat', content: 'Hello, World!' };
      
      const testFunction = async (platform) => {
        const ws = await createWebSocketConnection(platform);
        
        // Send message
        ws.send(JSON.stringify(testMessage));
        
        // Wait for echo
        const response = await waitForMessage(ws, 5000);
        
        return {
          received: !!response,
          messageType: response?.type,
          contentMatch: response?.content === testMessage.content
        };
      };
      
      const results = await ParityTestUtils.performCrossPlatformTest(testFunction);
      
      Object.values(results).forEach(result => {
        expect(result.received).toBe(true);
        expect(result.contentMatch).toBe(true);
      });
    });
  });
  
  describe('Presence System', () => {
    test('should track online status consistently', async () => {
      const testFunction = async (platform) => {
        // Set user online
        await apiClient.post('/api/v1/presence/online', {}, {
          headers: { 'X-Platform': platform, 'Authorization': `Bearer ${token}` }
        });
        
        // Check presence from another platform
        const response = await apiClient.get('/api/v1/presence/user-123', {
          headers: { 'X-Platform': 'web' }
        });
        
        return {
          isOnline: response.data.data.online,
          lastSeen: response.data.data.last_seen,
          platform: response.data.data.platform
        };
      };
      
      const results = await ParityTestUtils.performCrossPlatformTest(testFunction);
      
      Object.values(results).forEach(result => {
        expect(result.isOnline).toBe(true);
      });
    });
  });
});
```

### IoT Domain Parity Tests

```javascript
// tests/parity/domains/iot/device-parity.test.js
describe('IoT Device Parity Tests', () => {
  const platforms = ['web', 'ios', 'android'];
  
  describe('Device Management', () => {
    test('should list devices consistently', async () => {
      const testFunction = async (platform) => {
        const response = await apiClient.get('/api/v1/devices', {
          headers: { 'X-Platform': platform, 'Authorization': `Bearer ${iotToken}` }
        });
        
        return {
          deviceCount: response.data.data.length,
          deviceTypes: [...new Set(response.data.data.map(d => d.type))],
          onlineCount: response.data.data.filter(d => d.status === 'online').length
        };
      };
      
      const results = await ParityTestUtils.performCrossPlatformTest(testFunction);
      ParityTestUtils.validateCrossPlatformConsistency(results, ['deviceCount', 'onlineCount']);
    });
    
    test('should send commands consistently', async () => {
      const command = {
        device_id: 'device-123',
        command: 'set_temperature',
        parameters: { value: 72, unit: 'fahrenheit' }
      };
      
      const testFunction = async (platform) => {
        const response = await apiClient.post('/api/v1/devices/commands', command, {
          headers: { 'X-Platform': platform, 'Authorization': `Bearer ${iotToken}` }
        });
        
        return {
          status: response.status,
          commandStatus: response.data.data.status,
          acknowledged: response.data.data.acknowledged
        };
      };
      
      const results = await ParityTestUtils.performCrossPlatformTest(testFunction);
      ParityTestUtils.validateCrossPlatformConsistency(results, ['status', 'commandStatus']);
    });
  });
  
  describe('Sensor Data', () => {
    test('should retrieve sensor data consistently', async () => {
      const testFunction = async (platform) => {
        const response = await apiClient.get('/api/v1/devices/device-123/sensors', {
          headers: { 'X-Platform': platform, 'Authorization': `Bearer ${iotToken}` }
        });
        
        return {
          sensorCount: response.data.data.length,
          latestReadings: response.data.data.map(s => ({
            type: s.type,
            value: s.latest_value,
            unit: s.unit
          }))
        };
      };
      
      const results = await ParityTestUtils.performCrossPlatformTest(testFunction);
      ParityTestUtils.validateCrossPlatformConsistency(results, ['sensorCount']);
    });
  });
});
```

## Template Composition Rules for Parity Testing

### Compatible Test Combinations
- Commerce + Analytics: Test purchase event tracking parity
- Healthcare + Security: Test HIPAA authentication parity
- Fintech + Blockchain: Test crypto transaction parity
- Social + Real-Time: Test messaging delivery parity
- IoT + Analytics: Test telemetry collection parity

### Test Priority Guidelines
1. Security-critical features (authentication, encryption) - Highest priority
2. Data consistency features (CRUD, sync) - High priority
3. User experience features (UI, navigation) - Medium priority
4. Platform-specific features - Lower priority (expected differences)
