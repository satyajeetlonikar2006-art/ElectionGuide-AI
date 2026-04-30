const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

async function test() {
  // Trying v1 instead of v1beta
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  // The new SDK might not support setting apiVersion in the constructor easily?
  // Let's check if we can pass it in generateContent or elsewhere.
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
