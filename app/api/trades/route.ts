import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/trades?wallet=xxx — returns trades + computed balances
export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get('wallet');
  if (!wallet) {
    return NextResponse.json({ error: 'wallet param required' }, { status: 400 });
  }

  const trades = await prisma.trade.findMany({
    where: { walletKey: wallet },
    orderBy: { createdAt: 'desc' },
  });

  // Compute balances from trades
  const balances: Record<string, number> = { USDC: 10000 };
  for (const trade of trades) {
    balances[trade.fromToken] = (balances[trade.fromToken] ?? 0) - trade.fromAmount;
    balances[trade.toToken] = (balances[trade.toToken] ?? 0) + trade.toAmount;
  }

  const transactions = trades.map((t: typeof trades[number]) => ({
    id: t.id,
    fromToken: t.fromToken,
    toToken: t.toToken,
    fromAmount: t.fromAmount,
    toAmount: t.toAmount,
    price: t.price,
    timestamp: t.createdAt.getTime(),
  }));

  return NextResponse.json({ balances, transactions });
}

// DELETE /api/trades?wallet=xxx — reset portfolio (delete all trades)
export async function DELETE(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get('wallet');
  if (!wallet) {
    return NextResponse.json({ error: 'wallet param required' }, { status: 400 });
  }

  await prisma.trade.deleteMany({ where: { walletKey: wallet } });
  return NextResponse.json({ ok: true });
}

// POST /api/trades — save a new trade
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { walletKey, fromToken, toToken, fromAmount, toAmount, price } = body;

  if (!walletKey || !fromToken || !toToken || !fromAmount || !toAmount || !price) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const trade = await prisma.trade.create({
    data: { walletKey, fromToken, toToken, fromAmount, toAmount, price },
  });

  return NextResponse.json({
    id: trade.id,
    fromToken: trade.fromToken,
    toToken: trade.toToken,
    fromAmount: trade.fromAmount,
    toAmount: trade.toAmount,
    price: trade.price,
    timestamp: trade.createdAt.getTime(),
  });
}
