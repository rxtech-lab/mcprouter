import { Resend } from "resend";
import { render } from "@react-email/render";
import VerificationEmail from "./emails/VerificationEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  email: string,
  verificationUrl: string
) {
  if (process.env.NODE_ENV === "test") {
    console.log(
      `[TEST MODE] Skipping email send to ${email} with URL: ${verificationUrl}`
    );
    return { id: "test-email-id" };
  }

  try {
    const emailHtml = await render(VerificationEmail({ verificationUrl }));

    const { data, error } = await resend.emails.send({
      from: process.env.AUTH_RESEND_FROM || "onboarding@resend.dev",
      to: [email],
      subject: "Verify your email address",
      html: emailHtml,
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error(`Failed to send verification email: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Email sending error:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to send verification email: ${error.message}`);
    }
    throw new Error("Failed to send verification email");
  }
}
