import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Share2, Send, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getUserId } from "@/hooks/use-auth";
import type { MarketWithKol, CommentWithUser } from "@shared/schema";

interface MarketDetailsModalProps {
  open: boolean;
  onClose: () => void;
  market: MarketWithKol | null;
}

export function MarketDetailsModal({ open, onClose, market }: MarketDetailsModalProps) {
  const [comment, setComment] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const userId = getUserId();

  const { data: comments = [] } = useQuery<CommentWithUser[]>({
    queryKey: ["/api/markets", market?.id, "comments"],
    queryFn: async () => {
      if (!market) return [];
      const response = await fetch(`/api/markets/${market.id}/comments`);
      if (!response.ok) throw new Error("Failed to fetch comments");
      return response.json();
    },
    enabled: !!market && open,
  });

  const postCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", "/api/comments", {
        marketId: market?.id,
        content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/markets", market?.id, "comments"] });
      setComment("");
      toast({
        title: "Comment posted!",
        description: "Your comment has been added",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
    },
  });

  const handleShare = async () => {
    const url = `${window.location.origin}/#market-${market?.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Market link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const handlePostComment = () => {
    if (!comment.trim() || !userId) return;
    postCommentMutation.mutate(comment.trim());
  };

  if (!market) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col" data-testid="modal-market-details">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                <AvatarImage src={market.kol.avatar} alt={market.kol.name} />
                <AvatarFallback>{market.kol.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-lg">{market.kol.name}</DialogTitle>
                <DialogDescription className="line-clamp-2">
                  {market.title}
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 shrink-0"
              onClick={handleShare}
              data-testid="button-share"
            >
              {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
              {copied ? "Copied!" : "Share"}
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Comments Section */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Comments ({comments.length})</h3>
            </div>

            <ScrollArea className="flex-1 pr-4">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No comments yet</p>
                  <p className="text-xs mt-1">Be the first to share your thoughts!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((c) => (
                    <div key={c.id} className="space-y-2" data-testid={`comment-${c.id}`}>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {c.user.username}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{c.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Comment Input */}
          {userId && (
            <div className="space-y-2 pt-4 border-t border-border">
              <Textarea
                placeholder="Share your thoughts..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="resize-none min-h-20"
                data-testid="textarea-comment"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handlePostComment}
                  disabled={!comment.trim() || postCommentMutation.isPending}
                  size="sm"
                  className="gap-2"
                  data-testid="button-post-comment"
                >
                  <Send className="h-4 w-4" />
                  {postCommentMutation.isPending ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
