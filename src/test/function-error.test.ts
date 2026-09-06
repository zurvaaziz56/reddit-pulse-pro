import { expect, it } from "vitest";
import { functionError } from "@/lib/function-error";
it("surfaces the actual server error instead of hiding Reddit blocks", async () => {
  expect(await functionError({ context: new Response(JSON.stringify({ error: "Reddit blocked this request." }), { status: 502 }) })).toBe("Reddit blocked this request.");
});
it("handles a non-JSON gateway failure", async () => {
  const error = Object.assign(new Error("Gateway unavailable"), { context: new Response("<html>error</html>") });
  expect(await functionError(error)).toBe("Gateway unavailable");
});
