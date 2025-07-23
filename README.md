# Gemini PDF Chatbot

Gemini PDF Chatbot is a modern web application that lets you chat with Google Gemini AI, upload PDF documents, and get intelligent answers about their content. Built with Next.js 13, Tailwind CSS, Radix UI, and the AI SDK, it provides a beautiful, responsive, and accessible chat experience.

## Features

- **Chat with Gemini AI**: Have natural conversations with Google Gemini.
- **PDF Upload & Analysis**: Upload PDF files and ask questions about their content.
- **Image Attachments**: Upload images and reference them in your chat.
- **Chat History**: Persistent chat sessions stored in your browser.
- **Responsive UI**: Works great on desktop and mobile.
- **Dark Mode**: Theme support via [next-themes](https://github.com/pacocoursey/next-themes).
- **Custom Components**: Built with Radix UI primitives and Tailwind CSS.
- **Toast Notifications**: Custom toast system for feedback.
- **Accessible**: Keyboard navigation and screen reader support.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [pnpm](https://pnpm.io/) (or use npm/yarn)
- A [Google Generative AI API Key](https://ai.google.dev/)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/gemini-pdf-chatbot.git
   cd gemini-pdf-chatbot
   ```

2. **Install dependencies:**
   ```sh
   pnpm install
   # or
   npm install
   # or
   yarn install
   ```

3. **Configure Environment Variables:**

   Create a `.env.local` file in the root directory and add your Google API key:
   ```
   GOOGLE_GENERATIVE_AI_API_KEY=your-google-api-key-here
   ```

4. **Run the development server:**
   ```sh
   pnpm dev
   # or
   npm run dev
   # or
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
.
├── app/                # Next.js app directory (pages, layout, API routes)
├── components/         # UI components (Radix UI-based)
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── public/             # Static assets
├── styles/             # Global styles (Tailwind CSS)
├── tailwind.config.ts  # Tailwind CSS configuration
├── package.json
└── ...
```

## Usage

- **Start a new chat**: Click "New Chat" in the sidebar.
- **Upload PDFs or images**: Use the "Upload Files" button in the chat input area.
- **Ask questions**: Type your question and press Enter or click Send.
- **View chat history**: Previous sessions are listed in the sidebar.
- **Delete/reset chat**: Use the "Reset Chat" button in the header.

## Customization

- **Styling**: Modify `tailwind.config.ts` and CSS variables in `app/globals.css` or `styles/globals.css`.
- **Components**: UI components are in [`components/ui/`](components/ui/).
- **API Logic**: Chat API route is in [`app/api/chat/route.ts`](app/api/chat/route.ts).

Deployment

You can deploy this app to [Vercel](https://vercel.com/), [Netlify](https://www.netlify.com/), or any platform that supports Next.js 13+.

1. Push your code to GitHub.
2. Connect your repository to your deployment platform.
3. Set the `GOOGLE_GENERATIVE_AI_API_KEY` environment variable in your deployment dashboard.

## License

MIT

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [AI SDK](https://sdk.vercel.ai/docs)
- [Google Gemini](https://ai.google.dev/)

---

**Enjoy chatting with your PDFs and Gemini
