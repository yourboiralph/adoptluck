/*
  Warnings:

  - The values [NEW] on the enum `Roblox_Account_Status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Roblox_Account_Status_new" AS ENUM ('REQUEST', 'DEAD', 'ALIVE', 'CHECKING');
ALTER TABLE "public"."Roblox_Account" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Roblox_Account" ALTER COLUMN "status" TYPE "Roblox_Account_Status_new" USING ("status"::text::"Roblox_Account_Status_new");
ALTER TYPE "Roblox_Account_Status" RENAME TO "Roblox_Account_Status_old";
ALTER TYPE "Roblox_Account_Status_new" RENAME TO "Roblox_Account_Status";
DROP TYPE "public"."Roblox_Account_Status_old";
ALTER TABLE "Roblox_Account" ALTER COLUMN "status" SET DEFAULT 'REQUEST';
COMMIT;

-- AlterTable
ALTER TABLE "Roblox_Account" ALTER COLUMN "status" SET DEFAULT 'REQUEST';
