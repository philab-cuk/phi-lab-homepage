import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'

import { LanguageProvider } from './i18n/LanguageContext.jsx'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Members from './pages/Members.jsx'
import Professor from './pages/Professor.jsx'
import Research from './pages/Research.jsx'
import Publications from './pages/Publications.jsx'
import Lectures from './pages/Lectures.jsx'
import NotFound from './pages/NotFound.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'professor', element: <Professor /> },
      { path: 'publications', element: <Publications /> },
      { path: 'lectures', element: <Lectures /> },
      { path: 'research', element: <Research /> },
      { path: 'about', element: <About /> },
      { path: 'members', element: <Members /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <RouterProvider router={router} />
    </LanguageProvider>
  </StrictMode>,
)
