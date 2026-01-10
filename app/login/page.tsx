"use client";

import { createClient } from "@supabase/supabase-js";
import { useState } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setErr(error.message);

    window.location.href = "/";
  }

  async function forgotPassword() {
    setMsg(null);
    setErr(null);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/reset-password`,
    });

    if (error) return setErr(error.message);
    setMsg("Password reset email sent (if the address exists).");
  }

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>

      <form onSubmit={signIn} className="space-y-3">
        <input
          className="w-full border rounded p-2"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />
        <input
          className="w-full border rounded p-2"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
        />

        <button className="w-full border rounded p-2" type="submit">
          Sign in
        </button>
      </form>

      <button
        className="mt-3 text-sm underline"
        onClick={forgotPassword}
        disabled={!email}
        title={!email ? "Enter your email first" : "Send reset email"}
      >
        Forgot password?
      </button>

      {msg && <p className="mt-3 text-sm text-green-700">{msg}</p>}
      {err && <pre className="mt-3 text-sm text-red-600">{err}</pre>}
    </main>
  );
}
