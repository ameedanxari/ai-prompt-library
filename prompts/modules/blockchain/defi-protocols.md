# DeFi Protocols Template

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

This template provides comprehensive patterns for implementing decentralized finance (DeFi) protocols including liquidity pools, automated market makers (AMMs), yield farming, lending protocols, and decentralized exchanges. It covers protocol design, smart contract integration, and risk management.

## Context

DeFi protocols enable permissionless financial services on blockchain networks, including trading, lending, borrowing, and yield generation. Modern DeFi applications must handle complex operations like liquidity provision, price discovery, collateralization, and reward distribution while maintaining security, capital efficiency, and composability with other protocols.

## Core Components

### Liquidity Pool Service

## Examples

```typescript
interface LiquidityPoolService {
  addLiquidity(pool: string, amounts: TokenAmount[], options?: LiquidityOptions): Promise<AddLiquidityResult>;
  removeLiquidity(pool: string, lpAmount: bigint, options?: RemoveLiquidityOptions): Promise<RemoveLiquidityResult>;
  getPoolInfo(pool: string): Promise<PoolInfo>;
  getPosition(pool: string, account: string): Promise<LiquidityPosition>;
  calculateOptimalAmounts(pool: string, amount0: bigint): Promise<OptimalAmounts>;
  estimateImpermanentLoss(pool: string, priceChange: number): Promise<ImpermanentLossEstimate>;
}


interface TokenAmount {
  token: string;
  amount: bigint;
}

interface LiquidityOptions {
  slippageTolerance: number;
  deadline: number;
  recipient?: string;
}

interface AddLiquidityResult {
  transactionHash: string;
  lpTokensReceived: bigint;
  amounts: TokenAmount[];
  poolShare: number;
}

interface RemoveLiquidityOptions {
  slippageTolerance: number;
  deadline: number;
  minAmounts?: TokenAmount[];
}

interface RemoveLiquidityResult {
  transactionHash: string;
  lpTokensBurned: bigint;
  tokensReceived: TokenAmount[];
}

interface PoolInfo {
  address: string;
  token0: TokenInfo;
  token1: TokenInfo;
  reserve0: bigint;
  reserve1: bigint;
  totalSupply: bigint;
  fee: number;
  protocol: DeFiProtocol;
  tvl: bigint;
  apr: number;
}

interface LiquidityPosition {
  lpBalance: bigint;
  poolShare: number;
  token0Amount: bigint;
  token1Amount: bigint;
  unclaimedFees: TokenAmount[];
  valueUSD: number;
}

interface OptimalAmounts {
  amount0: bigint;
  amount1: bigint;
  priceImpact: number;
}

interface ImpermanentLossEstimate {
  lossPercentage: number;
  holdValue: bigint;
  lpValue: bigint;
  feesEarned: bigint;
  netResult: bigint;
}

enum DeFiProtocol {
  UNISWAP_V2 = 'uniswap_v2',
  UNISWAP_V3 = 'uniswap_v3',
  SUSHISWAP = 'sushiswap',
  CURVE = 'curve',
  BALANCER = 'balancer',
  PANCAKESWAP = 'pancakeswap'
}
```

### Swap Service

```typescript
interface SwapService {
  getQuote(params: SwapParams): Promise<SwapQuote>;
  executeSwap(params: SwapParams): Promise<SwapResult>;
  getRoute(tokenIn: string, tokenOut: string, amount: bigint): Promise<SwapRoute>;
  getBestRoute(tokenIn: string, tokenOut: string, amount: bigint): Promise<SwapRoute[]>;
  estimateGas(params: SwapParams): Promise<bigint>;
}

interface SwapParams {
  tokenIn: string;
  tokenOut: string;
  amountIn?: bigint;
  amountOut?: bigint;
  slippageTolerance: number;
  deadline: number;
  recipient?: string;
  route?: SwapRoute;
}

interface SwapQuote {
  amountIn: bigint;
  amountOut: bigint;
  priceImpact: number;
  route: SwapRoute;
  gasEstimate: bigint;
  executionPrice: number;
  minimumReceived: bigint;
}

interface SwapResult {
  transactionHash: string;
  amountIn: bigint;
  amountOut: bigint;
  effectivePrice: number;
  gasUsed: bigint;
}

interface SwapRoute {
  path: string[];
  pools: string[];
  fees: number[];
  protocol: DeFiProtocol;
}
```

