import os
import sys
import uuid
import unittest
from fastapi.testclient import TestClient
from backend.main import app, init_db, get_db

class TestSkillMatchingPipeline(unittest.TestCase):
    def setUp(self):
        init_db()
        self.client = TestClient(app)

    def get_otp_for_email(self, email: str) -> str:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT otp FROM email_otps WHERE email = ?", (email.strip().lower(),))
        row = cursor.fetchone()
        conn.close()
        return row["otp"] if row else ""

    def test_complete_skill_to_challenge_pipeline(self):
        # 1. Register a Student
        student_email = f"student.{uuid.uuid4().hex[:6]}@gmail.com"
        self.client.post("/api/auth/send-otp", json={"email": student_email, "name": "Priya Sharma"})
        otp = self.get_otp_for_email(student_email)
        reg_res = self.client.post("/api/auth/register", json={
            "name": "Priya Sharma",
            "email": student_email,
            "password": "secure-pass-2026",
            "role": "Student",
            "otp": otp
        })
        self.assertEqual(reg_res.status_code, 200)
        student_token = reg_res.json()["token"]
        student_headers = {"Authorization": f"Bearer {student_token}"}

        # 2. Update Student Profile with specific skills: Python, Java, SQL, React
        profile_res = self.client.put("/api/profile/student", json={
            "branch": "Computer Science & Engineering",
            "year": "3rd Year",
            "college": "SLRTCE, Mumbai",
            "cgpa": 9.1,
            "technical_skills": ["Python", "Java", "SQL", "React"],
            "soft_skills": ["Problem Solving", "Team Leadership"],
            "preferred_domains": ["Artificial Intelligence", "Web Development"],
            "career_interests": "AI Engineer & Full Stack Developer",
            "github_url": "https://github.com/priyasharma",
            "portfolio_url": "https://priyasharma.dev",
            "resume_url": "https://drive.google.com/resume-priya"
        }, headers=student_headers)
        self.assertEqual(profile_res.status_code, 200)

        # 3. Retrieve Student Profile and verify skills
        get_prof = self.client.get("/api/profile/student", headers=student_headers)
        self.assertEqual(get_prof.status_code, 200)
        self.assertIn("Python", get_prof.json()["profile"]["technical_skills"])

        # 4. Check Challenge Matching (Prompt Example: AI Crop Disease requires Python, Machine Learning, OpenCV, SQL)
        # Priya has Python, SQL -> 2 of 4 required = 50% match score!
        chall_res = self.client.get("/api/challenges", headers=student_headers)
        self.assertEqual(chall_res.status_code, 200)
        challenges = chall_res.json()["challenges"]
        self.assertTrue(len(challenges) >= 3)

        ai_crop_chall = next((c for c in challenges if "Crop Disease" in c["title"]), None)
        self.assertIsNotNone(ai_crop_chall)
        self.assertEqual(ai_crop_chall["match_score"], 50)
        self.assertIn("Python", ai_crop_chall["matched_skills"])
        self.assertIn("SQL", ai_crop_chall["matched_skills"])
        self.assertIn("Machine Learning", ai_crop_chall["missing_skills"])
        self.assertIn("OpenCV", ai_crop_chall["missing_skills"])

        # 5. Check Challenge Details & Skill Gap Analysis
        detail_res = self.client.get(f"/api/challenges/{ai_crop_chall['id']}", headers=student_headers)
        self.assertEqual(detail_res.status_code, 200)
        detail = detail_res.json()["challenge"]
        self.assertEqual(detail["match_score"], 50)
        self.assertTrue(len(detail["learning_path"]) >= 2)

        # 6. Check Smart Recommendations Endpoint
        rec_res = self.client.get("/api/challenges/recommended", headers=student_headers)
        self.assertEqual(rec_res.status_code, 200)
        recs = rec_res.json()["recommended"]
        self.assertTrue(len(recs) > 0)
        self.assertTrue(len(recs[0]["why_recommended"]) > 0)

        # 7. Student Applies to Challenge (Status -> 'Applied')
        apply_res = self.client.post(f"/api/challenges/{ai_crop_chall['id']}/apply", json={
            "notes": "Excited to work on computer vision for agriculture."
        }, headers=student_headers)
        self.assertEqual(apply_res.status_code, 200)
        app_id = apply_res.json()["application_id"]
        self.assertEqual(apply_res.json()["status"], "Applied")

        # 8. Student Submits GitHub Solution (Status -> 'Submitted')
        submit_res = self.client.post(f"/api/challenges/{ai_crop_chall['id']}/submit", json={
            "github_url": "https://github.com/priyasharma/crop-disease-detector",
            "demo_url": "https://crop-ai-demo.streamlit.app",
            "notes": "Trained ResNet-50 on PlantVillage dataset. Accuracy 92.4% with FastAPI backend."
        }, headers=student_headers)
        self.assertEqual(submit_res.status_code, 200)
        self.assertEqual(submit_res.json()["status"], "Submitted")

        # 9. Student checks My Applications
        my_apps = self.client.get("/api/applications/my", headers=student_headers)
        self.assertEqual(my_apps.status_code, 200)
        apps_list = my_apps.json()["applications"]
        self.assertTrue(len(apps_list) >= 1)
        self.assertEqual(apps_list[0]["status"], "Submitted")

        # 10. Register Company Account
        comp_email = f"recruiter.{uuid.uuid4().hex[:6]}@abctechnologies.com"
        self.client.post("/api/auth/send-otp", json={"email": comp_email, "name": "ABC Tech Recruiter"})
        comp_otp = self.get_otp_for_email(comp_email)
        comp_reg = self.client.post("/api/auth/register", json={
            "name": "ABC Tech Recruiter",
            "email": comp_email,
            "password": "company-pass-2026",
            "role": "Company",
            "otp": comp_otp
        })
        self.assertEqual(comp_reg.status_code, 200)
        comp_token = comp_reg.json()["token"]
        comp_headers = {"Authorization": f"Bearer {comp_token}"}

        # 11. Recruiter views Challenge Applicants
        applicants_res = self.client.get(f"/api/challenges/{ai_crop_chall['id']}/applicants", headers=comp_headers)
        self.assertEqual(applicants_res.status_code, 200)
        applicants = applicants_res.json()["applicants"]
        self.assertTrue(len(applicants) >= 1)
        app_to_eval = applicants[0]
        self.assertEqual(app_to_eval["user_name"], "Priya Sharma")

        # 12. Recruiter Evaluates the Student (Multi-criteria scoring)
        eval_res = self.client.post(f"/api/applications/{app_to_eval['id']}/evaluate", json={
            "tech_score": 92,
            "problem_solving_score": 90,
            "communication_score": 85,
            "code_quality_score": 95,
            "innovation_score": 88,
            "feedback": "Outstanding computer vision pipeline and clean code structure. Excellent validation metric reporting.",
            "outcome": "Internship Offered"
        }, headers=comp_headers)
        self.assertEqual(eval_res.status_code, 200)
        self.assertGreaterEqual(eval_res.json()["overall_score"], 88)
        self.assertEqual(eval_res.json()["outcome"], "Internship Offered")

        # 13. Student checks My Applications again -> sees Evaluation and Offer!
        my_apps_after = self.client.get("/api/applications/my", headers=student_headers)
        self.assertEqual(my_apps_after.status_code, 200)
        evaluated_app = my_apps_after.json()["applications"][0]
        self.assertEqual(evaluated_app["status"], "Internship Offered")
        self.assertIsNotNone(evaluated_app["evaluation"])
        self.assertEqual(evaluated_app["evaluation"]["outcome"], "Internship Offered")

        # 14. Check College Analytics (Industry Demand vs Student Skills Gap)
        analytics_res = self.client.get("/api/analytics/college")
        self.assertEqual(analytics_res.status_code, 200)
        analytics = analytics_res.json()
        self.assertTrue(len(analytics["demand_vs_supply"]) > 0)
        self.assertTrue(len(analytics["department_stats"]) > 0)

        # 15. Student adds missing skills to profile -> match score dynamically increases!
        update_skills_res = self.client.put("/api/profile/student", json={
            "branch": "Computer Science & Engineering",
            "year": "3rd Year",
            "college": "SLRTCE, Mumbai",
            "cgpa": 9.1,
            "technical_skills": ["Python", "Java", "SQL", "React", "Machine Learning", "OpenCV"],
            "soft_skills": ["Problem Solving", "Team Leadership"],
            "preferred_domains": ["Artificial Intelligence"],
            "career_interests": "AI Engineer",
        }, headers=student_headers)
        self.assertEqual(update_skills_res.status_code, 200)

        # Match score now jumps to 100%!
        chall_res_updated = self.client.get("/api/challenges", headers=student_headers)
        ai_crop_updated = next((c for c in chall_res_updated.json()["challenges"] if "Crop Disease" in c["title"]), None)
        self.assertEqual(ai_crop_updated["match_score"], 100)

if __name__ == "__main__":
    unittest.main()
