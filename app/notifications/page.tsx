"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, BellOff, Package, CheckCircle2, Clock, MessageSquare, X } from "lucide-react"

import { useAppStore } from "@/lib/store"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Empty, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"

export default function NotificationsPage() {
  const [isMounted, setIsMounted] = React.useState(false)
  
  const [hiddenNotifs, setHiddenNotifs] = React.useState<string[]>([])
  
  // 🔥 FETCH USER ALONG WITH ORDERS AND NOTIFICATIONS
  const { orders, notifications: adminNotes, markNotificationRead, user } = useAppStore() as any

  React.useEffect(() => {
    setIsMounted(true)
    const savedHidden = localStorage.getItem('webfoo-hidden-notifs')
    if (savedHidden) {
      try { setHiddenNotifs(JSON.parse(savedHidden)) } catch (e) {}
    }
  }, [])

  const handleHideNotification = (e: React.MouseEvent, id: string) => {
    e.stopPropagation() 
    const newHidden = [...hiddenNotifs, id]
    setHiddenNotifs(newHidden)
    localStorage.setItem('webfoo-hidden-notifs', JSON.stringify(newHidden))
  }

  const notifications = React.useMemo(() => {
    if (!user) return []; // Agar user login nahi hai to kuch mat dikhao

    const orderNotifs: any[] = []
    
    // 🔥 SIRF CURRENT USER KE ORDERS FILTER KARO
    const userOrders = orders.filter((o: any) => o.phone === user.phone)

    userOrders.forEach((order: any, index: number) => {
      orderNotifs.push({
        id: `placed-${order.id || index}`, 
        title: "Order Placed Successfully! 🚀",
        message: `Your WebFoo Mart order of ₹${order.amount} has been received. We are preparing it for teleportation!`,
        time: order.time,
        icon: 'package',
        unread: order.status === 'Pending' 
      })

      if (order.status.toLowerCase() === 'delivered' || order.status.toLowerCase() === 'completed') {
        orderNotifs.push({
          id: `delivered-${order.id || index}`,
          title: "Order Delivered! ✅",
          message: `Your order of ₹${order.amount} has been successfully teleported to your drop coordinates. Enjoy!`,
          time: order.time,
          icon: 'success',
          unread: true // ya aap ise logic se control kar sakte hain
        })
      }
    })

    // 🔥 SIRF CURRENT USER KE NOTIFICATIONS FILTER KARO
    const userAdminNotes = (adminNotes || []).filter((note: any) => note.phone === user.phone)
    
    const formattedAdminNotes = userAdminNotes.map((note: any) => ({
      id: note.id,
      title: "WebFoo Update 📢",
      message: note.message,
      time: note.time,
      icon: 'message',
      unread: !note.read,
      isAdminNote: true
    }))

    const combined = [...formattedAdminNotes, ...orderNotifs]
    
    const visible = combined.filter(n => !hiddenNotifs.includes(n.id))

    visible.sort((a, b) => {
      const timeA = new Date(a.time).getTime()
      const timeB = new Date(b.time).getTime()
      return (timeB || 0) - (timeA || 0)
    })

    return visible
  }, [orders, adminNotes, hiddenNotifs, user])

  const getIcon = (type: string) => {
    switch(type) {
      case 'package': return <Package className="w-6 h-6 text-[#00FFFF]" />
      case 'success': return <CheckCircle2 className="w-6 h-6 text-[#CCFF00]" />
      case 'message': return <MessageSquare className="w-6 h-6 text-[#00FFFF]" />
      default: return <Clock className="w-6 h-6 text-white" />
    }
  }

  if (!isMounted) return null

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-[#00FFFF]/30">
      <Header />

      <main className="container mx-auto pb-40 pt-24 px-4 max-w-2xl">
        
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-4 mb-8"
        >
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 text-[#00FFFF]">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <h1 className="text-3xl font-black tracking-tighter flex items-center gap-2 uppercase text-[#00FFFF]">
            Updates
          </h1>
        </motion.div>

        {/* Content Area */}
        <AnimatePresence mode="popLayout">
          {/* 🔥 AGAR LOGIN NAHI HAI YA ALERTS NAHI HAIN */}
          {!user ? (
            <motion.div key="unauth" className="flex justify-center mt-10">
              <Empty className="glass-strong border-[#00FFFF]/20 py-16 w-full max-w-md">
                <EmptyContent>
                  <div className="bg-[#00FFFF]/10 p-4 rounded-full mb-4 shadow-[0_0_20px_rgba(0,255,255,0.2)]">
                    <BellOff className="w-12 h-12 text-[#00FFFF]" />
                  </div>
                  <EmptyTitle className="text-2xl font-black uppercase tracking-tighter">Login Required</EmptyTitle>
                  <EmptyDescription className="text-muted-foreground mb-4">Please log in to your account to view your personal updates and order status.</EmptyDescription>
                  <Button asChild className="mt-4 bg-[#CCFF00] text-black font-black hover:bg-[#CCFF00]/90 rounded-xl px-8 h-12"><Link href="/profile">GO TO LOGIN</Link></Button>
                </EmptyContent>
              </Empty>
            </motion.div>
          ) : notifications.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex justify-center mt-10">
              <Empty className="glass-strong border-[#00FFFF]/20 py-16 w-full max-w-md">
                <EmptyContent>
                  <div className="bg-[#00FFFF]/10 p-4 rounded-full mb-4 shadow-[0_0_20px_rgba(0,255,255,0.2)]"><BellOff className="w-12 h-12 text-[#00FFFF]" /></div>
                  <EmptyTitle className="text-2xl font-black uppercase tracking-tighter">No Updates</EmptyTitle>
                  <EmptyDescription className="text-muted-foreground mb-4">Looks like you haven't placed any orders yet. Start shopping to see live updates here!</EmptyDescription>
                  <Button asChild className="mt-4 bg-[#CCFF00] text-black font-black hover:bg-[#CCFF00]/90 rounded-xl px-8 h-12"><Link href="/">SHOP NOW</Link></Button>
                </EmptyContent>
              </Empty>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {notifications.map((note) => (
                <motion.div key={note.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: "spring" as const, stiffness: 300, damping: 30 }}>
                  <Card 
                    onClick={() => { if (note.isAdminNote && note.unread) markNotificationRead(note.id) }}
                    className={`glass-strong transition-colors relative overflow-hidden ${note.unread ? 'border-[#00FFFF]/40' : 'border-white/10'} ${note.isAdminNote ? 'cursor-pointer' : ''}`}
                  >
                    {note.unread && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00FFFF] shadow-[0_0_10px_#00FFFF]" />}
                    <CardContent className="p-4 sm:p-5 flex gap-4 items-start">
                      <div className={`p-3 rounded-xl shrink-0 ${note.icon === 'success' ? 'bg-[#CCFF00]/10' : 'bg-[#00FFFF]/10'}`}>{getIcon(note.icon)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <h4 className="font-bold text-white text-sm sm:text-base leading-tight">{note.title}</h4>
                          <div className="flex items-center gap-3 shrink-0 mt-0.5">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{note.time}</span>
                            <button onClick={(e) => handleHideNotification(e, note.id)} className="text-muted-foreground hover:text-red-500 transition-colors" title="Delete Update"><X className="w-4 h-4" /></button>
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{note.message}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav />
    </div>
  )
}
