"use client";

import { useAuth } from "@/contexts/auth-context";
import { getUniversityStats } from "@/lib/api";
import { demoUniversity, isEmptyUniversity, type UniversityStats } from "@/lib/demo";
import { useDashboardData } from "@/lib/use-dashboard-data";
import { BuildingsIcon, GraduateIcon, InternshipsIcon, TrophyIcon } from "@/components/icons";
import { SegBars, DashboardSkeleton, HeroCard, GreetingHeader, Panel, ProgressBar, StatTile, stagger } from "@/components/kit";
import { Badge } from "@/components/ui/badge";

export default function UniversityDashboard() {
  const { user } = useAuth();
  const { data: stats, loading, isDemo } = useDashboardData<UniversityStats>(getUniversityStats, demoUniversity, isEmptyUniversity);

  if (loading) return <DashboardSkeleton />;

  const firstName = user?.first_name || user?.username || "there";
  const fullName = user?.full_name || user?.username || "University";
  const rate = stats?.placement_rate ?? 0;
  const skills = (stats?.top_skills ?? []).map((s) => ({ label: s.skill__name, value: s.count }));

  return (
    <div className="space-y-8">
      <GreetingHeader
        name={firstName}
        subtitle="Placement and skills overview across the platform."
        demo={isDemo}
      />

      <div className="grid gap-5 lg:grid-cols-12">
        <HeroCard
          className="lg:col-span-5"
          name={fullName}
          role="University"
          title="Placements"
          kicker="Students placed:"
          value={String(stats?.total_placements ?? 0)}
          progress={{ label: "Placement rate", value: rate }}
          nextLabel="Browse internships"
          nextHref="/internships"
        />
        <Panel className="lg:col-span-7" title="Top skills across students" style={stagger(1)} action={<Badge variant="violet">Top 10</Badge>}>
          <SegBars data={skills.slice(0, 6)} emptyText="Skill data appears as students add skills" />
        </Panel>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile index={2} tone="sage" icon={<GraduateIcon />} title="Students" value={stats?.total_students ?? 0} caption="On the platform" />
        <StatTile index={3} tone="blue" icon={<InternshipsIcon />} title="Internships" value={stats?.total_published_internships ?? 0} pill={{ text: "Live", variant: "lime" }} caption="Published now" />
        <StatTile index={4} tone="violet" icon={<TrophyIcon />} title="Placements" value={stats?.total_placements ?? 0} caption="Students selected" />
        <StatTile index={5} tone="mist" icon={<BuildingsIcon />} title="Companies" value={stats?.verified_companies ?? 0} caption="Verified recruiters" />
      </div>

      <Panel title="Placement snapshot" style={stagger(6)} contentClassName="grid items-center gap-8 md:grid-cols-[1fr_auto]">
        <ProgressBar label="Selected ÷ total applications" value={rate} track="muted" />
        <dl className="grid grid-cols-2 gap-8 text-sm">
          <div>
            <dt className="text-muted-foreground">Applications</dt>
            <dd className="mt-1 text-[2rem] leading-none font-light tracking-tight tabular-nums">{stats?.total_applications ?? 0}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Placed</dt>
            <dd className="mt-1 text-[2rem] leading-none font-light tracking-tight tabular-nums">{stats?.total_placements ?? 0}</dd>
          </div>
        </dl>
      </Panel>
    </div>
  );
}
