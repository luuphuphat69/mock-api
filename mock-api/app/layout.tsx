import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mockapi – Test APIs Like a Pro",
  description: "Create mock endpoints, test APIs and share with your team. Build faster with no backend required. Using metrics table to check your APIs performance",
  keywords: ["mockapi", "mockapi.io", "mockapi io", "mock api", "www.mockapi.io", "mockapi.oi", "mock api io", "mock api.io"],
  icons: {
    icon: [
      { url: './favicon.ico', sizes: '48x48' }, 
    ],
  },
  robots: 'index, follow',
  authors: [{name: 'luuphuphat69', url: 'https://mockapi.io.vn'}],
  publisher: "luuphuphat69",
  alternates: {
    canonical: 'https://mockapi.io.vn',
  },
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
        {children}
      </body>
    </html>
  );
}