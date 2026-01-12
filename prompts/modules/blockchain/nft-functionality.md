# NFT Functionality Template

## Purpose

This template provides comprehensive patterns for NFT minting, trading, metadata management, royalty systems, and marketplace integration in blockchain applications. It covers ERC-721 and ERC-1155 standards, IPFS storage, and advanced NFT features like lazy minting and batch operations.

## Context

NFTs (Non-Fungible Tokens) enable unique digital asset ownership and have applications in art, gaming, collectibles, and real-world asset tokenization. Modern NFT systems must handle complex operations like minting, trading, metadata storage, royalty distribution, and marketplace integration while ensuring authenticity, provenance tracking, and gas efficiency.

## Core Components

### NFT Minting Service

## Examples

```typescript
interface NFTMintingService {
  mint(collection: string, to: string, metadata: NFTMetadata): Promise<MintResult>;
  batchMint(collection: string, to: string, metadataList: NFTMetadata[]): Promise<BatchMintResult>;
  lazyMint(collection: string, metadata: NFTMetadata, signature: string): Promise<LazyMintVoucher>;
  redeemLazyMint(voucher: LazyMintVoucher): Promise<MintResult>;
  burn(collection: string, tokenId: bigint): Promise<TransactionReceipt>;
}


interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  externalUrl?: string;
  animationUrl?: string;
  attributes: NFTAttribute[];
  properties?: Record<string, unknown>;
}

interface NFTAttribute {
  traitType: string;
  value: string | number;
  displayType?: 'number' | 'boost_number' | 'boost_percentage' | 'date';
  maxValue?: number;
}

interface MintResult {
  tokenId: bigint;
  transactionHash: string;
  blockNumber: number;
  owner: string;
  tokenURI: string;
  metadata: NFTMetadata;
}

interface BatchMintResult {
  tokenIds: bigint[];
  transactionHash: string;
  blockNumber: number;
  owner: string;
  count: number;
}

interface LazyMintVoucher {
  tokenId: bigint;
  minPrice: bigint;
  uri: string;
  creator: string;
  signature: string;
  deadline: number;
}
```

### NFT Trading Service

```typescript
interface NFTTradingService {
  listForSale(listing: NFTListing): Promise<ListingResult>;
  cancelListing(listingId: string): Promise<TransactionReceipt>;
  buy(listingId: string, price: bigint): Promise<PurchaseResult>;
  makeOffer(offer: NFTOffer): Promise<OfferResult>;
  acceptOffer(offerId: string): Promise<PurchaseResult>;
  cancelOffer(offerId: string): Promise<TransactionReceipt>;
  createAuction(auction: NFTAuction): Promise<AuctionResult>;
  placeBid(auctionId: string, amount: bigint): Promise<BidResult>;
  settleAuction(auctionId: string): Promise<SettlementResult>;
}

interface NFTListing {
  collection: string;
  tokenId: bigint;
  price: bigint;
  currency: string; // Token address or zero address for ETH
  expirationTime: number;
  seller: string;
}

interface ListingResult {
  listingId: string;
  transactionHash: string;
  listing: NFTListing;
  status: 'active' | 'sold' | 'cancelled' | 'expired';
}

interface NFTOffer {
  collection: string;
  tokenId: bigint;
  amount: bigint;
  currency: string;
  expirationTime: number;
  buyer: string;
}

interface OfferResult {
  offerId: string;
  transactionHash: string;
  offer: NFTOffer;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
}

interface NFTAuction {
  collection: string;
  tokenId: bigint;
  startingPrice: bigint;
  reservePrice?: bigint;
  currency: string;
  startTime: number;
  endTime: number;
  minBidIncrement: bigint;
}

interface AuctionResult {
  auctionId: string;
  transactionHash: string;
  auction: NFTAuction;
  status: 'pending' | 'active' | 'ended' | 'settled' | 'cancelled';
  highestBid?: bigint;
  highestBidder?: string;
}

interface BidResult {
  bidId: string;
  transactionHash: string;
  auctionId: string;
  bidder: string;
  amount: bigint;
  isHighestBid: boolean;
}

interface PurchaseResult {
  transactionHash: string;
  blockNumber: number;
  collection: string;
  tokenId: bigint;
  buyer: string;
  seller: string;
  price: bigint;
  royaltyPaid: bigint;
  platformFee: bigint;
}
```

