import { useEffect, useMemo, useState } from "react"
import { Package, Search, SearchX, Sparkles, Terminal, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { CopyButton } from "@/components/copy-button"
import { FacetSelect } from "@/components/facet-select"
import { GithubIcon } from "@/components/github-icon"
import { SpecChip } from "@/components/spec-chip"
import { ThemeToggle } from "@/components/theme-toggle"
import { WheelCard } from "@/components/wheel-card"
import { DIMENSIONS } from "@/lib/dimensions"
import { cn } from "@/lib/utils"
import {
  EMPTY_FILTERS,
  FACETS,
  facetOptions,
  filtersFromParams,
  filtersToParams,
  search as searchWheels,
  type Filters,
  type Wheel,
  type WheelData,
} from "@/lib/wheels"

const REPO_URL = "https://github.com/mjun0812/flash-attention-prebuild-wheels"
const SITE_URL = "https://seanghay.github.io/flash-attention-wheel-finder"
const INSTALL_CMD = `curl -fsSL ${SITE_URL}/install.sh | bash`
const PAGE = 30

export default function App() {
  const [wheels, setWheels] = useState<Wheel[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>(() =>
    filtersFromParams(window.location.search),
  )
  const [shown, setShown] = useState(PAGE)

  useEffect(() => {
    let cancelled = false
    fetch(`${import.meta.env.BASE_URL}wheels.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data: WheelData) => {
        if (cancelled) return
        setWheels(data.wheels)
        // Drop any facet value from the URL that this dataset doesn't contain.
        setFilters((f) => {
          const next = { ...f }
          for (const facet of FACETS) {
            if (next[facet] && !data.wheels.some((w) => w[facet] === next[facet])) {
              next[facet] = ""
            }
          }
          return next
        })
      })
      .catch((e: Error) => !cancelled && setError(e.message))
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const qs = filtersToParams(filters).toString()
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname)
  }, [filters])

  const options = useMemo(
    () => (wheels ? facetOptions(wheels, filters) : null),
    [wheels, filters],
  )
  const hits = useMemo(
    () => (wheels ? searchWheels(wheels, filters) : []),
    [wheels, filters],
  )

  function update(patch: Partial<Filters>) {
    setFilters((f) => ({ ...f, ...patch }))
    setShown(PAGE)
  }

  const activeFacets = FACETS.filter((f) => filters[f])
  const active = activeFacets.length > 0 || filters.q.trim().length > 0

  return (
    <div className="mx-auto max-w-4xl px-5 pt-10 pb-24">
      <header className="mb-7 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="bg-muted text-foreground mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg">
            <Package className="size-4.5" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Flash Attention <span className="text-muted-foreground font-light">/</span>{" "}
              Wheel Finder
            </h1>
            <p className="text-muted-foreground mt-1 max-w-xl text-[13px] leading-relaxed font-light">
              Prebuilt{" "}
              <span className="text-foreground font-medium">flash-attn</span> wheels,
              searchable by Python, CUDA, PyTorch and Flash-Attention version.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" size="icon" asChild aria-label="Source repository">
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
              <GithubIcon className="size-4" />
            </a>
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <div className="border-border bg-card mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 border p-3 pl-4">
        <Terminal className="text-muted-foreground size-3.5 shrink-0" />
        <code className="no-scrollbar min-w-0 flex-1 overflow-x-auto text-[12px] font-light whitespace-nowrap">
          <span className="text-muted-foreground select-none">$ </span>
          {INSTALL_CMD}
        </code>
        <span className="text-muted-foreground hidden text-[11.5px] font-light lg:inline">
          detects your Python, CUDA and torch
        </span>
        <CopyButton value={INSTALL_CMD} label="Copy install command" />
      </div>

      <div className="border-border bg-card mb-4 rounded-lg border p-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {FACETS.map((facet) => (
            <FacetSelect
              key={facet}
              facet={facet}
              value={filters[facet]}
              options={options?.[facet] ?? []}
              onChange={(v) => update({ [facet]: v } as Partial<Filters>)}
            />
          ))}
        </div>

        <div className="relative mt-3">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2" />
          <Input
            value={filters.q}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="Filter by filename — e.g. cp312 manylinux 2.8"
            className="pl-9 text-[13px] font-light"
            aria-label="Filter by filename"
          />
        </div>
      </div>

      <div className="mb-4 flex min-h-8 flex-wrap items-center gap-2">
        <span className="text-muted-foreground mr-auto text-[12.5px] font-light">
          {wheels ? (
            <>
              <span className="text-foreground font-bold">
                {hits.length.toLocaleString()}
              </span>{" "}
              of {wheels.length.toLocaleString()} wheels
            </>
          ) : (
            "Loading…"
          )}
        </span>

        {/* Active filters double as the color legend. */}
        {activeFacets.map((facet) => (
          <button
            key={facet}
            onClick={() => update({ [facet]: "" } as Partial<Filters>)}
            className="group relative"
            aria-label={`Clear ${DIMENSIONS[facet].label} filter`}
          >
            <SpecChip
              facet={facet}
              value={filters[facet]}
              className="group-hover:opacity-70"
            />
          </button>
        ))}

        {active && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground h-7 text-[12px] font-light"
            onClick={() => update(EMPTY_FILTERS)}
          >
            <X className="size-3.5" />
            Reset
          </Button>
        )}
      </div>

      {error ? (
        <Empty icon={SearchX}>
          Could not load wheels.json ({error}).
          <br />
          Run <span className="text-foreground font-semibold">pnpm data</span> to
          generate it.
        </Empty>
      ) : !wheels ? (
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-[132px] rounded-lg" />
          ))}
        </div>
      ) : hits.length === 0 ? (
        <Empty icon={SearchX}>No wheels match these filters.</Empty>
      ) : (
        <>
          <div className="flex flex-col gap-2.5">
            {hits.slice(0, shown).map((w) => (
              <WheelCard key={w.url} wheel={w} />
            ))}
          </div>
          {hits.length > shown && (
            <Button
              variant="outline"
              className="mx-auto mt-5 flex text-[12.5px] font-medium"
              onClick={() => setShown((s) => s + PAGE)}
            >
              <Sparkles className="size-3.5" />
              Show {Math.min(PAGE, hits.length - shown)} more
              <span className="text-muted-foreground font-light">
                ({(hits.length - shown).toLocaleString()} left)
              </span>
            </Button>
          )}
        </>
      )}
    </div>
  )
}

function Empty({
  icon: Icon,
  children,
  className,
}: {
  icon: typeof SearchX
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "text-muted-foreground border-border flex flex-col items-center gap-3 rounded-lg border border-dashed py-14 text-center text-[13px] font-light",
        className,
      )}
    >
      <Icon className="size-5 opacity-60" strokeWidth={1.75} />
      <div>{children}</div>
    </div>
  )
}
