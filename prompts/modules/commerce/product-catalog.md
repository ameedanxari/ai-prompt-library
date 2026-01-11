# Product Catalog Management Template

## Purpose

This template provides comprehensive patterns for building product catalog systems that handle complex product hierarchies, variants, attributes, and relationships. It addresses the challenges of managing diverse product types, from simple items to complex configurable products with multiple variants and options.

## Context

Product catalogs are the foundation of any e-commerce system. This template covers product data modeling, variant management, attribute systems, category hierarchies, and product relationships. It ensures scalable, flexible catalog management that can handle everything from simple retail products to complex B2B catalogs with custom pricing and configurations.

## Instructions

1. **Setup Product Database**: Configure scalable product data storage with proper indexing
2. **Implement Product Types**: Define simple, variable, grouped, and configurable products
3. **Configure Variants**: Set up product variants with attributes and pricing
4. **Setup Categories**: Implement hierarchical category structure and navigation
5. **Deploy Search**: Configure product search with filters and faceted navigation
6. **Implement Media**: Set up product image, video, and document management
7. **Configure Pricing**: Deploy dynamic pricing rules and customer-specific pricing

## Examples

### Example 1: Basic Product Creation
```typescript
interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  type: 'simple' | 'variable' | 'grouped' | 'configurable';
  status: 'active' | 'inactive' | 'draft';
  basePrice: number;
  salePrice?: number;
  categories: string[];
  attributes: ProductAttribute[];
  images: ProductImage[];
  inventory: InventoryInfo;
}

const product = await createProduct({
  sku: "SHIRT-001",
  name: "Premium Cotton T-Shirt",
  description: "High-quality cotton t-shirt with comfortable fit",
  type: "variable",
  basePrice: 29.99,
  categories: ["clothing", "shirts", "mens"],
  attributes: [
    { name: "material", value: "100% Cotton" },
    { name: "fit", value: "Regular" }
  ]
});
```

### Example 2: Product Variants Management
```typescript
interface ProductVariant {
  id: string;
  parentProductId: string;
  sku: string;
  attributes: VariantAttribute[];
  price: number;
  inventory: InventoryInfo;
  images: string[];
  status: 'active' | 'inactive';
}

const variant = await createProductVariant({
  parentProductId: "prod_123",
  sku: "SHIRT-001-RED-M",
  attributes: [
    { name: "color", value: "Red" },
    { name: "size", value: "Medium" }
  ],
  price: 29.99,
  inventory: {
    quantity: 50,
    trackQuantity: true,
    allowBackorder: false
  }
});
```

### Example 3: Category Hierarchy
```typescript
interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  level: number;
  sortOrder: number;
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
  image?: string;
}

const category = await createCategory({
  name: "Men's Clothing",
  slug: "mens-clothing",
  parentId: "clothing",
  level: 2,
  sortOrder: 1,
  seoTitle: "Men's Clothing - Premium Fashion",
  seoDescription: "Discover our premium men's clothing collection"
});
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| productTypes | Supported product types | string[] | Yes | ["simple", "variable"] |
| maxVariants | Maximum variants per product | number | No | 100 |
| categoryDepth | Maximum category hierarchy depth | number | No | 5 |
| attributeTypes | Supported attribute types | string[] | Yes | ["text", "number", "select"] |
| imageFormats | Supported image formats | string[] | Yes | ["jpg", "png", "webp"] |
| maxImages | Maximum images per product | number | No | 20 |
| seoEnabled | Enable SEO optimization | boolean | Yes | true |
| bulkImport | Enable bulk product import | boolean | No | true |

## Expected Output

This template will produce:
- **Product Management System**: Comprehensive product creation and management
- **Variant Engine**: Product variant generation and management
- **Category System**: Hierarchical category structure and navigation
- **Attribute Framework**: Flexible product attribute and specification system
- **Media Management**: Product image, video, and document handling
- **Search and Filter**: Advanced product search with faceted navigation
- **Pricing Engine**: Dynamic pricing rules and customer-specific pricing
- **Import/Export Tools**: Bulk product data management and synchronization

## Context

Product catalogs are the foundation of any e-commerce system. This template covers product data modeling, variant management, attribute systems, category hierarchies, and product relationships. It ensures scalable, flexible catalog management that can handle everything from simple retail products to complex B2B catalogs with custom pricing and configurations.

## Core Product Management Patterns

### 1. Product Data Model

Define comprehensive product data structures that support various product types:

```typescript
interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  shortDescription?: string;
  slug: string;
  type: ProductType;
  status: ProductStatus;
  visibility: ProductVisibility;
  
  // Pricing
  basePrice: number;
  salePrice?: number;
  currency: string;
  priceRules: PriceRule[];
  
  // Inventory
  inventory: InventoryInfo;
  
  // Categorization
  categories: string[];
  tags: string[];
  brand?: string;
  
  // Attributes
  attributes: ProductAttribute[];
  customFields: Record<string, any>;
  
  // Media
  images: ProductImage[];
  videos: ProductVideo[];
  documents: ProductDocument[];
  
  // SEO and Marketing
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string[];
  
  // Relationships
  relatedProducts: string[];
  crossSellProducts: string[];
  upSellProducts: string[];
  
  // Variants (for configurable products)
  variants: ProductVariant[];
  variantAttributes: VariantAttribute[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

enum ProductType {
  SIMPLE = 'simple',
  CONFIGURABLE = 'configurable',
  GROUPED = 'grouped',
  BUNDLE = 'bundle',
  VIRTUAL = 'virtual',
  DOWNLOADABLE = 'downloadable',
  SUBSCRIPTION = 'subscription'
}

enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
  OUT_OF_STOCK = 'out_of_stock'
}

