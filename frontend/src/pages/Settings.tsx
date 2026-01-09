import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Bell,
  Shield,
  Palette,
  ArrowLeft,
  Camera,
  Check,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@example.com",
    bio: "Product Designer at ChatFlow",
  });
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

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile has been saved successfully.",
    });
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
                    <img
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                    <button className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-white shadow-lg">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <Button variant="outline">Upload Photo</Button>
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
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      className="bg-muted border-border"
                    />
                  </div>
                </div>

                <Button onClick={handleSaveProfile} className="bg-primary border-0 text-white hover:bg-primary/90">
                  Save Changes
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
                    Customize how ChatFlow looks
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
