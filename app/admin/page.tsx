// @ts-nocheck
"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Menu, LayoutDashboard, Zap, History, Tag, Package as PackageIcon, 
  MessageSquare, Users, IndianRupee, Clock, CheckCircle2, ArrowLeft,
  MapPin, Phone, Truck, XCircle, Plus, Trash2, Edit, PowerOff, Power,
  Star, Ban, MessageCircle, FileText, Send, CheckSquare, Square, Smartphone,
  TrendingUp, Target, BarChart, ShieldAlert, LockKeyhole, Calendar, Settings, AlertTriangle, MoonStar, LayoutGrid,
  ArrowUp, ArrowDown, Palette, Volume2, Wallet, UserCircle, Link as LinkIcon, Search, PlusCircle, X, CornerDownRight, Folder,
  ChefHat, Bike, AlertCircle, Sun, Moon
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
  { id: 'categories', label: 'Categories', icon: LayoutGrid }, 
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'offers', label: 'Offers', icon: Tag },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
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

  const [isAdminDark, setIsAdminDark] = React.useState(true)

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
    deliveryZones, addDeliveryZone, deleteDeliveryZone, toggleDeliveryZoneStatus, updateDeliveryZone
  } = useAppStore() as any
  
  const [activeTab, setActiveTab] = React.useState('live_orders')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  const [analyticsFilter, setAnalyticsFilter] = React.useState('all')
  const [customDate, setCustomDate] = React.useState('')
  const [billingFilter, setBillingFilter] = React.useState('today')
  const [billingCustomDate, setBillingCustomDate] = React.useState('')
  const [historyFilter, setHistoryFilter] = React.useState('all')
  const [historyCustomDate, setHistoryCustomDate] = React.useState('')

  const [isProductSheetOpen, setIsProductSheetOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [selectedCategoryView, setSelectedCategoryView] = React.useState<string | null>(null)
  const [selectedSubcategoryFilter, setSelectedSubcategoryFilter] = React.useState<string | null>(null)
  const [subcatViewMode, setSubcatViewMode] = React.useState<'folders' | 'tabs'>('folders')
  const [productMasterView, setProductMasterView] = React.useState<'categories' | 'all'>('categories')
  const [formPlacement, setFormPlacement] = React.useState<'main' | 'sub'>('main')

  const [formData, setFormData] = React.useState({
    name: '', price: '', mrp: '', cost_price: '', category: '', subcategory: '', image: '', inStock: true,
    description: '', galleryImages: [] as string[], foodPref: 'none' as 'veg' | 'non-veg' | 'none',
    customStockMessage: ''
  })

  const [newGalleryUrl, setNewGalleryUrl] = React.useState('') 
  const [selectedCustomers, setSelectedCustomers] = React.useState<string[]>([])
  const [messageText, setMessageText] = React.useState('')

  const [editingCategoryId, setEditingCategoryId] = React.useState<string | null>(null)
  const [newCategoryName, setNewCategoryName] = React.useState('')
  const [newCategoryImage, setNewCategoryImage] = React.useState('')
  const [newCategoryStartTime, setNewCategoryStartTime] = React.useState('')
  const [newCategoryEndTime, setNewCategoryEndTime] = React.useState('')

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

  const [activeThemeTab, setActiveThemeTab] = React.useState('dark_mode')
  const [themeColorData, setThemeColorData] = React.useState({
    primary_color: '#00FFFF', background_color: '#050505', text_color: '#ffffff', button_color: '#CCFF00',
    price_color: '#00FFFF', title_color: '#ffffff', accent_color: '#CCFF00', discount_color: '#FF0055',
    light_primary_color: '#008b8b', light_background_color: '#ffffff', light_text_color: '#000000', light_button_color: '#99cc00',
    light_price_color: '#008b8b', light_title_color: '#111111', light_accent_color: '#99cc00', light_discount_color: '#e11d48'
  })
  const [isThemeSaving, setIsThemeSaving] = React.useState(false)

  const [customerSearchQuery, setCustomerSearchQuery] = React.useState('')
  const [customerSortOption, setCustomerSortOption] = React.useState('spent_desc')

  const [editingZoneId, setEditingZoneId] = React.useState<string | null>(null)
  const [editingZoneFee, setEditingZoneFee] = React.useState<string>('')

  React.useEffect(() => { 
    setIsMounted(true) 
    if (fetchData) fetchData()
    if (fetchStoreConfig) fetchStoreConfig() 
    
    const sessionAuth = sessionStorage.getItem('webfoo_admin_unlocked')
    if (sessionAuth === 'true') {
      setIsAuthorized(true)
    }

    const savedAdminTheme = localStorage.getItem('webfoo_admin_theme')
    if (savedAdminTheme === 'light') {
      setIsAdminDark(false)
    }

    async function loadTheme() {
      const { data } = await supabase.from('theme_settings').select('*').eq('id', 1).single()
      if (data) {
        setThemeColorData({
          primary_color: data.primary_color || '#00FFFF',
          background_color: data.background_color || '#050505',
          text_color: data.text_color || '#ffffff',
          button_color: data.button_color || '#CCFF00',
          price_color: data.price_color || '#00FFFF',
          title_color: data.title_color || '#ffffff',
          accent_color: data.accent_color || '#CCFF00',
          discount_color: data.discount_color || '#FF0055',
          light_primary_color: data.light_primary_color || '#008b8b',
          light_background_color: data.light_background_color || '#ffffff',
          light_text_color: data.light_text_color || '#000000',
          light_button_color: data.light_button_color || '#99cc00',
          light_price_color: data.light_price_color || '#008b8b',
          light_title_color: data.light_title_color || '#111111',
          light_accent_color: data.light_accent_color || '#99cc00',
          light_discount_color: data.light_discount_color || '#e11d48'
        })
      }
    }
    loadTheme()
  }, [fetchData, fetchStoreConfig])

  const toggleAdminTheme = () => {
    const newTheme = !isAdminDark;
    setIsAdminDark(newTheme);
    localStorage.setItem('webfoo_admin_theme', newTheme ? 'dark' : 'light');
  }

  React.useEffect(() => {
    if (storeConfig) {
      setSettingsFormData({
        storeMode: storeConfig.storeMode || 'manual', openTime: storeConfig.openTime || '08:00', closeTime: storeConfig.closeTime || '22:00',
        isStoreOpen: storeConfig.isStoreOpen ?? true, bannerTextOpen: storeConfig.bannerTextOpen || '', bannerImageUrlOpen: storeConfig.bannerImageUrlOpen || '',
        bannerTextClosed: storeConfig.bannerTextClosed || '', bannerImageUrlClosed: storeConfig.bannerImageUrlClosed || '',
        ownerName: storeConfig.ownerName || '', ownerPhone: storeConfig.ownerPhone || '', ownerEmail: storeConfig.ownerEmail || '', ownerPhoto: storeConfig.ownerPhoto || ''
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

  // --- 🔥 ANALYTICS & BILLING CALCULATIONS RESTORED 🔥 ---

  const filteredAnalyticsOrders = React.useMemo(() => {
    if (analyticsFilter === 'all') return orders;
    const getLocalYYYYMMDD = (d: Date) => { const offset = d.getTimezoneOffset() * 60000; return new Date(d.getTime() - offset).toISOString().split('T')[0]; }
    const todayStr = getLocalYYYYMMDD(new Date()); const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1); const yesterdayStr = getLocalYYYYMMDD(yesterday);
    return orders.filter((o: any) => {
      let orderDateStr = o.date; if (!orderDateStr && o.id && !isNaN(Number(o.id))) orderDateStr = getLocalYYYYMMDD(new Date(Number(o.id)));
      if (analyticsFilter === 'today') return orderDateStr === todayStr; if (analyticsFilter === 'yesterday') return orderDateStr === yesterdayStr; if (analyticsFilter === 'custom') return orderDateStr === customDate; return true;
    });
  }, [orders, analyticsFilter, customDate]);

  const filteredBillingOrders = React.useMemo(() => {
    const deliveredOnly = orders.filter((o: any) => o.status === 'Delivered');
    if (billingFilter === 'all') return deliveredOnly;
    const getLocalYYYYMMDD = (d: Date) => { const offset = d.getTimezoneOffset() * 60000; return new Date(d.getTime() - offset).toISOString().split('T')[0]; }
    const todayStr = getLocalYYYYMMDD(new Date()); const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1); const yesterdayStr = getLocalYYYYMMDD(yesterday);
    return deliveredOnly.filter((o: any) => {
      let orderDateStr = o.date; if (!orderDateStr && o.id && !isNaN(Number(o.id))) orderDateStr = getLocalYYYYMMDD(new Date(Number(o.id)));
      if (billingFilter === 'today') return orderDateStr === todayStr; if (billingFilter === 'yesterday') return orderDateStr === yesterdayStr; if (billingFilter === 'custom') return orderDateStr === billingCustomDate; return true;
    });
  }, [orders, billingFilter, billingCustomDate]);

  const filteredOrderHistory = React.useMemo(() => {
    const baseHistory = orders.filter((o: any) => o.status === 'Delivered' || o.status === 'Cancelled').reverse();
    if (historyFilter === 'all') return baseHistory;
    const getLocalYYYYMMDD = (d: Date) => { const offset = d.getTimezoneOffset() * 60000; return new Date(d.getTime() - offset).toISOString().split('T')[0]; }
    const todayStr = getLocalYYYYMMDD(new Date()); const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1); const yesterdayStr = getLocalYYYYMMDD(yesterday);
    return baseHistory.filter((o: any) => {
      let orderDateStr = o.date; if (!orderDateStr && o.id && !isNaN(Number(o.id))) orderDateStr = getLocalYYYYMMDD(new Date(Number(o.id)));
      if (historyFilter === 'today') return orderDateStr === todayStr; if (historyFilter === 'yesterday') return orderDateStr === yesterdayStr; if (historyFilter === 'custom') return orderDateStr === historyCustomDate; return true;
    });
  }, [orders, historyFilter, historyCustomDate]);

  // Analytics Metrics
  const analyticsDelivered = filteredAnalyticsOrders.filter((o: any) => o.status === 'Delivered');
  const analyticsPending = filteredAnalyticsOrders.filter((o: any) => o.status === 'Pending' || o.status === 'Preparing' || o.status === 'In Transit');
  const analyticsCancelled = filteredAnalyticsOrders.filter((o: any) => o.status === 'Cancelled');
  
  const totalOrdersCount = filteredAnalyticsOrders.length;
  const totalRevenue = analyticsDelivered.reduce((sum: number, order: any) => sum + (Number(order.amount) || 0), 0);
  const avgOrderValue = analyticsDelivered.length > 0 ? Math.round(totalRevenue / analyticsDelivered.length) : 0;
  const uniqueCustomersInAnalytics = new Set(filteredAnalyticsOrders.map((o: any) => o.phone)).size;

  const productSalesMap = new Map();
  analyticsDelivered.forEach((order: any) => {
    if(!order.items) return;
    order.items.forEach((item: any) => {
      if (!productSalesMap.has(item.name)) productSalesMap.set(item.name, { qty: 0, revenue: 0 });
      const stat = productSalesMap.get(item.name);
      stat.qty += item.quantity || 1;
      stat.revenue += (item.price || 0) * (item.quantity || 1);
    });
  });
  const topProducts = Array.from(productSalesMap.entries()).map(([name, stat]) => ({ name, ...stat })).sort((a, b) => b.qty - a.qty).slice(0, 5);

  // Billing Metrics
  let totalBilledRevenue = 0;
  let totalSupplierCost = 0;
  const billedItemsMap = new Map();

  filteredBillingOrders.forEach((order: any) => {
    totalBilledRevenue += (Number(order.amount) || 0);
    if(!order.items) return;
    order.items.forEach((item: any) => {
      const dbProduct = products.find((p: any) => p.name === item.name);
      const buyRate = dbProduct?.cost_price ? Number(dbProduct.cost_price) : 0;
      const qty = item.quantity || 1;
      const itemCost = buyRate * qty;
      totalSupplierCost += itemCost;

      if (!billedItemsMap.has(item.name)) {
        billedItemsMap.set(item.name, { name: item.name, qty: 0, costRate: buyRate, totalCost: 0 });
      }
      const stat = billedItemsMap.get(item.name);
      stat.qty += qty;
      stat.totalCost += itemCost;
    });
  });
  const totalBilledProfit = totalBilledRevenue - totalSupplierCost;
  const billedItemsArray = Array.from(billedItemsMap.values()).sort((a, b) => b.qty - a.qty);

  // --- 🔥 END CALCULATIONS 🔥 ---

  React.useEffect(() => {
    if (isMounted && isAuthorized) {
      const liveOrds = orders.filter((o: any) => o.status === 'Pending' || o.status === 'Preparing' || o.status === 'In Transit');
      if (liveOrds.length > prevOrderCountRef.current && prevOrderCountRef.current !== 0) {
        if (alertAudioRef.current) alertAudioRef.current.play().catch(e => console.error("Sound blocked by browser:", e))
      }
      prevOrderCountRef.current = liveOrds.length
    }
  }, [orders, isMounted, isAuthorized])

  const handleAdminAccess = (e: React.FormEvent) => {
    e.preventDefault()
    if (passcode === ADMIN_SECRET_PASSCODE) { sessionStorage.setItem('webfoo_admin_unlocked', 'true'); setIsAuthorized(true); setAuthError(''); } 
    else { setAuthError('ACCESS DENIED.'); setPasscode(''); }
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateStoreConfig) return;
    setIsSettingsSaving(true);
    try {
      await updateStoreConfig({
        storeMode: settingsFormData.storeMode as 'auto' | 'manual', openTime: settingsFormData.openTime, closeTime: settingsFormData.closeTime,
        isStoreOpen: settingsFormData.isStoreOpen, bannerTextOpen: settingsFormData.bannerTextOpen, bannerImageUrlOpen: settingsFormData.bannerImageUrlOpen || null,
        bannerTextClosed: settingsFormData.bannerTextClosed, bannerImageUrlClosed: settingsFormData.bannerImageUrlClosed || null,
        ownerName: settingsFormData.ownerName, ownerPhone: settingsFormData.ownerPhone, ownerEmail: settingsFormData.ownerEmail, ownerPhoto: settingsFormData.ownerPhoto,
      });
      alert("✅ Settings saved!"); if (fetchStoreConfig) fetchStoreConfig();
    } catch(e) { alert("ERROR saving settings!") }
    setIsSettingsSaving(false);
  }

  const handleSaveTheme = async () => {
    setIsThemeSaving(true)
    const { error } = await supabase.from('theme_settings').update({
      ...themeColorData
    }).eq('id', 1)
    setIsThemeSaving(false)
    if (error) alert("⚠️ Error: " + error.message)
    else alert("✅ Web Theme Colors Updated!")
  }

  const handleSaveGlobalMinOrder = async () => {
    if (!updateStoreConfig) return;
    try { await updateStoreConfig({ minOrderAmount: globalMinOrder }); alert("✅ Global Min Order Updated!"); if (fetchStoreConfig) fetchStoreConfig(); } 
    catch(e) { alert("ERROR"); }
  }

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      if (editingCategoryId) {
        await updateCategory(editingCategoryId, { name: newCategoryName.trim(), image: newCategoryImage });
        await supabase.from('webfoo_categories').update({ startTime: newCategoryStartTime || null, endTime: newCategoryEndTime || null }).eq('id', editingCategoryId);
      } else {
        await supabase.from('webfoo_categories').insert([{ name: newCategoryName.trim(), image: newCategoryImage, subcategories: [], isActive: true, startTime: newCategoryStartTime || null, endTime: newCategoryEndTime || null }]);
      }
      if (fetchData) await fetchData();
      setNewCategoryName(''); setNewCategoryImage(''); setEditingCategoryId(null); setNewCategoryStartTime(''); setNewCategoryEndTime('');
      alert("✅ Category Saved Successfully!");
    } catch (err) { alert("⚠️ Error saving category."); }
  }

  const editCategoryUI = (cat: any) => { setEditingCategoryId(cat.id); setNewCategoryName(cat.name); setNewCategoryImage(cat.image || ''); setNewCategoryStartTime(cat.startTime || ''); setNewCategoryEndTime(cat.endTime || ''); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  const resetCategoryForm = () => { setEditingCategoryId(null); setNewCategoryName(''); setNewCategoryImage(''); setNewCategoryStartTime(''); setNewCategoryEndTime(''); }

  const handleAddSubcat = async (catId: string, currentSubs: string[]) => {
    const newSub = subCatInputs[catId]; if (!newSub || !newSub.trim()) return;
    const updatedSubs = [...(currentSubs || []), newSub.trim()]; const uniqueSubs = Array.from(new Set(updatedSubs));
    try { await updateCategory(catId, { subcategories: uniqueSubs }); setSubCatInputs({...subCatInputs, [catId]: ''}); alert("✅ Added!"); } catch (error) { alert("⚠️ Error."); }
  }

  const handleRemoveSubcat = async (catId: string, currentSubs: string[], subToRemove: string) => {
    if(confirm(`Remove sub-category "${subToRemove}"?`)) { const updatedSubs = (currentSubs || []).filter(s => s !== subToRemove); try { await updateCategory(catId, { subcategories: updatedSubs }); alert("✅ Removed!"); } catch (error) { alert("⚠️ Error."); } }
  }

  const handleToggleCategory = async (cat: any) => { const newStatus = cat.isActive === false ? true : false; try { await updateCategory(cat.id, { isActive: newStatus }); if (fetchData) await fetchData(); } catch (error) { alert("⚠️ Error."); } }

  const handleConvertCategory = async (oldCat: any) => {
    if (!targetParentCategory) return alert("Select target parent category first!");
    if (confirm(`Move all from '${oldCat.name}' to '${targetParentCategory}' and delete '${oldCat.name}'?`)) {
      try {
        const parentCat = categories.find((c: any) => c.name === targetParentCategory); if (!parentCat) return;
        const updatedSubs = [...(parentCat.subcategories || []), oldCat.name]; const uniqueSubs = Array.from(new Set(updatedSubs));
        await updateCategory(parentCat.id, { subcategories: uniqueSubs });
        const productsToUpdate = products.filter((p: any) => p.category === oldCat.name);
        await Promise.all(productsToUpdate.map((p: any) => updateProduct(p.id, { category: parentCat.name, subcategory: oldCat.name })));
        await deleteCategory(oldCat.id); setConvertingCategory(null); setTargetParentCategory(''); alert(`✅ Success! Moved to '${parentCat.name}'.`);
      } catch (error) { alert("⚠️ Error."); }
    }
  }

  const handleDeleteCustomerWipe = (phone: string) => { if(confirm("Wipe from CRM?")) { updateCustomerMeta(phone, { isDeleted: true }); alert("✅ Wiped."); } }

  const handleUpdateZoneFee = async (zone: any) => {
    if (!editingZoneFee) return;
    try { if (updateDeliveryZone) await updateDeliveryZone(zone.id, { fee: Number(editingZoneFee) }); else { await deleteDeliveryZone(zone.id); await addDeliveryZone({ areaName: zone.areaName, fee: Number(editingZoneFee), isActive: zone.isActive }); } setEditingZoneId(null); setEditingZoneFee(''); alert("✅ Updated!"); if (fetchData) fetchData(); } catch(e) { alert("⚠️ Error."); }
  }

  const liveOrders = orders.filter((o: any) => o.status === 'Pending' || o.status === 'Preparing' || o.status === 'In Transit').reverse()
  const customersMap = new Map()
  Object.keys(customerMeta).forEach(phone => { const meta = customerMeta[phone]; if (meta.isDeleted) return; customersMap.set(phone, { name: meta.name || 'Unknown', phone: phone, address: meta.address || 'Address not added', totalOrders: 0, totalSpent: 0, ordersList: [], firstSeen: 9999999 }) })
  orders.forEach((order: any, index: number) => {
    if (customerMeta[order.phone]?.isDeleted) return; 
    if (!customersMap.has(order.phone)) customersMap.set(order.phone, { name: order.customer, phone: order.phone, address: order.landmark, totalOrders: 0, totalSpent: 0, ordersList: [], firstSeen: index })
    else { if (order.landmark) customersMap.get(order.phone).address = order.landmark; if (index < customersMap.get(order.phone).firstSeen) customersMap.get(order.phone).firstSeen = index }
    const cust = customersMap.get(order.phone)
    cust.totalOrders += 1; if (order.status === 'Delivered') cust.totalSpent += order.amount; cust.ordersList.push(order)
  })
  let customersList = Array.from(customersMap.values())
  if (customerSearchQuery.trim() !== '') { const query = customerSearchQuery.toLowerCase(); customersList = customersList.filter(c => c.name.toLowerCase().includes(query) || c.phone.includes(query)) }
  customersList.sort((a, b) => {
    if (customerSortOption === 'spent_desc') { if (b.totalSpent !== a.totalSpent) return b.totalSpent - a.totalSpent; return b.totalOrders - a.totalOrders }
    else if (customerSortOption === 'spent_asc') { if (a.totalSpent !== b.totalSpent) return a.totalSpent - b.totalSpent; return a.totalOrders - b.totalOrders }
    else if (customerSortOption === 'new_to_old') { return b.firstSeen - a.firstSeen } else if (customerSortOption === 'old_to_new') { return a.firstSeen - b.firstSeen }
    return 0
  })

  if (!isMounted) return null

  // Helper for Status Colors in Native Tailwind
  const getStatusColor = (status: string) => { 
    switch(status) { 
      case 'Pending': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30 animate-pulse'; 
      case 'Preparing': return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30'; 
      case 'In Transit': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'; 
      case 'Delivered': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'; 
      case 'Cancelled': return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30'; 
      default: return 'bg-muted text-muted-foreground border-border'; 
    } 
  }

  const handleSelectCustomer = (phone: string) => { setSelectedCustomers(prev => prev.includes(phone) ? prev.filter(p => p !== phone) : [...prev, phone]) }
  const handleSelectAll = () => { if (selectedCustomers.length === customersList.length) setSelectedCustomers([]); else setSelectedCustomers(customersList.map(c => c.phone)) }
  const handleSendToApp = async () => { if (selectedCustomers.length === 0) return alert("Select at least one!"); if (!messageText.trim()) return alert("Message empty!"); try { await Promise.all(selectedCustomers.map(phone => addNotification(phone, messageText))); alert(`✅ Pushed!`); setSelectedCustomers([]); setMessageText(''); } catch (error) { alert("⚠️ Error."); } }
  const handleSendToWhatsApp = () => { if (selectedCustomers.length === 0) return alert("Select at least one!"); if (!messageText.trim()) return alert("Message empty!"); if (selectedCustomers.length === 1) { const phone = selectedCustomers[0].replace(/\D/g, ''); window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(messageText)}`, '_blank'); } else { alert(`⚠️ Bulk requires API.`); } }

  const handleSaveProduct = (e: React.FormEvent) => { e.preventDefault(); const productPayload = { name: formData.name, price: Number(formData.price), mrp: Number(formData.mrp), cost_price: Number(formData.cost_price), category: formData.category, subcategory: formPlacement === 'sub' ? formData.subcategory : '', image: formData.image || '/placeholder.jpg', inStock: formData.inStock, description: formData.description, galleryImages: formData.galleryImages, foodPref: formData.foodPref, customStockMessage: formData.customStockMessage }; if (editingId) updateProduct(editingId, productPayload); else addProduct(productPayload); setIsProductSheetOpen(false); resetForm(); }
  const openEdit = (product: any) => { setEditingId(product.id); setFormPlacement(product.subcategory ? 'sub' : 'main'); setFormData({ name: product.name, price: product.price.toString(), mrp: product.mrp.toString(), cost_price: product.cost_price?.toString() || '', category: product.category, subcategory: product.subcategory || '', image: product.image, inStock: product.inStock, description: product.description || '', galleryImages: product.galleryImages || [], foodPref: product.foodPref || 'none', customStockMessage: product.customStockMessage || '' }); setIsProductSheetOpen(true); }
  const resetForm = () => { setEditingId(null); setFormPlacement('main'); setFormData({ name: '', price: '', mrp: '', cost_price: '', category: (selectedCategoryView || displayCategories[0] || '') as string, subcategory: '', image: '', inStock: true, description: '', galleryImages: [], foodPref: 'none', customStockMessage: '' }); setNewGalleryUrl(''); }
  const addGalleryUrl = () => { if(newGalleryUrl.trim() !== '') { setFormData(prev => ({ ...prev, galleryImages: [...prev.galleryImages, newGalleryUrl.trim()] })); setNewGalleryUrl(''); } }
  const removeGalleryImage = (index: number) => { setFormData(prev => ({ ...prev, galleryImages: prev.galleryImages.filter((_, i) => i !== index) })); }

  const activeCategoryObject = categories?.find((c: any) => c.name === formData.category); const activeSubcategories = activeCategoryObject?.subcategories || [];
  const viewCategoryObject = categories?.find((c: any) => c.name === selectedCategoryView); const viewSubcategories = viewCategoryObject?.subcategories || [];

  const displayedProducts = products.filter((p:any) => { if (p.category !== selectedCategoryView) return false; if (selectedSubcategoryFilter) { return p.subcategory === selectedSubcategoryFilter; } else { if (subcatViewMode === 'folders' && viewSubcategories.length > 0) { return !p.subcategory || p.subcategory.trim() === ''; } else { return true; } } });

  // Authentication Lock UI
  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-white p-4">
        <div className="w-full max-w-md bg-[#111] border border-[#222] p-8 rounded-3xl text-center space-y-6">
          <ShieldAlert className="w-16 h-16 text-emerald-500 mx-auto" />
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-widest text-white">WebFoo <span className="text-emerald-500">Admin</span></h1>
            <p className="text-zinc-500 mt-2 text-sm uppercase font-bold tracking-widest">Restricted Access</p>
          </div>
          <form onSubmit={handleAdminAccess} className="space-y-4">
            <div className="relative">
              <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <Input type="password" placeholder="ENTER SYSTEM PASSCODE" value={passcode} onChange={(e) => setPasscode(e.target.value)} className="w-full h-14 bg-[#1a1a1a] border-[#333] pl-12 text-center text-lg font-black tracking-[0.5em] focus-visible:ring-emerald-500 focus-visible:border-emerald-500 placeholder:tracking-widest" />
            </div>
            {authError && <p className="text-rose-500 text-xs font-black tracking-widest uppercase">{authError}</p>}
            <Button type="submit" className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-black font-black text-lg tracking-widest uppercase">Unlock System</Button>
          </form>
          <div className="pt-6 border-t border-[#222]">
            <Link href="/" className="text-xs font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest">&larr; Return to Store</Link>
          </div>
        </div>
      </div>
    )
  }

  const SidebarNav = () => (
    <div className="flex flex-col h-full bg-background border-r border-border">
      <div className="p-6 border-b border-border flex items-center gap-3">
        <Link href="/"><Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-foreground hover:bg-muted"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <span className="text-2xl font-black italic uppercase text-foreground">WebFoo <span className="text-emerald-500">Admin</span></span>
      </div>
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 scrollbar-hide">
        {MENU_ITEMS.map((item) => (
          <button key={item.id} onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); setSelectedCategoryView(null); setSelectedSubcategoryFilter(null); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-foreground text-background shadow-md' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
            <item.icon className="w-5 h-5" />
            <span className="font-bold text-sm uppercase tracking-widest">{item.label}</span>
            {item.id === 'live_orders' && liveOrders.length > 0 && (<span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white">{liveOrders.length}</span>)}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-border">
        <Button onClick={() => { sessionStorage.removeItem('webfoo_admin_unlocked'); setIsAuthorized(false); }} className="w-full bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/30 uppercase tracking-widest font-black text-xs h-12"><PowerOff className="w-4 h-4 mr-2" /> Lock System</Button>
      </div>
    </div>
  )

  const renderProductCard = (product: any) => (
    <Card key={product.id} className={`overflow-hidden group transition-all border-border bg-card shadow-sm ${!product.inStock ? 'opacity-60 grayscale' : 'hover:border-foreground/30 hover:shadow-md'}`}>
      <div className="relative h-40 w-full bg-muted"><img src={product.image || "/placeholder.jpg"} alt={product.name} className="object-cover w-full h-full" onError={(e) => { e.currentTarget.src = '/placeholder.jpg' }} />
        {product.foodPref === 'veg' && <div className="absolute top-2 left-2 bg-white rounded-sm p-0.5"><div className="w-3 h-3 border-2 border-green-600 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div></div></div>}
        {product.foodPref === 'non-veg' && <div className="absolute top-2 left-2 bg-white rounded-sm p-0.5"><div className="w-3 h-3 border-2 border-red-600 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div></div></div>}
        {!product.inStock && <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 p-2 text-center gap-1"><span className="bg-rose-500 text-white font-black text-[10px] px-2 py-1 uppercase rounded">{product.customStockMessage ? product.customStockMessage : 'Out of Stock'}</span></div>}
        <div className="absolute top-2 right-2 flex gap-2 z-20"><button onClick={(e) => { e.stopPropagation(); openEdit(product) }} className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-foreground hover:bg-foreground hover:text-background transition-all shadow-sm"><Edit className="w-4 h-4" /></button><button onClick={(e) => { e.stopPropagation(); if(confirm("Delete this product?")) deleteProduct(product.id) }} className="w-8 h-8 rounded-full bg-background border border-rose-500/50 flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"><Trash2 className="w-4 h-4" /></button></div>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2"><p className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-1 truncate pr-2">{product.category} {product.subcategory && `> ${product.subcategory}`}</p><button onClick={() => toggleStock(product.id)} className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded border uppercase flex items-center gap-1 ${product.inStock ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 'text-rose-600 dark:text-rose-400 border-rose-500/30 bg-rose-500/10'}`}>{product.inStock ? 'In Stock' : 'Out'}</button></div>
        <h3 className="font-bold text-sm leading-tight truncate text-foreground">{product.name}</h3><div className="flex items-center gap-2 mt-2"><span className="font-mono font-black text-foreground">₹{product.price}</span>{product.mrp > product.price && <span className="text-xs text-muted-foreground line-through font-mono">₹{product.mrp}</span>}</div>
      </CardContent>
    </Card>
  )

  return (
    <div className={isAdminDark ? "dark" : ""}>
      <div className="flex min-h-screen font-sans bg-background text-foreground transition-colors duration-300">
        <audio ref={alertAudioRef} src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" preload="auto" />
        <aside className="hidden md:flex flex-col w-72 fixed top-0 bottom-0 left-0 z-40 bg-background"><SidebarNav /></aside>
        <header className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-border z-40 flex items-center px-4 justify-between bg-background">
          <div className="flex items-center gap-3">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild><Button variant="ghost" size="icon" className="hover:bg-muted text-foreground"><Menu className="w-6 h-6" /></Button></SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 border-r border-border bg-background"><SheetHeader className="sr-only"><SheetTitle>Menu</SheetTitle></SheetHeader><SidebarNav /></SheetContent>
            </Sheet>
            <span className="text-xl font-black italic uppercase text-foreground">Admin <span className="text-emerald-500">Panel</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleAdminTheme} className="hover:bg-muted" title="Toggle Admin Theme">
                {isAdminDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-slate-700" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => fetchData && fetchData()} className="text-foreground border border-border hover:bg-muted">
              <Zap className="w-4 h-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 md:ml-72 pt-20 md:pt-8 p-4 md:p-8 overflow-y-auto min-h-screen">
          <div className="mb-8 hidden md:flex justify-between items-center">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-2 text-foreground">
              {MENU_ITEMS.find(m => m.id === activeTab)?.label}
              {activeTab === 'live_orders' && liveOrders.length > 0 && <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse ml-2" />}
            </h2>
            <div className="flex gap-3 items-center">
              <Button variant="ghost" size="icon" onClick={toggleAdminTheme} className="mr-2 hover:bg-muted border border-border text-foreground" title="Toggle Admin Theme">
                {isAdminDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-slate-700" />}
              </Button>
              <Button variant="outline" onClick={() => fetchData && fetchData()} className="font-black tracking-widest uppercase border-border text-foreground hover:bg-foreground hover:text-background transition-all">
                <Zap className="w-4 h-4 mr-2" /> Refresh
              </Button>
              <Button variant="outline" onClick={() => { alertAudioRef.current?.play(); alert("✅ Alert Sound Enabled!"); }} className="font-black tracking-widest uppercase border-border text-foreground hover:bg-foreground hover:text-background transition-all">
                <Volume2 className="w-4 h-4 mr-2" /> 🔔 Sound
              </Button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            
            {/* ANALYTICS */}
            {activeTab === 'analytics' && (
              <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card shadow-sm">
                  <div className="flex items-center gap-2"><Calendar className="w-5 h-5 text-foreground"/><h3 className="text-sm font-black uppercase tracking-widest text-foreground">Performance Metrics</h3></div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select value={analyticsFilter} onChange={(e) => setAnalyticsFilter(e.target.value)} className="rounded-lg px-3 h-10 text-xs font-bold w-full sm:w-auto uppercase tracking-wider bg-background text-foreground border border-input focus:outline-none focus:ring-2 focus:ring-ring"><option value="all">All Time</option><option value="today">Today</option><option value="yesterday">Yesterday</option><option value="custom">Custom Date</option></select>
                    {analyticsFilter === 'custom' && <Input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} className="h-10 text-xs w-full sm:w-auto bg-background text-foreground border-input" />}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="border-border bg-card shadow-sm"><CardContent className="p-6"><div className="flex justify-between items-start mb-4"><div className="bg-emerald-500/10 p-3 rounded-lg"><IndianRupee className="w-6 h-6 text-emerald-600 dark:text-emerald-400" /></div><Badge variant="outline" className="font-bold uppercase tracking-widest text-[10px] text-emerald-600 border-emerald-500/30">Revenue</Badge></div><p className="text-3xl font-black font-mono tracking-tighter text-foreground">₹{totalRevenue}</p><p className="text-xs mt-1 uppercase tracking-widest text-muted-foreground">From Delivered</p></CardContent></Card>
                  <Card className="border-border bg-card shadow-sm"><CardContent className="p-6"><div className="flex justify-between items-start mb-4"><div className="bg-cyan-500/10 p-3 rounded-lg"><PackageIcon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" /></div><Badge variant="outline" className="font-bold uppercase tracking-widest text-[10px] text-cyan-600 border-cyan-500/30">Orders</Badge></div><p className="text-3xl font-black font-mono tracking-tighter text-foreground">{totalOrdersCount}</p><p className="text-xs mt-1 uppercase tracking-widest text-muted-foreground">Total Received</p></CardContent></Card>
                  <Card className="border-border bg-card shadow-sm"><CardContent className="p-6"><div className="flex justify-between items-start mb-4"><div className="bg-muted p-3 rounded-lg"><TrendingUp className="w-6 h-6 text-foreground" /></div><Badge variant="outline" className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground border-border">A.O.V</Badge></div><p className="text-3xl font-black font-mono tracking-tighter text-foreground">₹{avgOrderValue}</p><p className="text-xs mt-1 uppercase tracking-widest text-muted-foreground">Average Order Value</p></CardContent></Card>
                  <Card className="border-border bg-card shadow-sm"><CardContent className="p-6"><div className="flex justify-between items-start mb-4"><div className="bg-muted p-3 rounded-lg"><Users className="w-6 h-6 text-foreground" /></div><Badge variant="outline" className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground border-border">Customers</Badge></div><p className="text-3xl font-black font-mono tracking-tighter text-foreground">{uniqueCustomersInAnalytics}</p><p className="text-xs mt-1 uppercase tracking-widest text-muted-foreground">Unique Buyers</p></CardContent></Card>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-border bg-card shadow-sm"><CardContent className="p-6"><div className="flex items-center gap-2 mb-6 border-b border-border pb-4"><Target className="w-5 h-5 text-foreground" /><h3 className="text-lg font-black uppercase tracking-widest text-foreground">Order Success Rate</h3></div><div className="space-y-4"><div><div className="flex justify-between text-sm mb-1"><span className="font-bold uppercase tracking-widest flex items-center gap-2 text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="w-4 h-4"/> Delivered</span><span className="font-mono text-foreground">{analyticsDelivered.length}</span></div><div className="w-full bg-muted rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${totalOrdersCount > 0 ? (analyticsDelivered.length / totalOrdersCount) * 100 : 0}%` }}></div></div></div><div><div className="flex justify-between text-sm mb-1"><span className="font-bold text-orange-500 uppercase tracking-widest flex items-center gap-2"><Clock className="w-4 h-4"/> Pending / Transit</span><span className="font-mono text-foreground">{analyticsPending.length}</span></div><div className="w-full bg-muted rounded-full h-2"><div className="bg-orange-500 h-2 rounded-full" style={{ width: `${totalOrdersCount > 0 ? (analyticsPending.length / totalOrdersCount) * 100 : 0}%` }}></div></div></div><div><div className="flex justify-between text-sm mb-1"><span className="font-bold text-rose-500 uppercase tracking-widest flex items-center gap-2"><XCircle className="w-4 h-4"/> Cancelled</span><span className="font-mono text-foreground">{analyticsCancelled.length}</span></div><div className="w-full bg-muted rounded-full h-2"><div className="bg-rose-500 h-2 rounded-full" style={{ width: `${totalOrdersCount > 0 ? (analyticsCancelled.length / totalOrdersCount) * 100 : 0}%` }}></div></div></div></div></CardContent></Card>
                  <Card className="border-border bg-card shadow-sm"><CardContent className="p-6"><div className="flex items-center gap-2 mb-6 border-b border-border pb-4"><BarChart className="w-5 h-5 text-foreground" /><h3 className="text-lg font-black uppercase tracking-widest text-foreground">Top Selling Products</h3></div>{topProducts.length === 0 ? (<div className="text-center py-8 text-muted-foreground"><PackageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-xs uppercase tracking-widest font-bold">No delivered items</p></div>) : (<div className="space-y-4">{topProducts.map((product, idx) => (<div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background"><div className="flex items-center gap-3"><span className="w-6 h-6 rounded flex items-center justify-center bg-muted text-xs font-black text-foreground">{idx + 1}</span><span className="font-bold text-sm text-foreground">{product.name}</span></div><div className="text-right"><p className="text-xs uppercase tracking-widest mb-0.5 text-muted-foreground">Sold: <span className="font-black font-mono text-foreground">{product.qty}</span></p><p className="font-mono text-sm font-black text-emerald-600 dark:text-emerald-400">₹{product.revenue}</p></div></div>))}</div>)}</CardContent></Card>
                </div>
              </motion.div>
            )}

            {/* BILLING */}
            {activeTab === 'billing' && (
              <motion.div key="billing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card shadow-sm">
                  <div><h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-foreground"><Wallet className="w-4 h-4"/> Wholesale Billing</h3></div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select value={billingFilter} onChange={(e) => setBillingFilter(e.target.value)} className="rounded-lg px-3 h-10 text-xs font-bold focus:outline-none w-full sm:w-auto uppercase tracking-wider bg-background text-foreground border border-input">
                      <option value="today">Today's Bill</option><option value="yesterday">Yesterday</option><option value="all">All Time</option><option value="custom">Custom Date</option>
                    </select>
                    {billingFilter === 'custom' && <Input type="date" value={billingCustomDate} onChange={(e) => setBillingCustomDate(e.target.value)} className="h-10 text-xs w-full sm:w-auto bg-background text-foreground border-input" />}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card className="border-border bg-card shadow-sm"><CardContent className="p-6"><p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-2">Total Sales (Revenue)</p><p className="text-3xl font-black font-mono text-foreground">₹{totalBilledRevenue}</p></CardContent></Card>
                  <Card className="border-rose-500/30 bg-rose-500/5 shadow-sm"><CardContent className="p-6"><p className="text-xs text-rose-600 dark:text-rose-400 uppercase tracking-widest font-bold mb-2">Payable to Shop (Cost)</p><p className="text-3xl font-black text-rose-600 dark:text-rose-400 font-mono">₹{totalSupplierCost}</p></CardContent></Card>
                  <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-sm"><CardContent className="p-6"><p className="text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-bold mb-2">Your Profit</p><p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">₹{totalBilledProfit}</p></CardContent></Card>
                </div>
                <Card className="border-border bg-card shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="text-sm font-black uppercase tracking-widest mb-4 border-b border-border pb-4 text-foreground">Items Breakdown</h3>
                    {billedItemsArray.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground"><Wallet className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-xs uppercase tracking-widest font-bold">No items delivered</p></div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center px-4 py-2 bg-muted rounded-lg border border-border text-[10px] uppercase font-black text-muted-foreground tracking-widest"><span className="flex-1">Product</span><span className="w-16 text-center">Qty</span><span className="w-24 text-right">Buy Rate</span><span className="w-24 text-right">Total Cost</span></div>
                        {billedItemsArray.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center px-4 py-3 bg-background rounded-lg border border-border hover:bg-muted/50 transition-colors"><span className="flex-1 font-bold text-sm truncate pr-4 text-foreground">{item.name}</span><span className="w-16 text-center font-mono font-bold text-foreground">{item.qty}</span><span className="w-24 text-right font-mono text-muted-foreground">₹{item.costRate}</span><span className="w-24 text-right font-mono font-black text-rose-600 dark:text-rose-400">₹{item.totalCost}</span></div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* LIVE ORDERS */}
            {activeTab === 'live_orders' && (
               <motion.div key="live_orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                 {liveOrders.length === 0 ? (
                   <Empty className="py-20 mt-10 max-w-md mx-auto border-border bg-card shadow-sm"><EmptyContent><CheckCircle2 className="w-12 h-12 text-muted-foreground opacity-50 mb-4" /><EmptyTitle className="text-xl uppercase text-foreground">All Clear</EmptyTitle></EmptyContent></Empty>
                 ) : (
                   <div className="grid grid-cols-1 gap-6">
                     {liveOrders.map((order: any, idx: number) => {
                       const actualIndex = orders.findIndex((o: any) => o === order)
                       const orderIdToUpdate = order.id || actualIndex
                       const isBlocked = customerMeta[order.phone]?.isBlocked
                       return (
                       <Card key={idx} className={`overflow-hidden relative bg-card shadow-sm border-border ${isBlocked ? 'border-rose-500/50' : ''}`}>
                         <div className="bg-muted/50 p-4 sm:p-6 border-b border-border flex justify-between">
                           <div>
                             <h3 className="text-xl font-black uppercase flex items-center gap-2 text-foreground">{order.customer} {isBlocked && <Badge variant="destructive" className="text-[10px]">BLOCKED</Badge>}</h3>
                             <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground mt-1"><span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {order.time}</span><span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {order.phone}</span></div>
                           </div>
                           <span className={`px-4 py-1.5 rounded-md border text-[10px] font-black tracking-widest uppercase h-fit ${getStatusColor(order.status)}`}>{order.status === 'Pending' ? 'WAITING TO ACCEPT' : order.status === 'Preparing' ? 'PREPARING' : order.status}</span>
                         </div>
                         <CardContent className="p-0">
                           <div className="grid grid-cols-1 lg:grid-cols-2">
                             <div className="p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-border">
                               <p className="text-[10px] font-black uppercase tracking-widest mb-4 text-muted-foreground">Order Items</p>
                               <div className="space-y-3">
                                 {order.items.map((item: any, i: number) => {
                                   const pInfo = products.find((p:any) => p.name === item.name);
                                   const catName = item.category || pInfo?.category || 'General';
                                   const subcatName = item.subcategory || pInfo?.subcategory || '';
                                   return (
                                   <div key={i} className="flex justify-between items-start text-sm">
                                     <div className="flex flex-col">
                                       <span className="font-bold text-foreground">{item.quantity}x {item.name}</span>
                                       <span className="text-[9px] uppercase tracking-widest mt-0.5 text-muted-foreground">{catName} {subcatName && `> ${subcatName}`}</span>
                                     </div>
                                     <span className="font-mono text-muted-foreground">₹{item.price * item.quantity}</span>
                                   </div>
                                 )})}
                               </div>
                               <div className="mt-4 pt-4 border-t border-border space-y-2">
                                 {order.discount > 0 && (
                                   <>
                                     <div className="flex justify-between items-center text-[10px] uppercase font-bold text-muted-foreground"><span>Subtotal</span><span>₹{order.subtotal}</span></div>
                                     <div className="flex justify-between items-center text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400"><span>Discount ({order.promoCode})</span><span>-₹{order.discount}</span></div>
                                   </>
                                 )}
                                 <div className="flex justify-between items-center pt-2 border-t border-border mt-2"><span className="text-xs font-bold uppercase tracking-widest text-foreground">Final Paid</span><span className="font-mono font-black text-lg text-foreground">₹{order.amount}</span></div>
                               </div>
                             </div>
                             <div className="p-4 sm:p-6 space-y-6">
                               <div className="flex gap-3"><MapPin className="w-5 h-5 text-foreground" /><div><p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Drop Details</p><p className="text-sm mt-1 text-foreground">{order.landmark}</p></div></div>
                               
                               <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
                                  <Button onClick={() => updateOrderStatus(orderIdToUpdate, 'Preparing')} className={`h-10 text-xs font-black tracking-widest uppercase transition-all ${order.status === 'Preparing' ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/50' : order.status === 'Pending' ? 'bg-orange-500 text-white border-orange-500 hover:bg-orange-600 animate-pulse shadow-md' : 'border-border hover:bg-muted'}`} variant={order.status === 'Pending' ? "default" : "outline"}>
                                    {order.status === 'Pending' ? <AlertCircle className="w-4 h-4 mr-2"/> : <ChefHat className="w-4 h-4 mr-2"/>}
                                    {order.status === 'Pending' ? 'ACCEPT ORDER' : 'PREPARING'}
                                  </Button>
                                  <Button onClick={() => updateOrderStatus(orderIdToUpdate, 'In Transit')} className={`h-10 text-xs font-black tracking-widest uppercase transition-all ${order.status === 'In Transit' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/50' : 'border-border hover:bg-muted'}`} variant="outline">
                                    <Bike className="w-4 h-4 mr-2"/> ON THE WAY
                                  </Button>
                                  <Button onClick={() => updateOrderStatus(orderIdToUpdate, 'Delivered')} className="h-10 text-xs font-black bg-emerald-500 text-white tracking-widest uppercase hover:bg-emerald-600 border-none">
                                    <CheckCircle2 className="w-4 h-4 mr-2"/> DELIVERED
                                  </Button>
                                  <Button onClick={() => updateOrderStatus(orderIdToUpdate, 'Cancelled')} className="h-10 text-xs font-black text-rose-600 dark:text-rose-400 tracking-widest uppercase hover:bg-rose-500/10" variant="ghost">
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
                  <h3 className="text-xl font-black uppercase text-foreground">Order History</h3>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select value={historyFilter} onChange={(e) => setHistoryFilter(e.target.value)} className="rounded-lg px-3 h-10 text-xs font-bold focus:outline-none bg-background text-foreground border border-input w-full sm:w-auto uppercase tracking-wider"><option value="all">All Time</option><option value="today">Today</option><option value="yesterday">Yesterday</option><option value="custom">Custom Date</option></select>
                    {historyFilter === 'custom' && <Input type="date" value={historyCustomDate} onChange={(e) => setHistoryCustomDate(e.target.value)} className="h-10 text-xs w-full sm:w-auto bg-background text-foreground border-input" />}
                  </div>
                </div>
                {filteredOrderHistory.length === 0 ? (
                  <Empty className="py-20 max-w-md mx-auto border-border bg-card shadow-sm"><EmptyContent><History className="w-12 h-12 text-muted-foreground opacity-50 mb-4" /><EmptyTitle className="text-xl uppercase text-foreground">No Past Orders</EmptyTitle></EmptyContent></Empty>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {filteredOrderHistory.map((order: any, idx: number) => {
                      const isBlocked = customerMeta[order.phone]?.isBlocked
                      return (
                        <Card key={idx} className={`overflow-hidden relative bg-card border-border shadow-sm ${isBlocked ? 'border-rose-500/50' : ''}`}>
                          <div className="bg-muted/50 p-4 sm:p-6 border-b border-border flex justify-between items-center">
                            <div>
                              <h3 className="text-xl font-black uppercase flex items-center gap-2 text-foreground">{order.customer} {isBlocked && <Badge variant="destructive" className="text-[10px]">BLOCKED</Badge>}</h3>
                              <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground mt-1"><span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {order.time}</span><span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {order.phone}</span></div>
                            </div>
                            <span className={`px-4 py-1.5 rounded-md border text-[10px] font-black tracking-widest uppercase h-fit ${getStatusColor(order.status)}`}>{order.status}</span>
                          </div>
                          <CardContent className="p-0">
                            <div className="grid grid-cols-1 lg:grid-cols-2">
                              <div className="p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-border">
                                <p className="text-[10px] font-black uppercase tracking-widest mb-4 text-muted-foreground">Order Items</p>
                                <div className="space-y-3">
                                  {order.items.map((item: any, i: number) => {
                                    const pInfo = products.find((p:any) => p.name === item.name);
                                    const catName = item.category || pInfo?.category || 'General';
                                    const subcatName = item.subcategory || pInfo?.subcategory || '';
                                    return (
                                    <div key={i} className="flex justify-between items-start text-sm">
                                      <div className="flex flex-col">
                                        <span className="font-bold text-foreground">{item.quantity}x {item.name}</span>
                                        <span className="text-[9px] uppercase tracking-widest mt-0.5 text-muted-foreground">{catName} {subcatName && `> ${subcatName}`}</span>
                                      </div>
                                      <span className="font-mono text-muted-foreground">₹{item.price * item.quantity}</span>
                                    </div>
                                  )})}
                                </div>
                                <div className="mt-4 pt-4 border-t border-border space-y-2">
                                  {order.discount > 0 && (
                                    <><div className="flex justify-between items-center text-[10px] uppercase font-bold text-muted-foreground"><span>Subtotal</span><span>₹{order.subtotal}</span></div><div className="flex justify-between items-center text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400"><span>Discount ({order.promoCode})</span><span>-₹{order.discount}</span></div></>
                                  )}
                                  <div className="flex justify-between items-center pt-2 border-t border-border mt-2"><span className="text-xs font-bold uppercase tracking-widest text-foreground">Final Paid</span><span className="font-mono font-black text-lg text-foreground">₹{order.amount}</span></div>
                                </div>
                              </div>
                              <div className="p-4 sm:p-6"><div className="flex gap-3"><MapPin className="w-5 h-5 text-foreground" /><div><p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Drop Details</p><p className="text-sm mt-1 text-foreground">{order.landmark}</p></div></div></div>
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
                 <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 p-4 rounded-xl border border-border bg-card shadow-sm">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-muted text-foreground">
                        <Users className="w-6 h-6" />
                     </div>
                     <div>
                       <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Registered</h3>
                       <p className="text-2xl font-mono font-black text-foreground">{customersMap.size}</p>
                     </div>
                   </div>

                   <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 flex-1 md:justify-end">
                      <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search Name or Phone..."
                          value={customerSearchQuery}
                          onChange={(e) => setCustomerSearchQuery(e.target.value)}
                          className="w-full pl-9 bg-background text-foreground border-input focus-visible:ring-1"
                        />
                      </div>
                      <select
                        value={customerSortOption}
                        onChange={(e) => setCustomerSortOption(e.target.value)}
                        className="rounded-lg px-3 h-10 text-xs font-bold focus:outline-none w-full sm:w-auto uppercase tracking-wider bg-background text-foreground border border-input focus-visible:ring-1"
                      >
                        <option value="spent_desc">High Spending</option>
                        <option value="spent_asc">Low Spending</option>
                        <option value="new_to_old">Newest First</option>
                        <option value="old_to_new">Oldest First</option>
                      </select>
                   </div>
                 </div>

                 {customersList.length === 0 ? (
                  <Empty className="py-20 mt-6 max-w-md mx-auto border-border bg-card shadow-sm"><EmptyContent><Search className="w-12 h-12 mb-4 text-muted-foreground opacity-50" /><EmptyTitle className="text-xl uppercase tracking-tighter text-foreground">No Matches Found</EmptyTitle></EmptyContent></Empty>
                 ) : (
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                     {customersList.map((cust: any, idx) => {
                       const meta = customerMeta[cust.phone] || {}; const isVip = meta.isVip; const isBlocked = meta.isBlocked;
                       return (
                         <Card key={idx} className={`overflow-hidden transition-all bg-card border-border shadow-sm hover:shadow-md ${isBlocked ? 'opacity-50 grayscale' : ''}`}>
                           <div className="p-5 flex flex-col sm:flex-row justify-between gap-4">
                             <div className="space-y-3 flex-1">
                               <div className="flex items-center gap-3"><h3 className="text-xl font-black uppercase tracking-tight text-foreground">{cust.name}</h3>{isVip && <Badge className="text-black bg-amber-400 hover:bg-amber-500 font-black uppercase tracking-widest text-[10px]">VIP</Badge>}{isBlocked && <Badge variant="destructive" className="font-black uppercase tracking-widest text-[10px]">BLOCKED</Badge>}</div>
                               <div className="grid grid-cols-2 gap-4"><div><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Total Spent</p><p className="font-mono text-xl font-black text-foreground">₹{cust.totalSpent}</p></div><div><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Total Orders</p><p className={`font-mono text-xl font-black ${cust.totalOrders > 0 ? 'text-foreground' : 'text-orange-500'}`}>{cust.totalOrders}</p></div></div>
                             </div>
                             <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                               <a href={`https://wa.me/91${cust.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex-1 sm:flex-none"><Button className="w-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20"><MessageCircle className="w-4 h-4 mr-2" /> WhatsApp</Button></a>
                               <a href={`tel:${cust.phone}`} className="flex-1 sm:flex-none"><Button className="w-full bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500 hover:text-white border border-blue-500/20"><Phone className="w-4 h-4 mr-2" /> Call</Button></a>
                               <Sheet>
                                 <SheetTrigger asChild><Button variant="outline" className="w-full flex-1 sm:flex-none hover:bg-muted border-border text-foreground"><FileText className="w-4 h-4 mr-2" /> Details</Button></SheetTrigger>
                                 <SheetContent className="border-l border-border w-full sm:max-w-md overflow-y-auto bg-background text-foreground">
                                   <SheetHeader className="text-left mb-6 mt-6"><SheetTitle className="text-2xl font-black italic uppercase text-foreground">Customer Details</SheetTitle></SheetHeader>
                                   <div className="space-y-6">
                                     <div className="p-4 rounded-xl space-y-2 border border-border bg-card shadow-sm"><div><p className="font-bold text-lg leading-tight">{cust.name}</p><p className="font-mono text-sm text-muted-foreground">{cust.phone}</p></div><div className="flex gap-2 items-start bg-muted p-3 rounded-lg border border-border"><MapPin className="w-4 h-4 shrink-0 mt-0.5 text-foreground" /><p className="text-sm leading-relaxed text-foreground">{cust.address}</p></div></div>
                                     <div className="flex gap-2">
                                       <Button onClick={() => updateCustomerMeta(cust.phone, { isVip: !isVip })} className={`flex-1 border`} style={isVip ? { backgroundColor: 'var(--muted)', borderColor: 'var(--border)' } : { backgroundColor: 'rgba(251,191,36,0.1)', color: '#d97706', borderColor: 'rgba(251,191,36,0.3)' }}><Star className="w-4 h-4 mr-2" /> {isVip ? 'Remove VIP' : 'Mark as VIP'}</Button>
                                       <Button onClick={() => updateCustomerMeta(cust.phone, { isBlocked: !isBlocked })} className={`flex-1 border ${isBlocked ? 'bg-muted border-border text-foreground' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white border-rose-500/30'}`}><Ban className="w-4 h-4 mr-2" /> {isBlocked ? 'Unblock' : 'Block'}</Button>
                                     </div>
                                     <div className="pt-2 border-t border-border">
                                       <Button onClick={() => handleDeleteCustomerWipe(cust.phone)} variant="outline" className="w-full bg-rose-500/5 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500 hover:text-white">
                                         <Trash2 className="w-4 h-4 mr-2" /> Delete Customer Data
                                       </Button>
                                       <p className="text-[9px] mt-2 text-center uppercase tracking-widest leading-tight text-muted-foreground">Note: This removes data from CRM. To delete their Auth Login, use Supabase Dashboard.</p>
                                     </div>
                                     <div>
                                       <h4 className="text-xs font-black uppercase tracking-widest mb-3 border-b border-border pb-2 text-muted-foreground">Order History</h4>
                                       {cust.totalOrders === 0 ? (
                                         <div className="bg-orange-500/10 p-4 rounded-lg border border-orange-500/20 text-center"><p className="text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-widest">Registered but no orders placed</p></div>
                                       ) : (
                                         <div className="space-y-3">
                                           {cust.ordersList.slice().reverse().map((o: any, i: number) => (
                                             <div key={i} className="bg-muted/50 p-3 rounded-lg border border-border flex justify-between items-center"><div><p className="text-[10px] text-muted-foreground">{o.time}</p><p className="font-bold text-sm text-foreground">{o.items.length} Items</p></div><div className="text-right"><p className="font-mono font-black text-foreground">₹{o.amount}</p><span className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-widest font-black ${getStatusColor(o.status)}`}>{o.status}</span></div></div>
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

            {/* PRODUCTS TAB */}
            {activeTab === 'products' && (
               <motion.div key="products" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                   {selectedCategoryView ? (
                     <div className="flex items-center gap-2">
                       {selectedSubcategoryFilter ? (
                         <Button variant="ghost" onClick={() => setSelectedSubcategoryFilter(null)} className="px-0 transition-all hover:bg-muted text-foreground"><ArrowLeft className="w-5 h-5 mr-2" /> <span className="font-black uppercase tracking-widest text-lg">{selectedCategoryView} <span className="mx-2 text-muted-foreground">/</span> <span>{selectedSubcategoryFilter}</span></span></Button>
                       ) : (
                         <Button variant="ghost" onClick={() => { setSelectedCategoryView(null); setSelectedSubcategoryFilter(null); setProductMasterView('categories'); }} className="px-0 transition-all hover:bg-muted text-foreground"><ArrowLeft className="w-5 h-5 mr-2" /> <span className="font-black uppercase tracking-widest text-lg">{selectedCategoryView}</span></Button>
                       )}
                     </div>
                   ) : (
                     <div className="bg-muted p-1 rounded-lg border border-border flex gap-1">
                        <Button onClick={() => setProductMasterView('categories')} variant={productMasterView === 'categories' ? 'default' : 'ghost'} className={productMasterView === 'categories' ? 'bg-background text-foreground shadow-sm font-black uppercase tracking-widest text-xs h-10' : 'text-muted-foreground hover:text-foreground font-bold uppercase tracking-widest text-xs h-10'}><Folder className="w-4 h-4 mr-2" /> Categories</Button>
                        <Button onClick={() => setProductMasterView('all')} variant={productMasterView === 'all' ? 'default' : 'ghost'} className={productMasterView === 'all' ? 'bg-background text-foreground shadow-sm font-black uppercase tracking-widest text-xs h-10' : 'text-muted-foreground hover:text-foreground font-bold uppercase tracking-widest text-xs h-10'}><LayoutGrid className="w-4 h-4 mr-2" /> All Items</Button>
                     </div>
                   )}

                   <div className="flex items-center gap-2">
                     <Sheet open={isProductSheetOpen} onOpenChange={(open) => { setIsProductSheetOpen(open); if(!open) resetForm(); if(open && selectedCategoryView) { setFormPlacement(selectedSubcategoryFilter ? 'sub' : 'main'); setFormData(prev => ({...prev, category: selectedCategoryView as string, subcategory: selectedSubcategoryFilter || ''})); }}}>
                       <SheetTrigger asChild><Button onClick={resetForm} className="bg-foreground text-background font-black h-12 rounded-xl px-6 hover:bg-foreground/90"><Plus className="w-5 h-5 mr-2" /> ADD PRODUCT</Button></SheetTrigger>
                       <SheetContent className="border-l border-border sm:max-w-xl w-full overflow-y-auto bg-background text-foreground shadow-2xl">
                         <SheetHeader className="text-left mb-6 mt-6"><SheetTitle className="text-3xl font-black italic uppercase text-foreground">{editingId ? 'Edit Product' : 'New Product'}</SheetTitle></SheetHeader>
                         <form onSubmit={handleSaveProduct} className="flex flex-col gap-6 pb-20">
                           <div className="space-y-4 p-5 rounded-xl border border-border bg-card shadow-sm">
                             <Label className="text-xs font-black uppercase tracking-widest flex items-center gap-2"><LinkIcon className="w-4 h-4"/> Main Product Image URL</Label>
                             <p className="text-[10px] leading-tight text-muted-foreground">Paste ImageKit URL here. NO DIRECT UPLOADS.</p>
                             <Input required type="url" placeholder="https://ik.imagekit.io/..." value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} className="text-sm h-12 bg-background border-input text-foreground focus-visible:ring-1" />
                             {formData.image && (
                               <div className="mt-2 relative w-full h-32 rounded-lg overflow-hidden border border-border bg-muted">
                                 <img src={formData.image} alt="Preview" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = '/placeholder.jpg' }} />
                               </div>
                             )}
                           </div>

                           <div className="space-y-4 p-5 rounded-xl border border-border bg-card shadow-sm">
                             <Label className="text-xs font-black uppercase tracking-widest flex items-center gap-2"><LinkIcon className="w-4 h-4"/> Extra Gallery Image URLs</Label>
                             <div className="flex gap-2"><Input type="url" placeholder="Paste extra ImageKit URL..." value={newGalleryUrl} onChange={(e) => setNewGalleryUrl(e.target.value)} className="text-xs h-10 flex-1 bg-background border-input text-foreground focus-visible:ring-1" /><Button type="button" onClick={addGalleryUrl} className="h-10 text-background bg-foreground font-black px-4 hover:bg-foreground/90">ADD</Button></div>
                             {formData.galleryImages.length > 0 && (<div className="flex gap-3 overflow-x-auto pt-2 pb-2 scrollbar-hide">{formData.galleryImages.map((img, i) => (<div key={i} className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-border"><img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" /><button type="button" onClick={() => removeGalleryImage(i)} className="absolute top-1 right-1 bg-rose-500 rounded-full p-1 text-white hover:scale-110 shadow-sm"><XCircle className="w-3 h-3" /></button></div>))}</div>)}
                           </div>

                           <div className="space-y-4">
                             <div className="space-y-2"><Label>Product Name</Label><Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-background border-input text-foreground focus-visible:ring-1" /></div>
                             <div className="space-y-2"><Label>Description / Specifications</Label><textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Write details here..." className="w-full border rounded-xl p-3 min-h-[100px] text-sm resize-y bg-background border-input text-foreground focus-visible:ring-1" /></div>
                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                               <div className="space-y-2"><Label className="text-emerald-600 dark:text-emerald-400">Cost (₹)</Label><Input required type="number" value={formData.cost_price} onChange={e => setFormData({...formData, cost_price: e.target.value})} className="font-bold bg-background text-emerald-600 dark:text-emerald-400 border-emerald-500/50 focus-visible:ring-emerald-500" /></div>
                               <div className="space-y-2"><Label>Sell Price (₹)</Label><Input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="bg-background border-input text-foreground focus-visible:ring-1" /></div>
                               <div className="space-y-2"><Label>MRP (₹)</Label><Input required type="number" value={formData.mrp} onChange={e => setFormData({...formData, mrp: e.target.value})} className="bg-background border-input text-foreground focus-visible:ring-1" /></div>
                             </div>
                             
                             <div className="p-4 rounded-xl border border-border space-y-4 mt-2 bg-card shadow-sm">
                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                 <div className="space-y-2">
                                   <Label>Main Category</Label>
                                   <select required value={formData.category} onChange={e => { setFormData({...formData, category: e.target.value, subcategory: ''}); setFormPlacement('main'); }} className="w-full h-12 rounded-md px-3 text-sm focus:outline-none bg-background border border-input text-foreground focus:ring-1 focus:ring-ring">
                                     {displayCategories.map((catName: any, idx: number) => (<option key={idx} value={catName}>{catName}</option>))}
                                   </select>
                                 </div>
                                 <div className="space-y-2">
                                    <Label>Food Type</Label>
                                    <select required value={formData.foodPref} onChange={e => setFormData({...formData, foodPref: e.target.value as any})} className="w-full h-12 rounded-md px-3 text-sm focus:outline-none bg-background border border-input text-foreground focus:ring-1 focus:ring-ring">
                                      <option value="none">None (Gadgets)</option><option value="veg" className="text-green-600 dark:text-green-400">Vegetarian 🟢</option><option value="non-veg" className="text-rose-600 dark:text-rose-400">Non-Veg 🔴</option>
                                    </select>
                                 </div>
                               </div>

                               <div className="space-y-2 pt-2 border-t border-border mt-2">
                                 <Label className="uppercase text-[10px] font-black tracking-widest text-muted-foreground">Where to place this item?</Label>
                                 <div className="flex gap-2">
                                   <Button type="button" onClick={() => { setFormPlacement('main'); setFormData({...formData, subcategory: ''}); }} variant={formPlacement === 'main' ? 'default' : 'outline'} className={`flex-1 text-xs font-bold uppercase tracking-widest ${formPlacement === 'main' ? 'bg-foreground text-background' : 'text-muted-foreground border-border hover:bg-muted'}`}>Direct in Category</Button>
                                   <Button type="button" onClick={() => setFormPlacement('sub')} disabled={activeSubcategories.length === 0} variant={formPlacement === 'sub' ? 'default' : 'outline'} className={`flex-1 text-xs font-bold uppercase tracking-widest ${formPlacement === 'sub' ? 'bg-foreground text-background' : 'text-muted-foreground border-border hover:bg-muted disabled:opacity-30'}`}>Inside Sub-Category</Button>
                                 </div>
                               </div>

                               {formPlacement === 'sub' && (
                                 <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                   <Label>Choose Sub-Category</Label>
                                   <select required value={formData.subcategory} onChange={e => setFormData({...formData, subcategory: e.target.value})} className="w-full h-12 rounded-md px-3 text-sm focus:outline-none bg-background border border-input text-foreground focus:ring-1 focus:ring-ring">
                                      <option value="" className="text-muted-foreground">Select Sub...</option>
                                      {activeSubcategories.map((subName: string, idx: number) => (<option key={idx} value={subName}>{subName}</option>))}
                                   </select>
                                 </div>
                               )}
                               
                               <div className="space-y-2 pt-2 border-t border-border mt-2">
                                  <Label className="text-orange-500">Custom Out of Stock Message (Optional)</Label>
                                  <Input value={formData.customStockMessage || ''} onChange={e => setFormData({...formData, customStockMessage: e.target.value})} placeholder="e.g. Available at 4 PM" className="bg-background border-input text-foreground focus-visible:ring-orange-500 focus-visible:border-orange-500" />
                               </div>
                             </div>
                           </div>
                           <Button type="submit" className="w-full h-14 bg-foreground text-background font-black mt-4 hover:bg-foreground/90">{editingId ? 'UPDATE PRODUCT' : 'SAVE TO INVENTORY'}</Button>
                         </form>
                       </SheetContent>
                     </Sheet>
                   </div>
                 </div>
                 
                 {productMasterView === 'all' && !selectedCategoryView ? (
                   <div className="mt-6">
                      {products.length === 0 ? (
                        <Empty className="py-20 mt-6 max-w-md mx-auto border border-border bg-card shadow-sm"><EmptyContent><PackageIcon className="w-12 h-12 mb-4 text-muted-foreground opacity-50" /><EmptyTitle className="text-xl uppercase tracking-tighter text-foreground">Inventory is Empty</EmptyTitle></EmptyContent></Empty>
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
                             <Card key={idx} onClick={() => { setSelectedCategoryView(catName); setSelectedSubcategoryFilter(null); }} className="transition-all cursor-pointer group border-border bg-card hover:border-foreground/50 shadow-sm">
                               <CardContent className="p-6 flex flex-col items-center justify-center text-center h-32 relative overflow-hidden"><PackageIcon className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform text-foreground" /><h3 className="font-black text-sm uppercase tracking-widest z-10 text-foreground">{catName}</h3><Badge variant="outline" className="mt-2 text-[10px] z-10 bg-muted border-border text-muted-foreground">{itemCount} Items</Badge></CardContent>
                             </Card>
                           )
                         })}
                       </div>
                     ) : (
                       <div className="mt-6">
                         {viewSubcategories.length > 0 && !selectedSubcategoryFilter && (
                           <div className="flex justify-between items-center mb-6">
                              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Sub-Categories</h4>
                              <div className="flex items-center gap-1 p-1 rounded-lg border border-border bg-muted/50">
                                 <button onClick={() => setSubcatViewMode('folders')} className={`px-3 py-1.5 text-[10px] font-bold rounded-md uppercase tracking-widest transition-all ${subcatViewMode === 'folders' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}><Folder className="w-3 h-3 inline mr-1"/> Folders</button>
                                 <button onClick={() => setSubcatViewMode('tabs')} className={`px-3 py-1.5 text-[10px] font-bold rounded-md uppercase tracking-widest transition-all ${subcatViewMode === 'tabs' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}><LayoutGrid className="w-3 h-3 inline mr-1"/> Direct Items</button>
                              </div>
                           </div>
                         )}

                         {subcatViewMode === 'folders' && !selectedSubcategoryFilter && viewSubcategories.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                              {viewSubcategories.map((sub: string, idx: number) => {
                                 const count = products.filter((p:any) => p.category === selectedCategoryView && p.subcategory === sub).length;
                                 return (
                                    <Card key={idx} onClick={() => setSelectedSubcategoryFilter(sub)} className="transition-all cursor-pointer group border border-border bg-card hover:border-foreground/50 shadow-sm">
                                      <CardContent className="p-6 flex flex-col items-center justify-center text-center h-32 relative overflow-hidden">
                                        <Folder className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform text-muted-foreground" />
                                        <h3 className="font-black text-sm uppercase tracking-widest z-10 text-foreground">{sub}</h3>
                                        <Badge variant="outline" className="mt-2 text-[10px] z-10 bg-muted border-border text-muted-foreground">{count} Items</Badge>
                                      </CardContent>
                                    </Card>
                                 )
                              })}
                            </div>
                         )}

                         {(subcatViewMode === 'tabs' || selectedSubcategoryFilter) && viewSubcategories.length > 0 && (
                            <div className="flex gap-3 overflow-x-auto pb-4 mb-4 border-b border-border scrollbar-hide">
                              {subcatViewMode === 'tabs' && (
                                <Button onClick={() => setSelectedSubcategoryFilter(null)} variant={!selectedSubcategoryFilter ? 'default' : 'outline'} className={`font-bold uppercase tracking-widest text-xs h-9 ${!selectedSubcategoryFilter ? 'bg-foreground text-background' : 'text-muted-foreground border-border hover:bg-muted hover:text-foreground'}`}>Show All</Button>
                              )}
                              {viewSubcategories.map((sub: string, idx: number) => (
                                 <Button key={idx} onClick={() => setSelectedSubcategoryFilter(sub)} variant={selectedSubcategoryFilter === sub ? 'default' : 'outline'} className={`font-bold uppercase tracking-widest text-xs h-9 ${selectedSubcategoryFilter === sub ? 'bg-foreground text-background' : 'text-muted-foreground border-border hover:bg-muted hover:text-foreground'}`}>{sub}</Button>
                              ))}
                            </div>
                         )}

                         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                           {displayedProducts.map((product: any) => renderProductCard(product))}
                           {displayedProducts.length === 0 && <div className="col-span-full py-10 text-center text-muted-foreground"><p className="text-xs uppercase tracking-widest font-bold">No items found for this filter.</p></div>}
                         </div>
                       </div>
                     )}
                   </>
                 )}
               </motion.div>
            )}

            {/* CATEGORIES WITH TIME BASED SETTINGS */}
            {activeTab === 'categories' && (
               <motion.div key="categories" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  <Card className="mb-8 border border-border bg-card shadow-sm">
                    <CardContent className="p-6 sm:p-8 space-y-6">
                      <div className="flex items-center gap-3 border-b border-border pb-4"><LayoutGrid className="w-6 h-6 text-foreground" /><h3 className="text-xl font-black uppercase text-foreground">Create Main Category</h3></div>
                      <form onSubmit={handleSaveCategory} className="flex flex-col gap-4">
                        <div className="space-y-4 p-4 rounded-xl border border-border bg-muted/50">
                          <Label className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-foreground"><LinkIcon className="w-4 h-4"/> Paste Category Image URL</Label>
                          <p className="text-[10px] text-muted-foreground">Host image on ImageKit.io and paste direct URL here.</p>
                          <Input type="url" placeholder="https://ik.imagekit.io/..." value={newCategoryImage} onChange={(e) => setNewCategoryImage(e.target.value)} className="text-xs h-12 bg-background border-input text-foreground focus-visible:ring-1" />
                          {newCategoryImage && (
                            <div className="mt-2 relative w-full sm:w-48 h-24 rounded-lg overflow-hidden border border-border bg-muted">
                              <img src={newCategoryImage} alt="URL Preview" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = '' }} />
                            </div>
                          )}
                        </div>

                        {/* 🔥 TIME INPUTS FOR CATEGORY 🔥 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-widest text-foreground">Start Time (Optional)</Label>
                            <Input type="time" value={newCategoryStartTime} onChange={(e) => setNewCategoryStartTime(e.target.value)} className="h-12 bg-background border-input text-foreground focus-visible:ring-1" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-widest text-foreground">End Time (Optional)</Label>
                            <Input type="time" value={newCategoryEndTime} onChange={(e) => setNewCategoryEndTime(e.target.value)} className="h-12 bg-background border-input text-foreground focus-visible:ring-1" />
                          </div>
                          <p className="col-span-full text-[10px] text-muted-foreground leading-tight">If left blank, the category will be available 24x7. Set times (e.g., 16:00 to 21:00) to restrict availability.</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 items-end mt-2">
                          <div className="flex-1 w-full space-y-2"><Label className="text-xs uppercase tracking-widest text-foreground">{editingCategoryId ? 'Edit Category Name' : 'New Category Name'}</Label><Input required placeholder="e.g. Fast Food" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="h-12 bg-background border-input text-foreground focus-visible:ring-1" /></div>
                          <Button type="submit" className="h-12 w-full sm:w-auto bg-foreground text-background font-black uppercase tracking-widest px-8 hover:bg-foreground/90">{editingCategoryId ? 'UPDATE' : 'ADD CATEGORY'}</Button>
                          {editingCategoryId && <Button type="button" onClick={resetCategoryForm} variant="outline" className="h-12 w-full sm:w-auto border-border text-foreground hover:bg-muted">CANCEL</Button>}
                        </div>
                      </form>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {categories.map((cat: any, idx: number) => {
                      const subCats = cat.subcategories || [];
                      const isConverting = convertingCategory?.id === cat.id;

                      return (
                      <Card key={cat.id} className={`transition-all border border-border bg-card shadow-sm ${cat.isActive !== false ? '' : 'opacity-60 grayscale'} ${isConverting ? 'ring-2 ring-orange-500/50' : ''}`}>
                        <CardContent className="p-0">
                          <div className="p-5 border-b border-border flex justify-between items-start bg-muted/50">
                            <div className="flex items-center gap-4">
                              {cat.image ? <img src={cat.image} alt={cat.name} className="w-12 h-12 rounded-lg object-cover border border-border bg-muted" /> : <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center border border-border"><PackageIcon className="w-6 h-6 text-muted-foreground opacity-50" /></div>}
                              <div>
                                <h4 className="font-black uppercase tracking-wider text-lg text-foreground">{cat.name}</h4>
                                <div className="flex flex-col items-start gap-1">
                                  <Badge variant={cat.isActive !== false ? "outline" : "secondary"} className={`mt-1 text-[8px] font-black uppercase tracking-widest ${cat.isActive !== false ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 'text-muted-foreground border-border bg-muted'}`}>{cat.isActive !== false ? 'ACTIVE' : 'OFF'}</Badge>
                                  
                                  {cat.startTime && cat.endTime && (
                                    <Badge variant="outline" className="mt-1 text-[8px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 border-orange-500/30 bg-orange-500/10">
                                      <Clock className="w-3 h-3 mr-1 inline" /> {cat.startTime} - {cat.endTime}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap justify-end gap-1 w-24">
                              <Button variant="ghost" size="icon" onClick={() => setConvertingCategory(cat)} className="w-8 h-8 text-orange-500 hover:bg-orange-500/20" title="Move to Sub-category"><CornerDownRight className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="icon" onClick={() => handleToggleCategory(cat)} className={`w-8 h-8 hover:bg-muted ${cat.isActive !== false ? 'text-foreground' : 'text-muted-foreground'}`} title={cat.isActive !== false ? "Turn Off" : "Turn On"}><Power className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="icon" onClick={() => editCategoryUI(cat)} className="w-8 h-8 hover:bg-muted text-foreground"><Edit className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="icon" onClick={() => reorderCategory(cat.id, 'up')} disabled={idx === 0} className="w-8 h-8 hover:bg-muted text-foreground"><ArrowUp className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="icon" onClick={() => reorderCategory(cat.id, 'down')} disabled={idx === categories.length - 1} className="w-8 h-8 hover:bg-muted text-foreground"><ArrowDown className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="icon" onClick={() => { if(confirm("Delete entire category?")) deleteCategory(cat.id) }} className="w-8 h-8 text-rose-500 hover:bg-rose-500/10"><Trash2 className="w-4 h-4" /></Button>
                            </div>
                          </div>
                          
                          {isConverting && (
                            <div className="p-4 bg-orange-500/10 border-b border-orange-500/30">
                              <Label className="text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-widest mb-2 block flex items-center gap-2"><CornerDownRight className="w-3 h-3"/> Move '{cat.name}' into Parent folder:</Label>
                              <div className="flex gap-2">
                                <select value={targetParentCategory} onChange={e => setTargetParentCategory(e.target.value)} className="flex-1 bg-background border border-orange-500/30 text-foreground text-xs h-10 rounded-lg px-3 focus:outline-none focus:ring-1 focus:ring-orange-500">
                                  <option value="">Select Parent Category...</option>
                                  {categories.filter((c: any) => c.id !== cat.id).map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                                <Button onClick={() => handleConvertCategory(cat)} className="h-10 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black px-4 uppercase tracking-widest">Merge</Button>
                                <Button onClick={() => {setConvertingCategory(null); setTargetParentCategory('');}} variant="ghost" className="h-10 text-muted-foreground hover:text-foreground"><X className="w-4 h-4"/></Button>
                              </div>
                              <p className="text-[9px] text-orange-600/70 dark:text-orange-400/70 mt-3 uppercase tracking-widest leading-tight">⚠️ All products inside '{cat.name}' will be automatically moved to the new parent. This category block will be deleted.</p>
                            </div>
                          )}

                          <div className="p-5 bg-background">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2"><LayoutGrid className="w-3 h-3"/> Sub-Categories</p>
                            {subCats.length > 0 ? (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {subCats.map((sub: string, i: number) => (
                                  <Badge key={i} variant="outline" className="py-1 flex items-center gap-2 bg-muted border-border text-foreground">
                                    {sub} <button onClick={() => handleRemoveSubcat(cat.id, subCats, sub)} className="text-muted-foreground hover:text-rose-500 hover:bg-rose-500/20 rounded-full p-0.5 ml-1 transition-colors"><X className="w-3 h-3"/></button>
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground italic mb-4">No sub-categories added.</p>
                            )}
                            
                            <div className="flex gap-2">
                              <Input placeholder="Add new sub-category..." value={subCatInputs[cat.id] || ''} onChange={(e) => setSubCatInputs({...subCatInputs, [cat.id]: e.target.value})} className="text-xs h-9 bg-background border-input text-foreground focus-visible:ring-1" />
                              <Button onClick={() => handleAddSubcat(cat.id, subCats)} className="h-9 bg-foreground text-background font-black px-4 text-xs hover:bg-foreground/90"><PlusCircle className="w-4 h-4 mr-1"/> ADD</Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )})}
                  </div>
               </motion.div>
            )}

            {/* SETTINGS (🔥 GOD MODE FRONTEND THEME + STORE OP 🔥) */}
            {activeTab === 'settings' && (
               <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 max-w-3xl">
                 
                  {/* 🔥 THEME COLOR PICKER GOD MODE (FOR FRONTEND ONLY) 🔥 */}
                  <Card className="mb-8 border border-border bg-card shadow-sm">
                    <CardContent className="p-6 sm:p-8 space-y-6">
                      <div className="flex items-center gap-3 border-b border-border pb-4"><Palette className="w-6 h-6 text-foreground" /><h3 className="text-xl font-black uppercase text-foreground">Website Theme Colors</h3></div>
                      
                      <div className="flex gap-2 bg-muted p-1 rounded-xl overflow-x-auto scrollbar-hide border border-border">
                        <Button type="button" onClick={() => setActiveThemeTab('light_mode')} variant={activeThemeTab === 'light_mode' ? 'default' : 'ghost'} className={`flex-1 text-xs font-black uppercase tracking-widest h-10 ${activeThemeTab === 'light_mode' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}><Sun className="w-4 h-4 mr-2"/> Web Light Mode</Button>
                        <Button type="button" onClick={() => setActiveThemeTab('dark_mode')} variant={activeThemeTab === 'dark_mode' ? 'default' : 'ghost'} className={`flex-1 text-xs font-black uppercase tracking-widest h-10 ${activeThemeTab === 'dark_mode' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}><Moon className="w-4 h-4 mr-2"/> Web Dark Mode</Button>
                      </div>

                      <div className="pt-4 animate-in fade-in">
                        {activeThemeTab === 'light_mode' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200 text-slate-900">
                            <div className="col-span-full border-b border-slate-200 pb-2 mb-2"><h4 className="font-black uppercase tracking-widest text-sm text-slate-800">Light Mode Variables</h4></div>
                            <div className="space-y-2"><Label className="text-[10px] uppercase font-bold text-slate-500">Background Color</Label><div className="flex gap-3 items-center"><input type="color" value={themeColorData.light_background_color} onChange={(e) => setThemeColorData({...themeColorData, light_background_color: e.target.value})} className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent" /><Input value={themeColorData.light_background_color} onChange={(e) => setThemeColorData({...themeColorData, light_background_color: e.target.value})} className="font-mono uppercase bg-white border-slate-200 text-slate-900 h-10" /></div></div>
                            <div className="space-y-2"><Label className="text-[10px] uppercase font-bold text-slate-500">Main Text Color</Label><div className="flex gap-3 items-center"><input type="color" value={themeColorData.light_text_color} onChange={(e) => setThemeColorData({...themeColorData, light_text_color: e.target.value})} className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent" /><Input value={themeColorData.light_text_color} onChange={(e) => setThemeColorData({...themeColorData, light_text_color: e.target.value})} className="font-mono uppercase bg-white border-slate-200 text-slate-900 h-10" /></div></div>
                            <div className="space-y-2"><Label className="text-[10px] uppercase font-bold text-slate-500">Icons / Outlines (Primary)</Label><div className="flex gap-3 items-center"><input type="color" value={themeColorData.light_primary_color} onChange={(e) => setThemeColorData({...themeColorData, light_primary_color: e.target.value})} className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent" /><Input value={themeColorData.light_primary_color} onChange={(e) => setThemeColorData({...themeColorData, light_primary_color: e.target.value})} className="font-mono uppercase bg-white border-slate-200 text-slate-900 h-10" /></div></div>
                            <div className="space-y-2"><Label className="text-[10px] uppercase font-bold text-slate-500">Button Background (Accent)</Label><div className="flex gap-3 items-center"><input type="color" value={themeColorData.light_button_color} onChange={(e) => setThemeColorData({...themeColorData, light_button_color: e.target.value})} className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent" /><Input value={themeColorData.light_button_color} onChange={(e) => setThemeColorData({...themeColorData, light_button_color: e.target.value})} className="font-mono uppercase bg-white border-slate-200 text-slate-900 h-10" /></div></div>
                            <div className="space-y-2"><Label className="text-[10px] uppercase font-bold text-slate-500">Price (₹)</Label><div className="flex gap-3 items-center"><input type="color" value={themeColorData.light_price_color} onChange={(e) => setThemeColorData({...themeColorData, light_price_color: e.target.value})} className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent" /><Input value={themeColorData.light_price_color} onChange={(e) => setThemeColorData({...themeColorData, light_price_color: e.target.value})} className="font-mono uppercase bg-white border-slate-200 text-slate-900 h-10" /></div></div>
                            <div className="space-y-2"><Label className="text-[10px] uppercase font-bold text-slate-500">Product Titles</Label><div className="flex gap-3 items-center"><input type="color" value={themeColorData.light_title_color} onChange={(e) => setThemeColorData({...themeColorData, light_title_color: e.target.value})} className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent" /><Input value={themeColorData.light_title_color} onChange={(e) => setThemeColorData({...themeColorData, light_title_color: e.target.value})} className="font-mono uppercase bg-white border-slate-200 text-slate-900 h-10" /></div></div>
                            <div className="space-y-2"><Label className="text-[10px] uppercase font-bold text-slate-500">Badges Color</Label><div className="flex gap-3 items-center"><input type="color" value={themeColorData.light_accent_color} onChange={(e) => setThemeColorData({...themeColorData, light_accent_color: e.target.value})} className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent" /><Input value={themeColorData.light_accent_color} onChange={(e) => setThemeColorData({...themeColorData, light_accent_color: e.target.value})} className="font-mono uppercase bg-white border-slate-200 text-slate-900 h-10" /></div></div>
                            <div className="space-y-2"><Label className="text-[10px] uppercase font-bold text-slate-500">Discount / Closed Text</Label><div className="flex gap-3 items-center"><input type="color" value={themeColorData.light_discount_color} onChange={(e) => setThemeColorData({...themeColorData, light_discount_color: e.target.value})} className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent" /><Input value={themeColorData.light_discount_color} onChange={(e) => setThemeColorData({...themeColorData, light_discount_color: e.target.value})} className="font-mono uppercase bg-white border-slate-200 text-slate-900 h-10" /></div></div>
                          </div>
                        )}

                        {activeThemeTab === 'dark_mode' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#0a0a0a] p-6 rounded-xl border border-[#27272a] text-white">
                            <div className="col-span-full border-b border-[#27272a] pb-2 mb-2"><h4 className="font-black uppercase tracking-widest text-sm text-zinc-400">Dark Mode Variables</h4></div>
                            <div className="space-y-2"><Label className="text-[10px] uppercase font-bold text-zinc-500">Background Color</Label><div className="flex gap-3 items-center"><input type="color" value={themeColorData.background_color} onChange={(e) => setThemeColorData({...themeColorData, background_color: e.target.value})} className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent" /><Input value={themeColorData.background_color} onChange={(e) => setThemeColorData({...themeColorData, background_color: e.target.value})} className="font-mono uppercase bg-zinc-900 border-zinc-700 text-white h-10" /></div></div>
                            <div className="space-y-2"><Label className="text-[10px] uppercase font-bold text-zinc-500">Main Text Color</Label><div className="flex gap-3 items-center"><input type="color" value={themeColorData.text_color} onChange={(e) => setThemeColorData({...themeColorData, text_color: e.target.value})} className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent" /><Input value={themeColorData.text_color} onChange={(e) => setThemeColorData({...themeColorData, text_color: e.target.value})} className="font-mono uppercase bg-zinc-900 border-zinc-700 text-white h-10" /></div></div>
                            <div className="space-y-2"><Label className="text-[10px] uppercase font-bold text-zinc-500">Icons / Outlines (Primary)</Label><div className="flex gap-3 items-center"><input type="color" value={themeColorData.primary_color} onChange={(e) => setThemeColorData({...themeColorData, primary_color: e.target.value})} className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent" /><Input value={themeColorData.primary_color} onChange={(e) => setThemeColorData({...themeColorData, primary_color: e.target.value})} className="font-mono uppercase bg-zinc-900 border-zinc-700 text-white h-10" /></div></div>
                            <div className="space-y-2"><Label className="text-[10px] uppercase font-bold text-zinc-500">Button Background (Accent)</Label><div className="flex gap-3 items-center"><input type="color" value={themeColorData.button_color} onChange={(e) => setThemeColorData({...themeColorData, button_color: e.target.value})} className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent" /><Input value={themeColorData.button_color} onChange={(e) => setThemeColorData({...themeColorData, button_color: e.target.value})} className="font-mono uppercase bg-zinc-900 border-zinc-700 text-white h-10" /></div></div>
                            <div className="space-y-2"><Label className="text-[10px] uppercase font-bold text-zinc-500">Price (₹)</Label><div className="flex gap-3 items-center"><input type="color" value={themeColorData.price_color} onChange={(e) => setThemeColorData({...themeColorData, price_color: e.target.value})} className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent" /><Input value={themeColorData.price_color} onChange={(e) => setThemeColorData({...themeColorData, price_color: e.target.value})} className="font-mono uppercase bg-zinc-900 border-zinc-700 text-white h-10" /></div></div>
                            <div className="space-y-2"><Label className="text-[10px] uppercase font-bold text-zinc-500">Product Titles</Label><div className="flex gap-3 items-center"><input type="color" value={themeColorData.title_color} onChange={(e) => setThemeColorData({...themeColorData, title_color: e.target.value})} className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent" /><Input value={themeColorData.title_color} onChange={(e) => setThemeColorData({...themeColorData, title_color: e.target.value})} className="font-mono uppercase bg-zinc-900 border-zinc-700 text-white h-10" /></div></div>
                            <div className="space-y-2"><Label className="text-[10px] uppercase font-bold text-zinc-500">Badges Color</Label><div className="flex gap-3 items-center"><input type="color" value={themeColorData.accent_color} onChange={(e) => setThemeColorData({...themeColorData, accent_color: e.target.value})} className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent" /><Input value={themeColorData.accent_color} onChange={(e) => setThemeColorData({...themeColorData, accent_color: e.target.value})} className="font-mono uppercase bg-zinc-900 border-zinc-700 text-white h-10" /></div></div>
                            <div className="space-y-2"><Label className="text-[10px] uppercase font-bold text-zinc-500">Discount / Closed Text</Label><div className="flex gap-3 items-center"><input type="color" value={themeColorData.discount_color} onChange={(e) => setThemeColorData({...themeColorData, discount_color: e.target.value})} className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent" /><Input value={themeColorData.discount_color} onChange={(e) => setThemeColorData({...themeColorData, discount_color: e.target.value})} className="font-mono uppercase bg-zinc-900 border-zinc-700 text-white h-10" /></div></div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-end pt-4 border-t border-border">
                        <Button onClick={handleSaveTheme} disabled={isThemeSaving} className="h-12 bg-foreground text-background font-black uppercase tracking-widest px-8 rounded-full disabled:opacity-50 hover:bg-foreground/90 shadow-md">{isThemeSaving ? 'Saving...' : 'Update Web Colors'}</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-border bg-card shadow-sm mb-8">
                    <CardContent className="p-6 sm:p-8 space-y-6">
                      <div className="flex items-center gap-3 border-b border-border pb-4"><UserCircle className="w-6 h-6 text-foreground" /><h3 className="text-xl font-black uppercase text-foreground">Footer Profile (About)</h3></div>
                      <div className="flex flex-col sm:flex-row gap-8">
                        <div className="shrink-0 space-y-4 w-full sm:w-48">
                          <Label className="text-xs uppercase font-bold text-foreground flex items-center gap-2"><LinkIcon className="w-4 h-4"/> Profile Image URL</Label>
                          <p className="text-[10px] text-muted-foreground mb-2">Use an external link (ImageKit).</p>
                          <Input type="url" placeholder="https://ik.imagekit.io/..." value={settingsFormData.ownerPhoto} onChange={(e) => setSettingsFormData({...settingsFormData, ownerPhoto: e.target.value})} className="bg-background border-input text-xs focus-visible:ring-1 h-12 w-full text-foreground" />
                          {settingsFormData.ownerPhoto && (
                            <div className="relative w-20 h-20 rounded-full border-2 border-border bg-muted mt-4 overflow-hidden mx-auto sm:mx-0">
                              <img src={settingsFormData.ownerPhoto} alt="Owner" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-4">
                          <div className="space-y-2"><Label className="text-xs uppercase font-bold text-muted-foreground">Owner Name</Label><Input value={settingsFormData.ownerName} onChange={(e) => setSettingsFormData({...settingsFormData, ownerName: e.target.value})} placeholder="e.g. Vineet Kumar" className="bg-background border-input text-foreground focus-visible:ring-1" /></div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2"><Label className="text-xs uppercase font-bold text-muted-foreground">Phone Number</Label><Input value={settingsFormData.ownerPhone} onChange={(e) => setSettingsFormData({...settingsFormData, ownerPhone: e.target.value})} placeholder="+91 XXXXX" className="font-mono bg-background border-input text-foreground focus-visible:ring-1" /></div>
                            <div className="space-y-2"><Label className="text-xs uppercase font-bold text-muted-foreground">Email</Label><Input type="email" value={settingsFormData.ownerEmail} onChange={(e) => setSettingsFormData({...settingsFormData, ownerEmail: e.target.value})} placeholder="contact@webfoo.in" className="bg-background border-input text-foreground focus-visible:ring-1" /></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <form onSubmit={handleSaveSettings} className="space-y-6">
                    <Card className="border border-border bg-card shadow-sm">
                      <CardContent className="p-6 sm:p-8 space-y-6">
                        <div className="flex items-center gap-3 border-b border-border pb-4"><Settings className="w-6 h-6 text-foreground" /><h3 className="text-xl font-black uppercase text-foreground">Store Operations</h3></div>
                        <div className="space-y-4">
                          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Operating Mode</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <button type="button" onClick={() => setSettingsFormData({...settingsFormData, storeMode: 'auto'})} className={`p-4 rounded-xl border text-left transition-all ${settingsFormData.storeMode === 'auto' ? 'bg-foreground text-background shadow-sm' : 'border-border text-muted-foreground hover:bg-muted'}`}><Clock className="w-5 h-5 mb-2" /><h4 className="font-bold uppercase tracking-widest">Auto Timer</h4></button>
                            <button type="button" onClick={() => setSettingsFormData({...settingsFormData, storeMode: 'manual'})} className={`p-4 rounded-xl border text-left transition-all ${settingsFormData.storeMode === 'manual' ? 'bg-foreground text-background shadow-sm' : 'border-border text-muted-foreground hover:bg-muted'}`}><Power className="w-5 h-5 mb-2" /><h4 className="font-bold uppercase tracking-widest">Manual Override</h4></button>
                          </div>
                        </div>
                        {settingsFormData.storeMode === 'auto' ? (
                          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border">
                            <div className="space-y-2"><Label className="text-xs font-bold uppercase tracking-widest text-foreground">Opening Time</Label><Input type="time" value={settingsFormData.openTime} onChange={(e) => setSettingsFormData({...settingsFormData, openTime: e.target.value})} className="font-mono font-bold text-lg h-14 bg-background border-input text-foreground focus-visible:ring-1" /></div>
                            <div className="space-y-2"><Label className="text-xs font-bold uppercase tracking-widest text-foreground">Closing Time</Label><Input type="time" value={settingsFormData.closeTime} onChange={(e) => setSettingsFormData({...settingsFormData, closeTime: e.target.value})} className="font-mono font-bold text-lg h-14 bg-background border-input text-foreground focus-visible:ring-1" /></div>
                          </div>
                        ) : (
                          <div className="pt-4 border-t border-border space-y-4">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Manual Status Switch</Label>
                            <div className="grid grid-cols-2 gap-4">
                              <button type="button" onClick={() => setSettingsFormData({...settingsFormData, isStoreOpen: true})} className={`p-6 rounded-[1.5rem] border flex items-center gap-4 transition-all ${settingsFormData.isStoreOpen ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-border opacity-50 hover:bg-muted'}`}><Zap className={`w-10 h-10 ${settingsFormData.isStoreOpen ? 'text-emerald-500' : 'text-muted-foreground/30'}`} /><div className="flex-1"><h4 className="font-extrabold uppercase tracking-tight text-xl">Online</h4></div></button>
                              <button type="button" onClick={() => setSettingsFormData({...settingsFormData, isStoreOpen: false})} className={`p-6 rounded-[1.5rem] border flex items-center gap-4 transition-all ${!settingsFormData.isStoreOpen ? 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400' : 'border-border opacity-50 hover:bg-muted'}`}><AlertTriangle className={`w-10 h-10 ${!settingsFormData.isStoreOpen ? 'text-rose-500' : 'text-muted-foreground/30'}`} /><div className="flex-1"><h4 className="font-extrabold uppercase tracking-tight text-xl">Closed</h4></div></button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card className="border border-border bg-card shadow-sm">
                      <CardContent className="p-6 sm:p-8 space-y-6">
                        <div className="flex items-center gap-3 border-b border-border pb-4"><Zap className="w-6 h-6 text-emerald-500" /><h3 className="text-xl font-black uppercase text-foreground">Open State Banner</h3></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="space-y-2"><Label>Banner Image URL</Label><Input value={settingsFormData.bannerImageUrlOpen} onChange={e => setSettingsFormData({...settingsFormData, bannerImageUrlOpen: e.target.value})} placeholder="https://..." className="bg-background border-input text-foreground focus-visible:ring-1" /></div><div className="space-y-2"><Label>Banner Text</Label><textarea value={settingsFormData.bannerTextOpen} onChange={e => setSettingsFormData({...settingsFormData, bannerTextOpen: e.target.value})} placeholder="New deals now!" rows={3} className="w-full h-12 border border-input rounded-md p-3 text-sm resize-none bg-background text-foreground focus-visible:ring-1 focus-visible:outline-none" /></div></div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border border-border bg-card shadow-sm">
                      <CardContent className="p-6 sm:p-8 space-y-6">
                        <div className="flex items-center gap-3 border-b border-border pb-4"><MoonStar className="w-6 h-6 text-rose-500" /><h3 className="text-xl font-black uppercase text-foreground">Closed State Banner</h3></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="space-y-2"><Label>Banner Image URL</Label><Input value={settingsFormData.bannerImageUrlClosed} onChange={e => setSettingsFormData({...settingsFormData, bannerImageUrlClosed: e.target.value})} placeholder="https://..." className="bg-background border-input text-foreground focus-visible:ring-1" /></div><div className="space-y-2"><Label>Closed Line</Label><textarea value={settingsFormData.bannerTextClosed} onChange={e => setSettingsFormData({...settingsFormData, bannerTextClosed: e.target.value})} placeholder="Sleeping right now..." rows={3} className="w-full h-12 border border-input rounded-md p-3 text-sm resize-none bg-background text-foreground focus-visible:ring-1 focus-visible:outline-none" /></div></div>
                      </CardContent>
                    </Card>
                    
                    <div className="flex justify-end pt-4 border-t border-border">
                      <Button type="submit" disabled={isSettingsSaving} className="h-14 bg-foreground text-background font-black uppercase tracking-widest px-10 rounded-full hover:bg-foreground/90 shadow-md">Save Operations</Button>
                    </div>
                  </form>
               </motion.div>
            )}

            {/* OFFERS */}
            {activeTab === 'offers' && (
              <motion.div key="offers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <Card className="transition-all mb-6 border border-border bg-card shadow-sm">
                  <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
                    <div><h3 className="text-lg font-black uppercase flex items-center gap-2 text-foreground"><LockKeyhole className="w-5 h-5"/> Global Minimum Order</h3><p className="text-xs mt-1 text-muted-foreground">Set the strict minimum cart value required to checkout.</p></div>
                    <div className="flex gap-2 w-full sm:w-auto"><Input type="number" value={globalMinOrder} onChange={e => setGlobalMinOrder(Number(e.target.value))} className="w-full sm:w-32 text-center font-mono font-black text-lg bg-background border-input text-foreground focus-visible:ring-1" /><Button onClick={handleSaveGlobalMinOrder} className="bg-foreground text-background font-black px-6 uppercase hover:bg-foreground/90 shadow-sm">Save</Button></div>
                  </CardContent>
                </Card>

                <div className="flex justify-between items-center gap-4 pt-4 border-t border-border">
                  <div><h3 className="text-lg font-black uppercase flex items-center gap-2 text-foreground"><Truck className="w-5 h-5"/> Delivery Areas & Fees</h3></div>
                  <Sheet>
                    <SheetTrigger asChild><Button className="bg-foreground text-background font-black h-12 rounded-xl px-6 hover:bg-foreground/90 shadow-sm"><Plus className="w-5 h-5 mr-2" /> NEW AREA</Button></SheetTrigger>
                    <SheetContent className="border-l border-border sm:max-w-md w-full overflow-y-auto bg-background text-foreground shadow-2xl">
                      <SheetHeader className="text-left mb-8 mt-6"><SheetTitle className="text-3xl font-black italic uppercase text-foreground">Add Delivery Area</SheetTitle></SheetHeader>
                      <form onSubmit={(e: any) => { e.preventDefault(); const data = new FormData(e.target); addDeliveryZone({ areaName: data.get('areaName')?.toString().toUpperCase() || '', fee: Number(data.get('fee')), isActive: true }); e.target.reset(); }} className="flex flex-col gap-6">
                        <div className="space-y-2"><Label>Area Name</Label><Input name="areaName" required className="uppercase font-mono bg-background border-input text-foreground focus-visible:ring-1" /></div>
                        <div className="space-y-2"><Label>Delivery Fee (₹)</Label><Input name="fee" type="number" required min="0" className="bg-background border-input text-foreground focus-visible:ring-1" /></div>
                        <Button type="submit" className="w-full h-14 bg-foreground text-background font-black hover:bg-foreground/90">SAVE AREA</Button>
                      </form>
                    </SheetContent>
                  </Sheet>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                  {(!deliveryZones || deliveryZones.length === 0) ? (
                    <div className="col-span-full py-10 text-center text-muted-foreground"><Truck className="w-12 h-12 mx-auto mb-4 opacity-50" /><p className="font-black uppercase tracking-widest text-xl">No Delivery Zones</p></div>
                  ) : (
                    deliveryZones.map((zone: any) => (
                      <Card key={zone.id} className={`transition-all border border-border bg-card shadow-sm ${!zone.isActive ? 'opacity-50 grayscale' : 'hover:border-foreground/30 hover:shadow-md'}`}>
                        <CardContent className="p-5">
                          <div className="flex justify-between items-start mb-4">
                            <p className="text-xl font-black font-mono tracking-widest text-foreground">{zone.areaName}</p>
                            <Badge variant={zone.isActive ? "outline" : "secondary"} className={`text-[10px] font-black uppercase tracking-widest ${zone.isActive ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30' : 'text-muted-foreground border-border'}`}>{zone.isActive ? 'ACTIVE' : 'OFF'}</Badge>
                          </div>
                          
                          {editingZoneId === zone.id ? (
                            <div className="flex items-center gap-2 mb-6">
                              <Input type="number" value={editingZoneFee} onChange={(e) => setEditingZoneFee(e.target.value)} className="w-20 h-8 font-mono px-2 bg-background border-input text-foreground focus-visible:ring-1" />
                              <Button onClick={() => handleUpdateZoneFee(zone)} size="sm" className="h-8 bg-foreground text-background font-black px-3 text-[10px] hover:bg-foreground/90">SAVE</Button>
                              <Button onClick={() => setEditingZoneId(null)} size="sm" variant="ghost" className="h-8 px-2 hover:bg-muted text-foreground"><X className="w-4 h-4" /></Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 mb-6">
                              <p className="font-bold text-sm text-muted-foreground">Delivery Fee: <span className="font-mono text-foreground">₹{zone.fee}</span></p>
                              <button onClick={() => { setEditingZoneId(zone.id); setEditingZoneFee(String(zone.fee)); }} className="hover:opacity-80 transition-colors text-foreground" title="Edit Fee"><Edit className="w-4 h-4" /></button>
                            </div>
                          )}

                          <div className="flex gap-2 pt-4 border-t border-border">
                            <Button variant="ghost" className={`flex-1 text-xs font-black border ${zone.isActive ? 'hover:bg-muted border-border text-foreground' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500 hover:text-white'}`} onClick={() => toggleDeliveryZoneStatus(zone.id)}>{zone.isActive ? 'TURN OFF' : 'ACTIVATE'}</Button>
                            <Button variant="ghost" size="icon" className="border border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white" onClick={() => { if(confirm("Delete?")) deleteDeliveryZone(zone.id) }}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                <div className="flex justify-between items-center gap-4 pt-8 border-t border-border">
                  <div><p className="font-mono text-muted-foreground">Manage discount coupons.</p></div>
                  <Sheet>
                    <SheetTrigger asChild><Button className="bg-foreground text-background font-black h-12 rounded-xl px-6 hover:bg-foreground/90 shadow-sm"><Plus className="w-5 h-5 mr-2" /> NEW OFFER</Button></SheetTrigger>
                    <SheetContent className="border-l border-border sm:max-w-md w-full overflow-y-auto bg-background text-foreground shadow-2xl">
                      <SheetHeader className="text-left mb-8 mt-6"><SheetTitle className="text-3xl font-black italic uppercase text-foreground">Create Coupon</SheetTitle></SheetHeader>
                      <form onSubmit={(e: any) => { e.preventDefault(); const data = new FormData(e.target); addPromoCode({ code: data.get('code')?.toString().toUpperCase() || '', type: data.get('type') as any, value: Number(data.get('value')), minOrder: Number(data.get('minOrder')), isActive: true }); e.target.reset(); }} className="flex flex-col gap-6">
                        <div className="space-y-2"><Label>Coupon Code</Label><Input name="code" required className="uppercase font-mono bg-background border-input text-foreground focus-visible:ring-1" /></div>
                        <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Discount Type</Label><select name="type" className="w-full h-10 border rounded-md px-3 text-sm focus:outline-none bg-background border-input text-foreground focus:ring-1 focus:ring-ring"><option value="flat">Flat Amount (₹)</option><option value="percent">Percentage (%)</option></select></div><div className="space-y-2"><Label>Value</Label><Input name="value" type="number" required min="1" className="bg-background border-input text-foreground focus-visible:ring-1" /></div></div>
                        <div className="space-y-2"><Label>Min Order (₹)</Label><Input name="minOrder" type="number" required min="0" className="bg-background border-input text-foreground focus-visible:ring-1" /></div>
                        <Button type="submit" className="w-full h-14 bg-foreground text-background font-black hover:bg-foreground/90">SAVE OFFER</Button>
                      </form>
                    </SheetContent>
                  </Sheet>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                  {(!promoCodes || promoCodes.length === 0) ? (
                    <div className="col-span-full py-20 text-center text-muted-foreground"><Tag className="w-12 h-12 mx-auto mb-4 opacity-50" /><p className="font-black uppercase tracking-widest text-xl">No Active Offers</p></div>
                  ) : (
                    promoCodes.map((promo: any) => (
                      <Card key={promo.id} className={`transition-all border border-border bg-card shadow-sm ${!promo.isActive ? 'opacity-50 grayscale' : 'hover:border-foreground/30 hover:shadow-md'}`}>
                        <CardContent className="p-5">
                          <div className="flex justify-between items-start mb-4"><div className="flex items-center gap-2"><p className="text-xl font-black font-mono tracking-widest text-foreground">{promo.code}</p></div><Badge variant={promo.isActive ? "outline" : "secondary"} className={`text-[10px] font-black uppercase tracking-widest ${promo.isActive ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30' : 'text-muted-foreground border-border'}`}>{promo.isActive ? 'ACTIVE' : 'OFF'}</Badge></div>
                          <div className="space-y-1 mb-6"><p className="font-bold text-sm text-foreground">{promo.type === 'flat' ? `₹${promo.value} Flat Off` : `${promo.value}% Instant Discount`}</p><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Valid on orders above ₹{promo.minOrder}</p></div>
                          <div className="flex gap-2 pt-4 border-t border-border"><Button variant="ghost" className={`flex-1 text-xs font-black border ${promo.isActive ? 'hover:bg-muted border-border text-foreground' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500 hover:text-white'}`} onClick={() => togglePromoStatus(promo.id)}>{promo.isActive ? 'TURN OFF' : 'ACTIVATE'}</Button><Button variant="ghost" size="icon" className="border border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white" onClick={() => { if(confirm("Delete?")) deletePromo(promo.id) }}><Trash2 className="w-4 h-4" /></Button></div>
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
                <Card className="lg:col-span-1 h-fit border border-border bg-card shadow-sm"><CardContent className="p-6 space-y-6"><div><h3 className="text-xl font-black uppercase tracking-tight mb-2 flex items-center gap-2 text-foreground"><MessageSquare className="w-5 h-5 text-foreground"/> Broadcast Center</h3></div><div className="space-y-3"><Label className="text-xs uppercase tracking-widest text-foreground">Message Content</Label><textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} className="w-full border border-input rounded-xl p-4 min-h-[200px] text-sm resize-none bg-background text-foreground focus-visible:ring-1 focus-visible:outline-none" /><div className="flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground"><span>{messageText.length} chars</span><span>{selectedCustomers.length} selected</span></div></div><div className="flex flex-col gap-3"><Button onClick={handleSendToApp} disabled={selectedCustomers.length === 0 || !messageText.trim()} className="w-full h-12 bg-foreground text-background font-black hover:bg-foreground/90 disabled:opacity-50 shadow-sm"><Smartphone className="w-4 h-4 mr-2" /> PUSH TO APP</Button><Button onClick={handleSendToWhatsApp} disabled={selectedCustomers.length === 0 || !messageText.trim()} className="w-full h-12 bg-[#25D366] text-white font-black hover:bg-[#25D366]/90 disabled:opacity-50 shadow-sm"><MessageCircle className="w-4 h-4 mr-2" /> PUSH TO WHATSAPP</Button></div></CardContent></Card>
                <Card className="lg:col-span-2 border border-border bg-card shadow-sm">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-center border-b border-border pb-4"><h3 className="text-sm font-black uppercase tracking-widest text-foreground">Select Recipients</h3><button onClick={handleSelectAll} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">{selectedCustomers.length === customersList.length && customersList.length > 0 ? <CheckSquare className="w-4 h-4 text-foreground" /> : <Square className="w-4 h-4" />} {selectedCustomers.length === customersList.length && customersList.length > 0 ? 'Deselect All' : 'Select All'}</button></div>
                    {customersList.length === 0 ? (
                      <Empty className="py-12 border-none"><EmptyContent><Users className="w-12 h-12 text-muted-foreground mb-4 opacity-50" /><EmptyTitle className="text-lg uppercase text-foreground">No customers</EmptyTitle></EmptyContent></Empty>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                        {customersList.map((cust: any) => {
                          const isSelected = selectedCustomers.includes(cust.phone); const isVip = customerMeta[cust.phone]?.isVip;
                          return (
                            <div key={cust.phone} onClick={() => handleSelectCustomer(cust.phone)} className={`p-3 rounded-xl border cursor-pointer flex items-center gap-4 transition-all ${isSelected ? 'bg-muted border-foreground shadow-sm' : 'bg-background border-border hover:border-foreground/30'}`}><div className={`shrink-0 transition-colors ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>{isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}</div><div className="flex-1 overflow-hidden"><div className="flex items-center gap-2"><p className={`font-bold uppercase truncate ${isSelected ? 'text-foreground' : 'text-foreground/80'}`}>{cust.name}</p>{isVip && <Star className="w-3 h-3 text-amber-500 shrink-0" />}</div><p className="text-xs font-mono mt-0.5 text-muted-foreground">{cust.phone}</p></div></div>
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
    </div>
  )
}
