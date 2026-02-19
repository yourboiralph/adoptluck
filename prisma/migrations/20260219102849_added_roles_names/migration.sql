/*
  Warnings:

  - The values [NORMAL,NEON,MEGA] on the enum `Roles` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Roles_new" AS ENUM ('Fish', 'Dolphin', 'Shark', 'Whale', 'Admin', 'Owner');
ALTER TABLE "public"."user" ALTER COLUMN "Role" DROP DEFAULT;
ALTER TABLE "user" ALTER COLUMN "Role" TYPE "Roles_new" USING ("Role"::text::"Roles_new");
ALTER TYPE "Roles" RENAME TO "Roles_old";
ALTER TYPE "Roles_new" RENAME TO "Roles";
DROP TYPE "public"."Roles_old";
ALTER TABLE "user" ALTER COLUMN "Role" SET DEFAULT 'Fish';
COMMIT;

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "Role" SET DEFAULT 'Fish';
