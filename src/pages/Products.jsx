import { useState, useEffect, Fragment } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel, DialogTitle } from '@headlessui/react'
import { toast } from 'react-toastify'
import { PlusIcon, PencilSquareIcon, TrashIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import api from '../services/api'
import ConfirmModal from '../components/ConfirmModal'

export default function Products() {
  const [products, setProducts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    hsnCode: '',
    price: '',
    gstPercentage: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.hsnCode && product.hsnCode.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await api.get('/products')
      setProducts(response.data)
    } catch (error) {
      toast.error('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const dataToSubmit = {
        ...formData,
        price: parseFloat(formData.price),
        gstPercentage: parseFloat(formData.gstPercentage)
      }
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, dataToSubmit)
        toast.success('Product updated successfully')
      } else {
        await api.post('/products', dataToSubmit)
        toast.success('Product added successfully')
      }
      closeModal()
      fetchProducts()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed')
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingProduct(null)
    setFormData({ name: '', hsnCode: '', price: '', gstPercentage: 0 })
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      hsnCode: product.hsnCode || '',
      price: product.price.toString(),
      gstPercentage: product.gstPercentage
    })
    setShowModal(true)
  }

  const handleDeleteClick = (product) => {
    setProductToDelete(product)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!productToDelete) return
    try {
      await api.delete(`/products/${productToDelete._id}`)
      toast.success('Product deleted successfully')
      fetchProducts()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete product')
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="sm:flex sm:items-center sm:justify-between bg-white/60 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/20">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Products</h1>
          <p className="mt-2 text-sm text-slate-600">
            Maintain your product catalog with accurate pricing and HSN details.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => {
              setEditingProduct(null);
              setFormData({ name: '', hsnCode: '', price: '', gstPercentage: 0 });
              setShowModal(true);
            }}
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-500 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            Add Product
          </button>
        </div>
      </div>

      <div className="w-full max-w-md">
        <div className="relative group">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
             <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-2xl border-0 py-3 pl-11 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all duration-200 bg-white/50 backdrop-blur-sm shadow-sm"
            placeholder="Search by product name or HSN..."
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flow-root overflow-hidden bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-slate-100">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="py-4 pl-4 pr-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 sm:pl-6">Name</th>
                  <th className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">HSN Code</th>
                  <th className="px-3 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Price</th>
                  <th className="px-3 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">GST (%)</th>
                  <th className="relative py-4 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-transparent text-slate-700">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-5 pl-4 pr-3 sm:pl-6"><div className="h-4 bg-slate-100 rounded-md w-32"></div></td>
                      <td className="px-3 py-5"><div className="h-4 bg-slate-100 rounded-md w-16"></div></td>
                      <td className="px-3 py-5 text-right"><div className="h-4 bg-slate-100 rounded-md w-12 ml-auto"></div></td>
                      <td className="px-3 py-5 text-right"><div className="h-4 bg-slate-100 rounded-md w-10 ml-auto"></div></td>
                      <td className="px-3 py-5"></td>
                    </tr>
                  ))
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="font-semibold text-slate-900">{product.name}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-5 text-sm uppercase text-slate-500">
                        {product.hsnCode || 'N/A'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-5 text-sm text-right font-bold text-slate-900">
                        ₹{product.price.toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-5 text-sm text-right">
                        <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
                          {product.gstPercentage}%
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-indigo-600 hover:text-indigo-900 p-1.5 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(product)}
                            className="text-rose-600 hover:text-rose-900 p-1.5 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-3 py-20 text-center">
                       <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-slate-50 rounded-full">
                           <XMarkIcon className="h-8 w-8 text-slate-300" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">No products found</p>
                          <p className="text-xs text-slate-500 mt-1 italic">Add some inventory to get started.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Transition show={showModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" />
          </TransitionChild>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <DialogPanel className="relative transform overflow-hidden rounded-3xl bg-white px-4 pb-4 pt-5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-8">
                  <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                    <button
                      type="button"
                      className="rounded-xl bg-white text-slate-400 hover:text-slate-500 focus:outline-none"
                      onClick={closeModal}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <DialogTitle as="h3" className="text-2xl font-bold leading-6 text-slate-900 mb-8 pb-4 border-b border-slate-100">
                        {editingProduct ? 'Update Product' : 'Add New Product'}
                      </DialogTitle>
                      
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 ml-1 mb-1">Product Name</label>
                              <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="block w-full rounded-2xl border-0 py-3 px-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-slate-50/50 outline-none transition-all"
                                placeholder="e.g. Mechanical Valve"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 ml-1 mb-1">HSN Code</label>
                                <input
                                  type="text"
                                  pattern="[0-9]{4,8}"
                                  title="HSN Code must be 4 to 8 digits"
                                  value={formData.hsnCode}
                                  onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                                  className="block w-full rounded-2xl border-0 py-3 px-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-slate-50/50 outline-none transition-all"
                                  placeholder="e.g. 8481"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 ml-1 mb-1">Price (₹)</label>
                                <input
                                  required
                                  type="number"
                                  step="0.01"
                                  value={formData.price}
                                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                  className="block w-full rounded-2xl border-0 py-3 px-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-slate-50/50 outline-none transition-all"
                                  placeholder="0.00"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 ml-1 mb-1">GST Percentage (%)</label>
                              <select
                                value={formData.gstPercentage}
                                onChange={(e) => setFormData({ ...formData, gstPercentage: parseInt(e.target.value) })}
                                className="block w-full rounded-2xl border-0 py-3 px-4 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-slate-50/50 outline-none transition-all"
                              >
                                <option value={0}>0% (Exempted)</option>
                                <option value={5}>5%</option>
                                <option value={12}>12%</option>
                                <option value={18}>18%</option>
                                <option value={28}>28%</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="mt-8 sm:flex sm:flex-row-reverse gap-3">
                          <button
                            type="submit"
                            className="inline-flex w-full justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-500 transition-all sm:w-auto hover:-translate-y-0.5"
                          >
                            {editingProduct ? 'Update Product' : 'Save Product'}
                          </button>
                          <button
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 transition-all sm:mt-0 sm:w-auto"
                            onClick={closeModal}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setProductToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete ${productToDelete?.name}? This action cannot be undone.`}
      />
    </div>
  )
}

