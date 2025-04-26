# Contributing to AI-Kit

Thank you for your interest in contributing to AI-Kit! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## How Can I Contribute?

### Reporting Bugs

- Check if the bug has already been reported in the [Issues](https://github.com/TheSolaAI/ai-kit/issues)
- If not, create a new issue with a descriptive title and detailed description
- Include steps to reproduce the bug and any relevant error messages

### Suggesting Features

- Check if your feature has already been suggested in the [Issues](https://github.com/TheSolaAI/ai-kit/issues)
- If not, create a new issue with the label "enhancement"
- Describe the feature in detail and explain why it would be valuable

### Pull Requests

1. Fork the repository
2. Clone your fork:
   ```
   git clone https://github.com/YOUR-USERNAME/ai-kit.git
   cd ai-kit
   ```
3. Add the upstream repository:
   ```
   git remote add upstream https://github.com/TheSolaAI/ai-kit.git
   ```
4. Create a new branch for your changes:
   ```
   git checkout -b feature/your-feature-name
   ```
5. Make your changes
6. Run tests and ensure they pass
7. Update documentation if necessary
8. Commit your changes following the [Commit Guidelines](#commit-guidelines)
9. Push to your fork:
   ```
   git push origin feature/your-feature-name
   ```
10. Create a pull request from your fork to the main repository

## Development Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Build the project:
   ```
   npm run build
   ```
3. Run tests:
   ```
   npm test
   ```

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, semicolons, etc)
- `refactor:` Code changes that neither fix bugs nor add features
- `perf:` Performance improvements
- `test:` Adding or updating tests
- `chore:` Changes to the build process or auxiliary tools

Example:

```
feat(tokenToolSet): add support for new token API endpoint
```

## Code Style

- Follow the existing code style and structure
- Use TypeScript for all new code
- Comment complex logic
- Write unit tests for new features

## Creating a New Toolset

AI-Kit is designed to be extensible through additional toolsets. Here's how to create a new toolset:

1. Create a new directory under `src/sola/` for your toolset:

   ```
   mkdir src/sola/myNewToolSet
   ```

2. Create an `index.ts` file that exports your toolset factory:

   ```typescript
   import { createToolSetFactory } from '../../tools';
   import { myToolFactory } from './myTool';

   export const myNewToolSetFactory = createToolSetFactory(
     {
       slug: 'myNewTool',
       name: 'My New Tool',
       description: 'Description of what my new tool does',
     },
     {
       myTool: myToolFactory,
     }
   );
   ```

3. Create individual files for each tool:

   ```typescript
   // myTool.ts
   import { createToolFactory } from '../../tools';
   import { z } from 'zod';

   export const myToolFactory = createToolFactory(
     {
       description: 'What my tool does',
       parameters: z.object({
         param1: z.string().describe('First parameter'),
         param2: z.number().optional().describe('Second parameter (optional)'),
       }),
     },
     async (params, context) => {
       // Tool implementation
       return {
         success: true,
         data: 'Result',
       };
     }
   );
   ```

4. Export your toolset from `src/sola/index.ts`:

   ```typescript
   export { myNewToolSetFactory } from './myNewToolSet';
   ```

5. Add tests for your toolset in the `test` directory

## Documentation

When adding new features or tools:

1. Update the README.md if necessary
2. Add or update documentation in the `docs` directory
3. Include examples in your documentation
4. Add JSDoc comments to your code

## Release Process

1. Ensure all tests pass
2. Update version number in package.json
3. Update CHANGELOG.md
4. Create a pull request for the release
5. Once approved, merge and create a new tag:
   ```
   git tag v1.x.x
   git push origin v1.x.x
   ```

## Questions?

If you have questions, feel free to open an issue or contact the maintainers.

Thank you for contributing to AI-Kit!
