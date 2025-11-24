"use client";

import Link from "next/link";
import { useUser } from "../hooks/useUser";
import { logout } from "@/utilities/api/api";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { User, LogOut, Sun, Moon } from "lucide-react";
import { useProjects } from "@/hooks/useProject";
import Image from "next/image";
import { useTheme } from "next-themes";
import gsap from "gsap";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const { user, loading, fetchUser, clearUser } = useUser();
  const { clearProjects } = useProjects();

  const { theme, setTheme } = useTheme();

  // Optional GSAP animation
  const themeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (!themeRef.current) return;

    const el = themeRef.current;

    const onEnter = () =>
      gsap.to(el, {
        y: -3,
        duration: 0.3,
        ease: "power2.out",
      });

    const onLeave = () =>
      gsap.to(el, {
        y: 0,
        duration: 0.3,
        ease: "power2.out",
      });

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);

    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await logout();
      clearUser();
      clearProjects();
      router.push("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (pathname === "/login") return null;

  return (
    <header className="fixed top-0 w-full border-b bg-background/90 backdrop-blur z-50">
      <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br rounded-lg flex items-center justify-center">
            <Image src="/icon.png" width={700} height={700} alt="logo" />
          </div>
          <span className="font-bold text-lg">MockAPI</span>
        </Link>

        <div className="flex items-center gap-4">

          {/* Docs */}
          <Link
            href="/docs"
            className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
          >
            Docs
          </Link>

          {/* === 🌗 Theme Toggle Button Added Here === */}
          <Button
            ref={themeRef}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            variant="outline"
            size="icon"
            className="border-border text-foreground bg-transparent"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          {/* Auth logic (unchanged) */}
          {!loading && user ? (
            <>
              <div
                onClick={() => router.push("/projects")}
                className="flex items-center gap-2 px-4 py-2 bg-card border rounded-lg cursor-pointer"
              >
                <User className="w-4 h-4 text-cyan-500" />
                <span>{user.name}</span>
              </div>

              <Button
                onClick={handleSignOut}
                variant="outline"
                className="hover:text-red-400 hover:border-red-400"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-muted-foreground hover:text-foreground"
              >
                Sign In
              </Link>

              <Button asChild>
                <Link href="/login">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}