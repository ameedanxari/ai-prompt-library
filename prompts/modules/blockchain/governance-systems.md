# Governance Systems Template

## Purpose

This template provides comprehensive patterns for implementing decentralized governance systems including voting mechanisms, proposal systems, delegation, timelock controllers, and DAO frameworks. It covers on-chain and off-chain governance patterns for decentralized autonomous organizations.

## Context

Decentralized governance enables token holders to participate in protocol decision-making through voting on proposals. Modern governance systems must handle complex operations like proposal creation, voting, delegation, execution, and timelock delays while ensuring security, transparency, and resistance to governance attacks.

## Core Components

### Governance Service

## Examples

```typescript
interface GovernanceService {
  createProposal(proposal: ProposalParams): Promise<ProposalResult>;
  castVote(proposalId: bigint, support: VoteType, reason?: string): Promise<VoteResult>;
  castVoteWithSignature(proposalId: bigint, support: VoteType, signature: string): Promise<VoteResult>;
  queue(proposalId: bigint): Promise<QueueResult>;
  execute(proposalId: bigint): Promise<ExecutionResult>;
  cancel(proposalId: bigint): Promise<CancelResult>;
  getProposal(proposalId: bigint): Promise<Proposal>;
  getProposalState(proposalId: bigint): Promise<ProposalState>;
  getVotingPower(account: string, blockNumber?: number): Promise<bigint>;
}


interface ProposalParams {
  targets: string[];
  values: bigint[];
  calldatas: string[];
  description: string;
}

interface ProposalResult {
  proposalId: bigint;
  transactionHash: string;
  proposer: string;
  startBlock: number;
  endBlock: number;
}

enum VoteType {
  AGAINST = 0,
  FOR = 1,
  ABSTAIN = 2
}

interface VoteResult {
  transactionHash: string;
  proposalId: bigint;
  voter: string;
  support: VoteType;
  weight: bigint;
  reason?: string;
}

interface Proposal {
  id: bigint;
  proposer: string;
  targets: string[];
  values: bigint[];
  calldatas: string[];
  description: string;
  startBlock: number;
  endBlock: number;
  forVotes: bigint;
  againstVotes: bigint;
  abstainVotes: bigint;
  state: ProposalState;
  eta?: number;
}

enum ProposalState {
  PENDING = 0,
  ACTIVE = 1,
  CANCELED = 2,
  DEFEATED = 3,
  SUCCEEDED = 4,
  QUEUED = 5,
  EXPIRED = 6,
  EXECUTED = 7
}

interface QueueResult {
  transactionHash: string;
  proposalId: bigint;
  eta: number;
}

interface ExecutionResult {
  transactionHash: string;
  proposalId: bigint;
  executedAt: number;
}
```

### Delegation Service

```typescript
interface DelegationService {
  delegate(delegatee: string): Promise<DelegationResult>;
  delegateBySig(delegatee: string, nonce: bigint, expiry: number, signature: string): Promise<DelegationResult>;
  getDelegates(account: string): Promise<string>;
  getCurrentVotes(account: string): Promise<bigint>;
  getPriorVotes(account: string, blockNumber: number): Promise<bigint>;
  getDelegationHistory(account: string): Promise<DelegationEvent[]>;
}

interface DelegationResult {
  transactionHash: string;
  delegator: string;
  fromDelegate: string;
  toDelegate: string;
  votingPower: bigint;
}

interface DelegationEvent {
  delegator: string;
  fromDelegate: string;
  toDelegate: string;
  blockNumber: number;
  timestamp: number;
  transactionHash: string;
}
```

### Timelock Service

```typescript
interface TimelockService {
  schedule(operation: TimelockOperation): Promise<ScheduleResult>;
  scheduleBatch(operations: TimelockOperation[], predecessor: string, salt: string): Promise<ScheduleResult>;
  execute(operation: TimelockOperation): Promise<ExecutionResult>;
  executeBatch(operations: TimelockOperation[], predecessor: string, salt: string): Promise<ExecutionResult>;
  cancel(operationId: string): Promise<CancelResult>;
  getMinDelay(): Promise<bigint>;
  getOperationState(operationId: string): Promise<OperationState>;
  isOperationReady(operationId: string): Promise<boolean>;
  isOperationDone(operationId: string): Promise<boolean>;
}

interface TimelockOperation {
  target: string;
  value: bigint;
  data: string;
  predecessor: string;
  salt: string;
  delay: bigint;
}

interface ScheduleResult {
  transactionHash: string;
  operationId: string;
  eta: number;
}

enum OperationState {
  UNSET = 0,
  PENDING = 1,
  READY = 2,
  DONE = 3
}
```

