-- CreateEnum
CREATE TYPE "Roblox_Account_Status" AS ENUM ('NEW', 'DEAD', 'ALIVE', 'CHECKING');

-- AlterTable
ALTER TABLE "Roblox_Account" ADD COLUMN     "status" "Roblox_Account_Status" NOT NULL DEFAULT 'NEW';
