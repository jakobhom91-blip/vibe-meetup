import { getStore } from '@netlify/blobs';

const SIGNUPS_KEY = 'signups';

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

  const store = getStore('vibe-meetup');

  if (req.method === 'GET') {
    const raw = await store.get(SIGNUPS_KEY);
    const signups = raw ? JSON.parse(raw) : [];
    return new Response(JSON.stringify(signups), { status: 200, headers });
  }

  if (req.method === 'POST') {
    const body = await req.json();
    const { name, topic } = body ?? {};

    if (!name || !topic) {
      return new Response(JSON.stringify({ error: 'name og topic er påkrævet' }), { status: 400, headers });
    }

    const raw = await store.get(SIGNUPS_KEY);
    const signups = raw ? JSON.parse(raw) : [];
    signups.push({ name: String(name).trim(), topic: String(topic).trim(), ts: Date.now() });
    await store.set(SIGNUPS_KEY, JSON.stringify(signups));

    return new Response(JSON.stringify({ ok: true, slot: signups.length }), { status: 201, headers });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
};

export const config = { path: '/api/signups' };
