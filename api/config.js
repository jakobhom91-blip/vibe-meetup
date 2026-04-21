import { kv } from '@vercel/kv';

const KEY = 'vibe_config_v1';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const config = (await kv.get(KEY)) ?? {};
    return res.status(200).json(config);
  }

  if (req.method === 'POST') {
    const { signupUrl } = req.body ?? {};
    if (!signupUrl) {
      return res.status(400).json({ error: 'signupUrl er påkrævet' });
    }
    const config = { signupUrl: String(signupUrl).trim() };
    await kv.set(KEY, config);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
