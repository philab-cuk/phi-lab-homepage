import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'

import { AuthProvider } from './contexts/AuthContext.jsx'

import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Members from './pages/Members.jsx'
import Professor from './pages/Professor.jsx'
import Research from './pages/Research.jsx'
import Publications from './pages/Publications.jsx'
import Lectures from './pages/Lectures.jsx'
import NotFound from './pages/NotFound.jsx'

import AdminLayout from './components/AdminLayout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminLogin from './pages/admin/AdminLogin.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminUsers from './pages/admin/AdminUsers.jsx'
import AdminMembers from './pages/admin/AdminMembers.jsx'
import AdminPublications from './pages/admin/AdminPublications.jsx'
import AdminResearch from './pages/admin/AdminResearch.jsx'
import AdminLectures from './pages/admin/AdminLectures.jsx'
import AdminNews from './pages/admin/AdminNews.jsx'
import AdminPosts from './pages/admin/AdminPosts.jsx'

// vite base 와 라우터 basename 을 일치시킴 ('/phi-lab-homepage/' → '/phi-lab-homepage', '/' → '/')
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

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
  { path: '/admin/login', element: <AdminLogin /> },
  {
    path: '/admin',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: 'news', element: <AdminNews /> },
          { path: 'posts', element: <AdminPosts /> },
          {
            element: <ProtectedRoute requireEditor />,
            children: [
              { path: 'users', element: <AdminUsers /> },
              { path: 'members', element: <AdminMembers /> },
              { path: 'publications', element: <AdminPublications /> },
              { path: 'research', element: <AdminResearch /> },
              { path: 'lectures', element: <AdminLectures /> },
            ],
          },
        ],
      },
    ],
  },
], { basename })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
