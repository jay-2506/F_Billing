import { Fragment, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  Bars3Icon,
  HomeIcon,
  UsersIcon,
  ShoppingBagIcon,
  DocumentDuplicateIcon,
  XMarkIcon,
  PlusCircleIcon,
  ArrowLeftOnRectangleIcon,
  UserCircleIcon,
  Cog6ToothIcon
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Dashboard", href: "/", icon: HomeIcon },
  { name: "Customers", href: "/customers", icon: UsersIcon },
  { name: "Products", href: "/products", icon: ShoppingBagIcon },
  { name: "Invoices", href: "/invoices", icon: DocumentDuplicateIcon },
  { name: "Create Invoice", href: "/invoices/create", icon: PlusCircleIcon },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Layout({ user, setUser }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Transition show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <TransitionChild
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
          </TransitionChild>

          <div className="fixed inset-0 flex">
            <TransitionChild
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <DialogPanel className="relative mr-16 flex w-full max-w-xs flex-1">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                  <div className="flex h-16 shrink-0 items-center">
                    <h1 className="text-2xl font-black text-indigo-600 tracking-tighter">
                      BillEase.
                    </h1>
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {navigation.map((item) => (
                            <li key={item.name}>
                              <Link
                                to={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={classNames(
                                  location.pathname === item.href
                                    ? "bg-indigo-50 text-indigo-600"
                                    : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50",
                                  "group flex gap-x-3 rounded-xl p-3 text-sm leading-6 font-bold transition-all"
                                )}
                              >
                                <item.icon className="h-6 w-6 shrink-0" />
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                      <li>
                        <button
                          onClick={handleLogout}
                          className="group -mx-2 flex w-full items-center gap-x-3 rounded-xl p-3 text-sm font-bold leading-6 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all duration-300 active:scale-95"
                        >
                          <ArrowLeftOnRectangleIcon className="h-6 w-6 shrink-0 transition-colors group-hover:text-rose-600" />
                          Logout
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-slate-900 px-8 pb-4 relative overflow-hidden">
          {/* Sidebar Gradient Background Decor */}
          <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-indigo-500/20 to-transparent pointer-events-none" />
          
          <div className="flex h-24 shrink-0 items-center relative z-10">
            <h1 className="text-3xl font-black text-white tracking-tighter">
              Bill<span className="text-indigo-400">Ease.</span>
            </h1>
          </div>
          
          <nav className="flex flex-1 flex-col relative z-10">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 px-3">Main Menu</div>
                <ul role="list" className="-mx-2 space-y-2">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={classNames(
                          location.pathname === item.href
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50"
                            : "text-slate-400 hover:text-white hover:bg-white/5",
                          "group flex gap-x-3 rounded-2xl p-3 text-sm leading-6 font-bold transition-all duration-300 active:scale-95"
                        )}
                      >
                        <item.icon className={classNames(
                          location.pathname === item.href ? "text-white" : "text-slate-500 group-hover:text-white",
                          "h-6 w-6 shrink-0 transition-colors"
                        )} />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              
              <li className="mt-auto">
                <button
                  onClick={handleLogout}
                  className="group flex w-full items-center gap-x-3 rounded-2xl p-3 text-sm font-bold leading-6 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-300 active:scale-95"
                >
                  <ArrowLeftOnRectangleIcon className="h-6 w-6 shrink-0 transition-colors group-hover:text-rose-400" />
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="lg:pl-72">
        <main className="min-h-screen py-10">
          <div className="px-4 sm:px-10 lg:px-12 max-w-7xl mx-auto">
            {/* Mobile Header */}
            <header className="lg:hidden flex items-center justify-between mb-8 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
                <h1 className="text-xl font-black text-indigo-600">BillEase.</h1>
                <button
                  type="button"
                  className="p-2 text-slate-600 hover:bg-slate-50 rounded-xl"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>
            </header>

            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

