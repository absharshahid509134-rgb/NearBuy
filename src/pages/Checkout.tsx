import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { CheckCircle2 } from 'lucide-react'
import { CUSTOMER_LOCATION, PICKUP_WINDOWS } from '../data/catalog'
import type { FulfillmentType, Order, Reservation } from '../data/types'
import { getProduct, getStore, storeDistance } from '../lib/geo'
import { formatINR, formatKm } from '../lib/format'
import { OptionRow, ProductVisual } from '../components/commerce'
import { Button, Input, SectionHeading } from '../components/ui'
import { useApp } from '../store/AppContext'

export default function Checkout() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { cart, placeOrder, placeReservation, clearCart, toast } = useApp()
  const [mode, setMode] = useState<'delivery' | 'pickup' | 'reserve'>(
    (params.get('mode') as 'pickup' | 'delivery' | 'reserve') ?? 'delivery',
  )
  const [windowStr, setWindowStr] = useState(PICKUP_WINDOWS[1])
  const [pay, setPay] = useState<'upi' | 'card' | 'cod'>('upi')
  const [address, setAddress] = useState('H-14, Sector 22, Dwarka, Delhi — 110077')
  const [placed, setPlaced] = useState<null | { kind: 'order'; id: string; code?: string }>(null)

  const groups = useMemo(() => {
    const map = new Map<string, typeof cart>()
    cart.forEach((l) => {
      const arr = map.get(l.storeId) ?? []
      arr.push(l)
      map.set(l.storeId, arr)
    })
    return [...map.entries()].map(([storeId, lines]) => ({
      store: getStore(storeId),
      lines,
      subtotal: lines.reduce((s, l) => s + l.price * l.qty, 0),
    }))
  }, [cart])

  const subtotal = cart.reduce((s, l) => s + l.price * l.qty, 0)
  const fee = mode === 'delivery' ? 30 : 0
  const total = subtotal + fee

  function place() {
    const now = Date.now()
    if (mode === 'reserve') {
      const code = 'NB-' + Math.floor(4000 + Math.random() * 5000)
      const res: Reservation = {
        id: 'RSV-' + Math.floor(5500 + Math.random() * 400),
        code,
        items: cart.map((l) => ({ productId: l.productId, storeId: l.storeId, qty: l.qty, price: l.price })),
        status: 'awaiting',
        storeId: cart[0].storeId,
        placedAt: now,
        window: windowStr,
        expiresAt: now + 3 * 3600e3,
        timeline: [{ label: 'Requested', at: now }],
      }
      placeReservation(res)
      setPlaced({ kind: 'order', id: res.id, code })
    } else {
      const order: Order = {
        id: 'NB-' + Math.floor(10300 + Math.random() * 500),
        items: cart.map((l) => ({ productId: l.productId, storeId: l.storeId, qty: l.qty, price: l.price })),
        status: 'confirmed',
        fulfillment: (mode === 'pickup' ? 'pickup' : 'local') as FulfillmentType,
        total,
        deliveryFee: fee,
        placedAt: now,
        etaMins: mode === 'pickup' ? undefined : 45,
        courier: mode === 'pickup' ? undefined : 'Assigned shortly',
        timeline: [{ label: 'Order Confirmed', at: now }],
      }
      placeOrder(order)
      setPlaced({ kind: 'order', id: order.id })
    }
    clearCart()
    toast({ kind: 'success', title: mode === 'reserve' ? 'Reservation confirmed.' : 'Order confirmed.', body: 'Track it in Orders.' })
  }

  if (placed) {
    return (
      <div className="nb-container py-16 max-w-lg mx-auto text-center space-y-6">
        <div className="animate-pop inline-flex w-20 h-20 rounded-full bg-success-50 items-center justify-center">
          <CheckCircle2 size={48} className="text-success-500" />
        </div>
        <h1 className="text-m-h1 lg:text-h1">
          {placed.code ? 'Reservation confirmed.' : 'Order confirmed.'}
        </h1>
        {placed.code ? (
          <div className="nb-card p-6 bg-reservebg border-reserveborder space-y-4">
            <p className="text-body text-neutral-700">Your pickup code</p>
            <p className="text-h1 font-extrabold font-data text-[#6D28D9]">{placed.code}</p>
            <div className="inline-block bg-white p-3 rounded-lg border border-reserveborder">
              <QRCodeSVG value={`nearbuy://pickup/${placed.id}/${placed.code}`} size={140} />
            </div>
            <p className="text-body-sm text-neutral-600">
              Pickup window <strong>{windowStr}</strong> · show this QR at the store
            </p>
          </div>
        ) : (
          <p className="text-body text-neutral-600">
            {mode === 'pickup' ? 'The store is packing it — pick up in ~15 minutes.' : 'Arriving in about 45 minutes.'}
          </p>
        )}
        <p className="text-body-sm text-neutral-500">Reference {placed.id}</p>
        <div className="flex gap-3 justify-center">
          <Button size="lg" onClick={() => navigate(placed.code ? '/reservations' : '/orders')}>
            {placed.code ? 'My Reservations' : 'Track Order'}
          </Button>
          <Button variant="secondary" size="lg" onClick={() => navigate('/')}>
            Keep shopping
          </Button>
        </div>
      </div>
    )
  }

  if (!cart.length) {
    return (
      <div className="nb-container py-20 text-center space-y-4">
        <p className="text-5xl">🛍️</p>
        <h1 className="text-h4 font-bold">Nothing to check out</h1>
        <Button onClick={() => navigate('/nearby-now')}>Find something nearby</Button>
      </div>
    )
  }

  return (
    <div className="nb-container py-6 lg:py-10 space-y-8">
      <h1 className="text-m-h1 lg:text-h1">Checkout</h1>
      <div className="grid lg:grid-cols-[1fr,380px] gap-8 items-start">
        <div className="space-y-8">
          {/* fulfillment */}
          <section>
            <SectionHeading title="How do you want to get it?" sub="Per-store fulfilment — NearBuy coordinates the rest." />
            <div className="space-y-2.5">
              <OptionRow
                active={mode === 'delivery'}
                onClick={() => setMode('delivery')}
                title="🛵 Local Delivery"
                sub={`~45 min · from ${groups[0]?.store.name ?? 'local stores'} · ${formatKm(storeDistance(groups[0]?.store ?? getStore('s1')))}`}
                right="₹30"
              />
              <OptionRow
                active={mode === 'pickup'}
                onClick={() => setMode('pickup')}
                title="🏪 Pickup Today"
                sub="Free · ready in ~15 min · show order at counter"
                right="FREE"
              />
              <OptionRow
                active={mode === 'reserve'}
                onClick={() => setMode('reserve')}
                title="📦 Reserve & Pickup"
                sub="Book now, collect in your chosen window · QR pickup code"
                right="FREE"
                accent="#7C3AED"
              />
            </div>
            {mode === 'reserve' && (
              <div className="mt-4 rounded-xl bg-reservebg border border-reserveborder p-4">
                <p className="text-body-sm font-semibold text-[#6D28D9] mb-2">Pickup window</p>
                <div className="flex flex-wrap gap-2">
                  {PICKUP_WINDOWS.map((w) => (
                    <button
                      key={w}
                      onClick={() => setWindowStr(w)}
                      className={`px-3.5 h-10 rounded-full text-body-sm font-semibold min-h-touch ${
                        windowStr === w ? 'bg-reserve text-white' : 'bg-white border border-reserveborder text-[#6D28D9]'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* address */}
          {mode === 'delivery' && (
            <section>
              <SectionHeading title="Delivering to" sub="Dwarka Sector 22" />
              <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </section>
          )}

          {/* stores in this order */}
          <section>
            <SectionHeading title="Stores in this order" sub={`${groups.length} store(s) · combined where operationally feasible`} />
            <div className="space-y-3">
              {groups.map((g) => (
                <div key={g.store.id} className="nb-card p-4">
                  <p className="text-body-sm font-bold mb-2">🏪 {g.store.name}</p>
                  {g.lines.map((l) => {
                    const p = getProduct(l.productId)
                    return (
                      <div key={l.productId} className="flex items-center gap-3 py-2">
                        <ProductVisual product={p} className="w-12 h-12 aspect-none rounded-md" />
                        <span className="flex-1 text-body-sm truncate">{p.name} × {l.qty}</span>
                        <span className="font-data font-semibold">{formatINR(l.price * l.qty)}</span>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </section>

          {/* payment */}
          <section>
            <SectionHeading title="Payment" />
            <div className="space-y-2.5">
              <OptionRow active={pay === 'upi'} onClick={() => setPay('upi')} title="UPI" sub="GPay / PhonePe / Paytm" />
              <OptionRow active={pay === 'card'} onClick={() => setPay('card')} title="Card" sub="Visa · Mastercard · RuPay" />
              <OptionRow active={pay === 'cod'} onClick={() => setPay('cod')} title="Pay on pickup / delivery" sub="Cash or UPI at handover" />
            </div>
            <p className="text-caption text-neutral-400 mt-3">
              Payments are held in escrow until fulfilment confirmation (demo — no real charge).
            </p>
          </section>
        </div>

        {/* summary */}
        <aside className="nb-card p-6 space-y-3 lg:sticky lg:top-24">
          <SectionHeading title="Summary" />
          <div className="flex justify-between text-body-sm">
            <span className="text-neutral-500">Subtotal</span>
            <span className="font-data font-semibold">{formatINR(subtotal)}</span>
          </div>
          <div className="flex justify-between text-body-sm">
            <span className="text-neutral-500">{mode === 'delivery' ? 'Local delivery' : 'Pickup'}</span>
            <span className={`font-data font-semibold ${fee ? '' : 'text-success-600'}`}>
              {fee ? formatINR(fee) : 'FREE'}
            </span>
          </div>
          <div className="flex justify-between text-h5 pt-2 border-t border-neutral-100">
            <span>Total</span>
            <span className="font-data">{formatINR(total)}</span>
          </div>
          <Button size="xl" className="w-full mt-2" onClick={place}>
            {mode === 'reserve' ? 'Confirm Reservation' : 'Place Order'}
          </Button>
          <p className="text-caption text-neutral-400 text-center">
            {mode === 'reserve'
              ? 'The store confirms within minutes. You get a QR pickup code.'
              : 'Free cancellation before the seller starts preparing.'}
          </p>
        </aside>
      </div>
    </div>
  )
}
