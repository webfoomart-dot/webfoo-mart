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
      case 'Pending': return { color: 'bg-orange-500/10 text-orange-500 border-orange-500/30', icon: Clock }
      case 'In Transit': return { color: 'bg-blue-500/10 text-blue-500 border-blue-500/30', icon: Truck }
      case 'Delivered': return { color: 'bg-secondary/10 text-secondary dark:text-[#CCFF00] border-secondary/30 dark:border-[#CCFF00]/30', icon: CheckCircle2 }
      case 'Cancelled': return { color: 'bg-red-500/10 text-red-500 border-red-500/30', icon: XCircle }
      default: return { color: 'bg-card/50 text-foreground border-border', icon: Package }
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300">
      <Header />
      <main className="container mx-auto pb-40 pt-24 px-4 max-w-3xl">
        <div className="flex items-center justify-between mb-8 relative z-20">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
            <Link href="/"><Button variant="ghost" size="icon" className="rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-primary"><ArrowLeft className="h-6 w-6" /></Button></Link>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter">Your <span className="text-primary">Orders</span></h1>
          </motion.div>

          {myPersonalOrders.length > 0 && (
            <div className="relative">
              <Button variant="outline" onClick={() => setIsFilterOpen(!isFilterOpen)} className="h-10 rounded-xl border-border hover:bg-muted text-foreground flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase hidden sm:inline">{activeFilter}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </Button>
              <AnimatePresence>
                {isFilterOpen && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 top-12 w-40 glass-strong bg-background/95 dark:bg-black/95 border border-primary/30 rounded-xl overflow-hidden flex flex-col z-50 shadow-xl">
                    {FILTERS.map(f => (
                      <button key={f} onClick={() => { setActiveFilter(f); setIsFilterOpen(false); }} className={`w-full text-left px-4 py-3 text-xs font-bold uppercase transition-colors ${activeFilter === f ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-black/10 dark:hover:bg-white/10'}`}>{f}</button>
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
              <Empty className="glass-strong border-primary/20 py-16 w-full max-w-md text-center bg-card">
                <EmptyContent>
                  <Package className="w-12 h-12 text-primary mx-auto mb-4" />
                  <EmptyTitle className="text-2xl font-black uppercase text-foreground">No Orders</EmptyTitle>
                  <EmptyDescription className="text-muted-foreground mb-6">Start exploring our grid!</EmptyDescription>
                  <Button asChild className="bg-secondary text-secondary-foreground dark:text-black font-black rounded-xl px-8 h-12 hover:bg-secondary/90"><Link href="/">SHOP NOW</Link></Button>
                </EmptyContent>
              </Empty>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order: any, idx) => {
                const StatusIcon = getStatusConfig(order.status).icon;
                
                // 🔥 NAYA: DELIVERY FEE CALCULATION
                // Agar subtotal nahi hai toh amount ko hi subtotal maan lenge (purane orders ke liye)
                const safeSubtotal = order.subtotal || order.amount;
                const safeDiscount = order.discount || 0;
                const calculatedDeliveryFee = order.amount - safeSubtotal + safeDiscount;

                return (
                  <motion.div key={idx} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="glass-strong border-border overflow-hidden bg-transparent">
                      <div className="bg-card/50 dark:bg-white/5 p-4 flex justify-between items-center border-b border-border">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono"><Clock className="w-3.5 h-3.5 text-primary" /><span>{order.time}</span></div>
                        <Badge className={`uppercase text-[10px] font-black h-7 px-3 ${getStatusConfig(order.status).color}`}><StatusIcon className="w-3 h-3 mr-1" />{order.status}</Badge>
                      </div>
                      <CardContent className="p-0 bg-card/20 dark:bg-transparent">
                        {order.items?.map((item: any, i: number) => (
                          <div key={i} className="p-4 flex items-center justify-between border-b border-border">
                            <div className="flex items-center gap-4">
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted border border-border"><Image src={item.image || "/placeholder.jpg"} alt={item.name} fill className="object-cover" /></div>
                              <div><p className="font-bold text-foreground text-sm leading-tight">{item.name}</p><p className="text-[10px] text-muted-foreground">Qty: {item.quantity}</p></div>
                            </div>
                            <p className="font-mono text-primary font-bold">₹{item.price * item.quantity}</p>
                          </div>
                        ))}
                        
                        {/* 🔥 NAYA: BILL BREAKDOWN SECTION */}
                        <div className="px-4 py-3 bg-card/30 dark:bg-white/5 border-b border-border space-y-1.5">
                          <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            <span>Subtotal</span><span>₹{safeSubtotal}</span>
                          </div>
                          {safeDiscount > 0 && (
                            <div className="flex justify-between text-[10px] font-bold text-secondary uppercase tracking-widest">
                              <span>Discount {order.promoCode ? `(${order.promoCode})` : ''}</span><span>-₹{safeDiscount}</span>
                            </div>
                          )}
                          {calculatedDeliveryFee > 0 && (
                            <div className="flex justify-between text-[10px] font-bold text-primary uppercase tracking-widest">
                              <span>Delivery Fee</span><span>+₹{calculatedDeliveryFee}</span>
                            </div>
                          )}
                        </div>

                        <div className="p-4 bg-muted/30 dark:bg-black/40 flex justify-between items-center">
                          <div className="flex items-start gap-2 text-xs text-muted-foreground max-w-[200px]"><MapPin className="w-3.5 h-3.5 text-primary" /><span className="truncate">{order.landmark}</span></div>
                          <div className="text-right"><p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Final Paid</p><p className="text-xl font-black text-secondary dark:text-[#CCFF00] font-mono">₹{order.amount}</p></div>
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
