# Device Connectivity Template

## Purpose

This template provides comprehensive patterns for implementing device discovery, pairing workflows, connection management, and device authentication in IoT applications. It covers protocols like Bluetooth, Wi-Fi, Zigbee, Z-Wave, and cellular connectivity, along with secure device onboarding and lifecycle management.

## Context

IoT device connectivity requires robust mechanisms for discovering devices on networks, establishing secure connections, managing device lifecycles, and handling connectivity failures gracefully. This template addresses the implementation of device connectivity across various protocols while maintaining security and reliability.

## Core Components

### Device Discovery Service

## Examples

```typescript
interface DeviceDiscoveryService {
  startDiscovery(options: DiscoveryOptions): Promise<DiscoverySession>;
  stopDiscovery(sessionId: string): Promise<void>;
  getDiscoveredDevices(sessionId: string): Promise<DiscoveredDevice[]>;
  onDeviceFound(callback: (device: DiscoveredDevice) => void): void;
  onDeviceLost(callback: (deviceId: string) => void): void;
}

interface DiscoveryOptions {
  protocols: ConnectionProtocol[];
  timeout?: number;
  filters?: DeviceFilter[];
  scanMode?: 'active' | 'passive';
  networkScope?: 'local' | 'subnet' | 'wide';
}

interface DiscoveredDevice {
  id: string;
  name: string;
  type: DeviceType;
  protocol: ConnectionProtocol;
  signalStrength?: number;
  manufacturer?: string;
  model?: string;
  firmwareVersion?: string;
  capabilities: DeviceCapability[];
  metadata: Record<string, unknown>;
  discoveredAt: Date;
}

enum ConnectionProtocol {
  BLUETOOTH_LE = 'bluetooth_le',
  BLUETOOTH_CLASSIC = 'bluetooth_classic',
  WIFI = 'wifi',
  ZIGBEE = 'zigbee',
  ZWAVE = 'zwave',
  THREAD = 'thread',
  MATTER = 'matter',
  CELLULAR = 'cellular',
  LORA = 'lora',
  MQTT = 'mqtt',
  COAP = 'coap'
}

enum DeviceType {
  SENSOR = 'sensor',
  ACTUATOR = 'actuator',
  GATEWAY = 'gateway',
  CONTROLLER = 'controller',
  DISPLAY = 'display',
  CAMERA = 'camera',
  WEARABLE = 'wearable',
  INDUSTRIAL = 'industrial'
}
```

### Device Pairing Service

```typescript
interface DevicePairingService {
  initiatePairing(device: DiscoveredDevice, options: PairingOptions): Promise<PairingSession>;
  confirmPairing(sessionId: string, confirmation: PairingConfirmation): Promise<PairedDevice>;
  cancelPairing(sessionId: string): Promise<void>;
  unpairDevice(deviceId: string): Promise<void>;
  getPairedDevices(): Promise<PairedDevice[]>;
}

interface PairingOptions {
  method: PairingMethod;
  timeout?: number;
  securityLevel: SecurityLevel;
  credentials?: DeviceCredentials;
  userConfirmationRequired?: boolean;
}

enum PairingMethod {
  PIN_CODE = 'pin_code',
  QR_CODE = 'qr_code',
  NFC_TAP = 'nfc_tap',
  BUTTON_PRESS = 'button_press',
  PASSKEY = 'passkey',
  OUT_OF_BAND = 'out_of_band',
  JUST_WORKS = 'just_works',
  CERTIFICATE = 'certificate'
}

interface PairingSession {
  id: string;
  deviceId: string;
  method: PairingMethod;
  status: PairingStatus;
  challenge?: string;
  expiresAt: Date;
  createdAt: Date;
}

enum PairingStatus {
  INITIATED = 'initiated',
  AWAITING_CONFIRMATION = 'awaiting_confirmation',
  CONFIRMING = 'confirming',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

interface PairedDevice {
  id: string;
  name: string;
  type: DeviceType;
  protocol: ConnectionProtocol;
  connectionState: ConnectionState;
  pairedAt: Date;
  lastConnected?: Date;
  securityLevel: SecurityLevel;
  capabilities: DeviceCapability[];
  configuration: DeviceConfiguration;
}
```

