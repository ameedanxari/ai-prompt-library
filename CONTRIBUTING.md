# Contributing to AI Prompt Library

First off, thank you for considering contributing! 🎉

This project thrives on community input. Whether you're fixing a typo, adding a new module, or suggesting a major feature, your contribution is valued.

## Ways to Contribute

### 🐛 Report Bugs
Found something broken? [Open an issue](https://github.com/ameedanxari/ai-prompt-library/issues/new) with:
- A clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Your environment (OS, AI tool you're using)

### 💡 Suggest Features
Have an idea? [Start a discussion](https://github.com/ameedanxari/ai-prompt-library/discussions/new) with:
- The problem you're trying to solve
- Your proposed solution
- Any alternatives you've considered

### 🔧 Submit Code
Ready to code? Here's how:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Test your changes**: Run `npm test` to ensure all tests pass
5. **Commit with a clear message**: `git commit -m "Add: amazing feature for X"`
6. **Push to your fork**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### 📝 Improve Documentation
Documentation improvements are always welcome:
- Fix typos or unclear explanations
- Add examples
- Improve the README
- Add JSDoc comments to code

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/ai-prompt-library.git
cd ai-prompt-library

# Install dependencies
npm install

# Run tests
npm test

# Run specific test file
npm test -- tests/property-tests/template-structure.test.ts
```

## Code Style

- Use TypeScript for all source files
- Follow existing patterns in the codebase
- Add tests for new functionality
- Keep prompts modular and composable

## Prompt Template Guidelines

When adding or modifying prompt templates:

1. **Follow the structure**: Include Purpose, Instructions, and Examples sections
2. **Be modular**: Templates should work as standalone units
3. **Include examples**: Show concrete usage scenarios
4. **Test with multiple AI tools**: Verify prompts work with Cursor, Windsurf, Claude, etc.

## Commit Message Format

```
Type: Short description

Longer description if needed.

- Bullet points for multiple changes
- Reference issues: Fixes #123
```

Types:
- `Add`: New feature or file
- `Fix`: Bug fix
- `Update`: Modification to existing feature
- `Remove`: Deletion of code or files
- `Docs`: Documentation only
- `Test`: Test additions or fixes
- `Refactor`: Code restructuring without behavior change

## Pull Request Process

1. Update the README.md if your change affects usage
2. Update relevant documentation
3. Add tests for new functionality
4. Ensure all tests pass
5. Request review from maintainers

## Questions?

- 💬 [Start a discussion](https://github.com/ameedanxari/ai-prompt-library/discussions)
- 📧 [Contact MatrixTribe](https://matrixtribe.ai/contact-us/)

## Code of Conduct

Be kind, be respectful, be constructive. We're all here to build something useful together.

---

Thank you for contributing! 🙏
