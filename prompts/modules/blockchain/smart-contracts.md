# Smart Contracts Template

## Purpose

This template provides comprehensive patterns for smart contract deployment, interaction, event listening, contract upgrades, and lifecycle management in decentralized applications. It covers Solidity contract patterns, deployment strategies, and secure interaction methods.

## Context

Smart contracts are self-executing programs on blockchain networks that enable trustless transactions and decentralized applications. This template addresses the complexity of deploying contracts across multiple networks, interacting with contract functions, listening to events, implementing upgradeable patterns, and managing contract lifecycle while maintaining security and gas efficiency.

## Core Components

### Contract Deployment Service

```typescript
interface ContractDeploymentService {
  deploy(artifact: ContractArtifact, args: unknown[], options?: DeployOptions): Promise<DeployedContract>;
  deployProxy(artifact: ContractArtifact, args: unknown[], options?: ProxyDeployOptions): Promise<DeployedContract>;
  verifyContract(address: string, artifact: ContractArtifact, args: unknown[]): Promise<VerificationResult>;
  getDeploymentHistory(contractName: string): Promise<Deployment[]>;
}


interface ContractArtifact {
  contractName: string;
  abi: ethers.InterfaceAbi;
  bytecode: string;
  deployedBytecode: string;
  linkReferences?: Record<string, Record<string, { length: number; start: number }[]>>;
  sourceName: string;
}

interface DeployOptions {
  gasLimit?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  nonce?: number;
  value?: bigint;
  libraries?: Record<string, string>;
  waitConfirmations?: number;
}

interface ProxyDeployOptions extends DeployOptions {
  proxyType: ProxyType;
  initializer?: string;
  initializerArgs?: unknown[];
}

enum ProxyType {
  TRANSPARENT = 'transparent',
  UUPS = 'uups',
  BEACON = 'beacon',
  MINIMAL = 'minimal'
}

interface DeployedContract {
  address: string;
  deploymentTx: string;
  blockNumber: number;
  deployer: string;
  chainId: number;
  artifact: ContractArtifact;
  proxyAddress?: string;
  implementationAddress?: string;
}

interface Deployment {
  id: string;
  contractName: string;
  address: string;
  chainId: number;
  deployedAt: Date;
  deployer: string;
  version: string;
  isProxy: boolean;
  proxyType?: ProxyType;
}
```

### Contract Interaction Service

```typescript
interface ContractInteractionService {
  call<T>(contract: ContractInstance, method: string, args?: unknown[]): Promise<T>;
  send(contract: ContractInstance, method: string, args?: unknown[], options?: SendOptions): Promise<TransactionReceipt>;
  multicall(calls: ContractCall[]): Promise<MulticallResult[]>;
  estimateGas(contract: ContractInstance, method: string, args?: unknown[]): Promise<bigint>;
  encodeFunction(contract: ContractInstance, method: string, args?: unknown[]): string;
  decodeFunction(contract: ContractInstance, method: string, data: string): unknown[];
}

interface ContractInstance {
  address: string;
  abi: ethers.InterfaceAbi;
  provider: ethers.Provider;
  signer?: ethers.Signer;
}

interface ContractCall {
  contract: ContractInstance;
  method: string;
  args?: unknown[];
}

interface SendOptions {
  gasLimit?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  value?: bigint;
  nonce?: number;
}

interface TransactionReceipt {
  transactionHash: string;
  blockNumber: number;
  blockHash: string;
  status: 'success' | 'failed' | 'pending';
  gasUsed: bigint;
  effectiveGasPrice: bigint;
  logs: EventLog[];
  events: ParsedEvent[];
}

interface MulticallResult {
  success: boolean;
  returnData: unknown;
  error?: string;
}
```

### Event Listening Service

