import { NextResponse } from 'next/server';

const API_BASE = process.env.API_BASE || 'https://othello-backend-production-2ff4.up.railway.app';

export async function GET() {
  try {
    const r = await fetch(`${API_BASE}/api/campaigns`, { cache: 'no-store' });
    const json = await r.json().catch(() => []);
    return NextResponse.json(json, { status: r.status });
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const r = await fetch(`${API_BASE}/api/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const text = await r.text();
    let json: any = {};
    try { json = JSON.parse(text); } catch { json = { raw: text }; }
    return NextResponse.json(json, { status: r.status });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