### Snapshot Integration Service

```typescript
interface SnapshotService {
  createSpace(config: SpaceConfig): Promise<SpaceResult>;
  createProposal(spaceId: string, proposal: SnapshotProposal): Promise<SnapshotProposalResult>;
  castVote(spaceId: string, proposalId: string, choice: number | number[]): Promise<SnapshotVoteResult>;
  getProposal(spaceId: string, proposalId: string): Promise<SnapshotProposalDetails>;
  getVotes(spaceId: string, proposalId: string): Promise<SnapshotVote[]>;
  getVotingPower(spaceId: string, voter: string, proposal: string): Promise<bigint>;
}

interface SpaceConfig {
  name: string;
  symbol: string;
  network: string;
  strategies: VotingStrategy[];
  members: string[];
  admins: string[];
  voting: VotingConfig;
}

interface VotingStrategy {
  name: string;
  network: string;
  params: Record<string, unknown>;
}

interface VotingConfig {
  delay: number;
  period: number;
  quorum: number;
  type: 'single-choice' | 'approval' | 'quadratic' | 'ranked-choice' | 'weighted';
}

interface SnapshotProposal {
  title: string;
  body: string;
  choices: string[];
  start: number;
  end: number;
  snapshot: number;
  type: string;
}

interface SnapshotProposalResult {
  id: string;
  ipfs: string;
  author: string;
}

interface SnapshotVoteResult {
  id: string;
  ipfs: string;
  voter: string;
  choice: number | number[];
  vp: number;
}

interface SnapshotProposalDetails {
  id: string;
  title: string;
  body: string;
  choices: string[];
  start: number;
  end: number;
  snapshot: number;
  state: 'pending' | 'active' | 'closed';
  scores: number[];
  scores_total: number;
  votes: number;
}
```


## Implementation Patterns

### OpenZeppelin Governor Implementation

