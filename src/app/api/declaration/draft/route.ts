import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const draft = await db.declaration.findFirst({
      where: {
        userId: session.id,
        status: 'DRAFT'
      },
      orderBy: { updatedAt: 'desc' }
    });

    if (!draft || !draft.draftData) {
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({ data: JSON.parse(draft.draftData) });
  } catch (error) {
    console.error('Failed to fetch draft:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // We need to ensure a period exists for this draft
    const periodData = data.period;
    if (!periodData || !periodData.year) {
      return NextResponse.json({ error: 'Invalid period data' }, { status: 400 });
    }

    const monthValue = periodData.type === 'monthly' ? periodData.month : null;
    const quarterValue = periodData.type === 'quarterly' ? periodData.month : null;

    let period = await db.declarationPeriod.findFirst({
      where: {
        year: periodData.year,
        month: monthValue,
        quarter: quarterValue,
      }
    });

    if (!period) {
      period = await db.declarationPeriod.create({
        data: {
          year: periodData.year,
          month: monthValue,
          quarter: quarterValue,
        }
      });
    }

    // Find if there's an existing draft
    const existingDraft = await db.declaration.findFirst({
      where: {
        userId: session.id,
        status: 'DRAFT',
      }
    });

    const serializedData = JSON.stringify(data);

    if (existingDraft) {
      await db.declaration.update({
        where: { id: existingDraft.id },
        data: {
          periodId: period.id,
          draftData: serializedData,
          totalCollectee: "0",
          totalDeductible: "0",
          netTva: "0"
        }
      });
    } else {
      await db.declaration.create({
        data: {
          userId: session.id,
          periodId: period.id,
          status: 'DRAFT',
          draftData: serializedData,
          totalCollectee: "0",
          totalDeductible: "0",
          netTva: "0"
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save draft:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
