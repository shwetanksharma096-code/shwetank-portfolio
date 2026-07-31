import { getRedis, DEFAULT_ADMIN_PASSWORD } from './_redis.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const client = getRedis();
  if (!client) {
    return res.status(500).json({ error: 'REDIS_URL not configured' });
  }

  const body = req.body;
  if (!body || !body.password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  try {
    const storedPassword = (await client.get('adminPassword')) || DEFAULT_ADMIN_PASSWORD;
    if (body.password === storedPassword) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(200).json({ success: false, error: 'Incorrect password' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
