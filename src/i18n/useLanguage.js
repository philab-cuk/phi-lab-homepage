import { useContext } from 'react'
import { LanguageContext } from './LanguageContextValue.js'

/** Returns { lang, toggle, t } where t is the full translated string object. */
export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>')
  return ctx
}
