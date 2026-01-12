# Token Management Template

## Purpose

This template provides comprehensive patterns for token creation, transfers, staking, governance tokens, and token lifecycle management in blockchain applications. It covers ERC-20, ERC-721, ERC-1155 standards, and advanced tokenomics patterns.

## Context

Token management is fundamental to blockchain applications, enabling value transfer, governance participation, and incentive mechanisms. Modern token systems must handle complex operations like staking, vesting, delegation, and multi-token interactions while maintaining security, gas efficiency, and regulatory compliance across different token standards.

## Core Components

### Token Service

## Examples

```typescript
interface TokenService {
  getBalance(tokenAddress: string, account: string): Promise<bigint>;
  transfer(tokenAddress: string, to: string, amount: bigint): Promise<TransactionReceipt>;
  approve(tokenAddress: string, spender: string, amount: bigint): Promise<TransactionReceipt>;
  getAllowance(tokenAddress: string, owner: string, spender: string): Promise<bigint>;
  getTokenInfo(tokenAddress: string): Promise<TokenInfo>;
  getTokenHistory(tokenAddress: string, account: string): Promise<TokenTransaction[]>;
}


interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
  standard: TokenStandard;
  owner?: string;
  isPaused?: boolean;
  isMintable?: boolean;
  isBurnable?: boolean;
}

enum TokenStandard {
  ERC20 = 'ERC20',
  ERC721 = 'ERC721',
  ERC1155 = 'ERC1155',
  ERC777 = 'ERC777'
}

interface TokenTransaction {
  hash: string;
  from: string;
  to: string;
  amount: bigint;
  tokenId?: bigint;
  blockNumber: number;
  timestamp: number;
  type: 'transfer' | 'mint' | 'burn' | 'approval';
}
```

### Token Creation Service

```typescript
interface TokenCreationService {
  deployERC20(config: ERC20Config): Promise<DeployedToken>;
  deployERC721(config: ERC721Config): Promise<DeployedToken>;
  deployERC1155(config: ERC1155Config): Promise<DeployedToken>;
  mintTokens(tokenAddress: string, to: string, amount: bigint): Promise<TransactionReceipt>;
  burnTokens(tokenAddress: string, amount: bigint): Promise<TransactionReceipt>;
}

interface ERC20Config {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: bigint;
  maxSupply?: bigint;
  isMintable: boolean;
  isBurnable: boolean;
  isPausable: boolean;
  hasSnapshot: boolean;
  accessControl: AccessControlType;
  premintAddresses?: { address: string; amount: bigint }[];
}

interface ERC721Config {
  name: string;
  symbol: string;
  baseURI: string;
  maxSupply?: bigint;
  isMintable: boolean;
  isBurnable: boolean;
  isPausable: boolean;
  hasRoyalties: boolean;
  royaltyBps?: number;
  royaltyRecipient?: string;
  accessControl: AccessControlType;
}

interface ERC1155Config {
  uri: string;
  isMintable: boolean;
  isBurnable: boolean;
  isPausable: boolean;
  hasSupplyTracking: boolean;
  accessControl: AccessControlType;
}

enum AccessControlType {
  OWNABLE = 'ownable',
  ROLES = 'roles',
  NONE = 'none'
}

interface DeployedToken {
  address: string;
  standard: TokenStandard;
  deploymentTx: string;
  blockNumber: number;
  config: ERC20Config | ERC721Config | ERC1155Config;
}
```

### Staking Service

