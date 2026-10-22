import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  createUserAccount,
  listAccountActivity,
  listAdminUsers,
  resetUserPassword,
  setUserRole,
  setUserStatus,
  updateUserProfile,
  type AdminUserRow,
} from "@/lib/admin.functions";
import { createUserSchema, nextStatus, type AppRole } from "@/lib/admin-rules";
import { meta } from "../../components/Site";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () =>
    meta(
      "Admin — User Management — Noble Corporation plc",
      "Manage staff accounts, roles, and access for Noble Corporation plc.",
    ),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const fetchUsers = useServerFn(listAdminUsers);
  const fetchActivity = useServerFn(listAccountActivity);

  // Confirm the signed-in user actually holds the admin role before showing data.
  useState(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        navigate({ to: "/auth", replace: true });
        return;
      }
      setCurrentUserId(data.user.id);
      const { data: roleRows } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);
      setIsAdmin((roleRows ?? []).some((r) => r.role === "admin"));
    });
  });

  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => fetchUsers(),
    enabled: isAdmin === true,
  });
  const activityQuery = useQuery({
    queryKey: ["admin-activity"],
    queryFn: () => fetchActivity(),
    enabled: isAdmin === true,
  });

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    queryClient.invalidateQueries({ queryKey: ["admin-activity"] });
  }

  if (isAdmin === null) {
    return (
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-6 py-24 text-sm text-muted-foreground">
          Checking access…
        </div>
      </section>
    );
  }

  if (isAdmin === false) {
    return (
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <h1 className="font-display text-3xl text-foreground">No access</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            This area is limited to administrators. If you believe this is a mistake, contact
            your administrator.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <p className="eyebrow">Administration</p>
        <h1 className="mt-3 font-display text-4xl text-foreground">User management</h1>

        <CreateAccountCard onCreated={refresh} />

        <div className="mt-12">
          <h2 className="font-display text-2xl text-foreground">Accounts</h2>
          {usersQuery.isLoading && (
            <p className="mt-4 text-sm text-muted-foreground">Loading accounts…</p>
          )}
          {usersQuery.error && (
            <p className="mt-4 text-sm text-destructive">Could not load accounts.</p>
          )}
          {usersQuery.data && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-3 pr-4">Name</th>
                    <th className="py-3 pr-4">Email</th>
                    <th className="py-3 pr-4">Role</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Last sign-in</th>
                    <th className="py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersQuery.data.map((u) => (
                    <UserRow
                      key={u.id}
                      user={u}
                      isSelf={u.id === currentUserId}
                      onChanged={refresh}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-12">
          <h2 className="font-display text-2xl text-foreground">Recent account activity</h2>
          {activityQuery.data && activityQuery.data.length === 0 && (
            <p className="mt-4 text-sm text-muted-foreground">No activity recorded yet.</p>
          )}
          {activityQuery.data && activityQuery.data.length > 0 && (
            <ul className="mt-4 space-y-2 text-sm">
              {activityQuery.data.map((a) => (
                <li
                  key={a.id}
                  className="flex flex-wrap items-baseline gap-2 rounded-md border border-border px-4 py-3"
                >
                  <span className="font-medium text-foreground">{a.action.replaceAll("_", " ")}</span>
                  {a.detail && <span className="text-muted-foreground">{a.detail}</span>}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {new Date(a.createdAt).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function CreateAccountCard({ onCreated }: { onCreated: () => void }) {
  const createFn = useServerFn(createUserAccount);
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    jobTitle: "",
    department: "",
    role: "employee" as AppRole,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    const parsed = createUserSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form and try again.");
      return;
    }
    setBusy(true);
    try {
      await createFn({ data: parsed.data });
      setNotice(`Account created for ${parsed.data.email}.`);
      setForm({ email: "", password: "", fullName: "", jobTitle: "", department: "", role: "employee" });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the account.");
    } finally {
      setBusy(false);
    }
  }

  const inputCls =
    "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground";

  return (
    <div className="mt-8 rounded-lg border border-border p-6">
      <h2 className="font-display text-2xl text-foreground">Create an account</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        New accounts can sign in immediately with the password you set.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="cu-name" className="text-sm font-medium text-foreground">Full name</label>
          <input id="cu-name" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className={inputCls} />
        </div>
        <div>
          <label htmlFor="cu-email" className="text-sm font-medium text-foreground">Email</label>
          <input id="cu-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
        </div>
        <div>
          <label htmlFor="cu-password" className="text-sm font-medium text-foreground">Temporary password</label>
          <input id="cu-password" type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputCls} />
        </div>
        <div>
          <label htmlFor="cu-role" className="text-sm font-medium text-foreground">Role</label>
          <select id="cu-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as AppRole })} className={inputCls}>
            <option value="employee">Employee</option>
            <option value="admin">Administrator</option>
          </select>
        </div>
        <div>
          <label htmlFor="cu-title" className="text-sm font-medium text-foreground">Job title</label>
          <input id="cu-title" value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} className={inputCls} />
        </div>
        <div>
          <label htmlFor="cu-dept" className="text-sm font-medium text-foreground">Department</label>
          <input id="cu-dept" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className={inputCls} />
        </div>
        {error && <p className="text-sm text-destructive md:col-span-2">{error}</p>}
        {notice && <p className="text-sm text-foreground md:col-span-2">{notice}</p>}
        <div className="md:col-span-2">
          <button type="submit" disabled={busy} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60">
            {busy ? "Creating…" : "Create account"}
          </button>
        </div>
      </form>
    </div>
  );
}

function UserRow({
  user,
  isSelf,
  onChanged,
}: {
  user: AdminUserRow;
  isSelf: boolean;
  onChanged: () => void;
}) {
  const roleFn = useServerFn(setUserRole);
  const statusFn = useServerFn(setUserStatus);
  const resetFn = useServerFn(resetUserPassword);
  const profileFn = useServerFn(updateUserProfile);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetLink, setResetLink] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    fullName: user.fullName,
    jobTitle: user.jobTitle,
    department: user.department,
  });

  const isAdminUser = user.roles.includes("admin");

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  }

  const btnCls =
    "rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50";

  return (
    <>
      <tr className="border-b border-border align-top">
        <td className="py-3 pr-4">
          <p className="font-medium text-foreground">{user.fullName || "—"}</p>
          <p className="text-xs text-muted-foreground">
            {[user.jobTitle, user.department].filter(Boolean).join(" · ")}
          </p>
        </td>
        <td className="py-3 pr-4 text-muted-foreground">{user.email}</td>
        <td className="py-3 pr-4">
          {user.roles.length > 0 ? user.roles.join(", ") : <span className="text-muted-foreground">none</span>}
        </td>
        <td className="py-3 pr-4">
          <span className={user.status === "active" ? "text-foreground" : "text-destructive"}>
            {user.status}
          </span>
        </td>
        <td className="py-3 pr-4 text-muted-foreground">
          {user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleString() : "Never"}
        </td>
        <td className="py-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy || isSelf}
              title={isSelf ? "You cannot change your own role" : undefined}
              onClick={() => run(() => roleFn({ data: { userId: user.id, role: "admin", assign: !isAdminUser } }))}
              className={btnCls}
            >
              {isAdminUser ? "Remove admin" : "Make admin"}
            </button>
            <button
              type="button"
              disabled={busy || isSelf}
              title={isSelf ? "You cannot deactivate your own account" : undefined}
              onClick={() => run(() => statusFn({ data: { userId: user.id, status: nextStatus(user.status) } }))}
              className={btnCls}
            >
              {user.status === "active" ? "Deactivate" : "Activate"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                run(async () => {
                  const res = await resetFn({ data: { userId: user.id } });
                  setResetLink(res.recoveryLink);
                })
              }
              className={btnCls}
            >
              Reset password
            </button>
            <button type="button" disabled={busy} onClick={() => setEditing(!editing)} className={btnCls}>
              {editing ? "Cancel" : "Edit profile"}
            </button>
          </div>
          {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
          {resetLink && (
            <p className="mt-2 max-w-xs break-all text-xs text-muted-foreground">
              Share this one-time reset link with the user:{" "}
              <a href={resetLink} className="underline">{resetLink}</a>
            </p>
          )}
        </td>
      </tr>
      {editing && (
        <tr className="border-b border-border">
          <td colSpan={6} className="py-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                run(async () => {
                  await profileFn({ data: { userId: user.id, ...draft } });
                  setEditing(false);
                });
              }}
              className="grid gap-3 md:grid-cols-4"
            >
              <input
                aria-label="Full name"
                required
                value={draft.fullName}
                onChange={(e) => setDraft({ ...draft, fullName: e.target.value })}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              />
              <input
                aria-label="Job title"
                placeholder="Job title"
                value={draft.jobTitle}
                onChange={(e) => setDraft({ ...draft, jobTitle: e.target.value })}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              />
              <input
                aria-label="Department"
                placeholder="Department"
                value={draft.department}
                onChange={(e) => setDraft({ ...draft, department: e.target.value })}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              />
              <button type="submit" disabled={busy} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
                Save
              </button>
            </form>
          </td>
        </tr>
      )}
    </>
  );
}
