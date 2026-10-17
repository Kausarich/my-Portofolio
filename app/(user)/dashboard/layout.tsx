import { isOwner } from "@/lib/auth";
import { notFound } from "next/navigation";
export const metadata = {
  title: "Your workspace",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isOwner())) notFound();
  return children;
}
