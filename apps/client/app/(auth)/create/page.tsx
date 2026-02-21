import { CreateForm } from "@/app/(auth)/create/create-form"
import CheckingSession from "@/components/checking-session";
import { getSession, isNotAuthenticated } from "@/lib/auth/utils";
import generatePageMetadata from "@/lib/utils/seo";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata = generatePageMetadata({
  title: "Create Credentials",
  description:
    "Create your secure Techno Traders credentials to access real-time trading discussions, exclusive market insights, and a high-performance community built for serious traders.",
  image: "/og-auth.jpg",
  url: "/create",
  schemaType: "WebPage",
});

async function AuthCheck() {
  const session = await getSession();
  if (session) redirect(process.env.NEXT_PUBLIC_AUTH_SUCCESS_REDIRECT_URL || "/boards");

  return null; // Only reaches here if NOT authenticated
}

export default async function SignupPage() {
  return (
    <Suspense fallback={<CheckingSession />}>
      <AuthCheck />
      <CreateForm />
    </Suspense>
  );
}