```typescript
interface StakingService {
  stake(stakingContract: string, amount: bigint): Promise<TransactionReceipt>;
  unstake(stakingContract: string, amount: bigint): Promise<TransactionReceipt>;
  claimRewards(stakingContract: string): Promise<TransactionReceipt>;
  getStakedBalance(stakingContract: string, account: string): Promise<bigint>;
  getPendingRewards(stakingContract: string, account: string): Promise<bigint>;
  getStakingInfo(stakingContract: string): Promise<StakingInfo>;
  getStakingHistory(stakingContract: string, account: string): Promise<StakingEvent[]>;
}

interface StakingInfo {
  stakingToken: string;
  rewardToken: string;
  totalStaked: bigint;
  rewardRate: bigint;
  periodFinish: number;
  lastUpdateTime: number;
  rewardPerTokenStored: bigint;
  minimumStake?: bigint;
  lockPeriod?: number;
  earlyWithdrawalPenalty?: number;
}

interface StakingEvent {
  type: 'stake' | 'unstake' | 'claim' | 'compound';
  amount: bigint;
  timestamp: number;
  transactionHash: string;
  blockNumber: number;
}

interface StakingPosition {
  stakedAmount: bigint;
  rewardDebt: bigint;
  pendingRewards: bigint;
  stakedAt: number;
  unlockTime?: number;
  isLocked: boolean;
}
```

### Vesting Service

```typescript
interface VestingService {
  createVestingSchedule(config: VestingConfig): Promise<TransactionReceipt>;
  release(vestingContract: string, beneficiary: string): Promise<TransactionReceipt>;
  revoke(vestingContract: string, beneficiary: string): Promise<TransactionReceipt>;
  getVestingSchedule(vestingContract: string, beneficiary: string): Promise<VestingSchedule>;
  getReleasableAmount(vestingContract: string, beneficiary: string): Promise<bigint>;
  getVestedAmount(vestingContract: string, beneficiary: string): Promise<bigint>;
}

interface VestingConfig {
  beneficiary: string;
  totalAmount: bigint;
  startTime: number;
  cliffDuration: number;
  vestingDuration: number;
  slicePeriodSeconds: number;
  isRevocable: boolean;
}

interface VestingSchedule {
  beneficiary: string;
  totalAmount: bigint;
  releasedAmount: bigint;
  startTime: number;
  cliffTime: number;
  endTime: number;
  slicePeriodSeconds: number;
  isRevocable: boolean;
  isRevoked: boolean;
}
```

### Governance Token Service

```typescript
interface GovernanceTokenService {
  delegate(tokenAddress: string, delegatee: string): Promise<TransactionReceipt>;
  getVotes(tokenAddress: string, account: string): Promise<bigint>;
  getPastVotes(tokenAddress: string, account: string, blockNumber: number): Promise<bigint>;
  getDelegates(tokenAddress: string, account: string): Promise<string>;
  getCheckpoints(tokenAddress: string, account: string): Promise<Checkpoint[]>;
}

interface Checkpoint {
  fromBlock: number;
  votes: bigint;
}

interface GovernanceTokenInfo extends TokenInfo {
  totalVotingPower: bigint;
  delegationEnabled: boolean;
  checkpointEnabled: boolean;
}
```


## Implementation Patterns

### ERC-20 Token Service Implementation

