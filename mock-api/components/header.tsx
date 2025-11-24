import Link from "next/link"
import { useUser } from "../hooks/useUser"
import { logout } from "@/utilities/api/api"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { User, LogOut } from "lucide-react"
import { useProjects } from "@/hooks/useProject"
import Image from 'next/image';
export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading, fetchUser, clearUser } = useUser()
  const { clearProjects } = useProjects();
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
          {!loading && user ?
            (<>
              <div onClick={() => router.push("/projects")} className="flex items-center gap-2 px-4 py-2 bg-card border rounded-lg" >
                <User className="w-4 h-4 text-cyan-500" />
                <span>{user.name}</span>
              </div>
              <Button onClick={handleSignOut} variant="outline" className="hover:text-red-400 hover:border-red-400" >
                <LogOut className="w-4 h-4 mr-2" /> Sign Out </Button>
            </>)
            : (<>
              <Link href="/login" className="text-muted-foreground hover:text-foreground"> Sign In </Link>
              <Button asChild>
                <Link href="/login">Get Started</Link>
              </Button>
            </>)}
        </div>
      </nav>
    </header>)
}