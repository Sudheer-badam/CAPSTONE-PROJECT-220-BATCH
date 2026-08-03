// api/trends.js — Trending Topics Detection endpoint
// Returns real-time simulated trend data for multiple social platforms

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed. Use GET.' });
  }

  const { platform = 'all', limit = '10', category = 'all' } = req.query;
  const parsedLimit = Math.min(parseInt(limit) || 10, 50);

  const allTrends = [
    // Technology
    { topic: '#AIRevolution',     platform: 'twitter',   category: 'technology', mentions: 142300, sentiment: 'positive', growth: '+34%', peak_hour: '09:00 IST' },
    { topic: 'Machine Learning',  platform: 'linkedin',  category: 'technology', mentions: 89200,  sentiment: 'positive', growth: '+21%', peak_hour: '11:00 IST' },
    { topic: '#ChatGPT',          platform: 'twitter',   category: 'technology', mentions: 231000, sentiment: 'neutral',  growth: '+12%', peak_hour: '14:00 IST' },
    { topic: 'NLP Advancements',  platform: 'reddit',    category: 'technology', mentions: 54300,  sentiment: 'positive', growth: '+45%', peak_hour: '20:00 IST' },
    { topic: '#DeepLearning',     platform: 'twitter',   category: 'technology', mentions: 67800,  sentiment: 'positive', growth: '+18%', peak_hour: '10:00 IST' },
    // Business
    { topic: 'Market Sentiment',  platform: 'twitter',   category: 'business',   mentions: 98400,  sentiment: 'neutral',  growth: '+7%',  peak_hour: '08:00 IST' },
    { topic: '#StartupIndia',     platform: 'linkedin',  category: 'business',   mentions: 43200,  sentiment: 'positive', growth: '+29%', peak_hour: '12:00 IST' },
    { topic: 'DigitalIndia',      platform: 'youtube',   category: 'business',   mentions: 76500,  sentiment: 'positive', growth: '+16%', peak_hour: '19:00 IST' },
    // Education
    { topic: '#BTech2026',        platform: 'instagram', category: 'education',  mentions: 35600,  sentiment: 'positive', growth: '+55%', peak_hour: '22:00 IST' },
    { topic: 'KL University',     platform: 'twitter',   category: 'education',  mentions: 12400,  sentiment: 'positive', growth: '+8%',  peak_hour: '09:00 IST' },
    // Entertainment
    { topic: '#Bollywood',        platform: 'instagram', category: 'entertainment', mentions: 312000, sentiment: 'positive', growth: '+4%', peak_hour: '21:00 IST' },
    { topic: 'IPL2026',           platform: 'twitter',   category: 'entertainment', mentions: 489000, sentiment: 'positive', growth: '+63%', peak_hour: '20:00 IST' },
    // Politics
    { topic: '#Budget2026',       platform: 'twitter',   category: 'politics',   mentions: 267000, sentiment: 'negative', growth: '+42%', peak_hour: '15:00 IST' },
    { topic: 'Elections',         platform: 'reddit',    category: 'politics',   mentions: 183000, sentiment: 'neutral',  growth: '+31%', peak_hour: '18:00 IST' },
    // Health
    { topic: 'MentalHealth',      platform: 'instagram', category: 'health',     mentions: 94300,  sentiment: 'neutral',  growth: '+22%', peak_hour: '07:00 IST' },
    { topic: '#WellnessWednesday',platform: 'instagram', category: 'health',     mentions: 71200,  sentiment: 'positive', growth: '+11%', peak_hour: '06:00 IST' },
  ];

  // Filter by platform and category
  let filtered = allTrends;
  if (platform !== 'all') filtered = filtered.filter(t => t.platform === platform.toLowerCase());
  if (category !== 'all') filtered = filtered.filter(t => t.category === category.toLowerCase());

  // Sort by mentions descending
  filtered.sort((a, b) => b.mentions - a.mentions);
  const results = filtered.slice(0, parsedLimit);

  // Summary stats
  const sentimentDist = results.reduce((acc, t) => {
    acc[t.sentiment] = (acc[t.sentiment] || 0) + 1; return acc;
  }, {});

  const platformDist = results.reduce((acc, t) => {
    acc[t.platform] = (acc[t.platform] || 0) + 1; return acc;
  }, {});

  return res.status(200).json({
    query: { platform, category, limit: parsedLimit },
    total_found: results.length,
    trends: results.map((t, i) => ({ rank: i + 1, ...t })),
    summary: {
      sentiment_distribution: sentimentDist,
      platform_distribution: platformDist,
      top_trend: results[0]?.topic || null,
      total_mentions: results.reduce((s, t) => s + t.mentions, 0),
    },
    metadata: {
      model: 'Trend Detection Engine v1.0 (Capstone Batch 220)',
      platforms_tracked: ['twitter', 'instagram', 'facebook', 'reddit', 'youtube', 'linkedin'],
      refreshed_at: new Date().toISOString(),
    }
  });
}
