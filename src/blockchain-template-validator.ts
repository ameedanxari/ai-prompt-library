import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface BlockchainIntegrationTemplateStructure {
  hasWalletIntegrationTemplate: boolean;
  hasSmartContractsTemplate: boolean;
  hasTokenManagementTemplate: boolean;
  hasNFTFunctionalityTemplate: boolean;
  allTemplatesHaveRequiredSections: boolean;
  templatesHaveImplementationPatterns: boolean;
  templatesHaveConfigurationExamples: boolean;
  templatesHaveIntegrationPoints: boolean;
  templatesHaveDataModels: boolean;
}

export interface DeFiGovernanceTemplateStructure {
  hasDeFiProtocolsTemplate: boolean;
  hasGovernanceSystemsTemplate: boolean;
  hasCrossChainTemplate: boolean;
  hasEnterpriseBlockchainTemplate: boolean;
  allTemplatesHaveRequiredSections: boolean;
  templatesHaveImplementationPatterns: boolean;
  templatesHaveConfigurationExamples: boolean;
  templatesHaveIntegrationPoints: boolean;
  templatesHaveDataModels: boolean;
}


export interface BlockchainTemplateContent {
  hasPurposeSection: boolean;
  hasContextSection: boolean;
  hasImplementationPatterns: boolean;
  hasConfigurationParameters: boolean;
  hasIntegrationPoints: boolean;
  hasTestingConsiderations: boolean;
  hasSecurityConsiderations: boolean;
  hasComplianceGuidelines: boolean;
  hasCodeExamples: boolean;
  hasDataModels: boolean;
}

export class BlockchainTemplateValidator {
  private blockchainModulePath: string;

  constructor(blockchainModulePath: string = 'prompts/modules/blockchain') {
    this.blockchainModulePath = blockchainModulePath;
  }

  validateIntegrationTemplates(): BlockchainIntegrationTemplateStructure {
    const integrationTemplates = [
      'wallet-integration.md',
      'smart-contracts.md',
      'token-management.md',
      'nft-functionality.md'
    ];

    const templateExists = (filename: string) =>
      existsSync(join(this.blockchainModulePath, filename));

    const hasWalletIntegrationTemplate = templateExists('wallet-integration.md');
    const hasSmartContractsTemplate = templateExists('smart-contracts.md');
    const hasTokenManagementTemplate = templateExists('token-management.md');
    const hasNFTFunctionalityTemplate = templateExists('nft-functionality.md');

    // Validate content quality for existing templates
    let allTemplatesHaveRequiredSections = true;
    let templatesHaveImplementationPatterns = true;
    let templatesHaveConfigurationExamples = true;
    let templatesHaveIntegrationPoints = true;
    let templatesHaveDataModels = true;

    for (const template of integrationTemplates) {
      const templatePath = join(this.blockchainModulePath, template);
      if (existsSync(templatePath)) {
        const content = this.validateTemplateContent(templatePath);

        if (!content.hasPurposeSection || !content.hasContextSection) {
          allTemplatesHaveRequiredSections = false;
        }

        if (!content.hasImplementationPatterns || !content.hasCodeExamples) {
          templatesHaveImplementationPatterns = false;
        }

        if (!content.hasConfigurationParameters) {
          templatesHaveConfigurationExamples = false;
        }

        if (!content.hasIntegrationPoints) {
          templatesHaveIntegrationPoints = false;
        }

        if (!content.hasDataModels) {
          templatesHaveDataModels = false;
        }
      }
    }

    return {
      hasWalletIntegrationTemplate,
      hasSmartContractsTemplate,
      hasTokenManagementTemplate,
      hasNFTFunctionalityTemplate,
      allTemplatesHaveRequiredSections,
      templatesHaveImplementationPatterns,
      templatesHaveConfigurationExamples,
      templatesHaveIntegrationPoints,
      templatesHaveDataModels
    };
  }

