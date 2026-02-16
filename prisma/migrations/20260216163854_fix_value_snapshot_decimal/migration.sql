/*
  Warnings:

  - You are about to alter the column `value_snapshot` on the `game_bets` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,4)`.

*/
-- AlterTable
ALTER TABLE "game_bets" ALTER COLUMN "value_snapshot" SET DATA TYPE DECIMAL(10,4);
