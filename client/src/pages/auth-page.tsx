import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, TrendingUp, Users, BarChart3 } from "lucide-react";
import { Navigate } from "react-router-dom";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({ username: "", password: "", confirmPassword: "" });

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginData);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    registerMutation.mutate({
      username: registerData.username,
      password: registerData.password,
      email: registerData.username,
      name: registerData.username,
      role: "user",
      subscriptionStatus: "inactive"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      {/* Left side - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Prep Dashboard</h1>
            <p className="text-gray-600">Track your job applications and ace your interviews</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome Back</CardTitle>
                  <CardDescription>Sign in to your account to continue</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="login-username">Username</Label>
                      <Input
                        id="login-username"
                        type="text"
                        value={loginData.username}
                        onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>Join thousands of successful job seekers</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <Label htmlFor="register-username">Username</Label>
                      <Input
                        id="register-username"
                        type="text"
                        value={registerData.username}
                        onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-password">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right side - Hero section */}
      <div className="flex-1 bg-gradient-to-br from-blue-600 to-indigo-700 p-12 text-white flex flex-col justify-center">
        <div className="max-w-lg">
          <h2 className="text-4xl font-bold mb-6">Land Your Dream Job</h2>
          <p className="text-xl mb-8 text-blue-100">
            Streamline your interview preparation with our comprehensive tracking system
          </p>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Briefcase className="h-8 w-8 text-blue-200" />
              <div>
                <h3 className="font-semibold">Track Applications</h3>
                <p className="text-blue-100">Monitor your job applications across multiple companies</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <TrendingUp className="h-8 w-8 text-blue-200" />
              <div>
                <h3 className="font-semibold">Preparation Sessions</h3>
                <p className="text-blue-100">Log practice sessions and track your improvement</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Users className="h-8 w-8 text-blue-200" />
              <div>
                <h3 className="font-semibold">Interview Management</h3>
                <p className="text-blue-100">Schedule and track all your interviews in one place</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <BarChart3 className="h-8 w-8 text-blue-200" />
              <div>
                <h3 className="font-semibold">Analytics & Insights</h3>
                <p className="text-blue-100">Analyze your progress with detailed reports</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}