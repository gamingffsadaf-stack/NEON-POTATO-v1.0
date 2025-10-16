# NEON POTATO - Discord Clone

A full-featured Discord-style chat application built with Next.js, Supabase, and TailwindCSS.

## Features

### Core Features
- **Authentication** - Secure signup/login with Supabase Auth
- **Servers & Channels** - Create and join servers, organize with multiple channels
- **Real-time Chat** - Instant messaging with live updates
- **Direct Messages** - Private one-on-one conversations
- **User Profiles** - Customizable profiles with status messages
- **Notifications** - Real-time notifications for mentions and DMs

### Free Nitro Perks
- **Custom Emojis** - 10 custom emoji slots (static + animated)
- **File Uploads** - Up to 50MB file uploads
- **Colored Usernames** - Choose from 10 vibrant colors
- **Animated Avatars** - GIF avatar support
- **Free Nitro Badge** - Display your premium status

### Advanced Features
- **Emoji Reactions** - React to messages with emojis
- **Typing Indicators** - See when others are typing
- **Read Receipts** - Track message read status
- **Online Status** - Real-time user presence
- **File Attachments** - Share images and files
- **User Search** - Find and connect with other users

## Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS v4
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Real-time**: Supabase Realtime
- **Authentication**: Supabase Auth
- **UI Components**: shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <your-repo-url>
   cd neon-potato
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up Supabase**
   - Create a new Supabase project at https://supabase.com
   - Copy your project URL and anon key
   - Run the SQL script in `scripts/01-create-tables.sql` in the Supabase SQL Editor

4. **Configure environment variables**
   Create a `.env.local` file in the root directory:
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
   \`\`\`

5. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

6. **Open your browser**
   Navigate to http://localhost:3000

## Project Structure

\`\`\`
neon-potato/
├── app/                      # Next.js app directory
│   ├── dashboard/           # Main dashboard
│   ├── servers/             # Server and channel pages
│   ├── dms/                 # Direct messages
│   ├── profile/             # User profile settings
│   ├── emojis/              # Custom emoji management
│   ├── login/               # Login page
│   └── signup/              # Signup page
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── chat-message.tsx     # Message component
│   ├── chat-input.tsx       # Chat input with file upload
│   └── notification-bell.tsx # Notification system
├── lib/                     # Utility functions
│   ├── supabase/            # Supabase client setup
│   ├── auth.ts              # Authentication functions
│   ├── servers.ts           # Server management
│   ├── messages.ts          # Message handling
│   ├── direct-messages.ts   # DM functionality
│   ├── profile.ts           # User profile
│   ├── emojis.ts            # Custom emojis
│   └── notifications.ts     # Notification system
├── scripts/                 # Database scripts
│   └── 01-create-tables.sql # Database schema
└── middleware.ts            # Auth middleware

\`\`\`

## Database Schema

The application uses the following main tables:

- **users** - User profiles with Nitro perks
- **servers** - Server information
- **server_members** - Server membership
- **channels** - Text channels
- **messages** - Chat messages
- **dm_conversations** - Direct message conversations
- **message_reactions** - Emoji reactions
- **custom_emojis** - User custom emojis
- **notifications** - User notifications
- **typing_indicators** - Real-time typing status
- **read_receipts** - Message read tracking

## Key Features Explained

### Real-time Updates
The app uses Supabase Realtime to provide instant updates for:
- New messages in channels and DMs
- Typing indicators
- Notifications
- User online status

### Nitro Perks System
All users get free Nitro perks including:
- 10 custom emoji slots
- 50MB file upload limit
- Colored username options
- Animated avatar support
- Premium badge display

### File Upload System
- Supports images, videos, PDFs, and documents
- 50MB file size limit with Nitro
- Image preview before sending
- Automatic file type detection

### Notification System
- Real-time notifications for mentions
- DM notifications
- Unread count badge
- Mark as read functionality
- Notification history

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel project settings
4. Deploy!

### Environment Variables for Production

Make sure to set these in your Vercel project:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for learning or building your own chat application!

## Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js and Supabase
