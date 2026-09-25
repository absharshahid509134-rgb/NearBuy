import { DEMAND_SIGNALS, MISSING_NEARBY, SEED_ORDERS, STORES } from '../../data/catalog'
import { NearbyMap } from '../../components/commerce'
import { SectionHeading, StatCard, StatusBadge } from '../../components/ui'
import { formatINR } from '../../lib/format'

export default function AdminOverview() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-m-h1 lg:text-h2 font-bold">City Command Center — Delhi</h1>
        <p className="text-body-sm text-neutral-500 mt-1">
          Live marketplace health across customers, stores, delivery and demand.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Customers" value="12,480" change="6.2%" />
        <StatCard label="Active Stores" value={STORES.length * 37} hint="incl. 9 verified in Dwarka" />
        <StatCard label="Orders Today" value="1,842" change="11.4%" />
        <StatCard label="Avg Fulfillment" value="38 min" hint="local delivery median" accent="text-sky-600" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Local Deliveries" value={720} accent="text-success-600" />
        <StatCard label="Pickup Orders" value={641} accent="text-primary-600" />
        <StatCard label="Reservations" value={481} accent="text-[#6D28D9]" />
        <StatCard label="Out-of-stock searches" value={312} hint="demand leaking — see Radar" accent="text-warning-700" />
      </div>

      {/* map layer */}
      <div className="nb-card p-6">
        <SectionHeading title="Map layer" sub="Stores · orders · drivers · hotspots · demand (Dwarka cluster shown)" />
        <div className="grid lg:grid-cols-[1fr,240px] gap-5">
          <NearbyMap stores={STORES.slice(0, 7)} height={340} route />
          <div className="space-y-2">
            {[
              ['🏪', 'Stores', '9 live'],
              ['📦', 'Orders active', '42'],
              ['🛵', 'Drivers on route', '17'],
              ['🔥', 'Hotspots', 'Sector 22 · Sector 21'],
              ['📈', 'High demand', 'Sports · Stationery'],
            ].map(([e, k, v]) => (
              <div key={k as string} className="rounded-xl bg-neutral-50 border border-neutral-200 p-3.5">
                <p className="text-caption text-neutral-500">
                  {e as string} {k as string}
                </p>
                <p className="text-body-sm font-semibold">{v as string}</p>
              </div>
            ))}
            <div className="rounded-xl bg-sky-50 border border-sky-200 p-3.5">
              <p className="text-caption font-semibold text-sky-600">Smart delivery batching</p>
              <p className="text-caption text-neutral-600 mt-1">
                Store A + Store B → one driver → two customers, promised windows intact.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* city pulse */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="nb-card p-6">
          <SectionHeading title="Today's fulfilment mix" />
          {(
            [
              ['Local delivery', 39, 'bg-sky-500'],
              ['Pickup & reserve', 35, 'bg-primary-500'],
              ['Standard delivery', 20, 'bg-success-500'],
              ['Fast delivery', 6, 'bg-fast'],
            ] as [string, number, string][]
          ).map(([label, pct, color]) => (
            <div key={label} className="mb-3">
              <div className="flex justify-between text-body-sm mb-1">
                <span>{label}</span>
                <span className="font-data font-semibold">{pct}%</span>
              </div>
              <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="nb-card p-6">
          <SectionHeading title="System" sub="Payments · fraud & risk · notifications" />
          <div className="space-y-2">
            {[
              ['Payments', 'Escrow + settlements healthy'],
              ['Fraud & Risk', '2 flags under review'],
              ['Reviews', '98% authentic (auto-mod + human)'],
              ['AI', 'NearAI grounded · 0 hallucinated-stock incidents'],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center gap-3 rounded-xl bg-neutral-50 border border-neutral-200 p-3.5">
                <StatusBadge kind="stock">✓</StatusBadge>
                <div>
                  <p className="text-body-sm font-semibold">{k}</p>
                  <p className="text-caption text-neutral-500">{v}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
