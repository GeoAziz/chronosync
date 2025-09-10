
import admin from 'firebase-admin';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';

// Initialize the Firebase Admin SDK
initAdmin();

export async function POST(request: NextRequest) {
  const { idToken } = await request.json();
  console.log('API /api/auth/session: Received request.');

  if (!idToken) {
    console.error('API /api/auth/session: ID token is missing.');
    return NextResponse.json({ error: 'ID token is required' }, { status: 400 });
  }
  console.log('API /api/auth/session: Received ID token.');

  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log('API /api/auth/session: ID token verified successfully. UID:', decodedToken.uid);
    
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });
    console.log('API /api/auth/session: Session cookie created.');
    
    // Set the session cookie with proper options
    const isAdmin = decodedToken.admin === true;
    const redirectPath = isAdmin ? '/admin/dashboard' : '/worker/dashboard';
    console.log(`API /api/auth/session: User is ${isAdmin ? 'Admin' : 'Worker'}. Redirecting to ${redirectPath}`);

    // Create the response with the redirect path
    const response = NextResponse.json({ status: 'success', redirectPath });

    // Set the session cookie with proper options
    response.cookies.set('session', sessionCookie, {
      maxAge: expiresIn / 1000, // Convert to seconds
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });
    console.log('API /api/auth/session: Session cookie set in browser.');

    return response;

  } catch (error) {
    console.error('API /api/auth/session: Error creating session cookie:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 401 });
  }
}
