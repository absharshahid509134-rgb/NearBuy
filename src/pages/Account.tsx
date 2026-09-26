import { useNavigate } from 'react-router-dom'
import {
  Bell,
  CreditCard,
  Gift,
  Heart,
  HelpCircle,
  LogOut,
  MapPin,
  Package,
  QrCode,
  Shield,
  Store as StoreIcon,
  User,
} from 'lucide-react'
import { CUSTOMER_LOCATION } from '../data/catalog'
import { QuickLink } from '../components/layout'
import { Button, LocationChip, SectionHeading, StatusBadge } from '../components/ui'
import { useApp } from '../store/AppContext'

export default function Account() {
  const navigate = useNavigate()
  const { orders, reservations, wishlist, followed } = useApp()

  return (
    <div className="nb-container py-6 lg:py-10 space-y-8 max-w-3xl">
      {/* profile header */}
      <div className="nb-card p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-primary-500 text-white text-h4 font-extrabold flex items-center justify-center">
          AS
        </div>
        <div className="flex-1">
          <h1 className="text-h4 font-bold">Aarav Sharma</h1>
          <p className="text-body-sm text-neutral-500 mt-0.5">+91 98••• ••210 · aarav@example.in</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <LocationChip label={CUSTOMER_LOCATION.label} />
            <StatusBadge kind="reserved">⭐ NearBuy Plus · trial</StatusBadge>
          </div>
        </div>
      </div>

      {/* quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          ['Orders', orders.length, '/orders'],
          ['Reservations', reservations.length, '/reservations'],
          ['Wishlist', wishlist.length, '/wishlist'],
          ['Stores followed', followed.length, '/stores'],
        ].map(([label, n, to]) => (
          <button
            key={label as string}
            onClick={() => navigate(to as string)}
            className="nb-card p-4 text-center hover:shadow-medium transition-shadow duration-normal min-h-touch"
          >
            <p className="font-data text-h3 font-extrabold">{n as number}</p>
            <p className="text-caption text-neutral-500 mt-1">{label as string}</p>
          </button>
        ))}
      </div>

      {/* rewards */}
      <div className="nb-card p-6 bg-gradient-to-r from-reservebg to-primary-50 border-reserveborder">
        <h2 className="text-h5 font-bold flex items-center gap-2">
          🎁 NearPoints <Gift size={18} className="text-reserve" />
        </h2>
        <p className="font-data text-[32px] font-extrabold text-[#6D28D9] mt-2">1,240 pts</p>
        <p className="text-body-sm text-neutral-600 mt-1">
          Earned from pickups, reservations and supporting local stores. Redeem for coupons and delivery discounts.
        </p>
        <Button variant="reserve" size="md" className="mt-4" onClick={() => navigate('/deals')}>
          Redeem rewards
        </Button>
      </div>

      {/* sections */}
      <section className="space-y-3">
        <SectionHeading title="Shopping" />
        <QuickLink to="/orders" icon={<Package size={20} />} label="Orders & tracking" />
        <QuickLink to="/reservations" icon={<QrCode size={20} />} label="Reservations & pickup codes" />
        <QuickLink to="/wishlist" icon={<Heart size={20} />} label="Smart wishlist & alerts" />
        <QuickLink to="/local-market" icon={<StoreIcon size={20} />} label="Local Market" />
      </section>

      <section className="space-y-3">
        <SectionHeading title="Account settings" />
        <div className="nb-card divide-y divide-neutral-100">
          {[
            { icon: <MapPin size={20} />, label: 'Addresses & location preferences', sub: 'Delivering to Dwarka Sector 22' },
            { icon: <CreditCard size={20} />, label: 'Payment methods & refunds', sub: 'UPI · card ending 4242' },
            { icon: <Bell size={20} />, label: 'Notifications', sub: 'Price drops · stock · offers' },
            { icon: <Shield size={20} />, label: 'Privacy & data', sub: 'Location · personalization · data settings' },
            { icon: <HelpCircle size={20} />, label: 'Help & support', sub: 'Returns · report an issue' },
          ].map((r) => (
            <button key={r.label} className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-neutral-50 transition-colors duration-fast min-h-touch">
              <span className="text-primary-500">{r.icon}</span>
              <span className="flex-1">
                <span className="block text-body-sm font-semibold text-neutral-800">{r.label}</span>
                <span className="block text-caption text-neutral-500">{r.sub}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeading title="For businesses" />
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" size="lg" onClick={() => navigate('/seller')}>
            <StoreIcon size={18} /> Seller dashboard
          </Button>
          <Button variant="secondary" size="lg" onClick={() => navigate('/admin')}>
            Admin console
          </Button>
          <Button variant="ghost" size="lg">
            <LogOut size={18} /> Sign out
          </Button>
        </div>
      </section>

      {/* onboarding recap */}
      <section className="nb-card p-6 bg-neutral-100/50">
        <p className="text-caption font-bold uppercase tracking-wider text-neutral-400 mb-3">The NearBuy promise</p>
        <ul className="space-y-2 text-body-sm text-neutral-700">
          <li>✓ Find products nearby — discover what's already around you.</li>
          <li>✓ Choose how you receive them — delivery, pickup, or reserve before you visit.</li>
          <li>✓ Support local stores — digital convenience, neighbourhood commerce.</li>
        </ul>
      </section>
    </div>
  )
}
