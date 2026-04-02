# Kanban App — Next.js Setup

## Project Structure

```
kanban.2/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── auth/          # Authentication endpoints
│   ├── (auth)/            # Auth group (login/register)
│   ├── profile/           # User profile page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── lib/                   # Shared utilities
│   ├── types.ts          # TypeScript types
│   └── supabase-client.ts # Supabase initialization
├── components/            # React components
├── public/               # Static assets
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── tailwind.config.ts    # Tailwind CSS config
├── next.config.js        # Next.js config
├── jest.config.js        # Jest test config
└── .env.local            # Local environment (not committed)
```

## Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Setup environment variables:**
   - Copy `.env.local` and fill in Supabase credentials
   - Get values from your Supabase project settings

3. **Setup Supabase:**
   - Create a new Supabase project
   - Run database migrations (from Story 1.1)
   - Copy project URL and Anon Key to `.env.local`

## Development

**Start dev server:**

```bash
npm run dev
```

Visit `http://localhost:3000`

## Scripts

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm start` — Start production server
- `npm run lint` — Run ESLint
- `npm test` — Run tests
- `npm run test:watch` — Run tests in watch mode

## Story 1.2 Implementation

This setup provides the foundation for Story 1.2 (Supabase Auth).

**Next steps:**

1. Implement auth endpoints (register, login, logout, profile)
2. Create password validation utilities
3. Setup JWT token handling
4. Create auth forms (register, login)
5. Implement session middleware
6. Run tests
7. CodeRabbit security review

See `docs/stories/1.2.story.md` for detailed acceptance criteria.
