'use client';

import React, { useState } from 'react';
import { Database, ChevronDown, ChevronRight, Globe, Lock, Users } from 'lucide-react';
import ProjectMemberDropdown from './ProjectMemberDropdown';

interface Project {
  id: string;
  name: string;
  isPublic: boolean;
}

const INITIAL_PROJECTS: Project[] = [
  { id: 'proj-8821', name: 'Cloud Dashboard v2', isPublic: false },
  { id: 'proj-4410', name: 'API Gateway Service', isPublic: true },
  { id: 'proj-2109', name: 'Marketing Website', isPublic: false },
  { id: 'proj-0032', name: 'Mobile App Beta', isPublic: false },
];

export default function ProjectNavigation() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  const togglePublic = (id: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, isPublic: !p.isPublic } : p));
  };

  return (
    <div className="space-y-1 py-2">
      <div className="px-3 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-between">
        <span>Active Projects</span>
        <span className="bg-gray-100 dark:bg-gray-800 px-1 rounded tabular-nums">{projects.length}</span>
      </div>
      
      {projects.map((project) => (
        <div key={project.id} className="space-y-1">
          <div className="group flex items-center justify-between px-3 py-2 rounded text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
            <button 
              onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
              className="flex-1 flex items-center gap-3 overflow-hidden"
            >
              <div className={expandedProject === project.id ? 'text-[#2F6FEB]' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200'}>
                {expandedProject === project.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </div>
              <Database size={16} className={expandedProject === project.id ? 'text-[#2F6FEB]' : 'text-gray-400'} />
              <span className={`truncate ${expandedProject === project.id ? 'text-gray-900 dark:text-white font-semibold' : ''}`}>
                {project.name}
              </span>
            </button>
            
            <button 
              onClick={() => togglePublic(project.id)}
              className={`p-1 rounded transition-colors ${project.isPublic ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              title={project.isPublic ? 'Project is Public' : 'Project is Private'}
            >
              {project.isPublic ? <Globe size={14} /> : <Lock size={14} />}
            </button>
          </div>
          
          {expandedProject === project.id && (
            <ProjectMemberDropdown projectId={project.id} />
          )}
        </div>
      ))}
    </div>
  );
}
