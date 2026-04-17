# Cross-Chain Template

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

This template provides comprehensive patterns for implementing cross-chain functionality including bridge protocols, multi-chain support, cross-chain asset transfers, and interoperability solutions. It covers messaging protocols, liquidity bridges, and cross-chain application development.

## Context

Cross-chain interoperability enables assets and data to move between different blockchain networks, expanding the reach and utility of decentralized applications. Modern cross-chain systems must handle complex operations like asset bridging, message passing, liquidity management, and security verification while maintaining trustlessness and protecting against bridge exploits.

## Core Components

### Bridge Service

## Examples

```typescript
interface BridgeService {
  bridge(params: BridgeParams): Promise<BridgeResult>;
  getBridgeQuote(params: BridgeQuoteParams): Promise<BridgeQuote>;
  getBridgeStatus(bridgeId: string): Promise<BridgeStatus>;
  getSupportedChains(): Promise<ChainInfo[]>;
  getSupportedTokens(sourceChain: number, destChain: number): Promise<BridgeToken[]>;
  estimateBridgeFee(params: BridgeQuoteParams): Promise<BridgeFee>;
}


interface BridgeParams {
  sourceChain: number;
  destChain: number;
  token: string;
  amount: bigint;
  recipient: string;
  slippageTolerance?: number;
}

interface BridgeQuoteParams {
  sourceChain: number;
  destChain: number;
  token: string;
  amount: bigint;
}

interface BridgeQuote {
  sourceChain: number;
  destChain: number;
  sourceToken: string;
  destToken: string;
  amountIn: bigint;
  amountOut: bigint;
  fee: BridgeFee;
  estimatedTime: number;
  route: BridgeRoute;
}

interface BridgeResult {
  bridgeId: string;
  sourceTransactionHash: string;
  sourceChain: number;
  destChain: number;
  amount: bigint;
  status: BridgeTransactionStatus;
  estimatedArrival: number;
}

interface BridgeStatus {
  bridgeId: string;
  status: BridgeTransactionStatus;
  sourceTransactionHash: string;
  destTransactionHash?: string;
  sourceConfirmations: number;
  requiredConfirmations: number;
  completedAt?: number;
}

enum BridgeTransactionStatus {
  PENDING = 'pending',
  SOURCE_CONFIRMED = 'source_confirmed',
  IN_TRANSIT = 'in_transit',
  DEST_PENDING = 'dest_pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

interface BridgeFee {
  protocolFee: bigint;
  gasFee: bigint;
  relayerFee: bigint;
  totalFee: bigint;
  feeToken: string;
}

interface BridgeRoute {
  protocol: BridgeProtocol;
  hops: BridgeHop[];
  estimatedTime: number;
}

interface BridgeHop {
  fromChain: number;
  toChain: number;
  protocol: BridgeProtocol;
  token: string;
}

enum BridgeProtocol {
  LAYERZERO = 'layerzero',
  AXELAR = 'axelar',
  WORMHOLE = 'wormhole',
  CCIP = 'ccip',
  STARGATE = 'stargate',
  HOP = 'hop',
  ACROSS = 'across',
  SYNAPSE = 'synapse'
}

interface ChainInfo {
  chainId: number;
  name: string;
  nativeCurrency: string;
  rpcUrl: string;
  explorerUrl: string;
  bridgeContracts: Record<BridgeProtocol, string>;
}

interface BridgeToken {
  address: string;
  symbol: string;
  decimals: number;
  bridgeAddress: string;
  minAmount: bigint;
  maxAmount: bigint;
}
```

### Cross-Chain Messaging Service

```typescript
interface CrossChainMessagingService {
  sendMessage(params: MessageParams): Promise<MessageResult>;
  getMessageStatus(messageId: string): Promise<MessageStatus>;
  estimateMessageFee(params: MessageParams): Promise<bigint>;
  retryMessage(messageId: string): Promise<MessageResult>;
}

interface MessageParams {
  destChain: number;
  destAddress: string;
  payload: string;
  gasLimit: bigint;
  refundAddress?: string;
}

interface MessageResult {
  messageId: string;
  transactionHash: string;
  sourceChain: number;
  destChain: number;
  status: MessageTransactionStatus;
}

interface MessageStatus {
  messageId: string;
  status: MessageTransactionStatus;
  sourceTransactionHash: string;
  destTransactionHash?: string;
  payload: string;
  error?: string;
}

enum MessageTransactionStatus {
  PENDING = 'pending',
  INFLIGHT = 'inflight',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  BLOCKED = 'blocked'
}
```

### Multi-Chain Account Service

