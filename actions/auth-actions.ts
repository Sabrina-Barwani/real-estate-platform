"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validation/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export type AuthState = { error?: string } | undefined;

const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

// There is no sign-up action anywhere in this codebase, intentionally.
// The single admin account is created once, directly in the Supabase dashboard.
//
// Rate limiting note: checkRateLimit() uses Upstash (persistent, correct
// across serverless instances) if UPSTASH_REDIS_REST_URL/TOKEN are set in
// the environment, and otherwise falls back to an in-memory counter that
// is only a basic deterrent — see lib/rate-limit.ts for the full
// explanation of that limitation.
export async function signIn(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const ip = headers().get("x-forwarded-for") ?? "unknown";
  const rateLimit = await checkRateLimit(`login:${ip}`, MAX_LOGIN_ATTEMPTS, LOGIN_WINDOW_MS);
  if (!rateLimit.allowed) {
    return {
      error: `Too many attempts. Try again in about ${Math.ceil((rateLimit.retryAfterSeconds ?? 60) / 60)} minute(s).`,
    };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Enter a valid email and password (8+ characters)." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    // Deliberately generic — never reveal whether the email exists.
    return { error: "Invalid email or password." };
  }

  redirect("/admin");
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}