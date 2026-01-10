"use client";

import { createClient } from "@supabase/supabase-js";
import { useState } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-2">Sign in</h1>
      <p className="text-sm text-gray-600 mb-4">
        We’ll email you a secure sign-in link / code.
      </p>

      <form onSubmit={sendLink} className="space-y-3">
        <input
          className="w-full border rounded p-2"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />
        <button className="w-full border rounded p-2" type="submit">
          Send sign-in link
        </button>
      </form>

      {sent && <p className="mt-3 text-sm">Check your email to sign in.</p>}
      {error && <pre className="mt-3 text-sm text-red-600">{error}</pre>}
    </main>
  );
}
