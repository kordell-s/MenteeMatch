import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    
    return NextResponse.json({
      userExists: !!user,
      passwordValid: isValid,
      userId: user.id,
      role: user.role
    });
  } catch (error) {
    return NextResponse.json({ error: 'Test failed', details: error }, { status: 500 });
  }
}
