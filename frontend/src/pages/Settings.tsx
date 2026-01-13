import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Bell,
  Shield,
  Palette,
  ArrowLeft,
  Camera,
  Check,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { userApi } from "@/lib/api";
import { UserAvatar } from "@/components/UserAvatar";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
];

const accentColors = [
  { name: "Indigo", value: "239 84% 67%" },
  { name: "Blue", value: "217 91% 60%" },
  { name: "Green", value: "142 76% 36%" },
  { name: "Rose", value: "346 77% 50%" },
  { name: "Orange", value: "24 95% 53%" },
];

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    bio: "",
    avatar: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [notifications, setNotifications] = useState({
    messages: true,
    mentions: true,
    sounds: true,
    desktop: false,
  });
  const [privacy, setPrivacy] = useState({
    readReceipts: true,
    lastSeen: true,
    profilePhoto: true,
  });
  const [selectedColor, setSelectedColor] = useState(accentColors[0]);

  // Load user data on mount
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!profile.name.trim()) {
      toast({
        title: "Error",
        description: "Name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await userApi.updateProfile({
        name: profile.name,
        bio: profile.bio,
      });

      // Update local storage and auth context
      const { user: updatedUser, accessToken, refreshToken } = response.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      updateUser({
        ...updatedUser,
        id: updatedUser.id,
      });

      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please select an image file (JPG, PNG, or GIF)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size must be less than 2MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Convert to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Upload to server
      const response = await userApi.uploadAvatar(base64);

      // Update local storage and auth context
      const { user: updatedUser, accessToken, refreshToken } = response.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      updateUser({
        ...updatedUser,
        id: updatedUser.id,
      });

      setProfile((prev) => ({ ...prev, avatar: updatedUser.avatar || "" }));

      toast({
        title: "Avatar Updated",
        description: "Your profile photo has been updated successfully.",
      });
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      toast({
        title: "Error",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/chat">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account preferences</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all",
                    activeTab === tab.id
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 card-glass p-6"
          >
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Profile</h2>
                  <p className="text-sm text-muted-foreground">
                    Update your personal information
                  </p>
                </div>
                <Separator />

                <div className="flex items-center gap-6">
                  <div className="relative">
                    <UserAvatar
                      name={profile.name || "User"}
                      avatar={profile.avatar}
                      size="xl"
                    />
                    <button
                      onClick={handleAvatarClick}
                      disabled={isUploading}
                      className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 disabled:opacity-50"
                    >
                      {isUploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                  <div>
                    <Button
                      variant="outline"
                      onClick={handleAvatarClick}
                      disabled={isUploading}
                    >
                      {isUploading ? "Uploading..." : "Upload Photo"}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      JPG, PNG or GIF. Max 2MB.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="bg-muted border-border"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="bg-muted border-border opacity-50"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      className="bg-muted border-border"
                      placeholder="Tell us about yourself"
                      maxLength={200}
                    />
                    <p className="text-xs text-muted-foreground">
                      {profile.bio.length}/200 characters
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  className="bg-primary border-0 text-white hover:bg-primary/90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Notifications</h2>
                  <p className="text-sm text-muted-foreground">
                    Choose what notifications you receive
                  </p>
                </div>
                <Separator />

                <div className="space-y-4">
                  {[
                    { key: "messages", label: "Message Notifications", desc: "Get notified for new messages" },
                    { key: "mentions", label: "Mentions", desc: "Get notified when someone mentions you" },
                    { key: "sounds", label: "Notification Sounds", desc: "Play sounds for notifications" },
                    { key: "desktop", label: "Desktop Notifications", desc: "Show desktop notifications" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch
                        checked={notifications[item.key as keyof typeof notifications]}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, [item.key]: checked })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "privacy" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Privacy</h2>
                  <p className="text-sm text-muted-foreground">
                    Control your privacy settings
                  </p>
                </div>
                <Separator />

                <div className="space-y-4">
                  {[
                    { key: "readReceipts", label: "Read Receipts", desc: "Let others see when you've read messages" },
                    { key: "lastSeen", label: "Last Seen", desc: "Show when you were last active" },
                    { key: "profilePhoto", label: "Profile Photo", desc: "Allow anyone to see your profile photo" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch
                        checked={privacy[item.key as keyof typeof privacy]}
                        onCheckedChange={(checked) =>
                          setPrivacy({ ...privacy, [item.key]: checked })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Appearance</h2>
                  <p className="text-sm text-muted-foreground">
                    Customize how MicroChat looks
                  </p>
                </div>
                <Separator />

                <div className="space-y-6">
                  <div>
                    <Label className="mb-3 block">Accent Color</Label>
                    <div className="flex gap-3">
                      {accentColors.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => setSelectedColor(color)}
                          className={cn(
                            "w-10 h-10 rounded-full transition-all relative",
                            selectedColor.name === color.name && "ring-2 ring-offset-2 ring-offset-background ring-foreground"
                          )}
                          style={{ backgroundColor: `hsl(${color.value})` }}
                        >
                          {selectedColor.name === color.name && (
                            <Check className="w-5 h-5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="mb-3 block">Theme</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {["Dark", "Light", "System"].map((theme) => (
                        <button
                          key={theme}
                          className={cn(
                            "p-4 rounded-xl border transition-all text-center",
                            theme === "Dark"
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-muted-foreground"
                          )}
                        >
                          <span className="font-medium">{theme}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
