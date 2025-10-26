import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, ThumbsUp, ThumbsDown, MessageSquare, TrendingUp } from "lucide-react";
import type { User, ForumThread, ForumComment } from "@shared/schema";
import { format } from "date-fns";

export default function Forum() {
  const [category, setCategory] = useState("all");
  const [newThreadOpen, setNewThreadOpen] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadContent, setNewThreadContent] = useState("");
  const [newThreadCategory, setNewThreadCategory] = useState("general");
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [newCommentContent, setNewCommentContent] = useState("");
  const { toast } = useToast();

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const threadsUrl = category === "all" 
    ? "/api/forum/threads" 
    : `/api/forum/threads?category=${category}`;

  const { data: threads = [], isLoading: threadsLoading } = useQuery<(ForumThread & { user: { username: string | null } })[]>({
    queryKey: ["/api/forum/threads", category],
    queryFn: async () => {
      const res = await fetch(threadsUrl, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch threads");
      return res.json();
    },
  });

  const { data: comments = [] } = useQuery<(ForumComment & { user: { username: string | null } })[]>({
    queryKey: ["/api/forum/threads", selectedThreadId, "comments"],
    queryFn: async () => {
      if (!selectedThreadId) throw new Error("No thread selected");
      const res = await fetch(`/api/forum/threads/${selectedThreadId}/comments`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch comments");
      return res.json();
    },
    enabled: !!selectedThreadId,
  });

  const createThreadMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Authentication required");
      return await apiRequest("/api/forum/threads", "POST", {
        title: newThreadTitle,
        content: newThreadContent,
        category: newThreadCategory,
      });
    },
    onSuccess: () => {
      setNewThreadOpen(false);
      setNewThreadTitle("");
      setNewThreadContent("");
      queryClient.invalidateQueries({ queryKey: ["/api/forum/threads"] });
      toast({
        title: "Thread created",
        description: "Your thread has been posted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create thread",
        variant: "destructive",
      });
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Authentication required");
      if (!selectedThreadId) throw new Error("No thread selected");
      return await apiRequest(`/api/forum/threads/${selectedThreadId}/comments`, "POST", {
        content: newCommentContent,
      });
    },
    onSuccess: () => {
      setNewCommentContent("");
      queryClient.invalidateQueries({ queryKey: ["/api/forum/threads", selectedThreadId, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/forum/threads"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post comment",
        variant: "destructive",
      });
    },
  });

  const voteThreadMutation = useMutation({
    mutationFn: async ({ threadId, vote }: { threadId: string; vote: "up" | "down" }) => {
      if (!user) throw new Error("Authentication required");
      return await apiRequest(`/api/forum/threads/${threadId}/vote`, "POST", {
        vote,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/threads"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to vote",
        variant: "destructive",
      });
    },
  });

  const selectedThread = threads.find(t => t.id === selectedThreadId);
  const filteredThreads = category === "all" ? threads : threads.filter(t => t.category === category);

  return (
    <div className="min-h-screen bg-background">
      <Navbar balance={user?.balance ? parseFloat(user.balance) : 1000} username={user?.username ?? undefined} />

      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2" data-testid="text-page-title">Forum</h1>
            <p className="text-muted-foreground">Discuss strategies, markets, and KOLs</p>
          </div>

          <Dialog open={newThreadOpen} onOpenChange={setNewThreadOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="button-new-thread" disabled={!user}>
                <Plus className="h-4 w-4" />
                New Thread
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Thread</DialogTitle>
                <DialogDescription>
                  {!user ? "Please log in to create a thread" : "Start a discussion with the community"}
                </DialogDescription>
              </DialogHeader>
              {!user ? (
                <div className="p-8 text-center text-muted-foreground">
                  <p className="mb-4">You need to be logged in to create threads</p>
                  <Button onClick={() => setNewThreadOpen(false)}>Close</Button>
                </div>
              ) : (
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Title</label>
                    <Input
                      placeholder="Thread title..."
                      value={newThreadTitle}
                      onChange={(e) => setNewThreadTitle(e.target.value)}
                      data-testid="input-thread-title"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <select
                      value={newThreadCategory}
                      onChange={(e) => setNewThreadCategory(e.target.value)}
                      className="w-full p-2 rounded-md border border-border bg-background"
                      data-testid="select-category"
                    >
                      <option value="general">General</option>
                      <option value="strategies">Strategies</option>
                      <option value="kols">KOLs</option>
                      <option value="markets">Markets</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Content</label>
                    <Textarea
                      placeholder="Share your thoughts..."
                      value={newThreadContent}
                      onChange={(e) => setNewThreadContent(e.target.value)}
                      rows={6}
                      data-testid="textarea-thread-content"
                    />
                  </div>
                  <Button
                    onClick={() => createThreadMutation.mutate()}
                    disabled={!newThreadTitle.trim() || !newThreadContent.trim() || createThreadMutation.isPending}
                    className="w-full"
                    data-testid="button-post-thread"
                  >
                    {createThreadMutation.isPending ? "Posting..." : "Post Thread"}
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Category Tabs */}
        <Tabs value={category} onValueChange={setCategory} className="mb-6">
          <TabsList>
            <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
            <TabsTrigger value="general" data-testid="tab-general">General</TabsTrigger>
            <TabsTrigger value="strategies" data-testid="tab-strategies">Strategies</TabsTrigger>
            <TabsTrigger value="kols" data-testid="tab-kols">KOLs</TabsTrigger>
            <TabsTrigger value="markets" data-testid="tab-markets">Markets</TabsTrigger>
          </TabsList>

          <TabsContent value={category} className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Thread List */}
              <div className="lg:col-span-2 space-y-3">
                {threadsLoading ? (
                  <Card className="p-8">
                    <div className="animate-pulse text-center text-muted-foreground">Loading threads...</div>
                  </Card>
                ) : filteredThreads.length === 0 ? (
                  <Card className="p-8">
                    <div className="text-center text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="font-medium mb-1">No threads yet</p>
                      <p className="text-sm">Be the first to start a discussion!</p>
                    </div>
                  </Card>
                ) : (
                  filteredThreads.map((thread) => (
                    <Card
                      key={thread.id}
                      className={`p-5 hover-elevate transition-all cursor-pointer ${
                        selectedThreadId === thread.id ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setSelectedThreadId(thread.id)}
                      data-testid={`thread-${thread.id}`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Voting */}
                        <div className="flex flex-col items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              voteThreadMutation.mutate({ threadId: thread.id, vote: "up" });
                            }}
                            disabled={!user || voteThreadMutation.isPending}
                            data-testid={`button-upvote-${thread.id}`}
                          >
                            <ThumbsUp className="h-4 w-4" />
                          </Button>
                          <span className="text-sm font-bold tabular-nums">
                            {thread.upvotes - thread.downvotes}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              voteThreadMutation.mutate({ threadId: thread.id, vote: "down" });
                            }}
                            disabled={!user || voteThreadMutation.isPending}
                            data-testid={`button-downvote-${thread.id}`}
                          >
                            <ThumbsDown className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Thread Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{thread.title}</h3>
                            <Badge variant="secondary" className="capitalize">
                              {thread.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {thread.content}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-xs">
                                  {thread.user.username?.[0]?.toUpperCase() ?? "U"}
                                </AvatarFallback>
                              </Avatar>
                              <span>{thread.user.username}</span>
                            </div>
                            <span>•</span>
                            <span>{format(new Date(thread.createdAt), "MMM d, yyyy")}</span>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              <span>{thread.commentsCount} comments</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>

              {/* Thread Detail / Comments */}
              <Card className="lg:col-span-1 overflow-hidden flex flex-col max-h-[calc(100vh-16rem)]">
                {!selectedThreadId ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mb-4 opacity-50" />
                    <p className="font-medium mb-1">Select a thread</p>
                    <p className="text-sm">Click on a thread to view comments</p>
                  </div>
                ) : (
                  <>
                    <div className="p-5 border-b border-border/50">
                      <h3 className="font-semibold mb-2">{selectedThread?.title}</h3>
                      <p className="text-sm text-muted-foreground">{comments.length} comments</p>
                    </div>

                    <ScrollArea className="flex-1 p-5">
                      {comments.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                          <p className="text-sm">No comments yet. Be the first!</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {comments.map((comment) => (
                            <div key={comment.id} className="space-y-2" data-testid={`comment-${comment.id}`}>
                              <div className="flex items-start gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs">
                                    {comment.user.username?.[0]?.toUpperCase() ?? "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium">{comment.user.username}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {format(new Date(comment.createdAt), "MMM d")}
                                    </span>
                                  </div>
                                  <p className="text-sm">{comment.content}</p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Button size="sm" variant="ghost" className="h-6 text-xs gap-1">
                                      <ThumbsUp className="h-3 w-3" />
                                      {comment.upvotes}
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-6 text-xs gap-1">
                                      <ThumbsDown className="h-3 w-3" />
                                      {comment.downvotes}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>

                    <div className="p-5 border-t border-border/50">
                      {!user ? (
                        <div className="text-center text-sm text-muted-foreground py-4">
                          <p>Please log in to post comments</p>
                        </div>
                      ) : (
                        <>
                          <div className="flex gap-2">
                            <Textarea
                              placeholder="Add a comment..."
                              value={newCommentContent}
                              onChange={(e) => setNewCommentContent(e.target.value)}
                              rows={3}
                              data-testid="textarea-comment"
                            />
                          </div>
                          <Button
                            onClick={() => createCommentMutation.mutate()}
                            disabled={!newCommentContent.trim() || createCommentMutation.isPending}
                            className="w-full mt-2"
                            size="sm"
                            data-testid="button-post-comment"
                          >
                            {createCommentMutation.isPending ? "Posting..." : "Post Comment"}
                          </Button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
