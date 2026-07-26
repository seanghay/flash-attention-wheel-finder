import { HardDrive, Tag } from "lucide-react"

import { CopyButton } from "@/components/copy-button"
import { SpecChip } from "@/components/spec-chip"
import { FACETS, formatSize, pipCommand, type Wheel } from "@/lib/wheels"

export function WheelCard({ wheel }: { wheel: Wheel }) {
  const pip = pipCommand(wheel)

  return (
    <div className="border-border bg-card hover:border-foreground/20 rounded-lg border p-4 transition-colors">
      <div className="flex items-start justify-between gap-4">
        {/* Weight carries the hierarchy: the version is the answer, the rest is context. */}
        <a
          href={wheel.url}
          className="decoration-muted-foreground/40 min-w-0 text-[12.5px] leading-relaxed font-light break-all underline-offset-4 hover:underline"
        >
          {wheel.name}
        </a>
        <div className="text-muted-foreground flex shrink-0 flex-col items-end gap-1 text-[11px] font-light">
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <HardDrive className="size-3" />
            {formatSize(wheel.size)}
          </span>
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <Tag className="size-3" />
            {wheel.release}
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {FACETS.map((facet) => (
          <SpecChip key={facet} facet={facet} value={wheel[facet]} />
        ))}
      </div>

      <div className="bg-muted/50 mt-3 flex items-center gap-1 rounded-md py-1 pl-3">
        <code className="no-scrollbar min-w-0 flex-1 overflow-x-auto text-[11.5px] font-light whitespace-nowrap">
          <span className="text-muted-foreground">pip install</span>{" "}
          <span className="font-normal">"{wheel.url}"</span>
        </code>
        <CopyButton value={pip} label="Copy pip install command" />
      </div>
    </div>
  )
}
