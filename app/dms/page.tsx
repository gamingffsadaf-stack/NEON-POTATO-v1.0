"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  getUserDMConversations,
  searchUsers,
  getOrCreateDMConversation,
  type DMConversation,
} from "@/lib/direct-messages"
import { useToast } from "@/hooks/use-toast"
import { MessageSquare, Plus, ArrowLeft, Search } from "lucide-react"

export default function DMsPage() {
  const [conversations, setConversations] = useState<DMConversation[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    try {
      const data = await getUserDMConversations()
      setConversations(data)
    } catch (error: any) {
      toast({
        title: "Error loading conversations",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.trim().length < 2) {
      setSearchResults([])
      return
    }

    try {
      const results = await searchUsers(query)
      setSearchResults(results)
    } catch (error: any) {
      toast({
        title: "Error searching users",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleStartDM = async (userId: string) => {
    try {
      const conversation = await getOrCreateDMConversation(userId)
      setIsSearchOpen(false)
      router.push(`/dms/${conversation.id}`)
    } catch (error: any) {
      toast({
        title: "Error starting conversation",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
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
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Direct Messages
            </h1>
            <p className="text-muted-foreground mt-2">Private conversations</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New DM
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start a conversation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleStartDM(user.id)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-colors"
                      >
                        <Avatar>
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left">
                          <p className="font-medium">{user.username}</p>
                          <p className="text-sm text-muted-foreground">{user.is_online ? "Online" : "Offline"}</p>
                        </div>
                      </button>
                    ))}
                    {searchQuery.length >= 2 && searchResults.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">No users found</p>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {conversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No conversations yet. Start a new DM!</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => router.push(`/dms/${conv.id}`)}
                className="w-full flex items-center gap-4 p-4 hover:bg-muted rounded-lg transition-colors"
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={conv.other_user?.avatar_url || undefined} />
                    <AvatarFallback>{conv.other_user?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  {conv.other_user?.is_online && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-semibold truncate">{conv.other_user?.username || "Unknown User"}</p>
                  {conv.last_message && (
                    <p className="text-sm text-muted-foreground truncate">{conv.last_message.content}</p>
                  )}
                </div>
                {conv.last_message && (
                  <span className="text-xs text-muted-foreground">{formatTime(conv.last_message.created_at)}</span>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
