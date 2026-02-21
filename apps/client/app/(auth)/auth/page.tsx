import { AuthForm } from "./auth-form";
import { isNotAuthenticated } from "@/lib/auth/utils";
import generatePageMetadata from "@/lib/utils/seo";

export const metadata = generatePageMetadata({
  title: "Authenticate Credentials",
  description:
    "Authenticate your Techno Traders account to securely access your trading dashboard, live community chats, and members-only market analysis with enterprise-grade security.",
  image: "/og-auth.jpg",
  url: "/auth",
  schemaType: "WebPage",
});


export default async function AuthPage() {
  await isNotAuthenticated();

  return <AuthForm />;
}
