const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function findModel() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const testModels = ["gemini-pro", "gemini-1.0-pro", "gemini-1.5-pro", "gemini-1.5-flash", "gemini-2.0-flash-exp"];
  for (const m of testModels) {
    try {
      console.log(`Testing ${m}...`);
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("Hi");
      console.log(`✅ ${m} works!`);
      return;
    } catch (e) {
      console.log(`❌ ${m} failed: ${e.message.substring(0, 100)}`);
    }
  }
}
findModel();
