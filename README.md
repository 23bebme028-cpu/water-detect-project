# JalSaarthi AI — SIH GitHub Pages Prototype

A privacy-first, multilingual-ready government virtual assistant prototype inspired by SIH25066 (AI-driven ChatBOT for INGRES as a virtual assistant).

## GitHub Pages

1. Create a GitHub repository.
2. Upload `index.html`, `style.css`, `app.js`, and `privacy-policy.html`.
3. Go to **Settings → Pages**.
4. Choose **Deploy from a branch**.
5. Select `main` and `/ (root)`.
6. Save.
7. Your site will be available at the GitHub Pages URL shown by GitHub.

## Current prototype

- Responsive citizen assistant UI.
- Rule-based demo conversation.
- Tamil voice-input option when browser speech recognition is available.
- Minimal-data request builder.
- Local browser storage using IndexedDB.
- Local officer-view request list.
- JSON export of local demo records.
- Privacy notice.
- No API key is included.
- No citizen data is uploaded by the prototype.

## Important security limitation

GitHub Pages is static hosting. It is **not a secure backend/database**.

Do not put:
- API secrets
- service-role database keys
- passwords
- private credentials
- sensitive citizen data

into this repository or frontend JavaScript.

For production, connect the frontend to a backend such as Supabase/PostgreSQL or a government-approved backend with:
- authentication
- Row Level Security / server-side authorization
- least-privilege access
- encrypted transport (HTTPS)
- encrypted storage where required
- audit logs
- retention and deletion policies
- consent and privacy notices
- rate limiting
- input validation
- secure file storage
- malware/file-type checks
- secret management on the server

## Suggested production architecture

Citizen browser
→ GitHub Pages frontend
→ authenticated backend/API
→ PostgreSQL database
→ private object storage
→ AI/RAG service

The AI service should retrieve answers from an approved knowledge base rather than inventing government procedures.

## SIH demo advice

For the judging demo, show:

1. Citizen sends a natural-language request.
2. Assistant understands the intent.
3. User supplies location/evidence.
4. A structured service request is created.
5. Officer view receives the request.
6. Explain that the GitHub Pages version intentionally uses local-only demo storage.
7. Show the production architecture separately and explain the privacy controls.

## License

Use according to your team's SIH/project requirements.
