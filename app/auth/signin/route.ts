import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const form = await req.formData();
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // send back to login with an error (simple)
    const url = new URL("/login", req.url);
    url.searchParams.set("error", error.message);
    return NextResponse.redirect(url);
  }

  return NextResponse.redirect(new URL("/", req.url));
}
