/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PetVariant" AS ENUM ('NORMAL', 'NEON', 'MEGA');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('AVAILABLE', 'LOCKED');

-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('WAITING', 'LOCKED', 'FLIPPED', 'SETTLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CoinSide" AS ENUM ('HEADS', 'TAILS');

-- CreateTable
CREATE TABLE "pet_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "variant" "PetVariant" NOT NULL DEFAULT 'NORMAL',
    "ride" BOOLEAN NOT NULL DEFAULT false,
    "fly" BOOLEAN NOT NULL DEFAULT false,
    "value" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pet_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_pets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "pet_type_id" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'AVAILABLE',
    "locked_game_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "games" (
    "id" TEXT NOT NULL,
    "player1_id" TEXT NOT NULL,
    "player2_id" TEXT,
    "status" "GameStatus" NOT NULL DEFAULT 'WAITING',
    "player1_side" "CoinSide" NOT NULL,
    "result" "CoinSide",
    "winner_user_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_bets" (
    "id" TEXT NOT NULL,
    "game_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_pet_id" TEXT NOT NULL,
    "value_snapshot" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_bets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pet_types_id_key" ON "pet_types"("id");

-- CreateIndex
CREATE INDEX "user_pets_user_id_idx" ON "user_pets"("user_id");

-- CreateIndex
CREATE INDEX "user_pets_pet_type_id_idx" ON "user_pets"("pet_type_id");

-- CreateIndex
CREATE INDEX "user_pets_locked_game_id_idx" ON "user_pets"("locked_game_id");

-- CreateIndex
CREATE INDEX "games_player1_id_idx" ON "games"("player1_id");

-- CreateIndex
CREATE INDEX "games_player2_id_idx" ON "games"("player2_id");

-- CreateIndex
CREATE INDEX "games_winner_user_id_idx" ON "games"("winner_user_id");

-- CreateIndex
CREATE INDEX "game_bets_game_id_user_id_idx" ON "game_bets"("game_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "game_bets_game_id_user_pet_id_key" ON "game_bets"("game_id", "user_pet_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- AddForeignKey
ALTER TABLE "user_pets" ADD CONSTRAINT "user_pets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_pets" ADD CONSTRAINT "user_pets_pet_type_id_fkey" FOREIGN KEY ("pet_type_id") REFERENCES "pet_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_player1_id_fkey" FOREIGN KEY ("player1_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_player2_id_fkey" FOREIGN KEY ("player2_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_winner_user_id_fkey" FOREIGN KEY ("winner_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_bets" ADD CONSTRAINT "game_bets_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_bets" ADD CONSTRAINT "game_bets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_bets" ADD CONSTRAINT "game_bets_user_pet_id_fkey" FOREIGN KEY ("user_pet_id") REFERENCES "user_pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