  validateDeFiGovernanceTemplates(): DeFiGovernanceTemplateStructure {
    const defiTemplates = [
      'defi-protocols.md',
      'governance-systems.md',
      'cross-chain.md',
      'enterprise-blockchain.md'
    ];

    const templateExists = (filename: string) =>
      existsSync(join(this.blockchainModulePath, filename));

    const hasDeFiProtocolsTemplate = templateExists('defi-protocols.md');
    const hasGovernanceSystemsTemplate = templateExists('governance-systems.md');
    const hasCrossChainTemplate = templateExists('cross-chain.md');
    const hasEnterpriseBlockchainTemplate = templateExists('enterprise-blockchain.md');

    // Validate content quality for existing templates
    let allTemplatesHaveRequiredSections = true;
    let templatesHaveImplementationPatterns = true;
    let templatesHaveConfigurationExamples = true;
    let templatesHaveIntegrationPoints = true;
    let templatesHaveDataModels = true;

    for (const template of defiTemplates) {
      const templatePath = join(this.blockchainModulePath, template);
      if (existsSync(templatePath)) {
        const content = this.validateTemplateContent(templatePath);

        if (!content.hasPurposeSection || !content.hasContextSection) {
          allTemplatesHaveRequiredSections = false;
        }

        if (!content.hasImplementationPatterns || !content.hasCodeExamples) {
          templatesHaveImplementationPatterns = false;
        }

        if (!content.hasConfigurationParameters) {
          templatesHaveConfigurationExamples = false;
        }

        if (!content.hasIntegrationPoints) {
          templatesHaveIntegrationPoints = false;
        }

        if (!content.hasDataModels) {
          templatesHaveDataModels = false;
        }
      }
    }

    return {
      hasDeFiProtocolsTemplate,
      hasGovernanceSystemsTemplate,
      hasCrossChainTemplate,
      hasEnterpriseBlockchainTemplate,
      allTemplatesHaveRequiredSections,
      templatesHaveImplementationPatterns,
      templatesHaveConfigurationExamples,
      templatesHaveIntegrationPoints,
      templatesHaveDataModels
    };
  }

  validateTemplateContent(templatePath: string): BlockchainTemplateContent {
    if (!existsSync(templatePath)) {
      return this.getEmptyTemplateContent();
    }

    const content = readFileSync(templatePath, 'utf-8');

    return {
      hasPurposeSection: this.hasSection(content, 'Purpose'),
      hasContextSection: this.hasSection(content, 'Context'),
      hasImplementationPatterns: this.hasSection(content, 'Implementation Patterns') ||
        this.hasSection(content, 'Implementation') ||
        this.hasSection(content, 'Core.*Patterns'),
      hasConfigurationParameters: this.hasSection(content, 'Configuration') ||
        this.hasSection(content, 'Variables') ||
        this.hasCodeExamples(content),
      hasIntegrationPoints: this.hasSection(content, 'Integration Points') ||
        this.hasSection(content, 'Integration'),
      hasTestingConsiderations: this.hasSection(content, 'Testing Considerations') ||
        this.hasSection(content, 'Testing'),
      hasSecurityConsiderations: this.hasSecurityConsiderations(content),
      hasComplianceGuidelines: this.hasSection(content, 'Compliance') ||
        this.hasComplianceContent(content),
      hasCodeExamples: this.hasCodeExamples(content),
      hasDataModels: this.hasDataModels(content)
    };
  }

  private hasSection(content: string, sectionName: string): boolean {
    const sectionRegex = new RegExp(`##\\s*${sectionName}`, 'i');
    return sectionRegex.test(content);
  }

  private hasCodeExamples(content: string): boolean {
    const codeBlockRegex = /```[\s\S]*?```/;
    const interfaceRegex = /interface\s+\w+/;
    const classRegex = /class\s+\w+/;
    const functionRegex = /function\s+\w+|async\s+function\s+\w+/;

    return codeBlockRegex.test(content) ||
      interfaceRegex.test(content) ||
      classRegex.test(content) ||
      functionRegex.test(content);
  }

