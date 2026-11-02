"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/auth-context";
import { AuthShell } from "@/components/auth-shell";
import { Field } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.username, form.password);
      toast.success("Welcome back");
      router.push("/dashboard");
    } catch {
      toast.error("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your CareerBridge account."
      footer={
        <>
          New here?{" "}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Username">
          <Input id="username" placeholder="your_username" autoComplete="username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        </Field>
        <Field label="Password">
          <Input id="password" type="password" placeholder="••••••••" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </Field>
        <Button type="submit" size="lg" disabled={loading} className="w-full">
          {loading && <Loader2 className="animate-spin" />}
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}