### Connection Manager

```typescript
interface ConnectionManager {
  connect(deviceId: string, options?: ConnectionOptions): Promise<DeviceConnection>;
  disconnect(deviceId: string): Promise<void>;
  reconnect(deviceId: string): Promise<DeviceConnection>;
  getConnection(deviceId: string): DeviceConnection | null;
  getConnectionState(deviceId: string): ConnectionState;
  onConnectionStateChange(callback: (deviceId: string, state: ConnectionState) => void): void;
}

interface DeviceConnection {
  deviceId: string;
  state: ConnectionState;
  protocol: ConnectionProtocol;
  latency: number;
  signalStrength?: number;
  connectedAt: Date;
  send(message: DeviceMessage): Promise<void>;
  receive(): AsyncIterable<DeviceMessage>;
  subscribe(topic: string): Promise<Subscription>;
}

enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

interface ConnectionOptions {
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  keepAliveInterval?: number;
  autoReconnect?: boolean;
  preferredProtocol?: ConnectionProtocol;
}

interface DeviceMessage {
  id: string;
  type: MessageType;
  payload: unknown;
  timestamp: Date;
  qos?: QualityOfService;
}

enum QualityOfService {
  AT_MOST_ONCE = 0,
  AT_LEAST_ONCE = 1,
  EXACTLY_ONCE = 2
}
```

### Device Authentication Service

```typescript
interface DeviceAuthenticationService {
  authenticateDevice(device: DiscoveredDevice, credentials: DeviceCredentials): Promise<AuthenticationResult>;
  validateDeviceCertificate(certificate: DeviceCertificate): Promise<CertificateValidation>;
  generateDeviceToken(deviceId: string, scope: string[]): Promise<DeviceToken>;
  revokeDeviceAccess(deviceId: string): Promise<void>;
  refreshDeviceToken(token: string): Promise<DeviceToken>;
}

interface DeviceCredentials {
  type: CredentialType;
  certificate?: DeviceCertificate;
  apiKey?: string;
  username?: string;
  password?: string;
  token?: string;
  sharedSecret?: Uint8Array;
}

enum CredentialType {
  CERTIFICATE = 'certificate',
  API_KEY = 'api_key',
  USERNAME_PASSWORD = 'username_password',
  TOKEN = 'token',
  SHARED_SECRET = 'shared_secret',
  OAUTH = 'oauth'
}

interface DeviceCertificate {
  certificate: string;
  privateKey?: string;
  chain?: string[];
  issuer: string;
  subject: string;
  validFrom: Date;
  validTo: Date;
  fingerprint: string;
}

interface AuthenticationResult {
  success: boolean;
  deviceId: string;
  token?: DeviceToken;
  permissions: DevicePermission[];
  error?: AuthenticationError;
}

interface DeviceToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  scope: string[];
  deviceId: string;
}
```

## Implementation Patterns

### Multi-Protocol Device Discovery

