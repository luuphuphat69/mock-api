'use client';

import React, { useState } from 'react';
import { Key, RefreshCw, Copy, Check, Lock, Database } from 'lucide-react';
import { toast } from 'sonner';

interface ProjectKey {
  projectId: string;
  projectName: string;
  key: string;
  lastRenewed: string;
}

const INITIAL_KEYS: ProjectKey[] = [
  { projectId: 'proj-8821', projectName: 'Cloud Dashboard v2', key: 'od_pk_live_8821_xxxxxxxxxxxx', lastRenewed: '2026-04-12' },
  { projectId: 'proj-4410', projectName: 'API Gateway Service', key: 'od_pk_live_4410_xxxxxxxxxxxx', lastRenewed: '2026-05-01' },
];

export default function AccessKeysSection() {
  const [keys, setKeys] = useState<ProjectKey[]>(INITIAL_KEYS);
  const [copying, setCopying] = useState<string | null>(null);

  const handleCopy = (id: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopying(id);
    toast.success('Key copied to clipboard');
    setTimeout(() => setCopying(null), 2000);
  };

  const handleRenew = (id: string) => {
    const newKey = `od_pk_live_${id.split('-')[1]}_${Math.random().toString(36).substring(7)}`;
    setKeys(prev => prev.map(k => k.projectId === id ? { ...k, key: newKey, lastRenewed: new Date().toISOString().split('T')[0] } : k));
    toast.success('Access key rotated successfully');
  };

  return (
    <section className="space-y-6">
      <div className="mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-1">Project Access Keys</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">Manage unique identifiers for programmatic workspace interaction.</p>
      </div>

      <div className="space-y-4">
        {keys.map((item) => (
          <div key={item.projectId} className="bg-white dark:bg-[#0D0D0D] border border-gray-200 dark:border-gray-800 rounded-sm overflow-hidden">
            <div className="p-4 bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database size={14} className="text-gray-400" />
                <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest">{item.projectName}</span>
                <span className="text-[10px] text-gray-400 font-mono tracking-tighter">[{item.projectId}]</span>
              </div>
              <span className="text-[10px] text-gray-400 font-mono">RENEWED: {item.lastRenewed}</span>
            </div>
            
            <div className="p-4 flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1 w-full bg-gray-100 dark:bg-gray-800 rounded px-3 py-2 flex items-center justify-between font-mono text-xs text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                <span className="truncate mr-2">{item.key}</span>
                <button 
                  onClick={() => handleCopy(item.projectId, item.key)}
                  className="text-gray-400 hover:text-[#2F6FEB] transition-colors"
                >
                  {copying === item.projectId ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
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
              <p className="text-[9px] text-[#2F6FEB] font-medium uppercase tracking-tight">Warning: Rotating this key will immediately invalidate current sessions using it.</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
