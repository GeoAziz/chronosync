import { NextRequest, NextResponse } from 'next/server';
import { auth, initAdmin } from '@/lib/firebase-admin';

initAdmin();

export async function GET(request: NextRequest) {
  try {
    const session = request.cookies.get('session')?.value;
    
    if (!session) {
      return NextResponse.json({ error: 'No session cookie found' }, { status: 401 });
    }

    await auth.verifySessionCookie(session, true);
    return NextResponse.json({ status: 'valid' });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }
}
