-- AlterTable
ALTER TABLE "games" ADD COLUMN     "client_seed_p1" TEXT,
ADD COLUMN     "client_seed_p2" TEXT,
ADD COLUMN     "nonce" INTEGER,
ADD COLUMN     "pf_hmac" TEXT,
ADD COLUMN     "pf_roll" DECIMAL(65,30),
ADD COLUMN     "server_seed" TEXT,
ADD COLUMN     "server_seed_hash" TEXT;
