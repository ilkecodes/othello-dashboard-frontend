import { NextResponse } from 'next/server';

const API_BASE = process.env.API_BASE || 'https://othello-backend-production-2ff4.up.railway.app';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const r = await fetch(`${API_BASE}/api/trends/client/${params.id}`, { cache: 'no-store' });
    const json = await r.json().catch(() => ({ trends: [] }));
    return NextResponse.json(json, { status: r.status });
  } catch (error) {
    return NextResponse.json({ trends: [] }, { status: 500 });
  }
}