```typescript
class MultiProtocolDiscoveryService implements DeviceDiscoveryService {
  private discoveryAdapters: Map<ConnectionProtocol, ProtocolDiscoveryAdapter>;
  private activeSessions: Map<string, DiscoverySession>;
  private eventEmitter: EventEmitter;

  constructor(adapters: ProtocolDiscoveryAdapter[]) {
    this.discoveryAdapters = new Map();
    this.activeSessions = new Map();
    this.eventEmitter = new EventEmitter();

    for (const adapter of adapters) {
      this.discoveryAdapters.set(adapter.protocol, adapter);
    }
  }

  async startDiscovery(options: DiscoveryOptions): Promise<DiscoverySession> {
    const sessionId = crypto.randomUUID();
    const discoveredDevices: Map<string, DiscoveredDevice> = new Map();

    const session: DiscoverySession = {
      id: sessionId,
      options,
      status: 'active',
      startedAt: new Date(),
      discoveredDevices
    };

    this.activeSessions.set(sessionId, session);

    // Start discovery on each requested protocol
    const discoveryPromises = options.protocols.map(async (protocol) => {
      const adapter = this.discoveryAdapters.get(protocol);
      if (!adapter) {
        console.warn(`No adapter for protocol: ${protocol}`);
        return;
      }

      await adapter.startDiscovery({
        timeout: options.timeout,
        filters: options.filters,
        scanMode: options.scanMode,
        onDeviceFound: (device) => {
          if (this.matchesFilters(device, options.filters)) {
            discoveredDevices.set(device.id, device);
            this.eventEmitter.emit('deviceFound', device);
          }
        },
        onDeviceLost: (deviceId) => {
          discoveredDevices.delete(deviceId);
          this.eventEmitter.emit('deviceLost', deviceId);
        }
      });
    });

    await Promise.all(discoveryPromises);

    // Set timeout for auto-stop
    if (options.timeout) {
      setTimeout(() => this.stopDiscovery(sessionId), options.timeout);
    }

    return session;
  }

  async stopDiscovery(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    for (const protocol of session.options.protocols) {
      const adapter = this.discoveryAdapters.get(protocol);
      if (adapter) {
        await adapter.stopDiscovery();
      }
    }

    session.status = 'stopped';
    this.activeSessions.delete(sessionId);
  }

  async getDiscoveredDevices(sessionId: string): Promise<DiscoveredDevice[]> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return [];
    return Array.from(session.discoveredDevices.values());
  }

  onDeviceFound(callback: (device: DiscoveredDevice) => void): void {
    this.eventEmitter.on('deviceFound', callback);
  }

  onDeviceLost(callback: (deviceId: string) => void): void {
    this.eventEmitter.on('deviceLost', callback);
  }

  private matchesFilters(device: DiscoveredDevice, filters?: DeviceFilter[]): boolean {
    if (!filters || filters.length === 0) return true;

    return filters.every(filter => {
      switch (filter.type) {
        case 'deviceType':
          return device.type === filter.value;
        case 'manufacturer':
          return device.manufacturer === filter.value;
        case 'capability':
          return device.capabilities.includes(filter.value as DeviceCapability);
        case 'signalStrength':
          return (device.signalStrength ?? 0) >= (filter.value as number);
        default:
          return true;
      }
    });
  }
}
```

### Secure Device Pairing

```typescript
class SecureDevicePairingService implements DevicePairingService {
  private pairingSessions: Map<string, PairingSession>;
  private pairedDevices: Map<string, PairedDevice>;
  private authService: DeviceAuthenticationService;
  private keyExchange: KeyExchangeService;

  async initiatePairing(device: DiscoveredDevice, options: PairingOptions): Promise<PairingSession> {
    const sessionId = crypto.randomUUID();

    // Generate pairing challenge based on method
    const challenge = await this.generatePairingChallenge(options.method);

    const session: PairingSession = {
      id: sessionId,
      deviceId: device.id,
      method: options.method,
      status: PairingStatus.INITIATED,
      challenge,
      expiresAt: new Date(Date.now() + (options.timeout || 60000)),
      createdAt: new Date()
    };

    this.pairingSessions.set(sessionId, session);

    // Send pairing request to device
    await this.sendPairingRequest(device, session);

    session.status = PairingStatus.AWAITING_CONFIRMATION;
    return session;
  }

  async confirmPairing(sessionId: string, confirmation: PairingConfirmation): Promise<PairedDevice> {
    const session = this.pairingSessions.get(sessionId);
    if (!session) {
      throw new PairingError('Session not found');
    }

    if (session.status !== PairingStatus.AWAITING_CONFIRMATION) {
      throw new PairingError(`Invalid session status: ${session.status}`);
    }

    if (new Date() > session.expiresAt) {
      session.status = PairingStatus.EXPIRED;
      throw new PairingError('Pairing session expired');
    }

    session.status = PairingStatus.CONFIRMING;

    // Verify confirmation based on pairing method
    const isValid = await this.verifyPairingConfirmation(session, confirmation);
    if (!isValid) {
      session.status = PairingStatus.FAILED;
      throw new PairingError('Pairing confirmation failed');
    }

    // Establish secure channel and exchange keys
    const securityContext = await this.establishSecureChannel(session);

    // Create paired device record
    const pairedDevice: PairedDevice = {
      id: session.deviceId,
      name: confirmation.deviceName || session.deviceId,
      type: confirmation.deviceType,
      protocol: confirmation.protocol,
      connectionState: ConnectionState.DISCONNECTED,
      pairedAt: new Date(),
      securityLevel: securityContext.securityLevel,
      capabilities: confirmation.capabilities || [],
      configuration: {
        securityContext,
        preferences: {}
      }
    };

    this.pairedDevices.set(pairedDevice.id, pairedDevice);
    session.status = PairingStatus.COMPLETED;
    this.pairingSessions.delete(sessionId);

    await this.auditService.logDevicePairing(pairedDevice);
    return pairedDevice;
  }

  private async generatePairingChallenge(method: PairingMethod): Promise<string> {
    switch (method) {
      case PairingMethod.PIN_CODE:
        return this.generateNumericPin(6);
      case PairingMethod.PASSKEY:
        return this.generateSecurePasskey(32);
      case PairingMethod.QR_CODE:
        return this.generateQRCodeData();
      default:
        return crypto.randomUUID();
    }
  }

  private generateNumericPin(length: number): string {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return String(array[0]).slice(0, length).padStart(length, '0');
  }

  private generateSecurePasskey(length: number): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => charset[byte % charset.length]).join('');
  }
}
```

