import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { meta } from "../components/Site";

export const Route = createFileRoute("/auth")({
  head: () =>
    meta(
      "Sign in — Noble Corporation plc",
      "Sign in to the Noble Corporation plc staff portal.",
    ),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "forgot" | "signup">("signin");
  const [fullName, setFullName] = useState("");

  async function handleSignUp(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName.trim() },
      },
    });
    setBusy(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    if (data.session) {
      navigate({ to: "/admin" });
      return;
    }
    setNotice("Account created. Check your email to confirm it, then sign in.");
    setPassword("");
  }
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    // Wait until the session is readable before entering the gated area,
    // otherwise the gate can bounce us back here on a slow storage write.
    let userId: string | null = null;
    for (let i = 0; i < 30; i++) {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        userId = data.session.user.id;
        break;
      }
      await new Promise((r) => setTimeout(r, 100));
    }
    if (userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("status")
        .eq("id", userId)
        .maybeSingle();
      if (profile?.status === "deactivated") {
        await supabase.auth.signOut();
        setError("This account has been deactivated. Contact your administrator.");
        return;
      }
    }
    navigate({ to: "/admin" });
  }

  async function handleForgot(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setNotice("If that email is registered, a password reset link is on its way.");
  }

  const title = mode === "signin" ? "Sign in" : mode === "signup" ? "Create an account" : "Reset your password";
  const submitLabel = mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link";
  const onSubmit = mode === "signin" ? handleSignIn : mode === "signup" ? handleSignUp : handleForgot;
  const inputCls = "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground";
  function switchTo(m: "signin" | "forgot" | "signup") {
    setMode(m);
    setError(null);
    setNotice(null);
  }

  return (
    <section className="bg-background">
      <div className="mx-auto flex max-w-md flex-col px-6 py-24">
        <p className="eyebrow">Staff portal</p>
        <h1 className="mt-3 font-display text-4xl text-foreground">{title}</h1>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          {mode === "signup" && (
            <div>
              <label htmlFor="fullName" className="text-sm font-medium text-foreground">Full name</label>
              <input id="fullName" required maxLength={100} value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} />
            </div>
          )}
          <div>
            <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
          </div>
          {mode !== "forgot" && (
            <div>
              <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
              <input id="password" type="password" required minLength={mode === "signup" ? 8 : undefined} value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
          {notice && <p className="text-sm text-foreground">{notice}</p>}

          <button type="submit" disabled={busy} className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60">
            {busy ? "Please wait…" : submitLabel}
          </button>
        </form>

        <div className="mt-4 flex flex-col items-start gap-2 text-sm text-muted-foreground">
          {mode === "signin" ? (
            <>
              <button type="button" onClick={() => switchTo("forgot")} className="underline underline-offset-4 hover:text-foreground">Forgot your password?</button>
              <button type="button" onClick={() => switchTo("signup")} className="underline underline-offset-4 hover:text-foreground">No account? Sign up</button>
            </>
          ) : (
            <button type="button" onClick={() => switchTo("signin")} className="underline underline-offset-4 hover:text-foreground">Back to sign in</button>
          )}
        </div>
      </div>
    </section>
  );
}
