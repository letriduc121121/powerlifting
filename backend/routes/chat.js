const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const natural = require('natural');
const path = require('path');
const fs = require('fs');
const { buildIndex, semanticSearch } = require('../utils/embeddings');

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const qaData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/powerlifting_dataset.json'), 'utf-8')
);

const tfidf = new natural.TfIdf();
qaData.forEach(item => tfidf.addDocument(item.q + ' ' + item.a));

buildIndex(qaData).catch(() => {});

const SYSTEM_PROMPT = `You are PL Assistant, the official AI assistant for Vietnam Powerlifting Championship 2026.

Tournament details:
- Date: 20/08/2026 to 21/08/2026, time 07:00-18:00 each day
- Location: Ha Noi, Vietnam (specific venue to be announced)
- Male weight classes: 59, 66, 74, 83, 93, 105, 120, +120kg
- Female weight classes: 47, 52, 57, 63, 69, 76, 84, +84kg
- Three events: Squat, Bench Press, Deadlift
- Each athlete gets 3 attempts per lift; best valid lift counts toward total score
- Disqualified if no valid lift in any event
- Registration via the official website registration button

Always respond in Vietnamese. Be concise, accurate, and friendly. If unsure about something specific, suggest contacting the organizing committee.`;

function tfidfSearch(question, topK = 3) {
  const results = [];
  tfidf.tfidfs(question, (i, score) => {
    if (score > 0) results.push({ ...qaData[i], score });
  });
  return results.sort((a, b) => b.score - a.score).slice(0, topK);
}

function keywordSearch(question, topK = 2) {
  const words = question.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  return qaData
    .map(item => {
      const text = (item.q + ' ' + item.a).toLowerCase();
      const score = words.reduce((acc, w) => acc + (text.includes(w) ? 1 : 0), 0);
      return { ...item, score };
    })
    .filter(i => i.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

async function findContext(question) {
  try {
    const semantic = await semanticSearch(question, 3);
    if (semantic.length > 0 && semantic[0].score > 0.4) {
      return semantic.map(r => `Q: ${r.q}\nA: ${r.a}`).join('\n\n');
    }
  } catch (_) {}

  const tfResults = tfidfSearch(question, 3);
  if (tfResults.length > 0) {
    return tfResults.map(r => `Q: ${r.q}\nA: ${r.a}`).join('\n\n');
  }

  return '';
}

function localFallback(question) {
  const tf = tfidfSearch(question, 2);
  if (tf.length > 0) {
    return tf.length === 1 ? tf[0].a : tf.map(r => `• ${r.a}`).join('\n\n');
  }
  const kw = keywordSearch(question, 1);
  if (kw.length > 0) return kw[0].a;
  return 'Xin chào! Tôi có thể giúp bạn về Powerlifting và giải đấu 2026. Hãy hỏi về lịch thi đấu, đăng ký, hạng cân, hoặc các bài Squat, Bench Press và Deadlift.';
}

router.post('/', async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) {
    return res.status(400).json({ success: false, message: 'No message provided.' });
  }

  const context = await findContext(message);

  const recentHistory = history.slice(-6).map(m => ({
    role: m.role === 'bot' ? 'assistant' : 'user',
    content: m.text,
  }));

  try {
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 500,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...recentHistory,
        {
          role: 'user',
          content: context ? `Context:\n${context}\n\nQuestion: ${message}` : message,
        },
      ],
    });

    res.json({ success: true, reply: response.choices[0].message.content });
  } catch (error) {
    if (error.status === 429 || (error.message && error.message.includes('429'))) {
      return res.json({ success: true, reply: localFallback(message) });
    }
    console.error(error.message);
    res.status(500).json({ success: false, message: 'AI service error.' });
  }
});

module.exports = router;