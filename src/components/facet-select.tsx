import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DIMENSIONS } from "@/lib/dimensions"
import { cn } from "@/lib/utils"
import type { Facet } from "@/lib/wheels"

const ANY = "__any__"

export function FacetSelect({
  facet,
  value,
  options,
  onChange,
}: {
  facet: Facet
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  const dim = DIMENSIONS[facet]
  const Icon = dim.icon
  const active = Boolean(value)

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label
        className={cn(
          "flex items-center gap-1.5 text-[10.5px] tracking-[0.08em] uppercase transition-colors",
          active ? cn(dim.text, "font-semibold") : "text-muted-foreground font-medium",
        )}
      >
        <Icon className="size-3" strokeWidth={2.25} />
        {dim.label}
      </label>
      <Select value={value || ANY} onValueChange={(v) => onChange(v === ANY ? "" : v)}>
        <SelectTrigger
          className={cn(
            "w-full text-[13px] transition-colors",
            active && cn("border-current/30", dim.text, "font-semibold"),
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            value={ANY}
            className="text-muted-foreground text-[13px] font-light"
          >
            Any
          </SelectItem>
          {options.map((o) => (
            <SelectItem key={o} value={o} className="text-[13px] font-medium">
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
