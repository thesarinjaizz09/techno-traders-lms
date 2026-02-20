'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link"
import { toast } from "sonner";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthValues, AuthSchema } from "./validate";
import { Mail, Lock, LayoutDashboard, EyeOff, Eye } from "lucide-react"
import { signIn } from "@/lib/auth/client";
import { Spinner } from "@/components/ui/spinner";

export function AuthForm({
  className,
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<AuthValues>({
    resolver: zodResolver(AuthSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(data: AuthValues) {
    try {
      startTransition(async () => {
        await signIn.email({
          email: data.email,
          password: data.password,
          callbackURL: process.env.NEXT_PUBLIC_AUTH_SUCCESS_REDIRECT_URL || "/dashboard",
        }, {
          onSuccess: async () => {            
            router.push(process.env.NEXT_PUBLIC_AUTH_SUCCESS_REDIRECT_URL || "/dashboard");
            toast.success("Credentials authenticated successfully");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message);
          },
        });
      });
    } catch (error) {
      toast.error("Internal client error");
    }
  }

  return (
    <Form {...form}>
      <form className={cn("flex flex-col gap-6", className)} onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="flex flex-col items-start gap-1 text-left">
            <h1 className="text-3xl font-bold">Auth Credentials</h1>
            <p className="text-sm w-full">
              Verify your credentials to access the Dashboard
            </p>
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div>
                    <FieldLabel htmlFor="email" className="mb-2">
                      <Mail className="size-3.5 text-primary" /> Email
                    </FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tmt@goldman.sachs"
                      className="peer"
                      disabled={isPending}
                      {...field}
                      required
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div>
                    <div className="flex items-center">
                      <FieldLabel htmlFor="password" className="mb-2"><Lock className="size-3.5 text-primary" />Password</FieldLabel>
                      <Link
                        href="/forgot"
                        className="ml-auto text-xs underline-offset-4 hover:underline text-gray-400"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        className="pe-9"
                        placeholder="********"
                        disabled={isPending}
                        {...field}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary cursor-pointer"
                        tabIndex={-1} // prevents stealing focus
                      >
                        {!showPassword ? (
                          <EyeOff className="size-3.5" />
                        ) : (
                          <Eye className="size-3.5 text-primary" />
                        )}
                      </button>
                    </div>

                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="cursor-pointer" disabled={isPending}>
            {
              isPending ?
                <Spinner /> :
                <LayoutDashboard className="size-3" />
            }
            Dashboard
          </Button>
          <Field>
            <FieldDescription className="text-center text-xs">
              Don&apos;t have credentials?{" "}
              <Link href="/create" className="underline underline-offset-4">
                Sign up
              </Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </Form>
  )
}
