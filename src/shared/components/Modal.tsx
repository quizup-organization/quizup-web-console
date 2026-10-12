import { useEffect, useRef, type ReactNode } from "react"

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
}

/** Modale simple basée sur l'élément natif `<dialog>` (ESC + focus trap natifs). */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) {
      return
    }
    if (open && !dialog.open) {
      dialog.showModal()
    }
    if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="m-auto max-w-none bg-transparent p-0 backdrop:bg-black/40"
    >
      <div className="w-[min(92vw,34rem)] rounded-xl border border-border bg-background p-5 shadow-xl">
        <h2 className="text-lg font-semibold">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
        {children ? <div className="mt-4">{children}</div> : null}
        {footer ? (
          <div className="mt-6 flex justify-end gap-2">{footer}</div>
        ) : null}
      </div>
    </dialog>
  )
}
