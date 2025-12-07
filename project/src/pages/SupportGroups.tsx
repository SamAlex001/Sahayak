import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import GroupCard from "../components/support/GroupCard";
import { SupportGroup } from "../types";
import { apiFetch } from "../lib/api";

const SupportGroups = () => {
  const [groups, setGroups] = useState<SupportGroup[]>([]);
  const [memberGroups, setMemberGroups] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    schedule: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileComplete, setProfileComplete] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchGroups(), fetchProfileStatus()]);
      setLoading(false);
    };
    init();
  }, []);

  const fetchGroups = async () => {
    try {
      const data = await apiFetch("/api/groups");
      setGroups(
        data.map((g: any) => ({
          id: g.id,
          name: g.name,
          description: g.description,
          schedule: g.schedule,
          participants: g.participants,
        }))
      );
      setMemberGroups(
        data.filter((g: any) => g.isMember).map((g: any) => g.id)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch groups");
    }
  };

  const fetchProfileStatus = async () => {
    try {
      const profile = await apiFetch("/api/profiles");
      setProfileComplete(!!profile?.isProfileComplete);
    } catch (err) {
      // If profile fetch fails, assume not complete to be safe
      setProfileComplete(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileComplete) {
      setShowCreateModal(false);
      navigate("/profile");
      return;
    }
    try {
      const created = await apiFetch("/api/groups", {
        method: "POST",
        body: JSON.stringify({
          name: newGroup.name,
          description: newGroup.description,
          schedule: newGroup.schedule,
        }),
      });
      setGroups([
        ...groups,
        {
          id: created._id || created.id,
          name: created.name,
          description: created.description,
          schedule: created.schedule,
          participants: 0,
        },
      ]);
      setShowCreateModal(false);
      setNewGroup({ name: "", description: "", schedule: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create group");
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!profileComplete) {
      navigate("/profile");
      return;
    }
    try {
      await apiFetch(`/api/groups/${groupId}/toggle`, { method: "POST" });
      const currentlyMember = memberGroups.includes(groupId);
      if (currentlyMember) {
        setMemberGroups(memberGroups.filter((id) => id !== groupId));
        setGroups(
          groups.map((group) =>
            group.id === groupId
              ? { ...group, participants: Math.max(0, group.participants - 1) }
              : group
          )
        );
      } else {
        setMemberGroups([...memberGroups, groupId]);
        setGroups(
          groups.map((group) =>
            group.id === groupId
              ? { ...group, participants: group.participants + 1 }
              : group
          )
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to join/leave group"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50 py-12"
      style={{
        backgroundImage:
          'url("https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Support Groups
              </h1>
              <p className="text-gray-600">
                Connect with others who understand your journey
              </p>
            </div>
            <button
              onClick={() => {
                if (!profileComplete) {
                  navigate("/profile");
                } else {
                  setShowCreateModal(true);
                }
              }}
              className={`px-4 py-2 rounded-md flex items-center ${
                profileComplete
                  ? "bg-rose-600 text-white hover:bg-rose-700"
                  : "bg-gray-200 text-gray-600 cursor-pointer"
              }`}
            >
              <Plus className="h-5 w-5 mr-2" />
              {profileComplete ? "Create Group" : "Complete Profile"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onJoin={handleJoinGroup}
              isMember={memberGroups.includes(group.id)}
            />
          ))}
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Create Support Group</h2>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group Name
                  </label>
                  <input
                    type="text"
                    value={newGroup.name}
                    onChange={(e) =>
                      setNewGroup({ ...newGroup, name: e.target.value })
                    }
                    className="w-full border rounded-md p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newGroup.description}
                    onChange={(e) =>
                      setNewGroup({ ...newGroup, description: e.target.value })
                    }
                    className="w-full border rounded-md p-2"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Schedule
                  </label>
                  <input
                    type="text"
                    value={newGroup.schedule}
                    onChange={(e) =>
                      setNewGroup({ ...newGroup, schedule: e.target.value })
                    }
                    className="w-full border rounded-md p-2"
                    placeholder="e.g., Every Monday at 7 PM EST"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700"
                  >
                    Create Group
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportGroups;
