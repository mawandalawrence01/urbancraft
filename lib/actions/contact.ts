"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { toMsisdn } from "@/lib/utils";

const schema = z.object({
  name: z.string().trim().min(2, "Tell us your name").max(120),
  phone: z.string().trim().refine((v) => toMsisdn(v) !== null, "Enter a valid Ugandan number"),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  subject: z.string().trim().max(160).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Tell us a little more — at least 10 characters").max(4000),
});

export type EnquiryState = { ok?: boolean; error?: string; fieldErrors?: Record<string, string> };

export async function submitEnquiry(_prev: EnquiryState, formData: FormData): Promise<EnquiryState> {
  // Bots fill every field they find; a real person leaves this one alone.
  if (String(formData.get("company") ?? "")) return { ok: true };

  const parsed = schema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email") ?? "",
    subject: formData.get("subject") ?? "",
    message: formData.get("message"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0] ?? "form")] ??= issue.message;
    }
    return { error: "Please check the highlighted fields.", fieldErrors };
  }

  try {
    await prisma.enquiry.create({
      data: {
        name: parsed.data.name,
        phone: toMsisdn(parsed.data.phone)!,
        email: parsed.data.email || null,
        subject: parsed.data.subject || null,
        message: parsed.data.message,
        source: String(formData.get("source") ?? "contact"),
      },
    });
    return { ok: true };
  } catch {
    return { error: "We could not send that. Please call us instead." };
  }
}
