import { useState } from 'react'
import { SEED_ORDERS, SEED_RESERVATIONS, PICKUP_WINDOWS } from '../../data/catalog'
import { getProduct, getStore } from '../../lib/geo'
import { formatINR, dayTime } from '../../lib/format'
import { ProductVisual, ReservationTimeline, Timeline } from '../../components/commerce'
import { Button, StatusBadge, Tabs } from '../../components/ui'
import { useApp } from '../../store/AppContext'

export default function SellerOrders() {
  const [tab, setTab] = useState<'orders' | 'reservations' | 'queue'>('orders')
  const { toast, reservations, updateReservation } = useApp()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-m-h2 lg:text-h2 font-bold">Orders & Reservations</h1>
        <p className="text-body-sm text-neutral-500 mt-1">Accept, prepare, mark ready — customers see it live.</p>
      </div>

      <Tabs<'orders' | 'reservations' | 'queue'>
        tabs={[
          { id: 'orders', label: '📦 Orders', count: SEED_ORDERS.length },
          { id: 'reservations', label: '🔖 Reservations', count: reservations.length },
          { id: 'queue', label: '🚶 Pickup Queue', count: 3 },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'orders' && (
        <div className="space-y-4">
          {SEED_ORDERS.map((o) => {
            const p = getProduct(o.items[0].productId)
            return (
              <div key={o.id} className="nb-card p-5 grid lg:grid-cols-[1fr,280px] gap-5">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="font-data font-bold text-body">{o.id}</p>
                    <StatusBadge
                      kind={
                        o.status === 'delivered' || o.status === 'picked_up'
                          ? 'stock'
                          : o.status === 'cancelled'
                            ? 'out'
                            : 'ready'
                      }
                    >
                      {o.status.replace(/_/g, ' ')}
                    </StatusBadge>
                    <StatusBadge kind="closed">{o.fulfillment.replace(/_/g, ' ')}</StatusBadge>
                    <span className="text-caption text-neutral-400 ml-auto">{dayTime(o.placedAt)}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <ProductVisual product={p} className="w-14 h-14 aspect-none rounded-md" />
                    <div>
                      <p className="text-body-sm font-semibold">{p.name}</p>
                      <p className="text-caption text-neutral-500">Qty {o.items[0].qty} · {formatINR(o.total)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    {['pending', 'confirmed'].includes(o.status) && (
                      <Button size="sm" variant="success" onClick={() => toast({ kind: 'success', title: 'Order accepted', body: `${o.id} · customer notified.` })}>
                        Accept Order
                      </Button>
                    )}
                    {['confirmed', 'preparing'].includes(o.status) && (
                      <Button size="sm" onClick={() => toast({ kind: 'info', title: 'Marked as packed', body: o.id })}>
                        Mark Packed
                      </Button>
                    )}
                    {o.status === 'preparing' && o.fulfillment !== 'local' && (
                      <Button size="sm" variant="reserve" onClick={() => toast({ kind: 'success', title: 'Marked ready for pickup', body: o.id })}>
                        Mark Ready
                      </Button>
                    )}
                    <Button size="sm" variant="secondary">Print slip</Button>
                  </div>
                </div>
                <div className="bg-neutral-50 rounded-xl p-4">
                  <Timeline
                    steps={
                      o.fulfillment === 'pickup'
                        ? ['Order Confirmed', 'Packed', 'Ready for Pickup', 'Collected']
                        : ['Order Confirmed', 'Seller Preparing', 'Packed', 'Out for Delivery', 'Delivered']
                    }
                    doneCount={o.timeline.length - (o.status === 'cancelled' ? 1 : 0)}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'reservations' && (
        <div className="space-y-4 max-w-3xl">
          {reservations.map((r) => (
            <div key={r.id} className="rounded-xl bg-reservebg border border-reserveborder p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-data font-bold text-h5">{r.code}</p>
                  <p className="text-body-sm text-neutral-600 mt-0.5">
                    Window {r.window} · {r.items.map((i) => getProduct(i.productId).name).join(', ')}
                  </p>
                </div>
                <StatusBadge kind={r.status === 'ready' ? 'ready' : r.status === 'awaiting' ? 'low' : r.status === 'collected' ? 'stock' : 'reserved'}>
                  {r.status}
                </StatusBadge>
              </div>
              <div className="mt-4">
                <ReservationTimeline reservation={r} />
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                {r.status === 'awaiting' && (
                  <>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => {
                        updateReservation(r.id, {
                          status: 'confirmed',
                          timeline: [...r.timeline, { label: 'Confirmed', at: Date.now() }],
                        })
                        toast({ kind: 'success', title: 'Reservation confirmed', body: `${r.code} · customer notified.` })
                      }}
                    >
                      Confirm Reservation
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => toast({ kind: 'error', title: 'Reservation declined', body: r.code })}>
                      Not available
                    </Button>
                  </>
                )}
                {r.status === 'confirmed' && (
                  <Button size="sm" onClick={() => {
                    updateReservation(r.id, {
                      status: 'packed',
                      timeline: [...r.timeline, { label: 'Packed', at: Date.now() }],
                    })
                    toast({ kind: 'info', title: 'Marked packed', body: r.code })
                  }}>
                    Mark Packed
                  </Button>
                )}
                {r.status === 'packed' && (
                  <Button size="sm" variant="reserve" onClick={() => {
                    updateReservation(r.id, {
                      status: 'ready',
                      timeline: [...r.timeline, { label: 'Ready', at: Date.now() }],
                    })
                    toast({ kind: 'success', title: 'Ready for pickup', body: `${r.code} · queue position assigned.` })
                  }}>
                    Mark Ready
                  </Button>
                )}
                {r.status === 'ready' && (
                  <Button size="sm" variant="success" onClick={() => {
                    updateReservation(r.id, {
                      status: 'collected',
                      timeline: [...r.timeline, { label: 'Collected', at: Date.now() }],
                    })
                    toast({ kind: 'success', title: 'Collected', body: `${r.code} · pickup complete.` })
                  }}>
                    Scan & Collect
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'queue' && (
        <div className="nb-card p-6 max-w-xl space-y-4">
          <h2 className="text-h5 font-bold">Pickup Queue</h2>
          <p className="text-body-sm text-neutral-500">Spreads the rush across pickup windows.</p>
          {[
            ['#1', 'Rohit S. · NB-4399', 'Ready — counter'],
            ['#2', 'Aarav S. · NB-4417', 'Arriving 7:05 PM · prep done'],
            ['#3', 'Meera P. · NB-4420', 'Arriving 7:20 PM · packing'],
          ].map(([pos, who, state]) => (
            <div key={pos} className="flex items-center gap-4 rounded-xl bg-neutral-50 border border-neutral-200 p-4">
              <span className="font-data text-h4 font-extrabold text-primary-600 w-10">{pos}</span>
              <div className="flex-1">
                <p className="text-body-sm font-semibold">{who}</p>
                <p className="text-caption text-neutral-500">{state}</p>
              </div>
            </div>
          ))}
          <p className="text-body-sm font-semibold text-neutral-700">Estimated wait: 5 min · Position #3</p>
          <div className="flex gap-2 flex-wrap">
            {PICKUP_WINDOWS.map((w) => (
              <span key={w} className="px-3 py-1.5 rounded-full bg-reservebg text-[#6D28D9] text-caption font-semibold">
                {w}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
