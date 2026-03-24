"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, User, MapPin, Banknote, CheckCircle, Package, FileText, Plus } from "lucide-react"

import { useAppStore } from "@/lib/store"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, getCartTotal, addOrder, removeFromCart, user, orders, customerMeta } = useAppStore() as any
  const totalAmount = getCartTotal()
  const [isMounted, setIsMounted] = React.useState(false)

  // Address States
  const [addressMode, setAddressMode] = React.useState<'saved' | 'new'>('new')
  const [newAddress, setNewAddress] = React.useState('')
  const [savedAddressState, setSavedAddressState] = React.useState('')
  const [specialNote, setSpecialNote] = React.useState('')
  
  const [isSuccess, setIsSuccess] = React.useState(false)
  const [placedOrderDetails, setPlacedOrderDetails] = React.useState<any>(null)

  // Promo Code states
  const [appliedPromo, setAppliedPromo] = React.useState<any>(null)
  const [discountAmt, setDiscountAmt] = React.useState(0)
  const [finalTotal, setFinalTotal] = React.useState(totalAmount)

  // 🔥 1. CART SE AANE PE PAGE UPAR KHULNE WALA FIX (Naya Engine)
  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // 🔥 2. ORDER CONFIRM HONE KE BAAD UPAR JANE WALA FIX (Jo pehle lagaya tha)
  React.useEffect(() => {
    if (isSuccess) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [isSuccess])

  // 🔥 TITANIUM STRICT ADDRESS CATCHER (String Matching Fix)
  React.useEffect(() => {
    setIsMounted(true)
    if (!user || !user.phone) return;

    let foundAddr = ""
    // ZABARDASTI STRING MEIN CONVERT KAR RAHE HAIN TAARI MATCH FAIL NA HO
    const myPhoneStr = String(user.phone).trim()

    // Step 1: Sabse pehle customerMeta (Database Profile) check karo
    if (customerMeta && customerMeta[myPhoneStr] && customerMeta[myPhoneStr].address) {
      foundAddr = customerMeta[myPhoneStr].address
    }
    
    // Step 2: Agar Profile mein nahi hai, toh SIRF USI CUSTOMER ke orders check karo
    if (!foundAddr && orders && Array.isArray(orders)) {
      // DHYAN DE: Yahan dono side String convert karke match kar rahe hain
      const myOrders = orders.filter((o: any) => String(o.phone).trim() === myPhoneStr)
      
      if (myOrders.length > 0) {
        // Sirf is bande ka sabse aakhri order lo
        const myLastOrder = myOrders[myOrders.length - 1]
        if (myLastOrder && myLastOrder.landmark) {
          foundAddr = myLastOrder.landmark.split(' | Note:')[0]
        }
      }
    }

    // Step 3: Local Storage (Browser memory) ka ultimate fallback, sirf uske number par
    if (!foundAddr) {
      try {
        const localProfile = JSON.parse(localStorage.getItem('webfoo_profile') || '{}')
        if (String(localProfile.phone).trim() === myPhoneStr && localProfile.address) {
          foundAddr = localProfile.address
        }
      } catch (e) {}
    }

    // Address Set karna
    if (foundAddr && savedAddressState === '') {
      setSavedAddressState(foundAddr)
      setAddressMode('saved')
    } else if (!foundAddr && savedAddressState === '') {
      setAddressMode('new')
    }
  }, [user, orders, customerMeta, savedAddressState])

  // Promo Code Logic
  React.useEffect(() => {
    const storedPromo = localStorage.getItem('webfoo_applied_promo')
    if (storedPromo) {
      try {
        const parsedPromo = JSON.parse(storedPromo)
        setAppliedPromo(parsedPromo)
        const discount = parsedPromo.type === 'flat' ? parsedPromo.value : Math.round((totalAmount * parsedPromo.value) / 100)
        setDiscountAmt(discount)
        setFinalTotal(totalAmount - discount)
      } catch (e) {}
    } else {
      setFinalTotal(totalAmount)
    }
  }, [totalAmount])

  // Security Check
  React.useEffect(() => {
    if (isMounted) {
      if (!user) router.push('/profile')
      else if (cart.length === 0 && !isSuccess) router.push('/cart')
    }
  }, [cart, isSuccess, isMounted, router, user])

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault()

    const finalAddress = addressMode === 'saved' ? savedAddressState : newAddress
    if (!finalAddress || finalAddress.trim() === '') {
      alert("Please provide a delivery address!")
      return
    }

    const fullLandmark = specialNote.trim() !== '' ? `${finalAddress} | Note: ${specialNote}` : finalAddress

    const orderSnapshot = {
      items: [...cart],
      total: finalTotal,
      subtotal: totalAmount,
      discount: discountAmt,
      date: new Date().toLocaleTimeString()
    }
    setPlacedOrderDetails(orderSnapshot)

    addOrder({
      customer: user.name,
      phone: user.phone,
      items: cart,
      amount: finalTotal,
      subtotal: totalAmount,
      discount: discountAmt,
      promoCode: appliedPromo ? appliedPromo.code : null,
      status: 'Pending',
      time: new Date().toLocaleTimeString(),
      landmark: fullLandmark
    })

    cart.forEach((item: any) => removeFromCart(item.id))
    localStorage.removeItem('webfoo_applied_promo')
    setIsSuccess(true)
  }

  if (!isMounted || !user) return null

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Header />

      <main className="container mx-auto pb-40 pt-24 px-4 max-w-2xl">
        {!isSuccess ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="flex items-center gap-4">
              <Link href="/cart"><Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 text-[#00FFFF]"><ArrowLeft className="h-6 w-6" /></Button></Link>
              <h1 className="text-3xl font-black uppercase tracking-tighter">Secure <span className="text-[#00FFFF]">Checkout</span></h1>
            </div>

            {/* User Contact Banner */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 glass-strong">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#00FFFF]/10 border border-[#00FFFF]/30 flex items-center justify-center text-[#00FFFF]">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Ordering as</p>
                  <h3 className="font-bold text-white">{user.name}</h3>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Phone</p>
                <p className="font-mono font-bold text-[#CCFF00]">{user.phone}</p>
              </div>
            </div>

            <form onSubmit={handleConfirmOrder} className="space-y-6">
              
              <Card className="glass-strong border-white/10 rounded-2xl overflow-hidden">
                <div className="bg-[#CCFF00]/10 px-6 py-3 border-b border-[#CCFF00]/20"><h3 className="font-black text-[#CCFF00] uppercase tracking-widest text-sm flex items-center gap-2"><MapPin className="w-4 h-4" /> Drop Coordinates</h3></div>
                <CardContent className="p-6 space-y-4">
                  
                  {/* Saved Address Block */}
                  {savedAddressState && (
                    <div onClick={() => setAddressMode('saved')} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${addressMode === 'saved' ? 'border-[#CCFF00] bg-[#CCFF00]/10 shadow-[0_0_15px_rgba(204,255,0,0.1)]' : 'border-white/10 hover:border-white/30'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${addressMode === 'saved' ? 'border-[#CCFF00]' : 'border-muted-foreground'}`}>
                          {addressMode === 'saved' && <div className="w-2 h-2 bg-[#CCFF00] rounded-full" />}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-white uppercase">Use Saved Address</p>
                          <p className="text-xs text-muted-foreground mt-1">{savedAddressState}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* New Address Option */}
                  <div onClick={() => setAddressMode('new')} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${addressMode === 'new' ? 'border-[#00FFFF] bg-[#00FFFF]/10 shadow-[0_0_15px_rgba(0,255,255,0.05)]' : 'border-white/10 hover:border-white/30'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${addressMode === 'new' ? 'border-[#00FFFF]' : 'border-muted-foreground'}`}>
                        {addressMode === 'new' && <div className="w-2 h-2 bg-[#00FFFF] rounded-full" />}
                      </div>
                      <p className="font-bold text-sm text-white flex items-center gap-2 uppercase"><Plus className="w-4 h-4" /> Ship to New Address</p>
                    </div>
                    <AnimatePresence>
                      {addressMode === 'new' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 pl-7">
                          <Input required={addressMode === 'new'} placeholder="Enter building/street details..." value={newAddress} onChange={e => setNewAddress(e.target.value)} className="bg-black/50 h-12 border-white/20 focus-visible:border-[#00FFFF] font-bold" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>

              {/* Special Note */}
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 ml-1 font-black"><FileText className="w-4 h-4 text-[#00FFFF]" /> Special Note</Label>
                <textarea placeholder="Any delivery instructions..." value={specialNote} onChange={e => setSpecialNote(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#00FFFF] h-24 glass-strong resize-none" />
              </div>

              {/* Payment Info */}
              <div className="p-4 rounded-xl border border-white/10 bg-white/5 flex items-start gap-4">
                <Banknote className="w-6 h-6 text-[#CCFF00]" />
                <div><h4 className="font-black uppercase tracking-wider text-sm text-white">Cash On Delivery</h4><p className="text-xs text-muted-foreground mt-1">Payment will be collected at your door.</p></div>
              </div>

              {/* Totals */}
              <div className="pt-6 mt-6 border-t border-white/10">
                <div className="flex justify-between items-center mb-2 px-2 font-bold uppercase tracking-widest text-[10px] text-muted-foreground"><span>Subtotal</span><span className="text-sm font-mono text-white">₹{totalAmount}</span></div>
                {appliedPromo && <div className="flex justify-between items-center mb-4 px-2 font-bold uppercase tracking-widest text-[10px] text-[#CCFF00]"><span>Discount</span><span className="text-sm font-mono">-₹{discountAmt}</span></div>}
                <div className="flex justify-between items-center mb-6 px-2 pt-4 border-t border-white/10"><span className="text-white font-black uppercase tracking-tighter text-xl">Total Amount</span><span className="text-3xl font-black text-[#00FFFF] font-mono shadow-[0_0_20px_rgba(0,255,255,0.2)]">₹{finalTotal}</span></div>
                <Button type="submit" className="w-full h-16 rounded-2xl bg-[#00FFFF] text-black font-black text-xl hover:bg-[#00FFFF]/90 shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all uppercase tracking-tighter">CONFIRM ORDER</Button>
              </div>
            </form>
          </motion.div>
        ) : (
          /* --- SUCCESS SCREEN --- */
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center space-y-6 mt-10 font-sans">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" as const, stiffness: 200, damping: 10, delay: 0.2 }}><CheckCircle className="w-32 h-32 text-[#CCFF00] drop-shadow-[0_0_30px_rgba(204,255,0,0.6)]" /></motion.div>
            <h2 className="text-3xl font-black uppercase text-white">Order <span className="text-[#CCFF00]">Confirmed!</span></h2>
            <p className="text-[#00FFFF] font-bold text-lg bg-[#00FFFF]/10 px-6 py-2 rounded-full border border-[#00FFFF]/30 shadow-[0_0_15px_rgba(0,255,255,0.1)] uppercase">Arriving In 60 Mins</p>

            {placedOrderDetails && (
              <Card className="w-full glass-strong border-white/10 mt-8 text-left">
                <CardContent className="p-6">
                  <h3 className="font-black text-[#00FFFF] uppercase tracking-widest text-xs border-b border-white/10 pb-4 mb-4 flex items-center gap-2"><Package className="w-5 h-5" /> Summary</h3>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {placedOrderDetails.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white/5 border border-white/10">
                            <img src={item.image || "/placeholder.jpg"} alt={item.name} className="object-cover w-full h-full" />
                          </div>
                          <div><p className="font-bold text-sm text-white">{item.name}</p><p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Qty: {item.quantity}</p></div>
                        </div>
                        <p className="font-mono font-bold text-[#00FFFF]">₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center"><span className="font-black text-muted-foreground uppercase text-xs">Final Paid</span><span className="text-2xl font-black text-[#CCFF00] font-mono">₹{placedOrderDetails.total}</span></div>
                </CardContent>
              </Card>
            )}

            <Button asChild className="w-full max-w-sm h-14 rounded-xl bg-white/10 text-white font-black text-lg hover:bg-white/20 border border-white/20 mt-8 uppercase tracking-widest transition-all"><Link href="/orders">VIEW ORDERS</Link></Button>
          </motion.div>
        )}
      </main>
    </div>
  )
}
