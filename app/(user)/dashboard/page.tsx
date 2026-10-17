import { getPortfolio } from "@/lib/store";
import { Dashboard } from "@/components/dashboard";
import { isOwner } from "@/lib/auth";
import { notFound } from "next/navigation";
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ quick?: string }>;
}) {
  if (!(await isOwner())) notFound();
  const { quick } = await searchParams;
  const tab = ["profile", "projects", "experience", "skills"].includes(
    quick ?? "",
  )
    ? (quick as "profile" | "projects" | "experience" | "skills")
    : "profile";
  return (
    <Dashboard
      initialData={await getPortfolio()}
      quickMode={Boolean(quick)}
      initialTab={tab}
    />
  );
}
