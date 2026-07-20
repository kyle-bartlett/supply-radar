import { NextResponse } from 'next/server';
import { getBaseline } from '@/lib/gas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const baseline = await getBaseline();
  return NextResponse.json(baseline);
}
