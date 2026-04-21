import { getStore } from '@netlify/blobs';

const SIGNUPS_KEY = 'signups';

export default async (req, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') {
    return new Response('', { status: 200, headers });
  }

  const store = getStore({ name: 'vibe-meetup', consistency: 'strong' });

  if (req.method === 'GET') {
    const raw = await store.get(SIGNUPS_KEY);
    const signups = raw ? JSON.parse(raw) : [];
    return new Response(JSON.stringify(signups), { status: 200, headers });
  }

  if (req.method === 'POST') {
    const body = await req.json();
    const { name, topic } = body ?? {};
    if (!name || !topic) {
      return new Response(JSON.stringify({ error: 'name and topic are required' }), { status: 400, headers });
    }
    const raw = await store.get(SIGNUPS_KEY);
    const signups = raw ? JSON.parse(raw) : [];
    signups.push({ name: String(name).trim(), topic: String(topic).trim(), ts: Date.now() });
    await store.set(SIGNUPS_KEY, JSON.stringify(signups));
    return new Response(JSON.stringify({ ok: true, slot: signups.length }), { status: 201, headers });
  }

  // PUT — replace entire list (reorder)
  if (req.method === 'PUT') {
    const body = await req.json();
    if (!Array.isArray(body)) {
      return new Response(JSON.stringify({ error: 'body must be an array' }), { status: 400, headers });
    }
    await store.set(SIGNUPS_KEY, JSON.stringify(body));
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  }

  // DELETE — remove by index
  if (req.method === 'DELETE') {
    const url = new URL(req.url);
    const idx = parseInt(url.searchParams.get('index'), 10);
    if (isNaN(idx)) {
      return new Response(JSON.stringify({ error: 'index query param required' }), { status: 400, headers });
    }
    const raw = await store.get(SIGNUPS_KEY);
    const signups = raw ? JSON.parse(raw) : [];
    signups.splice(idx, 1);
    await store.set(SIGNUPS_KEY, JSON.stringify(signups));
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
};

export const config = { path: '/api/signups' };
