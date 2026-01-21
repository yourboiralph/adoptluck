/*
  Warnings:

  - The values [LOCKED,FLIPPED] on the enum `GameStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `createdAt` on the `pet_types` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `pet_types` table. All the data in the column will be lost.
  - The `status` column on the `user_pets` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[name,variant,ride,fly]` on the table `pet_types` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PetStatus" AS ENUM ('AVAILABLE', 'LOCKED');

-- AlterEnum
BEGIN;
CREATE TYPE "GameStatus_new" AS ENUM ('WAITING', 'SETTLED', 'CANCELLED');
ALTER TABLE "public"."games" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "games" ALTER COLUMN "status" TYPE "GameStatus_new" USING ("status"::text::"GameStatus_new");
ALTER TYPE "GameStatus" RENAME TO "GameStatus_old";
ALTER TYPE "GameStatus_new" RENAME TO "GameStatus";
DROP TYPE "public"."GameStatus_old";
ALTER TABLE "games" ALTER COLUMN "status" SET DEFAULT 'WAITING';
COMMIT;

-- DropForeignKey
ALTER TABLE "user_pets" DROP CONSTRAINT "user_pets_pet_type_id_fkey";

-- DropIndex
DROP INDEX "games_winner_user_id_idx";

-- DropIndex
DROP INDEX "pet_types_id_key";

-- DropIndex
DROP INDEX "user_pets_pet_type_id_idx";

-- AlterTable
ALTER TABLE "pet_types" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "user_pets" DROP COLUMN "status",
ADD COLUMN     "status" "PetStatus" NOT NULL DEFAULT 'AVAILABLE';

-- DropEnum
DROP TYPE "Status";

-- CreateIndex
CREATE INDEX "games_status_idx" ON "games"("status");

-- CreateIndex
CREATE UNIQUE INDEX "pet_types_name_variant_ride_fly_key" ON "pet_types"("name", "variant", "ride", "fly");

-- CreateIndex
CREATE INDEX "user_pets_status_idx" ON "user_pets"("status");

-- AddForeignKey
ALTER TABLE "user_pets" ADD CONSTRAINT "user_pets_pet_type_id_fkey" FOREIGN KEY ("pet_type_id") REFERENCES "pet_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
