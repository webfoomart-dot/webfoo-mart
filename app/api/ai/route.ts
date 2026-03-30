import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { productName, prompt } = await req.json();

    // AI ko strict instruction diya hai ki sirf JSON me reply kare
    const systemPrompt = `You are an AI assistant for WebFoo Mart, an e-commerce grocery and retail store in West Bokaro. 
    You MUST respond in strictly valid JSON format ONLY. Do not use markdown blocks like \`\`\`json.
    ${prompt}`;

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, // Tera Groq API Key
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama3-8b-8192", // Fast model for quick API response
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Fetch details for this product: ${productName}` }
        ],
        response_format: { type: "json_object" }, // Force JSON response
        temperature: 0.3 // Keep it factual, not overly creative
      })
    });

    const data = await res.json();
    const aiContent = data.choices[0].message.content;
    
    // AI ka diya hua JSON parse karke frontend pe bhej rahe hain
    const resultJson = JSON.parse(aiContent);

    return NextResponse.json(resultJson);
  } catch (error) {
    console.error("AI API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI content. Check Groq API Key or format." }, 
      { status: 500 }
    );
  }
}
