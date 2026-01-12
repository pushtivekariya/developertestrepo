import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
    nodeEnv: process.env.NODE_ENV,
    allEnv: Object.keys(process.env).filter(key => key.includes('NEXT_PUBLIC') || key.includes('SUPABASE'))
  });
}
