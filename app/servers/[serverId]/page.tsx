"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getServerById, getServerChannels, createChannel, type Server, type Channel } from "@/lib/servers"
import { useToast } from "@/hooks/use-toast"
import { Hash, Plus, ArrowLeft } from "lucide-react"

export default function ServerPage({ params }: { params: Promise<{ serverId: string }> }) {
  const resolvedParams = use(params)
  const [server, setServer] = useState<Server | null>(null)
  const [channels, setChannels] = useState<Channel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newChannelName, setNewChannelName] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    loadServerData()
  }, [resolvedParams.serverId])

  const loadServerData = async () => {
    try {
      const [serverData, channelsData] = await Promise.all([
        getServerById(resolvedParams.serverId),
        getServerChannels(resolvedParams.serverId),
      ])
      setServer(serverData)
      setChannels(channelsData)
    } catch (error: any) {
      toast({
        title: "Error loading server",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return

    try {
      await createChannel(resolvedParams.serverId, newChannelName)
      toast({
        title: "Channel created!",
        description: `#${newChannelName} has been created`,
      })
      setNewChannelName("")
      setIsCreateOpen(false)
      loadServerData()
    } catch (error: any) {
      toast({
        title: "Error creating channel",
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

  if (!server) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Server not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-muted/30 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="font-bold text-lg truncate">{server.name}</h2>
          <p className="text-xs text-muted-foreground">Invite: {server.invite_code}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <div className="flex items-center justify-between px-2 py-1 mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Text Channels</span>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Channel</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="channelName">Channel Name</Label>
                    <Input
                      id="channelName"
                      placeholder="general"
                      value={newChannelName}
                      onChange={(e) => setNewChannelName(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleCreateChannel} className="w-full">
                    Create Channel
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {channels.map((channel) => (
            <Button
              key={channel.id}
              variant="ghost"
              className="w-full justify-start mb-1"
              onClick={() => router.push(`/servers/${resolvedParams.serverId}/channels/${channel.id}`)}
            >
              <Hash className="mr-2 h-4 w-4" />
              {channel.name}
            </Button>
          ))}
        </div>

        <div className="p-4 border-t border-border space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start bg-transparent"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Hash className="h-16 w-16 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-bold">Welcome to {server.name}</h2>
          <p className="text-muted-foreground">Select a channel from the sidebar to start chatting</p>
        </div>
      </div>
    </div>
  )
}
