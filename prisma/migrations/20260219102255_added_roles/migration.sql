/*
  Warnings:

  - The `Role` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('NORMAL', 'NEON', 'MEGA');

-- AlterTable
ALTER TABLE "user" DROP COLUMN "Role",
ADD COLUMN     "Role" "Roles" NOT NULL DEFAULT 'NORMAL';
