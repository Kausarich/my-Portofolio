import { getPublicPortfolio } from "@/lib/public-data";
import { PortfolioView } from "@/components/portfolio";
export const revalidate = 3600;
export async function generateMetadata() {
  const { profile } = await getPublicPortfolio();
  const title = `${profile.fullName} — ${profile.headline}`;
  return {
    title: { absolute: title },
    description: profile.shortBio,
    openGraph: { title, description: profile.shortBio, type: "website" },
  };
}
export default async function Home() {
  return <PortfolioView data={await getPublicPortfolio()} />;
}
