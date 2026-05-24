'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  XCircle,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { useProjects } from '@/hooks/useProject';
import { acceptWaitingListRequest, getWaitingList, removeFromWaitingList } from '@/utilities/api/api';

interface WaitingListRequest {
  _id: string;
  projectId: string;
  userId: string;
  username?: string;
  requestTime?: string;
}

interface WaitingListRow extends WaitingListRequest {
  projectName: string;
}

interface WaitingListSectionProps {
  onPendingCountChange?: (count: number) => void;
}

function formatRequestTime(rawDate?: string) {
  if (!rawDate) return 'Just now';

  const timestamp = new Date(rawDate).getTime();
  if (Number.isNaN(timestamp)) return 'Just now';

  const diffInSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (diffInSeconds < 60) return 'Just now';

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return new Date(rawDate).toLocaleDateString();
}

export default function WaitingListSection({ onPendingCountChange }: WaitingListSectionProps) {
  const { projects, fetchProjects } = useProjects();
  const [requests, setRequests] = useState<WaitingListRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [removingKey, setRemovingKey] = useState<string | null>(null);
  const [acceptingKey, setAcceptingKey] = useState<string | null>(null);

  useEffect(() => {
    const loadWaitingList = async () => {
      try {
        setIsLoading(true);
        await fetchProjects();
      } catch (err) {
        console.error(err);
        toast.error('Failed to load managed projects');
      } finally {
        setIsLoading(false);
      }
    };

    loadWaitingList();
  }, [fetchProjects]);

  useEffect(() => {
    const loadRequests = async () => {
      if (projects.length === 0) {
        setRequests([]);
        return;
      }

      try {
        setIsLoading(true);

        const results = await Promise.all(
          projects.map(async (project) => {
            const response = await getWaitingList(project.projectId);
            const data = Array.isArray(response?.data) ? response.data : [];

            return data.map((request: WaitingListRequest) => ({
              ...request,
              projectName: project.name,
            }));
          })
        );

        setRequests(results.flat());
      } catch (err) {
        console.error(err);
        toast.error('Failed to load waiting list');
      } finally {
        setIsLoading(false);
      }
    };

    loadRequests();
  }, [projects]);

  useEffect(() => {
    onPendingCountChange?.(requests.length);
  }, [onPendingCountChange, requests.length]);

  const pendingCount = useMemo(() => requests.length, [requests.length]);

  const handleDecline = async (request: WaitingListRow) => {
    const key = `${request.projectId}:${request.userId}`;

    try {
      setRemovingKey(key);
      await removeFromWaitingList(request.projectId, request.userId);
      setRequests((prev) =>
        prev.filter(
          (item) => !(item.projectId === request.projectId && item.userId === request.userId)
        )
      );
      toast.success('Waiting request removed');
    } catch (err: unknown) {
      console.error(err);
      toast.error('Failed to remove waiting request');
    } finally {
      setRemovingKey(null);
    }
  };

  const handleAccept = async (request: WaitingListRow) => {
    const key = `${request.projectId}:${request.userId}`;

    try {
      setAcceptingKey(key);
      await acceptWaitingListRequest(request.projectId, request.userId);
      setRequests((prev) =>
        prev.filter(
          (item) => !(item.projectId === request.projectId && item.userId === request.userId)
        )
      );
      toast.success('Waiting request accepted');
    } catch (err: unknown) {
      console.error(err);
      toast.error('Failed to accept waiting request');
    } finally {
      setAcceptingKey(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
        <div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-1">
            Pending Requests
          </h2>
          <p className="text-[11px] text-gray-500 font-medium">
            Review incoming requests to join your managed workspaces.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-gray-400">PENDING:</span>
          <span className="text-xs font-bold text-[#2F6FEB] tabular-nums">{pendingCount}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0D0D0D] border border-gray-200 dark:border-gray-800 rounded-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Spinner />
          </div>
        ) : requests.length > 0 ? (
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 text-gray-400 border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-3 text-left uppercase tracking-widest font-bold">User Identity</th>
                <th className="px-6 py-3 text-left uppercase tracking-widest font-bold">Target Project</th>
                <th className="px-6 py-3 text-right uppercase tracking-widest font-bold">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {requests.map((request) => {
                const key = `${request.projectId}:${request.userId}`;

                return (
                  <tr key={request._id || key} className="group hover:bg-gray-50/50 dark:hover:bg-gray-900/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                          <User size={14} />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                            {request.username || request.userId}
                          </div>
                          <div className="text-[10px] text-gray-500 lowercase">{request.userId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{request.projectName}</span>
                        <span className="text-[9px] font-mono text-gray-400 uppercase tracking-tighter">PID: {request.projectId}</span>
                        <span className="text-[9px] font-mono text-gray-400 uppercase tracking-tighter">
                          Requested {formatRequestTime(request.requestTime)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDecline(request)}
                          disabled={removingKey === key || acceptingKey === key}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all disabled:opacity-50"
                        >
                          <XCircle size={14} />
                          Remove
                        </button>
                        <button
                          onClick={() => handleAccept(request)}
                          disabled={removingKey === key || acceptingKey === key}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2F6FEB] text-white rounded text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                        >
                          <CheckCircle2 size={14} />
                          Accept
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <Clock size={48} className="text-gray-200 dark:text-gray-800 mb-4" />
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">No Pending Requests</h3>
            <p className="text-[10px] text-gray-400 mt-1">When users request to join your projects, they will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
