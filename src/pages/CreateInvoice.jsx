import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import api from '../services/api'

export default function CreateInvoice() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [invoiceItems, setInvoiceItems] = useState([
    { productId: '', quantity: 1, price: 0, total: 0, isManual: false, name: '', hsnCode: '' }
  ])
  const [isGST, setIsGST] = useState(true)
  const [totals, setTotals] = useState({
    subtotal: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    totalAmount: 0
  })

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    calculateTotals()
  }, [invoiceItems, isGST])

  const fetchInitialData = async () => {
    try {
      const [customersRes, productsRes] = await Promise.all([
        api.get('/customers'),
        api.get('/products')
      ])
      setCustomers(customersRes.data)
      setProducts(productsRes.data)
    } catch (error) {
      toast.error('Failed to load customers or products')
    }
  }

  const handleAddItem = () => {
    setInvoiceItems([...invoiceItems, { productId: '', quantity: 1, price: 0, total: 0, isManual: false, name: '', hsnCode: '' }])
  }

  const handleRemoveItem = (index) => {
    const newItems = invoiceItems.filter((_, i) => i !== index)
    setInvoiceItems(newItems)
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...invoiceItems]
    
    if (field === 'isManual') {
      newItems[index].isManual = value
      newItems[index].productId = ''
      newItems[index].name = ''
      newItems[index].price = 0
      newItems[index].hsnCode = ''
      newItems[index].total = 0
    } else {
      newItems[index][field] = value

      if (field === 'productId') {
        const product = products.find(p => p._id === value)
        if (product) {
          newItems[index].name = product.name
          newItems[index].price = product.price
          newItems[index].hsnCode = product.hsnCode
          newItems[index].gstPercentage = product.gstPercentage
        }
      }
      
      // Update totals if price or quantity changed
      const price = parseFloat(newItems[index].price) || 0
      const quantityStr = newItems[index].quantity
      const quantity = (quantityStr === '' || isNaN(parseInt(quantityStr))) ? 1 : parseInt(quantityStr)
      newItems[index].total = price * (quantity || 1)
    }
    
    setInvoiceItems(newItems)
  }

  const calculateTotals = () => {
    let subtotal = 0
    let cgstAmount = 0
    let sgstAmount = 0

    invoiceItems.forEach(item => {
      subtotal += item.total
      if (isGST) {
        const gstPercentage = item.gstPercentage || 18; // Default to 18 if not found
        const itemGst = (item.total * gstPercentage) / 100
        cgstAmount += itemGst / 2
        sgstAmount += itemGst / 2
      }
    })

    setTotals({
      subtotal,
      cgstAmount,
      sgstAmount,
      totalAmount: subtotal + cgstAmount + sgstAmount
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedCustomer) {
      toast.error('Please select a customer')
      return
    }
    if (invoiceItems.some(item => !item.isManual && !item.productId)) {
      toast.error('Please select products for all automatic items')
      return
    }
    if (invoiceItems.some(item => item.isManual && !item.name)) {
      toast.error('Please enter descriptions for all manual items')
      return
    }

    try {
      const response = await api.post('/invoices', {
        customerId: selectedCustomer,
        items: invoiceItems.map(item => ({
          productId: item.productId || null,
          name: item.name,
          price: parseFloat(item.price),
          hsnCode: item.hsnCode,
          quantity: (item.quantity === '' || isNaN(parseInt(item.quantity))) ? 1 : parseInt(item.quantity)
        })),
        isGST
      })
      
      const createdInvoice = response.data;
      toast.success('Invoice created successfully! Starting download...')

      // Automatically trigger Excel download
      try {
        const excelResponse = await api.get(`/invoices/excel/${createdInvoice._id}`, {
          responseType: 'blob'
        })
        const url = window.URL.createObjectURL(new Blob([excelResponse.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `invoice-${createdInvoice.invoiceNumber}.xlsx`)
        document.body.appendChild(link)
        link.click()
        link.remove()
      } catch (excelError) {
        console.error('Auto-download failed', excelError)
        toast.warning('Invoice created but Excel download failed. You can download it from the Invoices list.')
      }

      navigate('/invoices')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create invoice')
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create Invoice</h1>
          <p className="mt-2 text-sm text-slate-600">Fill in the details below to generate a new billing document.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Area */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/60 backdrop-blur-md p-8 rounded-3xl shadow-sm border border-white/20 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Customer Selection</label>
                  <select
                    required
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                    className="block w-full rounded-2xl border-0 py-3 px-4 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white/50 transition-all duration-200 outline-none"
                  >
                    <option value="">Choose a customer</option>
                    {customers.map(c => (
                      <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center pt-8 px-2">
                   <label className="relative inline-flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isGST}
                      onChange={(e) => setIsGST(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    <span className="ml-3 text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">Tax Invoice (Enable GST)</span>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-lg font-bold text-slate-900">Invoice Items</h3>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="inline-flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4" /> Add Item
                  </button>
                </div>

                <div className="space-y-4">
                  {invoiceItems.map((item, index) => (
                    <div key={index} className="relative p-6 rounded-3xl bg-slate-50/50 border border-slate-100 space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                              {index + 1}
                            </span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={item.isManual}
                                onChange={(e) => handleItemChange(index, 'isManual', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                              <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Manual Entry</span>
                            </label>
                         </div>
                         {invoiceItems.length > 1 && (
                            <button
                                type="button"
                                onClick={() => handleRemoveItem(index)}
                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>
                         )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-4 space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">
                            {item.isManual ? 'Manual Description' : 'Product Selection'}
                          </label>
                          {item.isManual ? (
                            <input
                              type="text"
                              required
                              placeholder="Enter manual description..."
                              value={item.name}
                              onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                              className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white outline-none"
                            />
                          ) : (
                            <select
                              required
                              value={item.productId}
                              onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                              className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white outline-none"
                            >
                              <option value="">Select Product...</option>
                              {products.map(p => (
                                <option key={p._id} value={p._id}>{p.name}</option>
                              ))}
                            </select>
                          )}
                        </div>

                        <div className="md:col-span-2 space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">HSN Code</label>
                          <input
                            type="text"
                            placeholder="Optional"
                            value={item.hsnCode}
                            readOnly={!item.isManual}
                            onChange={(e) => handleItemChange(index, 'hsnCode', e.target.value)}
                            className={`block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm outline-none transition-colors ${!item.isManual ? 'bg-slate-100/50 cursor-not-allowed' : 'bg-white'}`}
                          />
                        </div>

                        <div className="md:col-span-2 space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Quantity</label>
                          <input
                            type="number"
                            placeholder="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white outline-none"
                          />
                        </div>

                        <div className="md:col-span-2 space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Rate</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={item.price}
                            readOnly={!item.isManual}
                            onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                            className={`block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm outline-none transition-colors ${!item.isManual ? 'bg-slate-100/50 cursor-not-allowed' : 'bg-white'}`}
                          />
                        </div>

                        <div className="md:col-span-2 space-y-1">
                           <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Subtotal</label>
                           <div className="py-2.5 px-3 rounded-xl bg-indigo-50 text-indigo-700 text-sm font-bold border border-indigo-100">
                             ₹{item.total.toFixed(2)}
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar / Summary Area */}
          <div className="space-y-6">
            <div className="bg-slate-900 p-8 rounded-3xl shadow-xl space-y-6 text-white sticky top-24">
              <h3 className="text-xl font-bold border-b border-slate-800 pb-4">Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between text-slate-400">
                  <span className="text-sm">Subtotal</span>
                  <span className="font-mono text-sm">₹{totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span className="text-sm">CGST (9%)</span>
                  <span className="font-mono text-sm">₹{totals.cgstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span className="text-sm">SGST (9%)</span>
                  <span className="font-mono text-sm">₹{totals.sgstAmount.toFixed(2)}</span>
                </div>
                <div className="pt-4 border-t border-slate-800 flex justify-between">
                  <span className="text-lg font-bold">Total Amount</span>
                  <span className="text-2xl font-bold text-indigo-400">₹{totals.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-900/20 transition-all duration-200 hover:-translate-y-1"
                >
                  Generate & Download
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/invoices')}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-4 rounded-2xl transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
