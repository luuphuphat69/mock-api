import Link from "next/link"
import { useUser } from "../hooks/useUser"
import { logout } from "@/utilities/api/api"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { User, LogOut, ChevronDown } from "lucide-react"
import { useProjects } from "@/hooks/useProject"
import Image from 'next/image';
export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading, fetchUser, clearUser } = useUser()
  const { clearProjects } = useProjects();
  const [showDropdown, setShowDropdown] = useState(false)
  const signInRef = useRef<HTMLAnchorElement>(null)
  const getStartedRef = useRef<HTMLButtonElement>(null)
  const signOutRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchUser() // Automatically loads user from cookie
  }, [])
  const handleSignOut = async () => {
    try {
      await logout() // Backend clears cookie 
      clearUser() // Frontend clears store 
      clearProjects();
      router.push("/")
    } catch (err) {
      console.error("Logout error:", err)
    }
  }
  if (pathname === "/login") return null
  return (
    <header className="fixed top-0 w-full border-b bg-background/90 backdrop-blur z-50">
      <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br rounded-lg flex items-center justify-center">
            <Image src='/icon.png' width={700} height={700} alt="logo" />
          </div>
          <span className="font-bold text-lg">MockAPI</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium" > Docs </Link>
          
          {!loading && user ? (
            <div className="flex items-center gap-4">
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border hover:border-cyan-500 transition-colors cursor-pointer group"
                >
                  <User className="w-4 h-4 text-cyan-500" />
                  <span className="text-foreground font-medium">{user.name}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform ${showDropdown ? "rotate-180" : ""}`}
                  />
                </button>

                {showDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                    <button
                      onClick={() => {
                        router.push("/projects")
                        setShowDropdown(false)
                      }}
                      className="w-full text-left px-4 py-2 text-foreground hover:bg-accent/10 transition-colors first:rounded-t-lg"
                    >
                      Projects
                    </button>
                    <button
                      onClick={() => {
                        router.push("/change-password")
                        setShowDropdown(false)
                      }}
                      className="w-full text-left px-4 py-2 text-foreground hover:bg-accent/10 transition-colors last:rounded-b-lg border-t border-border"
                    >
                      Change Password
                    </button>
                  </div>
                )}
              </div>

              <Button
                ref={signOutRef}
                onClick={handleSignOut}
                variant="outline"
                className="border-border text-foreground hover:text-red-400 hover:border-red-400 transition-colors bg-transparent relative overflow-hidden"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, rgba(248, 113, 113, 0.2) 100%)",
                  backgroundSize: "200% 100%",
                  backgroundPosition: "0% center",
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <>
              <Link
                ref={signInRef}
                href="/login"
                className="text-muted-foreground hover:text-foreground transition-colors relative px-3 py-2 rounded-md overflow-hidden"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, rgba(6, 182, 212, 0.2) 100%)",
                  backgroundSize: "200% 100%",
                  backgroundPosition: "0% center",
                }}
              >
                Sign In
              </Link>
              <Button
                ref={getStartedRef}
                asChild
                className="bg-primary text-primary-foreground hover:bg-primary/90 relative overflow-hidden"
                style={{
                  background: "linear-gradient(90deg, rgb(6, 182, 212) 0%, rgb(37, 99, 235) 100%)",
                  backgroundSize: "200% 100%",
                  backgroundPosition: "0% center",
                }}
              >
                <Link href="/login">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>)
}