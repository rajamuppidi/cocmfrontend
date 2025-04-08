import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token') || '';

  console.log('Token:', token); // Debug statement

  try {
    jwt.verify(token, JWT_SECRET);
    console.log('Token is valid'); // Debug statement
    return NextResponse.next();
  } catch (err) {
    console.error('Token verification failed:', err); // Debug statement
    return NextResponse.redirect(new URL('/', req.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/active-patients/:path*', '/other-protected-route/:path*'],
};