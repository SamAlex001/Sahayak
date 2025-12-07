import React, { useState } from "react";
import { Users } from "lucide-react";
import { SupportGroup } from "../../types";
import GroupChat from "./GroupChat";

interface GroupCardProps {
  group: SupportGroup;
  onJoin: (groupId: string) => void;
  isMember: boolean;
}

const GroupCard: React.FC<GroupCardProps> = ({ group, onJoin, isMember }) => {
  const [showChat, setShowChat] = useState(false);

  const handleClick = () => {
    if (isMember) {
      setShowChat(true);
    } else {
      onJoin(group.id);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Users className="h-6 w-6 text-rose-600 mr-2" />
            <h3 className="text-xl font-semibold">{group.name}</h3>
          </div>
          <span className="text-sm text-gray-500">
            {group.participants} members
          </span>
        </div>
        <p className="text-gray-700 mb-4">{group.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">{group.schedule}</span>
          <button
            onClick={handleClick}
            className={`px-4 py-2 rounded-md transition-colors ${
              isMember
                ? "bg-rose-600 text-white hover:bg-rose-700"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            {isMember ? "Open Chat" : "Join Group"}
          </button>
        </div>
      </div>

      {showChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl h-[90vh] max-h-[800px]">
            <GroupChat
              groupId={group.id}
              groupName={group.name}
              onBack={() => setShowChat(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default GroupCard;
