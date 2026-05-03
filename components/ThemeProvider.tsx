'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [cssVars, setCssVars] = React.useState('')

  React.useEffect(() => {
    async function loadDynamicTheme() {
      if (!supabaseUrl || !supabaseKey) return;
      try {
        const { data, error } = await supabase.from('theme_settings').select('*').eq('id', 1).single()
        
        if (data && !error) {
          // 🔥 MAGIC HAPPPENS HERE: Light aur Dark dono mode ke variables inject ho rahe hain 🔥
          const styleString = `
            :root {
              --theme-bg: ${data.light_background_color || '#ffffff'};
              --theme-text: ${data.light_text_color || '#000000'};
              --theme-primary: ${data.light_primary_color || '#008b8b'};
              --theme-button: ${data.light_button_color || '#99cc00'};
              --theme-price: ${data.light_price_color || '#008b8b'};
              --theme-title: ${data.light_title_color || '#111111'};
              --theme-accent: ${data.light_accent_color || '#99cc00'};
              --theme-discount: ${data.light_discount_color || '#e11d48'};
            }
            .dark {
              --theme-bg: ${data.background_color || '#050505'};
              --theme-text: ${data.text_color || '#ffffff'};
              --theme-primary: ${data.primary_color || '#00FFFF'};
              --theme-button: ${data.button_color || '#CCFF00'};
              --theme-price: ${data.price_color || '#00FFFF'};
              --theme-title: ${data.title_color || '#ffffff'};
              --theme-accent: ${data.accent_color || '#CCFF00'};
              --theme-discount: ${data.discount_color || '#FF0055'};
            }
          `;
          setCssVars(styleString)
        }
      } catch (err) {
        console.error("Theme load error:", err);
      }
    }
    loadDynamicTheme()
  }, [])

  return (
    <NextThemesProvider {...props}>
      {cssVars && <style dangerouslySetInnerHTML={{ __html: cssVars }} />}
      {children}
    </NextThemesProvider>
  )
}
