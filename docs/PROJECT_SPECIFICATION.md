# Project Specification

## 1. Executive Summary
PCOS is a local-first (with cloud LLM reliance) node-based architecture designed to give an AI assistant persistent visual memory and proactive voice capabilities. 

## 2. Problem Statement
Current AI interfaces are purely reactive and lack spatial and temporal context. Users must manually feed context to the AI, resulting in friction and loss of productivity.

## 3. Target Users
Knowledge workers, developers, and founders seeking an autonomous accountability and brainstorming partner.

## 4. Functional Requirements (MVP)
- **FR1:** The system shall capture an image from the user's webcam at a configurable interval (e.g., 60 seconds).
- **FR2:** The system shall convert the captured image into a brief textual description using a Vision LLM.
- **FR3:** The system shall store the timestamped text description in a local SQLite database.
- **FR4:** The system shall retrieve historical logs upon user voice request.
- **FR5:** The system shall synthesize a daily summary based on retrieved logs using an LLM.
- **FR6:** The system shall output the LLM response via Text-to-Speech (TTS).

## 5. Non-Functional Requirements
- **NFR1 (Modularity):** Adding a new sensor (e.g., screen capture) must not require changes to the Reasoning or Action modules.
- **NFR2 (Latency):** The core event loop must not block the Node.js main thread.
- **NFR3 (Privacy):** Raw images must not be stored on the disk; they are held in memory only as long as required for transmission to the Vision API.

## 6. Constraints & Assumptions
- **Constraint:** Must run locally on a standard developer machine.
- **Constraint:** Relies on third-party APIs (Gemini, TTS) requiring internet access.
- **Assumption:** The user will grant persistent webcam and microphone permissions to the local client interface.

## 7. Technology Stack
- **Core:** Node.js, Express
- **Networking:** Socket.io (WebSockets)
- **Database:** SQLite3
- **AI (Vision/Reasoning):** Google Gemini 1.5 Flash API
- **AI (Action):** ElevenLabs API (or OpenAI TTS)
- **Client:** Vanilla HTML/JS, Browser Web APIs (`getUserMedia`, `SpeechRecognition`)

## 8. Out-of-Scope Features (For MVP)
- Proactive interruption (e.g., detecting a phone and yelling at the user).
- Complex multi-agent routing.
- Vector embeddings (SQLite keyword search is sufficient for MVP).
- Custom wake-word detection (using push-to-talk or click-to-talk for MVP).