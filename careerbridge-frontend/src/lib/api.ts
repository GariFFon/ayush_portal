/**
 * CareerBridge API client
 * Handles JWT token storage, refresh, and all API calls to the Django backend.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiOptions {
  method?: HttpMethod;
  body?: unknown;
  auth?: boolean;
}

function getTokens() {
  if (typeof window === "undefined") return { access: null, refresh: null };
  return {
    access: localStorage.getItem("cb_access"),
    refresh: localStorage.getItem("cb_refresh"),
  };
}

function setTokens(access: string, refresh: string) {
  localStorage.setItem("cb_access", access);
  localStorage.setItem("cb_refresh", refresh);
}

export function clearTokens() {
  localStorage.removeItem("cb_access");
  localStorage.removeItem("cb_refresh");
}

async function refreshAccessToken(): Promise<string | null> {
  const { refresh } = getTokens();
  if (!refresh) return null;
  const res = await fetch(`${API_BASE}/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) {
    clearTokens();
    return null;
  }
  const data = await res.json();
  localStorage.setItem("cb_access", data.access);
  return data.access;
}

export async function apiFetch<T = unknown>(
  path: string,
  { method = "GET", body, auth = true }: ApiOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth) {
    let { access } = getTokens();
    if (!access) {
      access = await refreshAccessToken();
    }
    if (access) {
      headers["Authorization"] = `Bearer ${access}`;
    }
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // If 401, try refresh once
  if (res.status === 401 && auth) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      headers["Authorization"] = `Bearer ${newAccess}`;
      const retried = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!retried.ok) throw new Error(await retried.text());
      return retried.json() as Promise<T>;
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return {} as T;
  return res.json() as Promise<T>;
}

// ── Auth ──────────────────────────────────────────────────────────────────
export async function login(username: string, password: string) {
  const data = await apiFetch<{ access: string; refresh: string }>(
    "/token/",
    { method: "POST", body: { username, password }, auth: false }
  );
  setTokens(data.access, data.refresh);
  return data;
}

export async function register(payload: {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  password: string;
  password2: string;
}) {
  return apiFetch("/accounts/register/", { method: "POST", body: payload, auth: false });
}

export async function getMe() {
  return apiFetch("/accounts/me/");
}

// ── Internships ───────────────────────────────────────────────────────────
export async function getInternships(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return apiFetch(`/internships/${query}`, { auth: false });
}

export async function getInternship(id: number) {
  return apiFetch(`/internships/${id}/`, { auth: false });
}

export async function getSkillMatch(internshipId: number) {
  return apiFetch(`/internships/${internshipId}/match/`);
}

export async function getSkills(search?: string) {
  const q = search ? `?search=${search}` : "";
  return apiFetch(`/internships/skills/${q}`, { auth: false });
}

// ── Student ───────────────────────────────────────────────────────────────
export async function getStudentProfile() {
  return apiFetch("/institutions/student-profile/");
}

export async function updateStudentProfile(data: Record<string, unknown>) {
  return apiFetch("/institutions/student-profile/", { method: "PATCH", body: data });
}

export async function getStudentSkills() {
  return apiFetch("/internships/student-skills/");
}

export async function addStudentSkill(skillId: number, proficiency: string) {
  return apiFetch("/internships/student-skills/", {
    method: "POST",
    body: { skill_id: skillId, proficiency },
  });
}

export async function deleteStudentSkill(id: number) {
  return apiFetch(`/internships/student-skills/${id}/`, { method: "DELETE" });
}

// ── Applications ──────────────────────────────────────────────────────────
export async function getMyApplications() {
  return apiFetch("/applications/");
}

export async function applyToInternship(internshipId: number, coverLetter: string) {
  return apiFetch("/applications/", {
    method: "POST",
    body: { internship_id: internshipId, cover_letter: coverLetter },
  });
}

export async function withdrawApplication(id: number) {
  return apiFetch(`/applications/${id}/withdraw/`, { method: "DELETE" });
}

// ── Recruiter ─────────────────────────────────────────────────────────────
export async function getRecruiterApplications(internshipId?: number) {
  const q = internshipId ? `?internship=${internshipId}` : "";
  return apiFetch(`/applications/recruiter/${q}`);
}

export async function updateApplicationStatus(id: number, status: string, notes?: string) {
  return apiFetch(`/applications/recruiter/${id}/status/`, {
    method: "PATCH",
    body: { status, recruiter_notes: notes },
  });
}

export async function getMyInternships() {
  return apiFetch("/internships/my/");
}

export async function createInternship(data: Record<string, unknown>) {
  return apiFetch("/internships/my/", { method: "POST", body: data });
}

// ── Analytics ─────────────────────────────────────────────────────────────
export async function getStudentStats() {
  return apiFetch("/analytics/student/");
}

export async function getCompanyStats() {
  return apiFetch("/analytics/company/");
}

export async function getUniversityStats() {
  return apiFetch("/analytics/university/");
}

// ── Institutions ──────────────────────────────────────────────────────────
export async function getUniversities() {
  return apiFetch("/institutions/universities/", { auth: false });
}

export async function getCompanies() {
  return apiFetch("/institutions/companies/", { auth: false });
}
