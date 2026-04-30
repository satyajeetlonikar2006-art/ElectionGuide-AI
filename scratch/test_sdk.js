const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{ role: 'user', parts: [{ text: 'Hello' }] }]
    });
    console.log('Success:', response.text);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
