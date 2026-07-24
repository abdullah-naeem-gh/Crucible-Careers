interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendTransactionalEmail(input: SendEmailInput): Promise<string | null> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Transactional email is not configured.");
    }
    console.info(`[email:dev] ${input.subject} -> ${Array.isArray(input.to) ? input.to.join(", ") : input.to}`);
    return null;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, ...input }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.message || "Email delivery failed.");
  return body.id ?? null;
}

export function companyInvitationEmail(input: {
  companyName: string;
  inviterName: string;
  acceptUrl: string;
  role: "admin" | "recruiter";
}) {
  return {
    subject: `Join ${input.companyName} on Crucible Careers`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#202020">
        <h1 style="font-size:24px">You’re invited to ${input.companyName}</h1>
        <p>${input.inviterName} invited you to join as ${input.role}.</p>
        <p><a href="${input.acceptUrl}" style="display:inline-block;background:#ff6b00;color:white;padding:12px 18px;border-radius:10px;text-decoration:none">Accept invitation</a></p>
        <p style="color:#666;font-size:13px">This single-use invitation expires in 7 days and must be accepted with the invited email address.</p>
      </div>
    `,
  };
}