```typescript
class ERC20TokenService implements TokenService {
  private provider: ethers.Provider;
  private signer?: ethers.Signer;

  constructor(provider: ethers.Provider, signer?: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
  }

  async getBalance(tokenAddress: string, account: string): Promise<bigint> {
    const contract = new ethers.Contract(tokenAddress, ERC20ABI, this.provider);
    return contract.balanceOf(account);
  }

  async transfer(tokenAddress: string, to: string, amount: bigint): Promise<TransactionReceipt> {
    if (!this.signer) throw new Error('Signer required');
    
    const contract = new ethers.Contract(tokenAddress, ERC20ABI, this.signer);
    const tx = await contract.transfer(to, amount);
    const receipt = await tx.wait();

    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      status: receipt.status === 1 ? 'success' : 'failed',
      gasUsed: receipt.gasUsed
    };
  }

  async approve(tokenAddress: string, spender: string, amount: bigint): Promise<TransactionReceipt> {
    if (!this.signer) throw new Error('Signer required');
    
    const contract = new ethers.Contract(tokenAddress, ERC20ABI, this.signer);
    const tx = await contract.approve(spender, amount);
    const receipt = await tx.wait();

    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      status: receipt.status === 1 ? 'success' : 'failed',
      gasUsed: receipt.gasUsed
    };
  }

  async getAllowance(tokenAddress: string, owner: string, spender: string): Promise<bigint> {
    const contract = new ethers.Contract(tokenAddress, ERC20ABI, this.provider);
    return contract.allowance(owner, spender);
  }

  async getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
    const contract = new ethers.Contract(tokenAddress, ERC20ABI, this.provider);
    
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply()
    ]);

    return {
      address: tokenAddress,
      name,
      symbol,
      decimals,
      totalSupply,
      standard: TokenStandard.ERC20
    };
  }

  async getTokenHistory(tokenAddress: string, account: string): Promise<TokenTransaction[]> {
    const contract = new ethers.Contract(tokenAddress, ERC20ABI, this.provider);
    
    // Get Transfer events where account is sender or receiver
    const sentFilter = contract.filters.Transfer(account, null);
    const receivedFilter = contract.filters.Transfer(null, account);
    
    const [sentEvents, receivedEvents] = await Promise.all([
      contract.queryFilter(sentFilter),
      contract.queryFilter(receivedFilter)
    ]);

    const allEvents = [...sentEvents, ...receivedEvents].sort(
      (a, b) => b.blockNumber - a.blockNumber
    );

    return Promise.all(allEvents.map(async (event) => {
      const block = await event.getBlock();
      return {
        hash: event.transactionHash,
        from: event.args![0],
        to: event.args![1],
        amount: event.args![2],
        blockNumber: event.blockNumber,
        timestamp: block.timestamp,
        type: 'transfer' as const
      };
    }));
  }
}
```

### Staking Implementation

```typescript
class StakingServiceImpl implements StakingService {
  private provider: ethers.Provider;
  private signer: ethers.Signer;

  constructor(provider: ethers.Provider, signer: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
  }

  async stake(stakingContract: string, amount: bigint): Promise<TransactionReceipt> {
    const contract = new ethers.Contract(stakingContract, StakingABI, this.signer);
    
    // Check and approve staking token if needed
    const stakingInfo = await this.getStakingInfo(stakingContract);
    const tokenService = new ERC20TokenService(this.provider, this.signer);
    const allowance = await tokenService.getAllowance(
      stakingInfo.stakingToken,
      await this.signer.getAddress(),
      stakingContract
    );

    if (allowance < amount) {
      await tokenService.approve(stakingInfo.stakingToken, stakingContract, amount);
    }

    const tx = await contract.stake(amount);
    const receipt = await tx.wait();

    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      status: receipt.status === 1 ? 'success' : 'failed',
      gasUsed: receipt.gasUsed
    };
  }

  async unstake(stakingContract: string, amount: bigint): Promise<TransactionReceipt> {
    const contract = new ethers.Contract(stakingContract, StakingABI, this.signer);
    
    // Check if position is locked
    const position = await this.getStakingPosition(stakingContract, await this.signer.getAddress());
    if (position.isLocked && position.unlockTime && Date.now() / 1000 < position.unlockTime) {
      throw new Error('Staking position is still locked');
    }

    const tx = await contract.withdraw(amount);
    const receipt = await tx.wait();

    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      status: receipt.status === 1 ? 'success' : 'failed',
      gasUsed: receipt.gasUsed
    };
  }

  async claimRewards(stakingContract: string): Promise<TransactionReceipt> {
    const contract = new ethers.Contract(stakingContract, StakingABI, this.signer);
    const tx = await contract.getReward();
    const receipt = await tx.wait();

    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      status: receipt.status === 1 ? 'success' : 'failed',
      gasUsed: receipt.gasUsed
    };
  }

  async getStakedBalance(stakingContract: string, account: string): Promise<bigint> {
    const contract = new ethers.Contract(stakingContract, StakingABI, this.provider);
    return contract.balanceOf(account);
  }

  async getPendingRewards(stakingContract: string, account: string): Promise<bigint> {
    const contract = new ethers.Contract(stakingContract, StakingABI, this.provider);
    return contract.earned(account);
  }

  async getStakingInfo(stakingContract: string): Promise<StakingInfo> {
    const contract = new ethers.Contract(stakingContract, StakingABI, this.provider);
    
    const [
      stakingToken,
      rewardToken,
      totalStaked,
      rewardRate,
      periodFinish,
      lastUpdateTime,
      rewardPerTokenStored
    ] = await Promise.all([
      contract.stakingToken(),
      contract.rewardsToken(),
      contract.totalSupply(),
      contract.rewardRate(),
      contract.periodFinish(),
      contract.lastUpdateTime(),
      contract.rewardPerTokenStored()
    ]);

    return {
      stakingToken,
      rewardToken,
      totalStaked,
      rewardRate,
      periodFinish: Number(periodFinish),
      lastUpdateTime: Number(lastUpdateTime),
      rewardPerTokenStored
    };
  }

  private async getStakingPosition(stakingContract: string, account: string): Promise<StakingPosition> {
    const contract = new ethers.Contract(stakingContract, StakingABI, this.provider);
    
    const [stakedAmount, pendingRewards] = await Promise.all([
      contract.balanceOf(account),
      contract.earned(account)
    ]);

    return {
      stakedAmount,
      rewardDebt: 0n,
      pendingRewards,
      stakedAt: 0,
      isLocked: false
    };
  }
}
```

