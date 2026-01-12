# Wallet Integration Template

## Purpose

This template provides comprehensive patterns for implementing Web3 wallet connections, transaction signing, multi-wallet support, and wallet management in decentralized applications. It covers integration with popular wallet providers like MetaMask, WalletConnect, Coinbase Wallet, and hardware wallets.

## Context

Wallet integration is the foundation of Web3 applications, enabling users to authenticate, sign transactions, and interact with blockchain networks. Modern dApps must support multiple wallet providers, handle network switching, manage connection states, and provide secure transaction signing while maintaining excellent user experience across different wallet types and blockchain networks.

## Core Components

### Wallet Connection Service

## Examples

```typescript
interface WalletConnectionService {
  connect(provider: WalletProvider, options?: ConnectionOptions): Promise<WalletConnection>;
  disconnect(): Promise<void>;
  switchNetwork(chainId: number): Promise<void>;
  getConnectedWallet(): WalletConnection | null;
  isConnected(): boolean;
  onAccountChange(callback: (accounts: string[]) => void): void;
  onChainChange(callback: (chainId: number) => void): void;
  onDisconnect(callback: () => void): void;
}


interface WalletConnection {
  address: string;
  chainId: number;
  provider: WalletProvider;
  signer: ethers.Signer;
  isConnected: boolean;
  balance: bigint;
  ensName?: string;
}

enum WalletProvider {
  METAMASK = 'metamask',
  WALLETCONNECT = 'walletconnect',
  COINBASE_WALLET = 'coinbase_wallet',
  RAINBOW = 'rainbow',
  TRUST_WALLET = 'trust_wallet',
  LEDGER = 'ledger',
  TREZOR = 'trezor',
  SAFE = 'safe',
  INJECTED = 'injected'
}

interface ConnectionOptions {
  chainId?: number;
  autoConnect?: boolean;
  persistConnection?: boolean;
  requiredChains?: number[];
  optionalChains?: number[];
}
```

### Transaction Signing Service

```typescript
interface TransactionSigningService {
  signTransaction(tx: TransactionRequest): Promise<SignedTransaction>;
  signMessage(message: string): Promise<string>;
  signTypedData(domain: TypedDataDomain, types: TypedDataTypes, value: Record<string, unknown>): Promise<string>;
  sendTransaction(tx: TransactionRequest): Promise<TransactionResponse>;
  estimateGas(tx: TransactionRequest): Promise<bigint>;
  getGasPrice(): Promise<GasPrice>;
}

interface TransactionRequest {
  to: string;
  value?: bigint;
  data?: string;
  gasLimit?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  nonce?: number;
}

interface SignedTransaction {
  rawTransaction: string;
  hash: string;
  from: string;
  to: string;
  value: bigint;
  signature: TransactionSignature;
}

interface TransactionSignature {
  r: string;
  s: string;
  v: number;
}

interface GasPrice {
  slow: bigint;
  standard: bigint;
  fast: bigint;
  instant: bigint;
  baseFee: bigint;
}
```

### Multi-Wallet Manager

```typescript
interface MultiWalletManager {
  addWallet(connection: WalletConnection): void;
  removeWallet(address: string): void;
  setActiveWallet(address: string): void;
  getActiveWallet(): WalletConnection | null;
  getAllWallets(): WalletConnection[];
  getWalletByAddress(address: string): WalletConnection | null;
  syncWalletBalances(): Promise<void>;
}

interface WalletState {
  wallets: WalletConnection[];
  activeWallet: string | null;
  isConnecting: boolean;
  error: WalletError | null;
  lastConnectedProvider: WalletProvider | null;
}

interface WalletError {
  code: WalletErrorCode;
  message: string;
  provider?: WalletProvider;
  originalError?: Error;
}

enum WalletErrorCode {
  USER_REJECTED = 'user_rejected',
  CHAIN_NOT_SUPPORTED = 'chain_not_supported',
  PROVIDER_NOT_FOUND = 'provider_not_found',
  CONNECTION_FAILED = 'connection_failed',
  SIGNATURE_FAILED = 'signature_failed',
  INSUFFICIENT_FUNDS = 'insufficient_funds',
  NETWORK_ERROR = 'network_error'
}
```


