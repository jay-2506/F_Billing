import { useState, useEffect, Fragment } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
  DialogTitle,
} from "@headlessui/react";
import {
  PlusIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import api from "../services/api";
import ConfirmModal from "../components/ConfirmModal";

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await api.get("/invoices");
      setInvoices(response.data);
    } catch (error) {
      toast.error("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.customerId?.name &&
        invoice.customerId.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())),
  );

  const handleViewDetails = async (id) => {
    try {
      const response = await api.get(`/invoices/${id}`);
      setViewInvoice(response.data);
      setShowViewModal(true);
    } catch (error) {
      toast.error("Failed to load invoice details");
    }
  };

  const handleDeleteClick = (invoice) => {
    setInvoiceToDelete(invoice);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!invoiceToDelete) return;
    try {
      await api.delete(`/invoices/${invoiceToDelete._id}`);
      toast.success("Invoice deleted successfully");
      fetchInvoices();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete invoice");
    }
  };

  const handleDownloadExcel = async (id, invoiceNumber) => {
    try {
      const response = await api.get(`/invoices/excel/${id}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${invoiceNumber}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Excel downloaded successfully");
    } catch (error) {
      toast.error("Failed to download Excel");
    }
  };

  const closeModal = () => {
    setShowViewModal(false);
    setViewInvoice(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="sm:flex sm:items-center sm:justify-between bg-white/60 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/20">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Invoices
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Track and manage all your billing documents in one place.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            to="/invoices/create"
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-500 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            New Invoice
          </Link>
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
            placeholder="Search by invoice # or customer..."
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
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
                  <th className="py-4 pl-4 pr-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 sm:pl-6">
                    Invoice #
                  </th>
                  <th className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Customer
                  </th>
                  <th className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Date
                  </th>
                  <th className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Total
                  </th>
                  <th className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="relative py-4 pl-3 pr-4 sm:pr-6 text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-transparent text-slate-700">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-5 pl-4 pr-3 sm:pl-6">
                        <div className="h-4 bg-slate-100 rounded-md w-16"></div>
                      </td>
                      <td className="px-3 py-5">
                        <div className="h-4 bg-slate-100 rounded-md w-32"></div>
                      </td>
                      <td className="px-3 py-5">
                        <div className="h-4 bg-slate-100 rounded-md w-24"></div>
                      </td>
                      <td className="px-3 py-5">
                        <div className="h-4 bg-slate-100 rounded-md w-20"></div>
                      </td>
                      <td className="px-3 py-5">
                        <div className="h-7 bg-slate-100 rounded-full w-16"></div>
                      </td>
                      <td className="px-3 py-5"></td>
                    </tr>
                  ))
                ) : filteredInvoices.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-20 text-slate-500"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <XMarkIcon className="h-10 w-10 text-slate-200" />
                        <p className="text-sm font-medium italic">
                          No invoices found matching your criteria.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr
                      key={invoice._id}
                      className="hover:bg-indigo-50/30 transition-colors group"
                    >
                      <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm font-bold text-slate-900 sm:pl-6">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="whitespace-nowrap px-3 py-5 text-sm text-slate-600 font-medium">
                        {invoice.customerId?.name || "Deleted Customer"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-5 text-sm text-slate-500 font-mono">
                        {new Date(invoice.date).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-5 text-sm font-bold text-slate-900">
                        ₹{invoice.totalAmount.toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                        {invoice.isGST ? (
                          <span className="inline-flex items-center rounded-md bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            GST
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                            Composition
                          </span>
                        )}
                      </td>
                      <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleViewDetails(invoice._id)}
                            className="p-2 text-indigo-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                            title="View Details"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() =>
                              handleDownloadExcel(
                                invoice._id,
                                invoice.invoiceNumber,
                              )
                            }
                            className="p-2 text-green-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-green-100"
                            title="Download Excel"
                          >
                            <ArrowDownTrayIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(invoice)}
                            className="p-2 text-rose-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-rose-100"
                            title="Delete"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Invoice Modal */}
      <Transition show={showViewModal} as={Fragment}>
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

          <div className="fixed inset-0 z-50 overflow-y-auto">
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
                <DialogPanel className="relative transform overflow-hidden rounded-3xl bg-white px-4 pb-4 pt-5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-0">
                  <div className="absolute right-0 top-0 pr-4 pt-4 z-10">
                    <button
                      type="button"
                      className="rounded-xl bg-slate-100 p-2 text-slate-400 hover:text-slate-500"
                      onClick={closeModal}
                    >
                      {/* <XMarkIcon className="h-6 w-6" /> */}
                    </button>
                  </div>

                  {viewInvoice && (
                    <div className="bg-white overflow-hidden rounded-3xl">
                      <div className="p-8 space-y-8 bg-white   print:p-10">
                        {/* Header Branding */}
                        <div className="flex justify-between items-start border-b border-slate-100 pb-8">
                          <div>
                            <h2 className="text-3xl font-black tracking-tighter text-indigo-600">
                              BillEase.
                            </h2>
                            <p className="text-sm text-slate-500 mt-1 uppercase tracking-widest font-bold">
                              Tax Invoice
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-slate-900">
                              Krishna Devloper
                            </p>
                            <p className="text-xs text-slate-500">
                              Sidharaj Zori, Gandhinagar, Gujarat - 382001
                            </p>
                            <p className="text-xs text-slate-500 font-bold mt-1">
                              GSTIN: 24AAAAA0000A1Z5
                            </p>
                          </div>
                        </div>

                        {/* Customer Info Section */}
                        <div className="grid grid-cols-2 gap-8 bg-slate-50 rounded-2xl p-6">
                          <div className="space-y-1">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                              Bill To
                            </p>
                            <p className="text-lg font-bold text-slate-900">
                              {viewInvoice.customerId?.name}
                            </p>
                            <p className="text-sm text-slate-600 leading-relaxed">
                              {viewInvoice.customerId?.address}
                            </p>
                            <p className="text-sm font-semibold text-slate-900 mt-2">
                              Ph: {viewInvoice.customerId?.phone}
                            </p>
                            {viewInvoice.customerId?.gstNumber && (
                              <p className="text-xs font-bold text-indigo-600 mt-1">
                                GSTIN: {viewInvoice.customerId.gstNumber}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end text-right space-y-4">
                            <div>
                              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                Invoice Details
                              </p>
                              <p className="text-lg font-bold text-slate-900">
                                #{viewInvoice.invoiceNumber}
                              </p>
                              <p className="text-sm text-slate-500 italic">
                                {new Date(
                                  viewInvoice.date,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <div
                              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${viewInvoice.isGST ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}
                            >
                              {viewInvoice.isGST
                                ? "GST Invoice"
                                : "Composition Dealer"}
                            </div>
                          </div>
                        </div>

                        {/* Items Table */}
                        <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
                          <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-slate-50">
                              <tr>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                  Description
                                </th>
                                <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider w-24">
                                  HSN
                                </th>
                                <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider w-20">
                                  Qty
                                </th>
                                <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider w-32">
                                  Rate
                                </th>
                                <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider w-32">
                                  Amount
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-50">
                              {viewInvoice.items.map((item, idx) => (
                                <tr key={idx}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                                    {item.name}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-center uppercase tracking-tighter">
                                    {item.hsnCode || "N/A"}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-center font-mono">
                                    {item.quantity}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right font-mono">
                                    ₹{item.price.toFixed(2)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900 text-right">
                                    ₹{item.total.toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Summary Section */}
                        <div className="flex justify-end pt-4">
                          <div className="w-80 space-y-3 bg-slate-900 p-6 rounded-2xl text-white shadow-xl">
                            <div className="flex justify-between items-baseline opacity-70">
                              <span className="text-xs font-bold uppercase tracking-widest">
                                Subtotal
                              </span>
                              <span className="text-sm font-mono">
                                ₹{viewInvoice.subtotal.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between items-baseline opacity-70">
                              <span className="text-xs font-bold uppercase tracking-widest">
                                {viewInvoice.isGST
                                  ? "CGST (9%)"
                                  : "Composition Tax"}
                              </span>
                              <span className="text-sm font-mono">
                                ₹{viewInvoice.cgstAmount?.toFixed(2) || "0.00"}
                              </span>
                            </div>
                            {viewInvoice.isGST && (
                              <div className="flex justify-between items-baseline opacity-70">
                                <span className="text-xs font-bold uppercase tracking-widest">
                                  SGST (9%)
                                </span>
                                <span className="text-sm font-mono">
                                  ₹
                                  {viewInvoice.sgstAmount?.toFixed(2) || "0.00"}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between items-center pt-3 border-t border-white/10">
                              <span className="text-sm font-black uppercase text-indigo-300">
                                Total
                              </span>
                              <span className="text-2xl font-black">
                                ₹{viewInvoice.totalAmount.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Footer / Actions */}
                        <div className="flex items-center justify-between pt-8 border-t border-slate-100 no-print">
                          <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 underline">
                              Declaration
                            </p>
                            <p className="text-[10px] text-slate-500 italic leading-relaxed">
                              We declare that this invoice shows the actual
                              price of the goods
                              <br />
                              described and that all particulars are true and
                              correct.
                            </p>
                          </div>
                          <div className="flex gap-4">
                            <button
                              type="button"
                              onClick={() => window.print()}
                              className="px-6 py-2.5 rounded-xl border-2 border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-95"
                            >
                              Print View
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleDownloadExcel(
                                  viewInvoice._id,
                                  viewInvoice.invoiceNumber,
                                )
                              }
                              className="px-6 py-2.5 rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-800 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-slate-200"
                            >
                              <ArrowDownTrayIcon className="h-4 w-4" /> Export
                              Excel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
          setInvoiceToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Invoice"
        message={`Are you sure you want to delete invoice ${invoiceToDelete?.invoiceNumber}? This action cannot be undone.`}
      />
    </div>
  );
}
