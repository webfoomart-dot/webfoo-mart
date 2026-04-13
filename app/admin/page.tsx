"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Menu, LayoutDashboard, Zap, History, Tag, Package as PackageIcon, 
  MessageSquare, Users, IndianRupee, Clock, CheckCircle2, ArrowLeft,
  MapPin, Phone, Truck, XCircle, Plus, Trash2, Edit, PowerOff, Power,
  Star, Ban, MessageCircle, FileText, Send, CheckSquare, Square, Smartphone,
  TrendingUp, Target, BarChart, ShieldAlert, LockKeyhole, Calendar, Settings, AlertTriangle, MoonStar, LayoutGrid,
  ArrowUp, ArrowDown, Palette, Volume2, Wallet, UserCircle, Link as LinkIcon, Search, PlusCircle, X, CornerDownRight, Folder,
  ChefHat, Bike
} from "lucide-react"
import { createClient } from '@supabase/supabase-js' 

import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Empty, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

const MENU_ITEMS = [
  { id: 'analytics', label: 'Analytics', icon: LayoutDashboard },
  { id: 'billing', label: 'Supplier Bill', icon: Wallet },
  { id: 'live_orders', label: 'Live Orders', icon: Zap },
  { id: 'order_history', label: 'Order History', icon: History }, 
  { id: 'products', label: 'Products', icon: PackageIcon },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'offers', label: 'Offers', icon: Tag },
  { id: 'categories', label: 'Categories', icon: LayoutGrid }, 
  { id: 'settings', label: 'Settings', icon: Settings }, 
]

const ADMIN_SECRET_PASSCODE = "WEBFOO99"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'TERA_SUPABASE_URL_YAHAN_DAAL'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'TERA_SUPABASE_ANON_KEY_YAHAN_DAAL'
const supabase = createClient(supabaseUrl, supabaseKey)

