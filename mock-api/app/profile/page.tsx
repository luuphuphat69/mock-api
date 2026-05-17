'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Users,
  Mail, 
  LayoutGrid, 
  LogOut, 
  Moon, 
  Sun, 
  Settings, 
  Bell, 
  Search,
  ChevronRight,
  Plus,
  Shield,
  Lock,
  Database,
  ArrowRight
} from 'lucide-react';
import Image from 'next/image';
import { Toaster } from 'sonner';

// --- Modular Components ---
import ProfileInfoSection from './components/ProfileInfoSection';
import ProjectsSection from './components/ProjectsSection';
import AccessKeysSection from './components/AccessKeysSection';
import PreferencesSection from './components/PreferencesSection';
import JoinProjectModal from './components/JoinProjectModal';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function UserProfilePage() {
  const [isDark, setIsDark] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    // Initial theme check
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
    }

  }, []);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <div className={`min-h-screen font-sans selection:bg-[#2F6FEB]/20 ${isDark ? 'dark bg-[#0A0A0A]' : 'bg-[#FAFAFA]'}`}>
      <div className="flex min-h-screen">
        {/* Sidebar: Tech Posture */}
        <aside className="sidebar-nav w-72 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0D0D0D] hidden lg:flex flex-col sticky top-0 h-screen">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded flex items-center justify-center">
                <Link href={'/'}>
                  <Image title="logo" src='/icon.png' width={100} height={100} alt="logo" />
                </Link>
              </div>
              <span className="text-sm font-bold dark:text-white uppercase tracking-tighter">Console</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              v1.0
            </span>
          </div>
          
          <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">            
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded font-medium text-sm transition-all ${
                activeTab === 'profile' ? 'text-[#2F6FEB] bg-blue-50/50 dark:bg-blue-900/10' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <User size={16} />
                <span>My Profile</span>
              </div>
              {activeTab === 'profile' && <ChevronRight size={14} />}
            </button>

            <button 
              onClick={() => setActiveTab('projects')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded font-medium text-sm transition-all ${
                activeTab === 'projects' ? 'text-[#2F6FEB] bg-blue-50/50 dark:bg-blue-900/10' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutGrid size={16} />
                <span>My Projects</span>
              </div>
              {activeTab === 'projects' && <ChevronRight size={14} />}
            </button>

            <button
              onClick={() => setActiveTab('shared')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded font-medium text-sm transition-all ${activeTab === 'shared' ? 'text-[#2F6FEB] bg-blue-50/50 dark:bg-blue-900/10' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
            >
              <div className="flex items-center gap-3">
                <Users size={16} />
                <span>Shared Projects</span>
              </div>
              {activeTab === 'shared' && <ChevronRight size={14} />}
            </button>
            
            <div className="px-3 pt-6 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Security & Ops</div>
            
            <button 
              onClick={() => setActiveTab('keys')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-sm transition-all ${
                activeTab === 'keys' ? 'text-[#2F6FEB] bg-blue-50/50 dark:bg-blue-900/10' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Lock size={16} />
                <span>Access Keys</span>
              </div>
              {activeTab === 'keys' && <ChevronRight size={14} />}
            </button>
            
            <button 
              onClick={() => setActiveTab('preferences')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-sm transition-all ${
                activeTab === 'preferences' ? 'text-[#2F6FEB] bg-blue-50/50 dark:bg-blue-900/10' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings size={16} />
                <span>Preferences</span>
              </div>
              {activeTab === 'preferences' && <ChevronRight size={14} />}
            </button>
          </nav>
          
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
            <button 
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-3 py-2 rounded text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm transition-all"
            >
              <div className="flex items-center gap-3">
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
                <span>{isDark ? 'Light UI' : 'Dark UI'}</span>
              </div>
              <div className={`w-8 h-4 rounded-full relative transition-colors ${isDark ? 'bg-[#2F6FEB]' : 'bg-gray-300'}`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isDark ? 'right-0.5' : 'left-0.5'}`} />
              </div>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          
          {/* Header Bar */}
          <header className="header-bar h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0A0A0A] flex items-center justify-between px-8 sticky top-0 z-20">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                <span>USERS</span>
                <ChevronRight size={12} />
                <span className="text-[#2F6FEB] font-bold tracking-tight uppercase">{activeTab}</span>
              </div>
            </div>
          </header>

          <div className="content-pane p-8 lg:p-12 max-w-5xl mx-auto">
            
            {activeTab === 'profile' && (
              <>
                <ProfileInfoSection />
                
                <section className="animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center justify-between mb-8 border-b border-gray-100 dark:border-gray-800 pb-6">
                    <div>
                      <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-1">Collaboration Hub</h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Join or discover workspaces to begin collaborating.</p>
                    </div>
                    <button 
                      onClick={() => setShowJoinModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#2F6FEB] text-white rounded text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition-all"
                    >
                      <Plus size={14} /> Join Workspace
                    </button>
                  </div>
                  
                  <div className="grid md:grid-cols-1 gap-6">
                    <div className="p-8 border border-gray-200 dark:border-gray-800 rounded-sm bg-white dark:bg-[#0D0D0D] flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center text-[#2F6FEB] mb-4">
                        <Database size={24} />
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Discovery Directory</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 max-w-md">Search the organizational index for public projects you can join or request access to.</p>
                      <button onClick={() => setShowJoinModal(true)} className="px-6 py-2 bg-[#2F6FEB] text-white rounded text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2">
                        Explore Directory <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </section>
              </>
            )}

            {activeTab === 'projects' && <ProjectsSection mode="owned" />}

            {activeTab === 'shared' && <ProjectsSection mode="joined" />}

            {activeTab === 'keys' && <AccessKeysSection />}
            
            {activeTab === 'preferences' && <PreferencesSection />}

          </div>
        </main>
      </div>

      {showJoinModal && (
        <JoinProjectModal onClose={() => setShowJoinModal(false)} />
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
        
        :root {
          --font-sans: 'Inter', -apple-system, sans-serif;
          --font-mono: 'JetBrains Mono', monospace;
        }

        body {
          font-family: var(--font-sans);
          -webkit-font-smoothing: antialiased;
        }

        .font-mono {
          font-family: var(--font-mono);
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.2);
          border-radius: 10px;
        }

        .transition-all {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}