# Investment Management Template

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
Provides comprehensive patterns for portfolio tracking, trading capabilities, investment analytics, and wealth management features in fintech applications.

## Context
Investment management is a critical component of modern fintech platforms, enabling users to build wealth through diversified portfolios, automated investing, and sophisticated trading capabilities. This template addresses the complexity of building compliant investment platforms that handle real-time market data, execute trades efficiently, and provide comprehensive analytics while meeting regulatory requirements for investment services.

## Instructions
1. Analyze investment management requirements and client objectives
2. Design comprehensive portfolio management and asset allocation systems
3. Implement trading execution and order management workflows
4. Build investment research and analytics capabilities
5. Create risk assessment and performance tracking tools
6. Add robo-advisory and automated investing features
7. Implement regulatory compliance for investment services
8. Build client reporting and communication systems
9. Create market data integration and real-time pricing
10. Add tax optimization and harvesting capabilities

## Examples

### Example 1: Automated Portfolio Management
```typescript
// Robo-advisor with automated rebalancing
class RoboAdvisor {
  async managePortfolio(portfolioId: string): Promise<ManagementResult> {
    const portfolio = await this.getPortfolio(portfolioId);
    const marketData = await this.getMarketData(portfolio.holdings);
    
    const rebalanceNeeded = await this.assessRebalanceNeed(portfolio, marketData);
    
    if (rebalanceNeeded.required) {
      const trades = await this.generateRebalanceTrades(portfolio, rebalanceNeeded);
      const executionResult = await this.executeTrades(trades);
      
      return {
        action: 'rebalanced',
        trades: executionResult.trades,
        newAllocation: executionResult.allocation
      };
    }
    
    return { action: 'no_action_needed', reason: rebalanceNeeded.reason };
  }
}
```

### Example 2: Trading Engine Integration
```typescript
// Advanced trading execution system
class TradingEngine {
  async executeOrder(order: TradeOrder): Promise<ExecutionResult> {
    const validation = await this.validateOrder(order);
    if (!validation.valid) throw new OrderValidationError(validation.errors);
    
    const execution = await this.routeOrder(order);
    const fills = await this.monitorExecution(execution.orderId);
    
    await this.updatePortfolio(order.portfolioId, fills);
    await this.recordTransaction(fills);
    
    return {
      orderId: execution.orderId,
      fills,
      averagePrice: this.calculateAveragePrice(fills),
      totalCost: this.calculateTotalCost(fills)
    };
  }
}
```

### Example 3: Investment Analytics Engine
```typescript
// Comprehensive investment performance analytics
class InvestmentAnalytics {
  async calculatePerformanceMetrics(portfolioId: string, period: TimePeriod): Promise<PerformanceReport> {
    const portfolio = await this.getPortfolio(portfolioId);
    const historicalData = await this.getHistoricalData(portfolio, period);
    
    const metrics = {
      totalReturn: this.calculateTotalReturn(historicalData),
      annualizedReturn: this.calculateAnnualizedReturn(historicalData),
      volatility: this.calculateVolatility(historicalData),
      sharpeRatio: this.calculateSharpeRatio(historicalData),
      maxDrawdown: this.calculateMaxDrawdown(historicalData),
      beta: await this.calculateBeta(portfolio, period)
    };
    
    return {
      portfolio,
      period,
      metrics,
      benchmark: await this.getBenchmarkComparison(portfolio, period)
    };
  }
}
```

## Variables
| Variable | Type | Description | Default | Required |
|----------|------|-------------|---------|----------|
| assetClasses | array | Supported asset classes | ['stocks', 'bonds', 'etfs'] | Yes |
| tradingVenues | array | Trading venue integrations | ['nasdaq', 'nyse'] | Yes |
| riskProfiles | array | Available risk profiles | ['conservative', 'moderate'] | Yes |
| rebalancingStrategy | string | Portfolio rebalancing approach | 'threshold_based' | No |
| taxOptimization | boolean | Tax-loss harvesting | false | No |
| fractionalShares | boolean | Fractional share trading | true | No |
| roboAdvisory | boolean | Automated investment management | true | No |
| marketDataProvider | string | Market data source | 'alpha_vantage' | Yes |
| complianceReporting | boolean | Investment compliance tracking | true | Yes |
| clientReporting | boolean | Client performance reporting | true | No |

