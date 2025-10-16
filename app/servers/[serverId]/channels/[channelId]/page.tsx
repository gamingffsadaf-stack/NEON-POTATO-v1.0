"use client"

import { use, useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getServerById, getServerChannels, type Server, type Channel } from "@/lib/servers"
import { getChannelMessages, getTypingUsers, type Message } from "@/lib/messages"
import { ChatMessage } from "@/components/chat-message"
import { ChatInput } from "@/components/chat-input"
import { NotificationBell } from "@/components/notification-bell"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Hash, Plus, ArrowLeft, Users } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createChannel } from "@/lib/servers"

export default function ChannelPage({ params }: { params: Promise<{ serverId: string; channelId: string }> }) {
  const resolvedParams = use(params)
  const [server, setServer] = useState<Server | null>(null)
  const [channels, setChannels] = useState<Channel[]>([])
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [typingUsers, setTypingUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newChannelName, setNewChannelName] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    loadData()
    setupRealtimeSubscription()
    const typingInterval = setInterval(loadTypingUsers, 2000)

    return () => {
      clearInterval(typingInterval)
    }
  }, [resolvedParams.channelId])

  const loadData = async () => {
    try {
      const [serverData, channelsData, messagesData] = await Promise.all([
        getServerById(resolvedParams.serverId),
        getServerChannels(resolvedParams.serverId),
        getChannelMessages(resolvedParams.channelId),
      ])

      setServer(serverData)
      setChannels(channelsData)
      setCurrentChannel(channelsData.find((c) => c.id === resolvedParams.channelId) || null)
      setMessages(messagesData)
      scrollToBottom()
    } catch (error: any) {
      toast({
        title: "Error loading channel",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
    const supabase = getSupabaseBrowserClient()

    const channel = supabase
      .channel(`channel-${resolvedParams.channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${resolvedParams.channelId}`,
        },
        async (payload) => {
          // Fetch the full message with user data
          const { data } = await supabase
            .from("messages")
            .select(
              `
            *,
            users (id, username, avatar_url, username_color, has_free_nitro)
          `,
            )
            .eq("id", payload.new.id)
            .single()

          if (data) {
            setMessages((prev) => [...prev, data])
            scrollToBottom()
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const loadTypingUsers = async () => {
    try {
      const users = await getTypingUsers(resolvedParams.channelId)
      setTypingUsers(users)
    } catch (error) {
      // Silently fail
    }
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
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
      loadData()
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

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-muted/30 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="font-bold text-lg truncate">{server?.name}</h2>
          <p className="text-xs text-muted-foreground">Invite: {server?.invite_code}</p>
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
              variant={channel.id === resolvedParams.channelId ? "secondary" : "ghost"}
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

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Channel Header */}
        <div className="h-14 border-b border-border px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">{currentChannel?.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Button variant="ghost" size="icon">
              <Users className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <Hash className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
              </div>
            </div>
          ) : (
            <div className="py-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} onReactionAdded={loadData} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="px-4 py-2 text-sm text-muted-foreground">
            {typingUsers.map((u: any) => u.users?.username).join(", ")} {typingUsers.length === 1 ? "is" : "are"}{" "}
            typing...
          </div>
        )}

        {/* Chat Input */}
        <ChatInput channelId={resolvedParams.channelId} onMessageSent={loadData} />
      </div>
    </div>
  )
}