### Token Creation Implementation

```typescript
class TokenCreationServiceImpl implements TokenCreationService {
  private signer: ethers.Signer;
  private deploymentService: ContractDeploymentService;

  constructor(signer: ethers.Signer, deploymentService: ContractDeploymentService) {
    this.signer = signer;
    this.deploymentService = deploymentService;
  }

  async deployERC20(config: ERC20Config): Promise<DeployedToken> {
    // Select appropriate contract based on features
    const artifact = this.selectERC20Artifact(config);
    
    const constructorArgs = [
      config.name,
      config.symbol,
      config.decimals,
      config.initialSupply
    ];

    if (config.maxSupply) {
      constructorArgs.push(config.maxSupply);
    }

    const deployed = await this.deploymentService.deploy(artifact, constructorArgs);

    // Handle premint if configured
    if (config.premintAddresses && config.premintAddresses.length > 0) {
      const contract = new ethers.Contract(deployed.address, artifact.abi, this.signer);
      
      for (const premint of config.premintAddresses) {
        await contract.mint(premint.address, premint.amount);
      }
    }

    return {
      address: deployed.address,
      standard: TokenStandard.ERC20,
      deploymentTx: deployed.deploymentTx,
      blockNumber: deployed.blockNumber,
      config
    };
  }

  async deployERC721(config: ERC721Config): Promise<DeployedToken> {
    const artifact = this.selectERC721Artifact(config);
    
    const constructorArgs = [config.name, config.symbol, config.baseURI];

    if (config.hasRoyalties && config.royaltyRecipient && config.royaltyBps) {
      constructorArgs.push(config.royaltyRecipient, config.royaltyBps);
    }

    const deployed = await this.deploymentService.deploy(artifact, constructorArgs);

    return {
      address: deployed.address,
      standard: TokenStandard.ERC721,
      deploymentTx: deployed.deploymentTx,
      blockNumber: deployed.blockNumber,
      config
    };
  }

  async deployERC1155(config: ERC1155Config): Promise<DeployedToken> {
    const artifact = this.selectERC1155Artifact(config);
    const constructorArgs = [config.uri];

    const deployed = await this.deploymentService.deploy(artifact, constructorArgs);

    return {
      address: deployed.address,
      standard: TokenStandard.ERC1155,
      deploymentTx: deployed.deploymentTx,
      blockNumber: deployed.blockNumber,
      config
    };
  }

  async mintTokens(tokenAddress: string, to: string, amount: bigint): Promise<TransactionReceipt> {
    const contract = new ethers.Contract(tokenAddress, MintableERC20ABI, this.signer);
    const tx = await contract.mint(to, amount);
    const receipt = await tx.wait();

    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      status: receipt.status === 1 ? 'success' : 'failed',
      gasUsed: receipt.gasUsed
    };
  }

  async burnTokens(tokenAddress: string, amount: bigint): Promise<TransactionReceipt> {
    const contract = new ethers.Contract(tokenAddress, BurnableERC20ABI, this.signer);
    const tx = await contract.burn(amount);
    const receipt = await tx.wait();

    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      status: receipt.status === 1 ? 'success' : 'failed',
      gasUsed: receipt.gasUsed
    };
  }

  private selectERC20Artifact(config: ERC20Config): ContractArtifact {
    // Select appropriate OpenZeppelin preset based on features
    if (config.hasSnapshot && config.accessControl === AccessControlType.ROLES) {
      return ERC20VotesArtifact;
    }
    if (config.isMintable && config.isBurnable && config.isPausable) {
      return ERC20PresetMinterPauserArtifact;
    }
    return ERC20Artifact;
  }

  private selectERC721Artifact(config: ERC721Config): ContractArtifact {
    if (config.hasRoyalties) {
      return ERC721RoyaltyArtifact;
    }
    if (config.isMintable && config.isBurnable && config.isPausable) {
      return ERC721PresetMinterPauserAutoIdArtifact;
    }
    return ERC721Artifact;
  }

  private selectERC1155Artifact(config: ERC1155Config): ContractArtifact {
    if (config.hasSupplyTracking) {
      return ERC1155SupplyArtifact;
    }
    if (config.isMintable && config.isBurnable && config.isPausable) {
      return ERC1155PresetMinterPauserArtifact;
    }
    return ERC1155Artifact;
  }
}
```


