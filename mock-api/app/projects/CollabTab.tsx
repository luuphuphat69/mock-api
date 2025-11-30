"use client";

import { useEffect, useState, useRef } from "react";
import { Code2 } from "lucide-react";
import { useProjects } from "@/hooks/useProject";
import { useUser } from "@/hooks/useUser";
import { LoadingScreen } from "@/components/loading-screen";
import { useRouter } from "next/navigation";

import ProjectGrid from "./ProjectGrid"
import ShareMemberModal from "./collaboration/ShareMemberModal";

export default function CollaborationTab() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { collabProjects, fetchCollabProjects } = useProjects();
  const { user, fetchUser } = useUser();
  const router = useRouter();

  const [isCollaborateOpen, setIsCollaborateOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<IProject | null>(null);

  // Edit in collaboration view -> maybe only open project
  const handleEditProject = (project: IProject) => {
    router.push(`/projects/${project.projectId}/resources`);
  };

  // Share button (opens modal)
  const handleShareProject = (project: IProject) => {
    setSelectedProject(project);
    setIsCollaborateOpen(true);
  };

  // Remove collab? Optional for later
  const handleDeleteProject = (projectId: string) => {
    console.log("Delete disabled for collaboration view:", projectId);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      setIsLoading(true);
      try {
        await fetchCollabProjects(user.id);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [user?.id]);

  return (
    <div>
      <LoadingScreen isVisible={isLoading} />

      <h2 className="text-2xl font-bold mb-4">Collaboration</h2>

      {/* Reusable Grid */}
      {collabProjects.length > 0 && (
        <ProjectGrid
          projects={collabProjects}
          onEdit={handleEditProject}
          onShare={handleShareProject}
          onDelete={handleDeleteProject} 
        />
      )}

      {/* Empty State */}
      {collabProjects.length === 0 && (
        <div className="text-center py-12">
          <Code2 className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            No collaboration projects yet
          </h2>
        </div>
      )}

      {/* Share Modal */}
      {isCollaborateOpen && selectedProject && (
        <ShareMemberModal
          selectedProjectForSettings={selectedProject}
          onClose={() => setIsCollaborateOpen(false)}
        />
      )}
    </div>
  );
}