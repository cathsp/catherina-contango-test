import fetch from "node-fetch";

export type ValidationResult =
  | { ok: true }
  | { ok: false; errors: Record<string, string> };

export async function validateWithAIOrLocal(fields: Record<string, string>, pdfText: string): Promise<ValidationResult> {
  const webhook = process.env.AI_WEBHOOK_URL?.trim();
  if (webhook) {
    try {
      const resp = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields, pdfText }),
      });
      if (!resp.ok) {
        const text = await resp.text();
        return { ok: false, errors: { ai: `Webhook error: ${resp.status} ${text}` } };
      }
      const data = (await resp.json()) as ValidationResult;
      return data;
    } catch (e: any) {
      return { ok: false, errors: { ai: `Webhook failed: ${e.message}` } };
    }
  }

  // Local naive validation: ensure each non-empty field (except skills/experience) appears in the PDF text (case-insensitive)
  const errors: Record<string, string> = {};
  const hay = (pdfText || "").toLowerCase();
  for (const [k, v] of Object.entries(fields)) {
    if (!v) continue;
    if (["skills", "experience"].includes(k)) continue; // free-text; skip strict matching
    if (!hay.includes(v.toLowerCase())) {
      errors[k] = "Not found in PDF text";
    }
  }
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true };
}