## Expected Output
A comprehensive investment management platform featuring:
- Portfolio management with automated asset allocation and rebalancing
- Trading execution with multi-venue routing and best execution
- Investment analytics with performance tracking and risk assessment
- Robo-advisory services with goal-based investing and automation
- Market data integration with real-time pricing and research
- Tax optimization with tax-loss harvesting and efficient placement
- Regulatory compliance with investment advisor requirements
- Client reporting with performance attribution and benchmarking
- Risk management with portfolio monitoring and alerts
- Integration with custodians, brokers, and market data providers

## Core Components

### 1. Portfolio Management System

```typescript
interface PortfolioManager {
  createPortfolio(request: PortfolioCreationRequest): Promise<Portfolio>;
  updatePortfolio(portfolioId: string, updates: PortfolioUpdate): Promise<Portfolio>;
  rebalancePortfolio(portfolioId: string, strategy: RebalancingStrategy): Promise<RebalancingResult>;
  calculatePerformance(portfolioId: string, period: TimePeriod): Promise<PerformanceMetrics>;
  generatePortfolioReport(portfolioId: string): Promise<PortfolioReport>;
}

interface Portfolio {
  id: string;
  accountId: string;
  name: string;
  description?: string;
  strategy: InvestmentStrategy;
  holdings: Holding[];
  totalValue: Money;
  cashBalance: Money;
  targetAllocation: AssetAllocation[];
  currentAllocation: AssetAllocation[];
  riskProfile: RiskProfile;
  createdAt: Date;
  lastRebalanced: Date;
}

interface Holding {
  symbol: string;
  assetType: AssetType;
  quantity: number;
  averageCost: Money;
  currentPrice: Money;
  marketValue: Money;
  unrealizedGainLoss: Money;
  unrealizedGainLossPercent: number;
  weight: number; // Percentage of portfolio
  lastUpdated: Date;
}

enum AssetType {
  STOCK = 'stock',
  BOND = 'bond',
  ETF = 'etf',
  MUTUAL_FUND = 'mutual_fund',
  CRYPTOCURRENCY = 'cryptocurrency',
  COMMODITY = 'commodity',
  REAL_ESTATE = 'real_estate',
  CASH = 'cash'
}

interface AssetAllocation {
  assetType: AssetType;
  targetPercentage: number;
  currentPercentage: number;
  deviation: number;
}
```

### 2. Trading and Order Management

```typescript
interface TradingEngine {
  placeOrder(order: OrderRequest): Promise<OrderResult>;
  cancelOrder(orderId: string): Promise<CancelResult>;
  modifyOrder(orderId: string, modifications: OrderModification): Promise<ModifyResult>;
  getOrderStatus(orderId: string): Promise<OrderStatus>;
  getOrderHistory(accountId: string, filters?: OrderFilters): Promise<OrderHistory>;
}

interface OrderRequest {
  accountId: string;
  portfolioId?: string;
  symbol: string;
  orderType: OrderType;
  side: OrderSide;
  quantity: number;
  price?: Money; // For limit orders
  stopPrice?: Money; // For stop orders
  timeInForce: TimeInForce;
  instructions?: OrderInstruction[];
}

enum OrderType {
  MARKET = 'market',
  LIMIT = 'limit',
  STOP = 'stop',
  STOP_LIMIT = 'stop_limit',
  TRAILING_STOP = 'trailing_stop'
}

enum OrderSide {
  BUY = 'buy',
  SELL = 'sell'
}

enum TimeInForce {
  DAY = 'day',
  GTC = 'gtc', // Good Till Canceled
  IOC = 'ioc', // Immediate or Cancel
  FOK = 'fok'  // Fill or Kill
}

interface OrderResult {
  orderId: string;
  status: OrderStatus;
  executedQuantity: number;
  executedPrice?: Money;
  commission: Money;
  timestamp: Date;
  estimatedSettlementDate: Date;
}

enum OrderStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  PARTIALLY_FILLED = 'partially_filled',
  FILLED = 'filled',
  CANCELED = 'canceled',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}
```

### 3. Market Data and Research

