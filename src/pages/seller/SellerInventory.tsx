import { useState } from 'react'
import { LISTINGS, PRODUCTS } from '../../data/catalog'
import { availabilityConfidence, getProduct } from '../../lib/geo'
import { formatINR, timeAgo } from '../../lib/format'
import { ProductVisual } from '../../components/commerce'
import { Button, Input, SectionHeading, StatCard, StatusBadge, Tabs, Alert } from '../../components/ui'
import { useApp } from '../../store/AppContext'

const SELLER_ID = 's1'

export default function SellerInventory() {
  const [tab, setTab] = useState<'inventory' | 'products' | 'store'>('inventory')
  const [qtyEdit, setQtyEdit] = useState<Record<string, number>>({})
  const { toast } = useApp()
  const inv = LISTINGS.filter((l) => l.storeId === SELLER_ID)
  const low = inv.filter((l) => l.stock <= 4)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-m-h2 lg:text-h2 font-bold">Inventory & Products</h1>
        <p className="text-body-sm text-neutral-500 mt-1">
          Smart inventory — freshness, reorder suggestions and demand signals.
        </p>
      </div>

      <Tabs<'inventory' | 'products' | 'store'>
        tabs={[
          { id: 'inventory', label: '📊 Inventory', count: inv.length },
          { id: 'products', label: '🛍️ Products', count: PRODUCTS.length },
          { id: 'store', label: '🏪 Store & QR' },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'inventory' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="In Stock" value={inv.filter((l) => l.stock > 4).length + 1275} accent="text-success-600" />
            <StatCard label="Low Stock" value={low.length + 80} accent="text-warning-700" />
            <StatCard label="Out of Stock" value={20} accent="text-error-500" />
            <StatCard label="Updated today" value={inv.filter((l) => l.updatedMinsAgo < 480).length} hint="fresh inventory ranks higher" />
          </div>

          {low.length > 0 && (
            <Alert kind="warning" title="⚠ Reorder suggestions">
              Based on sales velocity: Nivia Volleyball (~6 units left after 5 days), Football Shoes — reorder suggested. High demand this week.
            </Alert>
          )}

          <div className="nb-card overflow-x-auto">
            <table className="w-full min-w-[720px] nb-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Confidence</th>
                  <th>Signal</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {inv.map((l) => {
                  const p = getProduct(l.productId)
                  const conf = availabilityConfidence(l.updatedMinsAgo)
                  const edited = qtyEdit[l.productId] ?? l.stock
                  return (
                    <tr key={l.productId}>
                      <td>
                        <div className="flex items-center gap-3">
                          <ProductVisual product={p} className="w-10 h-10 aspect-none rounded-md" />
                          <span className="font-semibold text-neutral-900">{p.name}</span>
                        </div>
                      </td>
                      <td className="font-data font-semibold">{formatINR(l.price)}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={edited}
                            min={0}
                            onChange={(e) => setQtyEdit({ ...qtyEdit, [l.productId]: Math.max(0, +e.target.value) })}
                            className="w-16 h-9 px-2 rounded-md border border-neutral-300 font-data nb-focus"
                          />
                          {edited !== l.stock && (
                            <Button
                              size="sm"
                              onClick={() => {
                                toast({ kind: 'success', title: 'Inventory updated', body: `${p.name} → ${edited} units. Freshness: confirmed recently.` })
                                setQtyEdit((q) => {
                                  const c = { ...q }
                                  delete c[l.productId]
                                  return c
                                })
                              }}
                            >
                              Save
                            </Button>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-caption font-semibold ${conf.className}`}>
                          {conf.key === 'fresh' ? '🟢' : conf.key === 'stale' ? '🟡' : '⚪'} {conf.hint}
                        </span>
                      </td>
                      <td>
                        {l.stock <= 4 ? (
                          <StatusBadge kind="low">⚠ Reorder</StatusBadge>
                        ) : l.stock > 20 ? (
                          <StatusBadge kind="ready">📈 High demand</StatusBadge>
                        ) : (
                          <StatusBadge kind="stock">Steady</StatusBadge>
                        )}
                      </td>
                      <td>
                        <span className="text-caption text-neutral-400">{timeAgo(l.updatedMinsAgo)}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="text-caption text-neutral-400">
            Availability confidence is derived from how recently inventory was updated — customers see it too.
          </p>
        </div>
      )}

      {tab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <SectionHeading title="Product catalog" sub={`${PRODUCTS.length} products on NearBuy · your shelf is live at nearbuy.com/store/abc-sports`} />
            <Button size="md" onClick={() => toast({ kind: 'success', title: 'Add product', body: 'Upload photos or use Seller AI: “Add 12 footballs”.' })}>
              + Add product
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRODUCTS.filter((p) => inv.some((l) => l.productId === p.id)).map((p) => (
              <div key={p.id} className="nb-card p-4 flex gap-3">
                <ProductVisual product={p} className="w-16 h-16 aspect-none rounded-lg" />
                <div className="min-w-0">
                  <p className="text-body-sm font-semibold truncate">{p.name}</p>
                  <p className="text-caption text-neutral-500">{formatINR(p.price)} · {p.brand}</p>
                  <StatusBadge kind="stock" className="mt-1">✓ Live on storefront</StatusBadge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'store' && (
        <div className="grid lg:grid-cols-2 gap-6 max-w-4xl">
          <div className="nb-card p-6 space-y-4">
            <SectionHeading title="Store profile" sub="Your storefront is shareable on WhatsApp, Instagram & QR posters." />
            <Input label="Store name" defaultValue="ABC Sports" />
            <Input label="Address" defaultValue="Shop 14, Sector 22 Market, Dwarka, Delhi" />
            <Input label="Hours" defaultValue="9:00 AM – 9:00 PM" />
            <div className="flex gap-2 flex-wrap">
              <StatusBadge kind="ready">📦 Pickup enabled</StatusBadge>
              <StatusBadge kind="stock">🛵 Local delivery enabled</StatusBadge>
              <StatusBadge kind="stock">✓ Verified</StatusBadge>
            </div>
            <Button onClick={() => toast({ kind: 'success', title: 'Store updated', body: 'Your storefront reflects the change instantly.' })}>
              Save store
            </Button>
          </div>
          <div className="nb-card p-6 text-center">
            <SectionHeading title="Store QR" sub="Counter poster — scan to view products & reserve." />
            <div className="inline-block bg-white border border-neutral-200 rounded-xl p-6">
              <div className="w-40 h-40 mx-auto bg-neutral-900 rounded-lg flex items-center justify-center">
                <div className="grid grid-cols-5 gap-1 p-3">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <span key={i} className={`w-4 h-4 rounded-[3px] ${(i * 7) % 3 === 0 ? 'bg-white' : 'bg-neutral-900'}`} />
                  ))}
                </div>
              </div>
              <p className="text-caption text-neutral-500 mt-3">nearbuy.com/store/abc-sports</p>
            </div>
            <p className="text-body-sm text-neutral-500 mt-4">
              Physical shop → NearBuy QR → digital store → inventory → reservation / delivery
            </p>
            <Button variant="secondary" size="md" className="mt-4" onClick={() => window.print()}>
              Print poster
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
