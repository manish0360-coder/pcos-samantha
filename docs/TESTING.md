# Testing Strategy

## 1. Testing Philosophy
Every feature must be independently testable. If a module cannot be tested in isolation, its boundary is poorly defined. 

## 2. Milestone Verification Checklist
Before committing a milestone, verify the following:
- [ ] The code runs without syntax errors.
- [ ] `npm start` executes successfully.
- [ ] No `console.error` logs appear during standard operation.
- [ ] The specific Deliverable for the milestone functions exactly as described.
- [ ] Code adheres to `CODING_STANDARDS.md`.

## 3. Failure Scenarios (Error Recovery)
The system must gracefully handle the following without crashing:
- **Camera Denied:** Client must show an alert; Server must remain active.
- **Network Disconnect:** Socket.io must attempt reconnects; Server must not crash if an emit fails.
- **API Rate Limit/Failure:** If Gemini or TTS fails, the catch block must log the error and skip the current cycle, leaving the application alive for the next interval.
- **Database Lock:** SQLite transactions must be wrapped in `try/catch`.

## 4. Manual API Verification
When implementing APIs (M3, M5, M6), test the prompt and response payload using Postman or a simple isolated `.js` script before integrating it into the orchestrator.

## 5. Browser Compatibility
MVP testing is restricted to **Google Chrome (latest)** or **Brave**, as they have the most stable support for `getUserMedia` and the `Web Speech API`.