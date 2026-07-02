# Implementation Guide

## 1. The Execution Strategy
You are not building an AI app; you are building an **Operating System pipeline**. 

Follow the `ROADMAP.md` strictly. Build the skeletal plumbing first. Ensure data can flow seamlessly from `Browser -> WebSockets -> Node -> Console` before you even touch an AI API.

## 2. Order of Operations
1. **Always build the interface first.** Can the code physically access the hardware?
2. **Build the transport layer second.** Can the data travel to the processor?
3. **Build the logic third.** Can the data be transformed?
4. **Build the persistence fourth.** Can the result be saved?

## 3. What NOT to build yet
- Do **not** style the frontend. Do not add CSS files. The UI should be raw HTML until M7 is complete.
- Do **not** implement complex prompt engineering. Use simple strings (e.g., `"Describe this image"`) until the pipeline works.
- Do **not** build "phone detection rules" or proactive alerts. That is V2.

## 4. Common Beginner Traps to Avoid
- **The God File:** Do not put database logic, socket logic, and API calls in `server.js`. `server.js` is a traffic cop. It only delegates.
- **API Key Leaks:** Ensure `.env` is inside `.gitignore` from Step 1.
- **Blocking the Loop:** Do not use synchronous file reading/writing (`fs.readFileSync`). Use standard `async/await` for database and API calls.
- **Client-side Logic:** Do not put Gemini API keys in the `client/app.js`. The browser is a dumb terminal. 

## 5. Verification Protocol
After every milestone, execute a failure test.
- Turn off your webcam. Does the server crash gracefully or fatally?
- Disconnect the internet. Does the API call throw an unhandled promise rejection?
Fix the error handling before moving to the next milestone.