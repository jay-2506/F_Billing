import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../services/api'

export default function Login({ setUser }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await api.post('/auth/login', { email, password })
      localStorage.setItem('user', JSON.stringify(response.data))
      setUser(response.data)
      toast.success('Login successful!')
      navigate('/')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side: Premium Branding */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src={`/login_background_1776337526167.png`}
          alt="Abstract Background"
        />
        <div className="absolute inset-0 bg-indigo-900/20 backdrop-blur-[2px]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white">
          <div className="max-w-md space-y-4">
            <h1 className="text-6xl font-black tracking-tighter">BillEase.</h1>
            <p className="text-xl font-medium text-indigo-50">
              The modern standard for professional billing and financial management.
            </p>
          </div>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Sign in</h2>
            <p className="text-sm text-slate-500">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          <div className="mt-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold leading-6 text-slate-900">
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-xl border-0 py-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-4 outline-none transition-all"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-semibold leading-6 text-slate-900">
                    Password
                  </label>
                </div>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-xl border-0 py-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-4 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold leading-6 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 transition-all hover:-translate-y-0.5"
                >
                  {loading ? 'Authenticating...' : 'Sign in to account'}
                </button>
              </div>
            </form>

            <p className="mt-10 text-center text-sm text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold leading-6 text-indigo-600 hover:text-indigo-500 transition-colors">
                Create one for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
