"use client"

import type React from "react"
import { LoadingScreen } from "@/components/loading-screen"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useUser } from "@/hooks/useUser"
import { PasswordInput } from "@/components/passwordInput"
import { changePass } from "@/utilities/api/api"

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

    // 🔥 If still loading, show nothing (prevents flicker)
    if (loading) return null

    if (!user) {
        router.push("/login")
        return null
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (!currentPassword || !newPassword || !confirmPassword) {
                toast.error("Please fill in all fields")
                return
            }

            if (newPassword !== confirmPassword) {
                toast.error("New passwords do not match")
                return
            }
            await changePass(user.id, currentPassword, newPassword);

            setIsLoading(true)

            toast.success("Your password has been changed successfully")
            setIsLoading(false)
            router.push("/projects")
        } catch (err: any) {
            toast.error(err.response.data.message)
        }
    }

    return (
        <>
            <LoadingScreen isVisible={isLoading} />

            <div className="min-h-screen bg-background flex items-center justify-center p-4 pt-24">
                <div className="w-full max-w-md">

                    <Link href="/projects" className="inline-flex items-center gap-2 mb-8 hover:opacity-80">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to projects</span>
                    </Link>

                    <div className="bg-card border border-border rounded-xl p-8 space-y-8 shadow-lg">
                        <div>
                            <h1 className="text-3xl font-bold">Change your password</h1>
                            <p className="text-muted-foreground">
                                Update your account password to keep it secure
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Current password</Label>
                                <PasswordInput
                                    id="currentPassword"
                                    value={currentPassword}
                                    onChange={(e: any) => setCurrentPassword(e.target.value)}
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New password</Label>
                                <PasswordInput
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e: any) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm new password</Label>
                                <PasswordInput
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e: any) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                />
                            </div>

                            <Button className="w-full" disabled={isLoading}>
                                {isLoading ? "Updating..." : "Change password"}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}