enum ProductVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  HIDDEN = 'hidden',
  CATALOG_ONLY = 'catalog_only',
  SEARCH_ONLY = 'search_only'
}
```

### 2. Product Variant Management

Handle complex product variants and configurations:

```typescript
interface ProductVariant {
  id: string;
  parentProductId: string;
  sku: string;
  name?: string;
  
  // Variant-specific attributes
  attributeValues: VariantAttributeValue[];
  
  // Pricing (can override parent)
  price?: number;
  salePrice?: number;
  
  // Inventory (variant-specific)
  inventory: InventoryInfo;
  
  // Media (variant-specific)
  images: ProductImage[];
  
  // Status
  status: ProductStatus;
  isDefault: boolean;
  
  // Additional data
  weight?: number;
  dimensions?: ProductDimensions;
  customFields: Record<string, any>;
}

interface VariantAttribute {
  id: string;
  name: string;
  type: AttributeType;
  required: boolean;
  values: VariantAttributeValue[];
  displayOrder: number;
}

interface VariantAttributeValue {
  id: string;
  attributeId: string;
  value: string;
  displayValue: string;
  colorCode?: string; // For color attributes
  imageUrl?: string; // For visual attributes
  priceModifier?: number;
  sortOrder: number;
}

// Product variant generation and management
class ProductVariantManager {
  async generateVariants(product: Product, attributeCombinations: VariantAttributeValue[][]): Promise<ProductVariant[]> {
    const variants: ProductVariant[] = [];
    
    // Generate all possible combinations
    const combinations = this.generateAttributeCombinations(attributeCombinations);
    
    for (const combination of combinations) {
      const variant: ProductVariant = {
        id: this.generateVariantId(),
        parentProductId: product.id,
        sku: this.generateVariantSku(product.sku, combination),
        attributeValues: combination,
        inventory: {
          quantity: 0,
          trackQuantity: true,
          allowBackorder: false,
          lowStockThreshold: 5
        },
        images: [],
        status: ProductStatus.ACTIVE,
        isDefault: false,
        customFields: {}
      };
      
      // Apply price modifiers
      variant.price = this.calculateVariantPrice(product.basePrice, combination);
      
      variants.push(variant);
    }
    
    // Set first variant as default if none specified
    if (variants.length > 0 && !variants.some(v => v.isDefault)) {
      variants[0].isDefault = true;
    }
    
    return variants;
  }
  
