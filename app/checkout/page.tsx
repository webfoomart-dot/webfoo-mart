"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, User, MapPin, Banknote, CheckCircle, Package, FileText, Plus, Truck, ChevronDown } from "lucide-react"

import { useAppStore } from "@/lib/store"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

export default function CheckoutPage() {
  const router = useRouter()
  // 🔥 FETCH DELIVERY ZONES FROM STORE
  const { cart, getCartTotal, addOrder, removeFromCart, user, orders, customerMeta, deliveryZones } = useAppStore() as any
  const totalAmount = getCartTotal()
  const [isMounted, setIsMounted] = React.useState(false)

  // Address States
  const [addressMode, setAddressMode] = React.useState<'saved' | 'new'>('new')
  const [newAddress, setNewAddress] = React.useState('')
  const [savedAddressState, setSavedAddressState] = React.useState('')
  const [specialNote, setSpecialNote] = React.useState('')
  
  // 🔥 DELIVERY ZONE STATE
  const [selectedZoneId, setSelectedZoneId] = React.useState<string>('')
  const [isZoneDropdownOpen, setIsZoneDropdownOpen] = React.useState(false) 
  
  const [isSuccess, setIsSuccess] = React.useState(false)
  const [placedOrderDetails, setPlacedOrderDetails] = React.useState<any>(null)

  // Promo Code states
  const [appliedPromo, setAppliedPromo] = React.useState<any>(null)
  const [discountAmt, setDiscountAmt] = React.useState(0)
  const [finalTotal, setFinalTotal] = React.useState(totalAmount)

  // Get active zones and calculate delivery fee
  const activeZones = React.useMemo(() => (deliveryZones || []).filter((z: any) => z.isActive), [deliveryZones])
  const deliveryFee = React.useMemo(() => {
    const zone = activeZones.find((z: any) => String(z.id) === String(selectedZoneId))
    return zone ? zone.fee : 0
  }, [activeZones, selectedZoneId])

  const displayZoneName = React.useMemo(() => {
    const zone = activeZones.find((z: any) => String(z.id) === String(selectedZoneId))
    return zone ? zone.areaName : "-- Choose your area --"
  }, [activeZones, selectedZoneId])

  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  React.useEffect(() => {
    if (isSuccess) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [isSuccess])

  React.useEffect(() => {
    setIsMounted(true)
    if (!user || !user.phone) return;

    let foundAddr = ""
    const myPhoneStr = String(user.phone).trim()

    if (customerMeta && customerMeta[myPhoneStr] && customerMeta[myPhoneStr].address) {
      foundAddr = customerMeta[myPhoneStr].address
    }
    
    if (!foundAddr && orders && Array.isArray(orders)) {
      const myOrders = orders.filter((o: any) => String(o.phone).trim() === myPhoneStr)
      if (myOrders.length > 0) {
        const myLastOrder = myOrders[myOrders.length - 1]
        if (myLastOrder && myLastOrder.landmark) {
          foundAddr = myLastOrder.landmark.split(' | Note:')[0].replace(/\[Zone:.*?\]\s*/g, '')
        }
      }
    }

    if (!foundAddr) {
      try {
        const localProfile = JSON.parse(localStorage.getItem('webfoo_profile') || '{}')
        if (String(localProfile.phone).trim() === myPhoneStr && localProfile.address) {
          foundAddr = localProfile.address
        }
      } catch (e) {}
    }

    if (foundAddr && savedAddressState === '') {
      setSavedAddressState(foundAddr)
      setAddressMode('saved')
    } else if (!foundAddr && savedAddressState === '') {
      setAddressMode('new')
    }
  }, [user, orders, customerMeta, savedAddressState])

  // Promo Code & Final Total Logic (🔥 Includes Delivery Fee)
  React.useEffect(() => {
    const storedPromo = localStorage.getItem('webfoo_applied_promo')
    let discount = 0
    if (storedPromo) {
      try {
        const parsedPromo = JSON.parse(storedPromo)
        setAppliedPromo(parsedPromo)
        discount = parsedPromo.type === 'flat' ? parsedPromo.value : Math.round((totalAmount * parsedPromo.value) / 100)
      } catch (e) {}
    }
    setDiscountAmt(discount)
    // FINAL TOTAL = KHAANA - DISCOUNT + DELIVERY FEE
    setFinalTotal(totalAmount - discount + deliveryFee)
  }, [totalAmount, deliveryFee])

  React.useEffect(() => {
    if (isMounted) {
      if (!user) router.push('/profile')
      else if (cart.length === 0 && !isSuccess) router.push('/cart')
    }
  }, [cart, isSuccess, isMounted, router, user])

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault()

    // 🔥 ZONE SELECTION VALIDATION
    if (activeZones.length > 0 && !selectedZoneId) {
      alert("Please select a Delivery Area!")
      return
    }

    const finalAddress = addressMode === 'saved' ? savedAddressState : newAddress
    if (!finalAddress || finalAddress.trim() === '') {
      alert("Please provide a delivery address!")
      return
    }

    const selectedZoneName = activeZones.find((z: any) => String(z.id) === String(selectedZoneId))?.areaName || 'Local'
    const fullLandmark = `[Zone: ${selectedZoneName}] ${finalAddress} ${specialNote.trim() !== '' ? `| Note: ${specialNote}` : ''}`

    const orderSnapshot = {
      items: [...cart],
      total: finalTotal,
      subtotal: totalAmount,
      discount: discountAmt,
      deliveryFee: deliveryFee,
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
              
              <Card className="glass-strong border-white/10 rounded-2xl overflow-hidden relative">
                <div className="bg-[#CCFF00]/10 px-6 py-3 border-b border-[#CCFF00]/20"><h3 className="font-black text-[#CCFF00] uppercase tracking-widest text-sm flex items-center gap-2"><MapPin className="w-4 h-4" /> Drop Coordinates</h3></div>
                <CardContent className="p-6 space-y-6">
                  
                  {/* 🔥 NAYA: CUSTOM GLASSMORPHIC DROPDOWN */}
                  {activeZones.length > 0 && (
                    <div className="space-y-3 pb-6 border-b border-white/10 relative z-30">
                      <Label className="text-xs uppercase tracking-widest text-[#00FFFF] font-black flex items-center gap-2"><Truck className="w-4 h-4" /> Select Delivery Area</Label>
                      
                      <div className="relative">
                        <div 
                          onClick={() => setIsZoneDropdownOpen(!isZoneDropdownOpen)}
                          className="w-full bg-black/50 border border-white/20 text-white h-14 rounded-xl px-4 font-bold flex items-center justify-between uppercase text-sm tracking-wider cursor-pointer hover:border-[#00FFFF]/50 transition-colors"
                        >
                          <span className={selectedZoneId ? "text-white" : "text-white/50"}>{displayZoneName}</span>
                          <ChevronDown className={`w-5 h-5 transition-transform ${isZoneDropdownOpen ? "rotate-180 text-[#00FFFF]" : "text-white/50"}`} />
                        </div>
                        
                        <AnimatePresence>
                          {isZoneDropdownOpen && (
                            <motion.div 
                              initial={{ opacity: 0, y: -10 }} 
                              animate={{ opacity: 1, y: 0 }} 
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className="absolute top-full left-0 w-full mt-2 p-2 bg-black/90 backdrop-blur-2xl border border-[#00FFFF]/30 rounded-xl shadow-[0_10px_30px_rgba(0,255,255,0.15)] max-h-60 overflow-y-auto z-50 glass-strong"
                            >
                              {activeZones.map((zone: any) => (
                                <div
                                  key={zone.id}
                                  onClick={() => {
                                    setSelectedZoneId(zone.id);
                                    setIsZoneDropdownOpen(false);
                                  }}
                                  className={`p-3 rounded-lg cursor-pointer uppercase text-sm font-bold tracking-wider transition-colors ${String(selectedZoneId) === String(zone.id) ? 'bg-[#00FFFF]/20 text-[#00FFFF]' : 'text-white hover:bg-white/10'}`}
                                >
                                  {zone.areaName}
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}

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
              <div className="space-y-2 relative z-10">
                <Label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 ml-1 font-black"><FileText className="w-4 h-4 text-[#00FFFF]" /> Special Note</Label>
                <textarea placeholder="Any delivery instructions..." value={specialNote} onChange={e => setSpecialNote(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#00FFFF] h-24 glass-strong resize-none" />
              </div>

              {/* Payment Info */}
              <div className="p-4 rounded-xl border border-white/10 bg-white/5 flex items-start gap-4 relative z-10">
                <Banknote className="w-6 h-6 text-[#CCFF00]" />
                <div><h4 className="font-black uppercase tracking-wider text-sm text-white">Cash On Delivery</h4><p className="text-xs text-muted-foreground mt-1">Payment will be collected at your door.</p></div>
              </div>

              {/* Totals */}
              <div className="pt-6 mt-6 border-t border-white/10 space-y-3 relative z-10">
                <div className="flex justify-between items-center px-2 font-bold uppercase tracking-widest text-[10px] text-muted-foreground"><span>Subtotal</span><span className="text-sm font-mono text-white">₹{totalAmount}</span></div>
                {appliedPromo && <div className="flex justify-between items-center px-2 font-bold uppercase tracking-widest text-[10px] text-[#CCFF00]"><span>Discount</span><span className="text-sm font-mono">-₹{discountAmt}</span></div>}
                
                {/* 🔥 DELIVERY FEE ROW */}
                {deliveryFee > 0 && <div className="flex justify-between items-center px-2 font-bold uppercase tracking-widest text-[10px] text-[#00FFFF]"><span>Delivery Fee</span><span className="text-sm font-mono">+₹{deliveryFee}</span></div>}

                <div className="flex justify-between items-center pb-2 px-2 pt-4 border-t border-white/10"><span className="text-white font-black uppercase tracking-tighter text-xl">Final Total</span><span className="text-3xl font-black text-[#00FFFF] font-mono shadow-[0_0_20px_rgba(0,255,255,0.2)]">₹{finalTotal}</span></div>
                <Button type="submit" className="w-full h-16 rounded-2xl bg-[#00FFFF] text-black font-black text-xl hover:bg-[#00FFFF]/90 shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all uppercase tracking-tighter mt-4">CONFIRM ORDER</Button>
              </div>
            </form>
          </motion.div>
        ) : (
          /* --- SUCCESS SCREEN --- */
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center space-y-6 mt-10 font-sans">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" as const, stiffness: 200, damping: 10, delay: 0.2 }}><CheckCircle className="w-32 h-32 text-[#CCFF00] drop-shadow-[0_0_30px_rgba(204,255,0,0.6)]" /></motion.div>
            <h2 className="text-3xl font-black uppercase text-white">Order <span className="text-[#CCFF00]">Confirmed!</span></h2>
            <p className="text-[#00FFFF] font-bold text-lg bg-[#00FFFF]/10 px-6 py-2 rounded-full border border-[#00FFFF]/30 shadow-[0_0_15px_rgba(0,255,255,0.1)] uppercase">Arriving Soon</p>

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
                  
                  {/* 🔥 BILL BREAKDOWN ADDED HERE IN SUCCESS SCREEN */}
                  <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase font-bold">
                      <span>Subtotal</span><span>₹{placedOrderDetails.subtotal}</span>
                    </div>
                    {placedOrderDetails.discount > 0 && (
                      <div className="flex justify-between items-center text-[10px] text-[#CCFF00] uppercase font-bold">
                        <span>Discount</span><span>-₹{placedOrderDetails.discount}</span>
                      </div>
                    )}
                    {placedOrderDetails.deliveryFee > 0 && (
                      <div className="flex justify-between items-center text-[10px] text-[#00FFFF] uppercase font-bold">
                        <span>Delivery Fee</span><span>+₹{placedOrderDetails.deliveryFee}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-white/5 mt-2">
                      <span className="font-black text-white uppercase text-xs tracking-widest">Final Paid</span>
                      <span className="text-2xl font-black text-[#CCFF00] font-mono">₹{placedOrderDetails.total}</span>
                    </div>
                  </div>

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
