import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const totalUsers = await db.user.count();
    const totalCalculations = await db.calculation.count();
    const activeSubscribers = await db.subscription.count({
      where: { plan: { in: ['PRO', 'ENTERPRISE'] } }
    });

    const dailyAnalytics = await db.platformAnalytics.findMany({
      orderBy: { date: 'asc' },
      take: 30
    });

    const recentCalculations = await db.calculation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { user: { select: { name: true, email: true } } }
    });

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalUsers,
          totalCalculations,
          activeSubscribers,
          revenue: activeSubscribers * 999 // simplified
        },
        dailyAnalytics,
        recentCalculations
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
