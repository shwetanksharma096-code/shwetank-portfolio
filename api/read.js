import { getRedis } from './_redis.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  const client = getRedis();
  if (!client) {
    return res.status(200).json({ error: 'REDIS_URL not configured' });
  }

  try {
    const data = await client.get('portfolioData');
    if (data) {
      try {
        return res.status(200).json(JSON.parse(data));
      } catch {
        return res.status(500).json({ error: 'Failed to parse JSON from Redis' });
      }
    }
    return res.status(200).json({});
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