### Metadata Service

```typescript
interface NFTMetadataService {
  uploadMetadata(metadata: NFTMetadata): Promise<MetadataUploadResult>;
  uploadImage(image: File | Buffer, options?: UploadOptions): Promise<ImageUploadResult>;
  getMetadata(tokenURI: string): Promise<NFTMetadata>;
  updateMetadata(tokenId: bigint, metadata: Partial<NFTMetadata>): Promise<MetadataUploadResult>;
  pinMetadata(cid: string): Promise<PinResult>;
  unpinMetadata(cid: string): Promise<void>;
}

interface MetadataUploadResult {
  uri: string;
  cid: string;
  gateway: string;
  size: number;
}

interface ImageUploadResult {
  uri: string;
  cid: string;
  gateway: string;
  mimeType: string;
  size: number;
  dimensions?: { width: number; height: number };
}

interface UploadOptions {
  pinToIPFS?: boolean;
  gateway?: string;
  wrapWithDirectory?: boolean;
}

interface PinResult {
  cid: string;
  status: 'pinned' | 'pinning' | 'failed';
  timestamp: number;
}
```

### Royalty Service

```typescript
interface NFTRoyaltyService {
  setRoyalty(collection: string, recipient: string, basisPoints: number): Promise<TransactionReceipt>;
  setTokenRoyalty(collection: string, tokenId: bigint, recipient: string, basisPoints: number): Promise<TransactionReceipt>;
  getRoyaltyInfo(collection: string, tokenId: bigint, salePrice: bigint): Promise<RoyaltyInfo>;
  calculateRoyalty(salePrice: bigint, basisPoints: number): bigint;
  supportsRoyalties(collection: string): Promise<boolean>;
}

interface RoyaltyInfo {
  recipient: string;
  amount: bigint;
  basisPoints: number;
}

// EIP-2981 Royalty Standard
const EIP2981_INTERFACE_ID = '0x2a55205a';
```

### Collection Management Service

```typescript
interface NFTCollectionService {
  createCollection(config: CollectionConfig): Promise<DeployedCollection>;
  getCollectionInfo(address: string): Promise<CollectionInfo>;
  setBaseURI(collection: string, baseURI: string): Promise<TransactionReceipt>;
  setContractURI(collection: string, contractURI: string): Promise<TransactionReceipt>;
  pause(collection: string): Promise<TransactionReceipt>;
  unpause(collection: string): Promise<TransactionReceipt>;
  transferOwnership(collection: string, newOwner: string): Promise<TransactionReceipt>;
}

interface CollectionConfig {
  name: string;
  symbol: string;
  baseURI: string;
  contractURI?: string;
  maxSupply?: bigint;
  mintPrice?: bigint;
  maxPerWallet?: number;
  royaltyRecipient?: string;
  royaltyBps?: number;
  isRevealed?: boolean;
  revealedBaseURI?: string;
}

interface CollectionInfo {
  address: string;
  name: string;
  symbol: string;
  totalSupply: bigint;
  maxSupply?: bigint;
  baseURI: string;
  contractURI?: string;
  owner: string;
  isPaused: boolean;
  royaltyInfo?: RoyaltyInfo;
}

interface DeployedCollection {
  address: string;
  transactionHash: string;
  blockNumber: number;
  config: CollectionConfig;
}
```


## Implementation Patterns

### NFT Minting Implementation

