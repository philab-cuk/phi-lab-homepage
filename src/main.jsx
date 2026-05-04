import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'

import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Members from './pages/Members.jsx'
import Research from './pages/Research.jsx'
import Publications from './pages/Publications.jsx'
import News from './pages/News.jsx'
import Lectures from './pages/Lectures.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'members', element: <Members /> },
      { path: 'research', element: <Research /> },
      { path: 'publications', element: <Publications /> },
      { path: 'news', element: <News /> },
      { path: 'lectures', element: <Lectures /> },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
