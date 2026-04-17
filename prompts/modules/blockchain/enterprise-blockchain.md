# Enterprise Blockchain Template

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

This template provides comprehensive patterns for implementing enterprise blockchain solutions including private networks, consortium chains, permissioned systems, and enterprise-grade security. It covers Hyperledger Fabric, Quorum, and private Ethereum networks for business applications.

## Context

Enterprise blockchain enables organizations to leverage distributed ledger technology with enhanced privacy, permissioning, and compliance features. Modern enterprise blockchain systems must handle complex operations like identity management, access control, data privacy, and regulatory compliance while maintaining the benefits of blockchain technology for business processes.

## Core Components

### Private Network Service

## Examples

```typescript
interface PrivateNetworkService {
  createNetwork(config: NetworkConfig): Promise<NetworkResult>;
  addNode(networkId: string, node: NodeConfig): Promise<NodeResult>;
  removeNode(networkId: string, nodeId: string): Promise<void>;
  getNetworkStatus(networkId: string): Promise<NetworkStatus>;
  getNodes(networkId: string): Promise<NodeInfo[]>;
  updateNetworkConfig(networkId: string, config: Partial<NetworkConfig>): Promise<void>;
}


interface NetworkConfig {
  name: string;
  type: NetworkType;
  consensusAlgorithm: ConsensusAlgorithm;
  blockTime: number;
  gasLimit: bigint;
  chainId: number;
  initialValidators: ValidatorConfig[];
  permissioningConfig: PermissioningConfig;
  privacyConfig?: PrivacyConfig;
}

enum NetworkType {
  PRIVATE_ETHEREUM = 'private_ethereum',
  QUORUM = 'quorum',
  HYPERLEDGER_BESU = 'hyperledger_besu',
  HYPERLEDGER_FABRIC = 'hyperledger_fabric',
  CORDA = 'corda'
}

enum ConsensusAlgorithm {
  IBFT2 = 'ibft2',
  QBFT = 'qbft',
  CLIQUE = 'clique',
  RAFT = 'raft',
  PBFT = 'pbft'
}

interface ValidatorConfig {
  address: string;
  publicKey: string;
  name: string;
  organization: string;
}

interface PermissioningConfig {
  nodePermissioning: boolean;
  accountPermissioning: boolean;
  allowedNodes?: string[];
  allowedAccounts?: string[];
  adminAccounts: string[];
}

interface PrivacyConfig {
  enabled: boolean;
  privacyManager: PrivacyManagerType;
  enclaveUrl?: string;
  privateTransactionManager?: string;
}

enum PrivacyManagerType {
  TESSERA = 'tessera',
  ORION = 'orion',
  CONSTELLATION = 'constellation'
}

interface NetworkResult {
  networkId: string;
  chainId: number;
  genesisBlock: string;
  bootNodes: string[];
  status: NetworkStatus;
}

interface NetworkStatus {
  networkId: string;
  isRunning: boolean;
  nodeCount: number;
  blockHeight: number;
  consensusStatus: string;
  lastBlockTime: number;
}

interface NodeConfig {
  name: string;
  type: NodeType;
  organization: string;
  host: string;
  ports: NodePorts;
  isValidator: boolean;
}

enum NodeType {
  VALIDATOR = 'validator',
  MEMBER = 'member',
  BOOTNODE = 'bootnode',
  RPC = 'rpc'
}

interface NodePorts {
  p2p: number;
  rpc: number;
  ws?: number;
  graphql?: number;
}

interface NodeResult {
  nodeId: string;
  enode: string;
  publicKey: string;
  status: 'running' | 'stopped' | 'syncing';
}

interface NodeInfo {
  nodeId: string;
  name: string;
  organization: string;
  type: NodeType;
  enode: string;
  status: 'running' | 'stopped' | 'syncing';
  blockHeight: number;
  peerCount: number;
}
```

### Consortium Management Service