```typescript
class NFTMintingServiceImpl implements NFTMintingService {
  private signer: ethers.Signer;
  private metadataService: NFTMetadataService;

  constructor(signer: ethers.Signer, metadataService: NFTMetadataService) {
    this.signer = signer;
    this.metadataService = metadataService;
  }

  async mint(collection: string, to: string, metadata: NFTMetadata): Promise<MintResult> {
    // Upload metadata to IPFS
    const metadataResult = await this.metadataService.uploadMetadata(metadata);
    
    // Mint NFT
    const contract = new ethers.Contract(collection, ERC721MintableABI, this.signer);
    const tx = await contract.safeMint(to, metadataResult.uri);
    const receipt = await tx.wait();

    // Get token ID from Transfer event
    const transferEvent = receipt.logs.find((log: any) => {
      try {
        const parsed = contract.interface.parseLog({ topics: log.topics, data: log.data });
        return parsed?.name === 'Transfer';
      } catch {
        return false;
      }
    });

    const tokenId = transferEvent ? 
      contract.interface.parseLog({ topics: transferEvent.topics, data: transferEvent.data })!.args[2] : 
      0n;

    return {
      tokenId,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      owner: to,
      tokenURI: metadataResult.uri,
      metadata
    };
  }

  async batchMint(collection: string, to: string, metadataList: NFTMetadata[]): Promise<BatchMintResult> {
    // Upload all metadata
    const metadataResults = await Promise.all(
      metadataList.map(m => this.metadataService.uploadMetadata(m))
    );
    const uris = metadataResults.map(r => r.uri);

    // Batch mint
    const contract = new ethers.Contract(collection, ERC721BatchMintableABI, this.signer);
    const tx = await contract.batchMint(to, uris);
    const receipt = await tx.wait();

    // Extract token IDs from events
    const tokenIds = receipt.logs
      .filter((log: any) => {
        try {
          const parsed = contract.interface.parseLog({ topics: log.topics, data: log.data });
          return parsed?.name === 'Transfer';
        } catch {
          return false;
        }
      })
      .map((log: any) => {
        const parsed = contract.interface.parseLog({ topics: log.topics, data: log.data });
        return parsed!.args[2] as bigint;
      });

    return {
      tokenIds,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      owner: to,
      count: tokenIds.length
    };
  }

  async lazyMint(collection: string, metadata: NFTMetadata, signature: string): Promise<LazyMintVoucher> {
    // Upload metadata
    const metadataResult = await this.metadataService.uploadMetadata(metadata);
    
    // Create voucher
    const contract = new ethers.Contract(collection, LazyMintABI, this.signer);
    const nextTokenId = await contract.nextTokenId();
    const creator = await this.signer.getAddress();

    const voucher: LazyMintVoucher = {
      tokenId: nextTokenId,
      minPrice: 0n,
      uri: metadataResult.uri,
      creator,
      signature,
      deadline: Math.floor(Date.now() / 1000) + 86400 * 30 // 30 days
    };

    return voucher;
  }

  async redeemLazyMint(voucher: LazyMintVoucher): Promise<MintResult> {
    const contract = new ethers.Contract(voucher.creator, LazyMintABI, this.signer);
    
    const tx = await contract.redeem(
      voucher.tokenId,
      voucher.minPrice,
      voucher.uri,
      voucher.signature,
      { value: voucher.minPrice }
    );
    const receipt = await tx.wait();

    const metadata = await this.metadataService.getMetadata(voucher.uri);

    return {
      tokenId: voucher.tokenId,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      owner: await this.signer.getAddress(),
      tokenURI: voucher.uri,
      metadata
    };
  }

  async burn(collection: string, tokenId: bigint): Promise<TransactionReceipt> {
    const contract = new ethers.Contract(collection, ERC721BurnableABI, this.signer);
    const tx = await contract.burn(tokenId);
    const receipt = await tx.wait();

    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      status: receipt.status === 1 ? 'success' : 'failed',
      gasUsed: receipt.gasUsed
    };
  }
}
```

