"use client"

import type React from "react"
import { LoadingScreen } from "@/components/loading-screen"
import Link from "next/link"
import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner'
import { requestResetPassword } from "@/utilities/api/api"
import { useRouter } from "next/navigation"

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState("")
    const router = useRouter();

    const handleEmailSubmit = async (e: React.FormEvent) => {
        try {
            e.preventDefault()
            if (!email) {
                toast.error("Please enter your email")
                return;
            }

            setIsLoading(true)
            await requestResetPassword(email);
            toast.success("An email has been sent to your Inbox or Spam. Please click on the link to reset your password");
            router.push('/login');

        } catch (err: any) {
            toast.error(err.response.data.message);
            throw err;
        }finally{
            setIsLoading(false)
        }
    }

    return (
        <>
            <LoadingScreen isVisible={isLoading} />
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Logo and Back Link */}
                    <Link href="/login" className="inline-flex items-center gap-2 group hover:opacity-80 transition-opacity mb-8">
                        <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                            Back to login
                        </span>
                    </Link>

                    <div className="bg-card border border-border rounded-xl p-8 space-y-8 shadow-lg">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground mb-2">
                                Reset your password
                            </h1>
                            <p className="text-muted-foreground">
                                We'll send you a code to reset your password
                            </p>
                        </div>

                        <form onSubmit={handleEmailSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-foreground font-medium">
                                    Email address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 transition-all font-semibold"
                                disabled={isLoading}
                            >
                                {isLoading ? "Sending..." : "Reset password"}
                            </Button>
                        </form>

                        {/* Back to Login Link */}
                        <p className="text-center text-sm text-muted-foreground">
                            Remember your password?{" "}
                            <Link
                                href="/login"
                                className="text-cyan-400 hover:text-cyan-300 hover:underline font-medium transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}
