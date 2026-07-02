# Contributing to PCOS

First off, thank you for considering contributing to the Personal Cognitive Operating System!

To ensure system stability, all development is strictly governed by our `Architecture Freeze v1.0`. Please read the [Project Constitution](docs/PROJECT_CONSTITUTION.md) before you start typing.

## 1. Development Workflow

1. **Check the Roadmap:** Look at `docs/ROADMAP.md` and `docs/PROJECT_STATE.md` to see the current active milestone. 
2. **Branching:** Create a branch from `main` using the format `<type>/<issue-or-milestone>-<short-desc>`.
   - Example: `feat/m1-client-webcam`
3. **Implementation:** Write your code following the [Coding Standards](docs/CODING_STANDARDS.md).
4. **Commit:** Use conventional commits.
5. **Pull Request:** Submit a PR against `main`.

## 2. Pull Request Checklist

Before submitting a PR, ensure you can check off the following:
- [ ] My code follows the project's coding standards.
- [ ] I have not violated module boundaries (e.g., Perception does not write to the DB).
- [ ] I have performed a self-review of my own code.
- [ ] I have verified error handling (try/catch blocks are present).
- [ ] I have updated the `PROJECT_STATE.md` if completing a milestone.
- [ ] My commit messages follow the required format.

## 3. Architecture Compliance

If your PR introduces a new library, changes data flow, or alters the MVP scope, it **will be rejected** unless it is preceded by a proposal to update the `DECISION_LOG.md`. 

We prioritize clean architecture over rapid feature deployment.