### Network Configuration

```typescript
interface NetworkConfiguration {
  chainId: number;
  name: string;
  network: string;
  nativeCurrency: NativeCurrency;
  rpcUrls: string[];
  blockExplorerUrls: string[];
  iconUrl?: string;
  isTestnet: boolean;
}

interface NativeCurrency {
  name: string;
  symbol: string;
  decimals: number;
}

const SUPPORTED_NETWORKS: Record<number, NetworkConfiguration> = {
  1: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    network: 'mainnet',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://eth.llamarpc.com'],
    blockExplorerUrls: ['https://etherscan.io'],
    isTestnet: false
  },
  137: {
    chainId: 137,
    name: 'Polygon',
    network: 'polygon',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://polygon-rpc.com'],
    blockExplorerUrls: ['https://polygonscan.com'],
    isTestnet: false
  },
  42161: {
    chainId: 42161,
    name: 'Arbitrum One',
    network: 'arbitrum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://arbiscan.io'],
    isTestnet: false
  }
};
```

## Implementation Patterns

### Universal Wallet Connector

```typescript
class UniversalWalletConnector implements WalletConnectionService {
  private connection: WalletConnection | null = null;
  private provider: ethers.BrowserProvider | null = null;
  private eventEmitter: EventEmitter = new EventEmitter();

  async connect(walletProvider: WalletProvider, options?: ConnectionOptions): Promise<WalletConnection> {
    try {
      const ethereumProvider = await this.getEthereumProvider(walletProvider, options);
      
      // Request account access
      const accounts = await ethereumProvider.request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) {
        throw new WalletConnectionError(WalletErrorCode.CONNECTION_FAILED, 'No accounts found');
      }

      // Get chain ID
      const chainIdHex = await ethereumProvider.request({ method: 'eth_chainId' });
      const chainId = parseInt(chainIdHex, 16);

      // Validate chain if required
      if (options?.requiredChains && !options.requiredChains.includes(chainId)) {
        await this.switchNetwork(options.requiredChains[0]);
      }

      // Create ethers provider and signer
      this.provider = new ethers.BrowserProvider(ethereumProvider);
      const signer = await this.provider.getSigner();
      const balance = await this.provider.getBalance(accounts[0]);

      // Resolve ENS name if on mainnet
      let ensName: string | undefined;
      if (chainId === 1) {
        ensName = await this.provider.lookupAddress(accounts[0]) || undefined;
      }

      this.connection = {
        address: accounts[0],
        chainId,
        provider: walletProvider,
        signer,
        isConnected: true,
        balance,
        ensName
      };

      // Set up event listeners
      this.setupEventListeners(ethereumProvider);

      // Persist connection if requested
      if (options?.persistConnection) {
        this.persistConnection(walletProvider);
      }

      return this.connection;
    } catch (error) {
      throw this.handleConnectionError(error, walletProvider);
    }
  }

  private async getEthereumProvider(walletProvider: WalletProvider, options?: ConnectionOptions): Promise<any> {
    switch (walletProvider) {
      case WalletProvider.METAMASK:
        return this.getMetaMaskProvider();
      case WalletProvider.WALLETCONNECT:
        return this.getWalletConnectProvider(options);
      case WalletProvider.COINBASE_WALLET:
        return this.getCoinbaseProvider(options);
      case WalletProvider.INJECTED:
        return this.getInjectedProvider();
      default:
        throw new WalletConnectionError(WalletErrorCode.PROVIDER_NOT_FOUND, `Provider ${walletProvider} not supported`);
    }
  }

  private getMetaMaskProvider(): any {
    if (typeof window !== 'undefined' && window.ethereum?.isMetaMask) {
      return window.ethereum;
    }
    throw new WalletConnectionError(WalletErrorCode.PROVIDER_NOT_FOUND, 'MetaMask not installed');
  }

  private async getWalletConnectProvider(options?: ConnectionOptions): Promise<any> {
    const { EthereumProvider } = await import('@walletconnect/ethereum-provider');
    
    return EthereumProvider.init({
      projectId: process.env.WALLETCONNECT_PROJECT_ID!,
      chains: options?.requiredChains || [1],
      optionalChains: options?.optionalChains || [137, 42161, 10],
      showQrModal: true
    });
  }

  async disconnect(): Promise<void> {
    if (this.connection?.provider === WalletProvider.WALLETCONNECT) {
      // WalletConnect requires explicit disconnect
      await (this.provider as any)?.disconnect?.();
    }
    
    this.connection = null;
    this.provider = null;
    this.clearPersistedConnection();
    this.eventEmitter.emit('disconnect');
  }

  async switchNetwork(chainId: number): Promise<void> {
    if (!this.provider) {
      throw new WalletConnectionError(WalletErrorCode.CONNECTION_FAILED, 'Not connected');
    }

    const network = SUPPORTED_NETWORKS[chainId];
    if (!network) {
      throw new WalletConnectionError(WalletErrorCode.CHAIN_NOT_SUPPORTED, `Chain ${chainId} not supported`);
    }

    try {
      await window.ethereum?.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }]
      });
    } catch (switchError: any) {
      // Chain not added, try to add it
      if (switchError.code === 4902) {
        await window.ethereum?.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${chainId.toString(16)}`,
            chainName: network.name,
            nativeCurrency: network.nativeCurrency,
            rpcUrls: network.rpcUrls,
            blockExplorerUrls: network.blockExplorerUrls
          }]
        });
      } else {
        throw switchError;
      }
    }
  }

  private setupEventListeners(ethereumProvider: any): void {
    ethereumProvider.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        this.disconnect();
      } else if (this.connection) {
        this.connection.address = accounts[0];
        this.eventEmitter.emit('accountChange', accounts);
      }
    });

    ethereumProvider.on('chainChanged', (chainIdHex: string) => {
      const chainId = parseInt(chainIdHex, 16);
      if (this.connection) {
        this.connection.chainId = chainId;
        this.eventEmitter.emit('chainChange', chainId);
      }
    });

    ethereumProvider.on('disconnect', () => {
      this.disconnect();
    });
  }

  getConnectedWallet(): WalletConnection | null {
    return this.connection;
  }

  isConnected(): boolean {
    return this.connection?.isConnected ?? false;
  }

  onAccountChange(callback: (accounts: string[]) => void): void {
    this.eventEmitter.on('accountChange', callback);
  }

  onChainChange(callback: (chainId: number) => void): void {
    this.eventEmitter.on('chainChange', callback);
  }

  onDisconnect(callback: () => void): void {
    this.eventEmitter.on('disconnect', callback);
  }

  private persistConnection(provider: WalletProvider): void {
    localStorage.setItem('wallet_provider', provider);
  }

  private clearPersistedConnection(): void {
    localStorage.removeItem('wallet_provider');
  }

  private handleConnectionError(error: any, provider: WalletProvider): WalletConnectionError {
    if (error.code === 4001) {
      return new WalletConnectionError(WalletErrorCode.USER_REJECTED, 'User rejected connection', provider);
    }
    return new WalletConnectionError(WalletErrorCode.CONNECTION_FAILED, error.message, provider);
  }
}
```


### Transaction Signing Implementation

```typescript
class TransactionSigningServiceImpl implements TransactionSigningService {
  private signer: ethers.Signer;
  private provider: ethers.Provider;

