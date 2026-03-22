// @ts-nocheck
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Home, Package, User, LogIn, LayoutGrid } from "lucide-react"

import { useAppStore } from "@/lib/store"

export function BottomNav() {
  const pathname = usePathname()
  
  const { user } = useAppStore() as any
  
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  const navItems = user 
    ? [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Categories', href: '/categories', icon: LayoutGrid },
        { name: 'Orders', href: '/orders', icon: Package },
        { name: 'Profile', href: '/profile', icon: User },
      ]
    : [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Login', href: '/profile', icon: LogIn }, 
      ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-2xl rounded-t-[40px] overflow-hidden border-t border-white/10 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link 
              key={item.name} 
              href={item.href} 
              className="relative flex-1 flex flex-col items-center gap-1.5"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`p-2 rounded-xl transition-all duration-300 relative ${
                  isActive 
                    ? 'bg-white/10 text-[#00FFFF] shadow-[0_0_15px_rgba(0,255,255,0.2)]' 
                    : 'text-muted-foreground hover:text-white/80'
                }`}
              >
                <Icon className="w-5 h-5" />
              </motion.div>
              
              <span 
                className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                  isActive ? 'text-[#00FFFF]' : 'text-muted-foreground'
                }`}
              >
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