```typescript
interface MultiChainAccountService {
  getBalances(account: string, chains: number[]): Promise<MultiChainBalance[]>;
  getTransactionHistory(account: string, chains: number[]): Promise<MultiChainTransaction[]>;
  getNFTs(account: string, chains: number[]): Promise<MultiChainNFT[]>;
  getTokenApprovals(account: string, chains: number[]): Promise<MultiChainApproval[]>;
}

interface MultiChainBalance {
  chainId: number;
  chainName: string;
  tokens: TokenBalance[];
  totalValueUSD: number;
}

interface TokenBalance {
  token: TokenInfo;
  balance: bigint;
  valueUSD: number;
}

interface MultiChainTransaction {
  chainId: number;
  hash: string;
  from: string;
  to: string;
  value: bigint;
  timestamp: number;
  status: 'success' | 'failed' | 'pending';
}

interface MultiChainNFT {
  chainId: number;
  collection: string;
  tokenId: bigint;
  name: string;
  image: string;
  metadata: NFTMetadata;
}

interface MultiChainApproval {
  chainId: number;
  token: string;
  spender: string;
  allowance: bigint;
  isUnlimited: boolean;
}
```

### Cross-Chain Swap Service

```typescript
interface CrossChainSwapService {
  getQuote(params: CrossChainSwapParams): Promise<CrossChainSwapQuote>;
  executeSwap(params: CrossChainSwapParams): Promise<CrossChainSwapResult>;
  getSwapStatus(swapId: string): Promise<CrossChainSwapStatus>;
}

interface CrossChainSwapParams {
  sourceChain: number;
  destChain: number;
  tokenIn: string;
  tokenOut: string;
  amountIn: bigint;
  slippageTolerance: number;
  recipient?: string;
}

interface CrossChainSwapQuote {
  sourceChain: number;
  destChain: number;
  tokenIn: string;
  tokenOut: string;
  amountIn: bigint;
  amountOut: bigint;
  priceImpact: number;
  route: CrossChainRoute;
  fees: CrossChainFees;
  estimatedTime: number;
}

interface CrossChainRoute {
  steps: RouteStep[];
  totalSteps: number;
}

interface RouteStep {
  type: 'swap' | 'bridge';
  chainId: number;
  protocol: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: bigint;
  amountOut: bigint;
}

interface CrossChainFees {
  swapFees: bigint;
  bridgeFees: bigint;
  gasFees: bigint;
  totalFees: bigint;
}

interface CrossChainSwapResult {
  swapId: string;
  sourceTransactionHash: string;
  status: CrossChainSwapStatus;
}

interface CrossChainSwapStatus {
  swapId: string;
  status: 'pending' | 'bridging' | 'swapping' | 'completed' | 'failed';
  currentStep: number;
  totalSteps: number;
  transactions: { chainId: number; hash: string; status: string }[];
}
```


## Implementation Patterns

### LayerZero Integration

```typescript
class LayerZeroBridgeService implements BridgeService, CrossChainMessagingService {
  private endpoint: ethers.Contract;
  private signer: ethers.Signer;
  private chainId: number;

  constructor(endpointAddress: string, signer: ethers.Signer, chainId: number) {
    this.endpoint = new ethers.Contract(endpointAddress, LayerZeroEndpointABI, signer);
    this.signer = signer;
    this.chainId = chainId;
  }

  async bridge(params: BridgeParams): Promise<BridgeResult> {
    const quote = await this.getBridgeQuote(params);
    
    // Get OFT contract for the token
    const oft = new ethers.Contract(params.token, OFTABI, this.signer);
    
    // Prepare send parameters
    const sendParam = {
      dstEid: this.getLayerZeroChainId(params.destChain),
      to: ethers.zeroPadValue(params.recipient, 32),
      amountLD: params.amount,
      minAmountLD: params.amount * BigInt(Math.floor((100 - (params.slippageTolerance || 0.5)) * 100)) / 10000n,
      extraOptions: '0x',
      composeMsg: '0x',
      oftCmd: '0x'
    };

    // Get messaging fee
    const [nativeFee] = await oft.quoteSend(sendParam, false);

    // Execute send
    const tx = await oft.send(sendParam, { nativeFee, lzTokenFee: 0n }, params.recipient, {
      value: nativeFee
    });

    const receipt = await tx.wait();
    const sentEvent = this.findEvent(receipt, 'OFTSent');

    return {
      bridgeId: sentEvent?.args?.guid || receipt.hash,
      sourceTransactionHash: receipt.hash,
      sourceChain: params.sourceChain,
      destChain: params.destChain,
      amount: params.amount,
      status: BridgeTransactionStatus.PENDING,
      estimatedArrival: Math.floor(Date.now() / 1000) + quote.estimatedTime
    };
  }

  async sendMessage(params: MessageParams): Promise<MessageResult> {
    const destEid = this.getLayerZeroChainId(params.destChain);
    
    // Estimate fee
    const fee = await this.estimateMessageFee(params);

    // Prepare options
    const options = this.buildOptions(params.gasLimit);

    // Send message
    const tx = await this.endpoint.send(
      { dstEid: destEid, receiver: ethers.zeroPadValue(params.destAddress, 32) },
      { guid: ethers.randomBytes(32), nonce: 0, srcEid: this.chainId, sender: await this.signer.getAddress() },
      params.payload,
      options,
      params.refundAddress || await this.signer.getAddress(),
      { value: fee }
    );

    const receipt = await tx.wait();
    const packetSentEvent = this.findEvent(receipt, 'PacketSent');

    return {
      messageId: packetSentEvent?.args?.guid || receipt.hash,
      transactionHash: receipt.hash,
      sourceChain: this.chainId,
      destChain: params.destChain,
      status: MessageTransactionStatus.PENDING
    };
  }

  async estimateMessageFee(params: MessageParams): Promise<bigint> {
    const destEid = this.getLayerZeroChainId(params.destChain);
    const options = this.buildOptions(params.gasLimit);

    const [nativeFee] = await this.endpoint.quote(
      { dstEid: destEid, receiver: ethers.zeroPadValue(params.destAddress, 32) },
      params.payload,
      options,
      false
    );

    return nativeFee;
  }

  private buildOptions(gasLimit: bigint): string {
    // Build executor options for LayerZero v2
    const optionsBuilder = new OptionsBuilder();
    optionsBuilder.addExecutorLzReceiveOption(gasLimit, 0n);
    return optionsBuilder.toHex();
  }

  private getLayerZeroChainId(evmChainId: number): number {
    const mapping: Record<number, number> = {
      1: 30101,      // Ethereum
      137: 30109,    // Polygon
      42161: 30110,  // Arbitrum
      10: 30111,     // Optimism
      43114: 30106,  // Avalanche
      56: 30102      // BSC
    };
    return mapping[evmChainId] || evmChainId;
  }
}
```

