'use client';

import React, { useState, useEffect } from 'react';
import { Users, Shield, Trash2, X, Plus, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface Member {
  userId: string;
  username: string;
  role: string;
  permissions?: {
    canEdit: boolean;
    canDelete: boolean;
  };
}

const MOCK_MEMBERS: Record<string, Member[]> = {
  'proj-8821': [
    { userId: 'USR-01', username: 'Alex Rivera', role: 'owner', permissions: { canEdit: true, canDelete: true } },
    { userId: 'USR-02', username: 'Jordan Smith', role: 'member', permissions: { canEdit: true, canDelete: false } },
  ],
  'proj-4410': [
    { userId: 'USR-01', username: 'Alex Rivera', role: 'editor', permissions: { canEdit: true, canDelete: false } },
    { userId: 'USR-03', username: 'Casey Chen', role: 'member', permissions: { canEdit: false, canDelete: false } },
  ],
};

export default function ProjectMemberDropdown({ projectId }: { projectId: string }) {
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS[projectId] || []);
  const [loading, setLoading] = useState(false);

  const handleUpdateRole = (userId: string, newRole: string) => {
    setMembers(prev => prev.map(m => m.userId === userId ? { ...m, role: newRole } : m));
    toast.success(`Updated role to ${newRole}`);
  };

  const handleRemoveMember = (userId: string) => {
    setMembers(prev => prev.filter(m => m.userId !== userId));
    toast.success('Member removed from project');
  };

  return (
    <div className="mt-1 ml-9 p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-md space-y-3 animate-in fade-in slide-in-from-top-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={12} className="text-[#2F6FEB]" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Members</span>
        </div>
        <button className="text-[10px] font-bold text-[#2F6FEB] hover:underline uppercase tracking-widest flex items-center gap-1">
          <Plus size={10} /> Invite
        </button>
      </div>

      <div className="space-y-2">
        {members.map(member => (
          <div key={member.userId} className="flex items-center justify-between group">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{member.username}</span>
              <span className="text-[9px] text-gray-400 font-mono tracking-tighter uppercase">{member.userId}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <select 
                value={member.role}
                onChange={(e) => handleUpdateRole(member.userId, e.target.value)}
                className="bg-transparent border-none text-[10px] font-bold text-[#2F6FEB] uppercase tracking-widest focus:ring-0 cursor-pointer p-0"
              >
                <option value="owner">Owner</option>
                <option value="editor">Editor</option>
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
              </select>
              
              <button 
                onClick={() => handleRemoveMember(member.userId)}
                className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
        {members.length === 0 && (
          <p className="text-[10px] text-gray-400 italic text-center py-2">No members found.</p>
        )}
      </div>
    </div>
  );
}
