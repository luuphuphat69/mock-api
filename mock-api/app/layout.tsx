import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import { SpeedInsights } from "@vercel/speed-insights/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MockAPI – Build Mock Endpoints Effortlessly",
  description:
    "Create mock routes, simulate responses, and collaborate with your team. Speed up development without backend dependencies. Track performance with built-in analytics.",
  keywords: [
    "mockapi tool",
    "mock endpoints generator",
    "API simulation",
    "mock routes",
    "mock server",
    "api prototype"
  ],
  publisher: "luuphuphat69",
  authors: [{ name: "luuphuphat69", url: "https://mockapi.io.vn" }],
  icons: {
    icon: [{ url: "./favicon.ico", sizes: "48x48" }],
  },
  robots: "index, follow",
  alternates: { canonical: "https://mockapi.io.vn" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster />
        <SpeedInsights/>
        {children}
      </body>
    </html>
  );
}