# AICTE NEXUS backend

FastAPI backend for the existing HTML/CSS/JavaScript prototype. The backend stores records in SQLAlchemy models and uses Alembic for schema changes. Local development defaults to SQLite; PostgreSQL is supported through `DATABASE_URL`.

## Files and data model

- `app/main.py`: REST API, deterministic candidate matching, analytics, and report exports.
- `app/models.py`: SQLAlchemy 2.x models.
- `app/schemas.py`: Pydantic request validation and response shapes.
- `app/seed_demo.py` and `app/demo_data.json`: repeatable insert-only synthetic SIH demo import.
- `migrations/`: versioned schema and reference-data migrations.
- `tests/`: API and SQLite seed tests.

Tables and relationships:

- `institutions` (primary key `aicte_id`) and `bureaus` (primary key `code`) are reference tables. A complaint references one institution and one bureau.
- `complaints` stores the case fields from the frontend. `institution_name`, linked cases, overdue state, and overdue days are derived rather than duplicated. `is_demo` labels synthetic records.
- `workflow_events` belongs to a complaint and records status, assignment, bureau, and note history.
- `case_links` joins two complaints, stores a proposed/confirmed/dismissed relationship and an optional matching explanation. Complaint deletion cascades to workflow and link rows.
- `audit_events` records application actions and is associated with a bureau when available. These are ordinary editable database rows, not immutable or tamper-proof.

The first migration creates six bureaus and eight synthetic institution reference rows. Run `python -m app.seed_demo` to import the frontend’s 16 sample complaint scenarios, their workflow/audit history, and related-case links. The seed command is repeatable and insert-only; it does not overwrite edited records or remove other data.

## API

All API paths are under `/api`:

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Checks database connectivity and that the complaint schema exists |
| GET, POST | `/api/complaints` | List complaints / create a complaint (`201`) |
| GET | `/api/complaints/next-id` | Suggest the next case ID for the current calendar year |
| GET, PATCH, DELETE | `/api/complaints/{case_id}` | Read, update, or delete a complaint (`204`) |
| GET | `/api/complaints/{case_id}/workflow-events` | Read persisted workflow history |
| GET | `/api/institutions`, `/api/institutions/{aicte_id}` | Read institutions |
| PATCH | `/api/institutions/{aicte_id}` | Update EoA fields and record an audit event |
| GET | `/api/bureaus`, `/api/bureaus/{code}` | Read bureaus |
| GET | `/api/case-links` | Read persisted case relationships |
| GET | `/api/case-links/suggestions` | Calculate deterministic, explainable candidates from stored cases |
| POST, PATCH | `/api/case-links`, `/api/case-links/{link_id}` | Create/confirm/review a relationship and audit the action |
| GET, POST | `/api/audit-events` | Read or record an application event |
| GET | `/api/analytics` | Current complaint, bureau, SLA, category, and regional aggregates |
| GET | `/api/reports/complaints.csv` | Database-generated complaint CSV; accepts `bureau`, `priority`, and `scope` filters |
| GET | `/api/reports/shc.json` | Database-generated filtered case dossier and live summary |
| GET | `/api/reports/audit.csv` | Database-generated audit CSV |

Complaint creation example:

```powershell
$body = @{
  case_id = "CMP-2026-0100"
  institution_id = "1-482910412"
  bureau_code = "public-grievance"
  category = "Faculty Salary Non-Payment"
  title = "Faculty salary payments are overdue"
  priority = "High"
  status = "Submitted"
  assigned_officer = "Dr. R. K. Verma"
  source = "CPGRAMS"
  complainant = "Faculty Member"
  filed_date = "2026-10-27"
  due_date = "2026-11-17"
} | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8001/api/complaints -ContentType "application/json" -Body $body
```

Updates use `PATCH /api/complaints/{case_id}` and accept fields such as `title`, `category`, `priority`, `assigned_officer`, `bureau_code`, and `status`. Setting status to `Resolved` or `Closed` requires a `resolution_note` of at least 15 characters. Invalid requests return `422`, missing records `404`, duplicate IDs/links `409`, and database failures `503` with a client-safe detail. Database internals are kept in server logs.

