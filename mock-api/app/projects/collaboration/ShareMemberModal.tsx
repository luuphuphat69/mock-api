import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { searchUser, sendInvite, getMembers, removeMember, updateMemberRole } from "../../../utilities/api/api";
import { useUser } from "@/hooks/useUser";
import gsap from "gsap"
import { X, Search, UserPlus, Users, Shield, Trash2, Mail, ExternalLink } from "lucide-react"
import { Spinner } from '@/components/ui/shadcn-io/spinner';

interface ISearchResult {
  id: string;
  name: string;
  email: string;
}

/**
 * ShareMemberModal - Upgraded to 'Neutral Modern' with 'Tech/Utility' posture.
 * Preserves all original logic functions while modernizing the interface.
 */
export default function ShareMemberModal({
  selectedProjectForSettings,
  onClose,
}: {
  selectedProjectForSettings: IProject;
  onClose: () => void;
}) {
  const modalRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [closing, setClosing] = useState(false)
  const [searchMemberQuery, setSearchMemberQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ISearchResult[]>([]);
  const [pendingInvites, setPendingInvites] = useState<ISearchResult[]>([]);
  const [members, setMembers] = useState<IMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const { user, fetchUser } = useUser()

  // --- Animation Lifecycle ---
  useEffect(() => {
    if (modalRef.current && overlayRef.current) {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      )

      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.98, y: 8 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "power3.out" }
      )
    }
  }, [])

  const handleClose = () => {
    if (closing) return
    setClosing(true)

    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.2,
      ease: "power2.in",
    })

    gsap.to(modalRef.current, {
      opacity: 0,
      scale: 0.98,
      y: 8,
      duration: 0.3,
      ease: "power3.in",
      onComplete: () => onClose(),
    })
  }

  // --- Logic Functions (Preserved) ---
  useEffect(() => {
    const loadMembers = async () => {
      try {
        setLoadingMembers(true);
        const res = await getMembers(selectedProjectForSettings.projectId);
        setMembers(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load members");
      } finally {
        setLoadingMembers(false);
      }
    };

    loadMembers();
    fetchUser();
  }, [selectedProjectForSettings.projectId]);

  useEffect(() => {
    if (!searchMemberQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const users = await searchUser(searchMemberQuery);
        setSearchResults(users || []);
      } catch (err) {
        console.error(err);
        toast.error("Search failed");
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchMemberQuery]);

  const addUserFromSuggestion = (user: ISearchResult) => {
    if (pendingInvites.some(u => u.id === user.id)) {
      toast.error("Already added to invite list");
      return;
    }
    if (members.some(m => m.userId === user.id)) {
      toast.error("User is already a member");
      return;
    }

    setPendingInvites(prev => [...prev, user]);
    setSearchMemberQuery("");
    setSearchResults([]);
  };

  const removePendingInvite = (user: ISearchResult) => {
    setPendingInvites((prev) => prev.filter((u) => u.id !== user.id));
  };

  const submitInvites = async () => {
    if (pendingInvites.length === 0)
      return toast.error("No users to invite");

    if (user) {
      try {
        await sendInvite(selectedProjectForSettings.projectId, {
          users: pendingInvites,
          project: selectedProjectForSettings,
        });
        toast.success(`Invites sent to ${pendingInvites.length} users`);
        setPendingInvites([]);
        setSearchMemberQuery("");
        handleClose();
      } catch (err) {
        toast.error("Failed to send invites");
      }
    }
  };

  const handleRemoveMember = async (userid: string, projectid: string) => {
    try {
      await removeMember(userid, projectid);
      setMembers(prev => prev.filter(m => m.userId !== userid));
      toast.success("Member removed");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to remove member");
    }
  };

  const handleUpdateMemberRole = async(userid: string, projectid: string, role: string) => {
    try {
      await updateMemberRole(userid, projectid, role);
      setMembers(prev => prev.map(m => m.userId === userid ? { ...m, role } : m));
      toast.success('Role updated successfully');
    } catch(err: any) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-50" ref={overlayRef}>
      <div className="bg-[#FAFAFA] border border-border rounded-lg w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden" ref={modalRef}>
        
        {/* Header - Neutral Modern */}
        <div className="px-6 py-4 border-b border-border bg-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#2F6FEB]/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-[#2F6FEB]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#111111] tracking-tight">
                Project Access Control
              </h2>
              <p className="text-xs text-muted-foreground font-medium">
                {selectedProjectForSettings?.name}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-[#FAFAFA] rounded border border-transparent hover:border-border transition-all text-muted-foreground hover:text-[#111111]"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Search Section - Tech/Utility */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-3.5 h-3.5 text-[#2F6FEB]" />
                <h3 className="text-xs font-semibold text-[#111111] uppercase tracking-wider">Invite Members</h3>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">STEP 01</span>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="w-3.5 h-3.5 text-muted-foreground group-focus-within:text-[#2F6FEB] transition-colors" />
              </div>
              <Input
                type="text"
                placeholder="Search user directory by email..."
                value={searchMemberQuery}
                onChange={(e) => setSearchMemberQuery(e.target.value)}
                className="w-full pl-10 bg-white border-border text-[#111111] placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-[#2F6FEB] h-10 text-sm rounded-md"
              />

              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-md shadow-lg z-20 overflow-hidden divide-y divide-border">
                  {searchResults.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => addUserFromSuggestion(suggestion)}
                      className="w-full text-left px-4 py-2.5 hover:bg-[#FAFAFA] transition-colors group flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-[#111111] group-hover:text-[#2F6FEB] transition-colors">{suggestion.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{suggestion.email}</p>
                      </div>
                      <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {pendingInvites.length > 0 && (
              <div className="bg-white border border-border border-dashed rounded-md p-4 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
                  <p className="text-[10px] font-bold text-[#111111] uppercase tracking-widest">
                    Staged Invites ({pendingInvites.length})
                  </p>
                  <button 
                    onClick={() => setPendingInvites([])}
                    className="text-[10px] font-medium text-muted-foreground hover:text-[#DC2626] transition-colors"
                  >
                    Reset List
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {pendingInvites.map((user) => (
                    <div
                      key={user.id}
                      className="bg-[#FAFAFA] border border-border px-2.5 py-1 rounded-sm text-xs flex items-center gap-2 group hover:border-[#2F6FEB] transition-colors"
                    >
                      <span className="text-[#111111] font-medium">{user.name}</span>
                      <button
                        onClick={() => removePendingInvite(user)}
                        className="text-muted-foreground hover:text-[#DC2626] transition-colors"
                        aria-label={`Remove ${user.name}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Members Table - Data Dense / Tech Posture */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-[#2F6FEB]" />
                <h3 className="text-xs font-semibold text-[#111111] uppercase tracking-wider">Access Registry</h3>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">STEP 02</span>
            </div>

            <div className="bg-white border border-border rounded-md overflow-hidden">
              {!loadingMembers && members.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#FAFAFA] border-b border-border">
                        <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground uppercase tracking-tighter">Member Identity</th>
                        <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground uppercase tracking-tighter">System Role</th>
                        <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground uppercase tracking-tighter hidden md:table-cell">Capability Matrix</th>
                        <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground uppercase tracking-tighter">Operations</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-border">
                      {members.map((member) => (
                        <tr key={member.userId} className="hover:bg-[#FAFAFA]/40 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-[#111111]">{member.username}</span>
                              <span className="text-[10px] text-muted-foreground font-mono tabular-nums">UID:{member.userId}</span>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="relative inline-block group">
                              <select
                                value={member.role}
                                onChange={(e) => {
                                  if (!user) return;
                                  handleUpdateMemberRole(
                                    member.userId,
                                    selectedProjectForSettings.projectId,
                                    e.target.value
                                  );
                                }}
                                className="bg-white border border-border text-[#111111] rounded px-2 py-1 text-[11px] font-mono font-medium cursor-pointer hover:border-[#2F6FEB] focus:ring-1 focus:ring-[#2F6FEB] outline-none transition-all appearance-none pr-6 min-w-[90px]"
                              >
                                <option value="owner">OWNER</option>
                                <option value="member">MEMBER</option>
                                <option value="guest">GUEST</option>
                              </select>
                              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity">
                                <Shield className="w-2.5 h-2.5" />
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3 hidden md:table-cell">
                            <div className="flex gap-3">
                              <div className="flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${member.permissions?.canEdit ? 'bg-[#17A34A]' : 'bg-border'}`} />
                                <span className={`text-[9px] font-bold tracking-tight ${member.permissions?.canEdit ? 'text-[#111111]' : 'text-muted-foreground opacity-50'}`}>EDIT</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${member.permissions?.canDelete ? 'bg-[#17A34A]' : 'bg-border'}`} />
                                <span className={`text-[9px] font-bold tracking-tight ${member.permissions?.canDelete ? 'text-[#111111]' : 'text-muted-foreground opacity-50'}`}>DELETE</span>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (user)
                                  handleRemoveMember(member.userId, selectedProjectForSettings.projectId)
                              }}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-[#DC2626] hover:bg-[#DC2626]/5 rounded transition-all"
                              title="Revoke access"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : loadingMembers ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                  <Spinner className="w-5 h-5 text-[#2F6FEB]" />
                  <p className="text-[10px] font-mono tracking-widest uppercase animate-pulse">Synchronizing members...</p>
                </div>
              ) : (
                <div className="py-12 text-center border-2 border-dashed border-border rounded-md m-4">
                  <div className="bg-[#FAFAFA] w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 border border-border">
                    <Mail className="w-4 h-4 text-muted-foreground opacity-40" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">No active members in registry</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer - Tech/Utility */}
        <div className="px-6 py-4 border-t border-border bg-white flex gap-2 shrink-0">
          <Button
            onClick={handleClose}
            variant="outline"
            className="flex-1 border-border bg-white text-[#111111]  h-10 text-xs font-semibold tracking-tight"
          >
            DISMISS
          </Button>

          <Button
            onClick={submitInvites}
            disabled={pendingInvites.length === 0}
            className="flex-1 bg-[#2F6FEB] hover:bg-[#1d56c2] text-white disabled:opacity-40 h-10 text-xs font-bold tracking-tight shadow-sm transition-all active:scale-[0.98]"
          >
            CONFIRM {pendingInvites.length > 0 ? `${pendingInvites.length} ` : ''}INVITE{pendingInvites.length !== 1 ? 'S' : ''}
          </Button>
        </div>

      </div>
    </div>
  );
}
