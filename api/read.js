import Redis from 'ioredis';

let redis;

function getRedis() {
  if (!redis && process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 10000,
    });
  }
  return redis;
}

export default async function handler(req, res) {
  const client = getRedis();
  
  if (!client) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.status(200).json({ error: 'REDIS_URL not configured' });
  }

  try {
    const data = await client.get('portfolioData');
    
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        return res.status(200).json(parsed);
      } catch (e) {
        return res.status(500).json({ error: 'Failed to parse JSON from Redis' });
      }
    }
    
    return res.status(200).json({});
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