### Yield Farming Service

```typescript
interface YieldFarmingService {
  deposit(farm: string, amount: bigint): Promise<DepositResult>;
  withdraw(farm: string, amount: bigint): Promise<WithdrawResult>;
  harvest(farm: string): Promise<HarvestResult>;
  compound(farm: string): Promise<CompoundResult>;
  getFarmInfo(farm: string): Promise<FarmInfo>;
  getUserPosition(farm: string, account: string): Promise<FarmPosition>;
  calculateAPY(farm: string): Promise<APYBreakdown>;
}

interface FarmInfo {
  address: string;
  stakingToken: TokenInfo;
  rewardTokens: TokenInfo[];
  totalStaked: bigint;
  rewardRate: bigint;
  periodFinish: number;
  apr: number;
  apy: number;
  tvl: bigint;
  lockPeriod?: number;
}

interface FarmPosition {
  stakedAmount: bigint;
  pendingRewards: TokenAmount[];
  depositTime: number;
  unlockTime?: number;
  isLocked: boolean;
}

interface DepositResult {
  transactionHash: string;
  amountDeposited: bigint;
  newStakedBalance: bigint;
}

interface WithdrawResult {
  transactionHash: string;
  amountWithdrawn: bigint;
  rewardsClaimed: TokenAmount[];
}

interface HarvestResult {
  transactionHash: string;
  rewardsClaimed: TokenAmount[];
}

interface CompoundResult {
  transactionHash: string;
  rewardsCompounded: bigint;
  newStakedBalance: bigint;
}

interface APYBreakdown {
  baseAPR: number;
  rewardAPR: number;
  compoundingAPY: number;
  totalAPY: number;
  assumptions: string[];
}
```

### Lending Protocol Service

```typescript
interface LendingProtocolService {
  supply(market: string, amount: bigint): Promise<SupplyResult>;
  withdraw(market: string, amount: bigint): Promise<WithdrawResult>;
  borrow(market: string, amount: bigint): Promise<BorrowResult>;
  repay(market: string, amount: bigint): Promise<RepayResult>;
  getMarketInfo(market: string): Promise<MarketInfo>;
  getUserPosition(account: string): Promise<LendingPosition>;
  getHealthFactor(account: string): Promise<HealthFactor>;
  liquidate(borrower: string, repayAsset: string, collateralAsset: string, amount: bigint): Promise<LiquidationResult>;
}

interface MarketInfo {
  address: string;
  underlyingToken: TokenInfo;
  totalSupply: bigint;
  totalBorrow: bigint;
  supplyAPY: number;
  borrowAPY: number;
  utilizationRate: number;
  collateralFactor: number;
  liquidationThreshold: number;
  liquidationPenalty: number;
  reserveFactor: number;
}

interface LendingPosition {
  suppliedAssets: SuppliedAsset[];
  borrowedAssets: BorrowedAsset[];
  totalSupplyUSD: number;
  totalBorrowUSD: number;
  netAPY: number;
  healthFactor: number;
  availableToBorrow: bigint;
}

interface SuppliedAsset {
  token: TokenInfo;
  amount: bigint;
  valueUSD: number;
  apy: number;
  isCollateral: boolean;
}

interface BorrowedAsset {
  token: TokenInfo;
  amount: bigint;
  valueUSD: number;
  apy: number;
  interestAccrued: bigint;
}

interface HealthFactor {
  value: number;
  status: 'safe' | 'warning' | 'danger' | 'liquidatable';
  liquidationPrice: number;
  safetyBuffer: number;
}

interface SupplyResult {
  transactionHash: string;
  amountSupplied: bigint;
  aTokensReceived: bigint;
}

interface BorrowResult {
  transactionHash: string;
  amountBorrowed: bigint;
  newHealthFactor: number;
}

interface LiquidationResult {
  transactionHash: string;
  debtRepaid: bigint;
  collateralSeized: bigint;
  liquidationBonus: bigint;
}
```


## Implementation Patterns

### Uniswap V2 Style AMM Integration

