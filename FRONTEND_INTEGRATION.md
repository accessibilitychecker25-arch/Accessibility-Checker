# Frontend Integration Guide — Batch & Session-based Remediation

This document explains how the frontend should integrate with the new session and batch endpoints for uploading and downloading remediated .docx files.

Summary
- Purpose: enable session-backed batch uploads and a single ZIP download of remediated files.
- Backward compatible: existing single-file endpoints (`/api/upload-document`, `/api/download-document`) continue to work.

Quick integration checklist (high level)

1) Add session management (5 minutes)
- Call POST `/api/session` when the user opens the upload page or starts a batch flow. The server will return a session token and a TTL.
- Store the session token in memory (or in sessionStorage) for the duration of the user's session and include it on subsequent requests (Authorization header or `X-Session-Id` header depending on backend contract).

2) Add batch upload (10 minutes)
- Use `POST /api/batch-upload` to upload multiple files at once. Send a `multipart/form-data` with multiple `file` fields or a single `files[]` field.
- Include the session token header so the server can attach uploaded files to the session.
- Show per-file progress using XHR or axios upload progress. The server will return a JSON list of analysis reports (one per file) or a session-level summary.

3) Add batch download (2 minutes)
- After remediation completes, call `GET /api/batch-download?sessionId=<id>` to download a ZIP archive containing all remediated files.
- Use an `<a>` element with an object URL to trigger the download or set `window.location` to the `GET` URL if the endpoint returns a `Content-Disposition: attachment` header.

New backend endpoints (available now)

- POST /api/session
  - Request: { /* optional user/context metadata */ }
  - Response: { sessionId: string, expiresInSeconds: number }

- POST /api/batch-upload
  - Request: multipart/form-data { files: File[] } + session header
  - Response: { files: [{ fileName, suggestedFileName, report }], sessionId }

- GET /api/batch-download
  - Request: query ?sessionId=<id> or session header
  - Response: application/zip blob
  - Note: server sets Content-Disposition and allows CORS for the header if needed

Suggested FE UX behavior

- Upload UI
  - Allow selecting multiple files or dragging a batch of files.
  - Show per-file upload progress and per-file analysis results as they arrive.
  - Allow users to remove files from the session before finalizing.

- Download UI
  - Show a single “Download all remediated files” button once all files are ready.
  - The button should call `GET /api/batch-download` and trigger the ZIP download.

Benefits and notes

- Benefits
  - Users can upload many files at once (recommended for 5+ files).
  - Download a single ZIP of remediated files instead of downloading one-by-one.
  - Session-backed files auto-expire (server-side cleanup) — no manual cleanup required.

- Backward compatibility
  - Existing single-file endpoints still exist and work. Implement batch flows as an optional enhancement.

Security and CORS

- Ensure your frontend includes the session header/session token on each batch endpoint call.
- The backend must expose `Content-Disposition` for `GET /api/batch-download` if the frontend needs to parse filenames. Typically you can rely on the browser to use the header to name the downloaded ZIP.

Testing and QA

- Unit tests: mock `/api/batch-upload` responses and ensure the UI updates per-file and shows progress.
- E2E: upload multiple sample files, wait for completion, and assert that `GET /api/batch-download` returns a ZIP and that the archive contains the expected filenames.

Rollout guidance

- Roll out batch uploads behind a feature flag if you want to gradually enable the experience.
- Monitor server load: batch analysis may increase concurrency; consider queueing or rate limiting.

Appendix — Example request/response

POST /api/session

Request
```
POST /api/session
{}
```

Response
```
{
  "sessionId": "abc123",
  "expiresInSeconds": 3600
}
```

POST /api/batch-upload (multipart/form-data)

Response (example)
```
{
  "sessionId":"abc123",
  "files": [
    { "fileName":"a.docx", "suggestedFileName":"a-remediated.docx", "report": { /* analysis */ }},
    { "fileName":"b.docx", "suggestedFileName":"b-remediated.docx", "report": { /* analysis */ }}
  ]
}
```

GET /api/batch-download

Response: application/zip (Content-Disposition: attachment; filename="remediated-files.zip")

---

If you want, I can also:
- Add a small example React/Angular/Vue UI snippet that demonstrates session creation, batch upload, and batch download usage.
- Draft tests (Cypress) for multi-file upload and ZIP download validation.

Happy to help the FE team implement this — tell me which framework (Angular) and I can provide an example patch to integrate it into `src/app`.