  constructor(signer: ethers.Signer, provider: ethers.Provider) {
    this.signer = signer;
    this.provider = provider;
  }

  async signTransaction(tx: TransactionRequest): Promise<SignedTransaction> {
    const populatedTx = await this.populateTransaction(tx);
    const signedTx = await this.signer.signTransaction(populatedTx);
    const parsedTx = ethers.Transaction.from(signedTx);

    return {
      rawTransaction: signedTx,
      hash: parsedTx.hash!,
      from: await this.signer.getAddress(),
      to: tx.to,
      value: tx.value || 0n,
      signature: {
        r: parsedTx.signature!.r,
        s: parsedTx.signature!.s,
        v: parsedTx.signature!.v
      }
    };
  }

  async signMessage(message: string): Promise<string> {
    return this.signer.signMessage(message);
  }

  async signTypedData(
    domain: TypedDataDomain,
    types: TypedDataTypes,
    value: Record<string, unknown>
  ): Promise<string> {
    // Remove EIP712Domain from types if present (ethers handles it)
    const { EIP712Domain, ...typesWithoutDomain } = types as any;
    return (this.signer as ethers.Signer).signTypedData(domain, typesWithoutDomain, value);
  }

  async sendTransaction(tx: TransactionRequest): Promise<TransactionResponse> {
    const populatedTx = await this.populateTransaction(tx);
    const response = await this.signer.sendTransaction(populatedTx);
    
    return {
      hash: response.hash,
      from: response.from,
      to: response.to!,
      value: response.value,
      nonce: response.nonce,
      gasLimit: response.gasLimit,
      data: response.data,
      chainId: response.chainId,
      wait: async (confirmations?: number) => {
        const receipt = await response.wait(confirmations);
        return {
          status: receipt?.status === 1 ? 'success' : 'failed',
          blockNumber: receipt?.blockNumber,
          gasUsed: receipt?.gasUsed,
          transactionHash: receipt?.hash
        };
      }
    };
  }

