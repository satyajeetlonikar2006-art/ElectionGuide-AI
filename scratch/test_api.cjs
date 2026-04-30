require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('Hi');
    const response = await result.response;
    console.log('SUCCESS:', response.text());
  } catch (e) {
    console.error('FAILURE:', e.message);
  }
}

test();
