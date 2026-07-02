# System Architecture

## 1. Data and Event Flow Diagram

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

2. Folder Structure
pcos-samantha/
├── client/                 # DUMB TERMINAL: Only captures input and plays output
│   ├── index.html
│   └── app.js
├── server/                 # COGNITIVE ENGINE: The brains of the operation
│   ├── api/                # Express routes
│   ├── memory/             # DB Interactions (store.js, retrieve.js)
│   ├── perception/         # Interpreting inputs (vision_describe.js)
│   ├── reasoning/          # Core thinking (summarize.js, prompt_builder.js)
│   ├── action/             # Output generation (tts.js)
│   ├── database/           # SQLite initialization and schema
│   ├── config/             # Environment variables mapping
│   └── server.js           # The Orchestrator (Wiring it all together)
├── docs/                   # Engineering Documentation
├── .env                    # Secrets (Git-ignored)
├── .gitignore
├── package.json
└── README.md

3. Module Responsibilities & Boundary Rules
Infrastructure (server.js)
Responsibility: Route data between modules. Manage WebSocket connections.
Rule: Contains absolutely NO business logic, database queries, or LLM prompts.
Perception (client/app.js & server/perception/)
Responsibility: Observe the physical world and convert it to raw data (Client) and then to structured context (Server via Vision LLM).
Rule: Never makes decisions. Only describes what it sees.
Memory (server/memory/ & server/database/)
Responsibility: Store and retrieve structured context.
Rule: Never alters data. Operates strictly as a CRUD layer.
Reasoning (server/reasoning/)
Responsibility: Apply logic and personality to retrieved memory. Construct prompts.
Rule: Never executes actions. It returns a string of text to the Orchestrator.
Action (server/action/)
Responsibility: Convert reasoning outputs into physical manifestations (TTS Audio).
Rule: Never evaluates if an action is correct; it blindly executes the command given by the Orchestrator.
4. Communication Protocol
Client to Server: Socket.io events (frame_capture, speech_recognized).
Server to Client: Socket.io events (audio_response, system_status).
Inter-module (Server): Standard synchronous or asynchronous function calls orchestrated by server.js.

<> code
---

# `docs/ROADMAP.md`

```markdown
# Implementation Roadmap

This project is strictly governed by milestone progression. Do not start a milestone until the previous one is verified and committed.

## Milestone 0: Project Foundation
- **Objective:** Create the repository, folder structure, and install dependencies.
- **Dependencies:** None.
- **Deliverables:** Folder tree, `package.json`, `.env` template, Markdown documentation.
- **Exit Criteria:** `npm start` runs an empty Express server without crashing.
- **Expected Commit:** `chore: initialize project skeleton and architecture`

## Milestone 1: Perception (The Eyes - Client Side)
- **Objective:** Capture webcam frames in the browser on a set interval.
- **Dependencies:** Milestone 0.
- **Deliverables:** `client/index.html`, `client/app.js` using `getUserMedia()`.
- **Exit Criteria:** Browser console logs a Base64 image string every 60 seconds.
- **Expected Commit:** `feat(perception): implement client webcam capture`

## Milestone 2: Infrastructure (The Bridge)
- **Objective:** Transmit frames from Client to Server.
- **Dependencies:** Milestone 1.
- **Deliverables:** `server.js` with Socket.io; `client/app.js` emitting events.
- **Exit Criteria:** Node.js terminal successfully logs receipt of the Base64 image payload.
- **Expected Commit:** `feat(infra): establish websocket bridge for sensor data`

## Milestone 3: Perception (Vision Decoding)
- **Objective:** Convert raw image to context text using Gemini Vision API.
- **Dependencies:** Milestone 2.
- **Deliverables:** `server/perception/vision_describe.js`.
- **Exit Criteria:** Node.js terminal logs AI descriptions (e.g., *"User is sitting at a desk looking at a monitor."*)
- **Expected Commit:** `feat(perception): integrate vision llm for frame description`

## Milestone 4: Memory (The Brain)
- **Objective:** Persist visual logs to a database.
- **Dependencies:** Milestone 3.
- **Deliverables:** `server/database/db.js`, `server/memory/store.js`.
- **Exit Criteria:** SQLite database file is created and contains chronological text logs.
- **Expected Commit:** `feat(memory): implement sqlite storage for visual logs`

## Milestone 5: Reasoning (The Synthesis)
- **Objective:** Read logs and generate a conversational summary.
- **Dependencies:** Milestone 4.
- **Deliverables:** `server/memory/retrieve.js`, `server/reasoning/summarize.js`.
- **Exit Criteria:** Server can fetch logs and generate a cohesive text paragraph via LLM.
- **Expected Commit:** `feat(reasoning): generate daily summary from memory logs`

## Milestone 6: Action (The Voice)
- **Objective:** Convert the text summary into audio and play it on the client.
- **Dependencies:** Milestone 5.
- **Deliverables:** `server/action/tts.js`, Socket emit to client, Client Audio playback.
- **Exit Criteria:** User hears the summary spoken out loud from their speakers.
- **Expected Commit:** `feat(action): implement tts and client audio playback`

## Milestone 7: Perception (Ears / STT)
- **Objective:** Allow user to trigger the summary via voice command.
- **Dependencies:** Milestone 6.
- **Deliverables:** `SpeechRecognition` implementation in `client/app.js`.
- **Exit Criteria:** User says "Summarize my day", triggering M5 and M6 seamlessly.
- **Expected Commit:** `feat(perception): add speech-to-text trigger for summaries`