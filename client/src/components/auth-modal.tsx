import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCircle, LogIn, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (userId: string) => void;
}

export function AuthModal({ open, onClose, onSuccess }: AuthModalProps) {
  const [loginUsername, setLoginUsername] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async () => {
    if (!loginUsername.trim()) {
      toast({
        title: "Error",
        description: "Please enter a username",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/login", {
        username: loginUsername,
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Welcome back!",
          description: `Logged in as ${loginUsername}`,
        });
        onSuccess(data.userId);
        onClose();
        setLoginUsername("");
      } else {
        toast({
          title: "Error",
          description: "User not found. Please register first.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to login. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!registerUsername.trim()) {
      toast({
        title: "Error",
        description: "Please enter a username",
        variant: "destructive",
      });
      return;
    }

    if (registerUsername.length < 3) {
      toast({
        title: "Error",
        description: "Username must be at least 3 characters",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/register", {
        username: registerUsername,
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Account created!",
          description: `Welcome ${registerUsername}! You've been given 1000 PTS to start trading.`,
        });
        onSuccess(data.userId);
        onClose();
        setRegisterUsername("");
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.message || "Username already exists",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="modal-auth">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-primary" />
            Welcome to KOL Predict
          </DialogTitle>
          <DialogDescription>
            Login to your account or create a new one to start trading
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
            <TabsTrigger value="register" data-testid="tab-register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-username">Username</Label>
              <Input
                id="login-username"
                placeholder="Enter your username"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                data-testid="input-login-username"
              />
            </div>
            <Button 
              onClick={handleLogin} 
              disabled={loading}
              className="w-full gap-2"
              data-testid="button-login"
            >
              <LogIn className="h-4 w-4" />
              {loading ? "Logging in..." : "Login"}
            </Button>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="register-username">Username</Label>
              <Input
                id="register-username"
                placeholder="Choose a username"
                value={registerUsername}
                onChange={(e) => setRegisterUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                data-testid="input-register-username"
              />
              <p className="text-xs text-muted-foreground">
                Minimum 3 characters. You'll start with 1000 PTS.
              </p>
            </div>
            <Button 
              onClick={handleRegister} 
              disabled={loading}
              className="w-full gap-2"
              data-testid="button-register"
            >
              <UserPlus className="h-4 w-4" />
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
