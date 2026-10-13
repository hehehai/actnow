import { site } from "@actnow/common";
import { getRequiredEnv } from "@actnow/common/runtime-env";
import type { JSXElementConstructor, ReactElement } from "react";

// Lazy-loaded dependencies to reduce initial bundle size
let resendClient: import("resend").Resend | null = null;

async function getResendClient() {
  if (!resendClient) {
    const { Resend } = await import("resend");
    resendClient = new Resend(getRequiredEnv("RESEND_API_KEY"));
  }
  return resendClient;
}

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  renderData: ReactElement<any, string | JSXElementConstructor<any>>;
  renderOptions?: import("@react-email/render").Options;
}

export async function sendEmail({
  to,
  subject,
  renderData,
  renderOptions,
}: SendEmailOptions) {
  try {
    const { render } = await import("@react-email/render");
    const resend = await getResendClient();
    const emailHtml = await render(renderData, renderOptions);
    const from = `${site.name} <${getRequiredEnv("EMAIL_USER")}>`;

    const status = await resend.emails.send({
      from,
      to,
      subject,
      html: emailHtml,
    });
    if (status.error) {
      throw new Error(status.error.message ?? "unknown");
    }
    return status;
  } catch (err) {
    console.error("[Email] Error sending:", err);
    throw err;
  }
}

interface BatchSendEmailOptions extends Omit<
  SendEmailOptions,
  "to" | "renderData"
> {
  to: string[];
  renderData: ReactElement<any, string | JSXElementConstructor<any>>[];
}

export async function batchSendEmail({
  to,
  subject,
  renderData,
  renderOptions,
}: BatchSendEmailOptions) {
  try {
    const { render } = await import("@react-email/render");
    const resend = await getResendClient();
    const emailHtml = renderData.map((item) => render(item, renderOptions));
    const from = `${site.name} <${getRequiredEnv("EMAIL_USER")}>`;

    const mailTask = to.map(async (email, idx) => ({
      from,
      to: email,
      subject,
      html: (await emailHtml[idx])!,
    }));

    const mails = await Promise.all(mailTask);

    const status = await resend.batch.send(mails);
    if (status.error) {
      throw new Error(status.error.message ?? "unknown");
    }
    return status;
  } catch (err) {
    console.error("[Email] Error sending:", err);
    throw err;
  }
}
