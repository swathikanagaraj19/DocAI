# DocuMind AI — Task 2: AI-Powered Document Intelligence

A Flask web app for uploading PDF/TXT documents, extracting readable text, generating summaries, extracting structured information, and showing a completeness indicator.

## Features
- Responsive dashboard with upload and drag/drop support.
- PDF and TXT extraction (10 MB maximum).
- Brief, detailed, or bullet summaries.
- Basic, standard, and detailed analysis levels.
- Focus-field selection for name, email, skills, education, and work experience.
- Structured result cards, key findings, skill visualization, and JSON export.
- Optional Gemini integration; local fallback keeps the demo testable without an API key.
- Friendly validation for empty, unsupported, encrypted, or textless files.
- `/health` endpoint for deployment checks.

## Run locally
Python 3.10+ recommended.

```bash
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and optionally add your own `GEMINI_API_KEY`. Keep `.env` private and never commit API keys.

Run:
```bash
python app.py
```
Open http://127.0.0.1:5000

Without a Gemini key, local heuristic analysis runs. This mode is intentionally simpler and should be treated as a demo, not reliable semantic AI.

## Deploy on Render
1. Extract this ZIP on your computer.
2. Upload the **contents** of this project folder to the root of your GitHub repository (not only the ZIP).
3. In Render, create a Web Service and connect the repository.
4. Runtime: Python.
5. Build command: `pip install -r requirements.txt`
6. Start command: `gunicorn app:app`
7. For actual Gemini-based analysis, add `GEMINI_API_KEY` in Render's Environment settings. Never paste the key into source code or GitHub.
8. Choose a free instance if available and suitable in your account/region; review any displayed price before creating the service.

## Testing
- Visit `/health`; expected response: `{"status":"ok"}`.
- Upload `sample_documents/sample_resume.txt` to verify the workflow.
- Upload a normal text-based PDF or TXT. Scanned image PDFs need OCR, which is not included.

## Privacy and limitations
- Uploaded files are processed in memory and not intentionally saved to disk.
- The fallback uses simple patterns and can miss or misclassify information.
- AI outputs may be inaccurate; check against the original document.
- This is a starter assessment project. Replace candidate-detail placeholders and add your own resume PDF before submission.
- Before production use, add tests, authentication if needed, rate limits, and stronger operational/privacy controls.
