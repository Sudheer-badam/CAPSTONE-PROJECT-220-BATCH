// api/health.js — Health check endpoint
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  res.status(200).json({
    status: 'ok',
    service: 'AI Social Media Sentiment & Trend Analysis API',
    project: 'Capstone Batch 220 — KL University',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET  /api/health       — Service health check',
      'POST /api/sentiment    — Analyze text sentiment',
      'GET  /api/trends       — Get trending topics',
      'POST /api/analyze      — Full platform analysis',
    ]
  });
}
