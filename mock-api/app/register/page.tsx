"use client"

import type React from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import axios from "axios"
import { register } from '../../utilities/api/api';
import { LoadingScreen } from "@/components/loading-screen"
import Header from "@/components/header"

const trustPoints = ["Secure access", "Fast setup", "Private by default"] as const

export default function RegisterPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const data: IRegisterPayload = { name, email, password }
            const response = await register(data);
            if (response) {
                toast.success("Account created successfully")
                router.push('/login');
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                toast.error(err.response?.data?.message || "Unknown error")
                console.error(err.response?.data)
            } else if (err instanceof Error) {
                toast.error(err.message)
            } else {
                toast.error("An unknown error occurred")
                console.error(err)
            }
        } finally {
            setTimeout(() => {
                setIsLoading(false);
            }, 1200);
        }

    }

    return (
        <>
            <LoadingScreen isVisible={isLoading} />
            <Header />
            <main className="min-h-screen bg-background">
                <section className="mx-auto grid min-h-[calc(100vh-72px)] w-full max-w-6xl grid-cols-1 items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_440px] lg:px-8">
                    <div className="hidden lg:block">
                        <div className="max-w-xl space-y-8">
                            <div className="space-y-5">
                                <p className="text-sm font-medium uppercase tracking-[0.08em] text-muted-foreground">
                                    Create your workspace
                                </p>
                                <p className="text-5xl font-semibold leading-[1.05] tracking-[-0.03em] text-foreground">
                                    Start with a clean account built for focused work.
                                </p>
                                <p className="max-w-lg text-lg leading-8 text-muted-foreground">
                                    Set up your profile in a few seconds, then continue to your dashboard with a secure sign-in flow.
                                </p>
                            </div>

                            <div className="grid max-w-lg grid-cols-3 gap-3">
                                {trustPoints.map((item) => (
                                    <div
                                        key={item}
                                        className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground"
                                    >
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mx-auto w-full max-w-md mt-5">
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_2px_8px_rgba(17,17,17,0.08)] sm:p-8">
                            <div className="mb-8 space-y-2">
                                <h1 className="text-3xl font-semibold tracking-[-0.02em] text-foreground">
                                    Create account
                                </h1>
                                <p className="text-sm leading-6 text-muted-foreground">
                                    Enter your details below to get started.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5" aria-busy={isLoading}>
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-medium text-foreground">
                                        Full name
                                    </Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="Alex Nguyen"
                                        className="h-11 bg-background text-foreground placeholder:text-muted-foreground"
                                        autoComplete="name"
                                        disabled={isLoading}
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium text-foreground">
                                        Email address
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        className="h-11 bg-background text-foreground placeholder:text-muted-foreground"
                                        autoComplete="email"
                                        disabled={isLoading}
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-medium text-foreground">
                                        Password
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="At least 8 characters"
                                        className="h-11 bg-background text-foreground placeholder:text-muted-foreground"
                                        autoComplete="new-password"
                                        minLength={8}
                                        disabled={isLoading}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="h-11 w-full font-semibold tracking-[0.01em]"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Creating account..." : "Create account"}
                                </Button>
                            </form>

                            <div className="mt-6 space-y-4 text-center">
                                <p className="text-sm text-muted-foreground">
                                    Already have an account?{" "}
                                    <Link href="/login" className="font-medium text-primary hover:underline">
                                        Sign in
                                    </Link>
                                </p>

                                <p className="text-xs leading-5 text-muted-foreground">
                                    By creating an account, you agree to our{" "}
                                    <Link href="/terms" className="underline underline-offset-4 hover:text-foreground">
                                        Terms of Service
                                    </Link>{" "}
                                    and{" "}
                                    <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">
                                        Privacy Policy
                                    </Link>
                                    .
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}