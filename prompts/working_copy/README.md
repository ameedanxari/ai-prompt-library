# Working Copy

This folder is where you place your reference materials, designs, and assets for the AI Prompt Library to process.

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