### Connection Management with Auto-Reconnect

```typescript
class ResilientConnectionManager implements ConnectionManager {
  private connections: Map<string, DeviceConnection>;
  private connectionConfigs: Map<string, ConnectionOptions>;
  private reconnectTimers: Map<string, NodeJS.Timeout>;
  private eventEmitter: EventEmitter;

  async connect(deviceId: string, options?: ConnectionOptions): Promise<DeviceConnection> {
    const config = { ...this.defaultOptions, ...options };
    this.connectionConfigs.set(deviceId, config);

    const connection = await this.establishConnection(deviceId, config);
    this.connections.set(deviceId, connection);

    // Set up connection monitoring
    this.monitorConnection(deviceId, connection, config);

    return connection;
  }

  private async establishConnection(deviceId: string, config: ConnectionOptions): Promise<DeviceConnection> {
    this.emitStateChange(deviceId, ConnectionState.CONNECTING);

    let lastError: Error | null = null;
    for (let attempt = 0; attempt < (config.retryAttempts || 3); attempt++) {
      try {
        const connection = await this.createConnection(deviceId, config);
        this.emitStateChange(deviceId, ConnectionState.CONNECTED);
        return connection;
      } catch (error) {
        lastError = error as Error;
        if (attempt < (config.retryAttempts || 3) - 1) {
          await this.delay(config.retryDelay || 1000);
        }
      }
    }

    this.emitStateChange(deviceId, ConnectionState.ERROR);
    throw lastError || new Error('Connection failed');
  }

  private monitorConnection(deviceId: string, connection: DeviceConnection, config: ConnectionOptions): void {
    // Set up keep-alive
    if (config.keepAliveInterval) {
      setInterval(async () => {
        try {
          await connection.send({
            id: crypto.randomUUID(),
            type: MessageType.PING,
            payload: null,
            timestamp: new Date()
          });
        } catch {
          this.handleConnectionLost(deviceId, config);
        }
      }, config.keepAliveInterval);
    }

    // Monitor for disconnection
    connection.onDisconnect = () => {
      this.handleConnectionLost(deviceId, config);
    };
  }

  private async handleConnectionLost(deviceId: string, config: ConnectionOptions): void {
    this.emitStateChange(deviceId, ConnectionState.DISCONNECTED);

    if (config.autoReconnect) {
      this.emitStateChange(deviceId, ConnectionState.RECONNECTING);
      await this.scheduleReconnect(deviceId, config);
    }
  }

  private async scheduleReconnect(deviceId: string, config: ConnectionOptions): Promise<void> {
    const timer = setTimeout(async () => {
      try {
        await this.reconnect(deviceId);
      } catch {
        // Exponential backoff
        const newDelay = Math.min((config.retryDelay || 1000) * 2, 30000);
        await this.scheduleReconnect(deviceId, { ...config, retryDelay: newDelay });
      }
    }, config.retryDelay || 1000);

    this.reconnectTimers.set(deviceId, timer);
  }

  async reconnect(deviceId: string): Promise<DeviceConnection> {
    const config = this.connectionConfigs.get(deviceId);
    if (!config) {
      throw new Error('No connection config found');
    }

    // Clear any pending reconnect timer
    const timer = this.reconnectTimers.get(deviceId);
    if (timer) {
      clearTimeout(timer);
      this.reconnectTimers.delete(deviceId);
    }

    return this.connect(deviceId, config);
  }

  private emitStateChange(deviceId: string, state: ConnectionState): void {
    this.eventEmitter.emit('connectionStateChange', deviceId, state);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## Integration Points

### Bluetooth Low Energy Integration

```typescript
class BLEDiscoveryAdapter implements ProtocolDiscoveryAdapter {
  protocol = ConnectionProtocol.BLUETOOTH_LE;
  private scanner: BLEScanner;

