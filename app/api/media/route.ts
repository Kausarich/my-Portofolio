import { isOwner } from "@/lib/auth";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!(await isOwner()))
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  let sameOrigin = false;
  try {
    const parsed = new URL(origin ?? "");
    sameOrigin = ["https:", "http:"].includes(parsed.protocol) && parsed.host === host;
  } catch { /* Missing or malformed origins are rejected. */ }
  if (!sameOrigin)
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  if (Number(request.headers.get("content-length")) > 9 * 1024 * 1024)
    return Response.json(
      { error: "Maximum file size is 8 MB" },
      { status: 413 },
    );
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size > 8 * 1024 * 1024 || !file.size)
      return Response.json(
        { error: "Choose a file under 8 MB" },
        { status: 400 },
      );
    const bytes = Buffer.from(await file.arrayBuffer());
    const detected =
      bytes.subarray(0, 5).toString() === "%PDF-"
        ? "pdf"
        : bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
          ? "jpg"
          : bytes.subarray(0, 8).toString("hex") === "89504e470d0a1a0a"
            ? "png"
            : bytes.subarray(0, 4).toString() === "RIFF" &&
                bytes.subarray(8, 12).toString() === "WEBP"
              ? "webp"
              : null;
    const mime: Record<string, string> = {
      pdf: "application/pdf",
      jpg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
    };
    if (!detected || file.type !== mime[detected])
      return Response.json(
        { error: "Only valid PDF, JPG, PNG and WebP files are accepted" },
        { status: 400 },
      );
    const cloud = process.env.CLOUDINARY_CLOUD_NAME,
      key = process.env.CLOUDINARY_API_KEY,
      secret = process.env.CLOUDINARY_API_SECRET;
    if (cloud && key && secret) {
      const timestamp = String(Math.floor(Date.now() / 1000));
      const publicId = `portfolio-${crypto.randomUUID()}`;
      const signature = createHash("sha1")
        .update(`public_id=${publicId}&timestamp=${timestamp}${secret}`)
        .digest("hex");
      const upload = new FormData();
      upload.set("file", new Blob([bytes], { type: file.type }), file.name);
      upload.set("timestamp", timestamp);
      upload.set("api_key", key);
      upload.set("signature", signature);
      upload.set("public_id", publicId);
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud}/${detected === "pdf" ? "raw" : "image"}/upload`,
        { method: "POST", body: upload },
      );
      const result = await response.json();
      if (!response.ok) throw new Error("Cloudinary upload failed");
      return Response.json({ url: result.secure_url });
    }
    if (process.env.VERCEL)
      return Response.json(
        { error: "Configure Cloudinary for persistent uploads on Vercel." },
        { status: 503 },
      );
    const name = `${crypto.randomUUID()}.${detected}`;
    const dir = path.join(process.cwd(), ".data", "media");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), bytes);
    return Response.json({ url: `/api/media/${name}` });
  } catch {
    return Response.json(
      { error: "Could not upload the file. Please try again." },
      { status: 500 },
    );
  }
}