```typescript
class UniswapV2Service implements LiquidityPoolService, SwapService {
  private router: ethers.Contract;
  private factory: ethers.Contract;
  private signer: ethers.Signer;

  constructor(routerAddress: string, factoryAddress: string, signer: ethers.Signer) {
    this.router = new ethers.Contract(routerAddress, UniswapV2RouterABI, signer);
    this.factory = new ethers.Contract(factoryAddress, UniswapV2FactoryABI, signer);
    this.signer = signer;
  }

  async addLiquidity(pool: string, amounts: TokenAmount[], options?: LiquidityOptions): Promise<AddLiquidityResult> {
    const [token0, token1] = await this.getPoolTokens(pool);
    const amount0 = amounts.find(a => a.token === token0)!.amount;
    const amount1 = amounts.find(a => a.token === token1)!.amount;

    // Approve tokens
    await this.approveToken(token0, this.router.target as string, amount0);
    await this.approveToken(token1, this.router.target as string, amount1);

    // Calculate minimum amounts with slippage
    const slippage = options?.slippageTolerance ?? 0.5;
    const minAmount0 = amount0 * BigInt(Math.floor((100 - slippage) * 100)) / 10000n;
    const minAmount1 = amount1 * BigInt(Math.floor((100 - slippage) * 100)) / 10000n;

    const deadline = options?.deadline ?? Math.floor(Date.now() / 1000) + 1200;
    const recipient = options?.recipient ?? await this.signer.getAddress();

    const tx = await this.router.addLiquidity(
      token0,
      token1,
      amount0,
      amount1,
      minAmount0,
      minAmount1,
      recipient,
      deadline
    );

    const receipt = await tx.wait();
    const mintEvent = this.findEvent(receipt, 'Mint');

    return {
      transactionHash: receipt.hash,
      lpTokensReceived: mintEvent?.args?.liquidity || 0n,
      amounts: [
        { token: token0, amount: mintEvent?.args?.amount0 || amount0 },
        { token: token1, amount: mintEvent?.args?.amount1 || amount1 }
      ],
      poolShare: await this.calculatePoolShare(pool, recipient)
    };
  }

  async getQuote(params: SwapParams): Promise<SwapQuote> {
    const route = params.route ?? await this.getRoute(params.tokenIn, params.tokenOut, params.amountIn!);
    
    const amounts = await this.router.getAmountsOut(params.amountIn, route.path);
    const amountOut = amounts[amounts.length - 1];

    // Calculate price impact
    const reserves = await this.getReserves(route.pools[0]);
    const priceImpact = this.calculatePriceImpact(params.amountIn!, reserves);

    // Calculate minimum received with slippage
    const minimumReceived = amountOut * BigInt(Math.floor((100 - params.slippageTolerance) * 100)) / 10000n;

    return {
      amountIn: params.amountIn!,
      amountOut,
      priceImpact,
      route,
      gasEstimate: await this.estimateGas(params),
      executionPrice: Number(amountOut) / Number(params.amountIn!),
      minimumReceived
    };
  }

  async executeSwap(params: SwapParams): Promise<SwapResult> {
    const quote = await this.getQuote(params);
    
    // Approve token if not ETH
    if (params.tokenIn !== ethers.ZeroAddress) {
      await this.approveToken(params.tokenIn, this.router.target as string, params.amountIn!);
    }

    const deadline = params.deadline ?? Math.floor(Date.now() / 1000) + 1200;
    const recipient = params.recipient ?? await this.signer.getAddress();

    let tx;
    if (params.tokenIn === ethers.ZeroAddress) {
      tx = await this.router.swapExactETHForTokens(
        quote.minimumReceived,
        quote.route.path,
        recipient,
        deadline,
        { value: params.amountIn }
      );
    } else if (params.tokenOut === ethers.ZeroAddress) {
      tx = await this.router.swapExactTokensForETH(
        params.amountIn,
        quote.minimumReceived,
        quote.route.path,
        recipient,
        deadline
      );
    } else {
      tx = await this.router.swapExactTokensForTokens(
        params.amountIn,
        quote.minimumReceived,
        quote.route.path,
        recipient,
        deadline
      );
    }

    const receipt = await tx.wait();
    const swapEvent = this.findEvent(receipt, 'Swap');

    return {
      transactionHash: receipt.hash,
      amountIn: params.amountIn!,
      amountOut: swapEvent?.args?.amountOut || quote.amountOut,
      effectivePrice: Number(swapEvent?.args?.amountOut || quote.amountOut) / Number(params.amountIn!),
      gasUsed: receipt.gasUsed
    };
  }

  async getRoute(tokenIn: string, tokenOut: string, amount: bigint): Promise<SwapRoute> {
    // Try direct pair first
    const directPair = await this.factory.getPair(tokenIn, tokenOut);
    if (directPair !== ethers.ZeroAddress) {
      return {
        path: [tokenIn, tokenOut],
        pools: [directPair],
        fees: [3000], // 0.3%
        protocol: DeFiProtocol.UNISWAP_V2
      };
    }

    // Try routing through WETH
    const weth = await this.router.WETH();
    const pair1 = await this.factory.getPair(tokenIn, weth);
    const pair2 = await this.factory.getPair(weth, tokenOut);

    if (pair1 !== ethers.ZeroAddress && pair2 !== ethers.ZeroAddress) {
      return {
        path: [tokenIn, weth, tokenOut],
        pools: [pair1, pair2],
        fees: [3000, 3000],
        protocol: DeFiProtocol.UNISWAP_V2
      };
    }

    throw new Error('No route found');
  }

  private calculatePriceImpact(amountIn: bigint, reserves: { reserve0: bigint; reserve1: bigint }): number {
    const k = reserves.reserve0 * reserves.reserve1;
    const newReserve0 = reserves.reserve0 + amountIn;
    const newReserve1 = k / newReserve0;
    const amountOut = reserves.reserve1 - newReserve1;
    
    const spotPrice = Number(reserves.reserve1) / Number(reserves.reserve0);
    const executionPrice = Number(amountOut) / Number(amountIn);
    
    return ((spotPrice - executionPrice) / spotPrice) * 100;
  }
}
```

