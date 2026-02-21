-- AlterEnum
ALTER TYPE "Roblox_Account_Status" ADD VALUE 'DONE';

-- AlterEnum
ALTER TYPE "Roblox_Account_Type" ADD VALUE 'DONE';

-- AlterTable
ALTER TABLE "Roblox_Account" ADD COLUMN     "type" "Roblox_Account_Type" NOT NULL DEFAULT 'DEPOSIT';
