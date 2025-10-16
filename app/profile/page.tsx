"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getCurrentUserProfile, updateUserProfile, NITRO_COLORS, type UserProfile } from "@/lib/profile"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Sparkles, Upload } from "lucide-react"

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [username, setUsername] = useState("")
  const [status, setStatus] = useState("")
  const [selectedColor, setSelectedColor] = useState("#FFFFFF")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const data = await getCurrentUserProfile()
      setProfile(data)
      setUsername(data.username)
      setStatus(data.status)
      setSelectedColor(data.username_color)
    } catch (error: any) {
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      await updateUserProfile({
        username,
        status,
        username_color: selectedColor,
      })

      toast({
        title: "Profile updated!",
        description: "Your changes have been saved",
      })

      loadProfile()
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              User Profile
            </h1>
            <p className="text-muted-foreground mt-2">Manage your account and Nitro perks</p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Nitro Status Card */}
          <Card className="border-2 border-purple-500/50 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-400" />
                    Free Nitro Status
                  </CardTitle>
                  <CardDescription>Enjoy premium features for free!</CardDescription>
                </div>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">ACTIVE</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-400">{profile.custom_emoji_slots}</p>
                  <p className="text-sm text-muted-foreground">Custom Emojis</p>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-400">{profile.max_file_size_mb}MB</p>
                  <p className="text-sm text-muted-foreground">File Upload</p>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-400">✓</p>
                  <p className="text-sm text-muted-foreground">Colored Name</p>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-400">✓</p>
                  <p className="text-sm text-muted-foreground">Animated Avatar</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Customize your appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Preview */}
              <div className="flex items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl">{username[0]?.toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Avatar
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">Supports GIF with Nitro</p>
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status Message</Label>
                <Textarea
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={3}
                />
              </div>

              {/* Username Color */}
              <div className="space-y-2">
                <Label>Username Color (Nitro Perk)</Label>
                <div className="flex flex-wrap gap-2">
                  {NITRO_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setSelectedColor(color.value)}
                      className={`w-12 h-12 rounded-lg border-2 transition-all ${
                        selectedColor === color.value ? "border-primary scale-110" : "border-border"
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Preview:{" "}
                  <span className="font-semibold" style={{ color: selectedColor }}>
                    {username}
                  </span>
                </p>
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={profile.email} disabled />
              </div>

              {/* Save Button */}
              <Button onClick={handleSave} disabled={isSaving} className="w-full">
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          {/* Account Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Created:</span>
                <span>{new Date(profile.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated:</span>
                <span>{new Date(profile.updated_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">User ID:</span>
                <span className="font-mono text-xs">{profile.id.slice(0, 8)}...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
