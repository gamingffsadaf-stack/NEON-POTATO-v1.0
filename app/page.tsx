import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4">
      <div className="text-center space-y-8 max-w-4xl">
        <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
          NEON POTATO
        </h1>
        <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
          The ultimate Discord-style chat platform with free Nitro perks for everyone!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg" className="text-lg px-8">
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-lg px-8 bg-transparent">
            <Link href="/login">Login</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 space-y-2">
            <h3 className="text-xl font-bold text-white">Free Nitro Perks</h3>
            <p className="text-white/80">Custom emojis, animated avatars, and more!</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 space-y-2">
            <h3 className="text-xl font-bold text-white">Real-time Chat</h3>
            <p className="text-white/80">Instant messaging with typing indicators</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 space-y-2">
            <h3 className="text-xl font-bold text-white">Servers & Channels</h3>
            <p className="text-white/80">Create communities and organize conversations</p>
          </div>
        </div>
      </div>
    </div>
  )
}
