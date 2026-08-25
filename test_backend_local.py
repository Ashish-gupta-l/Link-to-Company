import os
import sys
import unittest
from fastapi.testclient import TestClient
from backend.main import app, init_db

class TestLinktoCompany(unittest.TestCase):
    def setUp(self):
        init_db()
        self.client = TestClient(app)

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
        # 1. Login
        login_res = self.client.post("/api/auth/login", json={
            "email": "student.demo@slrtce.in",
            "password": "demo-student-2026"
        })
        token = login_res.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Get skills
        skills_res = self.client.get("/api/assessments/skills", headers=headers)
        self.assertEqual(skills_res.status_code, 200)
        self.assertIn("JavaScript", skills_res.json()["skills"])

        # 3. Start assessment
        start_res = self.client.post("/api/assessments/start", json={"skill": "JavaScript"}, headers=headers)
        self.assertEqual(start_res.status_code, 200)
        attempt_id = start_res.json()["attempt_id"]

        # 4. Submit with correct answers
        # JS answers: Q0->0, Q1->1, Q2->2, Q3->3, Q4->1
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

        # 5. Check my assessments
        my_res = self.client.get("/api/assessments/my", headers=headers)
        self.assertEqual(my_res.status_code, 200)
        self.assertTrue(len(my_res.json()["attempts"]) > 0)

    def test_challenge_and_leaderboard(self):
        # 1. Login as Student
        login_res = self.client.post("/api/auth/login", json={
            "email": "student.demo@slrtce.in",
            "password": "demo-student-2026"
        })
        token = login_res.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Get challenges
        challs_res = self.client.get("/api/challenges")
        self.assertEqual(challs_res.status_code, 200)
        challenges = challs_res.json()["challenges"]
        self.assertTrue(len(challenges) > 0)
        chall_id = challenges[0]["id"]

        # 3. Submit solution
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

        # 4. Check leaderboard
        lb_res = self.client.get(f"/api/challenges/{chall_id}/leaderboard")
        self.assertEqual(lb_res.status_code, 200)
        self.assertTrue(len(lb_res.json()["submissions"]) > 0)

    def test_copilot_chat(self):
        res = self.client.post("/api/copilot/chat", json={
            "session_id": "test-session-123",
            "message": "Which skill should I learn next?"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("Node.js", data["reply"])

        hist_res = self.client.get("/api/copilot/history/test-session-123")
        self.assertEqual(hist_res.status_code, 200)
        self.assertEqual(len(hist_res.json()["messages"]), 1)

if __name__ == "__main__":
    unittest.main()
