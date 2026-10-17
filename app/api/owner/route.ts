import { isOwner } from "@/lib/auth";
export async function GET() {
  return Response.json(
    { owner: await isOwner() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
