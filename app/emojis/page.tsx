"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getUserEmojis, createCustomEmoji, deleteCustomEmoji, type CustomEmoji } from "@/lib/emojis"
import { getCurrentUserProfile } from "@/lib/profile"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Plus, Trash2, Sparkles } from "lucide-react"

export default function EmojisPage() {
  const [emojis, setEmojis] = useState<CustomEmoji[]>([])
  const [emojiSlots, setEmojiSlots] = useState(10)
  const [newEmojiName, setNewEmojiName] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [emojisData, profile] = await Promise.all([getUserEmojis(), getCurrentUserProfile()])
      setEmojis(emojisData)
      setEmojiSlots(profile.custom_emoji_slots)
    } catch (error: any) {
      toast({
        title: "Error loading emojis",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateEmoji = async () => {
    if (!newEmojiName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your emoji",
        variant: "destructive",
      })
      return
    }

    if (emojis.length >= emojiSlots) {
      toast({
        title: "No slots available",
        description: `You've used all ${emojiSlots} emoji slots`,
        variant: "destructive",
      })
      return
    }

    try {
      // In a real app, this would upload the emoji image
      const placeholderUrl = `/placeholder.svg?height=128&width=128&query=${encodeURIComponent(newEmojiName)}`
      await createCustomEmoji(newEmojiName, placeholderUrl, false)

      toast({
        title: "Emoji created!",
        description: `${newEmojiName} has been added to your collection`,
      })

      setNewEmojiName("")
      setIsCreateOpen(false)
      loadData()
    } catch (error: any) {
      toast({
        title: "Error creating emoji",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleDeleteEmoji = async (emojiId: string) => {
    try {
      await deleteCustomEmoji(emojiId)
      toast({
        title: "Emoji deleted",
        description: "The emoji has been removed",
      })
      loadData()
    } catch (error: any) {
      toast({
        title: "Error deleting emoji",
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Custom Emojis
            </h1>
            <p className="text-muted-foreground mt-2">
              Using {emojis.length} of {emojiSlots} slots
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button disabled={emojis.length >= emojiSlots}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Emoji
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Custom Emoji</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="emojiName">Emoji Name</Label>
                    <Input
                      id="emojiName"
                      placeholder="coolface"
                      value={newEmojiName}
                      onChange={(e) => setNewEmojiName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Upload Image</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, GIF (animated with Nitro)</p>
                    </div>
                  </div>
                  <Button onClick={handleCreateEmoji} className="w-full">
                    Create Emoji
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </div>
        </div>

        {/* Nitro Info */}
        <Card className="mb-6 border-purple-500/50 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              Nitro Emoji Perks
            </CardTitle>
            <CardDescription>Enjoy {emojiSlots} custom emoji slots with animated GIF support!</CardDescription>
          </CardHeader>
        </Card>

        {/* Emoji Grid */}
        {emojis.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No custom emojis yet. Create your first one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {emojis.map((emoji) => (
              <Card key={emoji.id} className="relative group">
                <CardContent className="p-4 flex flex-col items-center">
                  <img
                    src={emoji.image_url || "/placeholder.svg"}
                    alt={emoji.name}
                    className="h-24 w-24 object-contain mb-2"
                  />
                  <p className="text-sm font-medium truncate w-full text-center">{emoji.name}</p>
                  {emoji.is_animated && <span className="text-xs text-purple-400 mt-1">Animated</span>}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                    onClick={() => handleDeleteEmoji(emoji.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
