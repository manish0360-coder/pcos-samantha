# Coding Standards

## 1. Naming Conventions
- **Folders:** lowercase, snake_case (e.g., `api/`, `vision_describe/`).
- **Files:** lowercase, snake_case (e.g., `server.js`, `prompt_builder.js`).
- **Functions:** camelCase, verb-first (e.g., `captureFrame()`, `saveLog()`).
- **Variables:** camelCase, descriptive (e.g., `base64Image`, `dailySummary`).
- **Constants/ENV:** UPPER_SNAKE_CASE (e.g., `GEMINI_API_KEY`, `CAPTURE_INTERVAL`).

## 2. Async/Await Rules
- Use `async/await` for all asynchronous operations. Do not use `.then().catch()` chains.
- Every `await` must be contained within a `try/catch` block.

```javascript
// Good
async function processImage(data) {
    try {
        const result = await visionApi.describe(data);
        return result;
    } catch (error) {
        console.error("Vision API Failed:", error.message);
        return null;
    }
}

3. Module Exports
Use standard CommonJS syntax for the Node.js backend.
code
JavaScript
module.exports = { functionName };
4. Comment Standards
Do not write comments explaining what code does (the code should be readable).
Write comments explaining why a specific approach was taken.
Add JSDoc comments for core module functions defining parameters and return types.
5. Code Review & PR Checklist

Does this violate any architectural boundaries?

Are API keys hardcoded? (They must be in .env)

Is error handling in place?

Is the function doing more than one thing?
6. Git Commit Rules (Conventional Commits)
feat(scope): add new feature
fix(scope): resolve bug
chore(scope): update config, dependencies, or docs
refactor(scope): rewrite code without changing behavior

<> code
---

# `docs/CHANGELOG.md`

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - Unreleased

### Added
- Initial project repository creation.
- Architecture Freeze v1.0 documentation suite.
- `README.md` and basic scaffolding.
- Project Constitution and Implementation Guide.

### Changed
- *None*

### Fixed
- *None*

### Removed
- *None*