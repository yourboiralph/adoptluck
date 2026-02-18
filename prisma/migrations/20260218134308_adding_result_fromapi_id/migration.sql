/*
  Warnings:

  - You are about to drop the column `client_seed_p1` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `client_seed_p2` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `nonce` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `pf_hmac` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `pf_roll` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `server_seed` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `server_seed_hash` on the `games` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "games" DROP COLUMN "client_seed_p1",
DROP COLUMN "client_seed_p2",
DROP COLUMN "nonce",
DROP COLUMN "pf_hmac",
DROP COLUMN "pf_roll",
DROP COLUMN "server_seed",
DROP COLUMN "server_seed_hash",
ADD COLUMN     "resultIdFromApi" TEXT;
