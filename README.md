<a href="https://dbchats.com/">
  <h1 align="center">Database AI Chatbot</h1>
</a>

<p align="center">
  dbchats.com is an open-source, AI-powered natural language interface for databases (NLIDB) that bridges the gap between humans and SQL. Just type what you're looking for in plain English, and let <a href="https://dbchats.com/">dbchats.com</a> generate the perfect SQL query for you. Say goodbye to complex query-building and hello to instant insights!
</p>

<p align="center">
  <a href="#🚀-key-features"><strong>Key Features</strong></a> ·
  <a href="#💻-additional-features"><strong>Additional Features</strong></a> ·
  <a href="#🎯-use-cases"><strong>Use Cases</strong></a> ·
  <a href="#🔧-technology-stack"><strong>Technology Stack</strong></a> ·
  <a href="#🔧-installation"><strong>Installation</strong></a> ·
  <a href="#🌟-contribution"><strong>Contribution</strong></a> ·
  <a href="#🧩-roadmap"><strong>Roadmap</strong></a>
</p>
<br/>

# ✨ dbchats.com

Transform the way you interact with databases!

## 🚀 Key Features

- **Natural Language to SQL**: Enter questions like "What are the top 5 most recent orders?" and get accurate SQL queries instantly.
- **Database-Agnostic**: Works seamlessly with PostgreSQL, MySQL, and more.
- **Secure by Design**: Your database credentials remain secure with no unnecessary exposure.
- **Open-Source**: Contribute, tweak, or deploy your own version with ease.

## 💻 Additional Features

- [Next.js](https://nextjs.org) App Router
  - Advanced routing for seamless navigation and performance
  - React Server Components (RSCs) and Server Actions for server-side rendering and increased performance
- [AI SDK](https://sdk.vercel.ai/docs)
  - Unified API for generating text, structured objects, and tool calls with LLMs
  - Hooks for building dynamic chat and generative user interfaces
  - Supports OpenAI (default), Anthropic, Cohere, and other model providers
- [shadcn/ui](https://ui.shadcn.com)
  - Styling with [Tailwind CSS](https://tailwindcss.com)
  - Component primitives from [Radix UI](https://radix-ui.com) for accessibility and flexibility
- Data Persistence
  - [Vercel Postgres powered by Neon](https://vercel.com/storage/postgres) for saving chat history and user data
  - [Vercel Blob](https://vercel.com/storage/blob) for efficient file storage
- [NextAuth.js](https://github.com/nextauthjs/next-auth)
  - Simple and secure authentication

## 🎯 Use Cases

- **For Non-Tech Users**: Empower analysts, marketers, and non-developers to query databases independently.
- **For Developers**: Quickly prototype queries or integrate dbchats.com into your workflow.
- **For Education**: Teach SQL concepts interactively by converting natural language into queries.

## 🔧 Technology Stack

- **Backend**: Node.js + OpenAI API for generating SQL queries.
- **Frontend**: React.js for a clean, interactive UI.
- **Database**: PostgreSQL (configurable for other databases).
- **Hosting**: Vercel (Free tier supported).

## 🔧 Installation

You will need to use the environment variables [defined in `.env.example`](.env.example) to run Next.js AI Chatbot. It's recommended you use [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables) for this, but a `.env` file is all that is necessary.

1. Install Vercel CLI: `npm i -g vercel`
2. Link local instance with Vercel and GitHub accounts (creates `.vercel` directory): `vercel link`
3. Download your environment variables: `vercel env pull`

```bash
pnpm install
pnpm dev
```

Access the app at [http://localhost:3000](http://localhost:3000).

## 🌟 Contribution

We ❤️ contributions! If you want to improve dbchats.com, follow these steps:

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Make your changes and commit:
   ```bash
   git commit -m "Add feature-name"
   ```
4. Push to your branch:
   ```bash
   git push origin feature-name
   ```
5. Open a Pull Request.

## 🧩 Roadmap

- Add support for more databases (e.g., MongoDB).
- Add SSL support for all databases.

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

Feel free to ⭐ the repository and share your feedback.
