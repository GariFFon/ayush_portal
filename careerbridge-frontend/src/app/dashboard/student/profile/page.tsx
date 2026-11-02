"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/auth-context";
import { getStudentProfile, getUniversities, updateStudentProfile } from "@/lib/api";
import { DashboardSkeleton, Field, HeroCard, PageHeader, Panel, stagger } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface University { id: number; name: string; location: string }
interface Profile {
  id: number; degree: string; branch: string; graduation_year: number | null;
  cgpa: string | null; resume_url: string; linkedin_url: string; github_url: string;
  bio: string; is_available: boolean; profile_completion: number;
  university: University | null; university_id?: number;
}

export default function StudentProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [universities, setUniversities] = useState<University[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStudentProfile(), getUniversities()])
      .then(([p, u]) => {
        setProfile(p as Profile);
        setUniversities(Array.isArray(u) ? (u as University[]) : ((u as { results?: University[] }).results ?? []));
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
        <HeroCard
          className="lg:col-span-5"
          name={fullName}
          role={[profile.degree, profile.branch].filter(Boolean).join(" · ") || "Student"}
          kicker="CGPA"
          value={profile.cgpa ?? "—"}
          progress={{ label: "Profile completion", value: profile.profile_completion }}
          nextLabel="Add your skills"
          nextHref="/dashboard/student/skills"
        />

        <Panel className="lg:col-span-7" title="Academic details" style={stagger(1)} contentClassName="space-y-5">
          <Field label="University">
            <Select
              value={String(profile.university?.id ?? "")}
              items={Object.fromEntries(universities.map((u) => [String(u.id), u.name]))}
              onValueChange={(v) => set("university", universities.find((u) => u.id === Number(v)) || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select university" />
              </SelectTrigger>
              <SelectContent>
                {universities.map((u) => (
                  <SelectItem key={u.id} value={String(u.id)}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Degree">
              <Input placeholder="B.Tech" value={profile.degree} onChange={(e) => set("degree", e.target.value)} />
            </Field>
            <Field label="Branch">
              <Input placeholder="CSE" value={profile.branch} onChange={(e) => set("branch", e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Graduation year">
              <Input type="number" placeholder="2026" value={profile.graduation_year ?? ""} onChange={(e) => set("graduation_year", e.target.value ? Number(e.target.value) : null)} />
            </Field>
            <Field label="CGPA">
              <Input type="number" step="0.01" max="10" placeholder="8.5" value={profile.cgpa ?? ""} onChange={(e) => set("cgpa", e.target.value || null)} />
            </Field>
          </div>
        </Panel>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-12">
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
        <Panel className="lg:col-span-5" title="About you" tone="mist" style={stagger(3)} contentClassName="space-y-3">
          <Field label="Bio" hint="A few lines recruiters can skim.">
            <Textarea placeholder="Tell recruiters about yourself…" rows={7} value={profile.bio} onChange={(e) => set("bio", e.target.value)} />
          </Field>
        </Panel>
      </div>
    </div>
  );
}
