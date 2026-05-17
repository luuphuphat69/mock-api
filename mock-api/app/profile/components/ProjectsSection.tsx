'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Database,
  Globe,
  Lock,
  Users,
  UserMinus,
  Shield,
  Trash2,
  ChevronUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { useProjects } from '@/hooks/useProject';
import { useUser } from '@/hooks/useUser';
import { getMembers, leaveProject, removeMember, updateMemberRole, updateProjectVisibility } from '@/utilities/api/api';


interface ProjectWithMembers extends IProject {
  members?: IMember[];
  isPublic?: boolean;
}

interface ProjectsSectionProps {
  mode: 'owned' | 'joined';
}

export default function ProjectsSection({ mode }: ProjectsSectionProps) {
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [membersMap, setMembersMap] = useState<Record<string, IMember[]>>({});
  const [membersLoading, setMembersLoading] = useState<Record<string, boolean>>({});

  const {
    projects,
    collabProjects,
    fetchProjects,
    updateProject,
    deleteCollabProject,
    fetchCollabProjects,
  } = useProjects();
  const { user, fetchUser } = useUser();

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;

    const loadProjects = async () => {
      try {
        setIsLoading(true);
        if (mode === 'owned') {
          await fetchProjects();
        } else {
          await fetchCollabProjects();
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load projects');
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, [user?.id, mode]);

  const filteredProjects = useMemo(() => {
    if (mode === 'owned') {
      return (projects || []) as ProjectWithMembers[];
    }

    return (collabProjects || []) as ProjectWithMembers[];
  }, [projects, collabProjects, mode]);

  const loadMembers = async (projectId: string) => {
    // already loaded
    if (membersMap[projectId]) return;

    try {
      setMembersLoading((prev) => ({
        ...prev,
        [projectId]: true,
      }));

      const res = await getMembers(projectId);

      setMembersMap((prev) => ({
        ...prev,
        [projectId]: res.data || [],
      }));
    } catch (err) {
      console.error(err);
      toast.error('Failed to load members');
    } finally {
      setMembersLoading((prev) => ({
        ...prev,
        [projectId]: false,
      }));
    }
  };

  const togglePublic = async (projectId: string) => {
    try {
      if (!user) return;

      const currentProject = filteredProjects.find(
        (p) => p.projectId === projectId
      );

      if (!currentProject) return;

      const newVisibility = !currentProject.isPublic;

      await updateProjectVisibility(
        projectId,
        {
          isPublic: newVisibility,
        }
      );

      // update zustand state instantly
      updateProject(projectId, {
        isPublic: newVisibility,
      });

      toast.success(
        `Project is now ${newVisibility ? 'PUBLIC' : 'PRIVATE'
        }`
      );
    } catch (err: any) {
      console.error(err);

      toast.error(
        err.response?.data?.message ||
        'Failed to update visibility'
      );
    }
  };

  const handleLeaveProject = async (id: string) => {
    try {
      const confirmed = window.confirm(
        'TERMINATE MEMBERSHIP: Are you sure you want to leave this project?'
      );

      if (!confirmed) return;

      await leaveProject(id);

      // update UI instantly
      deleteCollabProject(id);

      toast.success('Membership terminated successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to leave project');
    }
  };

  const handleUpdateMemberRole = async (
    userid: string,
    projectid: string,
    role: string
  ) => {
    try {
      await updateMemberRole(userid, projectid, role);

      // update local UI state instantly
      setMembersMap((prev) => ({
        ...prev,
        [projectid]: prev[projectid].map((member) =>
          member.userId === userid
            ? {
              ...member,
              role,
            }
            : member
        ),
      }));

      toast.success('Role updated successfully');
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || 'Failed to update role'
      );
    }
  };

  const handleRemoveMember = async (
    userid: string,
    projectid: string
  ) => {
    try {
      await removeMember(
        userid,
        projectid
      );

      // update UI instantly
      setMembersMap((prev) => ({
        ...prev,
        [projectid]: prev[projectid].filter(
          (member) => member.userId !== userid
        ),
      }));

      toast.success('Member removed');
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
        'Failed to remove member'
      );
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
        <div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-1">
            {mode === 'owned'
              ? 'Managed Workspaces'
              : 'Shared Workspaces'}
          </h2>

          <p className="text-[11px] text-gray-500 font-medium">
            {mode === 'owned'
              ? 'Administrator view: Control projects and registries.'
              : 'Collaborator view: Shared project memberships.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-gray-400">
            COUNT:
          </span>

          <span className="text-xs font-bold text-[#2F6FEB] tabular-nums">
            {filteredProjects.length}
          </span>
        </div>
      </div>

      {/* Project List */}
      <div className="grid gap-4">
        {filteredProjects.map((project) => (
          <div
            key={project.projectId}
            className="border border-gray-200 dark:border-gray-800 rounded bg-white dark:bg-[#0D0D0D] overflow-hidden"
          >
            {/* Project Header */}
            <div className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-9 h-9 rounded bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-400">
                  <Database size={16} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-tight truncate">
                    {project.name}
                  </h3>

                  <p className="text-[10px] font-mono text-gray-400 uppercase tracking-tighter">
                    PID: {project.projectId}
                  </p>

                  <p className="text-[10px] text-gray-500 mt-1 truncate">
                    {project.description || 'No description'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Visibility */}
                {mode === 'owned' && (
                  <button
                    onClick={() =>
                      togglePublic(project.projectId)
                    }
                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest border transition-all ${project.isPublic
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/10 dark:text-emerald-400'
                      : 'bg-gray-50 text-gray-500 border-gray-100 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                  >
                    {project.isPublic ? (
                      <Globe size={12} />
                    ) : (
                      <Lock size={12} />
                    )}

                    <span className="hidden sm:inline">
                      {project.isPublic
                        ? 'Public'
                        : 'Private'}
                    </span>
                  </button>
                )}

                {/* Expand */}
                <button
                  onClick={async () => {
                    if (expandedProjectId === project.projectId) {
                      setExpandedProjectId(null);
                      return;
                    }
                    setExpandedProjectId(project.projectId);
                    await loadMembers(project.projectId);
                  }}
                  className={`p-1.5 rounded border transition-all ${expandedProjectId ===
                    project.projectId
                    ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-black'
                    : 'bg-white text-gray-400 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                    }`}
                >
                  {expandedProjectId ===
                    project.projectId ? (
                    <ChevronUp size={16} />
                  ) : (
                    <Users size={16} />
                  )}
                </button>

                {/* Leave */}
                {mode === 'joined' && (
                  <button
                    onClick={() =>
                      handleLeaveProject(
                        project.projectId
                      )
                    }
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-all"
                  >
                    <UserMinus size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Expanded Section */}
            {expandedProjectId === project.projectId && (
              <div className="border-t border-gray-100 dark:border-gray-800 bg-[#FAFAFA] dark:bg-[#0A0A0A] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Shield
                      size={12}
                      className="text-[#2F6FEB]"
                    />

                    <h4 className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-widest">
                      Member Registry
                    </h4>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#0D0D0D] border border-gray-200 dark:border-gray-800 rounded-sm overflow-hidden">

                  {/* Loading */}
                  {membersLoading[project.projectId] ? (
                    <div className="py-10 flex flex-col items-center justify-center gap-3">
                      <Spinner />
                    </div>
                  ) : (
                    <>
                      <table className="w-full text-[10px]">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                            <th className="px-4 py-2 text-left uppercase">
                              Identity
                            </th>

                            <th className="px-4 py-2 text-left uppercase">
                              Role
                            </th>

                            {mode === 'owned' && (
                              <th className="px-4 py-2 text-right uppercase">
                                Ops
                              </th>
                            )}
                          </tr>
                        </thead>

                        <tbody>
                          {(membersMap[project.projectId] || []).map(
                            (member) => (
                              <tr
                                key={member.userId}
                                className="border-t border-gray-100 dark:border-gray-800"
                              >
                                <td className="px-4 py-3">
                                  <div className="flex flex-col">
                                    <span className="font-bold text-gray-900 dark:text-white">
                                      {member.username}
                                    </span>

                                    <span className="text-[9px] text-gray-400">
                                      {member.userId}
                                    </span>
                                  </div>
                                </td>

                                <td className="px-4 py-3">
                                  {mode === 'owned' ? (
                                    <select
                                      value={member.role}
                                      onChange={(e) => {
                                        if (!user) return;
                                        handleUpdateMemberRole(
                                          member.userId,
                                          project.projectId,
                                          e.target.value
                                        );
                                      }}
                                      className="bg-transparent text-[#2F6FEB] text-[10px] font-bold uppercase outline-none"
                                    >
                                      <option value="owner">OWNER</option>
                                      <option value="member">MEMBER</option>
                                      <option value="guest">GUEST</option>
                                    </select>
                                  ) : (
                                    <div className="flex flex-col gap-2">
                                      <span className="uppercase font-bold text-gray-500 text-[10px]">
                                        {member.role}
                                      </span>

                                      <div className="flex gap-3">
                                        <div className="flex items-center gap-1.5">
                                          <div
                                            className={`w-1.5 h-1.5 rounded-full ${member.permissions?.canEdit
                                              ? 'bg-[#17A34A]'
                                              : 'bg-gray-300 dark:bg-gray-700'
                                              }`}
                                          />

                                          <span
                                            className={`text-[9px] font-bold tracking-tight ${member.permissions?.canEdit
                                              ? 'text-gray-900 dark:text-white'
                                              : 'text-gray-400 opacity-50'
                                              }`}
                                          >
                                            EDIT
                                          </span>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                          <div
                                            className={`w-1.5 h-1.5 rounded-full ${member.permissions?.canDelete
                                              ? 'bg-[#17A34A]'
                                              : 'bg-gray-300 dark:bg-gray-700'
                                              }`}
                                          />

                                          <span
                                            className={`text-[9px] font-bold tracking-tight ${member.permissions?.canDelete
                                              ? 'text-gray-900 dark:text-white'
                                              : 'text-gray-400 opacity-50'
                                              }`}
                                          >
                                            DELETE
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </td>

                                {mode === 'owned' && (
                                  <td className="px-4 py-3 text-right">
                                    <button
                                      onClick={() => {
                                        if (!user) return;

                                        handleRemoveMember(
                                          member.userId,
                                          project.projectId
                                        );
                                      }}
                                      className="text-gray-400 hover:text-red-500"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </td>
                                )}
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>

                      {(membersMap[project.projectId] || []).length === 0 && (
                        <div className="py-8 text-center text-gray-400 text-xs">
                          No members found
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty */}
      {filteredProjects.length === 0 && (
        <div className="py-20 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded bg-gray-50/30 dark:bg-gray-900/10">
          <Database
            size={32}
            className="mx-auto text-gray-300 mb-4 opacity-30"
          />

          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {mode === 'owned'
              ? 'No Managed Workspaces Found'
              : 'No Shared Workspaces Found'}
          </p>

          <p className="text-[10px] text-gray-400 mt-2">
            {mode === 'owned'
              ? 'Create a new project to get started.'
              : 'Join a workspace via the directory to begin.'}
          </p>
        </div>
      )}
    </div>
  );
}
