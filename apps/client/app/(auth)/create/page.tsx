import { CreateForm } from "@/app/(auth)/create/create-form"
import { isNotAuthenticated } from "@/lib/auth/utils";
import generatePageMetadata from "@/lib/utils/seo";

export const metadata = generatePageMetadata({
  title: "Create Credentials",
  description:
    "Create your secure Techno Traders credentials to access real-time trading discussions, exclusive market insights, and a high-performance community built for serious traders.",
  image: "/og-auth.jpg",
  url: "/create",
  schemaType: "WebPage",
});



export default async function SignupPage() {
  await isNotAuthenticated();

  return <CreateForm />
}
