import { useState } from 'react'
import { STORES, SEED_ORDERS } from '../../data/catalog'
import { storeDistance } from '../../lib/geo'
import { formatINR, formatKm, dayTime } from '../../lib/format'
import { SectionHeading, StatusBadge, Tabs } from '../../components/ui'

const USERS = [
  { id: 'u1', name: 'Aarav Sharma', role: 'Customer', area: 'Dwarka S22', orders: 14, status: 'Active' },
  { id: 'u2', name: 'Meera Pillai', role: 'Customer', area: 'Dwarka S21', orders: 3, status: 'Active' },
  { id: 'u3', name: 'Sandeep Yadav', role: 'Delivery Partner', area: 'Dwarka', orders: 218, status: 'On route' },
  { id: 'u4', name: 'Rohit Sharma', role: 'Customer', area: 'Dwarka S19', orders: 22, status: 'Active' },
  { id: 'u5', name: 'Neha Joshi', role: 'Delivery Partner', area: 'Janakpuri', orders: 96, status: 'Idle' },
]

export default function AdminDirectory() {
  const [tab, setTab] = useState<'users' | 'sellers' | 'delivery'>('users')
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-m-h1 lg:text-h2 font-bold">People & Stores</h1>
        <p className="text-body-sm text-neutral-500 mt-1">Users, sellers and delivery partners across the city.</p>
      </div>

      <Tabs<'users' | 'sellers' | 'delivery'>
        tabs={[
          { id: 'users', label: 'Users', count: 12480 },
          { id: 'sellers', label: 'Sellers', count: STORES.length * 37 },
          { id: 'delivery', label: 'Delivery Partners', count: 640 },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'users' && (
        <div className="nb-card overflow-x-auto">
          <table className="w-full min-w-[640px] nb-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Area</th>
                <th>Orders</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {USERS.filter((u) => u.role === 'Customer').map((u) => (
                <tr key={u.id}>
                  <td className="font-semibold text-neutral-900">{u.name}</td>
                  <td>{u.role}</td>
                  <td>{u.area}</td>
                  <td className="font-data">{u.orders}</td>
                  <td>
                    <StatusBadge kind="stock">{u.status}</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'sellers' && (
        <div className="nb-card overflow-x-auto">
          <table className="w-full min-w-[760px] nb-table">
            <thead>
              <tr>
                <th>Store</th>
                <th>Area</th>
                <th>Distance</th>
                <th>Rating</th>
                <th>Verification</th>
                <th>Fulfilment</th>
              </tr>
            </thead>
            <tbody>
              {STORES.map((s) => (
                <tr key={s.id}>
                  <td className="font-semibold text-neutral-900">
                    {s.emoji} {s.name}
                  </td>
                  <td>{s.area}</td>
                  <td className="font-data">{formatKm(storeDistance(s))}</td>
                  <td className="font-data">★ {s.rating}</td>
                  <td>
                    <StatusBadge kind={s.verified ? 'stock' : 'low'}>{s.verified ? '✓ Verified' : 'Pending docs'}</StatusBadge>
                  </td>
                  <td className="text-caption">
                    {s.pickup ? 'Pickup ' : ''}
                    {s.localDelivery ? '· Local delivery' : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'delivery' && (
        <div className="nb-card overflow-x-auto">
          <table className="w-full min-w-[640px] nb-table">
            <thead>
              <tr>
                <th>Partner</th>
                <th>Zone</th>
                <th>Deliveries</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {USERS.filter((u) => u.role === 'Delivery Partner').map((u) => (
                <tr key={u.id}>
                  <td className="font-semibold text-neutral-900">{u.name}</td>
                  <td>{u.area}</td>
                  <td className="font-data">{u.orders}</td>
                  <td>
                    <StatusBadge kind={u.status === 'On route' ? 'ready' : 'closed'}>{u.status}</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-5 text-body-sm text-neutral-500">
            Driver heatmap (High / Medium / Low demand) is shared only where platform rules and safety permit.
          </div>
        </div>
      )}
    </div>
  )
}