  async estimateGas(tx: TransactionRequest): Promise<bigint> {
    return this.provider.estimateGas({
      from: await this.signer.getAddress(),
      to: tx.to,
      value: tx.value,
      data: tx.data
    });
  }

  async getGasPrice(): Promise<GasPrice> {
    const feeData = await this.provider.getFeeData();
    const baseFee = feeData.gasPrice || 0n;

    return {
      slow: baseFee * 90n / 100n,
      standard: baseFee,
      fast: baseFee * 120n / 100n,
      instant: baseFee * 150n / 100n,
      baseFee
    };
  }

  private async populateTransaction(tx: TransactionRequest): Promise<ethers.TransactionRequest> {
    const from = await this.signer.getAddress();
    const nonce = tx.nonce ?? await this.provider.getTransactionCount(from);
    const gasLimit = tx.gasLimit ?? await this.estimateGas(tx);
    const feeData = await this.provider.getFeeData();

    return {
      from,
      to: tx.to,
      value: tx.value,
      data: tx.data,
      nonce,
      gasLimit,
      maxFeePerGas: tx.maxFeePerGas ?? feeData.maxFeePerGas,
      maxPriorityFeePerGas: tx.maxPriorityFeePerGas ?? feeData.maxPriorityFeePerGas
    };
  }
}
```

## Integration Points

### React Hook Integration

```typescript
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

