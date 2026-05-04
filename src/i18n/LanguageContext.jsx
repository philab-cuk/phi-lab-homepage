import { createContext, useContext, useState } from 'react'
import strings from './strings.js'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en')

  const toggle = (newLang) => {
    if (newLang === 'en' || newLang === 'ko') setLang(newLang)
  }

  return (
    <LanguageContext.Provider value={{ lang, toggle, t: strings[lang] }}>
      {children}
    </LanguageContext.Provider>
  )
}

/** Returns { lang, toggle, t } where t is the full translated string object. */
export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>')
  return ctx
}