### Aave-Style Lending Protocol Integration

```typescript
class AaveLendingService implements LendingProtocolService {
  private pool: ethers.Contract;
  private oracle: ethers.Contract;
  private signer: ethers.Signer;

  constructor(poolAddress: string, oracleAddress: string, signer: ethers.Signer) {
    this.pool = new ethers.Contract(poolAddress, AavePoolABI, signer);
    this.oracle = new ethers.Contract(oracleAddress, AaveOracleABI, signer);
    this.signer = signer;
  }

  async supply(market: string, amount: bigint): Promise<SupplyResult> {
    // Approve token
    await this.approveToken(market, this.pool.target as string, amount);

    const onBehalfOf = await this.signer.getAddress();
    const referralCode = 0;

    const tx = await this.pool.supply(market, amount, onBehalfOf, referralCode);
    const receipt = await tx.wait();

    const supplyEvent = this.findEvent(receipt, 'Supply');

    return {
      transactionHash: receipt.hash,
      amountSupplied: amount,
      aTokensReceived: supplyEvent?.args?.amount || amount
    };
  }

  async borrow(market: string, amount: bigint): Promise<BorrowResult> {
    const onBehalfOf = await this.signer.getAddress();
    const interestRateMode = 2; // Variable rate
    const referralCode = 0;

    // Check health factor before borrowing
    const healthBefore = await this.getHealthFactor(onBehalfOf);
    if (healthBefore.status === 'liquidatable') {
      throw new Error('Position is already liquidatable');
    }

    const tx = await this.pool.borrow(market, amount, interestRateMode, referralCode, onBehalfOf);
    const receipt = await tx.wait();

    const healthAfter = await this.getHealthFactor(onBehalfOf);

    return {
      transactionHash: receipt.hash,
      amountBorrowed: amount,
      newHealthFactor: healthAfter.value
    };
  }

  async getHealthFactor(account: string): Promise<HealthFactor> {
    const userData = await this.pool.getUserAccountData(account);
    const healthFactor = Number(userData.healthFactor) / 1e18;

    let status: 'safe' | 'warning' | 'danger' | 'liquidatable';
    if (healthFactor >= 2) {
      status = 'safe';
    } else if (healthFactor >= 1.5) {
      status = 'warning';
    } else if (healthFactor >= 1) {
      status = 'danger';
    } else {
      status = 'liquidatable';
    }

    return {
      value: healthFactor,
      status,
      liquidationPrice: this.calculateLiquidationPrice(userData),
      safetyBuffer: healthFactor - 1
    };
  }

  async liquidate(
    borrower: string,
    repayAsset: string,
    collateralAsset: string,
    amount: bigint
  ): Promise<LiquidationResult> {
    // Approve repay asset
    await this.approveToken(repayAsset, this.pool.target as string, amount);

    const receiveAToken = false;

    const tx = await this.pool.liquidationCall(
      collateralAsset,
      repayAsset,
      borrower,
      amount,
      receiveAToken
    );
    const receipt = await tx.wait();

    const liquidationEvent = this.findEvent(receipt, 'LiquidationCall');

    return {
      transactionHash: receipt.hash,
      debtRepaid: liquidationEvent?.args?.debtToCover || amount,
      collateralSeized: liquidationEvent?.args?.liquidatedCollateralAmount || 0n,
      liquidationBonus: this.calculateLiquidationBonus(liquidationEvent)
    };
  }

  async getUserPosition(account: string): Promise<LendingPosition> {
    const userData = await this.pool.getUserAccountData(account);
    const reserves = await this.getReservesList();

    const suppliedAssets: SuppliedAsset[] = [];
    const borrowedAssets: BorrowedAsset[] = [];

    for (const reserve of reserves) {
      const userReserveData = await this.pool.getUserReserveData(reserve, account);
      
      if (userReserveData.currentATokenBalance > 0n) {
        suppliedAssets.push({
          token: await this.getTokenInfo(reserve),
          amount: userReserveData.currentATokenBalance,
          valueUSD: await this.getValueUSD(reserve, userReserveData.currentATokenBalance),
          apy: await this.getSupplyAPY(reserve),
          isCollateral: userReserveData.usageAsCollateralEnabled
        });
      }

      if (userReserveData.currentVariableDebt > 0n) {
        borrowedAssets.push({
          token: await this.getTokenInfo(reserve),
          amount: userReserveData.currentVariableDebt,
          valueUSD: await this.getValueUSD(reserve, userReserveData.currentVariableDebt),
          apy: await this.getBorrowAPY(reserve),
          interestAccrued: userReserveData.currentVariableDebt - userReserveData.principalVariableDebt
        });
      }
    }

    const totalSupplyUSD = suppliedAssets.reduce((sum, a) => sum + a.valueUSD, 0);
    const totalBorrowUSD = borrowedAssets.reduce((sum, a) => sum + a.valueUSD, 0);

    return {
      suppliedAssets,
      borrowedAssets,
      totalSupplyUSD,
      totalBorrowUSD,
      netAPY: this.calculateNetAPY(suppliedAssets, borrowedAssets),
      healthFactor: Number(userData.healthFactor) / 1e18,
      availableToBorrow: userData.availableBorrowsBase
    };
  }
}
```


