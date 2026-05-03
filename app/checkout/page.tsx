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

// 🔥 NAYA SECURE SERVER ACTION IMPORT KIYA 🔥
import { sendTelegramAlertAction } from "@/app/actions/telegram"

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
  
  // 🔥 GUEST CHECKOUT STATES 🔥
  const [guestName, setGuestName] = React.useState('')
  const [guestPhone, setGuestPhone] = React.useState('')

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
    let foundAddr = ""
    
    // Sirf tabhi address fetch karenge jab user login ho
    if (user && user.phone) {
      const myPhoneStr = String(user.phone).trim()

      if (customerMeta && customerMeta[myPhoneStr] && customerMeta[myPhoneStr].address) {
        foundAddr = customerMeta[myPhoneStr].address
      }
      
      if (!foundAddr && orders && Array.isArray(orders)) {
        const myOrders = orders.filter((o: any) => String(o.phone).trim() === myPhoneStr)
        if (myOrders.length > 0) {
          const myLastOrder = myOrders[myOrders.length - 1]
          if (myLastOrder && myLastOrder.landmark) {
            foundAddr = myLastOrder.landmark
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
    }

    if (foundAddr && savedAddressState === '') {
      let cleanAddr = foundAddr
        .replace(/(?:\[Zone.*?\]|\(Zone.*?\)|Zone.*?\b)\s*/gi, '')
        .replace(/\|\s*Note:.*/i, '')
        .replace(/^[\s,|-]+|[\s,|-]+$/g, '')
        .trim();

      setSavedAddressState(cleanAddr)
      setAddressMode('saved')
    } else if (!foundAddr && savedAddressState === '') {
      setAddressMode('new')
    }
  }, [user, orders, customerMeta, savedAddressState])

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
    setFinalTotal(totalAmount - discount + deliveryFee)
  }, [totalAmount, deliveryFee])

  React.useEffect(() => {
    if (isMounted) {
      // 🔥 LOGIN WALA REDIRECT HATA DIYA TAAKI GUEST ALLOW HO SAKE 🔥
      if (cart.length === 0 && !isSuccess) router.push('/cart')
    }
  }, [cart, isSuccess, isMounted, router])

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    // Determine customer details
    const finalName = user ? user.name : guestName.trim()
    const finalPhone = user ? user.phone : guestPhone.trim()

    // Validation for Guest
    if (!user) {
      if (!finalName) { alert("Please enter your name!"); return; }
      if (!finalPhone || finalPhone.length < 10) { alert("Please enter a valid phone number!"); return; }
    }

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
      customer: finalName,
      phone: finalPhone,
      items: cart,
      amount: finalTotal,
      subtotal: totalAmount,
      discount: discountAmt,
      promoCode: appliedPromo ? appliedPromo.code : null,
      status: 'Pending',
      time: new Date().toLocaleTimeString(),
      landmark: fullLandmark
    })

    // 🔥 BACKEND ACTION KO CALL KIYA GUEST/USER KI DETAILS KE SATH 🔥
    await sendTelegramAlertAction(finalTotal, fullLandmark, finalPhone, finalName, cart);

    cart.forEach((item: any) => removeFromCart(item.id))
    localStorage.removeItem('webfoo_applied_promo')
    setIsSuccess(true)
  }

  // 🔥 SIRF MOUNT CHECK KIYA HAI (USER BLOCK HATA DIYA TAAKI FORM DIKHE) 🔥
  if (!isMounted) return null

  return (
    <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300">
      <Header />

      <main className="container mx-auto pb-40 pt-24 px-4 max-w-2xl">
        {!isSuccess ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="flex items-center gap-4">
              <Link href="/cart"><Button variant="ghost" size="icon" className="rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-primary"><ArrowLeft className="h-6 w-6" /></Button></Link>
              <h1 className="text-3xl font-black uppercase tracking-tighter">Secure <span className="text-primary">Checkout</span></h1>
            </div>

            {/* 🔥 CONDITIONAL USER PROFILE OR GUEST FORM 🔥 */}
            {user ? (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border glass-strong">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Ordering as</p>
                    <h3 className="font-bold text-foreground">{user.name}</h3>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Phone</p>
                  <p className="font-mono font-bold text-secondary">{user.phone}</p>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 glass-strong space-y-4">
                <div className="flex items-center gap-2 border-b border-primary/20 pb-3">
                  <User className="w-5 h-5 text-primary" />
                  <h3 className="font-black text-primary uppercase tracking-widest text-sm">Guest Details</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest text-muted-foreground font-black">Full Name</Label>
                    <Input 
                      required 
                      placeholder="e.g. Rahul Kumar" 
                      value={guestName} 
                      onChange={e => setGuestName(e.target.value)} 
                      className="bg-background dark:bg-black/50 h-12 border-border focus-visible:border-primary font-bold text-foreground" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest text-muted-foreground font-black">Phone Number</Label>
                    <Input 
                      required 
                      type="tel" 
                      placeholder="10-digit mobile number" 
                      value={guestPhone} 
                      onChange={e => setGuestPhone(e.target.value)} 
                      className="bg-background dark:bg-black/50 h-12 border-border focus-visible:border-primary font-bold font-mono text-secondary" 
                    />
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleConfirmOrder} className="space-y-6">
              
              <Card className="glass-strong border-border rounded-2xl overflow-hidden relative bg-transparent">
                <div className="bg-secondary/10 px-6 py-3 border-b border-secondary/20"><h3 className="font-black text-secondary uppercase tracking-widest text-sm flex items-center gap-2"><MapPin className="w-4 h-4" /> Drop Coordinates</h3></div>
                <CardContent className="p-6 space-y-6 bg-card/50 dark:bg-transparent">
                  
                  {activeZones.length > 0 && (
                    <div className="space-y-3 pb-6 border-b border-border relative z-30">
                      <Label className="text-xs uppercase tracking-widest text-primary font-black flex items-center gap-2"><Truck className="w-4 h-4" /> Select Delivery Area</Label>
                      
                      <div className="relative">
                        <div 
                          onClick={() => setIsZoneDropdownOpen(!isZoneDropdownOpen)}
                          className="w-full bg-background dark:bg-black/50 border border-border text-foreground h-14 rounded-xl px-4 font-bold flex items-center justify-between uppercase text-sm tracking-wider cursor-pointer hover:border-primary/50 transition-colors"
                        >
                          <span className={selectedZoneId ? "text-foreground" : "text-muted-foreground"}>{displayZoneName}</span>
                          <ChevronDown className={`w-5 h-5 transition-transform ${isZoneDropdownOpen ? "rotate-180 text-primary" : "text-muted-foreground"}`} />
                        </div>
                        
                        <AnimatePresence>
                          {isZoneDropdownOpen && (
                            <motion.div 
                              initial={{ opacity: 0, y: -10 }} 
                              animate={{ opacity: 1, y: 0 }} 
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className="absolute top-full left-0 w-full mt-2 p-2 bg-popover/95 backdrop-blur-2xl border border-primary/30 rounded-xl shadow-[0_10px_30px_rgba(0,139,139,0.15)] dark:shadow-[0_10px_30px_rgba(0,255,255,0.15)] max-h-60 overflow-y-auto z-50 glass-strong"
                            >
                              {activeZones.map((zone: any) => (
                                <div
                                  key={zone.id}
                                  onClick={() => {
                                    setSelectedZoneId(zone.id);
                                    setIsZoneDropdownOpen(false);
                                  }}
                                  className={`p-3 rounded-lg cursor-pointer uppercase text-sm font-bold tracking-wider transition-colors ${String(selectedZoneId) === String(zone.id) ? 'bg-primary/20 text-primary' : 'text-foreground hover:bg-black/5 dark:hover:bg-white/10'}`}
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

                  {savedAddressState && (
                    <div onClick={() => setAddressMode('saved')} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${addressMode === 'saved' ? 'border-secondary bg-secondary/10 shadow-[0_0_15px_rgba(153,204,0,0.1)] dark:shadow-[0_0_15px_rgba(204,255,0,0.1)]' : 'border-border hover:border-muted-foreground'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${addressMode === 'saved' ? 'border-secondary' : 'border-muted-foreground'}`}>
                          {addressMode === 'saved' && <div className="w-2 h-2 bg-secondary rounded-full" />}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-foreground uppercase">Use Saved Address</p>
                          <p className="text-xs text-muted-foreground mt-1">{savedAddressState}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div onClick={() => setAddressMode('new')} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${addressMode === 'new' ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(0,139,139,0.05)] dark:shadow-[0_0_15px_rgba(0,255,255,0.05)]' : 'border-border hover:border-muted-foreground'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${addressMode === 'new' ? 'border-primary' : 'border-muted-foreground'}`}>
                        {addressMode === 'new' && <div className="w-2 h-2 bg-primary rounded-full" />}
                      </div>
                      <p className="font-bold text-sm text-foreground flex items-center gap-2 uppercase"><Plus className="w-4 h-4" /> Ship to New Address</p>
                    </div>
                    <AnimatePresence>
                      {addressMode === 'new' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 pl-7">
                          <Input required={addressMode === 'new'} placeholder="Enter building/street details..." value={newAddress} onChange={e => setNewAddress(e.target.value)} className="bg-background dark:bg-black/50 h-12 border-border focus-visible:border-primary font-bold text-foreground" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2 relative z-10">
                <Label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 ml-1 font-black"><FileText className="w-4 h-4 text-primary" /> Special Note</Label>
                <textarea placeholder="Any delivery instructions..." value={specialNote} onChange={e => setSpecialNote(e.target.value)} className="w-full bg-background dark:bg-black/50 border border-border rounded-xl p-4 text-sm text-foreground focus:outline-none focus:border-primary h-24 glass-strong resize-none" />
              </div>

              <div className="p-4 rounded-xl border border-border bg-card flex items-start gap-4 relative z-10">
                <Banknote className="w-6 h-6 text-secondary" />
                <div><h4 className="font-black uppercase tracking-wider text-sm text-foreground">Cash On Delivery</h4><p className="text-xs text-muted-foreground mt-1">Payment will be collected at your door.</p></div>
              </div>

              <div className="pt-6 mt-6 border-t border-border space-y-3 relative z-10">
                <div className="flex justify-between items-center px-2 font-bold uppercase tracking-widest text-[10px] text-muted-foreground"><span>Subtotal</span><span className="text-sm font-mono text-foreground">₹{totalAmount}</span></div>
                {appliedPromo && <div className="flex justify-between items-center px-2 font-bold uppercase tracking-widest text-[10px] text-secondary"><span>Discount</span><span className="text-sm font-mono">-₹{discountAmt}</span></div>}
                {deliveryFee > 0 && <div className="flex justify-between items-center px-2 font-bold uppercase tracking-widest text-[10px] text-primary"><span>Delivery Fee</span><span className="text-sm font-mono">+₹{deliveryFee}</span></div>}

                <div className="flex justify-between items-center pb-2 px-2 pt-4 border-t border-border"><span className="text-foreground font-black uppercase tracking-tighter text-xl">Final Total</span><span className="text-3xl font-black text-primary font-mono shadow-[0_0_20px_rgba(0,139,139,0.2)] dark:shadow-[0_0_20px_rgba(0,255,255,0.2)]">₹{finalTotal}</span></div>
                <Button type="submit" className="w-full h-16 rounded-2xl bg-primary text-primary-foreground dark:text-black font-black text-xl hover:bg-primary/90 shadow-[0_0_20px_rgba(0,139,139,0.4)] dark:shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all uppercase tracking-tighter mt-4">CONFIRM ORDER</Button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center space-y-6 mt-10 font-sans">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" as const, stiffness: 200, damping: 10, delay: 0.2 }}><CheckCircle className="w-32 h-32 text-secondary drop-shadow-[0_0_30px_rgba(153,204,0,0.6)] dark:drop-shadow-[0_0_30px_rgba(204,255,0,0.6)]" /></motion.div>
            <h2 className="text-3xl font-black uppercase text-foreground">Order <span className="text-secondary">Confirmed!</span></h2>
            <p className="text-primary font-bold text-lg bg-primary/10 px-6 py-2 rounded-full border border-primary/30 shadow-[0_0_15px_rgba(0,139,139,0.1)] dark:shadow-[0_0_15px_rgba(0,255,255,0.1)] uppercase">Arriving Soon</p>

            {placedOrderDetails && (
              <Card className="w-full glass-strong border-border mt-8 text-left bg-transparent">
                <CardContent className="p-6 bg-card/50 dark:bg-transparent rounded-xl">
                  <h3 className="font-black text-primary uppercase tracking-widest text-xs border-b border-border pb-4 mb-4 flex items-center gap-2"><Package className="w-5 h-5" /> Summary</h3>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {placedOrderDetails.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted border border-border">
                            <img src={item.image || "/placeholder.jpg"} alt={item.name} className="object-cover w-full h-full" />
                          </div>
                          <div><p className="font-bold text-sm text-foreground">{item.name}</p><p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Qty: {item.quantity}</p></div>
                        </div>
                        <p className="font-mono font-bold text-primary">₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-border space-y-2">
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase font-bold">
                      <span>Subtotal</span><span>₹{placedOrderDetails.subtotal}</span>
                    </div>
                    {placedOrderDetails.discount > 0 && (
                      <div className="flex justify-between items-center text-[10px] text-secondary uppercase font-bold">
                        <span>Discount</span><span>-₹{placedOrderDetails.discount}</span>
                      </div>
                    )}
                    {placedOrderDetails.deliveryFee > 0 && (
                      <div className="flex justify-between items-center text-[10px] text-primary uppercase font-bold">
                        <span>Delivery Fee</span><span>+₹{placedOrderDetails.deliveryFee}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-border mt-2">
                      <span className="font-black text-foreground uppercase text-xs tracking-widest">Final Paid</span>
                      <span className="text-2xl font-black text-secondary font-mono">₹{placedOrderDetails.total}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="w-full pt-4">
              <Button onClick={() => router.push('/')} className="w-full h-14 bg-card text-foreground hover:bg-muted border border-border font-black uppercase tracking-widest rounded-xl transition-all">Back to Home</Button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