```typescript
class GovernorService implements GovernanceService {
  private governor: ethers.Contract;
  private token: ethers.Contract;
  private timelock: ethers.Contract;
  private signer: ethers.Signer;

  constructor(
    governorAddress: string,
    tokenAddress: string,
    timelockAddress: string,
    signer: ethers.Signer
  ) {
    this.governor = new ethers.Contract(governorAddress, GovernorABI, signer);
    this.token = new ethers.Contract(tokenAddress, GovernanceTokenABI, signer);
    this.timelock = new ethers.Contract(timelockAddress, TimelockControllerABI, signer);
    this.signer = signer;
  }

  async createProposal(proposal: ProposalParams): Promise<ProposalResult> {
    // Verify proposer has enough voting power
    const proposalThreshold = await this.governor.proposalThreshold();
    const votingPower = await this.getVotingPower(await this.signer.getAddress());
    
    if (votingPower < proposalThreshold) {
      throw new Error(`Insufficient voting power. Required: ${proposalThreshold}, Have: ${votingPower}`);
    }

    const tx = await this.governor.propose(
      proposal.targets,
      proposal.values,
      proposal.calldatas,
      proposal.description
    );

    const receipt = await tx.wait();
    const proposalCreatedEvent = this.findEvent(receipt, 'ProposalCreated');

    return {
      proposalId: proposalCreatedEvent.args.proposalId,
      transactionHash: receipt.hash,
      proposer: proposalCreatedEvent.args.proposer,
      startBlock: Number(proposalCreatedEvent.args.startBlock),
      endBlock: Number(proposalCreatedEvent.args.endBlock)
    };
  }

  async castVote(proposalId: bigint, support: VoteType, reason?: string): Promise<VoteResult> {
    let tx;
    if (reason) {
      tx = await this.governor.castVoteWithReason(proposalId, support, reason);
    } else {
      tx = await this.governor.castVote(proposalId, support);
    }

    const receipt = await tx.wait();
    const voteCastEvent = this.findEvent(receipt, 'VoteCast');

    return {
      transactionHash: receipt.hash,
      proposalId,
      voter: voteCastEvent.args.voter,
      support,
      weight: voteCastEvent.args.weight,
      reason
    };
  }

  async castVoteWithSignature(
    proposalId: bigint,
    support: VoteType,
    signature: string
  ): Promise<VoteResult> {
    const { v, r, s } = ethers.Signature.from(signature);
    
    const tx = await this.governor.castVoteBySig(proposalId, support, v, r, s);
    const receipt = await tx.wait();
    const voteCastEvent = this.findEvent(receipt, 'VoteCast');

    return {
      transactionHash: receipt.hash,
      proposalId,
      voter: voteCastEvent.args.voter,
      support,
      weight: voteCastEvent.args.weight
    };
  }

  async queue(proposalId: bigint): Promise<QueueResult> {
    const proposal = await this.getProposal(proposalId);
    const descriptionHash = ethers.keccak256(ethers.toUtf8Bytes(proposal.description));

    const tx = await this.governor.queue(
      proposal.targets,
      proposal.values,
      proposal.calldatas,
      descriptionHash
    );

    const receipt = await tx.wait();
    const queuedEvent = this.findEvent(receipt, 'ProposalQueued');

    return {
      transactionHash: receipt.hash,
      proposalId,
      eta: Number(queuedEvent.args.eta)
    };
  }

  async execute(proposalId: bigint): Promise<ExecutionResult> {
    const proposal = await this.getProposal(proposalId);
    const descriptionHash = ethers.keccak256(ethers.toUtf8Bytes(proposal.description));

    const tx = await this.governor.execute(
      proposal.targets,
      proposal.values,
      proposal.calldatas,
      descriptionHash
    );

    const receipt = await tx.wait();

    return {
      transactionHash: receipt.hash,
      proposalId,
      executedAt: Math.floor(Date.now() / 1000)
    };
  }

  async getProposal(proposalId: bigint): Promise<Proposal> {
    const [
      proposer,
      startBlock,
      endBlock,
      forVotes,
      againstVotes,
      abstainVotes,
      canceled,
      executed
    ] = await Promise.all([
      this.governor.proposalProposer(proposalId),
      this.governor.proposalSnapshot(proposalId),
      this.governor.proposalDeadline(proposalId),
      this.governor.proposalVotes(proposalId).then((v: any) => v.forVotes),
      this.governor.proposalVotes(proposalId).then((v: any) => v.againstVotes),
      this.governor.proposalVotes(proposalId).then((v: any) => v.abstainVotes),
      this.governor.proposalCanceled?.(proposalId) ?? false,
      this.governor.proposalExecuted?.(proposalId) ?? false
    ]);

    const state = await this.getProposalState(proposalId);

    return {
      id: proposalId,
      proposer,
      targets: [],
      values: [],
      calldatas: [],
      description: '',
      startBlock: Number(startBlock),
      endBlock: Number(endBlock),
      forVotes,
      againstVotes,
      abstainVotes,
      state
    };
  }

  async getProposalState(proposalId: bigint): Promise<ProposalState> {
    return this.governor.state(proposalId);
  }

  async getVotingPower(account: string, blockNumber?: number): Promise<bigint> {
    if (blockNumber) {
      return this.token.getPastVotes(account, blockNumber);
    }
    return this.token.getVotes(account);
  }
}
```

### Delegation Implementation

```typescript
class DelegationServiceImpl implements DelegationService {
  private token: ethers.Contract;
  private signer: ethers.Signer;

  constructor(tokenAddress: string, signer: ethers.Signer) {
    this.token = new ethers.Contract(tokenAddress, GovernanceTokenABI, signer);
    this.signer = signer;
  }

  async delegate(delegatee: string): Promise<DelegationResult> {
    const delegator = await this.signer.getAddress();
    const fromDelegate = await this.getDelegates(delegator);

    const tx = await this.token.delegate(delegatee);
    const receipt = await tx.wait();

    const delegateChangedEvent = this.findEvent(receipt, 'DelegateChanged');
    const votingPower = await this.getCurrentVotes(delegatee);

    return {
      transactionHash: receipt.hash,
      delegator,
      fromDelegate,
      toDelegate: delegatee,
      votingPower
    };
  }

  async delegateBySig(
    delegatee: string,
    nonce: bigint,
    expiry: number,
    signature: string
  ): Promise<DelegationResult> {
    const { v, r, s } = ethers.Signature.from(signature);
    
    const tx = await this.token.delegateBySig(delegatee, nonce, expiry, v, r, s);
    const receipt = await tx.wait();

    const delegateChangedEvent = this.findEvent(receipt, 'DelegateChanged');

    return {
      transactionHash: receipt.hash,
      delegator: delegateChangedEvent.args.delegator,
      fromDelegate: delegateChangedEvent.args.fromDelegate,
      toDelegate: delegateChangedEvent.args.toDelegate,
      votingPower: await this.getCurrentVotes(delegatee)
    };
  }

  async getDelegates(account: string): Promise<string> {
    return this.token.delegates(account);
  }

  async getCurrentVotes(account: string): Promise<bigint> {
    return this.token.getVotes(account);
  }

  async getPriorVotes(account: string, blockNumber: number): Promise<bigint> {
    return this.token.getPastVotes(account, blockNumber);
  }

  async getDelegationHistory(account: string): Promise<DelegationEvent[]> {
    const filter = this.token.filters.DelegateChanged(account);
    const events = await this.token.queryFilter(filter);

    return Promise.all(events.map(async (event) => {
      const block = await event.getBlock();
      return {
        delegator: event.args!.delegator,
        fromDelegate: event.args!.fromDelegate,
        toDelegate: event.args!.toDelegate,
        blockNumber: event.blockNumber,
        timestamp: block.timestamp,
        transactionHash: event.transactionHash
      };
    }));
  }
}
```

