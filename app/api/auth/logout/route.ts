import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ message: 'Odjavljen' });
  response.cookies.delete('token');
  return response;
}
