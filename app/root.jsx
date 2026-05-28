import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'
import { AuthProvider } from './contexts/AuthContext'
import './index.css'

export const links = () => {
  const fav = import.meta.env.BASE_URL + 'favicon.png'
  return [
    { rel: 'icon', type: 'image/png', href: fav },
    { rel: 'apple-touch-icon', href: fav },
  ]
}

export function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}
