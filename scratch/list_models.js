const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

async function listModels() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const models = await ai.models.list();
    console.log(JSON.stringify(models, null, 2));
  } catch (error) {
    console.error('Error listing models:', error);
  }
}

listModels();