### Metadata Service Implementation

```typescript
class IPFSMetadataService implements NFTMetadataService {
  private ipfsClient: any; // IPFS HTTP client
  private pinataApiKey?: string;
  private gateway: string;

  constructor(config: MetadataServiceConfig) {
    this.gateway = config.gateway || 'https://ipfs.io/ipfs/';
    this.pinataApiKey = config.pinataApiKey;
  }

  async uploadMetadata(metadata: NFTMetadata): Promise<MetadataUploadResult> {
    // Validate metadata
    this.validateMetadata(metadata);

    // Upload to IPFS
    const content = JSON.stringify(metadata, null, 2);
    const result = await this.uploadToIPFS(content, 'application/json');

    // Pin if configured
    if (this.pinataApiKey) {
      await this.pinMetadata(result.cid);
    }

    return {
      uri: `ipfs://${result.cid}`,
      cid: result.cid,
      gateway: `${this.gateway}${result.cid}`,
      size: content.length
    };
  }

  async uploadImage(image: File | Buffer, options?: UploadOptions): Promise<ImageUploadResult> {
    const buffer = image instanceof File ? await image.arrayBuffer() : image;
    const mimeType = image instanceof File ? image.type : 'image/png';

    const result = await this.uploadToIPFS(Buffer.from(buffer), mimeType);

    // Pin if requested
    if (options?.pinToIPFS && this.pinataApiKey) {
      await this.pinMetadata(result.cid);
    }

    return {
      uri: `ipfs://${result.cid}`,
      cid: result.cid,
      gateway: `${this.gateway}${result.cid}`,
      mimeType,
      size: buffer.byteLength
    };
  }

  async getMetadata(tokenURI: string): Promise<NFTMetadata> {
    // Convert IPFS URI to HTTP gateway URL
    const url = this.resolveURI(tokenURI);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }

    return response.json();
  }

  async updateMetadata(tokenId: bigint, metadata: Partial<NFTMetadata>): Promise<MetadataUploadResult> {
    // Note: IPFS content is immutable, so we create new metadata
    // The contract must support updating tokenURI
    throw new Error('Metadata updates require contract support for setTokenURI');
  }

  async pinMetadata(cid: string): Promise<PinResult> {
    if (!this.pinataApiKey) {
      throw new Error('Pinata API key required for pinning');
    }

    const response = await fetch('https://api.pinata.cloud/pinning/pinByHash', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.pinataApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ hashToPin: cid })
    });

    if (!response.ok) {
      return { cid, status: 'failed', timestamp: Date.now() };
    }

    return { cid, status: 'pinned', timestamp: Date.now() };
  }

  async unpinMetadata(cid: string): Promise<void> {
    if (!this.pinataApiKey) {
      throw new Error('Pinata API key required for unpinning');
    }

    await fetch(`https://api.pinata.cloud/pinning/unpin/${cid}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.pinataApiKey}`
      }
    });
  }

  private async uploadToIPFS(content: string | Buffer, mimeType: string): Promise<{ cid: string }> {
    // Using Pinata for IPFS upload
    const formData = new FormData();
    const blob = new Blob([content], { type: mimeType });
    formData.append('file', blob);

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.pinataApiKey}`
      },
      body: formData
    });

    const result = await response.json();
    return { cid: result.IpfsHash };
  }

  private resolveURI(uri: string): string {
    if (uri.startsWith('ipfs://')) {
      return `${this.gateway}${uri.replace('ipfs://', '')}`;
    }
    if (uri.startsWith('ar://')) {
      return `https://arweave.net/${uri.replace('ar://', '')}`;
    }
    return uri;
  }

  private validateMetadata(metadata: NFTMetadata): void {
    if (!metadata.name) throw new Error('Metadata must have a name');
    if (!metadata.image) throw new Error('Metadata must have an image');
    if (!Array.isArray(metadata.attributes)) {
      throw new Error('Metadata attributes must be an array');
    }
  }
}
```

### NFT Trading Implementation

```typescript
class NFTTradingServiceImpl implements NFTTradingService {
  private signer: ethers.Signer;
  private marketplaceAddress: string;

