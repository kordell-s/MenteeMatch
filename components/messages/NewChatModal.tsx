"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface User {
  id: string;
  name: string;
  image?: string;
  email: string;
}

interface Conversation {
  id: string;
  otherUser: User;
}

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNewConversation: (conversation: Conversation) => void;
}

export default function NewChatModal({
  isOpen,
  onClose,
  onNewConversation,
}: NewChatModalProps) {
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm) {
      setFilteredUsers(
        availableUsers.filter(
          (user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredUsers(availableUsers);
    }
  }, [searchTerm, availableUsers]);

  const fetchAvailableUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/mentorships/available");
      if (response.ok) {
        const data = await response.json();
        setAvailableUsers(data);
        setFilteredUsers(data);
      }
    } catch (error) {
      console.error("Error fetching available users:", error);
    } finally {
      setLoading(false);
    }
  };

  const startConversation = async (userId: string) => {
    try {
      setStarting(true);
      const response = await fetch("/api/conversations/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        onNewConversation({
          id: data.conversation.id,
          otherUser: data.otherUser,
        });
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
    } finally {
      setStarting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-2 border-brand-sky/30">
        <DialogHeader>
          <DialogTitle className="text-brand-navy text-xl">Start New Chat</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Users List */}
          <div className="max-h-64 overflow-y-auto space-y-2">
            {loading ? (
              <div className="text-center py-4 text-brand-teal">Loading your mentees...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                {searchTerm
                  ? "No mentees found matching your search"
                  : "No mentees available to chat with"}
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-brand-sky/20 hover:bg-brand-sky/10 hover:border-brand-teal/40 transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 border-2 border-brand-sky/30">
                      <AvatarImage src={user.image} />
                      <AvatarFallback className="bg-brand-teal text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-brand-navy">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => startConversation(user.id)}
                    disabled={starting}
                    size="sm"
                    className="bg-brand-teal hover:bg-brand-navy"
                  >
                    Chat
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
