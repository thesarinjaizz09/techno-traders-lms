import React from "react";
import Image from "next/image";
import appLogo from "@/public/alphafusion.png";
import Link from "next/link";
import VideoComponent from "./video-component";
import { cn } from "@/lib/utils";
import { openSans } from "@/fonts";

const AuthLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className={cn("grid min-h-svh grid-cols-1 lg:grid-cols-[38fr_62fr]")}>
      {/* LEFT: FORM */}
      <div className="flex flex-col gap-4 p-6 md:p-10 w-full h-full rounded-sm">
        <div className="flex justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="p-[6px] border rounded-sm bg-muted"
            >
              <Image
                src={appLogo}
                alt="AlphaFusion Corporation"
                width={20}
                className="hover:scale-120"
              />
            </div>
            <div className="grid flex-1 text-left leading-tight text-primary-foreground">
              <span className="truncate text-md text-primary-foreground font-semibold">
                Techno Traders
              </span>
              <span className="truncate text-[11px] text-muted-foreground">SIDA</span>
            </div>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full">
            <div className="flex flex-1 items-center justify-center">
              <div className="w-full max-w-[380px]">
                {children}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between text-xs text-muted-foreground border-t pt-4 border-primary">
          <span>© {new Date().getFullYear()} SIDA</span>
          <span>v1.0.0 • Secure Login</span>
        </div>
      </div>

      {/* RIGHT: VIDEO + FUTURISTIC OVERLAY */}
      <VideoComponent />
    </div>
  );
};

export default AuthLayout;
