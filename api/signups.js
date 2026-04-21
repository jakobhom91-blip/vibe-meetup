import { kv } from '@vercel/kv';

const KEY = 'vibe_showandtell_v1';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const signups = (await kv.get(KEY)) ?? [];
    return res.status(200).json(signups);
  }

  if (req.method === 'POST') {
    const { name, topic } = req.body ?? {};
    if (!name || !topic) {
      return res.status(400).json({ error: 'name og topic er påkrævet' });
    }

    // Hent eksisterende liste, tilføj ny entry, gem tilbage
    const signups = (await kv.get(KEY)) ?? [];
    signups.push({ name: String(name).trim(), topic: String(topic).trim(), ts: Date.now() });
    await kv.set(KEY, signups);

    return res.status(201).json({ ok: true, slot: signups.length });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
