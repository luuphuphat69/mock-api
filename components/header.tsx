"use client"

import Link from "next/link"
import axios from "axios"
import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Code2, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logout } from "@/utilities/api/api"

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/me", {
          withCredentials: true, // send cookies to backend
        })
        setUser(res.data.user?.name)
      } catch (error) {
        setUser(null) 
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  const handleSignOut = async () => {
    try {
      await logout();
      setUser(null)
      router.push("/")
    } catch (err) {
      console.error("Logout failed:", err)
    }
  }

  // Hide header on login page
  if (pathname === "/login") return null

  return (
    <header className="fixed top-0 w-full border-b border-border bg-background/95 backdrop-blur z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-foreground">MockAPI</span>
        </Link>

        <div className="flex items-center gap-4">
          {!isLoading && user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border" onClick={() => {router.push('/projects')}}>
                <User className="w-4 h-4 text-cyan-500" />
                <span className="text-foreground font-medium">{user}</span>
              </div>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="border-border text-foreground hover:text-red-400 hover:border-red-400 transition-colors bg-transparent"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
              <Button
                asChild
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Link href="/login">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}