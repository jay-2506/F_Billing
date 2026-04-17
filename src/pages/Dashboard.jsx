import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  UsersIcon, 
  ShoppingBagIcon, 
  DocumentDuplicateIcon,
  PlusCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import api from '../services/api'

export default function Dashboard() {
  const [invoices, setInvoices] = useState([])
  const [stats, setStats] = useState({
    invoices: 0
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [customers, products, invoicesRes] = await Promise.all([
          api.get('/customers'),
          api.get('/products'),
          api.get('/invoices')
        ])

        setStats({
          customers: customers.data.length,
          products: products.data.length,
          invoices: invoicesRes.data.length
        })
      } catch (error) {
        console.error('Error fetching stats', error)
      }
    }

    fetchStats()
  }, [])

  const cards = [
    { name: 'Total Customers', value: stats.customers, icon: UsersIcon, color: 'from-indigo-500 to-blue-600', shadow: 'shadow-blue-200' },
    { name: 'Total Products', value: stats.products, icon: ShoppingBagIcon, color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-200' },
    { name: 'Total Invoices', value: stats.invoices, icon: DocumentDuplicateIcon, color: 'from-violet-500 to-fuchsia-600', shadow: 'shadow-indigo-200' },
  ]


  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Insights.</h1>
          <p className="mt-1 text-sm text-slate-500 font-medium tracking-tight">Real-time overview of your business performance.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.name} className="relative overflow-hidden rounded-[2rem] bg-white p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-6">
              <div className={`rounded-2xl bg-gradient-to-br ${card.color} p-4 ${card.shadow} shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-green-500 bg-green-50 px-2 py-0.5 rounded-full mb-1">+12%</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">vs last month</span>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{card.name}</p>
              <div className="text-3xl font-black text-slate-900 mt-2 tracking-tight">{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Activity Section */}
        <div className="lg:col-span-3 space-y-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight px-2">Recent Bills</h2>
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-8">
               {invoices.length > 0 ? (
                 invoices.slice(0, 5).map((inv, i) => (
                    <div key={inv._id} className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 -mx-4 px-4 py-2 rounded-2xl transition-all">
                       <div className="flex items-center gap-4">
                          <div className={`h-12 w-12 rounded-2xl ${i % 2 === 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'} flex items-center justify-center font-black text-xs transition-transform group-hover:scale-110`}>
                             INV
                          </div>
                          <div>
                             <p className="text-sm font-black text-slate-900">#{inv.invoiceNumber}</p>
                             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter truncate max-w-[100px]">{inv.customerId?.name || 'Customer'}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-sm font-black text-slate-900">₹{inv.totalAmount.toFixed(2)}</p>
                          <div className="flex items-center justify-end gap-1 mt-0.5">
                             <ClockIcon className="h-3 w-3 text-slate-300" />
                             <span className="text-[8px] font-bold text-slate-400 uppercase">{new Date(inv.date).toLocaleDateString()}</span>
                          </div>
                       </div>
                    </div>
                 ))
               ) : (
                 <div className="text-center py-20">
                    <div className="inline-flex p-4 bg-slate-50 rounded-full mb-4">
                       <DocumentDuplicateIcon className="h-8 w-8 text-slate-200" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No activity reported</p>
                 </div>
               )}
               <Link to="/invoices" className="flex items-center justify-center gap-2 text-[10px] font-black text-indigo-600 hover:text-indigo-700 pt-4 border-t border-slate-50 uppercase tracking-widest transition-all hover:gap-3">
                  Check History &rarr;
               </Link>
            </div>
        </div>
      </div>

      {/* Floating CTA Banner */}
      <div className="bg-indigo-600 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-100 mt-16 group">
         <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="max-w-xl text-center lg:text-left">
               <h3 className="text-4xl font-black tracking-tight leading-none mb-4">Ready to bill?</h3>
               <p className="text-indigo-100 text-lg font-medium opacity-80 leading-relaxed">
                  Start creating professional GST-compliant invoices in seconds. Our smart automation handles the taxes while you focus on growth.
               </p>
            </div>
            <Link
              to="/invoices/create"
              className="px-10 py-5 bg-white text-indigo-600 rounded-[1.5rem] font-black text-sm hover:shadow-2xl transition-all flex items-center gap-3 shadow-xl active:scale-95 whitespace-nowrap"
            >
              <PlusCircleIcon className="h-6 w-6" />
              CREATE NEW INVOICE
            </Link>
         </div>
         {/* Abstract Glass Decor */}
         <div className="absolute top-[-50%] right-[-10%] h-[200%] w-1/2 bg-white/5 skew-x-[-20deg] group-hover:translate-x-10 transition-transform duration-1000"></div>
         <div className="absolute bottom-[-20%] left-[-5%] h-64 w-64 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
      </div>
    </div>
  )
}