  private generateAttributeCombinations(attributeValues: VariantAttributeValue[][]): VariantAttributeValue[][] {
    if (attributeValues.length === 0) return [[]];
    if (attributeValues.length === 1) return attributeValues[0].map(value => [value]);
    
    const result: VariantAttributeValue[][] = [];
    const firstAttribute = attributeValues[0];
    const remainingCombinations = this.generateAttributeCombinations(attributeValues.slice(1));
    
    for (const value of firstAttribute) {
      for (const combination of remainingCombinations) {
        result.push([value, ...combination]);
      }
    }
    
    return result;
  }
  
  private calculateVariantPrice(basePrice: number, attributeValues: VariantAttributeValue[]): number {
    let price = basePrice;
    
    for (const attributeValue of attributeValues) {
      if (attributeValue.priceModifier) {
        price += attributeValue.priceModifier;
      }
    }
    
    return Math.max(0, price); // Ensure price is not negative
  }
  
  async findVariantByAttributes(productId: string, selectedAttributes: Record<string, string>): Promise<ProductVariant | null> {
    const variants = await this.getProductVariants(productId);
    
    return variants.find(variant => {
      return Object.entries(selectedAttributes).every(([attributeId, valueId]) => {
        return variant.attributeValues.some(av => 
          av.attributeId === attributeId && av.id === valueId
        );
      });
    }) || null;
  }
}
```

### 3. Product Attribute System

Implement flexible product attribute management:

```typescript
interface ProductAttribute {
  id: string;
  name: string;
  type: AttributeType;
  value: any;
  displayValue: string;
  unit?: string;
  group?: string;
  isFilterable: boolean;
  isSearchable: boolean;
  displayOrder: number;
}

enum AttributeType {
  TEXT = 'text',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DATE = 'date',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  COLOR = 'color',
  IMAGE = 'image',
  FILE = 'file',
  RICH_TEXT = 'rich_text'
}

interface AttributeDefinition {
  id: string;
  name: string;
  type: AttributeType;
  required: boolean;
  defaultValue?: any;
  validation: AttributeValidation;
  options?: AttributeOption[]; // For select/multiselect types
  group: string;
  isFilterable: boolean;
  isSearchable: boolean;
  displayOrder: number;
}

interface AttributeValidation {
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: string;
  allowedValues?: string[];
  customValidator?: string;
}

interface AttributeOption {
  id: string;
  value: string;
  displayValue: string;
  colorCode?: string;
  imageUrl?: string;
  sortOrder: number;
}

class ProductAttributeManager {
  async createAttributeDefinition(definition: Omit<AttributeDefinition, 'id'>): Promise<AttributeDefinition> {
    const attributeDefinition: AttributeDefinition = {
      id: this.generateAttributeId(),
      ...definition
    };
    
    // Validate attribute definition
    await this.validateAttributeDefinition(attributeDefinition);
    
    // Save to database
    await this.attributeRepository.save(attributeDefinition);
    
    return attributeDefinition;
  }
  
  async setProductAttribute(productId: string, attributeId: string, value: any): Promise<void> {
    const attributeDefinition = await this.getAttributeDefinition(attributeId);
    
    // Validate attribute value
    const validationResult = await this.validateAttributeValue(attributeDefinition, value);
    if (!validationResult.isValid) {
      throw new Error(`Invalid attribute value: ${validationResult.errors.join(', ')}`);
    }
    
    // Create product attribute
    const productAttribute: ProductAttribute = {
      id: this.generateProductAttributeId(),
      name: attributeDefinition.name,
      type: attributeDefinition.type,
      value,
      displayValue: this.formatDisplayValue(attributeDefinition, value),
      unit: this.getAttributeUnit(attributeDefinition),
      group: attributeDefinition.group,
      isFilterable: attributeDefinition.isFilterable,
      isSearchable: attributeDefinition.isSearchable,
      displayOrder: attributeDefinition.displayOrder
    };
    
    // Update product
    await this.productRepository.addAttribute(productId, productAttribute);
  }
  
  async getFilterableAttributes(categoryId?: string): Promise<AttributeDefinition[]> {
    let attributes = await this.attributeRepository.findFilterable();
    
    if (categoryId) {
      // Filter attributes relevant to the category
      const categoryAttributes = await this.getCategoryAttributes(categoryId);
      attributes = attributes.filter(attr => 
        categoryAttributes.some(catAttr => catAttr.id === attr.id)
      );
    }
    
    return attributes.sort((a, b) => a.displayOrder - b.displayOrder);
  }
  
