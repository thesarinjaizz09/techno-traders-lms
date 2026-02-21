import CheckingSession from "@/components/checking-session";
import { AuthForm } from "./auth-form";
import { getSession, isNotAuthenticated } from "@/lib/auth/utils";
import generatePageMetadata from "@/lib/utils/seo";
import { Suspense } from "react";
import { redirect } from "next/navigation";

export const metadata = generatePageMetadata({
  title: "Authenticate Credentials",
  description:
    "Authenticate your Techno Traders account to securely access your trading dashboard, live community chats, and members-only market analysis with enterprise-grade security.",
  image: "/og-auth.jpg",
  url: "/auth",
  schemaType: "WebPage",
});


async function AuthCheck() {
  const session = await getSession();
  if (session) redirect(process.env.NEXT_PUBLIC_AUTH_SUCCESS_REDIRECT_URL || "/boards");
  
  return null; // Only reaches here if NOT authenticated
}

export default async function AuthPage() {
  return (
    <Suspense fallback={<CheckingSession />}>
      <AuthCheck />
      <AuthForm />
    </Suspense>
  );
}
