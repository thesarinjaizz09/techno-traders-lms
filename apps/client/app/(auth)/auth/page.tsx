import { AuthForm } from "./auth-form";
import { getSession } from "@/lib/auth/utils";
import generatePageMetadata from "@/lib/utils/seo";
import { redirect } from "next/navigation";

export const metadata = generatePageMetadata({
  title: "Authenticate Credentials",
  description:
    "Authenticate your PostDepot credentials to securely access your sending workspace. Verify your identity and continue managing high-volume transactional email delivery with enterprise-grade security and control.",
  image: "/og-auth.jpg",
  url: "/auth",
  schemaType: "WebPage",
});

export default async function AuthPage() {
  const session = await getSession();

  if (session) redirect(process.env.NEXT_PUBLIC_AUTH_SUCCESS_REDIRECT_URL || "/boards");

  return <AuthForm />;
}
