import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenAI } from "@google/genai";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Initialize AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(request: Request) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'Gemini API Key missing' }, { status: 500 });
        }

        const { message, history } = await request.json();

        // 1. Fetch Documents & Config
        const [documents, botConfig] = await Promise.all([
            prisma.document.findMany(),
            prisma.botConfig.findUnique({ where: { id: 1 } })
        ]);

        const configName = botConfig?.name || 'DocuSupport AI';
        const configRules = botConfig?.rules || 'Always be polite.';

        // 2. Prepare context
        // Limit documents if too many (basic optimization: take last 20 or fit context)
        // For now, take all as user limit was 100 docs

        // Convert to Gemini parts
        const docParts = documents.map(doc => ({
            inlineData: {
                mimeType: doc.type,
                data: doc.base64 // Assuming base64 is pure base64 without prefix
            }
        }));

        // 3. System Instruction
        const systemInstruction = `
      You are ${configName}, a professional customer support assistant.
      
      CORE RULES:
      1. Answer user questions accurately based ONLY on the provided documents.
      2. If multiple documents are provided, analyze all of them to find the answer.
      3. If the answer is not found in the documents, politely state that you do not have that information based on the current knowledge base.
      4. Always be helpful, concise, and professional.
      5. Format your responses using Markdown.
      
      SPECIFIC GUIDELINES:
      ${configRules}
    `;

        // 4. Build Content
        // Include history logic if needed (Gemini supports history, but for simple Q&A we might just context stuffing)
        // We will append current question with documents.

        const contents = [
            {
                role: 'user',
                parts: [
                    ...docParts,
                    { text: `System Instruction: ${systemInstruction}` },
                    { text: `Context: There are ${documents.length} document(s) uploaded. Use them to answer the question.` },
                    { text: `User Question: ${message}` }
                ]
            }
        ];

        const model = process.env.GEMINI_MODEL || "gemini-1.5-flash"; // Use 1.5-flash as default if not set

        const result = await ai.models.generateContent({
            model,
            contents,
            config: {
                temperature: 0.2,
            }
        });

        return NextResponse.json({ text: result.text });

    } catch (error) {
        console.error('Gemini Error:', error);
        return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
    }
}
