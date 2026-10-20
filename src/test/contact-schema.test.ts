import { describe, expect, it } from "vitest";
import { contactSchema } from "@/lib/contact-schema";

const valid = { name: " Test Visitor ", email: "visitor@example.com", subject: " Inquiry ", message: "Please contact me.", website: "" };

describe("Contact submission validation", () => {
  it("accepts valid inquiries and trims fields", () => {
    expect(contactSchema.parse(valid).name).toBe("Test Visitor");
  });
  it("rejects malformed email addresses", () => {
    expect(contactSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
  });
  it.each(["name", "subject", "message"])("rejects a blank %s", (field) => {
    expect(contactSchema.safeParse({ ...valid, [field]: "   " }).success).toBe(false);
  });
  it("rejects oversized messages", () => {
    expect(contactSchema.safeParse({ ...valid, message: "a".repeat(5001) }).success).toBe(false);
  });
  it("rejects the filled spam trap", () => {
    expect(contactSchema.safeParse({ ...valid, website: "spam" }).success).toBe(false);
  });
});