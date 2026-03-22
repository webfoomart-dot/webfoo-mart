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
  
  // Store se data nikal rahe hain
  const { user, orders } = useAppStore() as any
  
  const [activeFilter, setActiveFilter] = React.useState('All')
  const [isFilterOpen, setIsFilterOpen] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  // SAFE FILTER: Ye crash nahi hone dega
  const myPersonalOrders = React.useMemo(() => {
    if (!isMounted || !user || !orders) return [];

    return orders.filter((order: any) => {
      // Supabase Phone Match
      const userPhone = user?.phone || "";
      const userId = user?.id || "";
      
      return (
        (order.phone && order.phone === userPhone) || 
        (order.customer_phone && order.customer_phone === userPhone) || 
        (order.userId && order.userId === userId)
      );
    });
  }, [isMounted, user, orders]);

  if (!isMounted) return null

  const filteredOrders = [...myPersonalOrders]
    .filter(order => activeFilter === 'All' ? true : order.status === activeFilter)
    .reverse()

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'Pending': return { color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30', icon: Clock }
      case 'In Transit': return { color: 'bg-blue-500/10 text-blue-500 border-blue-500/30', icon: Truck }
      case 'Delivered': return { color: 'bg-[#CCFF00]/10 text-[#CCFF00] border-[#CCFF00]/30', icon: CheckCircle2 }
      case 'Cancelled': return { color: 'bg-red-500/10 text-red-500 border-red-500/30', icon: XCircle }
      default: return { color: 'bg-white/10 text-white border-white/20', icon: Package }
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Header />
      <main className="container mx-auto pb-40 pt-24 px-4 max-w-3xl">
        <div className="flex items-center justify-between mb-8 relative z-20">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
            <Link href="/"><Button variant="ghost" size="icon" className="rounded-full text-[#00FFFF]"><ArrowLeft className="h-6 w-6" /></Button></Link>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter">Your <span className="text-[#00FFFF]">Orders</span></h1>
          </motion.div>

          {myPersonalOrders.length > 0 && (
            <div className="relative">
              <Button variant="outline" onClick={() => setIsFilterOpen(!isFilterOpen)} className="h-10 rounded-xl border-white/20 flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#00FFFF]" />
                <span className="text-xs font-bold uppercase hidden sm:inline">{activeFilter}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </Button>
              <AnimatePresence>
                {isFilterOpen && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 top-12 w-40 glass-strong bg-black/95 border border-[#00FFFF]/30 rounded-xl overflow-hidden flex flex-col z-50">
                    {FILTERS.map(f => (
                      <button key={f} onClick={() => { setActiveFilter(f); setIsFilterOpen(false); }} className={`w-full text-left px-4 py-3 text-xs font-bold uppercase transition-colors ${activeFilter === f ? 'bg-[#00FFFF]/20 text-[#00FFFF]' : 'text-muted-foreground hover:bg-white/10'}`}>{f}</button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <AnimatePresence mode="popLayout">
          {myPersonalOrders.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center mt-10">
              <Empty className="glass-strong border-[#00FFFF]/20 py-16 w-full max-w-md text-center">
                <EmptyContent>
                  <Package className="w-12 h-12 text-[#00FFFF] mx-auto mb-4" />
                  <EmptyTitle className="text-2xl font-black uppercase">No Orders</EmptyTitle>
                  <EmptyDescription className="text-muted-foreground mb-6">Start exploring our grid!</EmptyDescription>
                  <Button asChild className="bg-[#CCFF00] text-black font-black rounded-xl px-8 h-12"><Link href="/">SHOP NOW</Link></Button>
                </EmptyContent>
              </Empty>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order: any, idx) => {
                const StatusIcon = getStatusConfig(order.status).icon;
                return (
                  <motion.div key={idx} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="glass-strong border-white/10 overflow-hidden">
                      <div className="bg-white/5 p-4 flex justify-between items-center border-b border-white/10">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono"><Clock className="w-3.5 h-3.5 text-[#00FFFF]" /><span>{order.time}</span></div>
                        <Badge className={`uppercase text-[10px] font-black h-7 px-3 ${getStatusConfig(order.status).color}`}><StatusIcon className="w-3 h-3" />{order.status}</Badge>
                      </div>
                      <CardContent className="p-0">
                        {order.items?.map((item: any, i: number) => (
                          <div key={i} className="p-4 flex items-center justify-between border-b border-white/5">
                            <div className="flex items-center gap-4">
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white/5"><Image src={item.image || "/placeholder.jpg"} alt={item.name} fill className="object-cover" /></div>
                              <div><p className="font-bold text-white text-sm leading-tight">{item.name}</p><p className="text-[10px] text-muted-foreground">Qty: {item.quantity}</p></div>
                            </div>
                            <p className="font-mono text-[#00FFFF] font-bold">₹{item.price * item.quantity}</p>
                          </div>
                        ))}
                        <div className="p-4 bg-black/40 flex justify-between items-center">
                          <div className="flex items-start gap-2 text-xs text-muted-foreground max-w-[200px]"><MapPin className="w-3.5 h-3.5 text-[#00FFFF]" /><span className="truncate">{order.landmark}</span></div>
                          <div className="text-right"><p className="text-[10px] font-black text-muted-foreground uppercase">Total</p><p className="text-xl font-black text-[#CCFF00] font-mono">₹{order.amount}</p></div>
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