```typescript
interface EventListeningService {
  subscribe(contract: ContractInstance, eventName: string, filter?: EventFilter): EventSubscription;
  subscribeAll(contract: ContractInstance, filter?: EventFilter): EventSubscription;
  getHistoricalEvents(contract: ContractInstance, eventName: string, options: HistoricalEventOptions): Promise<ParsedEvent[]>;
  unsubscribe(subscriptionId: string): void;
  unsubscribeAll(): void;
}

interface EventFilter {
  topics?: (string | string[] | null)[];
  fromBlock?: number | 'latest';
  toBlock?: number | 'latest';
}

interface HistoricalEventOptions {
  fromBlock: number;
  toBlock: number | 'latest';
  filter?: Record<string, unknown>;
  batchSize?: number;
}

interface EventSubscription {
  id: string;
  contractAddress: string;
  eventName: string;
  onEvent(callback: (event: ParsedEvent) => void): void;
  onError(callback: (error: Error) => void): void;
  unsubscribe(): void;
}

interface ParsedEvent {
  eventName: string;
  args: Record<string, unknown>;
  blockNumber: number;
  blockHash: string;
  transactionHash: string;
  logIndex: number;
  address: string;
  timestamp?: number;
}
```

### Contract Upgrade Service

```typescript
interface ContractUpgradeService {
  upgradeProxy(proxyAddress: string, newImplementation: ContractArtifact, options?: UpgradeOptions): Promise<UpgradeResult>;
  prepareUpgrade(proxyAddress: string, newImplementation: ContractArtifact): Promise<PreparedUpgrade>;
  validateUpgrade(currentImpl: ContractArtifact, newImpl: ContractArtifact): Promise<UpgradeValidation>;
  getImplementationAddress(proxyAddress: string): Promise<string>;
  getAdminAddress(proxyAddress: string): Promise<string>;
}

interface UpgradeOptions {
  call?: { fn: string; args: unknown[] };
  unsafeAllow?: UnsafeAllowOption[];
  redeployImplementation?: boolean;
}

type UnsafeAllowOption = 'delegatecall' | 'selfdestruct' | 'state-variable-assignment' | 'state-variable-immutable';

interface UpgradeResult {
  proxyAddress: string;
  previousImplementation: string;
  newImplementation: string;
  transactionHash: string;
  blockNumber: number;
}

interface PreparedUpgrade {
  implementationAddress: string;
  deploymentTx: string;
  upgradeCalldata: string;
}

interface UpgradeValidation {
  isValid: boolean;
  errors: UpgradeError[];
  warnings: UpgradeWarning[];
  storageLayout: StorageLayoutComparison;
}

interface UpgradeError {
  type: 'storage-collision' | 'missing-public-upgrade' | 'constructor-not-empty';
  message: string;
  location?: string;
}

interface UpgradeWarning {
  type: 'state-variable-type-change' | 'new-state-variable';
  message: string;
  location?: string;
}
```


## Implementation Patterns

### Contract Deployment Implementation

