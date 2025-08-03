"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import ConversationList from "@/components/messages/ConversationList";
import ChatView from "@/components/messages/ChatView";
import NewChatModal from "@/components/messages/NewChatModal";
import { Button } from "@/components/ui/button";
import { MessageCircle, Plus } from "lucide-react";

interface User {
  id: string;
  name: string;
  image?: string;
  email: string;
}

interface Conversation {
  id: string;
  otherUser: User;
  lastMessage?: {
    content: string;
    createdAt: string;
    senderId: string;
  };
  updatedAt: string;
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchConversations();
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!session) {
    redirect("/auth/signin");
  }

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/conversations/list");
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversation = (
    conversation: Omit<Conversation, "updatedAt">
  ) => {
    const conversationWithTimestamp = {
      ...conversation,
      updatedAt: new Date().toISOString(),
    };
    setConversations((prev) => [conversationWithTimestamp, ...prev]);
    setSelectedConversation(conversationWithTimestamp);
    setShowNewChatModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading conversations...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800">Messages</h1>
            <Button
              onClick={() => setShowNewChatModal(true)}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              New Chat
            </Button>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <MessageCircle size={48} className="mb-4" />
              <p>No conversations yet</p>
              <Button
                onClick={() => setShowNewChatModal(true)}
                variant="outline"
                className="mt-4"
              >
                Start your first chat
              </Button>
            </div>
          ) : (
            <ConversationList
              conversations={conversations}
              selectedConversation={selectedConversation}
              onSelectConversation={setSelectedConversation}
            />
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <ChatView conversation={selectedConversation} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <MessageCircle size={64} className="mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Select a conversation
              </h2>
              <p>Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onNewConversation={handleNewConversation}
      />
    </div>
  );
}