```typescript
interface ConsortiumService {
  createConsortium(config: ConsortiumConfig): Promise<ConsortiumResult>;
  addMember(consortiumId: string, member: MemberConfig): Promise<MemberResult>;
  removeMember(consortiumId: string, memberId: string): Promise<void>;
  updateMemberPermissions(consortiumId: string, memberId: string, permissions: MemberPermissions): Promise<void>;
  getConsortiumInfo(consortiumId: string): Promise<ConsortiumInfo>;
  getMembers(consortiumId: string): Promise<MemberInfo[]>;
  proposeChange(consortiumId: string, proposal: ConsortiumProposal): Promise<ProposalResult>;
  voteOnProposal(consortiumId: string, proposalId: string, vote: boolean): Promise<VoteResult>;
}

interface ConsortiumConfig {
  name: string;
  description: string;
  governanceModel: GovernanceModel;
  votingThreshold: number;
  initialMembers: MemberConfig[];
}

enum GovernanceModel {
  UNANIMOUS = 'unanimous',
  MAJORITY = 'majority',
  SUPERMAJORITY = 'supermajority',
  WEIGHTED = 'weighted'
}

interface MemberConfig {
  organizationId: string;
  name: string;
  role: MemberRole;
  votingWeight?: number;
  nodes: string[];
  adminAccounts: string[];
}

enum MemberRole {
  FOUNDER = 'founder',
  VALIDATOR = 'validator',
  MEMBER = 'member',
  OBSERVER = 'observer'
}

interface MemberPermissions {
  canValidate: boolean;
  canPropose: boolean;
  canVote: boolean;
  canAddNodes: boolean;
  canDeployContracts: boolean;
  canAccessPrivateTransactions: boolean;
}

interface ConsortiumInfo {
  consortiumId: string;
  name: string;
  description: string;
  governanceModel: GovernanceModel;
  memberCount: number;
  activeProposals: number;
  createdAt: number;
}

interface MemberInfo {
  memberId: string;
  organizationId: string;
  name: string;
  role: MemberRole;
  permissions: MemberPermissions;
  nodeCount: number;
  joinedAt: number;
}

interface ConsortiumProposal {
  type: ProposalType;
  description: string;
  data: Record<string, unknown>;
  votingPeriod: number;
}

enum ProposalType {
  ADD_MEMBER = 'add_member',
  REMOVE_MEMBER = 'remove_member',
  UPDATE_PERMISSIONS = 'update_permissions',
  NETWORK_UPGRADE = 'network_upgrade',
  PARAMETER_CHANGE = 'parameter_change'
}
```

### Private Transaction Service

```typescript
interface PrivateTransactionService {
  sendPrivateTransaction(params: PrivateTransactionParams): Promise<PrivateTransactionResult>;
  getPrivateTransaction(hash: string): Promise<PrivateTransaction>;
  createPrivacyGroup(members: string[]): Promise<PrivacyGroup>;
  getPrivacyGroup(groupId: string): Promise<PrivacyGroup>;
  findPrivacyGroups(members: string[]): Promise<PrivacyGroup[]>;
  deletePrivacyGroup(groupId: string): Promise<void>;
}

interface PrivateTransactionParams {
  from: string;
  to?: string;
  data: string;
  privateFrom: string;
  privateFor?: string[];
  privacyGroupId?: string;
  restriction?: PrivacyRestriction;
}

enum PrivacyRestriction {
  RESTRICTED = 'restricted',
  UNRESTRICTED = 'unrestricted'
}

interface PrivateTransactionResult {
  transactionHash: string;
  privateTransactionHash: string;
  privacyGroupId: string;
  status: 'pending' | 'success' | 'failed';
}

interface PrivateTransaction {
  hash: string;
  privateHash: string;
  from: string;
  to?: string;
  input: string;
  privacyGroupId: string;
  privateFrom: string;
  privateFor: string[];
  restriction: PrivacyRestriction;
  blockNumber: number;
  blockHash: string;
}

interface PrivacyGroup {
  privacyGroupId: string;
  name?: string;
  description?: string;
  type: PrivacyGroupType;
  members: string[];
}

enum PrivacyGroupType {
  LEGACY = 'legacy',
  PANTHEON = 'pantheon',
  ONCHAIN = 'onchain'
}
```

### Identity and Access Management Service

