"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/auth-context";
import { getRecruiterApplications, updateApplicationStatus } from "@/lib/api";
import { DEMO_ENABLED, demoApplicants, type ApplicantRow } from "@/lib/demo";
import { PeopleIcon, StarIcon, TrophyIcon, ClockIcon } from "@/components/icons";
import {
  DashboardSkeleton, Field, HeroCard, OrgAvatar, PageHeader, Panel, SegBars, StatTile, StatusBadge, stagger, statusLabel,
} from "@/components/kit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const STATUSES = ["applied", "review", "shortlisted", "selected", "rejected"];

export default function CompanyApplicantsPage() {
  const { user } = useAuth();
  const [apps, setApps] = useState<ApplicantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [tab, setTab] = useState("all");
  const [selected, setSelected] = useState<ApplicantRow | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let alive = true;
    getRecruiterApplications()
      .then((d) => {
        if (!alive) return;
        const list = (Array.isArray(d) ? d : ((d as { results?: ApplicantRow[] }).results ?? [])) as ApplicantRow[];
        if (list.length === 0 && DEMO_ENABLED) {
          setApps(demoApplicants);
          setIsDemo(true);
        } else setApps(list);
      })
      .catch(() => {
        if (!alive || !DEMO_ENABLED) return;
        setApps(demoApplicants);
        setIsDemo(true);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const openDetail = (app: ApplicantRow) => {
    setSelected(app);
    setNewStatus(app.status);
    setNotes(app.recruiter_notes || "");
  };

  const handleUpdate = async () => {
    if (!selected) return;
    setUpdating(true);
    try {
      if (!isDemo) await updateApplicationStatus(selected.id, newStatus, notes);
      toast.success("Status updated");
      setApps((prev) => prev.map((a) => (a.id === selected.id ? { ...a, status: newStatus, recruiter_notes: notes } : a)));
      setSelected(null);
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <DashboardSkeleton />;

  const count = (t: string) => (t === "all" ? apps.length : apps.filter((a) => a.status === t).length);
  const visible = apps.filter((a) => tab === "all" || a.status === tab);
  const total = apps.length;
  const forward = count("shortlisted") + count("selected");
  const fullName = user?.full_name || user?.username || "Recruiter";

  return (
    <div className="space-y-8">
      <PageHeader
        title="Applicants"
        subtitle="Review and manage candidates for your internships."
        demo={isDemo}
      />

      <div className="grid gap-5 lg:grid-cols-12">
        <HeroCard
          className="lg:col-span-5"
          name={fullName}
          role="Recruiter"
          kicker="Applicants"
          value={String(total)}
          progress={{ label: "Moving forward", value: total ? (forward / total) * 100 : 0 }}
          nextLabel="My internships"
          nextHref="/dashboard/company/internships"
        />
        <Panel className="lg:col-span-7" title="Pipeline" style={stagger(1)} action={<Badge variant="violet">{total} total</Badge>}>
          <SegBars data={STATUSES.map((s) => ({ label: statusLabel(s), value: count(s) }))} emptyText="Applications appear once students apply" />
        </Panel>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile index={2} tone="sage" icon={<PeopleIcon />} title="Total" value={total} caption="All applications" />
        <StatTile index={3} tone="blue" icon={<ClockIcon />} title="New" value={count("applied")} caption="Waiting for review" />
        <StatTile index={4} tone="mist" icon={<StarIcon />} title="Shortlisted" value={count("shortlisted")} caption="Moving forward" />
        <StatTile index={5} tone="violet" icon={<TrophyIcon />} title="Selected" value={count("selected")} caption="Offers made" />
      </div>

      <Panel title="All applicants" style={stagger(6)} contentClassName="space-y-5">
        <Tabs value={tab} onValueChange={(v) => setTab(String(v))}>
          <TabsList className="max-w-full justify-start overflow-x-auto [scrollbar-width:none]">
            {["all", ...STATUSES].map((v) => (
              <TabsTrigger key={v} value={v}>
                {v === "all" ? "All" : statusLabel(v)}
                <span className="opacity-60 tabular-nums">{count(v)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {visible.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">No applicants here yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-9 text-xs font-medium text-muted-foreground">Candidate</TableHead>
                <TableHead className="hidden h-9 text-xs font-medium text-muted-foreground lg:table-cell">University</TableHead>
                <TableHead className="hidden h-9 text-xs font-medium text-muted-foreground sm:table-cell">Role</TableHead>
                <TableHead className="h-9 text-xs font-medium text-muted-foreground">Status</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((a) => (
                <TableRow key={a.id} className="border-border/60">
                  <TableCell className="py-3.5">
                    <div className="flex items-center gap-3">
                      <OrgAvatar name={a.student.user_name} />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{a.student.user_name}</p>
                        <p className="truncate text-xs text-muted-foreground">{a.student.user_email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">{a.student.university?.name || "—"}</TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">{a.internship.title}</TableCell>
                  <TableCell>
                    <StatusBadge status={a.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => openDetail(a)}>
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Panel>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg rounded-[32px] p-7">
          <DialogHeader>
            <DialogTitle className="text-2xl font-medium tracking-tight">{selected?.student.user_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-1">
            <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 rounded-2xl bg-secondary p-4 text-sm">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="truncate">{selected?.student.user_email}</dd>
              <dt className="text-muted-foreground">University</dt>
              <dd>{selected?.student.university?.name || "—"}</dd>
              <dt className="text-muted-foreground">Degree</dt>
              <dd>
                {selected?.student.degree} {selected?.student.branch}
              </dd>
              <dt className="text-muted-foreground">Applied for</dt>
              <dd>{selected?.internship.title}</dd>
            </dl>
            {selected?.cover_letter && (
              <Field label="Cover letter">
                <p className="rounded-2xl bg-secondary p-4 text-sm text-muted-foreground">{selected.cover_letter}</p>
              </Field>
            )}
            <Field label="Update status">
              <Select value={newStatus} items={Object.fromEntries(STATUSES.map((s) => [s, statusLabel(s)]))} onValueChange={(v) => v && setNewStatus(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {statusLabel(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Internal notes">
              <Textarea placeholder="Notes visible only to your team…" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>
              Close
            </Button>
            <Button onClick={handleUpdate} disabled={updating}>
              {updating && <Loader2 className="animate-spin" />} Update status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
