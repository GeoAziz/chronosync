
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    cookies().delete('session');
    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Error signing out:', error);
    return NextResponse.json({ error: 'Failed to sign out' }, { status: 500 });
  }
}