  private async validateAttributeValue(definition: AttributeDefinition, value: any): Promise<ValidationResult> {
    const result: ValidationResult = { isValid: true, errors: [] };
    
    // Type validation
    switch (definition.type) {
      case AttributeType.TEXT:
        if (typeof value !== 'string') {
          result.isValid = false;
          result.errors.push('Value must be a string');
        }
        break;
      case AttributeType.NUMBER:
        if (typeof value !== 'number' || isNaN(value)) {
          result.isValid = false;
          result.errors.push('Value must be a number');
        }
        break;
      case AttributeType.BOOLEAN:
        if (typeof value !== 'boolean') {
          result.isValid = false;
          result.errors.push('Value must be a boolean');
        }
        break;
      case AttributeType.SELECT:
        if (!definition.options?.some(option => option.value === value)) {
          result.isValid = false;
          result.errors.push('Value must be one of the allowed options');
        }
        break;
    }
    
    // Custom validation rules
    if (result.isValid && definition.validation) {
      const validation = definition.validation;
      
      if (validation.minLength && value.length < validation.minLength) {
        result.isValid = false;
        result.errors.push(`Value must be at least ${validation.minLength} characters`);
      }
      
      if (validation.maxLength && value.length > validation.maxLength) {
        result.isValid = false;
        result.errors.push(`Value must be no more than ${validation.maxLength} characters`);
      }
      
      if (validation.minValue && value < validation.minValue) {
        result.isValid = false;
        result.errors.push(`Value must be at least ${validation.minValue}`);
      }
      
      if (validation.maxValue && value > validation.maxValue) {
        result.isValid = false;
        result.errors.push(`Value must be no more than ${validation.maxValue}`);
      }
      
      if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
        result.isValid = false;
        result.errors.push('Value does not match required pattern');
      }
    }
    
    return result;
  }
}
```

### 4. Category Management

Implement hierarchical category systems:

```typescript
interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  level: number;
  path: string; // e.g., "/electronics/computers/laptops"
  
  // Display
  image?: string;
  icon?: string;
  displayOrder: number;
  isVisible: boolean;
  
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string[];
  
  // Category-specific attributes
  allowedAttributes: string[];
  requiredAttributes: string[];
  
  // Settings
  settings: CategorySettings;
  
  // Relationships
  children: ProductCategory[];
  productCount: number;
  
  createdAt: Date;
  updatedAt: Date;
}

interface CategorySettings {
  allowProducts: boolean;
  inheritParentAttributes: boolean;
  defaultSortOrder: 'name' | 'price' | 'created' | 'popularity';
  productsPerPage: number;
  enableFiltering: boolean;
  customFields: Record<string, any>;
}

