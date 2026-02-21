import LoadingBar from "./loading-bar";
import { Geist, Geist_Mono } from "next/font/google";
import { TRPCReactProvider } from "@/trpc/client";
import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Provider } from "jotai";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip"
import generatePageMetadata from "@/lib/utils/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = generatePageMetadata({
  title: "Home",
  description:
    "Welcome to the Techno Traders. Collaborate, discuss ideas, and stay connected with real-time conversations, updates, and exclusive spaces built for engaged members.",
  image: "/og-home.jpg",
  url: "/",
  schemaType: "WebPage",
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scrollbar-none">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased custom-scroll`}
      >
        <LoadingBar />
        <TRPCReactProvider>
          <NuqsAdapter>
            <Provider>
              <TooltipProvider>{children}</TooltipProvider>
              <Toaster richColors />
            </Provider>
          </NuqsAdapter>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
