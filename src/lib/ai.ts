import axios from 'axios'
import type { ResumeData } from '@/types'

// Fallback chain — tried in order if the primary model is rate-limited
const FALLBACK_MODELS = [
  'google/gemma-4-26b-a4b-it:free',
  'google/gemma-4-31b-it:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'openai/gpt-oss-20b:free',
  'openai/gpt-oss-120b:free',
]

async function callOpenRouter(model: string, prompt: string, maxTokens: number): Promise<string> {
  const res = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert resume writer and career coach. Write professional, ATS-optimized content.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: maxTokens,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
      },
      timeout: 30000,
    }
  )
  const content = res.data.choices?.[0]?.message?.content
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
        const status = axios.isAxiosError(err) ? err.response?.status : null
        // 429 = rate limited, 404 = model unavailable — try next
        if (status === 429 || status === 404) {
          console.warn(`[AI] ${model} unavailable (${status}), trying next model…`)
          continue
        }
        throw err
      }
    }
    throw new Error('All OpenRouter models are currently rate-limited. Please try again in a moment.')
  }

  if (provider === 'gemini') {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] }
    )
    return res.data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  }

  // Default: OpenAI
  const res = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: process.env.AI_MODEL || 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert resume writer and career coach. Write professional, ATS-optimized content. Be concise and impactful.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  )
  return res.data.choices[0]?.message?.content || ''
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

  const prompt = `Write a compelling 3-4 sentence professional summary for ${personalInfo.name || 'a professional'}, a ${personalInfo.title || 'professional'} with experience as ${expText || 'various roles'}. Key skills: ${skillText || 'various skills'}.

Requirements:
- Start with a strong action word or professional title
- Highlight years of experience and key achievements
- Include 2-3 core competencies
- End with value proposition
- Do NOT use "I" — write in third person or directly
- Keep it between 150-250 words`

  return generateText(prompt, 400)
}

export async function rewriteExperience(
  position: string,
  company: string,
  description: string
): Promise<string> {
  const prompt = `Rewrite this job description for a ${position} at ${company} to be more impactful and ATS-optimized:

"${description}"

Requirements:
- Use strong action verbs (Led, Built, Increased, Optimized, etc.)
- Add quantifiable metrics where possible (%, $, time saved)
- Keep bullet points concise (1-2 lines each)
- Focus on impact and achievements
- Return 4-5 bullet points, each starting with •`

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

  // Fallback: simple keyword matching
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
