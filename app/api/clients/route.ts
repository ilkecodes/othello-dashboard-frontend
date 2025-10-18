import { NextResponse } from 'next/server';

const API_BASE = process.env.API_BASE || 'https://othello-backend-production-2ff4.up.railway.app';
const UPSTREAM = `${API_BASE}/api/clients`;

export async function GET() {
  try {
    const r = await fetch(UPSTREAM, { cache: 'no-store' });
    const data = await r.json();
    return NextResponse.json(data, { status: r.status });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const r = await fetch(UPSTREAM, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const txt = await r.text();
    let data: any = {};
    try { data = JSON.parse(txt); } catch {}
    return NextResponse.json(data, { status: r.status });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const r = await fetch(`${UPSTREAM}/${id}`, { method: 'DELETE' });
    const txt = await r.text();
    let data: any = {};
    try { data = JSON.parse(txt); } catch {}
    return NextResponse.json(data, { status: r.status });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
  }
}
