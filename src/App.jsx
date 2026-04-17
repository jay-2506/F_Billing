import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Products from './pages/Products'
import Invoices from './pages/Invoices'
import CreateInvoice from './pages/CreateInvoice'
import Layout from './components/Layout'

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')))

  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/register" />
    }
    return children
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login setUser={setUser} />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout user={user} setUser={setUser} />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="customers" element={<Customers />} />
        <Route path="products" element={<Products />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="invoices/create" element={<CreateInvoice />} />
      </Route>
    </Routes>
  )
}

export default App
