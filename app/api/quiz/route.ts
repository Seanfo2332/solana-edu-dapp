import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/quiz?wallet=xxx — returns all quiz scores for a wallet
export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get('wallet');
  if (!wallet) {
    return NextResponse.json({ error: 'wallet param required' }, { status: 400 });
  }

  const scores = await prisma.quizScore.findMany({
    where: { walletKey: wallet },
    orderBy: { createdAt: 'desc' },
  });

  // Return best score per module (topic = moduleId)
  const bestByModule: Record<string, { moduleId: string; score: number; passed: boolean; completedAt: string }> = {};
  for (const s of scores) {
    const existing = bestByModule[s.topic];
    if (!existing || s.score > existing.score) {
      bestByModule[s.topic] = {
        moduleId: s.topic,
        score: s.score,
        passed: s.passed,
        completedAt: s.createdAt.toISOString(),
      };
    }
  }

  return NextResponse.json({ modules: bestByModule });
}

// POST /api/quiz — save a quiz result
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { walletKey, moduleId, score, passed } = body;

  if (!walletKey || !moduleId || score === undefined || passed === undefined) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // Ensure user exists
  await prisma.user.upsert({
    where: { walletKey },
    update: {},
    create: { walletKey },
  });

  // "topic" is the schema field name for moduleId
  const result = await prisma.quizScore.create({
    data: { walletKey, topic: moduleId, score, passed },
  });

  return NextResponse.json({
    id: result.id,
    moduleId: result.topic,
    score: result.score,
    passed: result.passed,
    completedAt: result.createdAt.toISOString(),
  });
}
