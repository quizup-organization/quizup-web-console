import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Modal } from "@/shared/components/Modal"
import type { MediaObjectView } from "../lib/media"

interface DeleteObjectModalProps {
  object: MediaObjectView | null
  pending: boolean
  onClose: () => void
  onConfirm: (key: string, force: boolean) => void
}

/**
 * Confirmation de suppression d'un objet : si l'image est encore référencée par une entité
 * métier, la suppression exige une case « forcer » explicite (les références resteront cassées).
 */
export function DeleteObjectModal({
  object,
  pending,
  onClose,
  onConfirm,
}: DeleteObjectModalProps) {
  const [force, setForce] = useState(false)

  const close = () => {
    setForce(false)
    onClose()
  }

  const referenceCount = object?.referenceCount ?? null
  const referenced = referenceCount !== null && referenceCount > 0

  return (
    <Modal
      open={object !== null}
      onClose={close}
      title="Supprimer l'image"
      description={object?.key ?? ""}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={close} disabled={pending}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={pending || (referenced && !force)}
            onClick={() => {
              if (object) {
                onConfirm(object.key, force)
              }
            }}
          >
            Supprimer
          </Button>
        </>
      }
    >
      <div className="space-y-3 text-sm">
        <p className="break-all text-muted-foreground">
          <a
            className="underline underline-offset-2"
            href={object?.url}
            target="_blank"
            rel="noreferrer"
          >
            {object?.url}
          </a>
        </p>
        {referenced ? (
          <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3">
            <p className="text-amber-700">
              Cette image est référencée {object?.referenceCount} fois (sujets, questions ou
              profils). La supprimer cassera ces visuels.
            </p>
            <label className="mt-2 flex items-center gap-2 text-amber-700">
              <input
                type="checkbox"
                checked={force}
                onChange={(event) => setForce(event.target.checked)}
              />
              Forcer la suppression
            </label>
          </div>
        ) : (
          <p className="text-muted-foreground">
            L'objet S3 et toutes les lignes <code>media_asset</code> associées seront supprimés.
          </p>
        )}
      </div>
    </Modal>
  )
}
