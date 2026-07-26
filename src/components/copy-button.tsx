import { useEffect, useState } from "react"
import { Check, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => setCopied(false), 1400)
    return () => clearTimeout(id)
  }, [copied])

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8 shrink-0"
      aria-label={copied ? "Copied" : label}
      onClick={() => {
        navigator.clipboard.writeText(value).then(() => setCopied(true))
      }}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </Button>
  )
}
