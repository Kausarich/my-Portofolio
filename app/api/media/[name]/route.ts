import { readFile } from "node:fs/promises";
import path from "node:path";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  if (!/^[a-f0-9-]{36}\.(jpg|png|webp|pdf)$/.test(name))
    return new Response("Not found", { status: 404 });
  try {
    const file = await readFile(
      path.join(process.cwd(), ".data", "media", name),
    );
    const mime: Record<string, string> = {
      jpg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      pdf: "application/pdf",
    };
    return new Response(file, {
      headers: {
        "Content-Type": mime[name.split(".").pop()!],
        "Content-Disposition": `inline; filename="${name}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
