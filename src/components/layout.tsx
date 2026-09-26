import React from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import {
  Bell,
  Compass,
  Heart,
  Home,
  LayoutDashboard,
  MapPin,
  Package,
  QrCode,
  Search,
  ShoppingCart,
  ShoppingBag,
  Store as StoreIcon,
  Truck,
  User,
} from 'lucide-react'
import { useApp } from '../store/AppContext'
import { LocationChip, ToastHost } from './ui'
import { CUSTOMER_LOCATION } from '../data/catalog'

export function Logo({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2 group" aria-label="NearBuy home">
      <span className="w-9 h-9 rounded-lg bg-primary-500 flex items-center justify-center shadow-soft">
        <MapPin size={20} className="text-white" strokeWidth={2.4} />
      </span>
      {!compact && (
        <span
          className={`text-xl font-extrabold tracking-[-0.5px] ${light ? 'text-white' : 'text-neutral-900'}`}
        >
          NEAR<span className="text-primary-500">BUY</span>
        </span>
      )}
    </Link>
  )
}

/* ── Customer header (desktop) + mobile header ──────────── */
const headerLinks = [
  { to: '/explore', label: 'Categories' },
  { to: '/nearby', label: 'Nearby' },
  { to: '/deals', label: 'Deals' },
  { to: '/stores', label: 'Stores' },
]

