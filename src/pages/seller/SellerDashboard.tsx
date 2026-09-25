import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, Package, QrCode, TrendingUp } from 'lucide-react'
import { LISTINGS, PRODUCTS, SEED_ORDERS, SEED_RESERVATIONS, DEMAND_SIGNALS, SELLER_AI_PROMPTS } from '../../data/catalog'
import { getProduct } from '../../lib/geo'
import { formatINR } from '../../lib/format'
import { Alert, Button, SectionHeading, StatCard, StatusBadge } from '../../components/ui'
import { sellerAiReply, aiMessage } from '../../lib/nearai'
import { useState } from 'react'
import type { ChatMessage } from '../../data/types'

const SELLER_ID = 's1'

export default function SellerDashboard() {
  const inv = LISTINGS.filter((l) => l.storeId === SELLER_ID)
  const lowStock = inv.filter((l) => l.stock > 0 && l.stock <= 4)
  const outOfStock = PRODUCTS.filter((p) => !inv.some((l) => l.productId === p.id))
  const awaiting = SEED_RESERVATIONS.filter((r) => r.status === 'awaiting')
  const active = SEED_ORDERS.filter((o) => ['confirmed', 'preparing', 'out_for_delivery'].includes(o.status))
  const [msgs, setMsgs] = useState<ChatMessage[]>([
    aiMessage({
      role: 'ai',
      text: "Namaste! I'm your store assistant. Ask me to add stock, flag reorders, or create an offer — in plain language.",
    }),
  ])
  const [input, setInput] = useState('')

  function send(text: string) {
    if (!text.trim()) return
    setMsgs((m) => [...m, aiMessage({ role: 'user', text })])
    setInput('')
    setTimeout(() => setMsgs((m) => [...m, aiMessage(sellerAiReply(text, SELLER_ID))]), 400)
  }

  // simple weekly sparkline (hand-rolled SVG)
  const week = [12, 18, 14, 22, 28, 25, 31]

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-m-h2 lg:text-h2 font-bold">Dashboard</h1>
          <p className="text-body-sm text-neutral-500 mt-1">ABC Sports · Sector 22 Market, Dwarka</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/seller/inventory"
            className="inline-flex items-center justify-center gap-2 font-semibold transition-colors duration-fast min-h-touch h-11 px-4 text-[15px] rounded-md bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50"
          >
            Add product
          </Link>
          <Button size="md" onClick={() => send('Create a weekend discount')}>
            Create offer
          </Button>
        </div>
      </div>

      {/* metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Orders" value={28} change="12.4%" hint="Compared with yesterday" />
        <StatCard label="Reservations" value={SEED_RESERVATIONS.length + 5} hint="3 awaiting confirmation" accent="text-[#6D28D9]" />
        <StatCard label="Revenue Today" value={formatINR(24860)} change="8.1%" hint="incl. pickups" accent="text-primary-600" />
        <StatCard label="Pickup Queue" value={3} hint="≈ 5 min wait" accent="text-fast" />
      </div>

      {/* alerts */}
      <div className="space-y-3">
        {awaiting.length > 0 && (
          <Alert kind="warning" title={`${awaiting.length} reservation(s) awaiting your confirmation`}>
            Confirm within 10 minutes to keep your reservation-confirmation metric high.
          </Alert>
        )}
        {lowStock.length > 0 && (
          <Alert kind="warning" title={`${lowStock.length} product(s) almost out of stock`}>
            Reorder suggestions ready based on this week's sales velocity.
          </Alert>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* stock overview */}
        <div className="nb-card p-5 lg:col-span-1">
          <h2 className="text-h5 font-bold mb-4">Inventory health</h2>
          <div className="flex gap-3 text-center">
            {[
              ['🟢', inv.filter((l) => l.stock > 4).length + 1275, 'In Stock'],
              ['🟡', lowStock.length + 80, 'Low Stock'],
              ['🔴', outOfStock.length + 20, 'Out of Stock'],
            ].map(([e, n, label]) => (
              <div key={label as string} className="flex-1 rounded-xl bg-neutral-50 p-3">
                <p className="text-lg">{e as string}</p>
                <p className="font-data text-h5 font-extrabold">{n as number}</p>
                <p className="text-caption text-neutral-500">{label as string}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-2">
            <p className="text-caption font-bold text-neutral-400 uppercase tracking-wider">⚠ Reorder suggestions</p>
            {lowStock.map((l) => (
              <div key={l.productId} className="flex items-center gap-2 text-body-sm">
                <span>{getProduct(l.productId).emoji}</span>
                <span className="flex-1 truncate">{getProduct(l.productId).name}</span>
                <StatusBadge kind="low">{l.stock} left</StatusBadge>
              </div>
            ))}
          </div>
          <Link to="/seller/inventory" className="nb-link text-body-sm mt-4 inline-block">
            Full inventory →
          </Link>
        </div>

        {/* orders + reservations */}
        <div className="space-y-4 lg:col-span-1">
          <div className="nb-card p-5">
            <h2 className="text-h5 font-bold mb-3 flex items-center gap-2">
              <Package size={18} /> Active orders
            </h2>
            {active.map((o) => (
              <Link
                key={o.id}
                to="/seller/orders"
                className="flex items-center gap-3 py-2.5 border-b border-neutral-100 last:border-0 min-h-touch"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm font-semibold font-data">{o.id}</p>
                  <p className="text-caption text-neutral-500 truncate">
                    {getProduct(o.items[0].productId).name}
                  </p>
                </div>
                <StatusBadge kind={o.status === 'out_for_delivery' ? 'ready' : 'stock'}>{o.status.replace('_', ' ')}</StatusBadge>
              </Link>
            ))}
            <Link to="/seller/orders" className="nb-link text-body-sm mt-3 inline-block">
              All orders →
            </Link>
          </div>
          <div className="nb-card p-5 bg-reservebg border-reserveborder">
            <h2 className="text-h5 font-bold mb-3 flex items-center gap-2 text-[#6D28D9]">
              <QrCode size={18} /> Reservations
            </h2>
            {SEED_RESERVATIONS.slice(0, 3).map((r) => (
              <div key={r.id} className="flex items-center gap-3 py-2.5 border-b border-reserveborder/60 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm font-semibold font-data">{r.code}</p>
                  <p className="text-caption text-neutral-500">Window {r.window}</p>
                </div>
                <StatusBadge kind={r.status === 'ready' ? 'ready' : r.status === 'awaiting' ? 'low' : 'stock'}>
                  {r.status}
                </StatusBadge>
              </div>
            ))}
          </div>
        </div>

        {/* seller AI + weekly chart */}
        <div className="space-y-4 lg:col-span-1">
          <div className="nb-card p-5">
            <h2 className="text-h5 font-bold mb-3">🤖 Seller AI Assistant</h2>
            <div className="space-y-2 max-h-56 overflow-y-auto mb-3 pr-1">
              {msgs.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-xl px-3.5 py-2.5 text-m-sm ${
                    m.role === 'user'
                      ? 'bg-primary-500 text-white ml-6 rounded-br-md'
                      : 'bg-neutral-100 text-neutral-800 mr-6 rounded-bl-md'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                  {!!m.productIds?.length && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {m.productIds.map((id) => (
                        <span key={id} className="text-lg" title={getProduct(id).name}>
                          {getProduct(id).emoji}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {SELLER_AI_PROMPTS.slice(1, 4).map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="px-2.5 h-8 rounded-full bg-white border border-neutral-200 text-caption text-neutral-600 hover:border-primary-300 min-h-touch"
                >
                  {p}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                send(input)
              }}
              className="flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Add 12 footballs…"
                className="flex-1 h-10 px-3 rounded-md border border-neutral-300 text-body-sm nb-focus"
              />
              <Button size="sm" type="submit">
                Send
              </Button>
            </form>
          </div>

          <div className="nb-card p-5">
            <h2 className="text-h5 font-bold mb-1 flex items-center gap-2">
              <TrendingUp size={18} /> This week
            </h2>
            <p className="text-caption text-neutral-500 mb-3">Orders per day · 150 total</p>
            <svg viewBox="0 0 280 90" className="w-full h-24">
              <line x1="0" y1="80" x2="280" y2="80" stroke="#E2E8F0" />
              <line x1="0" y1="45" x2="280" y2="45" stroke="#E2E8F0" strokeDasharray="3 3" />
              {week.map((v, i) => (
                <rect key={i} x={i * 40 + 12} y={80 - v * 2} width="18" height={v * 2} rx="4" fill={i === 6 ? '#2563EB' : '#93C5FD'} />
              ))}
            </svg>
            <p className="text-caption text-neutral-500 mt-2">
              Predictive: at the current sales rate, ~6 volleyball units may remain after 5 days (forecast, not a guarantee).
            </p>
          </div>
        </div>
      </div>

      {/* store health score */}
      <div className="nb-card p-6">
        <SectionHeading title="Store Health Score" sub="Individual operational metrics — shown clearly, not collapsed." />
        <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {(
            [
              ['Inventory accuracy', 96],
              ['Order acceptance', 98],
              ['Reservation confirm', 95],
              ['Preparation time', 92],
              ['Cancellation rate', 97],
              ['Customer satisfaction', 94],
            ] as [string, number][]
          ).map(([label, val]) => (
            <div key={label}>
              <p className="text-caption text-neutral-500">{label}</p>
              <p className="font-data text-h4 font-extrabold mt-1">{val}%</p>
              <div className="h-2 bg-neutral-100 rounded-full mt-1.5 overflow-hidden">
                <div className="h-full bg-primary-500 rounded-full" style={{ width: `${val}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* demand preview */}
      <div className="nb-card p-6">
        <SectionHeading title="📡 Demand nearby" sub="What customers search for around Dwarka — a preview of Demand Radar." action="Full radar" />
        <div className="grid sm:grid-cols-3 gap-3">
          {DEMAND_SIGNALS.slice(0, 3).map((d) => (
            <div key={d.query} className="rounded-xl bg-neutral-50 border border-neutral-200 p-4">
              <p className="text-body font-semibold">{d.query}</p>
              <p className="font-data text-h5 font-extrabold mt-1">{d.searches} searches</p>
              <p className="text-caption text-warning-700 mt-1">Nearby availability: {d.availability}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
