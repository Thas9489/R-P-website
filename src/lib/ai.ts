import type { ResumeData } from '@/types'

// Fallback chain — tried in order if the primary model is rate-limited or slow
const FALLBACK_MODELS = [
  'google/gemma-4-26b-a4b-it:free',
  'google/gemma-4-31b-it:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'mistralai/mistral-7b-instruct:free',
  'qwen/qwen-2.5-7b-instruct:free',
]

async function callOpenRouter(model: string, prompt: string, maxTokens: number): Promise<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert resume writer and career coach. Write professional, ATS-optimized content.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: maxTokens,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const status = res.status
    throw Object.assign(new Error(err?.error?.message ?? `HTTP ${status}`), { status })
  }

  const data = await res.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('Empty response from model')
  return content
}

async function generateText(prompt: string, maxTokens = 1024): Promise<string> {
  const provider = process.env.AI_PROVIDER || 'openai'

  if (provider === 'openrouter') {
    const primary = process.env.OPENROUTER_MODEL || FALLBACK_MODELS[0]
    const models = [primary, ...FALLBACK_MODELS.filter((m) => m !== primary)]

    for (const model of models) {
      try {
        return await callOpenRouter(model, prompt, maxTokens)
      } catch (err) {
        const status = (err as { status?: number }).status
        const isEmpty = err instanceof Error && err.message === 'Empty response from model'
        if (status === 429 || status === 404 || isEmpty) {
          console.warn(`[AI] ${model} unavailable (${isEmpty ? 'empty response' : status}), trying next…`)
          continue
        }
        throw err
      }
    }
    throw new Error('AI generation failed. All models are currently unavailable. Please try again in a moment.')
  }

  if (provider === 'gemini') {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    )
    const data = await res.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  }

  // Default: OpenAI
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL || 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert resume writer and career coach. Write professional, ATS-optimized content. Be concise and impactful.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  })
  const data = await res.json()
  return data.choices[0]?.message?.content || ''
}

export async function generateSummary(
  personalInfo: { name?: string; title?: string },
  experience: Array<{ company: string; position: string; description: string }>,
  skills: Array<{ name: string }>
): Promise<string> {
  const expText = experience
    .slice(0, 3)
    .map((e) => `${e.position} at ${e.company}`)
    .join(', ')
  const skillText = skills
    .slice(0, 8)
    .map((s) => s.name)
    .join(', ')

  const prompt = `Write a professional resume summary for a ${personalInfo.title || 'professional'}${expText ? ` with experience as ${expText}` : ''}${skillText ? `. Skills: ${skillText}` : ''}.

Rules:
- Output ONLY the summary paragraph — no headings, no bullet points, no labels, no explanations
- 2-3 sentences, maximum 450 characters total
- Use third-person or direct tone (no "I")
- Start directly with the summary text`

  const result = await generateText(prompt, 200)
  const cleaned = result
    .replace(/^(here'?s?|summary[:\-]?|professional summary[:\-]?|sure[,!]?).*/i, '')
    .replace(/^[\s\-–:]+/, '')
    .trim()
  return cleaned.slice(0, 500)
}

export async function rewriteExperience(
  position: string,
  company: string,
  description: string
): Promise<string> {
  const prompt = description?.trim()
    ? `You are writing resume bullet points for someone who worked as a ${position} at ${company}.

Rewrite the following into 4-5 strong resume bullet points:
"${description}"

Output ONLY the bullet points — no headings, no explanations, no commentary.
Each bullet must:
- Start with • followed by a strong past-tense action verb (Led, Built, Optimized, Delivered, etc.)
- Be one concise sentence
- Include a quantifiable result where possible (%, time saved, $ impact, scale)
- Describe what the person accomplished, not a job posting`
    : `You are writing resume bullet points for someone who worked as a ${position} at ${company}.

Output ONLY 4-5 resume bullet points — no headings, no explanations, no commentary, no preamble.
Each bullet must:
- Start with • followed by a strong past-tense action verb (Led, Built, Optimized, Delivered, etc.)
- Be one concise sentence
- Include a quantifiable result where possible (%, time saved, $ impact, scale)
- Describe real accomplishments typical for a ${position} role`

  return generateText(prompt, 500)
}

export async function generateProjectDescription(
  name: string,
  technologies: string[]
): Promise<string> {
  const techText = technologies.join(', ')
  const prompt = `Write a compelling project description for "${name}" built with ${techText}.

Requirements:
- 2-3 sentences
- Highlight the problem it solves
- Mention key technical decisions
- Include impact or usage if relevant
- Professional, concise tone`

  return generateText(prompt, 300)
}

export async function suggestSkills(
  position: string,
  experience: Array<{ description: string }>,
  currentSkills: string[]
): Promise<string[]> {
  const expText = experience
    .map((e) => e.description)
    .slice(0, 2)
    .join(' ')
    .slice(0, 500)

  const prompt = `Suggest 10-15 relevant technical and soft skills for a ${position} professional.

Current skills: ${currentSkills.join(', ')}
Experience context: ${expText}

Return ONLY a JSON array of skill names, no explanations. Example: ["React", "TypeScript", "Team Leadership"]`

  const result = await generateText(prompt, 200)
  try {
    const match = result.match(/\[[\s\S]*\]/)
    if (match) return JSON.parse(match[0])
    return result
      .split(',')
      .map((s) => s.trim().replace(/['"]/g, ''))
      .filter(Boolean)
  } catch {
    return []
  }
}

export async function improveText(text: string): Promise<string> {
  const prompt = `Improve the following text for a professional resume — fix grammar, improve clarity, and make it more impactful:

"${text}"

Return only the improved text, no explanations.`

  return generateText(prompt, 400)
}

export async function analyzeATS(
  resumeData: Partial<ResumeData>,
  jobDescription: string
): Promise<{ score: number; keywords: { found: string[]; missing: string[] }; suggestions: string[] }> {
  const resumeText = JSON.stringify(resumeData).toLowerCase()

  const prompt = `Analyze this resume against the job description and return ATS optimization results.

Job Description: "${jobDescription.slice(0, 1000)}"

Resume Skills: ${JSON.stringify(resumeData.skills?.map((s) => s.name) || [])}
Resume Experience: ${resumeData.experience?.map((e) => e.description).join(' ').slice(0, 500) || ''}

Return a JSON object with:
{
  "score": <number 0-100>,
  "keywords": {
    "found": [<keywords present in resume>],
    "missing": [<important keywords from job description missing in resume>]
  },
  "suggestions": [<3-5 actionable improvement tips>]
}`

  const result = await generateText(prompt, 600)
  try {
    const match = result.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
  } catch {}

  const words = jobDescription.toLowerCase().split(/\W+/).filter((w) => w.length > 4)
  const found = words.filter((w) => resumeText.includes(w)).slice(0, 10)
  const missing = words.filter((w) => !resumeText.includes(w)).slice(0, 10)

  return {
    score: Math.round((found.length / Math.max(found.length + missing.length, 1)) * 100),
    keywords: { found, missing },
    suggestions: [
      'Add more keywords from the job description',
      'Quantify your achievements with numbers',
      'Use industry-specific terminology',
    ],
  }
}
