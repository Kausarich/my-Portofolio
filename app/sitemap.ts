import type { MetadataRoute } from "next";
import { getPortfolio } from "@/lib/store";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = process.env.SITE_URL;
  if (!origin) return [];
  return [
    { url: origin, changeFrequency: "monthly", priority: 1 },
    ...(await getPortfolio()).projects
      .filter((p) => p.published)
      .map((p) => ({
        url: `${origin}/projects/${p.slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
  ];
}
