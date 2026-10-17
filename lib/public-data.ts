import { getPortfolio } from "./store";
export async function getPublicPortfolio() {
  const data = await getPortfolio();
  return { ...data, projects: data.projects.filter((p) => p.published) };
}
