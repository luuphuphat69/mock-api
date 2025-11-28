"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { ChevronRight, Plus } from 'lucide-react'
import Link from "next/link"
import { useParams } from 'next/navigation'
import gsap from "gsap"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"
import { toast } from "sonner"
import { useUser } from "../../../../hooks/useUser";
import { addResource, deleteResource, editResource, getKey, getResourceByProjectId } from "@/utilities/api/api"

// Components
import { ResourceCard } from "./components/ResourceCard"
import { ResourceFormModal } from "./components/ResourceFormModal"
import { ResourceDataModal } from "./components/ResourceDataModal"
import { LoadingScreen } from "@/components/loading-screen"

export default function ResourcesPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const [resources, setResource] = useState<IResource[] | null>(null)
  const { user, fetchUser } = useUser()
  const [apiKey, setApiKey] = useState('')
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false)

  // Modals State
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<IResource | null>(null)
  const [viewingResource, setViewingResource] = useState<IResource | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const gridRef = useRef<HTMLDivElement>(null)

  const fetchResources = async () => {
    setIsLoading(true)
    try {
      const res = await getResourceByProjectId(projectId)
      setResource(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchKey = async () => {
    try {
      const res = await getKey(projectId);
      setApiKey(res.apiKey)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchKey();
    fetchUser()
    fetchResources();
  }, [projectId])

  // Animate grid on load
  useEffect(() => {
    if (gridRef.current) {
      const cards = gridRef.current.querySelectorAll("[data-resource-card]")
      gsap.fromTo(cards, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" })
    }
  }, [resources])

  // --- Handlers ---

  const handleSave = async (data: { name: string; schema: ISchemaField[]; records?: any[] }) => {
    try {
      if (editingResource && user) {
        await editResource(user.id, editingResource._id, {
          name: data.name,
          schemaFields: data.schema,
          ...(data.records && { records: data.records }),
        })
        toast.success("Resource updated successfully!")
      } else {
        if (!user?.id) {
          toast.error("You must log in first")
          return
        }
        await addResource(user.id, projectId, {
          name: data.name,
          schemaFields: data.schema,
          records: data.records || [],
        })
        toast.success("Resource created successfully!")
      }
      setIsFormOpen(false)
      setEditingResource(null)
      fetchResources()
    } catch (err) {
      console.error(err)
      toast.error("Failed to save resource")
    }
  }

  const handleDelete = (id: string) => {
    const card = document.querySelector(`[data-resource-id="${id}"]`)
    if (card && user) {
      gsap.to(card, {
        opacity: 0, y: -20, duration: 0.3, ease: "power2.in",
        onComplete: () => {
          deleteResource(user.id , projectId, id).then(() => fetchResources())
        },
      })
    }
  }

  const copyToClipboard = (text: string, type: string = "text") => {
    navigator.clipboard.writeText(text)
    toast.success("Copied !", {
      action: {
        label: "Undo",
        onClick: () => console.log("Undo"),
      },
    })
  }

  return (
    <>
      <LoadingScreen isVisible={isLoading} />
      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb */}
          <div className="mb-8 flex items-center gap-2 text-muted-foreground">
            <Link href="/projects" className="hover:text-cyan-400 transition-colors font-medium">Projects</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">{projectId}</span>
          </div>

          <div className="mb-8 flex items-start justify-between">
            {/* Header & Action */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-2">Resources</h1>
              <p className="text-muted-foreground">Manage API resources and mock data</p>
            </div>
            {/* API Key Section */}
            <div className="bg-background border border-border rounded-lg p-4 w-72">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-foreground">API Key</span>
                <button
                  onClick={() => setIsApiKeyVisible(!isApiKeyVisible)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                >
                  {isApiKeyVisible ? "Hide" : "Show"}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs text-muted-foreground bg-card p-2 rounded border border-border/50 font-mono overflow-hidden text-ellipsis">
                  {isApiKeyVisible ? apiKey : "••••••••••••••••••••"}
                </code>
                <button
                  onClick={() => copyToClipboard(apiKey, "API Key")}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors p-2 hover:bg-cyan-500/10 rounded"
                  title="Copy API key"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <Button
              onClick={() => {
                if (resources && resources.length >= 3 && user?.type === 'free') {
                  toast.error("Maximum 3 resources allowed for the free tier")
                  return
                }
                setEditingResource(null)
                setIsFormOpen(true)
              }}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 transition-all font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" /> Add New Resource
            </Button>
          </div>


          {/* Grid */}
          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources?.map((resource) => (
              <ResourceCard
                key={resource._id}
                apiKey={apiKey}
                resource={resource}
                onView={(res) => setViewingResource(res)}
                onEdit={(res) => { setEditingResource(res); setIsFormOpen(true) }}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Empty State */}
          {resources?.length === 0 && (
            <div className="text-center py-12">
              <Plus className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-semibold text-foreground mb-2">No resources yet</h2>
              <Button
                onClick={() => { setEditingResource(null); setIsFormOpen(true) }}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
              >
                Create Resource
              </Button>
            </div>
          )}
        </main>

        {/* Modals */}
        <ResourceFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleSave}
          initialData={editingResource ? { name: editingResource.name, schema: editingResource.schemaFields, records:[] } : null}
        />

        <ResourceDataModal
          isOpen={!!viewingResource}
          resource={viewingResource}
          onClose={() => setViewingResource(null)}
        />
      </div>
    </>
  )
}