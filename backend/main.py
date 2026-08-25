import os
import re
import ssl
import time
import uuid
import json
import sqlite3
import hashlib
import random
import smtplib
import urllib.request
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formatdate, make_msgid
from datetime import datetime, timedelta, timezone
from typing import List, Optional, Dict, Any, Tuple

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, EmailStr
import jwt

SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "linktocompany-sih-2026-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

# Email API / SMTP Configuration
SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.gmail.com").strip()
SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))
SMTP_USER = os.environ.get("SMTP_USER", "").strip()
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "").strip().replace(" ", "")  # Strip whitespace from Google App Passwords
EMAIL_FROM = os.environ.get("EMAIL_FROM", SMTP_USER or "").strip()
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "").strip()

DB_FILE = os.path.join(os.path.dirname(__file__), "linktocompany.db")

# Blocked disposable / fake email domains
BLOCKED_DOMAINS = {
    "tempmail.com", "10minutemail.com", "mailinator.com", "guerrillamail.com",
    "sharklasers.com", "throwawaymail.com", "temp-mail.org", "fakeinbox.com",
    "yopmail.com", "dispostable.com", "trashmail.com", "crazymailing.com"
}

def validate_real_email(email: str) -> str:
    email = email.strip().lower()
    email_regex = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    if not re.match(email_regex, email):
        raise HTTPException(status_code=400, detail="Invalid email format. Please enter a valid email address.")
    
    domain = email.split("@")[-1]
    if domain in BLOCKED_DOMAINS or "temp" in domain or "fake" in domain or "disposable" in domain:
        raise HTTPException(status_code=400, detail="Temporary or disposable email domains are not allowed. Use your real email.")
    
    return email

app = FastAPI(title="LinktoCompany API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Robust Email Service (Resend HTTP + Gmail SMTP) -----------------
def send_email(to_email: str, subject: str, html_content: str) -> Tuple[bool, str]:
    sender = EMAIL_FROM or SMTP_USER

    # 1. Try Resend HTTP API if configured (Fastest & most reliable on cloud)
    if RESEND_API_KEY:
        try:
            req = urllib.request.Request(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {RESEND_API_KEY}",
                    "Content-Type": "application/json",
                    "User-Agent": "LinktoCompany/1.0"
                },
                data=json.dumps({
                    "from": sender if "@" in sender else "onboarding@resend.dev",
                    "to": [to_email],
                    "subject": subject,
                    "html": html_content
                }).encode("utf-8")
            )
            with urllib.request.urlopen(req, timeout=10) as res:
                if res.status in [200, 201]:
                    print(f"[RESEND API SUCCESS] Delivered to {to_email}")
                    return True, "Delivered via Resend API"
        except Exception as e:
            print(f"[RESEND API ERROR] {e}")

    # 2. Try SMTP (Gmail / Custom SMTP)
    if SMTP_USER and SMTP_PASSWORD:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"LinktoCompany <{sender}>"
        msg["To"] = to_email
        msg["Date"] = formatdate(localtime=True)
        msg["Message-ID"] = make_msgid(domain="linktocompany.com")
        msg.attach(MIMEText(html_content, "html", "utf-8"))

        context = ssl.create_default_context()

        # Try Port 587 (STARTTLS)
        try:
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as server:
                server.ehlo()
                server.starttls(context=context)
                server.ehlo()
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(sender, [to_email], msg.as_string())
                print(f"[SMTP SUCCESS (587)] Delivered email to {to_email}")
                return True, "Delivered via Gmail SMTP"
        except Exception as e587:
            print(f"[SMTP ERROR (587)] {e587}")
            # Try Port 465 (SSL)
            try:
                with smtplib.SMTP_SSL(SMTP_HOST, 465, context=context, timeout=15) as server_ssl:
                    server_ssl.ehlo()
                    server_ssl.login(SMTP_USER, SMTP_PASSWORD)
                    server_ssl.sendmail(sender, [to_email], msg.as_string())
                    print(f"[SMTP SUCCESS (465)] Delivered email to {to_email}")
                    return True, "Delivered via Gmail SSL"
            except Exception as e465:
                err_msg = f"SMTP Authentication Error. Please verify your 16-digit Google App Password in Render Environment. (Details: {e587})"
                print(f"[SMTP FATAL] {err_msg}")
                return False, err_msg

    return False, "SMTP_USER or SMTP_PASSWORD is not configured in server Environment Variables."

