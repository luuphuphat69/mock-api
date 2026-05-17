"use client"

import type React from "react"
import { LoadingScreen } from "@/components/loading-screen"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { ArrowLeft, CheckCircle2, KeyRound, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useUser } from "@/hooks/useUser"
import { PasswordInput } from "@/components/passwordInput"
import { changePass } from "@/utilities/api/api"
import Header from "@/components/header"

const securityNotes = [
    "We verify the current password before applying the change.",
    "The new password is accepted only when both new fields match.",
    "You return to projects once the update succeeds.",
]

function getErrorMessage(error: unknown) {
    if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data !== null &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
    ) {
        return error.response.data.message
    }

    return "Unable to change password"
}

export default function ChangePasswordPage() {
    const router = useRouter()
    const { user, loading, fetchUser } = useUser()

    const [isLoading, setIsLoading] = useState(false)
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    useEffect(() => {
        fetchUser()
    }, [])

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login")
        }
    }, [loading, router, user])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("Please fill in all fields")
            return
        }

        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match")
            return
        }

        if (!user) {
            toast.error("Please sign in again to change your password")
            router.push("/login")
            return
        }

        try {
            setIsLoading(true)
            await changePass(currentPassword, newPassword)

            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
            toast.success("Your password has been changed successfully")
            router.push("/projects")
        } catch (error: unknown) {
            toast.error(getErrorMessage(error))
        } finally {
            setIsLoading(false)
        }
    }

    if (loading || !user) return null

    return (
        <>
            <LoadingScreen isVisible={isLoading} />
            <Header />
            <main className="min-h-screen bg-background px-4 py-24 sm:px-6 lg:px-8">
                <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_480px] lg:items-center">
                    <section className="hidden lg:block">
                        <Link
                            href="/projects"
                            className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to projects</span>
                        </Link>

                        <div className="max-w-xl space-y-8">
                            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm text-muted-foreground">
                                <ShieldCheck className="h-4 w-4 text-primary" />
                                Account security
                            </div>

                            <div className="space-y-4">
                                <p className="text-sm font-medium uppercase tracking-[0.08em] text-muted-foreground">
                                    Password update
                                </p>
                                <div className="text-5xl font-semibold leading-tight tracking-[-0.02em] text-foreground">
                                    Keep your workspace access private and current.
                                </div>
                                <p className="max-w-lg text-lg leading-8 text-muted-foreground">
                                    Use a fresh password that is hard to guess and not shared with other accounts.
                                </p>
                            </div>

                            <div className="grid max-w-lg gap-3">
                                {securityNotes.map((item) => (
                                    <div key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="w-full">
                        <Link
                            href="/projects"
                            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground lg:hidden"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to projects</span>
                        </Link>

                        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
                            <div className="mb-8 space-y-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background">
                                    <KeyRound className="h-5 w-5 text-primary" />
                                </div>
                                <div className="space-y-2">
                                    <h1 className="text-3xl font-semibold tracking-[-0.01em] text-foreground">
                                        Change your password
                                    </h1>
                                    <p className="text-sm leading-6 text-muted-foreground">
                                        Confirm your current password, then choose a new one for this account.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5" aria-busy={isLoading}>
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Current password</Label>
                                    <PasswordInput
                                        id="currentPassword"
                                        name="current-password"
                                        value={currentPassword}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            setCurrentPassword(e.target.value)
                                        }
                                        placeholder="Enter current password"
                                        autoComplete="current-password"
                                        disabled={isLoading}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New password</Label>
                                    <PasswordInput
                                        id="newPassword"
                                        name="new-password"
                                        value={newPassword}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            setNewPassword(e.target.value)
                                        }
                                        placeholder="Enter new password"
                                        autoComplete="new-password"
                                        disabled={isLoading}
                                        minLength={8}
                                        required
                                    />
                                    <p className="text-xs leading-5 text-muted-foreground">
                                        Use at least 8 characters with a mix of letters, numbers, or symbols.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm new password</Label>
                                    <PasswordInput
                                        id="confirmPassword"
                                        name="confirm-new-password"
                                        value={confirmPassword}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            setConfirmPassword(e.target.value)
                                        }
                                        placeholder="Re-enter new password"
                                        autoComplete="new-password"
                                        disabled={isLoading}
                                        minLength={8}
                                        required
                                    />
                                </div>

                                <Button className="w-full" disabled={isLoading} type="submit">
                                    {isLoading ? "Updating..." : "Change password"}
                                </Button>
                            </form>
                        </div>
                    </section>
                </div>
            </main>
        </>
    )
}