```typescript
class ContractDeploymentServiceImpl implements ContractDeploymentService {
  private signer: ethers.Signer;
  private provider: ethers.Provider;
  private deploymentRegistry: DeploymentRegistry;

  constructor(signer: ethers.Signer, registry: DeploymentRegistry) {
    this.signer = signer;
    this.provider = signer.provider!;
    this.deploymentRegistry = registry;
  }

  async deploy(artifact: ContractArtifact, args: unknown[], options?: DeployOptions): Promise<DeployedContract> {
    // Link libraries if needed
    let bytecode = artifact.bytecode;
    if (options?.libraries && artifact.linkReferences) {
      bytecode = this.linkLibraries(bytecode, artifact.linkReferences, options.libraries);
    }

    // Create contract factory
    const factory = new ethers.ContractFactory(artifact.abi, bytecode, this.signer);

    // Estimate gas if not provided
    const deployTx = await factory.getDeployTransaction(...args);
    const gasLimit = options?.gasLimit ?? await this.provider.estimateGas(deployTx);

    // Deploy contract
    const contract = await factory.deploy(...args, {
      gasLimit,
      maxFeePerGas: options?.maxFeePerGas,
      maxPriorityFeePerGas: options?.maxPriorityFeePerGas,
      nonce: options?.nonce,
      value: options?.value
    });

    // Wait for deployment
    const receipt = await contract.deploymentTransaction()?.wait(options?.waitConfirmations ?? 1);

    const deployedContract: DeployedContract = {
      address: await contract.getAddress(),
      deploymentTx: receipt!.hash,
      blockNumber: receipt!.blockNumber,
      deployer: await this.signer.getAddress(),
      chainId: Number((await this.provider.getNetwork()).chainId),
      artifact
    };

    // Register deployment
    await this.deploymentRegistry.register(deployedContract);

    return deployedContract;
  }

  async deployProxy(artifact: ContractArtifact, args: unknown[], options?: ProxyDeployOptions): Promise<DeployedContract> {
    switch (options?.proxyType) {
      case ProxyType.TRANSPARENT:
        return this.deployTransparentProxy(artifact, args, options);
      case ProxyType.UUPS:
        return this.deployUUPSProxy(artifact, args, options);
      case ProxyType.BEACON:
        return this.deployBeaconProxy(artifact, args, options);
      default:
        return this.deployTransparentProxy(artifact, args, options);
    }
  }

  private async deployTransparentProxy(
    artifact: ContractArtifact,
    args: unknown[],
    options?: ProxyDeployOptions
  ): Promise<DeployedContract> {
    // Deploy implementation
    const implementation = await this.deploy(artifact, [], options);

    // Encode initializer call
    const iface = new ethers.Interface(artifact.abi);
    const initializerFn = options?.initializer ?? 'initialize';
    const initData = iface.encodeFunctionData(initializerFn, options?.initializerArgs ?? args);

    // Deploy proxy
    const proxyFactory = new ethers.ContractFactory(
      TransparentUpgradeableProxyABI,
      TransparentUpgradeableProxyBytecode,
      this.signer
    );

    const adminAddress = await this.signer.getAddress();
    const proxy = await proxyFactory.deploy(implementation.address, adminAddress, initData);
    const proxyReceipt = await proxy.deploymentTransaction()?.wait(options?.waitConfirmations ?? 1);

    return {
      ...implementation,
      address: await proxy.getAddress(),
      proxyAddress: await proxy.getAddress(),
      implementationAddress: implementation.address,
      deploymentTx: proxyReceipt!.hash
    };
  }

  private async deployUUPSProxy(
    artifact: ContractArtifact,
    args: unknown[],
    options?: ProxyDeployOptions
  ): Promise<DeployedContract> {
    // Deploy implementation
    const implementation = await this.deploy(artifact, [], options);

    // Encode initializer
    const iface = new ethers.Interface(artifact.abi);
    const initializerFn = options?.initializer ?? 'initialize';
    const initData = iface.encodeFunctionData(initializerFn, options?.initializerArgs ?? args);

    // Deploy ERC1967 proxy
    const proxyFactory = new ethers.ContractFactory(
      ERC1967ProxyABI,
      ERC1967ProxyBytecode,
      this.signer
    );

    const proxy = await proxyFactory.deploy(implementation.address, initData);
    const proxyReceipt = await proxy.deploymentTransaction()?.wait(options?.waitConfirmations ?? 1);

    return {
      ...implementation,
      address: await proxy.getAddress(),
      proxyAddress: await proxy.getAddress(),
      implementationAddress: implementation.address,
      deploymentTx: proxyReceipt!.hash
    };
  }

  async verifyContract(address: string, artifact: ContractArtifact, args: unknown[]): Promise<VerificationResult> {
    const chainId = Number((await this.provider.getNetwork()).chainId);
    const apiKey = this.getEtherscanApiKey(chainId);
    const apiUrl = this.getEtherscanApiUrl(chainId);

    const encodedArgs = ethers.AbiCoder.defaultAbiCoder().encode(
      this.getConstructorTypes(artifact.abi),
      args
    );

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        apikey: apiKey,
        module: 'contract',
        action: 'verifysourcecode',
        contractaddress: address,
        sourceCode: artifact.sourceName,
        codeformat: 'solidity-standard-json-input',
        contractname: artifact.contractName,
        compilerversion: 'v0.8.20+commit.a1b79de6',
        constructorArguements: encodedArgs.slice(2)
      })
    });

    const result = await response.json();
    return {
      success: result.status === '1',
      guid: result.result,
      message: result.message
    };
  }

  private linkLibraries(
    bytecode: string,
    linkReferences: Record<string, Record<string, { length: number; start: number }[]>>,
    libraries: Record<string, string>
  ): string {
    let linkedBytecode = bytecode;

    for (const [sourceName, refs] of Object.entries(linkReferences)) {
      for (const [libName, positions] of Object.entries(refs)) {
        const libAddress = libraries[libName];
        if (!libAddress) {
          throw new Error(`Library ${libName} not provided`);
        }

        const addressHex = libAddress.toLowerCase().replace('0x', '');
        for (const { start, length } of positions) {
          const placeholder = linkedBytecode.slice(2 + start * 2, 2 + (start + length) * 2);
          linkedBytecode = linkedBytecode.replace(placeholder, addressHex);
        }
      }
    }

    return linkedBytecode;
  }
}
```

