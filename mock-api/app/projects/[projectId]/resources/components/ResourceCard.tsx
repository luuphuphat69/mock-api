"use client"

import { Edit2, PlayCircle, Trash2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import APITestModal, { Method } from "./APITestModal"

interface ResourceCardProps {
  resource: IResource
  version: string
  onView: (resource: IResource) => void
  onEdit: (resource: IResource) => void
  onDelete: (id: string) => void
}

type Endpoint = {
  method: EndpointMethod
  path: string
}

const endpointMethods = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const

type EndpointMethod = (typeof endpointMethods)[number]

const methodStyles: Record<EndpointMethod, { label: string; pill: string; row: string }> = {
  GET: {
    label: "text-emerald-700",
    pill: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    row: "hover:border-emerald-200 hover:bg-emerald-50/40",
  },
  POST: {
    label: "text-blue-700",
    pill: "bg-blue-50 text-blue-700 ring-blue-200",
    row: "hover:border-blue-200 hover:bg-blue-50/40",
  },
  PUT: {
    label: "text-amber-700",
    pill: "bg-amber-50 text-amber-700 ring-amber-200",
    row: "hover:border-amber-200 hover:bg-amber-50/40",
  },
  PATCH: {
    label: "text-orange-700",
    pill: "bg-orange-50 text-orange-700 ring-orange-200",
    row: "hover:border-orange-200 hover:bg-orange-50/40",
  },
  DELETE: {
    label: "text-red-700",
    pill: "bg-red-50 text-red-700 ring-red-200",
    row: "hover:border-red-200 hover:bg-red-50/40",
  },
}

function getEndpoints(resource: IResource, version: string): Endpoint[] {
  const basePath = `https://services.mockapi.io.vn/mock-api`
  const resourcePath = `${resource.projectId}${version}/${resource.endpoint}`

  return [
    { method: "GET", path: `${basePath}/get/${resourcePath}` },
    { method: "POST", path: `${basePath}/post/${resourcePath}` },
    { method: "PUT", path: `${basePath}/put/${resourcePath}/:id` },
    { method: "PATCH", path: `${basePath}/patch/${resourcePath}/:id` },
    { method: "DELETE", path: `${basePath}/delete/${resourcePath}/:id` },
  ]
}

export function ResourceCard({ resource, version, onView, onEdit, onDelete }: ResourceCardProps) {
  const [isAPITestModalOpen, setIsAPITestModalOpen] = useState(false)
  const [testUrl, setTestUrl] = useState("")
  const [testMethod, setTestMethod] = useState<Method>("GET")

  const endpoints = getEndpoints(resource, version)
  const fields = resource.schemaFields ?? []

  const openEndpointTester = (endpoint: Endpoint) => {
    setTestUrl(endpoint.path)
    setTestMethod(endpoint.method as Method)
    setIsAPITestModalOpen(true)
  }

  return (
    <>
      {isAPITestModalOpen ? (
        <APITestModal
          url={testUrl}
          method={testMethod}
          resource={resource}
          onClose={() => setIsAPITestModalOpen(false)}
        />
      ) : null}

      <article
        data-testid="resource-card"
        data-resource-id={resource._id}
        data-resource-card
        className="group rounded-xl border border-border bg-card p-5 text-card-foreground transition-colors hover:border-muted-foreground/30 hover:bg-muted/20"
      >
        <button
          type="button"
          onClick={() => onView(resource)}
          className="mb-5 block w-full rounded-lg text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label={`View ${resource.name}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                Resource
              </p>
              <h3 className="truncate text-xl font-semibold tracking-[-0.01em] text-foreground">
                {resource.name}
              </h3>
            </div>
            <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              {fields.length} {fields.length === 1 ? "field" : "fields"}
            </span>
          </div>
        </button>

        <div className="mb-5 rounded-lg border border-border bg-background/70 p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
              Schema
            </p>
            <p className="font-mono text-[11px] text-muted-foreground">/{resource.endpoint}</p>
          </div>

          {fields.length > 0 ? (
            <div className="space-y-2">
              {fields.slice(0, 6).map((field, idx) => (
                <div
                  key={`${field.name}-${idx}`}
                  className="flex items-center justify-between gap-3 rounded-md bg-muted/30 px-2.5 py-2"
                >
                  <span className="min-w-0 truncate font-mono text-xs text-foreground">
                    {field.name}
                  </span>
                  <span className="shrink-0 text-right font-mono text-[11px] text-muted-foreground">
                    <span className="font-medium text-foreground">{field.dataType}</span>
                    {field.fakeType ? <span> / {field.fakeType}</span> : null}
                  </span>
                </div>
              ))}

              {fields.length > 6 ? (
                <p className="px-2 pt-1 text-xs text-muted-foreground">
                  +{fields.length - 6} more fields
                </p>
              ) : null}
            </div>
          ) : (
            <div className="rounded-md bg-muted/30 px-2.5 py-3 text-xs text-muted-foreground">
              No schema fields configured.
            </div>
          )}
        </div>

        <div className="mb-5 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
              Test endpoints
            </p>
            <span className="text-xs text-muted-foreground">{endpoints.length} routes</span>
          </div>

          {endpoints.map((endpoint) => {
            const style = methodStyles[endpoint.method]

            return (
              <button
                key={endpoint.method}
                type="button"
                onClick={() => openEndpointTester(endpoint)}
                className={`w-full rounded-lg border border-border bg-background p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${style.row}`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`inline-flex min-w-[4.25rem] justify-center rounded-md px-2 py-1 text-[11px] font-semibold tracking-[0.06em] ring-1 ${style.pill}`}
                  >
                    {endpoint.method}
                  </span>
                  <span className="min-w-0 flex-1 break-all font-mono text-[11px] leading-5 text-muted-foreground">
                    {endpoint.path}
                  </span>
                  <PlayCircle
                    className={`mt-0.5 h-4 w-4 shrink-0 ${style.label}`}
                    aria-hidden="true"
                  />
                </div>
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-border pt-4">
          <Button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(resource)
            }}
            variant="outline"
            data-testid="edit-resource-button"
            className="border-border bg-background text-foreground"
          >
            <Edit2 className="mr-2 h-4 w-4" aria-hidden="true" />
            Edit
          </Button>

          <Button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(resource._id)
            }}
            data-testid="delete-resource-button"
            variant="outline"
            className="border-border bg-background text-red-600 hover:border-red-200 hover:bg-red-700 hover:text-white"
          >
            <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
            Delete
          </Button>
        </div>
      </article>
    </>
  )
}