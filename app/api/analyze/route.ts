import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import Groq from 'groq-sdk'
import pdfParse from 'pdf-parse'

// ── Types ────────────────────────────────────────────────────────────────────

interface AnalysisTopic {
  topic: string
  frequency: number
  weightage: number
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function parseRetryDelay(err: unknown): number {
  const msg = err instanceof Error ? err.message : String(err)
  const match = msg.match(/"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/)
  if (match) return Math.ceil(parseFloat(match[1])) * 1000
  return 30_000
}

const ANALYSIS_PROMPT_PREFIX = `You are an expert exam analyzer. Extract all core educational topics from this past paper text. Calculate how many times each topic was tested (frequency) and assign a priority weightage percentage (all weightages must sum to 100). Return ONLY a strict JSON array of objects with the exact keys: "topic" (string), "frequency" (number), "weightage" (number). No markdown fences. No explanation. Just the raw JSON array.

Paper text: `

/**
 * Sanitize AI response: strip markdown code fences and parse JSON.
 */
function parseAnalysisJSON(raw: string): AnalysisTopic[] {
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  const parsed = JSON.parse(cleaned)
  if (!Array.isArray(parsed)) throw new Error('Response is not a JSON array')

  // Validate shape of each entry
  return parsed.map((item: Record<string, unknown>) => ({
    topic: String(item.topic ?? 'Unknown'),
    frequency: Number(item.frequency ?? 0),
    weightage: Number(item.weightage ?? 0),
  }))
}

// ── PRIMARY ENGINE: Gemini with retry ────────────────────────────────────────

async function analyzeWithGemini(apiKey: string, text: string): Promise<AnalysisTopic[]> {
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash-8b', 'gemini-1.5-pro']
  const genAI = new GoogleGenerativeAI(apiKey)
  const prompt = ANALYSIS_PROMPT_PREFIX + text

  for (const modelName of models) {
    let attempt = 0
    while (attempt < 2) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName })
        const result = await model.generateContent(prompt)
        const responseText = result.response.text().trim()
        return parseAnalysisJSON(responseText)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        const isQuota = msg.includes('429') || msg.includes('Too Many Requests') || msg.includes('RESOURCE_EXHAUSTED')
        const isNotFound = msg.includes('404') || msg.includes('not found')

        if (isQuota) {
          const delay = parseRetryDelay(err)
          if (delay <= 45_000) {
            console.warn(`[analyze/gemini] ${modelName} quota hit, retrying in ${delay}ms`)
            await sleep(delay)
            attempt++
            continue
          }
          break // quota too long, try next model
        }
        if (isNotFound) break // model unavailable, try next
        throw err // unexpected error — surface it
      }
    }
  }

  throw new Error('GEMINI_EXHAUSTED') // sentinel for fallback
}

// ── FALLBACK ENGINE: Groq (llama-3.3-70b-versatile) ─────────────────────────

async function analyzeWithGroq(apiKey: string, text: string): Promise<AnalysisTopic[]> {
  const groq = new Groq({ apiKey })
  const prompt = ANALYSIS_PROMPT_PREFIX + text

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'You are an expert exam analyzer. Return only valid JSON arrays. No markdown. No explanation.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.3,
    max_tokens: 4096,
    response_format: { type: 'json_object' },
  })

  const responseText = chatCompletion.choices[0]?.message?.content ?? ''
  if (!responseText.trim()) throw new Error('Groq returned an empty response')

  // Groq with json_object mode may wrap in { "data": [...] } or return raw array
  const parsed = JSON.parse(responseText.trim())
  const arr: unknown[] = Array.isArray(parsed) ? parsed : (parsed.topics ?? parsed.data ?? parsed.results ?? [])

  if (!Array.isArray(arr) || arr.length === 0) {
    throw new Error('Groq returned unexpected JSON structure')
  }

  return arr.map((entry: unknown) => {
    const item = entry as Record<string, unknown>
    return {
      topic: String(item.topic ?? 'Unknown'),
      frequency: Number(item.frequency ?? 0),
      weightage: Number(item.weightage ?? 0),
    }
  })
}

// ── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { pdf_url }: { pdf_url: string } = body

    if (!pdf_url) {
      return NextResponse.json({ error: 'PDF URL is required' }, { status: 400 })
    }

    // Verify authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Please log in to analyze papers.' }, { status: 401 })
    }

    // Fetch and parse PDF
    const response = await fetch(pdf_url)
    if (!response.ok) {
      throw new Error(`Could not fetch the PDF file (HTTP ${response.status}).`)
    }

    const buffer = Buffer.from(await response.arrayBuffer())
    const pdfData = await pdfParse(buffer)
    const rawText = pdfData.text

    if (!rawText || rawText.trim().length === 0) {
      throw new Error('No text could be extracted. Ensure the PDF is text-based, not a scanned image.')
    }

    // Cap at 12k chars to stay within free-tier token limits
    const text = rawText.trim().substring(0, 12_000)

    // ── FAILOVER ENGINE ──────────────────────────────────────────────────────
    let analysisJson: AnalysisTopic[]
    let engine = 'gemini'

    const geminiKey = process.env.GEMINI_API_KEY
    const groqKey = process.env.GROQ_API_KEY

    if (!geminiKey && !groqKey) {
      throw new Error('No AI API keys are configured on the server.')
    }

    // Step 1: Try Gemini (primary)
    if (geminiKey) {
      try {
        analysisJson = await analyzeWithGemini(geminiKey, text)
      } catch (geminiErr) {
        const isExhausted = geminiErr instanceof Error && geminiErr.message === 'GEMINI_EXHAUSTED'
        if (isExhausted && groqKey) {
          console.warn('[analyze] ⚠️  Gemini quota exhausted — falling back to Groq (llama-3.3-70b-versatile)')
          engine = 'groq'
          analysisJson = await analyzeWithGroq(groqKey, text)
        } else if (!isExhausted) {
          // Gemini failed for a non-quota reason — still try Groq as safety net
          if (groqKey) {
            console.warn('[analyze] ⚠️  Gemini error, falling back to Groq:', geminiErr instanceof Error ? geminiErr.message : geminiErr)
            engine = 'groq'
            analysisJson = await analyzeWithGroq(groqKey, text)
          } else {
            throw geminiErr
          }
        } else {
          throw new Error('All AI engines are over quota. Please wait 1–2 minutes and try again.')
        }
      }
    } else {
      // No Gemini key — use Groq directly
      engine = 'groq'
      analysisJson = await analyzeWithGroq(groqKey!, text)
    }

    console.log(`[analyze] ✅ Analysis complete via ${engine} (${analysisJson!.length} topics)`)

    // Persist to database
    const { data, error: dbError } = await supabase
      .from('papers')
      .insert({ user_id: user.id, pdf_url, analysis_json: analysisJson! })
      .select()
      .single()

    if (dbError) throw new Error(`Database error: ${dbError.message}`)

    return NextResponse.json({ success: true, data })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    console.error('[/api/analyze]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
