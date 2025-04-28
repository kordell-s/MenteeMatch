"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
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

// Mock data for conversations
const conversations = [
  {
    id: 1,
    person: {
      id: 101,
      name: "Emma Wilson",
      avatar: "/placeholder.svg",
      role: "mentee",
      title: "Product Designer",
    },
    lastMessage: {
      text: "Thanks for the feedback on my portfolio! I've made the changes you suggested.",
      time: "10:32 AM",
      isRead: true,
      sender: "them",
    },
    unread: 0,
    online: true,
  },
  {
    id: 2,
    person: {
      id: 102,
      name: "David Chen",
      avatar: "/placeholder.svg",
      role: "mentor",
      title: "Senior Product Manager",
    },
    lastMessage: {
      text: "Let's schedule our next session to discuss your career transition plan.",
      time: "Yesterday",
      isRead: false,
      sender: "them",
    },
    unread: 2,
    online: false,
  },
  {
    id: 3,
    person: {
      id: 103,
      name: "Sophia Lee",
      avatar: "/placeholder.svg",
      role: "mentee",
      title: "Marketing Specialist",
    },
    lastMessage: {
      text: "I've attached my resume for your review. Looking forward to your feedback!",
      time: "Yesterday",
      isRead: true,
      sender: "them",
    },
    unread: 0,
    online: true,
  },
  {
    id: 4,
    person: {
      id: 104,
      name: "Michael Brown",
      avatar: "/placeholder.svg",
      role: "mentor",
      title: "Engineering Manager",
    },
    lastMessage: {
      text: "Great job on the mock interview! Here are some areas to focus on for next time.",
      time: "Monday",
      isRead: true,
      sender: "them",
    },
    unread: 0,
    online: false,
  },
  {
    id: 5,
    person: {
      id: 105,
      name: "Olivia Martinez",
      avatar: "/placeholder.svg",
      role: "mentee",
      title: "Frontend Developer",
    },
    lastMessage: {
      text: "I implemented your suggestions and my code is much cleaner now. Thank you!",
      time: "Last week",
      isRead: true,
      sender: "them",
    },
    unread: 0,
    online: false,
  },
];

// Mock messages for a conversation
const mockMessages = [
  {
    id: 1,
    sender: "them",
    text: "Hi there! I'm looking forward to our mentoring session.",
    time: "Monday, 10:30 AM",
    isRead: true,
  },
  {
    id: 2,
    sender: "me",
    text: "Hello! Yes, I'm excited to help you with your career transition questions.",
    time: "Monday, 10:35 AM",
    isRead: true,
  },
  {
    id: 3,
    sender: "them",
    text: "Great! I've been working in marketing for 5 years and I'm interested in moving into product management. Do you have any advice on how to make this transition?",
    time: "Monday, 10:40 AM",
    isRead: true,
  },
  {
    id: 4,
    sender: "me",
    text: "That's a common transition path! First, I'd recommend learning about product management fundamentals through courses on Coursera or Product School. Also, try to get involved in product-related projects in your current role to build relevant experience.",
    time: "Monday, 10:45 AM",
    isRead: true,
  },
  {
    id: 5,
    sender: "me",
    text: "Would you like me to recommend some specific resources to help you get started?",
    time: "Monday, 10:46 AM",
    isRead: true,
  },
  {
    id: 6,
    sender: "them",
    text: "Yes, that would be very helpful! I've already started taking a few online courses, but I'm not sure which skills I should focus on developing first.",
    time: "Monday, 11:00 AM",
    isRead: true,
  },
  {
    id: 7,
    sender: "me",
    text: "I think these would be most valuable for you:\n\n1. User research and customer interviews\n2. Data analysis and metrics\n3. Prioritization frameworks\n4. Agile methodologies\n5. Stakeholder management\n\nFocusing on these areas will help you build a strong foundation.",
    time: "Monday, 11:15 AM",
    isRead: true,
  },
  {
    id: 8,
    sender: "them",
    text: "Thanks for the feedback on my portfolio! I've made the changes you suggested.",
    time: "Today, 10:32 AM",
    isRead: true,
  },
];

export default function MessagesPage() {
  const [activeConversation, setActiveConversation] = useState(
    conversations[0]
  );
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((conversation) => {
    if (!searchQuery) return true;
    return conversation.person.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
  });

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send a new message
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const newMsg = {
      id: messages.length + 1,
      sender: "me",
      text: newMessage,
      time: "Just now",
      isRead: false,
    };

    setMessages([...messages, newMsg]);
    setNewMessage("");
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden h-[calc(100vh-12rem)]">
      <div className="flex h-full">
        {/* Conversations sidebar */}
        <div className="w-full sm:w-80 md:w-96 border-r border-gray-200 flex flex-col">
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
                        activeConversation.id === conversation.id
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
                              {conversation.lastMessage.sender === "me" &&
                                "You: "}
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
                      <p className="text-gray-500">No conversations found</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="unread" className="p-0 mt-0">
                <div className="divide-y">
                  {filteredConversations
                    .filter((conversation) => conversation.unread > 0)
                    .map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-4 hover:bg-gray-50 cursor-pointer ${
                          activeConversation.id === conversation.id
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
                                {conversation.lastMessage.sender === "me" &&
                                  "You: "}
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
            {/* Chat header */}
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
