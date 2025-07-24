"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Calendar,
  MessageSquare,
} from "lucide-react";

interface Message {
  id: string;
  sender: "me" | "them";
  text: string;
  time: string;
  isRead: boolean;
}

interface Conversation {
  id: string;
  person: {
    id: string;
    name: string;
    avatar: string;
    role: string;
    title: string;
  };
  lastMessage: {
    text: string;
    time: string;
    isRead: boolean;
  };
  unread: number;
  online: boolean;
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load conversations on component mount
  useEffect(() => {
    if (status === "authenticated") {
      loadConversations();
    }
  }, [status]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation.id);
    }
  }, [activeConversation]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const response = await fetch("/api/messages/conversations");
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
        if (data.length > 0 && !activeConversation) {
          setActiveConversation(data[0]);
        }
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
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
        // Refresh conversations to update unread counts
        loadConversations();
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;

    try {
      const response = await fetch(`/api/messages/${activeConversation.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newMessage.trim() }),
      });

      if (response.ok) {
        const newMsg = await response.json();
        setMessages((prev) => [...prev, newMsg]);
        setNewMessage("");
        // Refresh conversations to update last message
        loadConversations();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((conversation) => {
    if (!searchQuery) return true;
    return conversation.person.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
  });

  if (status === "loading" || loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden h-[calc(100vh-12rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-gray-500">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden h-[calc(100vh-12rem)] flex items-center justify-center">
        <p className="text-gray-500">Please log in to access messages</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden h-[calc(100vh-12rem)]">
      <div className="flex h-full">
        {/* Conversations sidebar */}
        <div className="w-full sm:w-80 md:w-96 border-r border-gray-200 flex flex-col">
          {/* ...existing search header code... */}
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
            <Tabs defaultValue="all" className="w-full">
              <div className="px-4 pt-4">
                <TabsList className="w-full">
                  <TabsTrigger value="all" className="flex-1">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="unread" className="flex-1">
                    Unread
                    <Badge className="ml-2 bg-primary text-white">
                      {conversations.reduce(
                        (acc, conv) => acc + conv.unread,
                        0
                      )}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="p-0 mt-0">
                <div className="divide-y">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer ${
                        activeConversation?.id === conversation.id
                          ? "bg-gray-50"
                          : ""
                      }`}
                      onClick={() => setActiveConversation(conversation)}
                    >
                      {/* ...existing conversation item code... */}
                      <div className="flex items-center">
                        <div className="relative">
                          <Image
                            src={
                              conversation.person.avatar || "/placeholder.svg"
                            }
                            alt={conversation.person.name}
                            width={48}
                            height={48}
                            className="rounded-full"
                          />
                          {conversation.online && (
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                          )}
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3
                              className={`font-medium truncate ${
                                conversation.unread > 0
                                  ? "text-black font-semibold"
                                  : "text-gray-900"
                              }`}
                            >
                              {conversation.person.name}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {conversation.lastMessage.time}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p
                              className={`text-sm truncate ${
                                conversation.unread > 0
                                  ? "text-black font-medium"
                                  : "text-gray-500"
                              }`}
                            >
                              {conversation.lastMessage.text}
                            </p>
                            {conversation.unread > 0 && (
                              <Badge className="bg-primary text-white">
                                {conversation.unread}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

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
              </TabsContent>

              <TabsContent value="unread" className="p-0 mt-0">
                {/* ...existing unread tab code... */}
                <div className="divide-y">
                  {filteredConversations
                    .filter((conversation) => conversation.unread > 0)
                    .map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-4 hover:bg-gray-50 cursor-pointer ${
                          activeConversation?.id === conversation.id
                            ? "bg-gray-50"
                            : ""
                        }`}
                        onClick={() => setActiveConversation(conversation)}
                      >
                        <div className="flex items-center">
                          <div className="relative">
                            <Image
                              src={
                                conversation.person.avatar || "/placeholder.svg"
                              }
                              alt={conversation.person.name}
                              width={48}
                              height={48}
                              className="rounded-full"
                            />
                            {conversation.online && (
                              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                            )}
                          </div>
                          <div className="ml-3 flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold truncate">
                                {conversation.person.name}
                              </h3>
                              <span className="text-xs text-gray-500">
                                {conversation.lastMessage.time}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium truncate">
                                {conversation.lastMessage.text}
                              </p>
                              <Badge className="bg-primary text-white">
                                {conversation.unread}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                  {filteredConversations.filter(
                    (conversation) => conversation.unread > 0
                  ).length === 0 && (
                    <div className="p-6 text-center">
                      <p className="text-gray-500">No unread messages</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Chat area */}
        {activeConversation ? (
          <div className="hidden sm:flex flex-col flex-1">
            {/* ...existing chat header code... */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center">
                <div className="relative">
                  <Image
                    src={activeConversation.person.avatar || "/placeholder.svg"}
                    alt={activeConversation.person.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  {activeConversation.online && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                  )}
                </div>
                <div className="ml-3">
                  <h3 className="font-medium">
                    {activeConversation.person.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {activeConversation.person.title} •{" "}
                    <span className="capitalize">
                      {activeConversation.person.role}
                    </span>
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
                    message.sender === "me" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.sender !== "me" && (
                    <Image
                      src={
                        activeConversation.person.avatar || "/placeholder.svg"
                      }
                      alt={activeConversation.person.name}
                      width={36}
                      height={36}
                      className="rounded-full mr-2 self-end"
                    />
                  )}
                  <div
                    className={`max-w-[70%] ${
                      message.sender === "me"
                        ? "bg-primary text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg"
                        : "bg-gray-100 text-gray-800 rounded-tl-lg rounded-tr-lg rounded-br-lg"
                    } p-3`}
                  >
                    <p className="whitespace-pre-wrap">{message.text}</p>
                    <div
                      className={`text-xs mt-1 ${
                        message.sender === "me"
                          ? "text-primary-foreground/70"
                          : "text-gray-500"
                      }`}
                    >
                      {message.time}
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
                  disabled={!newMessage.trim()}
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
              Select a conversation from the list or start a new one to begin
              messaging
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
