"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getUserServers, createServer, joinServerByInvite, type Server } from "@/lib/servers"
import { signOut } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { Plus, LogOut, Hash, MessageSquare, User, Smile } from "lucide-react"

export default function DashboardPage() {
  const [servers, setServers] = useState<Server[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newServerName, setNewServerName] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isJoinOpen, setIsJoinOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    loadServers()
  }, [])

  const loadServers = async () => {
    try {
      const data = await getUserServers()
      setServers(data)
    } catch (error: any) {
      toast({
        title: "Error loading servers",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateServer = async () => {
    if (!newServerName.trim()) return

    try {
      const server = await createServer(newServerName)
      toast({
        title: "Server created!",
        description: `${server.name} has been created successfully`,
      })
      setNewServerName("")
      setIsCreateOpen(false)
      loadServers()
    } catch (error: any) {
      toast({
        title: "Error creating server",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleJoinServer = async () => {
    if (!inviteCode.trim()) return

    try {
      const server = await joinServerByInvite(inviteCode)
      toast({
        title: "Joined server!",
        description: `You've joined ${server.name}`,
      })
      setInviteCode("")
      setIsJoinOpen(false)
      loadServers()
    } catch (error: any) {
      toast({
        title: "Error joining server",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/login")
    } catch (error: any) {
      toast({
        title: "Error logging out",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              NEON POTATO
            </h1>
            <p className="text-muted-foreground mt-2">Your Servers</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => router.push("/dms")}>
            <CardContent className="flex items-center gap-4 p-6">
              <MessageSquare className="h-8 w-8 text-primary" />
              <div>
                <p className="font-semibold">Direct Messages</p>
                <p className="text-sm text-muted-foreground">Private conversations</p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => router.push("/profile")}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <User className="h-8 w-8 text-primary" />
              <div>
                <p className="font-semibold">Profile Settings</p>
                <p className="text-sm text-muted-foreground">Manage your account</p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => router.push("/emojis")}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <Smile className="h-8 w-8 text-primary" />
              <div>
                <p className="font-semibold">Custom Emojis</p>
                <p className="text-sm text-muted-foreground">Manage your emojis</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-2xl font-bold mb-4">Your Servers</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create Server Card */}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Card className="cursor-pointer hover:border-primary transition-colors border-dashed">
                <CardContent className="flex flex-col items-center justify-center h-48">
                  <Plus className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Create Server</p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a Server</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="serverName">Server Name</Label>
                  <Input
                    id="serverName"
                    placeholder="My Awesome Server"
                    value={newServerName}
                    onChange={(e) => setNewServerName(e.target.value)}
                  />
                </div>
                <Button onClick={handleCreateServer} className="w-full">
                  Create Server
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Join Server Card */}
          <Dialog open={isJoinOpen} onOpenChange={setIsJoinOpen}>
            <DialogTrigger asChild>
              <Card className="cursor-pointer hover:border-primary transition-colors border-dashed">
                <CardContent className="flex flex-col items-center justify-center h-48">
                  <Hash className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Join Server</p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Join a Server</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="inviteCode">Invite Code</Label>
                  <Input
                    id="inviteCode"
                    placeholder="ABC123XYZ"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                  />
                </div>
                <Button onClick={handleJoinServer} className="w-full">
                  Join Server
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Server Cards */}
          {servers.map((server) => (
            <Card
              key={server.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => router.push(`/servers/${server.id}`)}
            >
              <CardHeader>
                <CardTitle className="text-xl">{server.name}</CardTitle>
                <CardDescription>Click to open</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Invite: {server.invite_code}</span>
                  <span>Boost: {server.boost_level}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {servers.length === 0 && (
          <div className="text-center mt-12">
            <p className="text-muted-foreground">No servers yet. Create one or join using an invite code!</p>
          </div>
        )}
      </div>
    </div>
  )
}