export function CustomerHeader() {
  const { cartCount, wishlist } = useApp()
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200">
      <div className="nb-container-wide hidden lg:flex h-[72px] items-center gap-6">
        <Logo />
        <div className="flex-1 max-w-xl">
          <Link
            to="/search"
            className="flex items-center gap-3 h-14 px-4 rounded-xl border border-neutral-200 bg-white text-neutral-500 hover:shadow-search transition-shadow duration-normal"
          >
            <Search size={22} className="text-neutral-400" />
            <span>Search products, brands, stores…</span>
          </Link>
        </div>
        <nav className="flex items-center gap-1">
          {headerLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `px-3 h-11 flex items-center rounded-md text-body-sm font-semibold transition-colors duration-fast ${
                  isActive ? 'text-primary-600 bg-primary-50' : 'text-neutral-600 hover:bg-neutral-50'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-1 ml-2">
          <NavLink
            to="/orders"
            className="px-3 h-11 flex items-center rounded-md text-body-sm font-semibold text-neutral-600 hover:bg-neutral-50"
          >
            Orders
          </NavLink>
          <NavLink
            to="/wishlist"
            className="w-11 h-11 flex items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-50 relative"
            aria-label="Wishlist"
          >
            <Heart size={22} />
            {wishlist.length > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-deal text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </NavLink>
          <NavLink
            to="/cart"
            className="w-11 h-11 flex items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-50 relative"
            aria-label="Cart"
          >
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-primary-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </NavLink>
          <NavLink
            to="/account"
            className="w-11 h-11 flex items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-50"
            aria-label="Account"
          >
            <User size={22} />
          </NavLink>
        </div>
      </div>

      {/* mobile header */}
      <div className="lg:hidden h-16 flex items-center gap-3 px-4">
        <Logo />
        <div className="flex-1">
          <LocationChip label={CUSTOMER_LOCATION.label} />
        </div>
        <button className="w-11 h-11 flex items-center justify-center text-neutral-600 relative" aria-label="Notifications">
          <Bell size={22} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-deal rounded-full" />
        </button>
        <NavLink to="/account" className="w-11 h-11 flex items-center justify-center text-neutral-600" aria-label="Profile">
          <User size={22} />
        </NavLink>
      </div>
    </header>
  )
}

/* ── Mobile bottom nav ──────────────────────────────────── */
const bottomNav = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/nearby', icon: MapPin, label: 'Nearby' },
  { to: '/orders', icon: Package, label: 'Orders' },
  { to: '/account', icon: User, label: 'You' },
]

export function BottomNav() {
  const { pathname } = useLocation()
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-neutral-200 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5 h-[76px]">
        {bottomNav.map(({ to, icon: Icon, label }) => {
          const active = to === '/' ? pathname === '/' : pathname.startsWith(to)
          return (
            <Link key={to} to={to} className="flex flex-col items-center justify-center gap-1 min-h-touch">
              <span
                className={`flex items-center justify-center w-12 h-7 rounded-full transition-colors duration-fast ${
                  active ? 'bg-primary-50' : ''
                }`}
              >
                <Icon size={24} className={active ? 'text-primary-500' : 'text-neutral-500'} strokeWidth={active ? 2.4 : 2} />
              </span>
              <span className={`text-[11px] font-semibold ${active ? 'text-primary-500' : 'text-neutral-500'}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

/* ── Footer ─────────────────────────────────────────────── */
const footerCols = [
  {
    title: 'Shop',
    links: [
      ['Search', '/search'],
      ['Nearby Stores', '/nearby'],
      ['Deals', '/deals'],
      ['Reservations', '/reservations'],
    ],
  },
  {
    title: 'For Businesses',
    links: [
      ['Become a Seller', '/seller'],
      ['Seller Dashboard', '/seller'],
      ['Business Tools', '/seller/inventory'],
    ],
  },
  {
    title: 'For Delivery Partners',
    links: [
      ['Join NearBuy', '/account'],
      ['Driver Login', '/account'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['About', '/account'],
      ['Careers', '/account'],
      ['Contact', '/account'],
    ],
  },
  {
    title: 'Help',
    links: [
      ['Support', '/account'],
      ['Returns', '/orders'],
      ['Privacy', '/account'],
      ['Terms', '/account'],
    ],
  },
]

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-white mt-20">
      <div className="nb-container-wide py-12 hidden md:block">
        <div className="grid grid-cols-6 gap-8">
          <div className="col-span-1">
            <Logo light />
            <p className="text-body-sm text-neutral-300 mt-4">
              What You Need, Already Nearby.
            </p>
          </div>
          {footerCols.map((col) => (
            <div key={col.title}>
              <p className="text-body-sm font-semibold mb-3">{col.title}</p>
              <ul className="space-y-2">
                {col.links.map(([label, to]) => (
                  <li key={label}>
                    <Link to={to} className="text-body-sm text-neutral-300 hover:text-white transition-colors duration-fast">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-neutral-700 mt-10 pt-6 text-caption text-neutral-400">
          © 2026 NearBuy · Search Online · Find Nearby · Reserve · Pickup · Deliver
        </div>
      </div>
      {/* compact mobile footer */}
      <div className="md:hidden px-4 py-6 flex flex-wrap gap-x-4 gap-y-2 text-caption text-neutral-300">
        <Link to="/account">About</Link>
        <Link to="/account">Help</Link>
        <Link to="/account">Terms</Link>
        <Link to="/account">Privacy</Link>
        <Link to="/seller">Become a Seller</Link>
        <span className="w-full text-neutral-500 mt-2">© 2026 NearBuy</span>
      </div>
    </footer>
  )
}

/* ── Customer shell ─────────────────────────────────────── */
export function CustomerShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <CustomerHeader />
      <main className="flex-1 pb-24 lg:pb-0">{children}</main>
      <Footer />
      <BottomNav />
      <ToastHost />
    </div>
  )
}

/* ── Seller shell ───────────────────────────────────────── */
const sellerNav = [
  { to: '/seller', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/seller/orders', icon: Package, label: 'Orders' },
  { to: '/seller/inventory', icon: ShoppingBag, label: 'Inventory' },
  { to: '/seller/growth', icon: Truck, label: 'Growth' },
]

export function SellerShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-neutral-50">
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-neutral-200 sticky top-0 h-screen">
        <div className="h-[72px] flex items-center px-5 border-b border-neutral-200">
          <Logo />
        </div>
        <nav className="p-3 space-y-1">
          {sellerNav.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 h-11 px-4 rounded-md text-body-sm font-semibold transition-colors duration-fast border-l-4 ${
                  isActive
                    ? 'bg-primary-50 text-primary-600 border-primary-500'
                    : 'text-neutral-600 hover:bg-neutral-50 border-transparent'
                }`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto p-4 space-y-2 border-t border-neutral-200">
          <Link to="/" className="text-body-sm text-neutral-500 hover:text-primary-500 block min-h-touch flex items-center">
            ← Customer app
          </Link>
          <Link to="/admin" className="text-body-sm text-neutral-500 hover:text-primary-500 block min-h-touch flex items-center">
            Admin console
          </Link>
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-white border-b border-neutral-200 h-16 lg:h-[72px] flex items-center gap-4 px-4 lg:px-8">
          <div className="lg:hidden">
            <Logo compact />
          </div>
          <div className="font-semibold text-body-sm lg:text-body truncate">
            <span className="hidden lg:inline">Seller · </span>ABC Sports
            <span className="ml-2 text-caption text-success-600 bg-success-50 px-2 py-0.5 rounded-full">
              Verified
            </span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <LocationChip label="Sector 22 Market" />
            <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center">
              A
            </div>
          </div>
        </header>
        <div className="p-4 lg:p-8 pb-28 lg:pb-8">{children}</div>
        {/* seller mobile nav */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-neutral-200 grid grid-cols-4 h-[72px]">
          {sellerNav.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end} className="flex flex-col items-center justify-center gap-1 min-h-touch">
              {({ isActive }) => (
                <>
                  <Icon size={22} className={isActive ? 'text-primary-500' : 'text-neutral-500'} />
                  <span className={`text-[11px] font-semibold ${isActive ? 'text-primary-500' : 'text-neutral-500'}`}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
      <ToastHost />
    </div>
  )
}

/* ── Admin shell ────────────────────────────────────────── */
const adminNav = [
  { to: '/admin', label: 'Overview', end: true, icon: LayoutDashboard },
  { to: '/admin/radar', label: 'Demand Radar', icon: Compass },
  { to: '/admin/directory', label: 'People & Stores', icon: StoreIcon },
  { to: '/admin/ops', label: 'Operations', icon: Truck },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-neutral-50">
      <aside className="hidden lg:flex flex-col w-64 bg-neutral-900 text-white sticky top-0 h-screen">
        <div className="h-[72px] flex items-center px-5 border-b border-neutral-700">
          <Logo light />
          <span className="ml-2 text-caption bg-primary-700 px-2 py-0.5 rounded-full">ADMIN</span>
        </div>
        <nav className="p-3 space-y-1">
          {adminNav.map(({ to, label, end, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 h-11 px-4 rounded-md text-body-sm font-semibold transition-colors duration-fast ${
                  isActive ? 'bg-primary-600 text-white' : 'text-neutral-300 hover:bg-neutral-800'
                }`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto p-4 border-t border-neutral-700">
          <Link to="/" className="text-body-sm text-neutral-400 hover:text-white block min-h-touch flex items-center">
            ← Customer app
          </Link>
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-white border-b border-neutral-200 h-[72px] flex items-center gap-4 px-4 lg:px-8">
          <div className="lg:hidden">
            <Logo compact />
          </div>
          <div className="font-bold">City Command Center · Delhi</div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-2 text-caption font-semibold text-success-600 bg-success-50 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse" /> All systems normal
            </span>
            <div className="w-10 h-10 rounded-full bg-neutral-900 text-white font-bold flex items-center justify-center">
              NB
            </div>
          </div>
        </header>
        <div className="p-4 lg:p-8 space-y-6">
          <div className="lg:hidden flex gap-2 nb-scroll-x pb-2">
            {adminNav.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `px-4 h-10 rounded-full text-body-sm font-semibold whitespace-nowrap ${
                    isActive ? 'bg-primary-500 text-white' : 'bg-white border border-neutral-200 text-neutral-600'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
          {children}
        </div>
      </div>
      <ToastHost />
    </div>
  )
}

export function AppShellSwitch({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

/* quick link row used on account page */
export function QuickLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="nb-card flex items-center gap-3 px-4 py-3.5 hover:shadow-medium transition-shadow duration-normal min-h-touch"
    >
      <span className="text-primary-500">{icon}</span>
      <span className="text-body-sm font-semibold text-neutral-800">{label}</span>
    </Link>
  )
}

export { QrCode, MapPin }
