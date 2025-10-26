import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCircle, LogIn, UserPlus, Wallet, User, AlertCircle } from "lucide-react";
import { SiX } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import bs58 from "bs58";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (userId: string) => void;
}

const SOLANA_WALLET_TIMEOUT = 30000; // 30 seconds
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000; // 2 seconds

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = MAX_RETRY_ATTEMPTS,
  baseDelay: number = RETRY_DELAY
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      if (error.code === 4001) {
        throw error;
      }

      if (attempt < maxAttempts) {
        const delayMs = baseDelay * Math.pow(2, attempt - 1);
        console.log(`Attempt ${attempt} failed, retrying in ${delayMs}ms...`);
        await delay(delayMs);
      }
    }
  }

  throw lastError;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    )
  ]);
}

export function AuthModal({ open, onClose, onSuccess }: AuthModalProps) {
  const [loginUsername, setLoginUsername] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [walletDetected, setWalletDetected] = useState(true);
  const { toast } = useToast();

  const checkWalletInstalled = () => {
    const hasWallet = typeof window !== 'undefined' && !!window.solana;
    setWalletDetected(hasWallet);
    return hasWallet;
  };

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
        
        if (data.userId) {
          // Store userId in localStorage before calling onSuccess
          localStorage.setItem("userId", data.userId);
          window.dispatchEvent(new Event("storage"));

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
            description: "Login failed: User ID not found.",
            variant: "destructive",
          });
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast({
          title: "Error",
          description: errorData.message || "User not found. Please register first.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to login. Please try again.",
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
        
        if (data.userId) {
          // Store userId in localStorage before calling onSuccess
          localStorage.setItem("userId", data.userId);
          window.dispatchEvent(new Event("storage"));

          toast({
            title: "Account created!",
            description: `Welcome ${registerUsername}! You've been given 1000 PTS to start trading.`,
          });
          onSuccess(data.userId);
          onClose();
          setRegisterUsername("");
        } else {
          toast({
            title: "Error",
            description: "Registration failed: User ID not found.",
            variant: "destructive",
          });
        }
      } else {
        const data = await response.json().catch(() => ({}));
        toast({
          title: "Error",
          description: data.message || "Username already exists",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to register. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/guest", {});

      if (response.ok) {
        const data = await response.json();
        
        if (data.userId) {
          // Store userId in localStorage before calling onSuccess
          localStorage.setItem("userId", data.userId);
          window.dispatchEvent(new Event("storage"));

          toast({
            title: "Welcome!",
            description: "Signed in as guest. You've been given 1000 PTS to start trading.",
          });
          onSuccess(data.userId);
          onClose();
        } else {
          toast({
            title: "Error",
            description: "Guest sign-in failed: User ID not found.",
            variant: "destructive",
          });
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast({
          title: "Error",
          description: errorData.message || "Failed to create guest account.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Guest login error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign in as guest. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSolanaConnect = async () => {
    if (!checkWalletInstalled()) {
      toast({
        title: "Wallet not found",
        description: "Please install Phantom or another Solana wallet extension and refresh the page.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    let nonce: string | null = null;

    try {
      const getNonce = async () => {
        const nonceResponse = await withTimeout(
          apiRequest("POST", "/api/auth/solana/nonce", {}),
          10000,
          "Request timeout: Failed to get authentication nonce"
        );

        if (!nonceResponse.ok) {
          const errorData = await nonceResponse.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to initialize authentication");
        }

        const data = await nonceResponse.json();
        return data.nonce;
      };

      nonce = await retryWithBackoff(getNonce);

      const connectWallet = async () => {
        return await withTimeout(
          window.solana!.connect(),
          SOLANA_WALLET_TIMEOUT,
          "Wallet connection timeout: Please try again"
        );
      };

      const resp = await connectWallet();
      const publicKey = resp.publicKey.toString();

      const message = `Sign this message to authenticate with KOL Predict.\n\nWallet: ${publicKey}\nNonce: ${nonce}`;

      const signMessage = async () => {
        const encodedMessage = new TextEncoder().encode(message);
        return await withTimeout(
          window.solana!.signMessage(encodedMessage, "utf8"),
          SOLANA_WALLET_TIMEOUT,
          "Signature timeout: Please try signing again"
        );
      };

      const signedMessage = await signMessage();
      const signature = bs58.encode(signedMessage.signature);

      const verifySignature = async () => {
        const response = await withTimeout(
          apiRequest("POST", "/api/auth/solana/verify", {
            publicKey,
            signature,
            message,
            nonce,
          }),
          15000,
          "Verification timeout: Please try again"
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          if (response.status === 429) {
            throw new Error("Too many authentication attempts. Please wait a minute and try again.");
          }

          const errorMessage = errorData.message || "Failed to verify wallet signature";
          const errorCode = errorData.errorCode;

          if (errorCode) {
            console.error(`Authentication error [${errorCode}]:`, errorMessage);
          }

          throw new Error(errorMessage);
        }

        return response;
      };

      const verifyResponse = await retryWithBackoff(verifySignature, 2);
      const verifyData = await verifyResponse.json();

      if (verifyData.userId) {
        // Store userId and wallet address in localStorage before calling onSuccess
        localStorage.setItem("userId", verifyData.userId);
        if (verifyData.walletAddress) {
          localStorage.setItem("solanaWalletAddress", verifyData.walletAddress);
        }
        window.dispatchEvent(new Event("storage"));

        toast({
          title: "Success",
          description: "Connected with Solana wallet",
        });
        onSuccess(verifyData.userId);
        onClose();
      } else {
        throw new Error("Failed to verify signature: User ID not found in response.");
      }

    } catch (error: any) {
      console.error("Solana auth error:", error);

      if (error.code === 4001) {
        toast({
          title: "Connection cancelled",
          description: "You cancelled the wallet connection.",
          variant: "destructive",
        });
      } else if (error.message?.includes("timeout") || error.message?.includes("Timeout")) {
        toast({
          title: "Connection timeout",
          description: error.message || "The wallet connection timed out. Please try again.",
          variant: "destructive",
        });
      } else if (error.message?.includes("rate limit") || error.message?.includes("Too many")) {
        toast({
          title: "Too many attempts",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Authentication failed",
          description: error.message || "Failed to connect Solana wallet. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTwitterAuth = async () => {
    toast({
      title: "Coming soon",
      description: "X (Twitter) authentication will be available once API credentials are configured.",
    });
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
            Choose your preferred sign-in method
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="username" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="username" data-testid="tab-username">Username</TabsTrigger>
            <TabsTrigger value="wallet" data-testid="tab-wallet">Wallet</TabsTrigger>
            <TabsTrigger value="quick" data-testid="tab-quick">Quick</TabsTrigger>
          </TabsList>

          <TabsContent value="username" className="space-y-4">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
                <TabsTrigger value="register" data-testid="tab-register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 pt-4">
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

              <TabsContent value="register" className="space-y-4 pt-4">
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
          </TabsContent>

          <TabsContent value="wallet" className="space-y-4 pt-4">
            <div className="space-y-4">
              {!walletDetected && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No Solana wallet detected. Please install{" "}
                    <a 
                      href="https://phantom.app/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="underline font-medium"
                    >
                      Phantom
                    </a>{" "}
                    or another Solana wallet extension.
                  </AlertDescription>
                </Alert>
              )}

              <div className="text-sm text-muted-foreground text-center">
                Connect your Solana wallet to get started
              </div>

              <Button 
                onClick={handleSolanaConnect} 
                disabled={loading || !walletDetected}
                className="w-full gap-2"
                variant="default"
                data-testid="button-solana-connect"
              >
                <Wallet className="h-4 w-4" />
                {loading ? "Connecting..." : "Connect Solana Wallet"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Other options
                  </span>
                </div>
              </div>

              <Button 
                onClick={handleTwitterAuth} 
                disabled={loading}
                className="w-full gap-2"
                variant="outline"
                data-testid="button-twitter-auth"
              >
                <SiX className="h-4 w-4" />
                Sign in with X (Coming Soon)
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Supports Phantom, Solflare, and other Solana wallets
              </p>
            </div>
          </TabsContent>

          <TabsContent value="quick" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground text-center">
                Start trading immediately without creating an account
              </div>
              <Button 
                onClick={handleGuestLogin} 
                disabled={loading}
                className="w-full gap-2"
                variant="default"
                data-testid="button-guest-login"
              >
                <User className="h-4 w-4" />
                {loading ? "Creating guest account..." : "Continue as Guest"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Guest accounts start with 1000 PTS
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      signMessage: (message: Uint8Array, display: string) => Promise<{ signature: Uint8Array }>;
      disconnect: () => Promise<void>;
      on?: (event: string, handler: (args: any) => void) => void;
      off?: (event: string, handler: (args: any) => void) => void;
    };
  }
}