  async startDiscovery(options: AdapterDiscoveryOptions): Promise<void> {
    await this.scanner.startScan({
      services: options.serviceUUIDs,
      allowDuplicates: false,
      scanMode: options.scanMode === 'active' ? 'lowLatency' : 'lowPower'
    });

    this.scanner.on('discover', (peripheral) => {
      const device: DiscoveredDevice = {
        id: peripheral.id,
        name: peripheral.advertisement.localName || 'Unknown',
        type: this.inferDeviceType(peripheral),
        protocol: ConnectionProtocol.BLUETOOTH_LE,
        signalStrength: peripheral.rssi,
        manufacturer: this.parseManufacturerData(peripheral.advertisement.manufacturerData),
        capabilities: this.parseCapabilities(peripheral.advertisement.serviceUuids),
        metadata: {
          serviceUUIDs: peripheral.advertisement.serviceUuids,
          txPowerLevel: peripheral.advertisement.txPowerLevel
        },
        discoveredAt: new Date()
      };

      options.onDeviceFound(device);
    });
  }

  async stopDiscovery(): Promise<void> {
    await this.scanner.stopScan();
  }
}
```

### MQTT Integration

```typescript
class MQTTConnectionAdapter implements ProtocolConnectionAdapter {
  protocol = ConnectionProtocol.MQTT;
  private client: MQTTClient;

  async connect(deviceId: string, config: ConnectionConfig): Promise<DeviceConnection> {
    const mqttConfig: MQTTClientConfig = {
      host: config.host,
      port: config.port || 8883,
      protocol: 'mqtts',
      clientId: `device-${deviceId}`,
      username: config.credentials?.username,
      password: config.credentials?.password,
      ca: config.tlsConfig?.ca,
      cert: config.tlsConfig?.cert,
      key: config.tlsConfig?.key,
      keepalive: config.keepAliveInterval ? config.keepAliveInterval / 1000 : 60,
      reconnectPeriod: config.autoReconnect ? (config.retryDelay || 1000) : 0
    };

    await this.client.connect(mqttConfig);

    return {
      deviceId,
      state: ConnectionState.CONNECTED,
      protocol: ConnectionProtocol.MQTT,
      latency: 0,
      connectedAt: new Date(),

      send: async (message: DeviceMessage) => {
        const topic = `devices/${deviceId}/commands`;
        await this.client.publish(topic, JSON.stringify(message), {
          qos: message.qos || QualityOfService.AT_LEAST_ONCE
        });
      },

      receive: async function* () {
        const topic = `devices/${deviceId}/telemetry`;
        await this.client.subscribe(topic);

        for await (const [, payload] of this.client.messages()) {
          yield JSON.parse(payload.toString()) as DeviceMessage;
        }
      },

      subscribe: async (topic: string) => {
        await this.client.subscribe(`devices/${deviceId}/${topic}`);
        return {
          unsubscribe: () => this.client.unsubscribe(`devices/${deviceId}/${topic}`)
        };
      }
    };
  }
}
```

### Cloud IoT Platform Integration

```typescript
interface CloudIoTIntegration {
  awsIoT: AWSIoTAdapter;
  azureIoT: AzureIoTAdapter;
  gcpIoT: GCPIoTAdapter;
}

class AWSIoTAdapter {
  private iotClient: IoTClient;
  private iotDataClient: IoTDataPlaneClient;

