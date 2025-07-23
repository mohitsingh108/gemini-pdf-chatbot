import { google } from "@ai-sdk/google"
import { convertToCoreMessages, streamText } from "ai"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    console.log("=== Chat API Called ===")

    const { messages } = await req.json()
    console.log("Received messages:", JSON.stringify(messages, null, 2))

    // Check if API key exists
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error("❌ Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable")
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    console.log("✅ API Key exists:", process.env.GOOGLE_GENERATIVE_AI_API_KEY.substring(0, 10) + "...")

    // Check if any message has PDF attachments
    const hasPDFAttachment = messages.some((message: any) =>
      message.experimental_attachments?.some((attachment: any) => attachment.contentType === "application/pdf"),
    )

    console.log("Has PDF attachment:", hasPDFAttachment)

    // Convert messages
    const convertedMessages = convertToCoreMessages(messages)
    console.log("Converted messages:", JSON.stringify(convertedMessages, null, 2))

    console.log("🚀 Creating stream with Gemini...")

    const result = await streamText({
      model: google("gemini-1.5-flash"), // Using a more stable model
      messages: convertedMessages,
      system: hasPDFAttachment
        ? `You are a helpful AI assistant that can analyze and answer questions about PDF documents. 
           When a user uploads a PDF, carefully read through its content and provide accurate, 
           detailed answers based on the information in the document. If asked about something 
           not in the PDF, clearly state that the information is not available in the provided document.
           Be conversational, helpful, and provide detailed explanations when needed.`
        : `You are a helpful AI assistant powered by Google Gemini. Provide clear, accurate, and helpful responses to user questions.
           Be conversational, engaging, and provide detailed explanations when appropriate.`,
      temperature: 0.7,
      maxTokens: 1000,
    })

    console.log("✅ Stream created successfully")
    return result.toDataStreamResponse()
  } catch (error) {
    console.error("❌ Error in chat API:", error)
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      })
    } else {
      console.error("Error details: Unknown error type", { error })
    }

    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
