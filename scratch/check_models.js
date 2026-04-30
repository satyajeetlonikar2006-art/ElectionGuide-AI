const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function list() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // Note: getGenerativeModel doesn't have a list function, 
  // but we can try to find how to list models in this SDK version.
  // Actually, listing is usually done via a different method or just knowing the names.
  console.log("Checking gemini-1.5-flash-latest...");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
  try {
    const result = await model.generateContent("Hi");
    console.log("Success with -latest!");
  } catch (e) {
    console.log("Failed with -latest:", e.message);
  }
}
list();
