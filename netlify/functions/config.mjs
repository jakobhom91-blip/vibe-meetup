import { getStore } from '@netlify/blobs';

const CONFIG_KEY = 'config';

export default async (req, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') {
    return new Response('', { status: 200, headers });
  }

  const store = getStore({ name: 'vibe-meetup', consistency: 'strong' });

  if (req.method === 'GET') {
    const raw = await store.get(CONFIG_KEY);
    const config = raw ? JSON.parse(raw) : {};
    return new Response(JSON.stringify(config), { status: 200, headers });
  }

  if (req.method === 'POST') {
    const body = await req.json();
    const { signupUrl } = body ?? {};

    if (!signupUrl) {
      return new Response(JSON.stringify({ error: 'signupUrl er påkrævet' }), { status: 400, headers });
    }

    const config = { signupUrl: String(signupUrl).trim() };
    await store.set(CONFIG_KEY, JSON.stringify(config));

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
};

export const config = { path: '/api/config' };
