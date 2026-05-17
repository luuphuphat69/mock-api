'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Check, Edit3, X } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '../../../hooks/useUser';
import { updateUser } from '@/utilities/api/api';

export default function ProfileInfoSection() {
  const { user, loading, fetchUser, setUser } = useUser();

  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState('');

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    try {
      const payload = {
        username: tempName,
      };
      await updateUser(payload);
      // instant global update
      setUser({
        ...user,
        name: tempName,
      });
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  // Loading state
  if (loading) {
    return (
      <section className="p-6">
        <div className="text-sm text-gray-500">Loading profile...</div>
      </section>
    );
  }

  // Error / unauthorized state
  if (!user) {
    return (
      <section className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h2 className="text-lg font-semibold text-red-600">
            User not found
          </h2>
          <p className="text-sm text-red-500 mt-1">
            Unable to load your profile information.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12 flex flex-col md:flex-row gap-8 items-start animate-in fade-in slide-in-from-left-2">
      <div className="w-24 h-24 rounded bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-center overflow-hidden shrink-0 relative">
        <img
          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop"
          alt="User"
          className="w-full h-full object-cover mix-blend-overlay opacity-80"
        />

        <User
          size={32}
          className="absolute text-gray-400 pointer-events-none"
        />

        <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
          <Edit3 size={16} className="text-white" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="text-2xl font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 border border-[#2F6FEB] rounded px-2 py-1 outline-none"
                autoFocus
              />

              <button
                onClick={handleSave}
                className="p-1.5 bg-[#2F6FEB] text-white rounded hover:bg-blue-600 transition-colors"
              >
                <Check size={16} />
              </button>

              <button
                onClick={() => setIsEditing(false)}
                className="p-1.5 bg-[#2F6FEB] text-white rounded hover:bg-red-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                {user.name}
              </h1>

              <button
                onClick={() => {
                  setIsEditing(true);
                  setTempName(user.name || '');
                }}
                className="p-1 text-gray-400 hover:text-[#2F6FEB] transition-colors"
              >
                <Edit3 size={14} />
              </button>
            </>
          )}

          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 rounded text-[10px] font-bold uppercase tracking-wider">
            Verified
          </span>

          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded text-[10px] font-bold uppercase tracking-wider">
            {user.type}
          </span>
        </div>

        <div className="flex flex-col gap-2 mb-6">
          <div className="flex items-center gap-4 text-xs text-gray-500 font-mono">
            <span className="flex items-center gap-1.5">
              <Mail size={12} />
              {user.email}
            </span>

            <span className="flex items-center gap-1.5">
              <Shield size={12} />
              UID: {user.id}
            </span>
          </div>

          <p className="text-[10px] text-[#2F6FEB] font-bold uppercase tracking-widest bg-blue-50/50 dark:bg-blue-900/10 px-2 py-1 rounded inline-block w-fit">
            * Identity managed by Organizational Security Policy
          </p>
        </div>
      </div>
    </section>
  );
}
