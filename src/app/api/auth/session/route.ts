
import admin from 'firebase-admin';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';

// Initialize the Firebase Admin SDK
initAdmin();

export async function POST(request: NextRequest) {
  const { idToken } = await request.json();

  if (!idToken) {
    return NextResponse.json({ error: 'ID token is required' }, { status: 400 });
  }

  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

  try {
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });
    const response = NextResponse.json({ status: 'success' });
    
    // Set the session cookie with proper options
    response.cookies.set('session', sessionCookie, {
      maxAge: expiresIn / 1000, // Convert to seconds
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });

    // Verify the cookie was set successfully
    const verifyCookie = await admin.auth().verifySessionCookie(sessionCookie);
    if (!verifyCookie) {
      throw new Error('Failed to verify session cookie');
    }

    return response;

  } catch (error) {
    console.error('Error creating session cookie:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 401 });
  }
}