def send_otp_email(to_email: str, otp: str, user_name: str = "Candidate") -> Tuple[bool, str]:
    subject = f"Your LinktoCompany Verification Code: {otp}"
    html = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 0; background-color: #050508; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="max-width: 560px; margin: 30px auto; background: #0b0d13; color: #ffffff; padding: 35px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.15);">
        <div style="text-align: center; margin-bottom: 25px;">
          <div style="display: inline-block; width: 44px; height: 44px; background: #2563eb; color: #ffffff; font-weight: 900; font-size: 22px; line-height: 44px; border-radius: 8px; margin-bottom: 8px;">L</div>
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">LinktoCompany</h1>
          <p style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; font-family: monospace;">Skill Proof Network</p>
        </div>
        
        <div style="background: #050508; padding: 25px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); text-align: center;">
          <p style="color: #e2e8f0; font-size: 15px; margin: 0 0 12px 0;">Hello <strong>{user_name}</strong>,</p>
          <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin: 0 0 20px 0;">Your 6-digit verification code to access LinktoCompany is:</p>
          
          <div style="font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #34d399; padding: 18px 0; background: rgba(52, 211, 153, 0.08); border: 1px solid rgba(52, 211, 153, 0.3); border-radius: 8px; display: block; font-family: monospace;">
            {otp}
          </div>
          
          <p style="color: #64748b; font-size: 12px; margin: 20px 0 0 0;">This code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
        </div>
        
        <div style="text-align: center; margin-top: 25px; color: #475569; font-size: 11px; font-family: monospace;">
          © 2026 LinktoCompany · Built for Smart India Hackathon<br>
          Proof over claims · Skills over keywords
        </div>
      </div>
    </body>
    </html>
    """
    return send_email(to_email, subject, html)

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
    CREATE TABLE IF NOT EXISTS email_otps (
        email TEXT PRIMARY KEY,
        otp TEXT NOT NULL,
        expires_at TEXT NOT NULL,
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

    # Clean up all fake/demo accounts permanently
    dummy_emails = ['student.demo@slrtce.in', 'ashish.g.gupta25@slrtce.in', 'recruiter@techvedika.in', 'tpo@slrtce.in', 'faculty@slrtce.in']
    cursor.execute(f"DELETE FROM users WHERE email IN ({','.join(['?']*len(dummy_emails))})", dummy_emails)

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
class SendOtpRequest(BaseModel):
    email: str
    name: Optional[str] = "Candidate"

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "Student"
    otp: str  # MANDATORY: OTP is required for all registrations

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

# ----------------- Authentication & Email Endpoints -----------------
@app.post("/api/auth/send-otp")
def send_otp(req: SendOtpRequest):
    email = validate_real_email(req.email)

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="An account with this email already exists. Please Sign In.")

    otp = f"{random.randint(100000, 999999)}"
    now = datetime.now(timezone.utc)
    expires = now + timedelta(minutes=10)

    cursor.execute("""
    INSERT INTO email_otps (email, otp, expires_at, created_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(email) DO UPDATE SET otp = excluded.otp, expires_at = excluded.expires_at, created_at = excluded.created_at
    """, (email, otp, expires.isoformat(), now.isoformat()))
    conn.commit()
    conn.close()

    sent, msg = send_otp_email(email, otp, req.name or "Candidate")
    
    if not sent:
        raise HTTPException(
            status_code=500,
            detail=f"Email delivery failed: {msg}. Please ensure your Gmail App Password and SMTP_USER are correctly set in Render Environment Variables."
        )

    return {
        "success": True,
        "message": f"6-digit verification code has been sent directly to your Gmail inbox ({email})!",
        "email_delivered": True
    }

@app.post("/api/auth/register")
def register(req: RegisterRequest):
    email = validate_real_email(req.email)
    
    if not req.otp or len(req.otp.strip()) != 6:
        raise HTTPException(status_code=400, detail="A valid 6-digit email OTP is mandatory to verify your account.")

    conn = get_db()
    cursor = conn.cursor()

    # Strictly verify OTP
    cursor.execute("SELECT otp, expires_at FROM email_otps WHERE email = ?", (email,))
    otp_row = cursor.fetchone()
    if not otp_row or otp_row["otp"] != req.otp.strip():
        conn.close()
        raise HTTPException(status_code=400, detail="Invalid OTP code. Please enter the correct 6-digit code received on your email.")
    
    expires_at = datetime.fromisoformat(otp_row["expires_at"])
    if datetime.now(timezone.utc) > expires_at:
        conn.close()
        raise HTTPException(status_code=400, detail="OTP has expired. Please click 'Resend OTP' to receive a fresh code.")

    cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="User with this email already exists. Please Sign In.")

    user_id = str(uuid.uuid4())
    pw_hash = hash_pw(req.password)
    now = datetime.now(timezone.utc).isoformat()
    cursor.execute("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?)", (user_id, req.name.strip(), email, pw_hash, req.role, now))
    
    # Delete consumed OTP
    cursor.execute("DELETE FROM email_otps WHERE email = ?", (email,))
    conn.commit()
    conn.close()

    # Send Welcome Email
    welcome_html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0b0d13; color: #ffffff; padding: 30px; border-radius: 12px;">
      <h2 style="color: #3b82f6;">Welcome to LinktoCompany, {req.name}!</h2>
      <p style="color: #94a3b8;">Your account as <strong>{req.role}</strong> has been successfully verified.</p>
      <p style="color: #e2e8f0;">Start verifying skills, solving company challenges, and accessing smart career roadmaps.</p>
    </div>
    """
    send_email(email, "Welcome to LinktoCompany · Real Verified Profile", welcome_html)

    token = create_token(user_id, req.role)
    return {
        "token": token,
        "user": {"id": user_id, "name": req.name.strip(), "email": email, "role": req.role}
    }

@app.post("/api/auth/login")
def login(req: LoginRequest):
    email = validate_real_email(req.email)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, password_hash, role FROM users WHERE email = ?", (email,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=400, detail="No registered account found with this email. Please register and verify your email first.")

    if row["password_hash"] != hash_pw(req.password):
        raise HTTPException(status_code=400, detail="Incorrect password. Please try again.")

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
            "Based on your verified skills and industry demand on LinktoCompany, here is your prioritized next step:\n\n"
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

    @app.api_route("/{full_path:path}", methods=["GET", "HEAD"])
    async def serve_spa(full_path: str):
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
