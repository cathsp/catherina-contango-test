export type ValidationResponse =
  | { ok: true; id: number }
  | { ok: false; errors: Record<string, string> };
