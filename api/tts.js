import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('متد مجاز نیست.');
  }

  const { text } = req.body;
  if (!text) {
    return res.status(400).send('متنی دریافت نشد.');
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: text,
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Puck" }
          }
        }
      }
    });

    const candidate = response.candidates?.[0];
    const audioPart = candidate?.content?.parts?.find(p => p.inlineData);

    if (!audioPart || !audioPart.inlineData) {
      return res.status(500).send('خروجی صوتی از مدل دریافت نشد.');
    }

    const audioBuffer = Buffer.from(audioPart.inlineData.data, 'base64');
    res.setHeader('Content-Type', audioPart.inlineData.mimeType || 'audio/wav');
    return res.send(audioBuffer);
  } catch (error) {
    console.error("Gemini Error:", error);
    return res.status(500).send(error.message || 'خطا در ارتباط با جمینای');
  }
}
