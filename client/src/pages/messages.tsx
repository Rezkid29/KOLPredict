import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/use-websocket";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Send, MessageCircle, Plus, Search, Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { User, ConversationWithParticipants, Message } from "@shared/schema";
import { format } from "date-fns";

type LeaderboardUser = {
  userId: string;
  username: string;
  balance: string;
  totalProfit: string;
  totalTrades: number;
  successRate: number;
  avatarUrl?: string | null;
};

export default function Messages() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [newConversationOpen, setNewConversationOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  
  useWebSocket();

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<ConversationWithParticipants[]>({
    queryKey: ["/api/conversations"],
    queryFn: async () => {
      const result = await apiRequest("GET", "/api/conversations");
      return result.json();
    },
    enabled: !!user,
  });

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["/api/conversations", selectedConversationId, "messages"],
    enabled: !!selectedConversationId,
  });

  const { data: allUsers = [] } = useQuery<LeaderboardUser[]>({
    queryKey: ["/api/leaderboard"],
    enabled: newConversationOpen,
  });

  const filteredUsers = allUsers.filter((u) => {
    if (!userSearch.trim()) return true;
    const searchLower = userSearch.toLowerCase();
    return (
      u.username.toLowerCase().includes(searchLower) &&
      u.userId !== user?.id
    );
  }).slice(0, 10);

  const createConversationMutation = useMutation({
    mutationFn: async (otherUserId: string) => {
      const result = await apiRequest("POST", "/api/conversations", {
        otherUserId,
      });
      return result.json();
    },
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setSelectedConversationId(conversation.id);
      setNewConversationOpen(false);
      setUserSearch("");
      toast({
        title: "Success",
        description: "Conversation created",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create conversation",
        variant: "destructive",
      });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedConversationId) return;
      return await apiRequest("POST", `/api/conversations/${selectedConversationId}/messages`, {
        content,
      });
    },
    onSuccess: () => {
      setMessageInput("");
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", selectedConversationId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      return await apiRequest("PUT", `/api/conversations/${conversationId}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });

  const deleteConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      return await apiRequest("DELETE", `/api/conversations/${conversationId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setSelectedConversationId(null);
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
      toast({
        title: "Conversation deleted",
        description: "The conversation has been removed",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete conversation",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    sendMessageMutation.mutate(messageInput.trim());
  };

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    markAsReadMutation.mutate(conversationId);
  };

  const handleCreateConversation = (otherUserId: string) => {
    createConversationMutation.mutate(otherUserId);
  };

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const otherUser = selectedConversation 
    ? (selectedConversation.user1Id === user?.id ? selectedConversation.user2 : selectedConversation.user1)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar balance={user?.balance ? parseFloat(user.balance) : 1000} username={user?.username ?? undefined} />

      <div className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2" data-testid="text-page-title">Messages</h1>
          <p className="text-muted-foreground">Connect with other traders</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-16rem)]">
          {/* Conversations List */}
          <Card className="lg:col-span-1 overflow-hidden border-border/60 flex flex-col">
            <div className="p-5 border-b border-border/50 flex items-center justify-between gap-2">
              <h2 className="font-semibold">Conversations</h2>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setNewConversationOpen(true)}
                data-testid="button-new-conversation"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>

            {conversationsLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <MessageCircle className="h-12 w-12 mb-4 opacity-50" />
                <p className="font-medium mb-1">No conversations yet</p>
                <p className="text-sm mb-4">Start chatting with other traders</p>
                <Button
                  onClick={() => setNewConversationOpen(true)}
                  data-testid="button-start-conversation"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Conversation
                </Button>
              </div>
            ) : (
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {conversations.map((conversation) => {
                    const other = conversation.user1Id === user?.id ? conversation.user2 : conversation.user1;
                    const hasUnread = conversation.unreadCount > 0;

                    return (
                      <div
                        key={conversation.id}
                        onClick={() => handleSelectConversation(conversation.id)}
                        className={`p-4 rounded-lg cursor-pointer transition-all hover-elevate ${
                          selectedConversationId === conversation.id
                            ? "bg-primary/10 border-primary/20"
                            : "border-transparent"
                        } border`}
                        data-testid={`conversation-${conversation.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 ring-2 ring-border">
                            <AvatarImage src={other.avatarUrl ?? undefined} alt={other.username ?? "User"} />
                            <AvatarFallback>{other.username?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className={`font-medium text-sm truncate ${hasUnread && "font-bold"}`}>
                                {other.username}
                              </p>
                              {hasUnread && (
                                <Badge className="bg-primary">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {format(new Date(conversation.lastMessageAt), "MMM d, h:mm a")}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </Card>

          {/* Chat Interface */}
          <Card className="lg:col-span-2 overflow-hidden border-border/60 flex flex-col">
            {!selectedConversationId ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <MessageCircle className="h-16 w-16 mb-4 opacity-50" />
                <p className="font-medium mb-1">Select a conversation</p>
                <p className="text-sm">Choose a conversation from the list to start messaging</p>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="p-5 border-b border-border/50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 ring-2 ring-border">
                      <AvatarImage src={otherUser?.avatarUrl ?? undefined} alt={otherUser?.username ?? "User"} />
                      <AvatarFallback>{otherUser?.username?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-semibold">{otherUser?.username}</h2>
                      <p className="text-xs text-muted-foreground">Online</p>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setConversationToDelete(selectedConversationId);
                      setDeleteDialogOpen(true);
                    }}
                    data-testid="button-delete-conversation"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-5">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground" data-testid="text-no-messages">
                      <p className="text-sm">No messages yet. Say hello!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const isOwnMessage = message.senderId === user?.id;

                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                            data-testid={`message-${message.id}`}
                          >
                            <div
                              className={`max-w-[70%] p-3 rounded-lg ${
                                isOwnMessage
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                {format(new Date(message.createdAt), "h:mm a")}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                <div className="p-5 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="flex-1"
                      disabled={sendMessageMutation.isPending}
                      data-testid="input-message"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || sendMessageMutation.isPending}
                      className="gap-2"
                      data-testid="button-send"
                    >
                      {sendMessageMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Send
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>

      {/* Delete Conversation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation? This will permanently remove all messages and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (conversationToDelete) {
                  deleteConversationMutation.mutate(conversationToDelete);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New Conversation Dialog */}
      <Dialog open={newConversationOpen} onOpenChange={setNewConversationOpen}>
        <DialogContent data-testid="dialog-new-conversation">
          <DialogHeader>
            <DialogTitle>New Conversation</DialogTitle>
            <DialogDescription>
              Search for a user to start a conversation
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-10"
                data-testid="input-search-users"
              />
            </div>

            <ScrollArea className="h-[300px] border rounded-lg">
              {filteredUsers.length === 0 ? (
                <div className="flex items-center justify-center h-full p-8 text-center text-muted-foreground">
                  <p className="text-sm">
                    {userSearch.trim() ? "No users found" : "Start typing to search users"}
                  </p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {filteredUsers.map((searchUser) => (
                    <div
                      key={searchUser.userId}
                      onClick={() => handleCreateConversation(searchUser.userId)}
                      className="p-3 rounded-lg cursor-pointer transition-all hover-elevate border border-transparent"
                      data-testid={`user-search-result-${searchUser.userId}`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 ring-2 ring-border">
                          <AvatarImage src={searchUser.avatarUrl ?? undefined} alt={searchUser.username} />
                          <AvatarFallback>{searchUser.username[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{searchUser.username}</p>
                          <p className="text-xs text-muted-foreground">
                            {searchUser.totalTrades || 0} trades • {searchUser.successRate ? searchUser.successRate.toFixed(1) : '0.0'}% success
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {createConversationMutation.isPending && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating conversation...
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
