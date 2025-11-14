"use client"

import type React from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Code2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

import { login } from '../../utilities/api/api';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const loginPayload: ILoginPayload = {
        email: email,
        password: password
      }
      const response = await login(loginPayload);
      if (response) {
        toast.success("Sign up successfully", {
          action: {
            label: "Undo",
            onClick: () => console.log("Undo"),
          },
        })
      }
      router.push('/projects')
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message, {
          action: {
            label: "Undo",
            onClick: () => console.log("Undo"),
          },
        })
        console.error(err.message)
      } else {
        toast.error("An unknown error occurred", {
          action: {
            label: "Undo",
            onClick: () => console.log("Undo"),
          },
        })
        console.error("Unknown error:", err)
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 group hover:opacity-80 transition-opacity mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Code2 className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl text-foreground">MockAPI</span>
        </Link>

        <div className="bg-card border border-border rounded-xl p-8 space-y-8 shadow-lg">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Sign in to your account</h1>
            <p className="text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-cyan-400 hover:text-cyan-300 hover:underline font-medium transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                onChange={(event) => setEmail(event.target.value)}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground font-medium">
                  Password
                </Label>
                <Link href="/forgot-password" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                  Forgot?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                onChange={(event) => setPassword(event.target.value)}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 transition-all font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          {/* Terms */}
          <p className="text-center text-xs text-muted-foreground">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-foreground transition-colors">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