### Contract Interaction Implementation

```typescript
class ContractInteractionServiceImpl implements ContractInteractionService {
  private multicallAddress: string;

  constructor(multicallAddress?: string) {
    this.multicallAddress = multicallAddress ?? '0xcA11bde05977b3631167028862bE2a173976CA11'; // Multicall3
  }

  async call<T>(contract: ContractInstance, method: string, args: unknown[] = []): Promise<T> {
    const ethersContract = new ethers.Contract(contract.address, contract.abi, contract.provider);
    return ethersContract[method](...args);
  }

  async send(
    contract: ContractInstance,
    method: string,
    args: unknown[] = [],
    options?: SendOptions
  ): Promise<TransactionReceipt> {
    if (!contract.signer) {
      throw new Error('Signer required for send transactions');
    }

    const ethersContract = new ethers.Contract(contract.address, contract.abi, contract.signer);
    
    const tx = await ethersContract[method](...args, {
      gasLimit: options?.gasLimit,
      maxFeePerGas: options?.maxFeePerGas,
      maxPriorityFeePerGas: options?.maxPriorityFeePerGas,
      value: options?.value,
      nonce: options?.nonce
    });

    const receipt = await tx.wait();

    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      blockHash: receipt.blockHash,
      status: receipt.status === 1 ? 'success' : 'failed',
      gasUsed: receipt.gasUsed,
      effectiveGasPrice: receipt.gasPrice,
      logs: receipt.logs,
      events: this.parseEvents(receipt.logs, contract.abi)
    };
  }

  async multicall(calls: ContractCall[]): Promise<MulticallResult[]> {
    const multicallContract = new ethers.Contract(
      this.multicallAddress,
      Multicall3ABI,
      calls[0].contract.provider
    );

    const encodedCalls = calls.map(call => ({
      target: call.contract.address,
      allowFailure: true,
      callData: this.encodeFunction(call.contract, call.method, call.args)
    }));

    const results = await multicallContract.aggregate3(encodedCalls);

    return results.map((result: any, index: number) => {
      if (result.success) {
        const iface = new ethers.Interface(calls[index].contract.abi);
        const decoded = iface.decodeFunctionResult(calls[index].method, result.returnData);
        return {
          success: true,
          returnData: decoded.length === 1 ? decoded[0] : decoded
        };
      }
      return {
        success: false,
        returnData: null,
        error: 'Call failed'
      };
    });
  }

  async estimateGas(contract: ContractInstance, method: string, args: unknown[] = []): Promise<bigint> {
    const ethersContract = new ethers.Contract(contract.address, contract.abi, contract.provider);
    return ethersContract[method].estimateGas(...args);
  }

  encodeFunction(contract: ContractInstance, method: string, args: unknown[] = []): string {
    const iface = new ethers.Interface(contract.abi);
    return iface.encodeFunctionData(method, args);
  }

  decodeFunction(contract: ContractInstance, method: string, data: string): unknown[] {
    const iface = new ethers.Interface(contract.abi);
    const result = iface.decodeFunctionResult(method, data);
    return Array.from(result);
  }

  private parseEvents(logs: ethers.Log[], abi: ethers.InterfaceAbi): ParsedEvent[] {
    const iface = new ethers.Interface(abi);
    const events: ParsedEvent[] = [];

    for (const log of logs) {
      try {
        const parsed = iface.parseLog({ topics: log.topics as string[], data: log.data });
        if (parsed) {
          events.push({
            eventName: parsed.name,
            args: Object.fromEntries(
              parsed.fragment.inputs.map((input, i) => [input.name, parsed.args[i]])
            ),
            blockNumber: log.blockNumber,
            blockHash: log.blockHash,
            transactionHash: log.transactionHash,
            logIndex: log.index,
            address: log.address
          });
        }
      } catch {
        // Skip logs that don't match the ABI
      }
    }

    return events;
  }
}
```


