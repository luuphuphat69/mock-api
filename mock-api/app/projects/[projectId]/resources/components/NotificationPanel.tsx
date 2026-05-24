"use client"
import { X, Check, Bell, Trash2, Info } from 'lucide-react'
import { useState, useEffect } from 'react'
import gsap from 'gsap'
import { toast } from 'sonner'

import { clearProjectNotify, getProjectNotify } from '@/utilities/api/api'

interface Notification {
  id: string
  message: string
  time: string
  hasAction?: boolean
  type: 'info' | 'success' | 'warning'
}

interface ProjectNotificationResponse {
  _id: string
  code: string
  type: 'minor' | 'medium' | 'urgent'
  message: string
  createdAt: string
}

interface NotificationPanelProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
}

function formatRelativeTime(rawDate: string) {
  const timestamp = new Date(rawDate).getTime()
  if (Number.isNaN(timestamp)) return "Just now"

  const diffInSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000))
  if (diffInSeconds < 60) return "Just now"

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`

  return new Date(rawDate).toLocaleDateString()
}

function mapNotificationType(notification: ProjectNotificationResponse): Notification["type"] {
  if (notification.code === "300") return "success"
  if (notification.type === "urgent" || notification.type === "medium") return "warning"
  return "info"
}

function mapNotification(notification: ProjectNotificationResponse): Notification {
  return {
    id: notification._id,
    message: notification.message,
    time: formatRelativeTime(notification.createdAt),
    hasAction: notification.type === "urgent",
    type: mapNotificationType(notification),
  }
}

export function NotificationPanel({ isOpen, onClose, projectId }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      gsap.fromTo(".notification-item", 
        { opacity: 0, x: 20 }, 
        { opacity: 1, x: 0, stagger: 0.05, duration: 0.4, ease: "power2.out" }
      )
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || !projectId) return

    let isMounted = true

    async function fetchNotifications() {
      setIsLoading(true)
      try {
        const data = await getProjectNotify(projectId)
        if (!isMounted) return

        const nextNotifications = Array.isArray(data)
          ? data.map((notification: ProjectNotificationResponse) => mapNotification(notification))
          : []

        setNotifications(nextNotifications)
      } catch (err) {
        console.error(err)
        if (isMounted) {
          toast.error("Failed to load project notifications")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchNotifications()

    return () => {
      isMounted = false
    }
  }, [isOpen, projectId])

  const deleteNotification = async (id: string) => {
    try {
      await clearProjectNotify(projectId, { notifyId: id })
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (err) {
      console.error(err)
      toast.error("Failed to clear notification")
    }
  }

  const clearAll = async () => {
    try {
      await clearProjectNotify(projectId)
      gsap.to(".notification-item", {
        opacity: 0,
        x: 20,
        stagger: 0.05,
        duration: 0.3,
        onComplete: () => setNotifications([])
      })
    } catch (err) {
      console.error(err)
      toast.error("Failed to clear notifications")
    }
  }

  const handleAction = async (id: string) => {
    await deleteNotification(id)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-[#0D0D0D] border-l border-gray-200 dark:border-gray-800 shadow-2xl z-[60] flex flex-col animate-in">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-[#0D0D0D]">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#2F6FEB]" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-900 dark:text-white">Project Notifications</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center opacity-60">
            <Bell className="w-8 h-8 mb-3 text-gray-300 animate-pulse" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Loading</p>
          </div>
        ) : notifications.length > 0 ? (
          <>
            <div className="flex justify-end">
              <button 
                onClick={clearAll}
                className="text-[10px] font-bold text-gray-400 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3 h-3" />
                Clear All
              </button>
            </div>
            {notifications.map(notification => (
              <div 
                key={notification.id}
                className="notification-item p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 group hover:border-[#2F6FEB]/30 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className={`p-1.5 rounded-md ${
                    notification.type === 'warning' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20' :
                    notification.type === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' :
                    'bg-blue-50 text-[#2F6FEB] dark:bg-blue-900/20'
                  }`}>
                    <Info className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-gray-700 dark:text-gray-300 leading-relaxed break-words">
                      {notification.message}
                    </p>
                    <span className="text-[9px] font-mono text-gray-400 uppercase mt-1 block">
                      {notification.time}
                    </span>
                  </div>
                  <button 
                    onClick={() => deleteNotification(notification.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                
                {notification.hasAction && (
                  <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                    <button 
                      onClick={() => handleAction(notification.id)}
                      className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-[9px] font-bold text-[#2F6FEB] uppercase tracking-widest hover:bg-[#2F6FEB] hover:text-white hover:border-[#2F6FEB] transition-all"
                    >
                      <Check className="w-3 h-3" />
                      Take Action
                    </button>
                  </div>
                )}
              </div>
            ))}
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-40">
            <Bell className="w-8 h-8 mb-3 text-gray-300" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">All clear</p>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0D0D0D]">
        <p className="text-[9px] text-center text-gray-400 font-medium">
          Only project-specific alerts are shown here.
        </p>
      </div>
    </div>
  )
}
