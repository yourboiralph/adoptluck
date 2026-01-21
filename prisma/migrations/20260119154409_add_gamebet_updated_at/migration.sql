/*
  Warnings:

  - Added the required column `updatedAt` to the `game_bets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "game_bets" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
