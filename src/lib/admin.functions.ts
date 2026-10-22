import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  APP_ROLES,
  ACCOUNT_STATUSES,
  canManageTarget,
  createUserSchema,
  profileUpdateSchema,
  type AccountStatus,
  type AppRole,
} from "./admin-rules";

type AdminContext = {
  supabase: {
    rpc: (
      fn: string,
      args: Record<string, unknown>,
    ) => Promise<{ data: unknown; error: unknown }>;
  };
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
  actorId: string,
  targetUserId: string | null,
  action: string,
  detail: string,
) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.from("account_activity").insert({
    actor_id: actorId,
    target_user_id: targetUserId,
    action,
    detail,
  });
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ data: usersData, error: usersError }, { data: profiles }, { data: roles }] =
      await Promise.all([
        supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
        supabaseAdmin.from("profiles").select("id, full_name, job_title, department, status"),
        supabaseAdmin.from("user_roles").select("user_id, role"),
      ]);
    if (usersError) throw new Error("Could not load users");

    const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
    const rolesById = new Map<string, AppRole[]>();
    for (const r of roles ?? []) {
      const list = rolesById.get(r.user_id) ?? [];
      list.push(r.role as AppRole);
      rolesById.set(r.user_id, list);
    }

    return usersData.users.map((u) => {
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
  .inputValidator((input: unknown) => createUserSchema.parse(input))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName },
    });
    if (error || !created.user) throw new Error(error?.message ?? "Could not create account");

    const userId = created.user.id;
    await supabaseAdmin
      .from("profiles")
      .update({ job_title: data.jobTitle, department: data.department })
      .eq("id", userId);
    await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: data.role });
    await logActivity(context.userId, userId, "account_created", `${data.email} (${data.role})`);

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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.assign) {
      await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: data.userId, role: data.role }, { onConflict: "user_id,role" });
    } else {
      await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", data.userId)
        .eq("role", data.role);
    }
    await logActivity(
      context.userId,
      data.userId,
      data.assign ? "role_assigned" : "role_removed",
      data.role,
    );
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    await supabaseAdmin
      .from("profiles")
      .update({ status: data.status, updated_at: new Date().toISOString() })
      .eq("id", data.userId);
    // Banning blocks sign-in; "none" lifts the ban.
    await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      ban_duration: data.status === "deactivated" ? "876000h" : "none",
    });
    await logActivity(
      context.userId,
      data.userId,
      data.status === "deactivated" ? "account_deactivated" : "account_activated",
      "",
    );
    return { ok: true };
  });

export const resetUserPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string }) => input)
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(
      data.userId,
    );
    if (userError || !userData.user?.email) throw new Error("User not found");

    const { data: linkData, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: userData.user.email,
    });
    if (error || !linkData.properties?.action_link) {
      throw new Error("Could not generate a reset link");
    }
    await logActivity(context.userId, data.userId, "password_reset_generated", userData.user.email);
    return { recoveryLink: linkData.properties.action_link };
  });

export const updateUserProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; fullName: string; jobTitle: string; department: string }) => {
    const parsed = profileUpdateSchema.parse(input);
    return { userId: input.userId, ...parsed };
  })
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({
        full_name: data.fullName,
        job_title: data.jobTitle,
        department: data.department,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.userId);
    if (error) throw new Error("Could not update profile");
    await logActivity(context.userId, data.userId, "profile_updated", data.fullName);
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data, error } = await supabaseAdmin
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
