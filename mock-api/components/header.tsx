import Link from "next/link"
import { useUser } from "../hooks/useUser"
import { logout } from "@/utilities/api/api"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { User, LogOut, ChevronDown, Database, BookOpen, LockIcon, Shield } from "lucide-react"
import { useProjects } from "@/hooks/useProject"
import Image from 'next/image';

export default function Header() {
  const router = useRouter()
  const { user, loading, fetchUser, clearUser } = useUser()
  const { clearProjects } = useProjects();
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await logout() // Backend clears cookie 
      clearUser() // Frontend clears store 
      clearProjects();
      window.location.reload();
      router.refresh();
      router.push("/");
    } catch (err) {
      console.error("Logout error:", err)
    }
  }

  return (
    <header className="fixed top-0 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#0D0D0D]/80 backdrop-blur-md z-50">
      <nav className="px-6 h-16 flex items-center justify-between">
        <Link title="logo" href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded flex items-center justify-center transition-transform group-hover:scale-105">
            <Image title="logo" src='/icon.png' width={32} height={32} alt="logo" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-bold text-base tracking-tight text-gray-900 dark:text-white uppercase">MockAPI</span>
            <span className="text-[10px] font-mono text-gray-400 font-bold tracking-tighter uppercase">Create and explore mock endpoints</span>
          </div>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            title="docs"
            href="/docs"
            className="flex items-center gap-2 text-gray-500 hover:text-[#2F6FEB] transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Docs
          </Link>

          {!loading && user ? (
            <div className="flex items-center gap-4">
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-[#2F6FEB] transition-all group"
                >
                  <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#2F6FEB] transition-colors" />
                  </div>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 tracking-tight">{user.name}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-300 ${showDropdown ? "rotate-180" : ""}`}
                  />
                </button>

                {showDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-52 bg-white dark:bg-[#0D0D0D] border border-gray-200 dark:border-gray-800 rounded shadow-xl py-1 z-50 animate-in">
                    <button
                      onClick={() => {
                        router.push("/projects")
                        setShowDropdown(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-[#2F6FEB] transition-colors uppercase tracking-widest"
                    >
                      <Database className="w-3.5 h-3.5" />
                      Projects
                    </button>
                                        <button
                      onClick={() => {
                        router.push("/profile")
                        setShowDropdown(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-[#2F6FEB] transition-colors uppercase tracking-widest"
                    >
                      <User className="w-3.5 h-3.5" />
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        router.push("/change-password")
                        setShowDropdown(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-[#2F6FEB] transition-colors border-t border-gray-100 dark:border-gray-800 uppercase tracking-widest"
                    >
                      <LockIcon className="w-3.5 h-3.5" />
                      Changes pass
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors border-t border-gray-100 dark:border-gray-800 uppercase tracking-widest"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-gray-900 dark:hover:text-white transition-colors px-4 py-2"
              >
                Sign In
              </Link>
              <Button
                asChild
                className="bg-[#2F6FEB] text-white hover:bg-[#2563EB] rounded px-5 py-2 h-9 text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95"
              >
                <Link href="/login">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}