### Event Listening Implementation

```typescript
class EventListeningServiceImpl implements EventListeningService {
  private subscriptions: Map<string, EventSubscription> = new Map();
  private provider: ethers.Provider;

  constructor(provider: ethers.Provider) {
    this.provider = provider;
  }

  subscribe(contract: ContractInstance, eventName: string, filter?: EventFilter): EventSubscription {
    const subscriptionId = crypto.randomUUID();
    const ethersContract = new ethers.Contract(contract.address, contract.abi, contract.provider);
    const eventEmitter = new EventEmitter();

    const eventFilter = ethersContract.filters[eventName]?.(...(filter?.topics ?? []));
    
    const listener = (...args: unknown[]) => {
      const event = args[args.length - 1] as ethers.EventLog;
      const parsedEvent: ParsedEvent = {
        eventName,
        args: this.parseEventArgs(event, contract.abi, eventName),
        blockNumber: event.blockNumber,
        blockHash: event.blockHash,
        transactionHash: event.transactionHash,
        logIndex: event.index,
        address: event.address
      };
      eventEmitter.emit('event', parsedEvent);
    };

    ethersContract.on(eventFilter, listener);

    const subscription: EventSubscription = {
      id: subscriptionId,
      contractAddress: contract.address,
      eventName,
      onEvent: (callback) => eventEmitter.on('event', callback),
      onError: (callback) => eventEmitter.on('error', callback),
      unsubscribe: () => {
        ethersContract.off(eventFilter, listener);
        this.subscriptions.delete(subscriptionId);
      }
    };

    this.subscriptions.set(subscriptionId, subscription);
    return subscription;
  }

  subscribeAll(contract: ContractInstance, filter?: EventFilter): EventSubscription {
    const subscriptionId = crypto.randomUUID();
    const ethersContract = new ethers.Contract(contract.address, contract.abi, contract.provider);
    const eventEmitter = new EventEmitter();

    const listener = (event: ethers.EventLog) => {
      try {
        const iface = new ethers.Interface(contract.abi);
        const parsed = iface.parseLog({ topics: event.topics as string[], data: event.data });
        
        if (parsed) {
          const parsedEvent: ParsedEvent = {
            eventName: parsed.name,
            args: Object.fromEntries(
              parsed.fragment.inputs.map((input, i) => [input.name, parsed.args[i]])
            ),
            blockNumber: event.blockNumber,
            blockHash: event.blockHash,
            transactionHash: event.transactionHash,
            logIndex: event.index,
            address: event.address
          };
          eventEmitter.emit('event', parsedEvent);
        }
      } catch (error) {
        eventEmitter.emit('error', error);
      }
    };

    ethersContract.on('*', listener);

    const subscription: EventSubscription = {
      id: subscriptionId,
      contractAddress: contract.address,
      eventName: '*',
      onEvent: (callback) => eventEmitter.on('event', callback),
      onError: (callback) => eventEmitter.on('error', callback),
      unsubscribe: () => {
        ethersContract.off('*', listener);
        this.subscriptions.delete(subscriptionId);
      }
    };

    this.subscriptions.set(subscriptionId, subscription);
    return subscription;
  }

  async getHistoricalEvents(
    contract: ContractInstance,
    eventName: string,
    options: HistoricalEventOptions
  ): Promise<ParsedEvent[]> {
    const ethersContract = new ethers.Contract(contract.address, contract.abi, contract.provider);
    const eventFilter = ethersContract.filters[eventName]?.();
    
    const events: ParsedEvent[] = [];
    const batchSize = options.batchSize ?? 10000;
    
    let fromBlock = options.fromBlock;
    const toBlock = options.toBlock === 'latest' 
      ? await this.provider.getBlockNumber() 
      : options.toBlock;

    while (fromBlock <= toBlock) {
      const endBlock = Math.min(fromBlock + batchSize - 1, toBlock);
      
      const logs = await ethersContract.queryFilter(eventFilter, fromBlock, endBlock);
      
      for (const log of logs) {
        events.push({
          eventName,
          args: this.parseEventArgs(log, contract.abi, eventName),
          blockNumber: log.blockNumber,
          blockHash: log.blockHash,
          transactionHash: log.transactionHash,
          logIndex: log.index,
          address: log.address
        });
      }
      
      fromBlock = endBlock + 1;
    }

    return events;
  }

  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.unsubscribe();
    }
  }

  unsubscribeAll(): void {
    for (const subscription of this.subscriptions.values()) {
      subscription.unsubscribe();
    }
    this.subscriptions.clear();
  }

  private parseEventArgs(event: ethers.EventLog, abi: ethers.InterfaceAbi, eventName: string): Record<string, unknown> {
    const iface = new ethers.Interface(abi);
    const eventFragment = iface.getEvent(eventName);
    
    if (!eventFragment) return {};

    const decoded = iface.decodeEventLog(eventFragment, event.data, event.topics);
    return Object.fromEntries(
      eventFragment.inputs.map((input, i) => [input.name, decoded[i]])
    );
  }
}
```

