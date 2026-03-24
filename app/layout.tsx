import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import FloatingCart from "@/components/FloatingCart"
import { Analytics } from "@vercel/analytics/react" // 🔥 VERCEL ANALYTICS IMPORT
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ["latin"] })

// 📱 VIEWPORT: Phone screen ke liye perfect sizing
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#050505",
}

// 🌐 METADATA & PWA TAGS
export const metadata: Metadata = {
  title: "WebFoo Mart",
  description: "Teleporting Flavors to You",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WebFoo Mart",
  },
  formatDetection: {
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      {/* pb-24 add kiya hai taaki niche scroll karne pe content capsule ke piche na chhupe */}
      <body className={`${inter.className} bg-[#050505] text-white antialiased selection:bg-[#00FFFF]/30 pb-24`}>
        {children}
        
        {/* 🔥 YAHAN ADD KIYA HAI MAGIC CAPSULE */}
        <FloatingCart />

        {/* 🔥 YAHAN ADD KIYA HAI VERCEL TRACKING */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
