"use client";

export default function LoginForm() {
  return (
    <form action="/auth/signin" method="post" className="space-y-3">
      <input
        className="w-full border rounded p-2"
        name="email"
        placeholder="you@company.com"
        type="email"
        required
      />
      <input
        className="w-full border rounded p-2"
        name="password"
        placeholder="Password"
        type="password"
        required
      />
      <button className="w-full border rounded p-2" type="submit">
        Sign in
      </button>
    </form>
  );
}
