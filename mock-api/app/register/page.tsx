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
import axios from "axios"
import { register } from '../../utilities/api/api';

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
                toast.success("Sign up successfully", {
                    action: {
                        label: "Undo",
                        onClick: () => console.log("Undo"),
                    },
                })
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
            setIsLoading(false)
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
                        <h1 className="text-3xl font-bold text-foreground mb-2">Sign up new account</h1>
                    </div>

                    {/* Sign up Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-foreground font-medium">
                                Name
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Name"
                                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-foreground font-medium">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />

                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-foreground font-medium">
                                    Password
                                </Label>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 transition-all font-semibold"
                            disabled={isLoading}
                        >
                            {isLoading ? "Signing up..." : "Sign up"}
                        </Button>
                    </form>

                    {/* Terms */}
                    <p className="text-center text-xs text-muted-foreground">
                        By signing up, you agree to our{" "}
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