```typescript
interface EnterpriseIdentityService {
  registerIdentity(identity: IdentityRegistration): Promise<IdentityResult>;
  verifyIdentity(address: string): Promise<IdentityVerification>;
  updateIdentity(address: string, updates: Partial<IdentityRegistration>): Promise<void>;
  revokeIdentity(address: string, reason: string): Promise<void>;
  getIdentity(address: string): Promise<EnterpriseIdentity>;
  listIdentities(filter?: IdentityFilter): Promise<EnterpriseIdentity[]>;
  assignRole(address: string, role: string): Promise<void>;
  revokeRole(address: string, role: string): Promise<void>;
  checkPermission(address: string, permission: string): Promise<boolean>;
}

interface IdentityRegistration {
  address: string;
  organizationId: string;
  name: string;
  email: string;
  roles: string[];
  attributes: Record<string, string>;
  validUntil?: number;
}

interface IdentityResult {
  address: string;
  identityId: string;
  registeredAt: number;
  status: IdentityStatus;
}

enum IdentityStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  REVOKED = 'revoked'
}

interface IdentityVerification {
  isVerified: boolean;
  identity?: EnterpriseIdentity;
  verificationTime: number;
}

interface EnterpriseIdentity {
  address: string;
  identityId: string;
  organizationId: string;
  name: string;
  roles: string[];
  permissions: string[];
  attributes: Record<string, string>;
  status: IdentityStatus;
  registeredAt: number;
  lastUpdated: number;
}

interface IdentityFilter {
  organizationId?: string;
  role?: string;
  status?: IdentityStatus;
  limit?: number;
  offset?: number;
}
```


## Implementation Patterns

### Hyperledger Besu Private Network

```typescript
class BesuPrivateNetworkService implements PrivateNetworkService {
  private adminClient: BesuAdminClient;
  private permissioningContract: ethers.Contract;

  constructor(rpcUrl: string, permissioningAddress: string, signer: ethers.Signer) {
    this.adminClient = new BesuAdminClient(rpcUrl);
    this.permissioningContract = new ethers.Contract(
      permissioningAddress,
      NodePermissioningABI,
      signer
    );
  }

  async createNetwork(config: NetworkConfig): Promise<NetworkResult> {
    // Generate genesis file
    const genesis = this.generateGenesis(config);
    
    // Initialize network
    const networkId = crypto.randomUUID();
    
    // Deploy permissioning contracts if enabled
    if (config.permissioningConfig.nodePermissioning) {
      await this.deployNodePermissioning(config.permissioningConfig);
    }
    
    if (config.permissioningConfig.accountPermissioning) {
      await this.deployAccountPermissioning(config.permissioningConfig);
    }

    return {
      networkId,
      chainId: config.chainId,
      genesisBlock: JSON.stringify(genesis),
      bootNodes: config.initialValidators.map(v => this.generateEnode(v)),
      status: {
        networkId,
        isRunning: true,
        nodeCount: config.initialValidators.length,
        blockHeight: 0,
        consensusStatus: 'active',
        lastBlockTime: Date.now()
      }
    };
  }

  async addNode(networkId: string, node: NodeConfig): Promise<NodeResult> {
    // Generate node keys
    const nodeKeys = await this.generateNodeKeys();
    
    // Add to permissioning if enabled
    if (node.isValidator) {
      await this.addValidator(nodeKeys.address);
    }
    
    await this.permissioningContract.addNode(
      nodeKeys.enode,
      node.host,
      node.ports.p2p
    );

    return {
      nodeId: nodeKeys.nodeId,
      enode: nodeKeys.enode,
      publicKey: nodeKeys.publicKey,
      status: 'syncing'
    };
  }

  private generateGenesis(config: NetworkConfig): BesuGenesis {
    const extraData = this.generateIBFT2ExtraData(config.initialValidators);
    
    return {
      config: {
        chainId: config.chainId,
        berlinBlock: 0,
        londonBlock: 0,
        ibft2: {
          blockperiodseconds: config.blockTime,
          epochlength: 30000,
          requesttimeoutseconds: 4
        }
      },
      nonce: '0x0',
      timestamp: '0x0',
      gasLimit: `0x${config.gasLimit.toString(16)}`,
      difficulty: '0x1',
      mixHash: '0x63746963616c2062797a616e74696e65206661756c7420746f6c6572616e6365',
      coinbase: '0x0000000000000000000000000000000000000000',
      alloc: this.generateAlloc(config.permissioningConfig.adminAccounts),
      extraData
    };
  }

  private generateIBFT2ExtraData(validators: ValidatorConfig[]): string {
    const validatorAddresses = validators.map(v => v.address.toLowerCase().replace('0x', ''));
    const vanityData = '0'.repeat(64);
    const validatorList = validatorAddresses.join('');
    const seal = '0'.repeat(130);
    const committedSeals = '';
    
    return `0x${vanityData}${validatorList}${seal}${committedSeals}`;
  }

  private async addValidator(address: string): Promise<void> {
    const tx = await this.permissioningContract.proposeValidatorAdd(address);
    await tx.wait();
  }
}

interface BesuGenesis {
  config: {
    chainId: number;
    berlinBlock: number;
    londonBlock: number;
    ibft2: {
      blockperiodseconds: number;
      epochlength: number;
      requesttimeoutseconds: number;
    };
  };
  nonce: string;
  timestamp: string;
  gasLimit: string;
  difficulty: string;
  mixHash: string;
  coinbase: string;
  alloc: Record<string, { balance: string }>;
  extraData: string;
}
```

