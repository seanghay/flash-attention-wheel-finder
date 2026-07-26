export type Wheel = {
  name: string
  url: string
  size: number
  release: string
  package: string
  fa: string
  cuda: string
  torch: string
  python: string
  abi3: boolean
  platform: string
  arch: string
}

export type WheelData = {
  repo: string
  count: number
  wheels: Wheel[]
}

export const FACETS = ["fa", "python", "cuda", "torch", "platform"] as const
export type Facet = (typeof FACETS)[number]

/** Descending version order, so 3.14 sorts above 3.9 and 2.8.3 above 2.8.0. */
export function cmpVersionDesc(a: string, b: string): number {
  const pa = a.match(/\d+/g) ?? []
  const pb = b.match(/\d+/g) ?? []
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = Number(pb[i] ?? 0) - Number(pa[i] ?? 0)
    if (d !== 0) return d
  }
  return a < b ? -1 : a > b ? 1 : 0
}

export type Filters = Record<Facet, string> & { q: string }

export const EMPTY_FILTERS: Filters = {
  fa: "",
  python: "",
  cuda: "",
  torch: "",
  platform: "",
  q: "",
}

export function matchesFacets(w: Wheel, filters: Filters, skip?: Facet): boolean {
  return FACETS.every((f) => f === skip || !filters[f] || w[f] === filters[f])
}

export function search(wheels: Wheel[], filters: Filters): Wheel[] {
  const terms = filters.q.toLowerCase().split(/\s+/).filter(Boolean)
  return wheels.filter((w) => {
    if (!matchesFacets(w, filters)) return false
    if (!terms.length) return true
    const hay = `${w.name} ${w.release}`.toLowerCase()
    return terms.every((t) => hay.includes(t))
  })
}

/**
 * Options for each facet are computed against the *other* active filters, so a
 * selection can never lead to an empty result set.
 */
export function facetOptions(
  wheels: Wheel[],
  filters: Filters,
): Record<Facet, string[]> {
  const out = {} as Record<Facet, string[]>
  for (const f of FACETS) {
    const values = new Set<string>()
    for (const w of wheels) if (matchesFacets(w, filters, f)) values.add(w[f])
    out[f] = [...values].sort(cmpVersionDesc)
  }
  return out
}

export function formatSize(bytes: number): string {
  return `${(bytes / 1_048_576).toFixed(0)} MB`
}

export function pipCommand(w: Wheel): string {
  return `pip install "${w.url}"`
}

export function filtersToParams(filters: Filters): URLSearchParams {
  const p = new URLSearchParams()
  for (const f of FACETS) if (filters[f]) p.set(f, filters[f])
  if (filters.q.trim()) p.set("q", filters.q.trim())
  return p
}

export function filtersFromParams(search: string): Filters {
  const p = new URLSearchParams(search)
  const filters = { ...EMPTY_FILTERS }
  for (const f of FACETS) filters[f] = p.get(f) ?? ""
  filters.q = p.get("q") ?? ""
  return filters
}
