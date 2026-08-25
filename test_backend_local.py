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

    def test_email_otp_and_registration(self):
        test_email = f"candidate.{uuid.uuid4().hex[:6]}@gmail.com"
        otp_res = self.client.post("/api/auth/send-otp", json={
            "email": test_email,
            "name": "Amit Real"
        })
        self.assertEqual(otp_res.status_code, 200)
        otp_data = otp_res.json()
        self.assertTrue(otp_data["success"])
        dev_otp = otp_data.get("dev_otp")

        reg_res = self.client.post("/api/auth/register", json={
            "name": "Amit Real",
            "email": test_email,
            "password": "real-password-2026",
            "role": "Student",
            "otp": dev_otp
        })
        self.assertEqual(reg_res.status_code, 200)
        reg_data = reg_res.json()
        self.assertIn("token", reg_data)
        self.assertEqual(reg_data["user"]["email"], test_email)

        login_res = self.client.post("/api/auth/login", json={
            "email": test_email,
            "password": "real-password-2026"
        })
        self.assertEqual(login_res.status_code, 200)
        self.assertIn("token", login_res.json())

    def test_demo_logins(self):
        roles = [
            ("student.demo@slrtce.in", "demo-student-2026", "Student"),
            ("ashish.g.gupta25@slrtce.in", "demo-admin-2026", "Admin"),
            ("recruiter@techvedika.in", "demo-company-2026", "Company"),
            ("tpo@slrtce.in", "demo-college-2026", "College"),
            ("faculty@slrtce.in", "demo-faculty-2026", "Faculty"),
        ]
        for email, password, expected_role in roles:
            res = self.client.post("/api/auth/login", json={"email": email, "password": password})
            self.assertEqual(res.status_code, 200, f"Login failed for {email}")
            data = res.json()
            self.assertIn("token", data)
            self.assertEqual(data["user"]["role"], expected_role)

    def test_assessment_flow(self):
        login_res = self.client.post("/api/auth/login", json={
            "email": "student.demo@slrtce.in",
            "password": "demo-student-2026"
        })
        token = login_res.json()["token"]
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
        self.assertEqual(data["integrity_score"], 100)

        my_res = self.client.get("/api/assessments/my", headers=headers)
        self.assertEqual(my_res.status_code, 200)
        self.assertTrue(len(my_res.json()["attempts"]) > 0)

    def test_challenge_and_leaderboard(self):
        login_res = self.client.post("/api/auth/login", json={
            "email": "student.demo@slrtce.in",
            "password": "demo-student-2026"
        })
        token = login_res.json()["token"]
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
        sub_data = sub_res.json()["submission"]
        self.assertIn("score", sub_data)
        self.assertIn("shortlist", sub_data)

        lb_res = self.client.get(f"/api/challenges/{chall_id}/leaderboard")
        self.assertEqual(lb_res.status_code, 200)
        self.assertTrue(len(lb_res.json()["submissions"]) > 0)

    def test_copilot_chat(self):
        sess_id = f"test-session-{uuid.uuid4().hex}"
        res = self.client.post("/api/copilot/chat", json={
            "session_id": sess_id,
            "message": "Which skill should I learn next?"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("Node.js", data["reply"])

        hist_res = self.client.get(f"/api/copilot/history/{sess_id}")
        self.assertEqual(hist_res.status_code, 200)
        self.assertEqual(len(hist_res.json()["messages"]), 1)

if __name__ == "__main__":
    unittest.main()