Case suggestions are local heuristics, not an AI service. The score weights are 35 for same institution, 25 for same category, 25 for Jaccard overlap of title/category tokens, and 15 for title similarity. Candidate scores are capped at 99. A likely duplicate is labeled when institution/category match and title similarity is at least 78%. Officers must explicitly confirm, merge, or dismiss a candidate before a relationship is recorded.

Analytics use current persisted cases. The current prototype SLA target assumptions (days) are Grievance 15, Approval 15, Regulation 21, Anti-Ragging 7, Vigilance 30, and Finance 15; these defaults are code configuration and are not official AICTE policy. Resolved duration is estimated from the complaint's latest update timestamp and filed date because no separate resolution timestamp exists in the source data.

SLA ageing and breach values are computed from persisted due dates. There is no background escalation scheduler or external notification delivery; officers perform and audit status/bureau changes through the workbench.

## Windows setup and run

Requirements: Python 3.10+ and PowerShell. PostgreSQL is optional for local development; SQLite is the default. Internet is required by the frontend for its existing Tailwind CDN, Google Fonts, and Font Awesome resources.

From the project root:

```powershell
Set-Location .\backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

The supplied `.env.example` configures `sqlite+pysqlite:///./aicte_nexus.db`; with the backend directory as the working directory, the database file is created there. To use PostgreSQL, create a local database and set `DATABASE_URL` in `.env`, for example:

```text
DATABASE_URL=postgresql+psycopg://postgres:YOUR_LOCAL_PASSWORD@localhost:5432/aicte_nexus
```

Keep real credentials in the ignored `.env`, not in source control. Set `CORS_ORIGINS` to the exact frontend origins, comma separated. Defaults allow only `http://127.0.0.1:8000` and `http://localhost:8000`.

Apply migrations, add demo rows if desired, and start the API:

```powershell
alembic upgrade head
python -m app.seed_demo
uvicorn app.main:app --host 127.0.0.1 --port 8001
```

The seed command is safe to repeat. Open API docs at `http://127.0.0.1:8001/docs`. In another PowerShell window at the project root, run:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/AICTE.html`. The frontend calls the API on port `8001`; `window.AICTE_API_BASE_URL` can override the default URL if set before `js/app.js` loads.

Run tests and migration drift checks from the backend directory:

```powershell
python -m pytest -q
alembic check
```

Tests use an isolated SQLite database and do not require PostgreSQL.

## Verification status

On 2026-10-27, the local suite completed with **15 passed** and one Starlette/httpx deprecation warning. Python compilation, `node --check js/app.js`, fresh SQLite migrations, and `alembic check` completed successfully with no schema drift. The demo seeder inserted no records on either repeat run after the initial seed, and it left the two non-demo integration-test complaints untouched. A live browser session verified API-backed case registration, updates, link confirmation, audit history, filters, exports, reload persistence, and visible handling of API-down/recovery.

No PostgreSQL URL or host was configured, and port 5432 was unreachable. PostgreSQL migration and live-database behavior therefore remain unverified. The app uses SQLite for the recorded end-to-end checks.

## Assumptions and limitations

- Frontend `aicteId`, bureau display names, officer, source, complainant, dates, resolution notes, and linked-case IDs map to normalized snake_case fields and foreign keys. Display labels are read through the API.
- The current registration form does not collect a filing date or due date. It uses the local current date and a 21-day due date; API clients can submit explicit values.
- Case IDs are suggested by the server but remain client-submitted; concurrent registrations can receive the same suggestion. The database primary key prevents duplicates and returns `409`, requiring a retry.
- Authentication and role-based authorization are not implemented. Keep this development prototype on a trusted local network/loopback; it is not safe for public or multi-user deployment.
- Audit events are ordinary application history and can be changed by a database administrator.
- PostgreSQL must be installed/configured separately. Tests do not substitute for PostgreSQL-specific operational verification.