```typescript
interface MarketDataService {
  getQuote(symbol: string): Promise<Quote>;
  getHistoricalData(symbol: string, period: TimePeriod): Promise<HistoricalData>;
  getMarketNews(symbols?: string[]): Promise<NewsItem[]>;
  getAnalystRatings(symbol: string): Promise<AnalystRating[]>;
  getFinancialStatements(symbol: string): Promise<FinancialStatements>;
}

interface Quote {
  symbol: string;
  price: Money;
  change: Money;
  changePercent: number;
  volume: number;
  bid: Money;
  ask: Money;
  high52Week: Money;
  low52Week: Money;
  marketCap: Money;
  peRatio?: number;
  dividendYield?: number;
  timestamp: Date;
}

interface HistoricalData {
  symbol: string;
  period: TimePeriod;
  data: PricePoint[];
}

interface PricePoint {
  date: Date;
  open: Money;
  high: Money;
  low: Money;
  close: Money;
  volume: number;
  adjustedClose: Money;
}

interface AnalystRating {
  firm: string;
  analyst: string;
  rating: Rating;
  targetPrice: Money;
  priceTarget: Money;
  recommendation: Recommendation;
  date: Date;
  summary: string;
}

enum Rating {
  STRONG_BUY = 'strong_buy',
  BUY = 'buy',
  HOLD = 'hold',
  SELL = 'sell',
  STRONG_SELL = 'strong_sell'
}
```

### 4. Investment Analytics and Performance

```typescript
interface InvestmentAnalytics {
  calculateReturns(portfolioId: string, period: TimePeriod): Promise<ReturnAnalysis>;
  calculateRiskMetrics(portfolioId: string): Promise<RiskMetrics>;
  performAttributionAnalysis(portfolioId: string, benchmark: string): Promise<AttributionAnalysis>;
  generatePerformanceReport(portfolioId: string, period: TimePeriod): Promise<PerformanceReport>;
  backtestStrategy(strategy: InvestmentStrategy, historicalData: HistoricalData): Promise<BacktestResult>;
}

interface ReturnAnalysis {
  totalReturn: number;
  annualizedReturn: number;
  timeWeightedReturn: number;
  moneyWeightedReturn: number;
  benchmarkReturn: number;
  excessReturn: number;
  returnsByPeriod: PeriodReturn[];
}

interface RiskMetrics {
  volatility: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  valueAtRisk: Money;
  beta: number;
  alpha: number;
  informationRatio: number;
  trackingError: number;
}

interface AttributionAnalysis {
  totalReturn: number;
  benchmarkReturn: number;
  activeReturn: number;
  assetAllocationEffect: number;
  securitySelectionEffect: number;
  interactionEffect: number;
  sectorAttributions: SectorAttribution[];
}

interface BacktestResult {
  strategy: InvestmentStrategy;
  period: TimePeriod;
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  trades: BacktestTrade[];
  equityCurve: EquityPoint[];
}
```

### 5. Robo-Advisory and Automated Investing

```typescript
interface RoboAdvisor {
  assessRiskProfile(questionnaire: RiskQuestionnaire): Promise<RiskProfile>;
  recommendPortfolio(riskProfile: RiskProfile, goals: InvestmentGoal[]): Promise<PortfolioRecommendation>;
  autoRebalance(portfolioId: string): Promise<RebalancingResult>;
  taxLossHarvest(portfolioId: string): Promise<TaxHarvestingResult>;
  generateInvestmentPlan(profile: InvestorProfile): Promise<InvestmentPlan>;
}

interface RiskQuestionnaire {
  age: number;
  investmentExperience: ExperienceLevel;
  investmentHorizon: number; // years
  riskTolerance: RiskTolerance;
  liquidityNeeds: LiquidityNeeds;
  investmentGoals: InvestmentGoal[];
  financialSituation: FinancialSituation;
}

interface RiskProfile {
  score: number; // 1-10 scale
  category: RiskCategory;
  recommendedAllocation: AssetAllocation[];
  constraints: InvestmentConstraint[];
  rebalancingFrequency: RebalancingFrequency;
}

enum RiskCategory {
  CONSERVATIVE = 'conservative',
  MODERATE_CONSERVATIVE = 'moderate_conservative',
  MODERATE = 'moderate',
  MODERATE_AGGRESSIVE = 'moderate_aggressive',
  AGGRESSIVE = 'aggressive'
}

interface PortfolioRecommendation {
  recommendedAllocation: AssetAllocation[];
  suggestedETFs: ETFRecommendation[];
  expectedReturn: number;
  expectedVolatility: number;
  minimumInvestment: Money;
  fees: FeeStructure;
}

interface RebalancingResult {
  portfolioId: string;
  rebalancingDate: Date;
  trades: RebalancingTrade[];
  oldAllocation: AssetAllocation[];
  newAllocation: AssetAllocation[];
  totalCost: Money;
  taxImplications: TaxImplication[];
}
```