  private hasSecurityConsiderations(content: string): boolean {
    const securityKeywords = [
      'security', 'encryption', 'authentication', 'authorization',
      'signature', 'private key', 'secure', 'access control',
      'threat', 'vulnerability', 'protection', 'privacy'
    ];

    const contentLower = content.toLowerCase();
    return securityKeywords.some(keyword => contentLower.includes(keyword));
  }

  private hasComplianceContent(content: string): boolean {
    const complianceKeywords = [
      'compliance', 'regulatory', 'kyc', 'aml', 'sanctions',
      'audit', 'verification', 'eip', 'erc'
    ];

    const contentLower = content.toLowerCase();
    return complianceKeywords.some(keyword => contentLower.includes(keyword));
  }

  private hasDataModels(content: string): boolean {
    const dataModelPatterns = [
      /interface\s+\w+/g,
      /class\s+\w+/g,
      /enum\s+\w+/g,
      /type\s+\w+\s*=/g
    ];

    return dataModelPatterns.some(pattern => pattern.test(content));
  }

  private getEmptyTemplateContent(): BlockchainTemplateContent {
    return {
      hasPurposeSection: false,
      hasContextSection: false,
      hasImplementationPatterns: false,
      hasConfigurationParameters: false,
      hasIntegrationPoints: false,
      hasTestingConsiderations: false,
      hasSecurityConsiderations: false,
      hasComplianceGuidelines: false,
      hasCodeExamples: false,
      hasDataModels: false
    };
  }

  // Validate requirements 15.1, 15.2, 15.3, 15.4 for blockchain integration templates
  validateIntegrationRequirements(): {
    requirement_15_1: boolean; // Wallet connections, transaction signing, multi-wallet support
    requirement_15_2: boolean; // Contract deployment, interaction, event listening, upgrades
    requirement_15_3: boolean; // Token creation, transfers, staking, governance tokens
    requirement_15_4: boolean; // NFT minting, trading, metadata management, royalties
  } {
    const structure = this.validateIntegrationTemplates();

    // Requirement 15.1: Wallet connections, transaction signing, multi-wallet support, wallet management
    const requirement_15_1 = structure.hasWalletIntegrationTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 15.2: Contract deployment, contract interaction, event listening, contract upgrades
    const requirement_15_2 = structure.hasSmartContractsTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 15.3: Token creation, token transfers, token staking, governance tokens
    const requirement_15_3 = structure.hasTokenManagementTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 15.4: NFT minting, NFT trading, metadata management, royalty systems
    const requirement_15_4 = structure.hasNFTFunctionalityTemplate &&
      structure.templatesHaveImplementationPatterns;

    return {
      requirement_15_1,
      requirement_15_2,
      requirement_15_3,
      requirement_15_4
    };
  }

  // Validate requirements 15.5, 15.6, 15.8, 15.10 for DeFi governance templates
  validateDeFiGovernanceRequirements(): {
    requirement_15_5: boolean; // Liquidity pools, yield farming, lending protocols, DEX
    requirement_15_6: boolean; // Voting mechanisms, proposal systems, delegation, governance tokens
    requirement_15_8: boolean; // Bridge protocols, multi-chain support, cross-chain transfers
    requirement_15_10: boolean; // Private networks, consortium chains, enterprise security
  } {
    const structure = this.validateDeFiGovernanceTemplates();

    // Requirement 15.5: Liquidity pools, yield farming, lending protocols, decentralized exchanges
    const requirement_15_5 = structure.hasDeFiProtocolsTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 15.6: Voting mechanisms, proposal systems, delegation, governance tokens
    const requirement_15_6 = structure.hasGovernanceSystemsTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 15.8: Bridge protocols, multi-chain support, cross-chain asset transfers
    const requirement_15_8 = structure.hasCrossChainTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 15.10: Private networks, consortium chains, enterprise-grade security
    const requirement_15_10 = structure.hasEnterpriseBlockchainTemplate &&
      structure.templatesHaveImplementationPatterns;

    return {
      requirement_15_5,
      requirement_15_6,
      requirement_15_8,
      requirement_15_10
    };
  }

