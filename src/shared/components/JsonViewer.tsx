import { useState } from "react"

/** Visionneuse JSON repliable (payloads d'événements). */
export function JsonViewer({ value, maxHeight = 320 }: { value: unknown; maxHeight?: number }) {
  const [expanded, setExpanded] = useState(false)
  const text = JSON.stringify(value, null, 2)
  const preview = text.length > 400 && !expanded ? `${text.slice(0, 400)}…` : text

  return (
    <div className="rounded-md border border-border bg-muted/40">
      <pre
        className="overflow-auto p-3 font-mono text-xs whitespace-pre-wrap"
        style={{ maxHeight }}
      >
        {preview}
      </pre>
      {text.length > 400 ? (
        <button
          type="button"
          className="w-full border-t border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? "Réduire" : "Tout afficher"}
        </button>
      ) : null}
    </div>
  )
}
