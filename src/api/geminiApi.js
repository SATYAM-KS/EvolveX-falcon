// src/api/geminiApi.js

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY ;

// This is a helper function, so we don't export it.
const parseJsonFromAIResponse = (text) => {
  try {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1] : text;
    return JSON.parse(jsonString.trim());
  } catch (error) {
    console.error("Error parsing JSON:", error, "Raw text:", text);
    return null;
  }
};

export const analyzeWithGemini = async (content, title) => {
  const prompt = `
    Analyze the following Web3/blockchain news article for these factors:
    1. Overall Sentiment (Positive, Negative, Neutral)
    2. Token Price Impact (Bullish, Bearish, Neutral)
    3. Developer Activity (High, Medium, Low)
    4. Adoption Potential (High, Medium, Low)
    5. Security Concerns (Detected, Not Detected)
    6. Regulatory News (Favorable, Unfavorable, Neutral)
    7. Sector (e.g., DeFi, NFT, Gaming, Infrastructure, Layer 1)
    
    Title: ${title}
    Content: ${content.slice(0, 3000)}
    
    Provide the analysis in this exact JSON format, inside a json code block:
    \`\`\`json
    {
      "Overall_Sentiment": "value",
      "Token_Price_Impact": "value",
      "Developer_Activity": "value",
      "Adoption_Potential": "value",
      "Security_Concerns": "value",
      "Regulatory_News": "value",
      "Sector": "value"
    }
    \`\`\`
  `;

  const defaultAnalysis = {
    Overall_Sentiment: "Neutral",
    Token_Price_Impact: "Neutral",
    Developer_Activity: "Medium",
    Adoption_Potential: "Medium",
    Security_Concerns: "Not Detected",
    Regulatory_News: "Neutral",
    Sector: "General",
  };

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const result = await response.json();

    if (!result.candidates || result.candidates.length === 0) {
      console.warn("Gemini response was blocked or empty.", result);
      return defaultAnalysis;
    }
    
    const contentText = result.candidates[0].content.parts[0].text;
    return parseJsonFromAIResponse(contentText) || defaultAnalysis;

  } catch (error) {
    console.error("Error analyzing with Gemini:", error.message);
    return defaultAnalysis; // Return default on error to avoid crashing
  }
};