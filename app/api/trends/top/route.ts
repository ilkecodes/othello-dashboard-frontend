import { NextResponse } from 'next/server';

const API_BASE = process.env.API_BASE || 'https://othello-backend-production-2ff4.up.railway.app';

export async function GET() {
  try {
    const r = await fetch(`${API_BASE}/api/trends/top`, { cache: 'no-store' });
    const text = await r.text();
    let json: any = {};
    try { json = JSON.parse(text); } catch { json = { raw: text }; }
    return NextResponse.json(json, { status: r.status });
  } catch (error) {
    return NextResponse.json({ trends: [] }, { status: 500 });
  }
}
