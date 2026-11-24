import { liveRunStatus } from "@/lib/live";

export const dynamic = "force-dynamic";

export function GET(req: Request) {
  // Returns only booleans and a reason string; never the key or its length.
  return Response.json(liveRunStatus(req.headers.get("host")), { headers: { "Cache-Control": "no-store" } });
}
