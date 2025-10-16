"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { sendMessage, setTypingIndicator } from "@/lib/messages"
import { useToast } from "@/hooks/use-toast"
import { Send, Paperclip, X, ImageIcon } from "lucide-react"

interface ChatInputProps {
  channelId: string
  onMessageSent?: () => void
}

export function ChatInput({ channelId, onMessageSent }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      setTypingIndicator(channelId, false)
    }
  }, [channelId])

  const handleTyping = (value: string) => {
    setMessage(value)

    if (value.length > 0 && !isTyping) {
      setIsTyping(true)
      setTypingIndicator(channelId, true)
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      setTypingIndicator(channelId, false)
    }, 3000)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (50MB limit with Nitro)
    const maxSize = 50 * 1024 * 1024 // 50MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Maximum file size is 50MB with Nitro",
        variant: "destructive",
      })
      return
    }

    setSelectedFile(file)

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFilePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setFilePreview(null)
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    setFilePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const uploadFile = async (file: File): Promise<string> => {
    // In a real app, this would upload to Vercel Blob or similar
    // For now, we'll simulate with a placeholder
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`/placeholder.svg?height=400&width=600&query=${encodeURIComponent(file.name)}`)
      }, 1000)
    })
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()

    if ((!message.trim() && !selectedFile) || isSending) return

    setIsSending(true)

    try {
      let fileUrl: string | undefined
      let fileName: string | undefined

      if (selectedFile) {
        fileUrl = await uploadFile(selectedFile)
        fileName = selectedFile.name
      }

      await sendMessage(channelId, message.trim() || "Sent a file", fileUrl, fileName)
      setMessage("")
      clearFile()
      setIsTyping(false)
      setTypingIndicator(channelId, false)
      onMessageSent?.()
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

  return (
    <form onSubmit={handleSend} className="p-4 border-t border-border">
      {/* File Preview */}
      {selectedFile && (
        <div className="mb-2 p-3 bg-muted rounded-lg flex items-center gap-3">
          {filePreview ? (
            <img src={filePreview || "/placeholder.svg"} alt="Preview" className="h-16 w-16 object-cover rounded" />
          ) : (
            <div className="h-16 w-16 bg-background rounded flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={clearFile}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx,.txt"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        <Input
          placeholder="Type a message..."
          value={message}
          onChange={(e) => handleTyping(e.target.value)}
          disabled={isSending}
          className="flex-1"
        />
        <Button
          type="submit"
          size="icon"
          disabled={(!message.trim() && !selectedFile) || isSending}
          className="shrink-0"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </form>
  )
}
