"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag, Loader2, Tag, CheckCircle2, XCircle } from "lucide-react"

import { useAppStore } from "@/lib/store"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Empty, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"

export default function CartPage() {
  const [isMounted, setIsMounted] = React.useState(false)
  
  const { cart, removeFromCart, updateQuantity, getCartTotal, promoCodes } = useAppStore() as any
  const totalAmount = getCartTotal()

  const [promoInput, setPromoInput] = React.useState("")
  const [appliedPromo, setAppliedPromo] = React.useState<any>(null)
  const [promoError, setPromoError] = React.useState("")

  React.useEffect(() => {
    setIsMounted(true)
    // 🔥 NAYA: Page load hote hi check karega agar koi code pehle se applied tha
    const savedPromo = localStorage.getItem('webfoo_applied_promo')
    if(savedPromo) {
      try { setAppliedPromo(JSON.parse(savedPromo)) } catch(e){}
    }
  }, [])

  const handleApplyPromo = () => {
    setPromoError("");
    
    if (!promoInput.trim()) {
      setPromoError("Please enter a code!");
      return;
    }

    const activeCodes = promoCodes || [];
    const code = activeCodes.find((p: any) => p.code.trim().toUpperCase() === promoInput.trim().toUpperCase() && p.isActive);
    
    if (!code) {
      setPromoError("Invalid or Expired Code!");
      setAppliedPromo(null);
      localStorage.removeItem('webfoo_applied_promo'); // Remove if invalid
      return;
    }
    if (totalAmount < code.minOrder) {
      setPromoError(`Min. order ₹${code.minOrder} required!`);
      setAppliedPromo(null);
      localStorage.removeItem('webfoo_applied_promo');
      return;
    }
    
    setAppliedPromo(code);
    setPromoInput("");
    // 🔥 NAYA: Apply hote hi local memory me save kar liya taaki Checkout padh sake
    localStorage.setItem('webfoo_applied_promo', JSON.stringify(code));
  }

  const removePromo = () => {
    setAppliedPromo(null);
    localStorage.removeItem('webfoo_applied_promo');
  }

  const discountAmount = appliedPromo 
    ? (appliedPromo.type === 'flat' ? appliedPromo.value : Math.round((totalAmount * appliedPromo.value) / 100))
    : 0;

  const finalAmount = totalAmount - discountAmount;

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans">
        <Header /><main className="container mx-auto pb-40 pt-24 px-4 flex justify-center items-center h-[60vh]"><Loader2 className="w-12 h-12 text-[#00FFFF] animate-spin opacity-50" /></main><BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-[#00FFFF]/30">
      <Header />
      <main className="container mx-auto pb-40 pt-24 px-4 max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/"><Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 text-[#00FFFF]"><ArrowLeft className="h-6 w-6" /></Button></Link>
          <h1 className="text-3xl font-black italic tracking-tighter flex items-center gap-2 uppercase">Your <span className="text-[#00FFFF]">Cart</span></h1>
        </div>

        <AnimatePresence mode="popLayout">
          {cart.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex justify-center mt-10">
              <Empty className="glass-strong border-[#00FFFF]/20 py-16 w-full max-w-md">
                <EmptyContent>
                  <div className="bg-[#00FFFF]/10 p-4 rounded-full mb-4"><ShoppingBag className="w-12 h-12 text-[#00FFFF]" /></div>
                  <EmptyTitle className="text-2xl font-black italic uppercase tracking-tighter">Cart is empty</EmptyTitle>
                  <EmptyDescription className="text-muted-foreground mb-6">Looks like you haven't teleported anything yet!</EmptyDescription>
                  <Button asChild className="bg-[#CCFF00] text-black font-black hover:bg-[#CCFF00]/90 shadow-[0_0_20px_rgba(204,255,0,0.4)] px-8 py-6 h-auto text-lg rounded-xl transition-all hover:scale-105 active:scale-95"><Link href="/">CONTINUE SHOPPING</Link></Button>
                </EmptyContent>
              </Empty>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {cart.map((item: any) => (
                <motion.div key={item.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <Card className="glass-strong border-white/5 overflow-hidden group hover:border-[#00FFFF]/30 transition-colors">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="relative h-20 w-20 shrink-0 rounded-xl overflow-hidden border border-white/10 bg-muted/20"><Image src={item.image || "/placeholder.jpg"} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" /></div>
                      <div className="flex-1 min-w-0"><h3 className="font-bold text-lg truncate leading-tight">{item.name}</h3><p className="text-[#00FFFF] font-mono font-bold mt-1">₹{item.price}</p></div>
                      <div className="flex flex-col items-end gap-3 min-w-[120px]">
                        <div className="flex items-center gap-1 glass rounded-full p-1 border-white/10">
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-white/10" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus className="h-4 w-4" /></Button>
                          <input type="number" min="1" value={item.quantity} onChange={(e) => { const newQ = parseInt(e.target.value); if (!isNaN(newQ) && newQ > 0) updateQuantity(item.id, newQ); }} className="w-10 text-center bg-transparent border-none text-white font-black font-mono text-base focus:outline-none" />
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-white/10 text-[#CCFF00]" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
                        </div>
                        <div className="flex items-center gap-2"><span className="font-black text-lg font-mono">₹{item.price * item.quantity}</span><Button variant="ghost" size="icon" className="text-destructive/50 hover:text-destructive hover:bg-destructive/10 h-8 w-8" onClick={() => removeFromCart(item.id)}><Trash2 className="h-4 w-4" /></Button></div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              <motion.div layout className="mt-8 p-5 glass-strong border border-white/10 rounded-2xl">
                <div className="flex items-center gap-2 mb-4 text-[#00FFFF]"><Tag className="w-4 h-4" /><span className="text-xs font-black uppercase tracking-widest">WebFoo Promo Code</span></div>
                <div className="flex gap-2">
                  <Input placeholder="ENTER CODE" value={promoInput} onChange={(e) => setPromoInput(e.target.value.toUpperCase())} className="bg-black/50 border-white/10 text-white font-mono uppercase h-11 focus:border-[#00FFFF]" />
                  <Button onClick={handleApplyPromo} className="bg-white/10 text-white hover:bg-[#00FFFF] hover:text-black font-black px-6 h-11 transition-all">APPLY</Button>
                </div>
                {promoError && <p className="text-red-500 text-[10px] font-bold mt-2 uppercase flex items-center gap-1"><XCircle className="w-3 h-3" /> {promoError}</p>}
                {appliedPromo && (
                  <div className="flex items-center justify-between mt-3 bg-[#CCFF00]/10 p-2 rounded-lg border border-[#CCFF00]/20">
                    <p className="text-[#CCFF00] text-[10px] font-black uppercase">Code '{appliedPromo.code}' Applied!</p>
                    <button onClick={removePromo} className="text-white opacity-50 hover:opacity-100 transition-opacity"><XCircle className="w-4 h-4" /></button>
                  </div>
                )}
              </motion.div>

              <motion.div layout className="mt-8 mb-24 p-6 glass-strong border-t-4 border-t-[#00FFFF] rounded-2xl shadow-2xl">
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between items-center text-xs text-muted-foreground uppercase tracking-widest font-bold"><span>Subtotal</span><span>₹{totalAmount}</span></div>
                  {appliedPromo && <div className="flex justify-between items-center text-xs text-[#CCFF00] uppercase tracking-widest font-bold"><span>Discount</span><span>-₹{discountAmount}</span></div>}
                  <div className="flex justify-between items-center pt-4 border-t border-white/5"><span className="text-muted-foreground font-black text-xs uppercase tracking-[0.2em]">Final Total</span><span className="text-3xl font-black text-[#00FFFF] drop-shadow-[0_0_15px_rgba(0,255,255,0.4)] font-mono">₹{finalAmount}</span></div>
                </div>
                <Button asChild className="w-full h-12 rounded-xl bg-[#CCFF00] text-black font-black text-lg hover:bg-[#CCFF00]/90 transition-all shadow-[0_0_15px_rgba(204,255,0,0.3)] hover:scale-[1.02] active:scale-95"><Link href="/checkout">PROCEED TO CHECKOUT</Link></Button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  )
}