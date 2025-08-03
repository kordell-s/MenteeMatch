"use client";

import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
}

export default function ConversationList({
  conversations,
  selectedConversation,
  onSelectConversation,
}: ConversationListProps) {
  return (
    <div className="divide-y divide-gray-100">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          onClick={() => onSelectConversation(conversation)}
          className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
            selectedConversation?.id === conversation.id
              ? "bg-blue-50 border-r-2 border-blue-500"
              : ""
          }`}
        >
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={conversation.otherUser.image} />
              <AvatarFallback>
                {conversation.otherUser.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {conversation.otherUser.name}
                </h3>
                {conversation.lastMessage && (
                  <span className="text-xs text-gray-500">
                    {(() => {
                      const date = new Date(conversation.lastMessage.createdAt);
                      return isNaN(date.getTime())
                        ? "Recently"
                        : formatDistanceToNow(date, { addSuffix: true });
                    })()}
                  </span>
                )}
              </div>

              {conversation.lastMessage ? (
                <p className="text-sm text-gray-600 truncate mt-1">
                  {conversation.lastMessage.content}
                </p>
              ) : (
                <p className="text-sm text-gray-400 italic mt-1">
                  No messages yet
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
