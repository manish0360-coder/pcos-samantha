<div align="center">
  <!-- <img src="assets/logo.png" alt="PCOS Logo" width="150" /> -->
  <h1>Personal Cognitive Operating System (PCOS)</h1>
  <p><strong>An autonomous, spatial-aware AI architecture featuring "Samantha"</strong></p>
  
  [![Architecture: v1.0](https://img.shields.io/badge/Architecture-v1.0-blue.svg)](docs/SYSTEM_ARCHITECTURE.md)
  [![Status: Active](https://img.shields.io/badge/Status-Active-brightgreen.svg)](docs/PROJECT_STATE.md)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
</div>

## 📖 Overview

Current AI interfaces are purely reactive and lack spatial and temporal context. Users must manually feed context to the AI, resulting in friction and a loss of productivity. 

**PCOS** is a local-first, node-based cognitive architecture designed to give an AI assistant persistent visual memory and proactive voice capabilities. Instead of a chatbot waiting for a prompt, PCOS constantly observes, remembers, reasons, and acts.

**Samantha** is the first persona implemented on top of PCOS, serving as an autonomous accountability and brainstorming partner.

## ✨ Features (MVP)

- **👀 Spatial Perception:** Captures silent visual frames of the user's environment at configurable intervals.
- **🧠 Visual Memory:** Converts raw image data into contextual text logs using Gemini 1.5 Flash Vision.
- **🗄️ Temporal Storage:** Persists a chronological timeline of the user's day in a lightweight SQLite database.
- **🗣️ Natural Voice Interaction:** Responds to native browser speech recognition.
- **🎙️ Proactive Synthesis:** Generates and speaks conversational daily summaries using Text-to-Speech (TTS).

## 🏗️ Architecture

PCOS follows a strict, modular separation of concerns. Data flows unidirectionally:
`Observe → Remember → Retrieve → Reason → Speak`

```text
[CLIENT - Browser]                         [SERVER - Node.js]
+-------------------+                      +---------------------------------------+
|                   |                      |           INFRASTRUCTURE              |
|  1. Perception    |---(WebSocket: Frame)--->| Orchestrator (Events/Sockets)      |
|     (Camera/Mic)  |                      |                                       |
|                   |                      |   +---------------+ +---------------+ |
|  2. Action        |<--(WebSocket: Audio)----|   Reasoning   | |   Action      | |
|     (Speakers)    |                      |   | (Gemini/LLM)| | (TTS Engine)  | |
+-------------------+                      |   +-------+-------+ +-------+-------+ |
                                           |           |                 ^         |
                                           |           v                 |         |
                                           |   +-------+-------+         |         |
                                           |   |   Perception  |         |         |
                                           |   | (Describer)   |---------+         |
                                           |   +-------+-------+                   |
                                           |           |                           |
                                           |           v                           |
                                           |   +-------+-------+                   |
                                           |   |     Memory    |                   |
                                           |   |   (SQLite DB) |                   |
                                           |   +---------------+                   |
                                           +---------------------------------------+

🛠️ Technology Stack
Core: Node.js, Express
Networking: Socket.io (WebSockets)
Database: SQLite3
Vision/Reasoning Engine: Google Gemini 1.5 Flash API
Action (Voice): ElevenLabs API / OpenAI TTS
Client: Vanilla HTML/JS, Browser Web APIs (getUserMedia, SpeechRecognition)

🚀 Quick Start
Note: The project is currently in the foundational phase. Follow the Roadmap for current implementation status.
code
Bash
# 1. Clone the repository
git clone https://github.com/yourusername/pcos-samantha.git
cd pcos-samantha

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env to add your GEMINI_API_KEY and TTS_API_KEY

# 4. Start the cognitive engine
npm run start

📚 Documentation
The architecture and engineering principles of this project are strictly governed. Please read the documentation before contributing.
Project Constitution - The immutable engineering rules.
System Architecture - Module boundaries and data flow.
Project Specification - Requirements and constraints.
Roadmap - Milestone tracking.
Implementation Guide - How to build the system safely.
Coding Standards - Style and syntax rules.
🤝 Contributing
We welcome contributions that adhere to the Architecture Freeze v1.0. Please review CONTRIBUTING.md and the Project Constitution before submitting a Pull Request.

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
code
---

# `docs/PROJECT_CONSTITUTION.md`

```markdown
# Project Constitution

## 1. Vision & Mission

**Vision:** To build a modular, extensible AI architecture that shifts AI from a passive responder to a spatial-aware, proactive cognitive partner. 

**Mission:** Develop the Personal Cognitive Operating System (PCOS) featuring "Samantha," demonstrating senior-level system design through strict separation of concerns, robust data flow, and highly maintainable code.

## 2. Engineering Philosophy

- **Quality over Speed:** We are building a system that will last, not a hackathon prototype.
- **Simplicity over Cleverness:** Readable, predictable code always wins over complex abstractions.
- **Architecture dictates Implementation:** Code is merely the physical manifestation of architectural decisions.

## 3. The 12 Immutable Principles

1. Engineering quality over speed.
2. Architecture before implementation.
3. One milestone at a time. No feature creep.
4. Every module has exactly one responsibility.
5. Every feature must be independently testable.
6. Never implement features before their dependencies exist.
7. Every milestone ends with Verification, a Git Commit, and Documentation.
8. Never create spaghetti code. Prefer modular architecture.
9. Every implementation decision must reference the architecture.
10. Prefer simplicity over cleverness.
11. The MVP must strictly follow the flow: `Observe → Remember → Retrieve → Reason → Speak`.
12. The project must meet standard Senior Software Engineer review criteria.

## 4. Module Ownership & Boundaries

No subsystem is permitted to bypass another. 
- **Perception** observes but does not think. 
- **Memory** stores but does not decide. 
- **Reasoning** decides but does not execute. 
- **Action** executes but does not evaluate. 
- **Infrastructure** orchestrates but contains no business logic.

## 5. AI Usage Policy

AI code generation tools (Copilot, ChatGPT, Gemini) may be used to write boilerplate or implement specific functions, but **they may not alter the architecture**. The developer is 100% responsible for ensuring AI-generated code complies with this Constitution and the `CODING_STANDARDS.md`.

## 6. Definition of Done (DoD)

A milestone is only considered "Done" when:
1. The code accomplishes the milestone objective without side effects.
2. The module adheres to its boundary constraints.
3. The feature has been manually or automatically verified.
4. Console logs/debug statements are removed or leveled properly.
5. The code is committed with a standard conventional commit message.

## 7. Change Management & Feature Rejection

Any feature request that falls outside the MVP (e.g., "phone detection," "whiteboard reading") is automatically rejected for Phase 1. They will be logged in the roadmap for V2/V3. Modifying the MVP scope requires an Architecture Decision Record (ADR) update in the `DECISION_LOG.md`.