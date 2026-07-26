import { DIMENSIONS } from "@/lib/dimensions"
import { cn } from "@/lib/utils"
import type { Facet } from "@/lib/wheels"

/** A value tagged with its dimension: icon + hue on the left, value in bold. */
export function SpecChip({
  facet,
  value,
  className,
}: {
  facet: Facet
  value: string
  className?: string
}) {
  const dim = DIMENSIONS[facet]
  const Icon = dim.icon
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11.5px] leading-none",
        dim.chip,
        className,
      )}
      title={`${dim.label} ${value}`}
    >
      <Icon className="size-3 shrink-0" strokeWidth={2.25} />
      {dim.short && <span className="font-light opacity-70">{dim.short}</span>}
      <span className="font-semibold">{value}</span>
    </span>
  )
}
