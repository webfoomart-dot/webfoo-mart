'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'
import { createClient } from '@supabase/supabase-js'

// Supabase Connection (Apni Keys Yahan Ensure Karna)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  
  React.useEffect(() => {
    async function loadDynamicTheme() {
      if (!supabaseUrl || !supabaseKey) return;
      
      try {
        const { data, error } = await supabase.from('theme_settings').select('*').eq('id', 1).single()
        
        if (data && !error) {
          const root = document.documentElement;
          
          // Puraane Base Colors
          if (data.primary_color) root.style.setProperty('--theme-primary', data.primary_color);
          if (data.background_color) root.style.setProperty('--theme-bg', data.background_color);
          if (data.text_color) root.style.setProperty('--theme-text', data.text_color);
          if (data.button_color) root.style.setProperty('--theme-button', data.button_color);
          
          // 🔥 Naye Custom Colors (Jo tune abhi add kiye)
          if (data.price_color) root.style.setProperty('--theme-price', data.price_color);
          if (data.title_color) root.style.setProperty('--theme-title', data.title_color);
          if (data.accent_color) root.style.setProperty('--theme-accent', data.accent_color);
          if (data.discount_color) root.style.setProperty('--theme-discount', data.discount_color);
        }
      } catch (err) {
        console.error("Theme load error:", err);
      }
    }

    loadDynamicTheme()
  }, [])

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