  // Validate blockchain feature coverage
  validateBlockchainFeatureCoverage(): {
    hasWalletIntegration: boolean;
    hasSmartContracts: boolean;
    hasTokenManagement: boolean;
    hasNFTFunctionality: boolean;
    hasDeFiProtocols: boolean;
    hasGovernanceSystems: boolean;
    hasCrossChain: boolean;
    hasEnterpriseBlockchain: boolean;
  } {
    const walletPath = join(this.blockchainModulePath, 'wallet-integration.md');
    const contractsPath = join(this.blockchainModulePath, 'smart-contracts.md');
    const tokenPath = join(this.blockchainModulePath, 'token-management.md');
    const nftPath = join(this.blockchainModulePath, 'nft-functionality.md');
    const defiPath = join(this.blockchainModulePath, 'defi-protocols.md');
    const governancePath = join(this.blockchainModulePath, 'governance-systems.md');
    const crossChainPath = join(this.blockchainModulePath, 'cross-chain.md');
    const enterprisePath = join(this.blockchainModulePath, 'enterprise-blockchain.md');

    let hasWalletIntegration = false;
    let hasSmartContracts = false;
    let hasTokenManagement = false;
    let hasNFTFunctionality = false;
    let hasDeFiProtocols = false;
    let hasGovernanceSystems = false;
    let hasCrossChain = false;
    let hasEnterpriseBlockchain = false;

    if (existsSync(walletPath)) {
      const content = readFileSync(walletPath, 'utf-8').toLowerCase();
      hasWalletIntegration = content.includes('wallet') &&
        (content.includes('connect') || content.includes('sign'));
    }

    if (existsSync(contractsPath)) {
      const content = readFileSync(contractsPath, 'utf-8').toLowerCase();
      hasSmartContracts = content.includes('contract') &&
        (content.includes('deploy') || content.includes('interact'));
    }

    if (existsSync(tokenPath)) {
      const content = readFileSync(tokenPath, 'utf-8').toLowerCase();
      hasTokenManagement = content.includes('token') &&
        (content.includes('transfer') || content.includes('stake'));
    }

    if (existsSync(nftPath)) {
      const content = readFileSync(nftPath, 'utf-8').toLowerCase();
      hasNFTFunctionality = content.includes('nft') &&
        (content.includes('mint') || content.includes('metadata'));
    }

    if (existsSync(defiPath)) {
      const content = readFileSync(defiPath, 'utf-8').toLowerCase();
      hasDeFiProtocols = content.includes('defi') &&
        (content.includes('liquidity') || content.includes('swap'));
    }

    if (existsSync(governancePath)) {
      const content = readFileSync(governancePath, 'utf-8').toLowerCase();
      hasGovernanceSystems = content.includes('governance') &&
        (content.includes('vote') || content.includes('proposal'));
    }

    if (existsSync(crossChainPath)) {
      const content = readFileSync(crossChainPath, 'utf-8').toLowerCase();
      hasCrossChain = content.includes('cross-chain') &&
        (content.includes('bridge') || content.includes('multi-chain'));
    }

    if (existsSync(enterprisePath)) {
      const content = readFileSync(enterprisePath, 'utf-8').toLowerCase();
      hasEnterpriseBlockchain = content.includes('enterprise') &&
        (content.includes('private') || content.includes('consortium'));
    }

    return {
      hasWalletIntegration,
      hasSmartContracts,
      hasTokenManagement,
      hasNFTFunctionality,
      hasDeFiProtocols,
      hasGovernanceSystems,
      hasCrossChain,
      hasEnterpriseBlockchain
    };
  }
}
