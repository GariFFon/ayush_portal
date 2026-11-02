"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";

import { useAuth } from "@/contexts/auth-context";
import { createInternship } from "@/lib/api";
import { MODE_LABEL, MODE_NOTE, parseDescription, type BrowseInternship } from "@/lib/internship-data";
import { daysUntil, InternshipCard } from "@/components/internship-card";
import { Field, FrostStat, OrgAvatar, PageHeader, Panel, TickProgress, stagger } from "@/components/kit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Form = {
  title: string; description: string; location: string; work_mode: string;
  stipend: string; duration_months: string; openings: string; deadline: string; status: string;
};

/** Sticky "how it will look on the job portal" preview — card or full details. */
function PortalPreview({ form, company, now }: { form: Form; company: string; now: number }) {
  const [view, setView] = useState<"card" | "details">("card");
  const days = form.deadline ? daysUntil(form.deadline, now) : 30;
  const asCard: BrowseInternship = {
    id: 0, title: form.title || "Internship title", company_name: company, company_logo: null,
    location: form.location, work_mode: form.work_mode, stipend: form.stipend,
    duration_months: Number(form.duration_months) || 0, deadline: form.deadline || new Date(now + 30 * 86_400_000).toISOString().slice(0, 10),
    status: form.status, openings: Number(form.openings) || 0, skills_count: 0,
  };
  const blocks = parseDescription(form.description || "Describe the role and it will appear here.");

  return (
    <div className="scene rise overflow-hidden rounded-[34px] border border-(--hairline) p-5 sm:p-6 lg:sticky lg:top-24" style={stagger(2)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[15px] font-medium">Portal preview</p>
          <p className="text-[12.5px] text-foreground/60">How students will see this listing</p>
        </div>
        <div className="flex gap-1 rounded-full border border-white/60 bg-white/45 p-1 backdrop-blur-md" role="tablist" aria-label="Preview type">
          {(["card", "details"] as const).map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              type="button"
              onClick={() => setView(v)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[13px] font-medium capitalize transition-[background-color,color,transform] duration-200 ease-(--ease-out) active:scale-95",
                view === v ? "bg-card text-foreground shadow-sm" : "text-foreground/60 hover:text-foreground"
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "card" ? (
        <div key="card" className="rise">
          <InternshipCard internship={asCard} now={now} index={0} preview className="!animate-none bg-white/80 backdrop-blur-xl" />
        </div>
      ) : (
        <div key="details" className="rise space-y-3">
          <div className="frost rounded-[26px] p-5">
            <div className="flex items-center gap-3">
              <OrgAvatar name={company} className="size-11" />
              <p className="truncate text-[14px] font-medium">{company}</p>
              <Badge variant={form.status === "published" ? "success" : "warning"} className="ml-auto">
                {form.status === "published" ? "Live" : "Draft"}
              </Badge>
            </div>
            <h2 className="mt-4 text-[1.6rem] leading-tight break-words">{form.title || "Internship title"}</h2>
            <p className="mt-2 text-[13px] text-muted-foreground">
              {form.location || "Location"} · {MODE_LABEL[form.work_mode]} · {form.duration_months || 0} months
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FrostStat label="Stipend" value={<>₹{Number(form.stipend || 0).toLocaleString("en-IN")}</>} caption="per month" className="!p-4" />
            <FrostStat label="Openings" value={Number(form.openings) || 0} caption={`${days > 0 ? days : 0} days left`} className="!p-4" />
          </div>

          <div className="frost rounded-[26px] p-5">
            <p className="text-[13px] text-muted-foreground">Location</p>
            <p className="mt-1.5 text-[1.1rem] font-medium">{form.location || "Add a city"}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{MODE_NOTE[form.work_mode]}</p>
          </div>

          <div className="frost rounded-[26px] p-5">
            <p className="text-[13px] text-muted-foreground">Apply before</p>
            <p className="mt-1.5 text-[1.1rem] font-medium">
              {form.deadline ? new Date(form.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Pick a deadline"}
            </p>
            <TickProgress className="mt-3 h-6" value={Math.max(0, Math.min(100, (days / 30) * 100))} ticks={24} />
          </div>

          <div className="frost rounded-[26px] p-5">
            <p className="text-[13px] text-muted-foreground">About the role</p>
            <div className="mt-2 space-y-2 text-[13.5px] leading-relaxed">
              {blocks.slice(0, 2).map((b, i) =>
                b.kind === "p" ? (
                  <p key={i} className="line-clamp-4">{b.text}</p>
                ) : (
                  <ul key={i} className="space-y-1">
                    {b.items.slice(0, 3).map((it) => (
                      <li key={it} className="flex gap-2"><span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-current opacity-40" />{it}</li>
                    ))}
                  </ul>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreateInternshipPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [now, setNow] = useState(0);
  const [form, setForm] = useState<Form>({
    title: "", description: "", location: "", work_mode: "onsite",
    stipend: "0", duration_months: "3", openings: "1",
    deadline: "", status: "draft",
  });

  useEffect(() => {
    const id = requestAnimationFrame(() => setNow(Date.now()));
    return () => cancelAnimationFrame(id);
  }, []);

  const set = (key: keyof Form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createInternship({
        ...form,
        stipend: Number(form.stipend),
        duration_months: Number(form.duration_months),
        openings: Number(form.openings),
      });
      toast.success("Internship created");
      router.push("/dashboard/company/internships");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create internship.");
    } finally {
      setSaving(false);
    }
  };

  const company = user?.full_name || user?.username || "Your company";

  return (
    <div className="space-y-8">
      <PageHeader title="Post internship" subtitle="Fill in the details — the portal preview updates as you type." />

      <form onSubmit={handleSubmit} className="grid items-start gap-5 lg:grid-cols-12">
        <div className="min-w-0 space-y-5 lg:col-span-7">
          <Panel title="Basics" style={stagger(1)} contentClassName="space-y-5">
            <Field label="Job title *">
              <Input placeholder="e.g. Frontend Developer Intern" value={form.title} onChange={(e) => set("title", e.target.value)} required />
            </Field>
            <Field label="Description *" hint="Tip: put a heading on its own line, then bullets starting with “- ”.">
              <Textarea
                placeholder={"Describe the role…\n\nWhat you'll do\n- Build features\n- Fix bugs"}
                rows={8}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                required
              />
            </Field>
          </Panel>

          <div className="grid items-start gap-5 md:grid-cols-2">
            <Panel title="Location" tone="mist" style={stagger(3)} contentClassName="space-y-5">
              <Field label="City">
                <Input placeholder="Bengaluru, India" value={form.location} onChange={(e) => set("location", e.target.value)} />
              </Field>
              <Field label="Work mode">
                <Select value={form.work_mode} items={MODE_LABEL} onValueChange={(v) => v && set("work_mode", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(MODE_LABEL).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <p className="text-[13px] leading-relaxed text-muted-foreground">{MODE_NOTE[form.work_mode]}</p>
            </Panel>

            <Panel title="Compensation" tone="sage" style={stagger(4)} contentClassName="space-y-5">
              <Field label="Monthly stipend (₹)">
                <Input type="number" min="0" placeholder="15000" value={form.stipend} onChange={(e) => set("stipend", e.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Months">
                  <Input type="number" min="1" max="24" value={form.duration_months} onChange={(e) => set("duration_months", e.target.value)} />
                </Field>
                <Field label="Openings">
                  <Input type="number" min="1" value={form.openings} onChange={(e) => set("openings", e.target.value)} />
                </Field>
              </div>
            </Panel>
          </div>

          <Panel title="Publishing" style={stagger(5)} contentClassName="grid gap-5 sm:grid-cols-2">
            <Field label="Application deadline *">
              <Input type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} required />
            </Field>
            <Field label="Status">
              <Select value={form.status} items={{ draft: "Save as draft", published: "Publish now" }} onValueChange={(v) => v && set("status", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Save as draft</SelectItem>
                  <SelectItem value="published">Publish now</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </Panel>

          <div className="flex justify-end gap-3">
            <Button variant="outline" size="lg" type="button" render={<Link href="/dashboard/company/internships" />} nativeButton={false}>
              Cancel
            </Button>
            <Button size="lg" type="submit" disabled={saving} className="px-8">
              {saving && <Loader2 className="animate-spin" />}
              {form.status === "published" ? "Publish internship" : "Save draft"}
            </Button>
          </div>
        </div>

        <div className="min-w-0 lg:col-span-5">{now > 0 && <PortalPreview form={form} company={company} now={now} />}</div>
      </form>
    </div>
  );
}
