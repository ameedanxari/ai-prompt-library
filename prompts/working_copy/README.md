# Working Copy

## Purpose
This directory serves as the workspace for reference materials, designs, and assets that the AI Prompt Library processes to generate comprehensive project specifications and implementation guidance.

## Instructions

1. **Organize Reference Materials**: Place designs, specifications, and assets in appropriate subdirectories
2. **Prepare File Formats**: Ensure files are in supported formats for optimal processing
3. **Run Intake Process**: Execute the intake stage to scan and organize assets
4. **Reference Assets**: Link assets in project briefs or enable auto-discovery
5. **Maintain File Structure**: Keep organized directory structure for efficient processing
6. **Update Content**: Regularly update reference materials as project evolves
7. **Clean Workspace**: Remove outdated or unnecessary files to maintain clarity

## Examples

### Example 1: Design Asset Organization
```
working_copy/
├── designs/
│   ├── wireframes/
│   │   ├── homepage.fig
│   │   └── user-dashboard.sketch
│   ├── mockups/
│   │   ├── mobile-app.png
│   │   └── desktop-layout.jpg
│   └── prototypes/
│       └── interactive-demo.xd
```

### Example 2: Specification Processing
```typescript
interface AssetProcessor {
  scanDirectory(path: string): Promise<AssetInventory>;
  processDesigns(designFiles: DesignFile[]): Promise<DesignSpecs>;
  extractRequirements(specFiles: SpecFile[]): Promise<Requirements>;
}

const processor = new AssetProcessor();
const assets = await processor.scanDirectory('./working_copy');
```

### Example 3: Asset Reference in Brief
```markdown
# Project Brief
## Design References
- UI Mockups: `./working_copy/designs/mockups/`
- Brand Guidelines: `./working_copy/assets/brand-guide.pdf`
- Data Schema: `./working_copy/data-samples/api-schema.json`
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| autoScanEnabled | Enable automatic asset scanning | boolean | No | true |
| supportedFormats | List of supported file formats | array | Yes | N/A |
| maxFileSize | Maximum file size for processing (MB) | number | No | 100 |
| enableVersioning | Track asset version changes | boolean | No | false |
| compressionEnabled | Enable asset compression | boolean | No | true |
| backupAssets | Create backup copies of assets | boolean | No | false |
| validateAssets | Validate asset integrity | boolean | No | true |
| enableMetadataExtraction | Extract file metadata | boolean | No | true |
| organizationMode | Asset organization strategy | string | No | "auto" |

## Expected Output

This workspace will enable:
- **Asset Organization**: Structured storage of project reference materials
- **Design Processing**: Automated extraction of design specifications and requirements
- **Content Analysis**: Intelligent analysis of existing documentation and specifications
- **Asset Discovery**: Automatic detection and cataloging of project assets
- **Reference Integration**: Seamless integration of assets into generated specifications
- **Version Tracking**: Optional versioning and change tracking for assets
- **Quality Validation**: Asset integrity checking and format validation
- **Metadata Extraction**: Automatic extraction of useful asset metadata

## Directory Structure

```
working_copy/
├── designs/           # UI/UX mockups, wireframes, Figma exports
├── specifications/    # Existing specs, PRDs, requirements docs
├── data-samples/      # Sample data, schemas, API responses
└── assets/           # Images, icons, brand guidelines, fonts
```

## How to Use

1. **Add your files** to the appropriate subdirectory
2. **Run the intake stage** — the library will scan and organize your assets
3. **Reference assets** in your brief or let the library auto-discover them

## Supported File Types

| Category | Formats |
|----------|---------|
| Designs | `.fig`, `.sketch`, `.xd`, `.png`, `.jpg`, `.svg`, `.pdf` |
| Specifications | `.md`, `.txt`, `.docx`, `.pdf`, `.yaml`, `.json` |
| Data Samples | `.json`, `.csv`, `.xml`, `.yaml`, `.sql` |
| Assets | `.png`, `.jpg`, `.svg`, `.ico`, `.ttf`, `.otf`, `.woff` |

## Notes

- This folder is excluded from version control by default
- The library maintains provenance tracking for all processed assets
- Original files are preserved; processed versions go to `outputs/`
