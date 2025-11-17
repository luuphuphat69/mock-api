"use client"
import { Edit2, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface ResourceCardProps {
  resource: IResource
  onView: (resource: IResource) => void
  onEdit: (resource: IResource) => void
  onDelete: (id: string) => void
}

export function ResourceCard({ resource, onView, onEdit, onDelete }: ResourceCardProps) {
  return (
    <div
      data-resource-id={resource._id}
      data-resource-card
      className="bg-card border border-border rounded-lg p-6 hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/10 group cursor-pointer"
    >
      <div className="cursor-pointer mb-4" onClick={() => onView(resource)}>
        <h3 className="text-xl font-semibold text-foreground mb-2">{resource.name}</h3>
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold">{resource.schemaFields?.length}</span> fields
        </p>
      </div>

      <div className="mb-4 space-y-1">
        {resource.schemaFields.map((field, idx) => (
          <div key={idx} className="text-xs">
            <span className="text-muted-foreground font-mono">
              {field.name}: <span className="text-cyan-400">{field.dataType}</span>
              {field.fakeType && <span className="text-blue-400"> ({field.fakeType})</span>}
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button
          onClick={(e) => {
            e.stopPropagation()
            onEdit(resource)
          }}
          variant="outline"
          className="flex-1 border-border bg-background text-foreground hover:bg-card hover:text-cyan-400"
        >
          <Edit2 className="w-4 h-4 mr-2" />
          Edit
        </Button>
        <Button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(resource._id)
          }}
          variant="outline"
          className="flex-1 border-border bg-background text-red-400 hover:bg-red-500"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  )
}