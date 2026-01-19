"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { useGoogleLogin } from "@react-oauth/google"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { fetcher, ApiError } from "@/lib/api"

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid work email.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
})

export function SignInForm({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const loginMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      return fetcher<{ access_token: string; refresh_token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(values),
        skipAuth: true,
      })
    },
    onSuccess: () => {
      router.push("/dashboard")
    },
  })

  const googleLoginMutation = useMutation({
    mutationFn: async (accessToken: string) => {
      return fetcher("/auth/google", {
        method: "POST",
        body: JSON.stringify({ id_token: accessToken, provider: "google" }),
      })
    },
    onSuccess: () => {
      router.push("/dashboard")
    },
  })

  const startGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      googleLoginMutation.mutate(tokenResponse.access_token)
    },
    onError: () => {
      console.error("Google Login Failed");
    }
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    loginMutation.mutate(values)
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-sm font-medium text-foreground/80">Work Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="name@leadtap.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={loginMutation.isPending || googleLoginMutation.isPending}
                    className="h-12 bg-muted/30 border-input/60 focus:bg-background transition-colors"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-sm font-medium text-foreground/80">Password</FormLabel>
                  <a href="#" className="text-xs font-medium text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={loginMutation.isPending || googleLoginMutation.isPending}
                    className="h-12 bg-muted/30 border-input/60 focus:bg-background transition-colors"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {(loginMutation.isError || googleLoginMutation.isError) && (
            <div className="text-sm text-destructive font-medium px-1">
              {loginMutation.error instanceof ApiError ? loginMutation.error.message :
                googleLoginMutation.error instanceof ApiError ? googleLoginMutation.error.message :
                  "Authentication failed. Please check credentials or try again."}
            </div>
          )}

          <Button className="w-full h-12 text-base font-medium shadow-lg hover:shadow-xl transition-all" disabled={loginMutation.isPending || googleLoginMutation.isPending}>
            {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
            {!loginMutation.isPending && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-muted" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <Button variant="outline" type="button" disabled={googleLoginMutation.isPending || loginMutation.isPending} onClick={() => startGoogleLogin()} className="w-full h-12">
        {googleLoginMutation.isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
          </svg>
        )}
        Sign in with Google
      </Button>


    </div>
  )
}
