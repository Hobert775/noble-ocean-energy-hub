import { createServerFn } from "@tanstack/react-start";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import {
  APP_ROLES,
  ACCOUNT_STATUSES,
  canManageTarget,
  createUserSchema,
  profileUpdateSchema,
  type AccountStatus,
  type AppRole,
} from "./admin-rules";

// Admin features run entirely as the signed-in admin (database rules + admin-only
// SQL functions), so they work on any host without the backend's secret key.

type AdminContext = {
  supabase: SupabaseClient<Database>;
  userId: string;
};

async function requireAdmin(context: AdminContext) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("Forbidden: admin role required");
}

async function logActivity(
  context: AdminContext,
  targetUserId: string | null,
  action: string,
  detail: string,
) {
  await context.supabase.from("account_activity").insert({
    actor_id: context.userId,
    target_user_id: targetUserId,
    action,
    detail,
  });
}

/** A fresh, session-less public client — used for sign-up and reset emails. */
function publicAuthClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Backend connection is not configured on this host.");
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

function parseOrigin(value: unknown): string {
  if (typeof value !== "string") throw new Error("Invalid origin");
  const url = new URL(value);
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Invalid origin");
  return url.origin;
}

export type AdminUserRow = {
  id: string;
  email: string;
  fullName: string;
  jobTitle: string;
  department: string;
  status: AccountStatus;
  roles: AppRole[];
  lastSignInAt: string | null;
  createdAt: string;
};

export const listAdminUsers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminUserRow[]> => {
    await requireAdmin(context);
    const [{ data: users, error: usersError }, { data: profiles }, { data: roles }] =
      await Promise.all([
        context.supabase.rpc("admin_list_users"),
        context.supabase.from("profiles").select("id, full_name, job_title, department, status"),
        context.supabase.from("user_roles").select("user_id, role"),
      ]);
    if (usersError) throw new Error("Could not load users");

    const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
    const rolesById = new Map<string, AppRole[]>();
    for (const r of roles ?? []) {
      const list = rolesById.get(r.user_id) ?? [];
      list.push(r.role as AppRole);
      rolesById.set(r.user_id, list);
    }

    return (users ?? []).map((u) => {
      const p = profileById.get(u.id);
      const status = ACCOUNT_STATUSES.includes(p?.status as AccountStatus)
        ? (p?.status as AccountStatus)
        : "active";
      return {
        id: u.id,
        email: u.email ?? "",
        fullName: p?.full_name ?? "",
        jobTitle: p?.job_title ?? "",
        department: p?.department ?? "",
        status,
        roles: rolesById.get(u.id) ?? [],
        lastSignInAt: u.last_sign_in_at ?? null,
        createdAt: u.created_at,
      };
    });
  });

export const createUserAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    const { origin, ...rest } = (input ?? {}) as Record<string, unknown>;
    return { ...createUserSchema.parse(rest), origin: parseOrigin(origin) };
  })
  .handler(async ({ data, context }) => {
    await requireAdmin(context);

    const { data: created, error } = await publicAuthClient().auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: data.origin,
        data: { full_name: data.fullName },
      },
    });
    if (error) throw new Error(error.message);
    // An existing email comes back as a placeholder user with no identities.
    if (!created.user || (created.user.identities ?? []).length === 0) {
      throw new Error("An account with this email already exists.");
    }

    const userId = created.user.id;
    await context.supabase
      .from("profiles")
      .update({ job_title: data.jobTitle, department: data.department })
      .eq("id", userId);
    const { error: roleError } = await context.supabase
      .from("user_roles")
      .insert({ user_id: userId, role: data.role });
    if (roleError) throw new Error("Account created, but the role could not be assigned.");
    await logActivity(context, userId, "account_created", `${data.email} (${data.role})`);

    return { id: userId };
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; role: AppRole; assign: boolean }) => {
    if (!APP_ROLES.includes(input.role)) throw new Error("Invalid role");
    return input;
  })
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    if (!canManageTarget(context.userId, data.userId)) {
      throw new Error("You cannot change your own role");
    }
    if (data.assign) {
      const { error } = await context.supabase
        .from("user_roles")
        .upsert({ user_id: data.userId, role: data.role }, { onConflict: "user_id,role", ignoreDuplicates: true });
      if (error) throw new Error("Could not assign the role");
    } else {
      const { error } = await context.supabase
        .from("user_roles")
        .delete()
        .eq("user_id", data.userId)
        .eq("role", data.role);
      if (error) throw new Error("Could not remove the role");
    }
    await logActivity(context, data.userId, data.assign ? "role_assigned" : "role_removed", data.role);
    return { ok: true };
  });

export const setUserStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; status: AccountStatus }) => {
    if (!ACCOUNT_STATUSES.includes(input.status)) throw new Error("Invalid status");
    return input;
  })
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    if (!canManageTarget(context.userId, data.userId)) {
      throw new Error("You cannot deactivate your own account");
    }
    const { error } = await context.supabase.rpc("admin_set_user_status", {
      _user_id: data.userId,
      _status: data.status,
    });
    if (error) throw new Error("Could not change the account status");
    await logActivity(
      context,
      data.userId,
      data.status === "deactivated" ? "account_deactivated" : "account_activated",
      "",
    );
    return { ok: true };
  });

export const resetUserPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; email: string; origin: string }) => ({
    userId: input.userId,
    email: String(input.email).trim(),
    origin: parseOrigin(input.origin),
  }))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { data: users } = await context.supabase.rpc("admin_list_users");
    const target = (users ?? []).find((u) => u.id === data.userId);
    if (!target?.email || target.email !== data.email) throw new Error("User not found");

    const { error } = await publicAuthClient().auth.resetPasswordForEmail(target.email, {
      redirectTo: `${data.origin}/reset-password`,
    });
    if (error) throw new Error(error.message);
    await logActivity(context, data.userId, "password_reset_sent", target.email);
    return { ok: true };
  });

export const updateUserProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; fullName: string; jobTitle: string; department: string }) => {
    const parsed = profileUpdateSchema.parse(input);
    return { userId: input.userId, ...parsed };
  })
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { error } = await context.supabase
      .from("profiles")
      .update({
        full_name: data.fullName,
        job_title: data.jobTitle,
        department: data.department,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.userId);
    if (error) throw new Error("Could not update profile");
    await logActivity(context, data.userId, "profile_updated", data.fullName);
    return { ok: true };
  });

export type ActivityRow = {
  id: string;
  actorId: string | null;
  targetUserId: string | null;
  action: string;
  detail: string;
  createdAt: string;
};

export const listAccountActivity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ActivityRow[]> => {
    await requireAdmin(context);
    const { data, error } = await context.supabase
      .from("account_activity")
      .select("id, actor_id, target_user_id, action, detail, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error("Could not load activity");
    return (data ?? []).map((row) => ({
      id: row.id,
      actorId: row.actor_id,
      targetUserId: row.target_user_id,
      action: row.action,
      detail: row.detail,
      createdAt: row.created_at,
    }));
  });