  async registerDevice(device: DeviceRegistration): Promise<RegisteredDevice> {
    // Create thing in AWS IoT
    const createThingResult = await this.iotClient.send(new CreateThingCommand({
      thingName: device.id,
      thingTypeName: device.type,
      attributePayload: {
        attributes: device.attributes
      }
    }));

    // Create and attach certificate
    const certResult = await this.iotClient.send(new CreateKeysAndCertificateCommand({
      setAsActive: true
    }));

    await this.iotClient.send(new AttachThingPrincipalCommand({
      thingName: device.id,
      principal: certResult.certificateArn
    }));

    // Attach policy
    await this.iotClient.send(new AttachPolicyCommand({
      policyName: device.policyName,
      target: certResult.certificateArn
    }));

    return {
      deviceId: device.id,
      thingArn: createThingResult.thingArn!,
      certificateArn: certResult.certificateArn!,
      certificatePem: certResult.certificatePem!,
      privateKey: certResult.keyPair!.PrivateKey!,
      publicKey: certResult.keyPair!.PublicKey!,
      endpoint: await this.getEndpoint()
    };
  }

  async publishToDevice(deviceId: string, message: DeviceMessage): Promise<void> {
    await this.iotDataClient.send(new PublishCommand({
      topic: `devices/${deviceId}/commands`,
      payload: Buffer.from(JSON.stringify(message)),
      qos: message.qos || 1
    }));
  }
}
```

## Security Considerations

### Device Authentication Best Practices

- Use X.509 certificates for device identity verification
- Implement mutual TLS (mTLS) for all device communications
- Rotate device credentials periodically
- Use hardware security modules (HSM) for key storage on devices
- Implement device attestation for firmware integrity verification

### Secure Communication

- Encrypt all device-to-cloud communications using TLS 1.3
- Use authenticated encryption (AES-GCM) for payload encryption
- Implement message signing for data integrity
- Use secure key exchange protocols (ECDHE)
- Implement certificate pinning for critical devices

### Access Control

- Implement fine-grained permissions per device
- Use short-lived tokens with refresh mechanisms
- Implement device groups for bulk access management
- Log all device access and commands for audit trails

## Compliance Guidelines

- IoT Security Foundation best practices
- NIST IoT device cybersecurity guidelines
- IEC 62443 for industrial IoT security
- ETSI EN 303 645 for consumer IoT security
- Matter protocol security requirements

## Testing Considerations

### Property-Based Tests

```typescript
describe('Device Connectivity Properties', () => {
  it('should maintain connection state consistency', () => {
    fc.assert(fc.property(
      fc.array(fc.constantFrom('connect', 'disconnect', 'reconnect'), { minLength: 1, maxLength: 20 }),
      async (operations) => {
        const manager = new ResilientConnectionManager();
        const deviceId = 'test-device';

        for (const op of operations) {
          switch (op) {
            case 'connect':
              await manager.connect(deviceId);
              expect(manager.getConnectionState(deviceId)).toBe(ConnectionState.CONNECTED);
              break;
            case 'disconnect':
              await manager.disconnect(deviceId);
              expect(manager.getConnectionState(deviceId)).toBe(ConnectionState.DISCONNECTED);
              break;
            case 'reconnect':
              if (manager.getConnection(deviceId)) {
                await manager.reconnect(deviceId);
                expect(manager.getConnectionState(deviceId)).toBe(ConnectionState.CONNECTED);
              }
              break;
          }
        }
      }
    ));
  });

  it('should discover devices matching filters', () => {
    fc.assert(fc.property(
      fc.record({
        deviceType: fc.constantFrom(...Object.values(DeviceType)),
        protocol: fc.constantFrom(...Object.values(ConnectionProtocol))
      }),
      async (filter) => {
        const service = new MultiProtocolDiscoveryService([]);
        const session = await service.startDiscovery({
          protocols: [filter.protocol],
          filters: [{ type: 'deviceType', value: filter.deviceType }]
        });

        const devices = await service.getDiscoveredDevices(session.id);
        
        // All discovered devices should match the filter
        for (const device of devices) {
          expect(device.type).toBe(filter.deviceType);
          expect(device.protocol).toBe(filter.protocol);
        }
      }
    ));
  });
});
```
