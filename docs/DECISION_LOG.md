# Architecture Decision Records (ADRs)

| ID | Context | Decision | Reason & Trade-offs | Status |
| :--- | :--- | :--- | :--- | :--- |
| **ADR-001** | Need a lightweight, local database to store timeline logs. | **Use SQLite3** | Overkill to use PostgreSQL or Vector DBs (Pinecone) for chronological text data in MVP. SQLite is fast, local, and requires zero extra infrastructure. | Active |
| **ADR-002** | Real-time communication between Client and Server. | **Use WebSockets (Socket.io)** | REST APIs are inefficient for constant data streaming (interval images) and pushing server-initiated audio back to the client. | Active |
| **ADR-003** | Processing visual context from frames. | **Use Gemini 1.5 Flash Vision API** | Local models (LLaVA) are too slow for real-time processing on standard developer machines. Gemini Flash offers ultra-low latency. | Active |
| **ADR-004** | Triggering AI actions via voice. | **Use Browser Web Speech API** | Building custom STT (Whisper) backend adds unnecessary complexity and latency for MVP. Browser STT is native and free. | Active |