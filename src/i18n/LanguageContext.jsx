import { useState } from 'react'
import strings from './strings.js'
import { LanguageContext } from './LanguageContextValue.js'

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
