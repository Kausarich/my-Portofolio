import { getPortfolio } from "@/lib/store";
import { Dashboard } from "@/components/dashboard";
import { isOwner } from "@/lib/auth";
import { notFound } from "next/navigation";
export default async function EditorSection({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  if (!(await isOwner())) notFound();
  const { section } = await params;
  if (!["profile", "projects", "experience", "skills"].includes(section))
    notFound();
  return (
    <Dashboard
      initialData={await getPortfolio()}
      initialTab={section as "profile" | "projects" | "experience" | "skills"}
    />
  );
}