## Integration Points

### DEX Aggregator Integration

```typescript
class DEXAggregator {
  private protocols: Map<DeFiProtocol, SwapService>;

  constructor(protocols: Map<DeFiProtocol, SwapService>) {
    this.protocols = protocols;
  }

  async getBestQuote(params: SwapParams): Promise<AggregatedQuote> {
    const quotes = await Promise.all(
      Array.from(this.protocols.entries()).map(async ([protocol, service]) => {
        try {
          const quote = await service.getQuote(params);
          return { protocol, quote, error: null };
        } catch (error) {
          return { protocol, quote: null, error };
        }
      })
    );

    const validQuotes = quotes.filter(q => q.quote !== null);
    if (validQuotes.length === 0) {
      throw new Error('No valid quotes found');
    }

    // Sort by output amount (descending)
    validQuotes.sort((a, b) => Number(b.quote!.amountOut - a.quote!.amountOut));

    return {
      bestQuote: validQuotes[0].quote!,
      bestProtocol: validQuotes[0].protocol,
      allQuotes: validQuotes.map(q => ({
        protocol: q.protocol,
        quote: q.quote!
      })),
      savings: this.calculateSavings(validQuotes)
    };
  }

  async executeBestSwap(params: SwapParams): Promise<SwapResult> {
    const aggregatedQuote = await this.getBestQuote(params);
    const service = this.protocols.get(aggregatedQuote.bestProtocol)!;
    
    return service.executeSwap({
      ...params,
      route: aggregatedQuote.bestQuote.route
    });
  }
}

interface AggregatedQuote {
  bestQuote: SwapQuote;
  bestProtocol: DeFiProtocol;
  allQuotes: { protocol: DeFiProtocol; quote: SwapQuote }[];
  savings: bigint;
}
```