## Integration Points

### Token Portfolio Tracker

```typescript
class TokenPortfolioTracker {
  private tokenService: TokenService;
  private priceService: TokenPriceService;

  constructor(tokenService: TokenService, priceService: TokenPriceService) {
    this.tokenService = tokenService;
    this.priceService = priceService;
  }

  async getPortfolio(account: string, tokenAddresses: string[]): Promise<Portfolio> {
    const holdings = await Promise.all(
      tokenAddresses.map(async (address) => {
        const [balance, info, price] = await Promise.all([
          this.tokenService.getBalance(address, account),
          this.tokenService.getTokenInfo(address),
          this.priceService.getPrice(address)
        ]);

        const value = this.calculateValue(balance, info.decimals, price);

        return {
          token: info,
          balance,
          price,
          value,
          percentage: 0 // Calculated after all holdings
        };
      })
    );

    const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
    
    // Calculate percentages
    for (const holding of holdings) {
      holding.percentage = totalValue > 0 ? (holding.value / totalValue) * 100 : 0;
    }

    return {
      account,
      holdings,
      totalValue,
      lastUpdated: new Date()
    };
  }

  private calculateValue(balance: bigint, decimals: number, price: number): number {
    const balanceNumber = Number(balance) / Math.pow(10, decimals);
    return balanceNumber * price;
  }
}

interface Portfolio {
  account: string;
  holdings: TokenHolding[];
  totalValue: number;
  lastUpdated: Date;
}

interface TokenHolding {
  token: TokenInfo;
  balance: bigint;
  price: number;
  value: number;
  percentage: number;
}
```

### Multi-Token Batch Operations

