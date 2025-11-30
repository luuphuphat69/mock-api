"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Code2, Plus, Trash2, Edit2, Users } from "lucide-react"
import gsap from "gsap"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import Header from "@/components/header"
import { useUser } from "../../hooks/useUser"
import { useProjects } from "@/hooks/useProject"
import { useRouter } from "next/navigation"
import { LoadingScreen } from "@/components/loading-screen"
import ShareMemberModal from "./collaboration/ShareMemberModal"

export default function ProjectsPage() {
  const { projects, fetchProjects, addProject, deleteProject, patchProject } = useProjects();
  const { user, fetchUser } = useUser()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isCollaborateOpen, setIsCollaborateOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<IProject | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: "", prefix: "" })
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const router = useRouter()

  const gridRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const confirmModalRef = useRef<HTMLDivElement>(null)
  const confirmOverlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchUser()
  }, [])

  useEffect(() => {
    if (gridRef.current) {
      const cards = gridRef.current.querySelectorAll("[data-project-card]")
      gsap.fromTo(
        cards,
        {
          opacity: 0,
          y: 30,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.05,
          ease: "power2.out",
        },
      )
    }
  }, [user?.id])

  useEffect(() => {
    if (isModalOpen && modalRef.current && overlayRef.current) {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" })
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.95, y: -20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" },
      )
    } else if (!isModalOpen && modalRef.current && overlayRef.current) {
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
      })
      gsap.to(modalRef.current, {
        opacity: 0,
        scale: 0.95,
        y: -20,
        duration: 0.3,
        ease: "back.in",
      })
    }
  }, [isModalOpen])

  useEffect(() => {
    if (showDeleteConfirm && confirmModalRef.current && confirmOverlayRef.current) {
      gsap.fromTo(confirmOverlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" })
      gsap.fromTo(
        confirmModalRef.current,
        { opacity: 0, scale: 0.95, y: -20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" },
      )
    } else if (!showDeleteConfirm && confirmModalRef.current && confirmOverlayRef.current) {
      gsap.to(confirmOverlayRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
      })
      gsap.to(confirmModalRef.current, {
        opacity: 0,
        scale: 0.95,
        y: -20,
        duration: 0.3,
        ease: "back.in",
      })
    }
  }, [showDeleteConfirm])

  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      setIsLoading(true);
      try {
        await fetchProjects(user.id);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [user?.id]);


  const handleAddProject = () => {
    const countProject = projects.length;
    if (countProject === 5 && user?.type === 'free') {
      return toast.error("Maximum 5 projects", {
        action: {
          label: "Undo",
          onClick: () => console.log("Undo"),
        },
      });
    }
    setFormData({ name: "", prefix: "" })
    setIsEditMode(false)
    setEditingId(null)
    setIsModalOpen(true)
  }

  const handleEditProject = (project: IProject) => {
    setFormData({ name: project.name, prefix: project.prefix })
    setIsEditMode(true)
    setEditingId(project.projectId)
    setIsModalOpen(true)
  }

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.prefix || !user?.id) return;

    const versionRegex = /^\/v[0-9]+$/;

    if (!versionRegex.test(formData.prefix)) {
      return toast.error("Invalid API version. Only formats like /v0, /v1, /v2 are allowed.");
    }

    setIsSaving(true);

    try {
      if (isEditMode && editingId) {
        await patchProject(user.id, editingId, {
          name: formData.name,
          prefix: formData.prefix
        });
      } else {
        await addProject({
          name: formData.name,
          prefix: formData.prefix,
          userId: user.id,
        });
      }

      await fetchProjects(user.id);
      setIsModalOpen(false);

    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
      setFormData({ name: "", prefix: "" });
      setEditingId(null);
      setIsEditMode(false);
    }
  };


  const handleDeleteProject = (id: string) => {
    setProjectToDelete(id)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = (userid: string, id: string) => {
    const card = document.querySelector(`[data-project-id="${id}"]`);
    if (card) {
      gsap.to(card, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          deleteProject(userid, id);
          setShowDeleteConfirm(false);
          setProjectToDelete(null);
        },
      });
    }
  };

  return (
    <>
      <LoadingScreen isVisible={isLoading} />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Main Content */}
        <main className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Your Projects</h1>
            <p className="text-muted-foreground">Manage and test your mock API endpoints</p>
          </div>

          {/* Add Project Button */}
          <div className="mb-8">
            <Button
              onClick={handleAddProject}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 transition-all font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Project
            </Button>
          </div>

          {/* Projects Grid */}
          {projects.length > 0 && <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.projectId}
                data-project-id={project.projectId}
                data-project-card
                onClick={() => router.push(`/projects/${project.projectId}/resources`)}
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
                  <h3 className="text-xl font-semibold text-foreground mb-1">{project.name}</h3>
                  <p className="text-sm text-muted-foreground font-mono bg-background px-3 py-2 rounded border border-border">
                    {project.prefix}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditProject(project)
                    }
                    }
                    variant="outline"
                    className="flex-1 border-border bg-background text-foreground hover:bg-card hover:text-cyan-400 transition-colors"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCollaborateOpen(true);
                      setSelectedProject(project);
                    }}
                    variant="outline"
                    className="flex-1 border-border bg-background text-cyan-400 hover:bg-cyan-500 transition-colors"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.projectId)
                    }
                    }
                    variant="outline"
                    className="flex-1 border-border bg-background text-red-400 hover:bg-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>}

          {/* Empty State */}
          {projects.length === 0 && (
            <div className="text-center py-12">
              <Code2 className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-semibold text-foreground mb-2">No projects yet</h2>
              <p className="text-muted-foreground mb-6">Create your first project to get started</p>
              <Button
                onClick={handleAddProject}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </div>
          )}
        </main>

        {/* Collabte modal*/}
        {isCollaborateOpen && selectedProject && (
          <ShareMemberModal
            selectedProjectForSettings={selectedProject}
            onClose={() => setIsCollaborateOpen(false)}
          />
        )}

        {/* Modal */}
        {isModalOpen && (
          <div ref={overlayRef} className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div ref={modalRef} className="bg-card border border-border rounded-lg p-8 w-full max-w-md shadow-xl">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                {isEditMode ? "Edit Project" : "Create New Project"}
              </h2>

              <form onSubmit={handleSaveProject} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="project-name" className="text-foreground font-medium">
                    Project Name
                  </Label>
                  <Input
                    id="project-name"
                    type="text"
                    placeholder="e.g., User API"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api-prefix" className="text-foreground font-medium">
                    API Version
                  </Label>
                  <Input
                    id="api-prefix"
                    type="text"
                    placeholder="e.g., /v1"
                    value={formData.prefix}
                    onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>

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
                    disabled={isSaving}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
                  >
                    {isSaving ? (
                      <Spinner className="w-5 h-5" />
                    ) : (
                      isEditMode ? "Update" : "Create"
                    )}
                  </Button>

                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div ref={confirmOverlayRef} className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div ref={confirmModalRef} className="bg-card border border-border rounded-lg p-8 w-full max-w-md shadow-xl">
              <h2 className="text-2xl font-bold text-foreground mb-2">Delete Project?</h2>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete this project? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  variant="outline"
                  className="flex-1 border-border bg-background text-foreground hover:bg-card"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (user?.id && projectToDelete) {
                      handleConfirmDelete(user.id, projectToDelete)
                    }
                  }}
                  className="flex-1 bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}