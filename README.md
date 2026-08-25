# LinktoCompany — Skill Proof Network (SIH 2026)

> **Academia–Industry Collaboration Platform**: Prove your skills. Get discovered. Link to opportunities.

A fullstack clone and implementation of the **LinktoCompany** Career Action Platform (`https://career-action.preview.emergentagent.com/dashboard`).

---

## 🚀 Quick Start (Local)

### Option 1: 1-Click Runner (Windows)
```cmd
start.bat
```
*(or run `python start_all.py`)*

### Option 2: Manual Development
```bash
# Terminal 1: Backend
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2: Frontend
npm run dev
```

---

## 🌐 How to Deploy (Production)

The app is built with **Single-Port Production Serving**: when you build the frontend (`npm run build`), the Python FastAPI server automatically serves the React SPA, assets, and all REST API endpoints together on a single port!

### Method 1: Render.com (Recommended - Free & Easy)
1. Push your repository to **GitHub** / **GitLab**.
2. Go to [Render.com](https://render.com) and click **New + $\rightarrow$ Web Service**.
3. Connect your repository.
4. Set the following settings:
   - **Environment**: `Python 3`
   - **Build Command**:
     ```bash
     npm install && npm run build && pip install -r backend/requirements.txt
     ```
   - **Start Command**:
     ```bash
     uvicorn backend.main:app --host 0.0.0.0 --port $PORT
     ```
5. Click **Create Web Service**. Your app is live with free HTTPS!

---

### Method 2: Docker / Docker Compose
Deploy on any VPS (AWS EC2, DigitalOcean Droplet, Linode, Hetzner):
```bash
# Build and run with Docker
docker build -t linktocompany .
docker run -p 8000:8000 linktocompany

# Or with Docker Compose:
docker-compose up -d
```
Access at `http://your-server-ip:8000`.

---

### Method 3: Railway / Fly.io / Koyeb
- **Railway**: Simply link your GitHub repo; Railway detects the `Dockerfile` automatically and deploys it in under 2 minutes.
- **Fly.io**:
  ```bash
  fly launch
  fly deploy
  ```

---

### Method 4: Separated Frontend (Vercel) + Backend (Render / Railway)
If you prefer hosting the React frontend on **Vercel** and backend on **Render**:
1. **Deploy Backend**: Deploy the `backend/` folder on Render/Railway and copy the backend URL (e.g. `https://api.yourdomain.com`).
2. **Deploy Frontend on Vercel**:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variable:
     - `VITE_BACKEND_URL`: `https://api.yourdomain.com`

---

## 🔑 Demo Accounts (Pre-Seeded)

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Student** | `student.demo@slrtce.in` | `demo-student-2026` | Skill assessments, challenge submissions, AI copilot, roadmap |
| **Admin** | `ashish.g.gupta25@slrtce.in` | `demo-admin-2026` | Full platform access, post challenges, view all data |
| **Company** | `recruiter@techvedika.in` | `demo-company-2026` | Post live challenges, view candidate leaderboards & shortlists |
| **College** | `tpo@slrtce.in` | `demo-college-2026` | Institutional readiness tracking, student credentials |
| **Faculty** | `faculty@slrtce.in` | `demo-faculty-2026` | Mentorship, FDPs, live collaborative projects |

---

## 🛠️ Features Breakdown

1. **Evidence-First Landing (`/`)**: Hero section, dynamic constellation grid background, live Evidence Profile card, 4-step challenge hiring journey, 4-portal ecosystem breakdown.
2. **Authentication (`/auth`)**: JWT-based login/registration with 1-click role credential auto-fill.
3. **Student Dashboard (`/dashboard`)**: Trust Score, Skill Readiness, 6-step AI Action Plan, Top Skill progress, Matched opportunities, and Live company challenges.
4. **Proctored Skill Assessments (`/assessment`)**: Proctored tests for **JavaScript**, **React**, **Node.js**, **MongoDB**, and **Python** with 10-minute timer and anti-cheating tracking (blur/tab-switching/fullscreen-exit/paste).
5. **Company Challenges & Leaderboard (`/challenges`)**: Challenge submissions with GitHub/demo links, automated shortlisting rules (Fast Track $\ge 90\%$, Internship $\ge 85\%$, Interview $\ge 80\%$), and dynamic ranked leaderboards.
6. **AI Career Copilot (Drawer)**: Interactive floating drawer with career roadmaps, skill suggestions, and session chat persistence.
