import "server-only";
import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import path from "node:path";
import { PrismaClient, Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { portfolioSchema, type Portfolio } from "./schema";
import { seed } from "./seed";
const globalStore = globalThis as unknown as {
  prisma?: PrismaClient;
  writeQueue?: Promise<void>;
};
function db() {
  return (globalStore.prisma ??= new PrismaClient());
}
const dataPath = path.join(process.cwd(), ".data", "portfolio.json");
async function readPortfolio(): Promise<Portfolio> {
  if (process.env.DATABASE_URL) {
    const record = await db().portfolioContent.findUnique({
      where: { id: "main" },
    });
    return record ? portfolioSchema.parse(record.data) : structuredClone(seed);
  }
  if (process.env.NODE_ENV === "production" && process.env.VERCEL)
    throw new Error("Configure DATABASE_URL before deploying to Vercel.");
  try {
    return portfolioSchema.parse(JSON.parse(await readFile(dataPath, "utf8")));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT")
      return structuredClone(seed);
    throw error;
  }
}
export const getPortfolio = unstable_cache(readPortfolio, ["portfolio-data"], {
  tags: ["portfolio-data"],
  revalidate: 3600,
});
export async function savePortfolio(input: Portfolio) {
  const data = portfolioSchema.parse(input);
  if (process.env.DATABASE_URL) {
    const json = data as unknown as Prisma.InputJsonValue;
    await db().portfolioContent.upsert({
      where: { id: "main" },
      create: { id: "main", data: json },
      update: { data: json },
    });
  } else {
    if (process.env.NODE_ENV === "production" && process.env.VERCEL)
      throw new Error("Persistent database required.");
    const write = async () => {
      await mkdir(path.dirname(dataPath), { recursive: true });
      const temporary = `${dataPath}.${crypto.randomUUID()}.tmp`;
      await writeFile(temporary, JSON.stringify(data, null, 2), "utf8");
      await rename(temporary, dataPath);
    };
    const pending = (globalStore.writeQueue ?? Promise.resolve()).then(write);
    globalStore.writeQueue = pending.catch(() => {});
    await pending;
  }
}
