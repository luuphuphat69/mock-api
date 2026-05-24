"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { BarChart3, Edit2, FolderKanban, Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProjectGridProps {
  projects: IProject[];
  onEdit: (project: IProject) => void;
  onShare: (project: IProject) => void;
  onDelete: (projectId: string) => void;
}

export default function ProjectGrid({
  projects,
  onEdit,
  onShare,
  onDelete,
}: ProjectGridProps) {
  const router = useRouter();
  const gridRef = useRef<HTMLDivElement>(null);

  const openProject = (projectId: string) => {
    router.push(`/projects/${projectId}/resources`);
  };

  if (projects.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-background">
          <FolderKanban className="h-5 w-5 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold tracking-[-0.01em] text-foreground">
          No projects yet
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          Create your first project and it will appear here with quick access to resources, metrics, sharing, and settings.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={gridRef}
      data-testid="project-grid-container"
      className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
    >
      {projects.map((project) => (
        <div
          key={project.projectId}
          data-project-id={project.projectId}
          data-testid="project-card"
          data-project-card
          className="group rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-sm"
        >
          <button
            type="button"
            aria-label={`Open ${project.name}`}
            className="mb-5 flex w-full items-start justify-between gap-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
            onClick={() => openProject(project.projectId)}
          >
            <span className="min-w-0 space-y-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-primary">
                <FolderKanban className="h-5 w-5" />
              </span>
              <span className="block space-y-1">
                <span
                  data-testid="project-name"
                  className="block truncate text-xl font-semibold tracking-[-0.01em] text-foreground"
                >
                  {project.name}
                </span>
                <span className="block text-sm leading-6 text-muted-foreground">
                  {project.description ? project.description : '[description]'}
                </span>
              </span>
            </span>

            <span
              data-testid="project-version"
              className="shrink-0 rounded-full border border-border bg-background px-3 py-1 font-mono text-xs text-muted-foreground"
            >
              {project.prefix}
            </span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={(event) => {
                event.stopPropagation();
                onEdit(project);
              }}
              variant="outline"
              className="justify-start border-border bg-background"
              aria-label={`Edit ${project.name}`}
            >
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </Button>

            <Button
              onClick={(event) => {
                event.stopPropagation();
                router.push(`/projects/${project.projectId}/metrics`);
              }}
              variant="outline"
              className="justify-start border-border bg-background"
              aria-label={`View metrics for ${project.name}`}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Metrics
            </Button>

            <Button
              onClick={(event) => {
                event.stopPropagation();
                onShare(project);
              }}
              variant="outline"
              className="justify-start border-border bg-background"
              aria-label={`Share ${project.name}`}
            >
              <Users className="mr-2 h-4 w-4" />
              Share
            </Button>

            <Button
              onClick={(event) => {
                event.stopPropagation();
                onDelete(project.projectId);
              }}
              variant="outline"
              className="justify-start border-border bg-background text-destructive hover:bg-red-700 hover:text-white"
              aria-label={`Delete ${project.name}`}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}