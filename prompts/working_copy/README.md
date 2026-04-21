# `working_copy/` — reference material for the engine

## Purpose

Drop your reference material here before (or during) a library run.
The library's `external-input-handler.md` scans this directory when
you start, extracts entities, roles, flows, and constraints, and
writes the result to `prompts/outputs/current/project-context.md`
before either engine runs.

If this directory is empty, the engine runs on your brief alone.

## What to put here

| Category | Examples |
|---|---|
| Designs | `.fig`, `.sketch`, `.xd`, `.png`, `.jpg`, `.svg`, `.pdf` mockups and wireframes |
| Specifications | PRDs, requirements docs, API specs — `.md`, `.txt`, `.docx`, `.pdf`, `.yaml`, `.json` |
| Data samples | Example records, database exports, API responses — `.json`, `.csv`, `.xml`, `.yaml`, `.sql` |
| Brand assets | Color palettes, logos, typography — `.png`, `.jpg`, `.svg`, `.ico`, `.ttf`, `.otf`, `.woff` |
| Existing code | Source files from a reference implementation (the engine will read them, not execute them) |

Optional subdirectories for clarity:

```
working_copy/
├── designs/
├── specifications/
├── data-samples/
└── assets/
```

## What the handler does with it

`prompts/orchestrators/external-input-handler.md` reads the material
and produces `prompts/outputs/current/project-context.md` with:

- **Entities** extracted from schemas, specs, or code.
- **Roles / personas** inferred from designs and flows.
- **User flows** traced from mockups or existing UI.
- **Constraints** called out explicitly in specs (compliance,
  performance targets, deployment targets).

Once `project-context.md` exists, every engine step treats it as
authoritative — it overrides template defaults in any conflict.

## Notes

- This folder is gitignored by default in consumer projects.
- Original files are left alone. Extracted context lives under
  `prompts/outputs/current/`.
- You do not need to pre-process anything. Drop files in and start
  the engine — the handler does the scan.
