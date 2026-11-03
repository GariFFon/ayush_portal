"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/auth-context";
import { usePhotoUpload } from "@/lib/use-photo-upload";
import { getStudentProfile, updateStudentProfile } from "@/lib/api";
import { DashboardSkeleton, Field, HeroCard, PageHeader, Panel, ProfileCard, stagger } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UniversityCombobox } from "@/components/university-combobox";
import { Textarea } from "@/components/ui/textarea";

interface University { id: number; name: string; location: string }
interface Profile {
  id: number; degree: string; branch: string; graduation_year: number | null;
  cgpa: string | null; resume_url: string; linkedin_url: string; github_url: string;
  bio: string; resume_file?: string | null; is_available: boolean; profile_completion: number;
  university: University | null; university_id?: number;
}

export default function StudentProfilePage() {
  const { user } = useAuth();
  const photo = usePhotoUpload();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudentProfile()
      .then((p) => {
        setProfile(p as Profile);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    setProfile((prev) => (prev ? { ...prev, [key]: value } : prev));

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await updateStudentProfile({
        degree: profile.degree, branch: profile.branch,
        graduation_year: profile.graduation_year, cgpa: profile.cgpa,
        resume_url: profile.resume_url, linkedin_url: profile.linkedin_url,
        github_url: profile.github_url, bio: profile.bio,
        is_available: profile.is_available,
        university_id: profile.university?.id,
      });
      toast.success("Profile saved");
    } catch {
      toast.error("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <DashboardSkeleton />;
  if (!profile) return null;

  const fullName = user?.full_name || user?.username || "Student";

  return (
    <div className="space-y-8">
      <PageHeader
        title="Profile"
        subtitle="Recruiters see this first — keep it sharp."
        actions={
          <Button size="lg" onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="animate-spin" />}
            Save changes
          </Button>
        }
      />

      <div className="grid items-stretch gap-5 lg:grid-cols-12">
        <ProfileCard
          className="lg:col-span-3"
          name={fullName}
          status={profile.is_available ? "Open to internships" : "Not looking right now"}
          handle={user?.email || user?.username || ""}
          photo={user?.profile_photo}
          gender={user?.gender}
          onPhoto={photo.upload}
          uploading={photo.uploading}
          style={stagger(0)}
          href="/dashboard/account"
          action="Edit account"
          roleLabel="Student"
        />
        <HeroCard
          className="lg:col-span-4"
          name={fullName}
          role={[profile.degree, profile.branch].filter(Boolean).join(" · ") || "Student"}
          kicker="CGPA"
          value={profile.cgpa ?? "—"}
          progress={{ label: "Profile completion", value: profile.profile_completion }}
          nextLabel="Add your skills"
          nextHref="/dashboard/student/skills"
        />

        <Panel className="z-20 overflow-visible lg:col-span-5" title="Academic details" style={stagger(1)} contentClassName="space-y-5">
          <Field label="University">
            <UniversityCombobox
              value={profile.university}
              onChange={(u) => set("university", { id: u.id, name: u.name, location: u.location ?? "" })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Degree">
              <Input placeholder="e.g. B.Tech" value={profile.degree} onChange={(e) => set("degree", e.target.value)} />
            </Field>
            <Field label="Branch">
              <Input placeholder="e.g. CSE" value={profile.branch} onChange={(e) => set("branch", e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Graduation year">
              <Input type="number" placeholder="e.g. 2026" value={profile.graduation_year ?? ""} onChange={(e) => set("graduation_year", e.target.value ? Number(e.target.value) : null)} />
            </Field>
            <Field label="CGPA">
              <Input type="number" step="0.01" max="10" placeholder="e.g. 8.5" value={profile.cgpa ?? ""} onChange={(e) => set("cgpa", e.target.value || null)} />
            </Field>
          </div>
        </Panel>
      </div>

      <div className="grid items-stretch gap-5 lg:grid-cols-12">
        <Panel className="lg:col-span-7" title="Links" tone="sage" style={stagger(2)} contentClassName="space-y-5">
          <Field label="Resume URL">
            <Input placeholder="https://drive.google.com/…" value={profile.resume_url} onChange={(e) => set("resume_url", e.target.value)} />
          </Field>
          <Field label="LinkedIn">
            <Input placeholder="https://linkedin.com/in/…" value={profile.linkedin_url} onChange={(e) => set("linkedin_url", e.target.value)} />
          </Field>
          <Field label="GitHub">
            <Input placeholder="https://github.com/…" value={profile.github_url} onChange={(e) => set("github_url", e.target.value)} />
          </Field>
        </Panel>
        <Panel className="lg:col-span-5" title="About you" tone="mist" style={stagger(3)} contentClassName="flex flex-col">
          <Field label="Bio" hint="A few lines recruiters can skim." className="flex flex-1 flex-col [&>textarea]:flex-1">
            <Textarea placeholder="Tell recruiters about yourself…" value={profile.bio} onChange={(e) => set("bio", e.target.value)} />
          </Field>
        </Panel>
      </div>

    </div>
  );
}