### Chainlink CCIP Integration

```typescript
class CCIPBridgeService implements BridgeService {
  private router: ethers.Contract;
  private signer: ethers.Signer;

  constructor(routerAddress: string, signer: ethers.Signer) {
    this.router = new ethers.Contract(routerAddress, CCIPRouterABI, signer);
    this.signer = signer;
  }

  async bridge(params: BridgeParams): Promise<BridgeResult> {
    const destChainSelector = this.getChainSelector(params.destChain);
    
    // Build CCIP message
    const message = {
      receiver: ethers.AbiCoder.defaultAbiCoder().encode(['address'], [params.recipient]),
      data: '0x',
      tokenAmounts: [{
        token: params.token,
        amount: params.amount
      }],
      feeToken: ethers.ZeroAddress, // Pay in native token
      extraArgs: this.buildExtraArgs()
    };

    // Get fee
    const fee = await this.router.getFee(destChainSelector, message);

    // Approve token
    const token = new ethers.Contract(params.token, ERC20ABI, this.signer);
    await token.approve(this.router.target, params.amount);

    // Send message
    const tx = await this.router.ccipSend(destChainSelector, message, { value: fee });
    const receipt = await tx.wait();

    const sentEvent = this.findEvent(receipt, 'CCIPSendRequested');

    return {
      bridgeId: sentEvent?.args?.messageId || receipt.hash,
      sourceTransactionHash: receipt.hash,
      sourceChain: params.sourceChain,
      destChain: params.destChain,
      amount: params.amount,
      status: BridgeTransactionStatus.PENDING,
      estimatedArrival: Math.floor(Date.now() / 1000) + 900 // ~15 minutes
    };
  }

  async getBridgeStatus(bridgeId: string): Promise<BridgeStatus> {
    // Query CCIP explorer API
    const response = await fetch(
      `https://ccip.chain.link/api/v1/messages/${bridgeId}`
    );
    const data = await response.json();

    return {
      bridgeId,
      status: this.mapCCIPStatus(data.state),
      sourceTransactionHash: data.sourceTransactionHash,
      destTransactionHash: data.destTransactionHash,
      sourceConfirmations: data.sourceConfirmations,
      requiredConfirmations: data.requiredConfirmations,
      completedAt: data.completedAt
    };
  }

  private getChainSelector(chainId: number): bigint {
    const selectors: Record<number, bigint> = {
      1: 5009297550715157269n,      // Ethereum
      137: 4051577828743386545n,    // Polygon
      42161: 4949039107694359620n,  // Arbitrum
      10: 3734403246176062136n,     // Optimism
      43114: 6433500567565415381n   // Avalanche
    };
    return selectors[chainId] || 0n;
  }

  private buildExtraArgs(): string {
    // Build extra args with gas limit
    return ethers.AbiCoder.defaultAbiCoder().encode(
      ['uint256'],
      [200000n] // Gas limit for destination execution
    );
  }

  private mapCCIPStatus(state: string): BridgeTransactionStatus {
    const mapping: Record<string, BridgeTransactionStatus> = {
      'pending': BridgeTransactionStatus.PENDING,
      'inflight': BridgeTransactionStatus.IN_TRANSIT,
      'success': BridgeTransactionStatus.COMPLETED,
      'failed': BridgeTransactionStatus.FAILED
    };
    return mapping[state] || BridgeTransactionStatus.PENDING;
  }
}
```

## Integration Points

### LI.FI Aggregator Integration

```typescript
class LiFiIntegration implements CrossChainSwapService {
  private apiUrl = 'https://li.quest/v1';

