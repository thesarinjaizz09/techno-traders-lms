import { CreateForm } from "@/app/(auth)/create/create-form"
import { getSession } from "@/lib/auth/utils";
import generatePageMetadata from "@/lib/utils/seo";
import { redirect } from "next/navigation";

export const metadata = generatePageMetadata({
  title: "Create Credentials",
  description:
    "Create your secure PostDepot credentials to start sending high-volume transactional emails with enterprise-grade deliverability, queue-based dispatching, and SMTP reputation protection.",
  image: "/og-auth.jpg",
  url: "/create",
  schemaType: "WebPage",
});


export default async function SignupPage() {
  const session = await getSession();

  if (session) redirect(process.env.NEXT_PUBLIC_AUTH_SUCCESS_REDIRECT_URL || "/boards");

  return <CreateForm />
}
