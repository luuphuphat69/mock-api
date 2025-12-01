"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { Edit2, Users, Trash2 } from "lucide-react";
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

  // GSAP card animation
  useEffect(() => {
    if (gridRef.current) {
      const cards = gridRef.current.querySelectorAll("[data-project-card]");
      gsap.fromTo(
        cards,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: "power4.out" }
      );
    }
  }, [projects]);

  return (
    <div
      ref={gridRef}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {projects.map((project) => (
        <div
          key={project.projectId}
          data-project-id={project.projectId}
          data-project-card
          className="bg-card border border-border rounded-lg p-6 group hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/10 cursor-pointer"
          onClick={() => router.push(`/projects/${project.projectId}/resources`)}
          onMouseEnter={(e) =>
            gsap.to(e.currentTarget, { y: -5, duration: 0.3 })
          }
          onMouseLeave={(e) =>
            gsap.to(e.currentTarget, { y: 0, duration: 0.3 })
          }
        >
          <div className="mb-4">
            <h3 className="text-xl font-semibold">{project.name}</h3>
            <p className="text-sm text-muted-foreground font-mono bg-background px-3 py-2 rounded border border-border">
              {project.prefix}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(project);
              }}
              variant="outline"
              className="flex-1 border-border bg-background"
            >
              <Edit2 className="w-4 h-4 mr-2" /> Edit
            </Button>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                onShare(project);
              }}
              variant="outline"
              className="flex-1 border-border bg-background text-cyan-400 hover:bg-cyan-500"
            >
              <Users className="w-4 h-4 mr-2" /> Share
            </Button>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(project.projectId);
              }}
              variant="outline"
              className="flex-1 border-border bg-background text-red-400 hover:bg-red-500"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
