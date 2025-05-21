const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

app.post('/api/check-sms', async (req, res) => {
  const { smsText, sender } = req.body;

  const prompt = `
Analyze this SMS message: "${smsText}" sent by "${sender}".
Provide a JSON output with the following fields:
{
  "sms_status":"Real" or "Fraudulent",
  "bot_involved": "Yes" or "No",
  "previous_suspicious_activities": "Yes" or "No",
  "authorized_sender": "Yes" or "No"
}

**Explanation of why the fields are assigned as above:**
`;

  try {
    const response = await axios.post(
      GEMINI_API_URL,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    const geminiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!geminiResponse) {
      return res.status(500).json({ error: 'Empty response from Gemini' });
    }

    let cleanResponse = geminiResponse.trim();

    // Remove Markdown code block formatting
    if (cleanResponse.startsWith("```")) {
      cleanResponse = cleanResponse.replace(/```(?:json)?/g, "").trim();
    }

    // Find JSON object inside the response
    const jsonStart = cleanResponse.indexOf('{');
    const jsonEnd = cleanResponse.lastIndexOf('}') + 1;
    const jsonString = cleanResponse.substring(jsonStart, jsonEnd);
    const explanation = cleanResponse.substring(jsonEnd).trim();

    const parsedData = JSON.parse(jsonString);
    parsedData.explanation = explanation;

    res.json(parsedData);

  } catch (error) {
    console.error('Gemini API Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to analyze SMS with Gemini' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
