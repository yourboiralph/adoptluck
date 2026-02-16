/*
  Warnings:

  - You are about to alter the column `value` on the `pet_types` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,4)`.

*/
-- AlterTable
ALTER TABLE "pet_types" ALTER COLUMN "value" SET DATA TYPE DECIMAL(10,4);