interface WalletContextType {
  connection: WalletConnection | null;
  isConnecting: boolean;
  error: WalletError | null;
  connect: (provider: WalletProvider) => Promise<void>;
  disconnect: () => Promise<void>;
  switchNetwork: (chainId: number) => Promise<void>;
  signMessage: (message: string) => Promise<string>;
  sendTransaction: (tx: TransactionRequest) => Promise<TransactionResponse>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connection, setConnection] = useState<WalletConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<WalletError | null>(null);
  
  const walletService = useMemo(() => new UniversalWalletConnector(), []);
  const signingService = useMemo(() => 
    connection ? new TransactionSigningServiceImpl(connection.signer, connection.signer.provider!) : null,
    [connection]
  );

  const connect = useCallback(async (provider: WalletProvider) => {
    setIsConnecting(true);
    setError(null);
    try {
      const conn = await walletService.connect(provider, { persistConnection: true });
      setConnection(conn);
    } catch (err) {
      setError(err as WalletError);
    } finally {
      setIsConnecting(false);
    }
  }, [walletService]);

  const disconnect = useCallback(async () => {
    await walletService.disconnect();
    setConnection(null);
  }, [walletService]);

  const switchNetwork = useCallback(async (chainId: number) => {
    await walletService.switchNetwork(chainId);
  }, [walletService]);

  const signMessage = useCallback(async (message: string) => {
    if (!signingService) throw new Error('Not connected');
    return signingService.signMessage(message);
  }, [signingService]);

  const sendTransaction = useCallback(async (tx: TransactionRequest) => {
    if (!signingService) throw new Error('Not connected');
    return signingService.sendTransaction(tx);
  }, [signingService]);

  // Auto-reconnect on mount
  useEffect(() => {
    const savedProvider = localStorage.getItem('wallet_provider') as WalletProvider;
    if (savedProvider) {
      connect(savedProvider);
    }
  }, [connect]);

  // Set up event listeners
  useEffect(() => {
    walletService.onAccountChange((accounts) => {
      if (connection && accounts[0]) {
        setConnection({ ...connection, address: accounts[0] });
      }
    });

    walletService.onChainChange((chainId) => {
      if (connection) {
        setConnection({ ...connection, chainId });
      }
    });

    walletService.onDisconnect(() => {
      setConnection(null);
    });
  }, [walletService, connection]);

  return (
    <WalletContext.Provider value={{
      connection,
      isConnecting,
      error,
      connect,
      disconnect,
      switchNetwork,
      signMessage,
      sendTransaction
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
}
```

### wagmi Integration

```typescript
import { createConfig, http } from 'wagmi';
import { mainnet, polygon, arbitrum, optimism } from 'wagmi/chains';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [mainnet, polygon, arbitrum, optimism],
  connectors: [
    injected(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!
    }),
    coinbaseWallet({
      appName: 'Your dApp Name'
    })
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http()
  }
});
```

## Security Considerations

### Transaction Security
- Always display transaction details to users before signing
- Implement transaction simulation to preview outcomes
- Validate recipient addresses against known scam addresses
- Set reasonable gas limits to prevent excessive fees
- Implement spending limits and approval management

### Wallet Security
- Never store private keys or seed phrases
- Use secure communication channels (HTTPS only)
- Implement session timeouts for inactive connections
- Validate all incoming messages and signatures
- Protect against phishing by verifying domain origins

### Signature Security
- Clearly display message content before signing
- Implement EIP-712 typed data signing for structured data
- Warn users about permit signatures and token approvals
- Track and display pending approvals

## Compliance Guidelines

- Implement wallet address verification for KYC requirements
- Support wallet screening against OFAC sanctions lists
- Maintain audit logs of all wallet interactions
- Implement transaction monitoring for AML compliance
- Support geographic restrictions based on wallet location

## Testing Considerations

### Property-Based Tests

```typescript
describe('Wallet Integration Properties', () => {
  it('should maintain connection state consistency', () => {
    fc.assert(fc.property(
      fc.constantFrom(...Object.values(WalletProvider)),
      async (provider) => {
        const service = new UniversalWalletConnector();
        
        // Before connection
        expect(service.isConnected()).toBe(false);
        expect(service.getConnectedWallet()).toBeNull();
        
        // After connection (mocked)
        // Connection state should be consistent
      }
    ));
  });

  it('should handle network switching correctly', () => {
    fc.assert(fc.property(
      fc.constantFrom(1, 137, 42161, 10),
      async (chainId) => {
        const service = new UniversalWalletConnector();
        // Network configuration should exist for supported chains
        expect(SUPPORTED_NETWORKS[chainId]).toBeDefined();
      }
    ));
  });
});
```
