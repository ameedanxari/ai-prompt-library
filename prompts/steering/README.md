# Steering Files

## Purpose

Steering files guide AI agents to maintain consistency and prevent breaking changes when working on projects that use this prompt library. These files are designed to be copied or symlinked into your AI tool's configuration directory.

## Files

| File | Purpose |
|------|---------|
| `architecture-guard.md` | Prevents AI from breaking existing functionality |
| `library-context.md` | Helps AI understand the library structure |
| `change-review.md` | Guides AI through reviewing changes safely |

## Tool-Specific Setup

Different AI tools look for steering/rules files in different locations. Here's where to put these files:

| AI Tool | Location | Method |
|---------|----------|--------|
| **Kiro IDE** | `.kiro/steering/` | Copy or symlink files here |
| **Cursor** | `.cursor/rules/` | Copy or symlink files here |
| **Windsurf** | `.windsurf/rules/` | Copy or symlink files here |
| **Continue** | Reference in `.continue/config.json` | Add file paths to system prompt |
| **Aider** | Reference in `.aider.conf.yml` | Add to `read` section |
| **Claude/ChatGPT** | Paste content in system prompt | Copy content directly |
| **Other Tools** | Consult tool documentation | Varies by tool |

## Setup Instructions

### Automatic Setup (Recommended)

Use the one-prompt setup from the main README. Your AI assistant will automatically set up these files for your specific tool.

### Manual Setup

1. Identify your AI tool from the table above
2. Create the target directory if it doesn't exist
3. Copy or symlink the steering files:

**Copy method:**
```bash
cp .ai-prompts/prompts/steering/*.md <target-directory>/
```

**Symlink method (stays in sync with library updates):**
```bash
ln -s /path/to/.ai-prompts/prompts/steering/architecture-guard.md <target-directory>/
ln -s /path/to/.ai-prompts/prompts/steering/library-context.md <target-directory>/
ln -s /path/to/.ai-prompts/prompts/steering/change-review.md <target-directory>/
```

## What These Files Do

Once set up, these steering files will automatically guide AI agents to:

1. **Review existing code** before making changes
2. **Follow established patterns** in your codebase
3. **Preserve functionality** when fixing issues
4. **Maintain consistency** across the project