  constructor(signer: ethers.Signer, marketplaceAddress: string) {
    this.signer = signer;
    this.marketplaceAddress = marketplaceAddress;
  }

  async listForSale(listing: NFTListing): Promise<ListingResult> {
    // Approve marketplace if needed
    await this.ensureApproval(listing.collection, listing.tokenId);

    const marketplace = new ethers.Contract(this.marketplaceAddress, MarketplaceABI, this.signer);
    
    const tx = await marketplace.createListing(
      listing.collection,
      listing.tokenId,
      listing.price,
      listing.currency,
      listing.expirationTime
    );
    const receipt = await tx.wait();

    // Extract listing ID from event
    const listingEvent = this.findEvent(receipt, marketplace, 'ListingCreated');
    const listingId = listingEvent?.args?.listingId?.toString() || '';

    return {
      listingId,
      transactionHash: receipt.hash,
      listing,
      status: 'active'
    };
  }

  async buy(listingId: string, price: bigint): Promise<PurchaseResult> {
    const marketplace = new ethers.Contract(this.marketplaceAddress, MarketplaceABI, this.signer);
    
    // Get listing details
    const listing = await marketplace.getListing(listingId);
    
    // Determine payment method
    const isETH = listing.currency === ethers.ZeroAddress;
    
    let tx;
    if (isETH) {
      tx = await marketplace.buyListing(listingId, { value: price });
    } else {
      // Approve ERC20 token
      const token = new ethers.Contract(listing.currency, ERC20ABI, this.signer);
      await token.approve(this.marketplaceAddress, price);
      tx = await marketplace.buyListing(listingId);
    }

    const receipt = await tx.wait();
    const saleEvent = this.findEvent(receipt, marketplace, 'Sale');

    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      collection: listing.collection,
      tokenId: listing.tokenId,
      buyer: await this.signer.getAddress(),
      seller: listing.seller,
      price,
      royaltyPaid: saleEvent?.args?.royaltyAmount || 0n,
      platformFee: saleEvent?.args?.platformFee || 0n
    };
  }

  async createAuction(auction: NFTAuction): Promise<AuctionResult> {
    await this.ensureApproval(auction.collection, auction.tokenId);

    const marketplace = new ethers.Contract(this.marketplaceAddress, MarketplaceABI, this.signer);
    
    const tx = await marketplace.createAuction(
      auction.collection,
      auction.tokenId,
      auction.startingPrice,
      auction.reservePrice || 0n,
      auction.currency,
      auction.startTime,
      auction.endTime,
      auction.minBidIncrement
    );
    const receipt = await tx.wait();

    const auctionEvent = this.findEvent(receipt, marketplace, 'AuctionCreated');
    const auctionId = auctionEvent?.args?.auctionId?.toString() || '';

    return {
      auctionId,
      transactionHash: receipt.hash,
      auction,
      status: 'pending'
    };
  }

  async placeBid(auctionId: string, amount: bigint): Promise<BidResult> {
    const marketplace = new ethers.Contract(this.marketplaceAddress, MarketplaceABI, this.signer);
    
    const auction = await marketplace.getAuction(auctionId);
    const isETH = auction.currency === ethers.ZeroAddress;

    let tx;
    if (isETH) {
      tx = await marketplace.placeBid(auctionId, { value: amount });
    } else {
      const token = new ethers.Contract(auction.currency, ERC20ABI, this.signer);
      await token.approve(this.marketplaceAddress, amount);
      tx = await marketplace.placeBid(auctionId, amount);
    }

    const receipt = await tx.wait();
    const bidEvent = this.findEvent(receipt, marketplace, 'BidPlaced');

    return {
      bidId: bidEvent?.args?.bidId?.toString() || '',
      transactionHash: receipt.hash,
      auctionId,
      bidder: await this.signer.getAddress(),
      amount,
      isHighestBid: true
    };
  }

  private async ensureApproval(collection: string, tokenId: bigint): Promise<void> {
    const nft = new ethers.Contract(collection, ERC721ABI, this.signer);
    const owner = await this.signer.getAddress();
    
    const isApproved = await nft.isApprovedForAll(owner, this.marketplaceAddress);
    if (!isApproved) {
      const approved = await nft.getApproved(tokenId);
      if (approved.toLowerCase() !== this.marketplaceAddress.toLowerCase()) {
        const tx = await nft.setApprovalForAll(this.marketplaceAddress, true);
        await tx.wait();
      }
    }
  }

  private findEvent(receipt: any, contract: ethers.Contract, eventName: string): any {
    return receipt.logs.find((log: any) => {
      try {
        const parsed = contract.interface.parseLog({ topics: log.topics, data: log.data });
        return parsed?.name === eventName;
      } catch {
        return false;
      }
    });
  }
}
```


## Integration Points

### OpenSea Integration

```typescript
class OpenSeaIntegration {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, isTestnet: boolean = false) {
    this.apiKey = apiKey;
    this.baseUrl = isTestnet 
      ? 'https://testnets-api.opensea.io/v2'
      : 'https://api.opensea.io/v2';
  }

  async getCollection(slug: string): Promise<OpenSeaCollection> {
    const response = await fetch(`${this.baseUrl}/collections/${slug}`, {
      headers: { 'X-API-KEY': this.apiKey }
    });
    return response.json();
  }

  async getNFT(chain: string, address: string, tokenId: string): Promise<OpenSeaNFT> {
    const response = await fetch(
      `${this.baseUrl}/chain/${chain}/contract/${address}/nfts/${tokenId}`,
      { headers: { 'X-API-KEY': this.apiKey } }
    );
    return response.json();
  }

  async getListings(collection: string): Promise<OpenSeaListing[]> {
    const response = await fetch(
      `${this.baseUrl}/listings/collection/${collection}/all`,
      { headers: { 'X-API-KEY': this.apiKey } }
    );
    const data = await response.json();
    return data.listings;
  }

  async refreshMetadata(chain: string, address: string, tokenId: string): Promise<void> {
    await fetch(
      `${this.baseUrl}/chain/${chain}/contract/${address}/nfts/${tokenId}/refresh`,
      {
        method: 'POST',
        headers: { 'X-API-KEY': this.apiKey }
      }
    );
  }
}

