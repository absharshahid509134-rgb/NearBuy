import { DEMAND_SIGNALS, MISSING_NEARBY, CATEGORIES } from '../../data/catalog'
import { SectionHeading, StatusBadge, StatCard, Button } from '../../components/ui'
import { useApp } from '../../store/AppContext'

export default function AdminRadar() {
  const { toast } = useApp()
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-m-h1 lg:text-h2 font-bold">Demand Radar</h1>
        <p className="text-body-sm text-neutral-500 mt-1">
          Where customers repeatedly search for products that are unavailable nearby — aggregated & anonymised.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Unfulfilled searches" value="2,987" hint="last 30 days" accent="text-warning-700" />
        <StatCard label="Opportunity categories" value={4} accent="text-primary-600" />
        <StatCard label="Recruitable stores" value={23} hint="in weak-supply zones" />
        <StatCard label="Widened radius saved" value="18%" hint="searches recovered" accent="text-success-600" />
      </div>

      <div className="nb-card p-6">
        <SectionHeading title="Area signals" sub="Dwarka · Janakpuri · Uttam Nagar" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] nb-table">
            <thead>
              <tr>
                <th>Area</th>
                <th>Searches</th>
                <th>30-day volume</th>
                <th>Nearby availability</th>
                <th>Opportunity</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {DEMAND_SIGNALS.map((d) => (
                <tr key={d.area + d.query}>
                  <td>
                    <span className="font-semibold text-neutral-900">{d.query}</span>
                    <span className="text-caption text-neutral-400 block">{d.area}</span>
                  </td>
                  <td className="font-data font-semibold">{d.searches}</td>
                  <td>
                    <div className="h-2 w-28 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full"
                        style={{ width: `${Math.min(100, d.searches / 9)}%` }}
                      />
                    </div>
                  </td>
                  <td>
                    <StatusBadge kind={d.availability === 'low' ? 'low' : d.availability === 'medium' ? 'reserved' : 'stock'}>
                      {d.availability}
                    </StatusBadge>
                  </td>
                  <td className="text-caption">
                    {d.availability === 'low' ? 'Potential seller demand' : 'Monitor'}
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="soft"
                      onClick={() => toast({ kind: 'info', title: 'Recruitment lead started', body: `Stores near ${d.area} for ${d.query}.` })}
                    >
                      Recruit sellers
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* what's missing near me */}
      <div className="nb-card p-6 bg-warning-50/40 border-warning-200">
        <SectionHeading title="🔍 What's Missing Near Me?" sub="Product gaps customers feel every week." />
        <div className="grid sm:grid-cols-2 gap-3">
          {MISSING_NEARBY.map((m) => (
            <div key={m.name} className="bg-white rounded-xl border border-warning-200 p-4">
              <p className="text-body font-semibold">{m.name}</p>
              <p className="text-body-sm text-neutral-500 mt-1">{m.note}</p>
            </div>
          ))}
        </div>
        <p className="text-caption text-neutral-400 mt-4">
          Feeds seller recruitment and merchant opportunity reports — never exposes individual searches.
        </p>
      </div>

      <div className="nb-card p-6">
        <SectionHeading title="Category heat" />
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c, i) => (
            <span
              key={c.id}
              className="px-4 py-2 rounded-full text-body-sm font-semibold border"
              style={{
                background: i < 3 ? '#EFF6FF' : '#F8FAFC',
                borderColor: i < 3 ? '#BFDBFE' : '#E2E8F0',
                color: i < 3 ? '#1E40AF' : '#475569',
              }}
            >
              {c.emoji} {c.name} {i < 3 ? '🔥' : ''}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
