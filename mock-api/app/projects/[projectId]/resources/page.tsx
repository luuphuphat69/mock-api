"use client"
import { useState, useEffect, useRef } from "react"
import { ChevronRight, Plus, Trash2, RotateCcw } from 'lucide-react'
import Link from "next/link"
import { useParams } from 'next/navigation'
import gsap from "gsap"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"
import { toast } from "sonner"
import { useUser } from "../../../../hooks/useUser";
import { addResource, deleteResource, editResource, getKey, getResourceByProjectId, getLogs, clearLogs } from "@/utilities/api/api"
import { Spinner } from "@/components/ui/shadcn-io/spinner"
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
  
  // Loading States
  const [isLoading, setIsLoading] = useState(false) // For resources/full page
  const [isLogsLoading, setIsLogsLoading] = useState(false) // New state for logs
  
  const [activityLogs, setActivityLogs] = useState<ILogs[]>([]);

  const gridRef = useRef<HTMLDivElement>(null)

  const fetchResources = async () => {
    setIsLoading(true)
    try {
      if (user) {
        const res = await getResourceByProjectId(user.id, projectId)
        setResource(res.data)
      }
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

  const fetchLogs = async () => {
    setIsLogsLoading(true) // Start loading
    try {
      const res = await getLogs(projectId);

      // Sort: B - A results in Descending order (Newest first)
      const sortedLogs = res.data.sort((a: ILogs, b: ILogs) =>
        new Date(b.time).getTime() - new Date(a.time).getTime()
      );

      setActivityLogs(sortedLogs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLogsLoading(false) // End loading
    }
  }

  useEffect(() => {
    fetchKey();

    // If user isn't loaded yet, try to fetch them
    if (!user) {
      fetchUser()
    }

    // Only fetch resources if we actually have the user object
    if (user) {
      fetchResources();
    }

    fetchLogs()
  }, [projectId, user])

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
        await editResource(user.id, projectId, editingResource._id, {
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

  const handleDelete = async (id: string) => {
    const card = document.querySelector(`[data-resource-id="${id}"]`) as HTMLElement;
    if (!card || !user) return;

    try {
      await gsap.to(card, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: "power2.in",
      });

      await deleteResource(user.id, projectId, id);
      await fetchResources();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete");

      // restore item if delete failed
      gsap.to(card, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  };

  const hanldeClearLog = async (requestid: string, projectId: string) => {
    try {
      await clearLogs(requestid, projectId);
      toast.success("Logs are cleared");
      fetchLogs();
    } catch (err: any) {
      toast.error(err.response.data.message)
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
          initialData={editingResource ? { name: editingResource.name, schema: editingResource.schemaFields, records: [] } : null}
        />

        <ResourceDataModal
          isOpen={!!viewingResource}
          resource={viewingResource}
          onClose={() => setViewingResource(null)}
        />
      </div>

      <div className="max-w-7xl mx-auto mt-12 mb-12">
        <div className="bg-card border border-border rounded-lg p-6">

          {/* Header Row: Flex container to align items */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Activity Logs</h2>

            {/* Buttons Group */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (user) {
                    hanldeClearLog(user.id, projectId)
                  }
                }}
                className="p-2 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
                title="Clear logs"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={fetchLogs}
                disabled={isLogsLoading}
                className={`p-2 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground ${isLogsLoading ? 'opacity-50' : ''}`}
                title="Refresh logs"
              >
                <RotateCcw className={`w-4 h-4 ${isLogsLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Logs List */}
          {isLogsLoading ? (
            <div className="flex items-center justify-center h-32">
              <Spinner />
            </div>
          ) : activityLogs.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {activityLogs.map((log) => (
                <div
                  key={log._id}
                  className="flex items-center justify-between p-3 bg-background rounded border border-border/50"
                >
                  <div className="flex-1">
                    <p className="text-sm text-foreground font-medium">{log.action}</p>
                    <p className="text-xs text-muted-foreground">By {log.username}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.time).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No activity yet</p>
          )}
        </div>
      </div>
    </>
  )
}