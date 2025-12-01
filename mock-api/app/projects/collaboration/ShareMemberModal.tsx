import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { searchUser, sendInvite, getMembers, removeMember, me, updateMemberRole } from "../../../utilities/api/api";
import { useUser } from "@/hooks/useUser";
import gsap from "gsap"
import { X } from "lucide-react"
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { ro } from "@faker-js/faker";

interface ISearchResult {
  id: string,
  name: string,
  email: string
}

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

  // Animate modal entrance
  useEffect(() => {
    if (modalRef.current && overlayRef.current) {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      )

      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.95, y: -20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" }
      )
    }
  }, [])

  // Handles animated closing
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
      scale: 0.95,
      y: -20,
      duration: 0.3,
      ease: "back.in",
      onComplete: () => onClose(),
    })
  }

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

  // Debounced user search
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

  // Handle typing in search box
  const handleMemberSearch = (value: string) => {
    setSearchMemberQuery(value);
  };

  // Add user from dropdown suggestion
  const addUserFromSuggestion = (user: ISearchResult) => {
    if (pendingInvites.some(u => u.id === user.id)) {
      toast.error("Already added");
      return;
    }

    setPendingInvites(prev => [...prev, user]);
    setSearchMemberQuery("");
    setSearchResults([]);
  };

  // Remove a user from pending list
  const removePendingInvite = (user: ISearchResult) => {
    setPendingInvites((prev) => prev.filter((u) => u !== user));
  };

  // Submit all invites
  const submitInvites = async () => {
    if (pendingInvites.length === 0)
      return toast.error("No users to invite");

    if (user) {
      sendInvite(user.id, selectedProjectForSettings.projectId, {
        users: pendingInvites,
        project: selectedProjectForSettings,
      });
      toast.success(`Invitation mail has been sent. Please check in Inbox or Spam folder`);

      setPendingInvites([]);
      setSearchMemberQuery("");
      onClose();
    }
  };

  const handleRemoveMember = async (requesterid: string, userid: string, projectid: string) => {
    try {
      await removeMember(requesterid, userid, projectid);

      setMembers(prev => prev.filter(m => m.userId !== userid));

      toast.success("Member is removed");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to remove member");
    }
  };

  const handleUpdateMemberRole = async(requestid: string, userid: string, projectid: string, role: string) => {
    try{
      await updateMemberRole(requestid, userid, projectid, role);
      toast.success('Role is changed')
    }catch(err:any){
      toast.error(err.response.data.message)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" ref={overlayRef}>
      <div className="bg-card border border-border rounded-lg p-8 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto" ref={modalRef}>

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            Manage Members - {selectedProjectForSettings?.name}
          </h2>

          {/* FIX: use onClose instead of setShowCollabSettingsModal */}
          <button
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            onClick={handleClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Section */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search members..."
              value={searchMemberQuery}
              onChange={(e) => handleMemberSearch(e.target.value)}
              className="w-full bg-background border-border text-foreground placeholder:text-muted-foreground"
            />

            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-10">
                {searchResults.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => addUserFromSuggestion(suggestion)}
                    className="w-full text-left px-4 py-2 hover:bg-foreground/10 border-b border-border last:border-b-0 text-foreground hover:text-cyan-400 transition-colors"
                  >
                    <p>{suggestion.name}</p>
                    <p style={{ fontStyle: 'italic' }}>{suggestion.email}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {pendingInvites.length > 0 && (
            <div className="bg-background border border-border rounded-lg p-4">
              <p className="text-sm font-semibold text-foreground mb-3">
                Pending Invites ({pendingInvites.length})
              </p>

              <div className="flex flex-wrap gap-2">
                {pendingInvites.map((user) => (
                  <div
                    key={user.id}
                    className="bg-cyan-500/20 border border-cyan-500/50 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {user.name}
                    <button
                      onClick={() => removePendingInvite(user)}
                      className="hover:text-red-500"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Members Table */}
        {!loadingMembers && members.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Member</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Permissions</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Action</th>
                </tr>
              </thead>

              <tbody>
                {members.map((member) => (
                  <tr key={member.userId} className="border-b border-border hover:bg-background/50">
                    <td className="px-4 py-3 text-sm text-foreground">
                      {member.userId}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {member.username}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      <select
                        value={member.role}
                        onChange={(e) => {
                          if (!user) return;
                          handleUpdateMemberRole(
                            user.id,
                            member.userId,
                            selectedProjectForSettings.projectId,
                            e.target.value
                          );
                        }}
                        className="bg-background border border-border text-foreground rounded px-2 py-1 text-sm cursor-pointer hover:border-cyan-500/50"
                      >
                        <option value="owner">Owner</option>
                        <option value="member">Member</option>
                        <option value="guest">Guest</option>
                      </select>
                    </td>

                    <td className="px-4 py-3 text-xs" >
                      <p>Can delete: {member.permissions.canDelete.toString()}</p>
                      <p>Can edit: {member.permissions.canEdit.toString()}</p>
                      <p>Can invite: {member.permissions.canInvite.toString()}</p>
                    </td>

                    <td className="px-4 py-3 text-sm">
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (user)
                            handleRemoveMember(user?.id, member.userId, selectedProjectForSettings.projectId)
                        }}
                        className="border-border text-red-400 hover:bg-red-500 h-8 px-3"
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : loadingMembers ? (
          <div className="flex items-center justify-center p-6 text-muted-foreground">
            <Spinner />
          </div>
        ) : (
          <div className="p-6 text-center text-muted-foreground">
            No members invited yet
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-border bg-background text-foreground"
          >
            Cancel
          </Button>

          <Button
            onClick={submitInvites}
            disabled={pendingInvites.length === 0}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white disabled:opacity-50"
          >
            Invite ({pendingInvites.length})
          </Button>
        </div>

      </div>
    </div>
  );
}