import os
import sys
import uuid
import unittest
from fastapi.testclient import TestClient
from backend.main import app, init_db

class TestLinktoCompany(unittest.TestCase):
    def setUp(self):
        init_db()
        self.client = TestClient(app)

    def test_mandatory_otp_and_fake_email_blocked(self):
        # 1. Test fake/disposable email is blocked
        fake_res = self.client.post("/api/auth/send-otp", json={
            "email": "fake.user@tempmail.com",
            "name": "Fake User"
        })
        self.assertEqual(fake_res.status_code, 400)
        self.assertIn("Temporary", fake_res.json()["detail"])

        # 2. Test registration without OTP is rejected
        test_email = f"verified.{uuid.uuid4().hex[:6]}@gmail.com"
        reg_no_otp = self.client.post("/api/auth/register", json={
            "name": "Real User",
            "email": test_email,
            "password": "real-password-2026",
            "role": "Student",
            "otp": "000000"
        })
        self.assertEqual(reg_no_otp.status_code, 400)
        self.assertIn("Invalid OTP", reg_no_otp.json()["detail"])

        # 3. Test genuine OTP flow
        otp_res = self.client.post("/api/auth/send-otp", json={
            "email": test_email,
            "name": "Real User"
        })
        self.assertEqual(otp_res.status_code, 200)
        dev_otp = otp_res.json().get("dev_otp")

        # 4. Successful registration with correct OTP
        reg_res = self.client.post("/api/auth/register", json={
            "name": "Real User",
            "email": test_email,
            "password": "real-password-2026",
            "role": "Student",
            "otp": dev_otp
        })
        self.assertEqual(reg_res.status_code, 200)
        self.assertIn("token", reg_res.json())

        # 5. Login works with real verified credentials
        login_res = self.client.post("/api/auth/login", json={
            "email": test_email,
            "password": "real-password-2026"
        })
        self.assertEqual(login_res.status_code, 200)

        # 6. Non-existent login is rejected
        bad_login = self.client.post("/api/auth/login", json={
            "email": "nonexistent@gmail.com",
            "password": "wrongpassword"
        })
        self.assertEqual(bad_login.status_code, 400)

    def test_assessment_flow(self):
        # Register a verified user first
        email = f"candidate.{uuid.uuid4().hex[:6]}@gmail.com"
        otp_res = self.client.post("/api/auth/send-otp", json={"email": email, "name": "Candidate"})
        dev_otp = otp_res.json().get("dev_otp")

        reg_res = self.client.post("/api/auth/register", json={
            "name": "Candidate",
            "email": email,
            "password": "password123",
            "role": "Student",
            "otp": dev_otp
        })
        token = reg_res.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        skills_res = self.client.get("/api/assessments/skills", headers=headers)
        self.assertEqual(skills_res.status_code, 200)
        self.assertIn("JavaScript", skills_res.json()["skills"])

        start_res = self.client.post("/api/assessments/start", json={"skill": "JavaScript"}, headers=headers)
        self.assertEqual(start_res.status_code, 200)
        attempt_id = start_res.json()["attempt_id"]

        submit_res = self.client.post("/api/assessments/submit", json={
            "attempt_id": attempt_id,
            "answers": [0, 1, 2, 3, 1],
            "integrity_events": []
        }, headers=headers)
        self.assertEqual(submit_res.status_code, 200)
        data = submit_res.json()
        self.assertEqual(data["score"], 100)
        self.assertTrue(data["passed"])

    def test_challenge_and_leaderboard(self):
        email = f"challenger.{uuid.uuid4().hex[:6]}@gmail.com"
        otp_res = self.client.post("/api/auth/send-otp", json={"email": email, "name": "Challenger"})
        dev_otp = otp_res.json().get("dev_otp")

        reg_res = self.client.post("/api/auth/register", json={
            "name": "Challenger",
            "email": email,
            "password": "password123",
            "role": "Student",
            "otp": dev_otp
        })
        token = reg_res.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        challs_res = self.client.get("/api/challenges")
        self.assertEqual(challs_res.status_code, 200)
        challenges = challs_res.json()["challenges"]
        self.assertTrue(len(challenges) > 0)
        chall_id = challenges[0]["id"]

        sub_res = self.client.post("/api/challenges/submit", json={
            "challenge_id": chall_id,
            "github_url": "https://github.com/ashish/checkout-redesign",
            "demo_url": "https://checkout.preview.app",
            "notes": "Used React, Tailwind, and optimized conversion flow."
        }, headers=headers)
        self.assertEqual(sub_res.status_code, 200)
        self.assertIn("score", sub_res.json()["submission"])

    def test_copilot_chat(self):
        sess_id = f"test-session-{uuid.uuid4().hex}"
        res = self.client.post("/api/copilot/chat", json={
            "session_id": sess_id,
            "message": "Which skill should I learn next?"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("Node.js", data["reply"])

if __name__ == "__main__":
    unittest.main()
