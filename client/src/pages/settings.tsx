import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ChevronRight, LogOut, Crown, User } from "lucide-react";
import { api } from "@/lib/api";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function Settings() {
  const { toast } = useToast();
  const { user: authUser, isAuthenticated } = useAuth();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: isAuthenticated,
  });

  const { data: subscription } = useQuery({
    queryKey: ["/api/subscription-status"],
    enabled: isAuthenticated,
  });

  const updateUserMutation = useMutation({
    mutationFn: (updates: any) => {
      if (user?.id) {
        return apiRequest("PATCH", `/api/user/${user.id}`, updates);
      }
      throw new Error("User not found");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Settings Updated",
        description: "Your settings have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const [formData, setFormData] = useState({
    name: user?.name || "",
    experienceLevel: user?.experienceLevel || "intermediate",
    dailyReminders: user?.dailyReminders || true,
    voicePractice: user?.voicePractice || false,
    sessionDuration: user?.sessionDuration || 10,
    darkMode: user?.darkMode || false,
  });

  // Update form data when user data loads
  useState(() => {
    if (user) {
      setFormData({
        name: user.name,
        experienceLevel: user.experienceLevel,
        dailyReminders: user.dailyReminders,
        voicePractice: user.voicePractice,
        sessionDuration: user.sessionDuration,
        darkMode: user.darkMode,
      });
    }
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Auto-save for switches and selects
    if (field !== 'name') {
      updateUserMutation.mutate({ [field]: value });
    }
  };

  const handleNameSave = () => {
    if (formData.name.trim()) {
      updateUserMutation.mutate({ name: formData.name.trim() });
    }
  };

  const handleClearData = () => {
    if (confirm("Are you sure you want to clear all practice data? This cannot be undone.")) {
      // In a real app, this would call an API to clear user data
      toast({
        title: "Data Cleared",
        description: "All practice data has been reset.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="pb-20 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center space-x-3">
        <Link href="/">
          <Button variant="ghost" size="sm" className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h2 className="text-lg font-medium">Settings</h2>
      </div>

      <div className="p-4 space-y-6">
        {/* User Profile Section */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-medium text-gray-900 mb-4">Profile</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Name
                </Label>
                <div className="flex space-x-2 mt-1">
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleNameSave}
                    disabled={updateUserMutation.isPending}
                    size="sm"
                  >
                    Save
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="experience" className="text-sm font-medium text-gray-700">
                  Experience Level
                </Label>
                <Select
                  value={formData.experienceLevel}
                  onValueChange={(value) => handleInputChange('experienceLevel', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Practice Settings */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-medium text-gray-900 mb-4">Practice Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Daily Reminders</p>
                  <p className="text-sm text-gray-600">Get notified to practice daily</p>
                </div>
                <Switch
                  checked={formData.dailyReminders}
                  onCheckedChange={(checked) => handleInputChange('dailyReminders', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Voice Practice</p>
                  <p className="text-sm text-gray-600">Enable voice input and feedback</p>
                </div>
                <Switch
                  checked={formData.voicePractice}
                  onCheckedChange={(checked) => handleInputChange('voicePractice', checked)}
                />
              </div>

              <div>
                <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
                  Session Duration
                </Label>
                <Select
                  value={formData.sessionDuration.toString()}
                  onValueChange={(value) => handleInputChange('sessionDuration', parseInt(value))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="10">10 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="20">20 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* App Settings */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-medium text-gray-900 mb-4">App Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Dark Mode</p>
                  <p className="text-sm text-gray-600">Switch to dark theme</p>
                </div>
                <Switch
                  checked={formData.darkMode}
                  onCheckedChange={(checked) => handleInputChange('darkMode', checked)}
                />
              </div>
              
              <button
                onClick={handleClearData}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Clear Practice Data</p>
                    <p className="text-sm text-gray-600">Reset all progress and sessions</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </button>

              <div className="w-full text-left p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">About</p>
                    <p className="text-sm text-gray-600">Version 1.0.0</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-medium text-gray-900 mb-4">Your Progress</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-truck-blue">{user?.practiceStreak || 0}</div>
                <div className="text-sm text-gray-600">Day Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-truck-orange">{user?.totalSessions || 0}</div>
                <div className="text-sm text-gray-600">Total Sessions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
