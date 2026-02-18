import { NextRequest, NextResponse } from 'next/server';

export async function POST(_req: NextRequest) {
  return NextResponse.json(
    {
      error: 'Direct email notifications are disabled. Use the Support page to contact us by email.',
    },
    { status: 501 }
  );
}
