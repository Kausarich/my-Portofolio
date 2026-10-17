import { notFound, redirect } from "next/navigation";
import { isOwner } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";
export const metadata = {
  title: "Private workspace",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default async function Login({
  params,
}: {
  params: Promise<{ secretAuthSlug: string }>;
}) {
  const { secretAuthSlug } = await params;
  if (
    !process.env.SECRET_LOGIN_SLUG ||
    secretAuthSlug !== process.env.SECRET_LOGIN_SLUG
  )
    notFound();
  if (await isOwner()) redirect("/dashboard");
  return (
    <main className="login-page">
      <div className="login-art">
        <span className="brand">
          GK<span>.</span>
        </span>
        <h1>
          Your work.
          <br />
          <span>
            Your little
            <br />
            corner of the web.
          </span>
        </h1>
        <p>A considered space for everything you’re building.</p>
        <span className="section-index">PRIVATE WORKSPACE / OWNER ACCESS</span>
      </div>
      <LoginForm />
    </main>
  );
}
