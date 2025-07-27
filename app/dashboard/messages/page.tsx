"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  Send,
  User,
  Clock,
  Search,
  Phone,
  Video,
  Calendar,
  MoreVertical,
  Paperclip,
} from "lucide-react";
import Image from "next/image";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
}

interface Conversation {
  id: string;
  messages: Message[];
  mentorship: {
    mentee: {
      id: string;
      firstName: string;
      lastName: string;
      profilePicture?: string;
    };
    mentor: {
      id: string;
      firstName: string;
      lastName: string;
      profilePicture?: string;
    };
  };
  updatedAt: string;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userRole, setUserRole] = useState<"mentor" | "mentee" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Replace with actual user ID from authentication
  const userId = "3459d90e-8bd8-43f2-9b17-b40b16625668";

  useEffect(() => {
    fetchUserRoleAndConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchUserRoleAndConversations = async () => {
    try {
      setLoading(true);

      // Determine user role
      const mentorResponse = await fetch(`/api/dashboard/mentor?id=${userId}`);
      let role: "mentor" | "mentee" = "mentee";

      if (mentorResponse.ok) {
        role = "mentor";
      }

      setUserRole(role);

      // Fetch conversations
      const conversationsResponse = await fetch(
        `/api/messages?userId=${userId}&role=${role.toUpperCase()}`
      );

      if (conversationsResponse.ok) {
        const conversationsData = await conversationsResponse.json();
        setConversations(conversationsData);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    try {
      setSending(true);
      const response = await fetch(`/api/messages/${selectedConversation.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newMessage.trim(),
          senderId: userId,
        }),
      });

      if (response.ok) {
        const newMsg = await response.json();
        setMessages((prev) => [...prev, newMsg]);
        setNewMessage("");
        // Refresh conversations to update last message
        fetchUserRoleAndConversations();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const getOtherPerson = (conversation: Conversation) => {
    if (userRole === "mentor") {
      return conversation.mentorship.mentee;
    } else {
      return conversation.mentorship.mentor;
    }
  };

  const getLastMessage = (conversation: Conversation) => {
    if (conversation.messages.length > 0) {
      const lastMsg = conversation.messages[0];
      return {
        text: lastMsg.content,
        time: new Date(lastMsg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        senderId: lastMsg.senderId,
      };
    }
    return { text: "No messages yet", time: "", senderId: "" };
  };

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((conversation) => {
    if (!searchQuery) return true;
    const otherPerson = getOtherPerson(conversation);
    const fullName = `${otherPerson.firstName} ${otherPerson.lastName}`;
    return fullName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden h-[calc(100vh-12rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-gray-500">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden h-[calc(100vh-12rem)]">
      <div className="flex h-full">
        {/* Conversations sidebar */}
        <div className="w-full sm:w-80 md:w-96 border-r border-gray-200 flex flex-col">
          {/* Search header */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <Input
                placeholder="Search conversations..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="divide-y">
              {filteredConversations.map((conversation) => {
                const otherPerson = getOtherPerson(conversation);
                const lastMessage = getLastMessage(conversation);

                return (
                  <div
                    key={conversation.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${
                      selectedConversation?.id === conversation.id
                        ? "bg-gray-50"
                        : ""
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-center">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={otherPerson.profilePicture || undefined}
                          alt={`${otherPerson.firstName} ${otherPerson.lastName}`}
                        />
                        <AvatarFallback>
                          {otherPerson.firstName[0]}
                          {otherPerson.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium truncate text-gray-900">
                            {otherPerson.firstName} {otherPerson.lastName}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {lastMessage.time}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm truncate text-gray-500">
                            {lastMessage.senderId === userId ? "You: " : ""}
                            {lastMessage.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredConversations.length === 0 && (
                <div className="p-6 text-center">
                  <p className="text-gray-500">
                    {conversations.length === 0
                      ? "No conversations yet. Start messaging mentors or mentees!"
                      : "No conversations found"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat area */}
        {selectedConversation ? (
          <div className="hidden sm:flex flex-col flex-1">
            {/* Chat header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={
                      getOtherPerson(selectedConversation).profilePicture ||
                      undefined
                    }
                    alt={`${getOtherPerson(selectedConversation).firstName} ${
                      getOtherPerson(selectedConversation).lastName
                    }`}
                  />
                  <AvatarFallback>
                    {getOtherPerson(selectedConversation).firstName[0]}
                    {getOtherPerson(selectedConversation).lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <h3 className="font-medium">
                    {getOtherPerson(selectedConversation).firstName}{" "}
                    {getOtherPerson(selectedConversation).lastName}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {userRole === "mentor" ? "Mentee" : "Mentor"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Calendar className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === userId
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  {message.senderId !== userId && (
                    <Avatar className="h-9 w-9 mr-2 self-end">
                      <AvatarImage
                        src={message.sender.profilePicture || undefined}
                        alt={`${message.sender.firstName} ${message.sender.lastName}`}
                      />
                      <AvatarFallback>
                        {message.sender.firstName[0]}
                        {message.sender.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[70%] ${
                      message.senderId === userId
                        ? "bg-primary text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg"
                        : "bg-gray-100 text-gray-800 rounded-tl-lg rounded-tr-lg rounded-br-lg"
                    } p-3`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <div
                      className={`text-xs mt-1 ${
                        message.senderId === userId
                          ? "text-primary-foreground/70"
                          : "text-gray-500"
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  className="mx-2"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  size="icon"
                  className="rounded-full"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden sm:flex flex-col flex-1 items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              No conversation selected
            </h3>
            <p className="text-gray-500 max-w-md">
              Select a conversation from the list to begin messaging
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