### Private Transaction Implementation

```typescript
class TesseraPrivateTransactionService implements PrivateTransactionService {
  private besuClient: ethers.JsonRpcProvider;
  private tesseraClient: TesseraClient;
  private signer: ethers.Signer;

  constructor(besuUrl: string, tesseraUrl: string, signer: ethers.Signer) {
    this.besuClient = new ethers.JsonRpcProvider(besuUrl);
    this.tesseraClient = new TesseraClient(tesseraUrl);
    this.signer = signer;
  }

  async sendPrivateTransaction(params: PrivateTransactionParams): Promise<PrivateTransactionResult> {
    // Create privacy group if using privateFor
    let privacyGroupId = params.privacyGroupId;
    if (!privacyGroupId && params.privateFor) {
      const group = await this.createPrivacyGroup([params.privateFrom, ...params.privateFor]);
      privacyGroupId = group.privacyGroupId;
    }

    // Build private transaction
    const privateTx = {
      from: params.from,
      to: params.to,
      data: params.data,
      privateFrom: params.privateFrom,
      privacyGroupId,
      restriction: params.restriction || PrivacyRestriction.RESTRICTED
    };

    // Send via Besu private transaction API
    const result = await this.besuClient.send('eea_sendRawTransaction', [
      await this.signPrivateTransaction(privateTx)
    ]);

    // Get private transaction receipt
    const receipt = await this.waitForPrivateReceipt(result);

    return {
      transactionHash: result,
      privateTransactionHash: receipt.privateTransactionHash,
      privacyGroupId: privacyGroupId!,
      status: receipt.status === '0x1' ? 'success' : 'failed'
    };
  }

  async createPrivacyGroup(members: string[]): Promise<PrivacyGroup> {
    const result = await this.besuClient.send('priv_createPrivacyGroup', [{
      addresses: members,
      name: `Privacy Group ${Date.now()}`,
      description: 'Auto-created privacy group'
    }]);

    return {
      privacyGroupId: result,
      members,
      type: PrivacyGroupType.PANTHEON
    };
  }

  async getPrivateTransaction(hash: string): Promise<PrivateTransaction> {
    const tx = await this.besuClient.send('priv_getPrivateTransaction', [hash]);
    
    return {
      hash: tx.hash,
      privateHash: tx.privateHash,
      from: tx.from,
      to: tx.to,
      input: tx.input,
      privacyGroupId: tx.privacyGroupId,
      privateFrom: tx.privateFrom,
      privateFor: tx.privateFor || [],
      restriction: tx.restriction,
      blockNumber: parseInt(tx.blockNumber, 16),
      blockHash: tx.blockHash
    };
  }

  private async signPrivateTransaction(tx: any): Promise<string> {
    // Sign the private transaction
    const signedTx = await this.signer.signTransaction({
      to: tx.to,
      data: tx.data,
      gasLimit: 3000000n,
      gasPrice: 0n,
      nonce: await this.besuClient.getTransactionCount(tx.from)
    });

    return signedTx;
  }

  private async waitForPrivateReceipt(hash: string): Promise<any> {
    let receipt = null;
    while (!receipt) {
      receipt = await this.besuClient.send('priv_getTransactionReceipt', [hash]);
      if (!receipt) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    return receipt;
  }
}
```

## Integration Points

### Enterprise Identity Integration

