"use server";

import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(4, "Subject must be at least 4 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function submitContactForm(formData: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  // Validate request body
  const validation = contactSchema.safeParse(formData);

  if (!validation.success) {
    const errorMsg = validation.error.issues[0]?.message || "Validation failed";
    throw new Error(errorMsg);
  }

  // Log contact submission internally (could also save to a DB or send email/webhook notifications)
  console.log("================ CONTACT FORM SUBMISSION ==================");
  console.log("Name:    ", formData.name);
  console.log("Email:   ", formData.email);
  console.log("Subject: ", formData.subject);
  console.log("Message: ", formData.message);
  console.log("===========================================================");

  // Artificially delay a tiny bit for realistic UX loaders
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    success: true,
    message: "Thank you for getting in touch! Our team will get back to you shortly.",
  };
}
