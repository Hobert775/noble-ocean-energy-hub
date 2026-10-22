import { z } from "zod";

export const APP_ROLES = ["admin", "employee"] as const;
export type AppRole = (typeof APP_ROLES)[number];

export const ACCOUNT_STATUSES = ["active", "deactivated"] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export const createUserSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
  fullName: z.string().trim().min(1, "Full name is required").max(100),
  jobTitle: z.string().trim().max(100).default(""),
  department: z.string().trim().max(100).default(""),
  role: z.enum(APP_ROLES),
});

export const profileUpdateSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(100),
  jobTitle: z.string().trim().max(100).default(""),
  department: z.string().trim().max(100).default(""),
});

/** An admin must never deactivate or demote their own account. */
export function canManageTarget(actorId: string, targetUserId: string): boolean {
  return actorId !== targetUserId;
}

export function nextStatus(current: AccountStatus): AccountStatus {
  return current === "active" ? "deactivated" : "active";
}
