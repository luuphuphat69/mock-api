"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { ChevronRight, Plus, Trash2, Edit2, Wand2 } from 'lucide-react'
import Link from "next/link"
import { useParams, useRouter } from 'next/navigation'
import gsap from "gsap"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Header from "@/components/header"

interface SchemaField {
  name: string
  dataType: string
}

interface Endpoint {
  method: "GET" | "POST" | "PUT" | "DELETE"
  path: string
}

interface Resource {
  id: string
  name: string
  schema: SchemaField[]
  endpoints: Endpoint[]
  generatedData?: Record<string, unknown>[]
}

export default function ResourcesPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

  // Mock project data - in a real app, this would come from props or an API
  const [projectName] = useState("User API")

  const [resources, setResources] = useState<Resource[]>([
    {
      id: "1",
      name: "Users",
      schema: [
        { name: "id", dataType: "number" },
        { name: "name", dataType: "string" },
      ],
      endpoints: [
        { method: "GET", path: "/api/users" },
        { method: "POST", path: "/api/users" },
        { method: "PUT", path: "/api/users/:id" },
        { method: "DELETE", path: "/api/users/:id" },
      ],
    },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    schema: [{ name: "", dataType: "string" }],
    endpoints: [
      { method: "GET", path: "" },
      { method: "POST", path: "" },
      { method: "PUT", path: "" },
      { method: "DELETE", path: "" },
    ] as Endpoint[],
  })
  const [generateCount, setGenerateCount] = useState(5)

  const gridRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (gridRef.current) {
      const cards = gridRef.current.querySelectorAll("[data-resource-card]")
      gsap.fromTo(
        cards,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
        },
      )
    }
  }, [resources])

  useEffect(() => {
    if (isModalOpen && modalRef.current && overlayRef.current) {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" })
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.95, y: -20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" },
      )
    }
  }, [isModalOpen])

  const handleAddResource = () => {
    setFormData({
      name: "",
      schema: [{ name: "", dataType: "string" }],
      endpoints: [
        { method: "GET", path: "" },
        { method: "POST", path: "" },
        { method: "PUT", path: "" },
        { method: "DELETE", path: "" },
      ],
    })
    setIsEditMode(false)
    setEditingId(null)
    setIsModalOpen(true)
  }

  const handleEditResource = (resource: Resource) => {
    setFormData({
      name: resource.name,
      schema: resource.schema,
      endpoints: resource.endpoints,
    })
    setIsEditMode(true)
    setEditingId(resource.id)
    setIsModalOpen(true)
  }

  const handleSaveResource = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || formData.schema.some((s) => !s.name)) return

    const newResource: Resource = {
      id: isEditMode && editingId ? editingId : Date.now().toString(),
      name: formData.name,
      schema: formData.schema,
      endpoints: formData.endpoints,
    }

    if (isEditMode && editingId) {
      setResources(resources.map((r) => (r.id === editingId ? newResource : r)))
    } else {
      setResources([...resources, newResource])
    }

    setIsModalOpen(false)
  }

  const handleGenerateData = () => {
    if (formData.schema.length === 0) return

    const generateRandomValue = (dataType: string) => {
      switch (dataType) {
        case "number":
          return Math.floor(Math.random() * 1000)
        case "string":
          return `value_${Math.random().toString(36).substring(7)}`
        case "boolean":
          return Math.random() > 0.5
        case "email":
          return `user_${Math.random().toString(36).substring(7)}@example.com`
        default:
          return `value_${Math.random().toString(36).substring(7)}`
      }
    }

    const data = Array.from({ length: generateCount }, (_, index) => {
      const record: Record<string, unknown> = { id: index + 1 }
      formData.schema.forEach((field) => {
        record[field.name] = generateRandomValue(field.dataType)
      })
      return record
    })

    setFormData({ ...formData })
  }

  const handleDeleteResource = (id: string) => {
    const card = document.querySelector(`[data-resource-id="${id}"]`)
    if (card) {
      gsap.to(card, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          setResources(resources.filter((r) => r.id !== id))
        },
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-muted-foreground">
          <Link href="/projects" className="hover:text-cyan-400 transition-colors font-medium">
            Projects
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">{projectName}</span>
        </div>

        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Resources</h1>
          <p className="text-muted-foreground">Manage API resources and mock data for {projectName}</p>
        </div>

        {/* Add Resource Button */}
        <div className="mb-8">
          <Button
            onClick={handleAddResource}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 transition-all font-semibold"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Resource
          </Button>
        </div>

        {/* Resources Grid */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <div
              key={resource.id}
              data-resource-id={resource.id}
              data-resource-card
              className="bg-card border border-border rounded-lg p-6 hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/10 group cursor-pointer"
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, {
                  y: -5,
                  duration: 0.3,
                  ease: "power2.out",
                })
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, {
                  y: 0,
                  duration: 0.3,
                  ease: "power2.out",
                })
              }}
            >
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-foreground mb-2">{resource.name}</h3>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold">{resource.schema.length}</span> fields
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold">{resource.endpoints.length}</span> endpoints
                  </p>
                </div>
              </div>

              {/* Endpoints Preview */}
              <div className="mb-4 space-y-1">
                {resource.endpoints.map((endpoint, idx) => (
                  <div key={idx} className="text-xs">
                    <span
                      className={`inline-block px-2 py-1 rounded font-mono text-white mr-2 ${
                        endpoint.method === "GET"
                          ? "bg-green-600"
                          : endpoint.method === "POST"
                            ? "bg-blue-600"
                            : endpoint.method === "PUT"
                              ? "bg-yellow-600"
                              : "bg-red-600"
                      }`}
                    >
                      {endpoint.method}
                    </span>
                    <span className="text-muted-foreground font-mono text-xs">{endpoint.path}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleEditResource(resource)}
                  variant="outline"
                  className="flex-1 border-border bg-background text-foreground hover:bg-card hover:text-cyan-400 transition-colors"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  onClick={() => handleDeleteResource(resource.id)}
                  variant="outline"
                  className="flex-1 border-border bg-background text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {resources.length === 0 && (
          <div className="text-center py-12">
            <Plus className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No resources yet</h2>
            <p className="text-muted-foreground mb-6">Create your first resource to get started</p>
            <Button
              onClick={handleAddResource}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Resource
            </Button>
          </div>
        )}
      </main>

      {/* Resource Modal */}
      {isModalOpen && (
        <div ref={overlayRef} className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div
            ref={modalRef}
            className="bg-card border border-border rounded-lg p-8 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-foreground mb-6">
              {isEditMode ? "Edit Resource" : "Create New Resource"}
            </h2>

            <form onSubmit={handleSaveResource} className="space-y-6">
              {/* Resource Name */}
              <div className="space-y-2">
                <Label htmlFor="resource-name" className="text-foreground font-medium">
                  Resource Name
                </Label>
                <Input
                  id="resource-name"
                  type="text"
                  placeholder="e.g., Users, Products"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>

              {/* Schema Section */}
              <div className="space-y-4">
                <Label className="text-foreground font-medium">Schema</Label>
                <div className="space-y-3">
                  {formData.schema.map((field, idx) => (
                    <div key={idx} className="grid grid-cols-2 gap-2">
                      <Input
                        type="text"
                        placeholder="Field name"
                        value={field.name}
                        onChange={(e) => {
                          const newSchema = [...formData.schema]
                          newSchema[idx].name = e.target.value
                          setFormData({ ...formData, schema: newSchema })
                        }}
                        className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                        required
                      />
                      <select
                        value={field.dataType}
                        onChange={(e) => {
                          const newSchema = [...formData.schema]
                          newSchema[idx].dataType = e.target.value
                          setFormData({ ...formData, schema: newSchema })
                        }}
                        className="bg-background border border-border text-foreground rounded px-3 py-2"
                      >
                        <option value="string">string</option>
                        <option value="number">number</option>
                        <option value="boolean">boolean</option>
                        <option value="email">email</option>
                      </select>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      schema: [...formData.schema, { name: "", dataType: "string" }],
                    })
                  }
                  variant="outline"
                  className="w-full border-border bg-background text-cyan-400 hover:bg-card"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Field
                </Button>
              </div>

              {/* Endpoints Section */}
              <div className="space-y-4">
                <Label className="text-foreground font-medium">Endpoints</Label>
                <div className="space-y-3">
                  {formData.endpoints.map((endpoint, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-2 rounded font-mono text-white text-sm font-semibold min-w-fit ${
                            endpoint.method === "GET"
                              ? "bg-green-600"
                              : endpoint.method === "POST"
                                ? "bg-blue-600"
                                : endpoint.method === "PUT"
                                  ? "bg-yellow-600"
                                  : "bg-red-600"
                          }`}
                        >
                          {endpoint.method}
                        </span>
                        <Input
                          type="text"
                          placeholder={`e.g., /api/${formData.name.toLowerCase()}`}
                          value={endpoint.path}
                          onChange={(e) => {
                            const newEndpoints = [...formData.endpoints]
                            newEndpoints[idx].path = e.target.value
                            setFormData({ ...formData, endpoints: newEndpoints })
                          }}
                          className="bg-background border-border text-foreground placeholder:text-muted-foreground flex-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generate Data Section */}
              <div className="bg-background p-4 rounded-lg border border-border space-y-4">
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Generate Mock Data</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={generateCount}
                      onChange={(e) => setGenerateCount(parseInt(e.target.value))}
                      className="bg-background border-border text-foreground w-24"
                    />
                    <span className="text-muted-foreground text-sm">records</span>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handleGenerateData}
                  variant="outline"
                  className="w-full border-border bg-background text-cyan-400 hover:bg-card"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Auto Generate
                </Button>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  variant="outline"
                  className="flex-1 border-border bg-background text-foreground hover:bg-card"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
                >
                  {isEditMode ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
