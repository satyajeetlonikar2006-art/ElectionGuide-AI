require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function list() {
  try {
    // Note: getGenerativeModel doesn't have listModels, need to use the REST API or different method
    // But we can try common variations
    const variants = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-pro', 'gemini-pro'];
    for (const v of variants) {
       try {
         const model = genAI.getGenerativeModel({ model: v });
         const res = await model.generateContent('Hi');
         console.log(`Model ${v} WORKS`);
         return;
       } catch (e) {
         console.log(`Model ${v} FAILS: ${e.message}`);
       }
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
}

list();