interface OpenSeaCollection {
  collection: string;
  name: string;
  description: string;
  imageUrl: string;
  bannerImageUrl: string;
  owner: string;
  category: string;
  isDisabled: boolean;
  isNsfw: boolean;
  traitOffers: boolean;
  openseaUrl: string;
  contracts: { address: string; chain: string }[];
}

interface OpenSeaNFT {
  identifier: string;
  collection: string;
  contract: string;
  tokenStandard: string;
  name: string;
  description: string;
  imageUrl: string;
  metadataUrl: string;
  owners: { address: string; quantity: number }[];
  traits: { traitType: string; value: string }[];
}
```

### Reservoir Integration

```typescript
class ReservoirIntegration {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, chain: string = 'mainnet') {
    this.apiKey = apiKey;
    this.baseUrl = `https://api.reservoir.tools`;
  }

  async getFloorPrice(collection: string): Promise<FloorPrice> {
    const response = await fetch(
      `${this.baseUrl}/collections/v6?id=${collection}`,
      { headers: { 'x-api-key': this.apiKey } }
    );
    const data = await response.json();
    return {
      price: data.collections[0]?.floorAsk?.price?.amount?.native || 0,
      currency: data.collections[0]?.floorAsk?.price?.currency?.symbol || 'ETH'
    };
  }

  async executeListings(listings: ReservoirListing[]): Promise<ExecutionResult> {
    const response = await fetch(`${this.baseUrl}/execute/list/v5`, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ listings })
    });
    return response.json();
  }

  async executeBuy(tokens: { token: string; quantity: number }[], taker: string): Promise<ExecutionResult> {
    const response = await fetch(`${this.baseUrl}/execute/buy/v7`, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tokens, taker })
    });
    return response.json();
  }
}

