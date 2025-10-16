"use client"

import { use, useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getDMMessages, sendDMMessage, type DMConversation } from "@/lib/direct-messages"
import { ChatMessage } from "@/components/chat-message"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Send, Paperclip } from "lucide-react"
import { Input } from "@/components/ui/input"
import type React from "react"

export default function DMConversationPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const resolvedParams = use(params)
  const [conversation, setConversation] = useState<DMConversation | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    loadData()
    setupRealtimeSubscription()
  }, [resolvedParams.conversationId])

  const loadData = async () => {
    try {
      const supabase = getSupabaseBrowserClient()

      // Get conversation details
      const { data: convData } = await supabase
        .from("dm_conversations")
        .select("*")
        .eq("id", resolvedParams.conversationId)
        .single()

      if (convData) {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        const otherUserId = convData.user1_id === user?.id ? convData.user2_id : convData.user1_id

        const { data: otherUser } = await supabase
          .from("users")
          .select("id, username, avatar_url, is_online, username_color")
          .eq("id", otherUserId)
          .single()

        setConversation({
          ...convData,
          other_user: otherUser,
        })
      }

      const messagesData = await getDMMessages(resolvedParams.conversationId)
      setMessages(messagesData)
      scrollToBottom()
    } catch (error: any) {
      toast({
        title: "Error loading conversation",
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
      .channel(`dm-${resolvedParams.conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `dm_conversation_id=eq.${resolvedParams.conversationId}`,
        },
        async (payload) => {
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

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim() || isSending) return

    setIsSending(true)

    try {
      await sendDMMessage(resolvedParams.conversationId, message.trim())
      setMessage("")
    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="h-14 border-b border-border px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dms")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarImage src={conversation?.other_user?.avatar_url || undefined} />
            <AvatarFallback>{conversation?.other_user?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">{conversation?.other_user?.username || "Unknown User"}</h2>
            <p className="text-xs text-muted-foreground">
              {conversation?.other_user?.is_online ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <Avatar className="h-16 w-16 mx-auto">
                <AvatarImage src={conversation?.other_user?.avatar_url || undefined} />
                <AvatarFallback>{conversation?.other_user?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <p className="text-muted-foreground">Start a conversation with {conversation?.other_user?.username}!</p>
            </div>
          </div>
        ) : (
          <div className="py-4">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} onReactionAdded={loadData} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="icon" className="shrink-0">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            placeholder={`Message ${conversation?.other_user?.username || "user"}...`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isSending}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!message.trim() || isSending} className="shrink-0">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  )
}