## Integration Points

### Tally Integration

```typescript
class TallyIntegration {
  private apiUrl = 'https://api.tally.xyz/query';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getGovernance(chainId: number, governorAddress: string): Promise<TallyGovernance> {
    const query = `
      query Governance($chainId: ChainID!, $address: Address!) {
        governance(chainId: $chainId, address: $address) {
          id
          name
          slug
          proposalCount
          voterCount
          tokenHolderCount
          delegateCount
        }
      }
    `;

    const response = await this.executeQuery(query, {
      chainId: `eip155:${chainId}`,
      address: governorAddress
    });

    return response.governance;
  }

  async getProposals(governanceId: string, first: number = 10): Promise<TallyProposal[]> {
    const query = `
      query Proposals($governanceId: AccountID!, $first: Int!) {
        proposals(governanceId: $governanceId, first: $first) {
          nodes {
            id
            title
            description
            status
            createdAt
            startBlock
            endBlock
            forVotes
            againstVotes
            abstainVotes
            quorum
          }
        }
      }
    `;

    const response = await this.executeQuery(query, { governanceId, first });
    return response.proposals.nodes;
  }

  private async executeQuery(query: string, variables: Record<string, unknown>): Promise<any> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': this.apiKey
      },
      body: JSON.stringify({ query, variables })
    });

    const result = await response.json();
    return result.data;
  }
}
```

## Security Considerations

### Governance Security
- Implement proposal threshold to prevent spam
- Use timelock delays for critical operations
- Implement quorum requirements
- Protect against flash loan governance attacks
- Monitor for unusual voting patterns

### Voting Security
- Snapshot voting power at proposal creation
- Prevent double voting
- Validate vote signatures
- Implement vote delegation limits
- Monitor for vote buying

### Execution Security
- Validate proposal targets and calldatas
- Implement emergency cancellation
- Use multi-sig for critical operations
- Monitor executed proposals
- Implement circuit breakers

## Compliance Guidelines

- Maintain transparent voting records
- Implement proposal disclosure requirements
- Support regulatory reporting
- Maintain audit trails for all governance actions
- Implement geographic restrictions if required

## Testing Considerations

### Property-Based Tests

```typescript
describe('Governance System Properties', () => {
  it('should maintain voting power consistency', () => {
    fc.assert(fc.property(
      fc.hexaString({ minLength: 40, maxLength: 40 }),
      fc.bigInt({ min: 1n, max: ethers.parseEther('1000000') }),
      async (delegatee, amount) => {
        const service = new DelegationServiceImpl(tokenAddress, mockSigner);
        
        const initialVotes = await service.getCurrentVotes(`0x${delegatee}`);
        
        // After delegation, voting power should transfer
        await service.delegate(`0x${delegatee}`);
        
        const finalVotes = await service.getCurrentVotes(`0x${delegatee}`);
        expect(finalVotes).toBeGreaterThanOrEqual(initialVotes);
      }
    ));
  });

  it('should correctly track proposal states', () => {
    fc.assert(fc.property(
      fc.bigInt({ min: 1n, max: 1000n }),
      async (proposalId) => {
        const service = new GovernorService(governorAddress, tokenAddress, timelockAddress, mockSigner);
        
        const state = await service.getProposalState(proposalId);
        
        // State should be a valid ProposalState
        expect(Object.values(ProposalState)).toContain(state);
      }
    ));
  });
});
```
