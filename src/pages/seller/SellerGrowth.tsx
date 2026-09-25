import { DEMAND_SIGNALS, OFFERS, SEED_ORDERS } from '../../data/catalog'
import { formatINR } from '../../lib/format'
import { Button, SectionHeading, StatCard, StatusBadge } from '../../components/ui'
import { useApp } from '../../store/AppContext'

export default function SellerGrowth() {
  const { toast } = useApp()
  const customers = [
    { name: 'Rohit Sharma', kind: 'Frequent', orders: 12, spend: 18400 },
    { name: 'Ananya Kapoor', kind: 'Returning', orders: 5, spend: 7200 },
    { name: 'Meera Pillai', kind: 'New', orders: 1, spend: 649 },
    { name: 'Dev Anand', kind: 'High-value', orders: 9, spend: 41200 },
    { name: 'Kabir Tanwar', kind: 'Dormant', orders: 3, spend: 3100 },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-m-h2 lg:text-h2 font-bold">Growth</h1>
        <p className="text-body-sm text-neutral-500 mt-1">Analytics, promotions, CRM and demand — for a store without a website.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Revenue (7 days)" value={formatINR(168420)} change="9.6%" />
        <StatCard label="Avg basket" value={formatINR(1123)} hint="incl. team orders" />
        <StatCard label="Reservation → pickup" value="92%" hint="confirmation reliability" accent="text-[#6D28D9]" />
        <StatCard label="New customers" value={34} change="18%" hint="found you via Nearby" accent="text-sky-600" />
      </div>

      {/* revenue chart */}
      <div className="nb-card p-6">
        <SectionHeading title="Revenue trend" sub="Daily revenue · last 14 days" />
        <svg viewBox="0 0 560 140" className="w-full h-36">
          {[30, 70, 110].map((y) => (
            <line key={y} x1="0" y1={y} x2="560" y2={y} stroke="#E2E8F0" />
          ))}
          <path
            d="M0,100 L40,90 L80,95 L120,70 L160,78 L200,60 L240,65 L280,48 L320,55 L360,40 L400,52 L440,36 L480,30 L520,22"
            fill="none"
            stroke="#2563EB"
            strokeWidth="3"
          />
          <path
            d="M0,100 L40,90 L80,95 L120,70 L160,78 L200,60 L240,65 L280,48 L320,55 L360,40 L400,52 L440,36 L480,30 L520,22 L520,140 L0,140 Z"
            fill="#2563EB"
            opacity="0.08"
          />
        </svg>
      </div>

      {/* marketing */}
      <div className="nb-card p-6">
        <SectionHeading title="🎯 Marketing" sub="Create offers targeted at nearby and returning customers." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {['Create Offer', 'Promote Product', 'Store Coupon', 'Flash Sale'].map((t) => (
            <button
              key={t}
              onClick={() => toast({ kind: 'success', title: t, body: 'Set up in plain language via the AI assistant below.' })}
              className="rounded-xl border-2 border-neutral-200 p-5 text-left hover:border-primary-300 transition-colors duration-fast min-h-touch"
            >
              <p className="text-body font-semibold">{t}</p>
              <p className="text-caption text-neutral-500 mt-1">Target: nearby · returning · weekend shoppers</p>
            </button>
          ))}
        </div>
        <div className="mt-5 space-y-2">
          <p className="text-caption font-bold text-neutral-400 uppercase tracking-wider">Live offers</p>
          {OFFERS.filter((o) => o.storeId === 's1' || o.kind === 'coupon').map((o) => (
            <div key={o.id} className="flex items-center gap-3 rounded-xl bg-neutral-50 border border-neutral-200 p-3.5">
              <StatusBadge kind="out">₹{o.savings} off</StatusBadge>
              <p className="text-body-sm flex-1">{o.title}</p>
              {o.endsIn && <p className="text-caption text-warning-700">⏳ {o.endsIn}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* CRM */}
      <div className="nb-card p-6">
        <SectionHeading title="👥 Customers" sub="Understand your customer base — aggregated and privacy-respecting." />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] nb-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Segment</th>
                <th>Orders</th>
                <th>Lifetime spend</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.name}>
                  <td className="font-semibold text-neutral-900">{c.name}</td>
                  <td>
                    <StatusBadge
                      kind={
                        c.kind === 'Dormant' ? 'closed' : c.kind === 'New' ? 'ready' : 'stock'
                      }
                    >
                      {c.kind}
                    </StatusBadge>
                  </td>
                  <td className="font-data">{c.orders}</td>
                  <td className="font-data font-semibold">{formatINR(c.spend)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-caption text-neutral-400 mt-3">
          Segments: New · Returning · Frequent · Dormant · High-value. Personal data minimised per privacy requirements.
        </p>
      </div>

      {/* demand radar */}
      <div className="nb-card p-6">
        <SectionHeading title="📡 Demand Radar" sub="Where customers search but local supply is weak — your opportunity." />
        <div className="grid sm:grid-cols-2 gap-3">
          {DEMAND_SIGNALS.slice(0, 4).map((d) => (
            <div key={d.query} className="rounded-xl bg-neutral-50 border border-neutral-200 p-4 flex items-center gap-3">
              <div className="flex-1">
                <p className="text-body-sm font-semibold">{d.query}</p>
                <p className="text-caption text-neutral-500">
                  {d.area} · {d.searches} searches · supply {d.availability}
                </p>
              </div>
              <Button size="sm" variant="soft" onClick={() => toast({ kind: 'info', title: 'Stock it', body: `We'll help you list ${d.query.toLowerCase()}.` })}>
                Stock it
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
