"use client";

import { createClient } from "@supabase/supabase-js";
import { useState } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function update(e: React.FormEvent) {
    e.preventDefault();
    setDone(null);
    setErr(null);

    const { error } = await supabase.auth.updateUser({ password });
    if (error) return setErr(error.message);

    setDone("Password updated. You can go back to the dashboard.");
    window.location.href = "/";
  }

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Set a new password</h1>

      <form onSubmit={update} className="space-y-3">
        <input
          className="w-full border rounded p-2"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
        />
        <button className="w-full border rounded p-2" type="submit">
          Update password
        </button>
      </form>

      {done && <p className="mt-3 text-sm text-green-700">{done}</p>}
      {err && <pre className="mt-3 text-sm text-red-600">{err}</pre>}
    </main>
  );
}