class CategoryManager {
  async createCategory(categoryData: Omit<ProductCategory, 'id' | 'level' | 'path' | 'children' | 'productCount' | 'createdAt' | 'updatedAt'>): Promise<ProductCategory> {
    // Calculate level and path
    let level = 0;
    let path = `/${categoryData.slug}`;
    
    if (categoryData.parentId) {
      const parent = await this.getCategory(categoryData.parentId);
      if (!parent) {
        throw new Error('Parent category not found');
      }
      level = parent.level + 1;
      path = `${parent.path}/${categoryData.slug}`;
    }
    
    const category: ProductCategory = {
      id: this.generateCategoryId(),
      ...categoryData,
      level,
      path,
      children: [],
      productCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Validate category
    await this.validateCategory(category);
    
    // Save category
    await this.categoryRepository.save(category);
    
    // Update parent's children if applicable
    if (categoryData.parentId) {
      await this.updateParentChildren(categoryData.parentId);
    }
    
    return category;
  }
  
  async getCategoryTree(rootCategoryId?: string): Promise<ProductCategory[]> {
    const categories = await this.categoryRepository.findAll();
    
    // Build tree structure
    const categoryMap = new Map<string, ProductCategory>();
    const rootCategories: ProductCategory[] = [];
    
    // First pass: create map and initialize children arrays
    for (const category of categories) {
      category.children = [];
      categoryMap.set(category.id, category);
    }
    
    // Second pass: build tree structure
    for (const category of categories) {
      if (category.parentId && categoryMap.has(category.parentId)) {
        const parent = categoryMap.get(category.parentId)!;
        parent.children.push(category);
      } else if (!category.parentId || category.parentId === rootCategoryId) {
        rootCategories.push(category);
      }
    }
    
    // Sort categories by display order
    this.sortCategoriesRecursively(rootCategories);
    
    return rootCategories;
  }
  
  async moveCategory(categoryId: string, newParentId?: string): Promise<void> {
    const category = await this.getCategory(categoryId);
    if (!category) {
      throw new Error('Category not found');
    }
    
    // Prevent moving category to its own descendant
    if (newParentId && await this.isDescendant(categoryId, newParentId)) {
      throw new Error('Cannot move category to its own descendant');
    }
    
    const oldParentId = category.parentId;
    
    // Update category
    category.parentId = newParentId;
    
    // Recalculate level and path
    if (newParentId) {
      const newParent = await this.getCategory(newParentId);
      if (!newParent) {
        throw new Error('New parent category not found');
      }
      category.level = newParent.level + 1;
      category.path = `${newParent.path}/${category.slug}`;
    } else {
      category.level = 0;
      category.path = `/${category.slug}`;
    }
    
    category.updatedAt = new Date();
    
    // Update all descendants
    await this.updateDescendantPaths(category);
    
    // Save changes
    await this.categoryRepository.save(category);
    
    // Update parent children
    if (oldParentId) {
      await this.updateParentChildren(oldParentId);
    }
    if (newParentId) {
      await this.updateParentChildren(newParentId);
    }
  }
  
  async assignProductToCategories(productId: string, categoryIds: string[]): Promise<void> {
    // Validate categories exist
    const categories = await this.categoryRepository.findByIds(categoryIds);
    if (categories.length !== categoryIds.length) {
      throw new Error('One or more categories not found');
    }
    
    // Validate categories allow products
    const invalidCategories = categories.filter(cat => !cat.settings.allowProducts);
    if (invalidCategories.length > 0) {
      throw new Error(`Categories do not allow products: ${invalidCategories.map(c => c.name).join(', ')}`);
    }
    
    // Update product categories
    await this.productRepository.updateCategories(productId, categoryIds);
    
    // Update category product counts
    for (const categoryId of categoryIds) {
      await this.updateCategoryProductCount(categoryId);
    }
  }
  
  private sortCategoriesRecursively(categories: ProductCategory[]): void {
    categories.sort((a, b) => a.displayOrder - b.displayOrder);
    
    for (const category of categories) {
      if (category.children.length > 0) {
        this.sortCategoriesRecursively(category.children);
      }
    }
  }
  
  private async isDescendant(ancestorId: string, descendantId: string): Promise<boolean> {
    const descendant = await this.getCategory(descendantId);
    if (!descendant || !descendant.parentId) {
      return false;
    }
    
    if (descendant.parentId === ancestorId) {
      return true;
    }
    
    return await this.isDescendant(ancestorId, descendant.parentId);
  }
}
```

### 5. Product Search and Filtering

Implement advanced product search and filtering capabilities:

```typescript
interface ProductSearchQuery {
  query?: string;
  categoryIds?: string[];
  brandIds?: string[];
  priceRange?: PriceRange;
  attributes?: AttributeFilter[];
  inStock?: boolean;
  sortBy?: ProductSortOption;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface PriceRange {
  min?: number;
  max?: number;
  currency?: string;
}

interface AttributeFilter {
  attributeId: string;
  values: string[];
  operator?: 'in' | 'not_in' | 'range' | 'equals';
}

enum ProductSortOption {
  RELEVANCE = 'relevance',
  NAME = 'name',
  PRICE = 'price',
  CREATED_DATE = 'created',
  POPULARITY = 'popularity',
  RATING = 'rating',
  STOCK_QUANTITY = 'stock'
}

interface ProductSearchResult {
  products: Product[];
  totalCount: number;
  facets: SearchFacet[];
  suggestions: string[];
  pagination: PaginationInfo;
}

interface SearchFacet {
  attributeId: string;
  name: string;
  type: AttributeType;
  values: FacetValue[];
}

interface FacetValue {
  value: string;
  displayValue: string;
  count: number;
  selected: boolean;
}

class ProductSearchEngine {
  async searchProducts(query: ProductSearchQuery): Promise<ProductSearchResult> {
    // Build search criteria
    const searchCriteria = await this.buildSearchCriteria(query);
    
    // Execute search
    const searchResults = await this.executeSearch(searchCriteria);
    
    // Generate facets
    const facets = await this.generateFacets(searchCriteria, query);
    
    // Generate suggestions
    const suggestions = await this.generateSuggestions(query.query);
    
    return {
      products: searchResults.products,
      totalCount: searchResults.totalCount,
      facets,
      suggestions,
      pagination: {
        page: query.page || 1,
        limit: query.limit || 20,
        totalPages: Math.ceil(searchResults.totalCount / (query.limit || 20)),
        hasNext: (query.page || 1) * (query.limit || 20) < searchResults.totalCount,
        hasPrevious: (query.page || 1) > 1
      }
    };
  }
  
