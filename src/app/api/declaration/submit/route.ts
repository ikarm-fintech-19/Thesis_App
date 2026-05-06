import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, result } = await request.json();

    const periodData = data.period;
    if (!periodData || !periodData.year) {
      return NextResponse.json({ error: 'Invalid period data' }, { status: 400 });
    }

    const monthValue = periodData.type === 'monthly' ? periodData.month : null;
    const quarterValue = periodData.type === 'quarterly' ? periodData.month : null;

    let period = await db.declarationPeriod.findFirst({
      where: { year: periodData.year, month: monthValue, quarter: quarterValue }
    });

    if (!period) {
      period = await db.declarationPeriod.create({
        data: { year: periodData.year, month: monthValue, quarter: quarterValue }
      });
    }

    const existingDraft = await db.declaration.findFirst({
      where: { userId: session.id, status: 'DRAFT' }
    });

    const totalCollectee = result?.collectee ? String(result.collectee) : "0";
    const totalDeductible = result?.deductible ? String(result.deductible) : "0";
    const netTva = result?.net ? String(result.net) : "0";

    if (existingDraft) {
      await db.declaration.update({
        where: { id: existingDraft.id },
        data: {
          periodId: period.id,
          status: 'SUBMITTED',
          draftData: null,
          totalCollectee,
          totalDeductible,
          netTva
        }
      });
      
      await db.auditLog.create({
        data: {
          userId: session.id,
          action: 'SUBMIT',
          resource: 'Declaration',
          metadata: JSON.stringify({ 
            period: `${periodData.type === 'monthly' ? 'M'+periodData.month : 'Q'+periodData.month}/${periodData.year}`,
            netTva 
          })
        }
      });
    } else {
      await db.declaration.create({
        data: {
          userId: session.id,
          periodId: period.id,
          status: 'SUBMITTED',
          draftData: null,
          totalCollectee,
          totalDeductible,
          netTva
        }
      });

      await db.auditLog.create({
        data: {
          userId: session.id,
          action: 'SUBMIT',
          resource: 'Declaration',
          metadata: JSON.stringify({ 
            period: `${periodData.type === 'monthly' ? 'M'+periodData.month : 'Q'+periodData.month}/${periodData.year}`,
            netTva 
          })
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to submit declaration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
