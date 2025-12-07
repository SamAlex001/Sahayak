import React, { useState, useEffect, useCallback } from "react";
import { Send, ArrowLeft } from "lucide-react";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../../lib/config";
import { apiFetch } from "../../lib/api";


interface Message {
  _id: string;
  message: string;
  createdAt: string;
  userId: string;
  userProfile?: {
    fullName?: string;
    email?: string;
    role?: string;
  } | null;
}

interface GroupChatProps {
  groupId: string;
  groupName: string;
  onBack: () => void;
}

const GroupChat: React.FC<GroupChatProps> = ({
  groupId,
  groupName,
  onBack,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/chats/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load messages");
      const data = await res.json();
      setMessages(data || []);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    // decode light-weight: we only need user id from /auth/me
    apiFetch("/api/auth/me")
      .then((me) => {
        setCurrentUser(me?.id || null);
        // Initialize socket after getting user
        const newSocket = io(SOCKET_URL || '/', {
          auth: { token },
        });

        newSocket.on("connect", () => {
          newSocket.emit("join-group", groupId);
          if (me?.id) {
            newSocket.emit("join-notifications", me.id);
          }
        });

        newSocket.on("group-message", (message: Message) => {
          setMessages((prev) => {
            // Check if message already exists to prevent duplicates
            const exists = prev.some((m) => m._id === message._id);
            if (exists) return prev;
            return [...prev, message];
          });
        });

        return () => {
          newSocket.disconnect();
        };
      })
      .catch(() => setCurrentUser(null));

    loadMessages();
  }, [groupId, loadMessages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/chats/${groupId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: newMessage.trim() }),
      });
      if (!res.ok) throw new Error("Failed to send message");

      // Clear input immediately
      setNewMessage("");
      // Don't add the message here - let the socket event handle it
      // This prevents duplicate messages
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden h-full flex flex-col">
      <div className="bg-white border-b px-4 py-3 flex items-center">
        <button
          onClick={onBack}
          className="mr-3 hover:bg-gray-100 p-1 rounded-full transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-gray-600" />
        </button>
        <h2 className="text-xl font-semibold">{groupName}</h2>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`flex ${
              message.userId === currentUser ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] ${
                message.userId !== currentUser ? "flex flex-col" : ""
              }`}
            >
              {/* Show sender name for other users' messages */}
              {message.userId !== currentUser &&
                message.userProfile?.fullName && (
                  <p className="text-xs text-gray-600 mb-1 px-1">
                    {message.userProfile.fullName}
                  </p>
                )}
              <div
                className={`rounded-lg p-3 ${
                  message.userId === currentUser
                    ? "bg-rose-600 text-white"
                    : "bg-white border"
                }`}
              >
                <p className="break-words">{message.message}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.userId === currentUser
                      ? "text-rose-100"
                      : "text-gray-500"
                  }`}
                >
                  {formatTime(message.createdAt)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="p-4 bg-white border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-rose-600 text-white p-2 rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default GroupChat;
