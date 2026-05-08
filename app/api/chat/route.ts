import { streamText } from 'ai'
import { google } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'

// ── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildPrompt(context: unknown): string {
  return `You are ExamLens AI, an expert tutor built by Abhijeet Kangane. Answer the user's questions strictly based on their uploaded past papers and the analysis provided. Be concise, encouraging, and highly educational.

If the user asks about topics, priorities, or what to study, refer to this analysis context:
${context ? JSON.stringify(context, null, 2) : 'No paper context provided yet. Encourage the user to upload a paper first.'}`
}

// ── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const { messages, context }: { messages: ChatMessage[]; context: unknown } = await req.json()

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'No messages provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const geminiKey = process.env.GEMINI_API_KEY
    const groqKey = process.env.GROQ_API_KEY

    if (!geminiKey && !groqKey) {
      return new Response(JSON.stringify({ error: 'No AI API keys configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const systemPrompt = buildPrompt(context)

    // ── FAILOVER ENGINE ──────────────────────────────────────────────────────
    if (geminiKey) {
      try {
        const result = await streamText({
          model: google('gemini-2.0-flash') as any,
          system: systemPrompt,
          messages,
        })
        return result.toDataStreamResponse()
      } catch (geminiErr) {
        console.warn(`[chat] ⚠️  Gemini failed — falling back to Groq (llama-3.3-70b-versatile)`, geminiErr)

        if (groqKey) {
          const groq = createOpenAI({
            baseURL: 'https://api.groq.com/openai/v1',
            apiKey: groqKey,
          })

          const result = await streamText({
            model: groq('llama-3.3-70b-versatile') as any,
            system: systemPrompt,
            messages,
          })
          return result.toDataStreamResponse()
        } else {
          throw geminiErr
        }
      }
    } else {
      const groq = createOpenAI({
        baseURL: 'https://api.groq.com/openai/v1',
        apiKey: groqKey!,
      })

      const result = await streamText({
        model: groq('llama-3.3-70b-versatile') as any,
        system: systemPrompt,
        messages,
      })
      return result.toDataStreamResponse()
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to generate response'
    console.error('[/api/chat]', message)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
