'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Globe, Key, Send, Check } from 'lucide-react';
import { gsap } from 'gsap';
import { searchProject } from '@/utilities/api/api';

interface ProjectResult {
  projectId: string;
  name: string;
  prefix?: string;
  description?: string;
}


export default function JoinProjectModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProjectResult[]>([]);
  const [accessKey, setAccessKey] = useState('');
  const [searching, setSearching] = useState(false);
  const [isJoining, setIsJoining] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(modalRef.current,
      { opacity: 0, scale: 0.95, y: 10 },
      { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'power2.out' }
    );
  }, []);

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
    setIsJoining(id);
    setTimeout(() => {
      setIsJoining(null);
      alert('Join request sent!');
    }, 1000);
  };

  const handleJoinByKey = () => {
    if (!accessKey) return;
    alert(`Joining project with key: ${accessKey}`);
    onClose();
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
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Step 01: Discover & Authenticate</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Search Section */}
          {searching && (
            <p className="text-xs text-gray-500 mt-2">
              Searching...
            </p>
          )}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Search Project Directory</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter project name or ID..."
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded px-10 py-2.5 text-xs text-gray-900 dark:text-white focus:ring-1 focus:ring-[#2F6FEB] outline-none"
              />
            </div>

            {results.length > 0 && (
              <div className="mt-2 border border-gray-100 dark:border-gray-800 rounded divide-y dark:divide-gray-800">
                {results.map(project => (
                  <div key={project.projectId} className="p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="text-gray-400"><Globe size={14} /></div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">{project.name}</p>
                        <p className="text-[10px] text-gray-500 font-mono tracking-tighter uppercase">{project.projectId}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleJoin(project.projectId)}
                      disabled={isJoining === project.projectId}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#2F6FEB] text-white text-[10px] font-bold uppercase tracking-widest rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      {isJoining === project.projectId ? 'Sending...' : (
                        <>
                          <Send size={12} />
                          Send Request
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative py-2 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">OR</span>
            <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
          </div>

          {/* Access Key Section */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Join via Access Key</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  placeholder="Paste your unique access key..."
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded px-10 py-2.5 text-xs text-gray-900 dark:text-white focus:ring-1 focus:ring-[#2F6FEB] outline-none font-mono"
                />
              </div>
              <button
                onClick={handleJoinByKey}
                className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase tracking-widest rounded hover:bg-[#2F6FEB] dark:hover:bg-[#2F6FEB] dark:hover:text-white transition-all flex items-center gap-2"
              >
                Join
              </button>
            </div>
            <p className="text-[9px] text-gray-500 italic">Access keys are case-sensitive and provided by project administrators.</p>
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