### 1inch Integration

```typescript
class OneInchIntegration {
  private apiUrl: string;
  private chainId: number;

  constructor(chainId: number) {
    this.chainId = chainId;
    this.apiUrl = `https://api.1inch.dev/swap/v6.0/${chainId}`;
  }

  async getQuote(params: SwapParams): Promise<OneInchQuote> {
    const response = await fetch(
      `${this.apiUrl}/quote?` + new URLSearchParams({
        src: params.tokenIn,
        dst: params.tokenOut,
        amount: params.amountIn!.toString()
      }),
      {
        headers: {
          'Authorization': `Bearer ${process.env.ONEINCH_API_KEY}`
        }
      }
    );

    return response.json();
  }

  async getSwapData(params: SwapParams, fromAddress: string): Promise<OneInchSwapData> {
    const response = await fetch(
      `${this.apiUrl}/swap?` + new URLSearchParams({
        src: params.tokenIn,
        dst: params.tokenOut,
        amount: params.amountIn!.toString(),
        from: fromAddress,
        slippage: params.slippageTolerance.toString()
      }),
      {
        headers: {
          'Authorization': `Bearer ${process.env.ONEINCH_API_KEY}`
        }
      }
    );

    return response.json();
  }
}

interface OneInchQuote {
  dstAmount: string;
  srcToken: TokenInfo;
  dstToken: TokenInfo;
  protocols: string[][][];
  gas: number;
}

interface OneInchSwapData {
  tx: {
    from: string;
    to: string;
    data: string;
    value: string;
    gas: number;
    gasPrice: string;
  };
}
```

## Security Considerations

### DeFi Security
- Implement slippage protection for all swaps
- Validate price oracles and use multiple sources
- Protect against sandwich attacks with private transactions
- Implement circuit breakers for extreme market conditions
- Monitor for flash loan attacks

### Smart Contract Security
- Use audited and battle-tested protocols
- Implement reentrancy guards
- Validate all external calls
- Use safe math operations
- Implement emergency pause functionality

### Risk Management
- Monitor health factors continuously
- Implement automatic deleveraging
- Set position limits and exposure caps
- Track impermanent loss in real-time
- Implement stop-loss mechanisms

## Compliance Guidelines

- Implement transaction monitoring for AML
- Support wallet screening for sanctions compliance
- Maintain audit trails for all DeFi interactions
- Implement geographic restrictions if required
- Support regulatory reporting requirements

## Testing Considerations

### Property-Based Tests

```typescript
describe('DeFi Protocol Properties', () => {
  it('should maintain liquidity pool invariants', () => {
    fc.assert(fc.property(
      fc.bigInt({ min: 1n, max: ethers.parseEther('1000000') }),
      fc.bigInt({ min: 1n, max: ethers.parseEther('1000000') }),
      async (amount0, amount1) => {
        const service = new UniswapV2Service(routerAddress, factoryAddress, mockSigner);
        
        // Add liquidity
        const addResult = await service.addLiquidity(pool, [
          { token: token0, amount: amount0 },
          { token: token1, amount: amount1 }
        ]);

        // Pool share should be positive
        expect(addResult.poolShare).toBeGreaterThan(0);

        // Remove liquidity
        const removeResult = await service.removeLiquidity(pool, addResult.lpTokensReceived);

        // Should receive back approximately the same amounts (minus fees)
        const tolerance = 0.01; // 1% tolerance for fees
        expect(Number(removeResult.tokensReceived[0].amount)).toBeCloseTo(Number(amount0), tolerance);
      }
    ));
  });

  it('should calculate correct swap outputs', () => {
    fc.assert(fc.property(
      fc.bigInt({ min: 1n, max: ethers.parseEther('100') }),
      async (amountIn) => {
        const service = new UniswapV2Service(routerAddress, factoryAddress, mockSigner);
        
        const quote = await service.getQuote({
          tokenIn: token0,
          tokenOut: token1,
          amountIn,
          slippageTolerance: 0.5,
          deadline: Math.floor(Date.now() / 1000) + 1200
        });

        // Output should be positive
        expect(quote.amountOut).toBeGreaterThan(0n);
        
        // Price impact should be reasonable
        expect(quote.priceImpact).toBeLessThan(50);
      }
    ));
  });
});
```