## Integration Points

### Hardhat Integration

```typescript
import { HardhatRuntimeEnvironment } from 'hardhat/types';

class HardhatDeploymentAdapter {
  private hre: HardhatRuntimeEnvironment;

  constructor(hre: HardhatRuntimeEnvironment) {
    this.hre = hre;
  }

  async deployContract(contractName: string, args: unknown[]): Promise<DeployedContract> {
    const Contract = await this.hre.ethers.getContractFactory(contractName);
    const contract = await Contract.deploy(...args);
    await contract.waitForDeployment();

    const artifact = await this.hre.artifacts.readArtifact(contractName);
    const [deployer] = await this.hre.ethers.getSigners();
    const network = await this.hre.ethers.provider.getNetwork();

    return {
      address: await contract.getAddress(),
      deploymentTx: contract.deploymentTransaction()!.hash,
      blockNumber: (await contract.deploymentTransaction()!.wait())!.blockNumber,
      deployer: deployer.address,
      chainId: Number(network.chainId),
      artifact: {
        contractName: artifact.contractName,
        abi: artifact.abi,
        bytecode: artifact.bytecode,
        deployedBytecode: artifact.deployedBytecode,
        sourceName: artifact.sourceName
      }
    };
  }

  async upgradeProxy(proxyAddress: string, newContractName: string): Promise<UpgradeResult> {
    const { upgrades } = this.hre;
    const NewContract = await this.hre.ethers.getContractFactory(newContractName);
    
    const previousImpl = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    const upgraded = await upgrades.upgradeProxy(proxyAddress, NewContract);
    await upgraded.waitForDeployment();
    
    const newImpl = await upgrades.erc1967.getImplementationAddress(proxyAddress);

    return {
      proxyAddress,
      previousImplementation: previousImpl,
      newImplementation: newImpl,
      transactionHash: upgraded.deploymentTransaction()!.hash,
      blockNumber: (await upgraded.deploymentTransaction()!.wait())!.blockNumber
    };
  }
}
```

