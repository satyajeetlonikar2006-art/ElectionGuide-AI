const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

async function list() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await ai.models.list();
    // In the new SDK, list() might return an object with a models property
    const models = response.models || response;
    if (Array.isArray(models)) {
      models.forEach(m => {
        console.log(`${m.name} [${m.supportedActions.join(', ')}]`);
      });
    } else {
      console.log('Could not find models array in response:', typeof models);
    }
  } catch (e) {
    console.error('List failed:', e.message);
  }
}
list();
