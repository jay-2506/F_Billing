import { Fragment } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel, DialogTitle } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', type = 'danger' }) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={onClose}>
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
              <DialogPanel className="relative transform overflow-hidden rounded-3xl bg-white px-4 pb-4 pt-5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${type === 'danger' ? 'bg-rose-50' : 'bg-amber-50'} sm:mx-0 sm:h-10 sm:w-10`}>
                    <ExclamationTriangleIcon className={`h-6 w-6 ${type === 'danger' ? 'text-rose-600' : 'text-amber-600'}`} aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <DialogTitle as="h3" className="text-lg font-bold leading-6 text-slate-900">
                      {title}
                    </DialogTitle>
                    <div className="mt-2">
                      <p className="text-sm text-slate-500">
                        {message}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 sm:ml-10 sm:mt-6 sm:flex sm:flex-row-reverse gap-3">
                  <button
                    type="button"
                    className={`inline-flex w-full justify-center rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all sm:w-auto hover:-translate-y-0.5 ${
                      type === 'danger' ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-100' : 'bg-amber-600 hover:bg-amber-500 shadow-amber-100'
                    }`}
                    onClick={() => {
                      onConfirm()
                      onClose()
                    }}
                  >
                    {confirmText}
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 transition-all sm:mt-0 sm:w-auto"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
