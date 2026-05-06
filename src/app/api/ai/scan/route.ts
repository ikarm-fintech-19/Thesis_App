import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_AI_API_KEY || ''
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Mock response if no API key
    if (!process.env.GOOGLE_AI_API_KEY) {
      console.warn('GOOGLE_AI_API_KEY is not set. Returning mock data.');
      
      // Artificial delay to simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      return NextResponse.json({
        result: {
          vendorName: 'SARL ELECTRA ALGERIE',
          date: '2026-04-15',
          baseHT: '125000.00',
          tvaRate: '0.19',
          tvaAmount: '23750.00',
          totalTTC: '148750.00',
          category: 'Achat de Biens',
          confidence: 0.94
        }
      });
    }

    // Actual Gemini Integration
    const buffer = await file.arrayBuffer();
    const base64Data = Buffer.from(buffer).toString('base64');

    const prompt = `
      Analyze this invoice/receipt image and extract the following information in valid JSON format.
      Use the following fields:
      - vendorName: The name of the company issuing the invoice.
      - date: The date of the invoice in YYYY-MM-DD format.
      - baseHT: The total amount before tax (numeric string).
      - tvaRate: The TVA rate applied (e.g., 0.19 or 0.09).
      - tvaAmount: The total TVA amount (numeric string).
      - totalTTC: The final total amount including tax (numeric string).
      - category: One of "Achat de Biens", "Prestation de Services", "Importation".
      - confidence: Your confidence level between 0 and 1.

      Rules for LF 2026:
      - Standard TVA is 19% (0.19).
      - Reduced TVA is 9% (0.09).
      - If the document is in French or Arabic, translate values correctly.
      - Ensure JSON is valid and only return the JSON block.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Data,
                mimeType: file.type
              }
            }
          ]
        }
      ]
    });

    const text = response.text || '';
    
    // Clean JSON from markdown if necessary
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : text;
    
    try {
      const extractedData = JSON.parse(jsonStr);
      return NextResponse.json({ result: extractedData });
    } catch (parseError) {
      console.error('JSON Parse Error:', text);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('AI Scan Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
