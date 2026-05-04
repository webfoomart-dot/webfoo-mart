// @ts-nocheck
"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, User, Phone, MapPin, Save, Camera, CheckCircle2, LogOut, Headphones, Lock, Zap, Sun, Moon } from "lucide-react"

import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useAppStore } from "@/lib/store"

export default function ProfilePage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [isMounted, setIsMounted] = React.useState(false)
  const [isSaved, setIsSaved] = React.useState(false)
  
  const { user, logout, login, register } = useAppStore() as any
  
  const [authMode, setAuthMode] = React.useState<'login' | 'register'>('login')
  const [authData, setAuthData] = React.useState({ phone: '', password: '', name: '' })
  const [authError, setAuthError] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  const [profile, setProfile] = React.useState({ name: '', phone: '', address: '' })

  // 🔥 THE FIX: Har user ke liye uske phone number wala alag storage key banaya
  React.useEffect(() => {
    setIsMounted(true)
    if (user) {
      let savedAddress = ''
      try {
        // Phone number use karke unique dabba dhoondho
        const storageKey = `webfoo_profile_${user.phone}`
        const localData = JSON.parse(localStorage.getItem(storageKey) || '{}')
        if (localData.address) savedAddress = localData.address
      } catch (e) {}

      setProfile({ 
        name: user.name || '', 
        phone: user.phone || '', 
        address: savedAddress 
      })
    }
  }, [user])

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setIsLoading(true)
    
    const result = authMode === 'login' 
      ? await login(authData.phone, authData.password)
      : await register(authData.phone, authData.name, authData.password)
    
    setIsLoading(false)
    if (!result.success) {
      setAuthError(result.message)
    }
  }

  // 🔥 SAVE ADDRESS TO MEMORY (Unique box mein save hoga ab)
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    // Wahi unique dabbe mein save karo
    const storageKey = `webfoo_profile_${user.phone}`
    localStorage.setItem(storageKey, JSON.stringify(profile))
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleSupport = () => {
    alert("Comm-Link established! Our WebFoo Support Ninjas will be with you shortly. 🚀")
  }

  if (!isMounted) return null

  // 🛡️ BROWSE MODE (GUEST)
  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300">
        <Header />
        <main className="container mx-auto pb-40 pt-24 px-4 flex items-center justify-center min-h-[70vh]">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md bg-card border border-border rounded-[2rem] p-8 relative overflow-hidden shadow-xl dark:shadow-[0_0_30px_rgba(0,255,255,0.05)]">
              
             <div className="text-center mb-8">
               {/* 🚀 LOGO ADDED HERE IN CIRCLE SHAPE */}
               <div className="w-24 h-24 mx-auto mb-4 relative rounded-full overflow-hidden border-2 border-primary shadow-[0_0_20px_rgba(0,139,139,0.3)] dark:shadow-[0_0_20px_rgba(0,255,255,0.3)]">
                 <Image src="/logo.png" alt="WebFoo Mart" fill className="object-cover" />
               </div>
               <h2 className="text-3xl font-black uppercase text-foreground tracking-tighter">
                 {authMode === 'login' ? 'Welcome Back' : 'NEW USER'}
               </h2>
             </div>

             {authError && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-black text-center uppercase tracking-widest">{authError}</div>}

             <form onSubmit={handleAuthSubmit} className="space-y-4">
               {authMode === 'register' && (
                 <div className="relative">
                   <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                   <Input required placeholder="Full Name" value={authData.name} onChange={(e) => setAuthData({...authData, name: e.target.value})} className="pl-12 h-14 bg-background dark:bg-white/5 border-border text-foreground rounded-xl font-bold" />
                 </div>
               )}
               <div className="relative">
                 <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                 <Input required type="tel" placeholder="Phone Number" value={authData.phone} onChange={(e) => setAuthData({...authData, phone: e.target.value})} className="pl-12 h-14 bg-background dark:bg-white/5 border-border text-foreground rounded-xl font-bold font-mono" />
               </div>
               <div className="relative">
                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                 <Input required type="password" placeholder="Password" value={authData.password} onChange={(e) => setAuthData({...authData, password: e.target.value})} className="pl-12 h-14 bg-background dark:bg-white/5 border-border text-foreground rounded-xl font-bold" />
               </div>
               <Button type="submit" disabled={isLoading} className={`w-full h-14 font-black text-lg mt-4 shadow-lg ${authMode === 'login' ? 'bg-secondary text-secondary-foreground dark:text-black hover:bg-secondary/90' : 'bg-primary text-primary-foreground dark:text-black hover:bg-primary/90'}`}>
                 {isLoading ? 'PROCESSING...' : (authMode === 'login' ? 'Login' : 'CREATE ACCOUNT')}
               </Button>
             </form>
             <div className="mt-8 text-center border-t border-border pt-6">
                <button type="button" onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }} className={`text-sm font-black uppercase tracking-widest ${authMode === 'login' ? 'text-primary' : 'text-secondary'}`}>
                  {authMode === 'login' ? 'Register Now' : 'Login Here'}
                </button>
             </div>
          </motion.div>
        </main>
        <BottomNav />
      </div>
    )
  }

  // 👤 ORIGINAL PROFILE UI
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 transition-colors duration-300">
      <Header />

      <main className="container mx-auto pb-40 pt-24 px-4 max-w-2xl">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4 mb-8">
          <Link href="/"><Button variant="ghost" size="icon" className="rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-primary"><ArrowLeft className="h-6 w-6" /></Button></Link>
          <h1 className="text-3xl font-black tracking-tighter flex items-center gap-2 uppercase">Your <span className="text-primary">Profile</span></h1>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-strong border-primary/20 rounded-2xl overflow-hidden relative shadow-[0_0_30px_rgba(0,139,139,0.05)] dark:shadow-[0_0_30px_rgba(0,255,255,0.05)]">
            <CardContent className="p-6 sm:p-8 bg-card/50 dark:bg-transparent">
              <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border">
                <div className="w-24 h-24 rounded-full bg-background dark:bg-black/40 border-2 border-primary flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(0,139,139,0.3)] dark:shadow-[0_0_15px_rgba(0,255,255,0.3)]">
                  <User className="w-12 h-12 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-foreground ">{profile.name || "Cyber Shopper"}</h2>
                  <p className="text-secondary font-mono text-sm mt-1 uppercase">WebFoo Member</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Full Name</Label>
                  <Input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="bg-background dark:bg-black/50 border-border text-foreground h-12 font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /> Phone Number</Label>
                  <Input disabled value={profile.phone} className="bg-muted border-border text-muted-foreground h-12 font-mono cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Address</Label>
                  <Input placeholder="Enter address" value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} className="bg-background dark:bg-black/50 border-border text-foreground h-12 font-bold" />
                </div>
                <div className="pt-4 flex items-center justify-between">
                  {isSaved ? (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-secondary font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5" /> UPDATED!
                    </motion.div>
                  ) : <div />}
                  <Button type="submit" className="h-12 px-8 rounded-xl bg-primary text-primary-foreground dark:text-black font-black hover:bg-primary/90 shadow-[0_0_15px_rgba(0,139,139,0.3)] dark:shadow-[0_0_15px_rgba(0,255,255,0.3)] uppercase">
                    <Save className="w-4 h-4 mr-2" /> SAVE DETAILS
                  </Button>
                </div>
              </form>

              <div className="mt-10 pt-8 border-t border-border flex flex-col gap-4">
                {/* 🔥 NAYA THEME TOGGLE BUTTON YAHAN HAI 🔥 */}
                <button 
                  type="button"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="w-full flex items-center justify-between p-4 bg-card border border-border rounded-xl shadow-sm hover:border-foreground/30 transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-muted p-2 rounded-lg">
                      {theme === 'dark' ? <Moon className="w-5 h-5 text-emerald-500" /> : <Sun className="w-5 h-5 text-amber-500" />}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm uppercase tracking-widest text-foreground">App Theme</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{theme === 'dark' ? 'Dark Mode Active' : 'Light Mode Active'}</p>
                    </div>
                  </div>
                  <div className="bg-muted px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest text-foreground border border-border">
                    Switch
                  </div>
                </button>

                <Button type="button" variant="outline" onClick={handleSupport} className="w-full h-12 rounded-xl border-border text-foreground hover:bg-muted flex items-center justify-center gap-2">
                  <Headphones className="w-5 h-5 text-primary" /> HELP & SUPPORT
                </Button>
                <Button type="button" variant="outline" onClick={handleLogout} className="w-full h-12 rounded-xl border-red-500/30 text-red-500 font-bold hover:bg-red-500/10 flex items-center justify-center gap-2 transition-all active:scale-95 uppercase">
                  <LogOut className="w-5 h-5" /> LOG OUT
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <BottomNav />
    </div>
  )
}
