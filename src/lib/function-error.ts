export async function functionError(error: unknown): Promise<string> {
  const context = (error as { context?: Response })?.context;
  if (context instanceof Response) {
    try { const body = await context.clone().json(); if (typeof body.error === "string") return body.error; } catch { /* Use the SDK error below. */ }
  }
  return error instanceof Error ? error.message : "The request failed. Please try again.";
}
export const billingEnabled = import.meta.env.VITE_ENABLE_BILLING === "true";
