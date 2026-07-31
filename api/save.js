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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const client = getRedis();
  if (!client) {
    return res.status(500).json({ error: 'REDIS_URL not configured' });
  }

  const body = req.body;
  if (!body) {
    return res.status(400).json({ error: 'No body provided' });
  }

  // Basic security check (matching the admin panel password)
  if (body.password !== 'shwetank@2024') {
    return res.status(401).json({ error: 'Unauthorized: Incorrect password' });
  }

  try {
    await client.set('portfolioData', JSON.stringify(body.data));
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
