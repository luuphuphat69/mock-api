'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Search, Globe, Key, Send, Check } from 'lucide-react';
import { searchProject, joinProject, sendInvite } from '@/utilities/api/api';
import { toast } from 'sonner';

interface ProjectResult {
  projectId: string;
  name: string;
  prefix?: string;
  description?: string;
}


export default function JoinProjectModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProjectResult[]>([]);
  const [keyInputs, setKeyInputs] = useState<Record<string, string>>({});
  const [activeKeyInputId, setActiveKeyInputId] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [isRequesting, setIsRequesting] = useState<string | null>(null);
  const [isJoiningByKey, setIsJoiningByKey] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (query.trim().length <= 2) {
        setResults([]);
        return;
      }

      try {
        setSearching(true);
        const data = await searchProject(query);
        setResults(Array.isArray(data) ? data : []);

      } catch (err) {
        console.error(err);
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleJoin = (id: string) => {
    setIsRequesting(id);
  };

  const handleJoinByKey = async(id: string) => {
    const key = keyInputs[id];
    if (!key) return;
    setIsJoiningByKey(id);
    try {
      await joinProject(id, {
        accessKey: key
      });
      alert('Joined successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Unknown error")
    } finally {
      setIsJoiningByKey(null);
    }
  };

  const updateKeyInput = (id: string, value: string) => {
    setKeyInputs(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={onClose} />

      <div
        ref={modalRef}
        className="relative bg-white dark:bg-[#0D0D0D] border border-gray-200 dark:border-gray-800 rounded w-full max-w-lg overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[#2F6FEB]">
              <Globe size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white">Join Workspace</h3>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Search to discover projects and choose your join method.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Search Section */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Project Discovery</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by project name or identifier..."
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded px-10 py-2.5 text-xs text-gray-900 dark:text-white focus:ring-1 focus:ring-[#2F6FEB] outline-none"
              />
            </div>
          {searching && (
            <p className="text-xs text-gray-500 mt-2">
              Searching directory...
            </p>
          )}
            {results.length > 0 && (
              <div className="mt-4 space-y-3">
                {results.map(project => (
                  <div key={project.projectId} className="border border-gray-100 dark:border-gray-800 rounded bg-white dark:bg-gray-900/50 overflow-hidden">
                    <div className="p-4 flex items-center justify-between border-b border-gray-50 dark:border-gray-800/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                          <Globe size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900 dark:text-white">{project.name}</p>
                          <p className="text-[10px] text-gray-500 font-mono tracking-tighter uppercase">{project.projectId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleJoin(project.projectId)}
                          disabled={isRequesting === project.projectId || isJoiningByKey === project.projectId}
                          className="flex items-center gap-2 px-3 py-1.5 bg-[#2F6FEB] text-white text-[10px] font-bold uppercase tracking-widest rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                          <Send size={12} />
                          {isRequesting === project.projectId ? 'Sending...' : 'Request'}
                        </button>
                        <button
                          onClick={() => setActiveKeyInputId(activeKeyInputId === project.projectId ? null : project.projectId)}
                          className={`p-1.5 rounded border transition-all ${
                            activeKeyInputId === project.projectId 
                            ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-black dark:border-white' 
                            : 'bg-white text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 hover:border-[#2F6FEB] hover:text-[#2F6FEB]'
                          }`}
                        >
                          <Key size={14} />
                        </button>
                      </div>
                    </div>
                    
                    {activeKeyInputId === project.projectId && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-900/80 border-t border-gray-100 dark:border-gray-800 animate-in">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={keyInputs[project.projectId] || ''}
                            onChange={(e) => updateKeyInput(project.projectId, e.target.value)}
                            placeholder="Enter access key..."
                            className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-3 py-2 text-[11px] text-gray-900 dark:text-white focus:ring-1 focus:ring-[#2F6FEB] outline-none font-mono"
                          />
                          <button
                            onClick={() => handleJoinByKey(project.projectId)}
                            disabled={!keyInputs[project.projectId] || isJoiningByKey === project.projectId || isRequesting === project.projectId}
                            className="px-4 py-2 bg-[#2F6FEB] text-white text-[10px] font-bold uppercase tracking-widest rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                          >
                            {isJoiningByKey === project.projectId ? 'Joining...' : 'Join'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}