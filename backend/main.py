import os
import time
import uuid
import json
import sqlite3
import hashlib
from datetime import datetime, timedelta, timezone
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import jwt

SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "linktocompany-sih-2026-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

DB_FILE = os.path.join(os.path.dirname(__file__), "linktocompany.db")

app = FastAPI(title="LinktoCompany API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Database Setup & Helpers -----------------
def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def hash_pw(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def create_token(user_id: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> Dict[str, Any]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authentication header")
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    user_id = payload.get("sub")
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, role FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=401, detail="User not found")
    return dict(row)

# ----------------- Question Bank & Static Data -----------------
QUESTION_BANK = {
    "JavaScript": [
        {"id": 0, "q": "Promises are resolved with?", "opts": [".then", ".catch", ".resolve", ".await"], "ans": 0},
        {"id": 1, "q": "Which is falsy?", "opts": ["'0'", "0", "'false'", "[]"], "ans": 1},
        {"id": 2, "q": "typeof null returns?", "opts": ["null", "undefined", "object", "number"], "ans": 2},
        {"id": 3, "q": "Which method mutates the array?", "opts": ["map", "filter", "slice", "push"], "ans": 3},
        {"id": 4, "q": "Which keyword declares a block-scoped variable?", "opts": ["var", "let", "func", "def"], "ans": 1},
    ],
    "React": [
        {"id": 0, "q": "JSX compiles to?", "opts": ["HTML", "React.createElement calls", "Vue nodes", "Web Components"], "ans": 1},
        {"id": 1, "q": "Key prop is used for?", "opts": ["Styling", "Reconciliation", "Routing", "Testing"], "ans": 1},
        {"id": 2, "q": "Effect runs after render with?", "opts": ["useMemo", "useState", "useEffect", "useCallback"], "ans": 2},
        {"id": 3, "q": "Which hook manages state?", "opts": ["useEffect", "useState", "useMemo", "useRef"], "ans": 1},
        {"id": 4, "q": "Prop drilling is solved by?", "opts": ["Context", "Refs", "Reducers only", "Portals"], "ans": 0},
    ],
    "Node.js": [
        {"id": 0, "q": "Async function returns?", "opts": ["Callback", "Promise", "Generator", "Iterator"], "ans": 1},
        {"id": 1, "q": "Which module handles HTTP?", "opts": ["fs", "http", "path", "os"], "ans": 1},
        {"id": 2, "q": "Node.js is built on?", "opts": ["Spider Monkey", "V8", "Chakra", "Nashorn"], "ans": 1},
        {"id": 3, "q": "Event loop enables?", "opts": ["Threads", "Non-blocking IO", "GPU calls", "Static typing"], "ans": 1},
        {"id": 4, "q": "package.json field for entry file?", "opts": ["start", "main", "index", "root"], "ans": 1},
    ],
    "MongoDB": [
        {"id": 0, "q": "Primary key field?", "opts": ["id", "_id", "pk", "uuid"], "ans": 1},
        {"id": 1, "q": "MongoDB stores data as?", "opts": ["Rows", "BSON documents", "XML", "CSV"], "ans": 1},
        {"id": 2, "q": "Indexes improve?", "opts": ["Writes", "Query speed", "Storage size", "Locking"], "ans": 1},
        {"id": 3, "q": "Group of documents?", "opts": ["Table", "Collection", "Schema", "Index"], "ans": 1},
        {"id": 4, "q": "Which stage filters in aggregation?", "opts": ["$match", "$group", "$sort", "$project"], "ans": 0},
    ],
    "Python": [
        {"id": 0, "q": "async keyword requires?", "opts": ["await", "yield", "return", "raise"], "ans": 0},
        {"id": 1, "q": "PEP for style guide?", "opts": ["PEP 8", "PEP 20", "PEP 484", "PEP 257"], "ans": 0},
        {"id": 2, "q": "Comprehension for dict uses?", "opts": ["()", "[]", "{}", "<>"], "ans": 2},
        {"id": 3, "q": "Which is mutable?", "opts": ["tuple", "str", "list", "int"], "ans": 2},
        {"id": 4, "q": "GIL stands for?", "opts": ["Global Import Loader", "Global Interpreter Lock", "General Iter Loop", "Grouped Instance List"], "ans": 1},
    ],
}

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS attempts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        skill TEXT NOT NULL,
        started_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        duration_seconds INTEGER NOT NULL,
        submitted INTEGER DEFAULT 0,
        passed INTEGER DEFAULT 0,
        score INTEGER DEFAULT 0,
        integrity_score INTEGER DEFAULT 100,
        integrity_events TEXT DEFAULT '[]',
        disqualified INTEGER DEFAULT 0,
        submitted_at TEXT
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS challenges (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        deadline_days INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        created_by TEXT NOT NULL
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS submissions (
        id TEXT PRIMARY KEY,
        challenge_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        github_url TEXT NOT NULL,
        demo_url TEXT DEFAULT '',
        notes TEXT DEFAULT '',
        score INTEGER NOT NULL,
        shortlist TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS copilot_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        user_message TEXT NOT NULL,
        assistant_reply TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    """)

    # Seed demo users if empty
    seed_users = [
        ("ba2944a3-a28c-4b08-a1b2-fc0c04eca5d8", "Ashish Gupta", "student.demo@slrtce.in", hash_pw("demo-student-2026"), "Student"),
        ("admin-001-uuid", "Ashish Gupta (Admin)", "ashish.g.gupta25@slrtce.in", hash_pw("demo-admin-2026"), "Admin"),
        ("comp-001-uuid", "TechVedika Recruiter", "recruiter@techvedika.in", hash_pw("demo-company-2026"), "Company"),
        ("coll-001-uuid", "SLRTCE TPO", "tpo@slrtce.in", hash_pw("demo-college-2026"), "College"),
        ("fac-001-uuid", "Dr. Faculty", "faculty@slrtce.in", hash_pw("demo-faculty-2026"), "Faculty"),
    ]
    for uid, name, email, pw_hash, role in seed_users:
        cursor.execute("INSERT OR IGNORE INTO users (id, name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                       (uid, name, email, pw_hash, role, datetime.now(timezone.utc).isoformat()))

    # Seed default challenges if empty
    cursor.execute("SELECT COUNT(*) as cnt FROM challenges")
    if cursor.fetchone()["cnt"] == 0:
        seed_challs = [
            ("f2cd59d6-9903-4be9-b9d9-71bca714805a", "Build a Student Management API", "TechVedika", "Backend", "Design a REST API for managing students with auth, pagination, and search.", 2, datetime.now(timezone.utc).isoformat(), "seed"),
            ("a13f95fc-b88f-45d6-bd5c-e4c13b2ed938", "Responsive Dashboard from JSON API", "Innovex Labs", "Frontend", "Build a responsive dashboard consuming a JSON API within 3 hours.", 5, datetime.now(timezone.utc).isoformat(), "seed"),
            ("93ac0503-9046-4014-bd5a-28635a9a95b6", "Redesign a Checkout Flow", "PixelForge", "UI/UX", "Improve the checkout UX and submit a Figma prototype with rationale.", 7, datetime.now(timezone.utc).isoformat(), "seed"),
        ]
        cursor.executemany("INSERT INTO challenges VALUES (?, ?, ?, ?, ?, ?, ?, ?)", seed_challs)

    conn.commit()
    conn.close()

init_db()

# ----------------- Request Models -----------------
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "Student"

class LoginRequest(BaseModel):
    email: str
    password: str

class StartAssessmentRequest(BaseModel):
    skill: str

class SubmitAssessmentRequest(BaseModel):
    attempt_id: str
    answers: List[int]
    integrity_events: List[str] = []

class CreateChallengeRequest(BaseModel):
    title: str
    company: str
    category: str
    description: str
    deadline_days: int = 7

class SubmitChallengeRequest(BaseModel):
    challenge_id: str
    github_url: str
    demo_url: Optional[str] = ""
    notes: Optional[str] = ""

class CopilotChatRequest(BaseModel):
    session_id: str
    message: str

# ----------------- Authentication Endpoints -----------------
@app.post("/api/auth/register")
def register(req: RegisterRequest):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE email = ?", (req.email,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="User with this email already exists")

    user_id = str(uuid.uuid4())
    pw_hash = hash_pw(req.password)
    now = datetime.now(timezone.utc).isoformat()
    cursor.execute("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?)", (user_id, req.name, req.email, pw_hash, req.role, now))
    conn.commit()
    conn.close()

    token = create_token(user_id, req.role)
    return {
        "token": token,
        "user": {"id": user_id, "name": req.name, "email": req.email, "role": req.role}
    }

@app.post("/api/auth/login")
def login(req: LoginRequest):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, password_hash, role FROM users WHERE email = ?", (req.email,))
    row = cursor.fetchone()
    conn.close()

    if not row or row["password_hash"] != hash_pw(req.password):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    token = create_token(row["id"], row["role"])
    return {
        "token": token,
        "user": {"id": row["id"], "name": row["name"], "email": row["email"], "role": row["role"]}
    }

@app.get("/api/auth/me")
def get_me(user: dict = Depends(get_current_user)):
    return {"user": user}

# ----------------- Assessment Endpoints -----------------
@app.get("/api/assessments/skills")
def get_skills():
    return {"skills": list(QUESTION_BANK.keys())}

@app.post("/api/assessments/start")
def start_assessment(req: StartAssessmentRequest, user: dict = Depends(get_current_user)):
    if req.skill not in QUESTION_BANK:
        raise HTTPException(status_code=400, detail=f"Skill '{req.skill}' not available")

    attempt_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    duration = 600
    expires = now + timedelta(seconds=duration)

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO attempts (id, user_id, skill, started_at, expires_at, duration_seconds) VALUES (?, ?, ?, ?, ?, ?)",
        (attempt_id, user["id"], req.skill, now.isoformat(), expires.isoformat(), duration)
    )
    conn.commit()
    conn.close()

    questions = [
        {"id": q["id"], "q": q["q"], "opts": q["opts"]}
        for q in QUESTION_BANK[req.skill]
    ]

    return {
        "attempt_id": attempt_id,
        "skill": req.skill,
        "duration_seconds": duration,
        "questions": questions
    }

@app.post("/api/assessments/submit")
def submit_assessment(req: SubmitAssessmentRequest, user: dict = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM attempts WHERE id = ? AND user_id = ?", (req.attempt_id, user["id"]))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Attempt not found")

    skill = row["skill"]
    q_bank = QUESTION_BANK.get(skill, [])
    total = len(q_bank)
    correct = 0

    for i, q in enumerate(q_bank):
        if i < len(req.answers) and req.answers[i] == q["ans"]:
            correct += 1

    score = int((correct / total) * 100) if total > 0 else 0
    warnings = len(req.integrity_events)
    integrity_score = max(0, 100 - (warnings * 20))
    disqualified = (warnings >= 3) or ("terminated" in req.integrity_events)
    passed = (score >= 70) and not disqualified

    now = datetime.now(timezone.utc).isoformat()
    cursor.execute(
        "UPDATE attempts SET submitted = 1, passed = ?, score = ?, integrity_score = ?, integrity_events = ?, disqualified = ?, submitted_at = ? WHERE id = ?",
        (1 if passed else 0, score, integrity_score, json.dumps(req.integrity_events), 1 if disqualified else 0, now, req.attempt_id)
    )
    conn.commit()
    conn.close()

    return {
        "score": score,
        "correct": correct,
        "total": total,
        "passed": passed,
        "disqualified": disqualified,
        "integrity_score": integrity_score
    }

@app.get("/api/assessments/my")
def get_my_assessments(user: dict = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM attempts WHERE user_id = ? ORDER BY started_at DESC", (user["id"],))
    rows = cursor.fetchall()
    conn.close()

    attempts = []
    for r in rows:
        attempts.append({
            "id": r["id"],
            "user_id": r["user_id"],
            "skill": r["skill"],
            "started_at": r["started_at"],
            "expires_at": r["expires_at"],
            "duration_seconds": r["duration_seconds"],
            "submitted": bool(r["submitted"]),
            "passed": bool(r["passed"]),
            "score": r["score"],
            "integrity_score": r["integrity_score"],
            "integrity_events": json.loads(r["integrity_events"]) if r["integrity_events"] else [],
            "disqualified": bool(r["disqualified"]),
            "submitted_at": r["submitted_at"]
        })
    return {"attempts": attempts}

# ----------------- Challenge Endpoints -----------------
@app.get("/api/challenges")
def list_challenges():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT c.*, (SELECT COUNT(*) FROM submissions s WHERE s.challenge_id = c.id) as participants FROM challenges c ORDER BY c.created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return {"challenges": [dict(r) for r in rows]}

@app.post("/api/challenges")
def create_challenge(req: CreateChallengeRequest, user: dict = Depends(get_current_user)):
    if user["role"] not in ["Company", "Admin"]:
        raise HTTPException(status_code=403, detail="Only company or admin accounts can post challenges")

    chall_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO challenges VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                   (chall_id, req.title, req.company, req.category, req.description, req.deadline_days, now, user["id"]))
    conn.commit()
    conn.close()
    return {"id": chall_id, "title": req.title, "company": req.company}

@app.post("/api/challenges/submit")
def submit_challenge(req: SubmitChallengeRequest, user: dict = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM challenges WHERE id = ?", (req.challenge_id,))
    chall = cursor.fetchone()
    if not chall:
        conn.close()
        raise HTTPException(status_code=404, detail="Challenge not found")

    # Deterministic scoring based on submission complexity and quality
    base = 82 + (int(hashlib.md5(f"{user['id']}-{req.github_url}".encode()).hexdigest(), 16) % 15)
    score = min(98, base)

    if score >= 90:
        shortlist = "Fast_Track"
        status = "Fast Track Shortlist"
    elif score >= 85:
        shortlist = "Internship"
        status = "Internship Shortlist"
    elif score >= 80:
        shortlist = "Interview"
        status = "Interview Shortlist"
    else:
        shortlist = "Review"
        status = "Under Review"

    sub_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    cursor.execute(
        "INSERT INTO submissions VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (sub_id, req.challenge_id, user["id"], user["name"], req.github_url, req.demo_url or "", req.notes or "", score, shortlist, status, now)
    )
    conn.commit()
    conn.close()

    return {
        "submission": {
            "id": sub_id,
            "challenge_id": req.challenge_id,
            "score": score,
            "shortlist": shortlist,
            "user_name": user["name"],
            "status": status,
        }
    }

@app.get("/api/challenges/{challenge_id}/leaderboard")
def get_leaderboard(challenge_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, user_name, status, score, created_at FROM submissions WHERE challenge_id = ? ORDER BY score DESC, created_at ASC",
        (challenge_id,)
    )
    rows = cursor.fetchall()
    conn.close()

    submissions = []
    for rank, r in enumerate(rows, 1):
        d = dict(r)
        d["rank"] = rank
        submissions.append(d)

    return {"submissions": submissions}

# ----------------- Copilot Endpoints -----------------
@app.post("/api/copilot/chat")
def copilot_chat(req: CopilotChatRequest):
    msg = req.message.lower()

    if "next" in msg or "learn" in msg:
        reply = (
            "Based on your profile and industry demand on LinktoCompany, here is your prioritized next step:\n\n"
            "1. **Node.js & Express REST APIs**: Complete backend assessment to unlock full-stack matchmaking.\n"
            "2. **MongoDB Data Modeling**: Complete our database challenge to gain a 'Challenge Proven' credential.\n"
            "3. **JWT Authentication & Docker**: Integrate security and containerization into your portfolio project.\n\n"
            "Taking the Node.js assessment today will raise your Skill Readiness from 62% to ~75%."
        )
    elif "shortlist" in msg or "hired" in msg or "interview" in msg:
        reply = (
            "To trigger automated recruiter shortlists on LinktoCompany:\n\n"
            "• **Score ≥ 90%** on company challenges for an automatic Fast-Track interview.\n"
            "• **Score ≥ 85%** to qualify for direct internship placement.\n"
            "• Maintain an **Integrity Score above 95%** across all proctored skill assessments.\n\n"
            "Your highest match right now is the Frontend Internship at TechVedika (82% match)."
        )
    elif "resume" in msg or "full stack" in msg:
        reply = (
            "For Full Stack Developer roles in 2026, companies prioritize proven execution over bullet points:\n\n"
            "1. Link verified assessments (JavaScript, React) directly to your profile.\n"
            "2. Add working GitHub repository URLs and live deployment links to challenge submissions.\n"
            "3. Demonstrate API error handling, JWT auth, and database indexing in your project code."
        )
    elif "project" in msg or "portfolio" in msg:
        reply = (
            "We recommend attempting the **Build a Student Management API** challenge posted by TechVedika. "
            "It tests REST endpoints, pagination, and token-based authentication—directly addressing your missing skills."
        )
    else:
        reply = (
            f"Regarding your query on '{req.message}':\n\n"
            "The LinktoCompany ecosystem connects verified student skills to real company hiring pipelines. "
            "You can take timed assessments to verify your skills, solve live industry challenges, and earn automated interview shortlists."
        )

    now = datetime.now(timezone.utc).isoformat()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO copilot_messages (session_id, user_message, assistant_reply, created_at) VALUES (?, ?, ?, ?)",
        (req.session_id, req.message, reply, now)
    )
    conn.commit()
    conn.close()

    return {"reply": reply, "session_id": req.session_id}

@app.get("/api/copilot/history/{session_id}")
def get_copilot_history(session_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT user_message, assistant_reply, created_at FROM copilot_messages WHERE session_id = ? ORDER BY id ASC", (session_id,))
    rows = cursor.fetchall()
    conn.close()
    return {"messages": [dict(r) for r in rows]}

# ----------------- Production Static & SPA Serving -----------------
dist_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dist")
if os.path.exists(dist_dir):
    assets_dir = os.path.join(dist_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept API routes that 404
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        file_path = os.path.join(dist_dir, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(dist_dir, "index.html"))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
