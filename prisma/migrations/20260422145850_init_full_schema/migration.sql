-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "walletKey" TEXT NOT NULL,
    "username" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL,
    "walletKey" TEXT NOT NULL,
    "fromToken" TEXT NOT NULL,
    "toToken" TEXT NOT NULL,
    "fromAmount" DOUBLE PRECISION NOT NULL,
    "toAmount" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizScore" (
    "id" TEXT NOT NULL,
    "walletKey" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Leaderboard" (
    "id" TEXT NOT NULL,
    "walletKey" TEXT NOT NULL,
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Leaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_walletKey_key" ON "User"("walletKey");

-- CreateIndex
CREATE INDEX "Trade_walletKey_idx" ON "Trade"("walletKey");

-- CreateIndex
CREATE INDEX "QuizScore_walletKey_idx" ON "QuizScore"("walletKey");

-- CreateIndex
CREATE UNIQUE INDEX "Leaderboard_walletKey_key" ON "Leaderboard"("walletKey");

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_walletKey_fkey" FOREIGN KEY ("walletKey") REFERENCES "User"("walletKey") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizScore" ADD CONSTRAINT "QuizScore_walletKey_fkey" FOREIGN KEY ("walletKey") REFERENCES "User"("walletKey") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leaderboard" ADD CONSTRAINT "Leaderboard_walletKey_fkey" FOREIGN KEY ("walletKey") REFERENCES "User"("walletKey") ON DELETE RESTRICT ON UPDATE CASCADE;
