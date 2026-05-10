"use client"

import type { FormEvent } from "react"
import { LoadingScreen } from "@/components/loading-screen"
import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, CheckCircle2, Mail, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { requestResetPassword } from "@/utilities/api/api"
import { useRouter } from "next/navigation"
import Header from "@/components/header"

const recoverySteps = [
    "Enter the email tied to your account.",
    "Open the reset link from your inbox or spam folder.",
    "Activate new password by clicking the link and return to sign in.",
] as const

function getResetErrorMessage(err: unknown) {
    if (!err || typeof err !== "object" || !("response" in err)) {
        return "Unable to send the reset email. Please try again."
    }

    const response = (err as { response?: unknown }).response

    if (!response || typeof response !== "object" || !("data" in response)) {
        return "Unable to send the reset email. Please try again."
    }

    const data = (response as { data?: unknown }).data

    if (!data || typeof data !== "object" || !("message" in data) || typeof data.message !== "string") {
        return "Unable to send the reset email. Please try again."
    }

    return data.message
}

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState("")
    const router = useRouter()

    const handleEmailSubmit = async (e: FormEvent) => {
        e.preventDefault()

        const normalizedEmail = email.trim()

        if (!normalizedEmail) {
            toast.error("Please enter your email")
            return
        }

        try {
            setIsLoading(true)
            await requestResetPassword(normalizedEmail)
            toast.success("A reset email has been sent. Check your inbox or spam folder.")
            router.push("/login")
        } catch (err: unknown) {
            toast.error(getResetErrorMessage(err))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <LoadingScreen isVisible={isLoading} />
            <Header />
            <main className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-6 lg:px-8">
                <div className="mx-auto grid min-h-[calc(100vh-8rem)] w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
                    <section className="hidden lg:block">
                        <Link
                            href="/login"
                            className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            Back to login
                        </Link>

                        <div className="max-w-xl space-y-8">
                            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
                                <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                                Secure account recovery
                            </div>

                            <div className="space-y-5">
                                <p className="text-5xl font-semibold leading-[1.05] tracking-[-0.03em] text-foreground">
                                    Get back into your workspace without starting over.
                                </p>
                                <p className="max-w-lg text-base leading-7 text-muted-foreground">
                                    We will send a reset link to the email on your account. The flow stays private,
                                    time-bound, and tied to your existing login.
                                </p>
                            </div>

                            <div className="grid gap-3">
                                {recoverySteps.map((step, index) => (
                                    <div
                                        key={step}
                                        className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
                                    >
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                            {index + 1}
                                        </span>
                                        <p className="text-sm leading-6 text-muted-foreground">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <div className="mx-auto w-full max-w-md">
                        <Link
                            href="/login"
                            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground lg:hidden"
                        >
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            Back to login
                        </Link>

                        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
                            <div className="mb-8 space-y-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background">
                                    <Mail className="h-5 w-5 text-primary" aria-hidden="true" />
                                </div>
                                <div className="space-y-2">
                                    <h1 className="text-3xl font-semibold tracking-[-0.02em] text-foreground">
                                        Reset your password
                                    </h1>
                                    <p className="text-sm leading-6 text-muted-foreground">
                                        Enter your account email and we will send you a secure reset link.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleEmailSubmit} className="space-y-5" aria-busy={isLoading}>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium text-foreground">
                                        Email address
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-11 bg-background text-foreground placeholder:text-muted-foreground"
                                        autoComplete="email"
                                        inputMode="email"
                                        disabled={isLoading}
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="h-11 w-full font-semibold"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Sending reset link..." : "Send reset link"}
                                </Button>
                            </form>

                            <div className="mt-6 flex items-start gap-2 rounded-xl border border-border bg-background p-3">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                                <p className="text-xs leading-5 text-muted-foreground">
                                    If an account exists for that email, the reset message should arrive within a few
                                    minutes.
                                </p>
                            </div>

                            <p className="mt-8 text-center text-sm text-muted-foreground">
                                Remember your password?{" "}
                                <Link
                                    href="/login"
                                    className="font-medium text-primary underline-offset-4 transition-colors hover:underline"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </section>
                    </div>
                </div>
            </main>
        </>
    )
}