from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from django.test import TestCase, override_settings
import tempfile

from internships.models import Skill

User = get_user_model()

def build_pdf(text: str) -> bytes:
    """A tiny but valid one-page PDF containing `text` (with a proper xref table)."""
    stream = f"BT /F1 12 Tf 10 50 Td ({text}) Tj ET".encode()
    objs = [
        b"<</Type/Catalog/Pages 2 0 R>>",
        b"<</Type/Pages/Kids[3 0 R]/Count 1>>",
        b"<</Type/Page/Parent 2 0 R/MediaBox[0 0 400 100]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>",
        b"<</Length %d>>\nstream\n" % len(stream) + stream + b"\nendstream",
        b"<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>",
    ]
    out = b"%PDF-1.4\n"
    offsets = []
    for i, o in enumerate(objs, 1):
        offsets.append(len(out))
        out += b"%d 0 obj\n" % i + o + b"\nendobj\n"
    xref = len(out)
    out += b"xref\n0 %d\n0000000000 65535 f \n" % (len(objs) + 1)
    for off in offsets:
        out += b"%010d 00000 n \n" % off
    out += b"trailer<</Size %d/Root 1 0 R>>\nstartxref\n%d\n%%%%EOF" % (len(objs) + 1, xref)
    return out


MIN_PDF = build_pdf("Skills: Python, React and SQL")


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class ProfileExtrasTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user("stu", "s@x.com", "pw12345678", role="student")
        self.client = APIClient()
        self.client.force_authenticate(self.user)
        for n in ["Python", "React", "SQL", "Java"]:
            Skill.objects.create(name=n)

    def test_resume_detects_skills(self):
        f = SimpleUploadedFile("cv.pdf", MIN_PDF, content_type="application/pdf")
        r = self.client.post("/api/institutions/student-profile/resume/", {"file": f}, format="multipart")
        self.assertEqual(r.status_code, 200, r.content)
        names = {s["name"] for s in r.data["detected_skills"]}
        self.assertEqual(names, {"Python", "React", "SQL"})

    def test_resume_rejects_non_pdf(self):
        f = SimpleUploadedFile("cv.pdf", b"not a pdf at all", content_type="application/pdf")
        r = self.client.post("/api/institutions/student-profile/resume/", {"file": f}, format="multipart")
        self.assertEqual(r.status_code, 400)

    def test_experience_crud_and_isolation(self):
        r = self.client.post(
            "/api/institutions/student-profile/experience/",
            {"title": "Intern", "company": "Acme", "start_date": "2024-06-01", "end_date": "2024-08-30"},
            format="json",
        )
        self.assertEqual(r.status_code, 201, r.content)
        other = User.objects.create_user("o", "o@x.com", "pw12345678", role="student")
        c2 = APIClient(); c2.force_authenticate(other)
        self.assertEqual(c2.get("/api/institutions/student-profile/experience/").data, [])
        self.assertEqual(c2.delete(f"/api/institutions/student-profile/experience/{r.data['id']}/").status_code, 404)
        bad = self.client.post("/api/institutions/student-profile/experience/", {"title": "X", "company": "Y", "start_date": "2024-06-01", "end_date": "2024-01-01"}, format="json")
        self.assertEqual(bad.status_code, 400)

    def test_certification_upload_rules(self):
        ok = SimpleUploadedFile("c.pdf", MIN_PDF, content_type="application/pdf")
        r = self.client.post("/api/institutions/student-profile/certifications/", {"name": "AWS CP", "issuer": "Amazon", "file": ok}, format="multipart")
        self.assertEqual(r.status_code, 201, r.content)
        bad = SimpleUploadedFile("c.exe", b"MZ", content_type="application/octet-stream")
        r = self.client.post("/api/institutions/student-profile/certifications/", {"name": "x", "issuer": "y", "file": bad}, format="multipart")
        self.assertEqual(r.status_code, 400)
