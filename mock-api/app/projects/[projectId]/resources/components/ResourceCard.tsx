"use client"

import { Edit2, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { getKey } from '@/utilities/api/api'
import { useEffect, useState } from "react"
import APITestModal, { Method } from './APITestModal'


interface ResourceCardProps {
  resource: IResource
  apiKey: string
  onView: (resource: IResource) => void
  onEdit: (resource: IResource) => void
  onDelete: (id: string) => void
}

const methodStyles = {
  GET: { text: "text-green-400", border: "hover:border-green-500/50" },
  POST: { text: "text-blue-400", border: "hover:border-blue-500/50" },
  PUT: { text: "text-yellow-400", border: "hover:border-yellow-500/50" },
  PATCH: { text: "text-orange-400", border: "hover:border-orange-500/50" },
  DELETE: { text: "text-red-400", border: "hover:border-red-500/50" },
}

export function ResourceCard({ resource, apiKey, onView, onEdit, onDelete }: ResourceCardProps) {
  const [prefix, setPrefix] = useState("")
  const [isAPITestModalOpen, setIsAPITestModalOpen] = useState(false);
  const [testUrl, setTestUrl] = useState("");
  const [testMethod, setTestMethod] = useState<Method>("GET");

  useEffect(() => {
    const fetchPrefix = async () => {
      const res = await getKey(resource.projectId)
      setPrefix(res.prefix || "")
    }
    fetchPrefix()
  }, [resource.projectId])

  return (
    <>
      {isAPITestModalOpen && (
        <APITestModal
          apiKey={apiKey}
          url={testUrl}
          method={testMethod}
          resource={resource}
          onClose={() => setIsAPITestModalOpen(false)}
        />
      )}

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
            <div key={idx} className="text-xs font-mono text-muted-foreground">
              {field.name}: <span className="text-cyan-400">{field.dataType}</span>
              {field.fakeType && <span className="text-blue-400"> ({field.fakeType})</span>}
            </div>
          ))}
        </div>

        {/* Endpoints Display */}
        <div className="mb-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Endpoints:</p>
          {[
            { method: "GET", path: `http://mockapi.io.vn/mock/${resource.projectId}${prefix}/${resource.name.toLowerCase()}`, apiKey },
            { method: "POST", path: `http://mockapi.io.vn/mock/${resource.projectId}${prefix}/${resource.name.toLowerCase()}`, apiKey },
            { method: "PUT", path: `http://mockapi.io.vn/mock/${resource.projectId}${prefix}/${resource.name.toLowerCase()}/:id`, apiKey },
            { method: "PATCH", path: `http://mockapi.io.vn/mock/${resource.projectId}${prefix}/${resource.name.toLowerCase()}/:id`, apiKey },
            { method: "DELETE", path: `http://mockapi.io.vn/mock/${resource.projectId}${prefix}/${resource.name.toLowerCase()}/:id`, apiKey },
          ].map((endpoint) => {
            // 2. Retrieve the styles based on the method key
            // @ts-ignore (optional: handle typescript strict indexing if needed)
            const style = methodStyles[endpoint.method] || methodStyles.GET

            return (
              <button
                key={endpoint.method}
                onClick={() => {
                  setTestUrl(endpoint.path);
                  setTestMethod(endpoint.method as Method);
                  setIsAPITestModalOpen(true);
                }}
                // 3. Apply the border style
                className={`w-full text-left text-xs p-2 rounded border border-border/50 ${style.border} transition-colors cursor-pointer group`}
              >
                <div className="flex items-start gap-2">
                  {/* 4. Apply the text style */}
                  <span className={`font-semibold ${style.text} shrink-0 min-w-[4rem]`}>{endpoint.method}</span>
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors font-mono text-[10px] break-all flex-1">{endpoint.path}</span>
                </div>
              </button>
            )
          })}
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
    </>
  )
}