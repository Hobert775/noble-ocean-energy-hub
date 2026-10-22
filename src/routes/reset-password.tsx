import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { meta } from "../components/Site";

export const Route = createFileRoute("/reset-password")({
  head: () =>
    meta(
      "Set a new password — Noble Corporation plc",
      "Choose a new password for your Noble Corporation plc staff account.",
    ),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Recovery links arrive with type=recovery in the URL hash; the Supabase
    // client exchanges it for a recovery session automatically.
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    if (hash.get("type") === "recovery") {
      setReady(true);
      return;
    }
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setDone(true);
    setTimeout(() => navigate({ to: "/admin" }), 1500);
  }

  return (
    <section className="bg-background">
      <div className="mx-auto flex max-w-md flex-col px-6 py-24">
        <p className="eyebrow">Staff portal</p>
        <h1 className="mt-3 font-display text-4xl text-foreground">Set a new password</h1>

        {!ready && !done && (
          <p className="mt-6 text-sm text-muted-foreground">
            This page only works from a password reset link. Request a new link from the
            sign-in page.
          </p>
        )}

        {done && (
          <p className="mt-6 text-sm text-foreground">
            Your password has been updated. Taking you to the dashboard…
          </p>
        )}

        {ready && !done && (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="new-password" className="text-sm font-medium text-foreground">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="text-sm font-medium text-foreground">
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {busy ? "Updating…" : "Update password"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
