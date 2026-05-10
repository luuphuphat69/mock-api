"use client"
import { useState, useEffect, useRef } from "react"
import { ChevronRight, Plus, Trash2, RotateCcw, RefreshCw, Copy, Key, Activity, Database, AlertCircle } from 'lucide-react'
import Link from "next/link"
import { useParams } from 'next/navigation'
import gsap from "gsap"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"
import { toast } from "sonner"
import { useUser } from "../../../../hooks/useUser";
import { addResource, deleteResource, editResource, getResourceByProjectId, getLogs, clearLogs, getProjectById } from "@/utilities/api/api"
import { Spinner } from "@/components/ui/shadcn-io/spinner"
// Components
import { ResourceCard } from "./components/ResourceCard"
import { ResourceFormModal } from "./components/ResourceFormModal"
import { ResourceDataModal } from "./components/ResourceDataModal"
import { LoadingScreen } from "@/components/loading-screen"
import { RenewKeyConfirmModal } from "./components/RenewApiConfirmModal"

export default function ResourcesPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const [project, setProject] = useState({ prefix: '', name: '' });
  const [resources, setResource] = useState<IResource[] | null>(null)
  const { user, fetchUser } = useUser()
  const [apiKey, setApiKey] = useState('')
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false)
  const [projectNotFound, setProjectNotFound] = useState(false);

  // Modals State
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<IResource | null>(null)
  const [viewingResource, setViewingResource] = useState<IResource | null>(null)

  // Loading States
  const [isLoading, setIsLoading] = useState(false)
  const [isLogsLoading, setIsLogsLoading] = useState(false)
  const [showRenewConfirm, setShowRenewConfirm] = useState(false)
  const [activityLogs, setActivityLogs] = useState<ILogs[]>([]);

  const gridRef = useRef<HTMLDivElement>(null)

  const fetchResources = async () => {
    setIsLoading(true)
    try {
      if (user) {
        const res = await getResourceByProjectId(user.id, projectId)
        setResource(res.data)
        setProjectNotFound(false);
      }
    } catch (err) {
      setProjectNotFound(true);
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchProject = async () => {
    setIsLoading(true)
    try {
      if (user) {
        const res = await getProjectById(projectId)
        setProject(res.data)
      }
    } catch (err) {
      console.error(err)
      setProjectNotFound(true);
    } finally {
      setIsLoading(false)
    }
  }

  const fetchLogs = async () => {
    setIsLogsLoading(true)
    try {
      const res = await getLogs(projectId);
      const sortedLogs = res.data.sort((a: ILogs, b: ILogs) =>
        new Date(b.time).getTime() - new Date(a.time).getTime()
      );
      setActivityLogs(sortedLogs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLogsLoading(false)
    }
  }

  useEffect(() => {
    if (!user) {
      fetchUser()
    }
    if (user) {
      fetchResources();
    }
    fetchProject();
    fetchLogs()
  }, [projectId, user])

  useEffect(() => {
    if (gridRef.current) {
      const cards = gridRef.current.querySelectorAll("[data-resource-card]")
      gsap.fromTo(cards, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" })
    }
  }, [resources])

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
      toast.success("Logs cleared");
      fetchLogs();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to clear logs")
    }
  }

  const handleCopyKey = async () => {
    if (!apiKey) {
      toast.error("No API key available to copy.");
      return;
    }
    if (!isApiKeyVisible) {
      toast.error("Please renew the key to view and copy it.");
      return;
    }

    try {
      await navigator.clipboard.writeText(apiKey);
      toast.success("API Key copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy API key:", err);
      toast.error("Failed to copy. Please try manually.");
    }
  };

  if (projectNotFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-center max-w-md p-8 bg-white rounded-xl border border-[#E5E5E5] shadow-sm">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-semibold text-[#111111] mb-2">
            Project unavailable
          </h1>
          <p className="text-[#6B6B6B] mb-6">
            This project no longer exists or you don't have permission to access it.
          </p>
          <Link
            href="/projects"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#2F6FEB] text-white hover:bg-[#255fd4] transition-colors font-medium text-sm"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <LoadingScreen isVisible={isLoading} />
      <div className="min-h-screen bg-[#FAFAFA] text-[#111111]">
        <Header />

        <main className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-2 text-sm text-[#6B6B6B]">
            <Link href="/projects" className="hover:text-[#2F6FEB] transition-colors">Projects</Link>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            <span className="text-[#111111] font-medium">Resources</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            {/* Header & Action */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Database className="w-6 h-6 text-[#2F6FEB]" />
                <h1 className="text-3xl font-bold tracking-tight text-[#111111]">
                  {project.name || "Resources"}
                </h1>
              </div>
              <p className="text-[#6B6B6B]">Manage your API endpoints and mock data schemas</p>
            </div>

            {/* API Key Section */}
            <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 w-full lg:w-80 shadow-sm">
              <div className="flex items-center gap-2 mb-3 text-[#111111]">
                <Key className="w-4 h-4 text-[#2F6FEB]" />
                <span className="text-sm font-semibold tracking-tight">Project API Key</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-[#FAFAFA] px-3 py-2 rounded-lg border border-[#E5E5E5] group relative overflow-hidden">
                  <code className="block text-xs text-[#6B6B6B] font-mono truncate">
                    {isApiKeyVisible ? apiKey : "••••••••••••••••••••••••"}
                  </code>
                </div>
                <div className="flex items-center gap-1">
                  {isApiKeyVisible && (
                    <button
                      onClick={handleCopyKey}
                      className="p-2 text-[#6B6B6B] hover:text-[#2F6FEB] hover:bg-[#F0F4FF] transition-all rounded-lg"
                      title="Copy API key"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setShowRenewConfirm(true)}
                    className="p-2 text-[#6B6B6B] hover:text-[#2F6FEB] hover:bg-[#F0F4FF] transition-all rounded-lg"
                    title="Renew API key"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <Button
              onClick={() => {
                if (resources && resources.length >= 3 && user?.type === 'free') {
                  toast.error("Maximum 3 resources allowed for the free tier")
                  return
                }
                setEditingResource(null)
                setIsFormOpen(true)
              }}
              className="bg-[#2F6FEB] text-white hover:bg-[#255fd4] shadow-sm transition-all font-medium rounded-lg h-10"
            >
              <Plus className="w-4 h-4 mr-2" /> Create Resource
            </Button>
          </div>

          {/* Grid */}
          {resources && resources.length > 0 ? (
            <div ref={gridRef}
              data-testid='resource-grid-container'
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource) => (
                <ResourceCard
                  key={resource._id}
                  version={project.prefix}
                  resource={resource}
                  onView={(res) => setViewingResource(res)}
                  onEdit={(res) => { setEditingResource(res); setIsFormOpen(true) }}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : !isLoading && (
            <div className="text-center py-20 bg-white border border-dashed border-[#E5E5E5] rounded-2xl">
              <div className="w-16 h-16 bg-[#FAFAFA] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#E5E5E5]">
                <Plus className="w-8 h-8 text-[#6B6B6B] opacity-40" />
              </div>
              <h2 className="text-lg font-semibold text-[#111111] mb-1">No resources found</h2>
              <p className="text-[#6B6B6B] text-sm mb-6 max-w-xs mx-auto">Start by creating a resource to define your API endpoint and mock data.</p>
              <Button 
                variant="outline"
                onClick={() => setIsFormOpen(true)}
                className="border-[#E5E5E5] hover:bg-[#FAFAFA]"
              >
                Add first resource
              </Button>
            </div>
          )}

          {/* Activity Logs Section */}
          <section className="mt-20">
            <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-[#E5E5E5] flex items-center justify-between bg-white">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#F0F4FF] text-[#2F6FEB] rounded-lg">
                    <Activity className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-semibold tracking-tight">Recent Activity</h2>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={fetchLogs}
                    disabled={isLogsLoading}
                    className="p-2 text-[#6B6B6B] hover:text-[#111111] hover:bg-[#FAFAFA] rounded-lg transition-all disabled:opacity-40"
                    title="Refresh logs"
                  >
                    <RotateCcw className={`w-4 h-4 ${isLogsLoading ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={() => user && hanldeClearLog(user.id, projectId)}
                    className="p-2 text-[#6B6B6B] hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Clear activity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-0">
                {isLogsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Spinner />
                  </div>
                ) : activityLogs.length > 0 ? (
                  <div className="max-h-[400px] overflow-y-auto divide-y divide-[#E5E5E5]">
                    {activityLogs.map((log) => (
                      <div
                        key={log._id}
                        className="flex items-center justify-between p-4 hover:bg-[#FAFAFA] transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-[#FAFAFA] border border-[#E5E5E5] flex items-center justify-center text-[10px] font-bold text-[#6B6B6B] uppercase">
                            {log.username.substring(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#111111] leading-none mb-1">{log.action}</p>
                            <p className="text-xs text-[#6B6B6B]">By {log.username}</p>
                          </div>
                        </div>
                        <time className="text-xs text-[#6B6B6B] font-mono opacity-60 group-hover:opacity-100 transition-opacity">
                          {new Date(log.time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </time>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <p className="text-sm text-[#6B6B6B]">No activity recorded yet</p>
                  </div>
                )}
              </div>
            </div>
          </section>
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

      <RenewKeyConfirmModal
        isOpen={showRenewConfirm}
        projectId={projectId}
        onClose={() => setShowRenewConfirm(false)}
        onConfirm={async (newKey: string) => {
          setShowRenewConfirm(false)
          setApiKey(newKey);
          setIsApiKeyVisible(true);
          toast.success("API key renewed successfully! Please copy your new key.");
        }}
      />
    </>
  )
}