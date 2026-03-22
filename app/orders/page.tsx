// @ts-nocheck
"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Package, Clock, MapPin, Truck, CheckCircle2, XCircle, Filter, ChevronDown } from "lucide-react"

import { useAppStore } from "@/lib/store"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Empty, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"
import { Badge } from "@/components/ui/badge"

const FILTERS = ['All', 'Pending', 'In Transit', 'Delivered', 'Cancelled']

export default function OrdersPage() {
  const [isMounted, setIsMounted] = React.useState(false)
  
  // User aur orders dono yahan nikal liye
  const { user, orders } = useAppStore() as any
  
  // Filter States
  const [activeFilter, setActiveFilter] = React.useState('All')
  const [isFilterOpen, setIsFilterOpen] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  // 🚀 FIXED LOGIC: Match based on PHONE number from your Supabase screenshot
  const myPersonalOrders = React.useMemo(() => {
    if (!user || !orders) return [];

    return orders.filter((order: any) => {
      // Login user ka phone
      const userPhone = user.phone;
      
      // Order table mein phone number match kar rahe hain
      // matchesId covers userId, user_id
      // matchesPhone covers direct phone matches
      return (
        order.phone === userPhone || 
        order.customer_phone === userPhone || 
        order.userId === user.id ||
        order.user_id === user.id
      );
    });
  }, [user, orders]);

  // 🔄 Filter logic + Reverse (Latest hamesha top pe) - Ab ye 'myPersonalOrders' pe chalega
  const filteredOrders = [...myPersonalOrders]
    .filter(order => activeFilter === 'All' ? true : order.status === activeFilter)
    .reverse()

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'Pending': 
        return { color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30', icon: Clock }
      case 'In Transit': 
        return { color: 'bg-blue-500/10 text-blue-500 border-blue-500/30', icon: Truck }
      case 'Delivered': 
        return { color: 'bg-[#CCFF00]/10 text-[#CCFF00] border-[#CCFF00]/30', icon: CheckCircle2 }
      case 'Cancelled': 
        return { color: 'bg-red-500/10 text-red-500 border-red-500/30', icon: XCircle }
      default: 
        return { color: 'bg-white/10 text-white border-white/20', icon: Package }
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-[#00FFFF]/30">
      <Header />

      <main className="container mx-auto pb-40 pt-24 px-4 max-w-3xl">
        
        {/* HEADER & SMART FILTER DROPDOWN */}
        <div className="flex items-center justify-between mb-8 relative z-20">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 text-[#00FFFF]">
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black italic tracking-tighter uppercase">
              Your <span className="text-[#00FFFF]">Orders</span>
            </h1>
          </motion.div>

          {/* 🎛️ NEW FEATURE: Compact Dropdown Filter */}
          {myPersonalOrders.length > 0 && (
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`h-10 rounded-xl transition-all border-white/20 flex items-center gap-2 px-3 sm:px-4 ${
                  isFilterOpen ? 'bg-white/10 text-white' : 'bg-white/5 text-muted-foreground hover:text-white'
                }`}
              >
                <Filter className="w-4 h-4 text-[#00FFFF]" />
                <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">
                  {activeFilter}
                </span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </Button>

              {/* Dropdown Menu Box */}
              <AnimatePresence>
                {isFilterOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-12 w-40 glass-strong bg-black/90 border border-[#00FFFF]/30 rounded-xl shadow-[0_0_20px_rgba(0,255,255,0.15)] overflow-hidden flex flex-col z-50"
                  >
                    {FILTERS.map(f => (
                      <button
                        key={f}
                        onClick={() => {
                          setActiveFilter(f)
                          setIsFilterOpen(false)
                        }}
                        className={`w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${
                          activeFilter === f 
                            ? 'bg-[#00FFFF]/20 text-[#00FFFF] border-l-2 border-[#00FFFF]' 
                            : 'text-muted-foreground hover:bg-white/10 hover:text-white border-l-2 border-transparent'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <AnimatePresence mode="popLayout">
          {myPersonalOrders.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center mt-10">
              <Empty className="glass-strong border-[#00FFFF]/20 py-16 w-full max-w-md">
                <EmptyContent>
                  <div className="bg-[#00FFFF]/10 p-4 rounded-full mb-4 shadow-[0_0_20px_rgba(0,255,255,0.2)] flex justify-center">
                    <Package className="w-12 h-12 text-[#00FFFF]" />
                  </div>
                  <EmptyTitle className="text-2xl font-black italic uppercase tracking-tighter text-center">No Orders Yet</EmptyTitle>
                  <EmptyDescription className="text-muted-foreground mb-6 text-center">You haven't initiated any teleportations. Start exploring our grid!</EmptyDescription>
                  <div className="flex justify-center">
                    <Button asChild className="bg-[#CCFF00] text-black font-black hover:bg-[#CCFF00]/90 h-12 px-8 rounded-xl shadow-[0_0_15px_rgba(204,255,0,0.3)]">
                      <Link href="/">SHOP NOW</Link>
                    </Button>
                  </div>
                </EmptyContent>
              </Empty>
            </motion.div>
          ) : filteredOrders.length === 0 ? (
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center mt-10">
              <Empty className="glass-strong border-white/10 py-16 w-full max-w-md">
                <EmptyContent>
                  <div className="flex justify-center mb-4"><Filter className="w-12 h-12 text-muted-foreground opacity-50" /></div>
                  <EmptyTitle className="text-xl font-black uppercase text-center">No {activeFilter} Orders</EmptyTitle>
                  <EmptyDescription className="text-muted-foreground text-center">You don't have any orders currently in this state.</EmptyDescription>
                </EmptyContent>
              </Empty>
            </motion.div>
          ) : (
            <div className="space-y-6 relative z-10">
              {filteredOrders.map((order: any, idx) => {
                const StatusIcon = getStatusConfig(order.status).icon;
                
                return (
                  <motion.div 
                    key={idx} 
                    layout
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="glass-strong border-white/10 overflow-hidden hover:border-white/20 transition-colors">
                      
                      {/* Top Bar: Time, Date & Status */}
                      <div className="bg-white/5 p-4 sm:px-6 border-b border-white/10 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                          <Clock className="w-3.5 h-3.5 text-[#00FFFF]" />
                          <span>{order.time}</span>
                        </div>
                        <Badge className={`uppercase text-[10px] font-black tracking-widest flex items-center gap-1.5 h-7 px-3 w-fit ${getStatusConfig(order.status).color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {order.status}
                        </Badge>
                      </div>
                      
                      <CardContent className="p-0">
                        {/* Items List */}
                        <div className="divide-y divide-white/5">
                          {order.items?.map((item: any, i: number) => (
                            <div key={i} className="p-4 sm:px-6 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white/5 border border-white/10">
                                  <Image src={item.image || "/placeholder.jpg"} alt={item.name} fill className="object-cover" />
                                </div>
                                <div>
                                  <p className="font-bold text-white leading-tight">{item.name}</p>
                                  <p className="text-xs text-muted-foreground mt-1 font-mono">Qty: {item.quantity}</p>
                                </div>
                              </div>
                              <p className="font-mono text-[#00FFFF] font-bold">₹{item.price * item.quantity}</p>
                            </div>
                          ))}
                        </div>
                        
                        {/* Bottom Bar: Address & Total */}
                        <div className="p-4 sm:px-6 bg-black/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-white/10">
                          <div className="flex items-start gap-2 text-sm text-muted-foreground max-w-sm">
                            <MapPin className="w-4 h-4 text-[#00FFFF] shrink-0 mt-0.5" />
                            <span className="leading-snug line-clamp-2">{order.landmark}</span>
                          </div>
                          <div className="text-left sm:text-right w-full sm:w-auto flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:items-end border-t border-white/5 sm:border-0 pt-3 sm:pt-0 mt-2 sm:mt-0">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total (COD)</p>
                            <p className="text-2xl font-black text-[#CCFF00] font-mono shadow-sm">₹{order.amount}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav />
    </div>
  )
}