export default function AdminDashboard() {
  const [isMounted, setIsMounted] = React.useState(false)
  const [isAuthorized, setIsAuthorized] = React.useState(false)
  const [passcode, setPasscode] = React.useState('')
  const [authError, setAuthError] = React.useState('')

  const alertAudioRef = React.useRef<HTMLAudioElement>(null)
  const prevOrderCountRef = React.useRef(0)

  const { 
    orders, updateOrderStatus, 
    products, addProduct, updateProduct, deleteProduct, toggleStock,
    customerMeta, updateCustomerMeta,
    addNotification,
    promoCodes, addPromoCode, togglePromoStatus, deletePromo,
    storeConfig, fetchStoreConfig, updateStoreConfig, 
    fetchData,
    categories, addCategory, updateCategory, deleteCategory, reorderCategory,
    deliveryZones, addDeliveryZone, deleteDeliveryZone, toggleDeliveryZoneStatus
  } = useAppStore() as any
  
  const [activeTab, setActiveTab] = React.useState('live_orders')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  const [analyticsFilter, setAnalyticsFilter] = React.useState('all')
  const [customDate, setCustomDate] = React.useState('')
  const [billingFilter, setBillingFilter] = React.useState('today')
  const [billingCustomDate, setBillingCustomDate] = React.useState('')
  const [historyFilter, setHistoryFilter] = React.useState('all')
  const [historyCustomDate, setHistoryCustomDate] = React.useState('')

  // PRODUCTS STATE
  const [isProductSheetOpen, setIsProductSheetOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [selectedCategoryView, setSelectedCategoryView] = React.useState<string | null>(null)
  const [selectedSubcategoryFilter, setSelectedSubcategoryFilter] = React.useState<string | null>(null)
  const [subcatViewMode, setSubcatViewMode] = React.useState<'folders' | 'tabs'>('folders')
  const [productMasterView, setProductMasterView] = React.useState<'categories' | 'all'>('categories')
  const [formPlacement, setFormPlacement] = React.useState<'main' | 'sub'>('main')

  const [formData, setFormData] = React.useState({
    name: '', price: '', mrp: '', cost_price: '', category: '', subcategory: '', image: '', inStock: true,
    description: '', galleryImages: [] as string[], foodPref: 'none' as 'veg' | 'non-veg' | 'none'
  })

  const [newGalleryUrl, setNewGalleryUrl] = React.useState('') 
  const [selectedCustomers, setSelectedCustomers] = React.useState<string[]>([])
  const [messageText, setMessageText] = React.useState('')

  const [editingCategoryId, setEditingCategoryId] = React.useState<string | null>(null)
  const [newCategoryName, setNewCategoryName] = React.useState('')
  const [newCategoryImage, setNewCategoryImage] = React.useState('')
  const [subCatInputs, setSubCatInputs] = React.useState<Record<string, string>>({})
  
  const [convertingCategory, setConvertingCategory] = React.useState<any>(null)
  const [targetParentCategory, setTargetParentCategory] = React.useState<string>('')

  const [settingsFormData, setSettingsFormData] = React.useState({
    storeMode: 'manual', openTime: '08:00', closeTime: '22:00',
    isStoreOpen: true, bannerTextOpen: '', bannerImageUrlOpen: '', bannerTextClosed: '', bannerImageUrlClosed: '',
    ownerName: '', ownerPhone: '', ownerEmail: '', ownerPhoto: ''
  })
  const [isSettingsSaving, setIsSettingsSaving] = React.useState(false)
  const [globalMinOrder, setGlobalMinOrder] = React.useState(0)

  const [themeColorData, setThemeColorData] = React.useState({
    primary_color: '#00FFFF', background_color: '#050505', text_color: '#ffffff', button_color: '#CCFF00'
  })
  const [isThemeSaving, setIsThemeSaving] = React.useState(false)

  const [customerSearchQuery, setCustomerSearchQuery] = React.useState('')
  const [customerSortOption, setCustomerSortOption] = React.useState('spent_desc')

  React.useEffect(() => { 
    setIsMounted(true) 
    if (fetchData) fetchData()
    if (fetchStoreConfig) fetchStoreConfig() 
    
    const sessionAuth = sessionStorage.getItem('webfoo_admin_unlocked')
    if (sessionAuth === 'true') {
      setIsAuthorized(true)
    }

    async function loadTheme() {
      const { data } = await supabase.from('theme_settings').select('*').eq('id', 1).single()
      if (data) setThemeColorData(data)
    }
    loadTheme()
  }, [fetchData, fetchStoreConfig])

  React.useEffect(() => {
    if (storeConfig) {
      setSettingsFormData({
        storeMode: storeConfig.storeMode || 'manual',
        openTime: storeConfig.openTime || '08:00',
        closeTime: storeConfig.closeTime || '22:00',
        isStoreOpen: storeConfig.isStoreOpen ?? true,
        bannerTextOpen: storeConfig.bannerTextOpen || '',
        bannerImageUrlOpen: storeConfig.bannerImageUrlOpen || '',
        bannerTextClosed: storeConfig.bannerTextClosed || '',
        bannerImageUrlClosed: storeConfig.bannerImageUrlClosed || '',
        ownerName: storeConfig.ownerName || '',
        ownerPhone: storeConfig.ownerPhone || '',
        ownerEmail: storeConfig.ownerEmail || '',
        ownerPhoto: storeConfig.ownerPhoto || ''
      })
      setGlobalMinOrder(storeConfig.minOrderAmount || 0) 
    }
  }, [storeConfig])

  const displayCategories = (categories ? Array.from(new Set(categories.map((c: any) => c.name))) : []) as string[];

  React.useEffect(() => {
    if (!formData.category && !editingId) {
      setFormData(prev => ({ ...prev, category: (selectedCategoryView || displayCategories[0] || '') as string }))
    }
  }, [displayCategories, formData.category, editingId, selectedCategoryView])

  const filteredAnalyticsOrders = React.useMemo(() => {
    if (analyticsFilter === 'all') return orders;
    const getLocalYYYYMMDD = (d: Date) => {
      const offset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - offset).toISOString().split('T')[0];
    }
    const today = new Date();
    const todayStr = getLocalYYYYMMDD(today);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalYYYYMMDD(yesterday);
    return orders.filter((o: any) => {
      let orderDateStr = o.date;
      if (!orderDateStr && o.id && !isNaN(Number(o.id))) {
        orderDateStr = getLocalYYYYMMDD(new Date(Number(o.id)));
      }
      if (analyticsFilter === 'today') return orderDateStr === todayStr;
      if (analyticsFilter === 'yesterday') return orderDateStr === yesterdayStr;
      if (analyticsFilter === 'custom') return orderDateStr === customDate;
      return true;
    });
  }, [orders, analyticsFilter, customDate]);

  const filteredBillingOrders = React.useMemo(() => {
    const deliveredOnly = orders.filter((o: any) => o.status === 'Delivered');
    if (billingFilter === 'all') return deliveredOnly;
    const getLocalYYYYMMDD = (d: Date) => {
      const offset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - offset).toISOString().split('T')[0];
    }
    const today = new Date();
    const todayStr = getLocalYYYYMMDD(today);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalYYYYMMDD(yesterday);
    return deliveredOnly.filter((o: any) => {
      let orderDateStr = o.date;
      if (!orderDateStr && o.id && !isNaN(Number(o.id))) {
        orderDateStr = getLocalYYYYMMDD(new Date(Number(o.id)));
      }
      if (billingFilter === 'today') return orderDateStr === todayStr;
      if (billingFilter === 'yesterday') return orderDateStr === yesterdayStr;
      if (billingFilter === 'custom') return orderDateStr === billingCustomDate;
      return true;
    });
  }, [orders, billingFilter, billingCustomDate]);

  const filteredOrderHistory = React.useMemo(() => {
    const baseHistory = orders.filter((o: any) => o.status === 'Delivered' || o.status === 'Cancelled').reverse();
    if (historyFilter === 'all') return baseHistory;
    const getLocalYYYYMMDD = (d: Date) => {
      const offset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - offset).toISOString().split('T')[0];
    }
    const today = new Date(); const todayStr = getLocalYYYYMMDD(today);
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1); const yesterdayStr = getLocalYYYYMMDD(yesterday);
    return baseHistory.filter((o: any) => {
      let orderDateStr = o.date;
      if (!orderDateStr && o.id && !isNaN(Number(o.id))) orderDateStr = getLocalYYYYMMDD(new Date(Number(o.id)));
      if (historyFilter === 'today') return orderDateStr === todayStr;
      if (historyFilter === 'yesterday') return orderDateStr === yesterdayStr;
      if (historyFilter === 'custom') return orderDateStr === historyCustomDate;
      return true;
    });
  }, [orders, historyFilter, historyCustomDate]);

  React.useEffect(() => {
    if (isMounted && isAuthorized) {
      const liveOrds = orders.filter((o: any) => o.status === 'Pending' || o.status === 'In Transit');
      if (liveOrds.length > prevOrderCountRef.current && prevOrderCountRef.current !== 0) {
        if (alertAudioRef.current) {
          alertAudioRef.current.play().catch(e => console.error("Sound blocked by browser:", e))
        }
      }
      prevOrderCountRef.current = liveOrds.length
    }
  }, [orders, isMounted, isAuthorized])

  const handleAdminAccess = (e: React.FormEvent) => {
    e.preventDefault()
    if (passcode === ADMIN_SECRET_PASSCODE) {
      sessionStorage.setItem('webfoo_admin_unlocked', 'true')
      setIsAuthorized(true)
      setAuthError('')
    } else {
      setAuthError('ACCESS DENIED.')
      setPasscode('')
    }
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateStoreConfig) return;
    setIsSettingsSaving(true);
    try {
      await updateStoreConfig({
        storeMode: settingsFormData.storeMode as 'auto' | 'manual',
        openTime: settingsFormData.openTime,
        closeTime: settingsFormData.closeTime,
        isStoreOpen: settingsFormData.isStoreOpen,
        bannerTextOpen: settingsFormData.bannerTextOpen,
        bannerImageUrlOpen: settingsFormData.bannerImageUrlOpen || null,
        bannerTextClosed: settingsFormData.bannerTextClosed,
        bannerImageUrlClosed: settingsFormData.bannerImageUrlClosed || null,
        ownerName: settingsFormData.ownerName,
        ownerPhone: settingsFormData.ownerPhone,
        ownerEmail: settingsFormData.ownerEmail,
        ownerPhoto: settingsFormData.ownerPhoto,
      });
      alert("✅ Settings saved!");
      if (fetchStoreConfig) fetchStoreConfig();
    } catch(e) { alert("ERROR saving settings!") }
    setIsSettingsSaving(false);
  }

  const handleSaveTheme = async () => {
    setIsThemeSaving(true)
    const { error } = await supabase.from('theme_settings').update({
      primary_color: themeColorData.primary_color,
      background_color: themeColorData.background_color,
      text_color: themeColorData.text_color,
      button_color: themeColorData.button_color
    }).eq('id', 1)
    setIsThemeSaving(false)
    if (error) alert("⚠️ Error: " + error.message)
    else alert("✅ Colors Updated!")
  }

  const handleSaveGlobalMinOrder = async () => {
    if (!updateStoreConfig) return;
    try {
      await updateStoreConfig({ minOrderAmount: globalMinOrder });
      alert("✅ Global Min Order Updated!");
      if (fetchStoreConfig) fetchStoreConfig();
    } catch(e) { alert("ERROR"); }
  }

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return;
    if (editingCategoryId) await updateCategory(editingCategoryId, { name: newCategoryName.trim(), image: newCategoryImage });
    else await addCategory({ name: newCategoryName.trim(), image: newCategoryImage, subcategories: [] });
    setNewCategoryName(''); setNewCategoryImage(''); setEditingCategoryId(null);
  }

  const editCategoryUI = (cat: any) => {
    setEditingCategoryId(cat.id); setNewCategoryName(cat.name); setNewCategoryImage(cat.image || '');
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  }

  const resetCategoryForm = () => { setEditingCategoryId(null); setNewCategoryName(''); setNewCategoryImage(''); }

  const handleAddSubcat = (catId: string, currentSubs: string[]) => {
    const newSub = subCatInputs[catId];
    if (!newSub || !newSub.trim()) return;
    const updatedSubs = [...(currentSubs || []), newSub.trim()];
    updateCategory(catId, { subcategories: updatedSubs });
    setSubCatInputs({...subCatInputs, [catId]: ''});
  }

  const handleRemoveSubcat = (catId: string, currentSubs: string[], subToRemove: string) => {
    if(confirm(`Remove sub-category "${subToRemove}"?`)) {
      const updatedSubs = (currentSubs || []).filter(s => s !== subToRemove);
      updateCategory(catId, { subcategories: updatedSubs });
    }
  }

  const handleConvertCategory = async (oldCat: any) => {
    if (!targetParentCategory) return alert("Please select a target parent category first!");
    if (confirm(`🚨 CAUTION: This will move all products from '${oldCat.name}' into '${targetParentCategory}' and delete the main category '${oldCat.name}'. Continue?`)) {
      try {
        const parentCat = categories.find((c: any) => c.name === targetParentCategory);
        if (!parentCat) return;
        const updatedSubs = [...(parentCat.subcategories || []), oldCat.name];
        const uniqueSubs = Array.from(new Set(updatedSubs));
        await updateCategory(parentCat.id, { subcategories: uniqueSubs });
        const productsToUpdate = products.filter((p: any) => p.category === oldCat.name);
        await Promise.all(productsToUpdate.map((p: any) => updateProduct(p.id, { category: parentCat.name, subcategory: oldCat.name })));
        await deleteCategory(oldCat.id);
        setConvertingCategory(null);
        setTargetParentCategory('');
        alert(`✅ Success! '${oldCat.name}' is now a sub-category under '${parentCat.name}', and all products were moved safely.`);
      } catch (error) { alert("⚠️ Error moving category data."); }
    }
  }

  const handleDeleteCustomerWipe = (phone: string) => {
    if(confirm("🚨 WARNING: This will wipe/hide the customer from your Admin CRM view. \n\nNote: If they forgot their password, this will NOT delete their Supabase Auth account. You must delete Auth from the Supabase Dashboard. \n\nProceed with CRM wipe?")) {
      updateCustomerMeta(phone, { isDeleted: true });
      alert("✅ Customer data wiped from panel.");
    }
  }

  const liveOrders = orders.filter((o: any) => o.status === 'Pending' || o.status === 'In Transit').reverse()
  
  const customersMap = new Map()
  Object.keys(customerMeta).forEach(phone => {
    const meta = customerMeta[phone]
    if (meta.isDeleted) return; 
    customersMap.set(phone, { name: meta.name || 'Unknown', phone: phone, address: meta.address || 'Address not added', totalOrders: 0, totalSpent: 0, ordersList: [], firstSeen: 9999999 })
  })
  orders.forEach((order: any, index: number) => {
    if (customerMeta[order.phone]?.isDeleted) return; 
    if (!customersMap.has(order.phone)) {
      customersMap.set(order.phone, { name: order.customer, phone: order.phone, address: order.landmark, totalOrders: 0, totalSpent: 0, ordersList: [], firstSeen: index })
    } else {
      if (order.landmark) customersMap.get(order.phone).address = order.landmark
      if (index < customersMap.get(order.phone).firstSeen) customersMap.get(order.phone).firstSeen = index
    }
    const cust = customersMap.get(order.phone)
    cust.totalOrders += 1
    if (order.status === 'Delivered') cust.totalSpent += order.amount
    cust.ordersList.push(order)
  })

  let customersList = Array.from(customersMap.values())
  
  if (customerSearchQuery.trim() !== '') {
    const query = customerSearchQuery.toLowerCase()
    customersList = customersList.filter(c => c.name.toLowerCase().includes(query) || c.phone.includes(query))
  }

  customersList.sort((a, b) => {
    if (customerSortOption === 'spent_desc') {
      if (b.totalSpent !== a.totalSpent) return b.totalSpent - a.totalSpent
      return b.totalOrders - a.totalOrders
    } else if (customerSortOption === 'spent_asc') {
      if (a.totalSpent !== b.totalSpent) return a.totalSpent - b.totalSpent
      return a.totalOrders - b.totalOrders
    } else if (customerSortOption === 'new_to_old') { return b.firstSeen - a.firstSeen } 
    else if (customerSortOption === 'old_to_new') { return a.firstSeen - b.firstSeen }
    return 0
  })

  if (!isMounted) return null

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 selection:bg-[#FF0055]/30">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm glass-strong border border-red-500/30 rounded-[2rem] p-8 relative overflow-hidden shadow-[0_0_50px_rgba(255,0,85,0.1)] text-center">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(255,0,85,0.3)]"><ShieldAlert className="w-10 h-10 text-red-500" /></div>
          <h1 className="text-3xl font-black italic uppercase text-white tracking-tighter mb-2">RESTRICTED <span className="text-red-500">AREA</span></h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-8">Admin Authorization Required</p>
          <form onSubmit={handleAdminAccess} className="space-y-6 relative z-10">
            <div className="space-y-2 text-left">
              <Label className="text-[10px] uppercase tracking-[0.2em] text-red-500 font-black">Enter Passcode</Label>
              <div className="relative">
                <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500/50" />
                <Input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} className={`pl-12 h-14 bg-black/50 border-red-500/30 text-white rounded-xl font-mono text-xl tracking-[0.3em] focus-visible:border-red-500 focus-visible:ring-1 focus-visible:ring-red-500 ${authError ? 'border-red-500 animate-shake' : ''}`} autoFocus />
              </div>
            </div>
            <Button type="submit" className="w-full h-14 bg-red-500 text-white font-black text-lg hover:bg-red-600 shadow-[0_0_20px_rgba(255,0,85,0.4)] tracking-widest uppercase transition-all">DECRYPT</Button>
            <Link href="/"><Button type="button" variant="ghost" className="w-full mt-4 text-muted-foreground hover:text-white uppercase tracking-widest text-xs font-bold"><ArrowLeft className="w-4 h-4 mr-2" /> Return to Safety</Button></Link>
          </form>
        </motion.div>
      </div>
    )
  }

  const analyticsDelivered = filteredAnalyticsOrders.filter((o: any) => o.status === 'Delivered')
  const analyticsCancelled = filteredAnalyticsOrders.filter((o: any) => o.status === 'Cancelled')
  const analyticsPending = filteredAnalyticsOrders.filter((o: any) => o.status === 'Pending' || o.status === 'In Transit')
  const totalRevenue = analyticsDelivered.reduce((acc: number, order: any) => acc + order.amount, 0)
  const totalOrdersCount = filteredAnalyticsOrders.length
  const avgOrderValue = analyticsDelivered.length > 0 ? Math.round(totalRevenue / analyticsDelivered.length) : 0
  const uniqueCustomersInAnalytics = new Set(filteredAnalyticsOrders.map((o: any) => o.phone)).size;

  const productSales = new Map()
  analyticsDelivered.forEach((order: any) => {
    order.items.forEach((item: any) => {
      const current = productSales.get(item.name) || { qty: 0, revenue: 0 }
      productSales.set(item.name, { qty: current.qty + item.quantity, revenue: current.revenue + (item.price * item.quantity) })
    })
  })
  const topProducts = Array.from(productSales.entries()).map(([name, data]) => ({ name, ...data as {qty: number, revenue: number} })).sort((a, b) => b.qty - a.qty).slice(0, 5)

  let totalSupplierCost = 0; let totalBilledRevenue = 0; const billedItemsMap = new Map();
  filteredBillingOrders.forEach((order: any) => {
    totalBilledRevenue += order.amount;
    order.items.forEach((item: any) => {
      const invItem = products.find((p:any) => p.name === item.name);
      const costRate = invItem?.cost_price ? Number(invItem.cost_price) : 0;
      const totalCostForItem = costRate * item.quantity;
      totalSupplierCost += totalCostForItem;
      const current = billedItemsMap.get(item.name) || { qty: 0, totalCost: 0, costRate: costRate };
      billedItemsMap.set(item.name, { qty: current.qty + item.quantity, totalCost: current.totalCost + totalCostForItem, costRate: costRate });
    });
  });
  const totalBilledProfit = totalBilledRevenue - totalSupplierCost;
  const billedItemsArray = Array.from(billedItemsMap.entries()).map(([name, data]) => ({ name, ...data as any })).sort((a, b) => b.totalCost - a.totalCost);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
      case 'In Transit': return 'bg-blue-500/10 text-blue-500 border-blue-500/30'
      case 'Delivered': return 'bg-[#CCFF00]/10 text-[#CCFF00] border-[#CCFF00]/30'
      case 'Cancelled': return 'bg-red-500/10 text-red-500 border-red-500/30'
      default: return 'bg-white/10 text-white'
    }
  }

  const handleSelectCustomer = (phone: string) => { setSelectedCustomers(prev => prev.includes(phone) ? prev.filter(p => p !== phone) : [...prev, phone]) }
  const handleSelectAll = () => { if (selectedCustomers.length === customersList.length) setSelectedCustomers([]); else setSelectedCustomers(customersList.map(c => c.phone)) }
  
  const handleSendToApp = async () => {
    if (selectedCustomers.length === 0) return alert("Select at least one customer!")
    if (!messageText.trim()) return alert("Message is empty!")
    try {
      await Promise.all(selectedCustomers.map(phone => addNotification(phone, messageText)))
      alert(`✅ Pushed successfully!`)
      setSelectedCustomers([]); setMessageText('')
    } catch (error) { alert("⚠️ Error sending message.") }
  }

  const handleSendToWhatsApp = () => {
    if (selectedCustomers.length === 0) return alert("Select at least one customer!")
    if (!messageText.trim()) return alert("Message is empty!")
    if (selectedCustomers.length === 1) {
      const phone = selectedCustomers[0].replace(/\D/g, '')
      window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(messageText)}`, '_blank')
    } else { alert(`⚠️ Bulk requires API.`) }
  }

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault()
    const productPayload = { 
      name: formData.name, price: Number(formData.price), mrp: Number(formData.mrp), cost_price: Number(formData.cost_price), category: formData.category, 
      subcategory: formPlacement === 'sub' ? formData.subcategory : '', 
      image: formData.image || '/placeholder.jpg', inStock: formData.inStock,
      description: formData.description, galleryImages: formData.galleryImages, foodPref: formData.foodPref
    }
    if (editingId) updateProduct(editingId, productPayload)
    else addProduct(productPayload)
    setIsProductSheetOpen(false); resetForm()
  }

  const openEdit = (product: any) => { 
    setEditingId(product.id); 
    setFormPlacement(product.subcategory ? 'sub' : 'main');
    setFormData({ 
      name: product.name, price: product.price.toString(), mrp: product.mrp.toString(), cost_price: product.cost_price?.toString() || '', category: product.category, subcategory: product.subcategory || '', image: product.image, inStock: product.inStock,
      description: product.description || '', galleryImages: product.galleryImages || [], foodPref: product.foodPref || 'none'
    }); 
    setIsProductSheetOpen(true) 
  }

  const resetForm = () => { 
    setEditingId(null); 
    setFormPlacement('main');
    setFormData({ name: '', price: '', mrp: '', cost_price: '', category: (selectedCategoryView || displayCategories[0] || '') as string, subcategory: '', image: '', inStock: true, description: '', galleryImages: [], foodPref: 'none' }); 
    setNewGalleryUrl(''); 
  }

  const addGalleryUrl = () => {
    if(newGalleryUrl.trim() !== '') {
      setFormData(prev => ({ ...prev, galleryImages: [...prev.galleryImages, newGalleryUrl.trim()] }))
      setNewGalleryUrl('')
    }
  }
  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({ ...prev, galleryImages: prev.galleryImages.filter((_, i) => i !== index) }))
  }

  const activeCategoryObject = categories?.find((c: any) => c.name === formData.category);
  const activeSubcategories = activeCategoryObject?.subcategories || [];

  const viewCategoryObject = categories?.find((c: any) => c.name === selectedCategoryView);
  const viewSubcategories = viewCategoryObject?.subcategories || [];

  const displayedProducts = products.filter((p:any) => {
    if (p.category !== selectedCategoryView) return false;
    if (selectedSubcategoryFilter) {
      return p.subcategory === selectedSubcategoryFilter;
    } else {
      if (subcatViewMode === 'folders' && viewSubcategories.length > 0) {
        return !p.subcategory || p.subcategory.trim() === '';
      } else {
        return true;
      }
    }
  });

  const SidebarNav = () => (
    <div className="flex flex-col h-full bg-black">
      <div className="p-6 border-b border-white/10 flex items-center gap-3">
        <Link href="/"><Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-[#00FFFF] hover:bg-white/10"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <span className="text-2xl font-black italic uppercase text-white">WebFoo <span className="text-[#CCFF00]">Admin</span></span>
      </div>
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 scrollbar-hide">
        {MENU_ITEMS.map((item) => (
          <button key={item.id} onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); setSelectedCategoryView(null); setSelectedSubcategoryFilter(null); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-[#00FFFF]/10 text-[#00FFFF] border border-[#00FFFF]/30 shadow-[0_0_15px_rgba(0,255,255,0.1)]' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}`}>
            <item.icon className="w-5 h-5" />
            <span className="font-bold text-sm uppercase tracking-widest">{item.label}</span>
            {item.id === 'live_orders' && liveOrders.length > 0 && (
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#FF0055] text-[10px] font-black text-white">{liveOrders.length}</span>
            )}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        <Button onClick={() => { sessionStorage.removeItem('webfoo_admin_unlocked'); setIsAuthorized(false); }} className="w-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30 uppercase tracking-widest font-black text-xs h-12">
          <PowerOff className="w-4 h-4 mr-2" /> Lock System
        </Button>
      </div>
    </div>
  )

  const renderProductCard = (product: any) => (
    <Card key={product.id} className={`glass-strong border-white/10 overflow-hidden group transition-all ${!product.inStock ? 'opacity-60 grayscale' : 'hover:border-[#00FFFF]/30'}`}>
      <div className="relative h-40 w-full bg-white/5"><img src={product.image || "/placeholder.jpg"} alt={product.name} className="object-cover w-full h-full" onError={(e) => { e.currentTarget.src = '/placeholder.jpg' }} />
        {product.foodPref === 'veg' && <div className="absolute top-2 left-2 bg-white rounded-sm p-0.5"><div className="w-3 h-3 border-2 border-green-600 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div></div></div>}
        {product.foodPref === 'non-veg' && <div className="absolute top-2 left-2 bg-white rounded-sm p-0.5"><div className="w-3 h-3 border-2 border-red-600 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div></div></div>}
        {!product.inStock && <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10"><span className="bg-red-500 text-white font-black text-[10px] px-2 py-1 uppercase rounded">Out of Stock</span></div>}
        <div className="absolute top-2 right-2 flex gap-2 z-20"><button onClick={(e) => { e.stopPropagation(); openEdit(product) }} className="w-8 h-8 rounded-full bg-black/90 border border-[#00FFFF]/50 flex items-center justify-center text-[#00FFFF] shadow-[0_0_10px_rgba(0,255,255,0.2)] hover:bg-[#00FFFF] hover:text-black transition-all"><Edit className="w-4 h-4" /></button><button onClick={(e) => { e.stopPropagation(); if(confirm("Delete this product?")) deleteProduct(product.id) }} className="w-8 h-8 rounded-full bg-black/90 border border-red-500/50 flex items-center justify-center text-red-500 shadow-[0_0_10px_rgba(255,0,0,0.2)] hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button></div>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2"><p className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-1 truncate pr-2">{product.category} {product.subcategory && `> ${product.subcategory}`}</p><button onClick={() => toggleStock(product.id)} className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded border uppercase flex items-center gap-1 ${product.inStock ? 'text-green-400 border-green-400/30 bg-green-400/10' : 'text-red-400 border-red-400/30 bg-red-400/10'}`}>{product.inStock ? 'In Stock' : 'Out'}</button></div>
        <h3 className="font-bold text-white text-sm leading-tight truncate">{product.name}</h3><div className="flex items-center gap-2 mt-2"><span className="font-mono font-black text-[#00FFFF]">₹{product.price}</span>{product.mrp > product.price && <span className="text-xs text-muted-foreground line-through font-mono">₹{product.mrp}</span>}</div>
      </CardContent>
    </Card>
  )

  return (
    <div className="flex min-h-screen bg-[#050505] text-foreground font-sans selection:bg-[#00FFFF]/30">
      <audio ref={alertAudioRef} src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" preload="auto" />
      <aside className="hidden md:flex flex-col w-72 glass-strong border-r border-white/10 fixed top-0 bottom-0 left-0 z-40"><SidebarNav /></aside>
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 glass-strong border-b border-white/10 z-40 flex items-center px-4 justify-between">
        <div className="flex items-center gap-3">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild><Button variant="ghost" size="icon" className="text-white hover:bg-white/10"><Menu className="w-6 h-6" /></Button></SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 bg-black border-r border-[#00FFFF]/30"><SheetHeader className="sr-only"><SheetTitle>Menu</SheetTitle></SheetHeader><SidebarNav /></SheetContent>
          </Sheet>
          <span className="text-xl font-black italic uppercase text-white">Admin <span className="text-[#CCFF00]">Panel</span></span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => fetchData && fetchData()} className="text-[#00FFFF] border border-[#00FFFF]/30 hover:bg-[#00FFFF]/10">
          <Zap className="w-4 h-4" />
        </Button>
      </header>

      <main className="flex-1 md:ml-72 pt-20 md:pt-8 p-4 md:p-8 overflow-y-auto min-h-screen">
        <div className="mb-8 hidden md:flex justify-between items-center">
          <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter flex items-center gap-2">
            {MENU_ITEMS.find(m => m.id === activeTab)?.label}
            {activeTab === 'live_orders' && liveOrders.length > 0 && <span className="w-3 h-3 rounded-full bg-[#FF0055] animate-pulse ml-2" />}
          </h2>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => fetchData && fetchData()} className="border-[#00FFFF]/30 text-[#00FFFF] hover:bg-[#00FFFF] hover:text-black font-black tracking-widest uppercase">
              <Zap className="w-4 h-4 mr-2" /> Refresh Data
            </Button>
            <Button variant="outline" onClick={() => { alertAudioRef.current?.play(); alert("✅ Alert Sound Enabled! Naye order par aawaz aayegi."); }} className="border-[#CCFF00]/30 text-[#CCFF00] hover:bg-[#CCFF00] hover:text-black font-black tracking-widest uppercase">
              <Volume2 className="w-4 h-4 mr-2" /> 🔔 Sound
            </Button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* BILLING */}
          {activeTab === 'billing' && (
            <motion.div key="billing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-strong p-4 rounded-xl border border-[#00FFFF]/20 shadow-[0_0_15px_rgba(0,255,255,0.05)]">
                <div><h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2"><Wallet className="w-4 h-4 text-[#00FFFF]"/> Wholesale Billing</h3></div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <select value={billingFilter} onChange={(e) => setBillingFilter(e.target.value)} className="bg-black/50 border border-white/10 rounded-lg px-3 h-10 text-xs font-bold text-white focus:outline-none focus:border-[#00FFFF] w-full sm:w-auto uppercase tracking-wider">
                    <option value="today" className="bg-black">Today's Bill</option><option value="yesterday" className="bg-black">Yesterday</option><option value="all" className="bg-black">All Time</option><option value="custom" className="bg-black">Custom Date</option>
                  </select>
                  {billingFilter === 'custom' && <Input type="date" value={billingCustomDate} onChange={(e) => setBillingCustomDate(e.target.value)} className="bg-black/50 border-white/10 h-10 text-xs w-full sm:w-auto text-white" />}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="glass-strong border-white/10"><CardContent className="p-6"><p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-2">Total Sales (Revenue)</p><p className="text-3xl font-black text-white font-mono">₹{totalBilledRevenue}</p></CardContent></Card>
                <Card className="glass-strong border-red-500/30 bg-red-500/5"><CardContent className="p-6"><p className="text-xs text-red-400 uppercase tracking-widest font-bold mb-2">Payable to Shop (Cost)</p><p className="text-3xl font-black text-red-500 font-mono">₹{totalSupplierCost}</p></CardContent></Card>
                <Card className="glass-strong border-[#00FF55]/30 bg-[#00FF55]/5"><CardContent className="p-6"><p className="text-xs text-[#00FF55] uppercase tracking-widest font-bold mb-2">Your Profit</p><p className="text-3xl font-black text-[#00FF55] font-mono">₹{totalBilledProfit}</p></CardContent></Card>
              </div>
              <Card className="glass-strong border-white/10">
                <CardContent className="p-6">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 border-b border-white/10 pb-4">Items Breakdown</h3>
                  {billedItemsArray.length === 0 ? (
                    <div className="text-center py-10 opacity-50"><Wallet className="w-8 h-8 mx-auto mb-2" /><p className="text-xs uppercase tracking-widest font-bold">No items delivered in this period</p></div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-[10px] uppercase font-black text-muted-foreground tracking-widest"><span className="flex-1">Product</span><span className="w-16 text-center">Qty</span><span className="w-24 text-right">Buy Rate</span><span className="w-24 text-right text-white">Total Cost</span></div>
                      {billedItemsArray.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center px-4 py-3 bg-black/50 rounded-lg border border-white/5 hover:border-white/20 transition-colors"><span className="flex-1 font-bold text-sm text-white truncate pr-4">{item.name}</span><span className="w-16 text-center font-mono text-[#00FFFF] font-bold">{item.qty}</span><span className="w-24 text-right font-mono text-muted-foreground">₹{item.costRate}</span><span className="w-24 text-right font-mono font-black text-red-400">₹{item.totalCost}</span></div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* CATEGORIES */}
          {activeTab === 'categories' && (
             <motion.div key="categories" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <Card className="glass-strong border-white/10 mb-8">
                  <CardContent className="p-6 sm:p-8 space-y-6">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-4"><LayoutGrid className="w-6 h-6 text-[#00FFFF]" /><h3 className="text-xl font-black uppercase text-white">Create Main Category</h3></div>
                    <form onSubmit={handleSaveCategory} className="flex flex-col gap-4">
                      <div className="space-y-4 bg-[#00FFFF]/5 p-4 rounded-xl border border-[#00FFFF]/20">
                        <Label className="text-xs font-black uppercase tracking-widest text-[#00FFFF] flex items-center gap-2"><LinkIcon className="w-4 h-4"/> Paste Category Image URL</Label>
                        <p className="text-[10px] text-white/50">Host image on ImageKit.io and paste direct URL here.</p>
                        <Input type="url" placeholder="https://ik.imagekit.io/..." value={newCategoryImage} onChange={(e) => setNewCategoryImage(e.target.value)} className="bg-black border-white/20 text-xs focus-visible:border-[#00FFFF] h-12 text-white" />
                        {newCategoryImage && (
                          <div className="mt-2 relative w-full sm:w-48 h-24 rounded-lg overflow-hidden border border-[#00FFFF]/20 bg-black/50">
                            <img src={newCategoryImage} alt="URL Preview" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = '' }} />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4 items-end mt-2">
                        <div className="flex-1 w-full space-y-2"><Label className="text-xs uppercase tracking-widest text-[#00FFFF]">{editingCategoryId ? 'Edit Category Name' : 'New Category Name'}</Label><Input required placeholder="e.g. Fast Food" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="bg-black/50 border-white/20 text-white h-12" /></div>
                        <Button type="submit" className="h-12 w-full sm:w-auto bg-[#CCFF00] text-black font-black uppercase tracking-widest px-8 hover:bg-[#CCFF00]/90">{editingCategoryId ? 'UPDATE' : 'ADD CATEGORY'}</Button>
                        {editingCategoryId && <Button type="button" onClick={resetCategoryForm} variant="outline" className="h-12 w-full sm:w-auto border-white/20 text-white hover:bg-white/10">CANCEL</Button>}
                      </div>
                    </form>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {categories.map((cat: any, idx: number) => {
                    const subCats = cat.subcategories || [];
                    const isConverting = convertingCategory?.id === cat.id;

                    return (
                    <Card key={cat.id} className={`glass-strong border transition-all ${cat.isActive !== false ? 'border-white/10' : 'border-white/5 opacity-60 grayscale'} ${isConverting ? 'ring-2 ring-orange-500/50' : ''}`}>
                      <CardContent className="p-0">
                        <div className="p-5 border-b border-white/5 flex justify-between items-start bg-white/5">
                          <div className="flex items-center gap-4">
                            {cat.image ? <img src={cat.image} alt={cat.name} className="w-12 h-12 rounded-lg object-cover border border-white/20 bg-black" /> : <div className="w-12 h-12 rounded-lg bg-black flex items-center justify-center border border-white/20"><PackageIcon className="w-6 h-6 text-white/50" /></div>}
                            <div>
                              <h4 className="font-black text-white uppercase tracking-wider text-lg">{cat.name}</h4>
                              <Badge variant={cat.isActive !== false ? "outline" : "secondary"} className={`mt-1 text-[8px] font-black uppercase tracking-widest ${cat.isActive !== false ? 'text-[#CCFF00] border-[#CCFF00]/30' : 'text-muted-foreground border-white/10'}`}>{cat.isActive !== false ? 'ACTIVE' : 'OFF'}</Badge>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap justify-end gap-1 w-24">
                            <Button variant="ghost" size="icon" onClick={() => setConvertingCategory(cat)} className="w-8 h-8 text-orange-400 hover:bg-orange-400/20" title="Move to Sub-category">
                               <CornerDownRight className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => updateCategory(cat.id, { isActive: cat.isActive === false ? true : false })} className={`w-8 h-8 ${cat.isActive !== false ? 'text-white hover:text-red-400 hover:bg-red-400/10' : 'text-[#CCFF00] hover:bg-[#CCFF00]/20'}`} title={cat.isActive !== false ? "Turn Off" : "Turn On"}><Power className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => editCategoryUI(cat)} className="w-8 h-8 text-[#CCFF00] hover:bg-[#CCFF00]/20"><Edit className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => reorderCategory(cat.id, 'up')} disabled={idx === 0} className="w-8 h-8 text-[#00FFFF] hover:bg-[#00FFFF]/20"><ArrowUp className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => reorderCategory(cat.id, 'down')} disabled={idx === categories.length - 1} className="w-8 h-8 text-[#00FFFF] hover:bg-[#00FFFF]/20"><ArrowDown className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => { if(confirm("Delete entire category?")) deleteCategory(cat.id) }} className="w-8 h-8 text-red-500 hover:text-white hover:bg-red-500"><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </div>
                        
                        {isConverting && (
                          <div className="p-4 bg-orange-500/10 border-b border-orange-500/30">
                            <Label className="text-orange-400 text-[10px] font-black uppercase tracking-widest mb-2 block flex items-center gap-2"><CornerDownRight className="w-3 h-3"/> Move '{cat.name}' into Parent folder:</Label>
                            <div className="flex gap-2">
                              <select value={targetParentCategory} onChange={e => setTargetParentCategory(e.target.value)} className="flex-1 bg-black border border-orange-500/30 text-white text-xs h-10 rounded-lg px-3 focus:outline-none focus:border-orange-500">
                                <option value="">Select Parent Category...</option>
                                {categories.filter((c: any) => c.id !== cat.id).map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
                              </select>
                              <Button onClick={() => handleConvertCategory(cat)} className="h-10 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black px-4 uppercase tracking-widest">Merge</Button>
                              <Button onClick={() => {setConvertingCategory(null); setTargetParentCategory('');}} variant="ghost" className="h-10 text-muted-foreground hover:text-white"><X className="w-4 h-4"/></Button>
                            </div>
                            <p className="text-[9px] text-orange-400/70 mt-3 uppercase tracking-widest leading-tight">⚠️ All products inside '{cat.name}' will be automatically moved to the new parent. This category block will be deleted.</p>
                          </div>
                        )}

                        <div className="p-5 bg-black/30">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2"><LayoutGrid className="w-3 h-3"/> Sub-Categories</p>
                          {subCats.length > 0 ? (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {subCats.map((sub: string, i: number) => (
                                <Badge key={i} variant="outline" className="bg-[#00FFFF]/5 border-[#00FFFF]/30 text-white pl-3 pr-1 py-1 flex items-center gap-2">
                                  {sub} <button onClick={() => handleRemoveSubcat(cat.id, subCats, sub)} className="text-[#00FFFF] hover:text-red-500 hover:bg-red-500/20 rounded-full p-0.5"><X className="w-3 h-3"/></button>
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-white/30 italic mb-4">No sub-categories added.</p>
                          )}
                          
                          <div className="flex gap-2">
                            <Input placeholder="Add new sub-category..." value={subCatInputs[cat.id] || ''} onChange={(e) => setSubCatInputs({...subCatInputs, [cat.id]: e.target.value})} className="bg-black/50 border-white/10 text-xs h-9 focus-visible:border-[#00FFFF] text-white" />
                            <Button onClick={() => handleAddSubcat(cat.id, subCats)} className="h-9 bg-[#00FFFF] text-black font-black hover:bg-[#00FFFF]/80 px-4 text-xs"><PlusCircle className="w-4 h-4 mr-1"/> ADD</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )})}
                </div>
             </motion.div>
          )}

          {/* SETTINGS */}
          {activeTab === 'settings' && (
             <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 max-w-3xl">
                <Card className="glass-strong border-white/10 mb-8 border-[#CCFF00]/30 shadow-[0_0_20px_rgba(204,255,0,0.05)]">
                  <CardContent className="p-6 sm:p-8 space-y-6">
                    <div className="flex items-center gap-3 border-b border-[#CCFF00]/30 pb-4"><UserCircle className="w-6 h-6 text-[#CCFF00]" /><h3 className="text-xl font-black uppercase text-white">Footer Profile (About)</h3></div>
                    <div className="flex flex-col sm:flex-row gap-8">
                      <div className="shrink-0 space-y-4 w-full sm:w-48">
                        <Label className="text-xs uppercase font-bold text-[#CCFF00] flex items-center gap-2"><LinkIcon className="w-4 h-4"/> Profile Image URL</Label>
                        <p className="text-[10px] text-white/50 mb-2">Use an external link (ImageKit).</p>
                        <Input type="url" placeholder="https://ik.imagekit.io/..." value={settingsFormData.ownerPhoto} onChange={(e) => setSettingsFormData({...settingsFormData, ownerPhoto: e.target.value})} className="bg-black border-[#CCFF00]/30 text-xs focus-visible:border-[#CCFF00] h-12 text-white w-full" />
                        {settingsFormData.ownerPhoto && (
                          <div className="relative w-20 h-20 rounded-full border-2 border-[#CCFF00]/40 bg-black mt-4 overflow-hidden mx-auto sm:mx-0">
                            <img src={settingsFormData.ownerPhoto} alt="Owner" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="space-y-2"><Label className="text-xs uppercase font-bold text-muted-foreground">Owner Name</Label><Input value={settingsFormData.ownerName} onChange={(e) => setSettingsFormData({...settingsFormData, ownerName: e.target.value})} placeholder="e.g. Vineet Kumar" className="bg-black/50 border-white/10 text-white" /></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2"><Label className="text-xs uppercase font-bold text-muted-foreground">Phone Number</Label><Input value={settingsFormData.ownerPhone} onChange={(e) => setSettingsFormData({...settingsFormData, ownerPhone: e.target.value})} placeholder="+91 XXXXX" className="bg-black/50 border-white/10 text-white font-mono" /></div>
                          <div className="space-y-2"><Label className="text-xs uppercase font-bold text-muted-foreground">Email</Label><Input type="email" value={settingsFormData.ownerEmail} onChange={(e) => setSettingsFormData({...settingsFormData, ownerEmail: e.target.value})} placeholder="contact@webfoo.in" className="bg-black/50 border-white/10 text-white" /></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* THEME */}
                <Card className="glass-strong border-white/10 mb-8 border-[#00FFFF]/30">
                  <CardContent className="p-6 sm:p-8 space-y-6">
                    <div className="flex items-center gap-3 border-b border-[#00FFFF]/30 pb-4"><Palette className="w-6 h-6 text-[#00FFFF]" /><h3 className="text-xl font-black uppercase text-white">Website Theme Colors</h3></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2"><Label className="text-xs uppercase font-bold text-muted-foreground">Background Color</Label><div className="flex gap-3 items-center"><input type="color" value={themeColorData.background_color} onChange={(e) => setThemeColorData({...themeColorData, background_color: e.target.value})} className="w-12 h-12 rounded cursor-pointer border-0 bg-transparent" /><Input value={themeColorData.background_color} onChange={(e) => setThemeColorData({...themeColorData, background_color: e.target.value})} className="font-mono bg-black/50 border-white/10 uppercase" /></div></div>
                      <div className="space-y-2"><Label className="text-xs uppercase font-bold text-muted-foreground">Main Text Color</Label><div className="flex gap-3 items-center"><input type="color" value={themeColorData.text_color} onChange={(e) => setThemeColorData({...themeColorData, text_color: e.target.value})} className="w-12 h-12 rounded cursor-pointer border-0 bg-transparent" /><Input value={themeColorData.text_color} onChange={(e) => setThemeColorData({...themeColorData, text_color: e.target.value})} className="font-mono bg-black/50 border-white/10 uppercase" /></div></div>
                      <div className="space-y-2"><Label className="text-xs uppercase font-bold text-muted-foreground">Primary Accent (Icons/Lines)</Label><div className="flex gap-3 items-center"><input type="color" value={themeColorData.primary_color} onChange={(e) => setThemeColorData({...themeColorData, primary_color: e.target.value})} className="w-12 h-12 rounded cursor-pointer border-0 bg-transparent" /><Input value={themeColorData.primary_color} onChange={(e) => setThemeColorData({...themeColorData, primary_color: e.target.value})} className="font-mono bg-black/50 border-white/10 uppercase" /></div></div>
                      <div className="space-y-2"><Label className="text-xs uppercase font-bold text-muted-foreground">Button Color</Label><div className="flex gap-3 items-center"><input type="color" value={themeColorData.button_color} onChange={(e) => setThemeColorData({...themeColorData, button_color: e.target.value})} className="w-12 h-12 rounded cursor-pointer border-0 bg-transparent" /><Input value={themeColorData.button_color} onChange={(e) => setThemeColorData({...themeColorData, button_color: e.target.value})} className="font-mono bg-black/50 border-white/10 uppercase" /></div></div>
                    </div>
                    <div className="flex justify-end pt-4 border-t border-[#00FFFF]/20"><Button onClick={handleSaveTheme} disabled={isThemeSaving} className="h-12 bg-[#00FFFF] text-black hover:bg-[#00FFFF]/80 font-black uppercase tracking-widest px-8 rounded-full disabled:opacity-50">{isThemeSaving ? 'Saving...' : 'Update Colors'}</Button></div>
                  </CardContent>
                </Card>

                <form onSubmit={handleSaveSettings} className="space-y-6">
                  <Card className="glass-strong border-white/10">
                    <CardContent className="p-6 sm:p-8 space-y-6">
                      <div className="flex items-center gap-3 border-b border-white/10 pb-4"><Settings className="w-6 h-6 text-[#00FFFF]" /><h3 className="text-xl font-black uppercase text-white">Store Operations</h3></div>
                      <div className="space-y-4">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Operating Mode</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <button type="button" onClick={() => setSettingsFormData({...settingsFormData, storeMode: 'auto'})} className={`p-4 rounded-xl border text-left transition-all ${settingsFormData.storeMode === 'auto' ? 'bg-[#00FFFF]/10 border-[#00FFFF] text-[#00FFFF]' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}><Clock className="w-5 h-5 mb-2" /><h4 className="font-bold uppercase tracking-widest">Auto Timer</h4></button>
                          <button type="button" onClick={() => setSettingsFormData({...settingsFormData, storeMode: 'manual'})} className={`p-4 rounded-xl border text-left transition-all ${settingsFormData.storeMode === 'manual' ? 'bg-[#00FFFF]/10 border-[#00FFFF] text-[#00FFFF]' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}><Power className="w-5 h-5 mb-2" /><h4 className="font-bold uppercase tracking-widest">Manual Override</h4></button>
                        </div>
                      </div>
                      {settingsFormData.storeMode === 'auto' ? (
                        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/10">
                          <div className="space-y-2"><Label className="text-xs font-bold uppercase tracking-widest">Opening Time</Label><Input type="time" value={settingsFormData.openTime} onChange={(e) => setSettingsFormData({...settingsFormData, openTime: e.target.value})} className="bg-black border-white/20 text-[#00FFFF] font-mono font-bold text-lg h-14" /></div>
                          <div className="space-y-2"><Label className="text-xs font-bold uppercase tracking-widest">Closing Time</Label><Input type="time" value={settingsFormData.closeTime} onChange={(e) => setSettingsFormData({...settingsFormData, closeTime: e.target.value})} className="bg-black border-white/20 text-[#00FFFF] font-mono font-bold text-lg h-14" /></div>
                        </div>
                      ) : (
                        <div className="pt-4 border-t border-white/10 space-y-4">
                          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Manual Status Switch</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <button type="button" onClick={() => setSettingsFormData({...settingsFormData, isStoreOpen: true})} className={`p-6 rounded-[1.5rem] border flex items-center gap-4 transition-all ${settingsFormData.isStoreOpen ? 'bg-[#00FF55]/10 border-[#00FF55] text-green-300' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}><Zap className={`w-10 h-10 ${settingsFormData.isStoreOpen ? 'text-[#00FF55] [filter:drop-shadow(0_0_10px_#00FF55)]' : 'text-white/30'}`} /><div className="flex-1"><h4 className="font-extrabold uppercase tracking-tight text-xl">Online</h4></div><CheckSquare className={`w-6 h-6 shrink-0 ${settingsFormData.isStoreOpen ? 'text-[#00FF55]' : 'text-white/10'}`} /></button>
                            <button type="button" onClick={() => setSettingsFormData({...settingsFormData, isStoreOpen: false})} className={`p-6 rounded-[1.5rem] border flex items-center gap-4 transition-all ${!settingsFormData.isStoreOpen ? 'bg-red-500/10 border-red-500 text-red-300' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}><AlertTriangle className={`w-10 h-10 ${!settingsFormData.isStoreOpen ? 'text-red-500 [filter:drop-shadow(0_0_10px_#ff0000)]' : 'text-white/30'}`} /><div className="flex-1"><h4 className="font-extrabold uppercase tracking-tight text-xl">Closed</h4></div><CheckSquare className={`w-6 h-6 shrink-0 ${!settingsFormData.isStoreOpen ? 'text-red-500' : 'text-white/10'}`} /></button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <Card className="glass-strong border-white/10">
                    <CardContent className="p-6 sm:p-8 space-y-6">
                      <div className="flex items-center gap-3 border-b border-white/10 pb-4"><Zap className="w-6 h-6 text-[#CCFF00]" /><h3 className="text-xl font-black uppercase text-white">Open State Banner</h3></div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="space-y-2"><Label>Banner Image URL</Label><Input value={settingsFormData.bannerImageUrlOpen} onChange={e => setSettingsFormData({...settingsFormData, bannerImageUrlOpen: e.target.value})} placeholder="https://..." className="bg-black/50" /></div><div className="space-y-2"><Label>Banner Text</Label><textarea value={settingsFormData.bannerTextOpen} onChange={e => setSettingsFormData({...settingsFormData, bannerTextOpen: e.target.value})} placeholder="New deals now!" rows={3} className="w-full h-12 bg-black/50 border border-white/10 focus-visible:border-[#00FFFF] rounded-md p-3 text-sm text-white resize-none" /></div></div>
                    </CardContent>
                  </Card>
                  <Card className="glass-strong border-white/10">
                    <CardContent className="p-6 sm:p-8 space-y-6">
                      <div className="flex items-center gap-3 border-b border-white/10 pb-4"><MoonStar className="w-6 h-6 text-red-500" /><h3 className="text-xl font-black uppercase text-white">Closed State Banner</h3></div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="space-y-2"><Label>Banner Image URL</Label><Input value={settingsFormData.bannerImageUrlClosed} onChange={e => setSettingsFormData({...settingsFormData, bannerImageUrlClosed: e.target.value})} placeholder="https://..." className="bg-black/50" /></div><div className="space-y-2"><Label>Closed Line</Label><textarea value={settingsFormData.bannerTextClosed} onChange={e => setSettingsFormData({...settingsFormData, bannerTextClosed: e.target.value})} placeholder="Sleeping right now..." rows={3} className="w-full h-12 bg-black/50 border border-white/10 focus-visible:border-[#00FFFF] rounded-md p-3 text-sm text-white resize-none" /></div></div>
                    </CardContent>
                  </Card>
                  <div className="flex justify-end pt-4 border-t border-white/10">
                    <Button type="submit" disabled={isSettingsSaving} className="h-14 bg-[#00FFFF] text-black hover:bg-[#00FFFF]/80 font-black uppercase tracking-widest px-10 rounded-full disabled:opacity-50">{isSettingsSaving ? 'Saving...' : 'Save All Settings'}</Button>
                  </div>
                </form>
             </motion.div>
          )}

          {/* ANALYTICS */}
          {activeTab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-strong p-4 rounded-xl border border-[#00FFFF]/20 shadow-[0_0_15px_rgba(0,255,255,0.05)]">
                <div className="flex items-center gap-2"><Calendar className="w-5 h-5 text-[#00FFFF]" /><h3 className="text-sm font-black text-white uppercase tracking-widest">Performance Metrics</h3></div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <select value={analyticsFilter} onChange={(e) => setAnalyticsFilter(e.target.value)} className="bg-black/50 border border-white/10 rounded-lg px-3 h-10 text-xs font-bold text-white focus:outline-none focus:border-[#00FFFF] w-full sm:w-auto uppercase tracking-wider"><option value="all" className="bg-black">All Time</option><option value="today" className="bg-black">Today</option><option value="yesterday" className="bg-black">Yesterday</option><option value="custom" className="bg-black">Custom Date</option></select>
                  {analyticsFilter === 'custom' && <Input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} className="bg-black/50 border-white/10 h-10 text-xs w-full sm:w-auto text-white" />}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="glass-strong border-[#CCFF00]/30 hover:border-[#CCFF00]/50 transition-colors"><CardContent className="p-6"><div className="flex justify-between items-start mb-4"><div className="bg-[#CCFF00]/10 p-3 rounded-lg"><IndianRupee className="w-6 h-6 text-[#CCFF00]" /></div><Badge variant="outline" className="text-[#CCFF00] border-[#CCFF00]/30 font-bold uppercase tracking-widest text-[10px]">Revenue</Badge></div><p className="text-3xl font-black text-white font-mono tracking-tighter">₹{totalRevenue}</p><p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">From Delivered</p></CardContent></Card>
                <Card className="glass-strong border-[#00FFFF]/30 hover:border-[#00FFFF]/50 transition-colors"><CardContent className="p-6"><div className="flex justify-between items-start mb-4"><div className="bg-[#00FFFF]/10 p-3 rounded-lg"><PackageIcon className="w-6 h-6 text-[#00FFFF]" /></div><Badge variant="outline" className="text-[#00FFFF] border-[#00FFFF]/30 font-bold uppercase tracking-widest text-[10px]">Orders</Badge></div><p className="text-3xl font-black text-white font-mono tracking-tighter">{totalOrdersCount}</p><p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">Total Received</p></CardContent></Card>
                <Card className="glass-strong border-white/10 hover:border-white/30 transition-colors"><CardContent className="p-6"><div className="flex justify-between items-start mb-4"><div className="bg-white/10 p-3 rounded-lg"><TrendingUp className="w-6 h-6 text-white" /></div><Badge variant="outline" className="text-white border-white/30 font-bold uppercase tracking-widest text-[10px]">A.O.V</Badge></div><p className="text-3xl font-black text-white font-mono tracking-tighter">₹{avgOrderValue}</p><p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">Average Order Value</p></CardContent></Card>
                <Card className="glass-strong border-white/10 hover:border-white/30 transition-colors"><CardContent className="p-6"><div className="flex justify-between items-start mb-4"><div className="bg-white/10 p-3 rounded-lg"><Users className="w-6 h-6 text-white" /></div><Badge variant="outline" className="text-white border-white/30 font-bold uppercase tracking-widest text-[10px]">Customers</Badge></div><p className="text-3xl font-black text-white font-mono tracking-tighter">{uniqueCustomersInAnalytics}</p><p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">Unique Buyers</p></CardContent></Card>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glass-strong border-white/10"><CardContent className="p-6"><div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4"><Target className="w-5 h-5 text-[#00FFFF]" /><h3 className="text-lg font-black text-white uppercase tracking-widest">Order Success Rate</h3></div><div className="space-y-4"><div><div className="flex justify-between text-sm mb-1"><span className="font-bold text-[#CCFF00] uppercase tracking-widest flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Delivered</span><span className="font-mono text-white">{analyticsDelivered.length}</span></div><div className="w-full bg-white/5 rounded-full h-2"><div className="bg-[#CCFF00] h-2 rounded-full" style={{ width: `${totalOrdersCount > 0 ? (analyticsDelivered.length / totalOrdersCount) * 100 : 0}%` }}></div></div></div><div><div className="flex justify-between text-sm mb-1"><span className="font-bold text-yellow-500 uppercase tracking-widest flex items-center gap-2"><Clock className="w-4 h-4"/> Pending / Transit</span><span className="font-mono text-white">{analyticsPending.length}</span></div><div className="w-full bg-white/5 rounded-full h-2"><div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${totalOrdersCount > 0 ? (analyticsPending.length / totalOrdersCount) * 100 : 0}%` }}></div></div></div><div><div className="flex justify-between text-sm mb-1"><span className="font-bold text-red-500 uppercase tracking-widest flex items-center gap-2"><XCircle className="w-4 h-4"/> Cancelled</span><span className="font-mono text-white">{analyticsCancelled.length}</span></div><div className="w-full bg-white/5 rounded-full h-2"><div className="bg-red-500 h-2 rounded-full" style={{ width: `${totalOrdersCount > 0 ? (analyticsCancelled.length / totalOrdersCount) * 100 : 0}%` }}></div></div></div></div></CardContent></Card>
                <Card className="glass-strong border-white/10"><CardContent className="p-6"><div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4"><BarChart className="w-5 h-5 text-[#CCFF00]" /><h3 className="text-lg font-black text-white uppercase tracking-widest">Top Selling Products</h3></div>{topProducts.length === 0 ? (<div className="text-center py-8 opacity-50"><PackageIcon className="w-8 h-8 mx-auto mb-2" /><p className="text-xs uppercase tracking-widest font-bold">No delivered items in period</p></div>) : (<div className="space-y-4">{topProducts.map((product, idx) => (<div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5"><div className="flex items-center gap-3"><span className="w-6 h-6 rounded flex items-center justify-center bg-white/10 text-xs font-black text-white">{idx + 1}</span><span className="font-bold text-sm text-white">{product.name}</span></div><div className="text-right"><p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">Sold: <span className="text-[#00FFFF] font-black font-mono">{product.qty}</span></p><p className="font-mono text-sm font-black text-[#CCFF00]">₹{product.revenue}</p></div></div>))}</div>)}</CardContent></Card>
              </div>
            </motion.div>
          )}

          {/* 🔥 LIVE ORDERS (UPDATED WITH PREPARING BUTTON) */}
          {activeTab === 'live_orders' && (
             <motion.div key="live_orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
               {liveOrders.length === 0 ? (
                 <Empty className="glass-strong border-[#00FFFF]/20 py-20 mt-10 max-w-md mx-auto"><EmptyContent><CheckCircle2 className="w-12 h-12 text-[#00FFFF] opacity-50 mb-4" /><EmptyTitle className="text-xl uppercase">All Clear</EmptyTitle></EmptyContent></Empty>
               ) : (
                 <div className="grid grid-cols-1 gap-6">
                   {liveOrders.map((order: any, idx: number) => {
                     const actualIndex = orders.findIndex((o: any) => o === order)
                     const orderIdToUpdate = order.id || actualIndex
                     const isBlocked = customerMeta[order.phone]?.isBlocked
                     return (
                     <Card key={idx} className={`glass-strong border-white/10 overflow-hidden relative ${isBlocked ? 'border-red-500/50' : ''}`}>
                       <div className="bg-white/5 p-4 sm:p-6 border-b border-white/10 flex justify-between">
                         <div>
                           <h3 className="text-xl font-black text-white uppercase flex items-center gap-2">{order.customer} {isBlocked && <Badge variant="destructive" className="text-[10px]">BLOCKED</Badge>}</h3>
                           <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground mt-1"><span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {order.time}</span><span className="flex items-center gap-1 text-[#00FFFF]"><Phone className="w-3 h-3" /> {order.phone}</span></div>
                         </div>
                         <span className={`px-4 py-1.5 rounded-md border text-[10px] font-black tracking-widest uppercase h-fit ${getStatusColor(order.status)}`}>{order.status === 'Pending' ? 'Preparing' : order.status}</span>
                       </div>
                       <CardContent className="p-0">
                         <div className="grid grid-cols-1 lg:grid-cols-2">
                           <div className="p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-white/5">
                             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Order Items</p>
                             <div className="space-y-3">
                               {order.items.map((item: any, i: number) => {
                                 const pInfo = products.find((p:any) => p.name === item.name);
                                 const catName = item.category || pInfo?.category || 'General';
                                 const subcatName = item.subcategory || pInfo?.subcategory || '';
                                 return (
                                 <div key={i} className="flex justify-between items-start text-sm">
                                   <div className="flex flex-col">
                                     <span className="text-white font-bold">{item.quantity}x {item.name}</span>
                                     <span className="text-[9px] text-[#00FFFF] uppercase tracking-widest mt-0.5">{catName} {subcatName && `> ${subcatName}`}</span>
                                   </div>
                                   <span className="font-mono text-muted-foreground">₹{item.price * item.quantity}</span>
                                 </div>
                               )})}
                             </div>
                             <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                               {order.discount > 0 && (
                                 <>
                                   <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase font-bold"><span>Subtotal</span><span>₹{order.subtotal}</span></div>
                                   <div className="flex justify-between items-center text-[10px] text-[#CCFF00] uppercase font-bold"><span>Discount ({order.promoCode})</span><span>-₹{order.discount}</span></div>
                                 </>
                               )}
                               <div className="flex justify-between items-center pt-2 border-t border-white/5 mt-2"><span className="text-xs font-bold text-white uppercase tracking-widest">Final Paid</span><span className="font-mono font-black text-[#00FFFF] text-lg">₹{order.amount}</span></div>
                             </div>
                           </div>
                           <div className="p-4 sm:p-6 space-y-6">
                             <div className="flex gap-3"><MapPin className="w-5 h-5 text-[#00FFFF]" /><div><p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Drop Details</p><p className="text-sm text-white mt-1">{order.landmark}</p></div></div>
                             
                             {/* THE NEW CONTROL PANEL FOR ORDER STATUS */}
                             <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                                <Button onClick={() => updateOrderStatus(orderIdToUpdate, 'Pending')} className={`h-10 text-xs font-black tracking-widest uppercase transition-all ${order.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' : 'border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10'}`} variant="outline">
                                  <ChefHat className="w-4 h-4 mr-2"/> PREPARING
                                </Button>
                                <Button onClick={() => updateOrderStatus(orderIdToUpdate, 'In Transit')} className={`h-10 text-xs font-black tracking-widest uppercase transition-all ${order.status === 'In Transit' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'border-blue-500/30 text-blue-400 hover:bg-blue-500/10'}`} variant="outline">
                                  <Bike className="w-4 h-4 mr-2"/> ON THE WAY
                                </Button>
                                <Button onClick={() => updateOrderStatus(orderIdToUpdate, 'Delivered')} className="h-10 text-xs font-black bg-[#CCFF00] text-black tracking-widest uppercase hover:bg-[#CCFF00]/80">
                                  <CheckCircle2 className="w-4 h-4 mr-2"/> DELIVERED
                                </Button>
                                <Button onClick={() => updateOrderStatus(orderIdToUpdate, 'Cancelled')} className="h-10 text-xs font-black text-red-500 tracking-widest uppercase hover:bg-red-500/10" variant="ghost">
                                  <XCircle className="w-4 h-4 mr-2"/> CANCEL
                                </Button>
                             </div>
                           </div>
                         </div>
                       </CardContent>
                     </Card>
                   )})}
                 </div>
               )}
             </motion.div>
          )}

          {/* ORDER HISTORY */}
          {activeTab === 'order_history' && (
            <motion.div key="order_history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-xl font-black uppercase text-white">Order History</h3>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <select value={historyFilter} onChange={(e) => setHistoryFilter(e.target.value)} className="bg-black/50 border border-white/10 rounded-lg px-3 h-10 text-xs font-bold text-white focus:outline-none focus:border-[#00FFFF] w-full sm:w-auto uppercase tracking-wider"><option value="all" className="bg-black">All Time</option><option value="today" className="bg-black">Today</option><option value="yesterday" className="bg-black">Yesterday</option><option value="custom" className="bg-black">Custom Date</option></select>
                  {historyFilter === 'custom' && <Input type="date" value={historyCustomDate} onChange={(e) => setHistoryCustomDate(e.target.value)} className="bg-black/50 border-white/10 h-10 text-xs w-full sm:w-auto text-white" />}
                </div>
              </div>
              {filteredOrderHistory.length === 0 ? (
                <Empty className="glass-strong border-[#00FFFF]/20 py-20 max-w-md mx-auto"><EmptyContent><History className="w-12 h-12 text-[#00FFFF] opacity-50 mb-4" /><EmptyTitle className="text-xl uppercase">No Past Orders</EmptyTitle></EmptyContent></Empty>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {filteredOrderHistory.map((order: any, idx: number) => {
                    const isBlocked = customerMeta[order.phone]?.isBlocked
                    return (
                      <Card key={idx} className={`glass-strong border-white/10 overflow-hidden relative ${isBlocked ? 'border-red-500/50' : ''}`}>
                        <div className="bg-white/5 p-4 sm:p-6 border-b border-white/10 flex justify-between items-center">
                          <div>
                            <h3 className="text-xl font-black text-white uppercase flex items-center gap-2">{order.customer} {isBlocked && <Badge variant="destructive" className="text-[10px]">BLOCKED</Badge>}</h3>
                            <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground mt-1"><span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {order.time}</span><span className="flex items-center gap-1 text-[#00FFFF]"><Phone className="w-3 h-3" /> {order.phone}</span></div>
                          </div>
                          <span className={`px-4 py-1.5 rounded-md border text-[10px] font-black tracking-widest uppercase h-fit ${getStatusColor(order.status)}`}>{order.status}</span>
                        </div>
                        <CardContent className="p-0">
                          <div className="grid grid-cols-1 lg:grid-cols-2">
                            <div className="p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-white/5">
                              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Order Items</p>
                              <div className="space-y-3">
                                {order.items.map((item: any, i: number) => {
                                  const pInfo = products.find((p:any) => p.name === item.name);
                                  const catName = item.category || pInfo?.category || 'General';
                                  const subcatName = item.subcategory || pInfo?.subcategory || '';
                                  return (
                                  <div key={i} className="flex justify-between items-start text-sm">
                                    <div className="flex flex-col">
                                      <span className="text-white font-bold">{item.quantity}x {item.name}</span>
                                      <span className="text-[9px] text-[#00FFFF] uppercase tracking-widest mt-0.5">{catName} {subcatName && `> ${subcatName}`}</span>
                                    </div>
                                    <span className="font-mono text-muted-foreground">₹{item.price * item.quantity}</span>
                                  </div>
                                )})}
                              </div>
                              <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                               {order.discount > 0 && (
                                 <><div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase font-bold"><span>Subtotal</span><span>₹{order.subtotal}</span></div><div className="flex justify-between items-center text-[10px] text-[#CCFF00] uppercase font-bold"><span>Discount ({order.promoCode})</span><span>-₹{order.discount}</span></div></>
                               )}
                               <div className="flex justify-between items-center pt-2 border-t border-white/5 mt-2"><span className="text-xs font-bold text-white uppercase tracking-widest">Final Paid</span><span className="font-mono font-black text-[#00FFFF] text-lg">₹{order.amount}</span></div>
                              </div>
                            </div>
                            <div className="p-4 sm:p-6"><div className="flex gap-3"><MapPin className="w-5 h-5 text-muted-foreground" /><div><p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Drop Details</p><p className="text-sm text-muted-foreground mt-1">{order.landmark}</p></div></div></div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* CUSTOMERS */}
          {activeTab === 'customers' && (
             <motion.div key="customers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
               
               <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 glass-strong p-4 rounded-xl border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.02)]">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-xl bg-[#00FFFF]/10 flex items-center justify-center border border-[#00FFFF]/20">
                      <Users className="w-6 h-6 text-[#00FFFF]" />
                   </div>
                   <div>
                     <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Registered</h3>
                     <p className="text-2xl font-mono font-black text-white">{customersMap.size}</p>
                   </div>
                 </div>

                 <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 flex-1 md:justify-end">
                    <div className="relative w-full sm:max-w-xs">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search Name or Phone..."
                        value={customerSearchQuery}
                        onChange={(e) => setCustomerSearchQuery(e.target.value)}
                        className="w-full bg-black/50 border-white/10 pl-9 text-white focus-visible:border-[#00FFFF]"
                      />
                    </div>
                    <select
                      value={customerSortOption}
                      onChange={(e) => setCustomerSortOption(e.target.value)}
                      className="bg-black/50 border border-white/10 rounded-lg px-3 h-10 text-xs font-bold text-white focus:outline-none focus:border-[#00FFFF] w-full sm:w-auto uppercase tracking-wider"
                    >
                      <option value="spent_desc" className="bg-black">High Spending</option>
                      <option value="spent_asc" className="bg-black">Low Spending</option>
                      <option value="new_to_old" className="bg-black">Newest First</option>
                      <option value="old_to_new" className="bg-black">Oldest First</option>
                    </select>
                 </div>
               </div>

               {customersList.length === 0 ? (
                <Empty className="glass-strong border-white/10 py-20 mt-6 max-w-md mx-auto"><EmptyContent><Search className="w-12 h-12 text-muted-foreground mb-4 opacity-50" /><EmptyTitle className="text-xl uppercase tracking-tighter">No Matches Found</EmptyTitle></EmptyContent></Empty>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {customersList.map((cust: any, idx) => {
                    const meta = customerMeta[cust.phone] || {}; const isVip = meta.isVip; const isBlocked = meta.isBlocked;
                    return (
                      <Card key={idx} className={`glass-strong border-white/10 overflow-hidden ${isBlocked ? 'opacity-50 grayscale' : 'hover:border-[#00FFFF]/20 transition-all'}`}>
                        <div className="p-5 flex flex-col sm:flex-row justify-between gap-4">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3"><h3 className="text-xl font-black text-white uppercase tracking-tight">{cust.name}</h3>{isVip && <Badge className="bg-[#CCFF00] text-black hover:bg-[#CCFF00] font-black uppercase tracking-widest text-[10px]">VIP</Badge>}{isBlocked && <Badge variant="destructive" className="font-black uppercase tracking-widest text-[10px]">BLOCKED</Badge>}</div>
                            <div className="grid grid-cols-2 gap-4"><div><p className="text-[10px] text-muted-foreground uppercase tracking-widest">Total Spent</p><p className="font-mono text-xl font-black text-[#00FFFF]">₹{cust.totalSpent}</p></div><div><p className="text-[10px] text-muted-foreground uppercase tracking-widest">Total Orders</p><p className={`font-mono text-xl font-black ${cust.totalOrders > 0 ? 'text-white' : 'text-yellow-500'}`}>{cust.totalOrders}</p></div></div>
                          </div>
                          <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                            <a href={`https://wa.me/91${cust.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex-1 sm:flex-none"><Button className="w-full bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white border border-green-500/20"><MessageCircle className="w-4 h-4 mr-2" /> WhatsApp</Button></a>
                            <a href={`tel:${cust.phone}`} className="flex-1 sm:flex-none"><Button className="w-full bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white border border-blue-500/20"><Phone className="w-4 h-4 mr-2" /> Call</Button></a>
                            <Sheet>
                              <SheetTrigger asChild><Button variant="outline" className="w-full flex-1 sm:flex-none border-white/10 hover:bg-white/10 text-white"><FileText className="w-4 h-4 mr-2" /> Details</Button></SheetTrigger>
                              <SheetContent className="bg-black/95 border-l border-[#00FFFF]/30 w-full sm:max-w-md overflow-y-auto">
                                <SheetHeader className="text-left mb-6 mt-6"><SheetTitle className="text-2xl font-black italic uppercase text-[#00FFFF]">Customer Details</SheetTitle></SheetHeader>
                                <div className="space-y-6">
                                  <div className="glass-strong p-4 rounded-xl border-white/10 space-y-2"><div><p className="font-bold text-white text-lg leading-tight">{cust.name}</p><p className="text-muted-foreground font-mono text-sm">{cust.phone}</p></div><div className="flex gap-2 items-start bg-white/5 p-3 rounded-lg border border-white/5"><MapPin className="w-4 h-4 text-[#00FFFF] shrink-0 mt-0.5" /><p className="text-sm text-white/80 leading-relaxed">{cust.address}</p></div></div>
                                  <div className="flex gap-2">
                                    <Button onClick={() => updateCustomerMeta(cust.phone, { isVip: !isVip })} className={`flex-1 ${isVip ? 'bg-white/10 text-white' : 'bg-[#CCFF00]/10 text-[#CCFF00] hover:bg-[#CCFF00] hover:text-black'} border border-[#CCFF00]/30`}><Star className="w-4 h-4 mr-2" /> {isVip ? 'Remove VIP' : 'Mark as VIP'}</Button>
                                    <Button onClick={() => updateCustomerMeta(cust.phone, { isBlocked: !isBlocked })} className={`flex-1 ${isBlocked ? 'bg-white/10 text-white' : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'} border border-red-500/30`}><Ban className="w-4 h-4 mr-2" /> {isBlocked ? 'Unblock' : 'Block'}</Button>
                                  </div>
                                  
                                  {/* DELETE DATA BUTTON */}
                                  <div className="pt-2 border-t border-white/10">
                                    <Button onClick={() => handleDeleteCustomerWipe(cust.phone)} variant="outline" className="w-full bg-red-500/5 text-red-500 border-red-500/30 hover:bg-red-500 hover:text-white">
                                      <Trash2 className="w-4 h-4 mr-2" /> Delete Customer Data
                                    </Button>
                                    <p className="text-[9px] text-muted-foreground mt-2 text-center uppercase tracking-widest leading-tight">Note: This removes data from CRM. To delete their Auth Login, use Supabase Dashboard.</p>
                                  </div>

                                  <div>
                                    <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3 border-b border-white/10 pb-2">Order History</h4>
                                    {cust.totalOrders === 0 ? (
                                      <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/20 text-center"><p className="text-yellow-500 text-xs font-bold uppercase tracking-widest">Registered but no orders placed</p></div>
                                    ) : (
                                      <div className="space-y-3">
                                        {cust.ordersList.slice().reverse().map((o: any, i: number) => (
                                          <div key={i} className="bg-white/5 p-3 rounded-lg border border-white/5 flex justify-between items-center"><div><p className="text-[10px] text-muted-foreground">{o.time}</p><p className="font-bold text-white text-sm">{o.items.length} Items</p></div><div className="text-right"><p className="font-mono font-black text-[#00FFFF]">₹{o.amount}</p><span className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-widest font-black ${getStatusColor(o.status)}`}>{o.status}</span></div></div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </SheetContent>
                            </Sheet>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
             </motion.div>
          )}

          {/* PRODUCTS */}
          {activeTab === 'products' && (
             <motion.div key="products" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
               
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                 {selectedCategoryView ? (
                   <div className="flex items-center gap-2">
                     {selectedSubcategoryFilter ? (
                       <Button variant="ghost" onClick={() => setSelectedSubcategoryFilter(null)} className="text-[#00FFFF] hover:bg-[#00FFFF]/10 px-0 hover:text-white transition-all">
                         <ArrowLeft className="w-5 h-5 mr-2" /> 
                         <span className="font-black uppercase tracking-widest text-lg">{selectedCategoryView} <span className="text-muted-foreground mx-2">/</span> <span className="text-[#CCFF00]">{selectedSubcategoryFilter}</span></span>
                       </Button>
                     ) : (
                       <Button variant="ghost" onClick={() => { setSelectedCategoryView(null); setSelectedSubcategoryFilter(null); setProductMasterView('categories'); }} className="text-[#00FFFF] hover:bg-[#00FFFF]/10 px-0 hover:text-white transition-all">
                         <ArrowLeft className="w-5 h-5 mr-2" /> 
                         <span className="font-black uppercase tracking-widest text-lg">{selectedCategoryView}</span>
                       </Button>
                     )}
                   </div>
                 ) : (
                   <div className="bg-black/50 p-1 rounded-lg border border-white/10 flex gap-1">
                      <Button onClick={() => setProductMasterView('categories')} variant={productMasterView === 'categories' ? 'default' : 'ghost'} className={productMasterView === 'categories' ? 'bg-[#00FFFF] text-black font-black uppercase tracking-widest text-xs h-10' : 'text-white/50 hover:text-white hover:bg-white/10 font-bold uppercase tracking-widest text-xs h-10'}>
                         <Folder className="w-4 h-4 mr-2" /> Categories
                      </Button>
                      <Button onClick={() => setProductMasterView('all')} variant={productMasterView === 'all' ? 'default' : 'ghost'} className={productMasterView === 'all' ? 'bg-[#00FFFF] text-black font-black uppercase tracking-widest text-xs h-10' : 'text-white/50 hover:text-white hover:bg-white/10 font-bold uppercase tracking-widest text-xs h-10'}>
                         <LayoutGrid className="w-4 h-4 mr-2" /> All Items
                      </Button>
                   </div>
                 )}

                 <div className="flex items-center gap-2">
                   <Sheet open={isProductSheetOpen} onOpenChange={(open) => { setIsProductSheetOpen(open); if(!open) resetForm(); if(open && selectedCategoryView) { setFormPlacement(selectedSubcategoryFilter ? 'sub' : 'main'); setFormData(prev => ({...prev, category: selectedCategoryView, subcategory: selectedSubcategoryFilter || ''})); }}}>
                     <SheetTrigger asChild><Button onClick={resetForm} className="bg-[#CCFF00] text-black font-black hover:bg-[#CCFF00]/90 shadow-[0_0_15px_rgba(204,255,0,0.3)] h-12 rounded-xl px-6"><Plus className="w-5 h-5 mr-2" /> ADD PRODUCT</Button></SheetTrigger>
                     <SheetContent className="bg-black/95 backdrop-blur-2xl border-l border-[#00FFFF]/30 sm:max-w-xl w-full overflow-y-auto">
                       <SheetHeader className="text-left mb-6 mt-6"><SheetTitle className="text-3xl font-black italic uppercase text-[#00FFFF]">{editingId ? 'Edit Product' : 'New Product'}</SheetTitle></SheetHeader>
                       <form onSubmit={handleSaveProduct} className="flex flex-col gap-6 pb-20">
                         
                         <div className="space-y-4 bg-[#00FFFF]/5 p-5 rounded-xl border border-[#00FFFF]/20">
                           <Label className="text-xs font-black uppercase tracking-widest text-[#00FFFF] flex items-center gap-2"><LinkIcon className="w-4 h-4"/> Main Product Image URL</Label>
                           <p className="text-[10px] text-white/50 leading-tight">Paste ImageKit URL here. NO DIRECT UPLOADS.</p>
                           <Input required type="url" placeholder="https://ik.imagekit.io/..." value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} className="bg-black border-white/20 text-sm focus-visible:border-[#00FFFF] h-12 text-white" />
                           {formData.image && (
                             <div className="mt-2 relative w-full h-32 rounded-lg overflow-hidden border border-white/10 bg-black/50">
                               <img src={formData.image} alt="Preview" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = '/placeholder.jpg' }} />
                             </div>
                           )}
                         </div>

                         <div className="space-y-4 bg-[#CCFF00]/5 p-5 rounded-xl border border-[#CCFF00]/20">
                           <Label className="text-xs font-black uppercase tracking-widest text-[#CCFF00] flex items-center gap-2"><LinkIcon className="w-4 h-4"/> Extra Gallery Image URLs</Label>
                           <div className="flex gap-2"><Input type="url" placeholder="Paste extra ImageKit URL..." value={newGalleryUrl} onChange={(e) => setNewGalleryUrl(e.target.value)} className="bg-black border-white/20 text-xs focus-visible:border-[#CCFF00] h-10 flex-1 text-white" /><Button type="button" onClick={addGalleryUrl} className="h-10 bg-[#CCFF00] text-black font-black hover:bg-[#CCFF00]/80 px-4">ADD</Button></div>
                           {formData.galleryImages.length > 0 && (<div className="flex gap-3 overflow-x-auto pt-2 pb-2 scrollbar-hide">{formData.galleryImages.map((img, i) => (<div key={i} className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-white/20"><img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" /><button type="button" onClick={() => removeGalleryImage(i)} className="absolute top-1 right-1 bg-red-500 rounded-full p-1 text-white hover:scale-110"><XCircle className="w-3 h-3" /></button></div>))}</div>)}
                         </div>

                         <div className="space-y-4">
                           <div className="space-y-2"><Label>Product Name</Label><Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-white/5 border-white/10" /></div>
                           <div className="space-y-2"><Label>Description / Specifications</Label><textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Write details here..." className="w-full bg-white/5 border border-white/10 focus-visible:border-[#00FFFF] rounded-xl p-3 min-h-[100px] text-sm text-white resize-y" /></div>
                           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                             <div className="space-y-2"><Label className="text-[#00FFFF]">Cost (₹)</Label><Input required type="number" value={formData.cost_price} onChange={e => setFormData({...formData, cost_price: e.target.value})} className="bg-white/5 border-[#00FFFF]/50 text-[#00FFFF] font-bold" /></div>
                             <div className="space-y-2"><Label>Sell Price (₹)</Label><Input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="bg-white/5 border-white/10" /></div>
                             <div className="space-y-2"><Label>MRP (₹)</Label><Input required type="number" value={formData.mrp} onChange={e => setFormData({...formData, mrp: e.target.value})} className="bg-white/5 border-white/10" /></div>
                           </div>
                           
                           <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4 mt-2">
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                               <div className="space-y-2">
                                 <Label className="text-[#00FFFF]">Main Category</Label>
                                 <select required value={formData.category} onChange={e => { setFormData({...formData, category: e.target.value, subcategory: ''}); setFormPlacement('main'); }} className="w-full h-12 bg-black/50 border border-white/20 rounded-md px-3 text-sm text-white focus:outline-none focus:border-[#00FFFF]">
                                   {displayCategories.map((catName: any, idx: number) => (<option key={idx} value={catName} className="bg-black text-white">{catName}</option>))}
                                 </select>
                               </div>
                               <div className="space-y-2">
                                  <Label>Food Type</Label>
                                  <select required value={formData.foodPref} onChange={e => setFormData({...formData, foodPref: e.target.value as any})} className="w-full h-12 bg-black/50 border border-white/20 rounded-md px-3 text-sm text-white focus:outline-none focus:border-[#00FFFF]">
                                    <option value="none" className="bg-black text-white">None (Gadgets)</option><option value="veg" className="bg-black text-green-400">Vegetarian 🟢</option><option value="non-veg" className="bg-black text-red-400">Non-Veg 🔴</option>
                                  </select>
                               </div>
                             </div>

                             <div className="space-y-2 pt-2 border-t border-white/10 mt-2">
                               <Label className="text-muted-foreground uppercase text-[10px] font-black tracking-widest">Where to place this item?</Label>
                               <div className="flex gap-2">
                                 <Button type="button" onClick={() => { setFormPlacement('main'); setFormData({...formData, subcategory: ''}); }} variant={formPlacement === 'main' ? 'default' : 'outline'} className={`flex-1 text-xs font-bold uppercase tracking-widest ${formPlacement === 'main' ? 'bg-[#00FFFF] text-black' : 'border-white/20 text-white/50 hover:text-white'}`}>Direct in Main Category</Button>
                                 <Button type="button" onClick={() => setFormPlacement('sub')} disabled={activeSubcategories.length === 0} variant={formPlacement === 'sub' ? 'default' : 'outline'} className={`flex-1 text-xs font-bold uppercase tracking-widest ${formPlacement === 'sub' ? 'bg-[#CCFF00] text-black' : 'border-white/20 text-white/50 hover:text-white disabled:opacity-30'}`}>Inside Sub-Category</Button>
                               </div>
                             </div>

                             {formPlacement === 'sub' && (
                               <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                 <Label className="text-[#CCFF00]">Choose Sub-Category</Label>
                                 <select required value={formData.subcategory} onChange={e => setFormData({...formData, subcategory: e.target.value})} className="w-full h-12 bg-black/50 border border-[#CCFF00]/50 rounded-md px-3 text-sm text-white focus:outline-none focus:border-[#CCFF00]">
                                    <option value="" className="bg-black text-muted-foreground">Select Sub...</option>
                                    {activeSubcategories.map((subName: string, idx: number) => (<option key={idx} value={subName} className="bg-black text-white">{subName}</option>))}
                                 </select>
                               </div>
                             )}
                           </div>
                         </div>
                         <Button type="submit" className="w-full h-14 bg-[#00FFFF] text-black font-black hover:bg-[#00FFFF]/80 mt-4">{editingId ? 'UPDATE PRODUCT' : 'SAVE TO INVENTORY'}</Button>
                       </form>
                     </SheetContent>
                   </Sheet>
                 </div>
               </div>
               
               {productMasterView === 'all' && !selectedCategoryView ? (
                 <div className="mt-6">
                    {products.length === 0 ? (
                      <Empty className="glass-strong border-white/10 py-20 mt-6 max-w-md mx-auto"><EmptyContent><PackageIcon className="w-12 h-12 text-muted-foreground mb-4 opacity-50" /><EmptyTitle className="text-xl uppercase tracking-tighter">Inventory is Empty</EmptyTitle></EmptyContent></Empty>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {products.map((product: any) => renderProductCard(product))}
                      </div>
                    )}
                 </div>
               ) : (
                 <>
                   {!selectedCategoryView ? (
                     <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                       {displayCategories.map((catName: any, idx: number) => {
                         const itemCount = products.filter((p:any) => p.category === catName).length;
                         return (
                           <Card key={idx} onClick={() => { setSelectedCategoryView(catName); setSelectedSubcategoryFilter(null); }} className="glass-strong border-white/10 hover:border-[#00FFFF]/50 transition-all cursor-pointer group">
                             <CardContent className="p-6 flex flex-col items-center justify-center text-center h-32 relative overflow-hidden"><PackageIcon className="w-8 h-8 text-[#00FFFF] mb-3 group-hover:scale-110 transition-transform" /><h3 className="font-black text-white text-sm uppercase tracking-widest z-10">{catName}</h3><Badge variant="outline" className="mt-2 text-[10px] text-muted-foreground border-white/20 z-10 bg-black/50">{itemCount} Items</Badge></CardContent>
                           </Card>
                         )
                       })}
                     </div>
                   ) : (
                     <div className="mt-6">
                       {viewSubcategories.length > 0 && !selectedSubcategoryFilter && (
                         <div className="flex justify-between items-center mb-6">
                            <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Sub-Categories</h4>
                            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
                               <button onClick={() => setSubcatViewMode('folders')} className={`px-3 py-1.5 text-[10px] font-bold rounded-md uppercase tracking-widest transition-all ${subcatViewMode === 'folders' ? 'bg-[#00FFFF] text-black shadow-[0_0_10px_rgba(0,255,255,0.2)]' : 'text-white/50 hover:text-white'}`}><Folder className="w-3 h-3 inline mr-1"/> Folders</button>
                               <button onClick={() => setSubcatViewMode('tabs')} className={`px-3 py-1.5 text-[10px] font-bold rounded-md uppercase tracking-widest transition-all ${subcatViewMode === 'tabs' ? 'bg-[#00FFFF] text-black shadow-[0_0_10px_rgba(0,255,255,0.2)]' : 'text-white/50 hover:text-white'}`}><LayoutGrid className="w-3 h-3 inline mr-1"/> Direct Items</button>
                            </div>
                         </div>
                       )}

                       {subcatViewMode === 'folders' && !selectedSubcategoryFilter && viewSubcategories.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                            {viewSubcategories.map((sub: string, idx: number) => {
                               const count = products.filter((p:any) => p.category === selectedCategoryView && p.subcategory === sub).length;
                               return (
                                  <Card key={idx} onClick={() => setSelectedSubcategoryFilter(sub)} className="glass-strong border-white/10 hover:border-[#CCFF00]/50 transition-all cursor-pointer group">
                                    <CardContent className="p-6 flex flex-col items-center justify-center text-center h-32 relative overflow-hidden">
                                      <Folder className="w-8 h-8 text-[#CCFF00] mb-3 group-hover:scale-110 transition-transform" />
                                      <h3 className="font-black text-white text-sm uppercase tracking-widest z-10">{sub}</h3>
                                      <Badge variant="outline" className="mt-2 text-[10px] text-[#CCFF00] border-[#CCFF00]/30 z-10 bg-black/50">{count} Items</Badge>
                                    </CardContent>
                                  </Card>
                               )
                            })}
                          </div>
                       )}

                       {(subcatViewMode === 'tabs' || selectedSubcategoryFilter) && viewSubcategories.length > 0 && (
                          <div className="flex gap-3 overflow-x-auto pb-4 mb-4 border-b border-white/10 scrollbar-hide">
                            {subcatViewMode === 'tabs' && (
                              <Button onClick={() => setSelectedSubcategoryFilter(null)} variant={!selectedSubcategoryFilter ? 'default' : 'outline'} className={!selectedSubcategoryFilter ? 'bg-[#00FFFF] text-black font-black uppercase tracking-widest text-xs h-9' : 'border-white/20 text-white hover:bg-white/10 font-bold uppercase tracking-widest text-xs h-9'}>Show All</Button>
                            )}
                            {viewSubcategories.map((sub: string, idx: number) => (
                               <Button key={idx} onClick={() => setSelectedSubcategoryFilter(sub)} variant={selectedSubcategoryFilter === sub ? 'default' : 'outline'} className={selectedSubcategoryFilter === sub ? 'bg-[#CCFF00] text-black font-black uppercase tracking-widest text-xs h-9' : 'border-white/20 text-white hover:bg-white/10 font-bold uppercase tracking-widest text-xs h-9'}>{sub}</Button>
                            ))}
                          </div>
                       )}

                       <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                         {displayedProducts.map((product: any) => renderProductCard(product))}
                         {displayedProducts.length === 0 && <div className="col-span-full py-10 text-center opacity-50"><p className="text-xs uppercase tracking-widest font-bold">No items found for this filter.</p></div>}
                       </div>
                     </div>
                   )}
                 </>
               )}
             </motion.div>
          )}

          {/* OFFERS */}
          {activeTab === 'offers' && (
            <motion.div key="offers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <Card className="glass-strong border-[#CCFF00]/30 hover:border-[#CCFF00]/50 transition-all mb-6">
                <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
                  <div><h3 className="text-lg font-black text-[#CCFF00] uppercase flex items-center gap-2"><LockKeyhole className="w-5 h-5"/> Global Minimum Order</h3><p className="text-xs text-muted-foreground mt-1">Set the strict minimum cart value required to checkout.</p></div>
                  <div className="flex gap-2 w-full sm:w-auto"><Input type="number" value={globalMinOrder} onChange={e => setGlobalMinOrder(Number(e.target.value))} className="bg-black/50 border-white/10 w-full sm:w-32 text-center text-[#CCFF00] font-mono font-black text-lg" /><Button onClick={handleSaveGlobalMinOrder} className="bg-[#CCFF00] text-black font-black hover:bg-[#CCFF00]/80 px-6 uppercase">Save</Button></div>
                </CardContent>
              </Card>

              <div className="flex justify-between items-center gap-4 pt-4 border-t border-white/10">
                <div><h3 className="text-lg font-black text-[#00FFFF] uppercase flex items-center gap-2"><Truck className="w-5 h-5"/> Delivery Areas & Fees</h3></div>
                <Sheet>
                  <SheetTrigger asChild><Button className="bg-[#00FFFF] text-black font-black hover:bg-[#00FFFF]/90 shadow-[0_0_15px_rgba(0,255,255,0.3)] h-12 rounded-xl px-6"><Plus className="w-5 h-5 mr-2" /> NEW AREA</Button></SheetTrigger>
                  <SheetContent className="bg-black/95 backdrop-blur-2xl border-l border-[#00FFFF]/30 sm:max-w-md w-full overflow-y-auto">
                    <SheetHeader className="text-left mb-8 mt-6"><SheetTitle className="text-3xl font-black italic uppercase text-[#00FFFF]">Add Delivery Area</SheetTitle></SheetHeader>
                    <form onSubmit={(e: any) => { e.preventDefault(); const data = new FormData(e.target); addDeliveryZone({ areaName: data.get('areaName')?.toString().toUpperCase() || '', fee: Number(data.get('fee')), isActive: true }); e.target.reset(); }} className="flex flex-col gap-6">
                      <div className="space-y-2"><Label>Area Name</Label><Input name="areaName" required className="bg-white/5 border-white/10 uppercase font-mono text-[#00FFFF]" /></div>
                      <div className="space-y-2"><Label>Delivery Fee (₹)</Label><Input name="fee" type="number" required min="0" className="bg-white/5 border-white/10" /></div>
                      <Button type="submit" className="w-full h-14 bg-[#00FFFF] text-black font-black hover:bg-[#00FFFF]/80">SAVE AREA</Button>
                    </form>
                  </SheetContent>
                </Sheet>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {(!deliveryZones || deliveryZones.length === 0) ? (
                  <div className="col-span-full py-10 text-center opacity-30"><Truck className="w-12 h-12 mx-auto mb-4" /><p className="font-black uppercase tracking-widest text-xl">No Delivery Zones</p></div>
                ) : (
                  deliveryZones.map((zone: any) => (
                    <Card key={zone.id} className={`glass-strong border-white/10 transition-all ${!zone.isActive ? 'opacity-50 grayscale' : 'hover:border-[#00FFFF]/30'}`}>
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <p className="text-xl font-black text-[#00FFFF] font-mono tracking-widest">{zone.areaName}</p>
                          <Badge variant={zone.isActive ? "outline" : "secondary"} className={`text-[10px] font-black uppercase tracking-widest ${zone.isActive ? 'text-[#CCFF00] border-[#CCFF00]/30' : ''}`}>{zone.isActive ? 'ACTIVE' : 'OFF'}</Badge>
                        </div>
                        <div className="space-y-1 mb-6"><p className="font-bold text-white text-sm">Delivery Fee: <span className="text-[#CCFF00] font-mono">₹{zone.fee}</span></p></div>
                        <div className="flex gap-2 pt-4 border-t border-white/10">
                          <Button variant="ghost" className={`flex-1 text-xs font-black border ${zone.isActive ? 'border-white/10 text-white hover:bg-white/10' : 'border-[#CCFF00]/30 text-[#CCFF00] hover:bg-[#CCFF00] hover:text-black'}`} onClick={() => toggleDeliveryZoneStatus(zone.id)}>{zone.isActive ? 'TURN OFF' : 'ACTIVATE'}</Button>
                          <Button variant="ghost" size="icon" className="border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white" onClick={() => { if(confirm("Delete?")) deleteDeliveryZone(zone.id) }}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              <div className="flex justify-between items-center gap-4 pt-8 border-t border-white/10">
                <div><p className="text-muted-foreground font-mono">Manage discount coupons.</p></div>
                <Sheet>
                  <SheetTrigger asChild><Button className="bg-[#00FFFF] text-black font-black hover:bg-[#00FFFF]/90 shadow-[0_0_15px_rgba(0,255,255,0.3)] h-12 rounded-xl px-6"><Plus className="w-5 h-5 mr-2" /> NEW OFFER</Button></SheetTrigger>
                  <SheetContent className="bg-black/95 backdrop-blur-2xl border-l border-[#00FFFF]/30 sm:max-w-md w-full overflow-y-auto">
                    <SheetHeader className="text-left mb-8 mt-6"><SheetTitle className="text-3xl font-black italic uppercase text-[#00FFFF]">Create Coupon</SheetTitle></SheetHeader>
                    <form onSubmit={(e: any) => { e.preventDefault(); const data = new FormData(e.target); addPromoCode({ code: data.get('code')?.toString().toUpperCase() || '', type: data.get('type') as any, value: Number(data.get('value')), minOrder: Number(data.get('minOrder')), isActive: true }); e.target.reset(); }} className="flex flex-col gap-6">
                      <div className="space-y-2"><Label>Coupon Code</Label><Input name="code" required className="bg-white/5 border-white/10 uppercase font-mono text-[#00FFFF]" /></div>
                      <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Discount Type</Label><select name="type" className="w-full h-10 bg-white/5 border border-white/10 rounded-md px-3 text-sm text-white focus:outline-none focus:border-[#00FFFF]"><option value="flat" className="bg-black">Flat Amount (₹)</option><option value="percent" className="bg-black">Percentage (%)</option></select></div><div className="space-y-2"><Label>Value</Label><Input name="value" type="number" required min="1" className="bg-white/5 border-white/10" /></div></div>
                      <div className="space-y-2"><Label>Min Order (₹)</Label><Input name="minOrder" type="number" required min="0" className="bg-white/5 border-white/10" /></div>
                      <Button type="submit" className="w-full h-14 bg-[#00FFFF] text-black font-black hover:bg-[#00FFFF]/80">SAVE OFFER</Button>
                    </form>
                  </SheetContent>
                </Sheet>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {(!promoCodes || promoCodes.length === 0) ? (
                  <div className="col-span-full py-20 text-center opacity-30"><Tag className="w-12 h-12 mx-auto mb-4" /><p className="font-black uppercase tracking-widest text-xl">No Active Offers</p></div>
                ) : (
                  promoCodes.map((promo: any) => (
                    <Card key={promo.id} className={`glass-strong border-white/10 transition-all ${!promo.isActive ? 'opacity-50 grayscale' : 'hover:border-[#00FFFF]/30'}`}>
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-4"><div className="flex items-center gap-2"><p className="text-xl font-black text-[#00FFFF] font-mono tracking-widest">{promo.code}</p></div><Badge variant={promo.isActive ? "outline" : "secondary"} className={`text-[10px] font-black uppercase tracking-widest ${promo.isActive ? 'text-[#CCFF00] border-[#CCFF00]/30' : ''}`}>{promo.isActive ? 'ACTIVE' : 'OFF'}</Badge></div>
                        <div className="space-y-1 mb-6"><p className="font-bold text-white text-sm">{promo.type === 'flat' ? `₹${promo.value} Flat Off` : `${promo.value}% Instant Discount`}</p><p className="text-[10px] text-muted-foreground uppercase tracking-widest">Valid on orders above ₹{promo.minOrder}</p></div>
                        <div className="flex gap-2 pt-4 border-t border-white/10"><Button variant="ghost" className={`flex-1 text-xs font-black border ${promo.isActive ? 'border-white/10 text-white hover:bg-white/10' : 'border-[#CCFF00]/30 text-[#CCFF00] hover:bg-[#CCFF00] hover:text-black'}`} onClick={() => togglePromoStatus(promo.id)}>{promo.isActive ? 'TURN OFF' : 'ACTIVATE'}</Button><Button variant="ghost" size="icon" className="border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white" onClick={() => { if(confirm("Delete?")) deletePromo(promo.id) }}><Trash2 className="w-4 h-4" /></Button></div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* MESSAGES */}
          {activeTab === 'messages' && (
            <motion.div key="messages" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="glass-strong border-[#00FFFF]/20 lg:col-span-1 h-fit"><CardContent className="p-6 space-y-6"><div><h3 className="text-xl font-black text-white uppercase tracking-tight mb-2 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-[#00FFFF]"/> Broadcast Center</h3></div><div className="space-y-3"><Label className="text-xs uppercase tracking-widest text-[#00FFFF]">Message Content</Label><textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} className="w-full bg-black/50 border border-white/10 focus-visible:border-[#00FFFF] rounded-xl p-4 min-h-[200px] text-sm text-white resize-none" /><div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-widest"><span>{messageText.length} chars</span><span>{selectedCustomers.length} selected</span></div></div><div className="flex flex-col gap-3"><Button onClick={handleSendToApp} disabled={selectedCustomers.length === 0 || !messageText.trim()} className="w-full h-12 bg-[#CCFF00] text-black font-black hover:bg-[#CCFF00]/80 disabled:opacity-50"><Smartphone className="w-4 h-4 mr-2" /> PUSH TO APP</Button><Button onClick={handleSendToWhatsApp} disabled={selectedCustomers.length === 0 || !messageText.trim()} className="w-full h-12 bg-[#25D366] text-white font-black hover:bg-[#25D366]/80 disabled:opacity-50"><MessageCircle className="w-4 h-4 mr-2" /> PUSH TO WHATSAPP</Button></div></CardContent></Card>
              <Card className="glass-strong border-white/10 lg:col-span-2">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-white/10 pb-4"><h3 className="text-sm font-black text-white uppercase tracking-widest">Select Recipients</h3><button onClick={handleSelectAll} className="flex items-center gap-2 text-xs font-bold text-[#00FFFF] hover:text-white uppercase tracking-widest">{selectedCustomers.length === customersList.length && customersList.length > 0 ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />} {selectedCustomers.length === customersList.length && customersList.length > 0 ? 'Deselect All' : 'Select All'}</button></div>
                  {customersList.length === 0 ? (
                    <Empty className="py-12 border-none"><EmptyContent><Users className="w-12 h-12 text-muted-foreground mb-4 opacity-50" /><EmptyTitle className="text-lg uppercase">No customers</EmptyTitle></EmptyContent></Empty>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                      {customersList.map((cust: any) => {
                        const isSelected = selectedCustomers.includes(cust.phone); const isVip = customerMeta[cust.phone]?.isVip;
                        return (
                          <div key={cust.phone} onClick={() => handleSelectCustomer(cust.phone)} className={`p-3 rounded-xl border cursor-pointer flex items-center gap-4 transition-all ${isSelected ? 'bg-[#00FFFF]/10 border-[#00FFFF]/50 shadow-[0_0_15px_rgba(0,255,255,0.1)]' : 'bg-white/5 border-white/5 hover:border-white/20'}`}><div className={`shrink-0 transition-colors ${isSelected ? 'text-[#00FFFF]' : 'text-muted-foreground'}`}>{isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}</div><div className="flex-1 overflow-hidden"><div className="flex items-center gap-2"><p className={`font-bold uppercase truncate ${isSelected ? 'text-white' : 'text-white/80'}`}>{cust.name}</p>{isVip && <Star className="w-3 h-3 text-[#CCFF00] shrink-0" />}</div><p className="text-xs font-mono text-muted-foreground mt-0.5">{cust.phone}</p></div></div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
