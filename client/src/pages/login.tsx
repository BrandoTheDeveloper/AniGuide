import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import aniguideLogo192 from "@assets/aniguide-logo-192x192_1751223690504.png";

export default function LoginPage() {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ 
    email: "", 
    password: "", 
    firstName: "", 
    lastName: "",
    username: ""
  });
  const [forgotPasswordData, setForgotPasswordData] = useState({ email: "" });
  const [resetPasswordData, setResetPasswordData] = useState({ token: "", password: "" });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Welcome back!",
        description: "You've been logged in successfully.",
      });
      window.location.href = "/";
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password.",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Account Created!",
        description: "Welcome to AniGuide! You've been logged in.",
      });
      window.location.href = "/";
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account.",
        variant: "destructive",
      });
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send reset email");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Reset Link Sent",
        description: data.message,
      });
      // For demo purposes, show the reset token
      if (data.resetToken) {
        setResetPasswordData({ ...resetPasswordData, token: data.resetToken });
        setShowResetPassword(true);
        setShowForgotPassword(false);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email.",
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { token: string; password: string }) => {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to reset password");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Password Reset",
        description: data.message,
      });
      setShowResetPassword(false);
      setShowForgotPassword(false);
    },
    onError: (error: any) => {
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to reset password.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-[#DAD2D8] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src={aniguideLogo192} 
            alt="AniGuide"
            className="w-24 h-24 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-[#06070E] mb-2">AniGuide</h1>
          <p className="text-[#2F2D2E]">Discover and review your favorite anime</p>
        </div>

        <Card className="bg-white border-[#9C0D38]/20">
          <CardHeader>
            <CardTitle className="text-[#06070E]">Welcome</CardTitle>
            <CardDescription className="text-[#2F2D2E]">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Create Account</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4 mt-6">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  loginMutation.mutate(loginData);
                }}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email" className="text-[#06070E]">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        className="border-[#9C0D38]/20 focus:border-[#9C0D38]"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="password" className="text-[#06070E]">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="border-[#9C0D38]/20 focus:border-[#9C0D38]"
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-[#9C0D38] hover:bg-[#9C0D38]/90 text-[#DAD2D8]"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Signing in..." : "Sign In"}
                    </Button>
                    <div className="text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-[#9C0D38] hover:text-[#9C0D38]/80 text-sm"
                        onClick={() => setShowForgotPassword(true)}
                      >
                        Forgot your password?
                      </Button>
                    </div>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="register" className="space-y-4 mt-6">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  registerMutation.mutate(registerData);
                }}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName" className="text-[#06070E]">First Name</Label>
                        <Input
                          id="firstName"
                          value={registerData.firstName}
                          onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                          className="border-[#9C0D38]/20 focus:border-[#9C0D38]"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-[#06070E]">Last Name</Label>
                        <Input
                          id="lastName"
                          value={registerData.lastName}
                          onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                          className="border-[#9C0D38]/20 focus:border-[#9C0D38]"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="username" className="text-[#06070E]">Username</Label>
                      <Input
                        id="username"
                        value={registerData.username}
                        onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                        className="border-[#9C0D38]/20 focus:border-[#9C0D38]"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="registerEmail" className="text-[#06070E]">Email</Label>
                      <Input
                        id="registerEmail"
                        type="email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        className="border-[#9C0D38]/20 focus:border-[#9C0D38]"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="registerPassword" className="text-[#06070E]">Password</Label>
                      <Input
                        id="registerPassword"
                        type="password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        className="border-[#9C0D38]/20 focus:border-[#9C0D38]"
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-[#9C0D38] hover:bg-[#9C0D38]/90 text-[#DAD2D8]"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating account..." : "Create Account"}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <Button 
                variant="ghost" 
                className="text-[#9C0D38] hover:text-[#9C0D38]/80"
                onClick={() => window.location.href = "/"}
              >
                Continue browsing as guest
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md bg-white">
              <CardHeader>
                <CardTitle className="text-[#06070E]">Reset Password</CardTitle>
                <CardDescription className="text-[#2F2D2E]">
                  Enter your email to receive a password reset link
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  forgotPasswordMutation.mutate(forgotPasswordData);
                }}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="resetEmail" className="text-[#06070E]">Email</Label>
                      <Input
                        id="resetEmail"
                        type="email"
                        value={forgotPasswordData.email}
                        onChange={(e) => setForgotPasswordData({ email: e.target.value })}
                        className="border-[#9C0D38]/20 focus:border-[#9C0D38]"
                        required
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        type="submit" 
                        className="flex-1 bg-[#9C0D38] hover:bg-[#9C0D38]/90 text-[#DAD2D8]"
                        disabled={forgotPasswordMutation.isPending}
                      >
                        {forgotPasswordMutation.isPending ? "Sending..." : "Send Reset Link"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setShowForgotPassword(false)}
                        className="border-[#9C0D38]/20"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reset Password Modal */}
        {showResetPassword && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md bg-white">
              <CardHeader>
                <CardTitle className="text-[#06070E]">Set New Password</CardTitle>
                <CardDescription className="text-[#2F2D2E]">
                  Enter your new password below
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  resetPasswordMutation.mutate(resetPasswordData);
                }}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="resetToken" className="text-[#06070E]">Reset Token</Label>
                      <Input
                        id="resetToken"
                        value={resetPasswordData.token}
                        onChange={(e) => setResetPasswordData({ ...resetPasswordData, token: e.target.value })}
                        className="border-[#9C0D38]/20 focus:border-[#9C0D38]"
                        required
                        readOnly
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword" className="text-[#06070E]">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={resetPasswordData.password}
                        onChange={(e) => setResetPasswordData({ ...resetPasswordData, password: e.target.value })}
                        className="border-[#9C0D38]/20 focus:border-[#9C0D38]"
                        placeholder="At least 8 characters"
                        required
                        minLength={8}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        type="submit" 
                        className="flex-1 bg-[#9C0D38] hover:bg-[#9C0D38]/90 text-[#DAD2D8]"
                        disabled={resetPasswordMutation.isPending}
                      >
                        {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setShowResetPassword(false)}
                        className="border-[#9C0D38]/20"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}