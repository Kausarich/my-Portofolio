import { handlers } from "@/lib/auth";
import type { NextRequest } from "next/server";
export const POST = handlers.POST;
export async function GET(request: NextRequest) {
  if (/\/(signin|signout)$/.test(new URL(request.url).pathname))
    return new Response("Not found", { status: 404 });
  return handlers.GET(request);
}
