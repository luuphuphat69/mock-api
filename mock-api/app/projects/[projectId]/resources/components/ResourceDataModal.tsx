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

  return (
    <div ref={overlayRef} className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div
        ref={modalRef}
        className="bg-card border border-border rounded-lg p-8 w-full max-w-4xl shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-foreground mb-6">{resource.name} - Data Records</h2>

        {resource.records && resource.records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {resource.schemaFields.map((field) => (
                    <th key={field.name} className="text-left px-4 py-3 text-cyan-400 font-semibold">
                      {field.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resource.records.map((record, idx) => (
                  <tr key={idx} className="border-b border-border hover:bg-cyan-500/5 transition-colors">
                    {resource.schemaFields.map((field) => (
                      <td key={field.name} className="text-left px-4 py-3 text-foreground">
                        {String(record[field.name])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No data generated yet. Generate mock data in the resource editor.
          </p>
        )}

        <div className="flex gap-3 pt-6 border-t border-border">
          <Button
            onClick={onClose}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}