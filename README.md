# AICTE NEXUS — Enhanced hackathon edition

A six-screen grievance workspace built with HTML, CSS, JavaScript, FastAPI and SQLAlchemy. This enhanced copy preserves the original project and adds a refined teal/navy interface, clearer metrics, responsive drawer navigation, keyboard focus styles, form labels, and a single-server launcher.

## Quick start (Windows)

Install Python 3.10 or newer. Open PowerShell in this project folder:

```powershell
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend/requirements.txt
.\.venv\Scripts\python.exe run.py
```

Open http://127.0.0.1:8001. API docs: http://127.0.0.1:8001/docs.
The launcher applies migrations and insert-only demo seeds before starting the UI and API together. Stop with Ctrl+C. Later runs need only the final command. No virtual environment activation is required. SQLite is created in backend/aicte_nexus.db. Existing records are not reset. To choose a different port, set `$env:PORT='8002'` before running.

Use `python` instead of `py` if that is your installed Python command. Do not copy a virtual environment between computers; recreate it using the commands above.

Internet access is needed for the existing Tailwind CDN, Google Fonts and Font Awesome assets. Python package installation also needs Internet access.

## Verification

From the project root:

```powershell
$env:PYTHONPATH = (Join-Path (Get-Location) 'backend')
.\.venv\Scripts\python.exe -m pytest -q
```

Verified on 28 October 2026 using Python 3.12 and an isolated SQLite database:

- 20 tests passed (one upstream Starlette/httpx deprecation warning).
- Fresh Alembic migration succeeded; `alembic check` detected no schema drift.
- Second seed run inserted zero rows.
- Both JavaScript files passed Node syntax checks.
- All six screens loaded real API data in the browser with no observed JavaScript errors.
- Browser registration persisted after reload; resolving a case saved the note and audit event.
- New Critical complaint verified with a seven-day deadline. Fixed the original unconditional 21-day registration deadline; High/Medium/Low now use the form's 15/30/45-day targets.
- CSV and JSON report endpoints returned successful responses.
- Public static assets and private-file isolation covered by added tests.
- Responsive CSS is included. Phone viewport testing was attempted, but the preview tool did not apply the requested dimensions; visual mobile QA remains outstanding.

Test complaints were created only in a separate temporary database, not in this deliverable. The package contains no database, local .env, copied virtual environment or test cache.

## Demo walkthrough

1. Open Overview to see workload and overdue cases.
2. Open Institutions to inspect complaints across bureaus.
3. Register a new complaint, then reload to show persistence.
4. Open Case workbench, select the complaint and save a status change. Resolution requires a note.
5. Review Related cases and inspect the Audit trail.
6. Open Analytics to download reports.

## Scope

This is a local hackathon prototype. Authentication and role-based authorization are not implemented; the role selector filters the view. Case matching uses deterministic rules, not an AI provider. SLA values are demo settings, not verified official policy; bureau analytics use the existing separate bureau benchmarks. PostgreSQL was not tested. See backend/README.md for the backend architecture and configuration.

The UI and API share the same origin by default. For a separately hosted frontend, set `window.AICTE_API_BASE_URL` before loading app.js and configure backend CORS_ORIGINS. The older frontend-on-8000/backend-on-8001 layout is also supported.
