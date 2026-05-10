"use client"
import { useEffect, useRef } from "react"
import gsap from "gsap"
import { Button } from "@/components/ui/button"

interface ResourceDataModalProps {
  isOpen: boolean
  resource: IResource | null
  onClose: () => void
}

export function ResourceDataModal({ isOpen, resource, onClose }: ResourceDataModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && modalRef.current && overlayRef.current) {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 })
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.95, y: -20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" }
      )
    }
  }, [isOpen])

  if (!isOpen || !resource) return null

  const fields = resource.schemaFields
  const records = resource.records ?? []
  const recordCount = records.length
  const fieldCount = fields.length
  const modalTitle = `${resource.name} data records`

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="resource-data-title"
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border bg-card px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
                Resource preview
              </p>
              <h2 id="resource-data-title" className="text-2xl font-semibold tracking-[-0.01em] text-foreground">
                {modalTitle}
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                Review generated mock records before testing endpoints or sharing this resource.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:min-w-56">
              <div className="rounded-xl border border-border bg-background px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">Records</p>
                <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-foreground">{recordCount}</p>
              </div>
              <div className="rounded-xl border border-border bg-background px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">Fields</p>
                <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-foreground">{fieldCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          {recordCount > 0 ? (
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-sm">
                  <thead className="bg-muted/30">
                    <tr className="border-b border-border">
                      <th className="w-16 px-4 py-3 text-start font-mono text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
                        #
                      </th>
                      {fields.map((field) => (
                        <th
                          key={field.name}
                          className="px-4 py-3 text-start text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground"
                        >
                          {field.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record, idx) => (
                      <tr key={idx} className="border-b border-border last:border-b-0 transition-colors hover:bg-muted/25">
                        <td className="px-4 py-3 font-mono text-xs tabular-nums text-muted-foreground">
                          {idx + 1}
                        </td>
                        {fields.map((field) => (
                          <td key={field.name} className="max-w-64 px-4 py-3 text-start text-foreground">
                            <span className="block truncate" title={String(record[field.name] ?? "")}>
                              {String(record[field.name] ?? "-")}
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex min-h-72 items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
              <div className="max-w-sm space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background font-mono text-sm text-muted-foreground">
                  0
                </div>
                <h3 className="text-lg font-semibold tracking-[-0.01em] text-foreground">No records yet</h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  Generate mock data in the resource editor, then return here to inspect the generated rows.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-border bg-card px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="text-sm text-muted-foreground">
            {recordCount > 0 ? `${recordCount} rows available for endpoint testing.` : "No generated data is available."}
          </p>
          <div className="flex gap-3">
            <Button onClick={onClose} variant="outline" className="min-w-28">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}