  private async buildSearchCriteria(query: ProductSearchQuery): Promise<SearchCriteria> {
    const criteria: SearchCriteria = {
      filters: [],
      sort: [],
      pagination: {
        offset: ((query.page || 1) - 1) * (query.limit || 20),
        limit: query.limit || 20
      }
    };
    
    // Text search
    if (query.query) {
      criteria.textSearch = {
        query: query.query,
        fields: ['name', 'description', 'sku', 'attributes.searchable'],
        boost: {
          'name': 2.0,
          'sku': 1.5,
          'description': 1.0
        }
      };
    }
    
    // Category filter
    if (query.categoryIds && query.categoryIds.length > 0) {
      criteria.filters.push({
        field: 'categories',
        operator: 'in',
        values: query.categoryIds
      });
    }
    
    // Brand filter
    if (query.brandIds && query.brandIds.length > 0) {
      criteria.filters.push({
        field: 'brand',
        operator: 'in',
        values: query.brandIds
      });
    }
    
    // Price range filter
    if (query.priceRange) {
      if (query.priceRange.min !== undefined) {
        criteria.filters.push({
          field: 'effectivePrice',
          operator: 'gte',
          value: query.priceRange.min
        });
      }
      if (query.priceRange.max !== undefined) {
        criteria.filters.push({
          field: 'effectivePrice',
          operator: 'lte',
          value: query.priceRange.max
        });
      }
    }
    
    // Attribute filters
    if (query.attributes) {
      for (const attrFilter of query.attributes) {
        criteria.filters.push({
          field: `attributes.${attrFilter.attributeId}`,
          operator: attrFilter.operator || 'in',
          values: attrFilter.values
        });
      }
    }
    
    // Stock filter
    if (query.inStock !== undefined) {
      criteria.filters.push({
        field: 'inventory.quantity',
        operator: query.inStock ? 'gt' : 'lte',
        value: 0
      });
    }
    
    // Sorting
    if (query.sortBy) {
      criteria.sort.push({
        field: this.mapSortField(query.sortBy),
        order: query.sortOrder || 'asc'
      });
    } else if (query.query) {
      // Default to relevance for text searches
      criteria.sort.push({
        field: '_score',
        order: 'desc'
      });
    } else {
      // Default to name for browsing
      criteria.sort.push({
        field: 'name',
        order: 'asc'
      });
    }
    
    return criteria;
  }
  
  private async generateFacets(criteria: SearchCriteria, originalQuery: ProductSearchQuery): Promise<SearchFacet[]> {
    const facets: SearchFacet[] = [];
    
    // Get filterable attributes for the current search context
    const filterableAttributes = await this.getFilterableAttributes(originalQuery.categoryIds);
    
    for (const attribute of filterableAttributes) {
      const facetValues = await this.getFacetValues(attribute, criteria, originalQuery);
      
      if (facetValues.length > 0) {
        facets.push({
          attributeId: attribute.id,
          name: attribute.name,
          type: attribute.type,
          values: facetValues
        });
      }
    }
    
    // Add price range facet
    const priceRanges = await this.getPriceRangeFacet(criteria);
    if (priceRanges.length > 0) {
      facets.push({
        attributeId: 'price',
        name: 'Price',
        type: AttributeType.NUMBER,
        values: priceRanges
      });
    }
    
    return facets;
  }
  