### Foundry Integration

```typescript
class FoundryDeploymentAdapter {
  private rpcUrl: string;
  private privateKey: string;

  constructor(rpcUrl: string, privateKey: string) {
    this.rpcUrl = rpcUrl;
    this.privateKey = privateKey;
  }

  async deployContract(contractPath: string, args: string[]): Promise<DeployedContract> {
    const { execSync } = require('child_process');
    
    const argsString = args.map(arg => `--constructor-args ${arg}`).join(' ');
    const command = `forge create ${contractPath} --rpc-url ${this.rpcUrl} --private-key ${this.privateKey} ${argsString} --json`;
    
    const output = execSync(command, { encoding: 'utf-8' });
    const result = JSON.parse(output);

    return {
      address: result.deployedTo,
      deploymentTx: result.transactionHash,
      blockNumber: result.blockNumber,
      deployer: result.deployer,
      chainId: await this.getChainId(),
      artifact: await this.loadArtifact(contractPath)
    };
  }

  async verifyContract(address: string, contractPath: string, args: string[]): Promise<VerificationResult> {
    const { execSync } = require('child_process');
    
    const argsString = args.join(' ');
    const command = `forge verify-contract ${address} ${contractPath} --constructor-args ${argsString} --chain-id ${await this.getChainId()}`;
    
    try {
      execSync(command, { encoding: 'utf-8' });
      return { success: true, guid: '', message: 'Verification successful' };
    } catch (error) {
      return { success: false, guid: '', message: (error as Error).message };
    }
  }
}
```

## Security Considerations

### Contract Interaction Security
- Validate all input parameters before contract calls
- Implement reentrancy guards for state-changing operations
- Use safe math operations (built into Solidity 0.8+)
- Implement access control for privileged functions
- Validate return values from external calls

### Deployment Security
- Use deterministic deployment addresses when possible
- Verify contract source code on block explorers
- Implement timelock for critical upgrades
- Use multi-sig wallets for admin operations
- Audit contracts before mainnet deployment

### Upgrade Security
- Validate storage layout compatibility before upgrades
- Implement upgrade authorization checks
- Use transparent proxy pattern for admin separation
- Test upgrades thoroughly on testnets
- Implement emergency pause functionality

## Compliance Guidelines

- Implement contract verification for transparency
- Maintain deployment records for audit trails
- Follow security best practices (OpenZeppelin standards)
- Implement access control for regulatory compliance
- Support contract pausing for emergency situations

## Testing Considerations

### Property-Based Tests

```typescript
describe('Smart Contract Properties', () => {
  it('should encode and decode function calls correctly', () => {
    fc.assert(fc.property(
      fc.array(fc.oneof(fc.string(), fc.bigInt(), fc.boolean()), { minLength: 0, maxLength: 5 }),
      async (args) => {
        const service = new ContractInteractionServiceImpl();
        const contract: ContractInstance = {
          address: '0x...',
          abi: TestContractABI,
          provider: mockProvider
        };

        const encoded = service.encodeFunction(contract, 'testFunction', args);
        const decoded = service.decodeFunction(contract, 'testFunction', encoded);
        
        // Round-trip should preserve data
        expect(decoded).toEqual(args);
      }
    ));
  });

  it('should maintain event subscription consistency', () => {
    fc.assert(fc.property(
      fc.array(fc.constantFrom('subscribe', 'unsubscribe'), { minLength: 1, maxLength: 10 }),
      async (operations) => {
        const service = new EventListeningServiceImpl(mockProvider);
        const subscriptionIds: string[] = [];

        for (const op of operations) {
          if (op === 'subscribe') {
            const sub = service.subscribe(mockContract, 'Transfer');
            subscriptionIds.push(sub.id);
          } else if (subscriptionIds.length > 0) {
            const id = subscriptionIds.pop()!;
            service.unsubscribe(id);
          }
        }

        // All remaining subscriptions should be valid
        service.unsubscribeAll();
      }
    ));
  });
});
```
