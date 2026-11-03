"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/auth-context";
import { AuthShell } from "@/components/auth-shell";
import { Field } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    role: params.get("role") || "student",
    gender: "",
    password: "",
    password2: "",
  });

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password2) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await register(form as Parameters<typeof register>[0]);
      toast.success("Account created — please sign in.");
      router.push("/login");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join CareerBridge in under a minute."
      footer={
        <>
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="First name">
            <Input id="first_name" placeholder="Arjun" value={form.first_name} onChange={(e) => set("first_name", e.target.value)} required />
          </Field>
          <Field label="Last name">
            <Input id="last_name" placeholder="Sharma" value={form.last_name} onChange={(e) => set("last_name", e.target.value)} required />
          </Field>
        </div>
        <Field label="Username">
          <Input id="username" placeholder="arjun_sharma" value={form.username} onChange={(e) => set("username", e.target.value)} required />
        </Field>
        <Field label="Email">
          <Input id="email" type="email" placeholder="arjun@example.com" value={form.email} onChange={(e) => set("email", e.target.value)} required />
        </Field>
        <Field label="I am a…">
          <Select value={form.role} items={{ student: "Student", company: "Company recruiter", university: "University representative" }} onValueChange={(v) => v && set("role", v)}>
            <SelectTrigger id="role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="company">Company recruiter</SelectItem>
              <SelectItem value="university">University representative</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Gender">
          <Select value={form.gender} items={{ male: "Male", female: "Female", other: "Prefer not to say" }} onValueChange={(v) => v && set("gender", v)}>
            <SelectTrigger id="gender">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Password">
            <Input id="password" type="password" placeholder="Min. 8 characters" value={form.password} onChange={(e) => set("password", e.target.value)} required minLength={8} />
          </Field>
          <Field label="Confirm">
            <Input id="password2" type="password" placeholder="Repeat" value={form.password2} onChange={(e) => set("password2", e.target.value)} required />
          </Field>
        </div>
        <Button type="submit" size="lg" disabled={loading} className="w-full">
          {loading && <Loader2 className="animate-spin" />}
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