  private mapSortField(sortOption: ProductSortOption): string {
    switch (sortOption) {
      case ProductSortOption.NAME:
        return 'name';
      case ProductSortOption.PRICE:
        return 'effectivePrice';
      case ProductSortOption.CREATED_DATE:
        return 'createdAt';
      case ProductSortOption.POPULARITY:
        return 'popularityScore';
      case ProductSortOption.RATING:
        return 'averageRating';
      case ProductSortOption.STOCK_QUANTITY:
        return 'inventory.quantity';
      default:
        return '_score';
    }
  }
}
```

## Implementation Checklist

### Product Data Model
- [ ] Define comprehensive product entity structure
- [ ] Implement product type variations (simple, configurable, bundle, etc.)
- [ ] Set up product status and visibility management
- [ ] Create product pricing and currency support
- [ ] Implement product media management (images, videos, documents)

### Variant Management
- [ ] Build product variant data model
- [ ] Implement variant attribute system
- [ ] Create variant generation algorithms
- [ ] Set up variant-specific pricing and inventory
- [ ] Build variant selection and matching logic

### Attribute System
- [ ] Design flexible attribute definition system
- [ ] Implement attribute validation rules
- [ ] Create attribute grouping and organization
- [ ] Build filterable and searchable attribute support
- [ ] Set up attribute value management

### Category Management
- [ ] Implement hierarchical category structure
- [ ] Build category tree navigation
- [ ] Create category-product assignment system
- [ ] Set up category-specific attribute inheritance
- [ ] Implement category SEO and display settings

### Search and Filtering
- [ ] Build product search engine
- [ ] Implement faceted search and filtering
- [ ] Create search result ranking and sorting
- [ ] Set up search suggestions and autocomplete
- [ ] Build search analytics and optimization

## Configuration Parameters

```yaml
product_catalog:
  default_currency: "USD"
  supported_currencies: ["USD", "EUR", "GBP", "CAD"]
  max_variants_per_product: 100
  max_categories_per_product: 10
  max_images_per_product: 20
  
  search:
    results_per_page: 20
    max_facet_values: 50
    enable_autocomplete: true
    enable_spell_correction: true
    
  attributes:
    max_custom_attributes: 50
    enable_attribute_inheritance: true
    require_attribute_validation: true
    
  categories:
    max_category_depth: 6
    enable_category_inheritance: true
    default_products_per_page: 24
```

## Integration Points

- **Inventory Management**: Real-time stock tracking and availability
- **Pricing Engine**: Dynamic pricing and promotional pricing
- **Search Engine**: Full-text search and faceted filtering
- **Media Management**: Image processing and CDN integration
- **Order Management**: Product selection and configuration
- **Analytics**: Product performance and catalog insights

## Success Metrics

- Product catalog completeness: >95%
- Search result relevance: >90%
- Variant configuration accuracy: 100%
- Category navigation efficiency: <3 clicks to product
- Attribute filter usage: >60% of searches
- Product data quality score: >4.5/5

## Common Pitfalls to Avoid

1. **Over-complex variant structures**: Keep variant attributes simple and logical
2. **Poor category hierarchy**: Design intuitive, shallow category trees
3. **Inadequate search performance**: Optimize search indexing and caching
4. **Missing attribute validation**: Always validate attribute values
5. **Inconsistent product data**: Enforce data quality standards
6. **Poor image management**: Implement proper image optimization and CDN
7. **Inflexible pricing**: Design pricing system for future complexity

## Related Templates

- `inventory-management.md` - Stock tracking and management
- `product-search.md` - Advanced search and filtering
- `product-reviews.md` - Customer reviews and ratings
- `pricing-engine.md` - Dynamic pricing and promotions
- `media-management.md` - Product image and video handling