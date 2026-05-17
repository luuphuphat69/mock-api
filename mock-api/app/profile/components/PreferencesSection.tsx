'use client';

import React, { useState } from 'react';
import { Bell, ShieldAlert, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function PreferencesSection() {
  const [preventInvites, setPreventInvites] = useState(false);

  const handleToggleInvites = () => {
    const newValue = !preventInvites;
    setPreventInvites(newValue);
    
    if (newValue) {
      toast('Invite Blocking Enabled', {
        description: 'Everyone will can not send you invite to their project.',
        icon: <ShieldAlert className="text-amber-500" size={16} />,
        duration: 5000,
      });
    } else {
      toast.success('Invite Blocking Disabled', {
        description: 'You can now receive project invitations again.',
      });
    }
  };

  return (
    <section className="space-y-6">
      <div className="mb-6">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-1">Global Preferences</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">Manage your system-wide interaction settings.</p>
      </div>

      <div className="bg-white dark:bg-[#0D0D0D] border border-gray-200 dark:border-gray-800 rounded-sm divide-y dark:divide-gray-800">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded flex items-center justify-center transition-colors ${preventInvites ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-500' : 'bg-blue-50 dark:bg-blue-900/20 text-[#2F6FEB]'}`}>
              <Bell size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">Project Invitations</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Control who can add you to their workspaces.</p>
            </div>
          </div>
          
          <button 
            onClick={handleToggleInvites}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#2F6FEB] focus:ring-offset-2 dark:focus:ring-offset-[#0A0A0A] ${preventInvites ? 'bg-amber-500' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preventInvites ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {preventInvites && (
          <div className="p-4 bg-amber-50/50 dark:bg-amber-900/10 border-l-4 border-amber-500 flex items-start gap-3">
            <ShieldAlert size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
              Privacy Mode Active: Everyone will can not send you invite to their project. This will block all incoming requests until disabled.
            </p>
          </div>
        )}

        <div className="p-6 flex items-center justify-between opacity-50 cursor-not-allowed">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400">
              <Check size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">Auto-Accept Public Projects</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Automatically join projects marked as "Community Open".</p>
            </div>
          </div>
          <div className="h-6 w-11 rounded-full bg-gray-200 dark:bg-gray-700 relative">
             <div className="absolute top-1 left-1 h-4 w-4 rounded-full bg-white" />
          </div>
        </div>
      </div>
    </section>
  );
}
