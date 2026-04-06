import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { TRPCProvider } from "@/lib/trpc/provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "ChooseYourAgent",
  description: "Multi-model AI chat platform",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-[#0f0f0f] font-sans text-white">
        <TRPCProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </TRPCProvider>
      </body>
    </html>
  )
}