```typescript
class BatchTokenOperations {
  private multicallAddress: string;
  private provider: ethers.Provider;
  private signer: ethers.Signer;

  async batchTransfer(transfers: TokenTransfer[]): Promise<TransactionReceipt[]> {
    // Group transfers by token for gas efficiency
    const groupedTransfers = this.groupByToken(transfers);
    const receipts: TransactionReceipt[] = [];

    for (const [tokenAddress, tokenTransfers] of Object.entries(groupedTransfers)) {
      const contract = new ethers.Contract(tokenAddress, ERC20ABI, this.signer);
      
      // Use multicall for batch transfers if supported
      if (await this.supportsMulticall(tokenAddress)) {
        const calls = tokenTransfers.map(t => 
          contract.interface.encodeFunctionData('transfer', [t.to, t.amount])
        );
        
        const tx = await contract.multicall(calls);
        const receipt = await tx.wait();
        receipts.push(this.formatReceipt(receipt));
      } else {
        // Fall back to individual transfers
        for (const transfer of tokenTransfers) {
          const tx = await contract.transfer(transfer.to, transfer.amount);
          const receipt = await tx.wait();
          receipts.push(this.formatReceipt(receipt));
        }
      }
    }

    return receipts;
  }

  async batchApprove(approvals: TokenApproval[]): Promise<TransactionReceipt[]> {
    const receipts: TransactionReceipt[] = [];

    for (const approval of approvals) {
      const contract = new ethers.Contract(approval.tokenAddress, ERC20ABI, this.signer);
      const tx = await contract.approve(approval.spender, approval.amount);
      const receipt = await tx.wait();
      receipts.push(this.formatReceipt(receipt));
    }

    return receipts;
  }

  private groupByToken(transfers: TokenTransfer[]): Record<string, TokenTransfer[]> {
    return transfers.reduce((acc, transfer) => {
      if (!acc[transfer.tokenAddress]) {
        acc[transfer.tokenAddress] = [];
      }
      acc[transfer.tokenAddress].push(transfer);
      return acc;
    }, {} as Record<string, TokenTransfer[]>);
  }
}

interface TokenTransfer {
  tokenAddress: string;
  to: string;
  amount: bigint;
}

interface TokenApproval {
  tokenAddress: string;
  spender: string;
  amount: bigint;
}
```

## Security Considerations

### Token Security
- Validate token addresses before interactions
- Check for malicious token contracts (honeypots)
- Implement approval limits and revocation
- Monitor for unusual token behavior
- Validate token decimals to prevent precision attacks

### Staking Security
- Implement reentrancy guards
- Validate reward calculations
- Protect against flash loan attacks
- Implement emergency withdrawal mechanisms
- Audit reward distribution logic

### Transfer Security
- Validate recipient addresses
- Implement transfer limits
- Check for blacklisted addresses
- Monitor for suspicious transfer patterns
- Implement transaction simulation

## Compliance Guidelines

- Implement token transfer restrictions for securities
- Support wallet screening for compliance
- Maintain transfer audit logs
- Implement geographic restrictions if required
- Support regulatory reporting requirements

## Testing Considerations

### Property-Based Tests

```typescript
describe('Token Management Properties', () => {
  it('should maintain balance consistency after transfers', () => {
    fc.assert(fc.property(
      fc.bigInt({ min: 1n, max: 1000000n }),
      fc.hexaString({ minLength: 40, maxLength: 40 }),
      async (amount, toAddress) => {
        const service = new ERC20TokenService(mockProvider, mockSigner);
        const tokenAddress = '0x...';
        const fromAddress = await mockSigner.getAddress();
        
        const initialFromBalance = await service.getBalance(tokenAddress, fromAddress);
        const initialToBalance = await service.getBalance(tokenAddress, `0x${toAddress}`);
        
        if (initialFromBalance >= amount) {
          await service.transfer(tokenAddress, `0x${toAddress}`, amount);
          
          const finalFromBalance = await service.getBalance(tokenAddress, fromAddress);
          const finalToBalance = await service.getBalance(tokenAddress, `0x${toAddress}`);
          
          // Balance conservation
          expect(finalFromBalance).toBe(initialFromBalance - amount);
          expect(finalToBalance).toBe(initialToBalance + amount);
        }
      }
    ));
  });

  it('should correctly track staking positions', () => {
    fc.assert(fc.property(
      fc.bigInt({ min: 1n, max: 1000000n }),
      async (stakeAmount) => {
        const service = new StakingServiceImpl(mockProvider, mockSigner);
        const stakingContract = '0x...';
        const account = await mockSigner.getAddress();
        
        const initialStaked = await service.getStakedBalance(stakingContract, account);
        
        await service.stake(stakingContract, stakeAmount);
        
        const afterStake = await service.getStakedBalance(stakingContract, account);
        expect(afterStake).toBe(initialStaked + stakeAmount);
        
        await service.unstake(stakingContract, stakeAmount);
        
        const afterUnstake = await service.getStakedBalance(stakingContract, account);
        expect(afterUnstake).toBe(initialStaked);
      }
    ));
  });
});
```
