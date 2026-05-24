'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Copy, Check, Lock, Database } from 'lucide-react';
import { toast } from 'sonner';
import { useProjects } from '@/hooks/useProject';
import { renewKey } from '@/utilities/api/api';

export default function AccessKeysSection() {
  const [copying, setCopying] = useState<string | null>(null);
  const { projects, fetchProjects } = useProjects();
  const [rawAccessKeys, setRawAccessKeys] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCopy = (id: string, value?: string) => {
    if (!value) {
      toast.error('No key to copy');
      return;
    }

    navigator.clipboard.writeText(value);
    setCopying(id);
    toast.success('Key copied to clipboard');
    setTimeout(() => setCopying(null), 2000);
  };

  const handleRenew = async (projectId: string) => {
    const rawKey = await renewKey(projectId, 'access');

    setRawAccessKeys((prev) => ({
      ...prev,
      [projectId]: rawKey.newKey,
    }));

    toast.success('Access key rotated successfully');
  };

  return (
    <section className="space-y-6">
      <div className="mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-1">
          Project Access Keys
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Manage unique identifiers for programmatic workspace interaction.
        </p>
      </div>

      <div className="space-y-4">
        {projects.map((item) => {
          const rawAccessKey = rawAccessKeys[item.projectId];

          return (
            <div
              key={item.projectId}
              className="bg-white dark:bg-[#0D0D0D] border border-gray-200 dark:border-gray-800 rounded-sm overflow-hidden"
            >
              <div className="p-4 bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database size={14} className="text-gray-400" />
                  <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono tracking-tighter">
                    [{item.projectId}]
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 font-mono">
                  Version: {item.prefix}
                </span>
              </div>

              <div className="p-4 flex flex-col md:flex-row items-center gap-4">
                <div className="flex-1 w-full bg-gray-100 dark:bg-gray-800 rounded px-3 py-2 flex items-center justify-between font-mono text-xs text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                  {rawAccessKey && rawAccessKey.length > 0 ? (
                    <span className="truncate mr-2">{rawAccessKey}</span>
                  ) : (
                    <span className="truncate mr-2">
                      ...........................................................
                    </span>
                  )}

                  <button
                    onClick={() => handleCopy(item.projectId, rawAccessKey)}
                    className="text-gray-400 hover:text-[#2F6FEB] transition-colors"
                  >
                    {copying === item.projectId ? (
                      <Check size={14} className="text-emerald-500" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  <button
                    onClick={() => handleRenew(item.projectId)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase tracking-widest rounded hover:bg-[#2F6FEB] dark:hover:bg-[#2F6FEB] dark:hover:text-white transition-all"
                  >
                    <RefreshCw size={12} />
                    Renew Key
                  </button>
                </div>
              </div>

              <div className="px-4 py-2 bg-blue-50/30 dark:bg-blue-900/5 flex items-center gap-2">
                <Lock size={10} className="text-[#2F6FEB]" />
                <p className="text-[9px] text-[#2F6FEB] font-medium uppercase tracking-tight">
                  Warning: The key will be shown 1 times and not be shown again.
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}