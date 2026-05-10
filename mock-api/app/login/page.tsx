"use client"

import type React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Eye, EyeOff, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Header from "@/components/header"
import { LoadingScreen } from "@/components/loading-screen"
import { login } from "../../utilities/api/api"

const TRUST_POINTS = [
  "Protected by Cloudflare Turnstile",
  "Session refresh after sign in",
  "Secure password-only credential flow",
]

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isVisible, setIsVisible] = useState(false)
  const turnstileRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const loadTurnstile = () => {
      if (!window.turnstile || !turnstileRef.current) return

      turnstileRef.current.innerHTML = ""

      window.turnstile.render(turnstileRef.current, {
        sitekey: "0x4AAAAAAC_YHdTsgyllblsq",
        theme: "light",
      })
    }

    if (!document.querySelector('script[src*="turnstile"]')) {
      const script = document.createElement("script")
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js"
      script.async = true
      script.defer = true
      script.onload = loadTurnstile
      document.body.appendChild(script)
    } else {
      loadTurnstile()
    }
  }, [])

  const toggleVisibility = () => {
    setIsVisible((prevState) => !prevState)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const cfToken = (document.querySelector(
        '[name="cf-turnstile-response"]'
      ) as HTMLInputElement | null)?.value

      const loginPayload: ILoginPayload = {
        email,
        password,
        cfToken,
      }

      const response = await login(loginPayload)
      if (response.status === 200) {
        router.refresh()
        router.push("/")
        toast.success("Signed in successfully")
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.body ||
        "An unknown error occurred"

      toast.error(errorMessage)

      console.error(err)
    } finally {
      setTimeout(() => {
        setIsLoading(false)
      }, 1200)
    }
  }

  return (
    <>
      <LoadingScreen isVisible={isLoading} />
      <Header />

      <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
        <div className="mx-auto grid min-h-[calc(100vh-7rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="hidden lg:block">
            <div className="max-w-xl space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm font-medium text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                Secure access
              </div>

              <div className="space-y-5">
                <p className="text-sm font-medium uppercase tracking-[0.08em] text-muted-foreground">
                  Welcome back
                </p>
                <p className="max-w-2xl text-5xl font-semibold leading-[1.05] tracking-[-0.03em] text-foreground">
                  Pick up your workspace exactly where you left it.
                </p>
                <p className="max-w-lg text-lg leading-8 text-muted-foreground">
                  Sign in to manage your account, continue active projects, and keep
                  your workspace synced across sessions.
                </p>
              </div>

              <div className="grid gap-3">
                {TRUST_POINTS.map((point) => (
                  <div
                    key={point}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground"
                  >
                    <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mx-auto w-full max-w-md">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_2px_8px_rgba(17,17,17,0.08)] sm:p-8">
              <div className="space-y-2">
                <p className="text-sm font-medium uppercase tracking-[0.08em] text-muted-foreground">
                  Account login
                </p>
                <h1 className="text-3xl font-semibold tracking-[-0.02em] text-foreground">
                  Sign in to your account
                </h1>
                <p className="text-sm leading-6 text-muted-foreground">
                  New here?{" "}
                  <Link
                    href="/register"
                    className="font-medium text-primary transition-colors hover:underline"
                  >
                    Create an account
                  </Link>
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-5"
                aria-busy={isLoading}
              >
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-medium text-foreground">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    placeholder="you@example.com"
                    autoComplete="email"
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-11 bg-background text-foreground placeholder:text-muted-foreground"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <Label htmlFor="password" className="font-medium text-foreground">
                      Password
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-sm font-medium text-primary transition-colors hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="relative">
                    <Input
                      id="password"
                      type={isVisible ? "text" : "password"}
                      value={password}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      onChange={(event) => setPassword(event.target.value)}
                      className="h-11 bg-background pr-11 text-foreground placeholder:text-muted-foreground"
                      disabled={isLoading}
                      required
                    />

                    <button
                      type="button"
                      onClick={toggleVisibility}
                      className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      aria-label={isVisible ? "Hide password" : "Show password"}
                      disabled={isLoading}
                    >
                      {isVisible ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                <div
                  ref={turnstileRef}
                  className="min-h-[65px]"
                  aria-label="Security verification"
                />

                <Button
                  type="submit"
                  className="h-11 w-full font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>

              <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
                By signing in, you agree to our{" "}
                <Link href="#" className="underline-offset-4 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="underline-offset-4 hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}