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
import html as html_lib
import urllib.request
import urllib.parse
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

SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.gmail.com").strip()
SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))
SMTP_USER = os.environ.get("SMTP_USER", "").strip()
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "").strip().replace(" ", "")
EMAIL_FROM = os.environ.get("EMAIL_FROM", SMTP_USER or "").strip()
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "").strip()
BREVO_API_KEY = os.environ.get("BREVO_API_KEY", "").strip()
SENDGRID_API_KEY = os.environ.get("SENDGRID_API_KEY", "").strip()
EMAIL_HTTPS_WEBHOOK = os.environ.get("EMAIL_HTTPS_WEBHOOK", "").strip()
EMAIL_WEBHOOK_SECRET = os.environ.get("EMAIL_WEBHOOK_SECRET", "").strip()

DB_FILE = os.path.join(os.path.dirname(__file__), "linktocompany.db")

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

app = FastAPI(title="LinktoCompany API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Email Service -----------------
class _KeepPostRedirectHandler(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        if code not in (301, 302, 303, 307, 308):
            return None
        return urllib.request.Request(newurl, data=req.data, headers=dict(req.header_items()), method="POST")

def _http_post_json(url: str, payload: dict, headers: dict, timeout: int = 15, follow_post_redirect: bool = False) -> Tuple[bool, str, int]:
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    try:
        if follow_post_redirect:
            opener = urllib.request.build_opener(_KeepPostRedirectHandler)
            with opener.open(req, timeout=timeout) as res:
                raw = res.read().decode("utf-8", errors="replace") or "ok"
                return True, raw, getattr(res, "status", 200) or 200
        with urllib.request.urlopen(req, timeout=timeout) as res:
            raw = res.read().decode("utf-8", errors="replace") or "ok"
            return True, raw, getattr(res, "status", 200) or 200
    except urllib.error.HTTPError as he:
        err = he.read().decode("utf-8", errors="replace")
        return False, err, he.code
    except Exception as e:
        return False, str(e), 0

def send_email_via_resend(to_email: str, subject: str, html_content: str) -> Tuple[bool, str]:
    if not RESEND_API_KEY:
        return False, "Resend API key missing"
    payload = {
        "from": "LinktoCompany <onboarding@resend.dev>",
        "to": [to_email],
        "subject": subject,
        "html": html_content,
    }
    ok, body, code = _http_post_json(
        "https://api.resend.com/emails",
        payload,
        {
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json",
            "User-Agent": "LinktoCompany-SIH/1.0",
        },
    )
    if ok:
        return True, "Delivered via Resend"
    return False, f"Resend error {code}: {body[:200]}"

def send_email_via_webhook(to_email: str, subject: str, html_content: str) -> Tuple[bool, str]:
    if not EMAIL_HTTPS_WEBHOOK:
        return False, "EMAIL_HTTPS_WEBHOOK missing"
    
    # Try POST
    ok, body, code = _http_post_json(
        EMAIL_HTTPS_WEBHOOK,
        {"to": to_email, "subject": subject, "html": html_content, "secret": EMAIL_WEBHOOK_SECRET},
        {"Content-Type": "application/json"},
        timeout=15,
        follow_post_redirect=True,
    )
    if ok and "error" not in body.lower():
        return True, "Delivered via HTTPS email webhook"

    # Try GET Query Params
    try:
        query_params = urllib.parse.urlencode({"to": to_email, "subject": subject, "html": html_content})
        separator = "&" if "?" in EMAIL_HTTPS_WEBHOOK else "?"
        req = urllib.request.Request(f"{EMAIL_HTTPS_WEBHOOK}{separator}{query_params}", headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as res:
            res_body = res.read().decode("utf-8", errors="replace")
            return True, "Delivered via Google Apps Script Webhook"
    except Exception as e_get:
        return False, f"Webhook error: {e_get}"

def send_email_via_smtp(to_email: str, subject: str, html_content: str) -> Tuple[bool, str]:
    if not SMTP_USER or not SMTP_PASSWORD:
        return False, "SMTP credentials missing"
    sender = EMAIL_FROM or SMTP_USER
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"LinktoCompany <{sender}>"
    msg["To"] = to_email
    msg["Date"] = formatdate(localtime=True)
    msg["Message-ID"] = make_msgid(domain="linktocompany.com")
    msg.attach(MIMEText(html_content, "html", "utf-8"))
    context = ssl.create_default_context()
    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=6) as server:
            server.ehlo()
            server.starttls(context=context)
            server.ehlo()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(sender, [to_email], msg.as_string())
            return True, "Delivered via Gmail SMTP"
    except Exception as e587:
        try:
            with smtplib.SMTP_SSL(SMTP_HOST, 465, context=context, timeout=6) as server_ssl:
                server_ssl.ehlo()
                server_ssl.login(SMTP_USER, SMTP_PASSWORD)
                server_ssl.sendmail(sender, [to_email], msg.as_string())
                return True, "Delivered via Gmail SSL"
        except Exception as e465:
            return False, f"Gmail SMTP error: {e587}"

def send_email(to_email: str, subject: str, html_content: str) -> Tuple[bool, str]:
    errors = []
    # 1. Webhook (Google Apps Script)
    if EMAIL_HTTPS_WEBHOOK:
        ok, msg = send_email_via_webhook(to_email, subject, html_content)
        if ok: return True, msg
        errors.append(f"webhook: {msg}")
    # 2. Resend API
    if RESEND_API_KEY:
        ok, msg = send_email_via_resend(to_email, subject, html_content)
        if ok: return True, msg
        errors.append(f"resend: {msg}")
    # 3. Direct SMTP
    if SMTP_USER and SMTP_PASSWORD:
        ok, msg = send_email_via_smtp(to_email, subject, html_content)
        if ok: return True, msg
        errors.append(f"smtp: {msg}")

    return False, " | ".join(errors) if errors else "Email could not be delivered"

def send_otp_email(to_email: str, otp: str, user_name: str = "Candidate") -> Tuple[bool, str]:
    subject = f"Your LinktoCompany Verification Code: {otp}"
    safe_name = html_lib.escape((user_name or "Candidate").strip() or "Candidate")
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
          <p style="color: #e2e8f0; font-size: 15px; margin: 0 0 12px 0;">Hello <strong>{safe_name}</strong>,</p>
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

# ----------------- Comprehensive Question Bank -----------------
QUESTION_BANK = {
    "JavaScript": [
        {"id": 0, "q": "Promises are resolved with?", "opts": [".then", ".catch", ".resolve", ".await"], "ans": 0},
        {"id": 1, "q": "Which is falsy?", "opts": ["'0'", "0", "'false'", "[]"], "ans": 1},
        {"id": 2, "q": "typeof null returns?", "opts": ["null", "undefined", "object", "number"], "ans": 2},
        {"id": 3, "q": "Which method mutates the original array?", "opts": ["map", "filter", "slice", "push"], "ans": 3},
        {"id": 4, "q": "Which keyword declares a block-scoped variable?", "opts": ["var", "let", "func", "def"], "ans": 1},
    ],
    "React": [
        {"id": 0, "q": "JSX compiles to?", "opts": ["HTML", "React.createElement calls", "Vue nodes", "Web Components"], "ans": 1},
        {"id": 1, "q": "Key prop in lists is used for?", "opts": ["Styling", "Reconciliation & Diffing", "Routing", "Testing"], "ans": 1},
        {"id": 2, "q": "Effect runs after render with?", "opts": ["useMemo", "useState", "useEffect", "useCallback"], "ans": 2},
        {"id": 3, "q": "Which hook manages local component state?", "opts": ["useEffect", "useState", "useMemo", "useRef"], "ans": 1},
        {"id": 4, "q": "Prop drilling across deep trees is cleanly solved by?", "opts": ["Context API", "Refs", "Reducers only", "Portals"], "ans": 0},
    ],
    "Node.js": [
        {"id": 0, "q": "Async function always returns a?", "opts": ["Callback", "Promise", "Generator", "Iterator"], "ans": 1},
        {"id": 1, "q": "Which built-in module creates HTTP servers?", "opts": ["fs", "http", "path", "os"], "ans": 1},
        {"id": 2, "q": "Node.js JavaScript engine is?", "opts": ["Spider Monkey", "Google V8", "Chakra", "Nashorn"], "ans": 1},
        {"id": 3, "q": "Event loop enables which core capability?", "opts": ["Multithreaded CPU computing", "Non-blocking Asynchronous I/O", "GPU calls", "Static typing"], "ans": 1},
        {"id": 4, "q": "package.json entry file configuration field is?", "opts": ["start", "main", "index", "root"], "ans": 1},
    ],
    "DSA": [
        {"id": 0, "q": "Time complexity to search in a balanced Binary Search Tree (BST)?", "opts": ["O(1)", "O(log n)", "O(n)", "O(n log n)"], "ans": 1},
        {"id": 1, "q": "Which data structure follows LIFO (Last-In First-Out)?", "opts": ["Queue", "Stack", "Array", "Linked List"], "ans": 1},
        {"id": 2, "q": "Average time complexity of HashMap lookup?", "opts": ["O(1)", "O(log n)", "O(n)", "O(n^2)"], "ans": 0},
        {"id": 3, "q": "Which algorithm is used to find shortest path in weighted graph without negative cycles?", "opts": ["Kruskal", "Dijkstra", "DFS", "Binary Search"], "ans": 1},
        {"id": 4, "q": "Dynamic Programming is primarily used when problem exhibits?", "opts": ["Random outcomes", "Overlapping Subproblems & Optimal Substructure", "Greedy choice only", "Infinite recursion"], "ans": 1},
    ],
    "SQL & Databases": [
        {"id": 0, "q": "Which SQL command retrieves all records matching both tables?", "opts": ["LEFT JOIN", "INNER JOIN", "FULL JOIN", "CROSS JOIN"], "ans": 1},
        {"id": 1, "q": "Database Indexes primarily improve which operation?", "opts": ["INSERT speed", "SELECT query speed", "Storage compactness", "Table locking"], "ans": 1},
        {"id": 2, "q": "In ACID properties of transactions, 'A' stands for?", "opts": ["Accuracy", "Atomicity", "Availability", "Allocation"], "ans": 1},
        {"id": 3, "q": "Process of organizing data to reduce redundancy is called?", "opts": ["Indexing", "Normalization", "Denormalization", "Sharding"], "ans": 1},
        {"id": 4, "q": "Primary key constraint ensures columns are?", "opts": ["Nullable", "Unique and NOT NULL", "Foreign referenced", "Auto-incremented only"], "ans": 1},
    ],
    "CS Fundamentals": [
        {"id": 0, "q": "Which OOP principle hides internal details and exposes only necessary interfaces?", "opts": ["Inheritance", "Encapsulation / Abstraction", "Polymorphism", "Compilation"], "ans": 1},
        {"id": 1, "q": "Condition where processes are waiting indefinitely for resources held by each other?", "opts": ["Starvation", "Deadlock", "Context Switch", "Paging"], "ans": 1},
        {"id": 2, "q": "TCP protocol operates at which OSI layer?", "opts": ["Network", "Transport", "Application", "Data Link"], "ans": 1},
        {"id": 3, "q": "Virtual Memory is managed primarily through?", "opts": ["Paging and Segmentation", "Thread pooling", "DNS lookup", "Socket binding"], "ans": 0},
        {"id": 4, "q": "HTTP status code 401 indicates?", "opts": ["Not Found", "Unauthorized Authentication", "Forbidden Access", "Internal Server Error"], "ans": 1},
    ],
    "Git & DevOps": [
        {"id": 0, "q": "Command to create and switch to a new Git branch?", "opts": ["git branch", "git checkout -b <name>", "git merge", "git push"], "ans": 1},
        {"id": 1, "q": "Which tool packages application code with its dependencies into isolated containers?", "opts": ["Postman", "Docker", "Git", "Webpack"], "ans": 1},
        {"id": 2, "q": "Command used to download existing remote repository code locally?", "opts": ["git fetch", "git clone", "git init", "git commit"], "ans": 1},
        {"id": 3, "q": "Pull Request (PR) in GitHub is used to?", "opts": ["Delete branch", "Propose code changes for review and merge", "Clone repo", "Revert local commit"], "ans": 1},
        {"id": 4, "q": "Standard port for secure HTTPS traffic is?", "opts": ["80", "443", "22", "8080"], "ans": 1},
    ],
    "Python": [
        {"id": 0, "q": "async keyword in Python requires which keyword to call coroutines?", "opts": ["await", "yield", "return", "raise"], "ans": 0},
        {"id": 1, "q": "PEP standard for Python style guide is?", "opts": ["PEP 8", "PEP 20", "PEP 484", "PEP 257"], "ans": 0},
        {"id": 2, "q": "Dictionary comprehension in Python uses brackets?", "opts": ["()", "[]", "{}", "<>"], "ans": 2},
        {"id": 3, "q": "Which Python data type is mutable?", "opts": ["tuple", "str", "list", "int"], "ans": 2},
        {"id": 4, "q": "GIL in Python runtime stands for?", "opts": ["Global Import Loader", "Global Interpreter Lock", "General Iter Loop", "Grouped Instance List"], "ans": 1},
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
    CREATE TABLE IF NOT EXISTS user_progress (
        user_id TEXT PRIMARY KEY,
        goal_track TEXT NOT NULL,
        completed_topics TEXT DEFAULT '[]',
        updated_at TEXT NOT NULL
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS interviews (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        student_name TEXT NOT NULL,
        student_email TEXT NOT NULL,
        company_id TEXT NOT NULL,
        company_name TEXT NOT NULL,
        role_title TEXT NOT NULL,
        date_time TEXT NOT NULL,
        meet_link TEXT NOT NULL,
        notes TEXT DEFAULT '',
        status TEXT DEFAULT 'Scheduled',
        created_at TEXT NOT NULL
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS endorsements (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        author_name TEXT NOT NULL,
        author_role TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
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

    dummy_emails = ['student.demo@slrtce.in', 'ashish.g.gupta25@slrtce.in', 'recruiter@techvedika.in', 'tpo@slrtce.in', 'faculty@slrtce.in']
    cursor.execute(f"DELETE FROM users WHERE email IN ({','.join(['?']*len(dummy_emails))})", dummy_emails)

    cursor.execute("SELECT COUNT(*) as cnt FROM challenges")
    if cursor.fetchone()["cnt"] == 0:
        seed_challs = [
            ("f2cd59d6-9903-4be9-b9d9-71bca714805a", "Build a Student Management API", "TechVedika", "Backend", "Design a REST API for managing students with JWT auth, pagination, and search.", 2, datetime.now(timezone.utc).isoformat(), "seed"),
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
    otp: str

class LoginRequest(BaseModel):
    email: str
    password: str

class UpdateProgressRequest(BaseModel):
    goal_track: str
    completed_topics: List[str]

class ScheduleInterviewRequest(BaseModel):
    student_id: str
    student_name: str
    student_email: str
    role_title: str
    date_time: str
    meet_link: str
    notes: Optional[str] = ""

class CreateEndorsementRequest(BaseModel):
    student_id: str
    message: str

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
    return {
        "success": True,
        "message": f"Verification code generated for {email}",
        "email_delivered": sent,
        "delivery_status": msg
    }

@app.post("/api/auth/register")
def register(req: RegisterRequest):
    email = validate_real_email(req.email)
    if not req.otp or len(req.otp.strip()) != 6:
        raise HTTPException(status_code=400, detail="A valid 6-digit email OTP is mandatory to verify your account.")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT otp, expires_at FROM email_otps WHERE email = ?", (email,))
    otp_row = cursor.fetchone()
    if not otp_row or otp_row["otp"] != req.otp.strip():
        conn.close()
        raise HTTPException(status_code=400, detail="Invalid OTP code. Please enter the correct 6-digit code.")
    
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
    
    # Initialize 0% Progress for New Registered User
    cursor.execute("INSERT INTO user_progress VALUES (?, ?, ?, ?)", (user_id, "Full Stack Software Engineer", json.dumps([]), now))

    # Send Welcome Notification
    cursor.execute("INSERT INTO notifications VALUES (?, ?, ?, ?, ?)", (
        str(uuid.uuid4()), user_id, "Welcome to LinktoCompany!",
        "Your profile starts at 0% Skill Readiness. Take assessments and complete roadmap milestones to get recruiter shortlists!",
        now
    ))
    cursor.execute("DELETE FROM email_otps WHERE email = ?", (email,))
    conn.commit()
    conn.close()

    welcome_html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0b0d13; color: #ffffff; padding: 30px; border-radius: 12px;">
      <h2 style="color: #3b82f6;">Welcome to LinktoCompany, {req.name}!</h2>
      <p style="color: #94a3b8;">Your account as <strong>{req.role}</strong> has been successfully verified.</p>
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

# ----------------- Dynamic Dashboard & Goal Roadmap Endpoints -----------------
@app.get("/api/dashboard/stats")
def get_dashboard_stats(user: dict = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()

    # 1. Fetch Attempts
    cursor.execute("SELECT * FROM attempts WHERE user_id = ? ORDER BY score DESC", (user["id"],))
    attempts = cursor.fetchall()
    passed_attempts = [dict(a) for a in attempts if a["passed"] == 1]

    # 2. Fetch Submissions
    cursor.execute("SELECT * FROM submissions WHERE user_id = ? ORDER BY score DESC", (user["id"],))
    submissions = [dict(s) for s in cursor.fetchall()]

    # 3. Fetch User Progress
    cursor.execute("SELECT * FROM user_progress WHERE user_id = ?", (user["id"],))
    prog = cursor.fetchone()
    goal_track = prog["goal_track"] if prog else "Full Stack Software Engineer"
    completed_topics = json.loads(prog["completed_topics"]) if prog and prog["completed_topics"] else []

    # 4. Fetch Scheduled Interviews
    cursor.execute("SELECT * FROM interviews WHERE student_id = ? ORDER BY created_at DESC", (user["id"],))
    interviews = [dict(i) for i in cursor.fetchall()]

    # 5. Fetch Endorsements
    cursor.execute("SELECT * FROM endorsements WHERE student_id = ? ORDER BY created_at DESC", (user["id"],))
    endorsements = [dict(e) for e in cursor.fetchall()]

    # 6. Fetch Notifications
    cursor.execute("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 10", (user["id"],))
    notifications = [dict(n) for n in cursor.fetchall()]

    conn.close()

    # REAL DYNAMIC PROGRESS CALCULATION (Starts at 0% for new user)
    verified_count = len(passed_attempts)
    challenges_count = len(submissions)
    interviews_count = len(interviews)
    topics_count = len(completed_topics)

    # Dynamic Trust Score: Starts at 15 for email verified; +15 per passed quiz; +20 per challenge
    if verified_count == 0 and challenges_count == 0:
        trust_score = 15  # Base for email verified
    else:
        trust_score = min(100, 15 + (verified_count * 15) + (challenges_count * 20))

    # Dynamic Skill Readiness: (topics * 3.5%) + (verified_skills * 10%) + (challenges * 12%), max 100%
    skill_readiness = min(100, int((topics_count * 3.5) + (verified_count * 10) + (challenges_count * 12)))

    # Top Skill
    top_skill = None
    if passed_attempts:
        top_skill = {
            "name": passed_attempts[0]["skill"],
            "score": passed_attempts[0]["score"]
        }

    return {
        "trust_score": trust_score,
        "skill_readiness": skill_readiness,
        "verified_skills_count": verified_count,
        "challenges_solved": challenges_count,
        "interviews_count": interviews_count,
        "top_skill": top_skill,
        "verified_skills": [{"skill": a["skill"], "score": a["score"], "integrity": a["integrity_score"]} for a in passed_attempts],
        "goal_track": goal_track,
        "completed_topics": completed_topics,
        "interviews": interviews,
        "endorsements": endorsements,
        "notifications": notifications
    }

@app.post("/api/dashboard/progress")
def update_progress(req: UpdateProgressRequest, user: dict = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    cursor.execute("""
    INSERT INTO user_progress (user_id, goal_track, completed_topics, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET goal_track = excluded.goal_track, completed_topics = excluded.completed_topics, updated_at = excluded.updated_at
    """, (user["id"], req.goal_track, json.dumps(req.completed_topics), now))
    conn.commit()
    conn.close()
    return {"success": True, "goal_track": req.goal_track, "completed_topics": req.completed_topics}

# ----------------- Recruiter / Teacher / Student Interaction Endpoints -----------------
@app.get("/api/talents")
def list_talents():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT u.id, u.name, u.email, u.role, u.created_at,
           (SELECT COUNT(*) FROM attempts a WHERE a.user_id = u.id AND a.passed = 1) as verified_count,
           (SELECT COUNT(*) FROM submissions s WHERE s.user_id = u.id) as challenge_count,
           (SELECT AVG(score) FROM attempts a WHERE a.user_id = u.id AND a.passed = 1) as avg_score
    FROM users u WHERE u.role = 'Student'
    ORDER BY verified_count DESC, avg_score DESC
    """)
    rows = cursor.fetchall()
    talents = []
    for r in rows:
        d = dict(r)
        d["verified_count"] = d["verified_count"] or 0
        d["challenge_count"] = d["challenge_count"] or 0
        d["avg_score"] = int(d["avg_score"]) if d["avg_score"] else 0
        d["trust_score"] = min(100, 15 + (d["verified_count"] * 15) + (d["challenge_count"] * 20))
        talents.append(d)
    conn.close()
    return {"talents": talents}

@app.post("/api/interviews/schedule")
def schedule_interview(req: ScheduleInterviewRequest, user: dict = Depends(get_current_user)):
    interview_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    company_name = user["name"] if user["role"] in ["Company", "Admin", "Faculty", "College"] else "Recruiter"
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO interviews (id, student_id, student_name, student_email, company_id, company_name, role_title, date_time, meet_link, notes, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Scheduled', ?)
    """, (interview_id, req.student_id, req.student_name, req.student_email, user["id"], company_name, req.role_title, req.date_time, req.meet_link, req.notes or "", now))
    
    # Notify Student
    cursor.execute("""
    INSERT INTO notifications (id, user_id, title, message, created_at)
    VALUES (?, ?, ?, ?, ?)
    """, (
        str(uuid.uuid4()), req.student_id,
        f"🎯 Interview Scheduled with {company_name}!",
        f"You have been invited for an interview for the role '{req.role_title}' on {req.date_time}. Meet Link: {req.meet_link}",
        now
    ))
    conn.commit()
    conn.close()

    # Send Notification Email to Student
    invite_html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0b0d13; color: #ffffff; padding: 30px; border-radius: 12px;">
      <h2 style="color: #10b981;">🎯 Direct Interview Invitation: {req.role_title}</h2>
      <p>Hello <strong>{req.student_name}</strong>,</p>
      <p>Based on your verified skills on LinktoCompany, <strong>{company_name}</strong> has scheduled a direct technical interview with you!</p>
      <div style="background: #1e293b; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <p style="margin: 4px 0;"><strong>Date & Time:</strong> {req.date_time}</p>
        <p style="margin: 4px 0;"><strong>Meeting Link:</strong> <a href="{req.meet_link}" style="color: #38bdf8;">{req.meet_link}</a></p>
        {f'<p style="margin: 4px 0;"><strong>Notes:</strong> {req.notes}</p>' if req.notes else ''}
      </div>
      <p style="color: #94a3b8; font-size: 13px;">Login to your LinktoCompany dashboard to view full interview details.</p>
    </div>
    """
    send_email(req.student_email, f"Interview Scheduled: {req.role_title} at {company_name}", invite_html)

    return {"success": True, "interview_id": interview_id, "message": f"Interview scheduled and invitation sent to {req.student_email}"}

@app.post("/api/endorsements")
def create_endorsement(req: CreateEndorsementRequest, user: dict = Depends(get_current_user)):
    end_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO endorsements (id, student_id, author_name, author_role, message, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (end_id, req.student_id, user["name"], user["role"], req.message, now))
    
    # Notify student
    cursor.execute("""
    INSERT INTO notifications (id, user_id, title, message, created_at)
    VALUES (?, ?, ?, ?, ?)
    """, (str(uuid.uuid4()), req.student_id, f"Feedback from {user['name']} ({user['role']})", req.message, now))
    conn.commit()
    conn.close()
    return {"success": True, "endorsement_id": end_id}

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

    # Trigger Automated Recruiter Notification when Student passes high score
    if passed and score >= 80:
        cursor.execute("""
        INSERT INTO notifications (id, user_id, title, message, created_at)
        VALUES (?, ?, ?, ?, ?)
        """, (
            str(uuid.uuid4()), user["id"],
            f"🏆 Skill Verified: {skill} ({score}%)",
            f"Congratulations! You verified {skill} with {score}% score. Companies can now shortlist you directly for interviews!",
            now
        ))

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

    if "dsa" in msg or "placement" in msg:
        reply = (
            "Here is your prioritized DSA roadmap for placements (150–250 quality problems):\n\n"
            "1. **Arrays & Strings + Two Pointers** (Sliding window, prefix sum)\n"
            "2. **Linked List, Stack & Queue** (Monotonic stack, reverse list)\n"
            "3. **HashMap & HashSet** (Frequency mapping, anagrams)\n"
            "4. **Recursion & Backtracking** (Subsets, permutations)\n"
            "5. **Trees & BST** (Traversals, LCA, height)\n"
            "6. **Graph & BFS/DFS** (Dijkstra, Cycle detection)\n"
            "7. **Dynamic Programming** (0/1 Knapsack, LCS, LIS)"
        )
    elif "next" in msg or "learn" in msg or "track" in msg:
        reply = (
            "Recommended Software Engineering milestones:\n\n"
            "• **Core Track**: Full Stack (React + Node.js) or Java Backend (Spring Boot + JPA)\n"
            "• **Database**: SQL (PostgreSQL), Indexes, Transactions, Normalization\n"
            "• **Version Control**: Git branches, pull requests, merge conflict resolution\n"
            "• **Real Projects**: Build and deploy an Authentication + Email OTP system or Job Portal."
        )
    elif "shortlist" in msg or "interview" in msg:
        reply = (
            "To get automated recruiter interview calls on LinktoCompany:\n\n"
            "1. Pass skill assessments with **≥ 80% score** (JavaScript, DSA, SQL, CS Fundamentals).\n"
            "2. Submit at least 1 live company challenge with a working GitHub repository URL.\n"
            "3. Companies will see your verified score card and schedule direct interviews via Google Meet."
        )
    else:
        reply = (
            f"Regarding your query on '{req.message}':\n\n"
            "LinktoCompany connects verified skills to real recruiters. Complete roadmap topics, verify your skills with proctored quizzes, and earn direct interview invites!"
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
