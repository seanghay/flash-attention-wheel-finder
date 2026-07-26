import { Boxes, Cpu, FileCode2, Flame, Layers, Zap } from "lucide-react"

import type { Facet } from "@/lib/wheels"

export type Dimension = {
  label: string
  short: string
  icon: typeof Zap
  /** Tailwind classes for the tinted badge / icon treatment. */
  chip: string
  text: string
}

/**
 * Each dimension owns one hue across the whole UI — facet label, its icon and the
 * matching badge on every card — so color is a legend, not decoration. Platform
 * stays neutral since it is a category, not a version.
 */
export const DIMENSIONS: Record<Facet, Dimension> = {
  fa: {
    label: "Flash-Attention",
    short: "flash-attn",
    icon: Zap,
    chip: "bg-fa-bg text-fa",
    text: "text-fa",
  },
  python: {
    label: "Python",
    short: "py",
    icon: FileCode2,
    chip: "bg-python-bg text-python",
    text: "text-python",
  },
  cuda: {
    label: "CUDA",
    short: "cu",
    icon: Cpu,
    chip: "bg-cuda-bg text-cuda",
    text: "text-cuda",
  },
  torch: {
    label: "PyTorch",
    short: "torch",
    icon: Flame,
    chip: "bg-torch-bg text-torch",
    text: "text-torch",
  },
  platform: {
    label: "Platform",
    short: "",
    icon: Layers,
    chip: "bg-muted text-muted-foreground",
    text: "text-muted-foreground",
  },
}

export const ReleaseIcon = Boxes