### 6. Investment Research and Screening

```typescript
interface InvestmentScreener {
  screenStocks(criteria: ScreeningCriteria): Promise<ScreeningResult>;
  screenETFs(criteria: ETFScreeningCriteria): Promise<ETFScreeningResult>;
  screenMutualFunds(criteria: MutualFundCriteria): Promise<MutualFundResult>;
  compareInvestments(symbols: string[]): Promise<ComparisonResult>;
  getInvestmentProfile(symbol: string): Promise<InvestmentProfile>;
}

interface ScreeningCriteria {
  marketCap?: MarketCapRange;
  peRatio?: NumberRange;
  dividendYield?: NumberRange;
  revenue?: NumberRange;
  sector?: string[];
  country?: string[];
  exchange?: string[];
  customMetrics?: CustomMetric[];
}

interface ScreeningResult {
  criteria: ScreeningCriteria;
  totalResults: number;
  results: StockScreeningResult[];
  sortBy: SortCriteria;
}

interface StockScreeningResult {
  symbol: string;
  name: string;
  sector: string;
  marketCap: Money;
  price: Money;
  peRatio: number;
  dividendYield: number;
  revenue: Money;
  score: number;
  matchedCriteria: string[];
}

interface InvestmentProfile {
  symbol: string;
  name: string;
  description: string;
  sector: string;
  industry: string;
  fundamentals: FundamentalData;
  technicals: TechnicalData;
  risks: RiskFactor[];
  opportunities: string[];
  analystConsensus: AnalystConsensus;
}
```

## Implementation Guidelines

### Performance and Scalability
- Implement real-time market data streaming
- Use caching for frequently accessed market data
- Implement efficient portfolio calculation algorithms
- Use database indexing for portfolio queries
- Implement batch processing for large portfolio operations

### Security and Compliance
- Implement trade authorization and approval workflows
- Use encryption for sensitive investment data
- Implement audit trails for all trading activities
- Follow regulatory requirements (SEC, FINRA, MiFID II)
- Implement position limits and risk controls

### Risk Management
- Implement real-time risk monitoring
- Use position sizing and concentration limits
- Implement stop-loss and take-profit mechanisms
- Monitor portfolio correlation and diversification
- Implement stress testing and scenario analysis

### Data Quality and Reliability
- Implement market data validation and cleansing
- Use multiple data sources for redundancy
- Implement data reconciliation processes
- Monitor data latency and accuracy
- Implement fallback mechanisms for data outages

## Integration Examples

### Brokerage API Integration (Alpaca)
```typescript
class AlpacaTradingService implements TradingEngine {
  async placeOrder(order: OrderRequest): Promise<OrderResult> {
    const alpacaOrder = {
      symbol: order.symbol,
      qty: order.quantity,
      side: order.side,
      type: order.orderType,
      time_in_force: order.timeInForce,
      limit_price: order.price?.amount,
      stop_price: order.stopPrice?.amount
    };
    
    const response = await this.alpacaClient.createOrder(alpacaOrder);
    
    return {
      orderId: response.id,
      status: this.mapAlpacaStatus(response.status),
      executedQuantity: parseFloat(response.filled_qty),
      executedPrice: response.filled_avg_price ? 
        { amount: parseFloat(response.filled_avg_price), currency: 'USD' } : undefined,
      commission: { amount: 0, currency: 'USD' }, // Alpaca is commission-free
      timestamp: new Date(response.created_at),
      estimatedSettlementDate: this.calculateSettlementDate(response.created_at)
    };
  }
  
  async getOrderStatus(orderId: string): Promise<OrderStatus> {
    const order = await this.alpacaClient.getOrder(orderId);
    return this.mapAlpacaStatus(order.status);
  }
  
  private mapAlpacaStatus(alpacaStatus: string): OrderStatus {
    const statusMap: Record<string, OrderStatus> = {
      'new': OrderStatus.SUBMITTED,
      'partially_filled': OrderStatus.PARTIALLY_FILLED,
      'filled': OrderStatus.FILLED,
      'canceled': OrderStatus.CANCELED,
      'rejected': OrderStatus.REJECTED,
      'expired': OrderStatus.EXPIRED
    };
    
    return statusMap[alpacaStatus] || OrderStatus.PENDING;
  }
}
```