interface FloorPrice {
  price: number;
  currency: string;
}

interface ReservoirListing {
  token: string;
  weiPrice: string;
  orderKind: 'seaport-v1.5' | 'looks-rare-v2' | 'x2y2';
  expirationTime?: string;
}
```

## Security Considerations

### NFT Security
- Validate token ownership before operations
- Implement reentrancy protection for marketplace contracts
- Verify metadata authenticity and integrity
- Protect against front-running in auctions
- Implement safe transfer checks

### Metadata Security
- Pin metadata to multiple IPFS nodes
- Use content-addressed storage for immutability
- Validate metadata schema before upload
- Implement backup storage solutions
- Monitor for metadata availability

### Trading Security
- Implement signature verification for lazy minting
- Validate listing expiration times
- Protect against price manipulation
- Implement escrow for high-value trades
- Monitor for wash trading

## Compliance Guidelines

- Implement royalty enforcement (EIP-2981)
- Support creator attribution and provenance
- Maintain transaction audit trails
- Implement geographic restrictions if required
- Support regulatory reporting for high-value sales

## Testing Considerations

### Property-Based Tests

```typescript
describe('NFT Functionality Properties', () => {
  it('should maintain ownership consistency after transfers', () => {
    fc.assert(fc.property(
      fc.bigInt({ min: 1n, max: 10000n }),
      fc.hexaString({ minLength: 40, maxLength: 40 }),
      async (tokenId, toAddress) => {
        const collection = '0x...';
        const nft = new ethers.Contract(collection, ERC721ABI, mockProvider);
        
        const originalOwner = await nft.ownerOf(tokenId);
        
        // After transfer, new owner should be correct
        // Original owner should no longer own the token
      }
    ));
  });

  it('should correctly calculate royalties', () => {
    fc.assert(fc.property(
      fc.bigInt({ min: 1n, max: ethers.parseEther('1000') }),
      fc.integer({ min: 0, max: 10000 }),
      (salePrice, basisPoints) => {
        const royaltyService = new NFTRoyaltyServiceImpl();
        const royalty = royaltyService.calculateRoyalty(salePrice, basisPoints);
        
        // Royalty should be salePrice * basisPoints / 10000
        const expected = (salePrice * BigInt(basisPoints)) / 10000n;
        expect(royalty).toBe(expected);
      }
    ));
  });

  it('should preserve metadata integrity through upload/download', () => {
    fc.assert(fc.property(
      fc.record({
        name: fc.string({ minLength: 1, maxLength: 100 }),
        description: fc.string({ maxLength: 1000 }),
        image: fc.constant('ipfs://QmTest'),
        attributes: fc.array(fc.record({
          traitType: fc.string({ minLength: 1 }),
          value: fc.oneof(fc.string(), fc.integer())
        }), { maxLength: 10 })
      }),
      async (metadata) => {
        const service = new IPFSMetadataService({ gateway: 'https://ipfs.io/ipfs/' });
        
        const uploadResult = await service.uploadMetadata(metadata as NFTMetadata);
        const downloaded = await service.getMetadata(uploadResult.uri);
        
        // Round-trip should preserve metadata
        expect(downloaded.name).toBe(metadata.name);
        expect(downloaded.description).toBe(metadata.description);
        expect(downloaded.attributes.length).toBe(metadata.attributes.length);
      }
    ));
  });
});
```
