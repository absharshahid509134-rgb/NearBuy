import { SEED_ORDERS, SEED_RESERVATIONS } from '../../data/catalog'
import { getProduct } from '../../lib/geo'
import { formatINR, dayTime } from '../../lib/format'
import { SectionHeading, StatCard, StatusBadge } from '../../components/ui'

export default function AdminOps() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-m-h1 lg:text-h2 font-bold">Operations</h1>
        <p className="text-body-sm text-neutral-500 mt-1">Orders, reservations, payments, returns & disputes.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="GMV Today" value={formatINR(3284600)} change="7.8%" />
        <StatCard label="Escrow held" value={formatINR(412000)} hint="released on fulfilment" />
        <StatCard label="Returns" value={12} hint="0.8% of orders" />
        <StatCard label="Disputes open" value={2} accent="text-warning-700" />
      </div>

      <div className="nb-card overflow-x-auto">
        <SectionHeading title="Recent orders (sample city-wide feed)" className="p-5 pb-0" />
        <table className="w-full min-w-[720px] nb-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Item</th>
              <th>Fulfilment</th>
              <th>Total</th>
              <th>Status</th>
              <th>Placed</th>
            </tr>
          </thead>
          <tbody>
            {SEED_ORDERS.map((o) => (
              <tr key={o.id}>
                <td className="font-data font-semibold">{o.id}</td>
                <td>{getProduct(o.items[0].productId).name}</td>
                <td className="capitalize">{o.fulfillment.replace('_', ' ')}</td>
                <td className="font-data">{formatINR(o.total)}</td>
                <td>
                  <StatusBadge
                    kind={['delivered', 'picked_up'].includes(o.status) ? 'stock' : o.status === 'cancelled' ? 'out' : 'ready'}
                  >
                    {o.status.replace(/_/g, ' ')}
                  </StatusBadge>
                </td>
                <td className="text-caption">{dayTime(o.placedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="nb-card overflow-x-auto">
        <SectionHeading title="Reservations" className="p-5 pb-0" />
        <table className="w-full min-w-[640px] nb-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Store</th>
              <th>Window</th>
              <th>Status</th>
              <th>Expiry</th>
            </tr>
          </thead>
          <tbody>
            {SEED_RESERVATIONS.map((r) => (
              <tr key={r.id}>
                <td className="font-data font-bold text-[#6D28D9]">{r.code}</td>
                <td>{r.storeId.toUpperCase()}</td>
                <td>{r.window}</td>
                <td>
                  <StatusBadge kind={r.status === 'ready' ? 'ready' : r.status === 'awaiting' ? 'low' : r.status === 'collected' ? 'stock' : 'reserved'}>
                    {r.status}
                  </StatusBadge>
                </td>
                <td className="text-caption">{dayTime(r.expiresAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="nb-card p-6">
          <SectionHeading title="Returns & disputes" />
          <div className="space-y-3">
            {[
              ['DSP-2201', 'Wrong size running shoes — refund approved', 'Resolved'],
              ['DSP-2200', 'Damaged earbuds box — replacement offered', 'In review'],
            ].map(([id, desc, state]) => (
              <div key={id} className="rounded-xl bg-neutral-50 border border-neutral-200 p-4">
                <p className="text-caption font-data text-neutral-400">{id}</p>
                <p className="text-body-sm mt-1">{desc}</p>
                <StatusBadge kind={state === 'Resolved' ? 'stock' : 'low'} className="mt-2">{state}</StatusBadge>
              </div>
            ))}
          </div>
        </div>
        <div className="nb-card p-6">
          <SectionHeading title="Promotions & AI governance" />
          <div className="space-y-3 text-body-sm text-neutral-600">
            <p>🎟️ 6 active coupons · 2 flash sales running city-wide.</p>
            <p>🤖 NearAI answers are grounded in live catalog & inventory; ungrounded claims are blocked.</p>
            <p>🛡️ Fraud & Risk: velocity checks on reservations, OTP pickup for high-value orders.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