  async getQuote(params: CrossChainSwapParams): Promise<CrossChainSwapQuote> {
    const response = await fetch(`${this.apiUrl}/quote?` + new URLSearchParams({
      fromChain: params.sourceChain.toString(),
      toChain: params.destChain.toString(),
      fromToken: params.tokenIn,
      toToken: params.tokenOut,
      fromAmount: params.amountIn.toString(),
      fromAddress: params.recipient || '',
      slippage: (params.slippageTolerance / 100).toString()
    }));

    const data = await response.json();

    return {
      sourceChain: params.sourceChain,
      destChain: params.destChain,
      tokenIn: params.tokenIn,
      tokenOut: params.tokenOut,
      amountIn: params.amountIn,
      amountOut: BigInt(data.estimate.toAmount),
      priceImpact: data.estimate.priceImpact || 0,
      route: this.parseRoute(data.includedSteps),
      fees: this.parseFees(data.estimate),
      estimatedTime: data.estimate.executionDuration
    };
  }

  async executeSwap(params: CrossChainSwapParams): Promise<CrossChainSwapResult> {
    const quote = await this.getQuote(params);
    
    // Get transaction data from LI.FI
    const response = await fetch(`${this.apiUrl}/quote?` + new URLSearchParams({
      fromChain: params.sourceChain.toString(),
      toChain: params.destChain.toString(),
      fromToken: params.tokenIn,
      toToken: params.tokenOut,
      fromAmount: params.amountIn.toString(),
      fromAddress: params.recipient || '',
      slippage: (params.slippageTolerance / 100).toString()
    }));

    const data = await response.json();

    // Execute the transaction
    // Implementation depends on the specific route

    return {
      swapId: data.id,
      sourceTransactionHash: '',
      status: { swapId: data.id, status: 'pending', currentStep: 0, totalSteps: data.includedSteps.length, transactions: [] }
    };
  }
}
```

## Security Considerations

### Bridge Security
- Verify bridge contract addresses
- Monitor for bridge exploits and pauses
- Implement transaction limits
- Use multiple bridge protocols for redundancy
- Validate destination addresses

### Message Security
- Verify message authenticity
- Implement replay protection
- Validate payload integrity
- Monitor for malicious messages
- Implement rate limiting

### Cross-Chain Security
- Verify chain IDs and selectors
- Implement slippage protection
- Monitor for oracle manipulation
- Use trusted relayers
- Implement emergency pause

## Compliance Guidelines

- Implement cross-chain transaction monitoring
- Support multi-chain wallet screening
- Maintain audit trails across chains
- Implement geographic restrictions
- Support regulatory reporting

## Testing Considerations

### Property-Based Tests

```typescript
describe('Cross-Chain Properties', () => {
  it('should maintain asset conservation across bridges', () => {
    fc.assert(fc.property(
      fc.bigInt({ min: 1n, max: ethers.parseEther('1000') }),
      fc.constantFrom(1, 137, 42161, 10),
      async (amount, destChain) => {
        const service = new LayerZeroBridgeService(endpointAddress, mockSigner, 1);
        
        const quote = await service.getBridgeQuote({
          sourceChain: 1,
          destChain,
          token: tokenAddress,
          amount
        });

        // Output should be less than or equal to input (fees deducted)
        expect(quote.amountOut).toBeLessThanOrEqual(amount);
        
        // Fees should be positive
        expect(quote.fee.totalFee).toBeGreaterThan(0n);
      }
    ));
  });

  it('should correctly estimate message fees', () => {
    fc.assert(fc.property(
      fc.bigInt({ min: 100000n, max: 1000000n }),
      fc.constantFrom(137, 42161, 10),
      async (gasLimit, destChain) => {
        const service = new LayerZeroBridgeService(endpointAddress, mockSigner, 1);
        
        const fee = await service.estimateMessageFee({
          destChain,
          destAddress: '0x...',
          payload: '0x',
          gasLimit
        });

        // Fee should be positive
        expect(fee).toBeGreaterThan(0n);
      }
    ));
  });
});
```
