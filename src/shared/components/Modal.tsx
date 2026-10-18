import { useEffect, useId, useRef, type ReactNode } from "react"
import { createPortal } from "react-dom"

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
}

/**
 * Modale légère rendue dans un portail (sous `document.body`).
 *
 * On n'utilise volontairement pas l'élément natif `<dialog>` : `showModal()` place la modale
 * dans le « top layer » du navigateur, au-dessus de tout `z-index`. Les popups portées par les
 * `<Select>` (portal + `z-50`) passaient donc derrière la modale. Le portail avec `z-40` laisse
 * les popups (z-50) au-dessus.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: ModalProps) {
  const titleId = useId()
  const contentRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) {
      return
    }
    const previousOverflow = document.body.style.overflow
    const previousActive =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    document.body.style.overflow = "hidden"

    const listFocusables = () =>
      contentRef.current?.querySelectorAll<HTMLElement>(
        "input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [href]",
      )
    listFocusables()?.[0]?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) {
        return
      }
      if (event.key === "Escape") {
        // Un Select ouvert est porté hors de la modale : Échap doit d'abord le fermer.
        if (document.querySelector('[data-slot="select-content"]')) {
          return
        }
        event.preventDefault()
        onCloseRef.current()
        return
      }
      const focusables = listFocusables()
      if (event.key !== "Tab" || !focusables || focusables.length === 0) {
        return
      }
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = previousOverflow
      if (previousActive?.isConnected) {
        previousActive.focus()
      }
    }
  }, [open])

  if (!open) {
    return null
  }

  return createPortal(
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        aria-hidden
        onClick={() => onCloseRef.current()}
      />
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative max-h-[90dvh] w-[min(92vw,34rem)] overflow-y-auto rounded-xl border border-border bg-background p-5 shadow-xl"
      >
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
        {children ? <div className="mt-4">{children}</div> : null}
        {footer ? (
          <div className="mt-6 flex justify-end gap-2">{footer}</div>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
