# 🍽️ Dinner Planner & Grocery List

A mobile-first web app for managing family dinners and grocery lists. Receive dinner events via webhook, generate smart grocery lists, and check off items in real-time across devices.

## Features

- 📅 **7-Day Dinner Planning** - View upcoming dinners at a glance
- 🛒 **Smart Grocery Lists** - Auto-generated from dinner ingredients
- ✅ **Real-time Checkboxes** - Sync across devices with optimistic UI
- 🏠 **Pantry Staples** - Exclude always-on-hand items
- 💡 **Meal Suggestions** - Based on pantry overlap and ingredient reuse
- 📱 **PWA Support** - Add to home screen for app-like experience

## Quick Start

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) Postgres database (free tier available)

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   # Edit .env with your Neon connection string
   DATABASE_URL="postgresql://..."
   WEBHOOK_SECRET="your-secret-here"
   ```

3. **Set up database**
   ```bash
   npm run db:push    # Create tables
   npm run db:seed    # Add sample data
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open** [http://localhost:3000](http://localhost:3000)

## Webhook Integration

Send dinner events from IFTTT, Zapier, or any automation tool:

```bash
POST /api/ingest-calendar
Content-Type: application/json

{
  "secret": "your-webhook-secret",
  "date": "2026-02-01",
  "title": "beef tacos",
  "notes": "guests: 4"
}
```

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Add these environment variables in Vercel:
- `DATABASE_URL` - Neon connection string
- `WEBHOOK_SECRET` - Your secret token

## Tech Stack

- **Next.js 16** - App Router
- **Prisma 7** - Database ORM
- **Neon Postgres** - Serverless database
- **Tailwind CSS 4** - Styling
- **TypeScript** - Type safety

## License

MIT
