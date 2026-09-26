import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppProvider } from './store/AppContext'
import { AdminShell, CustomerShell, SellerShell } from './components/layout'
import { ProductCardSkeleton } from './components/ui'
import Home from './pages/Home'
import SearchPage from './pages/Search'
import Explore from './pages/Explore'
import Nearby from './pages/Nearby'
import NearbyNow from './pages/NearbyNow'
import Stores from './pages/Stores'
import ProductPage from './pages/ProductPage'
import StorePage from './pages/StorePage'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import Reservations from './pages/Reservations'
import Wishlist from './pages/Wishlist'
import Deals from './pages/Deals'
import LocalMarket from './pages/LocalMarket'
import NearAI from './pages/NearAI'
import Account from './pages/Account'
import SellerDashboard from './pages/seller/SellerDashboard'
import SellerOrders from './pages/seller/SellerOrders'
import SellerInventory from './pages/seller/SellerInventory'
import SellerGrowth from './pages/seller/SellerGrowth'
import AdminOverview from './pages/admin/AdminOverview'
import AdminRadar from './pages/admin/AdminRadar'
import AdminDirectory from './pages/admin/AdminDirectory'
import AdminOps from './pages/admin/AdminOps'

function PageFallback() {
  return (
    <div className="nb-container py-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Customer app ─────────────────────────────── */}
          <Route path="/" element={<CustomerShell><Home /></CustomerShell>} />
          <Route path="/search" element={<CustomerShell><SearchPage /></CustomerShell>} />
          <Route path="/explore" element={<CustomerShell><Explore /></CustomerShell>} />
          <Route path="/nearby" element={<CustomerShell><Nearby /></CustomerShell>} />
          <Route path="/nearby-now" element={<CustomerShell><NearbyNow /></CustomerShell>} />
          <Route path="/stores" element={<CustomerShell><Stores /></CustomerShell>} />
          <Route path="/product/:id" element={<CustomerShell><ProductPage /></CustomerShell>} />
          <Route path="/store/:id" element={<CustomerShell><StorePage /></CustomerShell>} />
          <Route path="/cart" element={<CustomerShell><Cart /></CustomerShell>} />
          <Route path="/checkout" element={<CustomerShell><Checkout /></CustomerShell>} />
          <Route path="/orders" element={<CustomerShell><Orders /></CustomerShell>} />
          <Route path="/reservations" element={<CustomerShell><Reservations /></CustomerShell>} />
          <Route path="/wishlist" element={<CustomerShell><Wishlist /></CustomerShell>} />
          <Route path="/deals" element={<CustomerShell><Deals /></CustomerShell>} />
          <Route path="/local-market" element={<CustomerShell><LocalMarket /></CustomerShell>} />
          <Route path="/nearai" element={<CustomerShell><NearAI /></CustomerShell>} />
          <Route path="/account" element={<CustomerShell><Account /></CustomerShell>} />

          {/* ── Seller app ───────────────────────────────── */}
          <Route path="/seller" element={<SellerShell><SellerDashboard /></SellerShell>} />
          <Route path="/seller/orders" element={<SellerShell><SellerOrders /></SellerShell>} />
          <Route path="/seller/inventory" element={<SellerShell><SellerInventory /></SellerShell>} />
          <Route path="/seller/growth" element={<SellerShell><SellerGrowth /></SellerShell>} />

          {/* ── Admin console ────────────────────────────── */}
          <Route path="/admin" element={<AdminShell><AdminOverview /></AdminShell>} />
          <Route path="/admin/radar" element={<AdminShell><AdminRadar /></AdminShell>} />
          <Route path="/admin/directory" element={<AdminShell><AdminDirectory /></AdminShell>} />
          <Route path="/admin/ops" element={<AdminShell><AdminOps /></AdminShell>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
