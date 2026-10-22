import { describe, expect, it } from "vitest";
import {
  canManageTarget,
  createUserSchema,
  nextStatus,
  profileUpdateSchema,
} from "../lib/admin-rules";

describe("createUserSchema", () => {
  const valid = {
    email: "jane.doe@noblecorp.com",
    password: "Str0ngPass!",
    fullName: "Jane Doe",
    jobTitle: "Drilling Engineer",
    department: "Operations",
    role: "employee" as const,
  };

  it("accepts a complete valid account", () => {
    expect(createUserSchema.parse(valid).email).toBe("jane.doe@noblecorp.com");
  });

  it("rejects passwords shorter than 8 characters", () => {
    expect(() => createUserSchema.parse({ ...valid, password: "short" })).toThrow();
  });

  it("rejects an invalid email", () => {
    expect(() => createUserSchema.parse({ ...valid, email: "not-an-email" })).toThrow();
  });

  it("rejects a blank full name", () => {
    expect(() => createUserSchema.parse({ ...valid, fullName: "   " })).toThrow();
  });

  it("rejects an unknown role", () => {
    expect(() => createUserSchema.parse({ ...valid, role: "superuser" })).toThrow();
  });
});

describe("profileUpdateSchema", () => {
  it("requires a non-empty full name", () => {
    expect(() =>
      profileUpdateSchema.parse({ fullName: "", jobTitle: "", department: "" }),
    ).toThrow();
  });
});

describe("canManageTarget", () => {
  it("blocks an admin from managing their own account", () => {
    expect(canManageTarget("user-1", "user-1")).toBe(false);
  });

  it("allows managing a different account", () => {
    expect(canManageTarget("user-1", "user-2")).toBe(true);
  });
});

describe("nextStatus", () => {
  it("deactivates an active account", () => {
    expect(nextStatus("active")).toBe("deactivated");
  });

  it("reactivates a deactivated account", () => {
    expect(nextStatus("deactivated")).toBe("active");
  });
});
