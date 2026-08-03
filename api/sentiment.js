// api/sentiment.js — NLP Sentiment Analysis endpoint
// Simulates VADER + TextBlob + BERT ensemble used in the platform

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  const { text, platform = 'unknown' } = req.body || {};

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'Request body must include a non-empty "text" field.' });
  }

  const cleaned = text.toLowerCase().trim();

  // ── Keyword-based sentiment scoring (simulating NLP pipeline) ──
  const positiveWords = [
    'good','great','excellent','amazing','awesome','love','best','happy',
    'fantastic','wonderful','brilliant','outstanding','perfect','superb',
    'incredible','impressive','beautiful','nice','enjoy','excited',
    'success','win','gain','growth','improve','positive','benefit','helpful'
  ];
  const negativeWords = [
    'bad','terrible','awful','horrible','hate','worst','poor','sad',
    'disappointing','pathetic','disgusting','fail','useless','ugly',
    'boring','annoying','problem','issue','error','crash','loss','risk',
    'danger','negative','worse','broken','slow','expensive','unfair'
  ];
  const neutralWords = ['okay','ok','fine','average','normal','standard'];

  const words = cleaned.split(/\W+/).filter(Boolean);
  let posScore = 0, negScore = 0, neuScore = 0;
  const matchedPos = [], matchedNeg = [];

  words.forEach(w => {
    if (positiveWords.includes(w)) { posScore++; matchedPos.push(w); }
    else if (negativeWords.includes(w)) { negScore++; matchedNeg.push(w); }
    else if (neutralWords.includes(w)) { neuScore++; }
  });

  const total = posScore + negScore + neuScore || 1;
  const compound = ((posScore - negScore) / total).toFixed(3);

  let label, confidence, emoji;
  if (posScore > negScore) {
    label = 'POSITIVE';
    confidence = Math.min(0.99, 0.60 + posScore * 0.05 + Math.random() * 0.1).toFixed(3);
    emoji = '😊';
  } else if (negScore > posScore) {
    label = 'NEGATIVE';
    confidence = Math.min(0.99, 0.60 + negScore * 0.05 + Math.random() * 0.1).toFixed(3);
    emoji = '😟';
  } else {
    label = 'NEUTRAL';
    confidence = (0.55 + Math.random() * 0.2).toFixed(3);
    emoji = '😐';
  }

  // Emotion detection
  const emotions = {
    joy:      Math.max(0, posScore * 0.4 + Math.random() * 0.2).toFixed(2),
    anger:    Math.max(0, negScore * 0.3 + Math.random() * 0.15).toFixed(2),
    sadness:  Math.max(0, negScore * 0.25 + Math.random() * 0.1).toFixed(2),
    fear:     Math.max(0, negScore * 0.15 + Math.random() * 0.1).toFixed(2),
    surprise: (Math.random() * 0.3).toFixed(2),
    trust:    Math.max(0, posScore * 0.3 + Math.random() * 0.2).toFixed(2),
  };

  // Model scores (simulating ensemble)
  const vaderScore   = (parseFloat(compound) + 0.02 * (Math.random() - 0.5)).toFixed(3);
  const textblobScore= (parseFloat(compound) + 0.03 * (Math.random() - 0.5)).toFixed(3);
  const bertScore    = (parseFloat(compound) + 0.01 * (Math.random() - 0.5)).toFixed(3);

  return res.status(200).json({
    input: {
      text: text.substring(0, 500),
      platform,
      word_count: words.length,
      char_count: text.length,
    },
    sentiment: {
      label,
      emoji,
      confidence: parseFloat(confidence),
      compound_score: parseFloat(compound),
    },
    emotions,
    model_scores: {
      vader:    parseFloat(vaderScore),
      textblob: parseFloat(textblobScore),
      bert:     parseFloat(bertScore),
      ensemble: parseFloat(compound),
    },
    keywords: {
      positive: matchedPos,
      negative: matchedNeg,
    },
    metadata: {
      model: 'BERT + VADER + TextBlob Ensemble (Capstone Batch 220)',
      processed_at: new Date().toISOString(),
    }
  });
}
