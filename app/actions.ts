"use server";
import { isOwner, signIn, signOut } from "@/lib/auth";
import { savePortfolio } from "@/lib/store";
import { portfolioSchema } from "@/lib/schema";
import { revalidatePath, revalidateTag } from "next/cache";
import { AuthError } from "next-auth";
export async function updatePortfolioAction(input: unknown) {
  if (!(await isOwner()))
    return { error: "Your session has expired. Sign in again." };
  const result = portfolioSchema.safeParse(input);
  if (!result.success)
    return {
      error: result.error.issues
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(" · "),
    };
  try {
    await savePortfolio(result.data);
    revalidateTag("portfolio-data", { expire: 0 });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Portfolio save failed", error);
    return { error: "Could not save your changes. Please try again." };
  }
}
export async function loginAction(_: { error: string }, form: FormData) {
  try {
    await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError)
      return {
        error: "Unable to sign in. Check your details or try again later.",
      };
    throw error;
  }
  return { error: "" };
}
export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
