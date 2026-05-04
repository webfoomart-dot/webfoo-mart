// @ts-nocheck
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import FloatingCart from "@/components/FloatingCart"
import SplashScreen from "@/components/SplashScreen" // 🔥 YAHAN NAYA SPLASH SCREEN IMPORT KIYA HAI
import { Analytics } from "@vercel/analytics/react" 
import { createClient } from '@supabase/supabase-js' 

// 🔥 NAYA: THEME PROVIDER IMPORT KIYA
import { ThemeProvider } from "@/components/ThemeProvider"

const inter = Inter({ subsets: ["latin"] })

// 🔥 Ye line zaroori hai taaki Next.js har baar naya color database se fetch kare
export const dynamic = 'force-dynamic'

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
  // 👇 YE RAHI TERI GOOGLE VERIFICATION TAAKI VERCEL NAAM HATT JAYE
  verification: {
    google: "UGPNhgCG0Nlc1SFBE4TtuNgrgXsesRS-DKo5OZGTL20",
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 🔥 DATABASE SE COLORS FETCH KARNE KA LOGIC
  let themeBg = "#050505"; 
  let themeText = "#ffffff"; 
  let themePrimary = "#00FFFF";
  let themeBtn = "#CCFF00";

  try {
    // ⚠️ WARNING: YAHAN APNA ASLI SUPABASE URL AUR ANON KEY DAALNA ⚠️
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yzuvlxvtszzvnzqymcvg.supabase.co'
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6dXZseHZ0c3p6dm56cXltY3ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMjMwNDcsImV4cCI6MjA4OTU5OTA0N30.2uPg1zu5i_dzWxVlxsZuHAoropwcb9GC1C-BHhbrXPI'
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data } = await supabase.from('theme_settings').select('*').eq('id', 1).single()
    if (data) {
      themeBg = data.background_color;
      themeText = data.text_color;
      themePrimary = data.primary_color;
      themeBtn = data.button_color;
    }
  } catch (error) {
    console.error("Theme Load Error:", error)
  }

  return (
    <html lang="en" suppressHydrationWarning>
      {/* pb-24 add kiya hai taaki niche scroll karne pe content capsule ke piche na chhupe */}
      <body 
        className={`${inter.className} antialiased selection:bg-[#00FFFF]/30 pb-24`}
        style={{ 
          /* Inline bg hataya taaki ThemeToggle kaam kare, vars preserve kiye hain */
          '--db-bg': themeBg, 
          '--db-text': themeText, 
          '--primary-color': themePrimary,
          '--btn-color': themeBtn 
        } as React.CSSProperties} 
      >
        {/* 🔥 THEME PROVIDER SE POORI APP KO WRAP KIYA 🔥 */}
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          
          {/* 🔥 YAHAN LAGA DIYA PREMIUM SPLASH SCREEN 🔥 */}
          <SplashScreen />

          {children}
          
          {/* 🔥 YAHAN ADD KIYA HAI MAGIC CAPSULE */}
          <FloatingCart />

          {/* 🔥 YAHAN ADD KIYA HAI VERCEL TRACKING */}
          <Analytics />
          
        </ThemeProvider>
      </body>
    </html>
  )
}