### Portfolio Rebalancing Algorithm
```typescript
class PortfolioRebalancer {
  async rebalancePortfolio(portfolioId: string, strategy: RebalancingStrategy): Promise<RebalancingResult> {
    const portfolio = await this.getPortfolio(portfolioId);
    const targetAllocation = portfolio.targetAllocation;
    const currentAllocation = await this.calculateCurrentAllocation(portfolio);
    
    // Calculate required trades
    const trades = await this.calculateRebalancingTrades(
      portfolio,
      currentAllocation,
      targetAllocation,
      strategy
    );
    
    // Apply tax-loss harvesting if enabled
    if (strategy.enableTaxLossHarvesting) {
      const taxOptimizedTrades = await this.optimizeForTaxes(trades, portfolio);
      trades.splice(0, trades.length, ...taxOptimizedTrades);
    }
    
    // Execute trades
    const executedTrades: RebalancingTrade[] = [];
    for (const trade of trades) {
      try {
        const orderResult = await this.tradingEngine.placeOrder({
          accountId: portfolio.accountId,
          portfolioId: portfolio.id,
          symbol: trade.symbol,
          orderType: OrderType.MARKET,
          side: trade.side,
          quantity: trade.quantity,
          timeInForce: TimeInForce.DAY
        });
        
        executedTrades.push({
          ...trade,
          orderId: orderResult.orderId,
          executedPrice: orderResult.executedPrice,
          status: orderResult.status
        });
      } catch (error) {
        // Handle trade execution errors
        await this.handleTradeError(trade, error);
      }
    }
    
    // Update portfolio allocation
    const newAllocation = await this.calculateNewAllocation(portfolio, executedTrades);
    
    return {
      portfolioId,
      rebalancingDate: new Date(),
      trades: executedTrades,
      oldAllocation: currentAllocation,
      newAllocation,
      totalCost: this.calculateTotalCost(executedTrades),
      taxImplications: await this.calculateTaxImplications(executedTrades)
    };
  }
  
  private async calculateRebalancingTrades(
    portfolio: Portfolio,
    current: AssetAllocation[],
    target: AssetAllocation[],
    strategy: RebalancingStrategy
  ): Promise<RebalancingTrade[]> {
    const trades: RebalancingTrade[] = [];
    const totalValue = portfolio.totalValue.amount;
    
    for (const targetAlloc of target) {
      const currentAlloc = current.find(c => c.assetType === targetAlloc.assetType);
      const currentValue = currentAlloc ? (currentAlloc.currentPercentage / 100) * totalValue : 0;
      const targetValue = (targetAlloc.targetPercentage / 100) * totalValue;
      const difference = targetValue - currentValue;
      
      // Only trade if difference exceeds threshold
      if (Math.abs(difference) > strategy.rebalancingThreshold * totalValue) {
        const holdings = portfolio.holdings.filter(h => h.assetType === targetAlloc.assetType);
        
        if (difference > 0) {
          // Need to buy more of this asset type
          const buyTrades = await this.generateBuyTrades(holdings, difference, strategy);
          trades.push(...buyTrades);
        } else {
          // Need to sell some of this asset type
          const sellTrades = await this.generateSellTrades(holdings, Math.abs(difference), strategy);
          trades.push(...sellTrades);
        }
      }
    }
    
    return trades;
  }
}
```

## Testing Strategy

### Unit Tests
- Test portfolio calculation algorithms
- Test order validation logic
- Test risk metric calculations
- Test rebalancing algorithms

### Integration Tests
- Test brokerage API integrations
- Test market data feed integrations
- Test portfolio rebalancing workflows
- Test performance calculation accuracy

### Performance Tests
- Test portfolio calculation performance with large holdings
- Test concurrent trading operations
- Test market data processing throughput
- Test real-time risk monitoring performance

## Monitoring and Analytics

### Key Metrics
- Portfolio performance vs benchmarks
- Trade execution quality and slippage
- System uptime and data accuracy
- User engagement with investment features
- Risk-adjusted returns

### Alerts and Notifications
- Significant portfolio losses or gains
- Failed trade executions
- Risk limit breaches
- Market data feed issues
- Regulatory compliance violations

This template provides a comprehensive foundation for building sophisticated investment management systems that can handle portfolio management, trading, analytics, and automated investing while maintaining regulatory compliance and risk management best practices.
