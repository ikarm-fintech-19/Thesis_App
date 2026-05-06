import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comparePassword, setSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email },
      include: { subscription: true },
    });

    if (!user || !(await comparePassword(password, user.passwordHash))) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const authUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      plan: user.subscription?.plan || 'FREE',
    };

    await setSession(authUser as any);

    return NextResponse.json({ user: authUser });
  } catch (error: any) {
    console.error('Login API Error:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    
    // Return a more descriptive error if it's a database connection issue
    if (error.message?.includes('DATABASE_URL') || error.code === 'P2002' || error.code === 'P1001') {
      return NextResponse.json({ 
        error: 'Database connection error. Please check environment variables.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, { status: 500 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
