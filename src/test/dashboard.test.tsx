import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ invoke: vi.fn(), toast: vi.fn(), invalidate: vi.fn(), keywords: [] as { id: string; keyword: string }[] }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { functions: { invoke: mocks.invoke } } }));
vi.mock("@/hooks/use-dashboard-data", () => ({ useKeywords: () => ({ data: mocks.keywords }), useRedditPosts: () => ({ data: [] }) }));
vi.mock("@tanstack/react-query", () => ({ useQueryClient: () => ({ invalidateQueries: mocks.invalidate }) }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: mocks.toast }) }));
vi.mock("@/components/dashboard/TrendingPostsPanel", () => ({ default: () => <div>Posts panel</div> }));
vi.mock("@/components/dashboard/InsightsPanel", () => ({ default: () => <div>Insights panel</div> }));
import DashboardHome from "@/pages/dashboard/DashboardHome";
beforeEach(() => { vi.clearAllMocks(); mocks.keywords = []; });
afterEach(cleanup);
it("guides a new account to add a keyword instead of showing fake research", () => {
  render(<MemoryRouter><DashboardHome/></MemoryRouter>);
  expect(screen.getByRole("link", { name: "Add a keyword" })).toHaveAttribute("href", "/dashboard/keywords");
  expect(screen.queryByText("Posts panel")).not.toBeInTheDocument();
});
it("sends only the selected keyword and displays the server's actual failure", async () => {
  mocks.keywords = [{ id: "keyword-a", keyword: "planning" }];
  mocks.invoke.mockResolvedValue({ error: { context: new Response(JSON.stringify({ error: "Reddit blocked this request." }), { status: 502 }) } });
  render(<MemoryRouter><DashboardHome/></MemoryRouter>);
  expect(screen.getByRole("button", { name: "Generate Insights" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Fetch Posts" }));
  await waitFor(() => expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ description: "Reddit blocked this request.", variant: "destructive" })));
  expect(mocks.invoke).toHaveBeenCalledWith("fetch-reddit", { body: { keywordId: "keyword-a" } });
  expect(mocks.invalidate).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: "Fetch Posts" })).toBeEnabled();
});
