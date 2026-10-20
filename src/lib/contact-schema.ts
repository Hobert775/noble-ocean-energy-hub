import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(100, "Name must be 100 characters or fewer."),
  email: z.string().trim().email("Enter a valid email address.").max(255),
  subject: z.string().trim().min(1, "Enter a subject.").max(150, "Subject must be 150 characters or fewer."),
  message: z.string().trim().min(1, "Enter your message.").max(5000, "Message must be 5,000 characters or fewer."),
  website: z.string().max(0, "Unable to submit this message.").optional(),
});