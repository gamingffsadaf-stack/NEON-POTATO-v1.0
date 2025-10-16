"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { addReaction, type Message } from "@/lib/messages"
import { useToast } from "@/hooks/use-toast"
import { Smile } from "lucide-react"

interface ChatMessageProps {
  message: Message
  onReactionAdded?: () => void
}

const COMMON_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🎉", "🔥", "👀"]

export function ChatMessage({ message, onReactionAdded }: ChatMessageProps) {
  const [isReactionOpen, setIsReactionOpen] = useState(false)
  const { toast } = useToast()

  const handleReaction = async (emoji: string) => {
    try {
      await addReaction(message.id, emoji)
      setIsReactionOpen(false)
      onReactionAdded?.()
    } catch (error: any) {
      toast({
        title: "Error adding reaction",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const usernameColor = message.users?.username_color || "#FFFFFF"

  return (
    <div className="group flex gap-3 px-4 py-2 hover:bg-muted/50 transition-colors">
      <Avatar className="h-10 w-10 mt-1">
        <AvatarImage src={message.users?.avatar_url || undefined} />
        <AvatarFallback>{message.users?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-semibold" style={{ color: usernameColor }}>
            {message.users?.username || "Unknown"}
          </span>
          {message.users?.has_free_nitro && (
            <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded">
              FREE NITRO
            </span>
          )}
          <span className="text-xs text-muted-foreground">{formatTime(message.created_at)}</span>
        </div>

        <div className="text-foreground break-words">{message.content}</div>

        {message.file_url && (
          <div className="mt-2">
            {message.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
              <img
                src={message.file_url || "/placeholder.svg"}
                alt={message.file_name || "Attachment"}
                className="max-w-md rounded"
              />
            ) : (
              <a
                href={message.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {message.file_name || "Download file"}
              </a>
            )}
          </div>
        )}

        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {Object.entries(
              message.reactions.reduce(
                (acc, r) => {
                  acc[r.emoji] = (acc[r.emoji] || 0) + 1
                  return acc
                },
                {} as Record<string, number>,
              ),
            ).map(([emoji, count]) => (
              <button
                key={emoji}
                className="text-sm bg-muted hover:bg-muted/80 px-2 py-1 rounded transition-colors"
                onClick={() => handleReaction(emoji)}
              >
                {emoji} {count}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <Popover open={isReactionOpen} onOpenChange={setIsReactionOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Smile className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="flex gap-1">
              {COMMON_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  className="text-2xl hover:bg-muted p-2 rounded transition-colors"
                  onClick={() => handleReaction(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