```typescript
class EnterpriseIdentityServiceImpl implements EnterpriseIdentityService {
  private identityRegistry: ethers.Contract;
  private roleManager: ethers.Contract;
  private signer: ethers.Signer;

  constructor(
    identityRegistryAddress: string,
    roleManagerAddress: string,
    signer: ethers.Signer
  ) {
    this.identityRegistry = new ethers.Contract(identityRegistryAddress, IdentityRegistryABI, signer);
    this.roleManager = new ethers.Contract(roleManagerAddress, RoleManagerABI, signer);
    this.signer = signer;
  }

  async registerIdentity(identity: IdentityRegistration): Promise<IdentityResult> {
    const identityId = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ['address', 'string', 'uint256'],
        [identity.address, identity.organizationId, Date.now()]
      )
    );

    const tx = await this.identityRegistry.registerIdentity(
      identity.address,
      identityId,
      identity.organizationId,
      identity.name,
      identity.validUntil || 0
    );
    await tx.wait();

    // Assign initial roles
    for (const role of identity.roles) {
      await this.assignRole(identity.address, role);
    }

    return {
      address: identity.address,
      identityId,
      registeredAt: Date.now(),
      status: IdentityStatus.ACTIVE
    };
  }

  async verifyIdentity(address: string): Promise<IdentityVerification> {
    const identity = await this.identityRegistry.getIdentity(address);
    
    if (!identity.isRegistered) {
      return {
        isVerified: false,
        verificationTime: Date.now()
      };
    }

    const isActive = identity.status === 0; // ACTIVE
    const isNotExpired = identity.validUntil === 0 || identity.validUntil > Date.now() / 1000;

    return {
      isVerified: isActive && isNotExpired,
      identity: this.mapIdentity(identity),
      verificationTime: Date.now()
    };
  }

  async assignRole(address: string, role: string): Promise<void> {
    const roleHash = ethers.keccak256(ethers.toUtf8Bytes(role));
    const tx = await this.roleManager.grantRole(roleHash, address);
    await tx.wait();
  }

  async checkPermission(address: string, permission: string): Promise<boolean> {
    const permissionHash = ethers.keccak256(ethers.toUtf8Bytes(permission));
    return this.roleManager.hasPermission(address, permissionHash);
  }
}
```

## Security Considerations

### Network Security
- Implement node permissioning
- Use TLS for all communications
- Rotate validator keys regularly
- Monitor for unauthorized nodes
- Implement network segmentation

### Transaction Security
- Encrypt private transactions
- Implement access controls
- Validate transaction signatures
- Monitor for suspicious activity
- Implement audit logging

### Identity Security
- Implement strong authentication
- Use hardware security modules
- Implement key rotation
- Monitor for identity fraud
- Implement revocation mechanisms

## Compliance Guidelines

- Implement comprehensive audit trails
- Support regulatory reporting
- Maintain data retention policies
- Implement geographic restrictions
- Support compliance frameworks (SOC2, ISO 27001)

## Testing Considerations

### Property-Based Tests

```typescript
describe('Enterprise Blockchain Properties', () => {
  it('should maintain permissioning consistency', () => {
    fc.assert(fc.property(
      fc.hexaString({ minLength: 40, maxLength: 40 }),
      fc.constantFrom('validator', 'member', 'observer'),
      async (address, role) => {
        const service = new EnterpriseIdentityServiceImpl(registryAddress, roleManagerAddress, mockSigner);
        
        // Register identity
        await service.registerIdentity({
          address: `0x${address}`,
          organizationId: 'org-1',
          name: 'Test User',
          email: 'test@example.com',
          roles: [role],
          attributes: {}
        });

        // Verify identity
        const verification = await service.verifyIdentity(`0x${address}`);
        expect(verification.isVerified).toBe(true);
        
        // Check role assignment
        const hasRole = await service.checkPermission(`0x${address}`, role);
        expect(hasRole).toBe(true);
      }
    ));
  });

  it('should maintain privacy group membership', () => {
    fc.assert(fc.property(
      fc.array(fc.hexaString({ minLength: 64, maxLength: 64 }), { minLength: 2, maxLength: 5 }),
      async (members) => {
        const service = new TesseraPrivateTransactionService(besuUrl, tesseraUrl, mockSigner);
        
        const group = await service.createPrivacyGroup(members.map(m => `0x${m}`));
        
        // Group should contain all members
        expect(group.members.length).toBe(members.length);
        
        // Should be able to find the group
        const found = await service.findPrivacyGroups(members.map(m => `0x${m}`));
        expect(found.some(g => g.privacyGroupId === group.privacyGroupId)).toBe(true);
      }
    ));
  });
});
```
